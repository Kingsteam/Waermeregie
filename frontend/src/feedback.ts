// <wr-feedback>: Rückmeldung „Zu kalt / Passt / Zu warm“ fürs ganze Haus oder einen Raum
// und die Vorschläge, die daraus entstehen (Annehmen / Anpassen / Nein danke).
// Gemeinsam für Panel und Dashboard-Karte. Meldet neuen Status als Ereignis `wr-status`.
import { LitElement, css, html, nothing } from "lit";
import { answerSuggestion, sendFeedback, type FeedbackKind } from "./api";
import { translator, type Lang, type T } from "./i18n";
import { baseStyles } from "./styles";
import type { Hass, Status, Suggestion } from "./types";
import { errorMessage, formatNumber, normalizeTimeInput, parseTime } from "./util";

/** Eingabe beim „Anpassen“ prüfen: Uhrzeit (HH:MM) oder Temperatur. null = ungültig. */
export function adjustValue(s: Suggestion, raw: string): string | number | null {
  if (s.type === "ai_rule") return null;
  if (s.type === "ai_change" && typeof s.to === "number") {
    const n = Number(raw.replace(",", ".").trim());
    const ok = raw.trim() !== "" && Number.isFinite(n) && n >= (s.min ?? -Infinity) && n <= (s.max ?? Infinity);
    return ok ? n : null;
  }
  if (s.type === "slot_earlier" || s.type === "ai_change") {
    const text = normalizeTimeInput(raw);
    return parseTime(text) === null ? null : text;
  }
  const n = Number(raw.replace(",", ".").trim());
  return raw.trim() !== "" && Number.isFinite(n) && n >= 5 && n <= 28 ? Math.round(n * 2) / 2 : null;
}

export class WrFeedback extends LitElement {
  static override properties = {
    hass: { attribute: false },
    status: { attribute: false },
    lang: { type: String },
    only: { type: String },
    locked: { type: Boolean },
    _scope: { state: true },
    _busy: { state: true },
    _note: { state: true },
    _error: { state: true },
    _edit: { state: true },
    _editValue: { state: true },
  };

  declare hass: Hass;
  declare status: Status | null;
  declare lang: Lang;
  /** "ai" = nur die KI-Vorschläge zeigen, ohne die Rückmelde-Knöpfe */
  declare only: string | null;
  /** Annehmen gesperrt (z. B. solange ungespeicherte Änderungen offen sind) */
  declare locked: boolean;
  /** "" = ganzes Haus, sonst Raum-ID */
  declare _scope: string;
  declare _busy: boolean;
  declare _note: string | null;
  declare _error: string | null;
  declare _edit: string | null;
  declare _editValue: string;

  constructor() {
    super();
    this.status = null;
    this.lang = "de";
    this.only = null;
    this.locked = false;
    this._scope = "";
    this._busy = false;
    this._note = null;
    this._error = null;
    this._edit = null;
    this._editValue = "";
  }

  private get _t(): T {
    return translator(this.lang);
  }

  private get _isAdmin(): boolean {
    return this.hass?.user?.is_admin !== false;
  }

