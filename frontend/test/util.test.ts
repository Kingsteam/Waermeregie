import { describe, expect, it } from "vitest";
import {
  activeSceneAt,
  normalizeTimeInput,
  clockFromIso,
  dateFromIso,
  formatKelvin,
  formatMinutes,
  formatNumber,
  formatStamp,
  formatTemp,
  formatTimeOfDay,
  makeId,
  minutesFromIso,
  normalizeConfig,
  normalizeLimit,
  paramLimits,
  parseTime,
  pickLang,
  sameData,
  sortLogNewestFirst,
  timelineSegments,
  validateSlots,
  withinLimit,
} from "../src/util";
import type { Slot } from "../src/types";

const buero: Slot[] = [
  { start: "06:30", scene: "komfort" },
  { start: "07:45", scene: "sparen" },
  { start: "16:30", scene: "komfort" },
  { start: "22:00", scene: "nacht" },
];
const wochenende: Slot[] = [
  { start: "08:00", scene: "komfort" },
  { start: "23:30", scene: "nacht_lang" },
];

describe("parseTime / formatTimeOfDay", () => {
  it("parst gültige Zeiten", () => {
    expect(parseTime("00:00")).toBe(0);
    expect(parseTime("06:30")).toBe(390);
    expect(parseTime("23:59")).toBe(1439);
    expect(parseTime(" 07:05 ")).toBe(425);
  });
  it("lehnt ungültige Zeiten ab", () => {
    for (const v of ["24:00", "6:30", "06:60", "0630", "", "ab:cd", "06:30:00"]) expect(parseTime(v)).toBeNull();
  });
  it("formatiert Minuten als HH:MM und normiert", () => {
    expect(formatTimeOfDay(390)).toBe("06:30");
    expect(formatTimeOfDay(0)).toBe("00:00");
    expect(formatTimeOfDay(1440)).toBe("00:00");
    expect(formatTimeOfDay(-30)).toBe("23:30");
  });
});

describe("activeSceneAt", () => {
  it("findet den letzten begonnenen Slot", () => {
    expect(activeSceneAt(buero, "06:30")).toBe("komfort");
    expect(activeSceneAt(buero, "07:44")).toBe("komfort");
    expect(activeSceneAt(buero, "07:45")).toBe("sparen");
    expect(activeSceneAt(buero, "12:00")).toBe("sparen");
    expect(activeSceneAt(buero, "23:59")).toBe("nacht");
  });
  it("vor dem ersten Slot gilt der letzte Slot des Vortags", () => {
    expect(activeSceneAt(buero, "05:00", wochenende)).toBe("nacht_lang");
    expect(activeSceneAt(buero, "00:00", wochenende)).toBe("nacht_lang");
    expect(activeSceneAt(wochenende, "03:00", buero)).toBe("nacht");
  });
  it("ohne Vortag gilt der letzte Slot desselben Tages", () => {
    expect(activeSceneAt(buero, "05:00")).toBe("nacht");
  });
  it("akzeptiert Minuten und unsortierte Slots", () => {
    const unsorted = [buero[2], buero[0], buero[3], buero[1]];
    expect(activeSceneAt(unsorted, 8 * 60)).toBe("sparen");
    expect(activeSceneAt(unsorted, 60)).toBe("nacht");
  });
  it("leere Slots und ungültige Zeit -> null", () => {
    expect(activeSceneAt([], "12:00")).toBeNull();
    expect(activeSceneAt([], "12:00", [])).toBeNull();
    expect(activeSceneAt(buero, "25:00")).toBeNull();
  });
  it("leerer Vortag fällt nicht auf heute zurück, wenn Vortag ausdrücklich leer", () => {
    expect(activeSceneAt(buero, "05:00", [])).toBeNull();
  });
});

describe("timelineSegments", () => {
  it("deckt 0–24 h ab und übernimmt die Szene über Mitternacht", () => {
    const segs = timelineSegments(buero);
    expect(segs[0]).toEqual({ from: 0, to: 390, scene: "nacht" });
    expect(segs[segs.length - 1]).toEqual({ from: 22 * 60, to: 1440, scene: "nacht" });
    const total = segs.reduce((a, s) => a + (s.to - s.from), 0);
    expect(total).toBe(1440);
  });
  it("fasst gleiche Nachbarn zusammen", () => {
    const segs = timelineSegments([
      { start: "00:00", scene: "a" },
      { start: "06:00", scene: "a" },
      { start: "12:00", scene: "b" },
    ]);
    expect(segs).toEqual([
      { from: 0, to: 720, scene: "a" },
      { from: 720, to: 1440, scene: "b" },
    ]);
  });
  it("leer -> keine Segmente", () => {
    expect(timelineSegments([])).toEqual([]);
  });
});

