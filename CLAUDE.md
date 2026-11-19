# CLAUDE.md – Wärmeregie (`waermeregie`)

Gedächtnis für spätere Sessions. Bei jeder größeren Änderung aktuell halten. Sprache mit dem Nutzer: Deutsch (Österreich), einfach, jeden Schritt erklären. Der Nutzer ist kein Entwickler.

## Zweck
Heizungssteuerung für Pelletöfen **ohne Pufferspeicher** in Home Assistant. Koordiniert Ofen (beliebige Thermostat-Entität, z. B. aus `mcz_local` oder einer Cloud-Integration), Heizkörperthermostate, Raumfühler, Fenster-/Türsensoren, Anwesenheitsmelder, Tagesarten und Szenen. Ziel: wenige lange Heizblöcke statt Takten, weniger Pellets, angenehme Räume. Schwesterprojekt: `Kingsteam/MCZ_noCloud` (Gerätetreiber, getrennt).

## Sicherheitsregeln (nicht verhandelbar)
1. **Nie gegen die echte Home-Assistant-Installation des Nutzers entwickeln oder testen**, auch nicht über ein HA-MCP-Werkzeug. Nur automatische Tests und die simulierte Test-Instanz (`devtools/testinstanz`).
2. **Keine Geheimnisse, keine Hausdaten im Repo** (keine Tokens, IPs, Namen, echten Entitäts-IDs, Koordinaten) – auch nicht in Tests, Beispielen, Bildschirmfotos, Commit-Texten.
3. **Sicherheitsgrenzen** nur in `const.py` (Abschnitt SICHERHEIT), geprüft in `tests/test_limits.py`. Diese Tests nie abschwächen, überspringen oder löschen; Grenzen nur nach Rücksprache ändern.
4. **Ab Werk Schattenbetrieb** (`mode: shadow`): rechnet und protokolliert, schaltet nichts. Aktiv nur durch bewusstes Umschalten.
5. Tests mit echter Hardware nur auf ausdrücklichen Wunsch, kurz und begrenzt. Keinen Pull Request ohne Auftrag.

## Aufbau
| Datei | Inhalt |
|---|---|
| `custom_components/waermeregie/const.py` | Konstanten, **Sicherheitsgrenzen**, Standardparameter |
| `…/model.py` | Datenmodell: `default_config()`, `validate()` (komplette Prüfung, deutsche Fehlertexte), `limits()` |
| `…/engine.py` | **Regel-Logik ohne HA**: Tagesart, Szene, Raumziele, Öffnungen, Anwesenheit, Ofen-Zustandsmaschine (idle/block/pause/blocked), Heizkörper-Sollwerte, Hinweise |
| `…/manager.py` | HA-Anbindung: Store (Config mit **Register-IDs**, Laufzustand + Protokoll), Beobachten, Auswerten (1 min + bei Änderungen, 5 s entprellt), Schalten nur im Aktivbetrieb, Benachrichtigungen |
| `…/websocket.py` | WebSocket-Befehle laut `docs/API.md` (`require_admin` für alles, was ändert) |
| `…/panel.py` | Panel „Wärmeregie“ + Dashboard-Karte (`add_extra_js_url`), Version = Hash des Dateiinhalts |
| `…/sensor.py`, `binary_sensor.py`, `select.py`, `switch.py` | Phase, Szene, Tagesart, Starts heute, Wärmebedarf; Heizblock, Öffnung offen; Szene wählen; Steuerung aktiv |
| `…/services.yaml` | `set_scene`, `clear_scene`, `pause_stove`, `boost` |
| `…/frontend/` | **gebautes** JavaScript (committet, CI prüft Übereinstimmung) |
| `frontend/` | Quelltext Panel + Karte (TypeScript, Lit, Vite, vitest) |
| `docs/API.md` | Vertrag Panel ↔ Python |
| `docs/KONZEPT.md`, `docs/HANDBUCH.md` | Konzept, Bedienung |
| `devtools/testinstanz/` | simulierte HA-Instanz mit Simulator `wr_sim` |

