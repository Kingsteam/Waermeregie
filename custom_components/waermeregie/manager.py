"""Verbindung der Regel-Logik mit Home Assistant.

- Einstellungen und Laufzustand liegen im versionierten Store.
- Entitäten werden intern über die ID aus dem Entitätsregister gespeichert,
  nach außen (Oberfläche, Regel) als entity_id verwendet.
- Im Schattenbetrieb wird nur gerechnet und protokolliert, nichts geschaltet.
"""

from __future__ import annotations

import asyncio
from collections.abc import Callable
import copy
from datetime import datetime, timedelta
import logging
from typing import Any

from homeassistant.const import STATE_ON, STATE_UNAVAILABLE, STATE_UNKNOWN
from homeassistant.core import (
    CALLBACK_TYPE,
    Event,
    EventStateChangedData,
    HomeAssistant,
    callback,
)
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.dispatcher import async_dispatcher_send
from homeassistant.helpers.event import (
    async_call_later,
    async_track_state_change_event,
    async_track_time_interval,
)
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from . import engine, health, humidity, learning, messages, model, pellets
from .const import (
    DEBOUNCE_S,
    DOMAIN,
    EVALUATE_INTERVAL_S,
    HISTORY_HOURS,
    HISTORY_STEP_MIN,
    LOG_LENGTH,
    MAX_BOOST_K,
    MAX_BOOST_MIN,
    MAX_OVERRIDE_MIN,
    MAX_PAUSE_MIN,
    MAX_WARMUP_MIN,
    MIN_WARMUP_MIN,
    MODE_ACTIVE,
    MODE_SHADOW,
    OPENING_CHECK_DROP_K,
    STORAGE_KEY_CONFIG,
    STORAGE_KEY_STATE,
    STORAGE_VERSION,
    WARMUP_AFTER_ARRIVAL_MIN,
)

_LOGGER = logging.getLogger(__name__)
SIGNAL_UPDATE = f"{DOMAIN}_update"
BAD_STATES = (STATE_UNAVAILABLE, STATE_UNKNOWN, None)


def _paths(config: dict) -> list[tuple[Any, Any]]:
    """Alle Stellen in der Config, an denen eine Entität steht: (Container, Schlüssel)."""
    out: list[tuple[Any, Any]] = []
    for key in model.STOVE_KEYS:
        out.append((config["stove"], key))
    for key in ("weather", "outdoor_sensor", "workday", "pet"):
        out.append((config, key))
    for i in range(len(config["persons"])):
        out.append((config["persons"], i))
    for room in config["rooms"]:
        for key in ("radiators", "openings", "presence", "humidity_sensors", "paused"):
            for i in range(len(room.get(key) or [])):
                out.append((room[key], i))
        for sensor in room["temperature_sensors"]:
            out.append((sensor, "entity"))
    return out


def effective_config(config: dict) -> dict:
    """Config ohne pausierte Geräte: so sieht sie die Regel."""
    cfg = {**config, "rooms": []}
    for room in config["rooms"]:
        paused = set(room.get("paused") or [])
        if not paused:
            cfg["rooms"].append(room)
            continue
        cfg["rooms"].append(
            {
                **room,
                "radiators": [e for e in room["radiators"] if e not in paused],
                "openings": [e for e in room["openings"] if e not in paused],
                "presence": [e for e in room["presence"] if e not in paused],
                "humidity_sensors": [
                    e for e in room.get("humidity_sensors") or [] if e not in paused
                ],
                "temperature_sensors": [
                    s for s in room["temperature_sensors"] if s["entity"] not in paused
                ],
            }
        )
    return cfg


def referenced_entities(config: dict) -> set[str]:
    """Alle entity_ids, die die Regel beobachtet."""
    return {c[k] for c, k in _paths(config) if c[k]}


