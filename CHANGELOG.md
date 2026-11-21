# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

## [0.14.1] - 2026-11-21
### Hinzugefügt
- **Karte „Wärmeregie Rückmeldung“** für Tablets: drei große Knöpfe *Zu kalt / Passt / Zu warm* für einen festen Raum, mit Bestätigung nach dem Tippen. Im Dashboard: `type: custom:waermeregie-feedback-card`, dazu `room` (Name oder Kennung, leer = ganzes Haus), auf Wunsch `title` und `source` (z. B. „Tablet Küche“).
- **Sprachassistent:** neue Aktion `WaermeregieFeedback`. KI-Sprachassistenten in Home Assistant (z. B. OpenAI mit Zugriff „Assist“) können damit eine Rückmeldung eintragen, wenn du sagst „mir ist kalt“ oder „im Bad ist es zu warm“. Nennst du keinen Raum, zählt es fürs ganze Haus: „Mir ist kalt“ heizt dann an wie der Knopf (der Ofen kann starten). Wo du gesprochen hast, steht als Quelle im Protokoll.
### Behoben
- Rückmeldungen speichern jetzt auch den Zustand des Ofens (blieb in 0.14.0 leer).

## [0.14.0] - 2026-11-21
### Hinzugefügt
- **KI-Berater** (freiwillig): Unter „Ofen & Haus“ → Umgebung kannst du eine KI-Aufgabe aus Home Assistant eintragen (z. B. OpenAI). Im Reiter „Regeln“ gibt es dann „KI um Vorschläge fragen“. Die KI bekommt deine verstellbaren Werte mit ihren Grenzen, den Zeitplan, die Regeln und die Rückmeldungen der letzten vier Wochen mit den Messwerten dazu. Sie darf Werte ändern und neue Regeln vorschlagen.
- **Du entscheidest:** Jeder Vorschlag erscheint als Karte mit Begründung zum Annehmen, Anpassen oder Ablehnen. Von selbst wird nichts übernommen. Neue Regeln der KI laufen nach dem Annehmen zuerst einen Tag im Probelauf.
- **Strenge Prüfung:** Die Antwort der KI gilt als nicht vertrauenswürdig. Durch kommt nur, was auf der Liste der verstellbaren Werte steht, in den Grenzen liegt und nicht zu weit springt (Ziele höchstens 1 K, Uhrzeiten höchstens 1 Stunde, höchstens 5 Änderungen und 2 neue Regeln je Anfrage). Schutzregeln, Geräte und Türschlösser kann die KI nie anfassen.
- **Anonym:** Räume heißen im Paket „Raum A“, „Raum B“; Personen, Geräte und Adressen stehen nicht drin. Mit „Zeigen, was geschickt wird“ siehst du das Paket vorher, ohne dass etwas gesendet wird. Gesendet wird nur, wenn du fragst.
- **Rückmeldungen mit mehr Umfeld:** Zu jeder Rückmeldung wird jetzt zusätzlich gespeichert: Wind, Wetterlage, ob jemand zu Hause ist, Zustand des Ofens, Feuchte und Fenster im Raum, ob der Raum belegt ist, die Temperaturen aller Räume und die Quelle. Uhrzeit, Wochentag, Tagesart, Szene, Haus-, Raum-, Außen- und Kesseltemperatur waren schon dabei.
- **Verlauf rund um die Rückmeldung:** Zu jeder Rückmeldung merkt sich die Wärmeregie die Messwerte 30, 60 und 90 Minuten davor und trägt die Werte 30, 60 und 90 Minuten danach nach (Haus, Ziel, Raum, außen, Kessel, Ofen an/aus). Die KI bekommt beides mit und sieht so, ob es schon länger zu kühl war und ob die Reaktion gereicht hat.
- **Rückmeldung per Automation:** Der Dienst `waermeregie.feedback` nimmt beim Raum jetzt auch den Namen (z. B. „Badezimmer“) und ein freies Feld `source` (z. B. „Taster Badezimmer“), das im Protokoll steht.
- Dienst `waermeregie.ai_suggest` für Automationen (z. B. einmal pro Woche). Auch dann werden nur Vorschläge angelegt.

