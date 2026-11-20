// <wr-controls>: Hauptknöpfe (Aufheizen, Szene, Pause) mit kleinen Dialogen.
// Gemeinsam für Panel und Dashboard-Karte. Meldet neuen Status als Ereignis `wr-status`.
import { LitElement, css, html, nothing, type PropertyValues } from "lit";
import { clearOverrides, setBoost, setOverride, setPause, setWarmup, type WarmupRequest } from "./api";
import { suggestArrival, warmupLabel } from "./charts";
import { translator, type Lang, type T } from "./i18n";
import { baseStyles } from "./styles";
import type { Config, Hass, Status } from "./types";
import { clockFromIso, errorMessage, formatStamp, normalizeTimeInput, parseTime } from "./util";
import { boostDelta, hasOverrides } from "./views";

type Dialog = "warmup" | "pause" | "scene" | null;

const WARMUP_MINUTES = [60, 90, 120, 180];
const PAUSE_MINUTES = [60, 120, 240];

export class WrControls extends LitElement {
  static override properties = {
    hass: { attribute: false },
    status: { attribute: false },
    config: { attribute: false },
    lang: { type: String },
    compact: { type: Boolean },
    _dialog: { state: true },
    _arrive: { state: true },
    _busy: { state: true },
    _error: { state: true },
  };

  declare hass: Hass;
  declare status: Status | null;
  declare config: Config | null;
  declare lang: Lang;
  declare compact: boolean;
  declare _dialog: Dialog;
  declare _arrive: string;
  declare _busy: boolean;
  declare _error: string | null;

  constructor() {
    super();
    this.status = null;
    this.config = null;
    this.lang = "de";
    this.compact = false;
    this._dialog = null;
    this._arrive = "";
    this._busy = false;
    this._error = null;
  }

  private get _t(): T {
    return translator(this.lang);
  }

