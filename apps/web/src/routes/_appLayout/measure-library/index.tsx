import { MeasuresLibrary } from "@/components/measures-library";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_appLayout/measure-library/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <MeasuresLibrary />
    </div>
  );
}
