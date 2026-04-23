import App from "@/App";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const isAuth = localStorage.getItem("auth");

    if (isAuth) {
      throw redirect({ to: "/dashboard" });
    } else {
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
