"""Wärmeabfuhr ohne Puffer (unscharf) und Lernen von Kessel und Heizkörpern."""

from datetime import timedelta

import pytest

from custom_components.waermeregie import engine, fuzzy, learning, model
from custom_components.waermeregie.const import OVERHEAT_C
from custom_components.waermeregie.engine import StoveObs

from .conftest import at, sample_config
from .test_engine import obs, run


def _stove(water, on=False):
    return StoveObs(available=True, on=on, burning=on, water_c=water)


def _radiators(r):
    return {a[1]: a[2] for a in r.actions if a[0] == "radiator"}


# --- fuzzy.py --------------------------------------------------------------------


def test_ramp_edges_and_middle():
    assert fuzzy.ramp(64, 65, 80) == 0.0
    assert fuzzy.ramp(80, 65, 80) == 1.0
    assert fuzzy.ramp(72.5, 65, 80) == pytest.approx(0.5)


def test_mu_hot_ramp_and_end_threshold():
    # Mitte 70, Rampe 65 ... 80, Ende 60
    assert fuzzy.mu_hot(65, 70, 5, 10, 60) == 0.0
    assert fuzzy.mu_hot(70, 70, 5, 10, 60) == pytest.approx(1 / 3)
    assert fuzzy.mu_hot(80, 70, 5, 10, 60) == 1.0
    assert fuzzy.mu_hot(59, 50, 5, 10, 60) == 0.0  # unter dem Ende immer aus
    assert fuzzy.mu_hot(None, 70, 5, 10, 60) == 0.0


def test_mu_warm():
    assert fuzzy.mu_warm(21.0, 21.0) == 0.0
    assert fuzzy.mu_warm(22.5, 21.0) == pytest.approx(0.5)
    assert fuzzy.mu_warm(25.0, 21.0) == 1.0
    assert fuzzy.mu_warm(None, 21.0) == 0.0


def test_extra_rule_warm_room_gets_at_least_half_and_full_near_overheat():
    assert fuzzy.extra_k(2.0, 0.0, 0.0, 66, OVERHEAT_C) == 0.0
    assert fuzzy.extra_k(2.0, 1.0, 0.0, 80, OVERHEAT_C) == 2.0
    assert fuzzy.extra_k(2.0, 1.0, 1.0, 80, OVERHEAT_C) == 1.0  # halb, nie weniger
    assert fuzzy.extra_k(2.0, 0.5, 0.0, 72, OVERHEAT_C) == 1.0
    # nahe am Kesselschutz: voll für alle, auch warme Räume
    assert fuzzy.extra_k(2.0, 0.95, 1.0, OVERHEAT_C - 5, OVERHEAT_C) == 2.0
    assert fuzzy.extra_k(3.0, 0.4, 0.0, 70, OVERHEAT_C) == 1.0  # auf 0,5 K gerundet


# --- Engine: Wärmeabfuhr -----------------------------------------------------------


def test_dump_opens_radiators_more_the_hotter_the_boiler():
    cfg = sample_config(mode="active")
    now = at(16, "18:00")
    # Räume genau auf Ziel (21 / 19), Wasser 70 (Mitte): Zusatz 2 * 1/3 = 0,5 K
    r = run(cfg, engine.empty_state(), obs(now, wz=21.0, sz=19.0, stove=_stove(70.0)))
    assert r.status["stove"]["dump"] is True
    assert r.status["stove"]["dump_level"] == pytest.approx(0.33, abs=0.01)
    rad = _radiators(r)
    assert rad["climate.heizung_wohnzimmer"] == 21.5
    assert any("Wärmeabfuhr" in t for t in r.log)
    # Wasser 80: voller Zusatz 2 K
    r = run(cfg, r.state, obs(now + timedelta(minutes=5), wz=21.0, sz=19.0, stove=_stove(80.0)))
    assert _radiators(r)["climate.heizung_wohnzimmer"] == 23.0
    wz = next(x for x in r.status["rooms"] if x["id"] == "wohnzimmer")
    assert wz["dump_extra_k"] == 2.0


