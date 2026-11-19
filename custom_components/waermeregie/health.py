"""Zustand der Sensoren: kurze Aussetzer überbrücken, Ausfälle zählen und melden.

Reine Funktionen ohne Home Assistant. Je Entität ein kleiner Eintrag (JSON-fähig,
wird mit dem Laufzustand gespeichert):

  good        letzter gültiger Wert (Zustand als Text, bei Climate die Temperatur)
  changed     seit wann dieser Wert gilt (ISO)
  down        seit wann nicht erreichbar (ISO, None = erreichbar)
  drops       Zeitpunkte der Ausfälle in den letzten 24 Stunden (ISO)
  alert_day   an welchem Tag der Ausfall schon gemeldet wurde

Warum: Zigbee-Sensoren sind oft für ein, zwei Minuten „nicht verfügbar“. Ohne
Überbrückung gilt ein offenes Fenster dann als zu, und die Heizung springt
mitten im Lüften an.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

DROP_WINDOW = timedelta(hours=24)


def _dt(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def track(
    entry: dict | None, value: str | None, changed: datetime | None, now: datetime
) -> dict[str, Any]:
    """Neue Beobachtung eintragen. value None = nicht erreichbar; changed = HA last_changed."""
    e = {"good": None, "changed": None, "down": None, "drops": [], "alert_day": None}
    e.update(entry or {})
    e["drops"] = list(e["drops"])
    if value is None:
        if e["down"] is None:
            # changed = seit wann HA den Ausfall kennt (genauer als unsere Runde)
            since = min(changed, now) if changed else now
            e["down"] = since.isoformat()
            e["drops"].append(since.isoformat())
    else:
        # Gleicher Wert wie zuletzt (auch nach einem Aussetzer oder Neustart):
        # gilt weiter seit damals. Sonst würde ein offenes Fenster nach jedem
        # Aussetzer als „gerade geöffnet“ zählen.
        if value != e["good"] or e["changed"] is None:
            e["changed"] = (changed or now).isoformat()
        e["good"] = value
        e["down"] = None
    cutoff = now - DROP_WINDOW
    e["drops"] = [d for d in e["drops"] if datetime.fromisoformat(d) >= cutoff]
    return e


def reading(entry: dict, now: datetime, hold_min: float) -> tuple[str | None, datetime | None]:
    """(Wert, gilt seit): bei kurzem Aussetzer der letzte gültige Wert, sonst None."""
    down = _dt(entry.get("down"))
    if down is None:
        return entry.get("good"), _dt(entry.get("changed"))
    if entry.get("good") is not None and now - down < timedelta(minutes=hold_min):
        return entry["good"], _dt(entry.get("changed"))
    return None, None


def held(entry: dict, now: datetime, hold_min: float) -> bool:
    """Gerade nicht erreichbar, aber der letzte Wert wird noch verwendet."""
    return entry.get("down") is not None and reading(entry, now, hold_min)[0] is not None


def down_minutes(entry: dict, now: datetime) -> float:
    down = _dt(entry.get("down"))
    return (now - down).total_seconds() / 60 if down else 0.0


def due_alerts(
    entries: dict[str, dict], entity_ids: list[str], now: datetime, alert_min: float
) -> list[str]:
    """Entitäten, die länger als alert_min weg sind und heute noch nicht gemeldet wurden.
    Markiert sie als gemeldet (höchstens eine Meldung je Sensor und Tag)."""
    if alert_min <= 0:
        return []
    today = now.date().isoformat()
    due = []
    for entity_id in entity_ids:
        e = entries.get(entity_id)
        if not e or e.get("down") is None or e.get("alert_day") == today:
            continue
        if down_minutes(e, now) >= alert_min:
            e["alert_day"] = today
            due.append(entity_id)
    return due


def summary(entry: dict | None, now: datetime, hold_min: float) -> dict[str, Any]:
    """Für die Oberfläche: Ausfälle in 24 h, seit wann weg, wird überbrückt."""
    if not entry:
        return {"drops_24h": 0, "down_since": None, "held": False}
    cutoff = now - DROP_WINDOW
    return {
        "drops_24h": sum(1 for d in entry.get("drops", []) if datetime.fromisoformat(d) >= cutoff),
        "down_since": entry.get("down"),
        "held": held(entry, now, hold_min),
    }


def opening_check(track_: dict | None, now: datetime, temperature: float | None) -> dict | None:
    """Verlauf einer Öffnung mitschreiben: Start, Temperatur dabei, tiefster Wert seither."""
    if temperature is None:
        return track_
    if track_ is None:
        return {"since": now.isoformat(), "start": temperature, "min": temperature, "warned": False}
    return {**track_, "min": min(track_["min"], temperature)}


def opening_implausible(
    track_: dict | None, now: datetime, check_min: float, drop_k: float
) -> bool:
    """Lange offen, aber der Raum kühlt nicht ab? Dann stimmt der Sensor vermutlich nicht."""
    if not track_ or check_min <= 0 or track_["warned"]:
        return False
    if now - datetime.fromisoformat(track_["since"]) < timedelta(minutes=check_min):
        return False
    return track_["start"] - track_["min"] < drop_k
