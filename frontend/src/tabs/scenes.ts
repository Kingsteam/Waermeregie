import { html, css, nothing } from "lit";
import { baseStyles } from "../styles";
import type { Scene, StoveRule } from "../types";
import { makeId, sceneColor } from "../util";
import { EditorBase, inputValue, readNumber } from "./editor-base";

const RULES: StoveRule[] = ["allow", "frost_only", "deny"];

export class WrScenesEditor extends EditorBase {
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

  private _updateScene(id: string, mutate: (s: Scene) => void) {
    this.change((c) => {
      const s = c.scenes.find((x) => x.id === id);
      if (s) mutate(s);
    });
  }

  private _add() {
    const name = this._newName.trim();
    if (!name) return;
    const id = makeId(name, this.config.scenes.map((s) => s.id), "szene");
    this.change((c) => c.scenes.push({ id, name, icon: "mdi:thermometer", stove: "allow", default_target: 20 }));
    this._newName = "";
  }

  private _usedIn(id: string): string[] {
    return this.config.day_types.filter((d) => d.slots.some((s) => s.scene === id)).map((d) => d.name);
  }

  private _delete(id: string) {
    this.change((c) => {
      c.scenes = c.scenes.filter((s) => s.id !== id);
      for (const r of c.rooms) delete r.targets[id];
    });
    this._confirmDelete = null;
  }

  protected override render() {
    const t = this.t;
    const ro = this.readonly;
    const ids = this.config.scenes.map((s) => s.id);
    return html`
      <div class="hint">${t("scenes.hint")}</div>
      <div class="scenes">
        ${this.config.scenes.map((s) => {
          const used = this._usedIn(s.id);
          return html`<div class="card scene" style="border-top:4px solid ${sceneColor(s.id, ids)}">
            <div class="row">
              ${s.icon ? html`<ha-icon icon=${s.icon}></ha-icon>` : nothing}
              <h3 style="margin:0">${s.name || s.id}</h3>
              <span class="spacer"></span>
              <span class="muted" style="font-size:12px">${t("id")}: ${s.id}</span>
            </div>
            <div class="fields">
              <label class="field">
                <span class="lbl">${t("scene.name")}</span>
                <input
                  .value=${s.name}
                  ?disabled=${ro}
                  class=${s.name.trim() ? "" : "invalid"}
                  @change=${(e: Event) => this._updateScene(s.id, (x) => (x.name = inputValue(e).trim()))}
                />
              </label>
              <label class="field">
                <span class="lbl">${t("scene.icon")}</span>
                <input
                  .value=${s.icon ?? ""}
                  ?disabled=${ro}
                  placeholder=${t("scene.icon_hint")}
                  @change=${(e: Event) => this._updateScene(s.id, (x) => (x.icon = inputValue(e).trim()))}
                />
              </label>
              <label class="field">
                <span class="lbl">${t("scene.stove")}</span>
                <select ?disabled=${ro} @change=${(e: Event) => this._updateScene(s.id, (x) => (x.stove = inputValue(e) as StoveRule))}>
                  ${RULES.map((r) => html`<option value=${r} ?selected=${s.stove === r}>${t(`scene.stove.${r}`)}</option>`)}
                </select>
              </label>
              <label class="field">
                <span class="lbl">${t("scene.default_target")}</span>
                <span class="row" style="flex-wrap:nowrap">
                  <input
                    type="number"
                    step="0.5"
                    min="5"
                    max="30"
                    ?disabled=${ro}
                    .value=${s.default_target !== undefined && s.default_target !== null ? String(s.default_target) : ""}
                    @change=${(e: Event) => {
                      const n = readNumber(e);
                      if (n !== null) this._updateScene(s.id, (x) => (x.default_target = n));
                    }}
                  /><span class="muted">°C</span>
                </span>
              </label>
            </div>
            ${ro
              ? nothing
              : this._confirmDelete === s.id
                ? html`<div class="confirm" role="alertdialog">
                    ${used.length
                      ? html`${t("scene.in_use", { names: used.join(", ") })}
                          <div class="row"><button @click=${() => (this._confirmDelete = null)}>${t("close")}</button></div>`
                      : html`${t("scene.delete_confirm", { name: s.name })}
                          <div class="row">
                            <button class="danger solid" @click=${() => this._delete(s.id)}><ha-icon icon="mdi:delete"></ha-icon>${t("delete")}</button>
                            <button @click=${() => (this._confirmDelete = null)}>${t("cancel")}</button>
                          </div>`}
                  </div>`
                : html`<button class="danger" @click=${() => (this._confirmDelete = s.id)}>
                    <ha-icon icon="mdi:delete-outline"></ha-icon>${t("scene.delete")}
                  </button>`}
          </div>`;
        })}
      </div>
      ${!this.config.scenes.length ? html`<div class="muted">${t("scenes.none")}</div>` : nothing}
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
              placeholder=${t("scenes.add_placeholder")}
              aria-label=${t("scenes.add_placeholder")}
              @input=${(e: Event) => (this._newName = inputValue(e))}
            />
            <button type="submit" ?disabled=${!this._newName.trim()}><ha-icon icon="mdi:plus"></ha-icon>${t("scenes.add")}</button>
          </form>`}
      ${this.config.rooms.length && this.config.scenes.length ? this._renderMatrix() : nothing}
    `;
  }

  private _renderMatrix() {
    const t = this.t;
    const ro = this.readonly;
    return html`<div class="card" style="margin-top:16px">
      <h3>${t("scenes.matrix")}</h3>
      <div class="hint">${t("scenes.matrix_hint")}</div>
      <div class="scroll">
        <table>
          <thead>
            <tr>
              <th></th>
              ${this.config.scenes.map((s) => html`<th scope="col">${s.name}</th>`)}
            </tr>
          </thead>
          <tbody>
            ${this.config.rooms.map(
              (r) => html`<tr>
                <th scope="row">${r.name}</th>
                ${this.config.scenes.map(
                  (s) => html`<td>
                    <input
                      type="number"
                      step="0.5"
                      min="5"
                      max="30"
                      ?disabled=${ro}
                      aria-label="${r.name} – ${s.name}"
                      placeholder=${String(s.default_target ?? "")}
                      .value=${r.targets[s.id] !== undefined ? String(r.targets[s.id]) : ""}
                      @change=${(e: Event) =>
                        this.change((c) => {
                          const room = c.rooms.find((x) => x.id === r.id);
                          if (!room) return;
                          const n = readNumber(e);
                          if (n === null) delete room.targets[s.id];
                          else room.targets[s.id] = n;
                        })}
                    />
                  </td>`,
                )}
              </tr>`,
            )}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  static override styles = [
    baseStyles,
    css`
      .scenes {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
        margin: 8px 0 16px;
      }
      .fields {
        margin-top: 12px;
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
      .scroll {
        overflow-x: auto;
        max-width: 100%;
      }
      table {
        border-collapse: collapse;
        min-width: 100%;
      }
      th,
      td {
        padding: 4px 6px;
        border-bottom: 1px solid var(--wr-div);
        text-align: left;
        white-space: nowrap;
      }
      th[scope="row"] {
        font-weight: 500;
        position: sticky;
        left: 0;
        background: var(--wr-card);
      }
      td input {
        width: 76px;
      }
    `,
  ];
}

if (!customElements.get("wr-scenes-editor")) customElements.define("wr-scenes-editor", WrScenesEditor);