def test_dump_on_warm_room_counts_from_room_temperature():
    """Ein Thermostat öffnet nur über der Raumtemperatur: Zusatz ab dort."""
    cfg = sample_config(mode="active")
    now = at(16, "18:00")
    r = run(cfg, engine.empty_state(), obs(now, wz=22.5, sz=19.0, stove=_stove(80.0)))
    # Wohnzimmer 1,5 K über Ziel: Zusatz 1,5 K, ab 22,5 °C -> 24 °C
    assert _radiators(r)["climate.heizung_wohnzimmer"] == 24.0


def test_dump_skips_rooms_far_above_target_until_near_overheat():
    """23.11.2026: Wärme soll in Räume, die sie brauchen, nicht in schon zu warme."""
    cfg = sample_config(mode="active")
    now = at(16, "18:00")
    r = run(cfg, engine.empty_state(), obs(now, wz=24.0, sz=17.0, stove=_stove(80.0)))
    radiators = _radiators(r)
    assert radiators["climate.heizung_wohnzimmer"] == 21.0  # 3 K über Ziel: kein Zusatz
    assert radiators["climate.heizung_schlafzimmer"] > 19.0  # kalter Raum bekommt Wärme
    # kurz vor dem Kesselschutz nimmt jeder Raum ab
    r = run(cfg, engine.empty_state(), obs(now, wz=24.0, sz=17.0, stove=_stove(86.0)))
    assert _radiators(r)["climate.heizung_wohnzimmer"] > 24.0


def test_dump_hysteresis_until_end_temperature():
    cfg = sample_config(mode="active")
    now = at(16, "18:00")
    r = run(cfg, engine.empty_state(), obs(now, wz=21.0, sz=19.0, stove=_stove(78.0)))
    assert r.state["dump_active"] is True
    # 63 °C: unter der Rampe, aber über dem Ende: bleibt aktiv, Zusatz 0
    r = run(cfg, r.state, obs(now + timedelta(minutes=20), wz=21.0, sz=19.0, stove=_stove(63.0)))
    assert r.status["stove"]["dump"] is True
    assert r.status["stove"]["dump_level"] == 0.0
    assert _radiators(r)["climate.heizung_wohnzimmer"] == 21.0
    r = run(cfg, r.state, obs(now + timedelta(minutes=40), wz=21.0, sz=19.0, stove=_stove(60.0)))
    assert r.status["stove"]["dump"] is False
    assert any("Wärmeabfuhr beendet" in t for t in r.log)


def test_overheat_has_priority_over_dump():
    cfg = sample_config(mode="active")
    r = run(cfg, engine.empty_state(), obs(at(16, "18:00"), wz=21.0, stove=_stove(91.0)))
    assert r.status["stove"]["overheat"] is True
    assert set(_radiators(r).values()) == {26.0}


def test_open_window_stays_frost_during_dump():
    cfg = sample_config(mode="active")
    now = at(16, "18:00")
    o = obs(now, wz=21.0, stove=_stove(80.0), open_since=now - timedelta(minutes=10))
    r = run(cfg, engine.empty_state(), o)
    assert _radiators(r)["climate.heizung_wohnzimmer"] == cfg["parameters"]["frost_c"]


def test_buffer_disables_dump():
    cfg = sample_config(mode="active")
    cfg["stove"]["has_buffer"] = True
    r = run(cfg, engine.empty_state(), obs(at(16, "18:00"), wz=21.0, stove=_stove(80.0)))
    assert r.status["stove"]["dump"] is False
    assert _radiators(r)["climate.heizung_wohnzimmer"] == 21.0


def test_no_water_sensor_no_dump():
    cfg = sample_config(mode="active")
    r = run(cfg, engine.empty_state(), obs(at(16, "18:00"), wz=21.0, stove=_stove(None)))
    assert r.status["stove"]["dump"] is False


def test_shadow_computes_dump_but_manager_does_not_switch():
    """Im Schatten wird gerechnet; geschaltet wird im Manager nur aktiv."""
    cfg = sample_config()
    r = run(cfg, engine.empty_state(), obs(at(16, "18:00"), wz=21.0, stove=_stove(80.0)))
    assert r.status["stove"]["dump"] is True
    assert ("stove_stop",) not in r.actions


