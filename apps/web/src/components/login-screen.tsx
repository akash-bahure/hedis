import { useState } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Mail,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Check,
  Activity,
  FileText,
  BarChart3,
  Users,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { usePostApiAuthLogin } from "@/api";
import { Link } from "@tanstack/react-router";

interface LoginScreenProps {
  onLogin: (roleId: RoleId) => void;
}

type RoleId = "program-manager" | "abstractor" | "qa-analyst";

const ROLES = [
  {
    id: "program-manager" as RoleId,
    label: "Operations / Program Manager",
    shortLabel: "PM",
    dotColor: "#2563eb",
    badgeClasses: "bg-blue-50 text-blue-700 border-blue-200",
    description: "Full access to operations, QA, reports and management tools",
  },
  {
    id: "abstractor" as RoleId,
    label: "Chart Abstractor",
    shortLabel: "ABS",
    dotColor: "#0891b2",
    badgeClasses: "bg-cyan-50 text-cyan-700 border-cyan-200",
    description: "Handles chart abstraction and coding workflows",
  },
  {
    id: "qa-analyst" as RoleId,
    label: "Quality Analyst",
    shortLabel: "QA",
    dotColor: "#7c3aed",
    badgeClasses: "bg-violet-50 text-violet-700 border-violet-200",
    description: "Performs QA review and validation",
  },
];

const ROLE_ICON_COLORS: Record<RoleId, string> = {
  "program-manager": "text-blue-600",
  abstractor: "text-cyan-600",
  "qa-analyst": "text-violet-600",
};

const FEATURES = [
  {
    icon: FileText,
    label: "HEDIS Chart Abstraction",
    desc: "ICD-10, HCC mapping & TAMPER validation workflows",
  },
  {
    icon: ShieldCheck,
    label: "Multi-Level Audit Engine",
    desc: "L1 → L3 audit chains with escalation & rework queues",
  },
  {
    icon: BarChart3,
    label: "Real-Time Analytics",
    desc: "Productivity metrics, accuracy trends & compliance reporting",
  },
  {
    icon: Users,
    label: "Role-Based Access Control",
    desc: "Granular permissions for coders, auditors & managers",
  },
];

