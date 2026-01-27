export interface Token {
  "msft:expiry": string;
  token: string;
}

export interface Container {
  storageAccount: string;
  container: string;
}

export interface Tokens {
  [storageAccount: string]: { [container: string]: Token };
}
