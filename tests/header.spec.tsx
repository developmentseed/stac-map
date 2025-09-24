import { describe, expect, test } from "vitest";
import { Provider } from "../src/components/ui/provider";
import { render } from "vitest-browser-react";
import App from "../src/app";

function renderApp() {
  return render(
    <Provider>
      <App></App>
    </Provider>,
  );
}

describe("initial state", () => {
  test("renders example button", async () => {
    const app = renderApp();
    await expect
      .element(app.getByRole("button", { name: "examples" }))
      .toBeVisible();
  });
});