describe("validateSlots", () => {
  it("akzeptiert gültige, aufsteigende Slots", () => {
    expect(validateSlots(buero, ["komfort", "sparen", "nacht"])).toEqual([]);
  });
  it("meldet falsches Zeitformat", () => {
    expect(validateSlots([{ start: "6:30", scene: "a" }])).toEqual([{ index: 0, code: "time_format" }]);
  });
  it("meldet nicht aufsteigende und doppelte Zeiten", () => {
    const errs = validateSlots([
      { start: "08:00", scene: "a" },
      { start: "07:00", scene: "a" },
      { start: "07:00", scene: "a" },
    ]);
    expect(errs).toEqual([
      { index: 1, code: "not_ascending" },
      { index: 2, code: "not_ascending" },
    ]);
  });
  it("meldet fehlende und unbekannte Szenen", () => {
    const errs = validateSlots(
      [
        { start: "06:00", scene: "" },
        { start: "07:00", scene: "weg" },
      ],
      ["a"],
    );
    expect(errs).toEqual([
      { index: 0, code: "scene_missing" },
      { index: 1, code: "scene_unknown" },
    ]);
  });
  it("leere Liste ist ein Fehler", () => {
    expect(validateSlots([])).toEqual([{ index: -1, code: "empty" }]);
  });
});

describe("makeId", () => {
  it("leitet Kleinbuchstaben-IDs ab", () => {
    expect(makeId("Wohnzimmer")).toBe("wohnzimmer");
    expect(makeId("Kinderzimmer 2")).toBe("kinderzimmer_2");
    expect(makeId("  Bad / WC  ")).toBe("bad_wc");
  });
  it("ersetzt Umlaute und Akzente", () => {
    expect(makeId("Bürotag")).toBe("buerotag");
    expect(makeId("Größe Küche")).toBe("groesse_kueche");
    expect(makeId("Café Élan")).toBe("cafe_elan");
  });
  it("macht IDs eindeutig", () => {
    expect(makeId("Wohnzimmer", ["wohnzimmer"])).toBe("wohnzimmer_2");
    expect(makeId("Wohnzimmer", ["wohnzimmer", "wohnzimmer_2"])).toBe("wohnzimmer_3");
  });
  it("nutzt Ersatznamen, wenn nichts übrig bleibt", () => {
    expect(makeId("!!!", [], "raum")).toBe("raum");
    expect(makeId("", ["raum"], "raum")).toBe("raum_2");
  });
  it("erzeugt nur a-z0-9_", () => {
    expect(makeId("Ärger & Ölofen #1")).toMatch(/^[a-z0-9_]+$/);
  });
});

describe("Formatierung", () => {
  it("Zahlen und Temperaturen sprachabhängig", () => {
    expect(formatNumber(20.25, "de")).toBe("20,3");
    expect(formatNumber(20.25, "en")).toBe("20.3");
    expect(formatTemp(20.3, "de")).toBe("20,3 °C");
    expect(formatTemp(21, "en")).toBe("21.0 °C");
    expect(formatTemp(null, "de")).toBe("–");
    expect(formatTemp(Number.NaN, "de")).toBe("–");
  });
  it("Kelvin mit Vorzeichen", () => {
    expect(formatKelvin(0.7, "de", true)).toBe("+0,7 K");
    expect(formatKelvin(-0.3, "de", true)).toBe("-0,3 K");
    expect(formatKelvin(0.7, "en")).toBe("0.7 K");
  });
  it("Minuten", () => {
    expect(formatMinutes(12)).toBe("12 min");
    expect(formatMinutes(60)).toBe("1 h");
    expect(formatMinutes(135)).toBe("2 h 15 min");
    expect(formatMinutes(null)).toBe("–");
  });
  it("Uhrzeit und Datum aus ISO (Server-Wandzeit, unabhängig von Browser-Zeitzone)", () => {
    expect(clockFromIso("2026-11-17T07:12:00+01:00")).toBe("07:12");
    expect(clockFromIso("2026-11-17T23:05:59Z")).toBe("23:05");
    expect(clockFromIso("07:45")).toBe("07:45");
    expect(clockFromIso(null)).toBe("–");
    expect(clockFromIso("Unsinn")).toBe("–");
    expect(dateFromIso("2026-11-17T07:12:00+01:00", "de")).toBe("17.11.");
    expect(dateFromIso("2026-11-17T07:12:00+01:00", "en")).toBe("11/17");
    expect(minutesFromIso("2026-11-17T07:12:00+01:00")).toBe(432);
  });
  it("Zeitstempel: heute nur Uhrzeit, sonst mit Datum", () => {
    const now = "2026-11-17T12:00:00+01:00";
    expect(formatStamp("2026-11-17T07:12:00+01:00", now, "de")).toBe("07:12");
    expect(formatStamp("2026-11-16T22:00:00+01:00", now, "de")).toBe("16.11. 22:00");
  });
});

