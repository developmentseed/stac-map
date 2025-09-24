import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import App from "../src/app";
import { Provider } from "../src/components/ui/provider";

function renderApp(path?: string) {
  window.history.pushState({}, "", path || "");
  return render(
    <Provider>
      <App></App>
    </Provider>,
  );
}

describe("loading", () => {
  test("stac.eoapi.dev", async () => {
    const app = renderApp("?href=https://stac.eoapi.dev/");
    await expect.element(app.getByText(/eoAPI-stac/i)).toBeVisible();
    await expect.element(app.getByText(/collections/i)).toBeVisible();

    await app.getByRole("heading", { name: "Afghanistan Earthquake" }).click();
    expect(new URL(window.location.href).search).toBe(
      "?href=https://stac.eoapi.dev/collections/MAXAR_afghanistan_earthquake22",
    );
  });

  test("CSDA Planet", async () => {
    // https://github.com/developmentseed/stac-map/issues/96
    const app = renderApp(
      "?href=https://csdap.earthdata.nasa.gov/stac/collections/planet",
    );
    await expect
      .element(app.getByRole("heading", { name: "Planet" }))
      .toBeVisible();
  });
});
