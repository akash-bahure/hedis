import { AuditSampling } from "@/components/audit-sampling";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/audit-sampling/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <AuditSampling />
    </div>
  );
}
