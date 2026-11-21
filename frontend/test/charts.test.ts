import { describe, expect, it } from "vitest";
import { buildChart, buildMulti, burnRuns, nearestIndex, niceStep, heroState, houseTemps, pelletFill, suggestArrival, warmupLabel, yRange } from "../src/charts";
import { translator } from "../src/i18n";
import { emptyText, heroText } from "../src/overview";
import type { HistoryPoint, Status } from "../src/types";

const t = translator("de");

function points(n: number, f: (i: number) => Partial<HistoryPoint>): HistoryPoint[] {
  return Array.from({ length: n }, (_, i) => {
    const m = i * 10;
    const hh = String(Math.floor(m / 60)).padStart(2, "0");
    const mm = String(m % 60).padStart(2, "0");
    return { t: `2026-11-19T${hh}:${mm}:00+01:00`, house_c: 21, target_c: 21, burning: false, ...f(i) };
  });
}

type StatusOver = Omit<Partial<Status>, "stove"> & { stove?: Partial<NonNullable<Status["stove"]>> };

function status(over: StatusOver = {}): Status {
  const { stove, ...rest } = over;
  return {
    mode: "active",
    now: "2026-11-19T18:00:00+01:00",
    day_type: null,
    scene: null,
    stove: {
      entity: "climate.x",
      available: true,
      burning: false,
      on: false,
      phase: "idle",
      action: "keep",
      reason: "",
      block_start: null,
      pause_until: null,
      starts_today: 0,
      max_starts_per_day: 4,
      chrono_warning: false,
      ...stove,
    },
    house: { deficit_k: 0.2, outdoor_c: 5 },
    rooms: [],
    alerts: [],
    overrides: { scene: null, pause_until: null, boost: null },
    log: [],
    ...rest,
  } as Status;
}

describe("Diagramm", () => {
  it("yRange: ganze Grad und mindestens 2 K", () => {
    expect(yRange([21.2, 21.4])).toEqual([20, 22]);
    expect(yRange([19.6, 24.3])).toEqual([19, 25]);
    expect(yRange([])).toEqual([18, 22]);
  });

  it("burnRuns findet zusammenhängende Brennzeiten", () => {
    const p = points(8, (i) => ({ burning: i >= 2 && i < 5 }));
    expect(burnRuns(p)).toEqual([[2, 5]]);
    const q = points(4, (i) => ({ burning: i > 1 }));
    expect(burnRuns(q)).toEqual([[2, 4]]);
  });

  it("ohne genug Werte kein Diagramm", () => {
    expect(buildChart([], { width: 600, height: 100 })).toBeNull();
    expect(buildChart(points(3, () => ({ house_c: null })), { width: 600, height: 100 })).toBeNull();
    expect(buildChart(null, { width: 600, height: 100 })).toBeNull();
  });

  it("Pfade, Bänder, Marken", () => {
    const p = points(37, (i) => ({ house_c: 20 + i / 36, target_c: i < 18 ? 20 : 21.5, burning: i >= 10 && i < 20 }));
    const m = buildChart(p, { width: 600, height: 100, padLeft: 0, padRight: 0, padTop: 0, padBottom: 0 })!;
    expect(m.house.startsWith("M0,")).toBe(true);
    expect(m.house.split("L").length).toBe(37);
    expect(m.target).toMatch(/V/); // Stufe beim Zielwechsel
    expect(m.bands).toHaveLength(1);
    expect(m.bands[0].x).toBeCloseTo((10 / 36) * 600, 0);
    expect(m.xTicks.map((x) => x.label)).toEqual(["00:00", "06:00"]);
    expect(m.last?.value).toBeCloseTo(21);
    expect(m.yTicks[0].value).toBe(m.yMin);
  });

  it("Lücken unterbrechen die Linie", () => {
    const p = points(6, (i) => ({ house_c: i === 2 ? null : 21 }));
    const m = buildChart(p, { width: 100, height: 50 })!;
    expect((m.house.match(/M/g) ?? []).length).toBe(2);
  });
});

describe("Pellets", () => {
  it("Füllstand vom Server oder aus kg und Behälter", () => {
    expect(pelletFill({ stock_kg: 10, fill_pct: 38.4 } as never)).toBe(38);
    expect(pelletFill({ stock_kg: 13, capacity_kg: 26 } as never)).toBe(50);
    expect(pelletFill({ stock_kg: 13 } as never, 26)).toBe(50);
    expect(pelletFill({ stock_kg: 40, capacity_kg: 26 } as never)).toBe(100);
    expect(pelletFill({ stock_kg: null } as never, 26)).toBeNull();
    expect(pelletFill(null)).toBeNull();
  });

  it("reicht bis: heute nur Uhrzeit, diese Woche mit Wochentag", () => {
    const now = "2026-11-19T18:00:00+01:00"; // Donnerstag
    expect(emptyText("2026-11-19T22:30:00+01:00", now, "de")).toBe("22:30");
    expect(emptyText("2026-11-21T06:00:00+01:00", now, "de")).toBe("Sa 06:00");
    expect(emptyText("2026-11-21T06:00:00+01:00", now, "en")).toBe("Sat 06:00");
    expect(emptyText("2026-12-01T06:00:00+01:00", now, "de")).toBe("01.12. 06:00");
  });
});

