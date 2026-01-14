import type { StacValue } from "../types/stac";

export function getStacValueTitle(value: StacValue) {
  if ("title" in value && value.title) {
    return value.title as string;
  }
  if ("id" in value && value.id) {
    return value.id;
  }
  return value.type;
}

export function getSelfHref(value: StacValue) {
  return value.links?.find((link) => link.rel == "self")?.href;
}

export async function fetchStac(href: string | URL): Promise<StacValue> {
  return await fetch(href, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  }).then(async (response) => {
    if (response.ok) {
      return response
        .json()
        .then((json) => makeHrefsAbsolute(json, href.toString()))
        .then((json) => maybeAddTypeField(json));
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
