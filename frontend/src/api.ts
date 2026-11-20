// WebSocket-Befehle nach docs/API.md.
import type { Config, ConfigResponse, Hass, HistoryPoint, Mode, Status } from "./types";

export const loadConfig = (hass: Hass) => hass.callWS<ConfigResponse>({ type: "waermeregie/config" });

export const saveConfig = (hass: Hass, config: Config) =>
  hass.callWS<{ config: Config }>({ type: "waermeregie/config/save", config });

export const loadStatus = (hass: Hass) => hass.callWS<Status>({ type: "waermeregie/status" });

export const setOverride = (hass: Hass, scene: string | null, minutes = 180) =>
  hass.callWS<Status>(scene === null ? { type: "waermeregie/override", scene: null } : { type: "waermeregie/override", scene, minutes });

export const setPause = (hass: Hass, minutes: number) => hass.callWS<Status>({ type: "waermeregie/pause", minutes });

export const setBoost = (hass: Hass, delta: number, minutes: number) =>
  hass.callWS<Status>({ type: "waermeregie/boost", delta, minutes });

/** Aufheizen: jetzt für `minutes`, oder Ankunft `arrive` ("HH:MM"), oder abbrechen. */
export type WarmupRequest = { minutes: number } | { arrive: string } | { cancel: true } | { cold: true };
export const setWarmup = (hass: Hass, req: WarmupRequest) => hass.callWS<Status>({ type: "waermeregie/warmup", ...req });

/** Verlauf für die Grafik. Fehlt der Befehl (ältere Version), wird abgelehnt. */
export const loadHistory = (hass: Hass, hours = 24) =>
  hass.callWS<{ points: HistoryPoint[] }>({ type: "waermeregie/history", hours }).then((r) => (Array.isArray(r?.points) ? r.points : []));

/** Ein Sack Pellets nachgefüllt (Dienst, kein WebSocket-Befehl). */
export async function pelletsRefill(hass: Hass): Promise<Status | null> {
  if (!hass.callService) throw new Error("callService fehlt");
  await hass.callService("waermeregie", "pellets_refill", {});
  return null;
}

export const resetLearning = (hass: Hass) => hass.callWS<Status>({ type: "waermeregie/learn/reset" });
export const setMode = (hass: Hass, mode: Mode) => hass.callWS<Status>({ type: "waermeregie/mode", mode });

/**
 * Abo auf Statusänderungen. Gibt eine Funktion zum Beenden zurück.
 * Fehler beim Abonnieren werden an `onError` gemeldet.
 */
export function subscribeStatus(hass: Hass, cb: (s: Status) => void, onError?: (e: unknown) => void): () => void {
  let unsub: (() => void | Promise<void>) | null = null;
  let closed = false;
  hass.connection
    .subscribeMessage<Status>(cb, { type: "waermeregie/subscribe" })
    .then((u) => {
      if (closed) void u();
      else unsub = u;
    })
    .catch((e) => onError?.(e));
  return () => {
    closed = true;
    if (unsub) {
      try {
        void Promise.resolve(unsub()).catch(() => undefined);
      } catch {
        /* Verbindung bereits weg */
      }
    }
    unsub = null;
  };
}

/** Hebt alle aktiven Übersteuerungen auf (Szene von Hand, Pause, Boost). */
export async function clearOverrides(hass: Hass, status: Status | null): Promise<Status | null> {
  const o = status?.overrides;
  const all = !o; // ohne Angaben: vorsichtshalber alles aufheben
  let last: Status | null = null;
  if (all || o?.scene || status?.scene?.source === "override") last = await setOverride(hass, null);
  if (all || o?.pause_until) last = await setPause(hass, 0);
  if (all || o?.boost) last = await setBoost(hass, 0, 0);
  return last;
}
