import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import App from "../src/app";
import { Provider } from "../src/components/ui/provider";

async function renderApp() {
  return await render(
    <Provider>
      <App></App>
    </Provider>,
  );
}

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

test("renders example button", async () => {
  const app = await renderApp();
  await expect
    .element(app.getByRole("button", { name: "examples" }))
    .toBeVisible();
});

test("loads stac.eoapi.dev", async () => {
  window.history.pushState({}, "", "?href=https://stac.eoapi.dev/");
  const app = await renderApp();
  await expect.element(app.getByText(/eoAPI-stac/i)).toBeVisible();
  await expect.element(app.getByText(/collections/i)).toBeVisible();
});

test("loads CSDA Planet", async () => {
  // https://github.com/developmentseed/stac-map/issues/96
  window.history.pushState(
    {},
    "",
    "?href=https://csdap.earthdata.nasa.gov/stac/collections/planet",
  );
  const app = await renderApp();
  await expect
    .element(app.getByRole("heading", { hasText: "Planet" }))
    .toBeVisible();
});
