# Wärmeregie

Heizungssteuerung für **Pelletöfen ohne Pufferspeicher** in Home Assistant.

> ⚠️ **Version 0.1, frühe Entwicklung.** Startet im **Schattenbetrieb**: Die Wärmeregie rechnet und zeigt, was sie tun würde, schaltet aber nichts. Noch **nicht mit echter Hardware getestet**.

## Was sie macht
Ein Pelletofen ohne Pufferspeicher, der direkt Heizkörper versorgt, taktet leicht: Sind die Thermostatventile zu, wird das Wasser in Minuten heiß, der Ofen geht aus und kurz danach wieder an. Die Wärmeregie steuert Ofen und Heizkörper **gemeinsam**:

- **Heizblöcke** statt Takten: Start erst bei spürbarem Wärmebedarf, Mindestbrenndauer, Mindestpause, Höchstzahl an Starts pro Tag.
- **Heizkörper öffnen**, solange der Ofen brennt, damit die Wärme ins Haus geht.
- **Fenster und Türen**: kurz offen wird ignoriert, länger offen schließt den Heizkörper und verhindert Neustarts; Hinweis aufs Handy. Geht eine Tür in einem leeren Raum auf (z. B. Hund), kommt der Hinweis früher.
- **Szenen** (Komfort, Sparen, Homeoffice, Nacht, Abwesend, Urlaub …) und **Tagesarten** (Bürotag, Homeoffice, Wochenende, Feiertag) mit Zeitplan.
- **Anwesenheit** pro Raum: leere Räume werden abgesenkt.
- Funktioniert mit jedem Ofen, der in Home Assistant als Thermostat erscheint, z. B. [MCZ Maestro lokal](https://github.com/Kingsteam/MCZ_noCloud) oder eine Cloud-Integration.

Bedienung: [docs/HANDBUCH.md](docs/HANDBUCH.md) · Konzept: [docs/KONZEPT.md](docs/KONZEPT.md)

## Installation
*Einstellungen → Marketplace → eigenes Repository* mit dem Link zu diesem Repository, dann *Wärmeregie* installieren und Home Assistant neu starten. Danach *Einstellungen → Geräte & Dienste → Integration hinzufügen → Wärmeregie*. Eingerichtet wird alles im Panel **Wärmeregie** in der Seitenleiste.

## Lizenz
Apache-2.0
