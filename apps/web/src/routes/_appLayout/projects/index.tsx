import { Projects } from "@/components/projects";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/projects/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Projects />
    </div>
  );
}
