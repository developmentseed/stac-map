import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import changelog from "../CHANGELOG.md?raw";
import { version } from "../package.json";
import Footer from "./components/footer";
import { StacMap } from "./components/stac-map";
import { buildAuth } from "./utils/auth";

const rootStyle = {
  height: "100dvh",
  width: "100dvw",
} as const;

const auth = buildAuth({
  authority: import.meta.env.VITE_AUTH_AUTHORITY as string | undefined,
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID as string | undefined,
  basePath: import.meta.env.BASE_URL,
});

const defaultHref = import.meta.env.VITE_DEFAULT_HREF as string | undefined;
const stacBrowserUrl = import.meta.env.VITE_STAC_BROWSER_URL as
  | string
  | undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div style={rootStyle}>
      <StacMap
        defaultHref={defaultHref}
        auth={auth}
        stacBrowserUrl={stacBrowserUrl}
        footer={<Footer version={version} changelog={changelog} />}
      />
    </div>
  </StrictMode>
);
