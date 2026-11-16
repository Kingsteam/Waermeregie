// Reine Funktionen zur Entitätssuche (ohne DOM), Basis für <wr-entity-picker>.
import type { HassEntity } from "./types";

export interface EntityFilter {
  domains: string[];
  deviceClasses?: string[];
  query?: string;
  exclude?: string[];
  limit?: number;
}

export interface EntityOption {
  entity_id: string;
  name: string;
  device_class?: string;
}

export function domainOf(entityId: string): string {
  return entityId.split(".", 1)[0];
}

export function friendlyName(states: Record<string, HassEntity> | undefined, entityId: string): string {
  const name = states?.[entityId]?.attributes?.friendly_name;
  return typeof name === "string" && name ? name : entityId;
}

function fold(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Treffer aus hass.states nach Domain, optional device_class, Suchtext (alle Wörter müssen passen). */
export function filterEntities(states: Record<string, HassEntity> | undefined, f: EntityFilter): EntityOption[] {
  const words = fold(f.query ?? "")
    .split(/\s+/)
    .filter(Boolean);
  const exclude = new Set(f.exclude ?? []);
  const out: EntityOption[] = [];
  for (const st of Object.values(states ?? {})) {
    const id = st.entity_id;
    if (exclude.has(id)) continue;
    if (f.domains.length && !f.domains.includes(domainOf(id))) continue;
    const dc = typeof st.attributes?.device_class === "string" ? st.attributes.device_class : undefined;
    // device_class-Filter gilt nur für Domains, die device_class kennen (sensor, binary_sensor …)
    if (f.deviceClasses?.length && (domainOf(id) === "sensor" || domainOf(id) === "binary_sensor")) {
      if (!dc || !f.deviceClasses.includes(dc)) continue;
    }
    const name = friendlyName(states, id);
    if (words.length) {
      const hay = fold(`${name} ${id}`);
      if (!words.every((w) => hay.includes(w))) continue;
    }
    out.push({ entity_id: id, name, device_class: dc });
  }
  out.sort((a, b) => a.name.localeCompare(b.name) || a.entity_id.localeCompare(b.entity_id));
  return f.limit ? out.slice(0, f.limit) : out;
}

/** Benachrichtigungsdienste aus hass.services.notify als "notify.<name>". */
export function notifyServices(services: Record<string, Record<string, unknown>> | undefined): string[] {
  return Object.keys(services?.notify ?? {})
    .map((s) => `notify.${s}`)
    .sort();
}
