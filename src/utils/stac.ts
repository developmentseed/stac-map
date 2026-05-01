import type { StacLink } from "stac-ts";
import type { StacAssets, StacValue } from "../types/stac";
import { getAccessToken } from "./auth";
import { toAbsoluteUrl } from "./href";

export async function fetchStacValue({ href }: { href: string }) {
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
      Object.values(assets).find((asset) =>
        asset.roles?.includes("thumbnail")
      ) ||
      assets["thumbnails"];
    return asset?.href.startsWith("http") && asset;
  }
}

function makeHrefsAbsolute<T extends StacValue>(value: T, baseUrl: string): T {
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
