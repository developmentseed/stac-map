import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/stac-map/",
  plugins: [react(), tsconfigPaths(), wasm(), topLevelAwait()],
});
