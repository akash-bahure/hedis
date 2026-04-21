import { WorkQueue } from "@/components/work-queue";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/work-queue/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div>
      <WorkQueue
        role="abstractor"
        onStartAbstraction={() => navigate({ to: "/start-coding" })}
        onOpenPatient360={() => navigate({ to: "/patient-360" })}
        onOpenQAReview={() => navigate({ to: "/qa-review" })}
      />
    </div>
  );
}
