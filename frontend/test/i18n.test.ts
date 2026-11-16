import { describe, expect, it } from "vitest";
import { de, en, translate } from "../src/i18n";

describe("i18n", () => {
  it("jeder deutsche Text hat eine englische Übersetzung", () => {
    const missing = Object.keys(de).filter((k) => !(k in en));
    expect(missing).toEqual([]);
  });
  it("ersetzt Platzhalter und fällt auf Deutsch zurück", () => {
    expect(translate("de", "room.open_for", { time: "12 min" })).toBe("offen seit 12 min");
    expect(translate("en", "room.open_for", { time: "12 min" })).toBe("open for 12 min");
  });
  it("Platzhalter sind in beiden Sprachen gleich", () => {
    const vars = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join();
    for (const [k, v] of Object.entries(de)) {
      const e = (en as Record<string, string>)[k];
      if (e) expect(vars(e), k).toBe(vars(v));
    }
  });
});
