"""KI-Berater: anonymes Paket und strenge Prüfung der Antwort."""

import json

import pytest

from custom_components.waermeregie import advisor, feedback, model, rules

from .conftest import at, sample_config

NOW = at(19, "12:00")


def _config():
    cfg = sample_config()
    rule = rules.default_rule("cold_outside", cfg["scenes"])
    rule["learn"] = {"lead_min": [20, 60]}
    cfg["rules"] = [rule]
    return model.validate(cfg)


def _entries():
    data = feedback.empty()
    snap = {
        "day_type": "buero",
        "scene": "komfort",
        "house_c": 19.8,
        "target_c": 21.0,
        "room_c": 19.5,
        "room_target": 21.0,
        "outdoor_c": -2.0,
        "water_c": 40.0,
        "burning": False,
    }
    feedback.record(data, at(17, "06:10"), "cold", "wohnzimmer", snap)
    feedback.record(data, at(18, "20:00"), "ok", None, snap)
    return data["entries"]


def test_package_is_anonymous_and_leaves_out_protection():
    cfg = _config()
    package = advisor.build_package(cfg, _entries(), [], NOW)
    text = json.dumps(package, ensure_ascii=False)
    # keine Raumnamen, keine Geräte
    assert "Wohnzimmer" not in text and "wohnzimmer" not in text
    assert "Schlafzimmer" not in text
    for word in ("climate.", "sensor.", "binary_sensor.", "person."):
        assert word not in text
    assert package["rueckmeldungen"][0]["bereich"] == "Raum A"
    assert package["rueckmeldungen"][0]["wochentag"] == "Dienstag"
    assert package["rueckmeldungen"][1]["bereich"] == "ganzes Haus"
    # Schutzregeln sind nicht verstellbar
    ids = {item["id"] for item in package["verstellbar"]}
    for key in ("min_pause_min", "max_starts_per_day", "hard_stop_above_k", "min_burn_min"):
        assert f"param:{key}" not in ids
    assert not any("frost" in i for i in ids)
    assert "param:start_below_k" in ids and "room:0:komfort" in ids
    # Lernwert: die Grenzen des Besitzers gelten
    lead = next(i for i in package["verstellbar"] if i["id"] == "rule:cold_outside:lead_min")
    assert (lead["min"], lead["max"]) == (20, 60)
    # alte Rückmeldungen gehen nicht mit
    old = advisor.build_package(cfg, _entries(), [], at(19, "12:00").replace(year=2027))
    assert old["rueckmeldungen"] == []
    assert "Raum A" in advisor.instructions(package)


def test_parse_accepts_text_around_json_and_rejects_rubbish():
    assert advisor.parse('Gern:\n```json\n{"aenderungen": []}\n```') == {"aenderungen": []}
    assert advisor.parse({"aenderungen": []}) == {"aenderungen": []}
    for bad in ("Keine Ahnung", "{kaputt}", None, "[1, 2]"):
        with pytest.raises(ValueError):
            advisor.parse(bad)


def test_vet_keeps_only_allowed_changes():
    cfg = _config()
    answer = {
        "aenderungen": [
            {"id": "room:0:komfort", "wert": 21.5, "begruendung": "In Raum A war es\nzu kalt."},
            {"id": "slot:buero:0", "wert": "05:30", "begruendung": "Früher warm."},
            {"id": "rule:cold_outside:lead_min", "wert": 40},
            # alles ab hier muss verworfen werden
            {"id": "param:max_starts_per_day", "wert": 20},  # Schutzregel
            {"id": "param:frost_c", "wert": 2},  # gibt es nicht auf der Liste
            {"id": "room:1:komfort", "wert": 23},  # Sprung zu groß
            {"id": "scene:komfort", "wert": 40},  # außerhalb der Grenzen
            {"id": "slot:buero:2", "wert": "12:00"},  # mehr als eine Stunde
            {"id": "rule:cold_outside:lead_min", "wert": 90},  # über der Lerngrenze
            {"id": "room:0:komfort", "wert": 20.5},  # doppelt
            {"id": "param:start_below_k", "wert": "viel"},
            "Unsinn",
        ]
    }
    good, dropped = advisor.vet(cfg, answer, NOW)
    assert [(s["item"], s["to"]) for s in good] == [
        ("room:0:komfort", 21.5),
        ("slot:buero:0", "05:30"),
        ("rule:cold_outside:lead_min", 40),
    ]
    assert dropped == 9
    assert all(s["type"] == "ai_change" and s["id"].startswith("ai|") for s in good)
    assert "Wohnzimmer" in good[0]["text"] and "\n" not in good[0]["text"]
    # annehmen ergibt gültige Einstellungen
    new = cfg
    for s in good:
        new = model.validate(advisor.apply(new, s))
    assert new["rooms"][0]["targets"]["komfort"] == 21.5
    assert new["day_types"][0]["slots"][0]["start"] == "05:30"
    assert new["rules"][0]["params"]["lead_min"] == 40
    # "Anpassen" bleibt in den Grenzen
    with pytest.raises(ValueError):
        advisor.apply(cfg, good[0], 35)
    assert advisor.apply(cfg, good[0], 22)["rooms"][0]["targets"]["komfort"] == 22


def test_vet_new_rules_start_as_trial_and_never_touch_devices():
    cfg = _config()
    answer = {
        "neue_regeln": [
            {
                "template": "custom",
                "name": "Morgens wärmer",
                "params": {
                    "target_delta_k": 1,
                    "conditions": [
                        {"type": "time", "from": "05:30", "to": "08:00"},
                        {"type": "room_temp", "room": "Raum A", "op": "below", "value": 20},
                    ],
                },
                "begruendung": "Morgens kam mehrmals 'zu kalt'.",
            },
            {"template": "wind", "params": {"above_kmh": 40, "wind_entity": "sensor.fremd"}},
            # verworfen: gibt es schon, Abwesenheit, Schloss, zu starke Wirkung, unbekannt
            {"template": "cold_outside", "params": {}},
            {"template": "nobody_home", "params": {}},
            {
                "template": "custom",
                "name": "Schloss",
                "params": {"conditions": [{"type": "lock", "entity": "lock.x", "value": "locked"}]},
            },
            {"template": "custom", "name": "Zu viel", "params": {"target_delta_k": 9}},
            {"template": "erfunden"},
        ]
    }
    good, dropped = advisor.vet(cfg, answer, NOW)
    assert [s["rule"]["template"] for s in good] == ["custom", "wind"]
    assert dropped == 5
    custom, wind = (s["rule"] for s in good)
    assert custom["params"]["conditions"][1]["room"] == "wohnzimmer"  # Deckname aufgelöst
    assert custom["trial_until"] and wind["trial_until"]  # zuerst Probelauf
    assert wind["params"]["wind_entity"] is None  # kein Gerät von der KI
    assert "Probelauf" in good[0]["text"] and "Wohnzimmer" in good[0]["text"]
    new = model.validate(advisor.apply(cfg, good[0]))
    assert [r["template"] for r in new["rules"]] == ["cold_outside", "custom"]
    # höchstens MAX_NEW_RULES
    many = {"neue_regeln": [answer["neue_regeln"][0]] * 4}
    assert len(advisor.vet(cfg, many, NOW)[0]) == advisor.MAX_NEW_RULES


def test_vet_survives_nonsense():
    cfg = _config()
    for answer in ({}, {"aenderungen": "x", "neue_regeln": 5}, {"aenderungen": [None, 3, []]}):
        good, _ = advisor.vet(cfg, answer, NOW)
        assert good == []
