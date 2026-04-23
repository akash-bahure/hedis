import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
// import { axiosInstance } from "../../../utils/client";
import { LoginScreen } from "@/components/login-screen";

export const Route = createFileRoute("/auth/_layout/login")({
  //   beforeLoad: async () => {
  //     try {
  //       await axiosInstance.get("/api/organizations/ms-login-detail");
  //     } catch (error: any) {
  //       if (error?.response?.data?.detail === "Organization does not exists") {
  //         throw redirect({
  //           to: "/not-found",
  //         });
  //       }
  //     }
  //   },
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleLogin = (roleId: string) => {
    localStorage.setItem("auth", "true");
    localStorage.setItem("role", roleId);
    navigate({ to: "/dashboard" }); // or your dashboard route
  };

  return <LoginScreen onLogin={handleLogin} />;
}
