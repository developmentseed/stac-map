import type {
  AzureBlobStorageContainer,
  PlanetaryComputerToken,
  PlanetaryComputerTokens,
} from "@/types/planetary-computer";

export function parsePlanetaryComputerContainer(
  href: string
): AzureBlobStorageContainer | null {
  try {
    const url = new URL(href);
    if (
      url.host.endsWith("blob.core.windows.net") &&
      !url.host.startsWith("ai4edatasetspublicassets")
    )
      return {
        storageAccount: url.hostname.split(".")[0],
        container: url.pathname.split("/")[1],
      };
    else return null;
  } catch {
    return null;
  }
}

export async function fetchPlanetaryComputerToken({
  storageAccount,
  container,
}: AzureBlobStorageContainer) {
  return await fetch(
    `https://planetarycomputer.microsoft.com/api/sas/v1/token/${storageAccount}/${container}`
  ).then(async (response) => {
    if (response.ok) return response.json() as Promise<PlanetaryComputerToken>;
    else
      throw new Error(
        "Could not fetch token for storage_account={storageAccount}, container={container}: " +
          (await response.text())
      );
  });
}

export function signPlanetaryComputerHref(
  href: string,
  token: PlanetaryComputerToken
) {
  const url = new URL(href);
  url.search = token.token;
  return url.toString();
}

export function signPlanetaryComputerHrefFromTokens(
  href: string,
  tokens: PlanetaryComputerTokens
) {
  const container = parsePlanetaryComputerContainer(href);
  const token =
    container && tokens[container.storageAccount]?.[container.container];
  return token && signPlanetaryComputerHref(href, token);
}
