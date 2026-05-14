import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RegisterScreen } from "@/components/register-screen";

export const Route = createFileRoute("/auth/_layout/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  return (
    <RegisterScreen
      onRegister={() => {
        navigate({ to: "/auth/login" });
      }}
    />
  );
}
