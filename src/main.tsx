import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./app.tsx";
import { ErrorComponent } from "./components/error.tsx";
import { Provider } from "./components/ui/provider.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary
          FallbackComponent={ErrorComponent}
          onReset={() => history.pushState(null, "", location.pathname)}
        >
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </Provider>
  </StrictMode>
);
