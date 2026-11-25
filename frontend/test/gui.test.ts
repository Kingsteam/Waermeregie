/// <reference types="vite/client" />
// GUI-Konzept des Hauses: in der Oberfläche nur Theme-Variablen, keine festen Farben,
// keine Dauer-Animationen. Einzige freigegebene Ausnahme: die 8 Linienfarben im Verlauf.
import { describe, expect, it } from "vitest";

const SOURCES = import.meta.glob("../src/**/*.ts", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const ALLOWED_HEX = new Set(["../src/history.ts"]);

describe("GUI-Konzept", () => {
  it("findet die Quelltexte", () => {
    expect(Object.keys(SOURCES).length).toBeGreaterThan(10);
  });

  it("verwendet keine festen Farben", () => {
    const bad = Object.entries(SOURCES)
      .filter(([file]) => !ALLOWED_HEX.has(file))
      .flatMap(([file, text]) =>
        text
          .split("\n")
          .map((line, i) => `${file}:${i + 1}: ${line.trim()}`)
          .filter((line) => /#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(line.replace(/^[^ ]+ /, ""))),
      );
    expect(bad).toEqual([]);
  });

  it("hat keine Dauer-Animationen", () => {
    const bad = Object.entries(SOURCES)
      .filter(([, text]) => /\binfinite\b/.test(text))
      .map(([file]) => file);
    expect(bad).toEqual([]);
  });
});
