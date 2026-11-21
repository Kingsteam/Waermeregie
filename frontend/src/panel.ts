// <waermeregie-panel>: Home-Assistant-Custom-Panel (Properties hass, narrow, route, panel).
import { LitElement, html, css, nothing, type PropertyValues } from "lit";
import { loadConfig, loadHistory, pelletsRefill, saveConfig, setMode, subscribeStatus } from "./api";
import { defineControls } from "./controls";
import { defineHistory } from "./history";
import { defineFeedback } from "./feedback";
import { chartStyles, artStyles, renderTrendChart, tankStyles } from "./graphics";
import { overviewStyles, renderAlertStrip, renderHeroHead, renderPellets, renderRoomTiles, renderStoveCard } from "./overview";
import { translator, type I18nKey, type Lang, type T } from "./i18n";
import { baseStyles } from "./styles";
import "./tabs/rooms";
import "./tabs/schedule";
import "./tabs/scenes";
import "./tabs/house";
import { invalidParameters } from "./tabs/house";
import type { Config, Defaults, Hass, HistoryPoint, Mode, Status } from "./types";
import { clone, errorMessage, formatStamp, normalizeConfig, pickLang, sameData, quietValid, sortLogNewestFirst, validateSlots, WEEK_KEYS } from "./util";
import { renderShadowBanner, type ViewCtx } from "./views";

type Tab = "overview" | "rooms" | "schedule" | "scenes" | "house" | "log";
const TABS: { id: Tab; icon: string }[] = [
  { id: "overview", icon: "mdi:view-dashboard-outline" },
  { id: "rooms", icon: "mdi:floor-plan" },
  { id: "schedule", icon: "mdi:calendar-clock" },
  { id: "scenes", icon: "mdi:palette-outline" },
  { id: "house", icon: "mdi:fireplace" },
  { id: "log", icon: "mdi:format-list-bulleted" },
];
const EDITOR_TABS: Tab[] = ["rooms", "schedule", "scenes", "house"];
/** Welche Teile der Einstellungen zu welchem Reiter gehören („rest“ = alles andere). */
const TAB_KEYS: Partial<Record<Tab, (keyof Config)[] | "rest">> = {
  rooms: ["rooms"],
  schedule: ["day_types", "week"],
  scenes: ["scenes"],
  house: "rest",
};
const OWN_KEYS = new Set<string>(["rooms", "day_types", "week", "scenes", "mode"]);

/** Prüft den Entwurf vor dem Speichern; liefert Anzahl der Probleme. */
export function draftProblems(c: Config, defaults: Defaults | null): number {
  let n = 0;
  const sceneIds = c.scenes.map((s) => s.id);
  const dayIds = c.day_types.map((d) => d.id);
  for (const d of c.day_types) {
    n += validateSlots(d.slots, sceneIds).length;
    if (!d.name.trim()) n++;
  }
  for (const r of c.rooms) if (!r.name.trim()) n++;
  for (const s of c.scenes) if (!s.name.trim()) n++;
  for (const k of WEEK_KEYS) if (!c.week[k] || !dayIds.includes(c.week[k] as string)) n++;
  n += invalidParameters(c, defaults).length;
  if (c.notifications && !quietValid(c.notifications)) n++;
  return n;
}

export class WaermeregiePanel extends LitElement {
  static override properties = {
    hass: { attribute: false },
    narrow: { type: Boolean },
    route: { attribute: false },
    panel: { attribute: false },
    _tab: { state: true },
    _saved: { state: true },
    _draft: { state: true },
    _defaults: { state: true },
    _status: { state: true },
    _loadError: { state: true },
    _saving: { state: true },
    _saveMsg: { state: true },
    _busy: { state: true },
    _actionError: { state: true },
    _modeConfirm: { state: true },
    _history: { state: true },
  };

