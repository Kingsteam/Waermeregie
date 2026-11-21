"""KI-Berater: Vorschläge eines Sprachmodells zu den Einstellungen (reine Funktionen).

Ablauf: `build_package` schnürt ein anonymes Paket (verstellbare Werte mit Grenzen,
Regeln, Rückmeldungen mit Momentaufnahme). `instructions` macht daraus den Auftrag.
Die Antwort des Modells ist **nicht vertrauenswürdig**: `parse` liest sie, `vet` lässt
nur durch, was auf der Liste der verstellbaren Werte steht, in den Grenzen liegt, nicht
zu weit springt und danach `model.validate` besteht. Übrig bleiben Vorschläge, die der
Besitzer einzeln annimmt oder ablehnt. Nichts wird von selbst übernommen.

Schutzregeln (Kesselschutz, Frostschutz, Pause gegen Takten, Starts pro Tag, Brenndauer,
"sofort aus") stehen nie im Paket und können deshalb nicht vorgeschlagen werden.
"""

from __future__ import annotations

import copy
from datetime import datetime, timedelta
import json
import re
from typing import Any

from . import model, rules
from .const import PARAMETER_LIMITS, ROOM_TARGET_LIMITS

MAX_CHANGES = 5
MAX_NEW_RULES = 2
MAX_FEEDBACK = 60  # so viele Rückmeldungen gehen höchstens mit
FEEDBACK_DAYS = 28
MAX_TARGET_STEP_K = 1.0  # ein Ziel springt je Vorschlag höchstens so weit
MAX_TIME_STEP_MIN = 60
MAX_PARAM_SHARE = 0.25  # sonstige Werte: höchstens ein Viertel ihres Bereichs
REASON_LEN = 300
WEEKDAYS = ("Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag")

# Parameter, die die KI vorschlagen darf (nie Schutzregeln), mit Erklärung für das Modell
PARAMS: dict[str, str] = {
    "start_below_k": "Ofen startet, wenn die Wohnräume so viel unter dem Ziel liegen (K)",
    "stop_above_k": "Heizblock endet, wenn es so viel über dem Ziel ist (K)",
    "warmup_extra_k": "Aufheizen und 'Mir ist kalt': Ziele so viel höher (K)",
    "warmup_lead_min": "Aufheizen vor der Ankunft: Vorlauf (min)",
    "cold_min": "'Mir ist kalt': Dauer der höheren Ziele (min)",
    "radiator_boost_k": "Heizkörper im Heizblock so viel über dem Raumziel (K)",
    "presence_empty_min": "Raum gilt nach so vielen Minuten ohne Bewegung als leer (min)",
}


# Werte der Regeln in Klartext (für den Text des Vorschlags)
RULE_PARAMS = {
    "after_min": "Wartezeit (min)",
    "below_c": "Grenze der Außentemperatur (°C)",
    "above_kmh": "Grenze für den Wind (km/h)",
    "drop_k": "Temperatursturz (K)",
    "hours": "Zeitraum der Vorhersage (h)",
    "target_delta_k": "Änderung der Ziele (K)",
    "lead_min": "Vorlauf (min)",
}


def _alias(index: int) -> str:
    return f"Raum {chr(ord('A') + index)}" if index < 26 else f"Raum {index + 1}"


def _minutes(hhmm: str) -> int:
    h, m = (int(x) for x in hhmm.split(":"))
    return h * 60 + m


def _hhmm(minute: int) -> str:
    return f"{minute // 60:02d}:{minute % 60:02d}"


def adjustable(config: dict) -> list[dict[str, Any]]:
    """Alle Werte, die ein Vorschlag ändern darf: Kennung, Stand, Grenzen."""
    out: list[dict[str, Any]] = []
    for key, text in PARAMS.items():
        lo, hi = PARAMETER_LIMITS[key]
        out.append(
            {
                "id": f"param:{key}",
                "label": text,
                "value": config["parameters"][key],
                "min": lo,
                "max": hi,
            }
        )
    lo, hi = ROOM_TARGET_LIMITS
    scene_names = {s["id"]: s["name"] for s in config["scenes"]}
    for scene in config["scenes"]:
        out.append(
            {
                "id": f"scene:{scene['id']}",
                "label": f"Standardziel der Szene '{scene['name']}' (°C)",
                "value": scene["default_target"],
                "min": lo,
                "max": hi,
            }
        )
    for i, room in enumerate(config["rooms"]):
        for scene in config["scenes"]:
            if scene["id"] in room["targets"]:
                out.append(
                    {
                        "id": f"room:{i}:{scene['id']}",
                        "label": f"Ziel in {_alias(i)} bei Szene '{scene['name']}' (°C)",
                        "value": room["targets"][scene["id"]],
                        "min": lo,
                        "max": hi,
                    }
                )
    for day_type in config["day_types"]:
        for n, slot in enumerate(day_type["slots"]):
            out.append(
                {
                    "id": f"slot:{day_type['id']}:{n}",
                    "label": (
                        f"Tagesart '{day_type['name']}': Beginn des Abschnitts mit Szene "
                        f"'{scene_names.get(slot['scene'], slot['scene'])}' (HH:MM)"
                    ),
                    "value": slot["start"],
                }
            )
    for rule in config.get("rules") or []:
        name = rule.get("name") or rules.NAMES[rule["template"]]
        for key, (low, high, _default) in rules.TEMPLATES[rule["template"]].items():
            bounds = (rule.get("learn") or {}).get(key)
            out.append(
                {
                    "id": f"rule:{rule['id']}:{key}",
                    "label": f"Regel '{name}': {RULE_PARAMS.get(key, key)}",
                    "value": rule["params"][key],
                    "min": bounds[0] if bounds else low,
                    "max": bounds[1] if bounds else high,
                }
            )
    return out


