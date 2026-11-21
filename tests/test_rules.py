"""Regeln des Besitzers aus Vorlagen."""

from datetime import timedelta

import pytest

from custom_components.waermeregie import engine, model, rules
from custom_components.waermeregie.engine import StoveObs

from .conftest import at, sample_config
from .test_engine import obs, run


def _rule(template, cfg, **params):
    rule = rules.default_rule(template, cfg["scenes"])
    rule["params"].update(params)
    return rule


def _eval(cfg, facts, state, now):
    return rules.evaluate(cfg["rules"], facts, state, now, cfg["scenes"])


def test_nobody_home_needs_everyone_away_lock_and_time():
    cfg = sample_config()
    cfg["rules"] = [
        _rule("nobody_home", cfg, require_lock=True, lock="lock.haustuer", after_min=30)
    ]
    cfg = model.validate(cfg)
    now = at(16, "09:00")
    away = {"everyone_away": True, "locks": {"lock.haustuer": True}}
    r = _eval(cfg, {"everyone_away": False, "locks": {"lock.haustuer": True}}, None, now)
    assert r["status"][0]["state"] == "waiting"
    # alle weg, aber nicht abgesperrt: greift nicht
    r = _eval(cfg, {"everyone_away": True, "locks": {"lock.haustuer": False}}, r["state"], now)
    assert r["effects"]["scene"] is None
    assert "nicht abgesperrt" in r["status"][0]["detail"]
    # alle weg und abgesperrt: erst nach 30 Minuten
    r = _eval(cfg, away, r["state"], now)
    assert r["effects"]["scene"] is None
    assert "09:30" in r["status"][0]["detail"]
    r = _eval(cfg, away, r["state"], now + timedelta(minutes=31))
    assert r["effects"]["scene"] == "abwesend"
    assert r["status"][0]["state"] == "active"
    assert any("greift" in t for t in r["log"])
    # jemand kommt zurück: sofort vorbei
    r = _eval(cfg, {"everyone_away": False, "locks": {}}, r["state"], now + timedelta(minutes=40))
    assert r["effects"]["scene"] is None
    assert any("endet" in t for t in r["log"])


def test_unknown_presence_or_lock_never_activates():
    cfg = sample_config()
    cfg["rules"] = [_rule("nobody_home", cfg, require_lock=True, lock=None, after_min=5)]
    cfg = model.validate(cfg)  # ohne Schloss gültig, greift aber nie
    now = at(16, "09:00")
    r = _eval(cfg, {"everyone_away": True, "locks": {}}, None, now)
    r = _eval(cfg, {"everyone_away": True, "locks": {}}, r["state"], now + timedelta(hours=2))
    assert r["status"][0]["state"] == "unknown"
    assert r["effects"]["scene"] is None
    r = _eval(cfg, {"everyone_away": None}, None, now)
    assert r["status"][0]["state"] == "unknown"


def test_cold_and_wind_add_up_but_stay_capped():
    cfg = sample_config()
    cfg["rules"] = [
        _rule("cold_outside", cfg, below_c=0, target_delta_k=1.5, lead_min=30),
        _rule("wind", cfg, above_kmh=35, target_delta_k=1.5, lead_min=90),
    ]
    cfg = model.validate(cfg)
    now = at(16, "09:00")
    r = _eval(cfg, {"outdoor_c": -3.0, "wind_kmh": 50.0}, None, now)
    assert r["effects"]["target_delta"] == rules.MAX_DELTA_K  # 3,0 gewünscht, 2,0 erlaubt
    assert r["effects"]["lead_min"] == 90
    assert len(r["why"]) == 2
    # Wind lässt nach, aber nicht unter die Schwelle minus 5: bleibt aktiv (kein Flattern)
    r = _eval(cfg, {"outdoor_c": 0.3, "wind_kmh": 32.0}, r["state"], now + timedelta(minutes=5))
    assert [s["state"] for s in r["status"]] == ["active", "active"]
    r = _eval(cfg, {"outdoor_c": 1.0, "wind_kmh": 20.0}, r["state"], now + timedelta(minutes=9))
    assert [s["state"] for s in r["status"]] == ["waiting", "waiting"]
    assert r["effects"] == {"scene": None, "scene_rule": None, "target_delta": 0.0, "lead_min": 0}


