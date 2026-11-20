"""Regel-Logik der Wärmeregie (ohne Home Assistant, vollständig testbar).

Eingabe: Einstellungen, gespeicherter Laufzustand, Beobachtungen (Messwerte).
Ausgabe: Entscheidung (Status für Oberfläche), Aktionen, neuer Laufzustand.

Grundidee: wenige lange Heizblöcke. Ein Block startet nur, wenn das Haus
spürbar zu kalt ist, läuft mindestens min_burn_min und endet, wenn das Ziel
erreicht ist. Danach mindestens min_pause_min Pause.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any

from .const import (
    HOT_WATER_C,
    MIN_RADIATOR_STEP_K,
    MODE_ACTIVE,
    ROOM_TARGET_LIMITS,
    START_CONFIRM_MIN,
    STOVE_ALLOW,
    STOVE_DENY,
    STOVE_FROST_ONLY,
    WEEKDAYS,
)

PRESENCE_SETBACK_K = 1.5  # leerer Raum: so viel kühler


@dataclass
class RoomObs:
    """Messwerte eines Raums."""

    temperature: float | None = None
    sensors_missing: int = 0
    open_since: datetime | None = None  # seit wann (irgend)eine Öffnung offen ist
    open_entity: str | None = None
    open_name: str | None = None
    closed_at: datetime | None = None  # wann zuletzt alles wieder zu war
    last_open_minutes: float = 0.0  # wie lange es davor offen war
    occupied: bool | None = None  # None = keine Melder
    empty_since: datetime | None = None
    humidity: float | None = None  # höchste Luftfeuchte im Raum (%)
    ventilating: bool = False  # Fenster offen wegen hoher Feuchte: noch nicht melden
    alert_from: datetime | None = None  # Feuchte wieder unten: Meldung zählt ab hier


@dataclass
class StoveObs:
    """Zustand des Ofens."""

    available: bool = False
    on: bool = False  # eingeschaltet (hvac_mode != off)
    burning: bool = False  # brennt gerade (hvac_action heating)
    error: bool = False  # Störung gemeldet
    eco_on: bool | None = None  # Eco des Ofens (None = nicht zugeordnet)
    has_power: bool = False  # Leistungsstufe zugeordnet
    water_c: float | None = None
    ignitions: int | None = None


@dataclass
class Observation:
    """Alles, was die Regel zum Zeitpunkt now weiß."""

    now: datetime
    rooms: dict[str, RoomObs] = field(default_factory=dict)
    stove: StoveObs = field(default_factory=StoveObs)
    workday: bool | None = None
    outdoor_c: float | None = None
    chrono_on: bool | None = None


@dataclass
class Result:
    """Ergebnis einer Auswertung."""

    status: dict[str, Any]
    # ("stove_start",), ("stove_stop",), ("stove_power", stufe), ("chrono_off",),
    # ("eco_off",), ("radiator", entity, sollwert)
    actions: list[tuple]
    state: dict[str, Any]
    log: list[str]


def empty_state() -> dict[str, Any]:
    """Laufzustand beim allerersten Start."""
    return {
        "override": None,  # {"scene": id, "until": iso}
        "pause_until": None,
        "boost": None,  # {"delta": k, "until": iso}
        "block_start": None,
        "last_stop": None,
        "starts": [],  # iso-Zeitpunkte der Starts (letzte 2 Tage)
        "radiators": {},  # zuletzt gesetzter Sollwert je Heizkörper
        "power": None,  # zuletzt gesetzte Leistungsstufe
        # Aufheizen: {"start_at", "until", "arrive", "started"}
        "warmup": None,
        "prepare_since": None,  # sanfter Start: seit wann die Heizkörper vorlaufen
        "start_cmd": None,  # eigener Startbefehl, noch nicht vom Ofen bestätigt
        "self_off_since": None,  # Ofen hat im Block selbst abgeschaltet (Wasser heiß)
    }


def _dt(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def _fmt_k(value: float) -> str:
    return f"{value:.1f}".replace(".", ",")


def _clamp_target(value: float) -> float:
    lo, hi = ROOM_TARGET_LIMITS
    return max(lo, min(hi, round(value * 2) / 2))


# --- Tagesart und Szene --------------------------------------------------------


def day_type_for(config: dict, day: datetime, workday: bool | None) -> tuple[dict, str]:
    """Tagesart für einen Tag und kurze Begründung."""
    weekday = day.weekday()
    key = WEEKDAYS[weekday]
    names = (
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
        "Samstag",
        "Sonntag",
    )
    reason = names[weekday]
    if workday is False and weekday < 5:
        key = "holiday"
        reason = f"{names[weekday]}, Feiertag"
    dt_id = config["week"][key]
    day_type = next(d for d in config["day_types"] if d["id"] == dt_id)
    return day_type, reason


def scene_at(config: dict, now: datetime, workday: bool | None) -> tuple[str, str | None]:
    """Szene laut Zeitplan und Uhrzeit des nächsten Wechsels (HH:MM)."""
    day_type, _ = day_type_for(config, now, workday)
    hhmm = now.strftime("%H:%M")
    slots = day_type["slots"]
    current = None
    next_change = None
    for slot in slots:
        if slot["start"] <= hhmm:
            current = slot["scene"]
        elif next_change is None:
            next_change = slot["start"]
    if current is None:
        # vor dem ersten Abschnitt: letzter Abschnitt des Vortags gilt weiter
        yesterday, _ = day_type_for(config, now - timedelta(days=1), None)
        current = yesterday["slots"][-1]["scene"]
    if next_change is None:
        tomorrow, _ = day_type_for(config, now + timedelta(days=1), None)
        next_change = tomorrow["slots"][0]["start"]
    return current, next_change


# --- Auswertung ---------------------------------------------------------------


def evaluate(config: dict, state: dict, obs: Observation) -> Result:
    """Eine Auswertung: was soll jetzt passieren?"""
    now = obs.now
    p = config["parameters"]
    state = {**empty_state(), **state}
    log: list[str] = []
    actions: list[tuple] = []
    active = config["mode"] == MODE_ACTIVE

    # Abgelaufene Übersteuerungen entfernen
    if state["override"] and _dt(state["override"]["until"]) <= now:
        state["override"] = None
        log.append("Übersteuerung abgelaufen, wieder nach Zeitplan")
    if state["pause_until"] and _dt(state["pause_until"]) <= now:
        state["pause_until"] = None
    if state["boost"] and _dt(state["boost"]["until"]) <= now:
        state["boost"] = None
    cutoff = now - timedelta(days=2)
    state["starts"] = [s for s in state["starts"] if _dt(s) > cutoff]

    # Tagesart und Szene
    day_type, day_reason = day_type_for(config, now, obs.workday)
    sched_scene, next_change = scene_at(config, now, obs.workday)
    scenes = {s["id"]: s for s in config["scenes"]}
    if state["override"] and state["override"]["scene"] in scenes:
        scene_id, source, until = (
            state["override"]["scene"],
            "override",
            state["override"]["until"],
        )
    else:
        scene_id, source, until = sched_scene, "schedule", None
    scene = scenes[scene_id]
    policy = scene["stove"]
    boost = state["boost"]["delta"] if state["boost"] else 0.0

    # Aufheizen: Ofen darf (einmal) starten, auch wenn es warm genug ist;
    # Ziele der Aufheiz-Szene plus warmup_extra_k
    warmup = state["warmup"]
    if warmup and _dt(warmup["until"]) <= now:
        state["warmup"] = warmup = None
        log.append("Aufheizen beendet, wieder nach Zeitplan")
    warmup_active = bool(warmup) and _dt(warmup["start_at"]) <= now
    target_scene = scene
    if warmup_active:
        if not warmup.get("announced"):
            warmup["announced"] = True
            log.append("Aufheizen beginnt")
        target_scene = scenes.get(config.get("warmup_scene") or "") or next(
            (s for s in config["scenes"] if s["stove"] == STOVE_ALLOW), scene
        )
        policy = STOVE_ALLOW
        boost += p["warmup_extra_k"]

    # Räume
    room_status = []
    weighted_sum = 0.0
    weight_total = 0.0
    frost_need = False
    floor = p["night_floor_c"] if policy == STOVE_FROST_ONLY else p["frost_c"]
    alerts = []
    long_opening = False
    temp_sum = target_sum = temp_weight = 0.0
    for room in config["rooms"]:
        ro = obs.rooms.get(room["id"], RoomObs())
        target = room["targets"].get(target_scene["id"], target_scene["default_target"])
        if (
            not warmup_active  # beim Aufheizen ist noch niemand da
            and ro.occupied is False
            and ro.empty_since
            and (now - ro.empty_since >= timedelta(minutes=p["presence_empty_min"]))
        ):
            target = max(target - PRESENCE_SETBACK_K, p["frost_c"])
        target = _clamp_target(target + boost)

        open_min = (now - ro.open_since).total_seconds() / 60 if ro.open_since else 0.0
        has_presence = bool(room["presence"])
        grace = p["opening_grace_min"]
        alert_after = p["opening_stop_min"]
        if has_presence and ro.occupied is False:
            # Öffnung in leerem Raum (z. B. Hund stößt Tür auf): früher reagieren
            grace = min(grace, p["opening_empty_room_min"])
            alert_after = min(alert_after, max(p["opening_empty_room_min"], 1))
        is_open = ro.open_since is not None and open_min >= grace
        # Lüften wegen Feuchte: keine Meldung; danach zählt die Zeit ab "wieder trocken"
        alert_min = open_min
        if ro.open_since is not None and ro.alert_from and ro.alert_from > ro.open_since:
            alert_min = (now - ro.alert_from).total_seconds() / 60
        if ro.open_since is not None and not ro.ventilating and alert_min >= alert_after:
            alerts.append(
                {
                    "kind": "opening",
                    "room": room["id"],
                    "entity": ro.open_entity,
                    "minutes": int(alert_min),
                    "message": (
                        f"{ro.open_name or 'Öffnung'} ({room['name']}) "
                        f"seit {int(open_min)} min offen"
                    ),
                }
            )
        if ro.open_since is not None and open_min >= p["opening_stop_min"]:
            long_opening = True

        # Nach dem Lüften: Raum eine Weile nicht für den Ofenstart zählen,
        # die Luft erwärmt sich schnell wieder (Fühler beim Fenster misst zu kalt)
        recover_until = None
        if (
            ro.open_since is None
            and ro.closed_at is not None
            and ro.last_open_minutes >= grace
            and p["opening_recovery_min"] > 0
        ):
            until = ro.closed_at + timedelta(minutes=p["opening_recovery_min"])
            if now < until:
                recover_until = until
        deficit = None
        if ro.temperature is not None:
            deficit = round(target - ro.temperature, 2)
            if ro.temperature < floor:
                frost_need = True
            if not is_open and recover_until is None:
                weighted_sum += room["importance"] * deficit
                weight_total += room["importance"]
            temp_sum += room["importance"] * ro.temperature
            target_sum += room["importance"] * target
            temp_weight += room["importance"]
        room_status.append(
            {
                "id": room["id"],
                "name": room["name"],
                "temperature": ro.temperature,
                "target": target,
                "deficit_k": deficit,
                "radiator_setpoint": None,  # unten ergänzt
                "open": is_open,
                "open_minutes": int(open_min),
                "recover_until": recover_until.isoformat() if recover_until else None,
                "occupied": ro.occupied,
                "sensors_missing": ro.sensors_missing,
                "humidity": ro.humidity,
                "ventilating": bool(ro.ventilating and ro.open_since is not None),
            }
        )
    house_deficit = round(weighted_sum / weight_total, 2) if weight_total else None

    # Ofen: externe Änderungen übernehmen (nur aktiv, im Schatten ist alles gedacht)
    in_block = state["block_start"] is not None
    start_cmd = _dt(state["start_cmd"])
    confirming = start_cmd is not None and now - start_cmd < timedelta(minutes=START_CONFIRM_MIN)
    if obs.stove.on or not confirming:
        state["start_cmd"] = None
    self_off_since = _dt(state["self_off_since"])
    if active and obs.stove.available:
        hot = obs.stove.water_c is not None and obs.stove.water_c >= HOT_WATER_C
        if in_block and not obs.stove.on and confirming:
            pass  # eigener Start, der Ofen meldet sich gleich als "an"
        elif in_block and not obs.stove.on:
            wait = timedelta(minutes=p["self_off_wait_min"])
            if self_off_since is None and hot and not obs.stove.error and wait:
                # Ohne Puffer wird das Wasser schnell heiß, der Ofen schaltet selbst
                # ab und zündet nach dem Abkühlen wieder: das ist kein Ende des Blocks
                state["self_off_since"] = now.isoformat()
                self_off_since = now
                log.append("Ofen hat selbst abgeschaltet (Wasser heiß), Heizblock wartet")
            elif self_off_since is None or now - self_off_since >= wait or obs.stove.error:
                state["block_start"] = None
                state["last_stop"] = (self_off_since or now).isoformat()
                state["self_off_since"] = self_off_since = None
                in_block = False
                log.append("Ofen ist aus (von Hand oder vom Ofen selbst), Heizblock beendet")
        elif in_block and obs.stove.on and self_off_since is not None:
            state["self_off_since"] = self_off_since = None
            log.append("Ofen hat wieder gezündet, Heizblock läuft weiter")
        elif not in_block and obs.stove.on and not obs.stove.error:
            # Bei Störung nicht übernehmen: sonst Schleife aus „von Hand ein“ und
            # „Block beendet: Störung“ mit einem Aus-Befehl je Runde (19.11.2026)
            state["block_start"] = now.isoformat()
            state["starts"].append(now.isoformat())
            in_block = True
            log.append("Ofen wurde von Hand eingeschaltet, Wärmeregie übernimmt den Block")

    starts_today = sum(1 for s in state["starts"] if _dt(s).date() == now.date())
    last_stop = _dt(state["last_stop"])
    pause_end = last_stop + timedelta(minutes=p["min_pause_min"]) if last_stop else None
    manual_pause = _dt(state["pause_until"])
    soft = timedelta(minutes=p["soft_start_min"])
    action = "keep"
    deficit_txt = (
        f"Wohnräume {_fmt_k(abs(house_deficit))} K {'unter' if house_deficit > 0 else 'über'} Ziel"
        if house_deficit is not None
        else "keine Raumtemperatur bekannt"
    )

    if in_block:
        block_start = _dt(state["block_start"])
        elapsed = (now - block_start).total_seconds() / 60
        reached = house_deficit is None or house_deficit <= -p["stop_above_k"]
        stop_reason = None
        if obs.stove.error:
            stop_reason = "Ofen meldet eine Störung"
        elif policy == STOVE_DENY:
            stop_reason = f"Szene „{scene['name']}“: Ofen aus"
        elif manual_pause and manual_pause > now:
            stop_reason = "Ofen von Hand pausiert"
        elif elapsed >= p["max_burn_min"]:
            stop_reason = "längste Brenndauer erreicht"
        elif elapsed >= p["min_burn_min"]:
            if reached:
                stop_reason = f"Ziel erreicht ({deficit_txt})"
            elif long_opening:
                stop_reason = "Tür oder Fenster lange offen"
            elif policy == STOVE_FROST_ONLY and not frost_need:
                stop_reason = f"Szene „{scene['name']}“: nur Frostschutz"
        if stop_reason:
            action = "stop"
            phase = "pause"
            reason = f"Heizblock beendet: {stop_reason}"
            state["block_start"] = None
            state["self_off_since"] = self_off_since = None
            state["last_stop"] = now.isoformat()
            pause_end = now + timedelta(minutes=p["min_pause_min"])
            actions.append(("stove_stop",))
            log.append(reason)
        else:
            phase = "block"
            rest = max(0, int(p["min_burn_min"] - elapsed))
            reason = f"Heizblock seit {int(elapsed)} min" + (
                f", mindestens noch {rest} min" if rest else f", bis Ziel erreicht ({deficit_txt})"
            )
            if self_off_since is not None:
                until = self_off_since + timedelta(minutes=p["self_off_wait_min"])
                reason = (
                    "Ofen hat selbst abgeschaltet (Wasser heiß), "
                    f"wartet bis {until.strftime('%H:%M')} auf Neustart"
                )
    else:
        want_comfort = (
            policy == STOVE_ALLOW
            and house_deficit is not None
            and house_deficit >= p["start_below_k"]
        )
        warmup_start = warmup_active and not warmup.get("started")
        want = want_comfort or warmup_start or (frost_need and policy != STOVE_DENY)
        blocker = None
        phase = "idle"
        if obs.stove.error:
            blocker, phase = "Ofen meldet eine Störung", "blocked"
        elif policy == STOVE_DENY:
            blocker, phase = f"Szene „{scene['name']}“: Ofen aus", "idle"
        elif pause_end and pause_end > now:
            blocker, phase = (
                f"Pause gegen Takten bis {pause_end.strftime('%H:%M')}",
                "pause",
            )
        elif manual_pause and manual_pause > now:
            blocker, phase = (
                f"von Hand pausiert bis {manual_pause.strftime('%H:%M')}",
                "blocked",
            )
        elif active and not obs.stove.available:
            blocker, phase = "Ofen nicht erreichbar", "blocked"
        elif long_opening and not frost_need:
            blocker, phase = "Tür oder Fenster lange offen", "blocked"
        elif starts_today >= p["max_starts_per_day"] and not frost_need:
            blocker, phase = f"schon {starts_today} Starts heute", "blocked"
        if warmup_start:
            why = f"Aufheizen ({deficit_txt})"
        else:
            why = deficit_txt if want_comfort else "Frostschutz"
        prepare = _dt(state["prepare_since"])
        if want and blocker is None and soft and (prepare is None or now - prepare < soft):
            # Sanfter Start: erst die Heizkörper öffnen, damit das Wasser die
            # Wärme gleich abgeben kann (ohne Puffer wird es sonst zu schnell heiß)
            if prepare is None:
                state["prepare_since"] = now.isoformat()
                prepare = now
                log.append(
                    f"Sanfter Start: Heizkörper öffnen, Ofen zündet um "
                    f"{(now + soft).strftime('%H:%M')} ({why})"
                )
            phase = "prepare"
            start_at = prepare + soft
            reason = f"Heizkörper öffnen, Ofen zündet um {start_at.strftime('%H:%M')} ({why})"
        elif want and blocker is None:
            action = "start"
            phase = "block"
            reason = "Heizblock gestartet: " + why
            state["block_start"] = now.isoformat()
            state["starts"].append(now.isoformat())
            state["prepare_since"] = None
            state["start_cmd"] = now.isoformat()
            if warmup_start:
                warmup["started"] = True
            starts_today += 1
            actions.append(("stove_start",))
            log.append(reason)
        elif want:
            state["prepare_since"] = None
            reason = f"Wärme nötig ({why}), aber {blocker}"
        else:
            state["prepare_since"] = None
            reason = (blocker + ", " if blocker else "") + (
                f"kein Bedarf ({deficit_txt})" if policy != STOVE_DENY else ""
            )
            reason = reason.strip(", ")

    in_block_now = state["block_start"] is not None
    preparing = state["prepare_since"] is not None and not in_block_now
    if in_block_now:
        state["prepare_since"] = None

    # Leistungsstufe: klein anfangen, bei großem Bedarf oder Kälte mehr
    power = None
    if in_block_now and obs.stove.has_power:
        lo, hi = int(p["power_min"]), int(p["power_max"])
        # ab Startschwelle linear bis 2 K Bedarf: kleinste ... höchste Stufe
        span = max(0.1, 2.0 - p["start_below_k"])
        share = min(1.0, max(0.0, ((house_deficit or 0.0) - p["start_below_k"]) / span))
        power = lo + round((hi - lo) * share)
        if obs.outdoor_c is not None and obs.outdoor_c < p["power_cold_c"]:
            power = hi
        if long_opening:
            power = lo
        if power != state["power"]:
            actions.append(("stove_power", power))
    state["power"] = power

    # Nur eine Stelle steuert: Zeitprogramm und Eco des Ofens aus (wirkt nur aktiv)
    if obs.chrono_on:
        actions.append(("chrono_off",))
    if obs.stove.eco_on:
        actions.append(("eco_off",))

    # Heizkörper: während eines Blocks öffnen, damit die Wärme ins Haus geht
    for room, rs in zip(config["rooms"], room_status, strict=True):
        if rs["open"]:
            setpoint = p["frost_c"]
        elif in_block_now or preparing:
            setpoint = rs["target"] + p["radiator_boost_k"]
        else:
            setpoint = rs["target"]
        setpoint = _clamp_target(setpoint)
        rs["radiator_setpoint"] = setpoint
        for entity in room["radiators"]:
            last = state["radiators"].get(entity)
            if last is None or abs(last - setpoint) >= MIN_RADIATOR_STEP_K:
                actions.append(("radiator", entity, setpoint))
                state["radiators"][entity] = setpoint

    status = {
        "mode": config["mode"],
        "now": now.isoformat(),
        "day_type": {
            "id": day_type["id"],
            "name": day_type["name"],
            "reason": day_reason,
        },
        "scene": {
            "id": scene_id,
            "name": scene["name"],
            "icon": scene["icon"],
            "source": source,
            "until": until,
            "next_change": None if source == "override" else next_change,
        },
        "stove": {
            "entity": config["stove"]["climate"],
            "available": obs.stove.available,
            "burning": obs.stove.burning,
            "on": obs.stove.on,
            "phase": phase,
            "action": action,
            "reason": reason,
            "block_start": state["block_start"],
            "pause_until": (
                max(filter(None, [pause_end, manual_pause])).isoformat()
                if (pause_end and pause_end > now) or (manual_pause and manual_pause > now)
                else None
            ),
            "starts_today": starts_today,
            "max_starts_per_day": int(p["max_starts_per_day"]),
            "chrono_warning": bool(obs.chrono_on),
            "eco_warning": bool(obs.stove.eco_on),
            "error": obs.stove.error,
            "power_level": power,
            "start_at": ((_dt(state["prepare_since"]) + soft).isoformat() if preparing else None),
            "self_off": self_off_since is not None,
            "water_c": obs.stove.water_c,
            "ignitions": obs.stove.ignitions,
        },
        "house": {
            "deficit_k": house_deficit,
            "outdoor_c": obs.outdoor_c,
            "temperature_c": round(temp_sum / temp_weight, 1) if temp_weight else None,
            "target_c": round(target_sum / temp_weight, 1) if temp_weight else None,
        },
        "warmup": (
            {
                "start_at": state["warmup"]["start_at"],
                "until": state["warmup"]["until"],
                "arrive": state["warmup"].get("arrive"),
                "active": warmup_active,
            }
            if state["warmup"]
            else None
        ),
        "rooms": room_status,
        "alerts": alerts,
        "overrides": {
            "scene": state["override"],
            "pause_until": state["pause_until"],
            "boost": state["boost"],
        },
    }
    return Result(status=status, actions=actions, state=state, log=log)
