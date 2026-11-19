// Gemeinsame Bausteine für Panel-Übersicht und Lovelace-Karte (reine Render-Funktionen).
import { html, nothing, type TemplateResult } from "lit";
import type { T } from "./i18n";
import type { Alert, Config, RoomStatus, Scene, Slot, Status } from "./types";
import {
  clockFromIso,
  formatKelvin,
  formatMinutes,
  formatStamp,
  formatTemp,
  formatTimeOfDay,
  MINUTES_PER_DAY,
  minutesFromIso,
  sceneColor,
  timelineSegments,
} from "./util";

export interface ViewCtx {
  t: T;
  lang: string;
  status: Status | null;
  config: Config | null;
  isAdmin: boolean;
  busy: boolean;
}

export function renderTimeline(
  slots: Slot[],
  scenes: Scene[],
  opts: { nowMinutes?: number | null; labels?: boolean; legend?: boolean } = {},
): TemplateResult {
  const ids = scenes.map((s) => s.id);
  const name = (id: string) => scenes.find((s) => s.id === id)?.name ?? id;
  const segs = timelineSegments(slots);
  const used = [...new Set(segs.map((s) => s.scene))];
  const pct = (m: number) => `${(m / MINUTES_PER_DAY) * 100}%`;
  return html`
    <div class="timeline" role="img" aria-label=${segs.map((s) => `${formatTimeOfDay(s.from)} ${name(s.scene)}`).join(", ")}>
      ${segs.map(
        (s) => html`<div
          class="seg"
          style="left:${pct(s.from)};width:${pct(s.to - s.from)};background:${sceneColor(s.scene, ids)}"
          title="${formatTimeOfDay(s.from)}–${s.to >= MINUTES_PER_DAY ? "24:00" : formatTimeOfDay(s.to)} ${name(s.scene)}"
        >
          ${opts.labels !== false && s.to - s.from >= 150 ? html`<span>${name(s.scene)}</span>` : nothing}
        </div>`,
      )}
      ${opts.nowMinutes !== null && opts.nowMinutes !== undefined
        ? html`<div class="now" style="left:calc(${pct(opts.nowMinutes)} - 1px)"></div>`
        : nothing}
    </div>
    <div class="timeline-scale" aria-hidden="true"><span>0</span><span>6</span><span>12</span><span>18</span><span>24</span></div>
    ${opts.legend
      ? html`<div class="legend">
          ${used.map((id) => html`<span><i style="background:${sceneColor(id, ids)}"></i>${name(id)}</span>`)}
        </div>`
      : nothing}
  `;
}

export function renderShadowBanner(ctx: ViewCtx, compact = false): TemplateResult | typeof nothing {
  if (ctx.status?.mode !== "shadow") return nothing;
  return html`<div class="banner shadow" role="status">
    <ha-icon icon="mdi:eye-outline"></ha-icon>
    <div>
      <strong>${ctx.t("mode.shadow_banner")}</strong>
      ${compact ? nothing : html`<span class="muted">${ctx.t("mode.shadow_banner_hint")}</span>`}
    </div>
  </div>`;
}

export function renderSceneChips(
  ctx: ViewCtx,
  onSelect: (sceneId: string | null) => void,
): TemplateResult {
  const { t, status, config } = ctx;
  const scenes = config?.scenes ?? [];
  const current = status?.scene;
  const isOverride = current?.source === "override";
  const disabled = !ctx.isAdmin || ctx.busy;
  const title = ctx.isAdmin ? "" : t("not_admin");
  return html`
    <div class="chips" role="group" aria-label=${t("scene.title")}>
      <button
        class="chip auto ${!isOverride ? "selected" : ""}"
        aria-pressed=${!isOverride}
        ?disabled=${disabled}
        title=${title || t("scene.auto_hint")}
        @click=${() => isOverride && onSelect(null)}
      >
        <ha-icon icon="mdi:calendar-clock"></ha-icon>${t("scene.auto")}
      </button>
      ${scenes.map((s) => {
        const sel = current?.id === s.id;
        return html`<button
          class="chip ${sel ? "selected" : ""}"
          aria-pressed=${sel}
          ?disabled=${disabled}
          title=${title}
          @click=${() => !(sel && isOverride) && onSelect(s.id)}
        >
          ${s.icon ? html`<ha-icon icon=${s.icon}></ha-icon>` : nothing}${s.name}
        </button>`;
      })}
    </div>
    ${current
      ? html`<div class="hint">
          ${current.name}
          ${isOverride && current.until ? html` · ${t("scene.override_until", { time: clockFromIso(current.until) })}` : nothing}
          ${!isOverride ? html` · ${t("scene.auto_hint")}` : nothing}
          ${current.next_change && !isOverride ? html` · ${t("scene.next_change", { time: clockFromIso(current.next_change) })}` : nothing}
          ${status?.day_type ? html` · ${t("day_type.today", { name: status.day_type.name })}` : nothing}
        </div>`
      : nothing}
  `;
}

