import { html, css, nothing } from "lit";
import type { I18nKey } from "../i18n";
import { baseStyles } from "../styles";
import type { DayType, WeekKey } from "../types";
import { makeId, parseTime, validateSlots, WEEK_KEYS, formatTimeOfDay, normalizeTimeInput } from "../util";
import { renderTimeline } from "../views";
import { EditorBase, inputValue } from "./editor-base";

export class WrScheduleEditor extends EditorBase {
  static override properties = {
    ...EditorBase.properties,
    _newName: { state: true },
    _confirmDelete: { state: true },
  };

  declare _newName: string;
  declare _confirmDelete: string | null;

  constructor() {
    super();
    this._newName = "";
    this._confirmDelete = null;
  }

  private _updateDay(id: string, mutate: (d: DayType) => void) {
    this.change((c) => {
      const d = c.day_types.find((x) => x.id === id);
      if (d) mutate(d);
    });
  }

  private _add() {
    const name = this._newName.trim();
    if (!name) return;
    const id = makeId(name, this.config.day_types.map((d) => d.id), "tagesart");
    const firstScene = this.config.scenes[0]?.id ?? "";
    this.change((c) => {
      c.day_types.push({ id, name, slots: [{ start: "06:00", scene: firstScene }] });
    });
    this._newName = "";
  }

  private _weekUsage(id: string): WeekKey[] {
    return WEEK_KEYS.filter((k) => this.config.week[k] === id);
  }

  private _addSlot(d: DayType) {
    this._updateDay(d.id, (x) => {
      const last = x.slots.length ? parseTime(x.slots[x.slots.length - 1].start) : null;
      const start = last === null ? "06:00" : formatTimeOfDay(Math.min(last + 60, 23 * 60 + 59));
      x.slots.push({ start, scene: this.config.scenes[0]?.id ?? "" });
    });
  }

  protected override render() {
    const t = this.t;
    const ro = this.readonly;
    return html`
      <div class="card">
        <h3>${t("schedule.week")}</h3>
        <div class="hint">${t("schedule.week_hint")}</div>
        <div class="week">
          ${WEEK_KEYS.map((k) => {
            const v = this.config.week[k] ?? "";
            const unknown = !!v && !this.config.day_types.some((d) => d.id === v);
            return html`<label class="field">
              <span class="lbl">${t(`week.${k}` as I18nKey)}</span>
              <select
                ?disabled=${ro}
                class=${!v || unknown ? "invalid" : ""}
                @change=${(e: Event) =>
                  this.change((c) => {
                    c.week[k] = inputValue(e);
                  })}
              >
                ${!v || unknown ? html`<option value="" selected>${t("week.unset")}</option>` : nothing}
                ${this.config.day_types.map((d) => html`<option value=${d.id} ?selected=${d.id === v}>${d.name}</option>`)}
              </select>
            </label>`;
          })}
        </div>
      </div>

      <h3 style="margin-top:16px">${t("schedule.day_types")}</h3>
      <div class="hint">${t("schedule.day_types_hint")}</div>
      ${!this.config.scenes.length ? html`<div class="banner info">${t("schedule.no_scenes")}</div>` : nothing}
      <div class="days">${this.config.day_types.map((d) => this._renderDay(d))}</div>

      ${ro
        ? nothing
        : html`<form
            class="card add"
            @submit=${(e: Event) => {
              e.preventDefault();
              this._add();
            }}
          >
            <input
              .value=${this._newName}
              placeholder=${t("schedule.add_placeholder")}
              aria-label=${t("schedule.add_placeholder")}
              @input=${(e: Event) => (this._newName = inputValue(e))}
            />
            <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${t("schedule.add")}</button>
          </form>`}
    `;
  }

