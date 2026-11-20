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


def test_error_is_not_adopted_as_manual_start():
    """Störung bei „Ein“ (Ofen leer): kein Block, kein Befehl, kein Start gezählt."""
    cfg = sample_config(mode="active")
    state = engine.empty_state()
    for minute in ("06:30", "06:31", "06:32"):
        r = run(
            cfg,
            state,
            obs(at(16, minute), wz=21.0, stove=StoveObs(available=True, on=True, error=True)),
        )
        state = r.state
        assert r.state["block_start"] is None
        assert not [a for a in r.actions if a[0].startswith("stove")]
    assert r.state["starts"] == []
    assert not any("von Hand" in t for t in r.log)


def test_recovery_after_airing_delays_start():
    cfg = sample_config()
    now = at(16, "06:30")
    o = obs(now, wz=19.0, sz=19.0)
    # Wohnzimmer 10 min gelüftet, vor 5 min geschlossen: zählt noch nicht
    o.rooms["wohnzimmer"].closed_at = now - timedelta(minutes=5)
    o.rooms["wohnzimmer"].last_open_minutes = 10
    r = run(cfg, engine.empty_state(), o)
    assert ("stove_start",) not in r.actions
    wz = next(x for x in r.status["rooms"] if x["id"] == "wohnzimmer")
    assert wz["recover_until"] == (now + timedelta(minutes=15)).isoformat()
    # Heizkörper bleibt normal (nicht Frostschutz)
    assert wz["radiator_setpoint"] == 21.0
    # nach 20 min zählt der Raum wieder
    later = now + timedelta(minutes=16)
    o2 = obs(later, wz=19.0, sz=19.0)
    o2.rooms["wohnzimmer"].closed_at = now - timedelta(minutes=5)
    o2.rooms["wohnzimmer"].last_open_minutes = 10
    r = run(cfg, engine.empty_state(), o2)
    assert ("stove_start",) in r.actions


def test_short_opening_has_no_recovery():
    cfg = sample_config()
    now = at(16, "06:30")
    o = obs(now, wz=19.0, sz=19.0)
    o.rooms["wohnzimmer"].closed_at = now - timedelta(minutes=1)
    o.rooms["wohnzimmer"].last_open_minutes = 1  # kürzer als „kurz lüften erlaubt“
    r = run(cfg, engine.empty_state(), o)
    assert ("stove_start",) in r.actions


def test_recovery_can_be_switched_off():
    params = {**sample_config()["parameters"], "opening_recovery_min": 0}
    cfg = sample_config(parameters=params)
    now = at(16, "06:30")
    o = obs(now, wz=19.0, sz=19.0)
    o.rooms["wohnzimmer"].closed_at = now - timedelta(minutes=1)
    o.rooms["wohnzimmer"].last_open_minutes = 10
    assert ("stove_start",) in run(cfg, engine.empty_state(), o).actions


# --- 0.5.0: sanfter Start, Selbstabschaltung, Aufheizen -------------------------------


def soft_config(minutes=5, **kw):
    cfg = sample_config(**kw)
    cfg["parameters"]["soft_start_min"] = minutes
    return cfg


def test_soft_start_opens_radiators_before_ignition():
    cfg = soft_config()
    now = at(16, "06:30")
    r = run(cfg, engine.empty_state(), obs(now, wz=20.0, sz=18.5))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "prepare"
    assert r.status["stove"]["start_at"] == (now + timedelta(minutes=5)).isoformat()
    # Heizkörper schon auf Block-Sollwert (Ziel + 1 K)
    assert ("radiator", "climate.heizung_wohnzimmer", 22.0) in r.actions
    r = run(cfg, r.state, obs(now + timedelta(minutes=3), wz=20.0, sz=18.5))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "prepare"
    r = run(cfg, r.state, obs(now + timedelta(minutes=5), wz=20.0, sz=18.5))
    assert ("stove_start",) in r.actions
    assert r.status["stove"]["phase"] == "block"
    assert r.status["stove"]["starts_today"] == 1
    assert r.state["prepare_since"] is None


def test_soft_start_dropped_when_no_longer_needed():
    cfg = soft_config()
    now = at(16, "06:30")
    r = run(cfg, engine.empty_state(), obs(now, wz=20.0, sz=18.5))
    r = run(cfg, r.state, obs(now + timedelta(minutes=2), wz=21.5, sz=19.5))
    assert r.status["stove"]["phase"] == "idle"
    assert r.state["prepare_since"] is None
    # Heizkörper zurück auf Ziel
    assert ("radiator", "climate.heizung_wohnzimmer", 21.0) in r.actions