## [0.13.0] - 2026-11-21
### Hinzugefügt
- **Eigene Regeln** (Etappe 3): Im Reiter „Regeln“ gibt es „+ Eigene Regel“. Du gibst ihr einen Namen und stellst bis zu fünf Bedingungen aus Auswahllisten zusammen, die alle gelten müssen: Personen, Türschloss, Außentemperatur, Wind, Raumtemperatur, Kesselwasser, Uhrzeit, Tagesart. Als Wirkung: Szene wechseln, Ziele um höchstens 2 K heben oder senken, früher beginnen. Unter der Regel steht der fertige Satz in Klartext.
- **Lernwerte:** Neben Zahlenwerten einer Regel (Wartezeit, „früher beginnen“, Ziel-Verschiebung, Temperatur- und Windschwelle) steht „lernen lassen“. Du gibst Grenzen vor, innerhalb davon stellt die Wärmeregie den Wert selbst nach: höchstens einen Schritt am Tag, aus deinen Rückmeldungen „Zu kalt / Zu warm“ fürs ganze Haus und aus der Dauer deiner Abwesenheiten. Der aktuelle Stand steht daneben („jetzt 40“), jeder Schritt im Protokoll. An deiner Grenze bleibt der Wert stehen und es gibt einen Hinweis. Schutzregeln lernen nie.
### Behoben
- Schutzregeln zeigen „1,5 K“ mit Komma.

## [0.12.0] - 2026-11-21
### Hinzugefügt
- **Reiter „Regeln“** (Etappe 2 des Konzepts in `docs/REGELN.md`). Regeln sind Sätze in Klartext mit Eingabefeldern, ein- und ausschaltbar, aus vier Vorlagen:
  - **Niemand zu Hause:** alle eingetragenen Personen (und das Haustier) sind weg, auf Wunsch zusätzlich „Tür abgesperrt“, seit einer einstellbaren Zeit → eine Szene, z. B. Abwesend. Kommt jemand zurück oder wird aufgesperrt, gilt sofort wieder der Zeitplan.
  - **Kalt draußen:** unter einer Außentemperatur → Ziele etwas höher und der nächste wärmere Abschnitt des Zeitplans beginnt früher.
  - **Viel Wind:** über einer Windstärke (aus dem Wetter oder einem Windfühler) → dasselbe.
  - **Kälteeinbruch laut Vorhersage:** fällt die Temperatur in den nächsten Stunden stark → früher beginnen.
- **Grenzen:** Alle Regeln zusammen verschieben ein Ziel um höchstens 2 K und ziehen den Zeitplan um höchstens 2 Stunden vor. Eine von Hand gewählte Szene, Aufheizen und alle Schutzregeln gehen vor.
- **Probelauf (freiwillig):** Eine Regel zählt einen Tag lang nur mit, wann sie gegriffen hätte, und schaltet nichts. Danach wartet sie, bis du sie scharf schaltest.
- **„Warum gerade so?“:** eine Zeile, die sagt, woher die aktuelle Szene kommt und welche Regeln gerade wirken.
- **Schutzregeln mit Schloss:** Kesselschutz, Frostschutz und das Ausschalten bei Selbstzündung sind als fest angezeigt. Pause gegen Takten, Starts pro Tag und „sofort aus bei zu warmem Haus“ lassen sich dort ändern, aber erst nach einer Warnung und nur in den sicheren Grenzen.

