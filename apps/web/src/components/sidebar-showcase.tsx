import { useState } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  CheckSquare,
  ShieldCheck,
  BarChart2,
  BookOpen,
  UserCog,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Settings,
  LogOut,
  Lock,
  Building2,
  RefreshCw,
  CheckCircle2,
  Star,
  AlertTriangle,
  Info,
  Eye,
  EyeOff,
  Zap,
  Shield,
  Users,
  Monitor,
} from "lucide-react";
import { UserRole, ROLE_CONFIG } from "./sidebar";

/* ════════════════════════════════════════════════════════════════
   MINI SIDEBAR — standalone preview used in the showcase grid
════════════════════════════════════════════════════════════════ */
const ALL_NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["abstractor", "qa-reviewer", "auditor", "admin"],
    badge: null,
  },
  {
    id: "work-queue",
    label: "Work Queue",
    icon: ClipboardList,
    roles: ["abstractor", "qa-reviewer", "admin"],
    badge: { count: 24, cls: "bg-primary/15 text-primary" },
  },
  {
    id: "qa-review",
    label: "QA Review",
    icon: CheckSquare,
    roles: ["qa-reviewer", "admin"],
    badge: { count: 7, cls: "bg-amber-100 text-amber-700" },
  },
  {
    id: "audit-sampling",
    label: "Audit & Sampling",
    icon: ShieldCheck,
    roles: ["auditor", "admin"],
    badge: { count: 12, cls: "bg-primary/15 text-primary" },
  },
  {
    id: "reports-submissions",
    label: "Reports & Analytics",
    icon: BarChart2,
    roles: ["abstractor", "qa-reviewer", "auditor", "admin"],
    badge: null,
  },
  {
    id: "measures-library",
    label: "Measure Library",
    icon: BookOpen,
    roles: ["abstractor", "qa-reviewer", "auditor", "admin"],
    badge: null,
  },
];
const SETTINGS_ITEMS = [
  { id: "admin-settings", label: "Admin", icon: UserCog, roles: ["admin"] },
  { id: "security", label: "System Logs", icon: FileText, roles: ["admin"] },
];
const WORKFLOW = [
  { step: 1, short: "ABS" },
  { step: 2, short: "QA" },
  { step: 3, short: "AUD" },
  { step: 4, short: "SUB" },
];

