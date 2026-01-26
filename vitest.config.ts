import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths(), wasm()],
  optimizeDeps: {
    include: ["@deck.gl/core", "@duckdb/duckdb-wasm", "react-icons/lib"],
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
    },
    typecheck: {
      enabled: true,
    },
  },
});