def test_own_start_is_not_mistaken_for_manual_stop():
    """19.11.2026: kurz nach dem Startbefehl meldete der Ofen noch 'aus'."""
    cfg = sample_config(mode="active")
    now = at(16, "06:30")
    r = run(cfg, engine.empty_state(), obs(now, wz=20.0, stove=StoveObs(available=True)))
    assert ("stove_start",) in r.actions
    r = run(cfg, r.state, obs(now + timedelta(seconds=5), wz=20.0, stove=StoveObs(available=True)))
    assert r.state["block_start"] is not None
    assert r.state["last_stop"] is None
    assert not any("Heizblock beendet" in t for t in r.log)
    r = run(
        cfg,
        r.state,
        obs(now + timedelta(seconds=15), wz=20.0, stove=StoveObs(available=True, on=True)),
    )
    assert r.status["stove"]["starts_today"] == 1  # nicht doppelt gezählt
    # bleibt er wirklich aus, endet der Block nach der Wartezeit
    r = run(cfg, r.state, obs(now + timedelta(minutes=10), wz=20.0, stove=StoveObs(available=True)))
    assert r.state["block_start"] is None


def test_never_started_stove_ends_block_after_confirm_time():
    cfg = sample_config(mode="active")
    now = at(16, "06:30")
    r = run(cfg, engine.empty_state(), obs(now, wz=20.0, stove=StoveObs(available=True)))
    r = run(cfg, r.state, obs(now + timedelta(minutes=4), wz=20.0, stove=StoveObs(available=True)))
    assert r.state["block_start"] is None


def _burning(water=40.0, on=True):
    return StoveObs(available=True, on=on, burning=on, water_c=water)


def test_self_off_with_hot_water_keeps_block_and_waits():
    """19.11.2026: Wasser in 6 min auf 61 °C, Ofen schaltet selbst ab und zündet neu."""
    cfg = sample_config(mode="active")
    start = at(16, "18:10")
    state = {
        **engine.empty_state(),
        "block_start": start.isoformat(),
        "starts": [start.isoformat()],
    }
    r = run(cfg, state, obs(start + timedelta(minutes=13), wz=20.0, stove=_burning(61.5, False)))
    assert r.state["block_start"] is not None
    assert r.status["stove"]["self_off"] is True
    assert r.status["stove"]["phase"] == "block"
    assert "wartet" in r.status["stove"]["reason"]
    assert ("stove_stop",) not in r.actions
    r = run(cfg, r.state, obs(start + timedelta(minutes=25), wz=20.5, stove=_burning(55.0)))
    assert r.status["stove"]["self_off"] is False
    assert r.status["stove"]["starts_today"] == 1
    assert any("wieder gezündet" in t for t in r.log)


def test_self_off_gives_up_after_wait():
    cfg = sample_config(mode="active")
    start = at(16, "18:10")
    off = start + timedelta(minutes=13)
    state = {**engine.empty_state(), "block_start": start.isoformat()}
    r = run(cfg, state, obs(off, wz=20.0, stove=_burning(61.5, False)))
    r = run(cfg, r.state, obs(off + timedelta(minutes=31), wz=20.0, stove=_burning(35.0, False)))
    assert r.state["block_start"] is None
    assert r.state["last_stop"] == off.isoformat()  # Pause zählt ab dem Abschalten


def test_off_with_cold_water_ends_block_at_once():
    cfg = sample_config(mode="active")
    start = at(16, "18:10")
    state = {**engine.empty_state(), "block_start": start.isoformat()}
    r = run(cfg, state, obs(start + timedelta(minutes=30), wz=20.0, stove=_burning(35.0, False)))
    assert r.state["block_start"] is None


def test_self_off_wait_can_be_switched_off():
    cfg = sample_config(mode="active")
    cfg["parameters"]["self_off_wait_min"] = 0
    start = at(16, "18:10")
    state = {**engine.empty_state(), "block_start": start.isoformat()}
    r = run(cfg, state, obs(start + timedelta(minutes=13), wz=20.0, stove=_burning(61.5, False)))
    assert r.state["block_start"] is None


def _warmup(now, minutes=90, start_offset=0):
    return {
        "start_at": (now + timedelta(minutes=start_offset)).isoformat(),
        "until": (now + timedelta(minutes=start_offset + minutes)).isoformat(),
        "arrive": None,
        "started": False,
    }


