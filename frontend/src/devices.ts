// Geräte eines Raums: Art, aktueller Wert, verfügbar? Reine Funktionen (testbar).
import type { I18nKey, T } from "./i18n";
import type { DeviceHealth, HassEntity, Room } from "./types";
import { formatNumber, formatTemp } from "./util";

export type DeviceKind = "radiators" | "temperature_sensors" | "openings" | "presence" | "humidity_sensors";

export const DEVICE_KINDS: { kind: DeviceKind; icon: string; label: I18nKey; hint: I18nKey; domains: string[]; classes?: string[] }[] = [
  { kind: "radiators", icon: "mdi:radiator", label: "room.radiators", hint: "room.radiators_hint", domains: ["climate"] },
  {
    kind: "temperature_sensors",
    icon: "mdi:thermometer",
    label: "room.sensors",
    hint: "room.sensors_hint",
    domains: ["sensor"],
    classes: ["temperature"],
  },
  {
    kind: "openings",
    icon: "mdi:window-closed-variant",
    label: "room.openings",
    hint: "room.openings_hint",
    domains: ["binary_sensor"],
    classes: ["door", "window", "opening", "garage_door"],
  },
  {
    kind: "presence",
    icon: "mdi:motion-sensor",
    label: "room.presence",
    hint: "room.presence_hint",
    domains: ["binary_sensor"],
    classes: ["occupancy", "motion", "presence"],
  },
  {
    kind: "humidity_sensors",
    icon: "mdi:water-percent",
    label: "room.humidity",
    hint: "room.humidity_hint",
    domains: ["sensor"],
    classes: ["humidity"],
  },
];

const BAD = new Set(["unavailable", "unknown"]);

export function roomDevices(room: Room, kind: DeviceKind): string[] {
  if (kind === "temperature_sensors") return room.temperature_sensors.map((s) => s.entity);
  if (kind === "humidity_sensors") return room.humidity_sensors ?? [];
  return room[kind];
}

export function allRoomDevices(room: Room): string[] {
  return DEVICE_KINDS.flatMap((k) => roomDevices(room, k.kind));
}

export function isAvailable(st: HassEntity | undefined): boolean {
  return !!st && !BAD.has(st.state);
}

/** Kurzer Text zum aktuellen Zustand, z. B. „21,5 °C“, „offen“, „belegt“. */
export function deviceValue(st: HassEntity | undefined, kind: DeviceKind, t: T, lang: string): string {
  if (!isAvailable(st)) return t("dev.unavailable");
  const s = st as HassEntity;
  switch (kind) {
    case "radiators": {
      const cur = Number(s.attributes?.current_temperature);
      const set = Number(s.attributes?.temperature);
      const parts = [];
      if (Number.isFinite(cur)) parts.push(formatTemp(cur, lang));
      if (Number.isFinite(set)) parts.push(`→ ${formatTemp(set, lang)}`);
      return parts.join(" ") || s.state;
    }
    case "temperature_sensors": {
      const n = s.entity_id.startsWith("climate.") ? Number(s.attributes?.current_temperature) : Number(s.state);
      return Number.isFinite(n) ? formatTemp(n, lang) : s.state;
    }
    case "openings":
      return s.state === "on" ? t("dev.open") : t("dev.closed");
    case "presence":
      return s.state === "on" ? t("dev.occupied") : t("dev.empty");
    case "humidity_sensors": {
      const n = s.entity_id.startsWith("climate.") ? Number(s.attributes?.current_humidity) : Number(s.state);
      return Number.isFinite(n) ? `${formatNumber(n, lang, 0)} %` : s.state;
    }
  }
}

/** Kurzer Hinweis zur Zuverlässigkeit, z. B. „überbrückt“ oder „3× weg (24 h)“. */
export function healthNote(h: DeviceHealth | undefined, t: T): string | null {
  if (!h) return null;
  if (h.held) return t("dev.held");
  if (h.drops_24h > 0) return t("dev.drops", { n: h.drops_24h });
  return null;
}

/** Eingetragene, nicht pausierte Geräte, die gerade nicht verfügbar sind. */
export function unavailableDevices(room: Room, states: Record<string, HassEntity> | undefined): string[] {
  const paused = new Set(room.paused ?? []);
  return allRoomDevices(room).filter((e) => !paused.has(e) && !isAvailable(states?.[e]));
}

/** Gerät aus dem Raum entfernen (auch aus der Pausenliste). */
export function removeDevice(room: Room, kind: DeviceKind, entity: string): void {
  if (kind === "temperature_sensors") room.temperature_sensors = room.temperature_sensors.filter((s) => s.entity !== entity);
  else if (kind === "humidity_sensors") room.humidity_sensors = (room.humidity_sensors ?? []).filter((e) => e !== entity);
  else room[kind] = room[kind].filter((e) => e !== entity);
  room.paused = (room.paused ?? []).filter((e) => e !== entity);
}

export function addDevice(room: Room, kind: DeviceKind, entity: string): void {
  if (roomDevices(room, kind).includes(entity)) return;
  if (kind === "temperature_sensors") room.temperature_sensors.push({ entity, weight: 1 });
  else if (kind === "humidity_sensors") room.humidity_sensors = [...(room.humidity_sensors ?? []), entity];
  else room[kind].push(entity);
}

export function togglePaused(room: Room, entity: string): void {
  const paused = new Set(room.paused ?? []);
  if (paused.has(entity)) paused.delete(entity);
  else paused.add(entity);
  room.paused = allRoomDevices(room).filter((e) => paused.has(e));
}
