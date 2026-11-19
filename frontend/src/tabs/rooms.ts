import { html, css, nothing } from "lit";
import "../components/entity-picker";
import { baseStyles } from "../styles";
import type { Room } from "../types";
import { addDevice, DEVICE_KINDS, deviceValue, isAvailable, removeDevice, roomDevices, togglePaused, unavailableDevices } from "../devices";
import { friendlyName } from "../entities";
import { makeId } from "../util";
import { EditorBase, inputValue, readNumber } from "./editor-base";

export class WrRoomsEditor extends EditorBase {
  static override properties = {
    ...EditorBase.properties,
    _selected: { state: true },
    _newName: { state: true },
    _confirmDelete: { state: true },
    _adding: { state: true },
  };

  declare _selected: string | null;
  declare _newName: string;
  declare _confirmDelete: boolean;
  /** „raum:art“, für die gerade ein Gerät hinzugefügt wird */
  declare _adding: string | null;

  constructor() {
    super();
    this._selected = null;
    this._newName = "";
    this._confirmDelete = false;
    this._adding = null;
  }

  private get _room(): Room | undefined {
    const rooms = this.config.rooms;
    return rooms.find((r) => r.id === this._selected) ?? rooms[0];
  }

  private _updateRoom(id: string, mutate: (r: Room) => void) {
    this.change((c) => {
      const r = c.rooms.find((x) => x.id === id);
      if (r) mutate(r);
    });
  }

  private _add() {
    const name = this._newName.trim();
    if (!name) return;
    const id = makeId(name, this.config.rooms.map((r) => r.id), "raum");
    this.change((c) => {
      c.rooms.push({ id, name, importance: 2, radiators: [], temperature_sensors: [], openings: [], presence: [], paused: [], targets: {} });
    });
    this._selected = id;
    this._newName = "";
    this._confirmDelete = false;
  }

  private _delete(id: string) {
    const idx = this.config.rooms.findIndex((r) => r.id === id);
    this.change((c) => {
      c.rooms = c.rooms.filter((r) => r.id !== id);
    });
    const rest = this.config.rooms.filter((r) => r.id !== id);
    this._selected = rest[Math.max(0, idx - 1)]?.id ?? null;
    this._confirmDelete = false;
  }

  protected override render() {
    const t = this.t;
    const room = this._room;
    return html`
      <div class="layout">
        <div class="card list">
          <h3>${t("rooms.title")}</h3>
          ${this.config.rooms.length
            ? html`<div class="items" role="tablist" aria-label=${t("rooms.select")}>
                ${this.config.rooms.map(
                  (r) => html`<button
                    role="tab"
                    aria-selected=${room?.id === r.id}
                    class="item ${room?.id === r.id ? "sel" : ""}"
                    @click=${() => {
                      this._selected = r.id;
                      this._confirmDelete = false;
                    }}
                  >
                    <ha-icon icon="mdi:door"></ha-icon><span>${r.name}</span>
                    ${unavailableDevices(r, this.hass.states).length
                      ? html`<ha-icon class="warnicon" icon="mdi:alert-circle-outline" title=${t("dev.unavailable")}></ha-icon>`
                      : nothing}
                  </button>`,
                )}
              </div>`
            : html`<div class="muted">${t("rooms.none")}</div>`}
          ${this.readonly
            ? nothing
            : html`<form
                class="add"
                @submit=${(e: Event) => {
                  e.preventDefault();
                  this._add();
                }}
              >
                <input
                  .value=${this._newName}
                  placeholder=${t("rooms.add_placeholder")}
                  aria-label=${t("rooms.add_placeholder")}
                  @input=${(e: Event) => (this._newName = inputValue(e))}
                />
                <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${t("rooms.add")}</button>
              </form>`}
        </div>
        ${room ? this._renderRoom(room) : nothing}
      </div>
    `;
  }

