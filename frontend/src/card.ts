// <waermeregie-card>: kompakte Lovelace-Karte (Haus-Kopf, Knöpfe, Verlauf, Pellets, Räume).
import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { loadConfig, loadHistory, pelletsRefill, subscribeStatus } from "./api";
import { defineControls } from "./controls";
import { defineFeedback } from "./feedback";
import { WaermeregieFeedbackCard } from "./feedback-card";
import { artStyles, chartStyles, renderTrendChart, tankStyles } from "./graphics";
import { overviewStyles, renderAlertStrip, renderHeroHead, renderPellets, renderRoomTiles } from "./overview";
import { translator, type Lang } from "./i18n";
import { baseStyles } from "./styles";
import type { Config, Hass, HistoryPoint, Status } from "./types";
import { errorMessage, formatNumber, normalizeConfig, pickLang } from "./util";
import { renderShadowBanner, type ViewCtx } from "./views";

export interface CardConfig {
  type: string;
  title?: string;
  /** Raum-IDs, die gezeigt werden sollen (leer = alle) */
  rooms?: string[];
  /** Knöpfe Aufheizen/Szene/Pause anzeigen (Standard: ja) */
  show_actions?: boolean;
  /** Temperaturverlauf anzeigen (Standard: ja) */
  chart?: boolean;
  /** Pellet-Füllstand anzeigen (Standard: ja) */
  show_pellets?: boolean;
  /** Räume anzeigen (Standard: ja) */
  show_rooms?: boolean;
  show_feedback?: boolean;
}

export class WaermeregieCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _status: { state: true },
    _wrConfig: { state: true },
    _error: { state: true },
    _busy: { state: true },
    _refillNote: { state: true },
    _history: { state: true },
  };

  declare hass: Hass;
  declare _config: CardConfig;
  declare _status: Status | null;
  declare _wrConfig: Config | null;
  declare _error: string | null;
  declare _busy: boolean;
  declare _refillNote: string | null;
  private _refillTimer: number | undefined;
  declare _history: HistoryPoint[] | null;
  private _historyTimer: number | undefined;

  private _unsub: (() => void) | null = null;
  private _connection: unknown = null;
  private _configLoading = false;

  constructor() {
    super();
    this._config = { type: "custom:waermeregie-card" };
    this._status = null;
    this._wrConfig = null;
    this._error = null;
    this._busy = false;
    this._refillNote = null;
    this._history = null;
  }

  static getStubConfig(): Partial<CardConfig> {
    return {};
  }

  setConfig(config: CardConfig) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.rooms !== undefined && !Array.isArray(config.rooms)) throw new Error("rooms: list of room ids expected");
    this._config = { ...config };
  }

  getCardSize(): number {
    const rooms = this._config?.show_rooms === false ? 0 : (this._config?.rooms?.length ?? this._status?.rooms?.length ?? 2);
    return 5 + (this._config?.chart === false ? 0 : 2) + Math.ceil(rooms / 2);
  }

  private get _lang(): Lang {
    return pickLang(this.hass?.locale?.language ?? this.hass?.language);
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.hass) this._ensure();
    this._historyTimer = window.setInterval(() => void this._loadHistory(), 10 * 60 * 1000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.clearInterval(this._historyTimer);
    window.clearTimeout(this._refillTimer);
    this._unsub?.();
    this._unsub = null;
    this._connection = null;
  }

  protected override willUpdate(changed: PropertyValues) {
    if (changed.has("hass") && this.hass) this._ensure();
  }

  private _ensure() {
    if (!this.isConnected || !this.hass?.connection) return;
    if (this._connection !== this.hass.connection) {
      this._unsub?.();
      this._connection = this.hass.connection;
      this._unsub = subscribeStatus(
        this.hass,
        (s) => {
          this._status = s;
          this._error = null;
        },
        (e) => (this._error = errorMessage(e)),
      );
      void this._loadHistory();
    }
    if (!this._wrConfig && !this._configLoading) {
      this._configLoading = true;
      loadConfig(this.hass)
        .then((r) => (this._wrConfig = normalizeConfig(r.config)))
        .catch((e) => (this._error = errorMessage(e)))
        .finally(() => (this._configLoading = false));
    }
  }

  /** „Sack nachgefüllt“ direkt auf dem Tablet; darf jeder Benutzer (auch ohne Verwalterrechte). */
  private async _refill() {
    if (this._busy) return;
    this._busy = true;
    const t = translator(this._lang);
    try {
      const s = await pelletsRefill(this.hass);
      if (s && typeof s === "object" && "mode" in s) this._status = s;
      const kg = s?.pellets?.stock_kg;
      this._refillNote = t("pellets.refill_done_kg", { kg: kg == null ? "?" : formatNumber(kg, this._lang, 1) });
    } catch (e) {
      this._refillNote = errorMessage(e);
    } finally {
      this._busy = false;
      window.clearTimeout(this._refillTimer);
      this._refillTimer = window.setTimeout(() => (this._refillNote = null), 8000);
    }
  }

  private async _loadHistory() {
    if (this._config?.chart === false || !this.hass?.connection) return;
    try {
      this._history = await loadHistory(this.hass, 24);
    } catch {
      this._history = null;
    }
  }

  protected override render() {
    const t = translator(this._lang);
    const ctx: ViewCtx = {
      t,
      lang: this._lang,
      status: this._status,
      config: this._wrConfig,
      isAdmin: this.hass?.user?.is_admin !== false,
      busy: this._busy,
    };
    const c = this._config;
    return html`<ha-card>
      <div class="wrap">
        ${c.title ? html`<div class="head">${c.title}</div>` : nothing}
        ${this._error ? html`<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div>${this._error}</div></div>` : nothing}
        ${!this._status
          ? this._error
            ? nothing
            : html`<div class="muted">${t("loading")}</div>`
          : html`
              ${renderShadowBanner(ctx, true)}
              ${renderHeroHead(ctx, { size: 64 })}
              ${renderAlertStrip(ctx)}
              ${c.show_actions === false
                ? nothing
                : html`<wr-controls
                    compact
                    .hass=${this.hass}
                    .status=${this._status}
                    .config=${this._wrConfig}
                    .lang=${this._lang}
                    @wr-status=${(e: CustomEvent<Status>) => (this._status = e.detail)}
                  ></wr-controls>`}
              ${c.show_feedback === false
                ? nothing
                : html`<wr-feedback
                    style="margin-top:12px"
                    .hass=${this.hass}
                    .status=${this._status}
                    .lang=${this._lang}
                    @wr-status=${(e: CustomEvent<Status>) => (this._status = e.detail)}
                  ></wr-feedback>`}
              ${c.chart !== false && this._history?.length ? renderTrendChart(this._history, t, this._lang, { height: 90, legend: false }) : nothing}
              ${c.show_pellets === false ? nothing : renderPellets(ctx, () => void this._refill(), { compact: true })}
              ${this._refillNote ? html`<div class="refill-note" role="status">${this._refillNote}</div>` : nothing}
              ${c.show_rooms === false ? nothing : renderRoomTiles(ctx, c.rooms)}
            `}
      </div>
    </ha-card>`;
  }

  static override styles = [
    baseStyles,
    artStyles,
    chartStyles,
    tankStyles,
    overviewStyles,
    css`
      :host {
        display: block;
      }
      ha-card {
        display: block;
        overflow: hidden;
      }
      .refill-note {
        margin-top: 6px;
        font-size: 13px;
        color: var(--wr-text2);
      }
      .wrap {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .head {
        font-size: 18px;
        font-weight: 500;
      }
      .hero-temp {
        font-size: 34px;
      }
      .tiles {
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 110px), 1fr));
      }
      .tile {
        padding: 6px 8px;
      }
      .ttemp {
        font-size: 18px;
      }
      .banner {
        padding: 8px 12px;
      }
    `,
  ];
}

