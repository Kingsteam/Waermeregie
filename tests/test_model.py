"""Prüfung der Einstellungen."""

import pytest

from custom_components.waermeregie import model

from .conftest import sample_config


def test_default_config_is_valid():
    assert model.validate(model.default_config())["mode"] == "shadow"


def test_sample_is_valid_and_rounds_targets():
    cfg = sample_config()
    cfg["rooms"][0]["targets"]["komfort"] = 21.26
    assert model.validate(cfg)["rooms"][0]["targets"]["komfort"] == 21.5


@pytest.mark.parametrize(
    "mutate",
    [
        lambda c: c["rooms"].append(dict(c["rooms"][0])),  # Raum-ID doppelt
        lambda c: c["day_types"][0]["slots"].reverse(),  # Uhrzeiten nicht aufsteigend
        lambda c: c["day_types"][0]["slots"].append({"start": "25:00", "scene": "komfort"}),
        lambda c: c["day_types"][0]["slots"].append({"start": "23:59", "scene": "gibtsnicht"}),
        lambda c: c["rooms"][0]["radiators"].append("climate.pelletofen"),  # Ofen als Heizkörper
        lambda c: c["rooms"][0]["radiators"].append("sensor.falsch"),
        lambda c: c.__setitem__("week", {**c["week"], "mon": "gibtsnicht"}),
        lambda c: c.__setitem__("notify", ["light.x"]),
        lambda c: c["rooms"][0].__setitem__("importance", 5),
        lambda c: c["scenes"].clear(),
    ],
)
def test_invalid_configs(mutate):
    cfg = sample_config()
    mutate(cfg)
    with pytest.raises(model.ConfigError):
        model.validate(cfg)


def test_active_needs_stove():
    cfg = sample_config()
    cfg["stove"]["climate"] = None
    cfg["mode"] = "active"
    with pytest.raises(model.ConfigError):
        model.validate(cfg)


def test_targets_of_deleted_scene_are_dropped():
    cfg = sample_config()
    cfg["rooms"][0]["targets"]["alt"] = 20
    assert "alt" not in model.validate(cfg)["rooms"][0]["targets"]


def test_paused_entities_are_kept_but_only_if_in_room():
    from custom_components.waermeregie.manager import effective_config

    cfg = sample_config()
    cfg["rooms"][0]["openings"] = ["binary_sensor.terrassentuer", "binary_sensor.alarm_tuer"]
    cfg["rooms"][0]["paused"] = ["binary_sensor.alarm_tuer", "binary_sensor.fremd"]
    out = model.validate(cfg)
    room = out["rooms"][0]
    assert room["paused"] == ["binary_sensor.alarm_tuer"]  # fremde fallen weg
    assert room["openings"] == ["binary_sensor.terrassentuer", "binary_sensor.alarm_tuer"]
    eff = effective_config(out)
    assert eff["rooms"][0]["openings"] == ["binary_sensor.terrassentuer"]
    assert out["rooms"][0]["openings"] == [
        "binary_sensor.terrassentuer",
        "binary_sensor.alarm_tuer",
    ]
    # Fühler pausieren
    out["rooms"][0]["paused"] = ["sensor.temp_wohnzimmer", "climate.heizung_wohnzimmer"]
    eff = effective_config(model.validate(out))
    assert eff["rooms"][0]["temperature_sensors"] == []
    assert eff["rooms"][0]["radiators"] == []
    assert model.validate(sample_config())["rooms"][0]["paused"] == []


def test_old_config_without_notifications_gets_defaults():
    cfg = sample_config()
    del cfg["notifications"]
    for room in cfg["rooms"]:
        for key in ("humidity_sensors", "ventilate_humidity", "ventilate_rise"):
            room.pop(key, None)
    out = model.validate(cfg)
    assert out["notifications"]["opening_delay_min"] == 10
    assert out["notifications"]["quiet_start"] == "22:00"
    assert out["rooms"][0]["humidity_sensors"] == []
    assert out["rooms"][0]["ventilate_humidity"] == 65.0
    assert out["rooms"][0]["ventilate_rise"] == 6.0


def test_notifications_partial_and_humidity_room():
    cfg = sample_config()
    cfg["notifications"] = {"pellets": False, "repeat_min": 120, "quiet_start": "", "quiet_end": ""}
    cfg["rooms"][0]["humidity_sensors"] = ["sensor.feuchte_bad", "climate.heizung_wohnzimmer"]
    cfg["rooms"][0]["ventilate_rise"] = 4
    cfg["rooms"][0]["paused"] = ["sensor.feuchte_bad"]
    out = model.validate(cfg)
    assert out["notifications"]["pellets"] is False
    assert out["notifications"]["opening"] is True
    assert out["notifications"]["repeat_min"] == 120
    assert out["rooms"][0]["ventilate_rise"] == 4.0
    assert out["rooms"][0]["paused"] == ["sensor.feuchte_bad"]


@pytest.mark.parametrize(
    "notifications",
    [
        {"opening": "ja"},
        {"opening_delay_min": 500},
        {"repeat_min": -1},
        {"ventilate_max_min": 1},
        {"quiet_start": "25:00"},
        {"quiet_start": "22:00", "quiet_end": ""},
        {"quiet_start": "22:00", "quiet_end": "22:00"},
        "aus",
    ],
)
def test_invalid_notifications(notifications):
    cfg = sample_config()
    cfg["notifications"] = notifications
    with pytest.raises(model.ConfigError):
        model.validate(cfg)


@pytest.mark.parametrize(
    ("key", "value"),
    [
        ("humidity_sensors", ["binary_sensor.fenster"]),
        ("ventilate_humidity", 120),
        ("ventilate_rise", 40),
        ("ventilate_rise", "6"),
    ],
)
def test_invalid_humidity_room(key, value):
    cfg = sample_config()
    cfg["rooms"][0][key] = value
    with pytest.raises(model.ConfigError):
        model.validate(cfg)
