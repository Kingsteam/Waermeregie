"""Gemeinsame Test-Hilfen."""

from __future__ import annotations

import copy
from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from custom_components.waermeregie import model

TZ = ZoneInfo("Europe/Berlin")


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    """Eigene Integrationen in allen Tests erlauben."""
    return


def at(day: int, hhmm: str) -> datetime:
    """Zeitpunkt im November 2026 (16. = Montag)."""
    h, m = (int(x) for x in hhmm.split(":"))
    return datetime(2026, 11, day, h, m, tzinfo=TZ)


def sample_config(**overrides) -> dict:
    """Erfundenes Beispielhaus (keine echten Daten)."""
    cfg = model.default_config()
    cfg["stove"]["climate"] = "climate.pelletofen"
    cfg["rooms"] = [
        {
            "id": "wohnzimmer",
            "name": "Wohnzimmer",
            "importance": 3,
            "radiators": ["climate.heizung_wohnzimmer"],
            "temperature_sensors": [{"entity": "sensor.temp_wohnzimmer", "weight": 1.0}],
            "openings": ["binary_sensor.terrassentuer"],
            "presence": ["binary_sensor.belegung_wohnzimmer"],
            "targets": {"komfort": 21.0},
        },
        {
            "id": "schlafzimmer",
            "name": "Schlafzimmer",
            "importance": 1,
            "radiators": ["climate.heizung_schlafzimmer"],
            "temperature_sensors": [{"entity": "sensor.temp_schlafzimmer", "weight": 1.0}],
            "openings": [],
            "presence": [],
            "targets": {"komfort": 19.0, "nacht": 17.0},
        },
    ]
    cfg = copy.deepcopy(cfg)
    for k, v in overrides.items():
        cfg[k] = v
    return model.validate(cfg)
