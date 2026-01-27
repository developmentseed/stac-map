export function parsePlanetaryComputerStorageAccountAndContainer(href: string) {
  try {
    const url = new URL(href);
    if (url.host.endsWith("blob.core.windows.net"))
      return {
        storageAccount: url.hostname.split(".")[0],
        container: url.pathname.split("/")[1],
      };
    else return { storageAccount: null, container: null };
  } catch {
    return { storageAccount: null, container: null };
  }
}