  private async _run(fn: () => Promise<Status>, note: string | null, reload = false) {
    this._busy = true;
    this._error = null;
    this._note = null;
    try {
      const status = await fn();
      this._note = note;
      this._edit = null;
      this.dispatchEvent(new CustomEvent<Status>("wr-status", { detail: status, bubbles: true, composed: true }));
      // Einstellungen haben sich geändert: die Seite soll sie neu laden
      if (reload) this.dispatchEvent(new CustomEvent("wr-reload", { bubbles: true, composed: true }));
    } catch (e) {
      this._error = errorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private _give(kind: FeedbackKind) {
    const t = this._t;
    const room = this._scope || null;
    const key = room ? (`feedback.done_room_${kind}` as const) : (`feedback.done_house_${kind}` as const);
    void this._run(() => sendFeedback(this.hass, kind, room), t(key));
  }

  private _startEdit(s: Suggestion) {
    this._edit = s.id;
    this._editValue = typeof s.to === "number" ? formatNumber(s.to, this.lang, 1) : String(s.to ?? "");
  }

  private _renderSuggestion(s: Suggestion) {
    const t = this._t;
    const editing = this._edit === s.id;
    const value = editing ? adjustValue(s, this._editValue) : null;
    const ai = s.type === "ai_change" || s.type === "ai_rule";
    const isTime = s.type === "slot_earlier" || (s.type === "ai_change" && typeof s.to === "string");
    const accepted = t(ai ? "feedback.accepted_ai" : "feedback.accepted");
    return html`<div class="sugg" role="group" aria-label=${t("feedback.suggestion")}>
      <ha-icon icon=${ai ? "mdi:creation-outline" : "mdi:lightbulb-on-outline"}></ha-icon>
      <div class="stext">
        <div class="slabel">${t(ai ? "feedback.suggestion_ai" : "feedback.suggestion")}</div>
        <div>${s.text}</div>
        ${this._isAdmin
          ? editing
            ? html`<form
                class="row"
                @submit=${(e: Event) => {
                  e.preventDefault();
                  if (value !== null) void this._run(() => answerSuggestion(this.hass, s.id, "accept", value), accepted, true);
                }}
              >
                <label>
                  ${isTime
                    ? t("feedback.adjust_time")
                    : ai
                      ? t("feedback.adjust_value", { min: formatNumber(s.min ?? 0, this.lang, 1), max: formatNumber(s.max ?? 0, this.lang, 1) })
                      : t("feedback.adjust_temp")}
                  <input
                    type="text"
                    inputmode=${isTime ? "numeric" : "decimal"}
                    .value=${this._editValue}
                    class=${value === null ? "bad" : ""}
                    @input=${(e: Event) => (this._editValue = (e.target as HTMLInputElement).value)}
                  />
                </label>
                <button class="primary" type="submit" ?disabled=${this._busy || value === null}>${t("feedback.apply")}</button>
                <button type="button" ?disabled=${this._busy} @click=${() => (this._edit = null)}>${t("cancel")}</button>
              </form>`
            : html`<div class="row">
                <button class="primary" ?disabled=${this._busy || this.locked} @click=${() => this._run(() => answerSuggestion(this.hass, s.id, "accept"), accepted, true)}>
                  ${t("feedback.accept")}
                </button>
                ${s.type === "ai_rule"
                  ? nothing
                  : html`<button ?disabled=${this._busy || this.locked} @click=${() => this._startEdit(s)}>${t("feedback.adjust")}</button>`}
                <button ?disabled=${this._busy} @click=${() => this._run(() => answerSuggestion(this.hass, s.id, "dismiss"), t("feedback.dismissed"))}>
                  ${t("feedback.dismiss")}
                </button>
              </div>`
          : html`<div class="hint">${t("feedback.admin_only")}</div>`}
      </div>
    </div>`;
  }

  protected override render() {
    const t = this._t;
    const rooms = this.status?.rooms ?? [];
    const all = this.status?.feedback?.suggestions ?? [];
    const suggestions = this.only === "ai" ? all.filter((s) => s.type.startsWith("ai_")) : all;
    if (this.only === "ai")
      return html`${suggestions.map((s) => this._renderSuggestion(s))}
        ${this.locked && suggestions.length ? html`<div class="hint">${t("feedback.locked")}</div>` : nothing}
        ${this._note ? html`<div class="hint" role="status">${this._note}</div>` : nothing}
        ${this._error ? html`<div class="hint err" role="alert">${this._error}</div>` : nothing}`;
    return html`
      ${suggestions.map((s) => this._renderSuggestion(s))}
      <div class="bar">
        <label class="scope">
          <span>${t("feedback.title")}</span>
          <select .value=${this._scope} @change=${(e: Event) => (this._scope = (e.target as HTMLSelectElement).value)}>
            <option value="">${t("feedback.house")}</option>
            ${rooms.map((r) => html`<option value=${r.id} ?selected=${this._scope === r.id}>${r.name}</option>`)}
          </select>
        </label>
        <div class="btns">
          <button class="fb cold" ?disabled=${this._busy} @click=${() => this._give("cold")}>
            <ha-icon icon="mdi:snowflake"></ha-icon><span>${t("feedback.cold")}</span>
          </button>
          <button class="fb ok" ?disabled=${this._busy} @click=${() => this._give("ok")}>
            <ha-icon icon="mdi:check"></ha-icon><span>${t("feedback.ok")}</span>
          </button>
          <button class="fb warm" ?disabled=${this._busy} @click=${() => this._give("warm")}>
            <ha-icon icon="mdi:white-balance-sunny"></ha-icon><span>${t("feedback.warm")}</span>
          </button>
        </div>
      </div>
      ${this._note ? html`<div class="hint" role="status">${this._note}</div>` : nothing}
      ${this._error ? html`<div class="hint err" role="alert">${this._error}</div>` : nothing}
    `;
  }

  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }
      .bar {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 10px 14px;
      }
      .scope {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        color: var(--wr-text2);
        flex: 1 1 150px;
      }
      .btns {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        flex: 3 1 270px;
      }
      .fb {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        min-height: var(--wr-touch, 44px);
        flex: 1 1 0;
        min-width: 0;
        padding-left: 6px;
        padding-right: 6px;
        justify-content: center;
        white-space: nowrap;
      }
      .fb ha-icon {
        --mdc-icon-size: 18px;
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
      .hint {
        margin-top: 8px;
        font-size: 13px;
        color: var(--wr-text2);
      }
      .hint.err {
        color: var(--wr-err);
      }
      .sugg {
        display: flex;
        gap: 10px;
        padding: 12px;
        margin-bottom: 12px;
        border: 2px solid var(--wr-accent);
        border-radius: var(--wr-radius);
        background: color-mix(in srgb, var(--wr-accent) 8%, transparent);
      }
      .sugg > ha-icon {
        color: var(--wr-accent);
        flex: none;
      }
      .stext {
        flex: 1;
        min-width: 0;
      }
      .slabel {
        font-size: 12px;
        color: var(--wr-text2);
        margin-bottom: 2px;
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        gap: 8px;
        margin-top: 10px;
      }
      .row label {
        display: flex;
        flex-direction: column;
        gap: 4px;
        font-size: 13px;
        color: var(--wr-text2);
      }
      .row input {
        width: 90px;
      }
      input.bad {
        border-color: var(--wr-err);
      }
    `,
  ];
}

export function defineFeedback(): void {
  const registry = window.customElements;
  if (!registry.get("wr-feedback")) registry.define("wr-feedback", WrFeedback);
}

declare global {
  interface HTMLElementTagNameMap {
    "wr-feedback": WrFeedback;
  }
}
