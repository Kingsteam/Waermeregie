#!/usr/bin/env python3
"""Simulierte Home-Assistant-Test-Instanz für die Wärmeregie starten.

- Konfiguration, Benutzer und Zugangsdaten liegen AUSSERHALB des Repos
  (Standard: ~/.wr-testinstanz).
- waermeregie und der Simulator wr_sim werden per Verweis eingebunden.
- Beim ersten Start wird HA automatisch eingerichtet (Onboarding), die
  Wärmeregie angelegt und mit einem erfundenen Beispielhaus befüllt.

Aufruf (aus dem Repo, mit der Test-venv):
    ../venv-wr/bin/python devtools/testinstanz/start.py [--reset]
Beenden: Strg+C (beendet auch den Home-Assistant-Prozess).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import secrets
import shutil
import signal
import subprocess
import sys
import time
import urllib.error
import urllib.request

REPO = Path(__file__).resolve().parents[2]
HIER = Path(__file__).resolve().parent
HA_PORT = 8126
BASE = f"http://127.0.0.1:{HA_PORT}"
CLIENT_ID = f"{BASE}/"

CONFIG_YAML = f"""\
homeassistant:
  name: Testhaus
  unit_system: metric
  time_zone: UTC
  latitude: 0
  longitude: 0
  elevation: 0
  country: DE
  language: de
  currency: EUR

frontend:
config:
history:
logbook:
http:
  server_host: 127.0.0.1
  server_port: {HA_PORT}

logger:
  default: warning
  logs:
    custom_components.waermeregie: debug
    custom_components.wr_sim: info

wr_sim:
  speed: 10
