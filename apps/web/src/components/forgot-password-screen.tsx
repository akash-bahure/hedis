import { useState } from "react";
import {
  Mail,
  Activity,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import { usePostApiAuthForgotPassword } from "@/api";
import { Link } from "@tanstack/react-router";

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const { mutate: forgotPasswordApi, isPending } = usePostApiAuthForgotPassword({
    mutation: {
      onSuccess: (response: any) => {
        toast.success(response?.message || "Reset link sent to your email.");
        setIsSubmitted(true);
      },
      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Failed to send reset link. Please check your email address.";
        toast.error(message);
        setError(message);
      },
    },
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    forgotPasswordApi({
      data: {
        email: email.trim().toLowerCase(),
      },
    });
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="w-full max-w-[420px] text-center">
          <div
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2
            className="text-foreground mb-3"
            style={{ fontSize: "24px", fontWeight: 600 }}
          >
            Check your email
          </h2>
          <p
            className="text-muted-foreground mb-8 text-sm leading-relaxed"
          >
            We've sent a password reset link to <span className="text-foreground font-medium">{email}</span>. Please check your inbox and click the link to reset your password.
          </p>
          <Link
            to="/auth/login"
            className="flex items-center justify-center gap-2 text-primary font-medium hover:underline text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
              Forgot Your
              <br />
              <span style={{ color: "#A2D1E1" }}>Password?</span>
            </h1>
            <p
              className="mt-4 text-white/60"
              style={{ fontSize: "13px", lineHeight: "1.6", maxWidth: "360px" }}
            >
              Don't worry, it happens. Enter your email address and we'll send you a link to reset it.
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
              Forgot password
            </h2>
            <p
              className="text-muted-foreground mt-1.5"
              style={{ fontSize: "13px" }}
            >
              Enter the email address associated with your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{ fontSize: "10px", letterSpacing: "0.12em" }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 transition-colors"
                  style={{ fontSize: "13px" }}
                />
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
              className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg text-white font-semibold transition-all active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
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
                  Sending…
                </>
              ) : (
                <>
                  Send Reset Link
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
