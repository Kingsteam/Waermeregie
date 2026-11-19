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


async def test_pellets_services_buttons_and_reminder(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    """Vorrat setzen, Brennzeit zählen, Erinnerung einmal, Knöpfe."""
    notify_calls = async_mock_service(hass, "notify", "handy")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    assert (await save(hass, client, cfg))["success"]
    mgr = hass.data[DOMAIN]
    registry = er.async_get(hass)
    stock = registry.async_get_entity_id("sensor", DOMAIN, f"{setup.entry_id}_pellet_stock")
    low = registry.async_get_entity_id("binary_sensor", DOMAIN, f"{setup.entry_id}_pellet_low")
    refill = registry.async_get_entity_id("button", DOMAIN, f"{setup.entry_id}_pellet_refill")
    empty = registry.async_get_entity_id("button", DOMAIN, f"{setup.entry_id}_pellet_empty")
    assert stock and low and refill and empty

    await hass.services.async_call(
        DOMAIN, "pellets_set", {"kg": 6, "from_empty": True}, blocking=True
    )
    await hass.async_block_till_done()
    assert float(hass.states.get(stock).state) == 6.0
    # Ofen brennt 1 h: 1,5 kg weg → 4,5 kg, unter der Schwelle → eine Nachricht
    hass.states.async_set("climate.pelletofen", "heat", {"hvac_action": "heating"})
    await mgr.async_evaluate()  # ab hier brennt er
    for _ in range(12):
        freezer.tick(300)
        await mgr.async_evaluate()
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert float(hass.states.get(stock).state) == 4.5
    assert hass.states.get(low).state == "on"
    pellet_msgs = [c for c in notify_calls if "Pellets" in c.data["message"]]
    assert len(pellet_msgs) == 1

    await hass.services.async_call("button", "press", {"entity_id": refill}, blocking=True)
    await hass.async_block_till_done()
    assert float(hass.states.get(stock).state) == 19.5
    assert hass.states.get(low).state == "off"
    # Daten überstehen das Neuladen
    assert await hass.config_entries.async_reload(setup.entry_id)
    await hass.async_block_till_done()
    assert hass.data[DOMAIN].pellets["fill_kg"] == 21.0

    await hass.services.async_call("button", "press", {"entity_id": empty}, blocking=True)
    assert hass.data[DOMAIN].pellets["stock_kg"] == 0.0


async def test_error_with_low_stock_counts_as_empty(
    hass: HomeAssistant, setup, freezer: FrozenDateTimeFactory
) -> None:
    """Störung bei fast leerem Behälter: als „leer“ werten (so geschehen 18.11.2026)."""
    client_cfg = room_config(hass.data[DOMAIN].config)
    client_cfg["stove"] = {**client_cfg["stove"], "error_sensor": "binary_sensor.ofen_stoerung"}
    await hass.data[DOMAIN].async_save_config(client_cfg)
    mgr = hass.data[DOMAIN]
    await mgr.async_pellets_set(4, from_empty=True)
    hass.states.async_set("climate.pelletofen", "heat", {"hvac_action": "heating"})
    await mgr.async_evaluate()  # ab hier brennt er
    for _ in range(30):  # 2,5 h
        freezer.tick(300)
        await mgr.async_evaluate()
    hass.states.async_set("climate.pelletofen", "off", {"hvac_action": "off"})
    hass.states.async_set("binary_sensor.ofen_stoerung", "on")
    await mgr.async_evaluate()
    assert mgr.pellets["learned"] == 1
    assert mgr.pellets["rate_kg_h"] == 1.6  # 4 kg / 2,5 h
    assert any("fast leerem Behälter" in e["text"] for e in mgr.log)


async def test_paused_opening_ignored_and_recovery_after_closing(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    cfg["rooms"][0]["paused"] = ["binary_sensor.terrassentuer"]
    assert (await save(hass, client, cfg))["success"]
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    stored = (await client.receive_json())["result"]["config"]
    assert stored["rooms"][0]["paused"] == ["binary_sensor.terrassentuer"]
    mgr = hass.data[DOMAIN]
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(15 * 60)
    status = await mgr.async_evaluate()
    assert status["rooms"][0]["open"] is False  # pausiert: zählt nicht
    assert not status["alerts"]

    # Pause aufheben: Tür offen, dann zu -> Erholungszeit
    cfg["rooms"][0]["paused"] = []
    assert (await save(hass, client, cfg))["success"]
    freezer.tick(60)
    status = await mgr.async_evaluate()
    assert status["rooms"][0]["open"] is True
    hass.states.async_set("binary_sensor.terrassentuer", "off")
    freezer.tick(60)
    status = await mgr.async_evaluate()
    assert status["rooms"][0]["open"] is False
    assert status["rooms"][0]["recover_until"] is not None
    freezer.tick(21 * 60)
    status = await mgr.async_evaluate()
    assert status["rooms"][0]["recover_until"] is None


async def test_sensor_dropout_bridged_then_reported_once(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    notify_calls = async_mock_service(hass, "notify", "handy")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    cfg["parameters"]["opening_check_min"] = 0
    assert (await save(hass, client, cfg))["success"]
    mgr = hass.data[DOMAIN]
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(5 * 60)
    status = await mgr.async_evaluate()
    assert status["rooms"][0]["open"] is True
    # Kurzer Aussetzer: bleibt offen, Öffnungszeit läuft weiter
    hass.states.async_set("binary_sensor.terrassentuer", "unavailable")
    freezer.tick(2 * 60)
    status = await mgr.async_evaluate()
    assert status["rooms"][0]["open"] is True
    assert status["rooms"][0]["open_minutes"] == 7
    assert status["devices"]["binary_sensor.terrassentuer"]["held"] is True
    assert status["devices"]["binary_sensor.terrassentuer"]["drops_24h"] == 1
    # Nach 30 min ohne Wert: zählt wieder als zu
    freezer.tick(29 * 60)
    status = await mgr.async_evaluate()
    assert status["rooms"][0]["open"] is False
    await hass.async_block_till_done()
    door_msgs = [c for c in notify_calls if "nicht erreichbar" in c.data["message"]]
    assert not door_msgs
    # Nach 60 min: eine Meldung, nicht bei jeder Runde
    freezer.tick(30 * 60)
    await mgr.async_evaluate()
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    door_msgs = [c for c in notify_calls if "Nicht erreichbar" in c.data["message"]]
    assert len(door_msgs) == 1
    assert any(a["kind"] == "sensor" for a in mgr.status["alerts"])


async def test_open_window_without_cooling_is_reported(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    notify_calls = async_mock_service(hass, "notify", "handy")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    assert (await save(hass, client, cfg))["success"]
    mgr = hass.data[DOMAIN]
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(3 * 60)
    await mgr.async_evaluate()
    freezer.tick(61 * 60)
    await mgr.async_evaluate()
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    msgs = [c for c in notify_calls if "kühlt aber nicht ab" in c.data["message"]]
    assert len(msgs) == 1
    assert any(a["kind"] == "opening_check" for a in mgr.status["alerts"])
    assert mgr.status["rooms"][0]["open"] is True  # bleibt auf Frostschutz