  private get _isAdmin(): boolean {
    return this.hass?.user?.is_admin !== false;
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has("_dialog")) {
      const d = this.renderRoot.querySelector("dialog");
      if (d && this._dialog && !d.open) {
        try {
          d.showModal();
        } catch {
          d.setAttribute("open", "");
        }
      }
    }
  }

  private _open(d: Dialog) {
    this._error = null;
    if (d === "warmup") this._arrive = suggestArrival(this.status?.now);
    this._dialog = d;
  }

  private _close() {
    const d = this.renderRoot.querySelector("dialog");
    if (d?.open) d.close();
    this._dialog = null;
  }

  private async _run(fn: () => Promise<Status | null>, close = true) {
    this._busy = true;
    this._error = null;
    try {
      const s = await fn();
      if (s && typeof s === "object" && "mode" in s) {
        this.dispatchEvent(new CustomEvent("wr-status", { detail: s, bubbles: true, composed: true }));
      }
      if (close) this._close();
    } catch (e) {
      this._error = errorMessage(e) || this._t("error");
    } finally {
      this._busy = false;
    }
  }

  private _warmup(req: WarmupRequest) {
    return this._run(() => setWarmup(this.hass, req));
  }

  protected override render() {
    const t = this._t;
    const st = this.status;
    const disabled = !this._isAdmin || this._busy || !st;
    const title = this._isAdmin ? "" : t("not_admin");
    const scene = st?.scene;
    const sceneCfg = this.config?.scenes.find((s) => s.id === scene?.id);
    const warm = warmupLabel(st, t);
    const pauseUntil = st?.overrides?.pause_until ?? null;
    const delta = boostDelta(st);
    const override = scene?.source === "override";
    return html`
      <div class="main ${this.compact ? "compact" : ""}">
        <button class="big heat ${warm ? "on" : ""}" ?disabled=${disabled} title=${title} @click=${() => this._open("warmup")}>
          <ha-icon icon="mdi:home-thermometer-outline"></ha-icon><span>${t("warmup.button")}</span>
        </button>
        <button class="big" ?disabled=${disabled} title=${title} @click=${() => this._open("scene")}>
          <ha-icon icon=${override ? sceneCfg?.icon || "mdi:palette-outline" : "mdi:calendar-clock"}></ha-icon>
          <span class="two"
            ><span>${scene?.name ?? t("scene.title")}</span><small>${override && scene?.until ? t("scene.override_until", { time: clockFromIso(scene.until) }) : t("scene.auto")}</small></span
          >
        </button>
        <button class="big ${pauseUntil ? "on" : ""}" ?disabled=${disabled} title=${title} @click=${() => this._open("pause")}>
          <ha-icon icon=${pauseUntil ? "mdi:pause-circle" : "mdi:pause"}></ha-icon><span>${t("pause.button")}</span>
        </button>
      </div>
      ${warm || pauseUntil || delta
        ? html`<div class="active">
            ${warm
              ? html`<span class="pill heat"
                  ><ha-icon icon="mdi:home-thermometer"></ha-icon>${warm}<button
                    class="x"
                    ?disabled=${disabled}
                    aria-label=${t("warmup.cancel")}
                    title=${t("warmup.cancel")}
                    @click=${() => this._warmup({ cancel: true })}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`
              : nothing}
            ${pauseUntil
              ? html`<span class="pill"
                  ><ha-icon icon="mdi:pause"></ha-icon>${t("actions.pause_active", { time: formatStamp(pauseUntil, st?.now, this.lang) })}<button
                    class="x"
                    ?disabled=${disabled}
                    aria-label=${t("pause.cancel")}
                    title=${t("pause.cancel")}
                    @click=${() => this._run(() => setPause(this.hass, 0), false)}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`
              : nothing}
            ${delta
              ? html`<span class="pill heat"
                  >${t("actions.boost_active", { delta: String(delta).replace(".", this.lang === "de" ? "," : ".") })}<button
                    class="x"
                    ?disabled=${disabled}
                    aria-label=${t("actions.clear")}
                    title=${t("actions.clear")}
                    @click=${() => this._run(() => setBoost(this.hass, 0, 0), false)}
                  ><ha-icon icon="mdi:close"></ha-icon></button
                ></span>`
              : nothing}
          </div>`
        : nothing}
      ${this._error && !this._dialog ? html`<div class="error-text" role="alert">${this._error}</div>` : nothing}
      ${this._dialog ? this._renderDialog() : nothing}
    `;
  }

  private _renderDialog() {
    const t = this._t;
    const titles = { warmup: t("warmup.title"), pause: t("pause.title"), scene: t("scene.title") };
    const d = this._dialog as Exclude<Dialog, null>;
    return html`<dialog
      aria-label=${titles[d]}
      @close=${() => (this._dialog = null)}
      @click=${(e: Event) => {
        if (e.target === e.currentTarget) this._close();
      }}
    >
      <div class="sheet">
        <div class="head">
          <h3>${titles[d]}</h3>
          <button class="icon" aria-label=${t("close")} @click=${this._close}><ha-icon icon="mdi:close"></ha-icon></button>
        </div>
        ${d === "warmup" ? this._renderWarmup() : d === "pause" ? this._renderPause() : this._renderScene()}
        ${this._error ? html`<div class="error-text" role="alert">${this._error}</div>` : nothing}
      </div>
    </dialog>`;
  }

  private _renderWarmup() {
    const t = this._t;
    const lead = this.config?.parameters?.warmup_lead_min ?? 60;
    const valid = parseTime(this._arrive) !== null;
    const warm = warmupLabel(this.status, t);
    return html`
      <p class="muted">${t("warmup.intro")}</p>
      ${warm
        ? html`<div class="now">
            <span>${warm}</span>
            <button class="danger" ?disabled=${this._busy} @click=${() => this._warmup({ cancel: true })}>${t("warmup.cancel")}</button>
          </div>`
        : nothing}
      <h4>${t("cold.title")}</h4>
      <div class="opts">
        <button class="opt" ?disabled=${this._busy} @click=${() => this._warmup({ cold: true })}>${t("cold.button")}</button>
      </div>
      <div class="hint">${t("cold.hint")}</div>
      <h4>${t("warmup.now")}</h4>
      <div class="opts">
        ${WARMUP_MINUTES.map(
          (m) => html`<button class="opt" ?disabled=${this._busy} @click=${() => this._warmup({ minutes: m })}>${t("warmup.for", { time: m % 60 ? `${m} min` : `${m / 60} h` })}</button>`,
        )}
      </div>
      <h4>${t("warmup.arrive")}</h4>
      <form
        class="arrive"
        @submit=${(e: Event) => {
          e.preventDefault();
          if (valid) void this._warmup({ arrive: this._arrive });
        }}
      >
        <input
          inputmode="numeric"
          maxlength="5"
          placeholder="18:30"
          aria-label=${t("warmup.arrive")}
          class=${valid ? "" : "invalid"}
          .value=${this._arrive}
          @input=${(e: Event) => (this._arrive = (e.target as HTMLInputElement).value)}
          @change=${(e: Event) => (this._arrive = normalizeTimeInput((e.target as HTMLInputElement).value))}
        />
        <button class="primary" type="submit" ?disabled=${this._busy || !valid}>${t("warmup.plan")}</button>
      </form>
      <div class="hint">${t("warmup.arrive_hint", { lead: String(lead) })}</div>
    `;
  }

  private _renderPause() {
    const t = this._t;
    const until = this.status?.overrides?.pause_until;
    return html`
      <p class="muted">${t("pause.intro")}</p>
      ${until
        ? html`<div class="now">
            <span>${t("actions.pause_active", { time: formatStamp(until, this.status?.now, this.lang) })}</span>
            <button class="danger" ?disabled=${this._busy} @click=${() => this._run(() => setPause(this.hass, 0))}>${t("pause.cancel")}</button>
          </div>`
        : nothing}
      <div class="opts">
        ${PAUSE_MINUTES.map(
          (m) => html`<button class="opt" ?disabled=${this._busy} @click=${() => this._run(() => setPause(this.hass, m))}>${t("pause.for", { h: String(m / 60) })}</button>`,
        )}
      </div>
    `;
  }

  private _renderScene() {
    const t = this._t;
    const st = this.status;
    const current = st?.scene;
    const isOverride = current?.source === "override";
    const scenes = this.config?.scenes ?? [];
    return html`
      <p class="muted">${t("scene.override_hint")}</p>
      <div class="list">
        <button class="item ${!isOverride ? "sel" : ""}" ?disabled=${this._busy} @click=${() => this._run(() => setOverride(this.hass, null))}>
          <ha-icon icon="mdi:calendar-clock"></ha-icon><span>${t("scene.auto")}<small>${t("scene.auto_hint")}</small></span>
        </button>
        ${scenes.map(
          (s) => html`<button
            class="item ${isOverride && current?.id === s.id ? "sel" : ""}"
            ?disabled=${this._busy}
            @click=${() => this._run(() => setOverride(this.hass, s.id, 180))}
          >
            <ha-icon icon=${s.icon || "mdi:palette-outline"}></ha-icon><span>${s.name}</span>
          </button>`,
        )}
      </div>
      <h4>${t("more.title")}</h4>
      <div class="opts">
        <button class="opt" ?disabled=${this._busy} @click=${() => this._run(() => setBoost(this.hass, 1, 60))}>
          <ha-icon icon="mdi:thermometer-plus"></ha-icon>${t("actions.boost")}
        </button>
        ${hasOverrides(st)
          ? html`<button class="opt" ?disabled=${this._busy} title=${t("actions.clear_hint")} @click=${() => this._run(() => clearOverrides(this.hass, st))}>
              <ha-icon icon="mdi:undo-variant"></ha-icon>${t("actions.clear_all")}
            </button>`
          : nothing}
      </div>
    `;
  }

  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      .main {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 8px;
      }
      button.big {
        flex-direction: column;
        justify-content: center;
        gap: 4px;
        min-height: 64px;
        border-radius: 14px;
        padding: 8px 6px;
        text-align: center;
        background: var(--wr-input-bg);
        border-color: transparent;
        font-weight: 500;
        line-height: 1.2;
      }
      button.big ha-icon {
        --mdc-icon-size: 24px;
      }
      button.big.heat {
        color: var(--wr-heat);
      }
      button.big.on {
        background: color-mix(in srgb, var(--wr-heat) 16%, transparent);
        border-color: var(--wr-heat);
      }
      .compact button.big {
        min-height: 52px;
        font-size: 13px;
      }
      .compact button.big ha-icon {
        --mdc-icon-size: 20px;
      }
      .two {
        display: flex;
        flex-direction: column;
        min-width: 0;
        max-width: 100%;
      }
      .two span,
      .two small {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .two small {
        font-weight: 400;
        color: var(--wr-text2);
        font-size: 11px;
      }
      .active {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 8px;
      }
      .pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        border-radius: 16px;
        padding: 2px 2px 2px 10px;
        background: rgba(127, 127, 127, 0.15);
      }
      .pill.heat {
        background: color-mix(in srgb, var(--wr-heat) 18%, transparent);
      }
      .pill ha-icon {
        --mdc-icon-size: 16px;
      }
      .pill button.x {
        min-height: 26px;
        min-width: 26px;
        padding: 0;
        justify-content: center;
        border: 0;
        border-radius: 50%;
      }
      dialog {
        border: 0;
        padding: 0;
        background: transparent;
        max-width: min(440px, calc(100vw - 24px));
        width: 100%;
        color: var(--wr-text);
      }
      dialog::backdrop {
        background: rgba(0, 0, 0, 0.45);
      }
      .sheet {
        background: var(--wr-card);
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }
      .sheet .head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 4px;
      }
      .sheet .head h3 {
        margin: 0;
        font-size: 18px;
      }
      .sheet p {
        margin: 0 0 8px;
      }
      .sheet h4 {
        margin: 14px 0 8px;
      }
      .opts {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      button.opt {
        min-height: 44px;
        padding: 6px 16px;
      }
      .arrive {
        display: flex;
        gap: 8px;
      }
      .arrive input {
        max-width: 110px;
        font-size: 18px;
        text-align: center;
      }
      .now {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        flex-wrap: wrap;
        padding: 8px 10px;
        border-radius: 10px;
        background: color-mix(in srgb, var(--wr-heat) 12%, transparent);
        margin-bottom: 4px;
      }
      .list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .list .item {
        justify-content: flex-start;
        border-radius: 10px;
        border-color: transparent;
        min-height: 44px;
        text-align: left;
      }
      .list .item span {
        display: flex;
        flex-direction: column;
      }
      .list .item small {
        color: var(--wr-text2);
        font-size: 12px;
      }
      .list .item.sel {
        background: color-mix(in srgb, var(--wr-heat) 16%, transparent);
        border-color: var(--wr-heat);
      }
      .error-text {
        margin-top: 8px;
        font-size: 13px;
      }
    `,
  ];
}

/** Registrieren; `window.customElements` erst beim Aufruf lesen (siehe card.ts). */
export function defineControls(): void {
  const registry = window.customElements;
  if (!registry.get("wr-controls")) registry.define("wr-controls", WrControls);
}

declare global {
  interface HTMLElementTagNameMap {
    "wr-controls": WrControls;
  }
}
