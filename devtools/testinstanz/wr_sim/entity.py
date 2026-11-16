"""Basis: aktualisiert sich bei jeder Änderung im Haus."""

from homeassistant.helpers.entity import Entity


class SimEntity(Entity):
    _attr_should_poll = False

    def __init__(self, house, uid: str, name: str) -> None:
        self.house = house
        self._attr_unique_id = f"wr_sim_{uid}"
        self._attr_name = name

    async def async_added_to_hass(self) -> None:
        self.house.listeners.append(self.async_write_ha_state)
        self.async_on_remove(lambda: self.house.listeners.remove(self.async_write_ha_state))