## [0.11.0] - 2026-11-21
### Hinzugefügt
- **Rückmeldung „Zu kalt / Passt / Zu warm“** in der Übersicht und auf der Karte, fürs ganze Haus oder für einen einzelnen Raum (Auswahl daneben). Auch als Dienst `waermeregie.feedback`. Wirkung sofort: Haus zu kalt wirkt wie „Mir ist kalt“, Haus zu warm senkt alle Ziele für eine Stunde um 1 K, im Raum wird nur dessen Ziel für eine Stunde um 1 K gehoben oder gesenkt. „Passt“ wird nur gemerkt. Rückmelden darf jeder im Haus, nicht nur Verwalter.
- **Momentaufnahme:** Zu jeder Rückmeldung merkt sich die Wärmeregie Uhrzeit, Tagesart, Szene, Raum- und Haustemperatur, Ziel, Außentemperatur und Kesselwasser (60 Tage).
- **Vorschläge:** Kommt dieselbe Rückmeldung in zwei Wochen dreimal vor (abzüglich „Passt“), erscheint ein Vorschlag mit Begründung: einen Abschnitt des Zeitplans früher beginnen (mehrfach kalt kurz davor), oder das Ziel einer Szene um 0,5 K heben oder senken, fürs Haus oder einen Raum. Annehmen, mit eigenem Wert anpassen oder ablehnen (kommt dann 30 Tage nicht wieder). **Nichts ändert sich von selbst.** Neue Meldungsart „Neuer Vorschlag“.

## [0.10.1] - 2026-11-21
### Hinzugefügt
- **Linien ein- und ausblenden:** Über der Grafik „Räume und Kessel“ steht je Raum, für das Mittel, das Ziel und das Kesselwasser ein Knopf. Ein Tipp blendet die Linie aus oder wieder ein; die Auswahl bleibt im Browser gespeichert.
- **Meldung „Was die Heizung gerade tut“** (unter *Meldungen*, ab Werk aus): verständliche Sätze aufs Handy, wenn der Ofen startet, ausgeschaltet wird oder von selbst anlaufen wollte, jeweils mit Grund. Zum Beispiel „Der Ofen startet jetzt. Grund: Wohnräume 0,7 K unter Ziel.“ In der Ruhezeit werden sie gesammelt.
### Behoben
- **Verlauf rückwirkend:** Nach dem Update auf 0.10.0 zeigte die Grafik nur das Mittel, weil die Werte je Raum und für den Kessel erst ab dann mitgeschrieben wurden. Jetzt werden sie für die älteren Punkte aus dem Verlauf von Home Assistant nachgetragen (einmalig beim ersten Öffnen). Der irreführende Hinweis „Kein Wasserfühler zugeordnet“ ist ersetzt.

## [0.10.0] - 2026-11-21
### Hinzugefügt
- **Verlauf „Räume und Kessel“ in der Übersicht:** zwei Grafiken untereinander für die letzten 24 Stunden. Oben jede Raumtemperatur als eigene Linie, dazu das Mittel aller Räume (dick) und das Ziel (gestrichelt); unten das Kesselwasser. Die Brennzeiten des Ofens sind in beiden hinterlegt. Mit dem Finger oder der Maus über die Grafik fahren zeigt Uhrzeit und alle Werte zu diesem Zeitpunkt. Die Werte je Raum und für den Kessel werden ab dieser Version alle 10 Minuten mitgeschrieben; die Linien beginnen deshalb erst mit dem Update.

## [0.9.2] - 2026-11-21
### Geändert
- **„Mir ist kalt“ heizt jetzt immer.** Bisher startete der Ofen nur, wenn die Räume laut Fühlern unter dem angehobenen Ziel lagen; lagen sie knapp darüber, passierte nichts („kein Bedarf“). Wer den Knopf drückt, übersteuert die Messung: Ist im Kessel keine nutzbare Restwärme, startet der Ofen. Die Restwärme wird weiter zuerst genutzt; Pause gegen Takten, Starts pro Tag, Störung und Kesselschutz gelten weiter.