  declare hass: Hass;
  declare narrow: boolean;
  declare route: { prefix?: string; path?: string } | undefined;
  declare panel: unknown;
  declare _tab: Tab;
  declare _saved: Config | null;
  declare _draft: Config | null;
  declare _defaults: Defaults | null;
  declare _status: Status | null;
  declare _loadError: string | null;
  declare _saving: boolean;
  declare _saveMsg: { ok: boolean; text: string } | null;
  declare _busy: boolean;
  declare _actionError: string | null;
  declare _modeConfirm: Mode | null;
  /** Verlauf für die Grafik; null = nicht verfügbar */
  declare _history: HistoryPoint[] | null;
  private _historyTimer: number | undefined;

  private _unsub: (() => void) | null = null;
  private _connection: unknown = null;
  private _loading = false;

  constructor() {
    super();
    this.narrow = false;
    this._tab = "overview";
    this._saved = null;
    this._draft = null;
    this._defaults = null;
    this._status = null;
    this._loadError = null;
    this._saving = false;
    this._saveMsg = null;
    this._busy = false;
    this._actionError = null;
    this._modeConfirm = null;
    this._history = null;
  }

  private get _lang(): Lang {
    return pickLang(this.hass?.locale?.language ?? this.hass?.language);
  }

  private get _t(): T {
    return translator(this._lang);
  }

  private get _isAdmin(): boolean {
    return this.hass?.user?.is_admin !== false;
  }

  private get _dirty(): boolean {
    return !!this._draft && !!this._saved && !sameData(this._draft, this._saved);
  }

  /** Wurde der Bereich dieses Reiters geändert? */
  private _tabDirty(tab: Tab): boolean {
    if (!this._dirty || !this._draft || !this._saved) return false;
    const keys = TAB_KEYS[tab];
    if (!keys) return false;
    const pick = (c: Config) =>
      keys === "rest"
        ? Object.fromEntries(Object.entries(c).filter(([k]) => !OWN_KEYS.has(k)))
        : Object.fromEntries(keys.map((k) => [k, c[k]]));
    return !sameData(pick(this._draft), pick(this._saved));
  }