"""


def call(method: str, path: str, data=None, token: str | None = None, form=False):
    body = None
    headers = {}
    if data is not None:
        if form:
            body = "&".join(f"{k}={v}" for k, v in data.items()).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            body = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(BASE + path, body, headers, method=method)
    with urllib.request.urlopen(req, timeout=30) as resp:
        text = resp.read().decode()
        return json.loads(text) if text else None


def wait_for_ha(proc: subprocess.Popen, timeout: float = 180) -> None:
    end = time.time() + timeout
    while time.time() < end:
        if proc.poll() is not None:
            sys.exit("Home Assistant hat sich beendet, siehe Log oben.")
        try:
            call("GET", "/api/")
            return
        except urllib.error.HTTPError:
            return  # HA antwortet (z. B. 401) -> läuft
        except urllib.error.URLError, ConnectionError:
            time.sleep(1)
    sys.exit("Home Assistant startet nicht.")


def onboard(cfg: Path) -> dict:
    """Erstbenutzer anlegen und Onboarding abschließen. Liefert Zugangsdaten."""
    zugang_datei = cfg / "zugang.json"
    try:
        steps = {s["step"]: s["done"] for s in call("GET", "/api/onboarding")}
    except urllib.error.HTTPError:
        steps = {"user": True}  # Onboarding abgeschlossen: Endpunkt gibt es nicht mehr
    if steps.get("user"):
        return json.loads(zugang_datei.read_text())
    zugang = {"username": "test", "password": secrets.token_urlsafe(12)}
    res = call(
        "POST",
        "/api/onboarding/users",
        {"client_id": CLIENT_ID, "name": "Test", "language": "de", **zugang},
    )
    tok = call(
        "POST",
        "/auth/token",
        {
            "grant_type": "authorization_code",
            "code": res["auth_code"],
            "client_id": CLIENT_ID,
        },
        form=True,
    )
    t = tok["access_token"]
    call("POST", "/api/onboarding/core_config", {}, t)
    call("POST", "/api/onboarding/analytics", {}, t)
    call(
        "POST",
        "/api/onboarding/integration",
        {"client_id": CLIENT_ID, "redirect_uri": CLIENT_ID},
        t,
    )
    zugang["refresh_token"] = tok["refresh_token"]
    zugang_datei.write_text(json.dumps(zugang, indent=2))
    zugang_datei.chmod(0o600)
    return zugang


def access_token(zugang: dict) -> str:
    tok = call(
        "POST",
        "/auth/token",
        {
            "grant_type": "refresh_token",
            "refresh_token": zugang["refresh_token"],
            "client_id": CLIENT_ID,
        },
        form=True,
    )
    return tok["access_token"]


def promote_http(token: str) -> None:
    """Port-Einstellung bestätigen (seit HA 2026.11, sonst Rücksprung nach 5 Min.)."""
    import asyncio

    import aiohttp

    async def run() -> None:
        async with (
            aiohttp.ClientSession() as session,
            session.ws_connect(f"{BASE}/api/websocket") as ws,
        ):
            await ws.receive_json()
            await ws.send_json({"type": "auth", "access_token": token})
            await ws.receive_json()
            await ws.send_json({"id": 1, "type": "http/config"})
            cfg = await ws.receive_json()
            if not (cfg.get("result") or {}).get("pending"):
                return
            await ws.send_json({"id": 2, "type": "http/config/promote"})
            res = await ws.receive_json()
            print("HTTP-Einstellung bestätigt:", res.get("success"))

    asyncio.run(run())


def ensure_waermeregie(token: str, beispiel: bool) -> None:
    entries = call("GET", "/api/config/config_entries/entry?domain=waermeregie", token=token)
    if entries:
        return
    flow = call("POST", "/api/config/config_entries/flow", {"handler": "waermeregie"}, token)
    res = call(
        "POST",
        f"/api/config/config_entries/flow/{flow['flow_id']}",
        {"stove": "climate.simulator_ofen"},
        token,
    )
    print("Wärmeregie eingerichtet:", res.get("type"))
    if beispiel:
        seed_example(token)


def _ws(token: str, messages: list[dict]) -> list[dict]:
    """Einige WebSocket-Befehle nacheinander senden."""
    import asyncio

    import aiohttp

    async def run() -> list[dict]:
        out = []
        async with (
            aiohttp.ClientSession() as session,
            session.ws_connect(f"{BASE}/api/websocket") as ws,
        ):
            await ws.receive_json()
            await ws.send_json({"type": "auth", "access_token": token})
            await ws.receive_json()
            for i, msg in enumerate(messages, start=1):
                await ws.send_json({"id": i, **msg})
                while True:
                    res = await ws.receive_json()
                    if res.get("id") == i and res.get("type") == "result":
                        out.append(res)
                        break
        return out

    return asyncio.run(run())


def seed_example(token: str) -> None:
    """Erfundenes Beispielhaus aus den Simulator-Entitäten."""
    cfg = _ws(token, [{"type": "waermeregie/config"}])[0]["result"]["config"]
    cfg["outdoor_sensor"] = "sensor.simulator_aussentemperatur"
    cfg["stove"].update(
        power="select.simulator_ofen_leistung",
        chrono_switch="switch.simulator_ofen_chrono",
        eco_switch="switch.simulator_ofen_eco",
        error_sensor="binary_sensor.simulator_ofen_storung",
        water_sensor="sensor.simulator_ofen_wasser",
    )
    cfg["rooms"] = [
        {
            "id": "wohnzimmer",
            "name": "Wohnzimmer",
            "importance": 3,
            "radiators": ["climate.simulator_heizkorper_wohnzimmer"],
            "temperature_sensors": [
                {"entity": "sensor.simulator_raumtemperatur_wohnzimmer", "weight": 2},
                {"entity": "climate.simulator_heizkorper_wohnzimmer", "weight": 0.5},
            ],
            "openings": ["binary_sensor.simulator_terrassentur"],
            "presence": ["binary_sensor.simulator_belegung_wohnzimmer"],
            "targets": {"komfort": 21, "sparen": 19.5, "homeoffice": 19.5, "nacht": 18},
        },
        {
            "id": "schlafzimmer",
            "name": "Schlafzimmer",
            "importance": 1,
            "radiators": ["climate.simulator_heizkorper_schlafzimmer"],
            "temperature_sensors": [
                {"entity": "sensor.simulator_raumtemperatur_schlafzimmer", "weight": 1}
            ],
            "openings": [],
            "presence": [],
            "targets": {"komfort": 19, "nacht": 17},
        },
        {
            "id": "studio",
            "name": "Studio",
            "importance": 2,
            "radiators": ["climate.simulator_heizkorper_studio"],
            "temperature_sensors": [
                {"entity": "sensor.simulator_raumtemperatur_studio", "weight": 1}
            ],
            "openings": [],
            "presence": ["binary_sensor.simulator_belegung_studio"],
            "targets": {"homeoffice": 21.5, "komfort": 20},
        },
    ]
    res = _ws(token, [{"type": "waermeregie/config/save", "config": cfg}])[0]
    print("Beispielhaus:", "ok" if res.get("success") else res.get("error"))


def main() -> None:
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    ap.add_argument("--config", default=str(Path.home() / ".wr-testinstanz"))
    ap.add_argument("--reset", action="store_true", help="Test-Instanz komplett neu anlegen")
    ap.add_argument(
        "--ohne-integration",
        action="store_true",
        help="Wärmeregie nicht automatisch einrichten",
    )
    ap.add_argument("--ohne-beispiel", action="store_true", help="kein Beispielhaus anlegen")
    a = ap.parse_args()

    cfg = Path(a.config).expanduser()
    if REPO in cfg.resolve().parents or cfg.resolve() == REPO:
        sys.exit("Die Test-Instanz darf nicht im Repo liegen.")
    if a.reset and cfg.exists():
        shutil.rmtree(cfg)
    (cfg / "custom_components").mkdir(parents=True, exist_ok=True)
    (cfg / "configuration.yaml").write_text(CONFIG_YAML)
    for name, src in (
        ("waermeregie", REPO / "custom_components" / "waermeregie"),
        ("wr_sim", HIER / "wr_sim"),
    ):
        link = cfg / "custom_components" / name
        if not link.is_symlink():
            link.symlink_to(src)

    # cwd = Konfigurationsordner: sonst findet HA nur die custom_components im Repo
    proc = subprocess.Popen(
        [sys.executable, "-m", "homeassistant", "-c", str(cfg), "--skip-pip"], cwd=cfg
    )

    def beenden(*_):
        print("\nBeende Home Assistant …")
        proc.terminate()
        try:
            proc.wait(30)
        except subprocess.TimeoutExpired:
            proc.kill()
        sys.exit(0)

    signal.signal(signal.SIGINT, beenden)
    signal.signal(signal.SIGTERM, beenden)

    try:
        wait_for_ha(proc)
        zugang = onboard(cfg)
        token = access_token(zugang)
        promote_http(token)
        if not a.ohne_integration:
            ensure_waermeregie(token, not a.ohne_beispiel)
        print(f"\nTest-Instanz läuft: {BASE}")
        print(f"Benutzer: {zugang['username']}, Passwort steht in {cfg / 'zugang.json'}")
        print("Beenden mit Strg+C.\n")
        proc.wait()
    finally:
        if proc.poll() is None:  # HA nie verwaist zurücklassen
            proc.terminate()
            proc.wait(30)


if __name__ == "__main__":
    main()
