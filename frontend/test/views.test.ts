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
});