def test_warmup_starts_even_when_warm_and_away():
    cfg = sample_config()
    now = at(16, "12:00")  # Bürotag: Abwesend (Ofen nur Frostschutz)
    state = {**engine.empty_state(), "warmup": _warmup(now)}
    r = run(cfg, state, obs(now, wz=21.5, sz=19.5, occupied=False))
    assert ("stove_start",) in r.actions
    assert r.status["warmup"]["active"] is True
    assert "Aufheizen" in r.status["stove"]["reason"]
    wz = next(x for x in r.status["rooms"] if x["id"] == "wohnzimmer")
    assert wz["target"] == 22.0  # Komfort 21 + 1 K
    # nach der Mindestbrenndauer warm genug: aus, und kein zweiter Start im Aufheizen
    r = run(cfg, r.state, obs(now + timedelta(minutes=91), wz=22.5, sz=20.5))
    assert ("stove_stop",) in r.actions
    r = run(cfg, r.state, obs(now + timedelta(minutes=85 + 70), wz=22.5, sz=20.5))
    assert ("stove_start",) not in r.actions


def test_warmup_ends_and_returns_to_schedule():
    cfg = sample_config()
    now = at(16, "12:00")
    state = {**engine.empty_state(), "warmup": _warmup(now, minutes=30)}
    r = run(cfg, state, obs(now + timedelta(minutes=31), wz=21.5, sz=19.5))
    assert r.state["warmup"] is None
    assert r.status["warmup"] is None
    assert any("Aufheizen beendet" in t for t in r.log)


def test_warmup_for_arrival_waits_for_start_time():
    cfg = sample_config()
    now = at(16, "16:00")
    state = {**engine.empty_state(), "warmup": _warmup(now, minutes=120, start_offset=30)}
    r = run(cfg, state, obs(now, wz=21.5, sz=19.5))
    assert ("stove_start",) not in r.actions
    assert r.status["warmup"]["active"] is False
    r = run(cfg, r.state, obs(now + timedelta(minutes=30), wz=21.5, sz=19.5))
    assert ("stove_start",) in r.actions


def test_warmup_respects_pause_and_open_door():
    cfg = sample_config()
    now = at(16, "12:00")
    state = {
        **engine.empty_state(),
        "warmup": _warmup(now),
        "last_stop": (now - timedelta(minutes=20)).isoformat(),
    }
    r = run(cfg, state, obs(now, wz=21.5, sz=19.5))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "pause"


def test_house_average_temperature_and_target():
    cfg = sample_config()
    r = run(cfg, engine.empty_state(), obs(at(16, "06:30"), wz=20.0, sz=18.0))
    # Wichtigkeit 3 und 1: (3*20 + 18) / 4
    assert r.status["house"]["temperature_c"] == 19.5
    assert r.status["house"]["target_c"] == 20.5


# --- Selbstzündung ohne Bedarf (20.11.2026) ---------------------------------------


def test_reignition_without_demand_is_switched_off_not_adopted():
    """Block endet (Ziel erreicht), Hydro-Ofen zündet nach dem Abkühlen selbst wieder."""
    cfg = sample_config(mode="active")
    stop = at(16, "08:32")
    state = {**engine.empty_state(), "last_stop": stop.isoformat()}
    later = stop + timedelta(minutes=16)
    r = run(cfg, state, obs(later, wz=24.5, sz=23.5, stove=_burning(75.0)))
    assert r.state["block_start"] is None
    assert ("stove_stop",) in r.actions
    assert r.status["stove"]["starts_today"] == 0
    assert any("selbst gezündet" in t for t in r.log)
    assert not any("von Hand" in t for t in r.log)
    # eine Minute später brennt er noch: kein neuer Befehl, kein neuer Eintrag
    r = run(cfg, r.state, obs(later + timedelta(minutes=1), wz=24.5, sz=23.5, stove=_burning(75.0)))
    assert ("stove_stop",) not in r.actions
    assert not r.log
    # nach 5 min noch immer an: Befehl wiederholen
    r = run(cfg, r.state, obs(later + timedelta(minutes=6), wz=24.5, sz=23.5, stove=_burning(75.0)))
    assert ("stove_stop",) in r.actions
    # aus: Merker zurück
    r = run(
        cfg, r.state, obs(later + timedelta(minutes=8), wz=24.5, sz=23.5, stove=_burning(on=False))
    )
    assert r.state["reignite_stop"] is None


