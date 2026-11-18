"""Pelletvorrat schätzen und dazulernen. Reine Funktionen, ohne Home Assistant.

Idee: Der Vorrat sinkt mit der Brenndauer des Ofens mal dem Verbrauch pro
Stunde. Der Verbrauch ist anfangs ein Startwert (Parameter) und wird jedes Mal
nachgeschärft, wenn der Behälter nachweislich leer ist: Dann ist bekannt, wie
viele kg seit dem letzten „leer“ eingefüllt wurden und wie lange der Ofen damit
gebrannt hat.

Zustand (alles JSON-fähig, wird mit dem Laufzustand gespeichert):
  stock_kg         Vorrat beim letzten Setzen/Nachfüllen (None = unbekannt)
  burn_s           Brennsekunden seit diesem Zeitpunkt
  fill_kg          seit dem letzten „leer“ eingefüllte kg (None = kein „leer“ bekannt)
  fill_burn_s      Brennsekunden seit dem letzten „leer“
  rate_kg_h        gelernter Verbrauch (None = Startwert aus den Parametern)
  learned          wie oft gelernt
  days             {Datum: Brennstunden} der letzten Tage
  last_ts          Zeitpunkt der letzten Aktualisierung (ISO)
  last_burning     brannte der Ofen bei der letzten Aktualisierung
  reminded         Erinnerung für diese Füllung schon geschickt
  refills          letzte Nachfüllungen [{time, kg, estimate_before}]
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

from .const import PELLET_DAYS_FOR_FORECAST, PELLET_MAX_GAP_S, PELLET_RATE_LIMITS

DEFAULT_DAILY_BURN_H = 8.0  # bis eigene Werte da sind


def empty() -> dict[str, Any]:
    return {
        "stock_kg": None,
        "burn_s": 0.0,
        "fill_kg": None,
        "fill_burn_s": 0.0,
        "rate_kg_h": None,
        "learned": 0,
        "days": {},
        "last_ts": None,
        "last_burning": False,
        "reminded": False,
        "refills": [],
    }


def _dt(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def rate(state: dict, params: dict) -> float:
    return state["rate_kg_h"] or float(params["pellet_rate_kg_h"])


def update(state: dict, now: datetime, burning: bool) -> dict:
    """Brennzeit seit der letzten Aktualisierung aufaddieren."""
    st = {**empty(), **state, "days": dict(state.get("days") or {})}
    last = _dt(st["last_ts"])
    if last is not None and st["last_burning"]:
        gap = (now - last).total_seconds()
        # Lücken (Neustart, HA lange aus) nicht als Brennzeit werten
        if 0 < gap <= PELLET_MAX_GAP_S:
            st["burn_s"] += gap
            st["fill_burn_s"] += gap
            day = last.date().isoformat()
            st["days"][day] = round(st["days"].get(day, 0.0) + gap / 3600, 3)
    st["last_ts"] = now.isoformat()
    st["last_burning"] = bool(burning)
    cutoff = (now.date() - timedelta(days=14)).isoformat()
    st["days"] = {d: h for d, h in st["days"].items() if d >= cutoff}
    return st


def estimate(state: dict, params: dict) -> float | None:
    """Geschätzter Vorrat in kg."""
    if state["stock_kg"] is None:
        return None
    used = state["burn_s"] / 3600 * rate(state, params)
    return round(max(0.0, state["stock_kg"] - used), 1)


def daily_burn_h(state: dict, now: datetime) -> float:
    """Mittlere Brennstunden je Tag aus den letzten vollständigen Tagen."""
    today = now.date()
    full = [
        h
        for d, h in state["days"].items()
        if today - timedelta(days=PELLET_DAYS_FOR_FORECAST)
        <= datetime.fromisoformat(d).date()
        < today
    ]
    if full:
        return max(0.5, sum(full) / len(full))
    hours_today = state["days"].get(today.isoformat(), 0.0)
    elapsed_h = now.hour + now.minute / 60
    if elapsed_h >= 6 and hours_today > 0:
        return max(0.5, hours_today / elapsed_h * 24)
    return DEFAULT_DAILY_BURN_H


def forecast(state: dict, params: dict, now: datetime) -> dict[str, Any]:
    """Vorrat, Reichweite, voraussichtlich leer, Erinnerung fällig?"""
    est = estimate(state, params)
    kg_h = rate(state, params)
    out: dict[str, Any] = {
        "stock_kg": est,
        "rate_kg_h": round(kg_h, 2),
        "rate_learned": state["rate_kg_h"] is not None,
        "learned": state["learned"],
        "burn_h_since_refill": round(state["burn_s"] / 3600, 1),
        "daily_burn_h": round(daily_burn_h(state, now), 1),
        "hours_left": None,
        "empty_at": None,
        "remind": False,
        "last_refill": state["refills"][-1]["time"] if state["refills"] else None,
    }
    if est is None:
        return out
    hours_left = est / kg_h
    out["hours_left"] = round(hours_left, 1)
    days_left = hours_left / out["daily_burn_h"]
    out["empty_at"] = (now + timedelta(days=days_left)).isoformat()
    out["remind"] = est <= float(params["pellet_reminder_kg"]) and not state["reminded"]
    return out


def refill(state: dict, now: datetime, kg: float, params: dict) -> dict:
    """Nachgefüllt: Vorrat = Schätzung + kg (höchstens Fassungsvermögen)."""
    st = {**empty(), **state}
    before = estimate(st, params)
    base = before if before is not None else 0.0
    st["stock_kg"] = round(min(float(params["pellet_capacity_kg"]), base + kg), 1)
    st["burn_s"] = 0.0
    if st["fill_kg"] is not None:
        st["fill_kg"] = round(st["fill_kg"] + kg, 1)
    st["reminded"] = False
    st["refills"] = [
        *st["refills"],
        {"time": now.isoformat(), "kg": kg, "estimate_before": before},
    ][-20:]
    return st


def set_stock(state: dict, now: datetime, kg: float, from_empty: bool) -> dict:
    """Vorrat von Hand setzen. from_empty: der Behälter war davor leer."""
    st = {**empty(), **state}
    st["stock_kg"] = round(kg, 1)
    st["burn_s"] = 0.0
    st["reminded"] = False
    if from_empty:
        st["fill_kg"] = round(kg, 1)
        st["fill_burn_s"] = 0.0
    return st


def mark_empty(state: dict, now: datetime) -> tuple[dict, str]:
    """Behälter ist leer: daraus den Verbrauch lernen. Liefert (Zustand, Text)."""
    st = {**empty(), **state}
    text = "Pelletbehälter leer gemeldet"
    burn_h = st["fill_burn_s"] / 3600
    if st["fill_kg"] and burn_h >= 2:
        measured = st["fill_kg"] / burn_h
        low, high = PELLET_RATE_LIMITS
        measured = min(high, max(low, measured))
        old = st["rate_kg_h"]
        st["rate_kg_h"] = round(measured if old is None else (old + measured) / 2, 3)
        st["learned"] += 1
        text += (
            f": {st['fill_kg']:g} kg in {burn_h:.1f} h Brennzeit"
            f" = {measured:.2f} kg/h, neuer Wert {st['rate_kg_h']:.2f} kg/h"
        )
    else:
        text += ": zu wenig Daten zum Lernen (erst ab einer Füllung mit 2 h Brennzeit)"
    st["stock_kg"] = 0.0
    st["burn_s"] = 0.0
    st["fill_kg"] = 0.0
    st["fill_burn_s"] = 0.0
    return st, text
