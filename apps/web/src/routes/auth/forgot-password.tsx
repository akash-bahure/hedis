import { createFileRoute } from "@tanstack/react-router";
import { ForgotPasswordScreen } from "@/components/forgot-password-screen";

export const Route = createFileRoute("/auth/forgot-password")({
  component: ForgotPasswordScreen,
});
