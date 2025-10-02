import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import App from "../src/app";
import { EXAMPLES } from "../src/components/examples";
import { Provider } from "../src/components/ui/provider";

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

  describe("examples", () => {
    for (const example of EXAMPLES) {
      test(example.title, async () => {
        const app = renderApp();
        await app.getByRole("button", { name: "Examples" }).click();
        await app.getByRole("menuitem", { name: example.title }).click();
        await expect
          .element(app.getByRole("button", { name: "Properties" }))
          .toBeVisible();
      });
    }
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
});
