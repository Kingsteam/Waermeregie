"""Panel in der Seitenleiste und Dashboard-Karte anmelden."""

from __future__ import annotations

import hashlib
from pathlib import Path

from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, PANEL_ELEMENT, PANEL_URL_PATH, STATIC_URL

FRONTEND_DIR = Path(__file__).parent / "frontend"
PANEL_JS = "waermeregie-panel.js"
CARD_JS = "waermeregie-card.js"
DATA_STATIC = f"{DOMAIN}_static_registered"


def _version(name: str) -> str:
    """Prüfwert des Dateiinhalts: neue Version -> neue URL -> kein alter Cache."""
    path = FRONTEND_DIR / name
    if not path.exists():
        return "missing"
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12]


async def async_register(hass: HomeAssistant) -> None:
    """Statische Dateien (einmal je Laufzeit), Panel und Karte anmelden."""
    if not hass.data.get(DATA_STATIC):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC_URL, str(FRONTEND_DIR), cache_headers=True)]
        )
        hass.data[DATA_STATIC] = True
        # Karte: wird über die URL geladen, keine „Ressource“ nötig. Nur einmal.
        card_version = await hass.async_add_executor_job(_version, CARD_JS)
        frontend.add_extra_js_url(hass, f"{STATIC_URL}/{CARD_JS}?v={card_version}")

    panel_version = await hass.async_add_executor_job(_version, PANEL_JS)
    if PANEL_URL_PATH not in hass.data.get(frontend.DATA_PANELS, {}):
        await panel_custom.async_register_panel(
            hass,
            webcomponent_name=PANEL_ELEMENT,
            frontend_url_path=PANEL_URL_PATH,
            module_url=f"{STATIC_URL}/{PANEL_JS}?v={panel_version}",
            sidebar_title="Wärmeregie",
            sidebar_icon="mdi:fire-circle",
            require_admin=False,
            config={},
        )


def async_unregister(hass: HomeAssistant) -> None:
    """Panel entfernen (beim Entladen)."""
    frontend.async_remove_panel(hass, PANEL_URL_PATH)
