"""Sensoren: Phase, Szene, Tagesart, Starts heute, Wärmebedarf."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.const import EntityCategory, UnitOfMass
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback
from homeassistant.util import dt as dt_util

from . import WaermeregieConfigEntry
from .entity import WaermeregieEntity

PHASES = ["idle", "block", "pause", "blocked"]


async def async_setup_entry(
    hass: HomeAssistant,
    entry: WaermeregieConfigEntry,
    add: AddConfigEntryEntitiesCallback,
) -> None:
    mgr = entry.runtime_data
    add(
        [
            PhaseSensor(mgr, entry.entry_id, "phase"),
            SceneSensor(mgr, entry.entry_id, "scene"),
            DayTypeSensor(mgr, entry.entry_id, "day_type"),
            StartsSensor(mgr, entry.entry_id, "starts_today"),
            DeficitSensor(mgr, entry.entry_id, "house_deficit"),
            PelletStock(mgr, entry.entry_id, "pellet_stock"),
            PelletEmptyAt(mgr, entry.entry_id, "pellet_empty_at"),
            PelletRate(mgr, entry.entry_id, "pellet_rate"),
        ]
    )


class PhaseSensor(WaermeregieEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.ENUM
    _attr_options = PHASES

    @property
    def native_value(self) -> str | None:
        return self._mgr.status.get("stove", {}).get("phase")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        stove = self._mgr.status.get("stove", {})
        return {
            "reason": stove.get("reason"),
            "action": stove.get("action"),
            "mode": self._mgr.status.get("mode"),
            "block_start": stove.get("block_start"),
            "pause_until": stove.get("pause_until"),
        }


class SceneSensor(WaermeregieEntity, SensorEntity):
    @property
    def native_value(self) -> str | None:
        return self._mgr.status.get("scene", {}).get("name")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        scene = self._mgr.status.get("scene", {})
        return {k: scene.get(k) for k in ("id", "source", "until", "next_change")}


class DayTypeSensor(WaermeregieEntity, SensorEntity):
    @property
    def native_value(self) -> str | None:
        return self._mgr.status.get("day_type", {}).get("name")


class StartsSensor(WaermeregieEntity, SensorEntity):
    _attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self) -> int | None:
        return self._mgr.status.get("stove", {}).get("starts_today")


class DeficitSensor(WaermeregieEntity, SensorEntity):
    _attr_native_unit_of_measurement = "K"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1

    @property
    def native_value(self) -> float | None:
        return self._mgr.status.get("house", {}).get("deficit_k")


def _pellets(mgr) -> dict[str, Any]:
    return mgr.status.get("pellets", {})


class PelletStock(WaermeregieEntity, SensorEntity):
    """Geschätzter Pelletvorrat im Behälter."""

    _attr_device_class = SensorDeviceClass.WEIGHT
    _attr_native_unit_of_measurement = UnitOfMass.KILOGRAMS
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_suggested_display_precision = 1

    @property
    def native_value(self) -> float | None:
        return _pellets(self._mgr).get("stock_kg")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        p = _pellets(self._mgr)
        return {
            "hours_left": p.get("hours_left"),
            "burn_hours_since_refill": p.get("burn_h_since_refill"),
            "daily_burn_hours": p.get("daily_burn_h"),
            "last_refill": p.get("last_refill"),
        }


class PelletEmptyAt(WaermeregieEntity, SensorEntity):
    """Voraussichtlich leer (Zeitpunkt)."""

    _attr_device_class = SensorDeviceClass.TIMESTAMP

    @property
    def native_value(self):
        value = _pellets(self._mgr).get("empty_at")
        return dt_util.parse_datetime(value) if value else None


class PelletRate(WaermeregieEntity, SensorEntity):
    """Verbrauch je Brennstunde: Startwert, bis er gelernt ist."""

    _attr_native_unit_of_measurement = "kg/h"
    _attr_state_class = SensorStateClass.MEASUREMENT
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_suggested_display_precision = 2

    @property
    def native_value(self) -> float | None:
        return _pellets(self._mgr).get("rate_kg_h")

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        p = _pellets(self._mgr)
        return {"learned": p.get("rate_learned"), "times_learned": p.get("learned")}
