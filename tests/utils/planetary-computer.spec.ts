import { describe, expect, it } from "vitest";
import {
  parsePlanetaryComputerContainer,
  signPlanetaryComputerHref,
} from "../../src/utils/planetary-computer";

describe("parsePlanetaryComputerContainer", () => {
  it("extracts the storage account and container from a blob href", () => {
    expect(
      parsePlanetaryComputerContainer(
        "https://sentinel2l2a01.blob.core.windows.net/sentinel2-l2/12/T/UN/file.tif"
      )
    ).toEqual({
      storageAccount: "sentinel2l2a01",
      container: "sentinel2-l2",
    });
  });

  it("returns null for the public assets host", () => {
    expect(
      parsePlanetaryComputerContainer(
        "https://ai4edatasetspublicassets.blob.core.windows.net/foo/bar.png"
      )
    ).toBeNull();
  });

  it("returns null for non-blob hosts", () => {
    expect(
      parsePlanetaryComputerContainer("https://example.com/foo/bar.json")
    ).toBeNull();
  });

  it("returns null for invalid URLs", () => {
    expect(parsePlanetaryComputerContainer("not a url")).toBeNull();
  });
});

describe("signPlanetaryComputerHref", () => {
  it("replaces the query string with the SAS token", () => {
    const signed = signPlanetaryComputerHref(
      "https://account.blob.core.windows.net/container/key.tif?old=1",
      { token: "sig=abc&se=2025", "msft:expiry": "2025-01-01T00:00:00Z" }
    );
    expect(signed).toBe(
      "https://account.blob.core.windows.net/container/key.tif?sig=abc&se=2025"
    );
  });

  it("appends the token to a URL with no existing query", () => {
    const signed = signPlanetaryComputerHref(
      "https://account.blob.core.windows.net/container/key.tif",
      { token: "sig=xyz", "msft:expiry": "2025-01-01T00:00:00Z" }
    );
    expect(signed).toBe(
      "https://account.blob.core.windows.net/container/key.tif?sig=xyz"
    );
  });
});
