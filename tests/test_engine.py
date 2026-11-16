"""Tests der Regel-Logik (ohne Home Assistant)."""

from datetime import timedelta

from custom_components.waermeregie import engine
from custom_components.waermeregie.engine import Observation, RoomObs, StoveObs

from .conftest import at, sample_config


def obs(now, wz=20.0, sz=18.5, **kw) -> Observation:
    rooms = {
        "wohnzimmer": RoomObs(temperature=wz, occupied=kw.pop("occupied", True)),
        "schlafzimmer": RoomObs(temperature=sz),
    }
    if "open_since" in kw:
        rooms["wohnzimmer"].open_since = kw.pop("open_since")
        rooms["wohnzimmer"].open_name = "Terrassentür"
        rooms["wohnzimmer"].open_entity = "binary_sensor.terrassentuer"
    if "empty_since" in kw:
        rooms["wohnzimmer"].occupied = False
        rooms["wohnzimmer"].empty_since = kw.pop("empty_since")
    stove = kw.pop("stove", StoveObs(available=True))
    return Observation(now=now, rooms=rooms, stove=stove, **kw)


def run(cfg, state, o):
    return engine.evaluate(cfg, state, o)


# --- Tagesart und Szene ----------------------------------------------------------


def test_scene_from_schedule_and_midnight_wrap():
    cfg = sample_config()
    # Montag 16.11.: Bürotag
    assert engine.scene_at(cfg, at(16, "06:30"), None) == ("komfort", "07:45")
    assert engine.scene_at(cfg, at(16, "12:00"), None) == ("abwesend", "17:00")
    # 02:00 Montag: vor dem ersten Abschnitt gilt der letzte vom Sonntag (Wochenende: nacht)
    assert engine.scene_at(cfg, at(16, "02:00"), None)[0] == "nacht"
    # nach dem letzten Abschnitt: nächster Wechsel ist der erste von morgen (Di Bürotag 06:00)
    assert engine.scene_at(cfg, at(16, "23:00"), None) == ("nacht", "06:00")


def test_holiday_uses_holiday_day_type():
    cfg = sample_config()
    dt, reason = engine.day_type_for(cfg, at(16, "09:00"), workday=False)
    assert dt["id"] == "wochenende"
    assert "Feiertag" in reason
    dt, _ = engine.day_type_for(cfg, at(18, "09:00"), workday=True)  # Mittwoch
    assert dt["id"] == "homeoffice"


# --- Heizblöcke ---------------------------------------------------------------


def test_block_starts_when_cold_enough():
    cfg = sample_config()
    r = run(cfg, engine.empty_state(), obs(at(16, "06:30"), wz=20.0, sz=18.5))
    # Wohnzimmer 1 K, Schlafzimmer 0,5 K unter Ziel, gewichtet 0,875 K
    assert ("stove_start",) in r.actions
    assert r.status["stove"]["phase"] == "block"
    assert r.status["stove"]["starts_today"] == 1


def test_no_start_when_almost_warm():
    cfg = sample_config()
    r = run(cfg, engine.empty_state(), obs(at(16, "06:30"), wz=20.8, sz=18.9))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "idle"


def test_min_burn_then_stop_then_pause():
    cfg = sample_config()
    start = at(16, "17:00")  # Komfort bis 22:30
    r = run(cfg, engine.empty_state(), obs(start, wz=19.5, sz=18.0))
    assert ("stove_start",) in r.actions
    state = r.state
    # nach 30 min ist es warm, aber Mindestbrenndauer 90 min -> weiter
    r = run(cfg, state, obs(start + timedelta(minutes=30), wz=22.0, sz=20.0))
    assert ("stove_stop",) not in r.actions
    assert r.status["stove"]["phase"] == "block"
    # nach 90 min: Ziel erreicht -> aus
    r = run(cfg, r.state, obs(start + timedelta(minutes=91), wz=22.0, sz=20.0))
    assert ("stove_stop",) in r.actions
    assert r.status["stove"]["phase"] == "pause"
    # 30 min später wieder kalt: Pause (60 min) verhindert Neustart
    r2 = run(cfg, r.state, obs(start + timedelta(minutes=121), wz=19.0, sz=17.0))
    assert ("stove_start",) not in r2.actions
    assert r2.status["stove"]["phase"] == "pause"
    # nach der Pause darf er wieder
    r3 = run(cfg, r2.state, obs(start + timedelta(minutes=155), wz=19.0, sz=17.0))
    assert ("stove_start",) in r3.actions


def test_max_burn_stops_even_if_cold():
    cfg = sample_config()
    state = {**engine.empty_state(), "block_start": at(16, "06:00").isoformat()}
    r = run(cfg, state, obs(at(16, "11:01"), wz=18.0, sz=17.0))
    assert ("stove_stop",) in r.actions


def test_max_starts_per_day():
    cfg = sample_config()
    now = at(16, "18:00")
    state = {
        **engine.empty_state(),
        "starts": [(now - timedelta(hours=h)).isoformat() for h in (2, 5, 8, 11)],
    }
    r = run(cfg, state, obs(now, wz=19.0, sz=17.5))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "blocked"
    assert "Starts" in r.status["stove"]["reason"]