## [0.9.1] - 2026-11-20
### Behoben
- **Lernen ohne unrealistische Werte.** Über 99,5 °C meldet der Wasserfühler des Ofens seinen Anschlag (126 °C). Solche Werte machen eine laufende Messung von Nachwärme oder Abkühlrate jetzt ungültig, statt als echte Temperatur gelernt zu werden. Kesselschutz und Wärmeabfuhr reagieren weiter auf diese Werte.

## [0.9.0] - 2026-11-20
### Behoben
- **Ofen ist nach dem Blockende wirklich aus.** Schaltet der Ofen wegen heißem Wasser selbst ab, bleibt er innerlich „ein“ und zündet nach dem Abkühlen wieder. Lief die Wartezeit auf den Neustart ab, beendete die Wärmeregie bisher nur ihren Heizblock und schickte **keinen** Aus-Befehl; der Ofen zündete später von selbst und wurde als „von Hand eingeschaltet“ übernommen (20.11.2026, dreimal hintereinander, Haus rund 4 K zu warm). Jetzt schickt sie in diesem Fall ausdrücklich „aus“ (Protokoll: „Ofen hat selbst abgeschaltet und nicht wieder gezündet, Heizblock beendet, Wärmeregie schaltet ihn ganz aus“).
- **Wiederzünden nach Selbstabschaltung ist kein Start von Hand.** Endet ein Block, während der Ofen wegen heißem Wasser pausiert, merkt sich die Wärmeregie das 3 Stunden lang. Zündet er in dieser Zeit ohne Wärmebedarf, wird er ausgeschaltet („Ofen hat von selbst neu gezündet, kein Bedarf, ausgeschaltet“). Besteht Wärmebedarf, übernimmt sie den Block, nennt ihn aber nicht mehr „von Hand“.
### Geändert
- **Sofort aus, wenn das Haus deutlich zu warm ist** (neuer Wert *Sofort aus, wenn so viel über Ziel*, Standard 1,5 K, 0 = aus). Liegt das Haus so weit über dem Ziel, endet jeder Heizblock nach frühestens 30 Minuten, auch wenn die Mindestbrenndauer noch läuft (am 20.11. lief der Block 90 Minuten bis 4,6 K über Ziel). Ein von Hand eingeschalteter Ofen wird in diesem Fall gleich wieder ausgeschaltet und nicht als Block übernommen. Für beide Fälle bei Handstarts gibt es die neue Meldung „Ofen ausgeschaltet, weil das Haus zu warm ist“ (abschaltbar). Aufheizen und Frostschutz gehen vor.
### Hinzugefügt
- **„Mir ist kalt“:** Knopf im Aufheizen-Dialog (Seite und Karte), Knopf-Entität und Dienst `waermeregie.cold`. Für 60 Minuten gelten die Ziele wie beim Aufheizen, und die Wärmeregie entscheidet selbst: Hat der Kessel noch mindestens 45 °C, öffnet sie nur die Heizkörper und der Ofen bleibt aus (kein Start, keine Pellets). Wird das Haus dabei in 15 Minuten nicht wärmer oder kühlt der Kessel ab, startet der Ofen, aber nur, wenn es wirklich unter dem Ziel ist. Pause gegen Takten, Starts pro Tag, Störung und Kesselschutz gelten weiter. Dauer und Schwelle sind einstellbar.
- **Selbstzündungen werden gezählt:** Status `stove.reignitions_today`, Zeile „Selbstzündungen heute“ in der Übersicht (nur wenn es welche gab), Attribut `reignitions_today` am Sensor „Starts heute“. Eine ausgeschaltete Selbstzündung verbraucht keinen der erlaubten Starts pro Tag.

