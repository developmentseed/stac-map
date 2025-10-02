import type { UseFileUploadReturn } from "@chakra-ui/react";
import type { StacItem } from "stac-ts";
import type { StacValue } from "../types/stac";

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
