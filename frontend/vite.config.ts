import { defineConfig } from "vitest/config";

// Zwei getrennte Builds (Modus "panel" bzw. "card"), damit jede Datei ein
// eigenständiges ES-Modul ohne gemeinsame Chunks und ohne externe Importe ist.
// Pfade sind relativ zum Ordner frontend/ (Vite-Root).
const BUILDS: Record<string, { entry: string; file: string }> = {
  panel: { entry: "src/panel.ts", file: "waermeregie-panel.js" },
  card: { entry: "src/card.ts", file: "waermeregie-card.js" },
};

export default defineConfig(({ mode }) => {
  const b = BUILDS[mode] ?? BUILDS.panel;
  return {
    build: {
      outDir: "../custom_components/waermeregie/frontend",
      emptyOutDir: false,
      target: "es2021",
      minify: true,
      sourcemap: false,
      copyPublicDir: false,
      lib: {
        entry: b.entry,
        formats: ["es"],
        fileName: () => b.file,
      },
      // Vite minimiert ES-Bibliotheken sonst nur teilweise; hier vollständig.
      rolldownOptions: {
        output: { minify: true },
      },
    },
    test: {
      include: ["test/**/*.test.ts"],
      environment: "node",
    },
  };
});