# --- Lernen ---------------------------------------------------------------------


def test_ema_and_limits():
    learn = learning.empty()
    now = at(16, "18:00")
    assert learning.add_sample(learn, "afterheat_k", 10.0, now)
    assert learning.add_sample(learn, "afterheat_k", 20.0, now)
    assert learn["values"]["afterheat_k"] == 13.0  # 10 + 0,3 * 10
    assert not learning.add_sample(learn, "afterheat_k", 45.0, now)  # unplausibel
    assert not learning.add_sample(learn, "selfoff_c", 40.0, now)
    assert learn["samples"]["afterheat_k"] == 2


def test_effective_start_needs_three_samples_and_only_lowers():
    learn = learning.empty()
    now = at(16, "18:00")
    for _ in range(2):
        learning.add_sample(learn, "afterheat_k", 20.0, now)
    assert learning.effective_start(learn, 70.0, 50.0, OVERHEAT_C) == 70.0  # noch nicht
    learning.add_sample(learn, "afterheat_k", 20.0, now)
    # Zielspitze 85, minus 20 Nachwärme, minus 3 = 62
    assert learning.effective_start(learn, 70.0, 50.0, OVERHEAT_C) == 62.0
    # wenig Nachwärme würde über den eingestellten Wert heben: bleibt 70
    small = learning.empty()
    for _ in range(3):
        learning.add_sample(small, "afterheat_k", 1.0, now)
    assert learning.effective_start(small, 70.0, 50.0, OVERHEAT_C) == 70.0
    # gelernte Selbstabschaltung senkt die Zielspitze
    for _ in range(3):
        learning.add_sample(learn, "selfoff_c", 80.0, now)
    assert learning.effective_start(learn, 70.0, 50.0, OVERHEAT_C) == 55.0  # 78 - 20 - 3
    # nie unter die untere Grenze
    for _ in range(10):
        learning.add_sample(learn, "afterheat_k", 30.0, now)
    assert learning.effective_start(learn, 70.0, 50.0, OVERHEAT_C) == 50.0


def test_afterheat_measured_over_twenty_minutes():
    learn = learning.empty()
    t0 = at(16, "18:00")
    learning.observe(learn, t0, True, True, 76.5, True, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=1), False, False, 77.0, True, 50.0)
    for minute, water in ((6, 97.0), (10, 96.0), (15, 93.0)):
        learning.observe(learn, t0 + timedelta(minutes=minute), False, False, water, True, 50.0)
    assert learn["samples"]["afterheat_k"] == 0  # Fenster noch nicht voll
    log = learning.observe(learn, t0 + timedelta(minutes=21), False, False, 90.0, True, 50.0)
    assert learn["values"]["afterheat_k"] == 20.0
    assert any("Nachwärme" in t for t in log)
    # Selbstabschaltung (kein eigener Befehl, Wasser heiß, im Block) wurde gelernt
    assert learn["values"]["selfoff_c"] == 77.0


def test_afterheat_discarded_when_reignited_or_gap():
    learn = learning.empty()
    t0 = at(16, "18:00")
    learning.observe(learn, t0, True, True, 80.0, False, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=1), False, False, 80.0, False, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=8), True, True, 85.0, False, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=25), True, True, 85.0, False, 50.0)
    assert learn["samples"]["afterheat_k"] == 0
    learning.observe(learn, t0 + timedelta(minutes=26), False, False, 85.0, False, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=30), False, False, None, False, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=50), False, False, 70.0, False, 50.0)
    assert learn["samples"]["afterheat_k"] == 0


def test_own_stop_is_not_learned_as_self_off():
    learn = learning.empty()
    t0 = at(16, "18:00")
    learning.observe(learn, t0, True, True, 76.0, True, 50.0)
    learn["stop_cmd"] = t0.isoformat()
    learning.observe(learn, t0 + timedelta(minutes=1), False, False, 77.0, True, 50.0)
    assert learn["samples"]["selfoff_c"] == 0
    assert learn["watch"] is not None  # Nachwärme wird trotzdem gemessen


