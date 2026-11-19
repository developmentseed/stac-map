export function resolveInitialHref(defaultHref?: string): string | null {
  const href =
    new URLSearchParams(location.search).get("href") || defaultHref || "";
  try {
    new URL(href);
  } catch {
    return null;
  }
  return href;
}

/**
 * Reads an item id from a URL fragment, or `null` if there is none.
 */
export function idFromFragment(hash: string = location.hash): string | null {
  const fragment = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!fragment) return null;
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

/**
 * Builds a URL fragment (including the leading `#`) for an item id, or an
 * empty string if there is no id.
 */
export function idToFragment(id: string | null): string {
  return id ? "#" + encodeURIComponent(id) : "";
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
