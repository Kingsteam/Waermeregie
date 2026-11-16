"""Sicherheitsgrenzen. Diese Tests nie abschwächen, überspringen oder löschen."""

import pytest

from custom_components.waermeregie import const as C, model

from .conftest import sample_config


def test_hard_limits():
    """Kein Takten erlaubt: Mindestpause und Mindestbrenndauer >= 30 min, höchstens 8 Starts."""
    assert C.PARAMETER_LIMITS["min_pause_min"][0] >= 30
    assert C.PARAMETER_LIMITS["min_burn_min"][0] >= 30
    assert C.PARAMETER_LIMITS["max_starts_per_day"][1] <= 8
    assert C.PARAMETER_LIMITS["stove_block_setpoint_c"][1] <= 30
    assert C.ROOM_TARGET_LIMITS == (5.0, 28.0)
    assert C.MAX_BOOST_K <= 3.0


def test_defaults_inside_limits():
    for key, value in C.DEFAULT_PARAMETERS.items():
        lo, hi = C.PARAMETER_LIMITS[key]
        assert lo <= value <= hi, key


@pytest.mark.parametrize(
    ("key", "value"),
    [
        ("min_pause_min", 10),
        ("min_burn_min", 5),
        ("max_starts_per_day", 20),
        ("stove_block_setpoint_c", 35),
    ],
)
def test_out_of_range_rejected(key, value):
    cfg = sample_config()
    cfg["parameters"][key] = value
    with pytest.raises(model.ConfigError):
        model.validate(cfg)


def test_room_target_limits():
    cfg = sample_config()
    cfg["rooms"][0]["targets"]["komfort"] = 30
    with pytest.raises(model.ConfigError):
        model.validate(cfg)


def test_default_mode_is_shadow():
    """Ab Werk wird nichts geschaltet."""
    assert model.default_config()["mode"] == C.MODE_SHADOW
