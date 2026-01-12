import type { UseFileUploadReturn } from "@chakra-ui/react";
import type { StacAsset, StacCollection, StacItem, StacLink } from "stac-ts";
import type { BBox2D } from "../types/map";
import type { DatetimeBounds, StacAssets, StacValue } from "../types/stac";

export async function getStacJsonValue(
  href: string,
  fileUpload?: UseFileUploadReturn
): Promise<StacValue> {
  let url;
  try {
    url = new URL(href);
  } catch {
    if (fileUpload) {
      return getStacJsonValueFromUpload(fileUpload);
    } else {
      throw new Error(
        `Cannot get STAC JSON value from href=${href} without a fileUpload`
      );
    }
  }
  return await fetchStac(url);
}

async function getStacJsonValueFromUpload(fileUpload: UseFileUploadReturn) {
  // We assume there's one and only on file.
  const file = fileUpload.acceptedFiles[0];
  return JSON.parse(await file.text());
}

export async function fetchStac(
  href: string | URL,
  method: "GET" | "POST" = "GET",
  body?: string
): Promise<StacValue> {
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
        .then((json) => makeHrefsAbsolute(json, href.toString()))
        .then((json) => maybeAddTypeField(json));
    } else {
      throw new Error(`${method} ${href}: ${response.statusText}`);
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

// eslint-disable-next-line
function maybeAddTypeField(value: any) {
  if (!value.type) {
    if (value.features && Array.isArray(value.features)) {
      value.type = "FeatureCollection";
    } else if (value.extent) {
      value.type = "Collection";
    } else if (value.geometry && value.properties) {
      value.type = "Feature";
    } else if (value.stac_version) {
      value.type = "Catalog";
    }
  }
  return value;
}

export function getItemDatetimes(item: StacItem) {
  const start = item.properties?.start_datetime
    ? new Date(item.properties.start_datetime)
    : item.properties?.datetime
      ? new Date(item.properties.datetime)
      : null;
  const end = item.properties?.end_datetime
    ? new Date(item.properties.end_datetime)
    : item.properties?.datetime
      ? new Date(item.properties.datetime)
      : null;
  return { start, end };
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

export function isCollectionInDatetimeBounds(
  collection: StacCollection,
  bounds: DatetimeBounds
) {
  const interval = collection.extent.temporal.interval[0];
  const start = interval[0] ? new Date(interval[0]) : null;
  const end = interval[1] ? new Date(interval[1]) : null;
  return !((end && end < bounds.start) || (start && start > bounds.end));
}

export function isItemInBbox(item: StacItem, bbox: BBox2D) {
  if (bbox[2] - bbox[0] >= 360) {
    // A global bbox always contains every item
    return true;
  }
  const itemBbox = item.bbox;
  if (itemBbox) {
    return (
      !(
        itemBbox[0] < bbox[0] &&
        itemBbox[1] < bbox[1] &&
        itemBbox[2] > bbox[2] &&
        itemBbox[3] > bbox[3]
      ) &&
      !(
        itemBbox[0] > bbox[2] ||
        itemBbox[1] > bbox[3] ||
        itemBbox[2] < bbox[0] ||
        itemBbox[3] < bbox[1]
      )
    );
  } else {
    return false;
  }
}

export function isItemInDatetimeBounds(item: StacItem, bounds: DatetimeBounds) {
  const datetimes = getItemDatetimes(item);
  return !(
    (datetimes.end && datetimes.end < bounds.start) ||
    (datetimes.start && datetimes.start > bounds.end)
  );
}

export function deconstructStac(value: StacValue) {
  if (value.type === "Feature") {
    return {
      links: value.links,
      assets: value.assets as StacAssets | undefined,
      properties: value.properties,
    };
  } else {
    const { links, assets, ...properties } = value;
    return {
      links: links || [],
      assets: assets as StacAssets | undefined,
      properties,
    };
  }
}

export function getImportantLinks(links: StacLink[]) {
  let rootLink: StacLink | undefined = undefined;
  let collectionsLink: StacLink | undefined = undefined;
  let nextLink: StacLink | undefined = undefined;
  let prevLink: StacLink | undefined = undefined;
  const filteredLinks = [];
  if (links) {
    for (const link of links) {
      switch (link.rel) {
        case "root":
          rootLink = link;
          break;
        case "data":
          collectionsLink = link;
          break;
        case "next":
          nextLink = link;
          break;
        case "previous":
          prevLink = link;
          break;
      }
      // We already show children and items in their own pane
      if (link.rel !== "child" && link.rel !== "item") filteredLinks.push(link);
    }
  }
  return { rootLink, collectionsLink, nextLink, prevLink, filteredLinks };
}

export function isGeoTiff(asset: StacAsset) {
  return asset.type?.startsWith("image/tiff; application=geotiff");
}

export function getCogHref(value: StacValue): string | undefined {
  if (!value.assets) {
    return undefined;
  }

  for (const asset of Object.values(value.assets)) {
    if (isGeoTiff(asset)) {
      return asset.href as string;
    }
  }

  return undefined;
}
