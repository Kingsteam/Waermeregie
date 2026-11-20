// Bausteine der neuen Übersicht (Panel und Karte): Haus-Kopf, Pellets, Ofen-Details, Räume kompakt.
import { css, html, nothing, type TemplateResult } from "lit";
import { heroState, houseTemps, pelletFill } from "./charts";
import { renderHouseArt, renderPelletTank } from "./graphics";
import type { T } from "./i18n";
import type { RoomStatus, Status } from "./types";
import { clockFromIso, formatKelvin, formatNumber, formatStamp, formatTemp, minutesFromIso } from "./util";
import { collectAlerts, renderTimeline, type ViewCtx } from "./views";

/** Satz für die Kopfzeile. */
export function heroText(status: Status | null | undefined, t: T): string {
  const h = heroState(status);
  switch (h.key) {
    case "error":
      return t("hero.error");
    case "unavailable":
      return t("stove.unavailable");
    case "prepare":
      return t("hero.prepare", { time: h.time });
    case "self_off":
      return t("hero.self_off");
    case "burning":
      return t("hero.burning", { time: h.time });
    case "block":
      return t("hero.block", { time: h.time });
    case "warmup_planned":
      return t("hero.warmup_planned", { time: h.time });
    case "paused":
      return t("hero.paused", { time: h.time });
    case "pause":
      return t("hero.pause", { time: h.time });
    case "idle_warm":
      return t("hero.idle_warm");
    default:
      return t("hero.idle");
  }
}

/** Kopf: Haus-Grafik, Innentemperatur groß, Ziel, ein Satz zum Ofen. */
export function renderHeroHead(ctx: ViewCtx, opts: { size?: number } = {}): TemplateResult {
  const { t, lang, status } = ctx;
  const { temp, target } = houseTemps(status);
  const burning = !!status?.stove?.burning;
  const h = heroState(status);
  const warm = burning || h.key === "prepare" || h.key === "block";
  return html`<div class="hero-head">
    ${renderHouseArt({ burning, warm, size: opts.size })}
    <div class="hero-text">
      <div class="hero-label">${t("hero.inside")}</div>
      <div class="hero-temp">${formatTemp(temp, lang)}</div>
      <div class="hero-target">${target !== null ? t("hero.target", { temp: formatTemp(target, lang) }) : nothing}${status?.scene ? html` · ${status.scene.name}` : nothing}</div>
      <div class="hero-status ${status?.stove?.error ? "err" : burning ? "heat" : ""}">${heroText(status, t)}</div>
    </div>
  </div>`;
}

/** Hinweise als schmale Leiste; nichts, wenn alles in Ordnung ist. */
export function renderAlertStrip(ctx: ViewCtx): TemplateResult | typeof nothing {
  const alerts = collectAlerts(ctx.status, ctx.t);
  if (!alerts.length) return nothing;
  return html`<div class="alert-strip" role="status">
    ${alerts.map(
      (a) => html`<div class="as ${a.kind}">
        <ha-icon icon=${a.kind === "opening" ? "mdi:window-open-variant" : a.kind.includes("error") ? "mdi:alert-octagon" : "mdi:alert-circle-outline"}></ha-icon>
        <span>${a.message}</span>
      </div>`,
    )}
  </div>`;
}

