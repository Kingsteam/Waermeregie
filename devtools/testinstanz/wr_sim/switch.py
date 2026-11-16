"""Chrono und Eco des simulierten Ofens."""

from homeassistant.components.switch import SwitchEntity

from . import DOMAIN
from .entity import SimEntity


async def async_setup_platform(hass, config, add, discovery_info=None):
    house = hass.data[DOMAIN]
    add(
        [
            SimFlag(house, "chrono", "Simulator Ofen Chrono"),
            SimFlag(house, "eco", "Simulator Ofen Eco"),
        ]
    )


class SimFlag(SimEntity, SwitchEntity):
    def __init__(self, house, key, name):
        super().__init__(house, key, name)
        self.key = key

    @property
    def is_on(self):
        return getattr(self.house, self.key)

    async def async_turn_on(self, **kwargs):
        setattr(self.house, self.key, True)
        self.house.notify()

    async def async_turn_off(self, **kwargs):
        setattr(self.house, self.key, False)
        self.house.notify()