def test_ignition_during_manual_pause_is_switched_off():
    cfg = sample_config(mode="active")
    now = at(16, "11:00")
    state = {**engine.empty_state(), "pause_until": (now + timedelta(hours=3)).isoformat()}
    r = run(cfg, state, obs(now, wz=24.0, stove=_burning(70.0)))
    assert r.state["block_start"] is None
    assert ("stove_stop",) in r.actions
    assert r.state["starts"] == []


def test_manual_start_long_after_stop_is_still_adopted():
    cfg = sample_config(mode="active")
    stop = at(16, "08:00")
    state = {**engine.empty_state(), "last_stop": stop.isoformat()}
    r = run(cfg, state, obs(stop + timedelta(hours=4), wz=21.0, stove=_burning()))
    assert r.state["block_start"] is not None
    assert any("von Hand" in t for t in r.log)


def test_ignition_with_demand_shortly_after_stop_is_adopted():
    cfg = sample_config(mode="active")
    stop = at(16, "17:00")
    state = {**engine.empty_state(), "last_stop": stop.isoformat()}
    r = run(cfg, state, obs(stop + timedelta(minutes=40), wz=19.0, sz=17.5, stove=_burning()))
    assert r.state["block_start"] is not None


# --- Kesselschutz (20.11.2026: 92,5 °C bei zugedrehten Heizkörpern) -------------


def test_overheat_stops_block_and_opens_radiators():
    cfg = sample_config(mode="active")
    start = at(16, "07:00")
    state = {
        **engine.empty_state(),
        "block_start": start.isoformat(),
        "starts": [start.isoformat()],
    }
    r = run(cfg, state, obs(start + timedelta(minutes=10), wz=22.0, stove=_burning(91.0)))
    assert ("stove_stop",) in r.actions
    assert r.state["block_start"] is None
    assert r.status["stove"]["overheat"] is True
    assert "Kesselschutz" in r.status["stove"]["reason"]
    radiators = [a for a in r.actions if a[0] == "radiator"]
    assert radiators and all(a[2] == 26.0 for a in radiators)
    assert any("Kesselschutz" in t for t in r.log)


def test_overheat_blocks_start_until_cool_then_releases():
    cfg = sample_config(mode="active")
    now = at(16, "07:00")
    state = {**engine.empty_state(), "overheat_since": now.isoformat()}
    cold = dict(wz=18.0, sz=16.5)
    r = run(cfg, state, obs(now + timedelta(minutes=20), stove=_burning(80.0, False), **cold))
    assert ("stove_start",) not in r.actions
    assert r.status["stove"]["phase"] == "blocked"
    assert r.status["stove"]["overheat"] is True
    r = run(cfg, r.state, obs(now + timedelta(minutes=40), stove=_burning(74.0, False), **cold))
    assert r.status["stove"]["overheat"] is False
    assert any("Kesselschutz beendet" in t for t in r.log)
    assert ("stove_start",) in r.actions


def test_overheat_switches_off_self_ignition_and_is_not_adopted():
    cfg = sample_config(mode="active")
    now = at(16, "08:48")
    state = {**engine.empty_state(), "overheat_since": (now - timedelta(minutes=30)).isoformat()}
    r = run(cfg, state, obs(now, wz=24.0, stove=_burning(82.0)))
    assert ("stove_stop",) in r.actions
    assert r.state["block_start"] is None
    assert r.state["starts"] == []
    r = run(cfg, r.state, obs(now + timedelta(minutes=1), wz=24.0, stove=_burning(82.0)))
    assert ("stove_stop",) not in r.actions  # nicht jede Minute


def test_overheat_ends_when_water_sensor_gone_for_two_hours():
    cfg = sample_config(mode="active")
    now = at(16, "07:00")
    state = {**engine.empty_state(), "overheat_since": now.isoformat()}
    r = run(cfg, state, obs(now + timedelta(minutes=60), stove=_burning(None, False)))
    assert r.status["stove"]["overheat"] is True
    r = run(cfg, r.state, obs(now + timedelta(minutes=121), stove=_burning(None, False)))
    assert r.status["stove"]["overheat"] is False


def test_shadow_overheat_does_not_switch_stove():
    cfg = sample_config()
    now = at(16, "07:00")
    r = run(cfg, engine.empty_state(), obs(now, wz=24.0, stove=_burning(93.0)))
    assert r.status["stove"]["overheat"] is True
    assert ("stove_stop",) not in r.actions