def test_frost_overrides_max_starts_but_not_pause():
    cfg = sample_config()
    now = at(16, "18:00")
    state = {
        **engine.empty_state(),
        "starts": [(now - timedelta(hours=h)).isoformat() for h in (2, 5, 8, 11)],
    }
    r = run(cfg, state, obs(now, wz=11.0, sz=17.0))
    assert ("stove_start",) in r.actions
    state = {
        **engine.empty_state(),
        "last_stop": (now - timedelta(minutes=10)).isoformat(),
    }
    r = run(cfg, state, obs(now, wz=11.0, sz=17.0))
    assert ("stove_start",) not in r.actions


def test_frost_only_scene():
    cfg = sample_config()
    # 12:00 Montag = abwesend (nur Frostschutz, Untergrenze 16 °C)
    r = run(cfg, engine.empty_state(), obs(at(16, "12:00"), wz=17.0, sz=16.5))
    assert ("stove_start",) not in r.actions
    r = run(cfg, engine.empty_state(), obs(at(16, "12:00"), wz=15.5, sz=16.5))
    assert ("stove_start",) in r.actions


def test_deny_scene_stops_running_block():
    cfg = sample_config()
    cfg["scenes"][0]["stove"] = "deny"  # komfort
    state = {**engine.empty_state(), "block_start": at(16, "06:00").isoformat()}
    r = run(cfg, state, obs(at(16, "06:20"), wz=19.0))
    assert ("stove_stop",) in r.actions


def test_manual_pause_blocks_start():
    cfg = sample_config()
    now = at(16, "06:30")
    state = {
        **engine.empty_state(),
        "pause_until": (now + timedelta(hours=2)).isoformat(),
    }
    r = run(cfg, state, obs(now, wz=19.0, sz=18.0))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "blocked"


# --- Öffnungen und Anwesenheit ---------------------------------------------------


def test_short_opening_is_ignored():
    cfg = sample_config()
    now = at(16, "06:30")
    r = run(
        cfg,
        engine.empty_state(),
        obs(now, wz=20.0, open_since=now - timedelta(minutes=1)),
    )
    room = r.status["rooms"][0]
    assert room["open"] is False
    assert r.status["alerts"] == []


def test_opening_closes_radiator_then_blocks_stove():
    cfg = sample_config()
    now = at(16, "06:30")
    r = run(
        cfg,
        engine.empty_state(),
        obs(now, wz=19.5, sz=18.0, open_since=now - timedelta(minutes=5)),
    )
    room = r.status["rooms"][0]
    assert room["open"] is True
    assert room["radiator_setpoint"] == cfg["parameters"]["frost_c"]
    assert ("radiator", "climate.heizung_wohnzimmer", 12.0) in r.actions
    r = run(
        cfg,
        engine.empty_state(),
        obs(now, wz=19.5, sz=17.0, open_since=now - timedelta(minutes=12)),
    )
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "blocked"
    assert r.status["alerts"][0]["minutes"] == 12
    assert "Terrassentür" in r.status["alerts"][0]["message"]


def test_opening_in_empty_room_alerts_early():
    """Niemand im Raum, Tür geht auf (z. B. der Hund): nach 1 Minute Hinweis."""
    cfg = sample_config()
    now = at(18, "10:00")
    o = obs(
        now,
        wz=19.5,
        open_since=now - timedelta(minutes=1),
        empty_since=now - timedelta(minutes=20),
    )
    r = run(cfg, engine.empty_state(), o)
    assert r.status["alerts"], "Hinweis erwartet"
    assert r.status["rooms"][0]["open"] is True


def test_empty_room_is_set_back():
    cfg = sample_config()
    now = at(16, "06:30")
    r = run(cfg, engine.empty_state(), obs(now, empty_since=now - timedelta(minutes=60)))
    assert r.status["rooms"][0]["target"] == 19.5  # 21 - 1,5


def test_radiators_open_during_block_and_only_on_change():
    cfg = sample_config()
    now = at(16, "06:30")
    r = run(cfg, engine.empty_state(), obs(now, wz=19.5, sz=18.0))
    assert ("radiator", "climate.heizung_wohnzimmer", 22.0) in r.actions  # 21 + 1
    r2 = run(cfg, r.state, obs(now + timedelta(minutes=1), wz=19.6, sz=18.0))
    assert not [a for a in r2.actions if a[0] == "radiator"]


# --- Betriebsarten und Übersteuerungen ------------------------------------------


def test_shadow_ignores_real_stove_state():
    cfg = sample_config()
    state = {**engine.empty_state(), "block_start": at(16, "06:00").isoformat()}
    r = run(
        cfg,
        state,
        obs(at(16, "06:20"), wz=19.0, stove=StoveObs(available=True, on=False)),
    )
    assert r.status["stove"]["phase"] == "block"


