// Eigene Entitätsauswahl (keine internen HA-Elemente): Suchfeld, Trefferliste, Chips.
import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { filterEntities, friendlyName, type EntityOption } from "../entities";
import { translator, type Lang } from "../i18n";
import { baseStyles } from "../styles";
import type { Hass } from "../types";

const MAX_RESULTS = 50;

export class WrEntityPicker extends LitElement {
  static override properties = {
    hass: { attribute: false },
    value: { attribute: false },
    multiple: { type: Boolean },
    domains: { attribute: false },
    deviceClasses: { attribute: false },
    exclude: { attribute: false },
    label: { type: String },
    helper: { type: String },
    lang: { type: String },
    disabled: { type: Boolean },
    invalid: { type: Boolean },
    _query: { state: true },
    _open: { state: true },
    _active: { state: true },
    _showAll: { state: true },
  };

  declare hass: Hass | undefined;
  /** Einzelauswahl: string|null, Mehrfachauswahl: string[] */
  declare value: string | string[] | null | undefined;
  declare multiple: boolean;
  declare domains: string[];
  declare deviceClasses: string[] | undefined;
  /** zusätzlich ausblenden (z. B. schon anderswo gewählt) */
  declare exclude: string[] | undefined;
  declare label: string;
  declare helper: string;
  declare lang: Lang;
  declare disabled: boolean;
  declare invalid: boolean;
  declare _query: string;
  declare _open: boolean;
  declare _active: number;
  declare _showAll: boolean;

  private _uid = `wrp${Math.random().toString(36).slice(2, 8)}`;
  private _closeTimer: number | undefined;

  constructor() {
    super();
    this.multiple = false;
    this.domains = [];
    this.label = "";
    this.helper = "";
    this.lang = "de";
    this.disabled = false;
    this.invalid = false;
    this._query = "";
    this._open = false;
    this._active = 0;
    this._showAll = false;
  }

  private get _selected(): string[] {
    const v = this.value;
    if (Array.isArray(v)) return v;
    return v ? [v] : [];
  }

  private _results(): { list: EntityOption[]; more: boolean } {
    const all = filterEntities(this.hass?.states, {
      domains: this.domains,
      deviceClasses: this._showAll ? undefined : this.deviceClasses,
      query: this._query,
      exclude: [...this._selected, ...(this.exclude ?? [])],
      limit: MAX_RESULTS + 1,
    });
    return { list: all.slice(0, MAX_RESULTS), more: all.length > MAX_RESULTS };
  }

  private _emit(value: string | string[] | null) {
    this.value = value;
    this.dispatchEvent(new CustomEvent("value-changed", { detail: { value }, bubbles: true, composed: true }));
  }

  private _pick(id: string) {
    if (this.multiple) {
      this._emit([...this._selected, id]);
      this._query = "";
      this._active = 0;
      this.renderRoot.querySelector<HTMLInputElement>("input.search")?.focus();
    } else {
      this._emit(id);
      this._query = "";
      this._open = false;
    }
  }

  private _remove(id: string) {
    if (this.multiple) this._emit(this._selected.filter((e) => e !== id));
    else this._emit(null);
  }

