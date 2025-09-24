import { describe, test } from "vitest";
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

describe("navigation", () => {
  test("static catalog", async () => {
    const app = renderApp();
    await app.getByRole("button", { name: "Examples" }).click();
    await app.getByRole("menuitem", { name: "Maxar Open Data static" }).click();
    await app.getByText("Bay of Bengal Cyclone Mocha").click();
    await app.getByText("10300100E6747500", { exact: true }).click();
    // TODO test map clicking, oof
  });
});
