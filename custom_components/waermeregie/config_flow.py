"""Einrichtung über die Oberfläche. Alles Weitere im Panel „Wärmeregie“."""

from __future__ import annotations

from typing import Any

from homeassistant.config_entries import ConfigFlow, ConfigFlowResult
from homeassistant.helpers import selector
import voluptuous as vol

from .const import DOMAIN, NAME

CONF_STOVE = "stove"


class WaermeregieConfigFlow(ConfigFlow, domain=DOMAIN):
    """Einrichtungsdialog."""

    VERSION = 1

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> ConfigFlowResult:
        if user_input is not None:
            data = {CONF_STOVE: user_input.get(CONF_STOVE)} if user_input.get(CONF_STOVE) else {}
            return self.async_create_entry(title=NAME, data=data)
        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Optional(CONF_STOVE): selector.EntitySelector(
                        selector.EntitySelectorConfig(domain="climate")
                    )
                }
            ),
        )
