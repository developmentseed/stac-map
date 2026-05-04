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
