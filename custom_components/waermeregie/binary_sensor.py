"""Binärsensoren: Heizblock läuft, Öffnung offen."""

from __future__ import annotations

from typing import Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
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
            HeatingBlock(mgr, entry.entry_id, "heating_block"),
            OpeningAlert(mgr, entry.entry_id, "opening_alert"),
            PelletLow(mgr, entry.entry_id, "pellet_low"),
        ]
    )


class HeatingBlock(WaermeregieEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.HEAT

    @property
    def is_on(self) -> bool:
        return self._mgr.status.get("stove", {}).get("phase") == "block"


class OpeningAlert(WaermeregieEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.OPENING

    @property
    def is_on(self) -> bool:
        return bool(self._mgr.status.get("alerts"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        return {"messages": [a["message"] for a in self._mgr.status.get("alerts", [])]}


class PelletLow(WaermeregieEntity, BinarySensorEntity):
    """An, wenn der geschätzte Vorrat an oder unter der Erinnerungsschwelle ist."""

    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    @property
    def is_on(self) -> bool | None:
        stock = self._mgr.status.get("pellets", {}).get("stock_kg")
        if stock is None:
            return None
        return stock <= float(self._mgr.config["parameters"]["pellet_reminder_kg"])
