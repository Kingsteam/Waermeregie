"""Sensoren: Phase, Szene, Tagesart, Starts heute, Wärmebedarf."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import (
    SensorDeviceClass,
    SensorEntity,
    SensorStateClass,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

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
