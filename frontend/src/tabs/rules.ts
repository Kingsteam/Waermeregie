// Reiter „Regeln“: Regeln des Besitzers aus Vorlagen (Satz in Klartext mit Eingabefeldern),
// die Zeile „Warum gerade so?“ und die Schutzregeln mit Schloss (docs/REGELN.md).
import { html, css, nothing, type TemplateResult } from "lit";
import type { I18nKey } from "../i18n";
import { baseStyles } from "../styles";
import type { ProtectedRule, Rule, RuleStatus, RuleTemplate, Status } from "../types";
import { clockFromIso, normalizeLimit, paramLimits } from "../util";
import { EditorBase, inputValue, readNumber } from "./editor-base";

const TEMPLATE_ORDER: RuleTemplate[] = ["nobody_home", "cold_outside", "wind", "forecast_drop"];
const ICONS: Record<RuleTemplate, string> = {
  nobody_home: "mdi:home-export-outline",
  cold_outside: "mdi:snowflake-thermometer",
  wind: "mdi:weather-windy",
  forecast_drop: "mdi:trending-down",
};

type TemplateLimits = Record<string, Record<string, [number, number, number]>>;

/** Grenzen und Standardwerte der Vorlagen aus `defaults.limits.rule_templates`. */
export function templateLimits(defaults: { limits?: unknown } | null | undefined): TemplateLimits {
  const raw = (defaults?.limits as { rule_templates?: TemplateLimits } | undefined)?.rule_templates;
  return raw && typeof raw === "object" ? raw : {};
}

/** Neue Regel aus einer Vorlage mit den Standardwerten des Servers. */
export function newRule(template: RuleTemplate, limits: TemplateLimits, sceneIds: string[]): Rule {
  const params: Rule["params"] = {};
  for (const [key, lim] of Object.entries(limits[template] ?? {})) params[key] = lim[2];
  if (template === "nobody_home") {
    params.scene = sceneIds.includes("abwesend") ? "abwesend" : (sceneIds[0] ?? "");
    params.require_lock = false;
    params.lock = null;
  }
  if (template === "wind") params.wind_entity = null;
  return { id: template, template, enabled: true, trial_until: null, params };
}

/** Probleme, die das Speichern verhindern sollen (Anzahl). */
export function ruleProblems(rules: Rule[] | undefined, limits: TemplateLimits): number {
  let n = 0;
  for (const r of rules ?? []) {
    for (const [key, lim] of Object.entries(limits[r.template] ?? {})) {
      const v = r.params[key];
      if (typeof v !== "number" || !Number.isFinite(v) || v < lim[0] || v > lim[1]) n++;
    }
    if (r.template === "nobody_home" && r.params.require_lock && !r.params.lock) n++;
  }
  return n;
}

export class WrRulesEditor extends EditorBase {
  static override properties = {
    ...EditorBase.properties,
    status: { attribute: false },
    _unlock: { state: true },
    _unlocked: { state: true },
  };

  declare status: Status | null;
  declare _unlock: string | null;
  declare _unlocked: string | null;

  constructor() {
    super();
    this.status = null;
    this._unlock = null;
    this._unlocked = null;
  }

  private get _limits(): TemplateLimits {
    return templateLimits(this.defaults);
  }

  private _update(id: string, mutate: (r: Rule) => void) {
    this.change((c) => {
      const r = (c.rules ?? []).find((x) => x.id === id);
      if (r) mutate(r);
    });
  }

  private _num(rule: Rule, key: string, unit: string): TemplateResult {
    const lim = this._limits[rule.template]?.[key];
    const value = rule.params[key];
    const bad = typeof value !== "number" || (lim ? value < lim[0] || value > lim[1] : false);
    const label = this.t(`rule.p.${key}` as I18nKey);
    return html`<span class="inl"
      ><input
        type="text"
        inputmode="decimal"
        class=${bad ? "bad" : ""}
        aria-label=${label}
        title=${lim ? `${label}: ${lim[0]} – ${lim[1]} ${unit}` : label}
        .value=${typeof value === "number" ? String(value).replace(".", this.lang === "de" ? "," : ".") : ""}
        ?disabled=${this.readonly}
        @change=${(e: Event) => this._update(rule.id, (r) => (r.params[key] = readNumber(e) ?? Number.NaN))}
      /><span class="unit">${unit}</span></span
    >`;
  }