def test_active_adopts_manual_start_and_notices_stop():
    cfg = sample_config(mode="active")
    r = run(
        cfg,
        engine.empty_state(),
        obs(at(16, "06:30"), wz=21.0, stove=StoveObs(available=True, on=True)),
    )
    assert r.state["block_start"] is not None
    assert any("von Hand" in t for t in r.log)
    r = run(
        cfg,
        r.state,
        obs(at(16, "06:40"), wz=21.0, stove=StoveObs(available=True, on=False)),
    )
    assert r.state["block_start"] is None
    assert r.state["last_stop"] is not None


def test_active_needs_reachable_stove():
    cfg = sample_config(mode="active")
    r = run(
        cfg,
        engine.empty_state(),
        obs(at(16, "06:30"), wz=19.0, stove=StoveObs(available=False)),
    )
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["reason"].endswith("Ofen nicht erreichbar")


def test_override_and_expiry():
    cfg = sample_config()
    now = at(16, "12:00")
    state = {
        **engine.empty_state(),
        "override": {
            "scene": "komfort",
            "until": (now + timedelta(hours=1)).isoformat(),
        },
    }
    r = run(cfg, state, obs(now))
    assert r.status["scene"]["id"] == "komfort"
    assert r.status["scene"]["source"] == "override"
    r = run(cfg, r.state, obs(now + timedelta(hours=2)))
    assert r.status["scene"]["id"] == "abwesend"
    assert r.state["override"] is None


def test_boost_raises_targets():
    cfg = sample_config()
    now = at(16, "06:30")
    state = {
        **engine.empty_state(),
        "boost": {"delta": 1.0, "until": (now + timedelta(hours=1)).isoformat()},
    }
    r = run(cfg, state, obs(now))
    assert r.status["rooms"][0]["target"] == 22.0


def test_missing_temperatures_no_start():
    cfg = sample_config()
    o = Observation(now=at(16, "06:30"), rooms={}, stove=StoveObs(available=True))
    r = run(cfg, engine.empty_state(), o)
    assert ("stove_start",) not in r.actions
    assert r.status["house"]["deficit_k"] is None


# --- Ofen-Funktionen ---------------------------------------------------------------


def test_power_level_follows_demand_and_cold():
    cfg = sample_config()
    now = at(16, "17:00")
    stove = StoveObs(available=True, has_power=True)
    # knapp über Startschwelle -> kleine Stufe
    r = run(cfg, engine.empty_state(), obs(now, wz=20.4, sz=18.4, stove=stove))
    assert ("stove_power", 1) in r.actions
    # nächste Auswertung gleicher Bedarf: kein neuer Befehl
    r2 = run(cfg, r.state, obs(now + timedelta(minutes=1), wz=20.4, sz=18.4, stove=stove))
    assert not [a for a in r2.actions if a[0] == "stove_power"]
    # großer Bedarf -> höchste Stufe (3)
    r3 = run(cfg, engine.empty_state(), obs(now, wz=18.5, sz=17.0, stove=stove))
    assert ("stove_power", 3) in r3.actions
    # Frost draußen -> höchste Stufe auch bei kleinem Bedarf
    r4 = run(cfg, engine.empty_state(), obs(now, wz=20.4, sz=18.4, stove=stove, outdoor_c=-5))
    assert ("stove_power", 3) in r4.actions
    assert r4.status["stove"]["power_level"] == 3


def test_power_lowest_when_door_long_open():
    cfg = sample_config()
    now = at(16, "17:30")
    state = {**engine.empty_state(), "block_start": (now - timedelta(minutes=20)).isoformat()}
    stove = StoveObs(available=True, has_power=True)
    r = run(
        cfg, state, obs(now, wz=18.0, sz=17.0, stove=stove, open_since=now - timedelta(minutes=15))
    )
    assert ("stove_power", 1) in r.actions


def test_no_power_without_entity_or_outside_block():
    cfg = sample_config()
    r = run(cfg, engine.empty_state(), obs(at(16, "17:00"), wz=19.0, sz=18.0))
    assert not [a for a in r.actions if a[0] == "stove_power"]
    r = run(
        cfg,
        engine.empty_state(),
        obs(at(16, "17:00"), wz=22.0, stove=StoveObs(available=True, has_power=True)),
    )
    assert r.status["stove"]["power_level"] is None


def test_stove_error_blocks_and_stops():
    cfg = sample_config()
    now = at(16, "17:00")
    err = StoveObs(available=True, error=True)
    r = run(cfg, engine.empty_state(), obs(now, wz=19.0, sz=17.0, stove=err))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["error"] is True
    assert "Störung" in r.status["stove"]["reason"]
    state = {**engine.empty_state(), "block_start": (now - timedelta(minutes=10)).isoformat()}
    r = run(cfg, state, obs(now, wz=19.0, sz=17.0, stove=err))
    assert ("stove_stop",) in r.actions


def test_chrono_and_eco_are_switched_off():
    cfg = sample_config()
    o = obs(at(16, "17:00"), wz=22.0, stove=StoveObs(available=True, eco_on=True), chrono_on=True)
    r = run(cfg, engine.empty_state(), o)
    assert ("chrono_off",) in r.actions
    assert ("eco_off",) in r.actions
    assert r.status["stove"]["chrono_warning"] and r.status["stove"]["eco_warning"]
