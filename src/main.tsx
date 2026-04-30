import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import changelog from "../CHANGELOG.md?raw";
import { version } from "../package.json";
import Footer from "./components/footer";
import { StacMap, type StacMapProps } from "./components/stac-map";

const authority = import.meta.env.VITE_AUTH_AUTHORITY as string | undefined;
const clientId = import.meta.env.VITE_AUTH_CLIENT_ID as string | undefined;

const auth: StacMapProps["auth"] | undefined =
  authority && clientId
    ? {
        authority,
        client_id: clientId,
        redirect_uri:
          window.location.origin +
          (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "") +
          "/",
        onSigninCallback: () => {
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname + window.location.search
          );
        },
      }
    : undefined;

const defaultHref = import.meta.env.VITE_DEFAULT_HREF as string | undefined;
const stacBrowserUrl = import.meta.env.VITE_STAC_BROWSER_URL as
  | string
  | undefined;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StacMap
      defaultHref={defaultHref}
      auth={auth}
      stacBrowserUrl={stacBrowserUrl}
      footer={<Footer version={version} changelog={changelog} />}
    />
  </StrictMode>
);