def build_package(
    config: dict, entries: list[dict], rule_status: list[dict], now: datetime
) -> dict[str, Any]:
    """Anonymes Paket für das Modell: keine Namen von Räumen, Personen oder Geräten."""
    room_alias = {room["id"]: _alias(i) for i, room in enumerate(config["rooms"])}
    cutoff = now - timedelta(days=FEEDBACK_DAYS)
    feedback = []
    for e in entries[-MAX_FEEDBACK:]:
        when = datetime.fromisoformat(e["t"])
        if when < cutoff:
            continue
        feedback.append(
            {
                "wochentag": WEEKDAYS[when.weekday()],
                "uhrzeit": when.strftime("%H:%M"),
                "rueckmeldung": {"cold": "zu kalt", "ok": "passt", "warm": "zu warm"}[e["kind"]],
                "bereich": room_alias.get(e.get("room"), "ganzes Haus"),
                "tagesart": e.get("day_type"),
                "szene": e.get("scene"),
                "haus_c": e.get("house_c"),
                "haus_ziel_c": e.get("target_c"),
                "raum_c": e.get("room_c"),
                "raum_ziel_c": e.get("room_target"),
                "aussen_c": e.get("outdoor_c"),
                "kessel_c": e.get("water_c"),
                "ofen_brennt": e.get("burning"),
                "ofen_phase": e.get("phase"),
                "wind_kmh": e.get("wind_kmh"),
                "wetter": e.get("weather"),
                "jemand_zu_hause": e.get("someone_home"),
                "raum_feuchte": e.get("room_humidity"),
                "raum_fenster_offen": e.get("room_open"),
                "alle_raeume_c": {
                    room_alias[k]: v for k, v in (e.get("rooms") or {}).items() if k in room_alias
                },
            }
        )
    return {
        "verstellbar": adjustable(config),
        "raeume": [
            {"name": room_alias[r["id"]], "wichtigkeit": r["importance"]} for r in config["rooms"]
        ],
        "zeitplan": [
            {"tagesart": d["id"], "name": d["name"], "abschnitte": d["slots"]}
            for d in config["day_types"]
        ],
        "woche": config["week"],
        "szenen": [
            {"id": s["id"], "name": s["name"], "ofen": s["stove"], "ziel_c": s["default_target"]}
            for s in config["scenes"]
        ],
        "regeln": [
            {"satz": s.get("sentence"), "zustand": s.get("state"), "gegriffen_48h": s.get("hits")}
            for s in rule_status
        ],
        "regel_vorlagen": {
            t: {k: {"min": v[0], "max": v[1]} for k, v in params.items()}
            for t, params in rules.TEMPLATES.items()
            if t != "nobody_home"
        },
        "bedingungen_eigene_regel": {
            k: (None if v is None else {"min": v[0], "max": v[1]})
            for k, v in rules.CONDITIONS.items()
            if k != "lock"
        },
        "rueckmeldungen": feedback,
    }


