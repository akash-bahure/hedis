import { useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  Activity,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { usePostApiAuthResetPassword } from "@/api";
import { Link, useNavigate } from "@tanstack/react-router";

interface ResetPasswordScreenProps {
  token: string;
}

export function ResetPasswordScreen({ token }: ResetPasswordScreenProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const { mutate: resetPasswordApi, isPending } = usePostApiAuthResetPassword({
    mutation: {
      onSuccess: (response: any) => {
        toast.success(response?.message || "Password reset successfully. Redirecting to login...");
        setTimeout(() => {
          navigate({ to: "/auth/login" });
        }, 2000);
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to reset password. Token might be invalid or expired.";
        toast.error(message);
        setError(message);
      },
    },
  });

  const validatePassword = (pass: string) => {
    return pass.length >= 8;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password.trim()) {
      toast.error("Password is required.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    resetPasswordApi({
      data: {
        token,
        password: password.trim(),
        confirmPassword: confirmPassword.trim(),
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── LEFT PANEL ─────────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #0a1f3c 0%, #0c3054 40%, #0b4a6e 75%, #0e6a8a 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #A2D1E1 0%, #0891b2 100%)",
              }}
            >
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <div
                className="text-white font-bold tracking-wide"
                style={{ fontSize: "15px" }}
              >
                HEDIS ABSTRACTOR
              </div>
              <div
                className="tracking-widest uppercase"
                style={{
                  color: "#A2D1E1",
                  fontSize: "9px",
                  letterSpacing: "0.2em",
                }}
              >
                Enterprise Platform
              </div>
            </div>
          </div>

          <div className="mt-16 mb-10">
            <h1
              className="text-white leading-tight"
              style={{ fontSize: "32px", fontWeight: 600, lineHeight: "1.2" }}
            >
              Reset Your
              <br />
              <span style={{ color: "#A2D1E1" }}>Password.</span>
            </h1>
            <p
              className="mt-4 text-white/60"
              style={{ fontSize: "13px", lineHeight: "1.6", maxWidth: "360px" }}
            >
              Create a new strong password to regain access to your account.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <Link
            to="/auth/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>

          <div className="mb-8">
            <h2
              className="text-foreground"
              style={{ fontSize: "22px", fontWeight: 600 }}
            >
              Reset password
            </h2>
            <p
              className="text-muted-foreground mt-1.5"
              style={{ fontSize: "13px" }}
            >
              Enter and confirm your new password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{ fontSize: "10px", letterSpacing: "0.12em" }}
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 transition-colors"
                  style={{ fontSize: "13px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{ fontSize: "10px", letterSpacing: "0.12em" }}
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 transition-colors"
                  style={{ fontSize: "13px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-destructive/8 border border-destructive/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                <span className="text-destructive" style={{ fontSize: "12px" }}>
                  {error}
                </span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-white font-semibold transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              style={{
                background: isPending
                  ? "#0891b2"
                  : "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                fontSize: "13px",
                letterSpacing: "0.02em",
                boxShadow: isPending
                  ? "none"
                  : "0 4px 14px rgba(8, 145, 178, 0.35)",
              }}
            >
              {isPending ? (
                <>
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Resetting Password…
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