/** Pelletbehälter mit Füllstand und Knopf „Sack nachgefüllt“. */
export function renderPellets(ctx: ViewCtx, onRefill: (() => void) | null, opts: { compact?: boolean } = {}): TemplateResult | typeof nothing {
  const { t, lang, status, config } = ctx;
  const p = status?.pellets;
  if (!p || p.stock_kg === null || p.stock_kg === undefined) return nothing;
  const fill = pelletFill(p, config?.parameters?.pellet_capacity_kg);
  const reminder = config?.parameters?.pellet_reminder_kg ?? 5;
  const low = p.stock_kg <= reminder;
  const kg = formatNumber(p.stock_kg, lang, 1);
  const until = p.empty_at ? emptyText(p.empty_at, status?.now, lang) : null;
  if (opts.compact) {
    return html`<div class="pellet-mini ${low ? "low" : ""}">
      <ha-icon icon="mdi:grain"></ha-icon>
      <div class="bar" role="img" aria-label=${t("pellets.aria", { pct: String(fill ?? 0) })}><i style="width:${fill ?? 0}%"></i></div>
      <span>${kg} kg${until ? html` · ${t("pellets.until", { time: until })}` : nothing}</span>
    </div>`;
  }
  return html`<div class="card pellets ${low ? "low" : ""}">
    <h3>${t("pellets.title")}</h3>
    <div class="prow">
      ${renderPelletTank(fill, { low, size: 84 })}
      <div class="ptext">
        <div class="pkg">${kg} kg</div>
        ${until ? html`<div>${t("pellets.until", { time: until })}</div>` : nothing}
        ${low ? html`<div class="warn-text">${t("pellets.low")}</div>` : nothing}
        ${!p.rate_learned ? html`<div class="hint">${t("pellets.estimate")}</div>` : nothing}
      </div>
    </div>
    ${onRefill
      ? html`<button ?disabled=${!ctx.isAdmin || ctx.busy} title=${ctx.isAdmin ? "" : t("not_admin")} @click=${onRefill}>
          <ha-icon icon="mdi:sack"></ha-icon>${t("pellets.refill")}
        </button>`
      : nothing}
  </div>`;
}

const WEEKDAYS = {
  de: ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
};

/** „Fr 18:00“ (Wochentag aus dem Datum des Servers), heute nur Uhrzeit, ab 7 Tagen das Datum. */
export function emptyText(emptyAt: string, nowIso: string | null | undefined, lang: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(emptyAt);
  const n = nowIso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(nowIso) : null;
  if (!m) return formatStamp(emptyAt, nowIso, lang);
  const day = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const today = n ? Date.UTC(+n[1], +n[2] - 1, +n[3]) : null;
  const diff = today === null ? null : Math.round((day - today) / 86400000);
  if (diff === 0) return clockFromIso(emptyAt);
  if (diff !== null && diff > 0 && diff < 7) {
    const wd = WEEKDAYS[lang.startsWith("de") ? "de" : "en"][new Date(day).getUTCDay()];
    return `${wd} ${clockFromIso(emptyAt)}`;
  }
  return formatStamp(emptyAt, nowIso, lang);
}

