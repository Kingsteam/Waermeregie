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
    "hard_stop_above_k": (0.0, 5.0),  # so weit über Ziel: sofort aus, auch von Hand; 0 = aus
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
    "cold_min": (30, 180),  # "Mir ist kalt": so lange gelten die höheren Ziele
    "cold_residual_c": (0.0, 70.0),  # Kessel so warm: erst nur Heizkörper öffnen; 0 = aus
    # Wärmeabfuhr ohne Puffer: Heizkörper nehmen die Wärme aus dem Kessel auf
    "dump_start_c": (50.0, 85.0),  # Mitte der Rampe "Kessel heiß"
    "dump_end_c": (40.0, 80.0),  # darunter ist die Wärmeabfuhr aus
    "dump_extra_k": (0.0, 5.0),  # höchstens so viel über dem Raumziel
    "dump_ramp_low_k": (1.0, 15.0),  # Rampe beginnt so weit unter der Mitte
    "dump_ramp_high_k": (1.0, 20.0),  # und ist so weit über der Mitte voll
}
ROOM_TARGET_LIMITS: Final = (5.0, 28.0)  # Zieltemperatur Raum / Heizkörper
# Kesselschutz: Hydro-Ofen ohne Puffer, Wärme kann nicht weg (Heizkörper zu).
# Ab OVERHEAT_C bleibt der Ofen aus und alle Heizkörper öffnen (OVERHEAT_RADIATOR_C),
# bis das Wasser wieder unter OVERHEAT_CLEAR_C ist. 20.11.2026: 92,5 °C gemessen.
OVERHEAT_C: Final = 90.0
OVERHEAT_CLEAR_C: Final = 75.0
OVERHEAT_RADIATOR_C: Final = 26.0
MAX_OVERRIDE_MIN: Final = 24 * 60
MAX_PAUSE_MIN: Final = 24 * 60
MAX_BOOST_K: Final = 3.0
MAX_BOOST_MIN: Final = 6 * 60
MIN_WARMUP_MIN: Final = 30
MAX_WARMUP_MIN: Final = 6 * 60
WARMUP_AFTER_ARRIVAL_MIN: Final = 60  # nach der Ankunft noch so lange warm halten
SENSOR_OFFSET_LIMIT_K: Final = 5.0  # Korrektur je Temperaturfühler höchstens ±5 K
COLD_RESIDUAL_CHECK_MIN: Final = 15  # "Mir ist kalt": so oft prüfen, ob die Restwärme wirkt
COLD_RESIDUAL_RISE_K: Final = 0.1  # so viel muss das Haus je Prüfung wärmer werden
START_CONFIRM_MIN: Final = 3  # nach dem eigenen Startbefehl so lange auf "an" warten
REIGNITE_WINDOW_MIN: Final = (
    180  # so lange nach dem Blockende gilt Zünden ohne Bedarf als Selbstzündung
)
REIGNITE_RESEND_MIN: Final = 5  # Aus-Befehl bei Selbstzündung höchstens so oft wiederholen
HOT_WATER_C: Final = 50.0  # Wasser so heiß: Ofen hat wegen Kesseltemperatur selbst abgeschaltet
MIN_RADIATOR_STEP_K: Final = 0.5  # Heizkörper erst ab dieser Änderung neu setzen

DEFAULT_PARAMETERS: Final[dict[str, float]] = {
    "start_below_k": 0.5,
    "stop_above_k": 0.3,
    "hard_stop_above_k": 1.5,
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
    "cold_min": 60,
    "cold_residual_c": 45.0,
    "dump_start_c": 70.0,
    "dump_end_c": 60.0,
    "dump_extra_k": 2.0,
    "dump_ramp_low_k": 5.0,
    "dump_ramp_high_k": 10.0,
}
DEFAULT_DUMP_LEARN: Final = True  # Startschwelle der Wärmeabfuhr aus dem Betrieb lernen

# Sensoren
OPENING_CHECK_DROP_K: Final = 0.3  # so viel sollte ein Raum bei offenem Fenster abkühlen

# Pelletvorrat
PELLET_MAX_GAP_S: Final = 15 * 60  # längere Lücken nicht als Brennzeit zählen
PELLET_RATE_LIMITS: Final = (0.3, 5.0)  # gelernter Verbrauch kg/h, Plausibilität
PELLET_DAYS_FOR_FORECAST: Final = 3

# Verlauf für die Grafik
HISTORY_STEP_MIN: Final = 10
HISTORY_HOURS: Final = 48

# Benachrichtigungen (keine Sicherheitsgrenzen: steuern nur, was aufs Handy kommt)
NOTIFY_KINDS: Final = (
    "opening",
    "opening_check",
    "sensor",
    "pellets",
    "stove_error",
    "overheat",
    "too_warm",
    "activity",
)
NOTIFY_CRITICAL: Final = ("stove_error", "overheat")  # kommen auch in der Ruhezeit
NOTIFY_LIMITS: Final[dict[str, tuple[float, float]]] = {
    "opening_delay_min": (0, 240),  # Fenster erst melden, wenn so lange offen
    "repeat_min": (0, 1440),  # gleiche Meldung frühestens wieder nach
    "ventilate_max_min": (5, 240),  # Feucht-Lüften höchstens so lange ohne Meldung
}
DEFAULT_NOTIFICATIONS: Final[dict] = {
    "opening": True,
    "opening_check": True,
    "sensor": True,
    "pellets": True,
    "stove_error": True,
    "overheat": True,
    "too_warm": True,
    "activity": False,  # "Was die Heizung gerade tut": Ofen startet, ist aus, ...
    "opening_delay_min": 10,
    "repeat_min": 60,
    "ventilate_max_min": 30,
    "quiet_start": "22:00",  # "" = keine Ruhezeit
    "quiet_end": "07:00",
    "quiet_hold": True,  # in der Ruhezeit gesammelt, danach eine Nachricht
}

# Lüften wegen Luftfeuchte (je Raum einstellbar, hier Standard und Grenzen)
DEFAULT_VENTILATE_HUMIDITY: Final = 65.0  # absolute Schwelle in %, 0 = nicht verwenden
DEFAULT_VENTILATE_RISE: Final = 6.0  # Prozentpunkte über dem Grundwert, 0 = nicht verwenden
VENTILATE_HUMIDITY_LIMITS: Final = (0.0, 100.0)
VENTILATE_RISE_LIMITS: Final = (0.0, 30.0)
HUMIDITY_BASELINE_MIN: Final = 90  # Grundwert = Tiefstwert der letzten 90 min
HUMIDITY_HYSTERESIS: Final = 2.0  # Lüften endet bei Grundwert + 2 Punkte
