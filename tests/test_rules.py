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
