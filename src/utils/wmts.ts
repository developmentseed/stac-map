import type { WebMapLink } from "@/store/web-map-links";

const OWS_NS = "http://www.opengis.net/ows/1.1";
const WMTS_NS = "http://www.opengis.net/wmts/1.0";

export async function fetchWmtsTileUrl(
  link: WebMapLink
): Promise<string | null> {
  const layerName = link["wmts:layer"]?.[0];
  if (!layerName) return null;

  const capabilitiesUrl = `${link.href}?SERVICE=WMTS&REQUEST=GetCapabilities`;
  const response = await fetch(capabilitiesUrl);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");

  const layers = doc.getElementsByTagNameNS(WMTS_NS, "Layer");
  let tileMatrixSet: string | null = null;

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const identifiers = layer.getElementsByTagNameNS(OWS_NS, "Identifier");
    if (identifiers.length > 0 && identifiers[0].textContent === layerName) {
      const tileMatrixSetLinks = layer.getElementsByTagNameNS(
        WMTS_NS,
        "TileMatrixSetLink"
      );
      if (tileMatrixSetLinks.length > 0) {
        const tmsElements = tileMatrixSetLinks[0].getElementsByTagNameNS(
          WMTS_NS,
          "TileMatrixSet"
        );
        if (tmsElements.length > 0) {
          tileMatrixSet = tmsElements[0].textContent;
        }
      }
      break;
    }
  }

  if (!tileMatrixSet) return null;

  const dimensions = link["wmts:dimensions"] ?? {};
  const dimensionParams = Object.entries(dimensions)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  const format = link.type ?? "image/png";

  let url = `${link.href}?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=${encodeURIComponent(layerName)}&TILEMATRIXSET=${encodeURIComponent(tileMatrixSet)}&FORMAT=${encodeURIComponent(format)}&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}`;

  if (dimensionParams) {
    url += `&${dimensionParams}`;
  }

  return url;
}
