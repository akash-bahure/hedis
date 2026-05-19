import { useEffect, useState } from "react";
import {
  User,
  Settings,
  Bell,
  Shield,
  Camera,
  Save,
  ChevronRight,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  IdCard,
  Award,
  Lock,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Sun,
  Moon,
  Globe,
  Clock,
  Layout,
  LayoutList,
  CheckCircle2,
  AlertTriangle,
  Laptop,
  Tablet,
  LogOut,
  Key,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  BellRing,
  BellOff,
  FileText,
  MessageSquare,
  CalendarCheck,
  Zap,
  CheckSquare,
  ChevronDown,
} from "lucide-react";
import {
  useGetApiProfileMe,
  usePatchApiProfileId,
  usePatchApiProfileIdNotifications,
  usePatchApiProfileIdPreferences,
  usePatchApiProfileIdSecurity,
} from "@/api";
import { toast } from "sonner";

/* ─── Types ─────────────────────────────────────────── */
type Tab = "profile" | "preferences" | "notifications" | "security";

interface ProfilePreferencesProps {
  onBack?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

/* ─── Static mock data ───────────────────────────────── */
const SESSIONS = [
  {
    id: 1,
    device: "Chrome · macOS",
    location: "Boston, MA",
    last: "Active now",
    current: true,
    icon: Monitor,
  },
  {
    id: 2,
    device: "Safari · iPhone",
    location: "Boston, MA",
    last: "2 hrs ago",
    current: false,
    icon: Smartphone,
  },
  {
    id: 3,
    device: "Edge · Windows",
    location: "New York, NY",
    last: "3 days ago",
    current: false,
    icon: Laptop,
  },
];

const LOGIN_HISTORY = [
  {
    date: "Apr 21, 2026 · 8:02 AM",
    device: "Chrome · macOS",
    location: "Boston, MA",
    status: "success",
  },
  {
    date: "Apr 20, 2026 · 7:48 AM",
    device: "Chrome · macOS",
    location: "Boston, MA",
    status: "success",
  },
  {
    date: "Apr 19, 2026 · 9:11 AM",
    device: "Safari · iPhone",
    location: "Boston, MA",
    status: "success",
  },
  {
    date: "Apr 18, 2026 · 6:55 PM",
    device: "Unknown · Windows",
    location: "Newark, NJ",
    status: "failed",
  },
  {
    date: "Apr 17, 2026 · 8:33 AM",
    device: "Chrome · macOS",
    location: "Boston, MA",
    status: "success",
  },
];

const CERTS = [
  {
    name: "RHIA — Registered Health Information Administrator",
    org: "AHIMA",
    year: "2019",
    active: true,
  },
  {
    name: "CPC — Certified Professional Coder",
    org: "AAPC",
    year: "2021",
    active: true,
  },
  {
    name: "CPHQ — Certified Professional in Healthcare Quality",
    org: "NAHQ",
    year: "2023",
    active: true,
  },
  {
    name: "HEDIS Abstractor Certification",
    org: "NCQA",
    year: "2024",
    active: true,
  },
];

/* ─── Toggle Switch ──────────────────────────────────── */
function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 flex-shrink-0 ${
        checked ? "bg-primary" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

/* ─── Section card wrapper ───────────────────────────── */
function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

/* ─── Field row helper ───────────────────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

/* ─── Notification Row ───────────────────────────────── */
function NotifRow({
  icon: Icon,
  label,
  sub,
  inApp,
  email,
  onInApp,
  onEmail,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  inApp: boolean;
  email: boolean;
  onInApp: (v: boolean) => void;
  onEmail: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      <div className="p-1.5 rounded-lg bg-primary/8 flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
      <div className="flex items-center gap-6 flex-shrink-0">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">In-app</span>
          <Toggle checked={inApp} onChange={onInApp} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Email</span>
          <Toggle checked={email} onChange={onEmail} />
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════ */
export function ProfilePreferences({
  onBack,
  darkMode,
  onToggleDarkMode,
}: ProfilePreferencesProps) {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [certifications, setCertifications] = useState<any[]>([]);
  const { data: profileResponse } = useGetApiProfileMe();

  const profile = profileResponse?.data;

  /* ── Profile state ── */
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    credentials: "",
    jobTitle: "",
    department: "",
    departmentId: "",
    employeeId: "",
    memberSince: "",
    email: "",
    workPhone: "",
    mobilePhone: "",
    location: "",
    bio: "",
  });

  const { mutate: updateProfile, isPending } = usePatchApiProfileId({
    mutation: {
      onSuccess: () => {
        flashSaved();

        toast.success("Profile updated successfully");
      },

      onError: (error: any) => {
        toast.error(error?.response?.data?.error || "Failed to update profile");
      },
    },
  });

  const [showCertModal, setShowCertModal] = useState(false);

  const [certForm, setCertForm] = useState({
    name: "",
    issuer: "",
    issued_year: "",
    status: "Active",
  });

  /* ── Preferences state ── */
  const [prefs, setPrefs] = useState({
    theme: "light" as "light" | "dark" | "system",
    sidebarDensity: "comfortable" as "compact" | "comfortable",
    defaultView: "dashboard",
    defaultProgram: "HEDIS MY2026",
    itemsPerPage: "25",
    dateFormat: "MM/DD/YYYY",
    timezone: "America/New_York",
    autoSave: true,
    confirmSubmit: true,
    showQuickStats: true,
  });

  const { mutate: updatePreferences, isPending: isPreferencesSaving } =
    usePatchApiProfileIdPreferences({
      mutation: {
        onSuccess: () => {
          toast.success("Preferences saved successfully");
        },

        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error || "Failed to save preferences",
          );
        },
      },
    });

