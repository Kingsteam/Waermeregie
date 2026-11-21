# Schnittstelle Panel ↔ Python (WebSocket)

Alle Befehle über die Home-Assistant-WebSocket-Verbindung (`hass.callWS`, `hass.connection.subscribeMessage`).
Entitäten werden im Panel immer als **entity_id** übergeben. Python speichert intern die **ID aus dem Entitätsregister** und übersetzt beim Lesen zurück. Entitäten ohne Registereintrag werden beim Speichern abgelehnt.

## Befehle

| type | Rechte | Daten | Antwort |
|---|---|---|---|
| `waermeregie/config` | alle | – | `{config, defaults}` |
| `waermeregie/config/save` | **admin** | `{config}` | `{config}` oder Fehler `invalid_config` mit `message` (Deutsch) |
| `waermeregie/status` | alle | – | `Status` (siehe unten) |
| `waermeregie/subscribe` | alle | – | sofort und bei jeder Änderung ein Ereignis `Status` |
| `waermeregie/override` | **admin** | `{scene: string\|null, minutes?: number}` | `Status`. `scene: null` hebt die Übersteuerung auf |
| `waermeregie/pause` | **admin** | `{minutes: number}` (0 = aufheben) | `Status` |
| `waermeregie/boost` | **admin** | `{delta: number, minutes: number}` (0 = aufheben) | `Status` |
| `waermeregie/mode` | **admin** | `{mode: "shadow"\|"active"}` | `Status` |
| `waermeregie/warmup` | **admin** | `{minutes?: number}` (30-360, jetzt aufheizen) **oder** `{arrive: "HH:MM"}` (Ankunft, nächstes Vorkommen in 24 h) **oder** `{cancel: true}` | `Status` |
| `waermeregie/learn/reset` | **admin** | – | `Status` (gelernte Werte vergessen) |
| `waermeregie/history` | alle | `{hours?: number}` (1-48, Standard 24) | `{points: Point[]}`, ein Punkt je 10 min (siehe unten) |

## Config

