import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapProvider } from "react-map-gl/maplibre";
import { AuthProvider } from "react-oidc-context";
import App from "./app.tsx";
import { authConfig, LoginSplash } from "./components/ui/auth.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { queryClient } from "./query-client.ts";

const inner = (
  <QueryClientProvider client={queryClient}>
    <MapProvider>
      <App />
    </MapProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      {authConfig ? (
        <AuthProvider {...authConfig}>
          <LoginSplash>{inner}</LoginSplash>
        </AuthProvider>
      ) : (
        inner
      )}
    </Provider>
  </StrictMode>
);
