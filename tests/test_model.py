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
