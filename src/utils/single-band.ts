import { Photometric } from "@cogeotiff/core";
import type { COGLayerProps } from "@developmentseed/deck.gl-geotiff";
import {
  BlackIsZero,
  CreateTexture,
  FilterNoDataVal,
  LinearRescale,
  MaskTexture,
  WhiteIsZero,
  type RasterModule,
} from "@developmentseed/deck.gl-raster/gpu-modules";
import type { GeoTIFF, Overview } from "@developmentseed/geotiff";
import type { Texture } from "@luma.gl/core";
import type { StacAsset } from "stac-ts";

export type BandRange = { min: number; max: number };

function toRange(min: unknown, max: unknown): BandRange | undefined {
  if (typeof min !== "number" || typeof max !== "number") return undefined;
  if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;
  return { min, max };
}

export function getStacBandStatistics(asset: StacAsset): BandRange | undefined {
  const bands = (asset as { "raster:bands"?: { statistics?: unknown }[] })[
    "raster:bands"
  ];
  const statistics = bands?.[0]?.statistics as
    { minimum?: unknown; maximum?: unknown } | undefined;
  if (!statistics) return undefined;
  return toRange(statistics.minimum, statistics.maximum);
}

export function getStoredBandStatistics(
  geotiff: GeoTIFF
): BandRange | undefined {
  const stats = geotiff.storedStats?.get(1);
  if (!stats) return undefined;
  return toRange(stats.min, stats.max);
}

export function resolveBandRange(
  asset: StacAsset | undefined,
  geotiff: GeoTIFF
): BandRange | undefined {
  return (
    (asset && getStacBandStatistics(asset)) ?? getStoredBandStatistics(geotiff)
  );
}

export type SingleBandTileData = {
  texture: Texture;
  mask?: Texture;
  height: number;
  width: number;
  byteLength: number;
};

export type SingleBandPipeline = Pick<
  COGLayerProps<SingleBandTileData>,
  "getTileData" | "renderTile"
>;

export function isSingleBandGreyscale(geotiff: GeoTIFF): boolean {
  const { samplesPerPixel, photometric } = geotiff.cachedTags;
  return samplesPerPixel === 1 && photometric !== Photometric.Palette;
}

export function singleBandPipeline(
  geotiff: GeoTIFF,
  range: BandRange | undefined
): SingleBandPipeline | undefined {
  if (!isSingleBandGreyscale(geotiff)) {
    return undefined;
  }
  const { photometric, nodata } = geotiff.cachedTags;

  const getTileData: SingleBandPipeline["getTileData"] = async (
    image: GeoTIFF | Overview,
    { device, x, y, signal, pool }
  ) => {
    const { array } = await image.fetchTile(x, y, {
      boundless: false,
      pool,
      signal,
    });
    const { width, height, mask } = array;
    const source =
      array.layout === "band-separate" ? array.bands[0] : array.data;
    const data =
      source instanceof Float32Array ? source : new Float32Array(source);
    const texture = device.createTexture({
      data,
      format: "r32float",
      width,
      height,
      sampler: { minFilter: "nearest", magFilter: "nearest" },
    });
    let byteLength = data.byteLength;
    let maskTexture: Texture | undefined;
    if (mask) {
      maskTexture = device.createTexture({
        data: mask,
        format: "r8unorm",
        width,
        height,
        sampler: { minFilter: "nearest", magFilter: "nearest" },
      });
      byteLength += mask.byteLength;
    }
    return { texture, mask: maskTexture, byteLength, width, height };
  };

  const renderTile: SingleBandPipeline["renderTile"] = (data) => {
    const renderPipeline: RasterModule[] = [
      { module: CreateTexture, props: { textureName: data.texture } },
    ];
    if (nodata !== null) {
      renderPipeline.push({
        module: FilterNoDataVal,
        props: { value: nodata },
      });
    }
    if (data.mask) {
      renderPipeline.push({
        module: MaskTexture,
        props: { maskTexture: data.mask },
      });
    }
    if (range) {
      renderPipeline.push({
        module: LinearRescale,
        props: { rescaleMin: range.min, rescaleMax: range.max },
      });
    }
    renderPipeline.push({
      module:
        photometric === Photometric.MinIsWhite ? WhiteIsZero : BlackIsZero,
    });
    return { renderPipeline };
  };

  return { getTileData, renderTile };
}

export function accumulateMinMax(
  acc: { min: number; max: number },
  values: ArrayLike<number>,
  mask: Uint8Array | null,
  nodata: number | null
): void {
  for (let i = 0; i < values.length; i++) {
    if (mask && mask[i] === 0) continue;
    const v = values[i];
    if (!Number.isFinite(v)) continue;
    if (nodata !== null && v === nodata) continue;
    if (v < acc.min) acc.min = v;
    if (v > acc.max) acc.max = v;
  }
}

export async function computeBandRangeFromOverview(
  geotiff: GeoTIFF,
  signal?: AbortSignal
): Promise<BandRange | undefined> {
  const overview = geotiff.overviews.at(-1);
  if (!overview) return undefined;
  const { nodata } = geotiff.cachedTags;
  const { x: nx, y: ny } = overview.tileCount;
  const coords: [number, number][] = [];
  for (let ty = 0; ty < ny; ty++) {
    for (let tx = 0; tx < nx; tx++) {
      coords.push([tx, ty]);
    }
  }
  const tiles = await overview.fetchTiles(coords, { boundless: false, signal });
  const acc = { min: Infinity, max: -Infinity };
  for (const { array } of tiles) {
    const source =
      array.layout === "band-separate" ? array.bands[0] : array.data;
    accumulateMinMax(acc, source, array.mask, nodata);
  }
  if (
    !Number.isFinite(acc.min) ||
    !Number.isFinite(acc.max) ||
    acc.min === acc.max
  ) {
    return undefined;
  }
  return { min: acc.min, max: acc.max };
}