def test_forecast_drop_and_disabled_rule():
    cfg = sample_config()
    cfg["rules"] = [_rule("forecast_drop", cfg, drop_k=5, hours=6, lead_min=60)]
    cfg = model.validate(cfg)
    now = at(16, "12:00")
    forecast = [(now + timedelta(hours=h), 8.0 - 2 * h) for h in range(1, 10)]
    r = _eval(cfg, {"outdoor_c": 8.0, "forecast": forecast}, None, now)
    assert r["effects"]["lead_min"] == 60  # in 6 h sind es -4 °C
    r = _eval(cfg, {"outdoor_c": 8.0, "forecast": []}, None, now)
    assert r["status"][0]["state"] == "unknown"
    cfg["rules"][0]["enabled"] = False
    r = _eval(cfg, {"outdoor_c": 8.0, "forecast": forecast}, None, now)
    assert r["status"][0]["state"] == "off"
    assert r["effects"]["lead_min"] == 0


def test_trial_counts_but_does_nothing_and_waits_for_decision():
    cfg = sample_config()
    now = at(16, "09:00")
    rule = _rule("wind", cfg, above_kmh=35, lead_min=30)
    rule["trial_until"] = (now + timedelta(days=1)).isoformat()
    cfg["rules"] = [rule]
    cfg = model.validate(cfg)
    r = _eval(cfg, {"wind_kmh": 50.0}, None, now)
    assert r["status"][0]["state"] == "trial"
    assert r["status"][0]["hits"] == 1
    assert r["effects"]["lead_min"] == 0
    assert any("Probelauf" in t for t in r["log"])
    # nach dem Probelauf wirkt sie weiter nicht, bis der Besitzer entscheidet
    r = _eval(cfg, {"wind_kmh": 50.0}, r["state"], now + timedelta(days=2))
    assert r["status"][0]["state"] == "trial_done"
    assert r["effects"]["lead_min"] == 0


def test_validate_rejects_bad_rules():
    cfg = sample_config()
    for bad in (
        [{"template": "gibt_es_nicht"}],
        [_rule("wind", cfg, above_kmh=500)],
        [_rule("cold_outside", cfg, target_delta_k=5)],
        [_rule("nobody_home", cfg, scene="unbekannt")],
        [_rule("wind", cfg), _rule("wind", cfg)],
    ):
        cfg["rules"] = bad
        with pytest.raises(model.ConfigError):
            model.validate(cfg)


# --- Wirkung in der Regel-Logik -------------------------------------------------------


def test_rule_scene_replaces_schedule_but_not_manual_choice_or_frost():
    cfg = sample_config(mode="active")
    now = at(16, "18:00")  # Komfort laut Zeitplan
    o = obs(now, wz=19.0, sz=17.5)
    o.rule_scene = "abwesend"
    r = run(cfg, engine.empty_state(), o)
    assert r.status["scene"]["id"] == "abwesend"
    assert r.status["scene"]["source"] == "rule"
    assert ("stove_start",) not in r.actions  # Abwesend: nur Frostschutz
    # von Hand gewählte Szene geht vor
    state = {
        **engine.empty_state(),
        "override": {"scene": "komfort", "until": (now + timedelta(hours=2)).isoformat()},
    }
    o = obs(now, wz=19.0, sz=17.5)
    o.rule_scene = "abwesend"
    r = run(cfg, state, o)
    assert r.status["scene"]["source"] == "override"
    assert ("stove_start",) in r.actions
    # Frostschutz gilt auch, wenn die Regel "Abwesend" setzt
    o = obs(now, wz=11.0, sz=11.0)
    o.rule_scene = "abwesend"
    r = run(cfg, engine.empty_state(), o)
    assert ("stove_start",) in r.actions


