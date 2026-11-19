// Datentypen nach docs/API.md (Vertrag Panel <-> Python).

export type StoveRule = "allow" | "frost_only" | "deny";
export type Mode = "shadow" | "active";
export type WeekKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun" | "holiday";

export interface TemperatureSensor {
  entity: string;
  weight: number;
}

export interface Room {
  id: string;
  name: string;
  importance: number;
  radiators: string[];
  temperature_sensors: TemperatureSensor[];
  openings: string[];
  presence: string[];
  /** eingetragen, aber vorübergehend nicht verwendet */
  paused: string[];
  targets: Record<string, number>;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  stove: StoveRule;
  default_target: number;
}

export interface Slot {
  start: string;
  scene: string;
}

export interface DayType {
  id: string;
  name: string;
  slots: Slot[];
}

export interface Config {
  stove: {
    climate: string | null;
    /** select ODER number für die Leistungsstufe (1-5) */
    power: string | null;
    chrono_switch: string | null;
    eco_switch: string | null;
    error_sensor: string | null;
    water_sensor: string | null;
    ignitions_sensor: string | null;
  };
  weather: string | null;
  outdoor_sensor: string | null;
  workday: string | null;
  persons: string[];
  pet: string | null;
  notify: string[];
  rooms: Room[];
  scenes: Scene[];
  day_types: DayType[];
  week: Partial<Record<WeekKey, string>>;
  parameters: Record<string, number>;
  mode: Mode;
}

/** Grenze eines Parameters. `defaults.limits` darf {min,max,step} oder [min,max] liefern. */
export type RawLimit = { min?: number; max?: number; step?: number } | [number, number] | number[];

export interface Defaults {
  /** Grenzen je Parameter; laut Absprache unter `limits.parameters`, ältere Form direkt unter `limits`. */
  limits?: Record<string, RawLimit> | { parameters?: Record<string, RawLimit>; [key: string]: unknown };
  parameters?: Record<string, number>;
  [key: string]: unknown;
}

export interface ConfigResponse {
  config: Config;
  defaults: Defaults;
}

export type StovePhase = "idle" | "block" | "pause" | "blocked";
export type StoveAction = "start" | "stop" | "keep";

export interface RoomStatus {
  id: string;
  name: string;
  temperature: number | null;
  target: number | null;
  deficit_k: number | null;
  radiator_setpoint: number | null;
  open: boolean;
  open_minutes: number;
  /** nach dem Lüften: zählt bis dahin nicht für den Ofenstart */
  recover_until?: string | null;
  occupied: boolean | null;
  sensors_missing: number;
}

export interface Alert {
  kind: string;
  room?: string | null;
  entity?: string | null;
  minutes?: number | null;
  message: string;
}

export interface LogEntry {
  time: string;
  text: string;
  shadow?: boolean;
}

/** Zustand eines Raum-Geräts (Ausfälle der letzten 24 h). */
export interface DeviceHealth {
  drops_24h: number;
  down_since: string | null;
  /** nicht erreichbar, der letzte Wert wird noch verwendet */
  held: boolean;
}

export interface Status {
  mode: Mode;
  now: string;
  day_type: { id: string; name: string; reason?: string } | null;
  scene: {
    id: string;
    name: string;
    source: "schedule" | "override";
    until: string | null;
    next_change: string | null;
  } | null;
  stove: {
    entity: string | null;
    available: boolean;
    burning: boolean;
    on: boolean;
    phase: StovePhase;
    action: StoveAction;
    reason: string;
    block_start: string | null;
    pause_until: string | null;
    starts_today: number;
    max_starts_per_day: number;
    chrono_warning: boolean;
    eco_warning?: boolean;
    error?: boolean;
    power_level?: number | null;
    water_c?: number | null;
    ignitions?: number | null;
  } | null;
  house: { deficit_k: number | null; outdoor_c: number | null } | null;
  pellets?: {
    stock_kg: number | null;
    rate_kg_h: number;
    rate_learned: boolean;
    hours_left: number | null;
    empty_at: string | null;
    daily_burn_h: number;
  } | null;
  rooms: RoomStatus[];
  alerts: Alert[];
  devices?: Record<string, DeviceHealth>;
  overrides: {
    scene: unknown;
    pause_until: string | null;
    boost: unknown;
  } | null;
  log: LogEntry[];
}

// Minimaler Ausschnitt des Home-Assistant-Objekts, den wir brauchen.
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & { friendly_name?: string; device_class?: string };
}

export interface Hass {
  states: Record<string, HassEntity>;
  services: Record<string, Record<string, unknown>>;
  language?: string;
  locale?: { language?: string };
  user?: { is_admin?: boolean; name?: string };
  themes?: { darkMode?: boolean };
  callWS<T>(msg: Record<string, unknown>): Promise<T>;
  connection: {
    subscribeMessage<T>(cb: (msg: T) => void, msg: Record<string, unknown>): Promise<() => void | Promise<void>>;
  };
}
