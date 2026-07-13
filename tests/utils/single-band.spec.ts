import { Photometric } from "@cogeotiff/core";
import {
  BlackIsZero,
  CreateTexture,
  FilterNoDataVal,
  LinearRescale,
  MaskTexture,
  WhiteIsZero,
} from "@developmentseed/deck.gl-raster/gpu-modules";
import type { GeoTIFF } from "@developmentseed/geotiff";
import type { StacAsset } from "stac-ts";
import { describe, expect, it } from "vitest";
import {
  accumulateMinMax,
  getStacBandStatistics,
  getStoredBandStatistics,
  resolveBandRange,
  singleBandPipeline,
  type SingleBandTileData,
} from "../../src/utils/single-band";

function asset(extra: Record<string, unknown>): StacAsset {
  return { href: "https://example.com/cog.tif", ...extra } as StacAsset;
}

function geotiff(storedStats: unknown): GeoTIFF {
  return { storedStats } as unknown as GeoTIFF;
}

describe("getStacBandStatistics", () => {
  it("reads minimum and maximum from raster:bands", () => {
    expect(
      getStacBandStatistics(
        asset({
          "raster:bands": [{ statistics: { minimum: 10, maximum: 250 } }],
        })
      )
    ).toEqual({ min: 10, max: 250 });
  });

  it("returns undefined when raster:bands is absent", () => {
    expect(getStacBandStatistics(asset({}))).toBeUndefined();
  });

  it("returns undefined when statistics are non-finite", () => {
    expect(
      getStacBandStatistics(
        asset({
          "raster:bands": [{ statistics: { minimum: null, maximum: 5 } }],
        })
      )
    ).toBeUndefined();
  });
});

describe("getStoredBandStatistics", () => {
  it("reads band 1 stats from the geotiff's stored GDAL metadata", () => {
    const stats = new Map([
      [1, { min: 0, max: 100, mean: null, std: null, validPercent: null }],
    ]);
    expect(getStoredBandStatistics(geotiff(stats))).toEqual({
      min: 0,
      max: 100,
    });
  });

  it("returns undefined when no stored stats exist", () => {
    expect(getStoredBandStatistics(geotiff(null))).toBeUndefined();
  });

  it("returns undefined when band 1 min/max are null", () => {
    const stats = new Map([
      [1, { min: null, max: null, mean: null, std: null, validPercent: null }],
    ]);
    expect(getStoredBandStatistics(geotiff(stats))).toBeUndefined();
  });
});

describe("resolveBandRange", () => {
  it("prefers STAC statistics over stored stats", () => {
    const stats = new Map([
      [1, { min: 0, max: 100, mean: null, std: null, validPercent: null }],
    ]);
    expect(
      resolveBandRange(
        asset({ "raster:bands": [{ statistics: { minimum: 1, maximum: 9 } }] }),
        geotiff(stats)
      )
    ).toEqual({ min: 1, max: 9 });
  });

  it("falls back to stored stats when STAC has none", () => {
    const stats = new Map([
      [1, { min: 3, max: 7, mean: null, std: null, validPercent: null }],
    ]);
    expect(resolveBandRange(asset({}), geotiff(stats))).toEqual({
      min: 3,
      max: 7,
    });
  });

  it("returns undefined when neither source has stats", () => {
    expect(resolveBandRange(asset({}), geotiff(null))).toBeUndefined();
  });
});

function tiff(cachedTags: Record<string, unknown>): GeoTIFF {
  return { cachedTags } as unknown as GeoTIFF;
}

describe("singleBandPipeline", () => {
  it("returns a getTileData + renderTile pair for single-band MinIsBlack", () => {
    const pipeline = singleBandPipeline(
      tiff({
        samplesPerPixel: 1,
        photometric: Photometric.MinIsBlack,
        nodata: null,
      }),
      { min: 0, max: 255 }
    );
    expect(pipeline?.getTileData).toBeTypeOf("function");
    expect(pipeline?.renderTile).toBeTypeOf("function");
  });

  it("returns undefined for palette single-band", () => {
    expect(
      singleBandPipeline(
        tiff({
          samplesPerPixel: 1,
          photometric: Photometric.Palette,
          nodata: null,
        }),
        undefined
      )
    ).toBeUndefined();
  });

  it("returns undefined for 3-band imagery", () => {
    expect(
      singleBandPipeline(
        tiff({
          samplesPerPixel: 3,
          photometric: Photometric.Rgb,
          nodata: null,
        }),
        undefined
      )
    ).toBeUndefined();
  });

  it("returns undefined for 4-band imagery", () => {
    expect(
      singleBandPipeline(
        tiff({
          samplesPerPixel: 4,
          photometric: Photometric.Rgb,
          nodata: null,
        }),
        undefined
      )
    ).toBeUndefined();
  });
});

