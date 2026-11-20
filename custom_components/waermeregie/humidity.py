"""Lüften wegen Luftfeuchte erkennen (z. B. nach dem Duschen).

Reine Funktionen ohne Home Assistant. Je Raum ein kleiner Eintrag im Speicher:

  samples   Messwerte der letzten HUMIDITY_BASELINE_MIN Minuten [[iso, %], ...]
  vent      laufendes Feucht-Lüften {"start": iso, "baseline": %} oder None
  first     Beginn des ersten Feucht-Lüftens in dieser Öffnung (für die Höchstdauer)
  dry_since seit wann die Feuchte in dieser Öffnung wieder unten ist (iso)
  expired   Höchstdauer in dieser Öffnung erreicht: ab jetzt normal melden

Warum: Ein Fenster, das nach dem Duschen offen steht, ist gewolltes Lüften.
Die Heizlogik bleibt dabei gleich (Heizkörper zu), nur die Meldung
„Fenster offen“ wartet, bis die Feuchte wieder unten ist.

Feucht ist der Raum, wenn die Feuchte über einer absoluten Schwelle liegt
ODER um mindestens `rise` Prozentpunkte über dem Grundwert (Tiefstwert der
letzten 90 Minuten). Fühler in Heizkörperthermostaten sitzen oft weit weg von
der Dusche und steigen nur um wenige Punkte, deshalb der Vergleich mit dem
Grundwert.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from .const import HUMIDITY_BASELINE_MIN, HUMIDITY_HYSTERESIS

SAMPLE_STEP = timedelta(seconds=60)


def empty() -> dict[str, Any]:
    return {"samples": [], "vent": None, "first": None, "dry_since": None, "expired": False}


def _dt(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def baseline(entry: dict, now: datetime) -> float | None:
    """Tiefstwert der letzten HUMIDITY_BASELINE_MIN Minuten (ohne den aktuellen Wert)."""
    cutoff = now - timedelta(minutes=HUMIDITY_BASELINE_MIN)
    values = [v for t, v in entry["samples"] if cutoff <= datetime.fromisoformat(t) < now]
    return min(values) if values else None


def is_humid(value: float | None, base: float | None, absolute: float, rise: float) -> bool:
    if value is None:
        return False
    if absolute > 0 and value >= absolute:
        return True
    return rise > 0 and base is not None and value - base >= rise


def update(
    entry: dict | None,
    now: datetime,
    value: float | None,
    is_open: bool,
    absolute: float,
    rise: float,
    max_min: float,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Neuen Messwert eintragen. Liefert (Eintrag, Info für die Regel).

    Info: humidity, baseline, ventilating (Meldung zurückhalten), alert_from
    (ab hier zählt die normale Verzögerung der Fenster-Meldung, sonst None).
    """
    e = {**empty(), **(entry or {})}
    e["samples"] = [list(s) for s in e["samples"]]
    base = baseline(e, now)
    if value is not None:
        last = _dt(e["samples"][-1][0]) if e["samples"] else None
        if last is None or now - last >= SAMPLE_STEP:
            e["samples"].append([now.isoformat(), value])
    cutoff = now - timedelta(minutes=HUMIDITY_BASELINE_MIN)
    e["samples"] = [s for s in e["samples"] if datetime.fromisoformat(s[0]) >= cutoff]

    if not is_open:
        e.update(vent=None, first=None, dry_since=None, expired=False)
        return e, _info(e, value, base)

    vent = e["vent"]
    if vent is None and not e["expired"] and is_humid(value, base, absolute, rise):
        vent = {"start": now.isoformat(), "baseline": base}
        e["first"] = e["first"] or now.isoformat()
        e["dry_since"] = None
    elif vent is not None:
        first = _dt(e["first"]) or _dt(vent["start"])
        vent_base = vent.get("baseline")
        if first is not None and now - first >= timedelta(minutes=max_min):
            # Höchstdauer: doch melden, gezählt ab dem Öffnen
            vent = None
            e["expired"] = True
            e["dry_since"] = None
        elif value is not None and (
            (vent_base is not None and value <= vent_base + HUMIDITY_HYSTERESIS)
            or (vent_base is None and value < absolute - HUMIDITY_HYSTERESIS)
        ):
            vent = None
            e["dry_since"] = now.isoformat()
    e["vent"] = vent
    return e, _info(e, value, base)


def _info(e: dict, value: float | None, base: float | None) -> dict[str, Any]:
    return {
        "humidity": value,
        "baseline": base,
        "ventilating": e["vent"] is not None,
        "alert_from": _dt(e["dry_since"]),
    }
