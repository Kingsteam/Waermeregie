// <waermeregie-feedback-card>: drei große Knöpfe „Zu kalt / Passt / Zu warm“ für ein Tablet.
// Der Raum steht fest in der Karten-Konfiguration; nach dem Tippen kommt eine Bestätigung.
import { LitElement, css, html, nothing } from "lit";
import { sendFeedback, type FeedbackKind } from "./api";
import { translator, type Lang, type T } from "./i18n";
import { baseStyles } from "./styles";
import type { Hass } from "./types";
import { errorMessage, pickLang } from "./util";

export interface FeedbackCardConfig {
  type: string;
  /** Raum-ID oder Raumname wie in der Wärmeregie; leer = ganzes Haus */
  room?: string;
  /** Überschrift (Standard: „Wie ist es hier gerade?“) */
  title?: string;
  /** Quelle fürs Protokoll, z. B. „Tablet Küche“ */
  source?: string;
}

/** So lange bleibt die Bestätigung stehen (ms). */
export const NOTE_MS = 6000;

const KINDS: { kind: FeedbackKind; icon: string }[] = [
  { kind: "cold", icon: "mdi:snowflake" },
  { kind: "ok", icon: "mdi:check-circle-outline" },
  { kind: "warm", icon: "mdi:white-balance-sunny" },
];

export class WaermeregieFeedbackCard extends LitElement {
  static override properties = {
    hass: { attribute: false },
    _config: { state: true },
    _busy: { state: true },
    _done: { state: true },
    _error: { state: true },
  };

  declare hass: Hass;
  declare _config: FeedbackCardConfig;
  declare _busy: boolean;
  declare _done: FeedbackKind | null;
  declare _error: string | null;
  private _timer: number | undefined;

  constructor() {
    super();
    this._config = { type: "custom:waermeregie-feedback-card" };
    this._busy = false;
    this._done = null;
    this._error = null;
  }

  static getStubConfig(): Partial<FeedbackCardConfig> {
    return { room: "" };
  }

  setConfig(config: FeedbackCardConfig) {
    if (!config || typeof config !== "object") throw new Error("Invalid configuration");
    if (config.room !== undefined && typeof config.room !== "string") throw new Error("room: text expected");
    this._config = { ...config };
  }

  getCardSize(): number {
    return 2;
  }

  getGridOptions() {
    return { columns: 12, rows: 2, min_columns: 6, min_rows: 2 };
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this._timer);
  }

  private get _lang(): Lang {
    return pickLang(this.hass?.locale?.language ?? this.hass?.language);
  }

  private get _t(): T {
    return translator(this._lang);
  }

  private async _give(kind: FeedbackKind) {
    if (this._busy) return;
    this._busy = true;
    this._error = null;
    window.clearTimeout(this._timer);
    try {
      await sendFeedback(this.hass, kind, this._config.room?.trim() || null, this._config.source);
      this._done = kind;
    } catch (e) {
      this._done = null;
      this._error = errorMessage(e);
    } finally {
      this._busy = false;
      this._timer = window.setTimeout(() => {
        this._done = null;
        this._error = null;
      }, NOTE_MS);
    }
  }

  protected override render() {
    const t = this._t;
    const room = !!this._config.room?.trim();
    const note = this._done ? t(`feedback.done_${room ? "room" : "house"}_${this._done}` as const) : null;
    return html`<ha-card>
      <div class="wrap">
        <div class="title">${this._config.title || t(room ? "fbcard.title_room" : "fbcard.title_house")}</div>
        <div class="btns">
          ${KINDS.map(
            ({ kind, icon }) =>
              html`<button class="fb ${kind} ${this._done === kind ? "on" : ""}" ?disabled=${this._busy} @click=${() => void this._give(kind)}>
                <ha-icon icon=${icon}></ha-icon><span>${t(`feedback.${kind}` as const)}</span>
              </button>`,
          )}
        </div>
        ${note ? html`<div class="note" role="status"><ha-icon icon="mdi:check"></ha-icon> ${note}</div>` : nothing}
        ${this._error ? html`<div class="note err" role="alert">${this._error}</div>` : nothing}
      </div>
    </ha-card>`;
  }

  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        height: 100%;
      }
      ha-card {
        height: 100%;
        box-sizing: border-box;
      }
      .wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px 14px;
        height: 100%;
        box-sizing: border-box;
      }
      .title {
        font-size: 14px;
        color: var(--wr-text2);
      }
      .btns {
        display: flex;
        gap: 10px;
        flex: 1;
      }
      .fb {
        flex: 1 1 0;
        min-width: 0;
        min-height: 56px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        font-size: 15px;
        white-space: nowrap;
      }
      .fb ha-icon {
        --mdc-icon-size: 26px;
      }
      .fb.cold ha-icon {
        color: var(--wr-cold);
      }
      .fb.ok ha-icon {
        color: var(--wr-ok);
      }
      .fb.warm ha-icon {
        color: var(--wr-heat);
      }
      .fb.on {
        border-color: var(--wr-primary);
        background: color-mix(in srgb, var(--wr-primary) 14%, transparent);
      }
      .note {
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .note ha-icon {
        --mdc-icon-size: 18px;
        color: var(--wr-ok);
        flex: none;
      }
      .note.err {
        color: var(--wr-err);
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "waermeregie-feedback-card": WaermeregieFeedbackCard;
  }
}
