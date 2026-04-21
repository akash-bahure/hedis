import { Admin } from "@/components/admin";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/admin/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Admin />
    </div>
  );
}