def test_reset_keeps_observation():
    learn = learning.empty()
    now = at(16, "18:00")
    learning.add_sample(learn, "afterheat_k", 10.0, now)
    learn["last_on"] = True
    fresh = learning.reset(learn)
    assert fresh["samples"]["afterheat_k"] == 0
    assert fresh["values"]["afterheat_k"] is None
    assert fresh["last_on"] is True


def test_engine_learns_and_status_shows_learn():
    cfg = sample_config(mode="active")
    t0 = at(16, "18:00")
    state = {**engine.empty_state(), "learn": None}  # alter Zustand ohne Lernen
    r = run(cfg, state, obs(t0, wz=21.0, stove=_stove(76.0, on=True)))
    assert r.status["learn"]["dump_start_c"] == 70.0
    assert r.status["learn"]["samples"]["afterheat_k"] == 0


def test_learning_lowers_engine_threshold_only_with_flag():
    cfg = sample_config(mode="active")
    learn = learning.empty()
    for _ in range(3):
        learning.add_sample(learn, "afterheat_k", 20.0, at(16, "10:00"))
    state = {**engine.empty_state(), "learn": learn}
    r = run(cfg, state, obs(at(16, "18:00"), wz=21.0, stove=_stove(62.0)))
    assert r.status["stove"]["dump_start_c"] == 62.0
    assert r.status["stove"]["dump"] is True
    cfg["stove"]["dump_learn"] = False
    r = run(cfg, {**engine.empty_state(), "learn": learn}, obs(at(16, "18:00"), stove=_stove(62.0)))
    assert r.status["stove"]["dump_start_c"] == 70.0
    assert r.status["stove"]["dump"] is False


# --- Modell -------------------------------------------------------------------------


def test_model_defaults_and_validation():
    cfg = model.validate(sample_config())
    assert cfg["stove"]["has_buffer"] is False
    assert cfg["stove"]["dump_learn"] is True
    assert cfg["parameters"]["dump_start_c"] == 70.0
    bad = sample_config()
    bad["parameters"]["dump_end_c"] = 72
    with pytest.raises(model.ConfigError, match="Wärmeabfuhr"):
        model.validate(bad)
    bad = sample_config()
    bad["stove"]["has_buffer"] = "ja"
    with pytest.raises(model.ConfigError):
        model.validate(bad)


def test_old_config_without_new_fields_is_valid():
    cfg = sample_config()
    cfg["stove"].pop("has_buffer", None)
    cfg["stove"].pop("dump_learn", None)
    for key in ("dump_start_c", "dump_end_c", "dump_extra_k", "dump_ramp_low_k"):
        cfg["parameters"].pop(key, None)
    out = model.validate(cfg)
    assert out["stove"]["has_buffer"] is False
    assert out["parameters"]["dump_end_c"] == 60.0


def test_sensor_at_its_limit_is_not_learned():
    """20.11.2026: über 99,5 °C meldet der Fühler 126,0 (Anschlag)."""
    learn = learning.empty()
    t0 = at(16, "08:56")
    learning.observe(learn, t0, True, True, 96.0, True, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=1), False, False, 97.0, True, 50.0)
    learning.observe(learn, t0 + timedelta(minutes=3), False, False, 126.0, True, 50.0)
    assert learn["watch"] is None
    log = learning.observe(learn, t0 + timedelta(minutes=22), False, False, 99.0, True, 50.0)
    assert not log
    assert learn["samples"]["afterheat_k"] == 0
    # Abkühlrate: ein Höchstwert am Anschlag verwirft die Messung
    learning.track_dump(learn, t0, True, 95.0)
    learning.track_dump(learn, t0 + timedelta(minutes=3), True, 126.0)
    assert learn["dump_peak"] is None
    learning.track_dump(learn, t0 + timedelta(minutes=30), False, 59.0)
    assert learn["samples"]["cool_k_min"] == 0