  private _renderRoom(room: Room) {
    const t = this.t;
    const ro = this.readonly;
    const unavail = unavailableDevices(room, this.hass.states);
    return html`<div class="card editor">
      <div class="head">
        <label class="field grow">
          <span class="lbl">${t("room.name")}</span>
          <input
            .value=${room.name}
            ?disabled=${ro}
            class=${room.name.trim() ? "" : "invalid"}
            @change=${(e: Event) => this._updateRoom(room.id, (r) => (r.name = inputValue(e).trim()))}
          />
        </label>
        <label class="field" title=${t("room.importance_hint")}>
          <span class="lbl">${t("room.importance")}</span>
          <select
            ?disabled=${ro}
            @change=${(e: Event) => this._updateRoom(room.id, (r) => (r.importance = Number(inputValue(e))))}
          >
            ${[1, 2, 3].map(
              (n) => html`<option value=${n} ?selected=${room.importance === n}>${n} – ${t(`importance.${n}` as "importance.1")}</option>`,
            )}
          </select>
        </label>
        <span class="muted rid">${t("id")}: ${room.id}</span>
      </div>

      <div class="row sect">
        <span class="lbl" style="margin:0">${t("room.devices")}</span>
        <span class="spacer"></span>
        ${unavail.length
          ? html`<span class="badge warn">${unavail.length === 1 ? t("dev.unavail_one") : t("dev.unavail_count", { n: unavail.length })}</span>
              ${ro
                ? nothing
                : html`<button class="small" @click=${() =>
                    this._updateRoom(room.id, (r) => {
                      for (const e of unavail) if (!(r.paused ?? []).includes(e)) togglePaused(r, e);
                    })}>
                    <ha-icon icon="mdi:pause"></ha-icon>${t("dev.pause_unavail")}
                  </button>`}`
          : nothing}
      </div>
      <div class="hint">${t("room.devices_hint")}</div>
      <div class="groups">${DEVICE_KINDS.map((k) => this._renderGroup(room, k))}</div>

      <span class="lbl" style="margin-top:14px">${t("room.targets")}</span>
      <div class="hint">${t("room.targets_hint")}</div>
      ${this.config.scenes.length
        ? html`<div class="targets">
            ${this.config.scenes.map(
              (s) => html`<label class="target">
                <span>${s.icon ? html`<ha-icon icon=${s.icon}></ha-icon>` : nothing}${s.name}</span>
                <span class="row" style="flex-wrap:nowrap;gap:4px">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="30"
                    ?disabled=${ro}
                    placeholder=${String(s.default_target ?? "")}
                    .value=${room.targets[s.id] !== undefined ? String(room.targets[s.id]) : ""}
                    @change=${(e: Event) =>
                      this._updateRoom(room.id, (r) => {
                        const n = readNumber(e);
                        if (n === null) delete r.targets[s.id];
                        else r.targets[s.id] = n;
                      })}
                  /><span class="muted">°C</span>
                </span>
              </label>`,
            )}
          </div>`
        : html`<div class="muted">${t("scenes.none")}</div>`}

      ${ro
        ? nothing
        : html`<div style="margin-top:16px">
            ${this._confirmDelete
              ? html`<div class="confirm" role="alertdialog" aria-label=${t("room.delete")}>
                  ${t("room.delete_confirm", { name: room.name })}
                  <div class="row">
                    <button class="danger solid" @click=${() => this._delete(room.id)}><ha-icon icon="mdi:delete"></ha-icon>${t("delete")}</button>
                    <button @click=${() => (this._confirmDelete = false)}>${t("cancel")}</button>
                  </div>
                </div>`
              : html`<button class="danger" @click=${() => (this._confirmDelete = true)}><ha-icon icon="mdi:delete-outline"></ha-icon>${t("room.delete")}</button>`}
          </div>`}
    </div>`;
  }

  private _renderGroup(room: Room, k: (typeof DEVICE_KINDS)[number]) {
    const t = this.t;
    const ro = this.readonly;
    const list = roomDevices(room, k.kind);
    const paused = new Set(room.paused ?? []);
    const adding = this._adding === `${room.id}:${k.kind}`;
    return html`<div class="group">
      <div class="ghead" title=${t(k.hint)}>
        <ha-icon icon=${k.icon}></ha-icon>
        <span class="gname">${t(k.label)}</span>
        <span class="muted">${list.length || t("dev.none")}</span>
        <span class="spacer"></span>
        ${ro
          ? nothing
          : html`<button
              class="icon"
              title=${t("dev.add")}
              aria-label="${t("dev.add")}: ${t(k.label)}"
              @click=${() => (this._adding = adding ? null : `${room.id}:${k.kind}`)}
            >
              <ha-icon icon=${adding ? "mdi:close" : "mdi:plus"}></ha-icon>
            </button>`}
      </div>
      ${list.map((entity) => {
        const st = this.hass.states[entity];
        const ok = isAvailable(st);
        const isPaused = paused.has(entity);
        const weight = k.kind === "temperature_sensors" ? room.temperature_sensors.find((s) => s.entity === entity)?.weight : undefined;
        return html`<div class="dev ${isPaused ? "paused" : ""} ${ok ? "" : "unavail"}">
          <span class="dot" aria-hidden="true"></span>
          <span class="dname">
            <span>${friendlyName(this.hass.states, entity)}</span>
            <span class="did">${entity}</span>
          </span>
          <span class="dval">${isPaused ? t("dev.paused") : deviceValue(st, k.kind, t, this.lang)}</span>
          ${weight !== undefined
            ? html`<input
                class="w"
                type="number"
                min="0.1"
                max="10"
                step="0.1"
                title=${t("room.weight")}
                aria-label="${t("room.weight")}: ${entity}"
                ?disabled=${ro}
                .value=${String(weight)}
                @change=${(e: Event) =>
                  this._updateRoom(room.id, (r) => {
                    const x = r.temperature_sensors.find((y) => y.entity === entity);
                    const n = readNumber(e);
                    if (x) x.weight = n === null || n <= 0 ? 1 : n;
                  })}
              />`
            : nothing}
          ${ro
            ? nothing
            : html`<button
                  class="icon"
                  title=${isPaused ? t("dev.resume") : t("dev.pause")}
                  aria-label="${isPaused ? t("dev.resume") : t("dev.pause")}: ${entity}"
                  @click=${() => this._updateRoom(room.id, (r) => togglePaused(r, entity))}
                >
                  <ha-icon icon=${isPaused ? "mdi:play" : "mdi:pause"}></ha-icon>
                </button>
                <button
                  class="icon"
                  title=${t("remove")}
                  aria-label="${t("remove")}: ${entity}"
                  @click=${() => this._updateRoom(room.id, (r) => removeDevice(r, k.kind, entity))}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`}
        </div>`;
      })}
      ${adding
        ? html`<wr-entity-picker
            class="adder"
            .hass=${this.hass}
            .lang=${this.lang}
            multiple
            .domains=${k.domains}
            .deviceClasses=${k.classes}
            .value=${[]}
            .exclude=${list}
            @value-changed=${(e: CustomEvent) => {
              const picked = (e.detail.value as string[]).filter((x) => !list.includes(x));
              this._updateRoom(room.id, (r) => picked.forEach((x) => addDevice(r, k.kind, x)));
            }}
          ></wr-entity-picker>`
        : nothing}
    </div>`;
  }