def instructions(package: dict) -> str:
    """Auftrag an das Modell (Deutsch), mit festem Antwortformat."""
    return (
        "Du berätst die Einstellung einer Heizungssteuerung für einen Pelletofen ohne "
        "Pufferspeicher. Unten stehen als JSON: die verstellbaren Werte mit Grenzen, der "
        "Zeitplan, die Szenen, die Regeln und die Rückmeldungen der Bewohner (zu kalt, passt, "
        "zu warm) mit den Messwerten in diesem Moment.\n\n"
        "Aufgabe: Schlage höchstens "
        f"{MAX_CHANGES} Änderungen an verstellbaren Werten und höchstens {MAX_NEW_RULES} "
        "neue Regeln vor, die die Rückmeldungen erklären und verbessern. Ändere wenig und nur, "
        "was die Daten stützen. Gibt es zu wenige Rückmeldungen oder passt alles, schlage "
        "nichts vor.\n\n"
        "Regeln für deine Antwort:\n"
        "- Verwende nur Kennungen aus 'verstellbar' und bleibe in deren Grenzen.\n"
        f"- Ziele höchstens um {MAX_TARGET_STEP_K:g} K ändern, Uhrzeiten höchstens um "
        f"{MAX_TIME_STEP_MIN} Minuten.\n"
        "- Neue Regeln nur aus 'regel_vorlagen'. Bei 'custom' sind 'name' und "
        "'params.conditions' Pflicht; Bedingungen nur aus 'bedingungen_eigene_regel' in der "
        "Form {type, op: below|above, value} bzw. {type: time, from, to} oder "
        "{type: persons, value: all_away|someone_home}.\n"
        "- Jede Begründung ist ein kurzer deutscher Satz in einfacher Sprache.\n"
        "- Antworte ausschließlich mit JSON in genau dieser Form, ohne Text davor oder "
        'danach:\n{"zusammenfassung": "...", "aenderungen": [{"id": "...", "wert": 0, '
        '"begruendung": "..."}], "neue_regeln": [{"template": "...", "name": "...", '
        '"params": {}, "begruendung": "..."}]}\n\n'
        "Daten:\n" + json.dumps(package, ensure_ascii=False, separators=(",", ":"))
    )


def parse(answer: Any) -> dict[str, Any]:
    """Antwort des Modells lesen. Wirft ValueError, wenn kein passendes JSON darin steht."""
    if isinstance(answer, dict):
        data = answer
    else:
        text = str(answer or "")
        match = re.search(r"\{.*\}", text, re.DOTALL)
        if not match:
            raise ValueError("Die Antwort enthält kein JSON")
        try:
            data = json.loads(match.group(0))
        except json.JSONDecodeError as err:
            raise ValueError("Die Antwort ist kein gültiges JSON") from err
    if not isinstance(data, dict):
        raise ValueError("Die Antwort hat nicht die erwartete Form")
    return data


def _shown(value: Any) -> str:
    return value if isinstance(value, str) else f"{value:g}".replace(".", ",")


def clean_text(value: Any) -> str:
    """Freitext des Modells: einzeilig, gekürzt."""
    return re.sub(r"\s+", " ", str(value or "")).strip()[:REASON_LEN]


def _apply_change(config: dict, item_id: str, value: Any) -> dict:
    cfg = copy.deepcopy(config)
    kind, _, rest = item_id.partition(":")
    if kind == "param":
        cfg["parameters"][rest] = value
    elif kind == "scene":
        next(s for s in cfg["scenes"] if s["id"] == rest)["default_target"] = value
    elif kind == "room":
        index, _, scene = rest.partition(":")
        cfg["rooms"][int(index)]["targets"][scene] = value
    elif kind == "slot":
        day, _, n = rest.partition(":")
        next(d for d in cfg["day_types"] if d["id"] == day)["slots"][int(n)]["start"] = value
    elif kind == "rule":
        rule_id, _, key = rest.partition(":")
        next(r for r in cfg["rules"] if r["id"] == rule_id)["params"][key] = value
    else:
        raise ValueError(item_id)
    return cfg


def apply(config: dict, suggestion: dict, value: Any = None) -> dict:
    """Angenommenen Vorschlag in eine Kopie der Einstellungen eintragen (danach validate)."""
    if suggestion["type"] == "ai_rule":
        cfg = copy.deepcopy(config)
        cfg["rules"] = [*(cfg.get("rules") or []), copy.deepcopy(suggestion["rule"])]
        return cfg
    new = suggestion["to"] if value is None else value
    if not isinstance(suggestion["to"], str):
        new = float(new)
        if not suggestion["min"] <= new <= suggestion["max"]:
            raise ValueError("Wert außerhalb der Grenzen")
    return _apply_change(config, suggestion["item"], new)


def real_names(config: dict, text: str) -> str:
    """Decknamen (Raum A) für den Besitzer wieder durch die Raumnamen ersetzen."""
    names = {_alias(i): room["name"] for i, room in enumerate(config["rooms"])}
    for alias in sorted(names, key=len, reverse=True):
        text = re.sub(rf"\b{re.escape(alias)}\b", names[alias], text)
    return text


