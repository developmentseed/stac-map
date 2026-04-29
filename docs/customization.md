# Customization

White-label configuration is done via environment variables set before `yarn build`. See `.env.example` for the full list.

## Custom header

Four build-time variables let you inject a custom header element above the app:

| Variable             | What it injects |
| -------------------- | --------------- |
| `VITE_HTML_CLASSES`  | CSS classes on `<html>` |
| `VITE_HEAD_INJECT`   | HTML at end of `<head>` — stylesheet links, import maps, module scripts, inline `<style>` |
| `VITE_BODY_PREPEND`  | HTML before `<div id="root">` — your header element |
| `VITE_BODY_APPEND`   | HTML after `<div id="root">` — scripts to configure custom elements (e.g. setting `.tabs` via JS, since functions can't be HTML attributes) |
| `VITE_HEADER_HEIGHT` | CSS length (e.g. `64px`). Sets `--header-height` on `:root` and shrinks the map/overlay to fit below the header. |

### Example

```shell
VITE_BASE_PATH=/
VITE_DEFAULT_HREF=https://my-stac-api.com
VITE_HEADER_HEIGHT=64px
VITE_HTML_CLASSES=my-theme-light
VITE_HEAD_INJECT='<link rel="stylesheet" href="https://cdn.example.com/theme.css" /><script type="module" src="https://cdn.example.com/my-header.js"></script>'
VITE_BODY_PREPEND='<my-header id="app-header" title="My STAC App"></my-header>'
VITE_BODY_APPEND="<script>document.getElementById('app-header').tabs=[{label:'Home',href:'/'}];</script>"
```

### Quoting

Always quote `VITE_HEAD_INJECT`, `VITE_BODY_PREPEND`, and `VITE_BODY_APPEND`. Unquoted values are truncated at `#`, silently breaking any inline CSS with hex colors.

- Use **single quotes** when the HTML uses double-quoted attributes (the common case)
- Use **double quotes** if the value contains single quotes (e.g. inline JS strings)
- Keep values on one line — multiline values work locally but break in most CI environments

## Extra map layers

Set `VITE_EXTRA_LAYERS_URL` to a JSON file defining MapLibre layers to load on startup. The file is fetched after the map initialises and does not block rendering. It can live in `public/` or on any CORS-enabled URL.

The JSON is an array of MapLibre layer objects with an inline `source`. All source types are supported (`raster`, `vector`, `geojson`), including PMTiles via `pmtiles://` URLs.

```json
[
  {
    "id": "my-coverage",
    "type": "fill",
    "source": {
      "type": "vector",
      "url": "pmtiles://https://example.com/coverage.pmtiles"
    },
    "source-layer": "layer-name",
    "filter": ["==", ["geometry-type"], "Polygon"],
    "paint": {
      "fill-color": "#d43f3f",
      "fill-opacity": 0.2
    }
  }
]
```
