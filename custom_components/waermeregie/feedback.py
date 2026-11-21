"""Rückmeldungen (zu kalt / passt / zu warm) und Vorschläge daraus (reine Funktionen).

Jede Rückmeldung wird mit einer Momentaufnahme gespeichert. Aus Häufungen entstehen
Vorschläge; nichts ändert sich von selbst: ein Vorschlag wirkt erst, wenn er angenommen
wird (`apply`). Die Auswertung besteht nur aus Zählen und Mittelwerten.

Vorschlagsarten:
  slot_earlier  Abschnitt einer Tagesart früher beginnen (mehrfach kalt kurz davor)
  target_up     Ziel einer Szene höher (mehrfach kalt, während sie lief)
  target_down   Ziel einer Szene niedriger (mehrfach zu warm, während sie lief)
"""

from __future__ import annotations

import copy
from datetime import datetime, timedelta
from typing import Any

from .const import ROOM_TARGET_LIMITS

KINDS = ("cold", "ok", "warm")
KEEP_DAYS = 60  # so lange bleiben Rückmeldungen gespeichert
MAX_ENTRIES = 500
WINDOW_DAYS = 14  # Häufungen in diesem Zeitraum zählen
MIN_COUNT = 3  # so viele gleiche Rückmeldungen (abzüglich "passt") ergeben einen Vorschlag
CLUSTER_MIN = 90  # "ungefähr zur selben Uhrzeit": Fenster in Minuten
LOOKAHEAD_MIN = 180  # ein wärmerer Abschnitt, der so bald beginnt, wird vorgezogen
LEAD_MIN = 30  # so viel vor der frühesten Rückmeldung soll er dann beginnen
STEP_K = 0.5
DISMISS_DAYS = 30  # abgelehnte Vorschläge kommen so lange nicht wieder
ROOM_NUDGE_K = 1.0  # Sofortwirkung im Raum bei "zu kalt" / "zu warm"


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value)


def _hhmm(minute: int) -> str:
    return f"{minute // 60:02d}:{minute % 60:02d}"


def _minute(hhmm: str) -> int:
    h, m = (int(x) for x in hhmm.split(":"))
    return h * 60 + m


def _num(value: float) -> str:
    return f"{value:.1f}".replace(".", ",")


def empty() -> dict[str, Any]:
    return {"entries": [], "dismissed": {}}


def ensure(data: dict | None) -> dict[str, Any]:
    base = empty()
    if isinstance(data, dict):
        base["entries"] = list(data.get("entries") or [])
        base["dismissed"] = dict(data.get("dismissed") or {})
    return base


def record(data: dict, now: datetime, kind: str, room: str | None, snapshot: dict) -> dict:
    """Rückmeldung mit Momentaufnahme anhängen, Altes entfernen."""
    entry = {
        "t": now.isoformat(),
        "kind": kind,
        "room": room,
        "minute": now.hour * 60 + now.minute,
        "used": False,
        **snapshot,
    }
    cutoff = now - timedelta(days=KEEP_DAYS)
    data["entries"] = [e for e in data["entries"] if _dt(e["t"]) > cutoff][-(MAX_ENTRIES - 1) :]
    data["entries"].append(entry)
    return entry


def _scene_target(config: dict, scene_id: str, room_id: str | None) -> float | None:
    scene = next((s for s in config["scenes"] if s["id"] == scene_id), None)
    if scene is None:
        return None
    if room_id is not None:
        room = next((r for r in config["rooms"] if r["id"] == room_id), None)
        if room is None:
            return None
        return room["targets"].get(scene_id, scene["default_target"])
    return scene["default_target"]


def _name(items: list[dict], item_id: str | None) -> str:
    return next((i["name"] for i in items if i["id"] == item_id), item_id or "")


