"""WebSocket-Befehle für Panel und Karte (Vertrag: docs/API.md)."""

from __future__ import annotations

from typing import Any

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
import voluptuous as vol

from . import model
from .const import DOMAIN, MODE_ACTIVE, MODE_SHADOW
from .manager import WaermeregieManager


def _manager(hass: HomeAssistant) -> WaermeregieManager | None:
    return hass.data.get(DOMAIN)


@callback
def async_register(hass: HomeAssistant) -> None:
    """Befehle einmalig registrieren."""
    for handler in (
        ws_config,
        ws_config_save,
        ws_status,
        ws_subscribe,
        ws_override,
        ws_pause,
        ws_boost,
        ws_mode,
    ):
        websocket_api.async_register_command(hass, handler)


def _not_loaded(connection: websocket_api.ActiveConnection, msg: dict) -> None:
    connection.send_error(msg["id"], "not_loaded", "Wärmeregie ist nicht eingerichtet")


async def _run(connection, msg, coro) -> None:
    try:
        result = await coro
    except model.ConfigError as err:
        connection.send_error(msg["id"], "invalid_config", str(err))
        return
    connection.send_result(msg["id"], result)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/config"})
@callback
def ws_config(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)
    connection.send_result(
        msg["id"],
        {
            "config": mgr.config,
            "defaults": {"config": model.default_config(), "limits": model.limits()},
        },
    )


@websocket_api.require_admin
@websocket_api.websocket_command(
    {vol.Required("type"): f"{DOMAIN}/config/save", vol.Required("config"): dict}
)
@websocket_api.async_response
async def ws_config_save(hass: HomeAssistant, connection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)

    async def save() -> dict[str, Any]:
        return {"config": await mgr.async_save_config(msg["config"])}

    await _run(connection, msg, save())


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/status"})
@callback
def ws_status(hass: HomeAssistant, connection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)
    connection.send_result(msg["id"], mgr.status)


@websocket_api.websocket_command({vol.Required("type"): f"{DOMAIN}/subscribe"})
@callback
def ws_subscribe(hass: HomeAssistant, connection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)

    @callback
    def forward(status: dict) -> None:
        connection.send_message(websocket_api.event_message(msg["id"], status))

    connection.subscriptions[msg["id"]] = mgr.subscribe(forward)
    connection.send_result(msg["id"])
    forward(mgr.status)


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/override",
        vol.Required("scene"): vol.Any(None, str),
        vol.Optional("minutes"): vol.Coerce(float),
    }
)
@websocket_api.async_response
async def ws_override(hass: HomeAssistant, connection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)
    await _run(connection, msg, mgr.async_set_override(msg["scene"], msg.get("minutes")))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/pause",
        vol.Required("minutes"): vol.Coerce(float),
    }
)
@websocket_api.async_response
async def ws_pause(hass: HomeAssistant, connection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)
    await _run(connection, msg, mgr.async_pause(msg["minutes"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/boost",
        vol.Required("delta"): vol.Coerce(float),
        vol.Required("minutes"): vol.Coerce(float),
    }
)
@websocket_api.async_response
async def ws_boost(hass: HomeAssistant, connection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)
    await _run(connection, msg, mgr.async_boost(msg["delta"], msg["minutes"]))


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): f"{DOMAIN}/mode",
        vol.Required("mode"): vol.In([MODE_SHADOW, MODE_ACTIVE]),
    }
)
@websocket_api.async_response
async def ws_mode(hass: HomeAssistant, connection, msg: dict) -> None:
    if not (mgr := _manager(hass)):
        return _not_loaded(connection, msg)
    await _run(connection, msg, mgr.async_set_mode(msg["mode"]))