## [0.8.0] - 2026-11-20
### Hinzugefügt
- **Heizkörper als Puffer (Wärmeabfuhr):** Ohne Pufferspeicher öffnet die Wärmeregie die Heizkörper, sobald das Kesselwasser heiß wird, damit die Wärme ins Haus geht statt den Ofen hochkochen zu lassen. **Unscharf:** Statt bei 70 °C schlagartig alles aufzudrehen, öffnet sie die Heizkörper umso weiter, je heißer der Kessel ist (ab 65 °C ein wenig, ab 80 °C ganz: 2 K über Ziel bzw. über der Raumtemperatur). Schon warme Räume bekommen etwas weniger, nie unter der Hälfte; nahe am Kesselschutz alle den vollen Wert. Unter 60 °C wieder normal. Neue Parameter *Heizkörper als Puffer*, Schalter „Pufferspeicher vorhanden“.
- **Lernen:** Die Wärmeregie misst im Betrieb, bei welcher Temperatur der Ofen selbst abschaltet, wie stark das Wasser danach nachheizt und wie schnell es bei offenen Heizkörpern abkühlt (gleitende Mittelwerte). Daraus öffnet sie die Heizkörper bei Bedarf früher, nie später als eingestellt, erst nach 3 Messungen. Anzeige unter *Gelernt*, mit Knopf zum Zurücksetzen.

## [0.7.1] - 2026-11-20
### Geändert
- Das Protokoll sagt jetzt, wer das Aufheizen ausgelöst oder abgebrochen hat: „von Hand, <Name>“ (Wärmeregie-Seite oder Karte), „Knopf Haus aufheizen“ oder „Dienst waermeregie.warmup“ (Automation, Sprachassistent). Bisher stand dort nur „Aufheizen jetzt bis …“, und ein warmer Morgen ließ sich im Nachhinein nicht vom Zeitplan unterscheiden.

## [0.7.0] - 2026-11-20
### Hinzugefügt
- **Kesselschutz:** Steigt das Kesselwasser auf 90 °C, bleibt der Ofen aus (laufender Heizblock endet, Selbstzündungen werden ausgeschaltet, kein Neustart) und alle Heizkörper öffnen auf 26 °C, damit die Wärme aus dem Kessel abfließen kann. Erst unter 75 °C ist alles wieder normal. Fehlt die Wassertemperatur 2 Stunden lang, endet der Kesselschutz. Die Werte sind feste Sicherheitsgrenzen (`const.py`). Anlass: 92,5 °C bei zugedrehten Heizkörpern. Im Schattenbetrieb wird nur gerechnet.
- **Meldung „Kesselschutz“** (Art `overheat`, kommt auch in der Ruhezeit), einmal je Ereignis. Status `stove.overheat`, Hinweis in Übersicht und Karte.

## [0.6.1] - 2026-11-20
### Behoben
- **Selbstzündung nicht mehr als Handstart übernehmen.** Ein Hydro-Ofen ohne Puffer zündet nach dem Abkühlen von selbst wieder, auch nachdem die Wärmeregie den Block beendet hat. Bisher galt das als „von Hand eingeschaltet“, wurde als neuer Heizblock übernommen und brannte mindestens die Mindestbrenndauer, obwohl das Haus schon zu warm war und die Heizkörper zu waren (Kesselwasser über 90 °C). Jetzt schaltet die Wärmeregie den Ofen wieder aus, wenn er während einer Pause von Hand oder innerhalb von 3 Stunden nach dem letzten Block ohne Wärmebedarf zündet (kein Aufheizen, kein Frostschutz). Der Aus-Befehl wird höchstens alle 5 Minuten wiederholt; das zählt nicht als Start. Ein Handstart später oder bei Wärmebedarf wird weiter übernommen.

