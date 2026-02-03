import bbox from "@turf/bbox";
import bboxPolygon from "@turf/bbox-polygon";
import type { FeatureCollection } from "geojson";
import type {
  SpatialExtent,
  StacCollection,
  StacItem,
  StacLink,
} from "stac-ts";
import type { BBox2D } from "../types/map";
import type { AssetWithAlternates, StacAssets, StacValue } from "../types/stac";
import { GLOBAL_BBOX, sanitizeBbox } from "./bbox";
import { toAbsoluteUrl } from "./href";

export function getStacValueTitle(value: StacValue) {
  if ("title" in value && value.title) {
    return value.title as string;
  }
  return getStacValueId(value);
}

export function getStacValueId(value: StacValue) {
  if ("id" in value && value.id) {
    return value.id;
  }
  return getStacValueType(value);
}

export function getStacValueType(value: StacValue) {
  switch (value.type) {
    case "Collection":
      return "Collection";
    case "Feature":
      return "Item";
    case "Catalog":
      return "Catalog";
    case "FeatureCollection":
      return "Item collection";
    default:
      return "unknown";
  }
}

export function getLink(
  value: { links?: Array<StacLink> },
  rel: string
): StacLink | undefined {
  return value.links?.find((link) => link.rel === rel);
}

export function getLinkHref(
  value: { links?: Array<StacLink> },
  rel: string
): string | undefined {
  return getLink(value, rel)?.href;
}

export function getSelfHref(value: StacValue) {
  return getLinkHref(value, "self");
}

export function getThumbnailAsset(value: StacValue) {
  if ("assets" in value) {
    const assets = value.assets as StacAssets;
    const asset =
      assets["thumbnail"] ||
      Object.values(assets).find((asset) =>
        asset.roles?.includes("thumbnail")
      ) ||
      assets["thumbnails"];
    return asset?.href.startsWith("http") && asset;
  }
}

export async function fetchStac({
  href,
  method = "GET",
  body,
}: {
  href: string | URL;
  method?: "GET" | "POST";
  body?: string;
}): Promise<StacValue> {
  return await fetch(href, {
    method,
    headers: {
      Accept: "application/json",
    },
    body,
  }).then(async (response) => {
    if (response.ok) {
      return response
        .json()
        .then((json) => makeHrefsAbsolute(json, href.toString()));
    } else {
      throw new Error(`GET ${href}: ${response.statusText}`);
    }
  });
}

export function makeHrefsAbsolute<T extends StacValue>(
  value: T,
  baseUrl: string
): T {
  const baseUrlObj = new URL(baseUrl);

  if (value.links != null) {
    let hasSelf = false;
    for (const link of value.links) {
      if (link.rel === "self") hasSelf = true;
      if (link.href) {
        link.href = toAbsoluteUrl(link.href, baseUrlObj);
      }
    }
    if (hasSelf === false) {
      value.links.push({ href: baseUrl, rel: "self" });
    }
  } else {
    value.links = [{ href: baseUrl, rel: "self" }];
  }

  if (value.assets != null) {
    for (const asset of Object.values(value.assets)) {
      if (asset.href) {
        asset.href = toAbsoluteUrl(asset.href, baseUrlObj);
      }
    }
  }
  return value;
}

export function isCollectionInBbox(
  collection: StacCollection,
  bbox: BBox2D,
  includeGlobalCollections: boolean
) {
  if (bbox[2] - bbox[0] >= 360) {
    // A global bbox always contains every collection
    return true;
  } else if (includeGlobalCollections && isGlobalCollection(collection)) {
    // A global collection is always there
    return true;
  }
  const collectionBbox = collection?.extent?.spatial?.bbox?.[0];
  if (collectionBbox) {
    return (
      !(
        collectionBbox[0] < bbox[0] &&
        collectionBbox[1] < bbox[1] &&
        collectionBbox[2] > bbox[2] &&
        collectionBbox[3] > bbox[3]
      ) &&
      !(
        collectionBbox[0] > bbox[2] ||
        collectionBbox[1] > bbox[3] ||
        collectionBbox[2] < bbox[0] ||
        collectionBbox[3] < bbox[1]
      )
    );
  } else {
    return false;
  }
}

export function isGlobalCollection(collection: StacCollection) {
  const bbox = getCollectionExtents(collection);
  return isGlobalBbox(bbox);
}

export function isGlobalBbox(bbox: BBox2D | SpatialExtent) {
  const sanitizedBbox = sanitizeBbox(bbox);
  return (
    sanitizedBbox &&
    sanitizedBbox[0] == -180 &&
    sanitizedBbox[1] == -90 &&
    sanitizedBbox[2] == 180 &&
    sanitizedBbox[3] == 90
  );
}

export function getCollectionExtents(
  collection: StacCollection
): SpatialExtent {
  const spatialExtent = collection.extent?.spatial;
  // check if bbox is a list of lists, otherwise its a single list of nums
  return Array.isArray(spatialExtent?.bbox?.[0])
    ? spatialExtent?.bbox[0]
    : (spatialExtent?.bbox as unknown as SpatialExtent);
}

export function conformsToFreeTextCollectionSearch(value: StacValue) {
  if (value.type !== "Catalog" || !Array.isArray(value.conformsTo))
    return false;

  return !!(value.conformsTo as string[]).find((conformsTo) => {
    const parts = conformsTo.split("/");
    return (
      parts[2] === "api.stacspec.org" &&
      parts[4] === "collection-search#free-text"
    );
  });
}

