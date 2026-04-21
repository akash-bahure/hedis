import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => (
    <div className="h-screen flex items-center justify-center">
      <h1 className="text-xl font-semibold">Page Not Found</h1>
    </div>
  ),
});

function RootComponent() {
  return (
    <React.Fragment>
      <Outlet />
    </React.Fragment>
  );
}
