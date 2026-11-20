"""Unscharfe Regeln für die Wärmeabfuhr (reine Funktionen, ohne Home Assistant).

Statt bei einer festen Wassertemperatur schlagartig alle Heizkörper aufzudrehen,
öffnet die Wärmeregie sie umso weiter, je heißer der Kessel ist. Ein Raum, der
schon deutlich über seinem Ziel ist, bekommt etwas weniger, aber nie weniger als
die Hälfte, damit die Wärme sicher aus dem Kessel kann.
"""

from __future__ import annotations

WARM_FULL_K: float = 3.0  # so viel über dem Ziel gilt ein Raum als "ganz warm"
WARM_SHARE_MIN: float = 0.5  # ein warmer Raum bekommt mindestens die Hälfte
FULL_LEVEL: float = 0.9  # ab dieser Zugehörigkeit nahe am Kesselschutz: voller Zusatz


def ramp(x: float, low: float, high: float) -> float:
    """0 bis low, 1 ab high, linear dazwischen."""
    if high <= low:
        return 1.0 if x >= high else 0.0
    if x <= low:
        return 0.0
    if x >= high:
        return 1.0
    return (x - low) / (high - low)


def mu_hot(water: float | None, start_c: float, low_k: float, high_k: float, end_c: float) -> float:
    """Zugehörigkeit "Kessel heiß": 0 bei start - low_k, 1 bei start + high_k.

    Unter end_c (Ende der Wärmeabfuhr) immer 0.
    """
    if water is None or water <= end_c:
        return 0.0
    return ramp(water, start_c - low_k, start_c + high_k)


def mu_warm(temperature: float | None, target: float) -> float:
    """Zugehörigkeit "Raum schon warm": 0 bei Ziel, 1 bei Ziel + 3 K."""
    if temperature is None:
        return 0.0
    return ramp(temperature - target, 0.0, WARM_FULL_K)


def round_half(value: float) -> float:
    return round(value * 2) / 2


def extra_k(
    extra_max_k: float, hot: float, warm: float, water: float | None, overheat_c: float
) -> float:
    """Zusatz auf das Raumziel für einen Heizkörper, auf 0,5 K gerundet.

    Regel: Zusatz = extra_max * hot * (1 - 0,5 * warm). Nahe am Kesselschutz
    (hot >= 0,9 und Wasser >= overheat_c - 5) gilt der volle Zusatz für alle
    Räume: Sicherheit vor Komfort.
    """
    if hot <= 0:
        return 0.0
    if hot >= FULL_LEVEL and water is not None and water >= overheat_c - 5:
        return round_half(extra_max_k)
    share = 1.0 - (1.0 - WARM_SHARE_MIN) * warm
    return round_half(extra_max_k * hot * share)
