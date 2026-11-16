"""Raumfühler und Außenfühler."""

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity, SensorStateClass
from homeassistant.const import UnitOfTemperature

from . import DOMAIN, ROOMS
from .entity import SimEntity


async def async_setup_platform(hass, config, add, discovery_info=None):
    house = hass.data[DOMAIN]
    add([SimTemp(house, room, f"Simulator Raumtemperatur {name}") for room, name in ROOMS.items()])
    add(
        [
            SimTemp(house, None, "Simulator Außentemperatur"),
            SimWater(house, "wasser", "Simulator Ofen Wasser"),
        ]
    )


class SimTemp(SimEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_state_class = SensorStateClass.MEASUREMENT

    def __init__(self, house, room, name):
        super().__init__(house, f"temp_{room or 'aussen'}", name)
        self.room = room

    @property
    def native_value(self):
        return round(self.house.temps[self.room] if self.room else self.house.outdoor, 1)


class SimWater(SimEntity, SensorEntity):
    _attr_device_class = SensorDeviceClass.TEMPERATURE
    _attr_native_unit_of_measurement = UnitOfTemperature.CELSIUS
    _attr_state_class = SensorStateClass.MEASUREMENT

    @property
    def native_value(self):
        return round(self.house.water, 1)
