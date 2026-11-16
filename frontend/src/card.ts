// <waermeregie-card>: kompakte Lovelace-Karte (Szene, Ofen mit Tageszeitleiste, Räume, Hinweise, Schnellaktionen).
import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { clearOverrides, loadConfig, setBoost, setOverride, setPause, subscribeStatus } from "./api";
import { translator, type Lang } from "./i18n";
import { baseStyles } from "./styles";
import type { Config, Hass, Status } from "./types";
import { errorMessage, normalizeConfig, pickLang } from "./util";
import { renderAlerts, renderQuickActions, renderRooms, renderSceneChips, renderShadowBanner, renderStove, type ViewCtx } from "./views";

export interface CardConfig {
  type: string;
  title?: string;
  /** Raum-IDs, die gezeigt werden sollen (leer = alle) */
  rooms?: string[];
  /** Schnellaktionen anzeigen (Standard: ja) */
  show_actions?: boolean;
}

export class WaermeregieCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _status: { state: true },
    _wrConfig: { state: true },
    _error: { state: true },
    _busy: { state: true },
  };

  declare hass: Hass;
  declare _config: CardConfig;
  declare _status: Status | null;
  declare _wrConfig: Config | null;
  declare _error: string | null;
  declare _busy: boolean;

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
    const rooms = this._config?.rooms?.length ?? this._status?.rooms?.length ?? 2;
    return 4 + Math.ceil(rooms / 2);
  }

  private get _lang(): Lang {
    return pickLang(this.hass?.locale?.language ?? this.hass?.language);
  }

  override connectedCallback() {
    super.connectedCallback();
    if (this.hass) this._ensure();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
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
    }
    if (!this._wrConfig && !this._configLoading) {
      this._configLoading = true;
      loadConfig(this.hass)
        .then((r) => (this._wrConfig = normalizeConfig(r.config)))
        .catch((e) => (this._error = errorMessage(e)))
        .finally(() => (this._configLoading = false));
    }
  }

  private async _action(fn: () => Promise<Status | null>) {
    this._busy = true;
    try {
      const s = await fn();
      if (s && typeof s === "object" && "mode" in s) this._status = s;
      this._error = null;
    } catch (e) {
      this._error = errorMessage(e);
    } finally {
      this._busy = false;
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
    const title = this._config.title ?? t("card.name");
    return html`<ha-card>
      <div class="wrap">
        <div class="row head">
          <ha-icon icon="mdi:fireplace" style="color:var(--wr-heat)"></ha-icon>
          <span class="title">${title}</span>
        </div>
        ${this._error ? html`<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon><div>${this._error}</div></div>` : nothing}
        ${!this._status
          ? this._error
            ? nothing
            : html`<div class="muted">${t("loading")}</div>`
          : html`
              ${renderShadowBanner(ctx, true)}
              ${this._wrConfig ? renderSceneChips(ctx, (id) => this._action(() => setOverride(this.hass, id, 180))) : nothing}
              ${renderAlerts(ctx)}
              ${renderStove(ctx, { timeline: true, compact: true })}
              ${renderRooms(ctx, this._config.rooms)}
              ${this._config.show_actions === false
                ? nothing
                : renderQuickActions(
                    ctx,
                    {
                      boost: () => this._action(() => setBoost(this.hass, 1, 60)),
                      pause: () => this._action(() => setPause(this.hass, 120)),
                      clear: () => this._action(() => clearOverrides(this.hass, this._status)),
                    },
                    true,
                  )}
            `}
      </div>
    </ha-card>`;
  }

  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      ha-card {
        display: block;
        overflow: hidden;
      }
      .wrap {
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .head .title {
        font-size: 18px;
        font-weight: 500;
      }
      .card {
        padding: 12px;
      }
      .grid {
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
        gap: 8px;
      }
      .room .temp {
        font-size: 20px;
      }
      .stove .phase {
        font-size: 16px;
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
  const registry = window.customElements;
  if (!registry.get("waermeregie-card")) registry.define("waermeregie-card", WaermeregieCard);
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
}
