import type { StacLink } from "stac-ts";
import { describe, expect, it } from "vitest";
import {
  defaultVectorLayers,
  getStylesheetLayers,
  getVectorLayerIds,
  getWmsTileUrl,
  getXyzTiles,
} from "../../src/utils/web-map-links";

describe("getVectorLayerIds", () => {
  it("returns the ids of a vector TileJSON", () => {
    expect(
      getVectorLayerIds({ vector_layers: [{ id: "sites" }, { id: "areas" }] })
    ).toEqual(["sites", "areas"]);
  });

  it("returns nothing for a raster TileJSON", () => {
    expect(
      getVectorLayerIds({ tiles: ["https://example.com/{z}.png"] })
    ).toEqual([]);
    expect(getVectorLayerIds(undefined)).toEqual([]);
  });
});

describe("defaultVectorLayers", () => {
  it("gives a fill, a line and a circle layer for each vector layer", () => {
    const layers = defaultVectorLayers(["sites", "areas"], "#ff0000");
    expect(layers.map((layer) => layer.type)).toEqual([
      "fill",
      "line",
      "circle",
      "fill",
      "line",
      "circle",
    ]);
    expect(new Set(layers.map((layer) => layer.id)).size).toBe(6);
    expect(layers[3]).toMatchObject({ "source-layer": "areas" });
  });
});

describe("getStylesheetLayers", () => {
  const style = {
    version: 8,
    sources: {
      data: { type: "vector", url: "https://example.com/tiles.json" },
    },
    layers: [
      { id: "background", type: "background" },
      { id: "areas", type: "fill", source: "data", "source-layer": "sites" },
      { id: "labels", type: "symbol", source: "data", "source-layer": "sites" },
      { id: "roads", type: "line", source: "data", "source-layer": "roads" },
    ],
  };

  it("keeps the fill, line and circle layers of the given vector layers", () => {
    const layers = getStylesheetLayers(style, ["sites"]);
    expect(layers).toHaveLength(1);
    expect(layers[0]).toMatchObject({ type: "fill", "source-layer": "sites" });
    expect(layers[0]).not.toHaveProperty("source");
  });

  it("returns nothing for something that is not a style", () => {
    expect(getStylesheetLayers(null, ["sites"])).toEqual([]);
    expect(getStylesheetLayers({ layers: "nope" }, ["sites"])).toEqual([]);
  });
});

describe("getWmsTileUrl", () => {
  it("builds a GetMap URL with a MapLibre bbox placeholder", () => {
    const url = getWmsTileUrl({
      rel: "wms",
      href: "https://example.com/wms?map=heritage",
      type: "image/jpeg",
      "wms:layers": ["sites", "areas"],
      "wms:styles": ["default", "default"],
      "wms:dimensions": { TIME: "2020" },
      "wms:transparent": true,
    } as StacLink);
    expect(url.endsWith("&BBOX={bbox-epsg-3857}")).toBe(true);
    const params = new URL(url.replace("&BBOX={bbox-epsg-3857}", ""))
      .searchParams;
    expect(Object.fromEntries(params)).toEqual({
      map: "heritage",
      SERVICE: "WMS",
      VERSION: "1.1.1",
      REQUEST: "GetMap",
      LAYERS: "sites,areas",
      STYLES: "default,default",
      SRS: "EPSG:3857",
      FORMAT: "image/jpeg",
      TRANSPARENT: "TRUE",
      WIDTH: "256",
      HEIGHT: "256",
      TIME: "2020",
    });
  });

  it("defaults to opaque PNG and empty styles", () => {
    const url = getWmsTileUrl({
      rel: "wms",
      href: "https://example.com/wms",
      "wms:layers": ["sites"],
    } as StacLink);
    expect(url).toContain("STYLES=&");
    expect(url).toContain("FORMAT=image%2Fpng");
    expect(url).toContain("TRANSPARENT=FALSE");
  });
});

describe("getXyzTiles", () => {
  it("returns the href as it is without servers", () => {
    expect(
      getXyzTiles({ rel: "xyz", href: "https://example.com/{z}/{x}/{y}.png" })
    ).toEqual(["https://example.com/{z}/{x}/{y}.png"]);
  });

  it("gives one template for each server", () => {
    expect(
      getXyzTiles({
        rel: "xyz",
        href: "https://{s}.example.com/{z}/{x}/{y}.png",
        "href:servers": ["a", "b"],
      } as StacLink)
    ).toEqual([
      "https://a.example.com/{z}/{x}/{y}.png",
      "https://b.example.com/{z}/{x}/{y}.png",
    ]);
  });
});
