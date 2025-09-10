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
  }).then((response) => {
    if (response.ok) {
      return response
        .json()
        .then((json) => maybeAddSelfLink(json, href.toString()))
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

// eslint-disable-next-line
function maybeAddSelfLink(value: any, href: string) {
  if (!(value as StacValue)?.links?.find((link) => link.rel == "self")) {
    const link = { href, rel: "self" };
    if (Array.isArray(value.links)) {
      value.links.push(link);
    } else {
      value.links = [link];
    }
  }
  return value;
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