def test_rule_lead_starts_next_warmer_slot_early_and_delta_is_clamped_by_limits():
    cfg = sample_config(mode="active")
    now = at(16, "16:20")  # Abwesend bis 17:00, dann Komfort
    o = obs(now, wz=19.0, sz=17.5)
    r = run(cfg, engine.empty_state(), o)
    assert r.status["scene"]["id"] == "abwesend"
    o = obs(now, wz=19.0, sz=17.5)
    o.rule_lead_min = 60
    r = run(cfg, engine.empty_state(), o)
    assert (r.status["scene"]["id"], r.status["scene"]["source"]) == ("komfort", "lead")
    assert ("stove_start",) in r.actions
    # Vorlauf zieht nie einen kühleren Abschnitt vor
    o = obs(at(16, "22:00"), wz=21.0, sz=19.0)
    o.rule_lead_min = 60
    assert run(cfg, engine.empty_state(), o).status["scene"]["id"] == "komfort"
    # Ziel-Verschiebung
    o = obs(at(16, "18:00"), wz=21.0, sz=19.0, stove=StoveObs(available=True))
    o.rule_delta_k = 0.5
    r = run(cfg, engine.empty_state(), o)
    assert r.status["rooms"][0]["target"] == 21.5


# --- Freie Regeln (Etappe 3) -----------------------------------------------------------


def _custom(cfg, conditions, **over):
    rule = rules.default_rule("custom", cfg["scenes"])
    rule.update({"id": "abend_bad", "name": "Abends Bad wärmer"})
    rule["params"]["conditions"] = conditions
    rule["params"].update(over)
    return rule


def test_custom_rule_needs_all_conditions_and_builds_a_sentence():
    cfg = sample_config()
    cfg["rules"] = [
        _custom(
            cfg,
            [
                {"type": "time", "from": "22:00", "to": "06:00"},
                {"type": "outdoor", "op": "below", "value": 5},
                {"type": "room_temp", "room": "schlafzimmer", "op": "below", "value": 18},
            ],
            target_delta_k=1.0,
        )
    ]
    cfg = model.validate(cfg)
    facts = {
        "outdoor_c": 2.0,
        "rooms": {"schlafzimmer": {"name": "Schlafzimmer", "temperature": 17.0}},
    }
    r = rules.evaluate(cfg["rules"], facts, None, at(16, "23:30"), cfg["scenes"], cfg)
    assert r["status"][0]["state"] == "active"
    assert r["effects"]["target_delta"] == 1.0
    assert r["status"][0]["sentence"] == (
        "Wenn es zwischen 22:00 und 06:00 Uhr ist und es draußen unter 5 °C hat und es im "
        "Raum „Schlafzimmer“ unter 18 °C hat, dann Ziele 1 K höher."
    )
    # außerhalb der Uhrzeit: wartet
    r = rules.evaluate(cfg["rules"], facts, None, at(16, "12:00"), cfg["scenes"], cfg)
    assert r["status"][0]["state"] == "waiting"
    # ein Wert unbekannt, keiner falsch: kann nicht prüfen, wirkt nicht
    r = rules.evaluate(cfg["rules"], {"outdoor_c": 2.0}, None, at(16, "23:30"), cfg["scenes"], cfg)
    assert r["status"][0]["state"] == "unknown"
    assert r["effects"]["target_delta"] == 0.0


def test_custom_rule_can_lower_targets_or_set_a_scene_within_limits():
    cfg = sample_config()
    cfg["rules"] = [
        _custom(cfg, [{"type": "persons", "value": "all_away"}], target_delta_k=-2.0),
        {
            **_custom(cfg, [{"type": "day_type", "value": "wochenende"}], scene="sparen"),
            "id": "wochenende_sparen",
            "name": "Am Wochenende sparen",
        },
    ]
    cfg = model.validate(cfg)
    facts = {"everyone_away": True, "day_type": {"id": "wochenende", "name": "Wochenende"}}
    r = rules.evaluate(cfg["rules"], facts, None, at(21, "10:00"), cfg["scenes"], cfg)
    assert r["effects"]["target_delta"] == -2.0
    assert r["effects"]["scene"] == "sparen"


def test_validate_rejects_bad_custom_rules_and_learn_bounds():
    cfg = sample_config()
    good = _custom(cfg, [{"type": "outdoor", "op": "below", "value": 5}])
    for bad in (
        {**good, "name": ""},
        _custom(cfg, [{"type": "outdoor", "op": "below", "value": 99}]),
        _custom(cfg, [{"type": "room_temp", "room": "keller", "op": "below", "value": 18}]),
        _custom(cfg, [{"type": "time", "from": "25:00", "to": "06:00"}]),
        _custom(cfg, [{"type": "unbekannt"}]),
        {**good, "learn": {"lead_min": [0, 500]}},
        {**good, "learn": {"scene": [0, 1]}},
    ):
        cfg["rules"] = [bad]
        with pytest.raises(model.ConfigError):
            model.validate(cfg)