function MiniSidebar({
  role,
  collapsed = false,
  activeId = "dashboard",
}: {
  role: UserRole;
  collapsed?: boolean;
  activeId?: string;
}) {
  const cfg = ROLE_CONFIG[role];
  const visibleNav = ALL_NAV.filter((n) => n.roles.includes(role));
  const visibleSettings = SETTINGS_ITEMS.filter((s) => s.roles.includes(role));
  const w = collapsed ? 64 : 210;

  return (
    <div
      className="flex flex-col bg-white dark:bg-[#1e293b] border border-border rounded-2xl overflow-hidden shadow-lg flex-shrink-0"
      style={{ width: w, height: 480 }}
    >
      {/* Header */}
      <div
        className={`flex items-center border-b border-border flex-shrink-0 ${collapsed ? "flex-col gap-1.5 px-2 py-3" : "gap-2.5 px-3 py-2.5"}`}
      >
        <div className="w-7 h-7 bg-gradient-to-br from-primary to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white font-extrabold text-[9px]">HA</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-bold text-foreground truncate leading-tight">
              HEDIS Abstractor
            </div>
            <div className="text-[9px] text-muted-foreground truncate">
              Apollo Health System
            </div>
          </div>
        )}
        <div className="p-1 rounded text-muted-foreground/60">
          {collapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </div>
      </div>

      {/* Workflow indicator */}
      {!collapsed && (
        <div className="mx-2 my-2 px-2.5 py-2 bg-muted/30 rounded-xl border border-border/50 flex-shrink-0">
          <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
            Pipeline
          </div>
          <div className="flex items-center">
            {WORKFLOW.map((s, i) => (
              <div
                key={s.step}
                className={`flex items-center ${i < 3 ? "flex-1" : ""}`}
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0 ${
                    s.step < cfg.workflowStep
                      ? "bg-emerald-100 text-emerald-700"
                      : s.step === cfg.workflowStep
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground/40"
                  }`}
                >
                  {s.step < cfg.workflowStep ? "✓" : s.short[0]}
                </div>
                {i < 3 && (
                  <div
                    className={`flex-1 h-0.5 mx-0.5 ${s.step < cfg.workflowStep ? "bg-emerald-300" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-hidden py-1.5 px-1.5 space-y-0.5">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeId;
          return (
            <div
              key={item.id}
              className={`flex items-center gap-1.5 rounded-lg py-[5px] border-l-[2px] transition-colors ${
                collapsed ? "justify-center px-[7px]" : "pl-[7px] pr-1.5"
              } ${
                isActive
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-transparent text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon
                className={`flex-shrink-0 ${collapsed ? "w-4 h-4" : "w-[14px] h-[14px]"} ${isActive ? "text-primary" : "text-muted-foreground"}`}
              />
              {!collapsed && (
                <>
                  <span
                    className={`text-[11px] flex-1 truncate ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {item.label}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[8px] font-bold px-1 h-3.5 rounded-full inline-flex items-center ${item.badge.cls}`}
                    >
                      {item.badge.count}
                    </span>
                  )}
                </>
              )}
            </div>
          );
        })}

        {/* Divider */}
        <div className="my-1 mx-1 border-t border-border/60" />

        {/* Settings */}
        {!collapsed && visibleSettings.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 pl-[7px] pr-1.5 py-[5px] rounded-lg border-l-[2px] border-transparent text-muted-foreground">
              <Settings className="w-[14px] h-[14px] text-muted-foreground flex-shrink-0" />
              <span className="text-[11px] font-medium flex-1">Settings</span>
              <ChevronDown className="w-3 h-3 text-muted-foreground/50" />
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex items-center justify-center px-[7px] py-[5px] rounded-lg border-l-[2px] border-transparent text-muted-foreground">
            <Settings className="w-4 h-4" />
          </div>
        )}
      </nav>

      {/* Footer */}
      <div
        className={`border-t border-border flex-shrink-0 ${collapsed ? "px-2 py-2.5" : "px-2.5 py-2.5"}`}
      >
        {collapsed ? (
          <div className="flex flex-col items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${cfg.avatarGradient} flex items-center justify-center`}
            >
              <span className="text-white text-[8px] font-bold">SJ</span>
            </div>
            <LogOut className="w-3.5 h-3.5 text-muted-foreground/50" />
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${cfg.avatarGradient} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-[8px] font-bold">SJ</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-foreground truncate">
                  Sarah Johnson, RHIA
                </div>
                <div className="text-[8px] text-muted-foreground truncate">
                  {cfg.description}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded-full border text-[8px] font-bold ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
              <span className="text-[8px] text-muted-foreground flex items-center gap-0.5">
                <Star className="w-2 h-2 fill-amber-400 text-amber-400" />
                Enterprise
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   STATE DEMO CARD — shows default / hover / active / disabled
════════════════════════════════════════════════════════════════ */
function StateDemo() {
  const states = [
    {
      label: "Default State",
      badge: "Resting",
      badgeCls: "bg-muted text-muted-foreground border-border",
      cls: "border-transparent text-sidebar-foreground",
      icon: LayoutDashboard,
      desc: "Normal resting state. Border-l transparent, standard text color.",
    },
    {
      label: "Hover State",
      badge: "Hover",
      badgeCls: "bg-muted/60 text-foreground border-border",
      cls: "border-transparent bg-sidebar-accent text-sidebar-accent-foreground",
      icon: BarChart2,
      desc: "Light gray bg (`sidebar-accent`). Text sharpens to accent-foreground.",
    },
    {
      label: "Active / Selected",
      badge: "Active",
      badgeCls: "bg-primary/10 text-primary border-primary/20",
      cls: "border-primary bg-primary/[0.09] text-primary font-semibold",
      icon: ShieldCheck,
      desc: "Blue bg tint, 3px left border in primary, bold label, icon in primary.",
      badge2: { count: 12, cls: "bg-primary/15 text-primary" },
    },
    {
      label: "Disabled State",
      badge: "No Access",
      badgeCls: "bg-red-50 text-red-600 border-red-200",
      cls: "border-transparent text-muted-foreground/40 cursor-not-allowed",
      icon: Lock,
      desc: "Opacity 40%, lock icon appended, cursor: not-allowed. Role-gated.",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <h3 className="text-sm font-bold text-foreground">
          Interaction States
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          All 4 states applied to nav items
        </p>
      </div>
      <div className="divide-y divide-border">
        {states.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="px-6 py-4 flex items-center gap-6">
              {/* Preview item */}
              <div className="w-[200px] flex-shrink-0">
                <div
                  className={`flex items-center gap-2.5 rounded-lg py-[7px] pl-[9px] pr-2.5 border-l-[3px] transition-all ${s.cls}`}
                >
                  <Icon
                    className={`w-[18px] h-[18px] flex-shrink-0 ${s.cls.includes("text-primary") && !s.cls.includes("/40") ? "text-primary" : s.cls.includes("/40") ? "text-muted-foreground/30" : "text-muted-foreground"}`}
                  />
                  <span className="text-[13px] flex-1">{s.label}</span>
                  {s.badge2 && (
                    <span
                      className={`text-[10px] font-bold px-1 h-[18px] rounded-full inline-flex items-center ${s.badge2.cls}`}
                    >
                      {s.badge2.count}
                    </span>
                  )}
                  {s.icon === Lock && (
                    <Lock className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
                  )}
                </div>
              </div>
              {/* Badge */}
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex-shrink-0 ${s.badgeCls}`}
              >
                {s.badge}
              </span>
              {/* Description */}
              <p className="text-xs text-muted-foreground flex-1">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   ACCESS MATRIX TABLE
════════════════════════════════════════════════════════════════ */
function AccessMatrix() {
  const roles: UserRole[] = ["abstractor", "qa-reviewer", "auditor", "admin"];
  const allItems = [...ALL_NAV, ...SETTINGS_ITEMS];

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <h3 className="text-sm font-bold text-foreground">
          Role-Based Access Matrix
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          ✓ Visible · — Hidden per NCQA operational role separation
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-6 py-2.5 font-semibold text-muted-foreground w-52">
                Navigation Item
              </th>
              {roles.map((r) => {
                const cfg = ROLE_CONFIG[r];
                return (
                  <th key={r} className="px-4 py-2.5 text-center">
                    <div
                      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${cfg.badgeClass}`}
                    >
                      {cfg.label}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allItems.map((item) => {
              const Icon = item.icon;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-6 py-2.5">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">
                        {item.label}
                      </span>
                    </div>
                  </td>
                  {roles.map((r) => {
                    const has = item.roles.includes(r);
                    return (
                      <td key={r} className="px-4 py-2.5 text-center">
                        {has ? (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          </span>
                        ) : (
                          <span className="text-muted-foreground/30 font-bold text-base leading-none">
                            —
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT SPEC CARD
════════════════════════════════════════════════════════════════ */
function SpecCard({
  title,
  items,
}: {
  title: string;
  items: { key: string; val: string }[];
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <h4 className="text-xs font-bold text-foreground mb-3">{title}</h4>
      <div className="space-y-1.5">
        {items.map(({ key, val }) => (
          <div key={key} className="flex items-baseline gap-2">
            <span className="text-[10px] text-muted-foreground w-32 flex-shrink-0">
              {key}
            </span>
            <span className="text-[11px] font-mono text-foreground bg-muted/50 px-1.5 py-0.5 rounded text-[10px]">
              {val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN SHOWCASE PAGE
════════════════════════════════════════════════════════════════ */
export function SidebarShowcase() {
  const [activeRole, setActiveRole] = useState<UserRole>("abstractor");
  const [showCollapsed, setShowCollapsed] = useState(false);
  const roles: UserRole[] = ["abstractor", "qa-reviewer", "auditor", "admin"];

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-cyan-500 rounded-lg flex items-center justify-center">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-bold text-foreground">
              Sidebar Navigation — Design System
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Role-based navigation for the HEDIS Abstractor Platform ·
            NCQA-aligned workflow separation · Desktop-first (1440px) · 8px
            spacing grid
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCollapsed(false)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              !showCollapsed
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Expanded
          </button>
          <button
            onClick={() => setShowCollapsed(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
              showCollapsed
                ? "bg-primary text-white border-primary"
                : "border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Collapsed
          </button>
        </div>
      </div>

      {/* ── Info Banner ── */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Role-Based Visibility:</strong> The sidebar renders different
          navigation items per role, enforcing NCQA operational workflow
          separation (Abstraction → QA Review → Audit & Sampling → Submission).
          Use the
          <strong> role switcher in the sidebar footer</strong> (↺ button) on
          the live sidebar to switch roles and observe nav changes in real-time.
          The 4 previews below show each role's sidebar in the selected state.
        </div>
      </div>

      {/* ── 4 Role Previews Grid ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-foreground">
            {showCollapsed
              ? "Collapsed State (64px) — Icons Only + Tooltips"
              : "Expanded State (240px) — All 4 Role Variations"}
          </h2>
          <span className="text-xs text-muted-foreground">
            {showCollapsed
              ? "Hover icons to see tooltips"
              : "Active item: Dashboard"}
          </span>
        </div>
        <div className="flex flex-wrap gap-6">
          {roles.map((r) => {
            const cfg = ROLE_CONFIG[r];
            return (
              <div key={r} className="flex flex-col gap-3">
                {/* Role label */}
                <div className="flex items-center gap-2">
                  <div
                    className={`w-5 h-5 rounded-full bg-gradient-to-br ${cfg.avatarGradient} flex items-center justify-center`}
                  >
                    <span className="text-white text-[7px] font-bold">
                      {cfg.label.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {cfg.label}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${cfg.badgeClass}`}
                  >
                    Stage {cfg.workflowStep}
                  </span>
                </div>

                {/* Mini sidebar */}
                <MiniSidebar
                  role={r}
                  collapsed={showCollapsed}
                  activeId="dashboard"
                />

                {/* Access summary */}
                <div className="w-full max-w-[210px] bg-muted/30 rounded-xl px-3 py-2 border border-border">
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Visible Nav Items
                  </div>
                  <div className="space-y-1">
                    {[...ALL_NAV, ...SETTINGS_ITEMS]
                      .filter((n) => n.roles.includes(r))
                      .map((n) => {
                        const Icon = n.icon;
                        return (
                          <div
                            key={n.id}
                            className="flex items-center gap-1.5 text-[10px] text-foreground"
                          >
                            <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                            <span>{n.label}</span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Interaction States Demo ── */}
      <StateDemo />

      {/* ── Access Matrix ── */}
      <AccessMatrix />

      {/* ── Spec Cards Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SpecCard
          title="Dimensions"
          items={[
            { key: "Expanded width", val: "240px" },
            { key: "Collapsed width", val: "64px" },
            { key: "Min viewport", val: "1440px" },
            { key: "Spacing grid", val: "8px" },
          ]}
        />
        <SpecCard
          title="Active Item"
          items={[
            { key: "Background", val: "primary/9%" },
            { key: "Left border", val: "3px solid primary" },
            { key: "Label weight", val: "font-semibold" },
            { key: "Icon color", val: "text-primary" },
          ]}
        />
        <SpecCard
          title="Typography"
          items={[
            { key: "Nav label", val: "13px medium" },
            { key: "Group label", val: "9px bold caps" },
            { key: "Footer name", val: "12px semibold" },
            { key: "Role badge", val: "10px bold" },
          ]}
        />
        <SpecCard
          title="Component Parts"
          items={[
            { key: "NavBadge", val: "18px pill" },
            { key: "SidebarTooltip", val: "hover flyout" },
            { key: "WorkflowIndicator", val: "4-stage pipe" },
            { key: "CollapsibleGroup", val: "Settings ▸" },
          ]}
        />
      </div>

      {/* ── Workflow Indicator Explained ── */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20">
          <h3 className="text-sm font-bold text-foreground">
            Workflow Pipeline Indicator
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Contextual pipeline strip shown at top of nav (expanded mode only)
          </p>
        </div>
        <div className="p-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map((r) => {
            const cfg = ROLE_CONFIG[r];
            return (
              <div key={r} className="space-y-2">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${cfg.badgeClass}`}
                >
                  {cfg.label}
                </span>
                <div className="px-3 py-2.5 bg-muted/30 rounded-xl border border-border/50">
                  <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                    Pipeline
                  </div>
                  <div className="flex items-center">
                    {WORKFLOW.map((s, i) => (
                      <div
                        key={s.step}
                        className={`flex items-center ${i < 3 ? "flex-1" : ""}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold flex-shrink-0 ${
                            s.step < cfg.workflowStep
                              ? "bg-emerald-100 text-emerald-700"
                              : s.step === cfg.workflowStep
                                ? "bg-primary text-white"
                                : "bg-muted text-muted-foreground/40"
                          }`}
                        >
                          {s.step < cfg.workflowStep ? "✓" : s.short[0]}
                        </div>
                        {i < 3 && (
                          <div
                            className={`flex-1 h-0.5 mx-0.5 ${s.step < cfg.workflowStep ? "bg-emerald-300" : "bg-muted"}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-1.5 text-[9px] font-semibold text-primary">
                    Active: Stage {cfg.workflowStep}
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {cfg.accessSummary}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Collapsed Mode Spec ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-sm font-bold text-foreground mb-1">
          Collapsed Mode (64px)
        </h3>
        <p className="text-xs text-muted-foreground mb-5">
          Icons only · Hover tooltips · Workflow indicator hidden · Footer shows
          avatar + logout
        </p>
        <div className="flex items-start gap-6 flex-wrap">
          {roles.map((r) => (
            <div key={r} className="flex flex-col items-center gap-2">
              <MiniSidebar role={r} collapsed={true} />
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${ROLE_CONFIG[r].badgeClass}`}
              >
                {ROLE_CONFIG[r].label}
              </span>
            </div>
          ))}
          <div className="flex-1 min-w-[200px] space-y-3">
            <div className="p-4 bg-muted/30 rounded-xl border border-border">
              <div className="text-[11px] font-bold text-foreground mb-2">
                Collapsed Behavior
              </div>
              <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Icons only (w-5 h-5)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Hover tooltip with label + context
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Active item still shows left border
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Chevron → expands on click
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Role-based items still filtered
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  Workflow indicator hidden
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="h-4" />
    </div>
  );
}