/** Ofen-Karte: Phase, Grund, Details zum Aufklappen. */
export function renderStoveCard(ctx: ViewCtx): TemplateResult {
  const { t, status, lang } = ctx;
  const st = status?.stove;
  if (!st) return html`<div class="card"><h3>${t("stove.title")}</h3><div class="muted">${t("stove.no_status")}</div></div>`;
  const dayType = status?.day_type ? ctx.config?.day_types.find((d) => d.id === status.day_type?.id) : undefined;
  const loc = lang.startsWith("de") ? "de-DE" : "en-US";
  return html`<div class="card stove ${st.burning ? "burning" : ""}">
    <div class="row">
      <ha-icon class="flame" icon=${st.burning ? "mdi:fire" : "mdi:fireplace-off"}></ha-icon>
      <h3 style="margin:0">${t("stove.title")}</h3>
      <span class="spacer"></span>
      ${!st.available ? html`<span class="badge warn">${t("stove.unavailable")}</span>` : nothing}
      ${st.error ? html`<span class="badge err">${t("stove.error_short")}</span>` : nothing}
      <span class="badge ${st.burning ? "heat" : ""}">${st.burning ? t("stove.burning") : t("stove.not_burning")}</span>
    </div>
    <div class="phase" style="margin-top:6px">${t(`stove.phase.${st.phase}` as "stove.phase.idle")}</div>
    ${st.reason ? html`<div class="muted">${st.reason}</div>` : nothing}
    <details class="more">
      <summary>${t("details.title")}</summary>
      <dl class="kv">
        <dt>${t("stove.starts_today")}</dt>
        <dd>${st.starts_today ?? 0} / ${st.max_starts_per_day ?? "–"}</dd>
        ${st.block_start ? html`<dt>${t("stove.block_since")}</dt><dd>${clockFromIso(st.block_start)}</dd>` : nothing}
        ${st.pause_until ? html`<dt>${t("stove.pause_until")}</dt><dd>${formatStamp(st.pause_until, status?.now, lang)}</dd>` : nothing}
        ${st.power_level !== null && st.power_level !== undefined ? html`<dt>${t("stove.power_level")}</dt><dd>${st.power_level} / 5</dd>` : nothing}
        ${st.water_c !== null && st.water_c !== undefined ? html`<dt>${t("stove.water")}</dt><dd>${formatTemp(st.water_c, lang)}</dd>` : nothing}
        ${st.ignitions !== null && st.ignitions !== undefined ? html`<dt>${t("stove.ignitions")}</dt><dd>${st.ignitions.toLocaleString(loc)}</dd>` : nothing}
        ${status?.house?.outdoor_c !== null && status?.house?.outdoor_c !== undefined
          ? html`<dt>${t("house.outdoor")}</dt><dd>${formatTemp(status.house.outdoor_c, lang)}</dd>`
          : nothing}
        ${status?.house?.deficit_k !== null && status?.house?.deficit_k !== undefined
          ? html`<dt>${t("house.deficit")}</dt><dd>${formatKelvin(status.house.deficit_k, lang)}</dd>`
          : nothing}
        ${status?.day_type ? html`<dt>${t("details.day_type")}</dt><dd>${status.day_type.name}</dd>` : nothing}
      </dl>
      ${dayType && ctx.config
        ? html`<div style="margin-top:10px">
            ${renderTimeline(dayType.slots, ctx.config.scenes, { nowMinutes: minutesFromIso(status?.now), labels: false, legend: true })}
          </div>`
        : nothing}
    </details>
  </div>`;
}

function roomClass(r: RoomStatus): string {
  if (r.temperature === null || r.temperature === undefined || r.target === null || r.target === undefined) return "";
  const d = r.target - r.temperature;
  if (d > 0.3) return "cold";
  if (d < -0.5) return "warm";
  return "ok";
}

/** Räume als kleine Kacheln. */
export function renderRoomTiles(ctx: ViewCtx, filter?: string[] | null): TemplateResult {
  const { t, lang } = ctx;
  let rooms = ctx.status?.rooms ?? [];
  if (filter?.length) rooms = filter.map((id) => rooms.find((r) => r.id === id)).filter((r): r is RoomStatus => !!r);
  if (!rooms.length) return html`<div class="muted">${filter?.length ? t("card.no_rooms") : t("rooms.none")}</div>`;
  return html`<div class="tiles">
    ${rooms.map((r) => {
      const missing = r.sensors_missing ?? 0;
      return html`<div class="tile ${roomClass(r)}">
        <div class="tname">${r.name}</div>
        <div class="ttemp">${formatTemp(r.temperature, lang)}</div>
        <div class="tsub">
          <span>${t("room.target")} ${formatNumber(r.target, lang, 1)}°</span>
          <span class="ticons">
            ${r.open ? html`<ha-icon class="cold" icon="mdi:window-open-variant" title=${r.open_minutes ? t("room.open_for", { time: `${r.open_minutes} min` }) : t("room.open")}></ha-icon>` : nothing}
            ${r.ventilating ? html`<ha-icon icon="mdi:water-percent" title=${t("room.ventilating", { value: formatNumber(r.humidity ?? null, lang, 0) })}></ha-icon>` : nothing}
            ${r.recover_until && !r.open ? html`<ha-icon icon="mdi:weather-windy" title=${t("room.recovering", { time: clockFromIso(r.recover_until) })}></ha-icon>` : nothing}
            ${r.occupied === true ? html`<ha-icon icon="mdi:account" title=${t("room.occupied")}></ha-icon>` : nothing}
            ${missing > 0
              ? html`<ha-icon class="warn" icon="mdi:access-point-network-off" title=${missing === 1 ? t("room.sensor_missing") : t("room.sensors_missing", { n: missing })}></ha-icon>`
              : nothing}
          </span>
        </div>
      </div>`;
    })}
  </div>`;
}

