# Changelog

Format nach [Keep a Changelog](https://keepachangelog.com/de/1.1.0/), Versionen nach [SemVer](https://semver.org/lang/de/).

## [Unreleased]

## [0.1.0] - 2026-11-17
### Hinzugefügt
- Erste Version: Panel „Wärmeregie“ zum Einrichten von Ofen, Räumen (Heizkörper, Fühler mit Gewicht, Öffnungen, Anwesenheit), Szenen, Tagesarten und Wochenplan, Parametern.
- Regel: Heizblöcke mit Mindestbrenndauer, Mindestpause, höchstens n Starts pro Tag, Frostschutz; Heizkörper öffnen während eines Blocks; Öffnungen schließen den Heizkörper und sperren Neustarts; leere Räume werden abgesenkt; frühere Hinweise, wenn eine Tür in einem leeren Raum aufgeht.
- Szenen von Hand mit Ablaufzeit, Ofen-Pause, „alle Ziele ±K“.
- Entitäten: Phase, Szene, Tagesart, Starts heute, Wärmebedarf, Heizblock, Öffnung offen, Szene wählen, Steuerung aktiv.
- Dashboard-Karte.
- **Schattenbetrieb ab Werk**: rechnet und protokolliert, schaltet nichts.
### Wichtig
- Nicht mit echter Hardware getestet.
