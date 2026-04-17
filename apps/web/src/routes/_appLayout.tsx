import { createFileRoute, redirect } from "@tanstack/react-router";
import App from "../App";
import React from "react";

export const Route = createFileRoute("/_appLayout")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <App />
    </div>
  );
}