export const overviewStyles = css`
  .hero-head {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .hero-text {
    min-width: 0;
  }
  .hero-label {
    color: var(--wr-text2);
    font-size: 13px;
  }
  .hero-temp {
    font-size: 44px;
    font-weight: 500;
    line-height: 1.05;
    font-variant-numeric: tabular-nums;
  }
  .hero-target {
    color: var(--wr-text2);
  }
  .hero-status {
    margin-top: 6px;
    font-weight: 500;
  }
  .hero-status.heat {
    color: var(--wr-heat);
  }
  .hero-status.err {
    color: var(--wr-err);
  }
  .alert-strip {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .alert-strip .as {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 8px 12px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--wr-warn) 14%, transparent);
    font-size: 13px;
  }
  .alert-strip .as ha-icon {
    color: var(--wr-warn);
    --mdc-icon-size: 18px;
  }
  .alert-strip .as.opening {
    background: color-mix(in srgb, var(--wr-cold) 14%, transparent);
  }
  .alert-strip .as.opening ha-icon {
    color: var(--wr-cold);
  }
  .alert-strip .as.stove_error,
  .alert-strip .as.error {
    background: color-mix(in srgb, var(--wr-err) 14%, transparent);
  }
  .alert-strip .as.stove_error ha-icon,
  .alert-strip .as.error ha-icon {
    color: var(--wr-err);
  }
  .pellets .prow {
    display: flex;
    gap: 16px;
    align-items: center;
    margin-bottom: 10px;
  }
  .pellets .pkg {
    font-size: 26px;
    font-weight: 500;
  }
  .warn-text {
    color: var(--wr-warn);
    font-weight: 500;
  }
  .pellet-mini {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--wr-text2);
  }
  .pellet-mini .bar {
    flex: 1;
    height: 8px;
    border-radius: 4px;
    background: var(--wr-input-bg);
    overflow: hidden;
    min-width: 40px;
  }
  .pellet-mini .bar i {
    display: block;
    height: 100%;
    background: #b07d3c;
  }
  .pellet-mini.low .bar i {
    background: var(--wr-warn);
  }
  details.more {
    margin-top: 8px;
  }
  details.more summary {
    cursor: pointer;
    color: var(--wr-primary);
    font-weight: 500;
    padding: 4px 0;
  }
  .tiles {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 140px), 1fr));
  }
  .tile {
    background: var(--wr-card);
    border: 1px solid var(--wr-div);
    border-left: 4px solid var(--wr-div);
    border-radius: 10px;
    padding: 8px 10px;
    min-width: 0;
  }
  .tile.cold {
    border-left-color: var(--wr-cold);
  }
  .tile.warm {
    border-left-color: var(--wr-heat);
  }
  .tile.ok {
    border-left-color: var(--wr-ok);
  }
  .tname {
    font-size: 13px;
    color: var(--wr-text2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .ttemp {
    font-size: 22px;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .tsub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 4px;
    font-size: 12px;
    color: var(--wr-text2);
    min-height: 18px;
  }
  .ticons {
    display: inline-flex;
    gap: 2px;
  }
  .ticons ha-icon {
    --mdc-icon-size: 16px;
  }
  .ticons .cold {
    color: var(--wr-cold);
  }
  .ticons .warn {
    color: var(--wr-warn);
  }
  @media (max-width: 480px) {
    .hero-temp {
      font-size: 38px;
    }
  }
`;
