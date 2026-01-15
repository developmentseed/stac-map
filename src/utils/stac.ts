import type { StacAsset, StacCollection, StacLink } from "stac-ts";
import type { BBox2D } from "../types/map";
import type { StacValue } from "../types/stac";

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
    return (value.assets as { [key: string]: StacAsset })["thumbnail"];
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