## [0.6.0] - 2026-11-20
### Hinzugefügt
- **Meldungen einstellbar** (*Ofen & Haus → Meldungen*, Config `notifications`): jede Art einzeln ein/aus (Fenster offen, Fenster offen ohne Abkühlen, Geräte nicht erreichbar, Pellets, Ofen-Störung), Fenster erst nach 10 Minuten melden, gleiche Meldung frühestens nach 60 Minuten wieder, Ruhezeit 22:00-07:00 (nur Ofen-Störung, der Rest danach gesammelt in einer Nachricht). Ältere Einstellungen bekommen diese Standardwerte.
- **Ofen-Störung als Nachricht** (neu, einmal pro Störung).
- **Lüften wegen Luftfeuchte:** je Raum optionale Feuchtefühler (Sensor oder Thermostat) mit Schwelle (Standard 65 %) und Anstieg über dem Grundwert (Standard 6 Punkte über dem Tiefstwert der letzten 90 Minuten). Ein offenes Fenster bei hoher Feuchte meldet sich erst, wenn die Feuchte wieder fast beim Grundwert ist, höchstens nach 30 Minuten. Die Heizlogik bei offenem Fenster ist unverändert. Übersicht zeigt das Lüften mit einem Tropfen-Symbol, Status `rooms[].humidity` und `ventilating`.

### Geändert
- Die Nachricht „Fenster offen“ kommt nicht mehr nach 1 Minute im leeren Raum, sondern nach der eingestellten Wartezeit (Standard 10 Minuten). Der Hinweis in der Übersicht erscheint weiter früh.

## [0.5.0] - 2026-11-19
### Hinzugefügt
- **Haus aufheizen:** Knopf *Aufheizen* in Panel und Karte, Knopf-Entität *Haus aufheizen*, Dienste `waermeregie.warmup` und `cancel_warmup`. Der Ofen startet einen ganzen Heizblock, auch wenn es gerade warm genug ist oder die Szene „Abwesend“ gilt. Es gelten die Ziele der Aufheiz-Szene (Standard: erste Szene, in der der Ofen heizen darf) plus 1 K (Parameter *Aufheizen: wärmer als Ziel*). Mindestpause, Starts pro Tag, offene Türen und Störungen gelten weiter; eine Pause von Hand wird aufgehoben.
- **„Ich komme um …“:** Aufheizen mit Ankunftszeit. Die Wärmeregie beginnt rechtzeitig vorher (Parameter *Vorlauf vor der Ankunft*, Standard 60 min) und hält das Haus bis eine Stunde nach der Ankunft warm. Leere Räume werden dabei nicht abgesenkt.
- **Sanfter Start:** Vor dem Zünden werden zuerst die Heizkörper geöffnet (Parameter *Heizkörper vorher öffnen*, Standard 5 min, 0 = aus). Neue Phase *Heizkörper öffnen* (`prepare`). Ohne Pufferspeicher wurde das Wasser sonst in wenigen Minuten so heiß, dass der Ofen selbst abschaltete (19.11.2026: 22 → 61 °C in 6 Minuten).
- **Ofen schaltet selbst ab:** Geht der Ofen im Heizblock von selbst aus, während das Wasser heiß ist (ab 50 °C), endet der Block nicht mehr. Die Wärmeregie wartet bis zu 30 Minuten auf den Neustart des Ofens (Parameter *Warten nach Selbstabschaltung*, 0 = aus) und zählt ihn nicht als neuen Start.
- **Korrektur je Temperaturfühler:** Feld *Korrektur* (−5 bis +5 K) neben dem Gewicht, z. B. für ein Heizkörperthermostat, das immer zu warm misst.
- **Verlauf für Grafiken:** Alle 10 Minuten merkt sich die Wärmeregie Innen-, Ziel- und Außentemperatur, ob der Ofen brannte und den Pelletvorrat (48 Stunden, übersteht Neustarts). WebSocket `waermeregie/history`.
- Status: mittlere Innentemperatur und mittleres Ziel (`house.temperature_c`, `house.target_c`), Aufheizen (`warmup`), Füllstand (`pellets.fill_pct`, `capacity_kg`), Zündzeitpunkt beim sanften Start (`stove.start_at`), Selbstabschaltung (`stove.self_off`).