# --- Lernwerte ---------------------------------------------------------------------


def test_learn_value_steps_once_a_day_and_never_leaves_the_bounds():
    cfg = sample_config()
    rule = _rule("cold_outside", cfg, below_c=0, target_delta_k=0.5, lead_min=30)
    rule["learn"] = {"lead_min": [20, 50]}
    cfg["rules"] = [rule]
    cfg = model.validate(cfg)
    now = at(16, "07:00")
    r = _eval(cfg, {"outdoor_c": -3.0}, None, now)
    state = r["state"]
    # zu kalt, während die Regel wirkt: 10 min früher
    state, log = rules.learn_feedback(cfg["rules"], state, "cold", {}, now)
    assert any("30 → 40" in t for t in log)
    # am selben Tag kein zweiter Schritt
    state, log = rules.learn_feedback(cfg["rules"], state, "cold", {}, now + timedelta(hours=2))
    assert log == []
    state, log = rules.learn_feedback(cfg["rules"], state, "cold", {}, now + timedelta(days=1))
    assert any("40 → 50" in t for t in log)
    # an der Grenze: kein Schritt mehr, einmal ein Hinweis
    state, log = rules.learn_feedback(cfg["rules"], state, "cold", {}, now + timedelta(days=2))
    assert len(log) == 1 and "Grenze" in log[0]
    state, log = rules.learn_feedback(cfg["rules"], state, "cold", {}, now + timedelta(days=3))
    assert log == []
    r = _eval(cfg, {"outdoor_c": -3.0}, state, now + timedelta(days=3))
    assert r["effects"]["lead_min"] == 50  # der gelernte Wert wirkt
    assert r["status"][0]["learned"] == {"lead_min": 50}
    assert r["status"][0]["at_limit"] == ["lead_min"]
    assert "50 min früher" in r["status"][0]["sentence"]
    # zu warm: wieder zurück
    state, log = rules.learn_feedback(cfg["rules"], r["state"], "warm", {}, now + timedelta(days=4))
    assert any("50 → 40" in t for t in log)


def test_threshold_learns_when_cold_just_above_it_and_fixed_values_never_move():
    cfg = sample_config()
    learning = _rule("cold_outside", cfg, below_c=0)
    learning["learn"] = {"below_c": [-2, 3]}
    fixed = {**_rule("wind", cfg, above_kmh=35), "learn": {}}
    cfg["rules"] = [learning, fixed]
    cfg = model.validate(cfg)
    now = at(16, "07:00")
    facts = {"outdoor_c": 1.5, "wind_kmh": 30.0}
    state = _eval(cfg, facts, None, now)["state"]
    state, log = rules.learn_feedback(cfg["rules"], state, "cold", facts, now)
    assert log == ["Gelernt: Regel „Kalt draußen“: 0 → 1 (Rückmeldung zu kalt)"]
    r = _eval(cfg, facts, state, now + timedelta(minutes=1))
    assert r["status"][0]["learned"] == {"below_c": 1}
    assert r["status"][1]["learned"] == {}
    # "passt" lernt nichts
    assert rules.learn_feedback(cfg["rules"], state, "ok", facts, now + timedelta(days=1))[1] == []


def test_nobody_home_wait_grows_after_short_absence():
    cfg = sample_config()
    rule = _rule("nobody_home", cfg, after_min=30)
    rule["learn"] = {"after_min": [10, 60]}
    cfg["rules"] = [rule]
    cfg = model.validate(cfg)
    now = at(16, "09:00")
    away, home = {"everyone_away": True}, {"everyone_away": False}
    r = _eval(cfg, away, None, now)
    r = _eval(cfg, away, r["state"], now + timedelta(minutes=31))
    assert r["status"][0]["state"] == "active"
    # zehn Minuten später schon wieder da: Wartezeit war zu kurz
    r = _eval(cfg, home, r["state"], now + timedelta(minutes=41))
    assert any("30 → 35" in t for t in r["log"])
    assert r["status"][0]["learned"] == {"after_min": 35}
