"""Knöpfe: Pellets nachgefüllt, Behälter war leer."""

from __future__ import annotations

from homeassistant.components.button import ButtonEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import WaermeregieConfigEntry
from .entity import WaermeregieEntity


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WaermeregieConfigEntry,
    add: AddConfigEntryEntitiesCallback,
) -> None:
    mgr = entry.runtime_data
    add(
        [
            PelletRefill(mgr, entry.entry_id, "pellet_refill"),
            PelletEmpty(mgr, entry.entry_id, "pellet_empty"),
        ]
    )


class PelletRefill(WaermeregieEntity, ButtonEntity):
    """Ein Sack (Gewicht laut Einstellung) wurde nachgefüllt."""

    async def async_press(self) -> None:
        await self._mgr.async_pellets_refill()


class PelletEmpty(WaermeregieEntity, ButtonEntity):
    """Der Behälter ist leer: daraus lernt die Wärmeregie den Verbrauch."""

    async def async_press(self) -> None:
        await self._mgr.async_pellets_empty()