export function renderStove(ctx: ViewCtx, opts: { timeline?: boolean; compact?: boolean } = {}): TemplateResult {
  const { t, status, lang } = ctx;
  const st = status?.stove;
  if (!st) return html`<div class="card stove"><h3>${t("stove.title")}</h3><div class="muted">${t("stove.no_status")}</div></div>`;
  const phaseIcon =
    st.phase === "block" ? "mdi:fire" : st.phase === "pause" ? "mdi:pause-circle-outline" : st.phase === "blocked" ? "mdi:fire-off" : "mdi:fireplace-off";
  const dayType = status?.day_type ? ctx.config?.day_types.find((d) => d.id === status.day_type?.id) : undefined;
  return html`<div class="card stove ${st.burning ? "burning" : ""}">
    <div class="row">
      <ha-icon class="flame" icon=${st.burning ? "mdi:fire" : phaseIcon}></ha-icon>
      <h3 style="margin:0">${t("stove.title")}</h3>
      <span class="spacer"></span>
      ${!st.available ? html`<span class="badge warn">${t("stove.unavailable")}</span>` : nothing}
      ${st.error ? html`<span class="badge err">${t("stove.error_short")}</span>` : nothing}
      <span class="badge ${st.burning ? "heat" : ""}">${st.burning ? t("stove.burning") : t("stove.not_burning")}</span>
    </div>
    <div class="phase" style="margin-top:6px">
      ${t(`stove.phase.${st.phase}` as "stove.phase.idle")}
      <span class="muted" style="font-size:14px"> · ${t(`stove.action.${st.action}` as "stove.action.keep")}</span>
    </div>
    ${st.reason ? html`<div class="muted">${st.reason}</div>` : nothing}
    <dl class="kv">
      <dt>${t("stove.starts_today")}</dt>
      <dd>${st.starts_today ?? 0} / ${st.max_starts_per_day ?? "–"}</dd>
      ${st.block_start ? html`<dt>${t("stove.block_since")}</dt><dd>${clockFromIso(st.block_start)}</dd>` : nothing}
      ${st.power_level !== null && st.power_level !== undefined
        ? html`<dt>${t("stove.power_level")}</dt><dd>${st.power_level} / 5</dd>`
        : nothing}
      ${st.water_c !== null && st.water_c !== undefined ? html`<dt>${t("stove.water")}</dt><dd>${formatTemp(st.water_c, lang)}</dd>` : nothing}
      ${!opts.compact && st.ignitions !== null && st.ignitions !== undefined
        ? html`<dt>${t("stove.ignitions")}</dt><dd>${st.ignitions.toLocaleString(lang.startsWith("de") ? "de-DE" : "en-US")}</dd>`
        : nothing}
      ${st.pause_until ? html`<dt>${t("stove.pause_until")}</dt><dd>${formatStamp(st.pause_until, status?.now, lang)}</dd>` : nothing}
      ${status?.pellets && status.pellets.stock_kg !== null && status.pellets.stock_kg !== undefined
        ? html`<dt>${t("stove.pellets")}</dt><dd>${status.pellets.stock_kg.toLocaleString(lang.startsWith("de") ? "de-DE" : "en-US", { maximumFractionDigits: 1 })} kg${status.pellets.empty_at ? html` · ${t("stove.pellets_empty")} ${formatStamp(status.pellets.empty_at, status.now, lang)}` : nothing}</dd>`
        : nothing}
      ${!opts.compact && status?.house?.outdoor_c !== null && status?.house?.outdoor_c !== undefined
        ? html`<dt>${t("house.outdoor")}</dt><dd>${formatTemp(status.house.outdoor_c, lang)}</dd>`
        : nothing}
      ${!opts.compact && status?.house?.deficit_k !== null && status?.house?.deficit_k !== undefined
        ? html`<dt>${t("house.deficit")}</dt><dd>${formatKelvin(status.house.deficit_k, lang)}</dd>`
        : nothing}
    </dl>
    ${opts.timeline && dayType && ctx.config
      ? html`<div style="margin-top:10px">
          <div class="hint">${dayType.name}</div>
          ${renderTimeline(dayType.slots, ctx.config.scenes, { nowMinutes: minutesFromIso(status?.now), labels: false, legend: true })}
        </div>`
      : nothing}
  </div>`;
}