def vet(config: dict, answer: dict, now: datetime) -> tuple[list[dict[str, Any]], int]:
    """Antwort prüfen. Liefert (brauchbare Vorschläge, Anzahl verworfener)."""
    allowed = {item["id"]: item for item in adjustable(config)}

    def real(text: str) -> str:
        return real_names(config, text)

    out: list[dict[str, Any]] = []
    dropped = 0
    seen: set[str] = set()
    changes = answer.get("aenderungen")
    for change in changes if isinstance(changes, list) else []:
        item = allowed.get(change.get("id")) if isinstance(change, dict) else None
        if item is None or item["id"] in seen or len(out) >= MAX_CHANGES:
            dropped += 1
            continue
        old = item["value"]
        try:
            if isinstance(old, str):  # Uhrzeit
                new_min = _minutes(str(change.get("wert")))
                if abs(new_min - _minutes(old)) > MAX_TIME_STEP_MIN:
                    raise ValueError("zu großer Sprung")
                new: Any = _hhmm(new_min // 5 * 5)
            else:
                new = float(change.get("wert"))
                is_target = item["id"].startswith(("scene:", "room:"))
                step = (
                    MAX_TARGET_STEP_K
                    if is_target
                    else max((item["max"] - item["min"]) * MAX_PARAM_SHARE, 0.5)
                )
                if not item["min"] <= new <= item["max"] or abs(new - old) > step + 1e-9:
                    raise ValueError("außerhalb der Grenzen")
                new = round(new * 2) / 2 if is_target else round(new, 1)
            if new == old:
                raise ValueError("keine Änderung")
            model.validate(_apply_change(config, item["id"], new))
        except TypeError, ValueError, KeyError, IndexError, StopIteration, model.ConfigError:
            dropped += 1
            continue
        seen.add(item["id"])
        reason = real(clean_text(change.get("begruendung")))
        out.append(
            {
                "id": f"ai|{item['id']}",
                "type": "ai_change",
                "item": item["id"],
                "from": old,
                "to": new,
                "min": item.get("min"),
                "max": item.get("max"),
                "count": 0,
                "room": None,
                "reason": reason,
                "text": (
                    f"KI-Vorschlag: {real(item['label'])} von {_shown(old)} auf {_shown(new)}"
                    " ändern." + (f" Begründung: {reason}" if reason else "")
                ),
            }
        )
    count_rules = 0
    room_ids = {_alias(i): room["id"] for i, room in enumerate(config["rooms"])}
    new_rules = answer.get("neue_regeln")
    for proposal in new_rules if isinstance(new_rules, list) else []:
        if not isinstance(proposal, dict) or count_rules >= MAX_NEW_RULES:
            dropped += 1
            continue
        template = proposal.get("template")
        existing = {r["id"] for r in config.get("rules") or []}
        try:
            if template not in rules.TEMPLATES or template == "nobody_home":
                raise ValueError("Vorlage nicht erlaubt")
            if template != "custom" and template in existing:
                raise ValueError("Regel gibt es schon")
            params = proposal.get("params") if isinstance(proposal.get("params"), dict) else {}
            params = copy.deepcopy(params)
            for cond in params.get("conditions") or []:
                if cond.get("type") == "lock" or "entity" in cond:
                    raise ValueError("Bedingungen mit Geräten nur von Hand")
                if "room" in cond:  # Deckname zurück zur Raum-ID
                    cond["room"] = room_ids[cond["room"]]
            for key in ("lock", "wind_entity", "require_lock"):
                params.pop(key, None)
            rule = rules.default_rule(template, config["scenes"])
            rule["params"].update(params)
            if template == "custom":
                rule["name"] = clean_text(proposal.get("name"))[:60]
                rule["id"] = f"ki_{count_rules + 1}_{now.strftime('%m%d%H%M')}"
            # angenommene KI-Regeln laufen zuerst einen Tag im Probelauf
            rule["trial_until"] = (now + timedelta(days=1)).isoformat()
            cfg = copy.deepcopy(config)
            cfg["rules"] = [*(cfg.get("rules") or []), rule]
            checked = model.validate(cfg)["rules"][-1]
        except TypeError, ValueError, KeyError, AttributeError, model.ConfigError:
            dropped += 1
            continue
        count_rules += 1
        reason = real(clean_text(proposal.get("begruendung")))
        sentence = rules.sentence(checked, config["scenes"], None, config)
        out.append(
            {
                "id": f"ai|rule|{checked['id']}",
                "type": "ai_rule",
                "rule": checked,
                "count": 0,
                "room": None,
                "reason": reason,
                "text": (
                    f"KI-Vorschlag, neue Regel: {sentence}"
                    + (f" Begründung: {reason}" if reason else "")
                    + " Sie läuft nach dem Annehmen zuerst einen Tag im Probelauf."
                ),
            }
        )
    return out, dropped
