import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Merge .env file variables with shell environment (shell takes precedence)
  const env = { ...loadEnv(mode, process.cwd(), ""), ...process.env };

  function whitelabelPlugin(): Plugin {
    return {
      name: "stac-map-whitelabel",
      transformIndexHtml(html) {
        const htmlClasses = env.VITE_HTML_CLASSES;
        const headInject = env.VITE_HEAD_INJECT;
        const bodyPrepend = env.VITE_BODY_PREPEND;
        const bodyAppend = env.VITE_BODY_APPEND;
        const headerHeight = env.VITE_HEADER_HEIGHT;

        if (htmlClasses) {
          html = html.replace("<html", `<html class="${htmlClasses}"`);
        }

        // Inject early so the variable is available before any external CSS loads
        if (headerHeight) {
          html = html.replace(
            "<head>",
            `<head>\n    <style>:root { --header-height: ${headerHeight}; }</style>`,
          );
        }

        if (headInject) {
          html = html.replace("</head>", `  ${headInject}\n  </head>`);
        }

        if (bodyPrepend) {
          html = html.replace(
            '<div id="root">',
            `${bodyPrepend}\n    <div id="root">`,
          );
        }

        if (bodyAppend) {
          html = html.replace(
            '<div id="root"></div>',
            `<div id="root"></div>\n    ${bodyAppend}`,
          );
        }

        return html;
      },
    };
  }

  return {
    base: env.VITE_BASE_PATH || "/stac-map/",
    build: {
      target: "esnext",
    },
    resolve: {
      tsconfigPaths: true,
    },
    worker: {
      format: "es",
    },
    plugins: [react(), wasm(), topLevelAwait(), whitelabelPlugin()],
  };
});
