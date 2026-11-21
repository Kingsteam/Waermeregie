"""Aktion für Sprachassistenten: Rückmeldung zu kalt / passt / zu warm.

Home Assistant bietet angemeldete Aktionen (Intents) den KI-Sprachassistenten als Werkzeug
an. Der Raum kommt aus dem Satz oder, wenn keiner genannt wird, aus dem Bereich des
Geräts, in das gesprochen wurde. Passt kein Raum, zählt es fürs ganze Haus.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import (
    area_registry as ar,
    config_validation as cv,
    device_registry as dr,
    intent,
)
import voluptuous as vol

from . import feedback, model
from .const import DOMAIN

INTENT_FEEDBACK = "WaermeregieFeedback"

ANSWERS = {
    ("cold", False): "Gemerkt. Ich mache es jetzt wärmer.",
    ("ok", False): "Gemerkt, danke.",
    ("warm", False): "Gemerkt. Alle Ziele sind für eine Stunde ein Grad niedriger.",
    ("cold", True): "Gemerkt. Das Ziel im Raum {room} ist für eine Stunde ein Grad höher.",
    ("ok", True): "Gemerkt, im Raum {room} passt es.",
    ("warm", True): "Gemerkt. Das Ziel im Raum {room} ist für eine Stunde ein Grad niedriger.",
}


def match_room(rooms: list[dict], text: str | None) -> str | None:
    """Raum-ID zu einem gesprochenen Namen oder Bereichsnamen (großzügig), sonst None."""
    wanted = (text or "").strip().casefold()
    if not wanted:
        return None
    for room in rooms:
        if wanted in (room["id"].casefold(), room["name"].strip().casefold()):
            return room["id"]
    # "Küche" trifft "Wohnzimmer + Küche", "Badezimmer" trifft "Bad"
    hits = [
        room["id"]
        for room in rooms
        if wanted in room["name"].casefold()
        or room["name"].strip().casefold() in wanted
        or any(part and part in wanted for part in _parts(room["name"]))
    ]
    return hits[0] if len(hits) == 1 else None


def _parts(name: str) -> list[str]:
    return [p.strip().casefold() for p in name.replace("+", ",").replace("/", ",").split(",")]


def _device_area(hass: HomeAssistant, device_id: str | None) -> str | None:
    """Name des Bereichs, in dem das Sprachgerät steht."""
    if not device_id:
        return None
    device = dr.async_get(hass).async_get(device_id)
    if device is None or not device.area_id:
        return None
    area = ar.async_get(hass).async_get_area(device.area_id)
    return area.name if area else None


class FeedbackIntent(intent.IntentHandler):
    """Rückmeldung zur Temperatur geben."""

    intent_type = INTENT_FEEDBACK
    description = (
        "Report how the temperature feels to the heating control (Waermeregie). "
        "Use when someone says they are cold, too warm, or that the temperature is fine. "
        "kind: cold = too cold, ok = fine, warm = too warm. "
        "room: the room meant, if one was named; omit it to use the room of the voice device."
    )

    @property
    def slot_schema(self) -> dict[Any, Any]:
        return {
            vol.Required("kind"): vol.In(feedback.KINDS),
            vol.Optional("room"): cv.string,
        }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        slots = self.async_validate_slots(intent_obj.slots)
        kind = slots["kind"]["value"]
        manager = hass.data.get(DOMAIN)
        if manager is None:
            raise intent.IntentHandleError("Die Wärmeregie ist nicht eingerichtet.")
        rooms = manager.config["rooms"]
        spoken = (slots.get("room") or {}).get("value")
        room = match_room(rooms, spoken) or match_room(
            rooms, _device_area(hass, intent_obj.device_id)
        )
        try:
            await manager.async_feedback(kind, room, source="Sprachassistent")
        except model.ConfigError as err:
            raise intent.IntentHandleError(str(err)) from err
        name = next((r["name"] for r in rooms if r["id"] == room), "")
        response = intent_obj.create_response()
        response.async_set_speech(ANSWERS[kind, room is not None].format(room=name))
        return response


def async_setup_intents(hass: HomeAssistant) -> None:
    intent.async_register(hass, FeedbackIntent())