describe("Aufheizen und Kopfzeile", () => {
  it("Vorschlag für die Ankunft: +1 h, Viertelstunde aufgerundet", () => {
    expect(suggestArrival("2026-11-19T17:07:00+01:00")).toBe("18:15");
    expect(suggestArrival("2026-11-19T17:00:00+01:00")).toBe("18:00");
    expect(suggestArrival("2026-11-19T23:20:00+01:00")).toBe("00:30");
  });

  it("Text für laufendes und geplantes Aufheizen", () => {
    expect(warmupLabel(status(), t)).toBeNull();
    expect(warmupLabel(status({ warmup: { active: true, start_at: "2026-11-19T17:00:00+01:00", until: "2026-11-19T19:00:00+01:00", arrive: null } }), t)).toBe("Aufheizen bis 19:00");
    expect(
      warmupLabel(status({ warmup: { active: false, start_at: "2026-11-19T17:30:00+01:00", until: "2026-11-19T19:30:00+01:00", arrive: "2026-11-19T18:30:00+01:00" } }), t),
    ).toBe("Aufheizen ab 17:30 (Ankunft 18:30)");
  });

  it("Kopfzeile", () => {
    expect(heroText(status({ stove: { phase: "prepare", start_at: "2026-11-19T18:15:00+01:00" } }), t)).toBe("Heizkörper öffnen, Ofen zündet um 18:15");
    expect(heroText(status({ stove: { phase: "block", burning: true, block_start: "2026-11-19T18:10:00+01:00" } }), t)).toBe("Ofen brennt seit 18:10");
    expect(heroText(status({ stove: { phase: "block", self_off: true } }), t)).toMatch(/selbst abgeschaltet/);
    expect(heroText(status({ stove: { error: true } }), t)).toMatch(/Störung/);
    expect(heroState(status({ house: { deficit_k: -1.5, outdoor_c: null } })).key).toBe("idle_warm");
    expect(heroState(status({ overrides: { scene: null, pause_until: "2026-11-19T20:00:00+01:00", boost: null } })).key).toBe("paused");
  });

  it("Innentemperatur vom Server, sonst aus den Räumen", () => {
    expect(houseTemps(status({ house: { deficit_k: 0, outdoor_c: 0, temperature_c: 22.4, target_c: 22 } }))).toEqual({ temp: 22.4, target: 22 });
    const rooms = [
      { temperature: 20, target: 21 },
      { temperature: 22, target: 21 },
      { temperature: null, target: 19 },
    ] as never;
    expect(houseTemps(status({ rooms }))).toEqual({ temp: 21, target: 20.3 });
  });
});

describe("buildMulti", () => {
  const box = { width: 600, height: 200, padLeft: 4, padRight: 4, padTop: 8, padBottom: 20 };
  const defs = [
    { key: "target", get: (p: HistoryPoint) => p.target_c, step: true },
    { key: "room:a", get: (p: HistoryPoint) => p.rooms?.a },
    { key: "room:b", get: (p: HistoryPoint) => p.rooms?.b },
    { key: "house", get: (p: HistoryPoint) => p.house_c },
  ];

  it("zeichnet je Raum eine Linie und lässt Lücken", () => {
    const pts = points(6, (i) => ({ rooms: { a: 20 + i * 0.2, b: i === 3 ? null : 22 } }));
    const m = buildMulti(pts, box, defs)!;
    expect(m.series.map((s) => s.key)).toEqual(["target", "room:a", "room:b", "house"]);
    expect(m.series[1].values).toHaveLength(6);
    expect(m.series[2].values[3]).toBeNull();
    expect(m.series[2].path.match(/M/g)).toHaveLength(2); // Lücke: zwei Teilstücke
    expect(m.xs[0]).toBe(4);
    expect(m.xs[5]).toBe(596);
    expect(m.yMin).toBeLessThanOrEqual(20);
    expect(m.yMax).toBeGreaterThanOrEqual(22);
  });

  it("alte Punkte ohne Raumwerte: nur Mittel und Ziel", () => {
    const m = buildMulti(points(4, () => ({})), box, defs)!;
    expect(m.series[1].path).toBe("");
    expect(m.series[3].path).not.toBe("");
  });

  it("liefert null ohne Messwerte", () => {
    expect(buildMulti(points(4, () => ({ water_c: null })), box, [{ key: "water", get: (p) => p.water_c }])).toBeNull();
    expect(buildMulti([], box, defs)).toBeNull();
  });

  it("Kessel: Achse in runden Schritten, auch bei großer Spanne", () => {
    const m = buildMulti(points(12, (i) => ({ water_c: 20 + i * 7, burning: i > 2 && i < 6 })), box, [{ key: "water", get: (p) => p.water_c }])!;
    const step = m.yTicks[1].value - m.yTicks[0].value;
    expect([10, 20]).toContain(step);
    expect(m.yTicks.length).toBeLessThanOrEqual(8);
    expect(m.bands).toHaveLength(1);
  });

  it("niceStep und nearestIndex", () => {
    expect(niceStep(4, 7)).toBe(1);
    expect(niceStep(80, 4)).toBe(20);
    expect(nearestIndex([4, 100, 200, 596], 160)).toBe(2);
    expect(nearestIndex([4, 100, 200, 596], -50)).toBe(0);
  });
});
