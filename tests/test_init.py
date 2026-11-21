"""Tests mit Home Assistant: Einrichtung, WebSocket, Schatten- und Aktivbetrieb."""

from __future__ import annotations

from datetime import timedelta
import json
from unittest.mock import MagicMock, patch

from freezegun.api import FrozenDateTimeFactory
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant, ServiceCall, State, SupportsResponse
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util
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
    "sensor.feuchte_wohnzimmer": ("sensor", "feuchte"),
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
    hass.states.async_set("sensor.feuchte_wohnzimmer", "40.6")
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
    # Ruhezeit aus, damit die Uhrzeit des Testlaufs egal ist (eigene Tests dafür)
    cfg["notifications"] = {**cfg["notifications"], "quiet_start": "", "quiet_end": ""}
    # immer Komfort, damit die Uhrzeit des Testlaufs egal ist
    cfg["day_types"] = [
        {"id": "immer", "name": "Immer", "slots": [{"start": "00:00", "scene": "komfort"}]}
    ]
    cfg["week"] = dict.fromkeys(cfg["week"], "immer")
    # sanfter Start hat eigene Tests
    cfg["parameters"] = {**cfg["parameters"], "soft_start_min": 0}
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


# --- 0.5.0 ---------------------------------------------------------------------------


async def _configured(hass, hass_ws_client, **params):
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    cfg["parameters"] = {**cfg["parameters"], **params}
    msg = await save(hass, client, cfg)
    assert msg["success"], msg
    return client, cfg


async def test_warmup_now_starts_warm_house(hass: HomeAssistant, setup, hass_ws_client) -> None:
    mode_calls = async_mock_service(hass, "climate", "set_hvac_mode")
    async_mock_service(hass, "climate", "set_temperature")
    hass.states.async_set("sensor.temp_wohnzimmer", "22.5")  # warm genug
    client, _ = await _configured(hass, hass_ws_client)
    await client.send_json_auto_id({"type": f"{DOMAIN}/mode", "mode": "active"})
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    assert not any(c.data.get("hvac_mode") == "heat" for c in mode_calls)
    await client.send_json_auto_id({"type": f"{DOMAIN}/warmup", "minutes": 90})
    msg = await client.receive_json()
    assert msg["success"], msg
    assert msg["result"]["warmup"]["active"] is True
    await hass.async_block_till_done()
    assert any(
        c.data == {"entity_id": "climate.pelletofen", "hvac_mode": "heat"} for c in mode_calls
    )
    mgr = hass.data[DOMAIN]
    assert any(
        e["text"].startswith("Aufheizen jetzt") and "(von Hand" in e["text"] for e in mgr.log
    )
    await client.send_json_auto_id({"type": f"{DOMAIN}/warmup", "cancel": True})
    msg = await client.receive_json()
    assert msg["success"] and msg["result"]["warmup"] is None


