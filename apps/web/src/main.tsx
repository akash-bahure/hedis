import { createRoot } from "react-dom/client";
import App from "./App";
import "@/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// createRoot(document.getElementById("root")!).render(<App />);

import { StrictMode } from "react";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { Toaster } from "sonner";
// import NotFoundPage from "./components/not-found.tsx";

// Create a new router instance
const router = createRouter({
  routeTree,
  // defaultNotFoundComponent: NotFoundPage,
});

const queryClient = new QueryClient();

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          richColors
          position="top-right"
          duration={4000}
          closeButton={true}
        />
      </QueryClientProvider>
    </StrictMode>,
  );
}
