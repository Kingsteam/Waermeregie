"""Datenmodell der Einstellungen: Standardwerte und vollständige Prüfung.

Reine Funktionen ohne Home Assistant, damit sie einfach testbar sind.
Änderungen am Modell immer so: Kopie -> validate() -> speichern.
"""

from __future__ import annotations

import copy
from datetime import datetime
import re
from typing import Any

from . import rules
from .const import (
    DEFAULT_DUMP_LEARN,
    DEFAULT_NOTIFICATIONS,
    DEFAULT_PARAMETERS,
    DEFAULT_VENTILATE_HUMIDITY,
    DEFAULT_VENTILATE_RISE,
    MODE_ACTIVE,
    MODE_SHADOW,
    NOTIFY_KINDS,
    NOTIFY_LIMITS,
    PARAMETER_LIMITS,
    ROOM_TARGET_LIMITS,
    SENSOR_OFFSET_LIMIT_K,
    STOVE_ALLOW,
    STOVE_DENY,
    STOVE_FROST_ONLY,
    VENTILATE_HUMIDITY_LIMITS,
    VENTILATE_RISE_LIMITS,
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
# Ja/Nein-Einstellungen des Ofens (keine Entitäten)
STOVE_FLAGS: dict[str, bool] = {
    "has_buffer": False,  # Pufferspeicher vorhanden? Ohne Puffer: Heizkörper als Puffer
    "dump_learn": DEFAULT_DUMP_LEARN,  # Startschwelle der Wärmeabfuhr lernen
}


class ConfigError(ValueError):
    """Einstellungen ungültig. Text ist für Menschen gedacht (Deutsch)."""


def default_config() -> dict[str, Any]:
    """Startzustand: Szenen und Tagesarten als Vorschlag, noch keine Räume."""
    return {
        "stove": {**dict.fromkeys(STOVE_KEYS), **STOVE_FLAGS},
        "weather": None,
        "outdoor_sensor": None,
        "workday": None,
        "persons": [],
        "pet": None,
        "notify": [],
        "notifications": dict(DEFAULT_NOTIFICATIONS),
        "warmup_scene": None,
        "rules": [],
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
        "notifications": {k: list(v) for k, v in NOTIFY_LIMITS.items()},
        "ventilate_humidity": list(VENTILATE_HUMIDITY_LIMITS),
        "ventilate_rise": list(VENTILATE_RISE_LIMITS),
        # Vorlage -> Parameter -> [kleinster, größter, Standard]
        "rule_conditions": {
            k: (None if v is None else list(v)) for k, v in rules.CONDITIONS.items()
        },
        "rule_learn": list(rules.LEARN_STEP),
        "rule_templates": {
            t: {k: list(v) for k, v in ps.items()} for t, ps in rules.TEMPLATES.items()
        },
    }


def _notifications(raw: Any) -> dict[str, Any]:
    """Benachrichtigungs-Einstellungen; fehlende Werte (ältere Config) = Standard."""
    if raw is None:
        raw = {}
    if not isinstance(raw, dict):
        raise ConfigError("Benachrichtigungen: ungültig")
    out = dict(DEFAULT_NOTIFICATIONS)
    for kind in (*NOTIFY_KINDS, "quiet_hold"):
        if kind in raw:
            if not isinstance(raw[kind], bool):
                raise ConfigError(f"Benachrichtigungen: {kind} ein oder aus")
            out[kind] = raw[kind]
    for key, (lo, hi) in NOTIFY_LIMITS.items():
        if key in raw:
            v = _num(raw[key], f"Benachrichtigungen {key}")
            if not lo <= v <= hi:
                raise ConfigError(f"Benachrichtigungen {key}: {v:g} liegt außerhalb {lo:g}-{hi:g}")
            out[key] = int(v) if float(v).is_integer() else v
    for key in ("quiet_start", "quiet_end"):
        if key in raw:
            v = raw[key] or ""
            if not isinstance(v, str) or (v and not TIME_RE.match(v)):
                raise ConfigError("Ruhezeit: Uhrzeit im Format HH:MM")
            out[key] = v
    if bool(out["quiet_start"]) != bool(out["quiet_end"]):
        raise ConfigError("Ruhezeit: Beginn und Ende angeben (oder beide leer)")
    if out["quiet_start"] and out["quiet_start"] == out["quiet_end"]:
        raise ConfigError("Ruhezeit: Beginn und Ende dürfen nicht gleich sein")
    return out


def _percent(value: Any, default: float, limits: tuple[float, float], what: str) -> float:
    v = default if value is None else _num(value, what)
    lo, hi = limits
    if not lo <= v <= hi:
        raise ConfigError(f"{what}: {v:g} % liegt außerhalb {lo:g}-{hi:g}")
    return round(v, 1)


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


def _conditions(raw: Any, what: str, cfg: dict) -> list[dict[str, Any]]:
    """Bedingungen einer freien Regel prüfen."""
    if not isinstance(raw, list) or len(raw) > rules.MAX_CONDITIONS:
        raise ConfigError(f"{what}: höchstens {rules.MAX_CONDITIONS} Bedingungen")
    out: list[dict[str, Any]] = []
    for cond in raw:
        kind = cond.get("type") if isinstance(cond, dict) else None
        if kind not in rules.CONDITIONS:
            raise ConfigError(f"{what}: unbekannte Bedingung")
        item: dict[str, Any] = {"type": kind}
        limits = rules.CONDITIONS[kind]
        if limits is not None:
            value = _num(cond.get("value"), f"{what}: Wert")
            if not limits[0] <= value <= limits[1]:
                raise ConfigError(
                    f"{what}: Wert muss zwischen {limits[0]:g} und {limits[1]:g} liegen"
                )
            item["value"] = value
            item["op"] = "below" if cond.get("op") == "below" else "above"
        if kind == "persons":
            item["value"] = "someone_home" if cond.get("value") == "someone_home" else "all_away"
        elif kind == "lock":
            item["entity"] = _entity(cond.get("entity"), ("lock", "binary_sensor"), what)
            item["value"] = "unlocked" if cond.get("value") == "unlocked" else "locked"
        elif kind == "room_temp":
            if cond.get("room") not in [r["id"] for r in cfg["rooms"]]:
                raise ConfigError(f"{what}: bitte einen Raum wählen")
            item["room"] = cond["room"]
        elif kind == "day_type":
            if cond.get("value") not in [d["id"] for d in cfg["day_types"]]:
                raise ConfigError(f"{what}: bitte eine Tagesart wählen")
            item["value"] = cond["value"]
        elif kind == "time":
            for key in ("from", "to"):
                text = str(cond.get(key) or "")
                if not re.fullmatch(r"([01]\d|2[0-3]):[0-5]\d", text):
                    raise ConfigError(f"{what}: Uhrzeit im Format HH:MM")
                item[key] = text
        out.append(item)
    return out


def _rules(raw: Any, scene_ids: list[str], cfg: dict) -> list[dict[str, Any]]:
    """Regeln prüfen (docs/REGELN.md)."""
    if raw is None:
        return []
    if not isinstance(raw, list) or len(raw) > rules.MAX_RULES:
        raise ConfigError(f"Regeln: höchstens {rules.MAX_RULES}")
    out: list[dict[str, Any]] = []
    seen: set[str] = set()
    for i, rule in enumerate(raw):
        if not isinstance(rule, dict) or rule.get("template") not in rules.TEMPLATES:
            raise ConfigError(f"Regel {i + 1}: unbekannte Vorlage")
        template = rule["template"]
        name = str(rule.get("name") or "").strip()[:60] if template == "custom" else ""
        what = f"Regel „{name or rules.NAMES[template]}“"
        if template == "custom" and not name:
            raise ConfigError("Eigene Regel: bitte einen Namen eintragen")
        rule_id = _id(rule.get("id") or template, what)
        if rule_id in seen:
            raise ConfigError(f"{what}: gibt es schon")
        seen.add(rule_id)
        given = rule.get("params") or {}
        if not isinstance(given, dict):
            raise ConfigError(f"{what}: Werte fehlen")
        params: dict[str, Any] = {}
        for key, (lo, hi, default) in rules.TEMPLATES[template].items():
            value = _num(given.get(key, default), f"{what}: {key}")
            if not lo <= value <= hi:
                raise ConfigError(f"{what}: {key} muss zwischen {lo:g} und {hi:g} liegen")
            params[key] = value
        if template == "nobody_home":
            scene = given.get("scene")
            if scene not in scene_ids:
                raise ConfigError(f"{what}: bitte eine Szene wählen")
            lock = _entity(given.get("lock"), ("lock", "binary_sensor"), f"{what}: Türschloss")
            # ohne Schloss bleibt die Bedingung "unbekannt": die Regel greift dann nie
            require = bool(given.get("require_lock"))
            params.update({"scene": scene, "lock": lock, "require_lock": require})
        if template == "wind":
            params["wind_entity"] = _entity(
                given.get("wind_entity"), ("sensor",), f"{what}: Windfühler"
            )
        if template == "custom":
            scene = given.get("scene") or None
            if scene is not None and scene not in scene_ids:
                raise ConfigError(f"{what}: Szene unbekannt")
            params["scene"] = scene
            params["conditions"] = _conditions(given.get("conditions") or [], what, cfg)
        learn: dict[str, list[float]] = {}
        for key, bounds in (rule.get("learn") or {}).items():
            if key not in rules.TEMPLATES[template] or key not in rules.LEARN_STEP:
                raise ConfigError(f"{what}: {key} kann kein Lernwert sein")
            lo, hi, _default = rules.TEMPLATES[template][key]
            try:
                low, high = float(bounds[0]), float(bounds[1])
            except (TypeError, ValueError, IndexError) as err:
                raise ConfigError(f"{what}: Grenzen des Lernwerts fehlen") from err
            if not lo <= low <= high <= hi:
                raise ConfigError(
                    f"{what}: Grenzen des Lernwerts müssen zwischen {lo:g} und {hi:g} liegen"
                )
            learn[key] = [low, high]
        trial = rule.get("trial_until")
        if trial is not None:
            try:
                datetime.fromisoformat(str(trial))
            except ValueError as err:
                raise ConfigError(f"{what}: Probelauf-Ende ungültig") from err
        out.append(
            {
                "id": rule_id,
                "template": template,
                "enabled": bool(rule.get("enabled", True)),
                "trial_until": None if trial is None else str(trial),
                "params": params,
                "learn": learn,
                **({"name": name} if template == "custom" else {}),
            }
        )
    return out


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
    for key, default in STOVE_FLAGS.items():
        value = stove.get(key, default)
        if not isinstance(value, bool):
            raise ConfigError(f"Ofen: {key} muss ja oder nein sein")
        out["stove"][key] = value
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
    out["notifications"] = _notifications(cfg.get("notifications"))

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
            offset = _num(s.get("offset", 0.0) or 0.0, f"{what} Korrektur")
            if abs(offset) > SENSOR_OFFSET_LIMIT_K:
                raise ConfigError(
                    f"{what}: Korrektur zwischen -{SENSOR_OFFSET_LIMIT_K:g} und "
                    f"+{SENSOR_OFFSET_LIMIT_K:g} K"
                )
            sensors.append(
                {
                    "entity": _entity(
                        s.get("entity"),
                        ("sensor", "climate"),
                        f"{what} Fühler",
                        optional=False,
                    ),
                    "weight": weight,
                    "offset": round(offset, 1),
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
        humidity = _entities(
            rm.get("humidity_sensors"), ("sensor", "climate"), f"{what} Feuchtefühler"
        )
        ventilate_humidity = _percent(
            rm.get("ventilate_humidity"),
            DEFAULT_VENTILATE_HUMIDITY,
            VENTILATE_HUMIDITY_LIMITS,
            f"{what} Feuchte-Schwelle",
        )
        ventilate_rise = _percent(
            rm.get("ventilate_rise"),
            DEFAULT_VENTILATE_RISE,
            VENTILATE_RISE_LIMITS,
            f"{what} Feuchte-Anstieg",
        )
        used = {
            *radiators,
            *openings,
            *presence,
            *humidity,
            *(s["entity"] for s in sensors),
        }
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
                "humidity_sensors": humidity,
                "ventilate_humidity": ventilate_humidity,
                "ventilate_rise": ventilate_rise,
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

    warmup_scene = cfg.get("warmup_scene")
    if warmup_scene in ("", None):
        warmup_scene = None
    elif warmup_scene not in scene_ids:
        raise ConfigError("Aufheizen: unbekannte Szene")
    out["warmup_scene"] = warmup_scene

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
    if params["dump_end_c"] >= params["dump_start_c"]:
        raise ConfigError(
            "Wärmeabfuhr: das Ende muss unter der Starttemperatur liegen "
            f"({params['dump_end_c']:g} °C ist nicht unter {params['dump_start_c']:g} °C)"
        )
    out["parameters"] = params
    out["rules"] = _rules(cfg.get("rules"), scene_ids, out)

    mode = cfg.get("mode", MODE_SHADOW)
    if mode not in (MODE_SHADOW, MODE_ACTIVE):
        raise ConfigError("Betriebsart ungültig")
    if mode == MODE_ACTIVE and not stove_climate:
        raise ConfigError("Aktiver Betrieb braucht ein Ofen-Thermostat")
    out["mode"] = mode
    return out
