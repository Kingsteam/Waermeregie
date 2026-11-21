"""Regeln des Besitzers (reine Funktionen), siehe docs/REGELN.md.

Eine Regel ist ein Satz "Wenn ... dann ...". Sie kann das Grundverhalten nur innerhalb
enger Grenzen verschieben (Szene, Ziel um höchstens MAX_DELTA_K, Vorlauf um höchstens
MAX_LEAD_MIN) und nie eine Schutzregel überstimmen: Die Wirkung geht als Eingabe in
`engine.evaluate`, dort gelten alle Grenzen weiter.

Vorlagen:
  nobody_home    alle Personen weg (und, wenn gewünscht, abgesperrt) -> Szene
  cold_outside   Außentemperatur unter Schwelle -> Ziel höher, früher beginnen
  wind           Wind über Schwelle -> Ziel höher, früher beginnen
  forecast_drop  Vorhersage fällt stark -> früher beginnen
  custom         frei gebaut: mehrere Bedingungen (alle müssen gelten) -> Wirkung

Probelauf (`trial_until` in der Zukunft): Die Regel zählt nur mit, wann sie gegriffen
hätte, und wirkt nicht. Danach wartet sie, bis der Besitzer sie scharf schaltet.

Lernwerte (`rule["learn"] = {param: [kleinster, größter]}`): Der Wert stellt sich in
kleinen Schritten selbst nach, höchstens einmal am Tag und nie über die Grenzen des
Besitzers hinaus. Gelernt wird aus Rückmeldungen (zu kalt / zu warm) und aus der Dauer
von Abwesenheiten. Der gelernte Stand liegt im Laufzustand (`learned`), nicht in den
Einstellungen. Schutzregeln lernen nie.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

MAX_DELTA_K = 2.0  # alle Regeln zusammen verschieben ein Ziel höchstens so weit
MAX_LEAD_MIN = 120  # und ziehen den Zeitplan höchstens so weit vor
MAX_RULES = 12
MAX_CONDITIONS = 5
HITS_KEEP_H = 48
COLD_RELEASE_K = 0.5  # Regel endet erst so viel über der Schwelle (kein Flattern)
WIND_RELEASE_KMH = 5.0
SHORT_ABSENCE_MIN = 20  # so kurz nach dem Greifen zurück: Wartezeit war zu kurz
LONG_ABSENCE_MIN = 120
LONG_RUNS = 3  # so viele lange Abwesenheiten in Folge: Wartezeit darf kürzer werden
NEAR_COLD_K = 3.0  # "fast kalt genug": so nah an der Schwelle zählt eine Rückmeldung
NEAR_WIND_KMH = 10.0

# Vorlage -> Parameter -> (kleinster, größter, Standard). bool/Text haben eigene Prüfung.
TEMPLATES: dict[str, dict[str, tuple[float, float, float]]] = {
    "nobody_home": {"after_min": (5, 240, 30)},
    "cold_outside": {
        "below_c": (-20, 15, 0),
        "target_delta_k": (0, 2, 0.5),
        "lead_min": (0, 120, 30),
    },
    "wind": {"above_kmh": (10, 100, 35), "target_delta_k": (0, 2, 0), "lead_min": (0, 120, 30)},
    "forecast_drop": {
        "drop_k": (2, 15, 5),
        "hours": (2, 12, 6),
        "target_delta_k": (0, 2, 0),
        "lead_min": (0, 120, 60),
    },
    "custom": {"after_min": (0, 240, 0), "target_delta_k": (-2, 2, 0), "lead_min": (0, 120, 0)},
}
NAMES = {
    "nobody_home": "Niemand zu Hause",
    "cold_outside": "Kalt draußen",
    "wind": "Viel Wind",
    "forecast_drop": "Kälteeinbruch laut Vorhersage",
    "custom": "Eigene Regel",
}
# Schrittweite, mit der ein Lernwert nachstellt
LEARN_STEP: dict[str, float] = {
    "after_min": 5,
    "lead_min": 10,
    "target_delta_k": 0.5,
    "below_c": 1,
    "above_kmh": 5,
}
# Bedingungen der freien Regel: Art -> (kleinster, größter) Zahlenwert, None = kein Zahlenwert
CONDITIONS: dict[str, tuple[float, float] | None] = {
    "persons": None,  # value: all_away | someone_home
    "lock": None,  # entity, value: locked | unlocked
    "outdoor": (-30, 40),  # op below|above, value °C
    "wind": (0, 150),  # op, value km/h
    "room_temp": (5, 30),  # room, op, value °C
    "water": (10, 100),  # op, value °C
    "time": None,  # from, to (HH:MM, auch über Mitternacht)
    "day_type": None,  # value: Tagesart-ID
}


def _dt(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def _num(value: float) -> str:
    return f"{value:g}".replace(".", ",")


def default_rule(template: str, scenes: list[dict]) -> dict[str, Any]:
    """Neue Regel aus einer Vorlage mit Standardwerten."""
    params: dict[str, Any] = {k: v[2] for k, v in TEMPLATES[template].items()}
    if template == "nobody_home":
        away = next((s["id"] for s in scenes if s["id"] == "abwesend"), None)
        coolest = min(scenes, key=lambda s: s["default_target"])["id"] if scenes else None
        params.update({"scene": away or coolest, "require_lock": False, "lock": None})
    if template == "wind":
        params["wind_entity"] = None
    if template == "custom":
        params.update({"conditions": [], "scene": None})
    return {
        "id": template,
        "template": template,
        "enabled": True,
        "trial_until": None,
        "params": params,
        "learn": {},
    }


def effective(rule: dict, rs: dict | None) -> dict[str, Any]:
    """Werte der Regel, Lernwerte durch ihren gelernten Stand ersetzt (in den Grenzen)."""
    params = dict(rule["params"])
    learned = (rs or {}).get("learned") or {}
    for key, bounds in (rule.get("learn") or {}).items():
        if key in learned and key in params:
            params[key] = max(bounds[0], min(bounds[1], learned[key]))
    return params


def _compare(value: float | None, cond: dict, unit: str, what: str) -> tuple[bool | None, str]:
    if value is None:
        return None, f"{what} unbekannt"
    met = value < cond["value"] if cond.get("op") == "below" else value > cond["value"]
    return met, f"{what} {_num(round(value, 1))} {unit}"


def _check(cond: dict, facts: dict, now: datetime) -> tuple[bool | None, str]:
    """Eine Bedingung der freien Regel prüfen."""
    kind = cond.get("type")
    if kind == "persons":
        away = facts.get("everyone_away")
        if away is None:
            return None, "Anwesenheit unbekannt"
        want_away = cond.get("value") != "someone_home"
        return away == want_away, "alle weg" if away else "jemand ist zu Hause"
    if kind == "lock":
        locked = (facts.get("locks") or {}).get(cond.get("entity"))
        if locked is None:
            return None, "Türschloss unbekannt"
        return locked == (cond.get("value") != "unlocked"), (
            "abgesperrt" if locked else "aufgesperrt"
        )
    if kind == "outdoor":
        return _compare(facts.get("outdoor_c"), cond, "°C", "draußen")
    if kind == "wind":
        return _compare(facts.get("wind_kmh"), cond, "km/h", "Wind")
    if kind == "water":
        return _compare(facts.get("water_c"), cond, "°C", "Kessel")
    if kind == "room_temp":
        room = (facts.get("rooms") or {}).get(cond.get("room")) or {}
        return _compare(room.get("temperature"), cond, "°C", room.get("name") or "Raum")
    if kind == "time":
        hhmm = now.strftime("%H:%M")
        start, end = str(cond.get("from")), str(cond.get("to"))
        inside = start <= hhmm < end if start <= end else hhmm >= start or hhmm < end
        return inside, f"{hhmm} Uhr"
    if kind == "day_type":
        current = facts.get("day_type") or {}
        return current.get("id") == cond.get("value"), f"Tagesart {current.get('name') or '?'}"
    return None, "unbekannte Bedingung"


def _condition(
    rule: dict, p: dict, facts: dict, was_active: bool, now: datetime
) -> tuple[bool | None, str]:
    """(erfüllt? None = unbekannt, kurzer Zustandstext)."""
    template = rule["template"]
    if template == "nobody_home":
        away = facts.get("everyone_away")
        if away is None:
            return None, "Anwesenheit der Personen unbekannt"
        if not away:
            return False, "jemand ist zu Hause"
        if p.get("require_lock"):
            locked = (facts.get("locks") or {}).get(p.get("lock"))
            if locked is None:
                return None, "Zustand des Türschlosses unbekannt"
            if not locked:
                return False, "alle weg, aber nicht abgesperrt"
            return True, "alle weg und abgesperrt"
        return True, "alle weg"
    if template == "cold_outside":
        outdoor = facts.get("outdoor_c")
        if outdoor is None:
            return None, "Außentemperatur unbekannt"
        limit = p["below_c"] + (COLD_RELEASE_K if was_active else 0.0)
        return outdoor < limit, f"draußen {_num(round(outdoor, 1))} °C"
    if template == "wind":
        entity = p.get("wind_entity")
        wind = (facts.get("sensors") or {}).get(entity) if entity else facts.get("wind_kmh")
        if wind is None:
            return None, "Windstärke unbekannt"
        limit = p["above_kmh"] - (WIND_RELEASE_KMH if was_active else 0.0)
        return wind > limit, f"Wind {_num(round(wind))} km/h"
    if template == "forecast_drop":
        outdoor = facts.get("outdoor_c")
        horizon = now + timedelta(hours=p["hours"])
        temps = [t for when, t in facts.get("forecast") or [] if now <= when <= horizon]
        if outdoor is None or not temps:
            return None, "keine Vorhersage"
        drop = outdoor - min(temps)
        return (
            drop >= p["drop_k"],
            f"Vorhersage: {_num(round(max(drop, 0), 1))} K kälter in {p['hours']:g} h",
        )
    if template == "custom":
        conditions = p.get("conditions") or []
        if not conditions:
            return None, "noch keine Bedingung"
        results = [_check(c, facts, now) for c in conditions]
        text = ", ".join(t for _, t in results)
        if any(met is False for met, _ in results):
            return False, text
        if any(met is None for met, _ in results):
            return None, text
        return True, text
    return None, "unbekannte Vorlage"


def _cond_text(cond: dict, config: dict | None) -> str:
    kind = cond.get("type")
    op = "unter" if cond.get("op") == "below" else "über"
    if kind == "persons":
        return "jemand zu Hause ist" if cond.get("value") == "someone_home" else "alle weg sind"
    if kind == "lock":
        return "aufgesperrt ist" if cond.get("value") == "unlocked" else "abgesperrt ist"
    if kind == "outdoor":
        return f"es draußen {op} {_num(cond['value'])} °C hat"
    if kind == "wind":
        return f"der Wind {op} {_num(cond['value'])} km/h liegt"
    if kind == "water":
        return f"das Kesselwasser {op} {_num(cond['value'])} °C hat"
    if kind == "room_temp":
        rooms = (config or {}).get("rooms") or []
        name = next((r["name"] for r in rooms if r["id"] == cond.get("room")), cond.get("room"))
        return f"es im Raum „{name}“ {op} {_num(cond['value'])} °C hat"
    if kind == "time":
        return f"es zwischen {cond.get('from')} und {cond.get('to')} Uhr ist"
    if kind == "day_type":
        days = (config or {}).get("day_types") or []
        name = next((d["name"] for d in days if d["id"] == cond.get("value")), cond.get("value"))
        return f"die Tagesart „{name}“ gilt"
    return "?"


def sentence(
    rule: dict, scenes: list[dict], p: dict | None = None, config: dict | None = None
) -> str:
    """Die Regel als ein Satz in Klartext (mit den gerade wirksamen Werten)."""
    p = p or rule["params"]
    template = rule["template"]
    effects = []
    delta = p.get("target_delta_k") or 0
    if delta:
        effects.append(f"Ziele {_num(abs(delta))} K {'höher' if delta > 0 else 'niedriger'}")
    if p.get("lead_min"):
        effects.append(f"{p['lead_min']:g} min früher beginnen")
    scene_name = next((s["name"] for s in scenes if s["id"] == p.get("scene")), p.get("scene"))
    if template == "custom" and p.get("scene"):
        effects.insert(0, f"Szene „{scene_name}“")
    then = " und ".join(effects) or "nichts (keine Wirkung eingestellt)"
    if template == "nobody_home":
        lock = " und die Tür abgesperrt ist" if p.get("require_lock") else ""
        return (
            f"Wenn alle Personen weg sind{lock}, seit {p['after_min']:g} min, "
            f"dann Szene „{scene_name}“. "
            "Kommt jemand zurück"
            + (" oder wird aufgesperrt" if lock else "")
            + ": zurück zum Zeitplan."
        )
    if template == "cold_outside":
        return f"Wenn es draußen kälter als {_num(p['below_c'])} °C ist, dann {then}."
    if template == "wind":
        return f"Wenn der Wind stärker als {_num(p['above_kmh'])} km/h ist, dann {then}."
    if template == "forecast_drop":
        return (
            f"Wenn es laut Vorhersage in {p['hours']:g} Stunden um mindestens "
            f"{_num(p['drop_k'])} K kälter wird, dann {then}."
        )
    if template == "custom":
        conds = " und ".join(_cond_text(c, config) for c in p.get("conditions") or [])
        since = f", seit {p['after_min']:g} min" if p.get("after_min") else ""
        return f"Wenn {conds or '(noch keine Bedingung)'}{since}, dann {then}."
    return ""


def _step(rule: dict, rs: dict, key: str, direction: int, now: datetime, why: str) -> str | None:
    """Einen Lernwert um einen Schritt verstellen. Liefert den Protokolltext oder None."""
    bounds = (rule.get("learn") or {}).get(key)
    if not bounds or key not in LEARN_STEP or key not in rule["params"]:
        return None
    days = rs.setdefault("learn_day", {})
    if days.get(key) == now.date().isoformat():
        return None  # höchstens ein Schritt am Tag je Wert
    learned = rs.setdefault("learned", {})
    old = max(bounds[0], min(bounds[1], learned.get(key, rule["params"][key])))
    new = max(bounds[0], min(bounds[1], old + direction * LEARN_STEP[key]))
    name = rule.get("name") or NAMES.get(rule["template"], rule["template"])
    if new == old:
        limits = rs.setdefault("at_limit", [])
        if key not in limits:
            limits.append(key)
            return (
                f"Regel „{name}“: der Lernwert steht an deiner Grenze ({_num(old)}) und "
                f"würde weitergehen ({why}). Verschiebe die Grenze, wenn du das willst."
            )
        return None
    learned[key] = new
    days[key] = now.date().isoformat()
    rs["at_limit"] = [k for k in rs.get("at_limit") or [] if k != key]
    return f"Gelernt: Regel „{name}“: {_num(old)} → {_num(new)} ({why})"


def learn_feedback(
    rules: list[dict], state: dict | None, kind: str, facts: dict, now: datetime
) -> tuple[dict, list[str]]:
    """Rückmeldung zu kalt / zu warm auf die Lernwerte anwenden (höchstens ein Schritt je Regel)."""
    state = {k: dict(v) for k, v in (state or {}).items()}
    log: list[str] = []
    if kind not in ("cold", "warm"):
        return state, log
    for rule in rules:
        trial = _dt(rule.get("trial_until")) is not None
        if not rule.get("enabled") or trial or not rule.get("learn"):
            continue
        rs = state.setdefault(rule["id"], {})
        p = effective(rule, rs)
        active = bool(rs.get("active"))
        why = "Rückmeldung zu kalt" if kind == "cold" else "Rückmeldung zu warm"
        direction = 1 if kind == "cold" else -1
        text = None
        if active:
            text = _step(rule, rs, "target_delta_k", direction, now, why) or _step(
                rule, rs, "lead_min", direction, now, why
            )
            if text is None and kind == "warm":  # greift zu oft: Schwelle strenger
                text = _step(rule, rs, "below_c", -1, now, why) or _step(
                    rule, rs, "above_kmh", 1, now, why
                )
        elif kind == "cold":  # greift noch nicht, war aber fast so weit: Schwelle lockern
            outdoor, wind = facts.get("outdoor_c"), facts.get("wind_kmh")
            if "below_c" in p and outdoor is not None and outdoor < p["below_c"] + NEAR_COLD_K:
                text = _step(rule, rs, "below_c", 1, now, why)
            elif "above_kmh" in p and wind is not None and wind > p["above_kmh"] - NEAR_WIND_KMH:
                text = _step(rule, rs, "above_kmh", -1, now, why)
        if text:
            log.append(text)
    return state, log


def evaluate(
    rules: list[dict],
    facts: dict,
    state: dict | None,
    now: datetime,
    scenes: list[dict],
    config: dict | None = None,
) -> dict[str, Any]:
    """Alle Regeln auswerten. Liefert Wirkung, Zustand je Regel, Protokoll, neuen Merker."""
    state = {k: dict(v) for k, v in (state or {}).items() if any(r["id"] == k for r in rules)}
    effects: dict[str, Any] = {
        "scene": None,
        "scene_rule": None,
        "target_delta": 0.0,
        "lead_min": 0,
    }
    status: list[dict[str, Any]] = []
    log: list[str] = []
    why: list[str] = []
    scene_ids = {s["id"] for s in scenes}
    keep = now - timedelta(hours=HITS_KEEP_H)
    for rule in rules:
        rs = state.setdefault(rule["id"], {})
        for key, default in (("cond_since", None), ("active", False), ("last", None)):
            rs.setdefault(key, default)
        rs["hits"] = [h for h in rs.get("hits") or [] if _dt(h) > keep]
        # gelernte Werte nur für Parameter behalten, die noch Lernwert sind
        rs["learned"] = {
            k: v for k, v in (rs.get("learned") or {}).items() if k in (rule.get("learn") or {})
        }
        p = effective(rule, rs)
        name = rule.get("name") or NAMES.get(rule["template"], rule["template"])
        trial_until = _dt(rule.get("trial_until"))
        trial = trial_until is not None and trial_until > now
        trial_done = trial_until is not None and not trial
        was = bool(rs.get("active"))
        entry = {
            "id": rule["id"],
            "template": rule["template"],
            "name": name,
            "sentence": sentence(rule, scenes, p, config),
            "last": rs.get("last"),
            "hits": len(rs["hits"]),
            "trial_until": rule.get("trial_until"),
            "learned": {k: p[k] for k in rule.get("learn") or {} if k in p},
            "at_limit": list(rs.get("at_limit") or []),
        }
        if not rule.get("enabled"):
            rs.update({"cond_since": None, "active": False})
            status.append({**entry, "state": "off", "detail": "ausgeschaltet"})
            continue
        met, detail = _condition(rule, p, facts, was, now)
        if met:
            since = _dt(rs.get("cond_since")) or now
            rs["cond_since"] = since.isoformat()
            wait = timedelta(minutes=p.get("after_min", 0))
            active = now - since >= wait
            if not active:
                detail += f", greift um {(since + wait).strftime('%H:%M')}"
        else:
            rs["cond_since"] = None
            active = False
        live = not (trial or trial_done)
        if active and not was:
            rs["last"] = now.isoformat()
            rs["hits"].append(now.isoformat())
            if live:
                log.append(f"Regel „{name}“ greift: {detail}")
            else:
                log.append(f"Regel „{name}“ hätte jetzt gegriffen (Probelauf): {detail}")
        elif was and not active and live:
            log.append(f"Regel „{name}“ endet: {detail}")
            # Lernwert Wartezeit: kurz nach dem Greifen wieder da -> länger warten;
            # mehrmals lange weg -> darf kürzer werden
            started = _dt(rs.get("last"))
            if started is not None and met is False and "after_min" in (rule.get("learn") or {}):
                minutes = (now - started).total_seconds() / 60
                text = None
                if minutes < SHORT_ABSENCE_MIN:
                    rs["long_runs"] = 0
                    text = _step(rule, rs, "after_min", 1, now, "nach wenigen Minuten wieder da")
                elif minutes >= LONG_ABSENCE_MIN:
                    rs["long_runs"] = int(rs.get("long_runs") or 0) + 1
                    if rs["long_runs"] >= LONG_RUNS:
                        rs["long_runs"] = 0
                        text = _step(rule, rs, "after_min", -1, now, "mehrmals lange weg")
                if text:
                    log.append(text)
                    entry["learned"] = {
                        k: effective(rule, rs)[k] for k in rule.get("learn") or {} if k in p
                    }
        rs["active"] = active
        entry["last"] = rs.get("last")
        entry["hits"] = len(rs["hits"])
        entry["at_limit"] = list(rs.get("at_limit") or [])
        if not live:
            status.append(
                {
                    **entry,
                    "state": "trial" if trial else "trial_done",
                    "detail": detail + ("" if trial else " · Probelauf beendet, bitte entscheiden"),
                }
            )
            continue
        if met is None:
            status.append({**entry, "state": "unknown", "detail": detail})
            continue
        status.append({**entry, "state": "active" if active else "waiting", "detail": detail})
        if not active:
            continue
        if p.get("scene") and rule["template"] in ("nobody_home", "custom"):
            if effects["scene"] is None and p["scene"] in scene_ids:
                effects["scene"] = p["scene"]
                effects["scene_rule"] = name
                why.append(f"Regel „{name}“: {detail}")
            if rule["template"] == "nobody_home":
                continue
        elif rule["template"] == "nobody_home":
            continue
        effects["target_delta"] += float(p.get("target_delta_k") or 0.0)
        effects["lead_min"] = max(effects["lead_min"], int(p.get("lead_min") or 0))
        if not (p.get("scene") and rule["template"] == "custom"):
            why.append(f"Regel „{name}“: {detail}")
    effects["target_delta"] = max(-MAX_DELTA_K, min(MAX_DELTA_K, effects["target_delta"]))
    effects["lead_min"] = min(MAX_LEAD_MIN, effects["lead_min"])
    return {"effects": effects, "status": status, "log": log, "why": why, "state": state}
