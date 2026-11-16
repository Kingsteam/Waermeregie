"""Tasten zum Auslösen von Situationen."""

from homeassistant.components.button import ButtonEntity

from . import DOMAIN
from .entity import SimEntity


def _toggle_door(h):
    h.door_open = not h.door_open


def _toggle_wz(h):
    h.presence["wohnzimmer"] = not h.presence["wohnzimmer"]


def _toggle_studio(h):
    h.presence["studio"] = not h.presence["studio"]


def _cold(h):
    h.outdoor -= 5
    for room in h.temps:
        h.temps[room] -= 1.0


def _error(h):
    h.error = not h.error


ACTIONS = {
    "stoerung": ("Simulator: Ofen-Störung an/aus", _error),
    "tuer": ("Simulator: Terrassentür auf/zu", _toggle_door),
    "wz": ("Simulator: Wohnzimmer belegt/leer", _toggle_wz),
    "studio": ("Simulator: Studio belegt/leer", _toggle_studio),
    "kalt": ("Simulator: Kälteeinbruch", _cold),
    "reset": ("Simulator: Beispieldaten", lambda h: h.reset()),
}


async def async_setup_platform(hass, config, add, discovery_info=None):
    house = hass.data[DOMAIN]
    add([SimButton(house, key, name, fn) for key, (name, fn) in ACTIONS.items()])


class SimButton(SimEntity, ButtonEntity):
    def __init__(self, house, key, name, fn):
        super().__init__(house, f"btn_{key}", name)
        self.fn = fn

    async def async_press(self):
        self.fn(self.house)
        self.house.notify()
