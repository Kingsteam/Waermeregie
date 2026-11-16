import { html, css, nothing } from "lit";
import "../components/entity-picker";
import { notifyServices } from "../entities";
import type { I18nKey } from "../i18n";
import { baseStyles } from "../styles";
import type { Config, Defaults } from "../types";
import { formatNumber, normalizeLimit, paramLimits, withinLimit } from "../util";
import { EditorBase, readNumber } from "./editor-base";

type Unit = "K" | "°C" | "min" | "";

interface ParamDef {
  key: string;
  unit: Unit;
  step: number;
}

const PARAM_GROUPS: { group: I18nKey; params: ParamDef[] }[] = [
  {
    group: "pgroup.stove",
    params: [
      { key: "start_below_k", unit: "K", step: 0.1 },
      { key: "stop_above_k", unit: "K", step: 0.1 },
      { key: "min_burn_min", unit: "min", step: 5 },
      { key: "max_burn_min", unit: "min", step: 5 },
      { key: "min_pause_min", unit: "min", step: 5 },
      { key: "max_starts_per_day", unit: "", step: 1 },
      { key: "stove_block_setpoint_c", unit: "°C", step: 0.5 },
    ],
  },
  {
    group: "pgroup.openings",
    params: [
      { key: "opening_grace_min", unit: "min", step: 1 },
      { key: "opening_stop_min", unit: "min", step: 1 },
      { key: "opening_empty_room_min", unit: "min", step: 1 },
    ],
  },
  {
    group: "pgroup.power",
    params: [
      { key: "power_min", unit: "", step: 1 },
      { key: "power_max", unit: "", step: 1 },
      { key: "power_cold_c", unit: "°C", step: 0.5 },
    ],
  },
  { group: "pgroup.radiators", params: [{ key: "radiator_boost_k", unit: "K", step: 0.1 }] },
  {
    group: "pgroup.limits",
    params: [
      { key: "frost_c", unit: "°C", step: 0.5 },
      { key: "night_floor_c", unit: "°C", step: 0.5 },
    ],
  },
  { group: "pgroup.presence", params: [{ key: "presence_empty_min", unit: "min", step: 5 }] },
];

const KNOWN = new Set(PARAM_GROUPS.flatMap((g) => g.params.map((p) => p.key)));

function guessUnit(key: string): Unit {
  if (key.endsWith("_k")) return "K";
  if (key.endsWith("_c")) return "°C";
  if (key.endsWith("_min")) return "min";
  return "";
}

/** Prüft alle Parameter gegen defaults.limits. Liefert die Schlüssel außerhalb der Grenzen. */
export function invalidParameters(config: Config, defaults: Defaults | null | undefined): string[] {
  const limits = paramLimits(defaults);
  const p = config.parameters ?? {};
  const bad = Object.entries(p)
    .filter(([k, v]) => !withinLimit(v, normalizeLimit(limits[k])))
    .map(([k]) => k);
  // Leistungsstufen: kleinste darf nicht über der größten liegen
  if (typeof p.power_min === "number" && typeof p.power_max === "number" && p.power_min > p.power_max && !bad.includes("power_min")) bad.push("power_min");
  return bad;
}

export class WrHouseEditor extends EditorBase {
  private _set(mutate: (c: Config) => void) {
    this.change(mutate);
  }

  private _picker(opts: {
    label: I18nKey;
    hint: I18nKey;
    domains: string[];
    deviceClasses?: string[];
    value: string | string[] | null;
    multiple?: boolean;
    required?: boolean;
    onChange: (c: Config, v: unknown) => void;
  }) {
    return html`<wr-entity-picker
      .hass=${this.hass}
      .lang=${this.lang}
      ?multiple=${!!opts.multiple}
      ?disabled=${this.readonly}
      ?invalid=${!!opts.required && !opts.value}
      .domains=${opts.domains}
      .deviceClasses=${opts.deviceClasses}
      .value=${opts.value}
      .label=${this.t(opts.label)}
      .helper=${this.t(opts.hint)}
      @value-changed=${(e: CustomEvent) => this._set((c) => opts.onChange(c, e.detail.value ?? (opts.multiple ? [] : null)))}
    ></wr-entity-picker>`;
  }

