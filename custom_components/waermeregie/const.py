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
    "opening_recovery_min": (0, 60),
    "opening_check_min": (0, 240),  # 0 = keine Prüfung
    "sensor_hold_min": (0, 120),  # Aussetzer höchstens so lange überbrücken
    "sensor_alert_min": (0, 720),  # 0 = keine Meldung
    "radiator_boost_k": (0.0, 3.0),
    "frost_c": (5.0, 15.0),
    "night_floor_c": (10.0, 20.0),
    "stove_block_setpoint_c": (16.0, 30.0),
    "presence_empty_min": (5, 240),
    "power_min": (1, 5),
    "power_max": (1, 5),
    "power_cold_c": (-20.0, 15.0),
    "pellet_bag_kg": (5.0, 30.0),
    "pellet_capacity_kg": (5.0, 100.0),
    "pellet_rate_kg_h": (0.3, 5.0),  # Startwert, bis gelernt
    "pellet_reminder_kg": (0.0, 30.0),
    "soft_start_min": (0, 15),  # Heizkörper vor dem Zünden öffnen; 0 = aus
    "self_off_wait_min": (0, 60),  # Ofen schaltet selbst ab (Wasser heiß): warten
    "warmup_extra_k": (0.0, 3.0),
    "warmup_lead_min": (15, 240),
}
ROOM_TARGET_LIMITS: Final = (5.0, 28.0)  # Zieltemperatur Raum / Heizkörper
MAX_OVERRIDE_MIN: Final = 24 * 60
MAX_PAUSE_MIN: Final = 24 * 60
MAX_BOOST_K: Final = 3.0
MAX_BOOST_MIN: Final = 6 * 60
MIN_WARMUP_MIN: Final = 30
MAX_WARMUP_MIN: Final = 6 * 60
WARMUP_AFTER_ARRIVAL_MIN: Final = 60  # nach der Ankunft noch so lange warm halten
SENSOR_OFFSET_LIMIT_K: Final = 5.0  # Korrektur je Temperaturfühler höchstens ±5 K
START_CONFIRM_MIN: Final = 3  # nach dem eigenen Startbefehl so lange auf "an" warten
HOT_WATER_C: Final = 50.0  # Wasser so heiß: Ofen hat wegen Kesseltemperatur selbst abgeschaltet
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
    "opening_recovery_min": 20,
    "opening_check_min": 60,
    "sensor_hold_min": 30,
    "sensor_alert_min": 60,
    "radiator_boost_k": 1.0,
    "frost_c": 12.0,
    "night_floor_c": 16.0,
    "stove_block_setpoint_c": 28.0,
    "presence_empty_min": 45,
    "power_min": 1,
    "power_max": 3,
    "power_cold_c": 0.0,
    "pellet_bag_kg": 15.0,
    "pellet_capacity_kg": 26.0,
    "pellet_rate_kg_h": 1.5,
    "pellet_reminder_kg": 5.0,
    "soft_start_min": 5,
    "self_off_wait_min": 30,
    "warmup_extra_k": 1.0,
    "warmup_lead_min": 60,
}

# Sensoren
OPENING_CHECK_DROP_K: Final = 0.3  # so viel sollte ein Raum bei offenem Fenster abkühlen

# Pelletvorrat
PELLET_MAX_GAP_S: Final = 15 * 60  # längere Lücken nicht als Brennzeit zählen
PELLET_RATE_LIMITS: Final = (0.3, 5.0)  # gelernter Verbrauch kg/h, Plausibilität
PELLET_DAYS_FOR_FORECAST: Final = 3

# Verlauf für die Grafik
HISTORY_STEP_MIN: Final = 10
HISTORY_HOURS: Final = 48
