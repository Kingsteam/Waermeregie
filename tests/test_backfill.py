"""Verlauf je Raum und Kessel aus dem HA-Verlauf nachtragen."""

from datetime import timedelta

from custom_components.waermeregie import backfill

from .conftest import at

ROOMS = [
    {
        "id": "wohnzimmer",
        "temperature_sensors": [
            {"entity": "sensor.a", "weight": 1.0, "offset": 0.0},
            {"entity": "sensor.b", "weight": 3.0, "offset": -1.0},
        ],
    },
    {"id": "bad", "temperature_sensors": [{"entity": "sensor.c", "weight": 1.0}]},
]


def _points(start, n):
    return [
        {"t": (start + timedelta(minutes=10 * i)).isoformat(), "house_c": 21.0} for i in range(n)
    ]


def test_fill_rooms_weighted_with_offset_and_water():
    start = at(20, "08:00")
    series = {
        "sensor.a": [(start - timedelta(minutes=5), 20.0), (start + timedelta(minutes=15), 22.0)],
        "sensor.b": [(start - timedelta(minutes=5), 22.0)],
        "sensor.w": [(start + timedelta(minutes=5), 61.5), (start + timedelta(minutes=25), 126.0)],
    }
    points = _points(start, 3)
    assert backfill.needs_fill(points)
    assert backfill.fill(points, series, ROOMS, "sensor.w", 10) == 3
    # (20 + 3 * (22 - 1)) / 4
    assert points[0]["rooms"] == {"wohnzimmer": 20.8, "bad": None}
    assert points[0]["water_c"] == 61.5
    assert points[1]["rooms"]["wohnzimmer"] == 21.2  # (22 + 3 * 21) / 4 = 21,25
    assert points[2]["water_c"] is None  # Fühler am Anschlag ist kein Messwert
    assert not backfill.needs_fill(points)


def test_fill_skips_new_points_and_drops_stale_values():
    start = at(20, "08:00")
    series = {"sensor.c": [(start - timedelta(hours=3), 23.0)]}
    points = _points(start, 2)
    points[1]["rooms"] = {"bad": 24.0}
    points[1]["water_c"] = 50.0
    assert backfill.fill(points, series, ROOMS, None, 10) == 0
    assert points[0]["rooms"] == {"wohnzimmer": None, "bad": None}  # 3 h alt: zu alt
    assert points[1]["rooms"] == {"bad": 24.0}  # schon vorhanden: unverändert