```jsonc
{
  "stove": {
    "climate": "climate.pelletofen",   // Pflicht für aktiven Betrieb: Thermostat-Entität des Ofens (Ein/Aus, Sollwert)
    "power": null,                     // optional: select ODER number für die Leistungsstufe (Stufen 1-5)
    "chrono_switch": null,             // optional: switch Zeitprogramm des Ofens – wird im aktiven Betrieb ausgeschaltet
    "eco_switch": null,                // optional: switch Eco des Ofens – wird im aktiven Betrieb ausgeschaltet
    "error_sensor": null,              // optional: binary_sensor Störung (an = Störung → kein Start)
    "water_sensor": null,              // optional: sensor Wassertemperatur (Anzeige)
    "ignitions_sensor": null,          // optional: sensor Zündzähler (Anzeige)
    "has_buffer": false,               // Pufferspeicher vorhanden? false = Heizkörper sind der Puffer (Wärmeabfuhr)
    "dump_learn": true                 // Startschwelle der Wärmeabfuhr aus dem Betrieb lernen (nur senken)
  },
  "weather": "weather.home",           // optional
  "outdoor_sensor": null,              // optional: sensor Außentemperatur
  "workday": null,                     // optional: binary_sensor Arbeitstag (Feiertage)
  "persons": ["person.anna"],          // optional
  "pet": null,                         // optional: binary_sensor/device_tracker/person
  "notify": ["notify.mobile_app_handy"],  // optional: Benachrichtigungsdienste (Text, keine Entitäten)
  "notifications": {                   // optional, fehlende Werte = Standard (ab 0.6.0)
    "opening": true,                   // Fenster/Tür länger offen
    "opening_check": true,             // Fenster offen, Raum kühlt nicht ab
    "sensor": true,                    // Geräte lange nicht erreichbar
    "pellets": true,                   // Pellets nachfüllen
    "stove_error": true,               // Ofen meldet Störung (kommt auch in der Ruhezeit)
    "overheat": true,                  // Kesselschutz: Wasser zu heiß (kommt auch in der Ruhezeit)
    "too_warm": true,                  // Ofen ausgeschaltet, weil das Haus deutlich über Ziel ist (Handstart)
    "opening_delay_min": 10,           // Fenster-Meldung erst nach so vielen Minuten (0-240)
    "repeat_min": 60,                  // gleiche Meldung (Art + Raum) frühestens wieder nach (0-1440, 0 = keine Sperre)
    "ventilate_max_min": 30,           // Lüften wegen Feuchte höchstens so lange ohne Meldung (5-240)
    "quiet_start": "22:00", "quiet_end": "07:00",  // Ruhezeit, über Mitternacht möglich; beide "" = keine
    "quiet_hold": true                 // in der Ruhezeit gesammelt, danach eine Nachricht (false = verwerfen)
  },
  "rooms": [
    {
      "id": "wohnzimmer", "name": "Wohnzimmer", "importance": 3,          // 1 niedrig … 3 hoch
      "radiators": ["climate.heizung_wz"],
      "temperature_sensors": [{"entity": "sensor.raum_wz", "weight": 1.0, "offset": 0.0}],  // offset -5…+5 K wird zum Messwert addiert
      "openings": ["binary_sensor.terrassentuer"],
      "presence": ["binary_sensor.wz_belegt"],
      "humidity_sensors": [],                                             // optional: sensor (Feuchte) oder climate (current_humidity)
      "ventilate_humidity": 65,                                           // Feucht ab dieser Feuchte (%, 0 = aus)
      "ventilate_rise": 6,                                                // … oder so viele Punkte über dem Tiefstwert der letzten 90 min (0 = aus)
      "paused": [],                                                       // eingetragen, aber nicht verwendet (Teilmenge der Geräte oben)
      "targets": {"komfort": 21, "sparen": 19.5}                          // je Szene; fehlt → scene.default_target
    }
  ],
  "scenes": [
    {"id": "komfort", "name": "Komfort", "icon": "mdi:sofa", "stove": "allow", "default_target": 21}
    // stove: "allow" | "frost_only" (nur unter Frostgrenze/Nachtuntergrenze) | "deny"
  ],
  "day_types": [
    {"id": "buero", "name": "Bürotag", "slots": [{"start": "06:30", "scene": "komfort"}, {"start": "07:45", "scene": "sparen"}]}
  ],
  "warmup_scene": null,               // Szene, deren Ziele beim Aufheizen gelten (null = erste Szene mit stove "allow")
  "week": {"mon": "buero", "tue": "buero", "wed": "homeoffice", "thu": "buero", "fri": "homeoffice", "sat": "wochenende", "sun": "wochenende", "holiday": "wochenende"},
  "parameters": {
    "start_below_k": 0.5, "stop_above_k": 0.3,
    "hard_stop_above_k": 1.5,          // so weit über Ziel: Block endet nach frühestens 30 min, Handstart wird ausgeschaltet (0 = aus)
    "min_burn_min": 90, "max_burn_min": 300, "min_pause_min": 60, "max_starts_per_day": 4,
    "opening_grace_min": 2, "opening_stop_min": 10, "opening_empty_room_min": 1, "opening_recovery_min": 20, "opening_check_min": 60, "sensor_hold_min": 30, "sensor_alert_min": 60,
    "radiator_boost_k": 1.0, "frost_c": 12, "night_floor_c": 16, "stove_block_setpoint_c": 28,
    "presence_empty_min": 45,
    "power_min": 1, "power_max": 3,    // Leistungsstufen im Heizblock (1-5)
    "power_cold_c": 0,                 // Außentemperatur darunter → power_max
    "soft_start_min": 5,               // sanfter Start: Heizkörper so lange vor dem Zünden öffnen (0 = aus)
    "cold_min": 60,                    // "Mir ist kalt": Dauer der höheren Ziele
    "cold_residual_c": 45,             // "Mir ist kalt": ab dieser Kesseltemperatur erst nur Heizkörper öffnen (0 = aus)
    "self_off_wait_min": 30,           // Ofen schaltet im Block selbst ab (Wasser heiß): so lange auf Neustart warten (0 = Block endet sofort)
    "warmup_extra_k": 1.0,             // Aufheizen: so viel über den Zielen der Aufheiz-Szene
    "warmup_lead_min": 60,             // „Ich komme um …“: so viel früher mit dem Aufheizen beginnen
    "dump_start_c": 70,                // Wärmeabfuhr: Mitte der Rampe "Kessel heiß" (50-85)
    "dump_end_c": 60,                  // darunter Wärmeabfuhr aus (40-80, unter dump_start_c)
    "dump_extra_k": 2,                 // Heizkörper höchstens so viel über Ziel bzw. Raumtemperatur (0-5)
    "dump_ramp_low_k": 5,              // Rampe beginnt bei Mitte minus diesem Wert (1-15)
    "dump_ramp_high_k": 10             // voller Zusatz ab Mitte plus diesem Wert (1-20)
  },
  "mode": "shadow"                     // "shadow" (nur rechnen) | "active" (schaltet)
}
```

Grenzen (aus `const.py`, werden beim Speichern geprüft): siehe `defaults.limits` in der Antwort von `waermeregie/config`.

## Status

