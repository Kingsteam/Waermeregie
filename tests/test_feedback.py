"""Rückmeldungen (zu kalt / passt / zu warm) und Vorschläge daraus."""

from datetime import timedelta

from custom_components.waermeregie import feedback, model

from .conftest import at, sample_config


def _give(data, when, kind, room=None, day_type="buero", scene="nacht"):
    feedback.record(data, when, kind, room, {"day_type": day_type, "scene": scene})


def test_trend_before_and_after_feedback():
    when = at(17, "06:05")
    history = [
        {
            "t": (when + timedelta(minutes=m - 5)).isoformat(),
            "house_c": 19.0 + m / 100,
            "target_c": 21.0,
            "outdoor_c": -1.0,
            "water_c": 40.0,
            "burning": m > 0,
            "rooms": {"bad": 18.0 + m / 100},
        }
        for m in range(-120, 70, 10)  # Punkte alle 10 min, bis 60 min danach
    ]
    before = feedback.trend(history, when, "bad", -1)
    assert [p["min"] for p in before] == [-90, -60, -30]
    assert before[-1]["room_c"] == 17.7 and before[-1]["burning"] is False
    assert feedback.trend(history, when, None, -1)[0]["room_c"] is None
    data = feedback.empty()
    feedback.record(data, when, "cold", "bad", {"before": before})
    # zu früh: noch nichts; später: was der Verlauf hergibt (90 min danach fehlt hier)
    assert feedback.fill_after(data, history, when + timedelta(minutes=60)) == 0
    assert feedback.fill_after(data, history, when + timedelta(minutes=100)) == 1
    assert [p["min"] for p in data["entries"][0]["after"]] == [30, 60]
    assert data["entries"][0]["after"][0]["burning"] is True
    assert feedback.fill_after(data, history, when + timedelta(minutes=200)) == 0  # nur einmal


def test_three_cold_mornings_suggest_earlier_start():
    cfg = sample_config()
    data = feedback.empty()
    # Bürotag: Komfort beginnt um 06:00, kalt war es um 05:20, 05:35 und 05:40
    for day, hhmm in ((16, "05:20"), (17, "05:35")):
        _give(data, at(day, hhmm), "cold")
    assert feedback.suggest(data, cfg, at(17, "06:00")) == []  # zwei reichen nicht
    _give(data, at(19, "05:40"), "cold")
    (s,) = feedback.suggest(data, cfg, at(19, "06:00"))
    assert s["type"] == "slot_earlier"
    assert (s["day_type"], s["from"], s["to"], s["count"]) == ("buero", "06:00", "04:45", 3)
    assert "3-mal" in s["text"] and "04:45" in s["text"]
    # annehmen ändert nur diesen Abschnitt, und die Einstellungen bleiben gültig
    new = model.validate(feedback.apply(cfg, s))
    assert new["day_types"][0]["slots"][0] == {"start": "04:45", "scene": "komfort"}
    assert new["day_types"][1]["slots"][0]["start"] == "06:30"
    # mit eigenem Wert ("Anpassen")
    assert feedback.apply(cfg, s, "05:15")["day_types"][0]["slots"][0]["start"] == "05:15"
    # erledigt: dieselben Rückmeldungen ergeben keinen neuen Vorschlag
    feedback.mark_used(data, s, at(19, "06:00"))
    assert feedback.suggest(data, new, at(19, "06:01")) == []


def test_ok_feedback_cancels_cold_and_other_day_types_do_not_count():
    cfg = sample_config()
    data = feedback.empty()
    for day in (16, 17, 19):
        _give(data, at(day, "05:30"), "cold")
    _give(data, at(18, "05:30"), "cold", day_type="homeoffice")  # andere Tagesart
    _give(data, at(19, "05:35"), "ok")
    assert feedback.suggest(data, cfg, at(19, "06:00")) == []


def test_cold_while_comfort_runs_suggests_higher_target_for_room():
    cfg = sample_config()
    data = feedback.empty()
    for day in (16, 17, 19):
        _give(data, at(day, "19:00"), "cold", room="schlafzimmer", scene="komfort")
    (s,) = feedback.suggest(data, cfg, at(19, "19:30"))
    assert (s["type"], s["room"], s["scene"]) == ("target_up", "schlafzimmer", "komfort")
    assert (s["from"], s["to"]) == (19.0, 19.5)
    assert "Schlafzimmer" in s["text"]
    new = model.validate(feedback.apply(cfg, s))
    assert new["rooms"][1]["targets"]["komfort"] == 19.5
    assert new["rooms"][0]["targets"]["komfort"] == 21.0  # andere Räume unverändert
    assert new["scenes"][0]["default_target"] == 21.0


def test_warm_for_house_suggests_lower_target_and_shifts_all_rooms():
    cfg = sample_config()
    data = feedback.empty()
    for day in (16, 17, 19):
        _give(data, at(day, "20:00"), "warm", scene="komfort")
    (s,) = feedback.suggest(data, cfg, at(19, "20:30"))
    assert (s["type"], s["room"], s["to"]) == ("target_down", None, 20.5)
    new = model.validate(feedback.apply(cfg, s))
    assert new["scenes"][0]["default_target"] == 20.5
    assert new["rooms"][0]["targets"]["komfort"] == 20.5
    assert new["rooms"][1]["targets"]["komfort"] == 18.5


def test_dismissed_suggestion_stays_away_and_old_feedback_expires():
    cfg = sample_config()
    data = feedback.empty()
    for day in (16, 17, 19):
        _give(data, at(day, "20:00"), "warm", scene="komfort")
    now = at(19, "20:30")
    (s,) = feedback.suggest(data, cfg, now)
    feedback.dismiss(data, s["id"], now)
    assert feedback.suggest(data, cfg, now + timedelta(days=1)) == []
    # nach zwei Wochen zählen die alten Rückmeldungen nicht mehr
    data["dismissed"] = {}
    assert feedback.suggest(data, cfg, now + timedelta(days=20)) == []
