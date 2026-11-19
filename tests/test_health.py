"""Sensorzustand: Aussetzer überbrücken, Ausfälle zählen, Fenster-Plausibilität."""

from __future__ import annotations

from datetime import datetime, timedelta

from custom_components.waermeregie import health

T0 = datetime(2026, 11, 19, 7, 0)


def m(minutes: float) -> datetime:
    return T0 + timedelta(minutes=minutes)


def test_short_dropout_keeps_last_value_and_since() -> None:
    e = health.track(None, "on", m(0), m(0))
    e = health.track(e, None, None, m(5))
    assert health.reading(e, m(10), 30) == ("on", m(0))
    assert health.held(e, m(10), 30)
    # zu lange weg: kein Wert mehr
    assert health.reading(e, m(36), 30) == (None, None)
    # kommt mit demselben Wert zurück: gilt weiter seit Minute 0
    e = health.track(e, "on", m(40), m(40))
    assert health.reading(e, m(40), 30) == ("on", m(0))
    assert e["down"] is None


def test_hold_zero_switches_off_bridging() -> None:
    e = health.track(None, "on", m(0), m(0))
    e = health.track(e, None, None, m(1))
    assert health.reading(e, m(1), 0) == (None, None)


def test_new_value_takes_new_since() -> None:
    e = health.track(None, "off", m(0), m(0))
    e = health.track(e, "on", m(3), m(3))
    assert health.reading(e, m(4), 30) == ("on", m(3))


def test_drops_counted_once_per_outage_and_for_24h() -> None:
    e = health.track(None, "21.5", m(0), m(0))
    e = health.track(e, None, None, m(1))
    e = health.track(e, None, None, m(2))  # noch derselbe Ausfall
    e = health.track(e, "21.4", m(3), m(3))
    e = health.track(e, None, None, m(10))
    assert health.summary(e, m(11), 30)["drops_24h"] == 2
    e = health.track(e, "21.4", m(12), m(25 * 60))
    assert health.summary(e, m(25 * 60), 30)["drops_24h"] == 0


def test_alert_once_per_day() -> None:
    entries = {"binary_sensor.a": health.track(None, None, None, m(0))}
    assert health.due_alerts(entries, ["binary_sensor.a"], m(30), 60) == []
    assert health.due_alerts(entries, ["binary_sensor.a"], m(61), 60) == ["binary_sensor.a"]
    assert health.due_alerts(entries, ["binary_sensor.a"], m(120), 60) == []
    # 0 = keine Meldungen
    other = {"binary_sensor.b": health.track(None, None, None, m(0))}
    assert health.due_alerts(other, ["binary_sensor.b"], m(600), 0) == []


def test_opening_implausible_when_room_does_not_cool() -> None:
    t = health.opening_check(None, m(0), 22.0)
    t = health.opening_check(t, m(30), 22.1)
    t = health.opening_check(t, m(61), 21.9)
    assert health.opening_implausible(t, m(61), 60, 0.3)
    assert not health.opening_implausible(t, m(59), 60, 0.3)
    assert not health.opening_implausible(t, m(61), 0, 0.3)  # ausgeschaltet


def test_opening_plausible_when_room_cools() -> None:
    t = health.opening_check(None, m(0), 22.9)
    t = health.opening_check(t, m(12), 22.3)
    t = health.opening_check(t, m(61), 22.5)  # tiefster Wert zählt
    assert not health.opening_implausible(t, m(61), 60, 0.3)