```jsonc
{
  "mode": "shadow",
  "now": "2026-11-17T07:12:00+01:00",
  "day_type": {"id": "buero", "name": "Bürotag", "reason": "Montag"},
  "scene": {"id": "komfort", "name": "Komfort", "source": "schedule" | "override", "until": "…" | null, "next_change": "07:45"},
  "stove": {
    "entity": "climate.pelletofen", "available": true, "burning": false, "on": false,
    "phase": "idle" | "prepare" | "block" | "pause" | "blocked",   // prepare = sanfter Start, Heizkörper öffnen
    "start_at": null,                  // bei prepare: Uhrzeit der Zündung
    "self_off": false,                 // Ofen hat im Block selbst abgeschaltet (Wasser heiß), Regel wartet auf Neustart
    "overheat": false,                 // Kesselschutz aktiv: Wasser war über 90 °C, Ofen aus und Heizkörper offen bis unter 75 °C
    "action": "start" | "stop" | "keep",    // was die Regelung gerade will
    "reason": "Wohnräume 0,7 K unter Ziel",
    "block_start": null, "pause_until": null, "starts_today": 2, "max_starts_per_day": 4,
    "reignitions_today": 0,            // Ofen hat heute so oft von selbst neu gezündet (ohne Bedarf ausgeschaltet: zählt nicht als Start)
    "chrono_warning": false,           // Chrono des Ofens ist an (im Schattenbetrieb nur Hinweis)
    "eco_warning": false,              // Eco des Ofens ist an
    "error": false,                    // Ofen meldet Störung
    "power_level": 2,                  // gewünschte Leistungsstufe (null außerhalb eines Blocks oder ohne Leistungs-Entität)
    "water_c": 61.5,                   // Wassertemperatur (null ohne Fühler)
    "ignitions": 9620,                 // Zündzähler (null ohne Fühler)
    "dump": false,                     // Wärmeabfuhr läuft (bis Wasser unter dump_end_c)
    "dump_level": 0.0,                 // unscharf: wie heiß der Kessel gilt (0-1)
    "dump_start_c": 70                 // wirksame Mitte (eingestellt oder gelernt, nie höher als eingestellt)
  },
  "house": {"deficit_k": 0.7, "outdoor_c": 4.5, "temperature_c": 20.6, "target_c": 21.0},   // Mittel der Wohnräume (nach Wichtigkeit)
  "warmup": null,                      // oder {"start_at": "…", "until": "…", "arrive": "…"|null, "active": true, "cold": false}  (cold = „Mir ist kalt“)
  "learn": {"values": {"selfoff_c": 85.0, "afterheat_k": 12.5, "cool_k_min": 0.8},   // gleitende Mittelwerte (null = noch keine)
            "samples": {"selfoff_c": 4, "afterheat_k": 3, "cool_k_min": 1}, "updated": "…",
            "min_samples": 3, "dump_start_c": 67.5},                                 // wirkt erst ab min_samples
  "rooms": [
    {"id": "wohnzimmer", "name": "Wohnzimmer", "temperature": 20.3, "target": 21, "deficit_k": 0.7,
     "radiator_setpoint": 22, "open": false, "open_minutes": 0, "recover_until": null, "occupied": true, "sensors_missing": 0,
     "humidity": 48.5,                 // höchste Feuchte (null ohne Feuchtefühler)
     "ventilating": false,             // Fenster offen wegen hoher Feuchte: keine Fenster-Meldung
     "dump_extra_k": 0}                // Zusatz der Wärmeabfuhr auf diesen Raum (K, auf 0,5 gerundet)
  ],
  "alerts": [{"kind": "opening", "room": "wohnzimmer", "entity": "binary_sensor.terrassentuer", "minutes": 12, "message": "Terrassentür seit 12 min offen"}],
  // weitere kind: "sensor" (Gerät länger als sensor_alert_min weg), "opening_check" (offen, Raum kühlt nicht ab)
  // "opening": minutes zählt nach dem Feucht-Lüften ab "Feuchte wieder unten"; ob eine Nachricht geht, regelt "notifications"
  "devices": {"binary_sensor.terrassentuer": {"drops_24h": 2, "down_since": null, "held": false}},  // je Raum-Gerät (ohne pausierte)
  "pellets": {"stock_kg": 12.5, "capacity_kg": 26, "fill_pct": 48, "rate_kg_h": 1.5, "rate_learned": false, "hours_left": 8.3, "empty_at": "…", "daily_burn_h": 2.1},
  "overrides": {"scene": null, "pause_until": null, "boost": null},
  "log": [{"time": "…", "text": "Heizblock gestartet: Wohnräume 0,7 K unter Ziel", "shadow": true}]
}
```

## Verlauf (`waermeregie/history`)

```jsonc
{"points": [
  {"t": "2026-11-19T18:10:00+01:00", "house_c": 22.1, "target_c": 22.5, "outdoor_c": 9.9, "burning": true, "pellets_kg": 13.6,
   "water_c": 61.5,                          // Kesselwasser (null ohne Fühler; fehlt in Punkten vor 0.10.0)
   "rooms": {"wohnzimmer": 21.8}}            // Temperatur je Raum-ID (fehlt in Punkten vor 0.10.0)
]}
```
Ein Punkt je 10 Minuten, höchstens 48 Stunden, im Laufzustand gespeichert (übersteht Neustarts). Werte können `null` sein.
