# Regeln (Konzept, Stand 21.11.2026)

Entwurf, mit dem Besitzer abgestimmt. Etappe 1 (Rückmeldungen und Vorschläge) ist seit 0.11.0 gebaut, Etappe 2 (Regeln aus Vorlagen) seit 0.12.0. Etappe 3 (freie Regeln, Lernwerte) seit 0.13.0. Offen: Puffer.

## Hierarchie

Was weiter unten steht, gewinnt immer. Eine Ebene kann die darunter nie überstimmen.

| Ebene | Inhalt | Änderbar |
|---|---|---|
| 4 Lernen und Vorschläge | stellt Lernwerte nach, schlägt Regeln vor | wirkt nur auf Ebene 3 |
| 3 Regeln des Besitzers | einfache Sätze „Wenn … dann …“ | frei, ein/aus, optional Probelauf |
| 2 Grundverhalten | Zeitplan, Szenen, Ziele, „Mir ist kalt“ | wie bisher |
| 1 Schutzregeln | siehe unten | teils fest, teils mit Warnung |

## Entscheidungen des Besitzers

1. **Lernwerte** stellen innerhalb der vom Besitzer gesetzten Grenzen von selbst nach. Außerhalb der Grenzen nur als Vorschlag.
2. **Schutzregeln:** Grundlegende Sicherheit (Kesselschutz, Frostschutz) ist fest und in der Oberfläche nicht änderbar. Die übrigen (Pause gegen Takten, Starts pro Tag, „zu warm“-Grenzen) sind mit Warnung anpassbar, immer innerhalb der Grenzen aus `const.py`.
3. **Probelauf** ist freiwillig (z. B. einen Tag: Regel zählt nur mit, wann sie gegriffen hätte). Eine Regel kann auch sofort scharf geschaltet werden.
4. **„Niemand zu Hause“:** Ob das Türschloss Bedingung ist oder „alle länger als x weg“ reicht, ist in der Regel einstellbar.
5. **Puffer-Regeln** werden mitgeplant, obwohl die Anlage des Besitzers keinen Puffer hat (nur im Simulator prüfbar).

## Bausteine

- **Bedingungen:** Personen (alle weg, jemand da), Türschloss, Fenster, Bewegung im Raum, Außentemperatur, Wind, Vorhersage der nächsten Stunden, Raumtemperatur und ihr Trend, Uhrzeit, Tagesart, Szene, Kesselwasser, später Puffertemperatur. Dazu eine Dauer („seit … min“).
- **Wirkungen (immer begrenzt):** Szene wechseln, Ziel für Haus oder Raum um höchstens ±2 K verschieben, früher oder später starten (höchstens 2 h), Aufheizen auslösen, Ofen sperren oder freigeben, Nachricht.
- **Lernwert:** ein Zahlenwert einer Regel mit unterer und oberer Grenze. Quellen: Messwerte (Auskühlen bei Wind, Aufheizdauer, Dauer von Abwesenheiten) und Rückmeldungen. In der Oberfläche als „lernt“ markiert, mit aktuellem Stand und Herkunft; ein Tipp macht ihn wieder fest.
- **Vorrang unter Regeln:** Reihenfolge in der Liste. Verschiebungen addieren sich, sind insgesamt gedeckelt. Sperren gewinnt gegen Starten.

## Oberfläche

- Reiter „Regeln“: Zeile „Warum gerade so?“, Vorschläge, Regeln als Karten (Schalter, Satz in Klartext, Zustand „wirkt gerade / wartet / Probelauf“, zuletzt ausgelöst), darunter die Schutzregeln mit Schloss.
- Editor als Satz: jedes Kästchen eine Auswahlliste. Vorlagen: Niemand zu Hause, Kalt draußen, Viel Wind, Kälteeinbruch laut Vorhersage, Puffer.
- Grundsatz: verständlich ohne Handbuch, keine stillen Änderungen außerhalb der gesetzten Grenzen.

## Etappen

1. Rückmeldungen und erste Vorschläge (erledigt, 0.11.0).
2. Regeln aus festen Vorlagen mit Reiter „Regeln“, Probelauf, „Warum gerade so?“ (erledigt, 0.12.0).
3. Freier Regel-Editor und Lernwerte (erledigt, 0.13.0; an der Grenze gibt es einen Hinweis im Protokoll und im Reiter, noch keine eigene Vorschlagskarte).
4. Puffer-Regeln.