  protected override render() {
    const t = this.t;
    const c = this.config;
    return html`
      <div class="cols">
        <div class="card">
          <h3>${t("house.stove")}</h3>
          ${this._picker({
            label: "house.stove_climate",
            hint: "house.stove_climate_hint",
            domains: ["climate"],
            value: c.stove.climate,
            required: c.mode === "active",
            onChange: (x, v) => (x.stove.climate = v as string | null),
          })}
          ${!c.stove.climate ? html`<div class="hint" style="margin-top:-8px">${t("house.stove_climate_active_hint")}</div>` : nothing}
          ${this._picker({
            label: "house.power",
            hint: "house.power_hint",
            domains: ["select", "input_select", "number", "input_number"],
            value: c.stove.power,
            onChange: (x, v) => (x.stove.power = v as string | null),
          })}
        </div>
        <div class="card">
          <h3>${t("house.stove_functions")}</h3>
          <div class="banner info" style="margin-bottom:12px;font-size:13px">${t("house.stove_functions_hint")}</div>
          ${this._picker({
            label: "house.chrono_switch",
            hint: "house.chrono_switch_hint",
            domains: ["switch"],
            value: c.stove.chrono_switch,
            onChange: (x, v) => (x.stove.chrono_switch = v as string | null),
          })}
          ${this._picker({
            label: "house.eco_switch",
            hint: "house.eco_switch_hint",
            domains: ["switch"],
            value: c.stove.eco_switch,
            onChange: (x, v) => (x.stove.eco_switch = v as string | null),
          })}
          ${this._picker({
            label: "house.error_sensor",
            hint: "house.error_sensor_hint",
            domains: ["binary_sensor"],
            deviceClasses: ["problem"],
            value: c.stove.error_sensor,
            onChange: (x, v) => (x.stove.error_sensor = v as string | null),
          })}
          ${this._picker({
            label: "house.water_sensor",
            hint: "house.water_sensor_hint",
            domains: ["sensor"],
            deviceClasses: ["temperature"],
            value: c.stove.water_sensor,
            onChange: (x, v) => (x.stove.water_sensor = v as string | null),
          })}
          ${this._picker({
            label: "house.ignitions_sensor",
            hint: "house.ignitions_sensor_hint",
            domains: ["sensor"],
            value: c.stove.ignitions_sensor,
            onChange: (x, v) => (x.stove.ignitions_sensor = v as string | null),
          })}
        </div>
        <div class="card">
          <h3>${t("house.environment")}</h3>
          ${this._picker({
            label: "house.weather",
            hint: "house.weather_hint",
            domains: ["weather"],
            value: c.weather,
            onChange: (x, v) => (x.weather = v as string | null),
          })}
          ${this._picker({
            label: "house.outdoor_sensor",
            hint: "house.outdoor_sensor_hint",
            domains: ["sensor"],
            deviceClasses: ["temperature"],
            value: c.outdoor_sensor,
            onChange: (x, v) => (x.outdoor_sensor = v as string | null),
          })}
          ${this._picker({
            label: "house.workday",
            hint: "house.workday_hint",
            domains: ["binary_sensor"],
            value: c.workday,
            onChange: (x, v) => (x.workday = v as string | null),
          })}
        </div>
        <div class="card">
          <h3>${t("house.people")}</h3>
          ${this._picker({
            label: "house.persons",
            hint: "house.persons_hint",
            domains: ["person"],
            value: c.persons,
            multiple: true,
            onChange: (x, v) => (x.persons = v as string[]),
          })}
          ${this._picker({
            label: "house.pet",
            hint: "house.pet_hint",
            domains: ["binary_sensor", "device_tracker", "person"],
            value: c.pet,
            onChange: (x, v) => (x.pet = v as string | null),
          })}
          ${this._renderNotify()}
        </div>
      </div>
      ${this._renderParameters()}
    `;
  }

  private _renderNotify() {
    const t = this.t;
    const available = notifyServices(this.hass?.services);
    const selected = this.config.notify ?? [];
    const all = [...available, ...selected.filter((s) => !available.includes(s))];
    return html`<div class="lbl">${t("house.notify")}</div>
      <div class="hint">${t("house.notify_hint")}</div>
      ${all.length
        ? html`<div class="notify">
            ${all.map((s) => {
              const missing = !available.includes(s);
              return html`<label class="check">
                <input
                  type="checkbox"
                  ?disabled=${this.readonly}
                  .checked=${selected.includes(s)}
                  @change=${(e: Event) => {
                    const on = (e.target as HTMLInputElement).checked;
                    this._set((x) => {
                      const cur = (x.notify ?? []).filter((n) => n !== s);
                      x.notify = on ? [...cur, s] : cur;
                    });
                  }}
                />
                <span>${s}${missing ? html` <span class="badge warn">${t("house.notify_unknown")}</span>` : nothing}</span>
              </label>`;
            })}
          </div>`
        : html`<div class="muted">${t("house.notify_none")}</div>`}`;
  }

