"""Benachrichtigungen: Ruhezeit, Wiederholungssperre, Ein/Aus je Art."""

from __future__ import annotations

from datetime import timedelta

from custom_components.waermeregie import messages
from custom_components.waermeregie.const import DEFAULT_NOTIFICATIONS

from .conftest import at


def settings(**kw):
    return {**DEFAULT_NOTIFICATIONS, **kw}


def test_quiet_over_midnight():
    s = settings()
    assert messages.in_quiet(s, at(16, "23:30"))
    assert messages.in_quiet(s, at(17, "06:59"))
    assert not messages.in_quiet(s, at(17, "07:00"))
    assert not messages.in_quiet(s, at(16, "21:59"))


def test_quiet_same_day_and_off():
    s = settings(quiet_start="12:00", quiet_end="14:00")
    assert messages.in_quiet(s, at(16, "13:00"))
    assert not messages.in_quiet(s, at(16, "14:00"))
    assert not messages.in_quiet(settings(quiet_start="", quiet_end=""), at(16, "23:00"))


def test_decide():
    s = settings()
    day, night = at(16, "12:00"), at(16, "23:00")
    assert messages.decide(s, "opening", None, day) == "send"
    assert messages.decide(s, "opening", None, night) == "hold"
    assert messages.decide(settings(quiet_hold=False), "opening", None, night) == "drop"
    assert messages.decide(s, "stove_error", None, night) == "send"  # kritisch
    assert messages.decide(settings(opening=False), "opening", None, day) == "drop"
    # Wiederholungssperre
    assert messages.decide(s, "opening", day - timedelta(minutes=30), day) == "drop"
    assert messages.decide(s, "opening", day - timedelta(minutes=61), day) == "send"
    assert messages.decide(settings(repeat_min=0), "opening", day, day) == "send"


def test_bundle():
    assert messages.bundle(["a"]) == "a"
    assert messages.bundle(["a", "b"]).startswith("Während der Ruhezeit: a")