/**
 * Erst registrieren, wenn Home Assistant gestartet ist. HA 2026 tauscht beim Start
 * `window.customElements` gegen eine eigene Registry; ein früher registriertes Element
 * landet sonst in der alten und die Karte zeigt „Konfigurationsfehler“.
 * `window.customElements` wird deshalb erst beim Aufruf gelesen.
 */
function defineCard(): void {
  defineControls();
  defineFeedback();
  const registry = window.customElements;
  if (!registry.get("waermeregie-card")) registry.define("waermeregie-card", WaermeregieCard);
  if (!registry.get("waermeregie-feedback-card")) registry.define("waermeregie-feedback-card", WaermeregieFeedbackCard);
}
if (window.customElements.get("home-assistant")) {
  defineCard();
} else {
  window.customElements.whenDefined("home-assistant").then(defineCard, defineCard);
}

interface CustomCardEntry {
  type: string;
  name: string;
  description: string;
  preview?: boolean;
  documentationURL?: string;
}

declare global {
  interface Window {
    customCards?: CustomCardEntry[];
  }
  interface HTMLElementTagNameMap {
    "waermeregie-card": WaermeregieCard;
  }
}

window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "waermeregie-card")) {
  const lang = pickLang(typeof navigator !== "undefined" ? navigator.language : "de");
  const t = translator(lang);
  window.customCards.push({ type: "waermeregie-card", name: t("card.name"), description: t("card.description"), preview: false });
  window.customCards.push({ type: "waermeregie-feedback-card", name: t("fbcard.name"), description: t("fbcard.description"), preview: false });
}
