// Grafiken als SVG (Lit-Vorlagen): Haus mit Ofen, Temperaturverlauf, Pelletbehälter.
import { css, html, nothing, svg, type TemplateResult } from "lit";
import { buildChart } from "./charts";
import type { T } from "./i18n";
import type { HistoryPoint } from "./types";
import { formatNumber } from "./util";

/** Haus mit Ofen; die Flamme flackert, wenn der Ofen brennt. */
export function renderHouseArt(opts: { burning: boolean; warm: boolean; size?: number }): TemplateResult {
  const size = opts.size ?? 88;
  return html`<svg
    class="house-art ${opts.burning ? "burning" : ""} ${opts.warm ? "warm" : ""}"
    width=${size}
    height=${size}
    viewBox="0 0 100 100"
    aria-hidden="true"
  >
    <path class="glow" d="M50 18 L88 50 V88 H12 V50 Z" />
    <path class="walls" d="M14 50 V88 H86 V50" />
    <path class="roof" d="M6 54 L50 16 L94 54" />
    <rect class="chimney" x="66" y="24" width="9" height="16" rx="1.5" />
    <rect class="stove" x="34" y="56" width="32" height="32" rx="4" />
    <rect class="window" x="40" y="62" width="20" height="14" rx="2" />
    <g class="flame">
      <path class="f1" d="M50 75 C44 71 45 66 48.5 63 C48 66 50 67 51 65.5 C52.5 63.5 51 61 52 59 C56 62.5 57 70 50 75 Z" />
      <path class="f2" d="M50 75 C47.5 73 47.5 70.5 49.5 68.5 C49.5 70 50.5 70.5 51 69.5 C53 71.5 52.5 74 50 75 Z" />
    </g>
    <g class="smoke">
      <circle cx="71" cy="17" r="3" />
      <circle cx="74" cy="10" r="2.2" />
    </g>
  </svg>`;
}

export const artStyles = css`
  .house-art {
    flex: none;
    color: var(--wr-text2);
  }
  .house-art .walls,
  .house-art .roof {
    fill: none;
    stroke: currentColor;
    stroke-width: 4;
    stroke-linejoin: round;
    stroke-linecap: round;
  }
  .house-art .glow {
    fill: transparent;
    transition: fill 0.6s;
  }
  .house-art.warm .glow {
    fill: color-mix(in srgb, var(--wr-heat) 10%, transparent);
  }
  .house-art.burning .glow {
    fill: color-mix(in srgb, var(--wr-heat) 20%, transparent);
  }
  .house-art .chimney {
    fill: currentColor;
  }
  .house-art .stove {
    fill: color-mix(in srgb, currentColor 25%, transparent);
    stroke: currentColor;
    stroke-width: 2.5;
  }
  .house-art .window {
    fill: color-mix(in srgb, var(--wr-text) 70%, transparent);
  }
  .house-art .flame {
    opacity: 0;
    transition: opacity 0.4s;
    transform-origin: 50px 75px;
  }
  .house-art .f1 {
    fill: var(--wr-heat);
  }
  .house-art .f2 {
    fill: #ffd43b;
  }
  .house-art .smoke {
    fill: color-mix(in srgb, currentColor 45%, transparent);
    opacity: 0;
  }
  .house-art.burning {
    color: var(--wr-heat);
  }
  .house-art.burning .window {
    fill: #3b1d0e;
  }
  .house-art.burning .flame,
  .house-art.burning .smoke {
    opacity: 1;
  }
  @media (prefers-reduced-motion: no-preference) {
    .house-art.burning .flame {
      animation: wr-flicker 1.3s ease-in-out infinite alternate;
    }
    .house-art.burning .smoke {
      animation: wr-smoke 3s ease-in infinite;
    }
  }
  @keyframes wr-flicker {
    0% {
      transform: scale(1, 1);
    }
    50% {
      transform: scale(0.92, 1.08);
    }
    100% {
      transform: scale(1.05, 0.95);
    }
  }
  @keyframes wr-smoke {
    0% {
      opacity: 0;
      transform: translateY(4px);
    }
    40% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      transform: translateY(-6px);
    }
  }
`;

/** Temperaturverlauf; nichts, wenn keine Daten. */
export function renderTrendChart(
  points: HistoryPoint[] | null | undefined,
  t: T,
  lang: string,
  opts: { height?: number; axis?: boolean; legend?: boolean } = {},
): TemplateResult | typeof nothing {
  const width = 600;
  const height = opts.height ?? 160;
  const axis = opts.axis !== false;
  const m = buildChart(points, {
    width,
    height,
    padLeft: 4,
    padRight: 4,
    padTop: 8,
    padBottom: axis ? 20 : 4,
  });
  if (!m) return nothing;
  const label = t("chart.aria", { from: formatNumber(m.yMin, lang, 0), to: formatNumber(m.yMax, lang, 0) });
  return html`<figure class="trend"><div class="plot ${axis ? "axis" : ""}">
    <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label=${label} style="height:${height}px">
      ${m.bands.map((b) => svg`<rect class="band" x=${b.x} y=${m.top} width=${b.w} height=${m.bottom - m.top}></rect>`)}
      ${axis
        ? m.yTicks.map(
            (tk) => svg`<line class="grid" x1=${m.left} x2=${m.right} y1=${tk.y} y2=${tk.y}></line>`,
          )
        : nothing}
      ${m.target ? svg`<path class="target" d=${m.target}></path>` : nothing}
      <path class="house" d=${m.house}></path>
    </svg>
    ${m.last ? html`<span class="dot" style="left:calc(var(--pl) + (100% - var(--pl)) * ${m.last.x / width});top:${(m.last.y / height) * 100}%"></span>` : nothing}
    ${axis
      ? html`<div class="ylabels" aria-hidden="true">
            ${m.yTicks.map((tk) => html`<span style="top:${(tk.y / height) * 100}%">${tk.value}°</span>`)}
          </div>
          <div class="xlabels" aria-hidden="true">
            ${m.xTicks.map((tk) => html`<span style="left:calc(var(--pl) + (100% - var(--pl)) * ${tk.x / width})">${tk.label}</span>`)}
          </div>`
      : nothing}
    </div>
    ${axis && opts.legend !== false
      ? html`<figcaption class="legend">
          <span><i class="lg house"></i>${t("chart.house")}</span>
          <span><i class="lg target"></i>${t("chart.target")}</span>
          <span><i class="lg band"></i>${t("chart.burning")}</span>
        </figcaption>`
      : nothing}
  </figure>`;
}