  static override styles = [
    baseStyles,
    css`
      .layout {
        display: grid;
        gap: 16px;
        grid-template-columns: minmax(200px, 280px) minmax(0, 1fr);
        align-items: start;
      }
      @media (max-width: 760px) {
        .layout {
          grid-template-columns: minmax(0, 1fr);
        }
      }
      .items {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 12px;
      }
      @media (max-width: 760px) {
        .items {
          flex-direction: row;
          flex-wrap: wrap;
        }
      }
      .item {
        justify-content: flex-start;
        border-color: transparent;
        border-radius: 8px;
        text-align: left;
      }
      .item.sel {
        background: color-mix(in srgb, var(--wr-heat) 16%, transparent);
        border-color: var(--wr-heat);
      }
      .add {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .head {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: flex-end;
      }
      .head .grow {
        flex: 1 1 220px;
      }
      .head .field {
        margin: 0;
      }
      .rid {
        font-size: 12px;
        padding-bottom: 10px;
      }
      .sect {
        margin-top: 16px;
      }
      button.small {
        min-height: 30px;
        padding: 2px 10px;
        font-size: 13px;
      }
      .warnicon {
        color: var(--wr-warn);
        margin-left: auto;
        --mdc-icon-size: 18px;
      }
      .groups {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-top: 8px;
      }
      .group {
        border: 1px solid var(--wr-div);
        border-radius: 10px;
        overflow: hidden;
      }
      .ghead {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 4px 2px 10px;
        background: var(--wr-input-bg);
      }
      .ghead ha-icon {
        --mdc-icon-size: 18px;
        color: var(--wr-text2);
      }
      .gname {
        font-weight: 500;
      }
      .dev {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 2px 4px 2px 10px;
        border-top: 1px solid var(--wr-div);
        min-height: 40px;
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex: none;
        background: var(--wr-ok);
      }
      .dev.unavail .dot {
        background: var(--wr-warn);
      }
      .dev.paused .dot {
        background: var(--wr-text2);
      }
      .dev.paused .dname,
      .dev.paused .dval {
        opacity: 0.55;
      }
      .dname {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        overflow-wrap: break-word;
        line-height: 1.25;
      }
      .did {
        font-size: 11px;
        color: var(--wr-text2);
      }
      .dval {
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
        font-size: 13px;
      }
      .dev.unavail:not(.paused) .dval {
        color: var(--wr-warn);
      }
      input.w {
        width: 58px;
        min-height: 32px;
        padding: 2px 6px;
      }
      .adder {
        display: block;
        padding: 8px 10px 0;
        border-top: 1px solid var(--wr-div);
      }
      @media (max-width: 480px) {
        .did {
          display: none;
        }
      }
      .targets {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
      }
      .target {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        border: 1px solid var(--wr-div);
        border-radius: 8px;
        padding: 6px 8px;
      }
      .target > span:first-child {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        min-width: 0;
      }
      .target input {
        width: 80px;
      }
    `,
  ];
}

if (!customElements.get("wr-rooms-editor")) customElements.define("wr-rooms-editor", WrRoomsEditor);
