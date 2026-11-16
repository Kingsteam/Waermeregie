"""Simuliertes Haus für die Test-Instanz der Wärmeregie (erfundene Werte).

Ofen (climate), drei Heizkörper (climate), Raumfühler, Außenfühler,
Terrassentür, zwei Bewegungsmelder, Tasten für Störungen. Eine sehr grobe
Wärmephysik, um den Faktor `speed` beschleunigt.

configuration.yaml:
    wr_sim:
      speed: 10
"""

from __future__ import annotations

import asyncio
from dataclasses import dataclass, field

from homeassistant.const import EVENT_HOMEASSISTANT_STOP, Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.discovery import async_load_platform
from homeassistant.helpers.typing import ConfigType

DOMAIN = "wr_sim"
ROOMS = {"wohnzimmer": "Wohnzimmer", "schlafzimmer": "Schlafzimmer", "studio": "Studio"}
START = {"wohnzimmer": 19.6, "schlafzimmer": 18.4, "studio": 19.2}


@dataclass
class House:
    """Zustand des simulierten Hauses."""

    speed: float = 10.0
    outdoor: float = 4.0
    stove_on: bool = False
    stove_target: float = 21.0
    water: float = 30.0
    temps: dict[str, float] = field(default_factory=lambda: dict(START))
    setpoints: dict[str, float] = field(default_factory=lambda: dict.fromkeys(ROOMS, 20.0))
    door_open: bool = False
    power: int = 3
    chrono: bool = True
    eco: bool = True
    error: bool = False
    presence: dict[str, bool] = field(default_factory=lambda: {"wohnzimmer": True, "studio": False})
    listeners: list = field(default_factory=list)

    def notify(self) -> None:
        for cb in list(self.listeners):
            cb()

    def reset(self) -> None:
        self.temps = dict(START)
        self.water = 30.0
        self.door_open = False
        self.notify()

    def step(self, seconds: float) -> None:
        """Grobe Physik: Ofen heizt Wasser, offene Heizkörper geben Wärme ab."""
        dt = seconds * self.speed / 60  # simulierte Minuten
        if self.stove_on and not self.error:
            self.water = min(75.0, self.water + (0.6 + 0.4 * self.power) * dt)
        else:
            self.water = max(25.0, self.water - 0.6 * dt)
        for room, temp in self.temps.items():
            valve_open = self.setpoints[room] > temp + 0.2
            gain = 0.03 * dt if valve_open and self.water > 40 else 0.0
            loss = 0.004 * dt * (temp - self.outdoor) / 15
            if room == "wohnzimmer" and self.door_open:
                loss += 0.05 * dt
            self.temps[room] = round(temp + gain - loss, 2)
        self.notify()


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Simulator starten."""
    house = House(speed=float(config.get(DOMAIN, {}).get("speed", 10)))
    hass.data[DOMAIN] = house

    async def physics() -> None:
        while True:
            await asyncio.sleep(10)
            house.step(10)

    task = hass.async_create_background_task(physics(), "wr_sim_physics")
    hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STOP, lambda _e: task.cancel())
    for platform in (
        Platform.CLIMATE,
        Platform.SENSOR,
        Platform.BINARY_SENSOR,
        Platform.BUTTON,
        Platform.SELECT,
        Platform.SWITCH,
    ):
        hass.async_create_task(async_load_platform(hass, platform, DOMAIN, {}, config))
    return True