function roomClass(r: RoomStatus): string {
  if (r.temperature === null || r.temperature === undefined || r.target === null || r.target === undefined) return "";
  const d = r.target - r.temperature;
  if (d > 0.3) return "cold";
  if (d < -0.5) return "warm";
  return "ok";
}

export function renderRoom(ctx: ViewCtx, r: RoomStatus): TemplateResult {
  const { t, lang } = ctx;
  const cls = roomClass(r);
  const missing = r.sensors_missing ?? 0;
  return html`<div class="card room ${cls}">
    <div class="row">
      <span class="name">${r.name}</span>
      <span class="spacer"></span>
      ${r.occupied === true ? html`<ha-icon icon="mdi:account" title=${t("room.occupied")}></ha-icon>` : nothing}
    </div>
    <div class="row" style="align-items:baseline">
      <span class="temp">${formatTemp(r.temperature, lang)}</span>
      <span class="muted">${t("room.target")} ${formatTemp(r.target, lang)}</span>
    </div>
    <div class="row" style="margin-top:4px">
      ${r.radiator_setpoint !== null && r.radiator_setpoint !== undefined
        ? html`<span class="badge" title=${t("room.radiator")}><ha-icon icon="mdi:radiator" style="--mdc-icon-size:14px"></ha-icon>${formatTemp(r.radiator_setpoint, lang)}</span>`
        : nothing}
      ${r.open
        ? html`<span class="badge cold"><ha-icon icon="mdi:window-open-variant" style="--mdc-icon-size:14px"></ha-icon>${r.open_minutes
            ? t("room.open_for", { time: formatMinutes(r.open_minutes) })
            : t("room.open")}</span>`
        : nothing}
      ${r.recover_until && !r.open
        ? html`<span class="badge"><ha-icon icon="mdi:weather-windy" style="--mdc-icon-size:14px"></ha-icon>${t("room.recovering", { time: clockFromIso(r.recover_until) })}</span>`
        : nothing}
      ${r.occupied === true ? html`<span class="badge">${t("room.occupied")}</span>` : nothing}
      ${cls === "cold" ? html`<span class="badge cold">${t("room.too_cold")}</span>` : nothing}
      ${missing > 0
        ? html`<span class="badge warn">${missing === 1 ? t("room.sensor_missing") : t("room.sensors_missing", { n: missing })}</span>`
        : nothing}
    </div>
  </div>`;
}

export function renderRooms(ctx: ViewCtx, filter?: string[] | null): TemplateResult {
  let rooms = ctx.status?.rooms ?? [];
  if (filter?.length) rooms = filter.map((id) => rooms.find((r) => r.id === id)).filter((r): r is RoomStatus => !!r);
  if (!rooms.length) return html`<div class="muted">${filter?.length ? ctx.t("card.no_rooms") : ctx.t("rooms.none")}</div>`;
  return html`<div class="grid">${rooms.map((r) => renderRoom(ctx, r))}</div>`;
}

