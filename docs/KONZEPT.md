# Konzept

## Ziel
Ein Pelletofen ohne Pufferspeicher soll das Haus angenehm warm halten, mit möglichst wenigen Starts und wenig Pelletverbrauch. Heizkörperthermostate, Fenster/Türen, Anwesenheit, Tagesarten und Wetter fließen ein. Eine Stelle entscheidet (das ofeneigene Zeitprogramm sollte aus sein).

## Das Problem
Ohne Pufferspeicher gibt der Ofen die Wärme direkt ans Heizungswasser. Sind die Thermostatventile zu (Räume warm, oder Sollwerte hoch eingestellt), wird das Wasser in Minuten heiß, der Ofen schaltet ab und bald wieder ein. Typisch: viele Starts pro Tag mit nur wenigen Minuten auf voller Leistung. Zünden und Abschalten kosten Strom, Pellets und Verschleiß.

## Grundidee
- **Heizblöcke:** Start erst, wenn das Haus spürbar unter Ziel ist (gewichtet nach Wichtigkeit der Räume), dann **mindestens** `min_burn_min` brennen, Ende wenn Ziel + `stop_above_k` erreicht. Danach **mindestens** `min_pause_min` Pause. Höchstens `max_starts_per_day` Starts (außer Frostschutz).
- **Haus als Speicher:** Während eines Blocks werden die Heizkörper um `radiator_boost_k` über Ziel gestellt, damit sie wirklich öffnen.
- **Öffnungen:** offen kürzer als `opening_grace_min` → ignorieren; länger → Heizkörper des Raums auf Frostschutz; länger als `opening_stop_min` → kein neuer Ofenstart, Hinweis. Ist im Raum laut Meldern niemand, gelten kürzere Zeiten (`opening_empty_room_min`), z. B. wenn ein Hund die Tür aufstößt.
- **Anwesenheit:** Raum seit `presence_empty_min` leer → Ziel 1,5 K tiefer.
- **Szenen:** je Szene Zieltemperatur je Raum und eine Ofen-Regel (`allow`, `frost_only`, `deny`).
- **Tagesarten und Wochenplan:** Zeitabschnitte je Tagesart; Feiertage über einen Arbeitstag-Sensor.
- **Von Hand:** Szene bis zum nächsten Zeitplan-Wechsel (oder für n Minuten), Ofen pausieren, alle Ziele ±K.

## Architektur
```
Panel / Karte  ──WebSocket──►  manager.py  ──►  engine.py (reine Logik)
                                   │                 │
                     HA-Zustände ──┘                 └─► Aktionen (nur im Aktivbetrieb)
                                                          climate.set_hvac_mode / set_temperature, notify.*
```
- `engine.evaluate(config, state, observation)` → Status, Aktionen, neuer Laufzustand. Ohne HA, voll getestet.
- `manager` sammelt Messwerte, ruft die Regel jede Minute und bei Änderungen (entprellt), schaltet nur im Aktivbetrieb.
- **Schattenbetrieb:** Die Regel führt einen gedachten Ablauf und protokolliert ihn. So lässt sich 2–3 Wochen beobachten, was sie täte, bevor sie schaltet.

## Datenmodell
Siehe `docs/API.md` (Config und Status). Gespeichert in zwei Stores: `waermeregie.config` (Einstellungen, Entitäten als Register-ID) und `waermeregie.state` (Übersteuerungen, Block-Beginn, letzte Abschaltung, Starts, zuletzt gesetzte Heizkörperwerte, Protokoll).

## Grenzen (const.py)
Mindestpause ≥ 30 min, Mindestbrenndauer ≥ 30 min, höchstens 8 Starts pro Tag, Raumziele 5–28 °C, Block-Sollwert ≤ 30 °C, Anpassung ±3 K für höchstens 6 h.

## Später
- Vorausschauend starten (Aufheizzeit lernen, Wetterbericht).
- Leistungsstufe des Ofens modulieren.
- Pelletverbrauch lernen und an den nächsten Sack erinnern (im Gerätetreiber).
- Kalender für Büro-/Homeoffice-Tage.
