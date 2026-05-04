import react from "@vitejs/plugin-react";
import path from "node:path";
import * as TypeDoc from "typedoc";
import { defineConfig, type Plugin } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

function typedocPlugin(): Plugin {
  return {
    name: "stac-map-typedoc",
    apply: "build",
    async closeBundle() {
      const app = await TypeDoc.Application.bootstrapWithPlugins({
        out: path.resolve(__dirname, "dist/docs"),
      });
      const project = await app.convert();
      if (!project) {
        throw new Error("TypeDoc failed to convert the project");
      }
      await app.generateOutputs(project);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/stac-map/",
  build: {
    target: "esnext",
  },
  resolve: {
    tsconfigPaths: true,
  },
  worker: {
    format: "es",
  },
  plugins: [react(), wasm(), topLevelAwait(), typedocPlugin()],
});
