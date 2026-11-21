"""Regeln des Besitzers aus Vorlagen (reine Funktionen), siehe docs/REGELN.md.

Eine Regel ist ein Satz "Wenn ... dann ...". Sie kann das Grundverhalten nur innerhalb
enger Grenzen verschieben (Szene, Ziel um höchstens MAX_DELTA_K, Vorlauf um höchstens
MAX_LEAD_MIN) und nie eine Schutzregel überstimmen: Die Wirkung geht als Eingabe in
`engine.evaluate`, dort gelten alle Grenzen weiter.

Vorlagen:
  nobody_home    alle Personen weg (und, wenn gewünscht, abgesperrt) -> Szene
  cold_outside   Außentemperatur unter Schwelle -> Ziel höher, früher beginnen
  wind           Wind über Schwelle -> Ziel höher, früher beginnen
  forecast_drop  Vorhersage fällt stark -> früher beginnen

Probelauf (`trial_until` in der Zukunft): Die Regel zählt nur mit, wann sie gegriffen
hätte, und wirkt nicht. Danach wartet sie, bis der Besitzer sie scharf schaltet.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

MAX_DELTA_K = 2.0  # alle Regeln zusammen verschieben ein Ziel höchstens so weit
MAX_LEAD_MIN = 120  # und ziehen den Zeitplan höchstens so weit vor
MAX_RULES = 12
HITS_KEEP_H = 48
COLD_RELEASE_K = 0.5  # Regel endet erst so viel über der Schwelle (kein Flattern)
WIND_RELEASE_KMH = 5.0

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
}
NAMES = {
    "nobody_home": "Niemand zu Hause",
    "cold_outside": "Kalt draußen",
    "wind": "Viel Wind",
    "forecast_drop": "Kälteeinbruch laut Vorhersage",
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
    return {
        "id": template,
        "template": template,
        "enabled": True,
        "trial_until": None,
        "params": params,
    }


def _condition(rule: dict, facts: dict, was_active: bool, now: datetime) -> tuple[bool | None, str]:
    """(erfüllt? None = unbekannt, kurzer Zustandstext)."""
    p = rule["params"]
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
        return drop >= p[
            "drop_k"
        ], f"Vorhersage: {_num(round(max(drop, 0), 1))} K kälter in {p['hours']:g} h"
    return None, "unbekannte Vorlage"


def sentence(rule: dict, scenes: list[dict]) -> str:
    """Die Regel als ein Satz in Klartext."""
    p = rule["params"]
    template = rule["template"]
    effects = []
    if p.get("target_delta_k"):
        effects.append(f"Ziele {_num(p['target_delta_k'])} K höher")
    if p.get("lead_min"):
        effects.append(f"{p['lead_min']:g} min früher beginnen")
    then = " und ".join(effects) or "nichts (keine Wirkung eingestellt)"
    if template == "nobody_home":
        scene = next((s["name"] for s in scenes if s["id"] == p.get("scene")), p.get("scene"))
        lock = " und die Tür abgesperrt ist" if p.get("require_lock") else ""
        return (
            f"Wenn alle Personen weg sind{lock}, seit {p['after_min']:g} min, "
            f"dann Szene „{scene}“. "
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
    return ""


def evaluate(
    rules: list[dict], facts: dict, state: dict | None, now: datetime, scenes: list[dict]
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
        rs = state.setdefault(
            rule["id"], {"cond_since": None, "active": False, "last": None, "hits": []}
        )
        rs["hits"] = [h for h in rs.get("hits") or [] if _dt(h) > keep]
        name = rule.get("name") or NAMES.get(rule["template"], rule["template"])
        trial_until = _dt(rule.get("trial_until"))
        trial = trial_until is not None and trial_until > now
        trial_done = trial_until is not None and not trial
        was = bool(rs.get("active"))
        entry = {
            "id": rule["id"],
            "template": rule["template"],
            "name": name,
            "sentence": sentence(rule, scenes),
            "last": rs.get("last"),
            "hits": len(rs["hits"]),
            "trial_until": rule.get("trial_until"),
        }
        if not rule.get("enabled"):
            rs.update({"cond_since": None, "active": False})
            status.append({**entry, "state": "off", "detail": "ausgeschaltet"})
            continue
        met, detail = _condition(rule, facts, was, now)
        if met:
            since = _dt(rs.get("cond_since")) or now
            rs["cond_since"] = since.isoformat()
            wait = timedelta(minutes=rule["params"].get("after_min", 0))
            active = now - since >= wait
            if not active:
                detail += f", greift um {(since + wait).strftime('%H:%M')}"
        else:
            rs["cond_since"] = None
            active = False
        if active and not was:
            rs["last"] = now.isoformat()
            rs["hits"].append(now.isoformat())
            if trial or trial_done:
                log.append(f"Regel „{name}“ hätte jetzt gegriffen (Probelauf): {detail}")
            else:
                log.append(f"Regel „{name}“ greift: {detail}")
        elif was and not active and not (trial or trial_done):
            log.append(f"Regel „{name}“ endet: {detail}")
        rs["active"] = active
        entry["last"] = rs.get("last")
        entry["hits"] = len(rs["hits"])
        if trial or trial_done:
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
        p = rule["params"]
        if rule["template"] == "nobody_home":
            if effects["scene"] is None and p.get("scene") in scene_ids:
                effects["scene"] = p["scene"]
                effects["scene_rule"] = name
                why.append(f"Regel „{name}“: {detail}")
            continue
        effects["target_delta"] += float(p.get("target_delta_k") or 0.0)
        effects["lead_min"] = max(effects["lead_min"], int(p.get("lead_min") or 0))
        why.append(f"Regel „{name}“: {detail}")
    effects["target_delta"] = max(-MAX_DELTA_K, min(MAX_DELTA_K, effects["target_delta"]))
    effects["lead_min"] = min(MAX_LEAD_MIN, effects["lead_min"])
    return {"effects": effects, "status": status, "log": log, "why": why, "state": state}
