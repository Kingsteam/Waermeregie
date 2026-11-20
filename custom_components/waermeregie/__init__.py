"""Wärmeregie: Heizungssteuerung für Pelletöfen ohne Pufferspeicher.

Koordiniert Ofen, Heizkörperthermostate, Öffnungs-, Temperatur- und
Anwesenheitssensoren. Ab Werk im Schattenbetrieb: rechnet, schaltet nichts.
"""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError, ServiceValidationError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType
import voluptuous as vol

from . import model, panel, websocket
from .const import DOMAIN
from .manager import WaermeregieManager

PLATFORMS = [
    Platform.BINARY_SENSOR,
    Platform.BUTTON,
    Platform.SELECT,
    Platform.SENSOR,
    Platform.SWITCH,
]
CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)
CONF_STOVE = "stove"

type WaermeregieConfigEntry = ConfigEntry[WaermeregieManager]


def _manager(hass: HomeAssistant) -> WaermeregieManager:
    if (mgr := hass.data.get(DOMAIN)) is None:
        raise ServiceValidationError(translation_domain=DOMAIN, translation_key="not_loaded")
    return mgr


async def _guard(coro) -> None:
    try:
        await coro
    except model.ConfigError as err:
        raise HomeAssistantError(str(err)) from err


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Dienste und WebSocket-Befehle einmalig anmelden."""
    websocket.async_register(hass)

    async def set_scene(call: ServiceCall) -> None:
        await _guard(
            _manager(hass).async_set_override(call.data["scene"], call.data.get("minutes"))
        )

    async def clear_scene(call: ServiceCall) -> None:
        await _guard(_manager(hass).async_set_override(None))

    async def pause_stove(call: ServiceCall) -> None:
        await _guard(_manager(hass).async_pause(call.data["minutes"]))

    async def boost(call: ServiceCall) -> None:
        await _guard(_manager(hass).async_boost(call.data["delta"], call.data["minutes"]))

    async def warmup(call: ServiceCall) -> None:
        arrive = call.data.get("arrive")
        if arrive is not None and not isinstance(arrive, str):
            arrive = arrive.strftime("%H:%M")
        elif arrive:
            arrive = arrive[:5]
        await _guard(
            _manager(hass).async_warmup(
                call.data.get("minutes"), arrive, source="Dienst waermeregie.warmup"
            )
        )

    async def cold(call: ServiceCall) -> None:
        await _guard(
            _manager(hass).async_warmup(
                call.data.get("minutes"), source="Dienst waermeregie.cold", cold=True
            )
        )

    async def cancel_warmup(call: ServiceCall) -> None:
        await _guard(
            _manager(hass).async_warmup(cancel=True, source="Dienst waermeregie.cancel_warmup")
        )

    hass.services.async_register(
        DOMAIN,
        "warmup",
        warmup,
        vol.Schema(
            {
                vol.Optional("minutes"): vol.Coerce(float),
                vol.Optional("arrive"): vol.Any(cv.time, cv.string),
            }
        ),
    )
    hass.services.async_register(DOMAIN, "cancel_warmup", cancel_warmup)
    hass.services.async_register(
        DOMAIN, "cold", cold, vol.Schema({vol.Optional("minutes"): vol.Coerce(float)})
    )
    hass.services.async_register(
        DOMAIN,
        "set_scene",
        set_scene,
        vol.Schema(
            {
                vol.Required("scene"): cv.string,
                vol.Optional("minutes"): vol.Coerce(float),
            }
        ),
    )
    hass.services.async_register(DOMAIN, "clear_scene", clear_scene)
    hass.services.async_register(
        DOMAIN,
        "pause_stove",
        pause_stove,
        vol.Schema({vol.Required("minutes"): vol.Coerce(float)}),
    )
    hass.services.async_register(
        DOMAIN,
        "boost",
        boost,
        vol.Schema(
            {
                vol.Required("delta"): vol.Coerce(float),
                vol.Required("minutes"): vol.Coerce(float),
            }
        ),
    )

    async def pellets_refill(call: ServiceCall) -> None:
        await _guard(_manager(hass).async_pellets_refill(call.data.get("kg")))

    async def pellets_set(call: ServiceCall) -> None:
        await _guard(
            _manager(hass).async_pellets_set(call.data["kg"], call.data.get("from_empty", False))
        )

    async def pellets_empty(call: ServiceCall) -> None:
        await _guard(_manager(hass).async_pellets_empty())

    hass.services.async_register(
        DOMAIN,
        "pellets_refill",
        pellets_refill,
        vol.Schema({vol.Optional("kg"): vol.Coerce(float)}),
    )
    hass.services.async_register(
        DOMAIN,
        "pellets_set",
        pellets_set,
        vol.Schema({vol.Required("kg"): vol.Coerce(float), vol.Optional("from_empty"): cv.boolean}),
    )
    hass.services.async_register(DOMAIN, "pellets_empty", pellets_empty)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: WaermeregieConfigEntry) -> bool:
    """Eintrag einrichten."""
    mgr = WaermeregieManager(hass)
    await mgr.async_load(initial_stove=entry.data.get(CONF_STOVE))
    entry.runtime_data = mgr
    hass.data[DOMAIN] = mgr
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    await panel.async_register(hass)
    await mgr.async_start()
    return True


async def async_unload_entry(hass: HomeAssistant, entry: WaermeregieConfigEntry) -> bool:
    """Eintrag entladen."""
    ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if ok:
        await entry.runtime_data.async_stop()
        hass.data.pop(DOMAIN, None)
        panel.async_unregister(hass)
    return ok
