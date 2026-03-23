import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import wasm from "vite-plugin-wasm";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/stac-map/",
  worker: {
    format: "es",
  },
  plugins: [
    react(),
    tsconfigPaths(),
    wasm(),
    nodePolyfills({
      include: ["buffer"],
    }),
  ],
});
