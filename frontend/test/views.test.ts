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
