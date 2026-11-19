"""Datenmodell der Einstellungen: Standardwerte und vollständige Prüfung.

Reine Funktionen ohne Home Assistant, damit sie einfach testbar sind.
Änderungen am Modell immer so: Kopie -> validate() -> speichern.
"""

from __future__ import annotations

import copy
import re
from typing import Any

from .const import (
    DEFAULT_PARAMETERS,
    MODE_ACTIVE,
    MODE_SHADOW,
    PARAMETER_LIMITS,
    ROOM_TARGET_LIMITS,
    STOVE_ALLOW,
    STOVE_DENY,
    STOVE_FROST_ONLY,
    WEEKDAYS,
)

ID_RE = re.compile(r"^[a-z0-9_]{1,40}$")
TIME_RE = re.compile(r"^([01]\d|2[0-3]):[0-5]\d$")


# Ofen-Funktionen: Schlüssel -> erlaubte Domains, Bezeichnung
STOVE_FIELDS: dict[str, tuple[tuple[str, ...], str]] = {
    "climate": (("climate",), "Ofen-Thermostat"),
    "power": (("select", "number", "input_select", "input_number"), "Leistungsstufe"),
    "chrono_switch": (("switch",), "Chrono des Ofens"),
    "eco_switch": (("switch",), "Eco des Ofens"),
    "error_sensor": (("binary_sensor",), "Störung des Ofens"),
    "water_sensor": (("sensor",), "Wassertemperatur"),
    "ignitions_sensor": (("sensor",), "Zündzähler"),
}
STOVE_KEYS = tuple(STOVE_FIELDS)


class ConfigError(ValueError):
    """Einstellungen ungültig. Text ist für Menschen gedacht (Deutsch)."""


def default_config() -> dict[str, Any]:
    """Startzustand: Szenen und Tagesarten als Vorschlag, noch keine Räume."""
    return {
        "stove": dict.fromkeys(STOVE_KEYS),
        "weather": None,
        "outdoor_sensor": None,
        "workday": None,
        "persons": [],
        "pet": None,
        "notify": [],
        "rooms": [],
        "scenes": [
            {
                "id": "komfort",
                "name": "Komfort",
                "icon": "mdi:sofa",
                "stove": STOVE_ALLOW,
                "default_target": 21.0,
            },
            {
                "id": "sparen",
                "name": "Sparen",
                "icon": "mdi:leaf",
                "stove": STOVE_ALLOW,
                "default_target": 19.5,
            },
            {
                "id": "homeoffice",
                "name": "Homeoffice",
                "icon": "mdi:laptop",
                "stove": STOVE_ALLOW,
                "default_target": 19.5,
            },
            {
                "id": "nacht",
                "name": "Nacht",
                "icon": "mdi:weather-night",
                "stove": STOVE_FROST_ONLY,
                "default_target": 18.0,
            },
            {
                "id": "abwesend",
                "name": "Abwesend",
                "icon": "mdi:home-export-outline",
                "stove": STOVE_FROST_ONLY,
                "default_target": 18.0,
            },
            {
                "id": "urlaub",
                "name": "Urlaub",
                "icon": "mdi:airplane",
                "stove": STOVE_FROST_ONLY,
                "default_target": 12.0,
            },
        ],
        "day_types": [
            {
                "id": "buero",
                "name": "Bürotag",
                "slots": [
                    {"start": "06:00", "scene": "komfort"},
                    {"start": "07:45", "scene": "abwesend"},
                    {"start": "17:00", "scene": "komfort"},
                    {"start": "22:30", "scene": "nacht"},
                ],
            },
            {
                "id": "homeoffice",
                "name": "Homeoffice",
                "slots": [
                    {"start": "06:30", "scene": "komfort"},
                    {"start": "08:00", "scene": "homeoffice"},
                    {"start": "17:30", "scene": "komfort"},
                    {"start": "22:30", "scene": "nacht"},
                ],
            },
            {
                "id": "wochenende",
                "name": "Wochenende",
                "slots": [
                    {"start": "08:00", "scene": "komfort"},
                    {"start": "23:00", "scene": "nacht"},
                ],
            },
        ],
        "week": {
            "mon": "buero",
            "tue": "buero",
            "wed": "homeoffice",
            "thu": "buero",
            "fri": "homeoffice",
            "sat": "wochenende",
            "sun": "wochenende",
            "holiday": "wochenende",
        },
        "parameters": dict(DEFAULT_PARAMETERS),
        "mode": MODE_SHADOW,
    }


def limits() -> dict[str, Any]:
    """Grenzen für die Oberfläche."""
    return {
        "parameters": {k: list(v) for k, v in PARAMETER_LIMITS.items()},
        "room_target": list(ROOM_TARGET_LIMITS),
    }


def _num(value: Any, what: str) -> float:
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ConfigError(f"{what}: Zahl erwartet")
    return float(value)


