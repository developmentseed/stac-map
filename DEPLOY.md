# Deploying stac-map

There's two ways to deploy your own version of **stac-map**:

- [Build-time configuration](#build-time-configuration)
- [React component](#react-component)

## Build-time configuration

If you only need to customize a few things, you can clone this repository and configure a build of the app with environment variables.
See [deploy.yaml](./.github/workflows/deploy.yaml) for a (drop-dead simple) example of deploying this application as a static site via Github Pages.
The environment variables available are:

| Variable                | Description                                          | Default                                                   |
| ----------------------- | ---------------------------------------------------- | --------------------------------------------------------- |
| `VITE_BASE_PATH`        | URL path prefix (e.g., `/my-app/`)                   | `/stac-map/`                                              |
| `VITE_DEFAULT_HREF`     | STAC resource to load on startup                     | None (shows intro)                                        |
| `VITE_AUTH_AUTHORITY`   | The OIDC authority to use for auth                   | None                                                      |
| `VITE_AUTH_CLIENT_ID`   | The OIDC client id to use for auth                   | None                                                      |
| `VITE_STAC_BROWSER_URL` | URL prefix for "Open in STAC Browser" external links | `https://radiantearth.github.io/stac-browser/#/external/` |

Example:

```shell
VITE_BASE_PATH=/ VITE_DEFAULT_HREF=https://my-stac-api.com yarn build
```

Or create a `.env` file:

```shell
VITE_BASE_PATH=/
VITE_DEFAULT_HREF=https://my-stac-api.com
```

Then run `yarn build` and deploy the `dist/` directory to your static hosting provider.

## React component

For more flexible configuration, we provide a `StacMap` React component via [@developmentseed/stac-map](https://www.npmjs.com/package/@developmentseed/stac-map).
To use it:

```javascript
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { StacMap } from "@developmentseed/stac-map";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StacMap />
  </StrictMode>
);
```

You'll also need to add [vite-plugin-top-level-await](https://www.npmjs.com/package/vite-plugin-top-level-await) and [vite-plugin-wasm](https://www.npmjs.com/package/vite-plugin-wasm) to your app, e.g.:

```sh
yarn add --dev vite-plugin-top-level-await vite-plugin-wasm
```

Then in [vite.config.ts](./vite.config.ts):

```javascript
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
/// --- >8 ---
  plugins: [react(), wasm(), topLevelAwait()],
```

See [src/main.tsx](./src/main.tsx) for a real-world example of using the component (it's what drives https://developmentseed.org/stac-map).
We have a JSDoc of our exports rendered at https://developmentseed.org/stac-map/docs.
