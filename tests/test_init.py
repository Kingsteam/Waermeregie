"""Tests mit Home Assistant: Einrichtung, WebSocket, Schatten- und Aktivbetrieb."""

from __future__ import annotations

from unittest.mock import patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry, async_mock_service

from custom_components.waermeregie.const import DOMAIN, STORAGE_KEY_CONFIG

# Erfundenes Haus: alle Entitäten im Register (Plattform „test“)
ENTITIES = {
    "climate.pelletofen": ("climate", "ofen"),
    "climate.heizung_wohnzimmer": ("climate", "hk_wz"),
    "sensor.temp_wohnzimmer": ("sensor", "t_wz"),
    "binary_sensor.terrassentuer": ("binary_sensor", "tuer"),
    "binary_sensor.belegung_wohnzimmer": ("binary_sensor", "belegung"),
    "select.ofen_leistung": ("select", "leistung"),
    "switch.ofen_chrono": ("switch", "chrono"),
    "switch.ofen_eco": ("switch", "eco"),
    "binary_sensor.ofen_stoerung": ("binary_sensor", "stoerung"),
    "sensor.ofen_wasser": ("sensor", "wasser"),
}


@pytest.fixture
def house(hass: HomeAssistant) -> dict[str, str]:
    """Entitäten anlegen, Startzustände setzen. Liefert entity_id -> Register-ID."""
    registry = er.async_get(hass)
    ids = {}
    for entity_id, (domain, uid) in ENTITIES.items():
        entry = registry.async_get_or_create(
            domain, "test", uid, suggested_object_id=entity_id.split(".", 1)[1]
        )
        assert entry.entity_id == entity_id
        ids[entity_id] = entry.id
    hass.states.async_set("climate.pelletofen", "off", {"hvac_action": "off"})
    hass.states.async_set("climate.heizung_wohnzimmer", "heat", {"current_temperature": 20.0})
    hass.states.async_set("sensor.temp_wohnzimmer", "19.0")
    hass.states.async_set("binary_sensor.terrassentuer", "off")
    hass.states.async_set("binary_sensor.belegung_wohnzimmer", "on")
    hass.states.async_set(
        "select.ofen_leistung", "Stufe 5", {"options": [f"Stufe {i}" for i in range(1, 6)]}
    )
    hass.states.async_set("switch.ofen_chrono", "on")
    hass.states.async_set("switch.ofen_eco", "off")
    hass.states.async_set("binary_sensor.ofen_stoerung", "off")
    hass.states.async_set("sensor.ofen_wasser", "58.5")
    return ids


def room_config(cfg: dict) -> dict:
    cfg = {**cfg}
    cfg["stove"] = {**cfg["stove"], "climate": "climate.pelletofen"}
    cfg["rooms"] = [
        {
            "id": "wohnzimmer",
            "name": "Wohnzimmer",
            "importance": 3,
            "radiators": ["climate.heizung_wohnzimmer"],
            "temperature_sensors": [{"entity": "sensor.temp_wohnzimmer", "weight": 1}],
            "openings": ["binary_sensor.terrassentuer"],
            "presence": ["binary_sensor.belegung_wohnzimmer"],
            "targets": {},
        }
    ]
    cfg["notify"] = ["notify.handy"]
    # immer Komfort, damit die Uhrzeit des Testlaufs egal ist
    cfg["day_types"] = [
        {"id": "immer", "name": "Immer", "slots": [{"start": "00:00", "scene": "komfort"}]}
    ]
    cfg["week"] = dict.fromkeys(cfg["week"], "immer")
    return cfg


@pytest.fixture
async def setup(hass: HomeAssistant, house):
    entry = MockConfigEntry(domain=DOMAIN, data={})
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def save(hass, client, cfg) -> dict:
    await client.send_json_auto_id({"type": f"{DOMAIN}/config/save", "config": cfg})
    return await client.receive_json()


