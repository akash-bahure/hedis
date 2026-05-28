import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Mail,
  ArrowRight,
  RefreshCw,
  Activity,
  Check,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import {
  usePostApiAuthTwoFaValidateOtp,
  usePostApiAuthTwoFaSendOtp,
} from "@/api";

interface OtpVerificationScreenProps {
  email: string;
  role: string;
  onSuccess: (roleId: string) => void;
}

export function OtpVerificationScreen({
  email,
  role,
  onSuccess,
}: OtpVerificationScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const { mutate: validateOtp, isPending: isValidating } =
    usePostApiAuthTwoFaValidateOtp({
      mutation: {
        onSuccess: (response: any) => {
          console.log("OTP Validation Success:", response);

          const userData = {
            ...response.user,
            accessToken: response.token,
          };

          // Store user session
          localStorage.setItem("userDetail", JSON.stringify(userData));
          localStorage.setItem("auth", "true");
          localStorage.setItem("role", role);

          toast.success("Identity verified successfully!");

          onSuccess(role);
        },
        onError: (error: any) => {
          console.error("OTP Validation Error:", error);
          toast.error(
            error?.response?.data?.message || "Invalid or expired OTP."
          );
        },
      },
    });

  const { mutate: sendOtp } = usePostApiAuthTwoFaSendOtp({
    mutation: {
      onSuccess: () => {
        toast.success("A new OTP has been sent to your email.");
        setTimer(60);
        setIsResending(false);
      },
      onError: (error: any) => {
        setIsResending(false);
        toast.error("Failed to resend OTP. Please try again later.");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the 6-digit code.");
      return;
    }

    const deviceId = localStorage.getItem("device_id") || crypto.randomUUID();

    localStorage.setItem("device_id", deviceId);

    validateOtp({
      data: {
        otp: otpCode,
        key: email,
        device_type: "web",
        device_id: deviceId,
      },
    });
  };

  const handleResend = () => {
    if (timer > 0) return;
    setIsResending(true);
    const deviceId = localStorage.getItem("device_id") || crypto.randomUUID();

    localStorage.setItem("device_id", deviceId);

    sendOtp({
      data: {
        key: email,
        device_type: "web",
        device_id: deviceId,
        external_ip: true,
      },
    });
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* LEFT PANEL - Shared with Login for consistency */}
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
              Secure Verification
              <br />
              <span style={{ color: "#A2D1E1" }}>Protecting Your Data.</span>
            </h1>
            <p
              className="mt-4 text-white/60"
              style={{ fontSize: "13px", lineHeight: "1.6", maxWidth: "420px" }}
            >
              As an extra layer of security, we've sent a 6-digit verification
              code to your registered email address. This helps us ensure that
              only you can access your account.
            </p>
          </div>

          <div
            className="mt-auto pt-8"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-center gap-4 text-white/40">
              <ShieldCheck className="w-10 h-10 opacity-50" />
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-widest text-[#A2D1E1]">
                  Multi-Factor Authentication
                </div>
                <div className="text-[12px] mt-0.5">
                  Compliant with HITRUST and SOC2 security standards.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Verification Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <h2
              className="text-foreground"
              style={{ fontSize: "24px", fontWeight: 700 }}
            >
              Verify Identity
            </h2>
            <p
              className="text-muted-foreground mt-2"
              style={{ fontSize: "14px", lineHeight: "1.5" }}
            >
              We've sent a 6-digit code to{" "}
              <span className="text-foreground font-semibold">{email}</span>.
              Enter it below to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="flex justify-between gap-2 sm:gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  autoFocus={index === 0}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-input-background border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary transition-all shadow-sm"
                />
              ))}
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isValidating}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-white font-semibold transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: isValidating
                    ? "#0891b2"
                    : "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
                  fontSize: "15px",
                  boxShadow: isValidating
                    ? "none"
                    : "0 4px 14px rgba(8, 145, 178, 0.35)",
                }}
              >
                {isValidating ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verify & Sign In
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p
                  className="text-muted-foreground"
                  style={{ fontSize: "13px" }}
                >
                  Didn't receive the code?{" "}
                  {timer > 0 ? (
                    <span className="text-foreground font-medium">
                      Resend in {timer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={isResending}
                      className="text-primary font-semibold hover:underline transition-colors inline-flex items-center gap-1.5"
                    >
                      {isResending && (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      )}
                      Resend Code
                    </button>
                  )}
                </p>
              </div>
            </div>
          </form>

          <div className="mt-12 pt-8 border-t border-border/50">
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                  Encrypted
                </span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-tight">
                  Verified
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
