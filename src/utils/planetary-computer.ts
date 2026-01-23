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
