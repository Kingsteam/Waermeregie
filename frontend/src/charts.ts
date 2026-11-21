// Reine Hilfsfunktionen für Grafiken und Kopfzeile (ohne Lit, getestet mit vitest).
import type { T } from "./i18n";
import type { HistoryPoint, Status } from "./types";
import { clockFromIso, formatTimeOfDay, minutesFromIso } from "./util";

export interface ChartBox {
  width: number;
  height: number;
  padLeft?: number;
  padRight?: number;
  padTop?: number;
  padBottom?: number;
}

export interface ChartModel {
  width: number;
  height: number;
  /** Zeichenfläche */
  left: number;
  right: number;
  top: number;
  bottom: number;
  yMin: number;
  yMax: number;
  /** SVG-Pfad der Innentemperatur (mit Lücken) */
  house: string;
  /** SVG-Pfad der Zieltemperatur als Stufenlinie */
  target: string;
  /** Brennzeiten als Bänder (x, Breite) */
  bands: { x: number; w: number }[];
  yTicks: { y: number; value: number }[];
  xTicks: { x: number; label: string }[];
  /** letzter Messpunkt der Innentemperatur */
  last: { x: number; y: number; value: number } | null;
}

const num = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);

/** Sinnvolle Grenzen der y-Achse: ganze Grad, mindestens 2 K Spanne. */
export function yRange(values: number[]): [number, number] {
  if (!values.length) return [18, 22];
  let lo = Math.floor(Math.min(...values) - 0.3);
  let hi = Math.ceil(Math.max(...values) + 0.3);
  if (hi - lo < 2) {
    const mid = (hi + lo) / 2;
    lo = Math.floor(mid - 1);
    hi = lo + 2;
  }
  return [lo, hi];
}

/** Brennzeiten aus den Punkten: Index-Bereiche [von, bis) mit burning = true. */
export function burnRuns(points: HistoryPoint[]): [number, number][] {
  const runs: [number, number][] = [];
  let start = -1;
  points.forEach((p, i) => {
    if (p.burning && start < 0) start = i;
    if (!p.burning && start >= 0) {
      runs.push([start, i]);
      start = -1;
    }
  });
  if (start >= 0) runs.push([start, points.length]);
  return runs;
}

/**
 * Baut das Diagramm-Modell. Liefert null, wenn es nichts Sinnvolles zu zeichnen gibt
 * (weniger als zwei Punkte mit Innentemperatur).
 */
export function buildChart(points: HistoryPoint[] | null | undefined, box: ChartBox): ChartModel | null {
  const pts = (points ?? []).filter((p) => p && typeof p.t === "string" && !Number.isNaN(Date.parse(p.t)));
  pts.sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
  if (pts.filter((p) => num(p.house_c)).length < 2) return null;
  const left = box.padLeft ?? 28;
  const right = box.width - (box.padRight ?? 8);
  const top = box.padTop ?? 8;
  const bottom = box.height - (box.padBottom ?? 18);
  const t0 = Date.parse(pts[0].t);
  const t1 = Date.parse(pts[pts.length - 1].t);
  const span = Math.max(1, t1 - t0);
  const x = (t: string) => left + ((Date.parse(t) - t0) / span) * (right - left);
  const values = pts.flatMap((p) => [p.house_c, p.target_c]).filter(num);
  const [yMin, yMax] = yRange(values);
  const y = (v: number) => bottom - ((v - yMin) / (yMax - yMin)) * (bottom - top);
  const r = (v: number) => Math.round(v * 10) / 10;

  let house = "";
  let pen = false;
  let last: ChartModel["last"] = null;
  for (const p of pts) {
    if (num(p.house_c)) {
      house += `${pen ? "L" : "M"}${r(x(p.t))},${r(y(p.house_c))}`;
      pen = true;
      last = { x: r(x(p.t)), y: r(y(p.house_c)), value: p.house_c };
    } else pen = false;
  }

  let target = "";
  let prevY: number | null = null;
  for (const p of pts) {
    if (!num(p.target_c)) {
      prevY = null;
      continue;
    }
    const px = r(x(p.t));
    const py = r(y(p.target_c));
    if (prevY === null) target += `M${px},${py}`;
    else target += `H${px}${py !== prevY ? `V${py}` : ""}`;
    prevY = py;
  }

  const step = pts.length > 1 ? (right - left) / (pts.length - 1) : 0;
  const bands = burnRuns(pts).map(([a, b]) => {
    const xa = x(pts[a].t);
    const xb = b < pts.length ? x(pts[b].t) : Math.min(right, x(pts[b - 1].t) + step);
    return { x: r(xa), w: r(Math.max(1, xb - xa)) };
  });

  const yTicks: ChartModel["yTicks"] = [];
  const maxTicks = Math.max(2, Math.floor((bottom - top) / 24));
  const every = Math.max(1, Math.ceil((yMax - yMin) / maxTicks));
  for (let v = yMin; v <= yMax; v += every) yTicks.push({ y: r(y(v)), value: v });

  // Uhrzeit-Marken alle 6 Stunden (Wandzeit des Servers aus dem Zeitstempel)
  const xTicks: ChartModel["xTicks"] = [];
  const seen = new Set<string>();
  for (const p of pts) {
    const m = minutesFromIso(p.t);
    if (m === null) continue;
    const hour = Math.floor(m / 60);
    const key = `${p.t.slice(0, 10)} ${hour}`;
    if (hour % 6 === 0 && !seen.has(key)) {
      seen.add(key);
      xTicks.push({ x: r(x(p.t)), label: formatTimeOfDay(hour * 60) });
    }
  }
  return { width: box.width, height: box.height, left, right, top, bottom, yMin, yMax, house, target, bands, yTicks, xTicks, last };
}

