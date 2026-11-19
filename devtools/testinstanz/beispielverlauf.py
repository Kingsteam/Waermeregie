"""Erfundenen 24-h-Verlauf in die Test-Instanz schreiben (nur für Bildschirmfotos).

Home Assistant der Test-Instanz vorher beenden, dann:
    ../venv-wr/bin/python devtools/testinstanz/beispielverlauf.py
und die Instanz wieder starten. Die Werte sind ausgedacht.
"""

from __future__ import annotations

from datetime import datetime, timedelta
import json
import math
from pathlib import Path

STATE = Path.home() / ".wr-testinstanz" / ".storage" / "waermeregie.state"


def points(now: datetime) -> list[dict]:
    start = now.replace(minute=now.minute - now.minute % 10, second=0, microsecond=0)
    start -= timedelta(hours=24)
    out = []
    house = 20.5
    stock = 14.0
    for i in range(24 * 6 + 1):
        t = start + timedelta(minutes=10 * i)
        h = t.hour + t.minute / 60
        target = 21.0 if 6 <= h < 8 or 17 <= h < 22.5 else (18.0 if h >= 22.5 or h < 6 else 18.5)
        burning = 5.5 <= h < 7.5 or 17.0 <= h < 19.5
        house += 0.12 if burning else -0.03
        house = max(18.0, min(23.5, house))
        if burning:
            stock -= 0.25
        outdoor = 4 + 4 * math.sin((h - 9) / 24 * 2 * math.pi)
        out.append(
            {
                "t": t.isoformat(),
                "house_c": round(house, 1),
                "target_c": target,
                "outdoor_c": round(outdoor, 1),
                "burning": burning,
                "pellets_kg": round(stock, 1),
            }
        )
    return out


def main() -> None:
    data = json.loads(STATE.read_text()) if STATE.exists() else None
    if data is None:
        raise SystemExit(f"{STATE} fehlt: Test-Instanz einmal starten und wieder beenden")
    now = datetime.now().astimezone()
    data["data"]["history"] = points(now)
    STATE.write_text(json.dumps(data))
    print(f"{len(data['data']['history'])} Punkte geschrieben")


if __name__ == "__main__":
    main()
