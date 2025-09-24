import type { StacLink } from "stac-ts";
import type { StacValue } from "./types/stac";

export async function fetchStac(
  href: string | URL,
  method: "GET" | "POST" = "GET",
  body?: string,
) {
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
        .then((json) => makeStacHrefsAbsolute(json, href.toString()))
        .then((json) => maybeAddTypeField(json));
    } else {
      throw new Error(`${method} ${href}: ${response.statusText}`);
    }
  });
}

export async function fetchStacLink(link: StacLink, href?: string | undefined) {
  return fetchStac(
    new URL(link.href, href),
    link.method as "GET" | "POST" | undefined,
    // eslint-disable-next-line
    (link.body as any) && JSON.stringify(link.body),
  );
}

/**
 * Attempt to convert links and asset URLS to absolute URLs while ensuring a self link exists.
 *
 * @param value Source stac item, collection, or catalog
 * @param baseUrl base location of the STAC document
 */
export function makeStacHrefsAbsolute<T extends StacValue>(
  value: T,
  baseUrl: string,
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

/**
 * Determine if the URL is absolute
 * @returns true if absolute, false otherwise
 */
function isAbsolute(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Attempt to convert a possibly relative URL to an absolute URL
 *
 * If the URL is already absolute, it is returned unchanged.
 *
 * **WARNING**: if the URL is http it will be returned as URL encoded
 *
 * @param href
 * @param baseUrl
 * @returns absolute URL
 */
export function toAbsoluteUrl(href: string, baseUrl: URL): string {
  if (isAbsolute(href)) return href;

  const targetUrl = new URL(href, baseUrl);

  if (targetUrl.protocol === "http:" || targetUrl.protocol === "https:") {
    return targetUrl.toString();
  }

  // S3 links should not be encoded
  if (targetUrl.protocol === "s3:") return decodeURI(targetUrl.toString());

  return targetUrl.toString();
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
