export function getCurrentHref(): string {
  return new URLSearchParams(location.search).get("href") || "";
}

export function getInitialHref(): string | null {
  const href = getCurrentHref() || import.meta.env.VITE_DEFAULT_HREF || "";
  try {
    new URL(href);
  } catch {
    return null;
  }
  return href;
}

export function isUrl(href: string) {
  try {
    new URL(href);
  } catch {
    return false;
  }
  return true;
}
