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
  LogOut,
  Lock,
  Building2,
  RefreshCw,
  CheckCircle2,
  Star,
  User,
  Users,
} from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
export type UserRole = "program-manager" | "abstractor" | "qa-analyst";

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  badge?: { count: number; variant: "blue" | "amber" } | null;
  disabled?: boolean;
}

export interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/* ═══════════════════════════════════════════
   NAV DATA
═══════════════════════════════════════════ */
const PRIMARY_NAV: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["program-manager", "abstractor", "qa-analyst"],
  },
  {
    id: "work-queue",
    label: "Work Queue",
    icon: ClipboardList,
    roles: ["program-manager", "abstractor", "qa-analyst"],
    badge: { count: 24, variant: "blue" },
  },
  { id: "clients", label: "Clients", icon: Users, roles: ["program-manager"] },
  {
    id: "audit-sampling",
    label: "Audit & Sampling",
    icon: ShieldCheck,
    roles: ["program-manager"],
    badge: { count: 12, variant: "blue" },
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart2,
    roles: ["program-manager", "abstractor"],
  },
  {
    id: "measure-library",
    label: "Measure Library",
    icon: BookOpen,
    roles: ["program-manager", "abstractor"],
  },
];

const SETTINGS_NAV: NavItem[] = [
  {
    id: "admin-settings",
    label: "Admin",
    icon: UserCog,
    roles: ["program-manager"],
  },
  {
    id: "security",
    label: "System Logs",
    icon: FileText,
    roles: ["program-manager"],
  },
];

/* ═══════════════════════════════════════════
   ROLE CONFIG
═══════════════════════════════════════════ */
export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    badgeClass: string;
    avatarGradient: string;
    description: string;
    workflowStep: number;
    accessSummary: string;
  }
> = {
  "program-manager": {
    label: "Operations / PM",
    badgeClass:
      "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700",
    avatarGradient: "from-violet-500 to-purple-500",
    description: "Operations / Program Manager",
    workflowStep: 3,
    accessSummary: "Full Access — All Modules",
  },
  abstractor: {
    label: "Chart Abstractor",
    badgeClass:
      "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    avatarGradient: "from-blue-500 to-cyan-500",
    description: "Clinical Documentation Specialist",
    workflowStep: 2,
    accessSummary: "Dashboard · Work Queue · Reports · Measures",
  },
  "qa-analyst": {
    label: "Quality Analyst",
    badgeClass:
      "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    avatarGradient: "from-emerald-500 to-teal-500",
    description: "QA & Performance Review",
    workflowStep: 1,
    accessSummary: "Dashboard · Work Queue",
  },
};

