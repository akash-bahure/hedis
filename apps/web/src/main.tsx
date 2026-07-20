import { createRoot } from "react-dom/client";
import App from "./App";
import "@/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { Toaster } from "sonner";
import { GlobalFiltersProvider } from "./contexts/GlobalFiltersContext";   // ← NEW IMPORT

const router = createRouter({ routeTree });

const queryClient = new QueryClient();

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <GlobalFiltersProvider>                  {/* ← WRAP HERE */}
          <RouterProvider router={router} />
          <Toaster
            richColors
            position="top-right"
            duration={4000}
            closeButton={true}
          />
        </GlobalFiltersProvider>
      </QueryClientProvider>
    </StrictMode>
  );
}