function tileData(extra: Partial<SingleBandTileData>): SingleBandTileData {
  return { texture: {}, width: 1, height: 1, byteLength: 4, ...extra } as never;
}

describe("singleBandPipeline renderTile", () => {
  it("wires CreateTexture, LinearRescale, BlackIsZero for a plain single band", () => {
    const pipeline = singleBandPipeline(
      tiff({
        samplesPerPixel: 1,
        photometric: Photometric.MinIsBlack,
        nodata: null,
      }),
      { min: 5, max: 200 }
    );
    const { renderPipeline } = pipeline!.renderTile(tileData({}))!;
    expect(renderPipeline.map((step) => step.module)).toEqual([
      CreateTexture,
      LinearRescale,
      BlackIsZero,
    ]);
    expect(renderPipeline[1].props).toEqual({ rescaleMin: 5, rescaleMax: 200 });
  });

  it("inserts FilterNoDataVal and MaskTexture in order when present", () => {
    const pipeline = singleBandPipeline(
      tiff({
        samplesPerPixel: 1,
        photometric: Photometric.MinIsBlack,
        nodata: -9999,
      }),
      { min: 0, max: 255 }
    );
    const { renderPipeline } = pipeline!.renderTile(
      tileData({ mask: {} as never })
    )!;
    expect(renderPipeline.map((step) => step.module)).toEqual([
      CreateTexture,
      FilterNoDataVal,
      MaskTexture,
      LinearRescale,
      BlackIsZero,
    ]);
    expect(renderPipeline[1].props).toEqual({ value: -9999 });
  });

  it("omits LinearRescale when range is undefined", () => {
    const pipeline = singleBandPipeline(
      tiff({
        samplesPerPixel: 1,
        photometric: Photometric.MinIsBlack,
        nodata: null,
      }),
      undefined
    );
    const { renderPipeline } = pipeline!.renderTile(tileData({}))!;
    expect(renderPipeline.map((step) => step.module)).toEqual([
      CreateTexture,
      BlackIsZero,
    ]);
  });

  it("terminates with WhiteIsZero for MinIsWhite photometric", () => {
    const pipeline = singleBandPipeline(
      tiff({
        samplesPerPixel: 1,
        photometric: Photometric.MinIsWhite,
        nodata: null,
      }),
      { min: 0, max: 1 }
    );
    const { renderPipeline } = pipeline!.renderTile(tileData({}))!;
    expect(renderPipeline.at(-1)!.module).toBe(WhiteIsZero);
    expect(renderPipeline.map((step) => step.module)).not.toContain(
      BlackIsZero
    );
  });
});

describe("accumulateMinMax", () => {
  it("tracks the min and max across values", () => {
    const acc = { min: Infinity, max: -Infinity };
    accumulateMinMax(acc, [5, 1, 9, 3], null, null);
    expect(acc).toEqual({ min: 1, max: 9 });
  });

  it("skips masked-out (0) pixels", () => {
    const acc = { min: Infinity, max: -Infinity };
    accumulateMinMax(acc, [5, 1, 9, 3], new Uint8Array([255, 0, 0, 255]), null);
    expect(acc).toEqual({ min: 3, max: 5 });
  });

  it("skips nodata values", () => {
    const acc = { min: Infinity, max: -Infinity };
    accumulateMinMax(acc, [5, -9999, 9, 3], null, -9999);
    expect(acc).toEqual({ min: 3, max: 9 });
  });

  it("skips non-finite values", () => {
    const acc = { min: Infinity, max: -Infinity };
    accumulateMinMax(acc, [5, NaN, 9, Infinity], null, null);
    expect(acc).toEqual({ min: 5, max: 9 });
  });
});