  private _sentence(rule: Rule): TemplateResult {
    const t = this.t;
    const p = rule.params;
    const effects = html`${t("rule.s.targets")} ${this._num(rule, "target_delta_k", "K")} ${t("rule.s.higher_and")}
    ${this._num(rule, "lead_min", "min")} ${t("rule.s.earlier")}`;
    switch (rule.template) {
      case "nobody_home":
        return html`${t("rule.s.nobody_if")}
          <label class="chk"
            ><input
              type="checkbox"
              .checked=${!!p.require_lock}
              ?disabled=${this.readonly}
              @change=${(e: Event) => this._update(rule.id, (r) => (r.params.require_lock = (e.target as HTMLInputElement).checked))}
            />${t("rule.s.and_locked")}</label
          >, ${t("rule.s.since")} ${this._num(rule, "after_min", "min")}, ${t("rule.s.then_scene")}
          <select
            aria-label=${t("rule.p.scene")}
            ?disabled=${this.readonly}
            @change=${(e: Event) => this._update(rule.id, (r) => (r.params.scene = inputValue(e)))}
          >
            ${this.config.scenes.map((s) => html`<option value=${s.id} ?selected=${p.scene === s.id}>${s.name}</option>`)}</select
          >. ${t("rule.s.nobody_back")}
          ${p.require_lock
            ? html`<div class="pick">
                <wr-entity-picker
                  .hass=${this.hass}
                  .lang=${this.lang}
                  ?disabled=${this.readonly}
                  ?invalid=${!p.lock}
                  .domains=${["lock", "binary_sensor"]}
                  .deviceClasses=${["lock"]}
                  .value=${p.lock ?? null}
                  .label=${t("rule.p.lock")}
                  .helper=${t("rule.p.lock_hint")}
                  @value-changed=${(e: CustomEvent) => this._update(rule.id, (r) => (r.params.lock = e.detail.value ?? null))}
                ></wr-entity-picker>
              </div>`
            : nothing}
          ${this.config.persons.length || this.config.pet ? nothing : html`<div class="warn">${t("rule.no_persons")}</div>`}`;
      case "cold_outside":
        return html`${t("rule.s.cold_if")} ${this._num(rule, "below_c", "°C")} ${t("rule.s.is_then")} ${effects}`;
      case "wind":
        return html`${t("rule.s.wind_if")} ${this._num(rule, "above_kmh", "km/h")} ${t("rule.s.is_then")} ${effects}
          ${this.config.weather || p.wind_entity ? nothing : html`<div class="warn">${t("rule.no_weather")}</div>`}`;
      case "forecast_drop":
        return html`${t("rule.s.fc_if")} ${this._num(rule, "hours", "h")} ${t("rule.s.fc_by")} ${this._num(rule, "drop_k", "K")}
          ${t("rule.s.fc_then")} ${effects}
          ${this.config.weather ? nothing : html`<div class="warn">${t("rule.no_weather")}</div>`}`;
    }
  }

  private _statePill(st: RuleStatus | undefined, rule: Rule): TemplateResult {
    const t = this.t;
    if (!st) return html`<span class="pill idle">${t("rule.state.unsaved")}</span>`;
    const cls = st.state === "active" ? "act" : st.state === "trial" || st.state === "trial_done" ? "try" : "idle";
    return html`<span class="pill ${cls}">${t(`rule.state.${st.state}` as I18nKey)}</span>
      <span>${st.detail}</span>
      ${st.state === "trial" || st.state === "trial_done" ? html`<span>· ${t("rule.hits", { n: String(st.hits) })}</span>` : nothing}
      ${st.last && st.state !== "active" ? html`<span>· ${t("rule.last", { time: clockFromIso(st.last) })}</span>` : nothing}
      ${rule.trial_until && st.state === "trial" ? html`<span>· ${t("rule.trial_until", { time: clockFromIso(rule.trial_until) })}</span>` : nothing}`;
  }