### Geändert
- **Übersicht neu:** großer Haus-Kopf mit Innentemperatur, Grafik und Temperaturverlauf, große Knöpfe *Aufheizen*, *Pause* und *Szene* (Auswahl im Dialog), Pellet-Behälter als Grafik, kompakte Räume. Selten Gebrauchtes (Ofen-Details, Tages-Zeitleiste) steht unter *Details*. Die Betriebsart schaltet man jetzt oben in *Ofen & Haus* um.
- **Pause nur noch mit Auswahl** (1, 2 oder 4 Stunden) statt mit einem Klick.
- **Ofen & Haus aufgeräumt:** Zuordnungen und Regelwerte in aufklappbaren Abschnitten.
- **Dashboard-Karte** mit denselben Bausteinen, kompakt (neue Optionen `chart`, `show_pellets`, `show_rooms`).
- *Pellets leer voraussichtlich* ändert sich nur noch stündlich (vorher bei jeder Auswertung, fast 5000 Einträge am Tag).

### Behoben
- Kurz nach dem eigenen Startbefehl hielt die Wärmeregie den Ofen manchmal für „von Hand aus“: Der Block wurde beendet und gleich wieder übernommen, *Starts heute* zählte doppelt, und eine falsche Pause wurde gesetzt. Jetzt läuft immer nur eine Auswertung gleichzeitig, und nach dem Startbefehl wartet die Regel bis zu 3 Minuten, bis der Ofen „an“ meldet.

## [0.4.0] - 2026-11-19
### Hinzugefügt
- **Kurze Sensor-Aussetzer überbrücken:** Ist ein Fühler, Fenster oder Melder kurz nicht erreichbar, gilt bis zu 30 Minuten sein letzter Wert (Parameter *Aussetzer überbrücken bis*, 0 = aus). Ein offenes Fenster bleibt also offen, die Öffnungszeit läuft weiter. Kommt der Sensor mit demselben Wert zurück, zählt er weiter ab dem ursprünglichen Zeitpunkt. Vorher galt ein nicht erreichbares Fenster sofort als zu.
- **Ausfälle melden:** Ist ein Sensor länger als 60 Minuten weg (Parameter *Ausfall melden nach*, 0 = aus), kommt eine Nachricht, höchstens einmal am Tag je Sensor; gleichzeitige Ausfälle stehen in einer Nachricht. In der Übersicht steht ein Hinweis.
- **Fenster-Plausibilität:** Meldet ein Fenster 60 Minuten offen (Parameter *Fenster prüfen nach*, 0 = aus) und der Raum ist dabei nicht um mindestens 0,3 K kühler geworden, kommt einmal eine Nachricht „Sensor prüfen?“. Der Raum bleibt trotzdem auf Frostschutz.
- **Zuverlässigkeit in der Raum-Seite:** Unter jedem Gerät steht, wie oft es in den letzten 24 Stunden weg war, bzw. „kurz weg, letzter Wert gilt“. Neues Feld `devices` im Status.

### Geändert
- Zieltemperaturen je Szene: Namen werden nicht mehr abgeschnitten.

## [0.3.0] - 2026-11-19
### Hinzugefügt
- **Geräte pausieren:** Jedes Gerät eines Raums (Heizkörper, Fühler, Fenster/Tür, Melder) lässt sich pausieren. Es bleibt eingetragen, wird aber nicht verwendet – praktisch, wenn z. B. die Melder einer Alarmanlage offline sind. Neues Feld `paused` je Raum.
- **Nach dem Lüften warten:** Nach dem Schließen eines Fensters zählt der Raum eine Weile nicht für den Ofenstart (Parameter *Nach dem Lüften warten*, Standard 20 min, 0 = aus). Die Luft wird von selbst schnell wieder warm, ein Fühler beim Fenster misst sonst zu kalt. Gilt nur, wenn länger als *Kurz lüften erlaubt* offen war. In der Übersicht steht dann „lüftet nach bis …“.

