# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

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