  private _renderRule(rule: Rule): TemplateResult {
    const t = this.t;
    const st = (this.status?.rules ?? []).find((s) => s.id === rule.id);
    const trial = !!rule.trial_until;
    return html`<div class="card rule ${rule.enabled ? "" : "off"}">
      <div class="head">
        <ha-icon icon=${ICONS[rule.template]}></ha-icon>
        <h3>${t(`rule.name.${rule.template}` as I18nKey)}</h3>
        <span class="spacer"></span>
        <label class="chk sw"
          ><input
            type="checkbox"
            role="switch"
            .checked=${rule.enabled}
            ?disabled=${this.readonly}
            @change=${(e: Event) => this._update(rule.id, (r) => (r.enabled = (e.target as HTMLInputElement).checked))}
          />${t(rule.enabled ? "rule.on" : "rule.off")}</label
        >
      </div>
      <div class="sent">${this._sentence(rule)}</div>
      <div class="meta">${this._statePill(st, rule)}</div>
      ${this.readonly
        ? nothing
        : html`<div class="row">
            ${trial
              ? html`<button
                  class="primary"
                  @click=${() =>
                    this._update(rule.id, (r) => {
                      r.trial_until = null;
                      r.enabled = true;
                    })}
                >
                  ${t("rule.arm")}
                </button>`
              : html`<button
                  @click=${() =>
                    this._update(rule.id, (r) => {
                      r.trial_until = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
                      r.enabled = true;
                    })}
                >
                  ${t("rule.trial_day")}
                </button>`}
            <button class="danger" @click=${() => this.change((c) => (c.rules = (c.rules ?? []).filter((r) => r.id !== rule.id)))}>${t("rule.remove")}</button>
          </div>`}
    </div>`;
  }

  private _renderProtected(p: ProtectedRule): TemplateResult {
    const t = this.t;
    if (p.fixed || !p.param) {
      return html`<div class="li"><ha-icon icon="mdi:lock"></ha-icon><span class="ptxt">${p.text}</span><span class="pill lock">${t("rule.fixed")}</span></div>`;
    }
    const lim = normalizeLimit(paramLimits(this.defaults)[p.param]);
    const value = this.config.parameters[p.param];
    const changed = value !== p.value;
    return html`<div class="li">
        <ha-icon icon="mdi:lock-open-variant-outline"></ha-icon>
        <span class="ptxt">${p.text}${changed ? html` <b>→ ${value} ${p.unit ?? ""}</b>` : nothing}</span>
        ${this.readonly ? nothing : html`<button @click=${() => ((this._unlock = p.key), (this._unlocked = null))}>${t("rule.change")}</button>`}
      </div>
      ${this._unlock === p.key
        ? html`<div class="warnbox">
            <div><b>${t("rule.warn_title")}</b> ${p.warning ?? ""}</div>
            ${this._unlocked === p.key
              ? html`<label class="field"
                    ><span class="lbl">${t("rule.new_value", { min: String(lim.min ?? ""), max: String(lim.max ?? ""), unit: p.unit ?? "" })}</span>
                    <input
                      type="text"
                      inputmode="decimal"
                      style="width:110px"
                      .value=${String(value)}
                      @change=${(e: Event) => {
                        const n = readNumber(e);
                        if (n !== null) this.change((c) => (c.parameters[p.param as string] = n));
                      }}
                  /></label>
                  <div class="row"><button @click=${() => (this._unlock = null)}>${t("close")}</button></div>`
              : html`<div class="row">
                  <button @click=${() => (this._unlock = null)}>${t("rule.warn_no")}</button>
                  <button class="danger" @click=${() => (this._unlocked = p.key)}>${t("rule.warn_yes")}</button>
                </div>`}
          </div>`
        : nothing}`;
  }

