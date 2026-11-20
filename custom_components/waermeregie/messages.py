"""Benachrichtigungen filtern: welche Art, wie oft, wann (reine Funktionen).

Arten (const.NOTIFY_KINDS):
  opening        Fenster/Tür länger offen (nach `opening_delay_min`)
  opening_check  Fenster meldet offen, Raum kühlt aber nicht ab
  sensor         Geräte lange nicht erreichbar (einmal am Tag gesammelt)
  pellets        Pellets nachfüllen
  stove_error    Ofen meldet Störung (kommt auch in der Ruhezeit)

Gleiche Meldung (Art + Raum) frühestens nach `repeat_min` wieder. In der
Ruhezeit werden nicht kritische Meldungen gesammelt und danach in einer
Nachricht geschickt (oder verworfen, wenn `quiet_hold` aus ist).
"""

from __future__ import annotations

from datetime import datetime, time, timedelta

from .const import NOTIFY_CRITICAL


def _time(value: str) -> time:
    h, m = (int(x) for x in value.split(":"))
    return time(h, m)


def in_quiet(settings: dict, now: datetime) -> bool:
    """Liegt now in der Ruhezeit? Über Mitternacht (22:00-07:00) erlaubt."""
    start, end = settings.get("quiet_start") or "", settings.get("quiet_end") or ""
    if not start or not end:
        return False
    s, e, t = _time(start), _time(end), now.time().replace(second=0, microsecond=0)
    if s < e:
        return s <= t < e
    return t >= s or t < e


def decide(settings: dict, kind: str, last_sent: datetime | None, now: datetime) -> str:
    """'send', 'hold' (für nach der Ruhezeit), oder 'drop'."""
    if not settings.get(kind, True):
        return "drop"
    repeat = float(settings.get("repeat_min") or 0)
    if last_sent is not None and repeat > 0 and now - last_sent < timedelta(minutes=repeat):
        return "drop"
    if kind not in NOTIFY_CRITICAL and in_quiet(settings, now):
        return "hold" if settings.get("quiet_hold", True) else "drop"
    return "send"


def bundle(texts: list[str]) -> str:
    if len(texts) == 1:
        return texts[0]
    return "Während der Ruhezeit: " + " · ".join(texts)
