# Test-Instanz (komplett simuliert)

Eigene Home-Assistant-Instanz zum Ausprobieren der Wärmeregie, **ohne echte Geräte und ohne echte Home-Assistant-Installation**.

- Konfiguration, Benutzer und Zugangsdaten liegen **außerhalb des Repos** in `~/.wr-testinstanz`.
- `waermeregie` und der Simulator `wr_sim` sind per Verweis eingebunden.
- Der Simulator spielt ein erfundenes Haus: Ofen (Thermostat, Leistungsstufe, Chrono, Eco, Störung, Wassertemperatur), drei Heizkörper, Raumfühler, Außenfühler, Terrassentür, zwei Bewegungsmelder. Grobe Wärmephysik, 10-fach beschleunigt. Tasten: *Terrassentür auf/zu*, *Wohnzimmer/Studio belegt*, *Kälteeinbruch*, *Ofen-Störung*, *Beispieldaten*.
- Beim ersten Start wird die Wärmeregie eingerichtet und mit dem Beispielhaus befüllt (Schattenbetrieb).
- Home Assistant läuft nur auf `127.0.0.1:8126`.

## Einmalig einrichten
```bash
uv venv --python 3.14 ../venv-wr
VIRTUAL_ENV=../venv-wr uv pip install -r requirements_test.txt -r devtools/testinstanz/requirements.txt
../venv-wr/bin/python -m playwright install chromium
cd frontend && npm ci && npm run build
```

## Starten und beenden
```bash
../venv-wr/bin/python devtools/testinstanz/start.py          # oder Doppelklick auf starten.command
../venv-wr/bin/python devtools/testinstanz/start.py --reset  # alles neu anlegen
```
Dann <http://127.0.0.1:8126> öffnen, Benutzer `test`, Passwort in `~/.wr-testinstanz/zugang.json`. In der Seitenleiste **Wärmeregie**.

**Beenden:** Strg+C im Fenster des Startskripts (beendet auch Home Assistant). Falls doch ein Prozess übrig bleibt: `pkill -f "homeassistant -c $HOME/.wr-testinstanz"`.

## Stolperfallen
- HA muss aus dem Konfigurationsordner gestartet werden (macht `start.py`), sonst fehlt der Simulator.
- Seit HA 2026.11 muss eine geänderte HTTP-Einstellung bestätigt werden; `start.py` erledigt das.
- Fehler zu `radio_browser`, `met`, `google_translate` beim ersten Start sind harmlos.