  protected override render() {
    const t = this.t;
    const rules = this.config.rules ?? [];
    const free = TEMPLATE_ORDER.filter((tpl) => !rules.some((r) => r.template === tpl));
    const why = this.status?.why ?? [];
    const prot = this.status?.protected ?? [];
    return html`
      <div class="hint">${t("rules.hint")}</div>
      ${why.length
        ? html`<div class="why"><b>${t("rules.why")}</b> ${why.join(" · ")}</div>`
        : nothing}
      <h3>${t("rules.yours")}</h3>
      ${rules.length ? rules.map((r) => this._renderRule(r)) : html`<div class="muted">${t("rules.none")}</div>`}
      ${free.length && !this.readonly
        ? html`<div class="row">
            ${free.map(
              (tpl) =>
                html`<button
                  @click=${() =>
                    this.change((c) => (c.rules = [...(c.rules ?? []), newRule(tpl, this._limits, c.scenes.map((s) => s.id))]))}
                >
                  <ha-icon icon=${ICONS[tpl]}></ha-icon> ${t("rules.add", { name: t(`rule.name.${tpl}` as I18nKey) })}
                </button>`,
            )}
          </div>`
        : nothing}
      <h3>${t("rules.protected")}</h3>
      <div class="hint">${t("rules.protected_hint")}</div>
      <div class="card locked">${prot.map((p) => this._renderProtected(p))}</div>
    `;
  }

  static override styles = [
    baseStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      h3 {
        margin: 8px 0 0;
      }
      .why {
        border-left: 3px solid var(--wr-heat);
        background: color-mix(in srgb, var(--wr-heat) 10%, transparent);
        border-radius: 0 8px 8px 0;
        padding: 10px 14px;
      }
      .rule {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .rule.off .sent,
      .rule.off .meta {
        opacity: 0.55;
      }
      .head {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .head h3 {
        margin: 0;
      }
      .sent {
        line-height: 2.1;
      }
      .inl {
        white-space: nowrap;
      }
      .inl input {
        width: 58px;
        text-align: right;
        padding: 3px 6px;
      }
      .inl .unit {
        margin-left: 3px;
        color: var(--wr-text2);
      }
      .sent select {
        width: auto;
        display: inline-block;
        padding: 3px 6px;
      }
      .chk input {
        width: auto;
        margin: 0;
      }
      input.bad {
        border-color: var(--wr-err);
      }
      .chk {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        white-space: nowrap;
      }
      .pick {
        margin-top: 8px;
        line-height: 1.4;
      }
      .warn {
        color: var(--wr-warn);
        font-size: 13px;
        line-height: 1.4;
        margin-top: 4px;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 4px 8px;
        align-items: center;
        font-size: 13px;
        color: var(--wr-text2);
      }
      .pill {
        display: inline-block;
        padding: 2px 9px;
        border-radius: 999px;
        font-size: 12.5px;
        white-space: nowrap;
        border: 1px solid var(--wr-div);
      }
      .pill.act {
        background: color-mix(in srgb, var(--wr-heat) 14%, transparent);
        border-color: var(--wr-heat);
        color: var(--wr-text);
      }
      .pill.try {
        background: color-mix(in srgb, var(--wr-primary) 14%, transparent);
        border-color: var(--wr-primary);
        color: var(--wr-text);
      }
      .row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }
      .locked {
        padding: 0;
      }
      .li {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 10px 14px;
        border-top: 1px solid var(--wr-div);
        flex-wrap: wrap;
      }
      .li:first-child {
        border-top: 0;
      }
      .li ha-icon {
        color: var(--wr-text2);
        --mdc-icon-size: 18px;
      }
      .ptxt {
        flex: 1;
        min-width: 180px;
      }
      .warnbox {
        border: 1px solid var(--wr-err);
        border-radius: 10px;
        margin: 0 14px 12px;
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .warnbox b {
        color: var(--wr-err);
      }
    `,
  ];
}

if (!customElements.get("wr-rules-editor")) customElements.define("wr-rules-editor", WrRulesEditor);
