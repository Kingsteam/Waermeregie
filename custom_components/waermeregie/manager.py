"""Verbindung der Regel-Logik mit Home Assistant.

- Einstellungen und Laufzustand liegen im versionierten Store.
- Entitäten werden intern über die ID aus dem Entitätsregister gespeichert,
  nach außen (Oberfläche, Regel) als entity_id verwendet.
- Im Schattenbetrieb wird nur gerechnet und protokolliert, nichts geschaltet.
"""

from __future__ import annotations

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

from . import engine, model
from .const import (
    DEBOUNCE_S,
    DOMAIN,
    EVALUATE_INTERVAL_S,
    LOG_LENGTH,
    MAX_BOOST_K,
    MAX_BOOST_MIN,
    MAX_OVERRIDE_MIN,
    MAX_PAUSE_MIN,
    MODE_ACTIVE,
    MODE_SHADOW,
    STORAGE_KEY_CONFIG,
    STORAGE_KEY_STATE,
    STORAGE_VERSION,
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
        for key in ("radiators", "openings", "presence"):
            for i in range(len(room[key])):
                out.append((room[key], i))
        for sensor in room["temperature_sensors"]:
            out.append((sensor, "entity"))
    return out


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
            for key in ("radiators", "openings", "presence"):
                room[key] = [e for e in room[key] if e]
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
        self._state_store.async_delay_save(lambda: {**self.state, "log": self.log}, 2)

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
        await self._state_store.async_save({**self.state, "log": self.log})

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

    def observe(self, now: datetime) -> engine.Observation:
        rooms = {}
        for room in self.config["rooms"]:
            total = weight = 0.0
            missing = 0
            for sensor in room["temperature_sensors"]:
                value = self._float(sensor["entity"])
                if value is None:
                    missing += 1
                    continue
                total += value * sensor["weight"]
                weight += sensor["weight"]
            temperature = round(total / weight, 2) if weight else None
            open_since = open_entity = open_name = None
            for entity_id in room["openings"]:
                st = self.hass.states.get(entity_id)
                if (
                    st
                    and st.state == STATE_ON
                    and (open_since is None or st.last_changed < open_since)
                ):
                    open_since = st.last_changed
                    open_entity = entity_id
                    open_name = st.name
            occupied = empty_since = None
            presence_states = [self.hass.states.get(e) for e in room["presence"]]
            presence_states = [s for s in presence_states if s and s.state not in BAD_STATES]
            if presence_states:
                occupied = any(s.state == STATE_ON for s in presence_states)
                if not occupied:
                    empty_since = max(s.last_changed for s in presence_states)
            rooms[room["id"]] = engine.RoomObs(
                temperature=temperature,
                sensors_missing=missing,
                open_since=open_since,
                open_entity=open_entity,
                open_name=open_name,
                occupied=occupied,
                empty_since=empty_since,
            )

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
        now = dt_util.now()
        result = engine.evaluate(self.config, self.state, self.observe(now))
        self.state = result.state
        shadow = self.config["mode"] != MODE_ACTIVE
        for text in result.log:
            self._add_log(now, text, shadow)
        if not shadow:
            await self._execute(result.actions, now)
        await self._notify_alerts(result.status["alerts"])
        self.status = {**result.status, "log": list(reversed(self.log[-50:]))}
        self._save_state()
        async_dispatcher_send(self.hass, SIGNAL_UPDATE)
        for cb in list(self._subscribers):
            cb(self.status)
        return self.status

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

    async def _notify_alerts(self, alerts: list[dict]) -> None:
        keys = {f"{a['kind']}:{a['room']}" for a in alerts}
        new = [a for a in alerts if f"{a['kind']}:{a['room']}" not in self._notified]
        self._notified = keys
        for alert in new:
            for service in self.config["notify"]:
                domain, name = service.split(".", 1)
                try:
                    await self.hass.services.async_call(
                        domain,
                        name,
                        {"title": "Wärmeregie", "message": alert["message"]},
                        blocking=False,
                    )
                except Exception as err:
                    _LOGGER.warning("Benachrichtigung über %s fehlgeschlagen: %s", service, err)

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
