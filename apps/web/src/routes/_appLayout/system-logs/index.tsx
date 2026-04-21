import { SystemRecalculation } from "@/components/system-recalculation";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/system-logs/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SystemRecalculation />
    </div>
  );
}
