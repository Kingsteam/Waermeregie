"""Ofen und Heizkörper."""

from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACAction,
    HVACMode,
)
from homeassistant.const import UnitOfTemperature

from . import DOMAIN, ROOMS
from .entity import SimEntity


async def async_setup_platform(hass, config, add, discovery_info=None):
    house = hass.data[DOMAIN]
    add([SimStove(house, "ofen", "Simulator Ofen")])
    add([SimRadiator(house, room, f"Simulator Heizkörper {name}") for room, name in ROOMS.items()])


class SimStove(SimEntity, ClimateEntity):
    _attr_hvac_modes = [HVACMode.HEAT, HVACMode.OFF]
    _attr_supported_features = (
        ClimateEntityFeature.TARGET_TEMPERATURE
        | ClimateEntityFeature.TURN_ON
        | ClimateEntityFeature.TURN_OFF
    )
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_min_temp = 5
    _attr_max_temp = 30

    @property
    def hvac_mode(self):
        return HVACMode.HEAT if self.house.stove_on else HVACMode.OFF

    @property
    def hvac_action(self):
        return HVACAction.HEATING if self.house.stove_on else HVACAction.OFF

    @property
    def current_temperature(self):
        return round(self.house.temps["wohnzimmer"] + 6, 1)  # Ofenfühler misst zu hoch

    @property
    def target_temperature(self):
        return self.house.stove_target

    @property
    def extra_state_attributes(self):
        return {"water_temperature": round(self.house.water, 1)}

    async def async_set_hvac_mode(self, hvac_mode):
        self.house.stove_on = hvac_mode == HVACMode.HEAT
        self.house.notify()

    async def async_turn_on(self):
        await self.async_set_hvac_mode(HVACMode.HEAT)

    async def async_turn_off(self):
        await self.async_set_hvac_mode(HVACMode.OFF)

    async def async_set_temperature(self, **kwargs):
        self.house.stove_target = kwargs["temperature"]
        self.house.notify()


class SimRadiator(SimEntity, ClimateEntity):
    _attr_hvac_modes = [HVACMode.HEAT, HVACMode.OFF]
    _attr_supported_features = ClimateEntityFeature.TARGET_TEMPERATURE
    _attr_temperature_unit = UnitOfTemperature.CELSIUS
    _attr_hvac_mode = HVACMode.HEAT
    _attr_min_temp = 5
    _attr_max_temp = 30

    def __init__(self, house, room, name):
        super().__init__(house, f"hk_{room}", name)
        self.room = room

    @property
    def current_temperature(self):
        return round(self.house.temps[self.room] + 1.5, 1)  # misst am Heizkörper

    @property
    def target_temperature(self):
        return self.house.setpoints[self.room]

    @property
    def hvac_action(self):
        heating = self.house.setpoints[self.room] > self.house.temps[self.room] + 0.2
        return HVACAction.HEATING if heating else HVACAction.IDLE

    async def async_set_temperature(self, **kwargs):
        self.house.setpoints[self.room] = kwargs["temperature"]
        self.house.notify()

    async def async_set_hvac_mode(self, hvac_mode):
        return
