"""Werkzeug für KI-Sprachassistenten: Rückmeldung zu kalt / passt / zu warm.

Home Assistant fragt jede Integration über diese Datei nach ihren Werkzeugen
(`async_get_tools`). Angemeldete Aktionen (Intents) allein reichen dafür nicht.
"""

from __future__ import annotations

from homeassistant.components.llm import LLMTools
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import intent
from homeassistant.helpers.llm import LLM_API_ASSIST, IntentTool, LLMContext, ToolAnnotations

from .const import DOMAIN
from .intents import INTENT_FEEDBACK

# verändert nur die Wärmeregie im eigenen Haus; zweimal sagen schadet nicht
ANNOTATIONS = ToolAnnotations(destructive=False, idempotent=True, open_world=False)

PROMPT = (
    "Heating in this home is run by Waermeregie. When someone says they are cold, "
    "that it is too warm, or that the temperature is fine, call the tool "
    f"{DOMAIN}__{INTENT_FEEDBACK}. Do not change thermostats or radiators yourself for "
    "that, and do not ask which radiator: Waermeregie decides what to do."
)


@callback
def async_get_tools(hass: HomeAssistant, llm_context: LLMContext, api_id: str) -> LLMTools | None:
    """Das Rückmelde-Werkzeug, solange die Wärmeregie eingerichtet ist."""
    if api_id != LLM_API_ASSIST or hass.data.get(DOMAIN) is None:
        return None
    tools = [
        IntentTool(
            f"{DOMAIN}__{handler.intent_type}",
            handler,
            title="Rückmeldung zur Temperatur",
            integration=DOMAIN,
            annotations=ANNOTATIONS,
        )
        for handler in intent.async_get(hass)
        if handler.intent_type == INTENT_FEEDBACK
    ]
    return LLMTools(tools=tools, prompt=PROMPT)