  private _beforeUnload = (e: BeforeUnloadEvent) => {
    if (this._dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  override connectedCallback() {
    super.connectedCallback();
    window.addEventListener("beforeunload", this._beforeUnload);
    if (this.hass) this._ensureData();
    this._historyTimer = window.setInterval(() => void this._loadHistory(), 10 * 60 * 1000);
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("beforeunload", this._beforeUnload);
    window.clearInterval(this._historyTimer);
    this._unsub?.();
    this._unsub = null;
    this._connection = null;
  }

  protected override willUpdate(changed: PropertyValues) {
    if (changed.has("route") && this.route?.path) {
      const p = this.route.path.replace(/^\//, "").split("/")[0] as Tab;
      if (TABS.some((t) => t.id === p) && p !== this._tab) this._tab = p;
    }
    if (changed.has("hass") && this.hass) this._ensureData();
  }

  private _ensureData() {
    if (!this.isConnected || !this.hass?.connection) return;
    if (this._connection !== this.hass.connection) {
      this._unsub?.();
      this._connection = this.hass.connection;
      this._unsub = subscribeStatus(
        this.hass,
        (s) => (this._status = s),
        (e) => (this._loadError = errorMessage(e)),
      );
      void this._loadHistory();
    }
    if (!this._saved && !this._loading && !this._loadError) void this._load();
  }

  private async _load() {
    this._loading = true;
    try {
      const res = await loadConfig(this.hass);
      this._saved = normalizeConfig(res.config);
      this._draft = clone(this._saved);
      this._defaults = res.defaults ?? {};
      this._loadError = null;
    } catch (e) {
      this._loadError = errorMessage(e) || this._t("load_error");
    } finally {
      this._loading = false;
    }
  }

  private async _loadHistory() {
    if (!this.hass?.connection) return;
    try {
      this._history = await loadHistory(this.hass, 24);
    } catch {
      this._history = null; // ältere Version ohne Verlauf: Grafik ausblenden
    }
  }

  private _retry() {
    this._loadError = null;
    this._connection = null;
    this._unsub?.();
    this._unsub = null;
    this._ensureData();
  }

  private _selectTab(tab: Tab) {
    this._tab = tab;
    this._saveMsg = this._saveMsg?.ok ? null : this._saveMsg;
    const prefix = this.route?.prefix;
    if (prefix) {
      try {
        history.replaceState(history.state, "", `${prefix}/${tab}`);
      } catch {
        /* egal */
      }
    }
  }

  private async _action(fn: () => Promise<Status | null>) {
    this._busy = true;
    this._actionError = null;
    try {
      const s = await fn();
      if (s && typeof s === "object" && "mode" in s) this._status = s;
    } catch (e) {
      this._actionError = errorMessage(e);
    } finally {
      this._busy = false;
    }
  }

  private async _changeMode(mode: Mode) {
    this._modeConfirm = null;
    await this._action(async () => {
      const s = await setMode(this.hass, mode);
      // Betriebsart in gespeicherter Config und Entwurf nachziehen (ohne Entwurf "schmutzig" zu machen)
      if (this._saved) this._saved = { ...this._saved, mode };
      if (this._draft) this._draft = { ...this._draft, mode };
      return s;
    });
  }

  private async _save() {
    if (!this._draft) return;
    this._saving = true;
    this._saveMsg = null;
    const t = this._t;
    try {
      const toSave: Config = { ...clone(this._draft), mode: this._status?.mode ?? this._draft.mode };
      const res = await saveConfig(this.hass, toSave);
      this._saved = normalizeConfig(res?.config ?? toSave);
      this._draft = clone(this._saved);
      this._saveMsg = { ok: true, text: t("editor.save_ok") };
    } catch (e) {
      this._saveMsg = { ok: false, text: t("editor.save_error", { message: errorMessage(e) }) };
    } finally {
      this._saving = false;
    }
  }

  private _discard() {
    if (this._saved) this._draft = clone(this._saved);
    this._saveMsg = null;
  }

  private _menu() {
    this.dispatchEvent(new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }));
  }

  protected override render() {
    const t = this._t;
    return html`
      <div class="toolbar">
        ${this.narrow
          ? html`<button class="icon menu" title=${t("menu")} aria-label=${t("menu")} @click=${this._menu}>
              <ha-icon icon="mdi:menu"></ha-icon>
            </button>`
          : nothing}
        <ha-icon icon="mdi:fireplace" class="logo"></ha-icon>
        <span class="title">${t("title")}</span>
        <span class="spacer"></span>
        ${this._status
          ? html`<span class="badge ${this._status.mode === "active" ? "ok" : "warn"}">
              ${this._status.mode === "active" ? t("mode.active") : t("mode.shadow")}
            </span>`
          : nothing}
        ${this._dirty ? html`<span class="badge warn" title=${t("editor.unsaved")}>●</span>` : nothing}
      </div>
      <nav class="tabs" role="tablist">
        ${TABS.map(
          (tab) => html`<button
            role="tab"
            aria-selected=${this._tab === tab.id}
            class="tab ${this._tab === tab.id ? "active" : ""}"
            @click=${() => this._selectTab(tab.id)}
          >
            <ha-icon icon=${tab.icon}></ha-icon><span>${t(`tab.${tab.id}` as I18nKey)}</span>
            ${EDITOR_TABS.includes(tab.id) && this._tabDirty(tab.id) ? html`<i class="dot" aria-hidden="true"></i>` : nothing}
          </button>`,
        )}
      </nav>
      <main>${this._renderBody()}</main>
      ${EDITOR_TABS.includes(this._tab) && this._draft ? this._renderSaveBar() : nothing}
    `;
  }

  private _renderBody() {
    const t = this._t;
    if (this._loadError && !this._saved) {
      return html`<div class="banner error">
        <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
        <div>
          <strong>${t("load_error")}</strong>
          <span class="muted">${this._loadError}</span>
          <div style="margin-top:8px"><button @click=${this._retry}>${t("retry")}</button></div>
        </div>
      </div>`;
    }
    if (!this._draft) return html`<div class="muted">${t("loading")}</div>`;
    const ro = !this._isAdmin;
    const common = { hass: this.hass, config: this._draft, defaults: this._defaults ?? {}, lang: this._lang, readonly: ro };
    const onChange = (e: CustomEvent) => {
      this._draft = e.detail.config;
      if (this._saveMsg?.ok) this._saveMsg = null;
    };
    const adminHint = ro ? html`<div class="banner info" style="margin-bottom:12px">${t("not_admin")}</div>` : nothing;
    switch (this._tab) {
      case "overview":
        return this._renderOverview();
      case "rooms":
        return html`${adminHint}<wr-rooms-editor
            .hass=${common.hass}
            .config=${common.config}
            .defaults=${common.defaults}
            .lang=${common.lang}
            .devices=${this._status?.devices ?? {}}
            ?readonly=${ro}
            @config-changed=${onChange}
          ></wr-rooms-editor>`;
      case "schedule":
        return html`${adminHint}<wr-schedule-editor
            .hass=${common.hass}
            .config=${common.config}
            .defaults=${common.defaults}
            .lang=${common.lang}
            ?readonly=${ro}
            @config-changed=${onChange}
          ></wr-schedule-editor>`;
      case "scenes":
        return html`${adminHint}<wr-scenes-editor
            .hass=${common.hass}
            .config=${common.config}
            .defaults=${common.defaults}
            .lang=${common.lang}
            ?readonly=${ro}
            @config-changed=${onChange}
          ></wr-scenes-editor>`;
      case "house":
        return html`${adminHint}${this._renderModeSwitch()}<wr-house-editor
            .hass=${common.hass}
            .config=${common.config}
            .defaults=${common.defaults}
            .lang=${common.lang}
            .status=${this._status}
            ?readonly=${ro}
            @config-changed=${onChange}
            @wr-status=${(e: CustomEvent<Status>) => (this._status = e.detail)}
          ></wr-house-editor>`;
      case "log":
        return this._renderLog();
    }
  }

  private _ctx(): ViewCtx {
    // Szenen-Chips zeigen die gespeicherte Config (nicht den Entwurf)
    return { t: this._t, lang: this._lang, status: this._status, config: this._saved, isAdmin: this._isAdmin, busy: this._busy };
  }

  private _renderOverview() {
    const t = this._t;
    const ctx = this._ctx();
    if (!this._status) {
      return this._loadError
        ? html`<div class="banner error"><ha-icon icon="mdi:alert-circle-outline"></ha-icon>
            <div><strong>${t("load_error")}</strong> <span class="muted">${this._loadError}</span>
              <div style="margin-top:8px"><button @click=${this._retry}>${t("retry")}</button></div></div>
          </div>`
        : html`<div class="muted">${t("loading")}</div>`;
    }
    return html`
      <div class="stack">
        ${renderShadowBanner(ctx, true)}
        ${this._actionError
          ? html`<div class="banner error" role="alert">
              <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
              <div style="flex:1">${this._actionError}</div>
              <button class="icon" aria-label=${t("close")} @click=${() => (this._actionError = null)}><ha-icon icon="mdi:close"></ha-icon></button>
            </div>`
          : nothing}
        ${renderAlertStrip(ctx)}
        <div class="card hero">
          <div class="hero-grid ${this._history?.length ? "" : "solo"}">
            <div class="hero-left">
              ${renderHeroHead(ctx)}
              <wr-controls
                .hass=${this.hass}
                .status=${this._status}
                .config=${this._saved}
                .lang=${this._lang}
                @wr-status=${(e: CustomEvent<Status>) => (this._status = e.detail)}
              ></wr-controls>
            </div>
            ${this._history?.length
              ? html`<div class="hero-chart">
                  <h4>${t("chart.title")}</h4>
                  ${renderTrendChart(this._history, t, this._lang, { height: 170 })}
                </div>`
              : nothing}
          </div>
        </div>
        <div class="card">
          <wr-feedback
            .hass=${this.hass}
            .status=${this._status}
            .lang=${this._lang}
            @wr-status=${(e: CustomEvent<Status>) => (this._status = e.detail)}
          ></wr-feedback>
        </div>
        ${this._history?.length
          ? html`<div class="card">
              <h3 style="margin:0 0 10px">${t("history.title")}</h3>
              <wr-history
                .points=${this._history}
                .rooms=${(this._status?.rooms ?? []).map((r) => ({ id: r.id, name: r.name }))}
                .lang=${this._lang}
                ?dark=${this.hass?.themes?.darkMode === true}
              ></wr-history>
            </div>`
          : nothing}
        <div class="mid">
          ${renderPellets(ctx, () => this._action(() => pelletsRefill(this.hass)))}
          ${renderStoveCard(ctx)}
        </div>
        <h3 style="margin:4px 0 -6px">${t("rooms.title")}</h3>
        ${renderRoomTiles(ctx)}
      </div>
    `;
  }

  private _renderModeSwitch() {
    const t = this._t;
    const mode = this._status?.mode ?? "shadow";
    const disabled = !this._isAdmin || this._busy;
    const ask = (m: Mode) => {
      if (m !== mode) this._modeConfirm = m;
    };
    return html`<div class="card mode" style="margin-bottom:16px">
      <h3>${t("mode.label")}</h3>
      <div class="hint">${t("house.mode_hint")}</div>
      <div class="seg" role="radiogroup" aria-label=${t("mode.label")}>
        ${(["shadow", "active"] as Mode[]).map(
          (m) => html`<button
            role="radio"
            aria-checked=${mode === m}
            class="${mode === m ? `on ${m}` : ""}"
            ?disabled=${disabled}
            title=${this._isAdmin ? "" : t("not_admin")}
            @click=${() => ask(m)}
          >
            <ha-icon icon=${m === "shadow" ? "mdi:eye-outline" : "mdi:play-circle-outline"}></ha-icon>${t(`mode.${m}`)}
          </button>`,
        )}
      </div>
      ${this._modeConfirm
        ? html`<div class="confirm" role="alertdialog">
            ${this._modeConfirm === "active" ? t("mode.confirm_active") : t("mode.confirm_shadow")}
            <div class="row">
              <button class="primary" ?disabled=${this._busy} @click=${() => this._changeMode(this._modeConfirm as Mode)}>
                ${this._modeConfirm === "active" ? t("mode.confirm_yes_active") : t("mode.confirm_yes_shadow")}
              </button>
              <button @click=${() => (this._modeConfirm = null)}>${t("cancel")}</button>
            </div>
          </div>`
        : nothing}
    </div>`;
  }

  private _renderLog() {
    const t = this._t;
    const entries = sortLogNewestFirst(this._status?.log);
    if (!entries.length) return html`<div class="card muted">${t("log.empty")}</div>`;
    return html`<div class="card">
      <h3>${t("log.title")}</h3>
      <ol class="log">
        ${entries.map(
          (e) => html`<li class=${e.shadow ? "shadow" : ""}>
            <span class="time">${formatStamp(e.time, this._status?.now, this._lang)}</span>
            <span class="text">${e.text}</span>
            ${e.shadow ? html`<span class="badge warn" title=${t("log.shadow_hint")}>${t("log.shadow")}</span>` : nothing}
          </li>`,
        )}
      </ol>
    </div>`;
  }

  private _renderSaveBar() {
    const t = this._t;
    const dirty = this._dirty;
    const problems = this._draft ? draftProblems(this._draft, this._defaults) : 0;
    return html`<div class="savebar ${dirty ? "dirty" : ""}" role="region" aria-live="polite">
      <div class="msg">
        ${this._saveMsg?.ok
          ? html`<span class="ok">${this._saveMsg.text}</span>`
          : dirty
            ? html`<strong>${t("editor.unsaved")}</strong>${problems ? html`<span class="error-text">${t("editor.fix_errors")}</span>` : nothing}${this._saveMsg && !this._saveMsg.ok
                ? html`<span class="error-text" role="alert">${this._saveMsg.text}</span>`
                : nothing}`
            : html`<span class="muted">${t("editor.saved")}</span>`}
      </div>
      <div class="row">
        <button ?disabled=${!dirty || this._saving} @click=${this._discard}><ha-icon icon="mdi:undo"></ha-icon>${t("editor.discard")}</button>
        <button class="primary" ?disabled=${!dirty || this._saving || problems > 0 || !this._isAdmin} @click=${this._save}>
          <ha-icon icon="mdi:content-save"></ha-icon>${this._saving ? t("editor.saving") : t("editor.save")}
        </button>
      </div>
    </div>`;
  }

  static override styles = [
    baseStyles,
    artStyles,
    chartStyles,
    tankStyles,
    overviewStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        background: var(--wr-bg);
      }
      .toolbar {
        display: flex;
        align-items: center;
        gap: 8px;
        height: var(--header-height, 56px);
        padding: 0 16px;
        background: var(--app-header-background-color, var(--wr-card));
        color: var(--app-header-text-color, var(--wr-text));
        border-bottom: 1px solid var(--wr-div);
      }
      .toolbar .title {
        font-size: 20px;
        font-weight: 400;
      }
      .toolbar .logo {
        color: var(--wr-heat);
      }
      .toolbar button.menu {
        color: inherit;
        margin-left: -8px;
      }
      .tabs {
        display: flex;
        gap: 2px;
        padding: 0 8px;
        overflow-x: auto;
        background: var(--wr-card);
        border-bottom: 1px solid var(--wr-div);
        scrollbar-width: thin;
      }
      .tab {
        border: 0;
        border-bottom: 3px solid transparent;
        border-radius: 0;
        padding: 10px 12px;
        white-space: nowrap;
        color: var(--wr-text2);
        position: relative;
      }
      .tab.active {
        color: var(--wr-heat);
        border-bottom-color: var(--wr-heat);
      }
      .tab .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--wr-warn);
        display: inline-block;
      }
      main {
        flex: 1;
        padding: 16px;
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
      }
      @media (max-width: 480px) {
        main {
          padding: 12px 8px;
        }
        .tab {
          padding: 10px 8px;
        }
      }
      .stack {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .hero-grid {
        display: grid;
        gap: 16px 24px;
        grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
        align-items: center;
      }
      .hero-grid.solo {
        grid-template-columns: minmax(0, 560px);
      }
      .hero-left {
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .hero-chart h4 {
        color: var(--wr-text2);
        font-weight: 500;
        margin-bottom: 4px;
      }
      .mid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 280px), 1fr));
        align-items: start;
      }
      @media (max-width: 860px) {
        .hero-grid {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .seg {
        display: flex;
        border: 1px solid var(--wr-div);
        border-radius: 20px;
        overflow: hidden;
      }
      .seg button {
        flex: 1;
        border: 0;
        border-radius: 0;
        justify-content: center;
      }
      .seg button.on.shadow {
        background: var(--wr-warn);
        color: #fff;
      }
      .seg button.on.active {
        background: var(--wr-ok);
        color: #fff;
      }
      .log {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .log li {
        display: flex;
        gap: 12px;
        align-items: baseline;
        padding: 6px 0;
        border-bottom: 1px solid var(--wr-div);
      }
      .log li:last-child {
        border-bottom: 0;
      }
      .log .time {
        flex: none;
        color: var(--wr-text2);
        font-variant-numeric: tabular-nums;
        min-width: 3.5em;
      }
      .log .text {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .log li.shadow .text {
        color: var(--wr-text2);
        font-style: italic;
      }
      .savebar {
        position: sticky;
        bottom: 0;
        z-index: 4;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 8px 16px;
        padding: 10px 16px;
        background: var(--wr-card);
        border-top: 1px solid var(--wr-div);
      }
      .savebar.dirty {
        border-top: 3px solid var(--wr-warn);
      }
      .savebar .msg {
        flex: 1;
        min-width: 180px;
        display: flex;
        flex-direction: column;
      }
      .savebar .ok {
        color: var(--wr-ok);
      }
    `,
  ];
}

defineControls();
defineHistory();
defineFeedback();
if (!customElements.get("waermeregie-panel")) customElements.define("waermeregie-panel", WaermeregiePanel);

declare global {
  interface HTMLElementTagNameMap {
    "waermeregie-panel": WaermeregiePanel;
  }
}