def _best_cluster(entries: list[dict]) -> list[dict]:
    """Größte Gruppe von Rückmeldungen, deren Uhrzeiten in ein Fenster passen."""
    ordered = sorted(entries, key=lambda e: e["minute"])
    best: list[dict] = []
    for i, first in enumerate(ordered):
        group = [e for e in ordered[i:] if e["minute"] - first["minute"] <= CLUSTER_MIN]
        if len(group) > len(best):
            best = group
    return best


def suggest(data: dict, config: dict, now: datetime) -> list[dict[str, Any]]:
    """Offene Vorschläge aus den Rückmeldungen der letzten WINDOW_DAYS Tage."""
    cutoff = now - timedelta(days=WINDOW_DAYS)
    recent = [e for e in data["entries"] if not e.get("used") and _dt(e["t"]) > cutoff]
    room_ids = {r["id"] for r in config["rooms"]}
    out: list[dict[str, Any]] = []
    for scope in sorted({e.get("room") for e in recent}, key=lambda x: x or ""):
        if scope is not None and scope not in room_ids:
            continue
        mine = [e for e in recent if e.get("room") == scope]
        room_name = _name(config["rooms"], scope) if scope else None
        where = f" im Raum „{room_name}“" if room_name else ""
        # zu kalt: je Tagesart nach Uhrzeit gehäuft
        for day_type in config["day_types"]:
            cold = [e for e in mine if e["kind"] == "cold" and e.get("day_type") == day_type["id"]]
            group = _best_cluster(cold)
            if not group:
                continue
            lo, hi = group[0]["minute"], group[-1]["minute"]
            fine = sum(
                1
                for e in mine
                if e["kind"] == "ok"
                and e.get("day_type") == day_type["id"]
                and lo - CLUSTER_MIN // 2 <= e["minute"] <= hi + CLUSTER_MIN // 2
            )
            count = len(group) - fine
            if count < MIN_COUNT:
                continue
            median = group[len(group) // 2]["minute"]
            slots = day_type["slots"]
            current = max(
                (i for i, s in enumerate(slots) if _minute(s["start"]) <= median), default=None
            )
            scene_now = slots[current]["scene"] if current is not None else group[0].get("scene")
            target_now = _scene_target(config, scene_now, scope)
            # vor dem ersten Abschnitt gilt noch der letzte vom Vortag: der erste ist "der nächste"
            nxt = 0 if current is None else current + 1
            prev_start = -1 if current is None else _minute(slots[current]["start"])
            suggestion = None
            if scope is None and nxt < len(slots) and target_now is not None:
                start = _minute(slots[nxt]["start"])
                target_next = _scene_target(config, slots[nxt]["scene"], None)
                new_start = (lo - LEAD_MIN) // 15 * 15
                if (
                    target_next is not None
                    and target_next > target_now + 0.2
                    and 0 < start - median <= LOOKAHEAD_MIN
                    and new_start > prev_start
                    and new_start < start
                ):
                    scene_name = _name(config["scenes"], slots[nxt]["scene"])
                    suggestion = {
                        "id": f"slot_earlier|{day_type['id']}|{slots[nxt]['start']}",
                        "type": "slot_earlier",
                        "day_type": day_type["id"],
                        "slot": nxt,
                        "from": slots[nxt]["start"],
                        "to": _hhmm(new_start),
                        "scene": slots[nxt]["scene"],
                        "room": None,
                        "count": count,
                        "text": (
                            f"An Tagen der Art „{day_type['name']}“ war dir {count}-mal gegen "
                            f"{_hhmm(median)} kalt. Soll „{scene_name}“ schon um "
                            f"{_hhmm(new_start)} beginnen statt um {slots[nxt]['start']}?"
                        ),
                    }
            if suggestion is None and target_now is not None and scene_now is not None:
                new = min(ROOM_TARGET_LIMITS[1], target_now + STEP_K)
                if new > target_now:
                    suggestion = {
                        "id": f"target_up|{scene_now}|{scope or ''}",
                        "type": "target_up",
                        "day_type": day_type["id"],
                        "scene": scene_now,
                        "room": scope,
                        "delta": STEP_K,
                        "from": target_now,
                        "to": new,
                        "count": count,
                        "text": (
                            f"Dir war {count}-mal kalt{where}, während "
                            f"„{_name(config['scenes'], scene_now)}“ lief (gegen {_hhmm(median)}). "
                            f"Soll das Ziel dort {_num(new)} °C sein statt {_num(target_now)} °C?"
                        ),
                    }
            if suggestion is not None:
                out.append(suggestion)
        # zu warm: je Szene, egal zu welcher Uhrzeit
        for scene in config["scenes"]:
            warm = [e for e in mine if e["kind"] == "warm" and e.get("scene") == scene["id"]]
            fine = sum(1 for e in mine if e["kind"] == "ok" and e.get("scene") == scene["id"])
            count = len(warm) - fine
            target_now = _scene_target(config, scene["id"], scope)
            if count < MIN_COUNT or target_now is None:
                continue
            new = max(ROOM_TARGET_LIMITS[0], target_now - STEP_K)
            if new < target_now:
                out.append(
                    {
                        "id": f"target_down|{scene['id']}|{scope or ''}",
                        "type": "target_down",
                        "scene": scene["id"],
                        "room": scope,
                        "delta": -STEP_K,
                        "from": target_now,
                        "to": new,
                        "count": count,
                        "text": (
                            f"Dir war {count}-mal zu warm{where}, während „{scene['name']}“ lief. "
                            f"Soll das Ziel dort {_num(new)} °C sein statt {_num(target_now)} °C?"
                        ),
                    }
                )
    seen: set[str] = set()
    result = []
    for s in out:
        dismissed = data["dismissed"].get(s["id"])
        if dismissed and now - _dt(dismissed) < timedelta(days=DISMISS_DAYS):
            continue
        if s["id"] not in seen:
            seen.add(s["id"])
            result.append(s)
    return result


def apply(config: dict, suggestion: dict, value: Any = None) -> dict:
    """Vorschlag in eine Kopie der Einstellungen eintragen (danach model.validate)."""
    cfg = copy.deepcopy(config)
    if suggestion["type"] == "slot_earlier":
        day_type = next(d for d in cfg["day_types"] if d["id"] == suggestion["day_type"])
        slot = next(s for s in day_type["slots"] if s["start"] == suggestion["from"])
        slot["start"] = str(value) if value else suggestion["to"]
        return cfg
    new = float(value) if value is not None else suggestion["to"]
    delta = new - suggestion["from"]
    scene = next(s for s in cfg["scenes"] if s["id"] == suggestion["scene"])
    lo, hi = ROOM_TARGET_LIMITS
    if suggestion.get("room"):
        room = next(r for r in cfg["rooms"] if r["id"] == suggestion["room"])
        room["targets"][scene["id"]] = max(lo, min(hi, new))
        return cfg
    scene["default_target"] = max(lo, min(hi, scene["default_target"] + delta))
    for room in cfg["rooms"]:
        if scene["id"] in room["targets"]:
            room["targets"][scene["id"]] = max(lo, min(hi, room["targets"][scene["id"]] + delta))
    return cfg


def mark_used(data: dict, suggestion: dict, now: datetime) -> None:
    """Rückmeldungen, die zu einem erledigten Vorschlag geführt haben, nicht noch einmal zählen."""
    kind = "warm" if suggestion["type"] == "target_down" else "cold"
    cutoff = now - timedelta(days=WINDOW_DAYS)
    for entry in data["entries"]:
        if (
            entry["kind"] == kind
            and entry.get("room") == suggestion.get("room")
            and _dt(entry["t"]) > cutoff
            and (kind == "warm" or entry.get("day_type") == suggestion.get("day_type"))
        ):
            entry["used"] = True


def dismiss(data: dict, suggestion_id: str, now: datetime) -> None:
    data["dismissed"][suggestion_id] = now.isoformat()
