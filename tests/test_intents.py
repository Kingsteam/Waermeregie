"""Aktion für Sprachassistenten: Rückmeldung."""

from custom_components.waermeregie import intents

ROOMS = [
    {"id": "wohnzimmer", "name": "Wohnzimmer + Küche"},
    {"id": "bad", "name": "Bad"},
    {"id": "schlafzimmer", "name": "Schlafzimmer"},
]


def test_match_room_is_generous_but_never_guesses():
    assert intents.match_room(ROOMS, "Bad") == "bad"
    assert intents.match_room(ROOMS, " badezimmer ") == "bad"
    assert intents.match_room(ROOMS, "Küche") == "wohnzimmer"
    assert intents.match_room(ROOMS, "wohnzimmer") == "wohnzimmer"
    assert intents.match_room(ROOMS, "Keller") is None
    assert intents.match_room(ROOMS, "zimmer") is None  # trifft zwei: lieber keiner
    assert intents.match_room(ROOMS, None) is None
