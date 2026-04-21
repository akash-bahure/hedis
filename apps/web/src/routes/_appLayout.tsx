import { createFileRoute, redirect } from "@tanstack/react-router";
import App from "../App";
import React from "react";

export const Route = createFileRoute("/_appLayout")({
  beforeLoad: () => {
    const isAuth = localStorage.getItem("auth");

    if (!isAuth) {
      throw redirect({ to: "/auth/login" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <App />
    </div>
  );
}
