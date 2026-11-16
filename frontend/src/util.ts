// Reine Hilfsfunktionen ohne DOM- oder Lit-Abhängigkeit (getestet mit vitest).
import type { Config, RawLimit, Slot, WeekKey } from "./types";

export const MINUTES_PER_DAY = 24 * 60;
export const WEEK_KEYS: WeekKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun", "holiday"];

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** "HH:MM" -> Minuten seit Mitternacht, sonst null. */
export function parseTime(value: string): number | null {
  const m = TIME_RE.exec(String(value ?? "").trim());
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Minuten seit Mitternacht -> "HH:MM" (wird auf 0..1439 normiert). */
/**
 * Freie Eingabe einer Uhrzeit in HH:MM (24 h) umwandeln: "6" -> "06:00",
 * "630" / "6.30" / "6:3" -> "06:30" / "06:30" / "06:03". Unlesbares bleibt unverändert,
 * damit die Prüfung es als Fehler zeigt.
 */
export function normalizeTimeInput(value: string): string {
  const v = value.trim().replace(/[.,h ]/g, ":");
  let h: number;
  let m: number;
  const colon = /^(\d{1,2}):(\d{1,2})$/.exec(v);
  const digits = /^(\d{1,4})$/.exec(v);
  if (colon) {
    h = Number(colon[1]);
    m = Number(colon[2]);
  } else if (digits) {
    const d = digits[1];
    h = Number(d.length <= 2 ? d : d.slice(0, d.length - 2));
    m = d.length <= 2 ? 0 : Number(d.slice(-2));
  } else {
    return value;
  }
  if (h > 23 || m > 59) return value;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatTimeOfDay(minutes: number): string {
  const m = ((Math.floor(minutes) % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

/** Gültige Slots nach Startzeit sortiert (ungültige Zeiten werden ignoriert). */
function usableSlots(slots: Slot[] | undefined | null): { start: number; scene: string }[] {
  return (slots ?? [])
    .map((s) => ({ start: parseTime(s.start), scene: s.scene }))
    .filter((s): s is { start: number; scene: string } => s.start !== null && !!s.scene)
    .sort((a, b) => a.start - b.start);
}

/**
 * Aktive Szene zu einer Uhrzeit.
 * Vor dem ersten Slot des Tages gilt der letzte Slot des Vortags
 * (`previousDaySlots`; fehlt er, wird der letzte Slot desselben Tages genommen).
 */
export function activeSceneAt(
  slots: Slot[],
  time: string | number,
  previousDaySlots?: Slot[] | null,
): string | null {
  const t = typeof time === "number" ? time : parseTime(time);
  if (t === null) return null;
  const today = usableSlots(slots);
  let found: string | null = null;
  for (const s of today) {
    if (s.start <= t) found = s.scene;
    else break;
  }
  if (found !== null) return found;
  const prev = usableSlots(previousDaySlots ?? slots);
  return prev.length ? prev[prev.length - 1].scene : null;
}

export interface Segment {
  from: number;
  to: number;
  scene: string;
}

/** Balken für die Tageszeitleiste (0..1440 min), vor dem ersten Slot gilt der letzte. */
export function timelineSegments(slots: Slot[], previousDaySlots?: Slot[] | null): Segment[] {
  const s = usableSlots(slots);
  if (!s.length) return [];
  const out: Segment[] = [];
  if (s[0].start > 0) {
    const carry = activeSceneAt(slots, 0, previousDaySlots);
    if (carry) out.push({ from: 0, to: s[0].start, scene: carry });
  }
  s.forEach((slot, i) => {
    const to = i + 1 < s.length ? s[i + 1].start : MINUTES_PER_DAY;
    if (to > slot.start) out.push({ from: slot.start, to, scene: slot.scene });
  });
  // benachbarte gleiche Szenen zusammenfassen
  return out.reduce<Segment[]>((acc, seg) => {
    const last = acc[acc.length - 1];
    if (last && last.scene === seg.scene && last.to === seg.from) last.to = seg.to;
    else acc.push({ ...seg });
    return acc;
  }, []);
}

export type SlotErrorCode = "time_format" | "not_ascending" | "scene_missing" | "scene_unknown" | "empty";

export interface SlotError {
  index: number;
  code: SlotErrorCode;
}

/** Prüft Zeitslots: HH:MM, streng aufsteigend, Szene vorhanden (und bekannt, falls Liste gegeben). */
export function validateSlots(slots: Slot[], knownScenes?: string[]): SlotError[] {
  const errors: SlotError[] = [];
  if (!slots || slots.length === 0) return [{ index: -1, code: "empty" }];
  let prev: number | null = null;
  slots.forEach((slot, index) => {
    const t = parseTime(slot.start);
    if (t === null) {
      errors.push({ index, code: "time_format" });
    } else {
      if (prev !== null && t <= prev) errors.push({ index, code: "not_ascending" });
      prev = t;
    }
    if (!slot.scene) errors.push({ index, code: "scene_missing" });
    else if (knownScenes && !knownScenes.includes(slot.scene)) errors.push({ index, code: "scene_unknown" });
  });
  return errors;
}

const UMLAUTS: Record<string, string> = { ä: "ae", ö: "oe", ü: "ue", ß: "ss" };

/** ID aus einem Namen: Kleinbuchstaben, nur a-z0-9_, eindeutig gegenüber `existing`. */
export function makeId(name: string, existing: Iterable<string> = [], fallback = "eintrag"): string {
  let base = String(name ?? "")
    .toLowerCase()
    .replace(/[äöüß]/g, (c) => UMLAUTS[c] ?? c)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!base) base = fallback;
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let n = 2;
  while (taken.has(`${base}_${n}`)) n++;
  return `${base}_${n}`;
}

function decimalSep(lang: string): string {
  return lang.startsWith("de") ? "," : ".";
}

/** Zahl mit fester Nachkommastellenzahl und sprachabhängigem Dezimaltrenner. */
export function formatNumber(value: number | null | undefined, lang: string, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "–";
  const fixed = value.toFixed(digits);
  return decimalSep(lang) === "," ? fixed.replace(".", ",") : fixed;
}

/** 20.3 -> "20,3 °C" (de) bzw. "20.3 °C" (en); null -> "–". */
export function formatTemp(value: number | null | undefined, lang: string): string {
  const n = formatNumber(value, lang, 1);
  return n === "–" ? n : `${n} °C`;
}

/** Temperaturdifferenz in Kelvin mit Vorzeichen: 0.7 -> "+0,7 K". */
export function formatKelvin(value: number | null | undefined, lang: string, signed = false): string {
  const n = formatNumber(value, lang, 1);
  if (n === "–") return n;
  return `${signed && (value as number) > 0 ? "+" : ""}${n} K`;
}

/** Minuten -> "45 min", "2 h", "2 h 15 min". */
export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || !Number.isFinite(minutes)) return "–";
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;

/**
 * Uhrzeit aus einem ISO-Zeitstempel so, wie der Server ihn schreibt (Zeitzone von
 * Home Assistant, nicht die des Browsers). Akzeptiert auch "HH:MM". Sonst "–".
 */
export function clockFromIso(value: string | null | undefined): string {
  if (!value) return "–";
  const m = ISO_RE.exec(value);
  if (m) return `${m[4]}:${m[5]}`;
  const t = parseTime(value);
  return t === null ? "–" : formatTimeOfDay(t);
}

/** Datum aus ISO-Zeitstempel: "17.11." (de) bzw. "11/17" (en). */
export function dateFromIso(value: string | null | undefined, lang: string): string {
  const m = value ? ISO_RE.exec(value) : null;
  if (!m) return "";
  return lang.startsWith("de") ? `${m[3]}.${m[2]}.` : `${m[2]}/${m[3]}`;
}

/** Kalendertag ("YYYY-MM-DD") eines ISO-Zeitstempels oder null. */
export function dayOfIso(value: string | null | undefined): string | null {
  const m = value ? ISO_RE.exec(value) : null;
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/** Minuten seit Mitternacht aus ISO-Zeitstempel (Server-Wandzeit) oder null. */
export function minutesFromIso(value: string | null | undefined): number | null {
  const m = value ? ISO_RE.exec(value) : null;
  return m ? Number(m[4]) * 60 + Number(m[5]) : null;
}

/** Zeitpunkt für Protokoll und Anzeigen: heute nur Uhrzeit, sonst Datum + Uhrzeit. */
export function formatStamp(value: string | null | undefined, nowIso: string | null | undefined, lang: string): string {
  const clock = clockFromIso(value);
  if (clock === "–") return clock;
  const day = dayOfIso(value);
  if (day && nowIso && day === dayOfIso(nowIso)) return clock;
  const date = dateFromIso(value, lang);
  return date ? `${date} ${clock}` : clock;
}

/** Protokoll: neueste zuerst. Sortiert nach Zeitstempel, bei Gleichstand bleibt die Reihenfolge (neuer = später in der Liste). */
export function sortLogNewestFirst<T extends { time: string }>(log: T[] | null | undefined): T[] {
  return (log ?? [])
    .map((e, i) => ({ e, i, t: Date.parse(e.time) }))
    .sort((a, b) => {
      const ta = Number.isNaN(a.t) ? -Infinity : a.t;
      const tb = Number.isNaN(b.t) ? -Infinity : b.t;
      return tb - ta || b.i - a.i;
    })
    .map((x) => x.e);
}

export interface Limit {
  min?: number;
  max?: number;
  step?: number;
}

/** Vereinheitlicht `defaults.limits[key]` ({min,max,step} oder [min,max]). */
export function normalizeLimit(raw: RawLimit | null | undefined): Limit {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    const [min, max] = raw;
    return { min: Number.isFinite(min) ? min : undefined, max: Number.isFinite(max) ? max : undefined };
  }
  const out: Limit = {};
  if (typeof raw.min === "number") out.min = raw.min;
  if (typeof raw.max === "number") out.max = raw.max;
  if (typeof raw.step === "number") out.step = raw.step;
  return out;
}

function isRawLimit(v: unknown): boolean {
  if (Array.isArray(v)) return v.length >= 2 && v.every((x) => typeof x === "number");
  return !!v && typeof v === "object" && ("min" in (v as object) || "max" in (v as object));
}

/**
 * Parametergrenzen aus `defaults.limits`. Unterstützt `limits.parameters.{key}` (aktuelle
 * Absprache) und `limits.{key}` (ältere Form). Liefert eine flache Zuordnung key -> RawLimit.
 */
export function paramLimits(defaults: { limits?: unknown } | null | undefined): Record<string, RawLimit> {
  const l = defaults?.limits as Record<string, unknown> | undefined;
  if (!l || typeof l !== "object") return {};
  const out: Record<string, RawLimit> = {};
  for (const [k, v] of Object.entries(l)) if (isRawLimit(v)) out[k] = v as RawLimit;
  const nested = l.parameters;
  if (nested && typeof nested === "object" && !isRawLimit(nested)) {
    for (const [k, v] of Object.entries(nested as Record<string, unknown>)) if (isRawLimit(v)) out[k] = v as RawLimit;
  }
  return out;
}

/** Wert innerhalb der Grenzen? (undefinierte Grenzen gelten als offen) */
export function withinLimit(value: number, limit: Limit): boolean {
  if (!Number.isFinite(value)) return false;
  if (limit.min !== undefined && value < limit.min) return false;
  if (limit.max !== undefined && value > limit.max) return false;
  return true;
}

/** Sprache aus hass.language: "de*" -> de, sonst en. */
export function pickLang(language: string | null | undefined): "de" | "en" {
  const l = String(language ?? "de").toLowerCase();
  return l.startsWith("de") || l === "" ? "de" : "en";
}

/** Tiefe Kopie (JSON-kompatible Daten). */
export function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/** Inhaltlicher Vergleich JSON-kompatibler Daten (Schlüsselreihenfolge egal). */
export function sameData(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  const o = v as Record<string, unknown>;
  return `{${Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stableStringify(o[k])}`)
    .join(",")}}`;
}

/** Feste Farbpalette für Szenen (Index = Position in config.scenes). */
const SCENE_COLORS = ["#e8590c", "#1c7ed6", "#2f9e44", "#7048e8", "#0c8599", "#f08c00", "#c2255c", "#5c940d", "#868e96"];

export function sceneColor(sceneId: string, sceneIds: string[]): string {
  const i = sceneIds.indexOf(sceneId);
  return i < 0 ? "#868e96" : SCENE_COLORS[i % SCENE_COLORS.length];
}

/** Leere, gültige Grundstruktur einer Config (falls der Server Felder weglässt). */
export function normalizeConfig(raw: Partial<Config> | null | undefined): Config {
  const c = (raw ?? {}) as Partial<Config>;
  return {
    ...c,
    stove: {
      ...(c.stove ?? {}),
      climate: c.stove?.climate ?? null,
      power: c.stove?.power ?? null,
      chrono_switch: c.stove?.chrono_switch ?? null,
      eco_switch: c.stove?.eco_switch ?? null,
      error_sensor: c.stove?.error_sensor ?? null,
      water_sensor: c.stove?.water_sensor ?? null,
      ignitions_sensor: c.stove?.ignitions_sensor ?? null,
    },
    weather: c.weather ?? null,
    outdoor_sensor: c.outdoor_sensor ?? null,
    workday: c.workday ?? null,
    persons: c.persons ?? [],
    pet: c.pet ?? null,
    notify: c.notify ?? [],
    rooms: (c.rooms ?? []).map((r) => ({
      ...r,
      importance: r.importance ?? 2,
      radiators: r.radiators ?? [],
      temperature_sensors: r.temperature_sensors ?? [],
      openings: r.openings ?? [],
      presence: r.presence ?? [],
      targets: r.targets ?? {},
    })),
    scenes: c.scenes ?? [],
    day_types: (c.day_types ?? []).map((d) => ({ ...d, slots: d.slots ?? [] })),
    week: c.week ?? {},
    parameters: c.parameters ?? {},
    mode: c.mode ?? "shadow",
  };
}

/** Fehlermeldung aus einer abgelehnten callWS-Promise. */
export function errorMessage(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const e = err as { message?: unknown; code?: unknown; error?: { message?: unknown } };
    if (typeof e.message === "string" && e.message) return e.message;
    if (e.error && typeof e.error.message === "string") return e.error.message;
    if (typeof e.code === "string") return e.code;
  }
  return String(err);
}
