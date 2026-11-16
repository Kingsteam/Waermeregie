"""Konstanten für die Wärmeregie.

Sicherheitsgrenzen stehen gesammelt im Abschnitt SICHERHEIT und werden in
tests/test_limits.py geprüft. Nur nach Rücksprache ändern.
"""

from __future__ import annotations

from typing import Final

DOMAIN: Final = "waermeregie"
NAME: Final = "Wärmeregie"

STORAGE_VERSION: Final = 1
STORAGE_KEY_CONFIG: Final = f"{DOMAIN}.config"
STORAGE_KEY_STATE: Final = f"{DOMAIN}.state"

PANEL_URL_PATH: Final = "waermeregie"
STATIC_URL: Final = "/waermeregie_static"
PANEL_ELEMENT: Final = "waermeregie-panel"

EVALUATE_INTERVAL_S: Final = 60  # Regel spätestens jede Minute neu rechnen
DEBOUNCE_S: Final = 5  # nach Zustandsänderungen kurz sammeln
LOG_LENGTH: Final = 100

MODE_SHADOW: Final = "shadow"
MODE_ACTIVE: Final = "active"

STOVE_ALLOW: Final = "allow"
STOVE_FROST_ONLY: Final = "frost_only"
STOVE_DENY: Final = "deny"

WEEKDAYS: Final = ("mon", "tue", "wed", "thu", "fri", "sat", "sun")

# ---------------------------------------------------------------------------
# SICHERHEIT - Grenzen, die keine Einstellung überschreiten kann
# ---------------------------------------------------------------------------
# (min, max) je Parameter. Werte außerhalb werden beim Speichern abgelehnt.
PARAMETER_LIMITS: Final[dict[str, tuple[float, float]]] = {
    "start_below_k": (0.1, 3.0),
    "stop_above_k": (0.0, 2.0),
    "min_burn_min": (30, 360),  # kürzer als 30 min Brennen ist Takten
    "max_burn_min": (60, 720),
    "min_pause_min": (30, 360),  # nie kürzer als 30 min Pause (wie mcz_local)
    "max_starts_per_day": (1, 8),
    "opening_grace_min": (0, 30),
    "opening_stop_min": (1, 60),
    "opening_empty_room_min": (0, 30),
    "radiator_boost_k": (0.0, 3.0),
    "frost_c": (5.0, 15.0),
    "night_floor_c": (10.0, 20.0),
    "stove_block_setpoint_c": (16.0, 30.0),
    "presence_empty_min": (5, 240),
}
ROOM_TARGET_LIMITS: Final = (5.0, 28.0)  # Zieltemperatur Raum / Heizkörper
MAX_OVERRIDE_MIN: Final = 24 * 60
MAX_PAUSE_MIN: Final = 24 * 60
MAX_BOOST_K: Final = 3.0
MAX_BOOST_MIN: Final = 6 * 60
MIN_RADIATOR_STEP_K: Final = 0.5  # Heizkörper erst ab dieser Änderung neu setzen

DEFAULT_PARAMETERS: Final[dict[str, float]] = {
    "start_below_k": 0.5,
    "stop_above_k": 0.3,
    "min_burn_min": 90,
    "max_burn_min": 300,
    "min_pause_min": 60,
    "max_starts_per_day": 4,
    "opening_grace_min": 2,
    "opening_stop_min": 10,
    "opening_empty_room_min": 1,
    "radiator_boost_k": 1.0,
    "frost_c": 12.0,
    "night_floor_c": 16.0,
    "stove_block_setpoint_c": 28.0,
    "presence_empty_min": 45,
}
