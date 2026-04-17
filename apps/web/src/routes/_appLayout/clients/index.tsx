import { Clients } from "@/components/clients";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/clients/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Clients />
    </div>
  );
}