const DEMO_USERS = [
  {
    name: "Sarah Johnson ,RHIA",
    email: "s.johnson@hedisplatform.com",
    roleId: "program-manager" as RoleId,
  },
  {
    name: "Rahul Verma (Abstractor)",
    email: "abstractor@hedis.com",
    roleId: "abstractor" as RoleId,
  },
  {
    name: "Neha Gupta (QA Analyst)",
    email: "qa@hedis.com",
    roleId: "qa-analyst" as RoleId,
  },
];

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleId>("program-manager");
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showDemoUsers, setShowDemoUsers] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const currentRole = ROLES.find((r) => r.id === selectedRole)!;

  // const handleDemoSelect = (user: (typeof DEMO_USERS)[0]) => {
  //   setEmail(user.email);
  //   setPassword("Demo@12345");
  //   setSelectedRole(user.roleId);
  //   setShowDemoUsers(false);
  //   setError("");
  // };

  // const handleSubmit = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError("");

  //   if (!email.trim()) {
  //     setError("Please enter your email address.");
  //     return;
  //   }
  //   if (!password.trim()) {
  //     setError("Please enter your password.");
  //     return;
  //   }

  //   setIsLoading(true);
  //   // Simulate auth delay
  //   setTimeout(() => {
  //     setIsLoading(false);
  //     onLogin(selectedRole);
  //   }, 1200);
  // };

  const { mutate: loginUser, isPending } = usePostApiAuthLogin({
    mutation: {
      onSuccess: (response: any) => {
        console.log("Login Success:", response);

        const userData = {
          ...response.user,
          accessToken: response.token,
        };

        localStorage.setItem("userDetail", JSON.stringify(userData));

        localStorage.setItem("role", selectedRole);

        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }

        toast.success(response?.message || "Login successful. Redirecting...");

        setTimeout(() => {
          onLogin(selectedRole);
        }, 1000);
      },

      onError: (error: any) => {
        console.error("Login Error:", error);

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Invalid email or password.";

        toast.error(message);
      },
    },
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email address is required.");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required.");
      return;
    }

    if (!validatePassword(password)) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    loginUser({
      data: {
        email: email.trim().toLowerCase(),
        password: password.trim(),
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
        {/* Background texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative circles */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #A2D1E1 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute -top-20 -right-20 w-[400px] h-[400px] rounded-full opacity-8"
          style={{
            background: "radial-gradient(circle, #0891b2 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, #A2D1E1 0%, transparent 60%)",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-12 py-10">
          {/* Logo */}
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

          {/* Hero Text */}
          <div className="mt-16 mb-10">
            <h1
              className="text-white leading-tight"
              style={{ fontSize: "32px", fontWeight: 600, lineHeight: "1.2" }}
            >
              HEDIS Abstraction
              <br />
              <span style={{ color: "#A2D1E1" }}>Redefined.</span>
            </h1>
            <p
              className="mt-4 text-white/60"
              style={{ fontSize: "13px", lineHeight: "1.6", maxWidth: "360px" }}
            >
              Streamline HEDIS abstraction with AI-assisted ICD-10 coding, HCC
              mapping, and multi-level audit workflows — all in one secure
              platform.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-5 flex-1">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-start gap-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(162, 209, 225, 0.12)",
                    border: "1px solid rgba(162, 209, 225, 0.2)",
                  }}
                >
                  <Icon className="w-4 h-4" style={{ color: "#A2D1E1" }} />
                </div>
                <div>
                  <div
                    className="text-white font-medium"
                    style={{ fontSize: "13px" }}
                  >
                    {label}
                  </div>
                  <div
                    className="text-white/50 mt-0.5"
                    style={{ fontSize: "11px", lineHeight: "1.5" }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance Badges */}
          <div
            className="mt-10 pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <p
              className="uppercase tracking-widest text-white/40 mb-4"
              style={{ fontSize: "9px", letterSpacing: "0.18em" }}
            >
              Security & Compliance
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                "HIPAA COMPLIANT",
                "SOC 2 TYPE II",
                "HITRUST",
                "AES-256 ENCRYPTED",
              ].map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded"
                  style={{
                    background: "rgba(162, 209, 225, 0.08)",
                    border: "1px solid rgba(162, 209, 225, 0.2)",
                    color: "#A2D1E1",
                    fontSize: "9px",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  <Check className="w-2.5 h-2.5" />
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #A2D1E1 0%, #0891b2 100%)",
            }}
          >
            <Activity className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <div
              className="font-bold tracking-wide text-foreground"
              style={{ fontSize: "14px" }}
            >
              HEDIS ABSTRACTOR
            </div>
            <div
              className="tracking-widest uppercase text-muted-foreground"
              style={{ fontSize: "9px", letterSpacing: "0.18em" }}
            >
              Enterprise Platform
            </div>
          </div>
        </div>

        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-foreground"
              style={{ fontSize: "22px", fontWeight: 600 }}
            >
              Sign in to your account
            </h2>
            <p
              className="text-muted-foreground mt-1.5"
              style={{ fontSize: "13px" }}
            >
              Enter your credentials to access the platform.
            </p>
          </div>

          {/* Demo User Quick-Select */}
          {/* <div className="mb-6">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowDemoUsers(!showDemoUsers)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-dashed transition-colors"
                style={{
                  borderColor: "#A2D1E1",
                  background: "rgba(162, 209, 225, 0.06)",
                }}
              >
                <div className="flex items-center gap-2">
                  <KeyRound
                    className="w-3.5 h-3.5"
                    style={{ color: "#0891b2" }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      color: "#0891b2",
                      fontWeight: 600,
                      letterSpacing: "0.02em",
                    }}
                  >
                    QUICK DEMO ACCESS — SELECT A ROLE
                  </span>
                </div>
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform"
                  style={{
                    color: "#0891b2",
                    transform: showDemoUsers
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                />
              </button>

              {showDemoUsers && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowDemoUsers(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                    {DEMO_USERS.map((user) => {
                      const role = ROLES.find((r) => r.id === user.roleId)!;
                      return (
                        <button
                          key={user.email}
                          type="button"
                          onClick={() => handleDemoSelect(user)}
                          className="w-full text-left px-4 py-3 hover:bg-accent/60 transition-colors flex items-center gap-3 border-b border-border/50 last:border-0"
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-white"
                            style={{
                              background: "#0891b2",
                              fontSize: "10px",
                              fontWeight: 700,
                            }}
                          >
                            {user.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className="text-foreground font-medium"
                                style={{ fontSize: "12px" }}
                              >
                                {user.name}
                              </span>
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${role.badgeClasses}`}
                                style={{ fontSize: "10px", fontWeight: 700 }}
                              >
                                {role.shortLabel}
                              </span>
                            </div>
                            <div
                              className="text-muted-foreground truncate mt-0.5"
                              style={{ fontSize: "11px" }}
                            >
                              {user.email}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div> */}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="Enter Email Address"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/60 transition-colors"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-muted-foreground uppercase tracking-widest"
                  style={{ fontSize: "10px", letterSpacing: "0.12em" }}
                >
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-primary hover:underline transition-colors"
                  style={{ fontSize: "11px" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
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

            {/* Role Selector */}
            <div>
              <label
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{ fontSize: "10px", letterSpacing: "0.12em" }}
              >
                Sign in as Role
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-input-background border border-border rounded-lg hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: currentRole.dotColor }}
                    />
                    <span
                      className="text-foreground"
                      style={{ fontSize: "13px" }}
                    >
                      {currentRole.label}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border ${currentRole.badgeClasses}`}
                      style={{ fontSize: "10px", fontWeight: 700 }}
                    >
                      {currentRole.shortLabel}
                    </span>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 text-muted-foreground transition-transform flex-shrink-0"
                    style={{
                      transform: showRoleDropdown
                        ? "rotate(180deg)"
                        : "rotate(0deg)",
                    }}
                  />
                </button>

                {showRoleDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowRoleDropdown(false)}
                    />
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden">
                      <div
                        className="px-3.5 py-2 border-b border-border"
                        style={{ background: "rgba(162, 209, 225, 0.06)" }}
                      >
                        <p
                          className="text-muted-foreground uppercase tracking-widest"
                          style={{ fontSize: "9px", letterSpacing: "0.15em" }}
                        >
                          Select your access role
                        </p>
                      </div>
                      {ROLES.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role.id);
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-accent transition-colors flex items-start gap-3 border-b border-border/50 last:border-0 ${
                            role.id === selectedRole ? "bg-accent/50" : ""
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                            style={{ backgroundColor: role.dotColor }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span
                                className="text-foreground font-medium"
                                style={{ fontSize: "12px" }}
                              >
                                {role.label}
                              </span>
                              {role.id === selectedRole && (
                                <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                              )}
                            </div>
                            <p
                              className="text-muted-foreground mt-0.5"
                              style={{ fontSize: "11px", lineHeight: "1.4" }}
                            >
                              {role.description}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors ${
                  rememberMe
                    ? "bg-primary border-primary"
                    : "border-border bg-input-background"
                }`}
              >
                {rememberMe && <Check className="w-3 h-3 text-white" />}
              </button>
              <span
                className="text-muted-foreground"
                style={{ fontSize: "12px" }}
              >
                Keep me signed in for 8 hours
              </span>
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
              {isLoading ? (
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
                  Authenticating…
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span
              className="text-muted-foreground uppercase"
              style={{ fontSize: "10px", letterSpacing: "0.1em" }}
            >
              or
            </span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* SSO */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google Workspace SSO
          </button>

          {/* Security Notice */}
          <div
            className="flex items-start gap-2.5 mt-6 px-3.5 py-3 rounded-lg"
            style={{
              background: "rgba(8, 145, 178, 0.05)",
              border: "1px solid rgba(8, 145, 178, 0.15)",
            }}
          >
            <ShieldCheck
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: "#0891b2" }}
            />
            <p
              className="text-muted-foreground"
              style={{ fontSize: "11px", lineHeight: "1.5" }}
            >
              This system contains protected health information (PHI). Access is
              monitored and restricted to authorized personnel only.
              Unauthorized access is a violation of HIPAA and may result in
              legal action.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-6">
            <p className="text-muted-foreground" style={{ fontSize: "10px" }}>
              © 2026 HEDIS Abstractor Platform
            </p>
            <div className="flex items-center gap-3">
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: "10px" }}
              >
                Privacy
              </button>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: "10px" }}
              >
                Terms
              </button>
              <button
                className="text-muted-foreground hover:text-foreground transition-colors"
                style={{ fontSize: "10px" }}
              >
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