/* ═══════════════════════════════════════════
   TOOLTIP (collapsed mode)
═══════════════════════════════════════════ */
function Tooltip({
  label,
  note,
  children,
}: {
  label: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 z-[200] opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-gray-900 text-white rounded-lg px-2.5 py-1.5 whitespace-nowrap shadow-xl flex flex-col gap-0.5">
          <span className="text-[11px] font-medium">{label}</span>
          {note && <span className="text-[10px] text-gray-400">{note}</span>}
        </div>
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-[4px] border-transparent border-r-gray-900" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   BADGE
═══════════════════════════════════════════ */
function Badge({
  count,
  variant,
}: {
  count: number;
  variant: "blue" | "amber";
}) {
  const cls =
    variant === "amber"
      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
      : "bg-primary/12 text-primary";
  return (
    <span
      className={`min-w-[18px] h-[18px] px-1 inline-flex items-center justify-center rounded-full text-[10px] font-bold flex-shrink-0 ${cls}`}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/* ═══════════════════════════════════════════
   NAV ITEM
═══════════════════════════════════════════ */
function NavItem({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const btn = (
    <button
      onClick={item.disabled ? undefined : onClick}
      disabled={item.disabled}
      className={[
        "group w-full flex items-center rounded-md transition-all duration-150 outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        collapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
        /* Active */
        isActive
          ? "bg-primary/[0.08] text-primary dark:bg-primary/20 border-l-2 border-primary pl-[10px]"
          : item.disabled
            ? /* Disabled */
              "opacity-40 cursor-not-allowed text-muted-foreground"
            : /* Default / Hover */
              "border-l-2 border-transparent text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      ].join(" ")}
    >
      <Icon
        className={`flex-shrink-0 ${collapsed ? "w-[18px] h-[18px]" : "w-4 h-4"} ${
          isActive
            ? "text-primary"
            : item.disabled
              ? "text-muted-foreground/40"
              : "text-muted-foreground group-hover:text-foreground"
        } transition-colors`}
      />

      {!collapsed && (
        <>
          <span
            className={`flex-1 text-left truncate ${isActive ? "font-semibold" : "font-medium"}`}
            style={{ fontSize: 13 }}
          >
            {item.label}
          </span>
          {item.badge && !item.disabled && (
            <Badge count={item.badge.count} variant={item.badge.variant} />
          )}
          {item.disabled && (
            <Lock className="w-3 h-3 text-muted-foreground/30 flex-shrink-0" />
          )}
        </>
      )}
    </button>
  );

  return collapsed ? (
    <Tooltip
      label={item.label}
      note={item.badge ? `${item.badge.count} items` : undefined}
    >
      {btn}
    </Tooltip>
  ) : (
    btn
  );
}

/* ═══════════════════════════════════════════
   ROLE PICKER
═══════════════════════════════════════════ */
function RolePicker({
  current,
  onSelect,
  onClose,
}: {
  current: UserRole;
  onSelect: (r: UserRole) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <div className="absolute bottom-full left-0 right-0 mb-1 z-[101] bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        <div className="px-3 py-2.5 border-b border-border">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Switch Role
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Demo — changes nav visibility
          </p>
        </div>
        {(Object.keys(ROLE_CONFIG) as UserRole[]).map((r) => {
          const cfg = ROLE_CONFIG[r];
          const sel = r === current;
          return (
            <button
              key={r}
              onClick={() => {
                onSelect(r);
                onClose();
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent transition-colors ${sel ? "bg-primary/5" : ""}`}
            >
              <div
                className={`w-6 h-6 rounded-full bg-gradient-to-br ${cfg.avatarGradient} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-[8px] font-bold">
                  {cfg.label.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`text-xs font-semibold ${sel ? "text-primary" : "text-foreground"}`}
                >
                  {cfg.label}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {cfg.accessSummary}
                </p>
              </div>
              {sel && (
                <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   SECTION LABEL
═══════════════════════════════════════════ */
function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="px-3 pt-4 pb-2 select-none"
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}
    >
      <span className="text-muted-foreground/50">{label}</span>
    </p>
  );
}

/* ═══════════════════════════════════════════
   DIVIDER
═══════════════════════════════════════════ */
function Divider({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`${collapsed ? "mx-3" : "mx-2"} border-t border-sidebar-border`}
    />
  );
}

/* ═══════════════════════════════════════════
   MAIN SIDEBAR
═══════════════════════════════════════════ */
export function Sidebar({
  activeView,
  onViewChange,
  role,
  onRoleChange,
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  const cfg = ROLE_CONFIG[role];
  const visiblePrimary = PRIMARY_NAV.filter((n) => n.roles.includes(role));
  const visibleSettings = SETTINGS_NAV.filter((n) => n.roles.includes(role));

  const navigate = useNavigate();

  const collapse = () => {
    setCollapsed(true);
    setShowRolePicker(false);
  };
  const expand = () => setCollapsed(false);

  const handleNav = (id: string) => {
    onViewChange(id);
    onMobileClose?.();
  };

  return (
    <aside
      className={[
        "fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto h-screen",
        "flex flex-col bg-sidebar border-r border-sidebar-border",
        "transition-all duration-250 ease-in-out flex-shrink-0 shadow-xl lg:shadow-none",
        collapsed ? "lg:w-16 w-16" : "lg:w-60 w-60",
        mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      ].join(" ")}
    >
      {/* ── TOP SECTION ────────────────────────────── */}
      <div
        className={`flex items-center flex-shrink-0 border-b border-sidebar-border ${collapsed ? "flex-col gap-2 px-3 py-4" : "gap-2.5 px-4 py-[13px]"}`}
      >
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <span
            className="text-white font-bold select-none"
            style={{ fontSize: 11, letterSpacing: "-0.02em" }}
          >
            HA
          </span>
        </div>

        {/* Org name */}
        {!collapsed && (
          <div className="flex-1 min-w-0 overflow-hidden">
            <p
              className="font-bold text-sidebar-foreground truncate leading-tight"
              style={{ fontSize: 13 }}
            >
              HEDIS Abstractor
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <Building2 className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
              <p
                className="text-muted-foreground truncate"
                style={{ fontSize: 10 }}
              >
                Apollo Health System
              </p>
            </div>
          </div>
        )}

        {/* Collapse / expand button */}
        {collapsed ? (
          <button
            onClick={expand}
            title="Expand sidebar"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={collapse}
            title="Collapse sidebar"
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-sidebar-accent transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── PRIMARY NAVIGATION ─────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2 pt-3 pb-2" style={{ gap: 0 }}>
        {/* Nav items — 16px gap via py-2 + space-y-1 */}
        <div className="space-y-1">
          {visiblePrimary.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              isActive={
                activeView === item.id ||
                (item.id === "start-coding" && activeView === "abstraction")
              }
              collapsed={collapsed}
              onClick={() => {
                handleNav(item.id);
                navigate({ to: `/${item.id}` });
              }}
            />
          ))}
        </div>

        {/* ── SETTINGS SECTION ───────────────────── */}
        {visibleSettings.length > 0 && (
          <>
            <Divider collapsed={collapsed} />

            {/* "SETTINGS" section label — hidden when collapsed */}
            {!collapsed && <SectionLabel label="Settings" />}

            <div className="space-y-1">
              {visibleSettings.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={activeView === item.id}
                  collapsed={collapsed}
                  onClick={() => handleNav(item.id)}
                />
              ))}
            </div>
          </>
        )}
      </nav>

      {/* ── FOOTER ─────────────────────────────────── */}
      <div className="relative border-t border-sidebar-border flex-shrink-0">
        {/* Role picker popover */}
        {showRolePicker && !collapsed && (
          <RolePicker
            current={role}
            onSelect={(r) => {
              onRoleChange(r);
              setShowRolePicker(false);
            }}
            onClose={() => setShowRolePicker(false)}
          />
        )}

        {collapsed ? (
          /* Collapsed footer */
          <div className="flex flex-col items-center gap-2 py-3 px-2">
            <Tooltip label="Sarah Johnson, RHIA" note={cfg.label}>
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.avatarGradient} flex items-center justify-center cursor-pointer shadow-sm`}
              >
                <span
                  className="text-white font-bold select-none"
                  style={{ fontSize: 10 }}
                >
                  SJ
                </span>
              </div>
            </Tooltip>
            <Tooltip label="Sign Out">
              <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-sidebar-accent transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        ) : (
          /* Expanded footer */
          <div className="px-3 py-3 space-y-3">
            {/* User row */}
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${cfg.avatarGradient} flex items-center justify-center flex-shrink-0 shadow-sm`}
              >
                <span
                  className="text-white font-bold select-none"
                  style={{ fontSize: 10 }}
                >
                  SJ
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-foreground truncate leading-tight"
                  style={{ fontSize: 12 }}
                >
                  Sarah Johnson, RHIA
                </p>
                <p
                  className="text-muted-foreground truncate mt-0.5"
                  style={{ fontSize: 10 }}
                >
                  {cfg.description}
                </p>
              </div>
              {/* Role switcher */}
              <button
                onClick={() => setShowRolePicker((v) => !v)}
                title="Switch role"
                className={`p-1.5 rounded-md transition-colors flex-shrink-0 ${showRolePicker ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"}`}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Role badge + plan */}
            <div className="flex items-center justify-between">
              <span
                className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cfg.badgeClass}`}
              >
                {cfg.label}
              </span>
              <span
                className="flex items-center gap-1 text-muted-foreground"
                style={{ fontSize: 10 }}
              >
                <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                Enterprise
              </span>
            </div>

            {/* Status row */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
              <span
                className="text-emerald-700 dark:text-emerald-300 font-medium flex-1 truncate"
                style={{ fontSize: 10 }}
              >
                NCQA HEDIS MY2026 · Hybrid
              </span>
            </div>

            {/* Logout */}
            <button
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
              style={{ fontSize: 12 }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