  private _renderParameters() {
    const t = this.t;
    const params = this.config.parameters ?? {};
    const extra = Object.keys(params).filter((k) => !KNOWN.has(k));
    const groups = [...PARAM_GROUPS];
    if (extra.length) groups.push({ group: "pgroup.other", params: extra.map((key) => ({ key, unit: guessUnit(key), step: 0.1 })) });
    return html`<div class="card" style="margin-top:16px">
      <h3>${t("house.parameters")}</h3>
      <div class="hint">${t("house.parameters_hint")}</div>
      ${groups.map((g) => {
        const present = g.params.filter((p) => p.key in params || this.defaults?.parameters?.[p.key] !== undefined);
        if (!present.length) return nothing;
        return html`<h4 style="margin-top:14px">${t(g.group)}</h4>
          <div class="params">${present.map((p) => this._renderParam(p))}</div>`;
      })}
    </div>`;
  }

  private _renderParam(p: ParamDef) {
    const t = this.t;
    const value = this.config.parameters?.[p.key];
    const def = this.defaults?.parameters?.[p.key];
    const limit = normalizeLimit(paramLimits(this.defaults)[p.key]);
    const invalid = invalidParameters(this.config, this.defaults).includes(p.key);
    const labelKey = `param.${p.key}` as I18nKey;
    const hintKey = `param.${p.key}_hint` as I18nKey;
    const label = t(labelKey) === labelKey ? p.key : t(labelKey);
    const hint = t(hintKey) === hintKey ? "" : t(hintKey);
    const digits = p.step < 1 ? 1 : 0;
    return html`<label class="param">
      <span class="ptext">
        <span class="lbl">${label}</span>
        ${hint ? html`<span class="hint">${hint}</span>` : nothing}
        ${invalid || limit.min !== undefined || limit.max !== undefined
          ? html`<span class=${invalid ? "error-text" : "hint"}
              >${t("house.out_of_range", {
                min: limit.min !== undefined ? formatNumber(limit.min, this.lang, digits) : "–",
                max: limit.max !== undefined ? formatNumber(limit.max, this.lang, digits) : "–",
              })}${p.unit ? ` ${p.unit}` : ""}</span
            >`
          : nothing}
      </span>
      <span class="pinput">
        <input
          type="number"
          class=${invalid ? "invalid" : ""}
          ?disabled=${this.readonly}
          step=${limit.step ?? p.step}
          min=${limit.min ?? nothing}
          max=${limit.max ?? nothing}
          placeholder=${def !== undefined ? String(def) : ""}
          .value=${value !== undefined && value !== null ? String(value) : ""}
          @change=${(e: Event) => {
            const n = readNumber(e);
            this._set((x) => {
              x.parameters = x.parameters ?? {};
              if (n === null) {
                if (def !== undefined) x.parameters[p.key] = def;
                else delete x.parameters[p.key];
              } else x.parameters[p.key] = n;
            });
          }}
        />
        <span class="unit">${p.unit}</span>
      </span>
    </label>`;
  }

  static override styles = [
    baseStyles,
    css`
      .cols {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr));
        align-items: start;
      }
      .notify {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .check {
        display: flex;
        gap: 8px;
        align-items: center;
        overflow-wrap: anywhere;
      }
      .check input {
        width: auto;
        min-height: 0;
        flex: none;
      }
      .params {
        display: grid;
        gap: 8px 24px;
        grid-template-columns: repeat(auto-fill, minmax(min(100%, 380px), 1fr));
      }
      .param {
        display: flex;
        gap: 12px;
        align-items: flex-start;
        justify-content: space-between;
        border-bottom: 1px solid var(--wr-div);
        padding: 6px 0 8px;
      }
      .ptext {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .ptext .hint {
        margin: 0;
      }
      .pinput {
        display: flex;
        align-items: center;
        gap: 4px;
        flex: none;
      }
      .pinput input {
        width: 90px;
      }
      .unit {
        width: 28px;
        color: var(--wr-text2);
      }
    `,
  ];
}

if (!customElements.get("wr-house-editor")) customElements.define("wr-house-editor", WrHouseEditor);
