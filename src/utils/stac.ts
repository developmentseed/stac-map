import type {
  SpatialExtent,
  StacAsset,
  StacCollection,
  StacLink,
} from "stac-ts";
import type { BBox2D } from "../types/map";
import type { AssetWithAlternates, StacAssets, StacValue } from "../types/stac";
import { sanitizeBbox } from "./map";
import { maybeSignPlanetaryComputerHref } from "./planetary-computer";

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
    const asset = (value.assets as { [key: string]: StacAsset })["thumbnail"];
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

export function toAbsoluteUrl(href: string, baseUrl: URL): string {
  if (isAbsolute(href)) return href;

  const targetUrl = new URL(href, baseUrl);

  if (targetUrl.protocol === "http:" || targetUrl.protocol === "https:") {
    return targetUrl.toString();
  } else if (targetUrl.protocol === "s3:") {
    return decodeURI(targetUrl.toString());
  } else {
    return targetUrl.toString();
  }
}

function isAbsolute(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isCollectionInBbox(collection: StacCollection, bbox: BBox2D) {
  if (bbox[2] - bbox[0] >= 360) {
    // A global bbox always contains every collection
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
  const bbox = sanitizeBbox(getCollectionExtents(collection));
  return bbox[0] == -180 && bbox[1] == -90 && bbox[2] == 180 && bbox[3] == 90;
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

export function getCollectionStartDatetime(collection: StacCollection) {
  const start = collection.extent?.temporal?.interval[0]?.[0];
  return start ? new Date(start) : null;
}

export function getCollectionEndDatetime(collection: StacCollection) {
  const end = collection.extent?.temporal?.interval[0]?.[1];
  return end ? new Date(end) : null;
}

export function isCollectionInDatetimes(
  collection: StacCollection,
  start: Date,
  end: Date
) {
  const collectionStart = getCollectionStartDatetime(collection);
  const collectionEnd = getCollectionEndDatetime(collection);

  return !(
    (collectionEnd && collectionEnd < start) ||
    (collectionStart && collectionStart > end)
  );
}

export async function getGeotiffHref(
  asset: AssetWithAlternates
): Promise<string | null> {
  if (!isGeotiff(asset)) {
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
  if (geotiffHref === null) return null;

  const signedHref = await maybeSignPlanetaryComputerHref(geotiffHref);
  if (signedHref) return signedHref;

  return geotiffHref;
}

export function isGeotiff(asset: AssetWithAlternates) {
  if (!asset.type?.startsWith("image/tiff; application=geotiff")) {
    return false;
  }
  if (!hasValidBandCount(asset)) {
    return false;
  }
  return hasHttpHref(asset);
}

function hasValidBandCount(asset: AssetWithAlternates): boolean {
  const bandCount = getBandCount(asset);
  if (bandCount === null) {
    return true;
  }
  return bandCount === 3 || bandCount === 4;
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

export function sortAssets(assets: StacAssets) {
  return Object.entries(assets).sort(
    ([, a], [, b]) =>
      getAssetScore(b as AssetWithAlternates) -
      getAssetScore(a as AssetWithAlternates)
  );
}

export function getBestAsset(sortedAssets: [string, AssetWithAlternates][]) {
  const first = sortedAssets[0];
  if (first && getAssetScore(first[1] as AssetWithAlternates) > 0) {
    return first;
  }
  return [null, null];
}

export function getAssetScore(asset: AssetWithAlternates): number {
  const geotiff = isGeotiff(asset);
  if (!geotiff) return 0;

  const hasVisualRole = asset.roles?.includes("visual") ?? false;
  const bandCount = getBandCount(asset);
  const hasThreeOrFourBands = bandCount === 3 || bandCount === 4;

  let score = 1;
  if (hasVisualRole) score += 2;
  if (hasThreeOrFourBands) score += 1;

  return score;
}