async def test_setup_entities_panel(hass: HomeAssistant, setup) -> None:
    entry = setup
    assert entry.state is ConfigEntryState.LOADED
    registry = er.async_get(hass)
    for platform, key in (
        ("sensor", "phase"),
        ("sensor", "scene"),
        ("sensor", "starts_today"),
        ("switch", "active"),
        ("select", "scene_select"),
        ("binary_sensor", "heating_block"),
    ):
        assert registry.async_get_entity_id(platform, DOMAIN, f"{entry.entry_id}_{key}"), key
    assert "waermeregie" in hass.data["frontend_panels"]
    assert await hass.config_entries.async_unload(entry.entry_id)
    assert "waermeregie" not in hass.data["frontend_panels"]


async def test_config_roundtrip_uses_registry_ids(
    hass: HomeAssistant, setup, house, hass_ws_client, hass_storage
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    msg = await client.receive_json()
    assert msg["success"]
    cfg = room_config(msg["result"]["config"])
    msg = await save(hass, client, cfg)
    assert msg["success"], msg
    assert msg["result"]["config"]["rooms"][0]["radiators"] == ["climate.heizung_wohnzimmer"]
    stored = hass_storage[STORAGE_KEY_CONFIG]["data"]
    assert stored["stove"]["climate"] == house["climate.pelletofen"]
    assert stored["rooms"][0]["radiators"] == [house["climate.heizung_wohnzimmer"]]

    # Umbenennen bricht den Bezug nicht
    er.async_get(hass).async_update_entity(
        "climate.heizung_wohnzimmer", new_entity_id="climate.hk_wohnen"
    )
    mgr = hass.data[DOMAIN]
    assert mgr._from_storage(stored)["rooms"][0]["radiators"] == ["climate.hk_wohnen"]


async def test_unregistered_entity_rejected(hass: HomeAssistant, setup, hass_ws_client) -> None:
    hass.states.async_set("sensor.yaml_fuehler", "20")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    cfg["rooms"][0]["temperature_sensors"].append({"entity": "sensor.yaml_fuehler", "weight": 1})
    msg = await save(hass, client, cfg)
    assert not msg["success"]
    assert msg["error"]["code"] == "invalid_config"
    assert "eindeutige ID" in msg["error"]["message"]


async def test_shadow_mode_switches_nothing(hass: HomeAssistant, setup, hass_ws_client) -> None:
    climate_calls = async_mock_service(hass, "climate", "set_hvac_mode")
    temp_calls = async_mock_service(hass, "climate", "set_temperature")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    msg = await save(hass, client, cfg)
    assert msg["success"]
    status = hass.data[DOMAIN].status
    assert status["mode"] == "shadow"
    assert status["stove"]["phase"] == "block"  # gedachter Block: 19 °C bei Ziel 21
    assert climate_calls == []
    assert temp_calls == []
    assert any(e["shadow"] for e in status["log"])


async def test_active_mode_switches_stove_and_radiators(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    mode_calls = async_mock_service(hass, "climate", "set_hvac_mode")
    temp_calls = async_mock_service(hass, "climate", "set_temperature")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    assert (await save(hass, client, cfg))["success"]
    await client.send_json_auto_id({"type": f"{DOMAIN}/mode", "mode": "active"})
    msg = await client.receive_json()
    assert msg["success"], msg
    await hass.async_block_till_done()
    assert any(
        c.data == {"entity_id": "climate.pelletofen", "hvac_mode": "heat"} for c in mode_calls
    )
    assert any(c.data.get("entity_id") == "climate.pelletofen" for c in temp_calls)
    assert any(
        c.data == {"entity_id": "climate.heizung_wohnzimmer", "temperature": 22.0}
        for c in temp_calls
    )


async def test_switch_entity_toggles_mode(hass: HomeAssistant, setup) -> None:
    registry = er.async_get(hass)
    switch = registry.async_get_entity_id("switch", DOMAIN, f"{setup.entry_id}_active")
    mgr = hass.data[DOMAIN]
    # ohne Ofen kein Aktivbetrieb
    mgr.config["stove"]["climate"] = None
    with pytest.raises(Exception, match="Ofen"):
        await hass.services.async_call("switch", "turn_on", {"entity_id": switch}, blocking=True)
    mgr.config["stove"]["climate"] = "climate.pelletofen"
    await hass.services.async_call("switch", "turn_on", {"entity_id": switch}, blocking=True)
    assert hass.states.get(switch).state == "on"
    await hass.services.async_call("switch", "turn_off", {"entity_id": switch}, blocking=True)
    assert hass.states.get(switch).state == "off"


async def test_opening_notifies_once(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    notify_calls = async_mock_service(hass, "notify", "handy")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    assert (await save(hass, client, cfg))["success"]
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(11 * 60)
    mgr = hass.data[DOMAIN]
    await mgr.async_evaluate()
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert len(notify_calls) == 1
    assert "seit 11 min offen" in notify_calls[0].data["message"]
    assert hass.data[DOMAIN].status["alerts"]


async def test_services_and_select(hass: HomeAssistant, setup) -> None:
    mgr = hass.data[DOMAIN]
    await hass.services.async_call(
        DOMAIN, "set_scene", {"scene": "sparen", "minutes": 30}, blocking=True
    )
    assert mgr.status["scene"]["id"] == "sparen"
    assert mgr.status["scene"]["source"] == "override"
    select = er.async_get(hass).async_get_entity_id(
        "select", DOMAIN, f"{setup.entry_id}_scene_select"
    )
    await hass.async_block_till_done()
    assert hass.states.get(select).state == "Sparen"
    await hass.services.async_call(
        "select", "select_option", {"entity_id": select, "option": "Automatisch"}, blocking=True
    )
    assert mgr.status["scene"]["source"] == "schedule"
    await hass.services.async_call(DOMAIN, "pause_stove", {"minutes": 60}, blocking=True)
    assert mgr.status["overrides"]["pause_until"]
    await hass.services.async_call(DOMAIN, "boost", {"delta": 1, "minutes": 60}, blocking=True)
    assert mgr.status["overrides"]["boost"]["delta"] == 1
    with pytest.raises(Exception, match="Unbekannte Szene"):
        await hass.services.async_call(DOMAIN, "set_scene", {"scene": "gibtsnicht"}, blocking=True)


async def test_subscribe_pushes_status(hass: HomeAssistant, setup, hass_ws_client) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/subscribe"})
    msg = await client.receive_json()
    assert msg["success"]
    event = await client.receive_json()
    assert event["type"] == "event"
    assert "stove" in event["event"]
    await hass.data[DOMAIN].async_pause(30)
    event = await client.receive_json()
    assert event["event"]["overrides"]["pause_until"]


async def test_non_admin_cannot_save(
    hass: HomeAssistant, setup, hass_ws_client, hass_read_only_access_token
) -> None:
    client = await hass_ws_client(hass, hass_read_only_access_token)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config/save", "config": {}})
    msg = await client.receive_json()
    assert not msg["success"]
    assert msg["error"]["code"] == "unauthorized"


async def test_config_flow_creates_entry(hass: HomeAssistant, house) -> None:
    result = await hass.config_entries.flow.async_init(DOMAIN, context={"source": "user"})
    with patch("custom_components.waermeregie.async_setup_entry", return_value=True):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {"stove": "climate.pelletofen"}
        )
    assert result["type"] == "create_entry"
    assert result["data"] == {"stove": "climate.pelletofen"}


async def test_active_mode_takes_over_stove_functions(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    """Im Aktivbetrieb: Leistungsstufe wählen, Chrono des Ofens aus."""
    async_mock_service(hass, "climate", "set_hvac_mode")
    async_mock_service(hass, "climate", "set_temperature")
    select_calls = async_mock_service(hass, "select", "select_option")
    switch_calls = async_mock_service(hass, "switch", "turn_off")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    cfg["stove"].update(
        power="select.ofen_leistung",
        chrono_switch="switch.ofen_chrono",
        eco_switch="switch.ofen_eco",
        error_sensor="binary_sensor.ofen_stoerung",
        water_sensor="sensor.ofen_wasser",
    )
    cfg["mode"] = "active"
    msg = await save(hass, client, cfg)
    assert msg["success"], msg
    await hass.async_block_till_done()
    assert [c.data for c in select_calls] == [
        {"entity_id": "select.ofen_leistung", "option": "Stufe 3"}  # 2 K Bedarf -> höchste
    ]
    assert {"entity_id": "switch.ofen_chrono"} in [c.data for c in switch_calls]
    assert {"entity_id": "switch.ofen_eco"} not in [c.data for c in switch_calls]
    status = hass.data[DOMAIN].status["stove"]
    assert status["water_c"] == 58.5
    assert status["power_level"] == 3