def _entity(value: Any, domains: tuple[str, ...], what: str, optional: bool = True) -> str | None:
    if value in (None, ""):
        if optional:
            return None
        raise ConfigError(f"{what} fehlt")
    if not isinstance(value, str) or "." not in value:
        raise ConfigError(f"{what}: keine gültige Entität")
    if value.split(".", 1)[0] not in domains:
        raise ConfigError(f"{what}: {value} ist keine {' oder '.join(domains)}-Entität")
    return value


def _entities(values: Any, domains: tuple[str, ...], what: str) -> list[str]:
    if values is None:
        return []
    if not isinstance(values, list):
        raise ConfigError(f"{what}: Liste erwartet")
    out = [_entity(v, domains, what, optional=False) for v in values]
    if len(set(out)) != len(out):
        raise ConfigError(f"{what}: Eintrag doppelt")
    return out  # type: ignore[return-value]


def _id(value: Any, what: str) -> str:
    if not isinstance(value, str) or not ID_RE.match(value):
        raise ConfigError(f"{what}: ID nur aus a-z, 0-9 und _ (max. 40 Zeichen)")
    return value


def _name(value: Any, what: str) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > 60:
        raise ConfigError(f"{what}: Name fehlt oder ist zu lang")
    return value.strip()


def _target(value: Any, what: str) -> float:
    v = _num(value, what)
    lo, hi = ROOM_TARGET_LIMITS
    if not lo <= v <= hi:
        raise ConfigError(f"{what}: {v} °C liegt außerhalb {lo}-{hi} °C")
    return round(v * 2) / 2


