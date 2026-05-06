import type { BBox } from "geojson";
import type {
  SpatialExtent,
  StacAsset,
  StacCollection,
  StacLink,
} from "stac-ts";
import type { BBox2D } from "../store";
import type { StacAssets, StacValue } from "../types/stac";
import { getAccessToken } from "./auth";
import { toAbsoluteUrl } from "./href";

export async function fetchStacValue({
  href,
  uploadedFile,
}: {
  href: string;
  uploadedFile?: File | null;
}) {
  if (href.startsWith("http")) {
    const headers: Record<string, string> = { Accept: "application/json" };
    const token = getAccessToken(href);
    if (token) headers["Authorization"] = `Bearer ${token}`;

    return await fetch(href, {
      method: "GET",
      headers,
    }).then(async (response) => {
      if (response.ok) {
        return response
          .json()
          .then((json) => makeHrefsAbsolute(json, href.toString()));
      } else {
        throw new Error(`GET ${href}: ${response.statusText}`);
      }
    });
  } else if (uploadedFile) {
    const value = JSON.parse(await uploadedFile.text()) as StacValue;
    const selfHref = getSelfHref(value);
    return selfHref
      ? makeHrefsAbsolute(value, selfHref)
      : removeRelativeHrefs(value);
  } else {
    throw new Error(
      `Not a http(s) URL, and no file has been uploaded: ${href}`
    );
  }
}

export function getStacTitle(value: StacValue) {
  if ("title" in value && value.title) {
    return value.title as string;
  }
  return getStacId(value);
}

export function getStacId(value: StacValue) {
  if ("id" in value && value.id) {
    return value.id;
  }
  return getStacType(value);
}

export function getStacType(value: StacValue) {
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
      Object.values(assets).find(
        (asset) =>
          asset.roles?.includes("thumbnail") && asset.href.startsWith("http")
      ) ||
      assets["thumbnails"] ||
      Object.values(assets).find(
        (asset) =>
          asset.roles?.includes("overview") && asset.href.startsWith("http")
      );
    return asset?.href.startsWith("http") && asset;
  }
}

function makeHrefsAbsolute<T extends StacValue>(value: T, baseUrl: string): T {
  const baseUrlObj = new URL(baseUrl);

  if (value.links != null) {
    let hasSelfHref = false;
    for (const link of value.links) {
      if (link.rel === "self") {
        hasSelfHref = true;
        link.href = baseUrl;
      }
      if (link.href) {
        link.href = toAbsoluteUrl(link.href, baseUrlObj);
      }
    }
    if (!hasSelfHref) {
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

function removeRelativeHrefs<T extends StacValue>(value: T): T {
  if (value.links != null) {
    value.links = value.links.filter((link) => link.href?.startsWith("http"));
  }

  if (value.assets != null) {
    value.assets = Object.fromEntries(
      Object.entries(value.assets).filter(
        ([, asset]) => asset.href && URL.canParse(asset.href)
      )
    );
  }

  return value;
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

export function getSpatialExtent(collection: StacCollection): SpatialExtent {
  const spatialExtent = collection.extent?.spatial;
  // check if bbox is a list of lists, otherwise its a single list of nums
  return Array.isArray(spatialExtent?.bbox?.[0])
    ? spatialExtent?.bbox[0]
    : (spatialExtent?.bbox as unknown as SpatialExtent);
}

export function getBandCount(asset: StacAsset): number | undefined {
  const extra = asset as {
    bands?: unknown[];
    "eo:bands"?: unknown[];
    "raster:bands"?: unknown[];
  };
  for (const bands of [extra.bands, extra["eo:bands"], extra["raster:bands"]]) {
    if (bands) return bands.length;
  }
  return undefined;
}

export function getCogHref(asset: StacAsset): string | undefined {
  if (!asset.type?.startsWith("image/tiff; application=geotiff"))
    return undefined;
  const bandCount = getBandCount(asset);
  if (bandCount !== undefined && bandCount !== 3 && bandCount !== 4)
    return undefined;
  const extra = asset as {
    alternate?: Record<string, { href?: string }>;
  };
  if (asset.href.startsWith("http")) return asset.href;
  if (extra.alternate) {
    for (const alt of Object.values(extra.alternate)) {
      if (alt.href?.startsWith("http")) return alt.href;
    }
  }
  return undefined;
}

export function sanitizeBbox(bbox: BBox | SpatialExtent): BBox2D | null {
  if (!bbox) return null;
  if (bbox.length === 6) {
    return [
      Math.max(bbox[0], -180),
      Math.max(bbox[1], -90),
      Math.min(bbox[3], 180),
      Math.min(bbox[4], 90),
    ];
  } else {
    return [
      Math.max(bbox[0], -180),
      Math.max(bbox[1], -90),
      Math.min(bbox[2], 180),
      Math.min(bbox[3], 90),
    ];
  }
}
