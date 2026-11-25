import { css } from "lit";

// Gemeinsame Gestaltung nach dem GUI-Konzept des Hauses: nur Theme-Variablen (keine festen
// Farben), Rahmen 2 px, Radius 8, Raster 8 px, Trefferflächen mind. 44 px (Karten 56 px).
// Farbgruppen: Wärme = orange, Kälte/Fenster = blau; Rot nur für Fehler und Gefahr.
export const baseStyles = css`
  :host {
    --wr-heat: var(--state-climate-heat-color, var(--orange-color));
    --wr-cold: var(--state-climate-cool-color, var(--blue-color));
    --wr-ok: var(--success-color);
    --wr-warn: var(--warning-color);
    --wr-err: var(--error-color);
    --wr-info: var(--info-color, var(--primary-color));
    --wr-primary: var(--primary-color);
    --wr-accent: var(--accent-color, var(--primary-color));
    --wr-text: var(--primary-text-color);
    --wr-text2: var(--secondary-text-color);
    --wr-inactive: var(--state-inactive-color, var(--disabled-text-color));
    --wr-card: var(--card-background-color, var(--ha-card-background));
    --wr-bg: var(--primary-background-color);
    --wr-bg2: var(--secondary-background-color);
    --wr-div: var(--divider-color);
    --wr-border: var(--ha-card-border-color, var(--divider-color));
    --wr-radius: 8px;
    --wr-input-bg: var(--input-fill-color, var(--secondary-background-color));
    --wr-hover: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    color: var(--wr-text);
    font-family: var(--paper-font-body1_-_font-family, var(--ha-font-family-body, Roboto, system-ui, sans-serif));
    font-size: 14px;
    line-height: 1.45;
  }
  * {
    box-sizing: border-box;
  }
  h2,
  h3,
  h4 {
    margin: 0 0 8px;
    font-weight: 500;
  }
  h2 {
    font-size: 20px;
  }
  h3 {
    font-size: 16px;
  }
  h4 {
    font-size: 14px;
  }
  .card {
    background: var(--wr-card);
    border-radius: var(--wr-radius);
    border: 2px solid var(--wr-border);
    box-shadow: var(--ha-card-box-shadow, none);
    padding: 16px;
    min-width: 0;
  }
  .muted,
  .hint {
    color: var(--wr-text2);
  }
  .hint {
    font-size: 12px;
    margin: 2px 0 6px;
  }
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
  }
  .spacer {
    flex: 1;
  }
  .grid {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
  }
  button {
    font: inherit;
    cursor: pointer;
    border-radius: 8px;
    border: 2px solid var(--wr-border);
    background: transparent;
    color: var(--wr-text);
    padding: 6px 14px;
    min-height: var(--wr-touch, 44px);
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  button:hover:not([disabled]) {
    background: var(--wr-hover);
  }
  button[disabled] {
    cursor: default;
    opacity: 0.5;
  }
  /* gefüllt = Tinte: höchstens eine Hauptaktion je Ansicht */
  button.primary {
    background: var(--wr-text);
    border-color: var(--wr-text);
    color: var(--wr-card);
  }
  button.primary:hover:not([disabled]) {
    background: color-mix(in srgb, var(--wr-text) 88%, var(--wr-card));
  }
  button.danger {
    color: var(--wr-err);
    border-color: var(--wr-err);
  }
  button.danger.solid {
    background: var(--wr-err);
    color: var(--text-primary-color);
  }
  button.icon {
    padding: 4px;
    min-width: var(--wr-touch, 44px);
    justify-content: center;
    border-color: transparent;
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--wr-accent);
    outline-offset: 1px;
  }
  ha-icon {
    --mdc-icon-size: 20px;
    flex: none;
  }
  input,
  select {
    font: inherit;
    color: var(--wr-text);
    background: var(--wr-input-bg);
    border: 2px solid var(--wr-border);
    border-radius: 8px;
    padding: 7px 10px;
    min-height: 44px;
    width: 100%;
    min-width: 0;
  }
  select option {
    background: var(--wr-card);
    color: var(--wr-text);
  }
  input[type="number"] {
    max-width: 120px;
  }
  input.invalid,
  select.invalid {
    border-color: var(--wr-err);
  }
  label.field {
    display: block;
    margin-bottom: 12px;
  }
  label.field > span.lbl,
  .lbl {
    display: block;
    font-weight: 500;
    margin-bottom: 4px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  /* Chips: rund; gewählt = Akzent-Rahmen, Fläche leicht getönt */
  .chip {
    border-radius: 999px;
    border: 2px solid var(--wr-border);
    padding: 4px 14px;
    background: transparent;
  }
  .chip.selected {
    background: color-mix(in srgb, var(--wr-heat) 15%, transparent);
    border-color: var(--wr-heat);
  }
  .chip.auto.selected {
    background: color-mix(in srgb, var(--wr-accent) 15%, transparent);
    border-color: var(--wr-accent);
  }
  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    border-radius: 999px;
    padding: 1px 8px;
    background: var(--wr-bg2);
    white-space: nowrap;
  }
  .badge.heat {
    background: color-mix(in srgb, var(--wr-heat) 18%, transparent);
    box-shadow: inset 0 0 0 1px var(--wr-heat);
  }
  .badge.cold {
    background: color-mix(in srgb, var(--wr-cold) 18%, transparent);
    box-shadow: inset 0 0 0 1px var(--wr-cold);
  }
  .badge.warn {
    background: color-mix(in srgb, var(--wr-warn) 18%, transparent);
    box-shadow: inset 0 0 0 1px var(--wr-warn);
  }
  .badge.err {
    background: color-mix(in srgb, var(--wr-err) 18%, transparent);
    box-shadow: inset 0 0 0 1px var(--wr-err);
  }
  .alert.stove_error ha-icon,
  .alert.error ha-icon {
    color: var(--wr-err);
  }
  .badge.ok {
    background: color-mix(in srgb, var(--wr-ok) 18%, transparent);
    box-shadow: inset 0 0 0 1px var(--wr-ok);
  }
  .banner {
    border-radius: var(--wr-radius);
    padding: 12px 16px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    border: 2px solid;
  }
  .banner.shadow {
    border-color: var(--wr-warn);
    background: color-mix(in srgb, var(--wr-warn) 14%, transparent);
  }
  .banner.error {
    border-color: var(--wr-err);
    background: color-mix(in srgb, var(--wr-err) 12%, transparent);
  }
  .banner.info {
    border-color: var(--wr-info);
    background: color-mix(in srgb, var(--wr-info) 10%, transparent);
  }
  .banner strong {
    display: block;
  }
  .error-text {
    color: var(--wr-err);
    font-size: 12px;
  }
  .confirm {
    border: 2px solid var(--wr-err);
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    background: color-mix(in srgb, var(--wr-err) 8%, transparent);
  }
  /* Fußzeile von Rückfragen: rechtsbündig, "Abbrechen" als Textknopf links der Hauptaktion */
  .confirm .row {
    margin-top: 8px;
    flex-direction: row-reverse;
    justify-content: flex-start;
  }
  .confirm .row button:not(.danger):not(.primary),
  button.text {
    border-color: transparent;
  }
  .stove .phase {
    font-size: 18px;
    font-weight: 500;
  }
  .stove.burning .flame {
    color: var(--wr-heat);
  }
  .kv {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 2px 12px;
    margin-top: 8px;
  }
  .kv dt {
    color: var(--wr-text2);
  }
  .kv dd {
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .room {
    border-left: 4px solid var(--wr-div);
  }
  .room.cold {
    border-left-color: var(--wr-cold);
  }
  .room.warm {
    border-left-color: var(--wr-heat);
  }
  .room.ok {
    border-left-color: var(--wr-ok);
  }
  .room .temp {
    font-size: 24px;
    font-weight: 500;
  }
  .room .name {
    font-weight: 500;
    overflow-wrap: anywhere;
  }
  .alert {
    display: flex;
    gap: 8px;
    align-items: flex-start;
    padding: 6px 0;
    border-bottom: 2px solid var(--wr-div);
  }
  .alert:last-child {
    border-bottom: 0;
  }
  .alert.opening ha-icon {
    color: var(--wr-cold);
  }
  .alert ha-icon {
    color: var(--wr-warn);
  }
  /* Tageszeitleiste */
  .timeline {
    position: relative;
    height: 24px;
    border-radius: 8px;
    overflow: hidden;
    background: var(--wr-bg2);
  }
  .timeline .seg {
    position: absolute;
    top: 0;
    bottom: 0;
    border-right: 1px solid var(--wr-card);
  }
  .timeline .seg span {
    color: var(--wr-text);
    font-size: 11px;
    padding: 0 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    line-height: 24px;
  }
  .timeline .now {
    position: absolute;
    top: -2px;
    bottom: -2px;
    width: 2px;
    background: var(--wr-text);
  }
  .timeline-scale {
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: var(--wr-text2);
    margin-top: 2px;
  }
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 12px;
    font-size: 12px;
    margin-top: 6px;
  }
  .legend i {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
    margin-right: 4px;
    vertical-align: -1px;
  }
  /* Gerät oder Ofen nicht erreichbar: gestrichelter Rahmen, Symbol grau, nie leer */
  .unreachable {
    border-style: dashed !important;
    border-color: var(--wr-inactive) !important;
  }
  .unreachable ha-icon {
    color: var(--wr-inactive) !important;
  }
  .badge.unreachable {
    background: transparent;
    box-shadow: none;
    border: 2px dashed var(--wr-inactive);
    color: var(--wr-text2);
  }
  /* kurze Bestätigung als Leiste unten (4 s) */
  .toast {
    position: fixed;
    left: 50%;
    bottom: calc(16px + var(--wr-toast-offset, 0px));
    transform: translateX(-50%);
    z-index: 8;
    max-width: min(560px, calc(100vw - 32px));
    padding: 12px 16px;
    border-radius: 8px;
    background: var(--wr-text);
    color: var(--wr-card);
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .toast.inline {
    position: static;
    transform: none;
    max-width: none;
    margin-top: 8px;
  }
  @media (prefers-reduced-motion: no-preference) {
    .toast {
      animation: wr-toast-in 150ms ease-out;
    }
  }
  @keyframes wr-toast-in {
    from {
      opacity: 0;
    }
  }
`;
