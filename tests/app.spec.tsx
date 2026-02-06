import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { userEvent } from "@vitest/browser/context";
import { describe, expect, test } from "vitest";
import { render } from "vitest-browser-react";
import App from "../src/app";
import { Provider } from "../src/components/ui/provider";

const queryClient = new QueryClient();

async function renderApp() {
  return await render(
    <Provider>
      <QueryClientProvider client={queryClient}>
        <App></App>
      </QueryClientProvider>
    </Provider>
  );
}

describe("app", () => {
  test("has a map", async () => {
    const app = await renderApp();
    await expect
      .element(app.getByRole("region", { name: "Map" }))
      .toBeVisible();
  });

  test("has a input text box", async () => {
    const app = await renderApp();
    await expect
      .element(
        app.getByRole("textbox", {
          name: "Enter a url",
        })
      )
      .toBeVisible();
  });

  test("has a color mode button", async () => {
    const app = await renderApp();
    await expect
      .element(app.getByRole("button", { name: "Toggle color mode" }))
      .toBeVisible();
  });

  test("has a TileJSON button for a MAAP collection", {
    timeout: 15000,
  }, async () => {
      const app = await renderApp();
      const input = app.getByRole("textbox", { name: "Enter a url" });
      await input.fill(
        "https://stac.dit.maap-project.org/collections/glad-glclu2020-v2"
      );
      await userEvent.keyboard("{Enter}");
      await expect
        .element(
          app.getByRole("button", {
            name: "TileJSON link for 2020 visualization",
          }),
          { timeout: 10000 }
        )
        .toBeVisible();
  });
});
