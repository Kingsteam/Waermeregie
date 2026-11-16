"""Schalter „Steuerung aktiv“: aus = Schattenbetrieb (nur rechnen)."""

from __future__ import annotations

from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WaermeregieConfigEntry, model
from .const import MODE_ACTIVE, MODE_SHADOW
from .entity import WaermeregieEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WaermeregieConfigEntry,
    add: AddConfigEntryEntitiesCallback,
) -> None:
    add([ActiveSwitch(entry.runtime_data, entry.entry_id, "active")])


class ActiveSwitch(WaermeregieEntity, SwitchEntity):
    _attr_entity_category = EntityCategory.CONFIG

    @property
    def is_on(self) -> bool:
        return self._mgr.config["mode"] == MODE_ACTIVE

    async def _set(self, mode: str) -> None:
        try:
            await self._mgr.async_set_mode(mode)
        except model.ConfigError as err:
            raise HomeAssistantError(str(err)) from err

    async def async_turn_on(self, **kwargs: Any) -> None:
        await self._set(MODE_ACTIVE)

    async def async_turn_off(self, **kwargs: Any) -> None:
        await self._set(MODE_SHADOW)
