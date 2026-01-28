export interface PlanetaryComputerToken {
  "msft:expiry": string;
  token: string;
}

export interface AzureBlobStorageContainer {
  storageAccount: string;
  container: string;
}

export interface PlanetaryComputerTokens {
  [storageAccount: string]: { [container: string]: PlanetaryComputerToken };
}
