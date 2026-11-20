"""Lernen, wie Kessel und Heizkörper zusammenspielen (reine Funktionen).

Gemessen wird aus dem laufenden Betrieb:
  selfoff_c    Wassertemperatur, bei der der Ofen selbst abschaltet
  afterheat_k  Nachwärme: wie weit das Wasser nach dem Abschalten noch steigt
               (Höchstwert in AFTERHEAT_WINDOW_MIN minus Wert beim Abschalten)
  cool_k_min   wie schnell das Wasser während der Wärmeabfuhr abkühlt (nur Info)

Jeder Wert ist ein gleitender Mittelwert (EMA). Daraus ergibt sich die
Startschwelle der Wärmeabfuhr. Lernen kann sie nur senken (früher öffnen),
nie über den eingestellten Wert heben, und erst nach MIN_SAMPLES Messungen.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any

ALPHA: float = 0.3
MIN_SAMPLES: int = 3
AFTERHEAT_WINDOW_MIN: int = 20
STOP_CMD_MIN: int = 3  # so lange nach eigenem Aus-Befehl gilt "aus" als von uns
SELFOFF_LIMITS: tuple[float, float] = (60.0, 95.0)
AFTERHEAT_LIMITS: tuple[float, float] = (0.0, 30.0)
COOL_LIMITS: tuple[float, float] = (0.0, 10.0)
# Über 99,5 °C meldet der Fühler seinen Anschlag (126,0), keine echte Temperatur
# (20.11.2026). Solche Werte machen eine laufende Messung ungültig.
WATER_VALID_MAX_C: float = 100.0
PEAK_MARGIN_K: float = 5.0  # Zielspitze so weit unter dem Kesselschutz
SELFOFF_MARGIN_K: float = 2.0  # bzw. so weit unter der Selbstabschaltung
SAFETY_K: float = 3.0  # zusätzlicher Abstand
DEFAULT_PEAK_C: float = 85.0

KEYS = ("selfoff_c", "afterheat_k", "cool_k_min")
LIMITS = {"selfoff_c": SELFOFF_LIMITS, "afterheat_k": AFTERHEAT_LIMITS, "cool_k_min": COOL_LIMITS}


def empty() -> dict[str, Any]:
    return {
        "values": dict.fromkeys(KEYS),
        "samples": dict.fromkeys(KEYS, 0),
        "updated": None,
        # Laufende Beobachtung (nicht gelernt)
        "last_on": None,
        "last_burning": None,
        "stop_cmd": None,
        "watch": None,  # Nachwärme: {"since", "start_c", "max_c"}
        "dump_peak": None,  # Wärmeabfuhr: {"c", "at"}
    }


def ensure(learn: dict | None) -> dict[str, Any]:
    """Alten oder fehlenden Lernzustand auf die aktuelle Form bringen."""
    base = empty()
    if not isinstance(learn, dict):
        return base
    out = {**base, **learn}
    out["values"] = {**base["values"], **(learn.get("values") or {})}
    out["samples"] = {**base["samples"], **(learn.get("samples") or {})}
    return out


def reset(learn: dict | None) -> dict[str, Any]:
    """Gelernte Werte vergessen, laufende Beobachtung behalten."""
    cur = ensure(learn)
    fresh = empty()
    for key in ("last_on", "last_burning", "stop_cmd", "watch", "dump_peak"):
        fresh[key] = cur[key]
    return fresh


def _dt(value: str | None) -> datetime | None:
    return datetime.fromisoformat(value) if value else None


def plausible(water: float | None) -> bool:
    """Ist die Wassertemperatur ein echter Messwert (nicht der Anschlag des Fühlers)?"""
    return water is not None and 0.0 <= water <= WATER_VALID_MAX_C


def add_sample(learn: dict, key: str, value: float, now: datetime) -> bool:
    """Messung übernehmen (EMA), wenn plausibel. True = übernommen."""
    lo, hi = LIMITS[key]
    if not lo <= value <= hi:
        return False
    old = learn["values"].get(key)
    learn["values"][key] = round(value if old is None else old + ALPHA * (value - old), 2)
    learn["samples"][key] = int(learn["samples"].get(key) or 0) + 1
    learn["updated"] = now.isoformat()
    return True


def learned(learn: dict, key: str) -> float | None:
    if int(learn["samples"].get(key) or 0) < MIN_SAMPLES:
        return None
    return learn["values"].get(key)


def effective_start(learn: dict, start_c: float, lower_c: float, overheat_c: float) -> float:
    """Startschwelle der Wärmeabfuhr; Lernen kann sie nur senken."""
    afterheat = learned(learn, "afterheat_k")
    if afterheat is None:
        return start_c
    selfoff = learned(learn, "selfoff_c")
    peak = overheat_c - PEAK_MARGIN_K
    peak = (
        min(peak, selfoff - SELFOFF_MARGIN_K) if selfoff is not None else min(peak, DEFAULT_PEAK_C)
    )
    wanted = peak - afterheat - SAFETY_K
    return round(max(lower_c, min(start_c, wanted)), 1)


def observe(
    learn: dict,
    now: datetime,
    on: bool,
    burning: bool,
    water: float | None,
    in_block: bool,
    hot_c: float,
) -> list[str]:
    """Einen Messschritt auswerten. Gibt Protokolltexte zurück (Lernschritte)."""
    log: list[str] = []
    was_on = learn.get("last_on")
    stop_cmd = _dt(learn.get("stop_cmd"))
    commanded = stop_cmd is not None and now - stop_cmd <= timedelta(minutes=STOP_CMD_MIN)

    if was_on and not on:
        # Abschalten: Selbstabschaltung wegen heißem Wasser?
        if (
            in_block
            and not commanded
            and learn.get("last_burning")
            and water is not None
            and water >= hot_c
            and add_sample(learn, "selfoff_c", water, now)
        ):
            log.append(f"Gelernt: Ofen schaltet bei etwa {learn['values']['selfoff_c']:.0f} °C ab")
        # Nachwärme beobachten
        learn["watch"] = (
            {"since": now.isoformat(), "start_c": water, "max_c": water}
            if plausible(water)
            else None
        )
    if on:
        learn["watch"] = None  # wieder gezündet: Messung unvollständig

    watch = learn.get("watch")
    if watch is not None and not on:
        if not plausible(water):
            learn["watch"] = None  # Lücke oder Fühler am Anschlag: Messung ungültig
        else:
            watch["max_c"] = max(watch["max_c"], water)
            if now - _dt(watch["since"]) >= timedelta(minutes=AFTERHEAT_WINDOW_MIN):
                rise = watch["max_c"] - watch["start_c"]
                if add_sample(learn, "afterheat_k", rise, now):
                    log.append(
                        f"Gelernt: Nachwärme nach dem Abschalten etwa "
                        f"{learn['values']['afterheat_k']:.1f} K"
                    )
                learn["watch"] = None

    if not commanded:
        learn["stop_cmd"] = None
    learn["last_on"] = on
    learn["last_burning"] = burning
    return log


def track_dump(learn: dict, now: datetime, active: bool, water: float | None) -> None:
    """Abkühlrate während der Wärmeabfuhr: vom Höchstwert bis zum Ende."""
    peak = learn.get("dump_peak")
    if water is not None and not plausible(water):
        learn["dump_peak"] = None  # Fühler am Anschlag: Messung ungültig
        return
    if active and water is not None:
        if peak is None or water >= peak["c"]:
            learn["dump_peak"] = {"c": water, "at": now.isoformat()}
        return
    if not active and peak is not None:
        minutes = (now - _dt(peak["at"])).total_seconds() / 60
        if water is not None and minutes >= 5:
            add_sample(learn, "cool_k_min", round((peak["c"] - water) / minutes, 2), now)
        learn["dump_peak"] = None


def status(learn: dict, start_effective: float) -> dict[str, Any]:
    return {
        "values": dict(learn["values"]),
        "samples": dict(learn["samples"]),
        "updated": learn.get("updated"),
        "min_samples": MIN_SAMPLES,
        "dump_start_c": start_effective,
    }
