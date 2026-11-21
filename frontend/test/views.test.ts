import { describe, expect, it } from "vitest";
import { translator } from "../src/i18n";
import type { Status } from "../src/types";
import { collectAlerts } from "../src/views";

const t = translator("de");
const base = {
  stove: { chrono_warning: true, eco_warning: true, error: true },
  alerts: [{ kind: "opening", message: "Terrassentür seit 12 min offen" }],
} as unknown as Status;

describe("collectAlerts", () => {
  it("ergänzt Hinweise aus Ofen-Flags, Störung zuerst", () => {
    const kinds = collectAlerts(base, t).map((a) => a.kind);
    expect(kinds).toEqual(["stove_error", "opening", "chrono", "eco"]);
  });
  it("keine Doppelungen, wenn der Server sie schon meldet", () => {
    const s = { ...base, alerts: [{ kind: "chrono", message: "x" }] } as unknown as Status;
    expect(collectAlerts(s, t).filter((a) => a.kind === "chrono")).toHaveLength(1);
  });
  it("ohne Status leer", () => {
    expect(collectAlerts(null, t)).toEqual([]);
  });
});

import { adjustValue } from "../src/feedback";
import type { Suggestion } from "../src/types";

describe("adjustValue (Vorschlag anpassen)", () => {
  const slot: Suggestion = { id: "a", type: "slot_earlier", text: "", count: 3, room: null, from: "06:00", to: "05:15" };
  const temp: Suggestion = { id: "b", type: "target_up", text: "", count: 3, room: "bad", from: 21, to: 21.5 };
  it("Uhrzeit", () => {
    expect(adjustValue(slot, "5:30")).toBe("05:30");
    expect(adjustValue(slot, "abc")).toBeNull();
  });
  it("Temperatur mit Komma, auf halbe Grad, in Grenzen", () => {
    expect(adjustValue(temp, "22,3")).toBe(22.5);
    expect(adjustValue(temp, "")).toBeNull();
    expect(adjustValue(temp, "40")).toBeNull();
  });
  it("KI-Vorschlag: Zahl in den Grenzen des Vorschlags, Uhrzeit, neue Regel gar nicht", () => {
    const ai: Suggestion = { id: "ai|x", type: "ai_change", text: "", count: 0, room: null, from: 30, to: 40, min: 20, max: 60 };
    expect(adjustValue(ai, "45")).toBe(45);
    expect(adjustValue(ai, "90")).toBeNull();
    expect(adjustValue({ ...ai, from: "06:00", to: "05:30" }, "5:45")).toBe("05:45");
    expect(adjustValue({ ...ai, type: "ai_rule" }, "1")).toBeNull();
  });
});

import { newRule, ruleProblems, templateLimits } from "../src/tabs/rules";

describe("Regeln aus Vorlagen", () => {
  const limits = templateLimits({
    limits: { rule_templates: { wind: { above_kmh: [10, 100, 35], target_delta_k: [0, 2, 0], lead_min: [0, 120, 30] }, nobody_home: { after_min: [5, 240, 30] } } },
  });
  it("neue Regel bekommt die Standardwerte des Servers", () => {
    const r = newRule("wind", limits, ["komfort"]);
    expect(r.params).toEqual({ above_kmh: 35, target_delta_k: 0, lead_min: 30, wind_entity: null });
    expect(newRule("nobody_home", limits, ["komfort", "abwesend"]).params.scene).toBe("abwesend");
  });
  it("zählt Werte außerhalb der Grenzen und fehlendes Schloss", () => {
    const wind = newRule("wind", limits, []);
    expect(ruleProblems([wind], limits)).toBe(0);
    wind.params.above_kmh = 500;
    expect(ruleProblems([wind], limits)).toBe(1);
    const home = newRule("nobody_home", limits, ["abwesend"]);
    home.params.require_lock = true;
    expect(ruleProblems([home], limits)).toBe(1);
    home.params.lock = "lock.x";
    expect(ruleProblems([home], limits)).toBe(0);
  });
});

import { newCondition } from "../src/tabs/rules";

describe("Freie Regel und Lernwerte", () => {
  const limits = templateLimits({ limits: { rule_templates: { custom: { after_min: [0, 240, 0], target_delta_k: [-2, 2, 0], lead_min: [0, 120, 0] } } } });
  const cond = { outdoor: [-30, 40] as [number, number], time: null, lock: null };
  it("braucht Namen und mindestens eine gültige Bedingung", () => {
    const r = newRule("custom", limits, ["komfort"]);
    expect(r.id.startsWith("eigene_")).toBe(true);
    expect(ruleProblems([r], limits, cond)).toBe(2); // kein Name, keine Bedingung
    r.name = "Abends wärmer";
    r.params.conditions = [newCondition("outdoor", "bad", "wochenende")];
    expect(ruleProblems([r], limits, cond)).toBe(0);
    r.params.conditions = [{ type: "outdoor", op: "below", value: 99 }, { type: "time", from: "25:00", to: "06:00" }, { type: "lock", entity: null }];
    expect(ruleProblems([r], limits, cond)).toBe(3);
  });
  it("Grenzen eines Lernwerts müssen in den erlaubten Bereich passen", () => {
    const r = newRule("custom", limits, []);
    r.name = "x";
    r.params.conditions = [newCondition("persons", "", "")];
    r.learn = { lead_min: [20, 60] };
    expect(ruleProblems([r], limits, cond)).toBe(0);
    r.learn = { lead_min: [60, 20] };
    expect(ruleProblems([r], limits, cond)).toBe(1);
    r.learn = { lead_min: [0, 500] };
    expect(ruleProblems([r], limits, cond)).toBe(1);
  });
});