async def test_warmup_for_arrival_and_limits(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    client, _ = await _configured(hass, hass_ws_client, warmup_lead_min=45)
    freezer.move_to("2026-11-19T16:00:00+01:00")  # erst nach der Anmeldung
    await client.send_json_auto_id({"type": f"{DOMAIN}/warmup", "arrive": "18:30"})
    msg = await client.receive_json()
    assert msg["success"], msg
    w = msg["result"]["warmup"]
    assert w["active"] is False
    assert w["start_at"].startswith("2026-11-19T17:45")
    assert w["arrive"].startswith("2026-11-19T18:30")
    assert w["until"].startswith("2026-11-19T19:30")
    # schon vorbei: morgen
    await client.send_json_auto_id({"type": f"{DOMAIN}/warmup", "arrive": "07:00"})
    w = (await client.receive_json())["result"]["warmup"]
    assert w["arrive"].startswith("2026-11-20T07:00")
    for bad in ({"minutes": 10}, {"minutes": 1000}, {"arrive": "25:99x"}):
        await client.send_json_auto_id({"type": f"{DOMAIN}/warmup", **bad})
        msg = await client.receive_json()
        assert not msg["success"]
        assert msg["error"]["code"] == "invalid_config"


async def test_warmup_service_button_and_clears_pause(hass: HomeAssistant, setup) -> None:
    mgr = hass.data[DOMAIN]
    await mgr.async_pause(120)
    assert mgr.state["pause_until"]
    button = er.async_get(hass).async_get_entity_id("button", DOMAIN, f"{setup.entry_id}_warmup")
    await hass.services.async_call("button", "press", {"entity_id": button}, blocking=True)
    assert mgr.state["warmup"] is not None
    assert any("(Knopf Haus aufheizen)" in e["text"] for e in mgr.log)
    assert mgr.state["pause_until"] is None
    await hass.services.async_call(DOMAIN, "cancel_warmup", {}, blocking=True)
    assert mgr.state["warmup"] is None
    await hass.services.async_call(DOMAIN, "warmup", {"arrive": "18:30:00"}, blocking=True)
    assert mgr.state["warmup"]["arrive"] is not None
    await hass.services.async_call(DOMAIN, "warmup", {"minutes": 60}, blocking=True)
    assert mgr.state["warmup"]["arrive"] is None
    assert any("(Dienst waermeregie.warmup)" in e["text"] for e in mgr.log)


async def test_history_points_every_ten_minutes(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    client, _ = await _configured(hass, hass_ws_client)
    freezer.move_to("2026-11-19T18:01:00+01:00")  # erst nach der Anmeldung
    mgr = hass.data[DOMAIN]
    mgr.history = []
    hass.states.async_set("climate.pelletofen", "heat", {"hvac_action": "heating"})
    for _ in range(25):  # 25 min, jede Minute
        freezer.tick(60)
        await mgr.async_evaluate()
    await client.send_json_auto_id({"type": f"{DOMAIN}/history"})
    msg = await client.receive_json()
    assert msg["success"], msg
    points = msg["result"]["points"]
    assert [p["t"][14:16] for p in points] == ["00", "10", "20"]  # Zeitzone der Testinstanz
    assert points[-1]["house_c"] == 19.0
    assert points[-1]["target_c"] == 21.0
    assert points[-1]["burning"] is True
    assert points[-1]["rooms"] == {"wohnzimmer": 19.0}  # je Raum für die Grafik
    assert "water_c" in points[-1]
    # übersteht das Neuladen
    assert await hass.config_entries.async_reload(setup.entry_id)
    await hass.async_block_till_done()
    assert len(hass.data[DOMAIN].history) >= 3
    await client.send_json_auto_id({"type": f"{DOMAIN}/history", "hours": 100})
    assert not (await client.receive_json())["success"]


async def test_sensor_offset_corrects_reading(hass: HomeAssistant, setup, hass_ws_client) -> None:
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    cfg["rooms"][0]["temperature_sensors"][0]["offset"] = -1.5
    msg = await save(hass, client, cfg)
    assert msg["success"], msg
    assert msg["result"]["config"]["rooms"][0]["temperature_sensors"][0]["offset"] == -1.5
    room = hass.data[DOMAIN].status["rooms"][0]
    assert room["temperature"] == 17.5
    cfg["rooms"][0]["temperature_sensors"][0]["offset"] = 7
    assert not (await save(hass, client, cfg))["success"]


async def test_soft_start_sets_radiators_before_stove(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    mode_calls = async_mock_service(hass, "climate", "set_hvac_mode")
    temp_calls = async_mock_service(hass, "climate", "set_temperature")
    client, _ = await _configured(hass, hass_ws_client, soft_start_min=5)
    await client.send_json_auto_id({"type": f"{DOMAIN}/mode", "mode": "active"})
    msg = await client.receive_json()
    assert msg["success"]
    await hass.async_block_till_done()
    mgr = hass.data[DOMAIN]
    assert mgr.status["stove"]["phase"] == "prepare"
    assert any(
        c.data == {"entity_id": "climate.heizung_wohnzimmer", "temperature": 22.0}
        for c in temp_calls
    )
    assert not any(c.data.get("hvac_mode") == "heat" for c in mode_calls)
    freezer.tick(5 * 60)
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert any(c.data.get("hvac_mode") == "heat" for c in mode_calls)
    assert mgr.status["stove"]["phase"] == "block"


# --- 0.6.0 Benachrichtigungen und Feucht-Lüften ---------------------------------------


async def _notify_setup(hass, hass_ws_client, notifications=None, room=None, stove=None):
    calls = async_mock_service(hass, "notify", "handy")
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    cfg["parameters"]["opening_check_min"] = 0
    cfg["notifications"] = {**cfg["notifications"], **(notifications or {})}
    cfg["rooms"][0].update(room or {})
    cfg["stove"].update(stove or {})
    msg = await save(hass, client, cfg)
    assert msg["success"], msg
    return calls, hass.data[DOMAIN]


async def test_opening_delay_and_repeat_block(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    calls, mgr = await _notify_setup(hass, hass_ws_client, {"opening_delay_min": 20})
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(11 * 60)
    status = await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert not calls
    assert any(a["kind"] == "opening" for a in status["alerts"])  # Übersicht zeigt es
    freezer.tick(10 * 60)
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert len(calls) == 1
    # Zu und gleich wieder auf: innerhalb der Wiederholungssperre keine zweite Meldung
    hass.states.async_set("binary_sensor.terrassentuer", "off")
    freezer.tick(60)
    await mgr.async_evaluate()
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(21 * 60)
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert len(calls) == 1
    # Nach der Sperre wieder
    hass.states.async_set("binary_sensor.terrassentuer", "off")
    freezer.tick(60)
    await mgr.async_evaluate()
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(40 * 60)
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert len(calls) == 2


async def test_opening_kind_switched_off(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    calls, mgr = await _notify_setup(hass, hass_ws_client, {"opening": False})
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(30 * 60)
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert not calls


async def test_quiet_hours_hold_then_bundle_stove_error_passes(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    now = dt_util.now()
    quiet = {
        "quiet_start": (now - timedelta(hours=1)).strftime("%H:%M"),
        "quiet_end": (now + timedelta(minutes=30)).strftime("%H:%M"),
    }
    calls, mgr = await _notify_setup(
        hass, hass_ws_client, quiet, stove={"error_sensor": "binary_sensor.ofen_stoerung"}
    )
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(12 * 60)
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert not calls  # gesammelt
    hass.states.async_set("binary_sensor.ofen_stoerung", "on")
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert len(calls) == 1 and "Störung" in calls[0].data["message"]  # kritisch
    freezer.tick(25 * 60)
    await mgr.async_evaluate()
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert len(calls) == 2
    assert "seit 37 min offen" in calls[1].data["message"]  # aktueller Stand, nicht 12 min


async def test_quiet_hours_held_opening_dropped_if_closed(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    now = dt_util.now()
    quiet = {
        "quiet_start": (now - timedelta(hours=1)).strftime("%H:%M"),
        "quiet_end": (now + timedelta(minutes=30)).strftime("%H:%M"),
    }
    calls, mgr = await _notify_setup(hass, hass_ws_client, quiet)
    hass.states.async_set("binary_sensor.terrassentuer", "on")
    freezer.tick(12 * 60)
    await mgr.async_evaluate()
    hass.states.async_set("binary_sensor.terrassentuer", "off")
    freezer.tick(25 * 60)
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert not calls


def _shower(minute: int) -> float:
    """Feuchte wie nach einem Duschen (anonymisiert), minute ab 0 = Beginn."""
    if minute <= 25:
        return 40.6
    if minute <= 44:
        return round(40.6 + (49.8 - 40.6) * (minute - 25) / 19, 1)
    if minute == 45:
        return 52.5
    if minute == 46:
        return 55.2
    if minute <= 53:
        return round(55.2 - (55.2 - 42.4) * (minute - 46) / 7, 1)
    return 42.4


async def _replay(hass, mgr, freezer, until: int, open_at: int, close_at: int | None):
    statuses = {}
    for minute in range(until + 1):
        hass.states.async_set("sensor.feuchte_wohnzimmer", str(_shower(minute)))
        if minute == open_at:
            hass.states.async_set("binary_sensor.terrassentuer", "on")
        if close_at is not None and minute == close_at:
            hass.states.async_set("binary_sensor.terrassentuer", "off")
        statuses[minute] = await mgr.async_evaluate()
        freezer.tick(60)
    await hass.async_block_till_done()
    return statuses


async def test_shower_ventilation_no_notice(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    calls, mgr = await _notify_setup(
        hass, hass_ws_client, room={"humidity_sensors": ["sensor.feuchte_wohnzimmer"]}
    )
    # Fenster 45.-52. Minute offen, Bewohner verlässt den Raum (leerer Raum meldet früh)
    hass.states.async_set("binary_sensor.belegung_wohnzimmer", "off")
    statuses = await _replay(hass, mgr, freezer, 70, 45, 52)
    assert not calls
    room = statuses[47]["rooms"][0]
    assert room["ventilating"] is True and room["open"] is True  # Heizkörper trotzdem zu
    assert room["humidity"] == 53.4
    assert not any(a["kind"] == "opening" for a in statuses[50]["alerts"])


async def test_window_left_open_after_shower_reported_later(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    calls, mgr = await _notify_setup(
        hass, hass_ws_client, room={"humidity_sensors": ["sensor.feuchte_wohnzimmer"]}
    )
    await _replay(hass, mgr, freezer, 62, 45, None)
    assert not calls  # Feuchte erst in Minute 53 unten, Meldung frühestens 63
    hass.states.async_set("sensor.feuchte_wohnzimmer", "42.4")
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert len(calls) == 1
    assert "seit 18 min offen" in calls[0].data["message"]


async def test_learn_reset_and_status(hass: HomeAssistant, setup, hass_ws_client) -> None:
    client, _ = await _configured(hass, hass_ws_client)
    mgr = hass.data[DOMAIN]
    mgr.state["learn"]["samples"]["afterheat_k"] = 3
    mgr.state["learn"]["values"]["afterheat_k"] = 12.0
    await client.send_json_auto_id({"type": f"{DOMAIN}/learn/reset"})
    msg = await client.receive_json()
    assert msg["success"], msg
    assert msg["result"]["learn"]["samples"]["afterheat_k"] == 0
    assert msg["result"]["learn"]["values"]["afterheat_k"] is None
    assert msg["result"]["stove"]["dump"] is False
    assert any(e["text"] == "Gelernte Werte zurückgesetzt" for e in mgr.log)


async def test_reignition_after_block_end_switches_stove_off(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    """20.11.2026: Block endete während der Selbstabschaltung, später meldet der Ofen "brennt"."""
    mode_calls = async_mock_service(hass, "climate", "set_hvac_mode")
    async_mock_service(hass, "climate", "set_temperature")
    hass.states.async_set("sensor.temp_wohnzimmer", "25.0")  # weit über Ziel
    client = await hass_ws_client(hass)
    await client.send_json_auto_id({"type": f"{DOMAIN}/config"})
    cfg = room_config((await client.receive_json())["result"]["config"])
    assert (await save(hass, client, cfg))["success"]
    await client.send_json_auto_id({"type": f"{DOMAIN}/mode", "mode": "active"})
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    mgr = hass.data[DOMAIN]
    ended = (dt_util.now() - timedelta(minutes=16)).isoformat()
    mgr.state["last_stop"] = ended
    mgr.state["reignite_watch"] = ended
    mode_calls.clear()
    hass.states.async_set("climate.pelletofen", "heat", {"hvac_action": "heating"})
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert [c.data for c in mode_calls] == [{"entity_id": "climate.pelletofen", "hvac_mode": "off"}]
    assert mgr.state["block_start"] is None
    assert any("von selbst neu gezündet, kein Bedarf, ausgeschaltet" in e["text"] for e in mgr.log)
    assert not any("von Hand" in e["text"] for e in mgr.log)
    assert mgr.status["stove"]["starts_today"] == 0
    assert mgr.status["stove"]["reignitions_today"] == 1


async def test_manual_start_in_warm_house_notifies(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    mode_calls = async_mock_service(hass, "climate", "set_hvac_mode")
    async_mock_service(hass, "climate", "set_temperature")
    notify_calls = async_mock_service(hass, "notify", "handy")
    hass.states.async_set("sensor.temp_wohnzimmer", "25.0")
    client, _ = await _configured(hass, hass_ws_client)
    await client.send_json_auto_id({"type": f"{DOMAIN}/mode", "mode": "active"})
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    mgr = hass.data[DOMAIN]
    hass.states.async_set("climate.pelletofen", "heat", {"hvac_action": "heating"})
    await mgr.async_evaluate()
    await mgr.async_evaluate()
    await hass.async_block_till_done()
    assert [c.data["hvac_mode"] for c in mode_calls] == ["off"]
    assert len(notify_calls) == 1
    assert "über Ziel" in notify_calls[0].data["message"]
    assert mgr.status["stove"]["starts_today"] == 0


async def test_cold_service_and_button(hass: HomeAssistant, setup) -> None:
    mgr = hass.data[DOMAIN]
    await hass.services.async_call(DOMAIN, "cold", {}, blocking=True)
    assert mgr.status["warmup"]["cold"] is True
    assert any("Mir ist kalt" in e["text"] for e in mgr.log)
    await hass.services.async_call(DOMAIN, "cancel_warmup", {}, blocking=True)
    assert mgr.status["warmup"] is None
    button = next(s.entity_id for s in hass.states.async_all("button") if "cold" in s.entity_id)
    await hass.services.async_call("button", "press", {"entity_id": button}, blocking=True)
    assert mgr.status["warmup"]["cold"] is True


async def test_history_command_backfills_from_recorder(
    hass: HomeAssistant,
    setup,
    hass_ws_client,
) -> None:
    client, _ = await _configured(hass, hass_ws_client)
    mgr = hass.data[DOMAIN]
    now = dt_util.now().replace(second=0, microsecond=0)
    slot = now - timedelta(minutes=now.minute % 10 + 30)
    mgr.history = [
        {"t": (slot + timedelta(minutes=10 * i)).isoformat(), "house_c": 20.0} for i in range(3)
    ]
    hass.config.components.add("recorder")
    state = State("sensor.temp_wohnzimmer", "20.4", last_updated=slot - timedelta(minutes=1))
    instance = MagicMock()

    async def run(func):
        return func()

    instance.async_add_executor_job = run
    with (
        patch("homeassistant.components.recorder.get_instance", return_value=instance),
        patch(
            "homeassistant.components.recorder.history.get_significant_states",
            return_value={"sensor.temp_wohnzimmer": [state]},
        ) as fetch,
    ):
        await client.send_json_auto_id({"type": f"{DOMAIN}/history"})
        msg = await client.receive_json()
        assert msg["success"], msg
        assert all(p["rooms"] == {"wohnzimmer": 20.4} for p in msg["result"]["points"])
        # zweiter Aufruf fragt den Rekorder nicht noch einmal
        await client.send_json_auto_id({"type": f"{DOMAIN}/history"})
        assert (await client.receive_json())["success"]
        assert fetch.call_count == 1


async def test_activity_message_only_when_switched_on(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    async_mock_service(hass, "climate", "set_hvac_mode")
    async_mock_service(hass, "climate", "set_temperature")
    notify_calls = async_mock_service(hass, "notify", "handy")
    client, cfg = await _configured(hass, hass_ws_client)
    assert cfg["notifications"]["activity"] is False  # ab Werk aus
    cfg["notifications"] = {**cfg["notifications"], "activity": True}
    assert (await save(hass, client, cfg))["success"]
    await client.send_json_auto_id({"type": f"{DOMAIN}/mode", "mode": "active"})
    assert (await client.receive_json())["success"]
    await hass.async_block_till_done()
    assert [c.data["message"] for c in notify_calls] == [
        "Der Ofen startet jetzt. Grund: Wohnräume 2,0 K unter Ziel."
    ]


async def test_feedback_room_and_house_and_suggestion_roundtrip(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    notify_calls = async_mock_service(hass, "notify", "handy")
    client, _ = await _configured(hass, hass_ws_client)
    mgr = hass.data[DOMAIN]
    # Raum zu kalt: Ziel im Raum für eine Stunde 1 K höher
    before = mgr.status["rooms"][0]["target"]
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/feedback", "kind": "cold", "room": "wohnzimmer"}
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    assert msg["result"]["rooms"][0]["target"] == before + 1.0
    assert msg["result"]["feedback"]["last"]["room"] == "wohnzimmer"
    assert msg["result"]["feedback"]["last"]["room_c"] == 19.0  # Momentaufnahme
    # ganzes Haus zu kalt wirkt wie "Mir ist kalt"
    await hass.services.async_call(DOMAIN, "feedback", {"kind": "cold"}, blocking=True)
    assert mgr.status["warmup"]["cold"] is True
    # dreimal zu warm im Raum: Vorschlag, einmal gemeldet
    for _ in range(3):
        await client.send_json_auto_id(
            {"type": f"{DOMAIN}/feedback", "kind": "warm", "room": "wohnzimmer"}
        )
        msg = await client.receive_json()
    (s,) = msg["result"]["feedback"]["suggestions"]
    assert s["type"] == "target_down"
    assert sum("zu warm" in c.data["message"] for c in notify_calls) == 1
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/suggestion", "suggestion": s["id"], "action": "accept"}
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    assert msg["result"]["feedback"]["suggestions"] == []
    assert mgr.config["rooms"][0]["targets"]["komfort"] == s["to"]
    # unbekannter Raum wird abgelehnt
    await client.send_json_auto_id({"type": f"{DOMAIN}/feedback", "kind": "ok", "room": "keller"})
    assert not (await client.receive_json())["success"]


async def test_rule_nobody_home_switches_scene_and_shows_why(
    hass: HomeAssistant, setup, hass_ws_client, freezer: FrozenDateTimeFactory
) -> None:
    registry = er.async_get(hass)
    for domain, uid, obj in (("person", "p1", "anna"), ("lock", "l1", "haustuer")):
        registry.async_get_or_create(domain, "test", uid, suggested_object_id=obj)
    hass.states.async_set("person.anna", "home")
    hass.states.async_set("lock.haustuer", "locked")
    client, cfg = await _configured(hass, hass_ws_client)
    cfg["persons"] = ["person.anna"]
    cfg["rules"] = [
        {
            "template": "nobody_home",
            "params": {
                "scene": "abwesend",
                "after_min": 5,
                "require_lock": True,
                "lock": "lock.haustuer",
            },
        }
    ]
    assert (await save(hass, client, cfg))["success"]
    mgr = hass.data[DOMAIN]
    # im Speicher steht die Register-ID, nicht die entity_id
    stored = mgr._to_storage(mgr.config)
    assert stored["rules"][0]["params"]["lock"] != "lock.haustuer"
    assert mgr.status["rules"][0]["state"] == "waiting"
    assert mgr.status["scene"]["source"] == "schedule"
    hass.states.async_set("person.anna", "not_home")
    await mgr.async_evaluate()
    assert mgr.status["scene"]["source"] == "schedule"  # noch keine 5 Minuten
    freezer.tick(timedelta(minutes=6))
    await mgr.async_evaluate()
    assert mgr.status["scene"]["id"] == "abwesend"
    assert mgr.status["scene"]["source"] == "rule"
    assert mgr.status["rules"][0]["state"] == "active"
    assert any("Niemand zu Hause" in w for w in mgr.status["why"])
    assert any("greift" in e["text"] for e in mgr.log)
    hass.states.async_set("lock.haustuer", "unlocked")
    await mgr.async_evaluate()
    assert mgr.status["scene"]["source"] == "schedule"
    # Schutzregeln: feste und änderbare
    keys = {p["key"]: p["fixed"] for p in mgr.status["protected"]}
    assert keys["overheat"] is True and keys["frost"] is True
    assert keys["min_pause_min"] is False


async def test_house_feedback_moves_learning_value_of_active_rule(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    er.async_get(hass).async_get_or_create("sensor", "test", "aussen", suggested_object_id="aussen")
    hass.states.async_set("sensor.aussen", "-4.0")
    client, cfg = await _configured(hass, hass_ws_client)
    cfg["outdoor_sensor"] = "sensor.aussen"
    cfg["rules"] = [
        {
            "template": "cold_outside",
            "params": {"below_c": 0, "target_delta_k": 0.5, "lead_min": 30},
            "learn": {"target_delta_k": [0, 1.5]},
        }
    ]
    assert (await save(hass, client, cfg))["success"]
    mgr = hass.data[DOMAIN]
    assert mgr.status["rules"][0]["state"] == "active"
    await client.send_json_auto_id({"type": f"{DOMAIN}/feedback", "kind": "cold"})
    msg = await client.receive_json()
    assert msg["success"], msg
    assert msg["result"]["rules"][0]["learned"] == {"target_delta_k": 1.0}
    assert any("0,5 → 1" in e["text"] for e in mgr.log)
    # Rückmeldung für einen einzelnen Raum verstellt keine Lernwerte
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/feedback", "kind": "warm", "room": "wohnzimmer"}
    )
    msg = await client.receive_json()
    assert msg["result"]["rules"][0]["learned"] == {"target_delta_k": 1.0}


async def test_ai_suggest_roundtrip_with_mocked_ai(
    hass: HomeAssistant, setup, hass_ws_client
) -> None:
    """Die KI wird gefragt, ihre Antwort geprüft; übernommen wird nur auf Annehmen."""
    client, cfg = await _configured(hass, hass_ws_client)
    mgr = hass.data[DOMAIN]
    # ohne eingetragene KI: klare Absage, nichts wird gesendet
    await client.send_json_auto_id({"type": f"{DOMAIN}/ai_suggest"})
    msg = await client.receive_json()
    assert not msg["success"] and "keine KI" in msg["error"]["message"]

    er.async_get(hass).async_get_or_create("ai_task", "test", "ki", suggested_object_id="ki")
    cfg["ai_task"] = "ai_task.ki"
    assert (await save(hass, client, cfg))["success"]
    answer = {
        "zusammenfassung": "Morgens ist es etwas zu kühl.",
        "aenderungen": [
            {"id": "scene:komfort", "wert": 21.5, "begruendung": "Mehrmals zu kalt."},
            {"id": "param:max_starts_per_day", "wert": 30, "begruendung": "Mehr heizen."},
        ],
        "neue_regeln": [{"template": "wind", "params": {"above_kmh": 40}}],
    }
    calls = []

    async def generate(call: ServiceCall) -> dict:
        calls.append(call)
        return {"conversation_id": "x", "data": "Hier:\n" + json.dumps(answer)}

    hass.services.async_register(
        "ai_task", "generate_data", generate, supports_response=SupportsResponse.ONLY
    )
    # Vorschau sendet nichts
    await client.send_json_auto_id({"type": f"{DOMAIN}/ai_preview"})
    package = (await client.receive_json())["result"]["package"]
    assert calls == [] and "Wohnzimmer" not in json.dumps(package)

    await client.send_json_auto_id({"type": f"{DOMAIN}/ai_suggest"})
    msg = await client.receive_json()
    assert msg["success"], msg
    (call,) = calls
    assert call.data["entity_id"] == "ai_task.ki"
    assert "Wohnzimmer" not in call.data["instructions"]
    fb = msg["result"]["feedback"]
    assert fb["ai"]["summary"] == "Morgens ist es etwas zu kühl."
    assert fb["ai"]["dropped"] == 1  # die Schutzregel
    change, rule = fb["suggestions"]
    assert (change["type"], rule["type"]) == ("ai_change", "ai_rule")
    assert mgr.config["scenes"][0]["default_target"] == 21.0  # noch nichts geändert
    assert mgr.config["rules"] == []

    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/suggestion", "suggestion": change["id"], "action": "accept"}
    )
    msg = await client.receive_json()
    assert msg["success"], msg
    assert mgr.config["scenes"][0]["default_target"] == 21.5
    await client.send_json_auto_id(
        {"type": f"{DOMAIN}/suggestion", "suggestion": rule["id"], "action": "dismiss"}
    )
    msg = await client.receive_json()
    assert msg["result"]["feedback"]["suggestions"] == []
    assert mgr.config["rules"] == []

    # Dienst für Automationen; unbrauchbare Antwort ändert nichts und meldet es
    answer.clear()
    answer["aenderungen"] = "kaputt"
    await hass.services.async_call(DOMAIN, "ai_suggest", {}, blocking=True)
    assert mgr.status["feedback"]["suggestions"] == []
    hass.services.async_remove("ai_task", "generate_data")
    await hass.services.async_call(DOMAIN, "ai_suggest", {}, blocking=True)
    assert mgr.status["feedback"]["ai"]["error"]
