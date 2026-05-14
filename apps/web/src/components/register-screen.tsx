import { useState } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ChevronDown,
  AlertCircle,
  ArrowRight,
  Check,
  Activity,
  FileText,
  BarChart3,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useGetApiUserRoles, usePostApiAuthRegister } from "@/api";

interface RegisterScreenProps {
  onRegister: () => void;
}

const FEATURES = [
  {
    icon: FileText,
    label: "Secure User Onboarding",
    desc: "Create and manage users with enterprise-grade authentication",
  },
  {
    icon: ShieldCheck,
    label: "HIPAA-Compliant Access",
    desc: "Protected workflows with encrypted and role-based access",
  },
  {
    icon: BarChart3,
    label: "Operational Visibility",
    desc: "Track user activity, abstraction progress and QA insights",
  },
  {
    icon: Users,
    label: "Role-Based Permissions",
    desc: "Assign access levels for managers, auditors and abstractors",
  },
];

export function RegisterScreen({ onRegister }: RegisterScreenProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [selectedRole, setSelectedRole] = useState<string>("");

  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");

  const { data: rolesResponse, isLoading: rolesLoading } = useGetApiUserRoles();

  const roles = rolesResponse?.results || [];

  const currentRole = roles.find((role) => String(role.id) === selectedRole);

  const { mutate: registerUser, isPending } = usePostApiAuthRegister({
    mutation: {
      onSuccess: (response) => {
        toast.success(response?.message || "Account created successfully.");

        setTimeout(() => {
          onRegister();
        }, 1000);
      },

      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to create account.";

        setError(message);

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

    setError("");

    if (!fullName.trim()) {
      toast.error("Full name is required.");
      return;
    }

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

    if (!selectedRole) {
      toast.error("Please select a role.");
      return;
    }

    registerUser({
      data: {
        full_name: fullName,
        email,
        password,
        user_role_id: selectedRole,
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT PANEL */}
      <div
        className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{
          background:
            "linear-gradient(145deg, #0a1f3c 0%, #0c3054 40%, #0b4a6e 75%, #0e6a8a 100%)",
        }}
      >
        {/* Background Texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative Circles */}
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

          {/* Hero */}
          <div className="mt-16 mb-10">
            <h1
              className="text-white leading-tight"
              style={{
                fontSize: "32px",
                fontWeight: 600,
                lineHeight: "1.2",
              }}
            >
              Join the Future of
              <br />
              <span style={{ color: "#A2D1E1" }}>HEDIS Operations.</span>
            </h1>

            <p
              className="mt-4 text-white/60"
              style={{
                fontSize: "13px",
                lineHeight: "1.6",
                maxWidth: "360px",
              }}
            >
              Create your secure enterprise account to access abstraction
              workflows, audit reviews, analytics dashboards and role-based
              operational tools.
            </p>
          </div>

          {/* Features */}
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
                    style={{
                      fontSize: "11px",
                      lineHeight: "1.5",
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-foreground"
              style={{
                fontSize: "22px",
                fontWeight: 600,
              }}
            >
              Create your account
            </h2>

            <p
              className="text-muted-foreground mt-1.5"
              style={{ fontSize: "13px" }}
            >
              Register your account to access the HEDIS abstraction platform.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                }}
              >
                Full Name
              </label>

              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                }}
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Email Address"
                  className="w-full pl-10 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                  style={{ fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                }}
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full pl-10 pr-11 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
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

            {/* Role Dropdown */}
            <div>
              <label
                className="block text-muted-foreground uppercase tracking-widest mb-1.5"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.12em",
                }}
              >
                Select Role
              </label>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-input-background border border-border rounded-lg hover:border-primary/40 focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {currentRole && (
                      <>
                        <span
                          className="text-foreground"
                          style={{ fontSize: "13px" }}
                        >
                          {currentRole.name}
                        </span>
                      </>
                    )}

                    {!currentRole && (
                      <span
                        className="text-muted-foreground"
                        style={{ fontSize: "13px" }}
                      >
                        {rolesLoading ? "Loading roles..." : "Select Role"}
                      </span>
                    )}
                  </div>

                  <ChevronDown
                    className="w-4 h-4 text-muted-foreground transition-transform"
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
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          type="button"
                          onClick={() => {
                            setSelectedRole(String(role.id));
                            setShowRoleDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-accent transition-colors flex items-start gap-3 border-b border-border/50 last:border-0 ${
                            String(role.id) === selectedRole
                              ? "bg-accent/50"
                              : ""
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span
                                className="text-foreground font-medium"
                                style={{
                                  fontSize: "12px",
                                }}
                              >
                                {role.name}
                              </span>

                              {String(role.id) === selectedRole && (
                                <Check className="w-3.5 h-3.5 text-primary" />
                              )}
                            </div>

                            <p
                              className="text-muted-foreground mt-0.5"
                              style={{
                                fontSize: "11px",
                                lineHeight: "1.4",
                              }}
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

            {/* Remember */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <button
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
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
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-muted-foreground" style={{ fontSize: "12px" }}>
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="text-primary hover:underline font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>

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
              style={{
                fontSize: "11px",
                lineHeight: "1.5",
              }}
            >
              User registration is secured with enterprise authentication
              standards and monitored access controls to ensure HIPAA compliance
              and data protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
