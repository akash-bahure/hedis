import { createFileRoute } from "@tanstack/react-router";
import { SetPasswordScreen } from "@/components/set-password-screen";
import { z } from "zod";

const setPasswordSearchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/set-password")({
  validateSearch: (search) => setPasswordSearchSchema.parse(search),
  component: SetPasswordComponent,
});

function SetPasswordComponent() {
  const { token } = Route.useSearch();

  return <SetPasswordScreen token={token} />;
}