  private _onKey(ev: KeyboardEvent, list: EntityOption[]) {
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      this._open = true;
      this._active = Math.min(this._active + 1, Math.max(list.length - 1, 0));
    } else if (ev.key === "ArrowUp") {
      ev.preventDefault();
      this._active = Math.max(this._active - 1, 0);
    } else if (ev.key === "Enter") {
      if (this._open && list[this._active]) {
        ev.preventDefault();
        this._pick(list[this._active].entity_id);
      }
    } else if (ev.key === "Escape") {
      this._open = false;
    }
  }

  protected override updated(changed: PropertyValues) {
    if (changed.has("_active") && this._open) {
      this.renderRoot.querySelector(`#${this._uid}-${this._active}`)?.scrollIntoView({ block: "nearest" });
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.clearTimeout(this._closeTimer);
  }

  protected override render() {
    const t = translator(this.lang);
    const selected = this._selected;
    const showInput = this.multiple || selected.length === 0 || this._open;
    const { list, more } = this._open ? this._results() : { list: [], more: false };
    const active = Math.min(this._active, Math.max(list.length - 1, 0));
    return html`
      ${this.label ? html`<span class="lbl" id="${this._uid}-l">${this.label}</span>` : nothing}
      ${this.helper ? html`<div class="hint">${this.helper}</div>` : nothing}
      ${selected.length
        ? html`<div class="sel">
            ${selected.map((id) => {
              const missing = !this.hass?.states?.[id];
              return html`<span class="pchip ${missing ? "missing" : ""}">
                <span class="txt">
                  <span class="n">${friendlyName(this.hass?.states, id)}</span>
                  <span class="id">${id}${missing ? html` · ${t("picker.missing")}` : nothing}</span>
                </span>
                ${this.disabled
                  ? nothing
                  : html`<button class="icon x" title=${t("remove")} aria-label="${t("remove")}: ${id}" @click=${() => this._remove(id)}>
                      <ha-icon icon="mdi:close"></ha-icon>
                    </button>`}
                ${!this.multiple && !this.disabled
                  ? html`<button class="icon x" title=${t("picker.search")} aria-label=${t("picker.search")} @click=${() => this._focusSearch()}>
                      <ha-icon icon="mdi:pencil"></ha-icon>
                    </button>`
                  : nothing}
              </span>`;
            })}
          </div>`
        : nothing}
      ${showInput && !this.disabled
        ? html`<div class="combo">
            <input
              class="search ${this.invalid ? "invalid" : ""}"
              type="search"
              role="combobox"
              autocomplete="off"
              aria-labelledby=${this.label ? `${this._uid}-l` : nothing}
              aria-expanded=${this._open}
              aria-controls="${this._uid}-list"
              aria-activedescendant=${this._open && list.length ? `${this._uid}-${active}` : nothing}
              placeholder=${t("picker.search")}
              .value=${this._query}
              @input=${(e: Event) => {
                this._query = (e.target as HTMLInputElement).value;
                this._open = true;
                this._active = 0;
              }}
              @focus=${() => {
                window.clearTimeout(this._closeTimer);
                this._open = true;
              }}
              @blur=${() => {
                this._closeTimer = window.setTimeout(() => (this._open = false), 180);
              }}
              @keydown=${(e: KeyboardEvent) => this._onKey(e, list)}
            />
            ${this._open
              ? html`<div class="pop" @mousedown=${(e: Event) => e.preventDefault()}>
                  ${this.deviceClasses?.length
                    ? html`<label class="all"
                        ><input
                          type="checkbox"
                          .checked=${this._showAll}
                          @change=${(e: Event) => (this._showAll = (e.target as HTMLInputElement).checked)}
                        />${t("picker.show_all")}</label
                      >`
                    : nothing}
                  <ul id="${this._uid}-list" role="listbox">
                    ${list.length
                      ? list.map(
                          (o, i) => html`<li
                            id="${this._uid}-${i}"
                            role="option"
                            aria-selected=${i === active}
                            class=${i === active ? "active" : ""}
                            @click=${() => this._pick(o.entity_id)}
                            @mouseenter=${() => (this._active = i)}
                          >
                            <span class="n">${o.name}</span><span class="id">${o.entity_id}</span>
                          </li>`,
                        )
                      : html`<li class="empty">${t("picker.no_results")}</li>`}
                    ${more ? html`<li class="empty">${t("picker.more")}</li>` : nothing}
                  </ul>
                </div>`
              : nothing}
          </div>`
        : nothing}
    `;
  }

  private async _focusSearch() {
    this._open = true;
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLInputElement>("input.search")?.focus();
  }

  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
        margin-bottom: 12px;
      }
      .sel {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-bottom: 6px;
      }
      .pchip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        max-width: 100%;
        border: 1px solid var(--wr-div);
        border-radius: 10px;
        padding: 2px 2px 2px 10px;
        background: var(--wr-input-bg);
      }
      .pchip.missing {
        border-color: var(--wr-warn);
      }
      .pchip .txt {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .n {
        overflow-wrap: anywhere;
      }
      .id {
        font-size: 11px;
        color: var(--wr-text2);
        overflow-wrap: anywhere;
      }
      button.x {
        min-height: 30px;
        min-width: 30px;
      }
      button.x ha-icon {
        --mdc-icon-size: 16px;
      }
      .combo {
        position: relative;
      }
      .pop {
        position: absolute;
        z-index: 5;
        left: 0;
        right: 0;
        top: calc(100% + 2px);
        background: var(--wr-card);
        border: 1px solid var(--wr-div);
        border-radius: 8px;
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
        max-height: 280px;
        overflow-y: auto;
      }
      .all {
        display: flex;
        gap: 6px;
        align-items: center;
        font-size: 12px;
        padding: 6px 10px;
        border-bottom: 1px solid var(--wr-div);
        color: var(--wr-text2);
      }
      .all input {
        width: auto;
        min-height: 0;
      }
      ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      li {
        display: flex;
        flex-direction: column;
        padding: 6px 10px;
        cursor: pointer;
      }
      li.active {
        background: color-mix(in srgb, var(--wr-primary) 16%, transparent);
      }
      li.empty {
        cursor: default;
        color: var(--wr-text2);
      }
    `,
  ];
}

if (!customElements.get("wr-entity-picker")) customElements.define("wr-entity-picker", WrEntityPicker);

declare global {
  interface HTMLElementTagNameMap {
    "wr-entity-picker": WrEntityPicker;
  }
}
