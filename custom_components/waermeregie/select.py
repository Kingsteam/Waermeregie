"""Auswahl der Szene. „Automatisch“ = nach Zeitplan."""

from __future__ import annotations

from homeassistant.components.select import SelectEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WaermeregieConfigEntry
from .entity import WaermeregieEntity

AUTO = "Automatisch"


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WaermeregieConfigEntry,
    add: AddConfigEntryEntitiesCallback,
) -> None:
    add([SceneSelect(entry.runtime_data, entry.entry_id, "scene_select")])


class SceneSelect(WaermeregieEntity, SelectEntity):
    """Szene von Hand wählen; gilt bis zum nächsten Zeitplan-Wechsel."""

    @property
    def options(self) -> list[str]:
        return [AUTO] + [s["name"] for s in self._mgr.config["scenes"]]

    @property
    def current_option(self) -> str | None:
        scene = self._mgr.status.get("scene", {})
        if scene.get("source") != "override":
            return AUTO
        return scene.get("name")

    async def async_select_option(self, option: str) -> None:
        if option == AUTO:
            await self._mgr.async_set_override(None)
            return
        scene = next(s for s in self._mgr.config["scenes"] if s["name"] == option)
        await self._mgr.async_set_override(scene["id"])
