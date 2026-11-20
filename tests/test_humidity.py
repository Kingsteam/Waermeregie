"""Lüften wegen Luftfeuchte: Verlauf wie nach einem echten Duschen (anonymisiert).

Fühler im Heizkörperthermostat, weit weg von der Dusche: Grundwert 40,6 %,
langsamer Anstieg auf 49,8 %, Fenster auf, Spitze 55,2 %, schneller Abfall
auf 42,4 %. Eine absolute Schwelle von 65 % greift hier nie, der Anstieg über
den Grundwert schon.
"""

from __future__ import annotations

from datetime import timedelta

from custom_components.waermeregie import humidity

from .conftest import at

ABS, RISE, MAX = 65.0, 6.0, 30


def shower_curve(after_close: float = 42.4) -> dict:
    """Minutenwerte 10:00-11:30 (Feuchte in %)."""
    start = at(16, "10:00")
    values = {}
    for i in range(91):
        t = start + timedelta(minutes=i)
        if i <= 25:
            v = 40.6
        elif i <= 44:  # 10:26-10:44 Anstieg auf 49,8
            v = 40.6 + (49.8 - 40.6) * (i - 25) / 19
        elif i == 45:
            v = 52.5
        elif i == 46:
            v = 55.2
        elif i <= 53:  # Abfall bis 10:53 auf 42,4
            v = 55.2 - (55.2 - 42.4) * (i - 46) / 7
        else:
            v = after_close
        values[t] = round(v, 1)
    return values


def run(values: dict, open_from: str, open_until: str | None, rise: float = RISE):
    o_from = at(16, open_from)
    o_until = at(16, open_until) if open_until else None
    entry = None
    out = {}
    for t, v in values.items():
        is_open = t >= o_from and (o_until is None or t < o_until)
        entry, info = humidity.update(entry, t, v, is_open, ABS, rise, MAX)
        out[t] = info
    return out


def test_shower_window_counts_as_ventilating():
    info = run(shower_curve(), "10:45", "10:52")
    for minute in range(45, 52):
        assert info[at(16, f"10:{minute}")]["ventilating"], minute
    assert info[at(16, "10:45")]["baseline"] == 40.6
    # Vor dem Öffnen und nach dem Schließen nie "Lüften"
    assert not info[at(16, "10:44")]["ventilating"]
    assert not info[at(16, "10:52")]["ventilating"]
    assert info[at(16, "10:52")]["alert_from"] is None


def test_absolute_threshold_alone_would_never_trigger():
    info = run(shower_curve(), "10:45", "10:52", rise=0)
    assert not any(i["ventilating"] for i in info.values())


def test_window_left_open_reported_after_humidity_is_back_down():
    info = run(shower_curve(), "10:45", None)
    assert info[at(16, "10:52")]["ventilating"]  # 44,2 % > 40,6 + 2
    done = info[at(16, "10:53")]
    assert not done["ventilating"]
    assert done["alert_from"] == at(16, "10:53")
    # Bleibt so, auch wenn die Feuchte nicht wieder steigt
    assert info[at(16, "11:10")]["alert_from"] == at(16, "10:53")


def test_maximum_duration_then_report():
    info = run(shower_curve(after_close=55.0), "10:45", None)
    assert info[at(16, "11:14")]["ventilating"]
    late = info[at(16, "11:15")]
    assert not late["ventilating"]
    assert late["alert_from"] is None  # Meldung zählt ab dem Öffnen
    assert not info[at(16, "11:30")]["ventilating"]  # kein Neustart in dieser Öffnung


def test_closed_window_resets_and_missing_values_keep_state():
    values = shower_curve()
    entry = None
    for t, v in values.items():
        if t > at(16, "10:46"):
            break
        entry, info = humidity.update(entry, t, v, t >= at(16, "10:45"), ABS, RISE, MAX)
    assert info["ventilating"]
    entry, info = humidity.update(entry, at(16, "10:47"), None, True, ABS, RISE, MAX)
    assert info["ventilating"]  # kein Wert: bleibt beim Lüften
    entry, info = humidity.update(entry, at(16, "10:48"), 50.0, False, ABS, RISE, MAX)
    assert not info["ventilating"] and entry["first"] is None


def test_absolute_threshold_without_baseline():
    t = at(16, "08:00")
    entry, info = humidity.update(None, t, 80.0, True, ABS, RISE, MAX)
    assert info["ventilating"]  # noch kein Grundwert, aber über 65 %
    entry, info = humidity.update(entry, t + timedelta(minutes=5), 62.0, True, ABS, RISE, MAX)
    assert not info["ventilating"]


def test_samples_limited_to_baseline_window():
    entry = None
    t = at(16, "06:00")
    for i in range(300):
        entry, _ = humidity.update(entry, t + timedelta(minutes=i), 40.0, False, ABS, RISE, MAX)
    assert len(entry["samples"]) <= 91
