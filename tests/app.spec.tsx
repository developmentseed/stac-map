import { beforeEach, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import App from "../src/app";
import { Provider } from "../src/components/ui/provider";

function renderApp() {
  return render(
    <Provider>
      <App></App>
    </Provider>,
  );
}

beforeEach(() => {
  window.history.pushState({}, "", "/");
});

test("renders example button", async () => {
  const app = renderApp();
  await expect
    .element(app.getByRole("button", { name: "examples" }))
    .toBeVisible();
});

test("loads stac.eoapi.dev", async () => {
  window.history.pushState({}, "", "?href=https://stac.eoapi.dev/");
  const app = renderApp();
  await expect.element(app.getByText(/eoAPI-stac/i)).toBeVisible();
  await expect.element(app.getByText(/collections/i)).toBeVisible();

  await app.getByRole("heading", { name: "Afghanistan Earthquake" }).click();
  expect(new URL(window.location.href).search).toBe(
    "?href=https://stac.eoapi.dev/collections/MAXAR_afghanistan_earthquake22",
  );
});

test("loads CSDA Planet", async () => {
  // https://github.com/developmentseed/stac-map/issues/96
  window.history.pushState(
    {},
    "",
    "?href=https://csdap.earthdata.nasa.gov/stac/collections/planet",
  );
  const app = renderApp();
  await expect
    .element(app.getByRole("heading", { name: "Planet" }))
    .toBeVisible();
});

test("loads NAIP stac-geoparquet", async () => {
  window.history.pushState(
    {},
    "",
    "?href=https://raw.githubusercontent.com/developmentseed/labs-375-stac-geoparquet-backend/refs/heads/main/data/naip.parquet",
  );
  const app = renderApp();
  await expect.element(app.getByText(/stac-geoparquet/i)).toBeVisible();
});

test("navigates through a static catalog", async () => {
  const app = renderApp();
  await app.getByRole("button", { name: "Examples" }).click();
  await app.getByRole("menuitem", { name: "Maxar Open Data static" }).click();
  await app.getByText("Bay of Bengal Cyclone Mocha").click();
  await app.getByText("10300100E6747500", { exact: true }).click();
  // TODO test map clicking, oof
});
