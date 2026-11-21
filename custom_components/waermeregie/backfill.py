"""Ältere Verlaufspunkte aus dem Verlauf von Home Assistant ergänzen (reine Funktionen).

Bis 0.10.0 enthielt ein Verlaufspunkt nur das Mittel der Räume. Die Werte je Raum und
das Kesselwasser stehen aber im Rekorder von Home Assistant. `fill` trägt sie in Punkte
nach, denen sie fehlen. Ein Messwert gilt höchstens MAX_AGE_MIN lang weiter.
"""

from __future__ import annotations

from bisect import bisect_right
from datetime import datetime, timedelta
from typing import Any

MAX_AGE_MIN: int = 90
WATER_VALID_MAX_C: float = 100.0  # darüber meldet der Fühler seinen Anschlag

Series = dict[str, list[tuple[datetime, float]]]


def needs_fill(points: list[dict[str, Any]]) -> bool:
    return any("rooms" not in p for p in points)


def _at(series: list[tuple[datetime, float]] | None, when: datetime) -> float | None:
    """Letzter Messwert bis `when`, wenn er nicht zu alt ist."""
    if not series:
        return None
    i = bisect_right(series, when, key=lambda item: item[0])
    if i == 0:
        return None
    stamp, value = series[i - 1]
    return value if when - stamp <= timedelta(minutes=MAX_AGE_MIN) else None


def fill(
    points: list[dict[str, Any]],
    series: Series,
    rooms: list[dict[str, Any]],
    water_entity: str | None,
    step_min: int,
) -> int:
    """Punkte ohne `rooms` ergänzen. Gibt zurück, wie viele Punkte Werte bekamen."""
    filled = 0
    for point in points:
        if "rooms" in point:
            continue
        # der Punkt steht für die zehn Minuten ab seinem Zeitstempel
        when = datetime.fromisoformat(point["t"]) + timedelta(minutes=step_min)
        temps: dict[str, float | None] = {}
        for room in rooms:
            total = weight = 0.0
            for sensor in room["temperature_sensors"]:
                value = _at(series.get(sensor["entity"]), when)
                if value is None:
                    continue
                total += (value + (sensor.get("offset") or 0.0)) * sensor["weight"]
                weight += sensor["weight"]
            temps[room["id"]] = round(total / weight, 1) if weight else None
        water = _at(series.get(water_entity or ""), when)
        if water is not None and water > WATER_VALID_MAX_C:
            water = None
        point["rooms"] = temps  # auch leer: der Punkt gilt damit als erledigt
        point["water_c"] = None if water is None else round(water, 1)
        if water is not None or any(v is not None for v in temps.values()):
            filled += 1
    return filled
