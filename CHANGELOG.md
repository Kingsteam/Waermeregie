# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

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
