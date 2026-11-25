import type { LayerProps } from "react-map-gl/maplibre";
import type { StacLink } from "stac-ts";

export interface TileJson {
  tiles?: string[];
  vector_layers?: { id: string }[];
}

type VectorLayerProps = Extract<
  LayerProps,
  { type: "fill" | "line" | "circle" }
>;

const VECTOR_LAYER_TYPES = new Set(["fill", "line", "circle"]);

export async function fetchJson<T>(href: string): Promise<T> {
  const response = await fetch(href, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`GET ${href}: ${response.status}`);
  return response.json();
}

export function getVectorLayerIds(tilejson: TileJson | undefined): string[] {
  if (!Array.isArray(tilejson?.vector_layers)) return [];
  return tilejson.vector_layers
    .map((layer) => layer?.id)
    .filter((id): id is string => typeof id === "string");
}

export function defaultVectorLayers(
  sourceLayers: string[],
  color: string
): LayerProps[] {
  return sourceLayers.flatMap((sourceLayer, index): VectorLayerProps[] => [
    {
      id: `visualization-${index}-fill`,
      type: "fill",
      "source-layer": sourceLayer,
      filter: ["==", "$type", "Polygon"],
      paint: { "fill-color": color, "fill-opacity": 0.25 },
    },
    {
      id: `visualization-${index}-line`,
      type: "line",
      "source-layer": sourceLayer,
      filter: ["in", "$type", "Polygon", "LineString"],
      paint: { "line-color": color, "line-width": 1.5 },
    },
    {
      id: `visualization-${index}-circle`,
      type: "circle",
      "source-layer": sourceLayer,
      filter: ["==", "$type", "Point"],
      paint: {
        "circle-color": color,
        "circle-radius": 4,
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 1,
      },
    },
  ]);
}

export function getStylesheetLayers(
  style: unknown,
  sourceLayers: string[]
): LayerProps[] {
  const layers = (style as { layers?: unknown })?.layers;
  if (!Array.isArray(layers)) return [];
  return layers
    .filter(
      (layer) =>
        VECTOR_LAYER_TYPES.has(layer?.type) &&
        sourceLayers.includes(layer["source-layer"])
    )
    .map((layer, index) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { source, ...rest } = layer;
      return { ...rest, id: `visualization-${index}-${layer.id}` };
    });
}

export function getWmsTileUrl(link: StacLink): string {
  const url = new URL(link.href);
  const layers = [link["wms:layers"]].flat().filter(Boolean) as string[];
  const styles = (link["wms:styles"] as string[] | undefined) ?? [];
  const dimensions =
    (link["wms:dimensions"] as Record<string, string> | undefined) ?? {};
  const params: Record<string, string> = {
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetMap",
    LAYERS: layers.join(","),
    STYLES: styles.join(","),
    SRS: "EPSG:3857",
    FORMAT: link.type?.startsWith("image/") ? link.type : "image/png",
    TRANSPARENT: link["wms:transparent"] ? "TRUE" : "FALSE",
    WIDTH: "256",
    HEIGHT: "256",
    ...dimensions,
  };
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return `${url}&BBOX={bbox-epsg-3857}`;
}

export function getXyzTiles(link: StacLink): string[] {
  const servers = link["href:servers"] as string[] | undefined;
  if (!link.href.includes("{s}") || !servers?.length) return [link.href];
  return servers.map((server) => link.href.replaceAll("{s}", server));
}
