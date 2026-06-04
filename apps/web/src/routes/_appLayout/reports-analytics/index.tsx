import { ReportsAnalytics } from "@/components/reports-analytics";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/reports-analytics/")({
  component: RouteComponent,
});

function RouteComponent() {

  return (
    <div>
      <ReportsAnalytics />
    </div>
  );
}
