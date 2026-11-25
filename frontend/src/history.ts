// <wr-history>: Verlauf der Räume und des Kesselwassers als zwei Grafiken
// untereinander (je eine eigene y-Achse, gemeinsame Zeitachse, gemeinsamer Zeiger).
import { LitElement, css, html, nothing, svg, type TemplateResult } from "lit";
import { buildMulti, nearestIndex, type MultiModel, type SeriesDef } from "./charts";
import { translator, type Lang, type T } from "./i18n";
import type { HistoryPoint } from "./types";
import { clockFromIso, formatNumber } from "./util";

const STORE_KEY = "wr-history-hidden";

function loadHidden(): Set<string> {
  try {
    const raw = JSON.parse(window.localStorage.getItem(STORE_KEY) ?? "[]");
    return new Set(Array.isArray(raw) ? raw.filter((x) => typeof x === "string") : []);
  } catch {
    return new Set();
  }
}

/** Höchstens so viele Räume als eigene Linie (feste Farbfolge, nie wiederholt). */
export const MAX_ROOM_LINES = 8;
const WIDTH = 600;

export interface HistoryRoom {
  id: string;
  name: string;
}

export class WrHistory extends LitElement {
  static override properties = {
    points: { attribute: false },
    rooms: { attribute: false },
    lang: { type: String },
    dark: { type: Boolean, reflect: true },
    _hover: { state: true },
    _hidden: { state: true },
  };

  declare points: HistoryPoint[] | null;
  declare rooms: HistoryRoom[];
  declare lang: Lang;
  declare dark: boolean;
  declare _hover: number | null;
  /** ausgeblendete Linien (Schlüssel wie "room:<id>", "house", "target", "water") */
  declare _hidden: Set<string>;

  constructor() {
    super();
    this.points = null;
    this.rooms = [];
    this.lang = "de";
    this.dark = false;
    this._hover = null;
    this._hidden = loadHidden();
  }

