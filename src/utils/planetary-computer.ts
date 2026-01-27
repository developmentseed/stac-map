import type { Container, Token, Tokens } from "@/types/planetary-computer";

export function parsePlanetaryComputerContainer(href: string) {
  try {
    const url = new URL(href);
    if (url.host.endsWith("blob.core.windows.net"))
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
}: Container) {
  return await fetch(
    `https://planetarycomputer.microsoft.com/api/sas/v1/token/${storageAccount}/${container}`
  ).then(async (response) => {
    if (response.ok) return response.json() as Promise<Token>;
    else
      throw new Error(
        "Could not fetch token for storage_account={storageAccount}, container={container}: " +
          (await response.text())
      );
  });
}

export function signPlanetaryComputerHref(
  href: string,
  container: Container,
  tokens: Tokens
) {
  const token = tokens[container.storageAccount]?.[container.container];
  if (!token) return null;
  const url = new URL(href);
  url.search = token.token;
  return url.toString();
}