function alertIcon(a: Alert): string {
  switch (a.kind) {
    case "opening":
      return "mdi:window-open-variant";
    case "sensor":
    case "sensors_missing":
      return "mdi:thermometer-off";
    case "stove":
      return "mdi:fireplace-off";
    case "chrono":
    case "chrono_warning":
      return "mdi:timer-alert-outline";
    case "eco":
    case "eco_warning":
      return "mdi:leaf";
    case "error":
    case "stove_error":
      return "mdi:alert-octagon";
    default:
      return "mdi:alert-circle-outline";
  }
}

/** Server-Hinweise plus Hinweise aus den Ofen-Flags (chrono_warning, eco_warning, error), ohne Doppelungen. */
export function collectAlerts(status: Status | null, t: T): Alert[] {
  const alerts = [...(status?.alerts ?? [])];
  const st = status?.stove;
  const has = (...kinds: string[]) => alerts.some((a) => kinds.includes(a.kind));
  if (st?.error && !has("error", "stove_error")) alerts.unshift({ kind: "stove_error", message: t("stove.error") });
  if (st?.chrono_warning && !has("chrono", "chrono_warning")) alerts.push({ kind: "chrono", message: t("stove.chrono_warning") });
  if (st?.eco_warning && !has("eco", "eco_warning")) alerts.push({ kind: "eco", message: t("stove.eco_warning") });
  return alerts;
}

export function renderAlerts(ctx: ViewCtx, opts: { showEmpty?: boolean } = {}): TemplateResult | typeof nothing {
  const alerts = collectAlerts(ctx.status, ctx.t);
  if (!alerts.length) return opts.showEmpty ? html`<div class="muted">${ctx.t("alerts.none")}</div>` : nothing;
  return html`<div role="list">
    ${alerts.map((a) => html`<div class="alert ${a.kind}" role="listitem"><ha-icon icon=${alertIcon(a)}></ha-icon><span>${a.message}</span></div>`)}
  </div>`;
}

export interface QuickHandlers {
  boost: () => void;
  pause: () => void;
  clear: () => void;
}

export function hasOverrides(status: Status | null): boolean {
  const o = status?.overrides;
  if (!o) return status?.scene?.source === "override";
  return !!(o.scene || o.pause_until || o.boost) || status?.scene?.source === "override";
}

export function boostDelta(status: Status | null): number | null {
  const b = status?.overrides?.boost as unknown;
  if (!b) return null;
  if (typeof b === "number") return b;
  if (typeof b === "object" && b && typeof (b as { delta?: unknown }).delta === "number") return (b as { delta: number }).delta;
  return 1;
}

export function renderQuickActions(ctx: ViewCtx, h: QuickHandlers, compact = false): TemplateResult {
  const { t, status, lang } = ctx;
  const disabled = !ctx.isAdmin || ctx.busy;
  const title = ctx.isAdmin ? "" : t("not_admin");
  const delta = boostDelta(status);
  const pauseUntil = status?.overrides?.pause_until ?? null;
  return html`
    <div class="row">
      <button ?disabled=${disabled} title=${title} @click=${h.boost}>
        <ha-icon icon="mdi:thermometer-plus"></ha-icon>${compact ? t("actions.boost_short") : t("actions.boost")}
      </button>
      <button ?disabled=${disabled} title=${title} @click=${h.pause}>
        <ha-icon icon="mdi:pause"></ha-icon>${compact ? t("actions.pause_short") : t("actions.pause")}
      </button>
      ${hasOverrides(status)
        ? html`<button ?disabled=${disabled} title=${title || t("actions.clear_hint")} @click=${h.clear}>
            <ha-icon icon="mdi:undo-variant"></ha-icon>${t("actions.clear")}
          </button>`
        : nothing}
    </div>
    ${delta || pauseUntil
      ? html`<div class="row" style="margin-top:6px">
          ${delta ? html`<span class="badge heat">${t("actions.boost_active", { delta: String(delta).replace(".", lang.startsWith("de") ? "," : ".") })}</span>` : nothing}
          ${pauseUntil ? html`<span class="badge">${t("actions.pause_active", { time: formatStamp(pauseUntil, status?.now, lang) })}</span>` : nothing}
        </div>`
      : nothing}
  `;
}
