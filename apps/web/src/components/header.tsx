import { useGetApiProfileMe } from "@/api";
import { useNavigate } from "@tanstack/react-router";
import {
  Search,
  Bell,
  Moon,
  Sun,
  User,
  ChevronDown,
  LogOut,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronRight,
  FileText,
  CheckCircle,
  AlertCircle,
  Menu,
  Calendar,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeView?: string;
  onMenuClick?: () => void;
  onNavigate?: (view: string) => void;
}

const breadcrumbMap: Record<string, { path: string[] }> = {
  dashboard: { path: ["Dashboard"] },
  "operations-overview": { path: ["Operations", "Overview"] },
  projects: { path: ["Projects"] },
  patients: { path: ["Members & Charts"] },
  "work-queue": { path: ["Operations", "Work Queue"] },
  "measures-library": { path: ["Operations", "Measures Library"] },
  "start-coding": { path: ["Operations", "Abstraction"] },
  abstraction: { path: ["Operations", "Abstraction", "Abstraction Workspace"] },
  "audit-sampling": { path: ["Operations", "Auditing"] },
  "qa-review": { path: ["Operations", "Exceptions"] },
  "reports-submissions": { path: ["Insights", "Reports"] },
  analytics: { path: ["Insights", "Analytics"] },
  "admin-settings": { path: ["Administration", "Users & Roles"] },
  security: { path: ["Administration", "Security & Compliance"] },
  "ai-optimization": { path: ["Administration", "AI Optimization"] },
  settings: { path: ["Administration", "Settings"] },
};

const programs = [
  "HEDIS MY2026",
  "HEDIS MY2025",
  "QARR 2026",
  "IPA 2026",
  "Medicaid HEDIS",
];

const notifications = [
  {
    id: 1,
    type: "assignment",
    title: "New members assigned",
    message: "14 CDC denominator members added to your abstraction queue",
    time: "8 min ago",
    unread: true,
    icon: FileText,
  },
  {
    id: 2,
    type: "review",
    title: "QA feedback — CBP chart",
    message: "Member MBR-667890 returned: BP reading date outside valid window",
    time: "42 min ago",
    unread: true,
    icon: AlertCircle,
  },
  {
    id: 3,
    type: "deadline",
    title: "Abstraction deadline approaching",
    message: "6 COL hybrid charts due by end of day — 3.4 hrs remaining",
    time: "1 hr ago",
    unread: true,
    icon: Clock,
  },
  {
    id: 4,
    type: "success",
    title: "NCQA submission accepted",
    message: "BCS measure batch (411 records) accepted by NCQA portal",
    time: "3 hrs ago",
    unread: false,
    icon: CheckCircle,
  },
  {
    id: 5,
    type: "assignment",
    title: "Supplemental data received",
    message: "Lab results for 28 HBD members uploaded — ready for review",
    time: "5 hrs ago",
    unread: false,
    icon: FileText,
  },
];