  private _toggle(key: string) {
    const next = new Set(this._hidden);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    this._hidden = next;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify([...next]));
    } catch {
      // ohne Speicher gilt die Auswahl nur bis zum Neuladen
    }
  }

  private _chip(key: string, cls: string, label: string): TemplateResult {
    const on = !this._hidden.has(key);
    return html`<button class="chip ${on ? "" : "off"}" aria-pressed=${on ? "true" : "false"} @click=${() => this._toggle(key)}>
      <i class="lg ${cls}"></i>${label}
    </button>`;
  }

  private get _t(): T {
    return translator(this.lang);
  }

  private _move(e: PointerEvent, m: MultiModel) {
    const plot = e.currentTarget as HTMLElement;
    const rect = plot.getBoundingClientRect();
    const pl = parseFloat(getComputedStyle(plot).paddingLeft) || 0;
    const inner = Math.max(1, rect.width - pl);
    const x = ((e.clientX - rect.left - pl) / inner) * WIDTH;
    this._hover = nearestIndex(m.xs, x);
  }

  private _chart(m: MultiModel, height: number, label: string, classes: Record<string, string>): TemplateResult {
    const i = this._hover !== null && this._hover < m.xs.length ? this._hover : null;
    const pos = (x: number) => `calc(var(--pl) + (100% - var(--pl)) * ${x / WIDTH})`;
    return html`<div
      class="plot"
      @pointermove=${(e: PointerEvent) => this._move(e, m)}
      @pointerdown=${(e: PointerEvent) => this._move(e, m)}
      @pointerleave=${() => (this._hover = null)}
    >
      <svg viewBox="0 0 ${WIDTH} ${height}" preserveAspectRatio="none" role="img" aria-label=${label} style="height:${height}px">
        ${m.bands.map((b) => svg`<rect class="band" x=${b.x} y=${m.top} width=${b.w} height=${m.bottom - m.top}></rect>`)}
        ${m.yTicks.map((tk) => svg`<line class="grid" x1=${m.left} x2=${m.right} y1=${tk.y} y2=${tk.y}></line>`)}
        ${m.series.map((s) => (s.path ? svg`<path class="line ${classes[s.key] ?? ""}" d=${s.path}></path>` : nothing))}
        ${i !== null ? svg`<line class="cross" x1=${m.xs[i]} x2=${m.xs[i]} y1=${m.top} y2=${m.bottom}></line>` : nothing}
      </svg>
      ${i !== null
        ? m.series.map((s) => {
            const v = s.values[i];
            if (v === null || classes[s.key] === "target") return nothing;
            return html`<span class="pt ${classes[s.key] ?? ""}" style="left:${pos(m.xs[i])};top:${(m.y(v) / height) * 100}%"></span>`;
          })
        : nothing}
      <div class="ylabels" aria-hidden="true">
        ${m.yTicks.map((tk) => html`<span style="top:${(tk.y / height) * 100}%">${tk.value}°</span>`)}
      </div>
      <div class="xlabels" aria-hidden="true">${m.xTicks.map((tk) => html`<span style="left:${pos(tk.x)}">${tk.label}</span>`)}</div>
    </div>`;
  }

  protected override render() {
    const t = this._t;
    const shown = (this.rooms ?? []).slice(0, MAX_ROOM_LINES);
    const hidden = (this.rooms ?? []).length - shown.length;
    const vis = (key: string) => !this._hidden.has(key);
    const allDefs: SeriesDef[] = [
      { key: "target", get: (p) => p.target_c, step: true },
      ...shown.map((r) => ({ key: `room:${r.id}`, get: (p: HistoryPoint) => p.rooms?.[r.id] })),
      { key: "house", get: (p) => p.house_c },
    ];
    const roomDefs = allDefs.filter((d) => vis(d.key));
    const roomClasses: Record<string, string> = { target: "target", house: "house" };
    shown.forEach((r, i) => (roomClasses[`room:${r.id}`] = `s${i + 1}`));
    const box = { width: WIDTH, padLeft: 4, padRight: 4, padTop: 8, padBottom: 20 };
    const rm = buildMulti(this.points, { ...box, height: 200 }, roomDefs);
    const waterAll = buildMulti(this.points, { ...box, height: 130 }, [{ key: "water", get: (p) => p.water_c }]);
    const wm = vis("water") ? waterAll : null;
    const chips = html`<div class="chips" role="group" aria-label=${t("history.show")}>
      ${shown.map((r, k) => this._chip(`room:${r.id}`, `s${k + 1}`, r.name))}
      ${this._chip("house", "house", t("history.house"))} ${this._chip("target", "target", t("chart.target"))}
      ${this._chip("water", "water", t("history.water"))}
    </div>`;
    if (!rm && !wm)
      return html`${chips}
        <p class="muted">${t(roomDefs.length || vis("water") ? "history.empty" : "history.all_hidden")}</p>`;
    const num = (v: number | null | undefined) => `${formatNumber(v, this.lang, 1)} °C`;
    const ref = rm ?? wm;
    const i = this._hover !== null && ref && this._hover < ref.times.length ? this._hover : null;
    const val = (m: MultiModel | null, key: string) => (i === null ? null : (m?.series.find((s) => s.key === key)?.values[i] ?? null));
    const tipLeft = i !== null && ref ? ref.xs[i] / WIDTH : 0;
    return html`
      ${chips}
      <div class="area">
      ${rm
        ? html`<figure>
            <h4>${t("history.rooms")}</h4>
            ${this._chart(rm, 200, t("history.rooms_aria"), roomClasses)}
            <figcaption class="legend">
              <span><i class="lg band"></i>${t("chart.burning")}</span>
            </figcaption>
            ${hidden > 0 ? html`<div class="note">${t("history.more_rooms", { n: String(hidden) })}</div>` : nothing}
          </figure>`
        : nothing}
      ${wm
        ? html`<figure>
            <h4>${t("history.water")}</h4>
            ${this._chart(wm, 130, t("history.water_aria"), { water: "water" })}
          </figure>`
        : vis("water") && !waterAll
          ? html`<p class="muted">${t("history.no_water")}</p>`
          : nothing}
      ${i !== null && ref
        ? html`<div class="tip ${tipLeft > 0.6 ? "left" : ""}" style="--x:${tipLeft}" role="status">
            <b>${clockFromIso(ref.times[i])}</b>
            ${rm
              ? html`${shown.map((r, k) => {
                    if (!vis(`room:${r.id}`)) return nothing;
                    const v = val(rm, `room:${r.id}`);
                    return v === null ? nothing : html`<div><i class="lg s${k + 1}"></i><span>${r.name}</span><em>${num(v)}</em></div>`;
                  })}
                  ${val(rm, "house") !== null ? html`<div><i class="lg house"></i><span>${t("history.house")}</span><em>${num(val(rm, "house"))}</em></div>` : nothing}
                  ${val(rm, "target") !== null ? html`<div><i class="lg target"></i><span>${t("chart.target")}</span><em>${num(val(rm, "target"))}</em></div>` : nothing}`
              : nothing}
            ${val(wm, "water") !== null ? html`<div><i class="lg water"></i><span>${t("history.water_short")}</span><em>${num(val(wm, "water"))}</em></div>` : nothing}
          </div>`
        : nothing}
      </div>
    `;
  }

  static override styles = css`
    :host {
      display: block;
      position: relative;
      /* Feste Farbfolge der Räume (geprüft auf Unterscheidbarkeit, hell). Bewusste Ausnahme vom
         GUI-Konzept (nur Theme-Farben), vom Besitzer freigegeben: 8 Linien brauchen 8 klar
         unterscheidbare Farben, die das Theme nicht hat. */
      --s1: #2a78d6;
      --s2: #eb6834;
      --s3: #1baf7a;
      --s4: #eda100;
      --s5: #e87ba4;
      --s6: #008300;
      --s7: #6250d6;
      --s8: #e34948;
    }
    :host([dark]) {
      --s1: #3987e5;
      --s2: #d95926;
      --s3: #199e70;
      --s4: #c98500;
      --s5: #d55181;
      --s6: #0ca30c;
      --s7: #9085e9;
      --s8: #e66767;
    }
    figure {
      margin: 0 0 14px;
    }
    h4 {
      margin: 0 0 6px;
      font-size: 13px;
      font-weight: 500;
      color: var(--wr-text2);
    }
    .muted,
    .note {
      color: var(--wr-text2);
      font-size: 13px;
      margin: 4px 0;
    }
    .plot {
      position: relative;
      --pl: 34px;
      padding-left: var(--pl);
      touch-action: pan-y;
    }
    svg {
      display: block;
      width: 100%;
      overflow: visible;
    }
    .band {
      fill: color-mix(in srgb, var(--wr-heat) 14%, transparent);
    }
    .grid {
      stroke: var(--wr-div);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .cross {
      stroke: var(--wr-text2);
      stroke-width: 1;
      vector-effect: non-scaling-stroke;
    }
    .line {
      fill: none;
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
      vector-effect: non-scaling-stroke;
    }
    .line.house {
      stroke: var(--wr-text);
      stroke-width: 3;
    }
    .line.target {
      stroke: var(--wr-text2);
      stroke-width: 1.5;
      stroke-dasharray: 5 4;
    }
    .line.water {
      stroke: var(--wr-heat);
    }
    .line.s1 { stroke: var(--s1); }
    .line.s2 { stroke: var(--s2); }
    .line.s3 { stroke: var(--s3); }
    .line.s4 { stroke: var(--s4); }
    .line.s5 { stroke: var(--s5); }
    .line.s6 { stroke: var(--s6); }
    .line.s7 { stroke: var(--s7); }
    .line.s8 { stroke: var(--s8); }
    .pt {
      position: absolute;
      width: 9px;
      height: 9px;
      margin: -6.5px 0 0 -6.5px;
      border-radius: 50%;
      border: 2px solid var(--wr-card);
      pointer-events: none;
    }
    .pt.house, .lg.house { background: var(--wr-text); }
    .pt.water, .lg.water { background: var(--wr-heat); }
    .pt.s1, .lg.s1 { background: var(--s1); }
    .pt.s2, .lg.s2 { background: var(--s2); }
    .pt.s3, .lg.s3 { background: var(--s3); }
    .pt.s4, .lg.s4 { background: var(--s4); }
    .pt.s5, .lg.s5 { background: var(--s5); }
    .pt.s6, .lg.s6 { background: var(--s6); }
    .pt.s7, .lg.s7 { background: var(--s7); }
    .pt.s8, .lg.s8 { background: var(--s8); }
    .ylabels span,
    .xlabels span {
      position: absolute;
      font-size: 11px;
      color: var(--wr-text2);
      line-height: 1;
      pointer-events: none;
    }
    .ylabels span {
      left: 0;
      transform: translateY(-50%);
    }
    .xlabels span {
      bottom: 3px;
      transform: translateX(-50%);
    }
    .area {
      position: relative;
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 0 0 12px;
    }
    .chip {
      font: inherit;
      font-size: 12px;
      color: var(--wr-text);
      background: none;
      border: 2px solid var(--wr-border);
      border-radius: 999px;
      padding: 5px 10px;
      min-height: 30px;
      cursor: pointer;
    }
    .chip.off {
      color: var(--wr-text2);
      text-decoration: line-through;
    }
    .chip.off .lg {
      opacity: 0.3;
    }
    .chip:focus-visible {
      outline: 2px solid var(--wr-accent);
      outline-offset: 2px;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 14px;
      font-size: 12px;
      color: var(--wr-text2);
      margin-top: 6px;
    }
    .lg {
      display: inline-block;
      width: 14px;
      height: 3px;
      margin-right: 5px;
      vertical-align: 3px;
      border-radius: 2px;
    }
    .lg.target {
      height: 0;
      background: none;
      border-top: 2px dashed var(--wr-text2);
    }
    .lg.band {
      height: 10px;
      vertical-align: -1px;
      background: color-mix(in srgb, var(--wr-heat) 25%, transparent);
    }
    .tip {
      position: absolute;
      top: 26px;
      left: calc(34px + (100% - 34px) * var(--x) + 12px);
      z-index: 2;
      min-width: 150px;
      padding: 8px 10px;
      border-radius: 8px;
      border: 2px solid var(--wr-border);
      background: var(--wr-card);
      color: var(--wr-text);
      font-size: 12px;
      box-shadow: 0 2px 8px color-mix(in srgb, var(--wr-text) 18%, transparent);
      pointer-events: none;
    }
    .tip.left {
      left: auto;
      right: calc((100% - 34px) * (1 - var(--x)) + 12px);
    }
    .tip div {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-top: 3px;
    }
    .tip span {
      flex: 1;
      color: var(--wr-text2);
    }
    .tip em {
      font-style: normal;
      font-variant-numeric: tabular-nums;
      margin-left: 10px;
    }
  `;
}

export function defineHistory(): void {
  const registry = window.customElements;
  if (!registry.get("wr-history")) registry.define("wr-history", WrHistory);
}

declare global {
  interface HTMLElementTagNameMap {
    "wr-history": WrHistory;
  }
}