describe("Sonstiges", () => {
  it("Protokoll neueste zuerst", () => {
    const log = [
      { time: "2026-11-17T06:00:00+01:00", text: "a" },
      { time: "2026-11-17T08:00:00+01:00", text: "c" },
      { time: "2026-11-17T07:00:00+01:00", text: "b" },
    ];
    expect(sortLogNewestFirst(log).map((e) => e.text)).toEqual(["c", "b", "a"]);
    expect(sortLogNewestFirst(undefined)).toEqual([]);
  });
  it("Grenzen vereinheitlichen und prüfen", () => {
    expect(normalizeLimit([0, 5])).toEqual({ min: 0, max: 5 });
    expect(normalizeLimit({ min: 1, max: 10, step: 1 })).toEqual({ min: 1, max: 10, step: 1 });
    expect(normalizeLimit(undefined)).toEqual({});
    expect(withinLimit(3, { min: 0, max: 5 })).toBe(true);
    expect(withinLimit(6, { min: 0, max: 5 })).toBe(false);
    expect(withinLimit(-1, {})).toBe(true);
    expect(withinLimit(Number.NaN, {})).toBe(false);
  });
  it("Parametergrenzen aus defaults.limits.parameters und defaults.limits", () => {
    expect(paramLimits({ limits: { parameters: { power_min: { min: 1, max: 5 }, power_cold_c: [-20, 15] } } })).toEqual({
      power_min: { min: 1, max: 5 },
      power_cold_c: [-20, 15],
    });
    expect(paramLimits({ limits: { frost_c: { min: 5, max: 16 } } })).toEqual({ frost_c: { min: 5, max: 16 } });
    expect(paramLimits({})).toEqual({});
    expect(paramLimits(null)).toEqual({});
  });
  it("normalizeConfig kennt die neuen Ofen-Felder", () => {
    const c = normalizeConfig({ stove: { climate: "climate.pelletofen" } as never });
    expect(c.stove).toMatchObject({ climate: "climate.pelletofen", power: null, eco_switch: null, error_sensor: null, water_sensor: null, ignitions_sensor: null });
  });
  it("Sprache wählen", () => {
    expect(pickLang("de")).toBe("de");
    expect(pickLang("de-AT")).toBe("de");
    expect(pickLang("en-GB")).toBe("en");
    expect(pickLang("fr")).toBe("en");
    expect(pickLang(undefined)).toBe("de");
  });
  it("Datenvergleich ignoriert Schlüsselreihenfolge", () => {
    expect(sameData({ a: 1, b: [1, 2] }, { b: [1, 2], a: 1 })).toBe(true);
    expect(sameData({ a: 1 }, { a: 2 })).toBe(false);
  });
  it("normalizeConfig füllt fehlende Felder", () => {
    const c = normalizeConfig({ rooms: [{ id: "wohnzimmer", name: "Wohnzimmer" } as never] });
    expect(c.rooms[0].radiators).toEqual([]);
    expect(c.rooms[0].targets).toEqual({});
    expect(c.stove.climate).toBeNull();
    expect(c.mode).toBe("shadow");
  });
});

describe("normalizeTimeInput", () => {
  it("macht aus freien Eingaben HH:MM", () => {
    expect(normalizeTimeInput("6")).toBe("06:00");
    expect(normalizeTimeInput("630")).toBe("06:30");
    expect(normalizeTimeInput("6.30")).toBe("06:30");
    expect(normalizeTimeInput("22:5")).toBe("22:05");
    expect(normalizeTimeInput(" 07:45 ")).toBe("07:45");
  });
  it("lässt Unlesbares stehen", () => {
    expect(normalizeTimeInput("25:00")).toBe("25:00");
    expect(normalizeTimeInput("abc")).toBe("abc");
  });
});