export function getCollectionDatetimes(collection: StacCollection) {
  const interval = collection.extent?.temporal?.interval[0];
  return {
    start: interval?.[0] ? new Date(interval[0]) : null,
    end: interval?.[1] ? new Date(interval[1]) : null,
  };
}

export function isCollectionInDatetimes(
  collection: StacCollection,
  start: Date,
  end: Date
) {
  const { start: collectionStart, end: collectionEnd } =
    getCollectionDatetimes(collection);

  return !(
    (collectionEnd && collectionEnd < start) ||
    (collectionStart && collectionStart > end)
  );
}

export function getGeotiffHref(
  asset: AssetWithAlternates,
  restrictToThreeBandCogs: boolean = true
): string | null {
  if (!isGeotiff(asset, restrictToThreeBandCogs)) {
    return null;
  }
  let geotiffHref = null;
  if (asset.href.startsWith("http")) {
    geotiffHref = asset.href;
  } else if (asset.alternate) {
    const httpAlternate = Object.values(asset.alternate).find((alt) =>
      alt.href.startsWith("http")
    );
    if (httpAlternate) {
      geotiffHref = httpAlternate.href;
    }
  }
  return geotiffHref;
}

export function isGeotiff(
  asset: AssetWithAlternates,
  restrictToThreeBandCogs: boolean = true
) {
  if (!asset.type?.startsWith("image/tiff; application=geotiff")) {
    return false;
  }
  if (!hasValidBandCount(asset, restrictToThreeBandCogs)) {
    return false;
  }
  return hasHttpHref(asset);
}

function hasValidBandCount(
  asset: AssetWithAlternates,
  restrictToThreeBandCogs: boolean = true
): boolean {
  const bandCount = getBandCount(asset);
  if (bandCount === null) return !restrictToThreeBandCogs;
  else if (restrictToThreeBandCogs) return bandCount === 3;
  else return bandCount === 3 || bandCount === 4;
}

function hasHttpHref(asset: AssetWithAlternates): boolean {
  if (asset.href.startsWith("http")) {
    return true;
  }
  if (asset.alternate) {
    return Object.values(asset.alternate).some((alt) =>
      alt.href.startsWith("http")
    );
  }
  return false;
}

export function getBandCount(asset: AssetWithAlternates): number | null {
  const bands = asset.bands || asset["eo:bands"];
  return bands ? bands.length : null;
}

export function sortAssets(
  assets: StacAssets,
  restrictToThreeBandCogs: boolean = true
) {
  return Object.entries(assets).sort(
    ([, a], [, b]) =>
      getAssetScore(b as AssetWithAlternates, restrictToThreeBandCogs) -
      getAssetScore(a as AssetWithAlternates, restrictToThreeBandCogs)
  );
}

export function getBestAssetFromSortedList(
  sortedAssets: [string, AssetWithAlternates][],
  restrictToThreeBandCogs: boolean = true
) {
  const first = sortedAssets[0];
  if (
    first &&
    getAssetScore(first[1] as AssetWithAlternates, restrictToThreeBandCogs) > 0
  ) {
    return first;
  }
  return [null, null];
}

export function getBestAsset(
  item: StacItem,
  restrictToThreeBandCogs: boolean = true
) {
  const sortedAssets = sortAssets(item.assets, restrictToThreeBandCogs);
  return getBestAssetFromSortedList(sortedAssets, restrictToThreeBandCogs);
}

export function getAssetScore(
  asset: AssetWithAlternates,
  restrictToThreeBandCogs: boolean = true
): number {
  const geotiff = isGeotiff(asset, restrictToThreeBandCogs);
  if (!geotiff) return 0;

  const hasVisualRole = asset.roles?.includes("visual") ?? false;
  const bandCount = getBandCount(asset);
  const hasThreeOrFourBands = bandCount === 3 || bandCount === 4;

  let score = 1;
  if (hasVisualRole) score += 2;
  if (hasThreeOrFourBands) score += 1;

  return score;
}

export function collectionToFeature(collection: StacCollection) {
  const bbox = sanitizeBbox(getCollectionExtents(collection)) || GLOBAL_BBOX;
  return bboxPolygon(bbox, {
    id: collection.id,
  });
}

export function getBbox(
  value: StacValue,
  collections: StacCollection[] | null
): BBox2D | null {
  switch (value.type) {
    case "Catalog":
      return (collections && getCollectionsBbox(collections)) || null;
    case "Collection":
      return sanitizeBbox(getCollectionExtents(value));
    case "Feature":
      return (value.bbox && sanitizeBbox(value.bbox)) || null;
    case "FeatureCollection":
      return bbox(value as FeatureCollection) as BBox2D;
  }
}

function getCollectionsBbox(collections: StacCollection[]) {
  return sanitizeBbox(
    collections
      .map((collection) => getCollectionExtents(collection))
      .filter((extents) => !!extents)
      .reduce((accumulator, currentValue) => {
        return [
          Math.min(accumulator[0], currentValue[0]),
          Math.min(accumulator[1], currentValue[1]),
          Math.max(accumulator[2], currentValue[2]),
          Math.max(accumulator[3], currentValue[3]),
        ];
      })
  );
}
