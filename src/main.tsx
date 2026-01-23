import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MapProvider } from "react-map-gl/maplibre";
import App from "./app.tsx";
import { Provider } from "./components/ui/provider.tsx";
import { queryClient } from "./query-client.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <MapProvider>
          <App />
        </MapProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
