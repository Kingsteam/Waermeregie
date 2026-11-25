"""Pelletvorrat: Brennzeit zählen, schätzen, nachfüllen, aus „leer“ lernen."""

from __future__ import annotations

from datetime import datetime, timedelta

from custom_components.waermeregie import pellets as P
from custom_components.waermeregie.const import DEFAULT_PARAMETERS

T0 = datetime(2030, 1, 7, 0, 0)  # erfundenes Datum
PARAMS = dict(DEFAULT_PARAMETERS)  # Sack 15 kg, Behälter 26 kg, Start 1,5 kg/h, Erinnerung 5 kg


def burn(state, start, hours, step_min=5):
    """Ofen `hours` lang brennen lassen, Aktualisierung alle step_min Minuten."""
    t = start
    state = P.update(state, t, True)
    for _ in range(int(hours * 60 / step_min)):
        t += timedelta(minutes=step_min)
        state = P.update(state, t, True)
    state = P.update(state, t, False)
    return state, t


def test_estimate_falls_with_burn_time():
    st = P.set_stock(P.empty(), T0, 15, from_empty=True)
    assert P.estimate(st, PARAMS) == 15
    st, _ = burn(st, T0, 2)
    assert P.estimate(st, PARAMS) == 12.0  # 2 h mal 1,5 kg/h


def test_off_time_and_gaps_do_not_count():
    st = P.set_stock(P.empty(), T0, 15, from_empty=False)
    st = P.update(st, T0, False)
    st = P.update(st, T0 + timedelta(hours=5), False)
    assert P.estimate(st, PARAMS) == 15
    st = P.update(st, T0 + timedelta(hours=5), True)
    st = P.update(st, T0 + timedelta(hours=8), True)  # 3 h Lücke (HA aus)
    assert P.estimate(st, PARAMS) == 15


def test_refill_always_adds_full_bag():
    st = P.set_stock(P.empty(), T0, 15, from_empty=True)
    st, t = burn(st, T0, 4)  # 9 kg übrig
    st = P.refill(st, t, 15, PARAMS)
    assert st["stock_kg"] == 24.0
    st = P.refill(st, t, 15, PARAMS)
    assert st["stock_kg"] == 39.0  # ein Sack kommt immer ganz dazu (Behälter hat Luft)
    assert st["fill_kg"] == 45.0
    assert P.forecast(st, PARAMS, t)["fill_pct"] == 100
    assert st["refills"][-1]["estimate_before"] == 24.0


def test_learns_rate_when_empty():
    st = P.set_stock(P.empty(), T0, 15, from_empty=True)
    st, t = burn(st, T0, 12)  # 15 kg in 12 h = 1,25 kg/h
    st, text = P.mark_empty(st, t)
    assert st["rate_kg_h"] == 1.25
    assert st["learned"] == 1
    assert "1.25" in text
    assert st["stock_kg"] == 0
    # zweite Füllung: 15 kg in 10 h = 1,5 kg/h → Mittel 1,375
    st = P.refill(st, t, 15, PARAMS)
    st, t = burn(st, t, 10)
    st, _ = P.mark_empty(st, t)
    assert st["rate_kg_h"] == 1.375


def test_no_learning_without_known_fill():
    st = P.set_stock(P.empty(), T0, 15, from_empty=False)  # vorher unbekannt
    st, t = burn(st, T0, 5)
    st, text = P.mark_empty(st, t)
    assert st["rate_kg_h"] is None
    assert "zu wenig Daten" in text


def test_implausible_rate_is_limited():
    st = P.set_stock(P.empty(), T0, 26, from_empty=True)
    st, t = burn(st, T0, 2)  # 26 kg in 2 h wäre 13 kg/h
    st, _ = P.mark_empty(st, t)
    assert st["rate_kg_h"] == 5.0


def test_forecast_and_reminder_once():
    st = P.set_stock(P.empty(), T0, 15, from_empty=True)
    # drei Tage je 4 h brennen
    t = T0
    for day in range(3):
        st, _ = burn(st, T0 + timedelta(days=day, hours=6), 2)
        st, _ = burn(st, T0 + timedelta(days=day, hours=18), 2)
    t = T0 + timedelta(days=3, hours=7)
    st = P.update(st, t, False)
    fc = P.forecast(st, PARAMS, t)
    assert fc["daily_burn_h"] == 4.0
    assert fc["stock_kg"] == 0.0  # 12 h mal 1,5 = 18 kg > 15
    assert fc["remind"] is True
    st["reminded"] = True
    assert P.forecast(st, PARAMS, t)["remind"] is False
    st = P.refill(st, t, 15, PARAMS)
    fc = P.forecast(st, PARAMS, t)
    assert fc["stock_kg"] == 15.0
    assert fc["hours_left"] == 10.0
    assert fc["remind"] is False
    empty_at = datetime.fromisoformat(fc["empty_at"])
    assert empty_at == t + timedelta(days=2.5)


def test_unknown_stock_gives_no_forecast():
    fc = P.forecast(P.empty(), PARAMS, T0)
    assert fc["stock_kg"] is None
    assert fc["empty_at"] is None
    assert fc["remind"] is False
