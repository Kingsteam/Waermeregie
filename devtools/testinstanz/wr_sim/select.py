"""Leistungsstufe des simulierten Ofens."""

from homeassistant.components.select import SelectEntity

from . import DOMAIN
from .entity import SimEntity

OPTIONS = [f"Stufe {i}" for i in range(1, 6)]


async def async_setup_platform(hass, config, add, discovery_info=None):
    add([SimPower(hass.data[DOMAIN], "leistung", "Simulator Ofen Leistung")])


class SimPower(SimEntity, SelectEntity):
    _attr_options = OPTIONS

    @property
    def current_option(self):
        return OPTIONS[self.house.power - 1]

    async def async_select_option(self, option):
        self.house.power = OPTIONS.index(option) + 1
        self.house.notify()