export interface SeriesDef {
  key: string;
  get: (p: HistoryPoint) => number | null | undefined;
  /** Stufenlinie (Zielwert) statt Verbindungslinie */
  step?: boolean;
}

export interface MultiModel {
  width: number;
  height: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  yMin: number;
  yMax: number;
  /** je Reihe: SVG-Pfad (mit Lücken) und Werte je Zeitpunkt */
  series: { key: string; path: string; values: (number | null)[] }[];
  /** x-Position und Zeitstempel je Zeitpunkt (für den Zeiger) */
  xs: number[];
  times: string[];
  bands: { x: number; w: number }[];
  yTicks: { y: number; value: number }[];
  xTicks: { x: number; label: string }[];
  /** Wert -> y (für Punkte am Zeiger) */
  y: (v: number) => number;
}

/** Ganzzahlige Schrittweite der y-Achse: 1, 2, 5, 10, 20 ... */
export function niceStep(span: number, maxTicks: number): number {
  const raw = span / Math.max(1, maxTicks);
  for (const s of [1, 2, 5, 10, 20, 50]) if (s >= raw) return s;
  return 100;
}

/**
 * Diagramm mit mehreren Reihen auf EINER y-Achse. Liefert null, wenn keine Reihe
 * mindestens zwei Messpunkte hat.
 */
export function buildMulti(points: HistoryPoint[] | null | undefined, box: ChartBox, defs: SeriesDef[]): MultiModel | null {
  const pts = (points ?? []).filter((p) => p && typeof p.t === "string" && !Number.isNaN(Date.parse(p.t)));
  pts.sort((a, b) => Date.parse(a.t) - Date.parse(b.t));
  const raw = defs.map((d) => ({ def: d, values: pts.map((p) => (num(d.get(p)) ? (d.get(p) as number) : null)) }));
  const lines = raw.filter((s) => !s.def.step);
  if (!lines.some((s) => s.values.filter(num).length >= 2)) return null;
  const left = box.padLeft ?? 28;
  const right = box.width - (box.padRight ?? 8);
  const top = box.padTop ?? 8;
  const bottom = box.height - (box.padBottom ?? 18);
  const t0 = Date.parse(pts[0].t);
  const span = Math.max(1, Date.parse(pts[pts.length - 1].t) - t0);
  const r = (v: number) => Math.round(v * 10) / 10;
  const xs = pts.map((p) => r(left + ((Date.parse(p.t) - t0) / span) * (right - left)));
  const all = raw.flatMap((s) => s.values).filter(num);
  let [yMin, yMax] = yRange(all);
  const maxTicks = Math.max(2, Math.floor((bottom - top) / 24));
  const every = niceStep(yMax - yMin, maxTicks);
  yMin = Math.floor(yMin / every) * every;
  yMax = Math.ceil(yMax / every) * every;
  const y = (v: number) => r(bottom - ((v - yMin) / (yMax - yMin)) * (bottom - top));

  const series = raw.map(({ def, values }) => {
    let path = "";
    let pen = false;
    let prevY: number | null = null;
    values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        prevY = null;
        return;
      }
      const py = y(v);
      if (def.step) {
        if (prevY === null) path += `M${xs[i]},${py}`;
        else path += `H${xs[i]}${py !== prevY ? `V${py}` : ""}`;
        prevY = py;
      } else {
        path += `${pen ? "L" : "M"}${xs[i]},${py}`;
        pen = true;
      }
    });
    return { key: def.key, path, values };
  });

  const stepW = pts.length > 1 ? (right - left) / (pts.length - 1) : 0;
  const bands = burnRuns(pts).map(([a, b]) => {
    const xb = b < pts.length ? xs[b] : Math.min(right, xs[b - 1] + stepW);
    return { x: xs[a], w: r(Math.max(1, xb - xs[a])) };
  });
  const yTicks: MultiModel["yTicks"] = [];
  for (let v = yMin; v <= yMax; v += every) yTicks.push({ y: y(v), value: v });
  const xTicks: MultiModel["xTicks"] = [];
  const seen = new Set<string>();
  pts.forEach((p, i) => {
    const m = minutesFromIso(p.t);
    if (m === null) return;
    const hour = Math.floor(m / 60);
    const key = `${p.t.slice(0, 10)} ${hour}`;
    if (hour % 6 === 0 && !seen.has(key)) {
      seen.add(key);
      xTicks.push({ x: xs[i], label: formatTimeOfDay(hour * 60) });
    }
  });
  return { width: box.width, height: box.height, left, right, top, bottom, yMin, yMax, series, xs, times: pts.map((p) => p.t), bands, yTicks, xTicks, y };
}