### Geändert
- **Raum-Seite kompakter:** Alle Geräte eines Raums stehen in einer Liste je Gruppe mit aktuellem Wert (°C, offen/zu, belegt/leer), Gewicht, Pausieren- und Entfernen-Knopf. Nicht verfügbare Geräte sind markiert, mit einem Klick lassen sie sich alle pausieren; in der Raumliste zeigt ein Warnzeichen, wo etwas fehlt.
- Der Punkt für ungespeicherte Änderungen steht nur noch beim Reiter, in dem wirklich etwas geändert wurde.

## [0.2.0] - 2026-11-19
### Hinzugefügt
- **Pelletvorrat:** Die Wärmeregie zählt die Brennzeit des Ofens mit und schätzt daraus den Vorrat (kg), die Reichweite und wann der Behälter voraussichtlich leer ist. Entitäten *Pelletvorrat*, *Pellets leer voraussichtlich*, *Pelletverbrauch* (Diagnose), *Pellets nachfüllen* (Binärsensor), Knöpfe *Sack Pellets nachgefüllt* und *Pelletbehälter war leer*; Dienste `pellets_refill`, `pellets_set`, `pellets_empty`.
- **Lernt den Verbrauch:** Ist der Behälter leer (Knopf, oder Störung bei fast leerem Behälter), wird aus „eingefüllte kg seit dem letzten Leer / Brennstunden“ der Verbrauch pro Brennstunde nachgeschärft.
- **Erinnerung:** Fällt die Schätzung unter die Schwelle (Standard 5 kg), kommt einmal pro Füllung eine Nachricht an die eingetragenen Benachrichtigungen.
- Neue Parameter unter *Ofen & Haus → Pellets*: Sackgewicht (15 kg), Fassungsvermögen (26 kg), Startwert Verbrauch (1,5 kg/h), Erinnerungsschwelle (5 kg). Im Panel steht der Vorrat beim Ofen.

## [0.1.1] - 2026-11-19
### Behoben
- Meldet der Ofen eine Störung, während er „ein“ ist (z. B. Pelletbehälter leer), hat die Wärmeregie das als Start von Hand übernommen und den Block sofort wieder beendet – in einer Schleife mit einem Aus-Befehl und einer Statusänderung je Runde. Eine Störung wird jetzt nicht mehr als Block übernommen und nicht als Start gezählt.

## [0.1.0] - 2026-11-17
### Hinzugefügt
- Erste Version: Panel „Wärmeregie“ zum Einrichten von Ofen, Räumen (Heizkörper, Fühler mit Gewicht, Öffnungen, Anwesenheit), Szenen, Tagesarten und Wochenplan, Parametern.
- Regel: Heizblöcke mit Mindestbrenndauer, Mindestpause, höchstens n Starts pro Tag, Frostschutz; Heizkörper öffnen während eines Blocks; Öffnungen schließen den Heizkörper und sperren Neustarts; leere Räume werden abgesenkt; frühere Hinweise, wenn eine Tür in einem leeren Raum aufgeht.
- Szenen von Hand mit Ablaufzeit, Ofen-Pause, „alle Ziele ±K“.
- Entitäten: Phase, Szene, Tagesart, Starts heute, Wärmebedarf, Heizblock, Öffnung offen, Szene wählen, Steuerung aktiv.
- Ofen-Funktionen zuordenbar: Leistungsstufe (select/number), Chrono, Eco, Störung, Wassertemperatur, Zündzähler. Im aktiven Betrieb wählt die Wärmeregie die Leistungsstufe selbst und schaltet Chrono und Eco des Ofens aus; bei Störung kein Start.
- Dashboard-Karte.
- **Schattenbetrieb ab Werk**: rechnet und protokolliert, schaltet nichts.
### Wichtig
- Nicht mit echter Hardware getestet.