## Befehle
```bash
uv venv --python 3.14 ../venv-wr && VIRTUAL_ENV=../venv-wr uv pip install -r requirements_test.txt
../venv-wr/bin/ruff check . && ../venv-wr/bin/ruff format --check . && ../venv-wr/bin/pytest -q
cd frontend && npm ci && npm run typecheck && npm test && npm run build
```
`pytest-homeassistant-custom-component` in `requirements_test.txt` bestimmt die HA-Version (0.13.375 = HA 2026.10.4). `home-assistant-frontend` ist für Tests nötig (Panel braucht `frontend`).

## Stolperfallen
- **Karte registriert sich erst nach dem HA-Start** (`whenDefined("home-assistant")`): HA 2026 ersetzt `window.customElements` beim Start durch eine Scoped-Registry; früh registrierte Elemente gehen verloren → „Konfigurationsfehler“. `window.customElements` immer erst beim Aufruf lesen.
- Uhrzeitfelder als Text (HH:MM) mit `normalizeTimeInput`, nicht `type="time"` (zeigt je nach Browser AM/PM).
- Test-Instanz: HA aus dem Konfigurationsordner starten; HTTP-Port-Änderung per WebSocket `http/config/promote` bestätigen (sonst nach 5 min zurück auf 8123); Standard-Dashboard ist in HA 2026 eine Strategie → für Karten-Fotos eigenes Dashboard anlegen (`lovelace/dashboards/create`).
- Oberfläche: Build läuft zweimal (`--mode panel`/`--mode card`), Ausgabe ist reproduzierbar; nach jeder Änderung in `frontend/src` neu bauen und das JS mitcommitten (CI vergleicht).
- Entitäten in der Config: nach außen entity_id, im Store Register-ID. Entitäten ohne Registereintrag (z. B. YAML ohne unique_id) werden abgelehnt.
- Panel nach dem Entladen entfernen; statische Pfade nur einmal je Laufzeit registrieren (`hass.data`-Merker), ebenso `add_extra_js_url`.
- Schattenbetrieb: die Regel führt einen **gedachten** Block; beim Umschalten der Betriebsart wird er verworfen (kein gedachter Block wird real).
- Im Aktivbetrieb übernimmt die Regel einen von Hand gestarteten Ofen als Block und erkennt, wenn er von außen ausgeht.
- Ofen-Funktionen (`model.STOVE_FIELDS`): climate, power (select/number, Stufe 1-5; bei select Option = Ziffer, „… n“ oder Position), chrono_switch, eco_switch (beide im Aktivbetrieb aus), error_sensor (Störung = kein Start, Block endet), water_sensor, ignitions_sensor.
- Ofenstart = `set_temperature` (Block-Sollwert, Standard 28 °C, damit der Ofen trotz zu hoch messendem Innenfühler brennt) + `set_hvac_mode heat`; Stopp = `set_hvac_mode off`.
- Heizkörper werden nur bei Änderung ≥ 0,5 K neu gesetzt (schont Batterien).
- Ruff: Zeilenlänge 100; keine typografischen Zeichen in Code-Strings, die RUF001 auslösen.

## Stand
- 0.1.0: Python-Teil vollständig mit Tests, Panel und Karte, Simulator-Testinstanz. **Nicht mit echter Hardware getestet.**
- 0.1.1 Störung nicht als Start übernehmen · 0.2.0 Pelletvorrat · 0.3.0 Geräte pausieren (`room.paused`, `manager.effective_config` entfernt sie vor Beobachten/Regel), Erholzeit nach dem Lüften (`opening_recovery_min`, Manager merkt sich Schließzeitpunkt nur im Speicher), kompakte Raum-Seite (`frontend/src/devices.ts`).
