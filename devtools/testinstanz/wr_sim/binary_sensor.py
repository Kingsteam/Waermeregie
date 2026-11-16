"""Terrassentür und Bewegungsmelder."""

from homeassistant.components.binary_sensor import BinarySensorDeviceClass, BinarySensorEntity

from . import DOMAIN
from .entity import SimEntity


async def async_setup_platform(hass, config, add, discovery_info=None):
    house = hass.data[DOMAIN]
    add(
        [
            SimDoor(house, "tuer", "Simulator Terrassentür"),
            SimPresence(house, "wohnzimmer", "Simulator Belegung Wohnzimmer"),
            SimPresence(house, "studio", "Simulator Belegung Studio"),
            SimError(house, "stoerung", "Simulator Ofen Störung"),
        ]
    )


class SimDoor(SimEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.DOOR

    @property
    def is_on(self):
        return self.house.door_open


class SimPresence(SimEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY

    def __init__(self, house, room, name):
        super().__init__(house, f"belegung_{room}", name)
        self.room = room

    @property
    def is_on(self):
        return self.house.presence[self.room]


class SimError(SimEntity, BinarySensorEntity):
    _attr_device_class = BinarySensorDeviceClass.PROBLEM

    @property
    def is_on(self):
        return self.house.error