export function Header({
  darkMode,
  onToggleDarkMode,
  activeView = "dashboard",
  onMenuClick,
  onNavigate,
}: HeaderProps) {
  const [showProgramMenu, setShowProgramMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState("HEDIS MY2026");

  const unreadCount = notifications.filter((n) => n.unread).length;
  const crumbs = (breadcrumbMap[activeView] ?? breadcrumbMap["dashboard"]).path;
  const navigate = useNavigate();
  const { data: profile } = useGetApiProfileMe();
  useEffect(() => {
    if (profile) {
      localStorage.setItem("user_profile", JSON.stringify(profile));
    }
  }, [profile]);

  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user_profile") || "null")
      : null;

  const user = profile?.data || storedUser;

  const iconColor = (type: string) =>
    type === "assignment"
      ? "bg-primary/10 text-primary"
      : type === "review"
        ? "bg-amber-100 text-amber-600"
        : type === "deadline"
          ? "bg-red-100 text-red-600"
          : type === "success"
            ? "bg-emerald-100 text-emerald-600"
            : "bg-muted text-muted-foreground";

  return (
    <header className="h-14 md:h-[52px] bg-card border-b border-border flex items-center justify-between px-3 md:px-5 gap-2 flex-shrink-0">
      {/* ── Left ── */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-accent rounded-lg transition-colors flex-shrink-0"
          aria-label="Open navigation"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>

        {/* Program Selector */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setShowProgramMenu(!showProgramMenu)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
          >
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary whitespace-nowrap">
              {selectedProgram}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          </button>
          {showProgramMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowProgramMenu(false)}
              />
              <div className="absolute top-full left-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                <div className="px-3 py-1.5 border-b border-border mb-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Measurement Year
                  </p>
                </div>
                {programs.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedProgram(p);
                      setShowProgramMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-accent transition-colors flex items-center gap-2 ${
                      selectedProgram === p
                        ? "text-primary font-semibold bg-primary/5"
                        : "text-muted-foreground"
                    }`}
                  >
                    {selectedProgram === p && (
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    )}
                    {selectedProgram !== p && (
                      <span className="w-1.5 h-1.5 flex-shrink-0" />
                    )}
                    {p}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-1.5 text-xs min-w-0">
          {crumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-1.5 min-w-0">
              {i > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              )}
              <span
                className={`truncate ${i === crumbs.length - 1 ? "text-foreground font-semibold" : "text-muted-foreground"}`}
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Center: Search ── */}
      <div className="hidden md:flex items-center flex-1 max-w-sm mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search members, measures, MRN…"
            className="w-full pl-9 pr-4 py-1.5 bg-input-background border border-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
        <button className="md:hidden p-2 hover:bg-accent rounded-lg transition-colors">
          <Search className="w-5 h-5 text-foreground" />
        </button>

        {/* Dark mode */}

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-accent rounded-lg transition-colors relative"
          >
            <Bell className="w-4 h-4 text-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-foreground">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.map((n) => {
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.id}
                        className={`px-4 py-3 hover:bg-accent cursor-pointer transition-colors ${n.unread ? "bg-primary/5" : ""}`}
                        onClick={() => setShowNotifications(false)}
                      >
                        <div className="flex gap-3">
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 mt-0.5 ${iconColor(n.type)}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-xs font-semibold text-foreground">
                                {n.title}
                              </p>
                              {n.unread && (
                                <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                              {n.message}
                            </p>
                            <p className="text-[10px] text-muted-foreground/60 mt-1">
                              {n.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-border">
                  <button className="text-xs text-primary hover:underline w-full text-center">
                    View all notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="hidden md:block h-5 w-px bg-border mx-1" />

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 hover:bg-accent rounded-lg px-2 py-1.5 transition-colors"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-cyan-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">
                {user?.full_name
                  ?.split(" ")
                  ?.map((n: string) => n[0])
                  ?.join("")
                  ?.slice(0, 2) || "U"}
              </span>
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-semibold text-foreground leading-tight">
                {user?.full_name || "User"}
              </div>
              <div className="text-[10px] text-muted-foreground leading-tight">
                {user?.job_title || "User"}
              </div>
            </div>
            <ChevronDown className="hidden md:block w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl z-20 py-1.5 overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">
                    {user?.full_name || "User"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {user?.email || "No Email"}
                  </p>
                  <span className="mt-1.5 inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                    {user?.job_title || "User"}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate?.("profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  My Profile
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onNavigate?.("profile");
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <SettingsIcon className="w-4 h-4 text-muted-foreground" />
                  Preferences
                </button>
                <button
                  onClick={() => setShowUserMenu(false)}
                  className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-muted-foreground" />
                  Help & NCQA Specs
                </button>
                <div className="border-t border-border my-1" />
                <button
  onClick={() => {
    setShowUserMenu(false);

    // Remove stored auth data
    localStorage.removeItem("userDetail");
    localStorage.removeItem("role");
    localStorage.removeItem("rememberMe");

    // Redirect to login
    navigate({ to: "/auth/login" });
  }}
  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent transition-colors flex items-center gap-2"
>
  <LogOut className="w-4 h-4" />
  Sign Out
</button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