export const chartStyles = css`
  .trend {
    margin: 0;
  }
  .trend .plot {
    position: relative;
    --pl: 0px;
  }
  .trend .plot.axis {
    --pl: 30px;
    padding-left: var(--pl);
  }
  .trend svg {
    display: block;
    width: 100%;
    overflow: visible;
  }
  .trend .band {
    fill: color-mix(in srgb, var(--wr-heat) 18%, transparent);
  }
  .trend .grid {
    stroke: var(--wr-div);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }
  .trend .house {
    fill: none;
    stroke: var(--wr-heat);
    stroke-width: 2.5;
    stroke-linejoin: round;
    stroke-linecap: round;
    vector-effect: non-scaling-stroke;
  }
  .trend .target {
    fill: none;
    stroke: var(--wr-text2);
    stroke-width: 1.5;
    stroke-dasharray: 5 4;
    vector-effect: non-scaling-stroke;
  }
  .trend .dot {
    position: absolute;
    width: 10px;
    height: 10px;
    margin: -5px 0 0 -5px;
    border-radius: 50%;
    background: var(--wr-heat);
    border: 2px solid var(--wr-card);
    pointer-events: none;
  }
  .trend .ylabels span,
  .trend .xlabels span {
    position: absolute;
    font-size: 11px;
    color: var(--wr-text2);
    line-height: 1;
    pointer-events: none;
  }
  .trend .ylabels span {
    left: 0;
    transform: translateY(-50%);
  }
  .trend .xlabels span {
    bottom: 3px;
    transform: translateX(-50%);
  }
  .trend .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 14px;
    font-size: 12px;
    color: var(--wr-text2);
    margin-top: 4px;
  }
  .trend .lg {
    display: inline-block;
    width: 14px;
    height: 10px;
    margin-right: 5px;
    vertical-align: -1px;
    border-radius: 2px;
  }
  .trend .lg.house {
    height: 3px;
    vertical-align: 3px;
    background: var(--wr-heat);
  }
  .trend .lg.target {
    height: 0;
    border-top: 2px dashed var(--wr-text2);
    vertical-align: 3px;
  }
  .trend .lg.band {
    background: color-mix(in srgb, var(--wr-heat) 25%, transparent);
  }
`;

/** Pelletbehälter mit Füllstand (0-100). */
export function renderPelletTank(fill: number | null, opts: { low?: boolean; size?: number } = {}): TemplateResult {
  const size = opts.size ?? 64;
  const f = fill === null ? 0 : Math.max(0, Math.min(100, fill));
  const innerTop = 14;
  const innerBottom = 92;
  const h = ((innerBottom - innerTop) * f) / 100;
  return html`<svg class="tank ${opts.low ? "low" : ""}" width=${size * 0.75} height=${size} viewBox="0 0 75 100" aria-hidden="true">
    <defs>
      <clipPath id="wr-tank-clip"><rect x="10" y=${innerTop} width="55" height=${innerBottom - innerTop} rx="6" /></clipPath>
    </defs>
    <rect class="lid" x="6" y="4" width="63" height="8" rx="3" />
    <rect class="body" x="8" y="12" width="59" height="82" rx="8" />
    <g clip-path="url(#wr-tank-clip)">
      <rect class="fill" x="10" y=${innerBottom - h} width="55" height=${h} />
      ${f > 6
        ? svg`<g class="grains">
            ${[18, 30, 42, 54].map((x, i) => svg`<ellipse cx=${x + (i % 2) * 3} cy=${innerBottom - h + 4} rx="4" ry="2.2"></ellipse>`)}
          </g>`
        : nothing}
    </g>
    ${fill === null ? nothing : svg`<text x="37.5" y="60" text-anchor="middle">${Math.round(f)}%</text>`}
  </svg>`;
}

export const tankStyles = css`
  .tank {
    flex: none;
  }
  .tank .lid {
    fill: var(--wr-text2);
  }
  .tank .body {
    fill: var(--wr-input-bg);
    stroke: var(--wr-text2);
    stroke-width: 3;
  }
  .tank .fill {
    fill: #b07d3c;
    transition: all 0.6s;
  }
  .tank.low .fill {
    fill: var(--wr-warn);
  }
  .tank .grains ellipse {
    fill: #8a5a24;
  }
  .tank text {
    font-size: 17px;
    font-weight: 600;
    fill: var(--wr-text);
    paint-order: stroke;
    stroke: var(--wr-card);
    stroke-width: 4px;
  }
`;
