export async function fetchPlanetaryComputerSignedHref(
  href: string
): Promise<string | null> {
  const response = await fetch(
    `https://planetarycomputer.microsoft.com/api/sas/v1/sign?href=${encodeURIComponent(href)}`
  );
  if (!response.ok) {
    console.error(
      `Failed to fetch signed URL for ${href}: ${response.status} ${response.statusText}`
    );
    return null;
  }
  const { href: signedHref } = await response.json();
  return signedHref;
}

export async function maybeSignPlanetaryComputerHref(
  href: string
): Promise<string | null> {
  if (isPlanetaryComputerHref(href)) {
    // Assume it's the planetary computer and try to get a SAS token
    const signedHref = await fetchPlanetaryComputerSignedHref(href);
    if (signedHref) return signedHref;
  }
  return href;
}

export function isPlanetaryComputerHref(href: string): boolean {
  return new URL(href).hostname.endsWith("blob.core.windows.net");
}
