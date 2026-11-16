import { LitElement } from "lit";
import { translator, type Lang, type T } from "../i18n";
import type { Config, Defaults, Hass } from "../types";
import { clone } from "../util";

/** Grundlage der Editor-Tabs: arbeiten auf der Entwurfs-Config des Panels. */
export class EditorBase extends LitElement {
  static override properties = {
    hass: { attribute: false },
    config: { attribute: false },
    defaults: { attribute: false },
    lang: { type: String },
    readonly: { type: Boolean },
  };

  declare hass: Hass;
  declare config: Config;
  declare defaults: Defaults;
  declare lang: Lang;
  declare readonly: boolean;

  constructor() {
    super();
    this.lang = "de";
    this.readonly = false;
  }

  protected get t(): T {
    return translator(this.lang);
  }

  /** Kopie anlegen, ändern, als `config-changed` an das Panel melden. */
  protected change(mutate: (c: Config) => void) {
    const next = clone(this.config);
    mutate(next);
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
}

/** Zahl aus einem Eingabefeld (Komma oder Punkt), leer -> null. */
export function readNumber(e: Event): number | null {
  const raw = (e.target as HTMLInputElement).value.trim().replace(",", ".");
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export const inputValue = (e: Event) => (e.target as HTMLInputElement | HTMLSelectElement).value;