  /* ── Notifications state ── */
  const [notifs, setNotifs] = useState({
    assignmentsInApp: true,
    assignmentsEmail: true,
    qaFeedbackInApp: true,
    qaFeedbackEmail: true,
    deadlinesInApp: true,
    deadlinesEmail: false,
    submissionsInApp: true,
    submissionsEmail: true,
    systemInApp: false,
    systemEmail: false,
    weeklyDigest: true,
    digestDay: "Monday",
  });

  const { mutate: updateNotifications, isPending: isNotificationsSaving } =
    usePatchApiProfileIdNotifications({
      mutation: {
        onSuccess: () => {
          toast.success("Notification preferences updated successfully");
        },

        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error ||
              "Failed to update notification preferences",
          );
        },
      },
    });

  /* ── Security state ── */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [twoFA, setTwoFA] = useState(true);
  const [pwSaved, setPwSaved] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [loginAlerts, setLoginAlerts] = useState(true);

  /* ── Saved flash ── */
  const [saved, setSaved] = useState(false);
  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const { mutate: updateSecurity, isPending: isSecuritySaving } =
    usePatchApiProfileIdSecurity({
      mutation: {
        onSuccess: () => {
          toast.success("Security settings updated successfully");

          setPwSaved(true);

          setTimeout(() => setPwSaved(false), 2200);

          setPwForm({
            current: "",
            next: "",
            confirm: "",
          });
        },

        onError: (error: any) => {
          toast.error(
            error?.response?.data?.error ||
              "Failed to update security settings",
          );
        },
      },
    });

  useEffect(() => {
    if (profile) {
      /* PREFILL PROFILE */
      setProfileForm({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        credentials: profile.credentials || "",
        jobTitle: profile.job_title || "",
        department: profile.department_name || "",
        departmentId: profile.department_id || "",
        employeeId: profile.employee_id || "",
        memberSince: profile.member_since || "",
        email: profile.email || "",
        workPhone: profile.phone || "",
        mobilePhone: profile.mobile_phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
      });

      setCertifications(profile.certifications || []);

      /* PREFILL PREFERENCES */
      if (profile.preferences) {
        setPrefs({
          theme: profile.preferences?.appearance?.colorTheme || "light",

          sidebarDensity:
            profile.preferences?.appearance?.sidebarDensity || "comfortable",

          defaultView:
            profile.preferences?.workflowDefaults?.defaultLandingPage ||
            "dashboard",

          defaultProgram:
            profile.preferences?.workflowDefaults?.defaultMeasurementYear ||
            "HEDIS MY2026",

          itemsPerPage: String(
            profile.preferences?.workflowDefaults?.itemsPerPage || "25",
          ),

          dateFormat:
            profile.preferences?.workflowDefaults?.dateFormat || "MM/DD/YYYY",

          timezone:
            profile.preferences?.workflowDefaults?.timezone ||
            "America/New_York",

          autoSave: profile.preferences?.workspaceBehavior?.autoSave ?? true,

          confirmSubmit:
            profile.preferences?.workspaceBehavior?.confirmBeforeSubmission ??
            true,

          showQuickStats:
            profile.preferences?.workspaceBehavior?.showQuickStats ?? true,
        });
      }

      /* PREFILL NOTIFICATIONS */
      if (profile.notifications) {
        setNotifs({
          assignmentsInApp:
            profile.notifications?.eventNotifications?.memberAssignments
              ?.inApp ?? true,

          assignmentsEmail:
            profile.notifications?.eventNotifications?.memberAssignments
              ?.email ?? true,

          qaFeedbackInApp:
            profile.notifications?.eventNotifications?.qaFeedback?.inApp ??
            true,

          qaFeedbackEmail:
            profile.notifications?.eventNotifications?.qaFeedback?.email ??
            true,

          deadlinesInApp:
            profile.notifications?.eventNotifications?.abstractionDeadlines
              ?.inApp ?? true,

          deadlinesEmail:
            profile.notifications?.eventNotifications?.abstractionDeadlines
              ?.email ?? false,

          submissionsInApp:
            profile.notifications?.eventNotifications?.ncqaSubmissions?.inApp ??
            true,

          submissionsEmail:
            profile.notifications?.eventNotifications?.ncqaSubmissions?.email ??
            true,

          systemInApp:
            profile.notifications?.eventNotifications?.systemUpdates?.inApp ??
            false,

          systemEmail:
            profile.notifications?.eventNotifications?.systemUpdates?.email ??
            false,

          weeklyDigest: profile.notifications?.weeklyDigest?.enabled ?? true,

          digestDay: profile.notifications?.weeklyDigest?.day || "Monday",
        });
      }

      if (profile.security) {
        setTwoFA(profile.security?.two_factor_auth ?? true);

        setSessionTimeout(profile.security?.session_timeout ?? 30);

        setLoginAlerts(profile.security?.login_alerts ?? true);
      }

      localStorage.setItem("user_profile", JSON.stringify(profile));
    }
  }, [profile]);

  /* ── helpers ── */
  const pf =
    (k: keyof typeof profileForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfileForm((prev) => ({ ...prev, [k]: e.target.value }));

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  /* ══════ RENDER ══════ */
  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Page header ── */}
      <div className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 whitespace-nowrap p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h1 className="text-base font-semibold text-foreground">
                Profile & Preferences
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your account, preferences, and security settings
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Changes saved
              </span>
            )}
            <button
              onClick={() => {
                if (!profile?.id) return;

                /* PROFILE TAB */
                if (activeTab === "profile") {
                  updateProfile({
                    id: profile.id,
                    data: {
                      first_name: profileForm.firstName,
                      last_name: profileForm.lastName,
                      credentials: profileForm.credentials,
                      email: profileForm.email,
                      phone: profileForm.workPhone,
                      mobile_phone: profileForm.mobilePhone,
                      department_id: profileForm.departmentId || null,
                      employee_id: profileForm.employeeId,
                      member_since: profileForm.memberSince,
                      job_title: profileForm.jobTitle,
                      location: profileForm.location,
                      bio: profileForm.bio,
                      certifications,
                    },
                  });

                  return;
                }

                /* PREFERENCES TAB */
                if (activeTab === "preferences") {
                  updatePreferences({
                    id: profile.id,
                    data: {
                      appearance: {
                        colorTheme: prefs.theme,
                        sidebarDensity: prefs.sidebarDensity,
                      },

                      workflowDefaults: {
                        defaultLandingPage: prefs.defaultView,
                        defaultMeasurementYear: prefs.defaultProgram,
                        itemsPerPage: Number(prefs.itemsPerPage),
                        dateFormat: prefs.dateFormat,
                        timezone: prefs.timezone,
                      },

                      workspaceBehavior: {
                        autoSave: prefs.autoSave,
                        confirmBeforeSubmission: prefs.confirmSubmit,
                        showQuickStats: prefs.showQuickStats,
                      },
                    },
                  });

                  return;
                }

                /* NOTIFICATIONS TAB */
                if (activeTab === "notifications") {
                  updateNotifications({
                    id: profile.id,
                    data: {
                      eventNotifications: {
                        memberAssignments: {
                          inApp: notifs.assignmentsInApp,
                          email: notifs.assignmentsEmail,
                        },

                        qaFeedback: {
                          inApp: notifs.qaFeedbackInApp,
                          email: notifs.qaFeedbackEmail,
                        },

                        abstractionDeadlines: {
                          inApp: notifs.deadlinesInApp,
                          email: notifs.deadlinesEmail,
                        },

                        ncqaSubmissions: {
                          inApp: notifs.submissionsInApp,
                          email: notifs.submissionsEmail,
                        },

                        systemUpdates: {
                          inApp: notifs.systemInApp,
                          email: notifs.systemEmail,
                        },
                      },

                      weeklyDigest: {
                        enabled: notifs.weeklyDigest,
                        day: notifs.digestDay,
                      },
                    },
                  });

                  return;
                }

                /* SECURITY TAB */
                if (activeTab === "security") {
                  updateSecurity({
                    id: profile.id,

                    data: {
                      security: {
                        two_factor_auth: twoFA,

                        session_timeout: sessionTimeout,

                        login_alerts: loginAlerts,
                      },
                    },
                  });

                  return;
                }
              }}
              className="btn-primary text-xs px-4 py-2"
            >
              <Save className="w-3.5 h-3.5" />

              {isPending ||
              isPreferencesSaving ||
              isNotificationsSaving ||
              isSecuritySaving
                ? "Saving..."
                : activeTab === "profile"
                  ? "Save Profile"
                  : activeTab === "preferences"
                    ? "Save Preferences"
                    : activeTab === "notifications"
                      ? "Save Notifications"
                      : activeTab === "security"
                        ? "Save Security"
                        : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto sm:flex-wrap">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
          {/* ╔══════════════════════════════════╗
              ║  TAB: PROFILE                    ║
              ╚══════════════════════════════════╝ */}
          {activeTab === "profile" && (
            <>
              {/* Avatar + name hero */}
              <div className="card">
                <div className="card-body">
                  <div className="flex items-start gap-5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-cyan-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-2xl select-none">
                          {profileForm.firstName?.[0]}
                          {profileForm.lastName?.[0]}
                        </span>
                      </div>
                      <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-card border-2 border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors shadow-sm">
                        <Camera className="w-3 h-3 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Name & role */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-foreground">
                        {profileForm.firstName} {profileForm.lastName}
                        {profileForm.credentials
                          ? `, ${profileForm.credentials}`
                          : ""}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {profileForm.jobTitle} · {profileForm.department}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="badge badge-primary">
                          Operations / PM
                        </span>
                        <span className="phi-indicator">
                          <Lock className="w-3 h-3" />
                          PHI Access Authorized
                        </span>
                        <span className="ncqa-badge text-[10px] px-2 py-0.5">
                          NCQA Certified
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-muted-foreground">
                        Employee ID
                      </p>
                      <p className="text-xs font-mono font-semibold text-foreground mt-0.5">
                        {profileForm.employeeId || "-"}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        Member Since
                      </p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">
                        {profileForm.memberSince
                          ? new Date(
                              profileForm.memberSince,
                            ).toLocaleDateString("en-US", {
                              month: "long",
                              year: "numeric",
                            })
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <Section
                title="Personal Information"
                subtitle="Your name and contact details as they appear across the platform"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" required>
                    <input
                      className="input-field text-xs"
                      value={profileForm.firstName}
                      onChange={pf("firstName")}
                    />
                  </Field>
                  <Field label="Last Name" required>
                    <input
                      className="input-field text-xs"
                      value={profileForm.lastName}
                      onChange={pf("lastName")}
                    />
                  </Field>
                  <Field label="Credentials / Suffix">
                    <input
                      className="input-field text-xs"
                      value={profileForm.credentials}
                      onChange={pf("credentials")}
                      placeholder="e.g. RHIA, CPC, CPHQ"
                    />
                  </Field>
                  <Field label="Employee ID">
                    <input
                      className="input-field text-xs bg-muted/40 cursor-not-allowed"
                      value={profileForm.employeeId}
                      readOnly
                    />
                  </Field>
                  <Field label="Job Title" required>
                    <input
                      className="input-field text-xs"
                      value={profileForm.jobTitle}
                      onChange={pf("jobTitle")}
                    />
                  </Field>
                  <Field label="Department">
                    <input
                      className="input-field text-xs"
                      value={profileForm.department}
                      onChange={pf("department")}
                    />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Bio / Professional Summary">
                    <textarea
                      rows={3}
                      className="input-field text-xs resize-none"
                      value={profileForm.bio}
                      onChange={pf("bio")}
                    />
                  </Field>
                </div>
              </Section>

              {/* Contact */}
              <Section
                title="Contact Information"
                subtitle="Used for platform alerts, NCQA submission notices, and team communications"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Work Email" required>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        className="input-field text-xs pl-9"
                        value={profileForm.email}
                        onChange={pf("email")}
                      />
                    </div>
                  </Field>
                  <Field label="Location / Office">
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        className="input-field text-xs pl-9"
                        value={profileForm.location}
                        onChange={pf("location")}
                      />
                    </div>
                  </Field>
                  <Field label="Work Phone">
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        className="input-field text-xs pl-9"
                        value={profileForm.workPhone}
                        onChange={pf("workPhone")}
                      />
                    </div>
                  </Field>
                  <Field label="Mobile Phone">
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input
                        className="input-field text-xs pl-9"
                        value={profileForm.mobilePhone}
                        onChange={pf("mobilePhone")}
                      />
                    </div>
                  </Field>
                </div>
              </Section>

              {/* Certifications */}
              <Section
                title="Certifications & Credentials"
                subtitle="Active professional certifications associated with your abstractor profile"
              >
                <div className="space-y-2">
                  {certifications.map((cert, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-muted/30 border border-border"
                    >
                      <Award className="w-4 h-4 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-foreground">
                          {cert.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {cert.issuer} · Issued {cert.issued_year}
                        </p>
                      </div>
                      {cert.status === "Active" && (
                        <span className="badge badge-success text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Active
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowCertModal(true)}
                  className="inline-flex items-center gap-2 whitespace-nowrap mt-3 text-xs text-primary hover:underline font-medium"
                >
                  + Add certification
                </button>
              </Section>
            </>
          )}

          {/* ╔══════════════════════════════════╗
              ║  TAB: PREFERENCES                ║
              ╚══════════════════════════════════╝ */}
          {activeTab === "preferences" && (
            <>
              {/* Appearance */}
              <Section
                title="Appearance"
                subtitle="Customize how the platform looks and feels"
              >
                <div className="space-y-4">
                  {/* Theme */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Color Theme
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(
                        [
                          { id: "light", label: "Light", icon: Sun },
                          { id: "dark", label: "Dark", icon: Moon },
                          { id: "system", label: "System", icon: Monitor },
                        ] as const
                      ).map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setPrefs((p) => ({ ...p, theme: opt.id }));
                              if (onToggleDarkMode && opt.id !== "system") {
                                if ((opt.id === "dark") !== darkMode)
                                  onToggleDarkMode();
                              }
                            }}
                            className={`inline-flex items-center gap-2 whitespace-nowrap justify-center px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                              prefs.theme === opt.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted/20 text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sidebar density */}
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">
                      Sidebar Density
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {(
                        [
                          {
                            id: "comfortable",
                            label: "Comfortable",
                            icon: Layout,
                          },
                          { id: "compact", label: "Compact", icon: LayoutList },
                        ] as const
                      ).map((opt) => {
                        const Icon = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            onClick={() =>
                              setPrefs((p) => ({
                                ...p,
                                sidebarDensity: opt.id,
                              }))
                            }
                            className={`inline-flex items-center gap-2 whitespace-nowrap justify-center px-3 py-2.5 rounded-lg border text-xs font-medium transition-all ${
                              prefs.sidebarDensity === opt.id
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border bg-muted/20 text-muted-foreground hover:bg-accent"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Section>

              {/* Workflow defaults */}
              <Section
                title="Workflow Defaults"
                subtitle="Set your default landing page and measurement year context"
              >
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Default Landing Page">
                    <div className="relative">
                      <select
                        className="input-field text-xs appearance-none pr-8"
                        value={prefs.defaultView}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            defaultView: e.target.value,
                          }))
                        }
                      >
                        <option value="dashboard">Dashboard</option>
                        <option value="work-queue">Work Queue</option>
                        <option value="reports-submissions">Reports</option>
                        <option value="measures-library">
                          Measure Library
                        </option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Default Measurement Year">
                    <div className="relative">
                      <select
                        className="input-field text-xs appearance-none pr-8"
                        value={prefs.defaultProgram}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            defaultProgram: e.target.value,
                          }))
                        }
                      >
                        <option>HEDIS MY2026</option>
                        <option>HEDIS MY2025</option>
                        <option>QARR 2026</option>
                        <option>Medicaid HEDIS</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Items Per Page">
                    <div className="relative">
                      <select
                        className="input-field text-xs appearance-none pr-8"
                        value={prefs.itemsPerPage}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            itemsPerPage: e.target.value,
                          }))
                        }
                      >
                        {["10", "25", "50", "100"].map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Date Format">
                    <div className="relative">
                      <select
                        className="input-field text-xs appearance-none pr-8"
                        value={prefs.dateFormat}
                        onChange={(e) =>
                          setPrefs((p) => ({
                            ...p,
                            dateFormat: e.target.value,
                          }))
                        }
                      >
                        <option>MM/DD/YYYY</option>
                        <option>DD/MM/YYYY</option>
                        <option>YYYY-MM-DD</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <div className="mt-4">
                  <Field label="Timezone">
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <select
                        className="input-field text-xs appearance-none pl-9 pr-8"
                        value={prefs.timezone}
                        onChange={(e) =>
                          setPrefs((p) => ({ ...p, timezone: e.target.value }))
                        }
                      >
                        <option value="America/New_York">
                          Eastern Time (ET) — UTC-5/4
                        </option>
                        <option value="America/Chicago">
                          Central Time (CT) — UTC-6/5
                        </option>
                        <option value="America/Denver">
                          Mountain Time (MT) — UTC-7/6
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time (PT) — UTC-8/7
                        </option>
                        <option value="America/Anchorage">
                          Alaska Time (AKT) — UTC-9/8
                        </option>
                        <option value="Pacific/Honolulu">
                          Hawaii Time (HST) — UTC-10
                        </option>
                        <option value="UTC">UTC</option>
                      </select>
                      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>
              </Section>

              {/* Workspace behavior */}
              <Section
                title="Workspace Behavior"
                subtitle="Toggle auto-save, confirmation dialogs, and quick-stats display"
              >
                <div className="space-y-3">
                  {[
                    {
                      key: "autoSave" as const,
                      label: "Auto-save abstraction work",
                      sub: "Automatically save unsaved changes every 30 seconds",
                    },
                    {
                      key: "confirmSubmit" as const,
                      label: "Confirm before submission",
                      sub: "Show a confirmation dialog before submitting abstracted charts",
                    },
                    {
                      key: "showQuickStats" as const,
                      label: "Show quick stats in header",
                      sub: "Display your daily productivity summary in the top header",
                    },
                  ].map(({ key, label, sub }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {label}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {sub}
                        </p>
                      </div>
                      <Toggle
                        checked={prefs[key]}
                        onChange={(v) => setPrefs((p) => ({ ...p, [key]: v }))}
                      />
                    </div>
                  ))}
                </div>
              </Section>
            </>
          )}

          {/* ╔══════════════════════════════════╗
              ║  TAB: NOTIFICATIONS              ║
              ╚══════════════════════════════════╝ */}
          {activeTab === "notifications" && (
            <>
              {/* Master toggle */}
              <div className="alert alert-info">
                <BellRing className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold">
                    Notification preferences
                  </p>
                  <p className="text-[11px] mt-0.5">
                    You'll always receive critical NCQA deadline and compliance
                    alerts regardless of these settings.
                  </p>
                </div>
              </div>

              <Section
                title="Event Notifications"
                subtitle="Configure in-app and email alerts for each event category"
              >
                {/* Column headers */}
                <div className="flex items-center gap-4 pb-2 border-b border-border mb-1">
                  <div className="flex-1" />
                  <div className="flex items-center gap-6 flex-shrink-0 pr-0.5">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-10 text-center">
                      In-App
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide w-10 text-center">
                      Email
                    </span>
                  </div>
                </div>

                <NotifRow
                  icon={FileText}
                  label="Member Assignments"
                  sub="New members added to your abstraction queue"
                  inApp={notifs.assignmentsInApp}
                  email={notifs.assignmentsEmail}
                  onInApp={(v) =>
                    setNotifs((n) => ({ ...n, assignmentsInApp: v }))
                  }
                  onEmail={(v) =>
                    setNotifs((n) => ({ ...n, assignmentsEmail: v }))
                  }
                />
                <NotifRow
                  icon={MessageSquare}
                  label="QA Feedback"
                  sub="Returned charts, reviewer comments, and correction requests"
                  inApp={notifs.qaFeedbackInApp}
                  email={notifs.qaFeedbackEmail}
                  onInApp={(v) =>
                    setNotifs((n) => ({ ...n, qaFeedbackInApp: v }))
                  }
                  onEmail={(v) =>
                    setNotifs((n) => ({ ...n, qaFeedbackEmail: v }))
                  }
                />
                <NotifRow
                  icon={Clock}
                  label="Abstraction Deadlines"
                  sub="Due-date reminders and approaching deadline warnings"
                  inApp={notifs.deadlinesInApp}
                  email={notifs.deadlinesEmail}
                  onInApp={(v) =>
                    setNotifs((n) => ({ ...n, deadlinesInApp: v }))
                  }
                  onEmail={(v) =>
                    setNotifs((n) => ({ ...n, deadlinesEmail: v }))
                  }
                />
                <NotifRow
                  icon={CalendarCheck}
                  label="NCQA Submissions"
                  sub="Submission confirmations, acceptance, and rejection notices"
                  inApp={notifs.submissionsInApp}
                  email={notifs.submissionsEmail}
                  onInApp={(v) =>
                    setNotifs((n) => ({ ...n, submissionsInApp: v }))
                  }
                  onEmail={(v) =>
                    setNotifs((n) => ({ ...n, submissionsEmail: v }))
                  }
                />
                <NotifRow
                  icon={Zap}
                  label="System Updates"
                  sub="Platform maintenance, feature releases, and data refreshes"
                  inApp={notifs.systemInApp}
                  email={notifs.systemEmail}
                  onInApp={(v) => setNotifs((n) => ({ ...n, systemInApp: v }))}
                  onEmail={(v) => setNotifs((n) => ({ ...n, systemEmail: v }))}
                />
              </Section>

              {/* Weekly digest */}
              <Section
                title="Weekly Digest"
                subtitle="A summarized performance report delivered to your inbox"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Enable weekly digest email
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Includes chart completion rates, QA scores, and measure
                      compliance summaries
                    </p>
                  </div>
                  <Toggle
                    checked={notifs.weeklyDigest}
                    onChange={(v) =>
                      setNotifs((n) => ({ ...n, weeklyDigest: v }))
                    }
                  />
                </div>
                {notifs.weeklyDigest && (
                  <div className="mt-4">
                    <Field label="Send digest on">
                      <div className="relative w-40">
                        <select
                          className="input-field text-xs appearance-none pr-8"
                          value={notifs.digestDay}
                          onChange={(e) =>
                            setNotifs((n) => ({
                              ...n,
                              digestDay: e.target.value,
                            }))
                          }
                        >
                          {[
                            "Monday",
                            "Tuesday",
                            "Wednesday",
                            "Thursday",
                            "Friday",
                          ].map((d) => (
                            <option key={d}>{d}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                      </div>
                    </Field>
                  </div>
                )}
              </Section>
            </>
          )}

          {/* ╔══════════════════════════════════╗
              ║  TAB: SECURITY                   ║
              ╚══════════════════════════════════╝ */}
          {activeTab === "security" && (
            <>
              {/* Change Password */}
              <Section
                title="Change Password"
                subtitle="Use a strong, unique password — minimum 12 characters with mixed case and symbols"
              >
                <div className="space-y-4">
                  {[
                    { key: "current" as const, label: "Current password" },
                    { key: "next" as const, label: "New password" },
                    { key: "confirm" as const, label: "Confirm new password" },
                  ].map(({ key, label }) => (
                    <Field key={key} label={label} required>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                          type={showPw[key] ? "text" : "password"}
                          className="input-field text-xs pl-9 pr-10"
                          placeholder="••••••••••••"
                          value={pwForm[key]}
                          onChange={(e) =>
                            setPwForm((f) => ({ ...f, [key]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPw((s) => ({ ...s, [key]: !s[key] }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPw[key] ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </Field>
                  ))}

                  {/* Password strength meter */}
                  {pwForm.next && (
                    <div>
                      <p className="text-[11px] text-muted-foreground mb-1.5">
                        Password strength
                      </p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full ${
                              pwForm.next.length < 6
                                ? i === 1
                                  ? "bg-destructive"
                                  : "bg-muted/40"
                                : pwForm.next.length < 10
                                  ? i <= 2
                                    ? "bg-amber-400"
                                    : "bg-muted/40"
                                  : pwForm.next.length < 14
                                    ? i <= 3
                                      ? "bg-primary"
                                      : "bg-muted/40"
                                    : "bg-emerald-500"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {pwForm.next.length < 6
                          ? "Too weak"
                          : pwForm.next.length < 10
                            ? "Fair — add more characters"
                            : pwForm.next.length < 14
                              ? "Good"
                              : "Strong"}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (!profile?.id) return;

                        if (
                          !pwForm.current ||
                          !pwForm.next ||
                          !pwForm.confirm
                        ) {
                          toast.error("Please fill all password fields");

                          return;
                        }

                        if (pwForm.next !== pwForm.confirm) {
                          toast.error(
                            "New password and confirm password do not match",
                          );

                          return;
                        }

                        updateSecurity({
                          id: profile.id,

                          data: {
                            currentPassword: pwForm.current,

                            newPassword: pwForm.next,

                            security: {
                              two_factor_auth: twoFA,

                              session_timeout: sessionTimeout,

                              login_alerts: loginAlerts,
                            },
                          },
                        });
                      }}
                      className="btn-primary text-xs px-4 py-2"
                    >
                      <Key className="w-3.5 h-3.5" />

                      {isSecuritySaving ? "Updating..." : "Update Password"}
                    </button>
                    {pwSaved && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Password updated
                      </span>
                    )}
                  </div>
                </div>
              </Section>

              {/* Two-Factor Authentication */}
              <Section
                title="Two-Factor Authentication"
                subtitle="Add an extra layer of security to your account"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-xl flex-shrink-0 ${twoFA ? "bg-emerald-50 border border-emerald-200" : "bg-muted/30 border border-border"}`}
                  >
                    <Smartphone
                      className={`w-5 h-5 ${twoFA ? "text-emerald-600" : "text-muted-foreground"}`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          Authenticator app (TOTP)
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {twoFA
                            ? "Active — using Google Authenticator"
                            : "Not configured — strongly recommended for HIPAA compliance"}
                        </p>
                      </div>
                      <Toggle checked={twoFA} onChange={setTwoFA} />
                    </div>
                    {twoFA && (
                      <div className="mt-3 flex items-center gap-2">
                        <span className="badge badge-success text-[10px]">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Enabled
                        </span>
                        <button className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-primary hover:underline font-medium">
                          <RefreshCw className="w-3 h-3" />
                          Regenerate backup codes
                        </button>
                      </div>
                    )}
                    {!twoFA && (
                      <div className="mt-3">
                        <div className="alert alert-warning py-2">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                          <p className="text-[11px]">
                            2FA is required for accounts with PHI access under
                            your organization's HIPAA Security Rule policy.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Section>

              {/* Active Sessions */}
              <Section
                title="Active Sessions"
                subtitle="Devices currently signed into your account"
              >
                <div className="space-y-2">
                  {SESSIONS.map((session) => {
                    const Icon = session.icon;
                    return (
                      <div
                        key={session.id}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/20"
                      >
                        <div className="p-2 rounded-lg bg-card border border-border flex-shrink-0">
                          <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold text-foreground">
                              {session.device}
                            </p>
                            {session.current && (
                              <span className="badge badge-success text-[10px]">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                This device
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {session.location} · {session.last}
                          </p>
                        </div>
                        {!session.current && (
                          <button className="inline-flex items-center gap-1.5 whitespace-nowrap text-[11px] text-destructive hover:underline font-medium flex-shrink-0">
                            <LogOut className="w-3 h-3" />
                            Revoke
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <button className="inline-flex items-center gap-2 whitespace-nowrap mt-3 text-xs text-destructive hover:underline font-medium">
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out all other devices
                </button>
              </Section>

              {/* Login History */}
              <Section
                title="Recent Login Activity"
                subtitle="Last 5 sign-in events for your account"
              >
                <div className="rounded-lg border border-border overflow-x-auto">
                  <table className="table-enterprise min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-[11px] sm:text-xs whitespace-nowrap">
                          Date & Time
                        </th>
                        <th className="text-[11px] sm:text-xs whitespace-nowrap">
                          Device / Browser
                        </th>
                        <th className="text-[11px] sm:text-xs whitespace-nowrap">
                          Location
                        </th>
                        <th className="text-[11px] sm:text-xs whitespace-nowrap">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {LOGIN_HISTORY.map((row, i) => (
                        <tr
                          key={i}
                          className={
                            row.status === "failed"
                              ? "bg-red-50/50 dark:bg-red-900/10"
                              : ""
                          }
                        >
                          <td className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                            {row.date}
                          </td>
                          <td className="text-xs text-foreground whitespace-nowrap">
                            {row.device}
                          </td>
                          <td className="text-xs text-muted-foreground whitespace-nowrap">
                            {row.location}
                          </td>
                          <td>
                            {row.status === "success" ? (
                              <span className="badge badge-success text-[10px]">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Success
                              </span>
                            ) : (
                              <span className="badge badge-error text-[10px]">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                Failed
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>

              {/* Danger zone */}
              <div className="card border-destructive/30">
                <div className="card-header border-destructive/20">
                  <h3 className="text-sm font-semibold text-destructive">
                    Danger Zone
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Irreversible account actions — contact your administrator
                    before proceeding
                  </p>
                </div>
                <div className="card-body flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      Deactivate account
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Removes your access and reassigns your open queue items to
                      your team lead
                    </p>
                  </div>
                  <button className="btn-destructive text-xs px-4 py-2">
                    Deactivate Account
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {showCertModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">Add Certification</h3>

              <button
                onClick={() => setShowCertModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <Field label="Certification Name" required>
                <input
                  className="input-field text-xs"
                  value={certForm.name}
                  onChange={(e) =>
                    setCertForm((p) => ({
                      ...p,
                      name: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Issuer" required>
                <input
                  className="input-field text-xs"
                  value={certForm.issuer}
                  onChange={(e) =>
                    setCertForm((p) => ({
                      ...p,
                      issuer: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field label="Issued Year">
                <input
                  className="input-field text-xs"
                  value={certForm.issued_year}
                  onChange={(e) =>
                    setCertForm((p) => ({
                      ...p,
                      issued_year: e.target.value,
                    }))
                  }
                />
              </Field>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowCertModal(false)}
                  className="btn-secondary text-xs"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    setCertifications((prev) => [...prev, certForm]);

                    setCertForm({
                      name: "",
                      issuer: "",
                      issued_year: "",
                      status: "Active",
                    });

                    setShowCertModal(false);
                  }}
                  className="btn-primary text-xs"
                >
                  Add Certification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
