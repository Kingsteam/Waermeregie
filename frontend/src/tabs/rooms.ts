import { html, css, nothing } from "lit";
import "../components/entity-picker";
import { baseStyles } from "../styles";
import type { Room } from "../types";
import { makeId } from "../util";
import { EditorBase, inputValue, readNumber } from "./editor-base";

export class WrRoomsEditor extends EditorBase {
  static override properties = {
    ...EditorBase.properties,
    _selected: { state: true },
    _newName: { state: true },
    _confirmDelete: { state: true },
  };

  declare _selected: string | null;
  declare _newName: string;
  declare _confirmDelete: boolean;

  constructor() {
    super();
    this._selected = null;
    this._newName = "";
    this._confirmDelete = false;
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
      c.rooms.push({ id, name, importance: 2, radiators: [], temperature_sensors: [], openings: [], presence: [], targets: {} });
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
    const weights = new Map(room.temperature_sensors.map((s) => [s.entity, s.weight]));
    return html`<div class="card editor">
      <div class="row">
        <h3 style="margin:0">${room.name || room.id}</h3>
        <span class="spacer"></span>
        <span class="muted" style="font-size:12px">${t("id")}: ${room.id}</span>
      </div>
      <div class="two">
        <label class="field">
          <span class="lbl">${t("room.name")}</span>
          <input
            .value=${room.name}
            ?disabled=${ro}
            class=${room.name.trim() ? "" : "invalid"}
            @change=${(e: Event) => this._updateRoom(room.id, (r) => (r.name = inputValue(e).trim()))}
          />
        </label>
        <label class="field">
          <span class="lbl">${t("room.importance")}</span>
          <select
            ?disabled=${ro}
            @change=${(e: Event) => this._updateRoom(room.id, (r) => (r.importance = Number(inputValue(e))))}
          >
            ${[1, 2, 3].map(
              (n) => html`<option value=${n} ?selected=${room.importance === n}>${n} – ${t(`importance.${n}` as "importance.1")}</option>`,
            )}
          </select>
          <div class="hint">${t("room.importance_hint")}</div>
        </label>
      </div>

      <wr-entity-picker
        .hass=${this.hass}
        .lang=${this.lang}
        multiple
        ?disabled=${ro}
        .domains=${["climate"]}
        .value=${room.radiators}
        .label=${t("room.radiators")}
        .helper=${t("room.radiators_hint")}
        @value-changed=${(e: CustomEvent) => this._updateRoom(room.id, (r) => (r.radiators = e.detail.value))}
      ></wr-entity-picker>

      <wr-entity-picker
        .hass=${this.hass}
        .lang=${this.lang}
        multiple
        ?disabled=${ro}
        .domains=${["sensor"]}
        .deviceClasses=${["temperature"]}
        .value=${room.temperature_sensors.map((s) => s.entity)}
        .label=${t("room.sensors")}
        .helper=${t("room.sensors_hint")}
        @value-changed=${(e: CustomEvent) =>
          this._updateRoom(room.id, (r) => {
            r.temperature_sensors = (e.detail.value as string[]).map((entity) => ({ entity, weight: weights.get(entity) ?? 1 }));
          })}
      ></wr-entity-picker>
      ${room.temperature_sensors.length > 1 || room.temperature_sensors.some((s) => s.weight !== 1)
        ? html`<div class="weights">
            ${room.temperature_sensors.map(
              (s) => html`<label class="row weight">
                <span class="wname">${this.hass.states[s.entity]?.attributes.friendly_name ?? s.entity}</span>
                <span class="muted">${t("room.weight")}</span>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  ?disabled=${ro}
                  .value=${String(s.weight)}
                  @change=${(e: Event) =>
                    this._updateRoom(room.id, (r) => {
                      const x = r.temperature_sensors.find((y) => y.entity === s.entity);
                      const n = readNumber(e);
                      if (x) x.weight = n === null || n < 0 ? 1 : n;
                    })}
                />
              </label>`,
            )}
          </div>`
        : nothing}

      <wr-entity-picker
        .hass=${this.hass}
        .lang=${this.lang}
        multiple
        ?disabled=${ro}
        .domains=${["binary_sensor"]}
        .deviceClasses=${["door", "window", "opening", "garage_door"]}
        .value=${room.openings}
        .label=${t("room.openings")}
        .helper=${t("room.openings_hint")}
        @value-changed=${(e: CustomEvent) => this._updateRoom(room.id, (r) => (r.openings = e.detail.value))}
      ></wr-entity-picker>

      <wr-entity-picker
        .hass=${this.hass}
        .lang=${this.lang}
        multiple
        ?disabled=${ro}
        .domains=${["binary_sensor"]}
        .deviceClasses=${["occupancy", "motion", "presence"]}
        .value=${room.presence}
        .label=${t("room.presence")}
        .helper=${t("room.presence_hint")}
        @value-changed=${(e: CustomEvent) => this._updateRoom(room.id, (r) => (r.presence = e.detail.value))}
      ></wr-entity-picker>

      <span class="lbl">${t("room.targets")}</span>
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
      .two {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
        margin-top: 12px;
      }
      .weights {
        margin: -6px 0 12px;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .weight {
        flex-wrap: nowrap;
      }
      .wname {
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .weight input {
        max-width: 90px;
      }
      .targets {
        display: grid;
        gap: 8px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 200px), 1fr));
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
