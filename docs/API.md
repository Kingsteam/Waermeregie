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
    "ignitions_sensor": null           // optional: sensor Zündzähler (Anzeige)
  },
  "weather": "weather.home",           // optional
  "outdoor_sensor": null,              // optional: sensor Außentemperatur
  "workday": null,                     // optional: binary_sensor Arbeitstag (Feiertage)
  "persons": ["person.anna"],          // optional
  "pet": null,                         // optional: binary_sensor/device_tracker/person
  "notify": ["notify.mobile_app_handy"],  // optional: Benachrichtigungsdienste (Text, keine Entitäten)
  "rooms": [
    {
      "id": "wohnzimmer", "name": "Wohnzimmer", "importance": 3,          // 1 niedrig … 3 hoch
      "radiators": ["climate.heizung_wz"],
      "temperature_sensors": [{"entity": "sensor.raum_wz", "weight": 1.0}],
      "openings": ["binary_sensor.terrassentuer"],
      "presence": ["binary_sensor.wz_belegt"],
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
  "week": {"mon": "buero", "tue": "buero", "wed": "homeoffice", "thu": "buero", "fri": "homeoffice", "sat": "wochenende", "sun": "wochenende", "holiday": "wochenende"},
  "parameters": {
    "start_below_k": 0.5, "stop_above_k": 0.3,
    "min_burn_min": 90, "max_burn_min": 300, "min_pause_min": 60, "max_starts_per_day": 4,
    "opening_grace_min": 2, "opening_stop_min": 10, "opening_empty_room_min": 1, "opening_recovery_min": 20, "opening_check_min": 60, "sensor_hold_min": 30, "sensor_alert_min": 60,
    "radiator_boost_k": 1.0, "frost_c": 12, "night_floor_c": 16, "stove_block_setpoint_c": 28,
    "presence_empty_min": 45,
    "power_min": 1, "power_max": 3,    // Leistungsstufen im Heizblock (1-5)
    "power_cold_c": 0                  // Außentemperatur darunter → power_max
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
    "phase": "idle" | "block" | "pause" | "blocked",
    "action": "start" | "stop" | "keep",    // was die Regelung gerade will
    "reason": "Wohnräume 0,7 K unter Ziel",
    "block_start": null, "pause_until": null, "starts_today": 2, "max_starts_per_day": 4,
    "chrono_warning": false,           // Chrono des Ofens ist an (im Schattenbetrieb nur Hinweis)
    "eco_warning": false,              // Eco des Ofens ist an
    "error": false,                    // Ofen meldet Störung
    "power_level": 2,                  // gewünschte Leistungsstufe (null außerhalb eines Blocks oder ohne Leistungs-Entität)
    "water_c": 61.5,                   // Wassertemperatur (null ohne Fühler)
    "ignitions": 9620                  // Zündzähler (null ohne Fühler)
  },
  "house": {"deficit_k": 0.7, "outdoor_c": 4.5},
  "rooms": [
    {"id": "wohnzimmer", "name": "Wohnzimmer", "temperature": 20.3, "target": 21, "deficit_k": 0.7,
     "radiator_setpoint": 22, "open": false, "open_minutes": 0, "recover_until": null, "occupied": true, "sensors_missing": 0}
  ],
  "alerts": [{"kind": "opening", "room": "wohnzimmer", "entity": "binary_sensor.terrassentuer", "minutes": 12, "message": "Terrassentür seit 12 min offen"}],
  // weitere kind: "sensor" (Gerät länger als sensor_alert_min weg), "opening_check" (offen, Raum kühlt nicht ab)
  "devices": {"binary_sensor.terrassentuer": {"drops_24h": 2, "down_since": null, "held": false}},  // je Raum-Gerät (ohne pausierte)
  "overrides": {"scene": null, "pause_until": null, "boost": null},
  "log": [{"time": "…", "text": "Heizblock gestartet: Wohnräume 0,7 K unter Ziel", "shadow": true}]
}
```
