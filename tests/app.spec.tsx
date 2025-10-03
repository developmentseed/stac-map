import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import App from "../src/app";
import { Provider } from "../src/components/ui/provider";
import { EXAMPLES } from "../src/constants";

const queryClient = new QueryClient();

function renderApp() {
  return render(
    <Provider>
      <QueryClientProvider client={queryClient}>
        <App></App>
      </QueryClientProvider>
    </Provider>
  );
}

describe("app", () => {
  test("has a map", async () => {
    const app = renderApp();
    await expect
      .element(app.getByRole("region", { name: "Map" }))
      .toBeVisible();
  });

  test("has a input text box", async () => {
    const app = renderApp();
    await expect
      .element(
        app.getByRole("textbox", {
          name: "Enter a url to STAC JSON or GeoParquet",
        })
      )
      .toBeVisible();
  });

  test("has an upload button", async () => {
    const app = renderApp();
    await expect
      .element(app.getByRole("button", { name: "upload" }))
      .toBeVisible();
  });

  test("has a color mode button", async () => {
    const app = renderApp();
    await expect
      .element(app.getByRole("button", { name: "Toggle color mode" }))
      .toBeVisible();
  });

  describe.for(EXAMPLES)("example $title", ({ title }) => {
    test("updates title", async ({ expect }) => {
      const app = renderApp();
      await app.getByRole("button", { name: "Examples" }).click();
      await app.getByRole("menuitem", { name: title }).click();
      expect(document.title !== "stac-map");
    });
  });

  test("CSDA Planet", async () => {
    // https://github.com/developmentseed/stac-map/issues/96
    window.history.pushState(
      {},
      "",
      "?href=https://csdap.earthdata.nasa.gov/stac/collections/planet"
    );
    const app = renderApp();
    await expect
      .element(app.getByRole("heading", { name: "Planet" }))
      .toBeVisible();
  });

  test("renders download buttons", async () => {
    window.history.pushState(
      {},
      "",
      "?href=https://stac.eoapi.dev/collections/MAXAR_yellowstone_flooding22"
    );
    const app = renderApp();
    await app.getByRole("button", { name: "Item search" }).click();
    await app.getByRole("button", { name: "Search", exact: true }).click();
    await expect
      .element(app.getByRole("button", { name: "JSON" }))
      .toBeVisible();
    await expect
      .element(app.getByRole("button", { name: "stac-geoparquet" }))
      .toBeVisible();
  });

  test("paginates collections", async () => {
    window.history.pushState({}, "", "?href=https://stac.eoapi.dev");
    const app = renderApp();
    await expect
      .element(app.getByRole("button", { name: "Fetch more collections" }))
      .toBeVisible();
    await expect
      .element(app.getByRole("button", { name: "Fetch all collections" }))
      .toBeVisible();
    await app.getByRole("button", { name: "Fetch more collections" }).click();
  });
});