  private _renderDay(d: DayType) {
    const t = this.t;
    const ro = this.readonly;
    const sceneIds = this.config.scenes.map((s) => s.id);
    const errors = validateSlots(d.slots, sceneIds);
    const errAt = (i: number) => errors.filter((e) => e.index === i);
    const usage = this._weekUsage(d.id);
    return html`<div class="card day">
      <div class="row">
        <input
          class="dname ${d.name.trim() ? "" : "invalid"}"
          .value=${d.name}
          ?disabled=${ro}
          aria-label=${t("room.name")}
          @change=${(e: Event) => this._updateDay(d.id, (x) => (x.name = inputValue(e).trim()))}
        />
        <span class="muted" style="font-size:12px">${t("id")}: ${d.id}</span>
      </div>
      <div style="margin:10px 0">${renderTimeline(d.slots, this.config.scenes, { legend: true })}</div>
      <div class="slots">
        ${d.slots.map((s, i) => {
          const errs = errAt(i);
          const timeBad = errs.some((e) => e.code === "time_format" || e.code === "not_ascending");
          const sceneBad = errs.some((e) => e.code === "scene_missing" || e.code === "scene_unknown");
          return html`<div class="slot">
            <span class="muted">${t("schedule.slot_from")}</span>
            <input
              type="text"
              inputmode="numeric"
              placeholder="HH:MM"
              maxlength="5"
              aria-label=${t("schedule.slot_from")}
              class="time ${timeBad ? "invalid" : ""}"
              ?disabled=${ro}
              .value=${s.start}
              @change=${(e: Event) =>
                this._updateDay(d.id, (x) => (x.slots[i].start = normalizeTimeInput(inputValue(e))))}
            />
            <select
              class=${sceneBad ? "invalid" : ""}
              ?disabled=${ro}
              @change=${(e: Event) => this._updateDay(d.id, (x) => (x.slots[i].scene = inputValue(e)))}
            >
              ${!s.scene || !sceneIds.includes(s.scene) ? html`<option value="" selected>${t("week.unset")}</option>` : nothing}
              ${this.config.scenes.map((sc) => html`<option value=${sc.id} ?selected=${sc.id === s.scene}>${sc.name}</option>`)}
            </select>
            ${ro
              ? nothing
              : html`<button
                  class="icon"
                  title=${t("remove")}
                  aria-label=${t("remove")}
                  @click=${() => this._updateDay(d.id, (x) => x.slots.splice(i, 1))}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>`}
            ${errs.length ? html`<div class="error-text full">${errs.map((e) => t(`slot.${e.code}` as I18nKey)).join(" ")}</div>` : nothing}
          </div>`;
        })}
        ${errAt(-1).length ? html`<div class="error-text">${t("slot.empty")}</div>` : nothing}
      </div>
      ${ro
        ? nothing
        : html`<div class="row" style="margin-top:8px">
            <button ?disabled=${!this.config.scenes.length} @click=${() => this._addSlot(d)}>
              <ha-icon icon="mdi:clock-plus-outline"></ha-icon>${t("schedule.add_slot")}
            </button>
            <span class="spacer"></span>
            <button class="danger" @click=${() => (this._confirmDelete = d.id)}>
              <ha-icon icon="mdi:delete-outline"></ha-icon>${t("schedule.delete_day_type")}
            </button>
          </div>
          ${this._confirmDelete === d.id
            ? html`<div class="confirm" role="alertdialog">
                ${usage.length
                  ? html`${t("schedule.in_use", { days: usage.map((k) => t(`week.${k}` as I18nKey)).join(", ") })}
                      <div class="row"><button @click=${() => (this._confirmDelete = null)}>${t("close")}</button></div>`
                  : html`${t("schedule.delete_confirm", { name: d.name })}
                      <div class="row">
                        <button
                          class="danger solid"
                          @click=${() => {
                            this.change((c) => (c.day_types = c.day_types.filter((x) => x.id !== d.id)));
                            this._confirmDelete = null;
                          }}
                        >
                          <ha-icon icon="mdi:delete"></ha-icon>${t("delete")}
                        </button>
                        <button @click=${() => (this._confirmDelete = null)}>${t("cancel")}</button>
                      </div>`}
              </div>`
            : nothing}`}
    </div>`;
  }

  static override styles = [
    baseStyles,
    css`
      .week {
        display: grid;
        gap: 0 12px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 150px), 1fr));
      }
      .days {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 420px), 1fr));
        margin: 8px 0 16px;
      }
      .dname {
        flex: 1;
        font-weight: 500;
        min-width: 140px;
      }
      .slots {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .slot {
        display: grid;
        grid-template-columns: auto 110px minmax(0, 1fr) auto;
        gap: 6px;
        align-items: center;
      }
      .slot .full {
        grid-column: 1 / -1;
      }
      .add {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .add input {
        flex: 1;
        min-width: 180px;
      }
    `,
  ];
}

if (!customElements.get("wr-schedule-editor")) customElements.define("wr-schedule-editor", WrScheduleEditor);
