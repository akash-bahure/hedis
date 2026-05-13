import { createFileRoute } from "@tanstack/react-router";
import { ResetPasswordScreen } from "@/components/reset-password-screen";
import { z } from "zod";

const resetPasswordSearchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  component: ResetPasswordComponent,
});

function ResetPasswordComponent() {
  const { token } = Route.useSearch();

  return <ResetPasswordScreen token={token} />;
}
