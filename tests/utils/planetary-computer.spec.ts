import { describe, expect, test } from "vitest";
import type { PlanetaryComputerToken } from "../../src/types/planetary-computer";
import {
  parsePlanetaryComputerContainer,
  signPlanetaryComputerHref,
  signPlanetaryComputerHrefFromTokens,
} from "../../src/utils/planetary-computer";

describe("parsePlanetaryComputerContainer", () => {
  test("parses valid Azure blob storage URL", () => {
    const result = parsePlanetaryComputerContainer(
      "https://myaccount.blob.core.windows.net/mycontainer/path/to/file.tiff"
    );
    expect(result).toEqual({
      storageAccount: "myaccount",
      container: "mycontainer",
    });
  });

  test("parses public storage to null", () => {
    const result = parsePlanetaryComputerContainer(
      "https://ai4edatasetspublicassets.blob.core.windows.net/assets/path/to/file.tiff"
    );
    expect(result).toBeNull();
  });

  test("returns null for non-Azure URL", () => {
    expect(
      parsePlanetaryComputerContainer("https://example.com/file.tiff")
    ).toBeNull();
  });

  test("returns null for invalid URL", () => {
    expect(parsePlanetaryComputerContainer("not-a-url")).toBeNull();
  });

  test("handles URL with no path", () => {
    const result = parsePlanetaryComputerContainer(
      "https://myaccount.blob.core.windows.net/"
    );
    expect(result).toEqual({
      storageAccount: "myaccount",
      container: "",
    });
  });
});

describe("signPlanetaryComputerHref", () => {
  test("adds token to URL query string", () => {
    const token: PlanetaryComputerToken = {
      token: "sv=2019-12-12&st=2021-01-01&se=2021-01-02&sr=c&sp=rl&sig=abc123",
      "msft:expiry": "2026-02-05T12:00:00Z",
    };
    const result = signPlanetaryComputerHref(
      "https://myaccount.blob.core.windows.net/container/file.tiff",
      token
    );
    expect(result).toBe(
      "https://myaccount.blob.core.windows.net/container/file.tiff?sv=2019-12-12&st=2021-01-01&se=2021-01-02&sr=c&sp=rl&sig=abc123"
    );
  });

  test("replaces existing query string", () => {
    const token: PlanetaryComputerToken = {
      token: "newsig=xyz",
      "msft:expiry": "2026-02-05T12:00:00Z",
    };
    const result = signPlanetaryComputerHref(
      "https://myaccount.blob.core.windows.net/container/file.tiff?oldsig=abc",
      token
    );
    expect(result).toBe(
      "https://myaccount.blob.core.windows.net/container/file.tiff?newsig=xyz"
    );
  });
});

describe("signPlanetaryComputerHrefFromTokens", () => {
  test("signs href using matching token from tokens map", () => {
    const tokens = {
      myaccount: {
        mycontainer: {
          token: "sig=abc123",
          "msft:expiry": "2026-02-05T12:00:00Z",
        },
      },
    };
    const result = signPlanetaryComputerHrefFromTokens(
      "https://myaccount.blob.core.windows.net/mycontainer/file.tiff",
      tokens
    );
    expect(result).toBe(
      "https://myaccount.blob.core.windows.net/mycontainer/file.tiff?sig=abc123"
    );
  });

  test("returns falsy for non-Azure URL", () => {
    const tokens = {};
    const result = signPlanetaryComputerHrefFromTokens(
      "https://example.com/file.tiff",
      tokens
    );
    expect(result).toBeFalsy();
  });

  test("returns undefined when no matching token exists", () => {
    const tokens = {
      otheraccount: {
        othercontainer: {
          token: "sig=abc123",
          "msft:expiry": "2026-02-05T12:00:00Z",
        },
      },
    };
    const result = signPlanetaryComputerHrefFromTokens(
      "https://myaccount.blob.core.windows.net/mycontainer/file.tiff",
      tokens
    );
    expect(result).toBeUndefined();
  });
});
