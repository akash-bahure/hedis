import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OtpVerificationScreen } from "@/components/otp-verification-screen";
import { z } from "zod";

const otpSearchSchema = z.object({
  email: z.string().email(),
  role: z.string(),
});

export const Route = createFileRoute("/auth/_layout/otp")({
  validateSearch: (search) => otpSearchSchema.parse(search),
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { email, role } = Route.useSearch();

  const handleVerificationSuccess = (roleId: string) => {
    localStorage.setItem("role", roleId);
    navigate({ to: "/dashboard" });
  };

  return (
    <OtpVerificationScreen
      email={email}
      role={role}
      onSuccess={handleVerificationSuccess}
    />
  );
}