class WaermeregieManager:
    """Hält Einstellungen und Laufzustand, wertet aus, schaltet."""

    def __init__(self, hass: HomeAssistant) -> None:
        self.hass = hass
        self._config_store: Store[dict] = Store(hass, STORAGE_VERSION, STORAGE_KEY_CONFIG)
        self._state_store: Store[dict] = Store(hass, STORAGE_VERSION, STORAGE_KEY_STATE)
        self.config: dict[str, Any] = model.default_config()
        self.state: dict[str, Any] = engine.empty_state()
        self.log: list[dict[str, Any]] = []
        self.status: dict[str, Any] = {}
        self._subscribers: list[Callable[[dict], None]] = []
        self._unsub_state: CALLBACK_TYPE | None = None
        self._unsub_timer: CALLBACK_TYPE | None = None
        self._unsub_debounce: CALLBACK_TYPE | None = None
        self._notified: set[str] = set()
        self.pellets: dict[str, Any] = pellets.empty()
        self._was_error = False
        # Lüften: seit wann offen (zuletzt gesehen) und wann wieder geschlossen
        self._open_seen: dict[str, datetime] = {}
        self._closed: dict[str, tuple[datetime, float]] = {}
        # Sensorzustand (gespeichert) und Verlauf offener Fenster (nur im Speicher)
        self.health: dict[str, dict] = {}
        self._open_track: dict[str, dict] = {}
        # Lüften wegen Luftfeuchte je Raum (nur im Speicher)
        self._humid: dict[str, dict] = {}
        # Benachrichtigungen: zuletzt gesendet je Schlüssel, gesammelt in der Ruhezeit
        self._sent: dict[str, datetime] = {}
        self._held: dict[str, tuple[str, str]] = {}
        self._was_stove_error = False
        self._was_overheat = False
        # Verlauf für die Grafik (gespeichert), Brennen seit dem letzten Punkt
        self.history: list[dict[str, Any]] = []
        self._burned_in_step = False
        # Nur eine Auswertung zur selben Zeit (19.11.2026: Minutentakt lief mitten
        # in den Startbefehl hinein und hielt den Ofen für "von Hand aus")
        self._lock = asyncio.Lock()

    # --- Laden und Speichern ---------------------------------------------------
    async def async_load(self, initial_stove: str | None = None) -> None:
        stored = await self._config_store.async_load()
        if stored is None:
            self.config = model.default_config()
            if initial_stove:
                self.config["stove"]["climate"] = initial_stove
            await self._config_store.async_save(self._to_storage(self.config))
        else:
            self.config = self._from_storage(stored)
        state = await self._state_store.async_load() or {}
        self.log = state.pop("log", [])
        self.pellets = {**pellets.empty(), **(state.pop("pellets", None) or {})}
        self.health = state.pop("health", None) or {}
        self.history = state.pop("history", None) or []
        self.state = {**engine.empty_state(), **state}

    def _to_storage(self, config: dict) -> dict:
        """entity_id -> Register-ID. Unbekannte Entitäten werden abgelehnt."""
        registry = er.async_get(self.hass)
        out = copy.deepcopy(config)
        for container, key in _paths(out):
            entity_id = container[key]
            if not entity_id:
                continue
            entry = registry.async_get(entity_id)
            if entry is None:
                raise model.ConfigError(
                    f"{entity_id} hat keine eindeutige ID und kann nicht verwendet werden"
                )
            container[key] = entry.id
        return out

    def _from_storage(self, stored: dict) -> dict:
        """Register-ID -> aktuelle entity_id. Entfernte Entitäten fallen weg."""
        registry = er.async_get(self.hass)
        cfg = {**model.default_config(), **copy.deepcopy(stored)}
        missing = []
        for container, key in _paths(cfg):
            reg_id = container[key]
            if not reg_id:
                continue
            entry = registry.async_get(reg_id)
            container[key] = entry.entity_id if entry else None
            if entry is None:
                missing.append(reg_id)
        for room in cfg["rooms"]:
            for key in ("radiators", "openings", "presence", "humidity_sensors", "paused"):
                room[key] = [e for e in room.get(key) or [] if e]
            room["temperature_sensors"] = [s for s in room["temperature_sensors"] if s["entity"]]
        cfg["persons"] = [p for p in cfg["persons"] if p]
        if missing:
            _LOGGER.warning("%d gespeicherte Entitäten gibt es nicht mehr", len(missing))
        try:
            return model.validate(cfg)
        except model.ConfigError as err:
            _LOGGER.error("Gespeicherte Einstellungen ungültig (%s), nehme Standard", err)
            return model.default_config()

    async def async_save_config(self, raw: dict) -> dict:
        """Kopie prüfen, speichern, übernehmen. Wirft ConfigError."""
        new = model.validate(raw)
        stored = self._to_storage(new)
        await self._config_store.async_save(stored)
        old_mode = self.config["mode"]
        self.config = new
        if old_mode != new["mode"]:
            self._mode_changed(new["mode"])
        self._subscribe_entities()
        await self.async_evaluate()
        return self.config

    def _save_state(self) -> None:
        self._state_store.async_delay_save(self._state_data, 2)

    def _state_data(self) -> dict:
        return {
            **self.state,
            "log": self.log,
            "pellets": self.pellets,
            "health": self.health,
            "history": self.history,
        }

    # --- Start / Stop ------------------------------------------------------------
    async def async_start(self) -> None:
        self._subscribe_entities()
        self._unsub_timer = async_track_time_interval(
            self.hass, self._timer, timedelta(seconds=EVALUATE_INTERVAL_S)
        )
        await self.async_evaluate()

    async def async_stop(self) -> None:
        for unsub in (self._unsub_state, self._unsub_timer, self._unsub_debounce):
            if unsub:
                unsub()
        self._unsub_state = self._unsub_timer = self._unsub_debounce = None
        await self._state_store.async_save(self._state_data())

    def _subscribe_entities(self) -> None:
        if self._unsub_state:
            self._unsub_state()
            self._unsub_state = None
        entities = referenced_entities(self.config)
        if entities:
            self._unsub_state = async_track_state_change_event(
                self.hass, list(entities), self._state_changed
            )

    async def _timer(self, _now: datetime) -> None:
        await self.async_evaluate()

    @callback
    def _state_changed(self, _event: Event[EventStateChangedData]) -> None:
        if self._unsub_debounce:
            return
        self._unsub_debounce = async_call_later(self.hass, DEBOUNCE_S, self._debounced)

    async def _debounced(self, _now: datetime) -> None:
        self._unsub_debounce = None
        await self.async_evaluate()

    # --- Beobachten ----------------------------------------------------------------
    def _state(self, entity_id: str | None):
        """Zustand oder None, wenn nicht vorhanden oder nicht verfügbar."""
        if not entity_id or (st := self.hass.states.get(entity_id)) is None:
            return None
        return None if st.state in BAD_STATES else st

    def _float(self, entity_id: str | None, attribute: str | None = None) -> float | None:
        if not entity_id or (st := self.hass.states.get(entity_id)) is None:
            return None
        raw = st.attributes.get(attribute) if attribute else st.state
        if attribute is None and entity_id.startswith("climate."):
            raw = st.attributes.get("current_temperature")
        if raw in BAD_STATES:
            return None
        try:
            return float(raw)
        except TypeError, ValueError:
            return None

    def _reading(
        self, entity_id: str, now: datetime, temperature: bool = False
    ) -> tuple[str | None, datetime | None]:
        """Wert eines Raum-Geräts mit Überbrückung kurzer Aussetzer: (Wert, gilt seit)."""
        st = self.hass.states.get(entity_id)
        value = None
        changed = st.last_changed if st is not None else None
        if st is not None and st.state not in BAD_STATES:
            value = st.state
            if temperature and entity_id.startswith("climate."):
                raw = st.attributes.get("current_temperature")
                value = None if raw in BAD_STATES else str(raw)
        entry = health.track(self.health.get(entity_id), value, changed, now)
        self.health[entity_id] = entry
        return health.reading(entry, now, self.config["parameters"]["sensor_hold_min"])

    def _name(self, entity_id: str) -> str:
        st = self.hass.states.get(entity_id)
        return st.name if st else entity_id

    def _room_humidity(self, room: dict, now: datetime, seen: set[str], is_open: bool) -> dict:
        """Höchste Feuchte im Raum, Feucht-Lüften erkennen (humidity.py)."""
        values = []
        for entity_id in room.get("humidity_sensors") or []:
            seen.add(entity_id)
            if entity_id.startswith("climate."):
                raw = self._float(entity_id, "current_humidity")
                self._reading(entity_id, now)  # Ausfall-Statistik
            else:
                text, _ = self._reading(entity_id, now)
                try:
                    raw = float(text) if text is not None else None
                except ValueError:
                    raw = None
            if raw is not None:
                values.append(raw)
        if not room.get("humidity_sensors"):
            self._humid.pop(room["id"], None)
            return {"humidity": None, "ventilating": False, "alert_from": None}
        entry, info = humidity.update(
            self._humid.get(room["id"]),
            now,
            max(values) if values else None,
            is_open,
            room.get("ventilate_humidity", 0),
            room.get("ventilate_rise", 0),
            self.config["notifications"]["ventilate_max_min"],
        )
        self._humid[room["id"]] = entry
        return info

    def observe(self, now: datetime, config: dict | None = None) -> engine.Observation:
        config = config or effective_config(self.config)
        rooms = {}
        seen: set[str] = set()
        for room in config["rooms"]:
            total = weight = 0.0
            missing = 0
            for sensor in room["temperature_sensors"]:
                seen.add(sensor["entity"])
                raw, _ = self._reading(sensor["entity"], now, temperature=True)
                try:
                    value = float(raw) if raw is not None else None
                except ValueError:
                    value = None
                if value is None:
                    missing += 1
                    continue
                value += sensor.get("offset") or 0.0
                total += value * sensor["weight"]
                weight += sensor["weight"]
            temperature = round(total / weight, 2) if weight else None
            for entity_id in room["radiators"]:
                seen.add(entity_id)
                self._reading(entity_id, now)  # nur für die Ausfall-Statistik
            open_since = open_entity = open_name = None
            for entity_id in room["openings"]:
                seen.add(entity_id)
                value, since = self._reading(entity_id, now)
                if (
                    value == STATE_ON
                    and since is not None
                    and (open_since is None or since < open_since)
                ):
                    open_since = since
                    open_entity = entity_id
                    open_name = self._name(entity_id)
            if open_since is not None:
                self._open_seen[room["id"]] = open_since
            elif (opened := self._open_seen.pop(room["id"], None)) is not None:
                self._closed[room["id"]] = (now, (now - opened).total_seconds() / 60)
            closed_at, open_minutes = self._closed.get(room["id"], (None, 0.0))
            occupied = empty_since = None
            presence = []
            for entity_id in room["presence"]:
                seen.add(entity_id)
                value, since = self._reading(entity_id, now)
                if value is not None and since is not None:
                    presence.append((value, since))
            if presence:
                occupied = any(v == STATE_ON for v, _ in presence)
                if not occupied:
                    empty_since = max(t for _, t in presence)
            hum = self._room_humidity(room, now, seen, open_since is not None)
            rooms[room["id"]] = engine.RoomObs(
                temperature=temperature,
                sensors_missing=missing,
                open_since=open_since,
                open_entity=open_entity,
                open_name=open_name,
                closed_at=closed_at,
                last_open_minutes=open_minutes,
                occupied=occupied,
                empty_since=empty_since,
                humidity=hum["humidity"],
                ventilating=hum["ventilating"],
                alert_from=hum["alert_from"],
            )

        # Geräte, die nicht mehr (oder pausiert) eingetragen sind, vergessen
        self.health = {k: v for k, v in self.health.items() if k in seen}

        sc = self.config["stove"]
        stove = engine.StoveObs()
        st = self._state(sc["climate"])
        if st is not None:
            stove = engine.StoveObs(
                available=True,
                on=st.state != "off",
                burning=st.attributes.get("hvac_action") == "heating",
            )
        err = self._state(sc["error_sensor"])
        stove.error = err is not None and err.state == STATE_ON
        eco = self._state(sc["eco_switch"])
        stove.eco_on = None if eco is None else eco.state == STATE_ON
        stove.has_power = self._state(sc["power"]) is not None
        stove.water_c = self._float(sc["water_sensor"])
        ign = self._float(sc["ignitions_sensor"])
        stove.ignitions = None if ign is None else int(ign)
        st = self._state(self.config["workday"])
        workday = None if st is None else st.state == STATE_ON
        outdoor = self._float(self.config["outdoor_sensor"])
        if outdoor is None and self.config["weather"]:
            outdoor = self._float(self.config["weather"], "temperature")
        st = self._state(self.config["stove"]["chrono_switch"])
        chrono = None if st is None else st.state == STATE_ON
        return engine.Observation(
            now=now,
            rooms=rooms,
            stove=stove,
            workday=workday,
            outdoor_c=outdoor,
            chrono_on=chrono,
        )

    # --- Auswerten und Schalten ---------------------------------------------------
    async def async_evaluate(self) -> dict:
        async with self._lock:
            return await self._evaluate()

    async def _evaluate(self) -> dict:
        now = dt_util.now()
        config = effective_config(self.config)
        obs = self.observe(now, config)
        result = engine.evaluate(config, self.state, obs)
        self.state = result.state
        shadow = self.config["mode"] != MODE_ACTIVE
        for text in result.log:
            self._add_log(now, text, shadow)
        if not shadow:
            await self._execute(result.actions, now)
        await self._notify_alerts(result.status["alerts"], now)
        await self._notify_stove_error(obs, now)
        await self._notify_overheat(result.status["stove"], now)
        if not shadow:
            for text in result.notices:
                await self._notify("too_warm", "too_warm", text, now)
        sensor_alerts = await self._check_sensors(now, config, obs, result.status)
        pellet_status = await self._track_pellets(now, obs)
        await self._flush_held(now, result.status["alerts"])
        self._track_history(now, result.status, obs, pellet_status)
        hold = self.config["parameters"]["sensor_hold_min"]
        self.status = {
            **result.status,
            "alerts": [*result.status["alerts"], *sensor_alerts],
            "devices": {
                entity_id: health.summary(entry, now, hold)
                for entity_id, entry in self.health.items()
            },
            "pellets": pellet_status,
            "log": list(reversed(self.log[-50:])),
        }
        self._save_state()
        async_dispatcher_send(self.hass, SIGNAL_UPDATE)
        for cb in list(self._subscribers):
            cb(self.status)
        return self.status

    def _track_history(
        self, now: datetime, status: dict, obs: engine.Observation, pellet_status: dict
    ) -> None:
        """Alle HISTORY_STEP_MIN Minuten einen Punkt für die Grafik merken."""
        self._burned_in_step = self._burned_in_step or obs.stove.burning
        step = timedelta(minutes=HISTORY_STEP_MIN)
        slot = now.replace(
            minute=now.minute - now.minute % HISTORY_STEP_MIN, second=0, microsecond=0
        )
        if self.history and dt_util.parse_datetime(self.history[-1]["t"]) >= slot:
            return
        house = status.get("house") or {}
        self.history.append(
            {
                "t": slot.isoformat(),
                "house_c": house.get("temperature_c"),
                "target_c": house.get("target_c"),
                "outdoor_c": None if obs.outdoor_c is None else round(obs.outdoor_c, 1),
                "burning": self._burned_in_step,
                "pellets_kg": pellet_status.get("stock_kg"),
                "water_c": None if obs.stove.water_c is None else round(obs.stove.water_c, 1),
                "rooms": {
                    r["id"]: None if r["temperature"] is None else round(r["temperature"], 1)
                    for r in status.get("rooms") or []
                },
            }
        )
        self._burned_in_step = obs.stove.burning
        keep = int(HISTORY_HOURS * 60 / HISTORY_STEP_MIN)
        cutoff = now - timedelta(hours=HISTORY_HOURS) - step
        self.history = [p for p in self.history[-keep:] if dt_util.parse_datetime(p["t"]) > cutoff]

    def history_points(self, hours: float = 24) -> list[dict[str, Any]]:
        cutoff = dt_util.now() - timedelta(hours=hours)
        return [p for p in self.history if dt_util.parse_datetime(p["t"]) >= cutoff]

    def _add_log(self, now: datetime, text: str, shadow: bool) -> None:
        self.log.append({"time": now.isoformat(), "text": text, "shadow": shadow})
        del self.log[:-LOG_LENGTH]
        _LOGGER.info("%s%s", "[Schatten] " if shadow else "", text)

    async def _call(self, domain: str, service: str, data: dict, now: datetime) -> None:
        try:
            await self.hass.services.async_call(domain, service, data, blocking=True)
        except Exception as err:
            self._add_log(now, f"Befehl {domain}.{service} fehlgeschlagen: {err}", False)

    async def _set_power(self, level: int, now: datetime) -> None:
        entity_id = self.config["stove"]["power"]
        st = self._state(entity_id)
        if st is None:
            return
        domain = entity_id.split(".", 1)[0]
        if domain in ("number", "input_number"):
            await self._call(domain, "set_value", {"entity_id": entity_id, "value": level}, now)
            return
        options = [str(o) for o in st.attributes.get("options", [])]
        option = next((o for o in options if o.strip() == str(level)), None)
        if option is None:  # z. B. "Stufe 1"…: nach Ziffer suchen, sonst nach Position
            option = next((o for o in options if str(level) in o), None)
        if option is None and options:
            option = options[min(level, len(options)) - 1]
        if option is not None:
            await self._call(
                domain, "select_option", {"entity_id": entity_id, "option": option}, now
            )

    async def _execute(self, actions: list[tuple], now: datetime) -> None:
        stove = self.config["stove"]["climate"]
        setpoint = self.config["parameters"]["stove_block_setpoint_c"]
        for action in actions:
            if action[0] == "stove_start" and stove:
                await self._call(
                    "climate",
                    "set_temperature",
                    {"entity_id": stove, "temperature": setpoint},
                    now,
                )
                await self._call(
                    "climate",
                    "set_hvac_mode",
                    {"entity_id": stove, "hvac_mode": "heat"},
                    now,
                )
            elif action[0] == "stove_stop" and stove:
                await self._call(
                    "climate",
                    "set_hvac_mode",
                    {"entity_id": stove, "hvac_mode": "off"},
                    now,
                )
            elif action[0] == "stove_power":
                await self._set_power(action[1], now)
            elif action[0] in ("chrono_off", "eco_off"):
                key = "chrono_switch" if action[0] == "chrono_off" else "eco_switch"
                if entity_id := self.config["stove"][key]:
                    await self._call("switch", "turn_off", {"entity_id": entity_id}, now)
                    self._add_log(
                        now,
                        f"{'Chrono' if key == 'chrono_switch' else 'Eco'} des Ofens ausgeschaltet",
                        False,
                    )
            elif action[0] == "radiator":
                await self._call(
                    "climate",
                    "set_temperature",
                    {"entity_id": action[1], "temperature": action[2]},
                    now,
                )

    # --- Benachrichtigungen ---------------------------------------------------------
    async def _notify(self, kind: str, key: str, text: str, now: datetime) -> None:
        """Eine Meldung nach den Einstellungen senden, sammeln oder verwerfen."""
        decision = messages.decide(self.config["notifications"], kind, self._sent.get(key), now)
        if decision == "hold":
            self._held[key] = (kind, text)
        elif decision == "send":
            self._sent[key] = now
            await self._send_notify(text)

    def _opening_due(self, alerts: list[dict]) -> list[dict]:
        delay = self.config["notifications"]["opening_delay_min"]
        return [a for a in alerts if a["kind"] == "opening" and a["minutes"] >= delay]

    async def _notify_alerts(self, alerts: list[dict], now: datetime) -> None:
        due = self._opening_due(alerts)
        keys = {f"{a['kind']}:{a['room']}" for a in due}
        new = [a for a in due if f"{a['kind']}:{a['room']}" not in self._notified]
        self._notified = keys
        for alert in new:
            key = f"{alert['kind']}:{alert['room']}"
            await self._notify(alert["kind"], key, alert["message"], now)

    async def _notify_stove_error(self, obs: engine.Observation, now: datetime) -> None:
        error = bool(obs.stove.available and obs.stove.error)
        if error and not self._was_stove_error:
            await self._notify("stove_error", "stove_error", "Der Ofen meldet eine Störung.", now)
        self._was_stove_error = error

    async def _notify_overheat(self, stove: dict, now: datetime) -> None:
        overheat = bool(stove.get("overheat"))
        if overheat and not self._was_overheat:
            water = stove.get("water_c")
            text = (
                f"Kesselschutz: Wasser {water:.0f} °C. Der Ofen bleibt aus, alle Heizkörper "
                "sind offen, bis das Wasser abgekühlt ist."
                if water is not None
                else "Kesselschutz: Wasser zu heiß. Der Ofen bleibt aus."
            )
            await self._notify("overheat", "overheat", text, now)
        self._was_overheat = overheat

    async def _flush_held(self, now: datetime, alerts: list[dict]) -> None:
        """Nach der Ruhezeit: Gesammeltes in einer Nachricht schicken."""
        if not self._held or messages.in_quiet(self.config["notifications"], now):
            return
        current = {f"{a['kind']}:{a['room']}": a["message"] for a in self._opening_due(alerts)}
        texts = []
        for key, (kind, text) in self._held.items():
            if kind == "opening":
                if key not in current:
                    continue  # inzwischen wieder zu
                text = current[key]
            texts.append(text)
            self._sent[key] = now
        self._held = {}
        if texts:
            await self._send_notify(messages.bundle(texts))

    async def _check_sensors(
        self, now: datetime, config: dict, obs: engine.Observation, status: dict
    ) -> list[dict]:
        """Lange Ausfälle und unglaubwürdige Fenster melden (Hinweis, schaltet nichts)."""
        p = self.config["parameters"]
        alerts: list[dict] = []
        room_of = {}
        for room in config["rooms"]:
            for e in (
                room["radiators"]
                + room["openings"]
                + room["presence"]
                + room.get("humidity_sensors", [])
                + [s["entity"] for s in room["temperature_sensors"]]
            ):
                room_of.setdefault(e, room)
        # Ausfälle: eine Meldung je Sensor und Tag, mehrere gesammelt
        due = health.due_alerts(self.health, list(room_of), now, p["sensor_alert_min"])
        for entity_id, entry in self.health.items():
            if (
                entity_id in room_of
                and p["sensor_alert_min"] > 0
                and health.down_minutes(entry, now) >= p["sensor_alert_min"]
            ):
                room = room_of[entity_id]
                minutes = int(health.down_minutes(entry, now))
                alerts.append(
                    {
                        "kind": "sensor",
                        "room": room["id"],
                        "entity": entity_id,
                        "minutes": minutes,
                        "message": (
                            f"{self._name(entity_id)} ({room['name']}) "
                            f"seit {minutes} min nicht erreichbar"
                        ),
                    }
                )
        if due:
            names = ", ".join(f"{self._name(e)} ({room_of[e]['name']})" for e in due)
            since = f"{p['sensor_alert_min']:g} min"
            text = (
                f"Nicht erreichbar seit über {since}: {names}. "
                "Bis zur Rückkehr zählt ein Fenster als zu, ein Fühler wird weggelassen."
            )
            self._add_log(now, text, False)
            await self._notify("sensor", "sensor:" + ",".join(sorted(due)), text, now)
        # Fenster lange offen, Raum kühlt nicht ab: Sensor prüfen
        rooms_status = {r["id"]: r for r in status["rooms"]}
        for room in config["rooms"]:
            rid = room["id"]
            ro = obs.rooms.get(rid)
            if (
                ro is None
                or ro.open_since is None
                or ro.ventilating
                or not rooms_status.get(rid, {}).get("open")
            ):
                self._open_track.pop(rid, None)
                continue
            track = health.opening_check(self._open_track.get(rid), now, ro.temperature)
            if track is None:
                continue
            if health.opening_implausible(track, now, p["opening_check_min"], OPENING_CHECK_DROP_K):
                track["warned"] = True
                minutes = int((now - ro.open_since).total_seconds() / 60)
                text = (
                    f"{ro.open_name or 'Öffnung'} ({room['name']}) meldet seit {minutes} min "
                    "offen, der Raum kühlt aber nicht ab. Sensor prüfen? "
                    "Der Raum bleibt auf Frostschutz, bis das Fenster zu meldet oder du "
                    "den Sensor pausierst."
                )
                self._add_log(now, text, False)
                await self._notify("opening_check", f"opening_check:{rid}", text, now)
            self._open_track[rid] = track
            if track["warned"]:
                alerts.append(
                    {
                        "kind": "opening_check",
                        "room": rid,
                        "entity": ro.open_entity,
                        "minutes": int((now - ro.open_since).total_seconds() / 60),
                        "message": (
                            f"{ro.open_name or 'Öffnung'} ({room['name']}) meldet offen, "
                            "Raum kühlt nicht ab. Sensor prüfen?"
                        ),
                    }
                )
        return alerts

    # --- Bedienung -----------------------------------------------------------------
    def _next_schedule_change(self, now: datetime) -> datetime:
        _, hhmm = engine.scene_at(self.config, now, None)
        hour, minute = (int(x) for x in (hhmm or "00:00").split(":"))
        change = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if change <= now:
            change += timedelta(days=1)
        return change

    async def async_set_override(self, scene: str | None, minutes: float | None = None) -> dict:
        now = dt_util.now()
        if scene is None:
            self.state["override"] = None
            self._add_log(now, "Szene wieder nach Zeitplan", self.config["mode"] != MODE_ACTIVE)
        else:
            names = {s["id"]: s["name"] for s in self.config["scenes"]}
            if scene not in names:
                raise model.ConfigError(f"Unbekannte Szene {scene}")
            if minutes is None:
                until = self._next_schedule_change(now)
            else:
                if not 1 <= minutes <= MAX_OVERRIDE_MIN:
                    raise model.ConfigError(f"Dauer zwischen 1 und {MAX_OVERRIDE_MIN} min")
                until = now + timedelta(minutes=minutes)
            self.state["override"] = {"scene": scene, "until": until.isoformat()}
            self._add_log(
                now,
                f"Szene „{names[scene]}“ bis {until.strftime('%H:%M')}",
                self.config["mode"] != MODE_ACTIVE,
            )
        return await self.async_evaluate()

    async def async_learn_reset(self) -> dict:
        """Gelerntes Zusammenspiel Kessel/Heizkörper vergessen."""
        now = dt_util.now()
        self.state["learn"] = learning.reset(self.state.get("learn"))
        self._add_log(now, "Gelernte Werte zurückgesetzt", self.config["mode"] != MODE_ACTIVE)
        return await self.async_evaluate()

    async def async_pause(self, minutes: float) -> dict:
        now = dt_util.now()
        if not 0 <= minutes <= MAX_PAUSE_MIN:
            raise model.ConfigError(f"Pause zwischen 0 und {MAX_PAUSE_MIN} min")
        self.state["pause_until"] = (
            (now + timedelta(minutes=minutes)).isoformat() if minutes else None
        )
        self._add_log(
            now,
            f"Ofen pausiert für {int(minutes)} min" if minutes else "Pause aufgehoben",
            self.config["mode"] != MODE_ACTIVE,
        )
        return await self.async_evaluate()

    async def async_boost(self, delta: float, minutes: float) -> dict:
        now = dt_util.now()
        if not minutes or not delta:
            self.state["boost"] = None
        else:
            if not -MAX_BOOST_K <= delta <= MAX_BOOST_K or not 1 <= minutes <= MAX_BOOST_MIN:
                raise model.ConfigError("Anpassung höchstens ±3 K und 6 Stunden")
            until = now + timedelta(minutes=minutes)
            self.state["boost"] = {"delta": delta, "until": until.isoformat()}
            self._add_log(
                now,
                f"Alle Ziele {delta:+.1f} K bis {until.strftime('%H:%M')}".replace(".", ","),
                self.config["mode"] != MODE_ACTIVE,
            )
        return await self.async_evaluate()

    async def async_warmup(
        self,
        minutes: float | None = None,
        arrive: str | None = None,
        cancel: bool = False,
        source: str | None = None,
        cold: bool = False,
    ) -> dict:
        """Haus aufheizen: jetzt für minutes oder rechtzeitig vor der Ankunft (HH:MM).

        source sagt im Protokoll, wer es ausgelöst hat (Seite, Knopf, Dienst).
        """
        by = f" ({source})" if source else ""
        now = dt_util.now()
        shadow = self.config["mode"] != MODE_ACTIVE
        if cancel:
            if self.state.get("warmup"):
                self._add_log(now, "Aufheizen abgebrochen" + by, shadow)
            self.state["warmup"] = None
            return await self.async_evaluate()
        lead = timedelta(minutes=self.config["parameters"]["warmup_lead_min"])
        if cold:
            arrive = None
            if minutes is None:
                minutes = self.config["parameters"]["cold_min"]
        if arrive:
            try:
                hh, mm = (int(x) for x in str(arrive).split(":"))
                when = now.replace(hour=hh, minute=mm, second=0, microsecond=0)
            except ValueError as err:
                raise model.ConfigError("Ankunft im Format HH:MM") from err
            if when <= now:
                when += timedelta(days=1)
            start = max(now, when - lead)
            until = when + timedelta(minutes=WARMUP_AFTER_ARRIVAL_MIN)
            text = f"Aufheizen für die Ankunft um {when.strftime('%H:%M')}" + (
                f", Beginn {start.strftime('%H:%M')}" if start > now else ", Beginn jetzt"
            )
            arrive_iso = when.isoformat()
        else:
            minutes = float(minutes if minutes is not None else 90)
            if not MIN_WARMUP_MIN <= minutes <= MAX_WARMUP_MIN:
                raise model.ConfigError(
                    f"Aufheizen zwischen {MIN_WARMUP_MIN} und {MAX_WARMUP_MIN} min"
                )
            start = now
            until = now + timedelta(minutes=minutes)
            text = (
                f"Mir ist kalt: wärmer bis {until.strftime('%H:%M')}, die Wärmeregie "
                "entscheidet, ob Restwärme reicht oder der Ofen startet"
                if cold
                else f"Aufheizen jetzt bis {until.strftime('%H:%M')}"
            )
            arrive_iso = None
        self.state["warmup"] = {
            "start_at": start.isoformat(),
            "until": until.isoformat(),
            "arrive": arrive_iso,
            "started": False,
            "cold": bool(cold),
        }
        # wer aufheizen will, will keine Pause von Hand mehr
        self.state["pause_until"] = None
        self._add_log(now, text + by, shadow)
        return await self.async_evaluate()

    async def async_set_mode(self, mode: str) -> dict:
        if mode not in (MODE_SHADOW, MODE_ACTIVE):
            raise model.ConfigError("Betriebsart ungültig")
        raw = {**self.config, "mode": mode}
        await self.async_save_config(raw)
        return self.status

    def _mode_changed(self, mode: str) -> None:
        """Beim Umschalten nichts Gedachtes übernehmen."""
        now = dt_util.now()
        self.state["block_start"] = None
        self.state["radiators"] = {}
        self.state["prepare_since"] = None
        self.state["start_cmd"] = None
        self.state["self_off_since"] = None
        self.state["reignite_watch"] = None
        self.state["block_manual"] = False
        self._add_log(
            now,
            "Aktiver Betrieb: die Wärmeregie schaltet jetzt"
            if mode == MODE_ACTIVE
            else "Schattenbetrieb: es wird nur noch gerechnet",
            mode != MODE_ACTIVE,
        )

    # --- Abonnenten -----------------------------------------------------------------
    @callback
    def subscribe(self, cb: Callable[[dict], None]) -> CALLBACK_TYPE:
        self._subscribers.append(cb)

        @callback
        def _remove() -> None:
            if cb in self._subscribers:
                self._subscribers.remove(cb)

        return _remove

    # --- Pelletvorrat -------------------------------------------------------------
    async def _track_pellets(self, now: datetime, obs: engine.Observation) -> dict:
        """Brennzeit mitzählen, Störung bei fast leerem Behälter als „leer“ werten,
        Erinnerung schicken. Läuft auch im Schattenbetrieb (es wird nur gemessen)."""
        params = self.config["parameters"]
        self.pellets = pellets.update(self.pellets, now, obs.stove.burning)
        error = bool(obs.stove.available and obs.stove.error)
        if error and not self._was_error:
            est = pellets.estimate(self.pellets, params)
            if est is not None and est <= max(float(params["pellet_reminder_kg"]), 2.0):
                self.pellets, text = pellets.mark_empty(self.pellets, now)
                self._add_log(now, f"Störung bei fast leerem Behälter. {text}", False)
        self._was_error = error
        fc = pellets.forecast(self.pellets, params, now)
        if fc["remind"]:
            self.pellets["reminded"] = True
            when = dt_util.parse_datetime(fc["empty_at"]) if fc["empty_at"] else None
            msg = (
                f"Pellets: noch etwa {fc['stock_kg']:g} kg im Behälter"
                + (f", reicht bis ca. {when:%a %d.%m. %H:%M}" if when else "")
                + ". Bitte einen Sack nachfüllen."
            )
            self._add_log(now, msg, False)
            await self._notify("pellets", "pellets", msg, now)
        return fc

    async def _send_notify(self, message: str) -> None:
        for service in self.config["notify"]:
            domain, name = service.split(".", 1)
            try:
                await self.hass.services.async_call(
                    domain, name, {"title": "Wärmeregie", "message": message}, blocking=False
                )
            except Exception as err:
                _LOGGER.warning("Benachrichtigung %s fehlgeschlagen: %s", service, err)

    async def async_pellets_refill(self, kg: float | None = None) -> dict:
        now = dt_util.now()
        params = self.config["parameters"]
        amount = float(kg if kg is not None else params["pellet_bag_kg"])
        if not 0 < amount <= float(params["pellet_capacity_kg"]):
            raise model.ConfigError("Nachfüllmenge muss größer 0 und höchstens der Behälter sein")
        self.pellets = pellets.update(self.pellets, now, self.pellets["last_burning"])
        self.pellets = pellets.refill(self.pellets, now, amount, params)
        self._add_log(now, f"Pellets nachgefüllt: {amount:g} kg", False)
        return await self.async_evaluate()

    async def async_pellets_set(self, kg: float, from_empty: bool = False) -> dict:
        now = dt_util.now()
        if not 0 <= kg <= float(self.config["parameters"]["pellet_capacity_kg"]):
            raise model.ConfigError("Vorrat muss zwischen 0 und dem Fassungsvermögen liegen")
        self.pellets = pellets.update(self.pellets, now, self.pellets["last_burning"])
        self.pellets = pellets.set_stock(self.pellets, now, kg, from_empty)
        self._add_log(
            now,
            f"Pelletvorrat gesetzt: {kg:g} kg" + (" (Behälter war leer)" if from_empty else ""),
            False,
        )
        return await self.async_evaluate()

    async def async_pellets_empty(self) -> dict:
        now = dt_util.now()
        self.pellets = pellets.update(self.pellets, now, self.pellets["last_burning"])
        self.pellets, text = pellets.mark_empty(self.pellets, now)
        self._add_log(now, text, False)
        return await self.async_evaluate()
