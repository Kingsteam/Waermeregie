import { html, css, nothing } from "lit";
import "../components/entity-picker";
import { notifyServices } from "../entities";
import type { I18nKey } from "../i18n";
import { baseStyles } from "../styles";
import { resetLearning } from "../api";
import type { Config, Defaults, Notifications, NotifyKind, Status } from "../types";
import { DEFAULT_NOTIFICATIONS, formatNumber, normalizeLimit, normalizeTimeInput, paramLimits, quietValid, withinLimit } from "../util";
import { EditorBase, readNumber } from "./editor-base";

type Unit = "K" | "°C" | "min" | "kg" | "kg/h" | "";

interface ParamDef {
  key: string;
  unit: Unit;
  step: number;
}

const PARAM_GROUPS: { group: I18nKey; params: ParamDef[]; extra?: "warmup_scene" | "buffer" }[] = [
  {
    group: "pgroup.stove",
    params: [
      { key: "start_below_k", unit: "K", step: 0.1 },
      { key: "stop_above_k", unit: "K", step: 0.1 },
      { key: "hard_stop_above_k", unit: "K", step: 0.1 },
      { key: "min_burn_min", unit: "min", step: 5 },
      { key: "max_burn_min", unit: "min", step: 5 },
      { key: "min_pause_min", unit: "min", step: 5 },
      { key: "max_starts_per_day", unit: "", step: 1 },
      { key: "stove_block_setpoint_c", unit: "°C", step: 0.5 },
    ],
  },
  {
    group: "pgroup.softstart",
    params: [
      { key: "soft_start_min", unit: "min", step: 1 },
      { key: "self_off_wait_min", unit: "min", step: 5 },
      { key: "cold_min", unit: "min", step: 5 },
      { key: "cold_residual_c", unit: "°C", step: 1 },
    ],
  },
  {
    group: "pgroup.buffer",
    extra: "buffer",
    params: [
      { key: "dump_start_c", unit: "°C", step: 1 },
      { key: "dump_end_c", unit: "°C", step: 1 },
      { key: "dump_extra_k", unit: "K", step: 0.5 },
      { key: "dump_ramp_low_k", unit: "K", step: 1 },
      { key: "dump_ramp_high_k", unit: "K", step: 1 },
    ],
  },
  {
    group: "pgroup.warmup",
    extra: "warmup_scene",
    params: [
      { key: "warmup_extra_k", unit: "K", step: 0.5 },
      { key: "warmup_lead_min", unit: "min", step: 5 },
    ],
  },
  {
    group: "pgroup.openings",
    params: [
      { key: "opening_grace_min", unit: "min", step: 1 },
      { key: "opening_stop_min", unit: "min", step: 1 },
      { key: "opening_empty_room_min", unit: "min", step: 1 },
      { key: "opening_recovery_min", unit: "min", step: 1 },
      { key: "opening_check_min", unit: "min", step: 5 },
    ],
  },
  {
    group: "pgroup.sensors",
    params: [
      { key: "sensor_hold_min", unit: "min", step: 5 },
      { key: "sensor_alert_min", unit: "min", step: 5 },
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
  {
    group: "pgroup.pellets",
    params: [
      { key: "pellet_bag_kg", unit: "kg", step: 0.5 },
      { key: "pellet_capacity_kg", unit: "kg", step: 1 },
      { key: "pellet_rate_kg_h", unit: "kg/h", step: 0.05 },
      { key: "pellet_reminder_kg", unit: "kg", step: 0.5 },
    ],
  },
];

const GROUP_ICONS: Partial<Record<I18nKey, string>> = {
  "pgroup.stove": "mdi:fire",
  "pgroup.softstart": "mdi:radiator",
  "pgroup.buffer": "mdi:water-boiler",
  "pgroup.warmup": "mdi:home-thermometer-outline",
  "pgroup.openings": "mdi:window-open-variant",
  "pgroup.sensors": "mdi:access-point-network-off",
  "pgroup.power": "mdi:speedometer",
  "pgroup.radiators": "mdi:radiator",
  "pgroup.limits": "mdi:snowflake-thermometer",
  "pgroup.presence": "mdi:motion-sensor",
  "pgroup.pellets": "mdi:grain",
};

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
  static override properties = { ...EditorBase.properties, status: { attribute: false }, _learnBusy: { state: true } };
  declare status: Status | null;
  declare _learnBusy: boolean;

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
      <div class="sections">
        <details class="sect">
          <summary><ha-icon icon="mdi:fireplace"></ha-icon><span><b>${t("house.stove")}</b><small>${t("house.sect_stove_hint")}</small></span></summary>
          <div class="cols">
        <div>
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
        <div>
          <h4>${t("house.stove_functions")}</h4>
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
          </div>
        </details>
        <details class="sect">
          <summary><ha-icon icon="mdi:weather-partly-cloudy"></ha-icon><span><b>${t("house.environment")}</b><small>${t("house.sect_env_hint")}</small></span></summary>
        <div>
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
        </details>
        <details class="sect">
          <summary><ha-icon icon="mdi:account-group-outline"></ha-icon><span><b>${t("house.people")}</b><small>${t("house.sect_people_hint")}</small></span></summary>
        <div>
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
        </details>
        ${this._renderMessages()}
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

  private _msg(): Notifications {
    return { ...DEFAULT_NOTIFICATIONS, ...(this.config.notifications ?? {}) };
  }

  private _setMsg(mutate: (n: Notifications) => void) {
    this._set((x) => {
      const n = { ...DEFAULT_NOTIFICATIONS, ...(x.notifications ?? {}) };
      mutate(n);
      x.notifications = n;
    });
  }

  private _renderMessages() {
    const t = this.t;
    const n = this._msg();
    const kinds: NotifyKind[] = ["opening", "opening_check", "sensor", "pellets", "stove_error", "overheat", "too_warm"];
    const quietOk = quietValid(n);
    const minutes = (key: "opening_delay_min" | "repeat_min" | "ventilate_max_min", min: number, max: number, step: number) => {
      const hintKey = `msg.${key}_hint` as I18nKey;
      return html`<label class="param">
        <span class="ptext">
          <span class="lbl">${t(`msg.${key}` as I18nKey)}</span>
          <span class="hint">${t(hintKey)}</span>
        </span>
        <span class="pinput">
          <input
            type="number"
            ?disabled=${this.readonly}
            min=${min}
            max=${max}
            step=${step}
            placeholder=${String(DEFAULT_NOTIFICATIONS[key])}
            .value=${String(n[key])}
            @change=${(e: Event) => {
              const v = readNumber(e);
              this._setMsg((x) => (x[key] = v === null ? DEFAULT_NOTIFICATIONS[key] : Math.max(min, Math.min(max, v))));
            }}
          />
          <span class="unit">min</span>
        </span>
      </label>`;
    };
    const time = (key: "quiet_start" | "quiet_end") => html`<label class="field">
      <span class="lbl">${t(`msg.${key}` as I18nKey)}</span>
      <input
        class=${quietOk ? "" : "invalid"}
        ?disabled=${this.readonly}
        inputmode="numeric"
        placeholder="HH:MM"
        .value=${n[key]}
        @change=${(e: Event) => {
          const raw = (e.target as HTMLInputElement).value.trim();
          this._setMsg((x) => (x[key] = raw ? normalizeTimeInput(raw) : ""));
        }}
      />
    </label>`;
    return html`<details class="sect" ?open=${!quietOk}>
      <summary><ha-icon icon="mdi:bell-cog-outline"></ha-icon><span><b>${t("house.messages")}</b><small>${t("house.messages_hint")}</small></span></summary>
      <div class="cols">
        <div>
          <div class="lbl">${t("house.msg_kinds")}</div>
          <div class="notify">
            ${kinds.map(
              (k) => html`<label class="check">
                <input
                  type="checkbox"
                  ?disabled=${this.readonly}
                  .checked=${n[k]}
                  @change=${(e: Event) => {
                    const on = (e.target as HTMLInputElement).checked;
                    this._setMsg((x) => (x[k] = on));
                  }}
                />
                <span>${t(`msg.${k}` as I18nKey)}</span>
              </label>`,
            )}
          </div>
          <div class="lbl" style="margin-top:12px">${t("msg.quiet")}</div>
          <div class="hint">${t("msg.quiet_hint")}</div>
          <div class="quiet">${time("quiet_start")}${time("quiet_end")}</div>
          ${quietOk ? nothing : html`<div class="error-text">${t("msg.quiet_invalid")}</div>`}
          <label class="check" style="margin-top:8px">
            <input
              type="checkbox"
              ?disabled=${this.readonly}
              .checked=${n.quiet_hold}
              @change=${(e: Event) => {
                const on = (e.target as HTMLInputElement).checked;
                this._setMsg((x) => (x.quiet_hold = on));
              }}
            />
            <span>${t("msg.quiet_hold")}</span>
          </label>
        </div>
        <div>
          ${minutes("opening_delay_min", 0, 240, 1)} ${minutes("repeat_min", 0, 1440, 5)} ${minutes("ventilate_max_min", 5, 240, 5)}
        </div>
      </div>
    </details>`;
  }

  private _renderParameters() {
    const t = this.t;
    const params = this.config.parameters ?? {};
    const extra = Object.keys(params).filter((k) => !KNOWN.has(k));
    const groups = [...PARAM_GROUPS];
    if (extra.length) groups.push({ group: "pgroup.other", params: extra.map((key) => ({ key, unit: guessUnit(key), step: 0.1 })) });
    return html`<h3 style="margin:20px 0 4px">${t("house.parameters")}</h3>
      <div class="hint" style="margin-bottom:8px">${t("house.parameters_hint")}</div>
      <div class="sections">
        ${groups.map((g) => {
          const present = g.params.filter((p) => p.key in params || this.defaults?.parameters?.[p.key] !== undefined);
          if (!present.length && !g.extra) return nothing;
          const bad = present.some((p) => invalidParameters(this.config, this.defaults).includes(p.key));
          const hintKey = `${g.group}_hint` as I18nKey;
          return html`<details class="sect" ?open=${bad}>
            <summary>
              <ha-icon icon=${GROUP_ICONS[g.group] ?? "mdi:tune-variant"}></ha-icon>
              <span><b>${t(g.group)}</b>${t(hintKey) !== hintKey ? html`<small>${t(hintKey)}</small>` : nothing}</span>
              ${bad ? html`<ha-icon class="bad" icon="mdi:alert-circle"></ha-icon>` : nothing}
            </summary>
            ${g.extra === "warmup_scene" ? this._renderWarmupScene() : nothing}
            ${g.extra === "buffer" ? this._renderBuffer() : nothing}
            <div class="params">${present.map((p) => this._renderParam(p))}</div>
          </details>`;
        })}
      </div>`;
  }

  private _flag(key: "has_buffer" | "dump_learn", def: boolean) {
    const t = this.t;
    const on = this.config.stove[key] ?? def;
    return html`<label class="check" style="margin-top:8px">
      <input
        type="checkbox"
        ?disabled=${this.readonly}
        .checked=${on}
        @change=${(e: Event) => {
          const v = (e.target as HTMLInputElement).checked;
          this._set((x) => (x.stove[key] = v));
        }}
      />
      <span><b>${t(`house.${key}` as I18nKey)}</b><br /><small class="hint">${t(`house.${key}_hint` as I18nKey)}</small></span>
    </label>`;
  }

  private _renderBuffer() {
    const t = this.t;
    const learn = this.status?.learn;
    const fmt = (v: number | null | undefined, unit: string, digits = 1) =>
      v === null || v === undefined ? "–" : `${formatNumber(v, this.lang, digits)} ${unit}`;
    const row = (key: "selfoff_c" | "afterheat_k" | "cool_k_min", unit: string, digits = 1) =>
      html`<tr>
        <td>${t(`learn.${key}` as I18nKey)}</td>
        <td><b>${fmt(learn?.values[key], unit, digits)}</b></td>
        <td class="muted">${learn ? `${learn.samples[key]} ${t("learn.samples")}` : ""}</td>
      </tr>`;
    return html`<div style="margin-top:4px">
      <div class="hint">${t("house.buffer_explain")}</div>
      ${this._flag("has_buffer", false)} ${this._flag("dump_learn", true)}
      <div class="lbl" style="margin-top:12px">${t("learn.title")}</div>
      <div class="hint">${t("learn.hint")}</div>
      ${learn
        ? html`<table class="learn">
              ${row("selfoff_c", "°C", 0)} ${row("afterheat_k", "K")} ${row("cool_k_min", "K/min", 2)}
              <tr>
                <td>${t("learn.dump_start_c")}</td>
                <td><b>${fmt(learn.dump_start_c, "°C", 0)}</b></td>
                <td class="muted">${t("learn.min_samples").replace("{n}", String(learn.min_samples))}</td>
              </tr>
            </table>
            <button
              class="secondary"
              style="margin-top:8px"
              ?disabled=${this.readonly || this._learnBusy || !this.hass}
              @click=${async () => {
                if (!confirm(t("learn.reset_confirm"))) return;
                this._learnBusy = true;
                try {
                  const st = await resetLearning(this.hass);
                  this.dispatchEvent(new CustomEvent("wr-status", { detail: st, bubbles: true, composed: true }));
                } finally {
                  this._learnBusy = false;
                }
              }}
            >
              ${t("learn.reset")}
            </button>`
        : html`<div class="muted">${t("learn.none")}</div>`}
    </div>`;
  }

  private _renderWarmupScene() {
    const t = this.t;
    const value = this.config.warmup_scene ?? "";
    return html`<label class="field" style="max-width:420px;margin-top:8px">
      <span class="lbl">${t("house.warmup_scene")}</span>
      <span class="hint">${t("house.warmup_scene_hint")}</span>
      <select
        ?disabled=${this.readonly}
        .value=${value}
        @change=${(e: Event) => {
          const v = (e.target as HTMLSelectElement).value;
          this._set((x) => (x.warmup_scene = v || null));
        }}
      >
        <option value="" ?selected=${!value}>${t("house.warmup_scene_auto")}</option>
        ${this.config.scenes.map((sc) => html`<option value=${sc.id} ?selected=${sc.id === value}>${sc.name}</option>`)}
      </select>
    </label>`;
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
      .sections {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      details.sect {
        background: var(--wr-card);
        border: 1px solid var(--wr-div);
        border-radius: var(--wr-radius);
        padding: 0 16px;
      }
      details.sect[open] {
        padding-bottom: 12px;
      }
      details.sect > summary {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        cursor: pointer;
        list-style: none;
      }
      details.sect > summary::-webkit-details-marker {
        display: none;
      }
      details.sect > summary::after {
        content: "";
        margin-left: auto;
        width: 8px;
        height: 8px;
        border-right: 2px solid var(--wr-text2);
        border-bottom: 2px solid var(--wr-text2);
        transform: rotate(45deg);
        transition: transform 0.2s;
        flex: none;
      }
      details.sect[open] > summary::after {
        transform: rotate(-135deg);
      }
      details.sect > summary > ha-icon {
        color: var(--wr-heat);
      }
      details.sect > summary ha-icon.bad {
        color: var(--wr-err);
      }
      details.sect > summary span {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      details.sect > summary small {
        color: var(--wr-text2);
        font-size: 12px;
      }
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
      .quiet {
        display: flex;
        gap: 12px;
      }
      .quiet .field {
        max-width: 120px;
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