def validate(raw: Any) -> dict[str, Any]:
    """Komplette Einstellungen prüfen und bereinigt zurückgeben."""
    if not isinstance(raw, dict):
        raise ConfigError("Einstellungen fehlen")
    cfg = copy.deepcopy(raw)
    base = default_config()
    out: dict[str, Any] = {}

    stove = cfg.get("stove") or {}
    if "power_select" in stove and "power" not in stove:  # älterer Name
        stove = {**stove, "power": stove["power_select"]}
    out["stove"] = {
        key: _entity(stove.get(key), domains, label)
        for key, (domains, label) in STOVE_FIELDS.items()
    }
    out["weather"] = _entity(cfg.get("weather"), ("weather",), "Wetter")
    out["outdoor_sensor"] = _entity(cfg.get("outdoor_sensor"), ("sensor",), "Außenfühler")
    out["workday"] = _entity(cfg.get("workday"), ("binary_sensor",), "Arbeitstag")
    out["persons"] = _entities(
        cfg.get("persons"), ("person", "device_tracker", "binary_sensor"), "Personen"
    )
    out["pet"] = _entity(cfg.get("pet"), ("binary_sensor", "device_tracker", "person"), "Haustier")
    notify = cfg.get("notify") or []
    if not isinstance(notify, list) or not all(
        isinstance(n, str) and n.startswith("notify.") for n in notify
    ):
        raise ConfigError("Benachrichtigung: nur Dienste der Form notify.xyz")
    out["notify"] = list(dict.fromkeys(notify))

    # Szenen
    scenes = cfg.get("scenes")
    if not isinstance(scenes, list) or not scenes:
        raise ConfigError("Mindestens eine Szene nötig")
    out["scenes"] = []
    for i, sc in enumerate(scenes):
        what = f"Szene {i + 1}"
        if not isinstance(sc, dict):
            raise ConfigError(f"{what}: ungültig")
        policy = sc.get("stove", STOVE_ALLOW)
        if policy not in (STOVE_ALLOW, STOVE_FROST_ONLY, STOVE_DENY):
            raise ConfigError(f"{what}: Ofen-Regel ungültig")
        out["scenes"].append(
            {
                "id": _id(sc.get("id"), what),
                "name": _name(sc.get("name"), what),
                "icon": str(sc.get("icon") or "mdi:thermostat")[:60],
                "stove": policy,
                "default_target": _target(sc.get("default_target", 20.0), f"{what} Standardziel"),
            }
        )
    scene_ids = [s["id"] for s in out["scenes"]]
    if len(set(scene_ids)) != len(scene_ids):
        raise ConfigError("Szenen: ID doppelt")

    # Räume
    rooms = cfg.get("rooms") or []
    if not isinstance(rooms, list):
        raise ConfigError("Räume: Liste erwartet")
    out["rooms"] = []
    for i, rm in enumerate(rooms):
        if not isinstance(rm, dict):
            raise ConfigError(f"Raum {i + 1}: ungültig")
        what = f"Raum „{rm.get('name') or i + 1}“"
        importance = rm.get("importance", 2)
        if importance not in (1, 2, 3):
            raise ConfigError(f"{what}: Wichtigkeit 1, 2 oder 3")
        sensors = []
        for s in rm.get("temperature_sensors") or []:
            if not isinstance(s, dict):
                raise ConfigError(f"{what}: Fühler ungültig")
            weight = _num(s.get("weight", 1.0), f"{what} Gewicht")
            if not 0 < weight <= 10:
                raise ConfigError(f"{what}: Gewicht zwischen 0 und 10")
            sensors.append(
                {
                    "entity": _entity(
                        s.get("entity"),
                        ("sensor", "climate"),
                        f"{what} Fühler",
                        optional=False,
                    ),
                    "weight": weight,
                }
            )
        if len({s["entity"] for s in sensors}) != len(sensors):
            raise ConfigError(f"{what}: Fühler doppelt")
        targets = {}
        for sid, t in (rm.get("targets") or {}).items():
            if sid not in scene_ids:
                continue  # Ziel einer gelöschten Szene stillschweigend entfernen
            targets[sid] = _target(t, f"{what} Ziel {sid}")
        radiators = _entities(rm.get("radiators"), ("climate",), f"{what} Heizkörper")
        openings = _entities(rm.get("openings"), ("binary_sensor",), f"{what} Öffnungen")
        presence = _entities(rm.get("presence"), ("binary_sensor",), f"{what} Anwesenheit")
        used = {*radiators, *openings, *presence, *(s["entity"] for s in sensors)}
        # Pausierte Geräte: bleiben eingetragen, werden aber nicht verwendet
        paused = [
            e
            for e in _entities(
                rm.get("paused"), ("climate", "sensor", "binary_sensor"), f"{what} pausiert"
            )
            if e in used
        ]
        out["rooms"].append(
            {
                "id": _id(rm.get("id"), what),
                "name": _name(rm.get("name"), what),
                "importance": importance,
                "radiators": radiators,
                "temperature_sensors": sensors,
                "openings": openings,
                "presence": presence,
                "paused": paused,
                "targets": targets,
            }
        )
    room_ids = [r["id"] for r in out["rooms"]]
    if len(set(room_ids)) != len(room_ids):
        raise ConfigError("Räume: ID doppelt")
    stove_climate = out["stove"]["climate"]
    for r in out["rooms"]:
        if stove_climate and stove_climate in r["radiators"]:
            raise ConfigError(f"Raum „{r['name']}“: der Ofen ist kein Heizkörper")

    # Tagesarten
    day_types = cfg.get("day_types")
    if not isinstance(day_types, list) or not day_types:
        raise ConfigError("Mindestens eine Tagesart nötig")
    out["day_types"] = []
    for i, dt in enumerate(day_types):
        what = f"Tagesart {i + 1}"
        if not isinstance(dt, dict):
            raise ConfigError(f"{what}: ungültig")
        slots = dt.get("slots")
        if not isinstance(slots, list) or not slots:
            raise ConfigError(f"{what}: mindestens ein Zeitabschnitt")
        clean = []
        for s in slots:
            if not isinstance(s, dict) or not TIME_RE.match(str(s.get("start", ""))):
                raise ConfigError(f"{what}: Uhrzeit im Format HH:MM")
            if s.get("scene") not in scene_ids:
                raise ConfigError(f"{what}: unbekannte Szene {s.get('scene')}")
            clean.append({"start": s["start"], "scene": s["scene"]})
        starts = [s["start"] for s in clean]
        if starts != sorted(starts) or len(set(starts)) != len(starts):
            raise ConfigError(f"{what}: Uhrzeiten aufsteigend und ohne Doppelte")
        out["day_types"].append(
            {
                "id": _id(dt.get("id"), what),
                "name": _name(dt.get("name"), what),
                "slots": clean,
            }
        )
    dt_ids = [d["id"] for d in out["day_types"]]
    if len(set(dt_ids)) != len(dt_ids):
        raise ConfigError("Tagesarten: ID doppelt")

    week = cfg.get("week") or {}
    out["week"] = {}
    for day in (*WEEKDAYS, "holiday"):
        value = week.get(day, dt_ids[0])
        if value not in dt_ids:
            raise ConfigError(f"Woche: unbekannte Tagesart für {day}")
        out["week"][day] = value

    params = dict(base["parameters"])
    for key, value in (cfg.get("parameters") or {}).items():
        if key not in PARAMETER_LIMITS:
            continue
        v = _num(value, f"Parameter {key}")
        lo, hi = PARAMETER_LIMITS[key]
        if not lo <= v <= hi:
            raise ConfigError(f"Parameter {key}: {v} liegt außerhalb {lo}-{hi}")
        params[key] = v
    if params["power_max"] < params["power_min"]:
        raise ConfigError("Höchste Leistungsstufe muss mindestens so groß wie die kleinste sein")
    params["power_min"] = int(params["power_min"])
    params["power_max"] = int(params["power_max"])
    if params["max_burn_min"] < params["min_burn_min"]:
        raise ConfigError("Längste Brenndauer muss mindestens so groß wie die kürzeste sein")
    out["parameters"] = params

    mode = cfg.get("mode", MODE_SHADOW)
    if mode not in (MODE_SHADOW, MODE_ACTIVE):
        raise ConfigError("Betriebsart ungültig")
    if mode == MODE_ACTIVE and not stove_climate:
        raise ConfigError("Aktiver Betrieb braucht ein Ofen-Thermostat")
    out["mode"] = mode
    return out