/** Index des Zeitpunkts, der einer x-Position am nächsten liegt. */
export function nearestIndex(xs: number[], x: number): number {
  let best = 0;
  for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
  return best;
}

/** Füllstand des Pelletbehälters in Prozent (0-100) oder null. */
export function pelletFill(p: Status["pellets"], capacityKg?: number | null): number | null {
  if (!p) return null;
  if (num(p.fill_pct)) return Math.max(0, Math.min(100, Math.round(p.fill_pct)));
  const cap = num(p.capacity_kg) ? p.capacity_kg : capacityKg;
  if (!num(p.stock_kg) || !num(cap) || cap <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((p.stock_kg / cap) * 100)));
}

/** Vorschlag für „Ich komme um …“: jetzt + 1 h, auf die nächste Viertelstunde aufgerundet. */
export function suggestArrival(nowIso: string | null | undefined, fallback = new Date()): string {
  let m = minutesFromIso(nowIso);
  if (m === null) m = fallback.getHours() * 60 + fallback.getMinutes();
  const next = Math.ceil((m + 60) / 15) * 15;
  return formatTimeOfDay(next % (24 * 60));
}

/** Mittlere Innentemperatur und Ziel: vom Server, sonst aus den Räumen gemittelt. */
export function houseTemps(status: Status | null | undefined): { temp: number | null; target: number | null } {
  const h = status?.house;
  if (h && (num(h.temperature_c) || num(h.target_c))) {
    return { temp: num(h.temperature_c) ? h.temperature_c : null, target: num(h.target_c) ? h.target_c : null };
  }
  const rooms = status?.rooms ?? [];
  const avg = (vals: number[]) => (vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10 : null);
  return {
    temp: avg(rooms.map((r) => r.temperature).filter(num)),
    target: avg(rooms.map((r) => r.target).filter(num)),
  };
}

export type HeroState =
  | { key: "error" }
  | { key: "unavailable" }
  | { key: "prepare"; time: string }
  | { key: "self_off" }
  | { key: "burning"; time: string }
  | { key: "block"; time: string }
  | { key: "warmup_planned"; time: string }
  | { key: "paused"; time: string }
  | { key: "pause"; time: string }
  | { key: "idle_warm" }
  | { key: "idle" };

/** Was die Kopfzeile in einem Satz sagt. */
export function heroState(status: Status | null | undefined): HeroState {
  const st = status?.stove;
  if (!st) return { key: "idle" };
  if (st.error) return { key: "error" };
  if (st.phase === "prepare") return { key: "prepare", time: clockFromIso(st.start_at) };
  if (st.self_off) return { key: "self_off" };
  if (st.burning) return { key: "burning", time: clockFromIso(st.block_start) };
  if (st.phase === "block") return { key: "block", time: clockFromIso(st.block_start) };
  if (!st.available) return { key: "unavailable" };
  const w = status?.warmup;
  if (w && !w.active && w.start_at) return { key: "warmup_planned", time: clockFromIso(w.start_at) };
  const manual = status?.overrides?.pause_until;
  if (manual) return { key: "paused", time: clockFromIso(manual) };
  if (st.phase === "pause" && st.pause_until) return { key: "pause", time: clockFromIso(st.pause_until) };
  const d = status?.house?.deficit_k;
  if (num(d) && d < 0) return { key: "idle_warm" };
  return { key: "idle" };
}

/** Text des laufenden oder geplanten Aufheizens, sonst null. */
export function warmupLabel(status: Status | null | undefined, t: T): string | null {
  const w = status?.warmup;
  if (!w || !w.until) return null;
  if (w.active && w.cold) return t("cold.active_until", { time: clockFromIso(w.until) });
  if (w.active) return t("warmup.active_until", { time: clockFromIso(w.until) });
  if (w.arrive) return t("warmup.planned_arrive", { time: clockFromIso(w.start_at), arrive: clockFromIso(w.arrive) });
  return t("warmup.planned", { time: clockFromIso(w.start_at) });
}

