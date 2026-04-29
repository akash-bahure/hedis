import { useState, useMemo } from "react";
import {
  Users,
  Shield,
  Sparkles,
  Settings,
  BarChart2,
  FolderKanban,
  FileText,
  ClipboardList,
  Code2,
  ClipboardCheck,
  AlertCircle,
  FileBarChart,
  TrendingUp,
  Plus,
  Search,
  Download,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Smartphone,
  Globe,
  Lock,
  Mail,
  Phone,
  MapPin,
  Calendar,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  UserPlus,
  X,
  Check,
  Info,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  UserCog,
  Building2,
  Briefcase,
  LogIn,
  UserCheck,
  ToggleLeft,
  Tag,
  Layers,
  MoreHorizontal,
  Star,
  ChevronUp,
  Activity,
  Filter,
  UserX,
  LayoutDashboard,
  ClipboardPen,
} from "lucide-react";

/* ════════════════════════════════════════════  TYPES  */
type ViewTab = "users" | "roles" | "projects" | "shifts";
type RoleId =
  | "super-admin"
  | "admin"
  | "project-manager"
  | "senior-coder"
  | "coder"
  | "senior-auditor"
  | "auditor"
  | "junior-auditor"
  | "read-only";
type StatusVal = "active" | "inactive" | "suspended";
type ShiftType = "Morning" | "Afternoon" | "Night" | "General" | "Off";

interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: RoleId;
  roleName: string;
  department: string;
  employeeId: string;
  phone: string;
  manager: string;
  location: string;
  projects: string[];
  status: StatusVal;
  lastLogin: string;
  twoFA: boolean;
  sso: boolean;
  sessionTimeout: number;
  created: string;
  shift: ShiftType;
  shiftHours: string;
}

/* ════════════════════════════════════════════  DATA  */
const ROLE_META: Record<
  RoleId,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    textColor: string;
    userCount: number;
    desc: string;
    level: number;
  }
> = {
  "super-admin": {
    label: "Super Admin",
    color: "#ef4444",
    bg: "bg-red-50",
    border: "border-red-200",
    textColor: "text-red-700",
    userCount: 1,
    desc: "Unrestricted access to all system modules and configuration.",
    level: 1,
  },
  admin: {
    label: "Admin",
    color: "#8b5cf6",
    bg: "bg-violet-50",
    border: "border-violet-200",
    textColor: "text-violet-700",
    userCount: 2,
    desc: "Full administrative access; excludes security policy management.",
    level: 2,
  },
  "project-manager": {
    label: "Project Manager",
    color: "#2563eb",
    bg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-700",
    userCount: 3,
    desc: "Manage project lifecycle, assign coders, and review team performance.",
    level: 3,
  },
  "senior-coder": {
    label: "Senior Coder",
    color: "#0891b2",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
    textColor: "text-cyan-700",
    userCount: 2,
    desc: "Code charts, review AI suggestions, and mentor junior coders.",
    level: 4,
  },
  coder: {
    label: "Coder",
    color: "#10b981",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    textColor: "text-emerald-700",
    userCount: 7,
    desc: "Access and code assigned charts; limited reporting visibility.",
    level: 5,
  },
  "senior-auditor": {
    label: "Senior Auditor",
    color: "#f59e0b",
    bg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-700",
    userCount: 1,
    desc: "Full audit capability including overrides, escalation, and exception management.",
    level: 4,
  },
  auditor: {
    label: "Auditor (L2)",
    color: "#f97316",
    bg: "bg-orange-50",
    border: "border-orange-200",
    textColor: "text-orange-700",
    userCount: 2,
    desc: "Review and validate coded charts, raise and manage exceptions.",
    level: 5,
  },
  "junior-auditor": {
    label: "Junior Auditor",
    color: "#64748b",
    bg: "bg-slate-100",
    border: "border-slate-200",
    textColor: "text-slate-600",
    userCount: 2,
    desc: "View assigned charts and flag issues for senior auditor review.",
    level: 6,
  },
  "read-only": {
    label: "Read Only",
    color: "#94a3b8",
    bg: "bg-slate-50",
    border: "border-slate-200",
    textColor: "text-slate-500",
    userCount: 1,
    desc: "View-only access to dashboards and published reports.",
    level: 7,
  },
};

const MODULES = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Main" },
  { id: "projects", label: "Projects", icon: FolderKanban, group: "Main" },
  { id: "patients", label: "Patients & Charts", icon: FileText, group: "Main" },
  { id: "workqueue", label: "Work Queue", icon: ClipboardList, group: "Main" },
  { id: "coding", label: "Coding", icon: Code2, group: "Operations" },
  {
    id: "auditing",
    label: "Auditing",
    icon: ClipboardCheck,
    group: "Operations",
  },
  {
    id: "exceptions",
    label: "Exceptions",
    icon: AlertCircle,
    group: "Operations",
  },
  { id: "reports", label: "Reports", icon: FileBarChart, group: "Insights" },
  { id: "analytics", label: "Analytics", icon: TrendingUp, group: "Insights" },
  { id: "users", label: "Users & Roles", icon: Users, group: "Administration" },
  {
    id: "security",
    label: "Security & Compliance",
    icon: Shield,
    group: "Administration",
  },
  {
    id: "ai-optim",
    label: "AI Optimization",
    icon: Sparkles,
    group: "Administration",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    group: "Administration",
  },
];

const ACTIONS = [
  {
    id: "view",
    label: "View",
    abbr: "View",
    tip: "Read-only access to module content",
  },
  {
    id: "edit",
    label: "Edit",
    abbr: "Edit",
    tip: "Create and modify records within the module",
  },
  {
    id: "assign",
    label: "Assign",
    abbr: "Assign",
    tip: "Assign users, charts or tasks within the module",
  },
  {
    id: "approve",
    label: "Approve",
    abbr: "Appr.",
    tip: "Approve completed work items or submissions",
  },
  {
    id: "reject",
    label: "Reject",
    abbr: "Reject",
    tip: "Reject and return work items for correction",
  },
  {
    id: "export",
    label: "Export",
    abbr: "Export",
    tip: "Export data as CSV, PDF or external formats",
  },
  {
    id: "override",
    label: "Override",
    abbr: "Ovrd.",
    tip: "Override AI suggestions or system decisions",
  },
];

// Cells where action simply doesn't apply to module
const NA_ACTIONS: Record<string, string[]> = {
  dashboard: ["assign", "approve", "reject", "override"],
  projects: ["approve", "reject", "override"],
  patients: ["approve", "reject", "override"],
  workqueue: ["approve", "reject", "override"],
  coding: ["assign"],
  auditing: ["assign"],
  exceptions: ["override"],
  reports: ["assign", "approve", "reject", "override"],
  analytics: ["assign", "approve", "reject", "override"],
  users: ["approve", "reject", "override"],
  security: ["assign", "approve", "reject", "override"],
  "ai-optim": ["assign", "approve", "reject"],
  settings: ["assign", "approve", "reject", "override"],
};

/* Default permissions: role → module → actions[] */
const ROLE_DEFAULTS: Record<RoleId, Record<string, string[]>> = {
  "super-admin": {
    dashboard: ["view", "export"],
    projects: ["view", "edit", "assign", "export"],
    patients: ["view", "edit", "assign", "export"],
    workqueue: ["view", "edit", "assign", "export"],
    coding: ["view", "edit", "approve", "reject", "export", "override"],
    auditing: ["view", "edit", "approve", "reject", "export", "override"],
    exceptions: ["view", "edit", "assign", "approve", "reject", "export"],
    reports: ["view", "edit", "export"],
    analytics: ["view", "edit", "export"],
    users: ["view", "edit", "assign", "export"],
    security: ["view", "edit", "export"],
    "ai-optim": ["view", "edit", "override", "export"],
    settings: ["view", "edit", "export"],
  },
  admin: {
    dashboard: ["view", "export"],
    projects: ["view", "edit", "assign", "export"],
    patients: ["view", "edit", "assign", "export"],
    workqueue: ["view", "edit", "assign", "export"],
    coding: ["view", "edit", "approve", "reject", "export", "override"],
    auditing: ["view", "edit", "approve", "reject", "export", "override"],
    exceptions: ["view", "edit", "assign", "approve", "reject", "export"],
    reports: ["view", "edit", "export"],
    analytics: ["view", "edit", "export"],
    users: ["view", "edit", "assign", "export"],
    security: ["view", "export"],
    "ai-optim": ["view", "edit", "export"],
    settings: ["view", "edit", "export"],
  },
  "project-manager": {
    dashboard: ["view", "export"],
    projects: ["view", "edit", "assign", "export"],
    patients: ["view", "assign", "export"],
    workqueue: ["view", "edit", "assign", "export"],
    coding: ["view", "export"],
    auditing: ["view", "export"],
    exceptions: ["view", "assign", "export"],
    reports: ["view", "export"],
    analytics: ["view", "export"],
    users: ["view"],
    security: [],
    "ai-optim": ["view"],
    settings: ["view"],
  },
  "senior-coder": {
    dashboard: ["view"],
    projects: ["view"],
    patients: ["view", "edit"],
    workqueue: ["view", "edit"],
    coding: ["view", "edit", "approve", "reject", "export"],
    auditing: ["view"],
    exceptions: ["view"],
    reports: ["view", "export"],
    analytics: ["view"],
    users: [],
    security: [],
    "ai-optim": ["view"],
    settings: [],
  },
  coder: {
    dashboard: ["view"],
    projects: ["view"],
    patients: ["view"],
    workqueue: ["view", "edit"],
    coding: ["view", "edit"],
    auditing: [],
    exceptions: [],
    reports: ["view"],
    analytics: [],
    users: [],
    security: [],
    "ai-optim": [],
    settings: [],
  },
  "senior-auditor": {
    dashboard: ["view"],
    projects: ["view"],
    patients: ["view", "edit"],
    workqueue: ["view"],
    coding: ["view", "edit"],
    auditing: ["view", "edit", "approve", "reject", "export", "override"],
    exceptions: ["view", "edit", "assign", "approve", "reject", "export"],
    reports: ["view", "export"],
    analytics: ["view", "export"],
    users: [],
    security: [],
    "ai-optim": ["view"],
    settings: [],
  },
  auditor: {
    dashboard: ["view"],
    projects: ["view"],
    patients: ["view"],
    workqueue: ["view"],
    coding: ["view"],
    auditing: ["view", "edit", "approve", "reject"],
    exceptions: ["view", "edit"],
    reports: ["view"],
    analytics: ["view"],
    users: [],
    security: [],
    "ai-optim": [],
    settings: [],
  },
  "junior-auditor": {
    dashboard: ["view"],
    projects: ["view"],
    patients: ["view"],
    workqueue: ["view"],
    coding: ["view"],
    auditing: ["view"],
    exceptions: ["view"],
    reports: ["view"],
    analytics: [],
    users: [],
    security: [],
    "ai-optim": [],
    settings: [],
  },
  "read-only": {
    dashboard: ["view"],
    projects: ["view"],
    patients: [],
    workqueue: [],
    coding: [],
    auditing: [],
    exceptions: [],
    reports: ["view"],
    analytics: ["view"],
    users: [],
    security: [],
    "ai-optim": [],
    settings: [],
  },
};

function buildPermState() {
  const s: Record<string, Record<string, boolean>> = {};
  for (const roleId of Object.keys(ROLE_DEFAULTS) as RoleId[]) {
    s[roleId] = {};
    for (const mod of MODULES) {
      for (const act of ACTIONS) {
        s[roleId][`${mod.id}:${act.id}`] = (
          ROLE_DEFAULTS[roleId][mod.id] ?? []
        ).includes(act.id);
      }
    }
  }
  return s;
}

const PROJECTS_LIST = [
  "Apollo Inpatient FY26",
  "Max Healthcare Q1",
  "Fortis Cardiology FY26",
  "AIIMS Oncology FY26",
  "Manipal General FY26",
];
const SHIFTS_LIST: ShiftType[] = [
  "Morning",
  "Afternoon",
  "Night",
  "General",
  "Off",
];

const USERS_DATA: User[] = [
  {
    id: "U001",
    name: "Sarah Mitchell",
    initials: "SM",
    email: "sarah.mitchell@healthsys.com",
    role: "admin",
    roleName: "Admin",
    department: "HIM Administration",
    employeeId: "EMP-0041",
    phone: "+91 98765 43210",
    manager: "Dr. Priya Nair",
    location: "Mumbai HQ",
    projects: ["All Projects"],
    status: "active",
    lastLogin: "20 Feb 2026, 09:42 IST",
    twoFA: true,
    sso: true,
    sessionTimeout: 60,
    created: "12 Jan 2024",
    shift: "General",
    shiftHours: "09:00–18:00",
  },
  {
    id: "U002",
    name: "Rajesh Kumar",
    initials: "RK",
    email: "rajesh.kumar@healthsys.com",
    role: "project-manager",
    roleName: "Project Manager",
    department: "Operations",
    employeeId: "EMP-0052",
    phone: "+91 98765 11223",
    manager: "Sarah Mitchell",
    location: "Mumbai HQ",
    projects: [
      "Apollo Inpatient FY26",
      "Max Healthcare Q1",
      "Fortis Cardiology FY26",
    ],
    status: "active",
    lastLogin: "20 Feb 2026, 08:15 IST",
    twoFA: true,
    sso: true,
    sessionTimeout: 60,
    created: "15 Mar 2024",
    shift: "General",
    shiftHours: "09:00–18:00",
  },
  {
    id: "U003",
    name: "Ankit Sharma",
    initials: "AS",
    email: "ankit.sharma@healthsys.com",
    role: "senior-coder",
    roleName: "Senior Coder",
    department: "Coding Team A",
    employeeId: "EMP-0067",
    phone: "+91 97777 88801",
    manager: "Rajesh Kumar",
    location: "Pune",
    projects: ["Apollo Inpatient FY26"],
    status: "active",
    lastLogin: "20 Feb 2026, 07:58 IST",
    twoFA: true,
    sso: false,
    sessionTimeout: 30,
    created: "05 Apr 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U004",
    name: "Priti Gupta",
    initials: "PG",
    email: "priti.gupta@healthsys.com",
    role: "coder",
    roleName: "Coder",
    department: "Coding Team A",
    employeeId: "EMP-0068",
    phone: "+91 97777 88802",
    manager: "Ankit Sharma",
    location: "Pune",
    projects: ["Apollo Inpatient FY26", "Max Healthcare Q1"],
    status: "active",
    lastLogin: "20 Feb 2026, 08:34 IST",
    twoFA: true,
    sso: false,
    sessionTimeout: 30,
    created: "05 Apr 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U005",
    name: "Rahul Verma",
    initials: "RV",
    email: "rahul.verma@healthsys.com",
    role: "coder",
    roleName: "Coder",
    department: "Coding Team A",
    employeeId: "EMP-0069",
    phone: "+91 97777 88803",
    manager: "Ankit Sharma",
    location: "Pune",
    projects: ["Max Healthcare Q1", "Manipal General FY26"],
    status: "active",
    lastLogin: "19 Feb 2026, 17:22 IST",
    twoFA: false,
    sso: false,
    sessionTimeout: 30,
    created: "05 Apr 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U006",
    name: "Sunita Patel",
    initials: "SP",
    email: "sunita.patel@healthsys.com",
    role: "senior-coder",
    roleName: "Senior Coder",
    department: "Coding Team B",
    employeeId: "EMP-0074",
    phone: "+91 97777 99901",
    manager: "Rajesh Kumar",
    location: "Delhi",
    projects: ["Fortis Cardiology FY26", "AIIMS Oncology FY26"],
    status: "active",
    lastLogin: "20 Feb 2026, 08:10 IST",
    twoFA: true,
    sso: false,
    sessionTimeout: 30,
    created: "12 May 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U007",
    name: "Kavita Rao",
    initials: "KR",
    email: "kavita.rao@healthsys.com",
    role: "coder",
    roleName: "Coder",
    department: "Coding Team B",
    employeeId: "EMP-0075",
    phone: "+91 97777 99902",
    manager: "Sunita Patel",
    location: "Delhi",
    projects: ["AIIMS Oncology FY26"],
    status: "active",
    lastLogin: "18 Feb 2026, 14:11 IST",
    twoFA: false,
    sso: false,
    sessionTimeout: 30,
    created: "12 May 2024",
    shift: "Afternoon",
    shiftHours: "14:00–22:00",
  },
  {
    id: "U008",
    name: "Mohammed Irfan",
    initials: "MI",
    email: "m.irfan@healthsys.com",
    role: "coder",
    roleName: "Coder",
    department: "Coding Team B",
    employeeId: "EMP-0076",
    phone: "+91 97777 99903",
    manager: "Sunita Patel",
    location: "Delhi",
    projects: ["Apollo Inpatient FY26", "Fortis Cardiology FY26"],
    status: "active",
    lastLogin: "20 Feb 2026, 08:51 IST",
    twoFA: true,
    sso: false,
    sessionTimeout: 30,
    created: "12 May 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U009",
    name: "Deepa Nair",
    initials: "DN",
    email: "deepa.nair@healthsys.com",
    role: "coder",
    roleName: "Coder",
    department: "Coding Team C",
    employeeId: "EMP-0081",
    phone: "+91 95555 12301",
    manager: "Ankit Sharma",
    location: "Bangalore",
    projects: ["Manipal General FY26", "Max Healthcare Q1"],
    status: "active",
    lastLogin: "20 Feb 2026, 09:02 IST",
    twoFA: false,
    sso: false,
    sessionTimeout: 30,
    created: "01 Jun 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U010",
    name: "Shruti Mehta",
    initials: "SM",
    email: "shruti.mehta@healthsys.com",
    role: "senior-auditor",
    roleName: "Senior Auditor",
    department: "Auditing & QA",
    employeeId: "EMP-0048",
    phone: "+91 98765 55501",
    manager: "Sarah Mitchell",
    location: "Mumbai HQ",
    projects: ["All Projects"],
    status: "active",
    lastLogin: "20 Feb 2026, 09:15 IST",
    twoFA: true,
    sso: true,
    sessionTimeout: 60,
    created: "20 Feb 2024",
    shift: "General",
    shiftHours: "09:00–18:00",
  },
  {
    id: "U011",
    name: "Vinod Kumar",
    initials: "VK",
    email: "vinod.kumar@healthsys.com",
    role: "auditor",
    roleName: "Auditor (L2)",
    department: "Auditing & QA",
    employeeId: "EMP-0071",
    phone: "+91 98765 55502",
    manager: "Shruti Mehta",
    location: "Mumbai HQ",
    projects: [
      "Apollo Inpatient FY26",
      "Fortis Cardiology FY26",
      "Max Healthcare Q1",
    ],
    status: "active",
    lastLogin: "20 Feb 2026, 08:44 IST",
    twoFA: true,
    sso: false,
    sessionTimeout: 30,
    created: "01 May 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U012",
    name: "Leena Prasad",
    initials: "LP",
    email: "leena.prasad@healthsys.com",
    role: "auditor",
    roleName: "Auditor (L2)",
    department: "Auditing & QA",
    employeeId: "EMP-0072",
    phone: "+91 98765 55503",
    manager: "Shruti Mehta",
    location: "Bangalore",
    projects: ["AIIMS Oncology FY26", "Manipal General FY26"],
    status: "active",
    lastLogin: "19 Feb 2026, 16:30 IST",
    twoFA: false,
    sso: false,
    sessionTimeout: 30,
    created: "01 May 2024",
    shift: "General",
    shiftHours: "09:00–18:00",
  },
  {
    id: "U013",
    name: "Arjun Mishra",
    initials: "AM",
    email: "arjun.mishra@healthsys.com",
    role: "junior-auditor",
    roleName: "Junior Auditor",
    department: "Auditing & QA",
    employeeId: "EMP-0091",
    phone: "+91 91111 22201",
    manager: "Vinod Kumar",
    location: "Pune",
    projects: ["Apollo Inpatient FY26"],
    status: "inactive",
    lastLogin: "14 Feb 2026, 11:22 IST",
    twoFA: false,
    sso: false,
    sessionTimeout: 30,
    created: "01 Aug 2024",
    shift: "Afternoon",
    shiftHours: "14:00–22:00",
  },
  {
    id: "U014",
    name: "Pooja Rao",
    initials: "PR",
    email: "pooja.rao@healthsys.com",
    role: "junior-auditor",
    roleName: "Junior Auditor",
    department: "Auditing & QA",
    employeeId: "EMP-0092",
    phone: "+91 91111 22202",
    manager: "Vinod Kumar",
    location: "Mumbai HQ",
    projects: ["Max Healthcare Q1", "Fortis Cardiology FY26"],
    status: "active",
    lastLogin: "20 Feb 2026, 09:33 IST",
    twoFA: true,
    sso: false,
    sessionTimeout: 30,
    created: "01 Aug 2024",
    shift: "Morning",
    shiftHours: "08:00–16:00",
  },
  {
    id: "U015",
    name: "Nikhil Desai",
    initials: "ND",
    email: "nikhil.desai@healthsys.com",
    role: "read-only",
    roleName: "Read Only",
    department: "Compliance",
    employeeId: "EMP-0105",
    phone: "+91 90000 11101",
    manager: "Sarah Mitchell",
    location: "Mumbai HQ",
    projects: ["All Projects"],
    status: "active",
    lastLogin: "17 Feb 2026, 15:00 IST",
    twoFA: false,
    sso: false,
    sessionTimeout: 30,
    created: "10 Oct 2024",
    shift: "General",
    shiftHours: "09:00–18:00",
  },
];

// Project access matrix: userId → projectName → access level
type AccessLevel = "full" | "edit" | "view" | "none";
const initProjectAccess = (): Record<string, Record<string, AccessLevel>> => {
  const a: Record<string, Record<string, AccessLevel>> = {};
  USERS_DATA.forEach((u) => {
    a[u.id] = {};
    PROJECTS_LIST.forEach((p) => {
      if (u.projects.includes("All Projects") || u.projects.includes(p)) {
        a[u.id][p] =
          u.role === "admin" ||
          u.role === "super-admin" ||
          u.role === "project-manager"
            ? "full"
            : u.role === "senior-coder" || u.role === "senior-auditor"
              ? "edit"
              : "view";
      } else {
        a[u.id][p] = "none";
      }
    });
  });
  return a;
};

// Shift schedule: userId → 'Mon'|'Tue'|... → ShiftType
const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
type WeekDay = (typeof WEEK_DAYS)[number];
const initShiftSchedule = (): Record<string, Record<WeekDay, ShiftType>> => {
  const s: Record<string, Record<WeekDay, ShiftType>> = {};
  USERS_DATA.forEach((u) => {
    s[u.id] = {} as Record<WeekDay, ShiftType>;
    WEEK_DAYS.forEach((d, di) => {
      if (di >= 5) {
        s[u.id][d] = "Off";
      } else {
        s[u.id][d] = u.shift === "Off" ? "Off" : u.shift;
      }
    });
  });
  return s;
};

/* ════════════════════════════════════════════  SMALL COMPONENTS  */
function StatusBadge({ status }: { status: StatusVal }) {
  const cfg = {
    active: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
    },
    inactive: {
      bg: "bg-slate-100",
      border: "border-slate-200",
      text: "text-slate-500",
      dot: "bg-slate-400",
    },
    suspended: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      dot: "bg-red-500",
    },
  }[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function RoleBadge({
  roleId,
  small = false,
}: {
  roleId: RoleId;
  small?: boolean;
}) {
  const m = ROLE_META[roleId];
  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${m.bg} ${m.border} ${m.textColor} ${small ? "px-1.5 py-0 text-[9px]" : "px-2 py-0.5 text-[10px]"}`}
    >
      {m.label}
    </span>
  );
}

function Toggle({
  on,
  onChange,
  disabled = false,
  size = "sm",
}: {
  on: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) {
  const w = size === "md" ? "w-10 h-6" : "w-8 h-[18px]";
  const dotS = size === "md" ? "w-5 h-5" : "w-[14px] h-[14px]";
  const onOffset = size === "md" ? "translate-x-[18px]" : "translate-x-[14px]";
  return (
    <button
      onClick={!disabled ? onChange : undefined}
      type="button"
      className={`relative ${w} rounded-full flex-shrink-0 transition-colors focus:outline-none ${
        disabled
          ? "cursor-not-allowed opacity-40 bg-muted"
          : on
            ? "bg-primary cursor-pointer"
            : "bg-slate-200 cursor-pointer hover:bg-slate-300"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 ${dotS} bg-white rounded-full shadow-sm transition-transform ${on ? onOffset : "translate-x-0"}`}
      />
    </button>
  );
}

function Avatar({
  initials,
  color = "bg-primary/10",
  textColor = "text-primary",
  size = 8,
}: {
  initials: string;
  color?: string;
  textColor?: string;
  size?: number;
}) {
  const sz =
    size === 8
      ? "w-8 h-8 text-[11px]"
      : size === 10
        ? "w-10 h-10 text-xs"
        : size === 12
          ? "w-12 h-12 text-sm"
          : "w-7 h-7 text-[10px]";
  return (
    <div
      className={`${sz} ${color} ${textColor} rounded-full flex items-center justify-center font-black flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function SectionBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      {children}
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      <Icon className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <span className="text-[10px] text-muted-foreground w-28 flex-shrink-0">
        {label}
      </span>
      <span
        className={`text-[11px] font-semibold text-foreground flex-1 ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}

function ShiftChip({ shift }: { shift: ShiftType }) {
  const c: Record<ShiftType, string> = {
    Morning: "bg-blue-50 text-blue-700 border-blue-200",
    Afternoon: "bg-amber-50 text-amber-700 border-amber-200",
    Night: "bg-violet-50 text-violet-700 border-violet-200",
    General: "bg-teal-50 text-teal-700 border-teal-200",
    Off: "bg-slate-100 text-slate-500 border-slate-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${c[shift]}`}
    >
      {shift}
    </span>
  );
}

function AccessChip({
  level,
  onChange,
}: {
  level: AccessLevel;
  onChange: (l: AccessLevel) => void;
}) {
  const c: Record<AccessLevel, string> = {
    full: "bg-emerald-50 text-emerald-700 border-emerald-200",
    edit: "bg-blue-50 text-blue-700 border-blue-200",
    view: "bg-slate-100 text-slate-600 border-slate-200",
    none: "bg-red-50 text-red-400 border-red-200",
  };
  const opts: AccessLevel[] = ["full", "edit", "view", "none"];
  return (
    <select
      value={level}
      onChange={(e) => onChange(e.target.value as AccessLevel)}
      className={`text-[9px] font-bold px-1.5 py-1 rounded-md border appearance-none cursor-pointer bg-transparent ${c[level]}`}
    >
      {opts.map((o) => (
        <option key={o} value={o}>
          {o.charAt(0).toUpperCase() + o.slice(1)}
        </option>
      ))}
    </select>
  );
}

/* ════════════════════════════════════════════  USER PROFILE SLIDE-OVER  */
function UserProfile({
  user,
  onClose,
  onEditRole,
}: {
  user: User;
  onClose: () => void;
  onEditRole?: () => void;
}) {
  const [showActivity, setShowActivity] = useState(false);
  const [localTwoFA, setLocalTwoFA] = useState(user.twoFA);
  const [localSso, setLocalSso] = useState(user.sso);
  const rm = ROLE_META[user.role];
  const activity = [
    { action: "Logged in via SSO", time: "20 Feb 2026, 09:42", icon: LogIn },
    {
      action: "Coded chart CHT-78421 (Apollo)",
      time: "20 Feb 2026, 09:55",
      icon: Code2,
    },
    {
      action: "AI suggestion accepted ×14",
      time: "20 Feb 2026, 10:11",
      icon: Sparkles,
    },
    {
      action: "Chart CHT-78399 submitted",
      time: "19 Feb 2026, 16:48",
      icon: CheckCircle2,
    },
    { action: "Password changed", time: "14 Feb 2026, 11:05", icon: Key },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-full max-w-[500px] bg-card shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary/8 via-primary/4 to-transparent border-b border-border px-6 py-5 flex-shrink-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar
                initials={user.initials}
                color="bg-primary/15"
                textColor="text-primary"
                size={12}
              />
              <div>
                <h3 className="text-sm font-black text-foreground">
                  {user.name}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge roleId={user.role} />
                  <StatusBadge status={user.status} />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl hover:bg-muted flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Employee ID", value: user.employeeId },
              { label: "Department", value: user.department.split(" ")[0] },
              { label: "Location", value: user.location },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-card/70 rounded-xl p-2 text-center border border-border/50"
              >
                <div className="text-[10px] font-black text-foreground">
                  {s.value}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-1">
          {/* Account Info */}
          <SectionBlock title="Account Information">
            <div className="bg-muted/20 rounded-xl px-3 py-1 border border-border/50">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Phone} label="Phone" value={user.phone} />
              <InfoRow
                icon={Building2}
                label="Department"
                value={user.department}
              />
              <InfoRow icon={UserCheck} label="Manager" value={user.manager} />
              <InfoRow icon={MapPin} label="Location" value={user.location} />
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={user.created}
              />
              <InfoRow
                icon={Tag}
                label="Employee ID"
                value={user.employeeId}
                mono
              />
            </div>
          </SectionBlock>

          {/* Role & Permissions */}
          <SectionBlock title="Role & Permissions">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/10 mb-2">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: rm.color + "20" }}
              >
                <UserCog className="w-4 h-4" style={{ color: rm.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground">
                    {rm.label}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Level {rm.level}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight truncate">
                  {rm.desc}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "View", on: true },
                {
                  label: "Edit",
                  on: [
                    "admin",
                    "super-admin",
                    "project-manager",
                    "senior-coder",
                  ].includes(user.role),
                },
                {
                  label: "Approve",
                  on: [
                    "admin",
                    "super-admin",
                    "senior-coder",
                    "senior-auditor",
                    "auditor",
                  ].includes(user.role),
                },
                {
                  label: "Export",
                  on: [
                    "admin",
                    "super-admin",
                    "project-manager",
                    "senior-coder",
                    "senior-auditor",
                  ].includes(user.role),
                },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[9px] font-bold ${p.on ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-muted border-border text-muted-foreground"}`}
                >
                  {p.on ? (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5" />
                  )}
                  {p.label}
                </div>
              ))}
            </div>
          </SectionBlock>

          {/* Project Access */}
          <SectionBlock title="Project Access">
            <div className="space-y-1.5">
              {PROJECTS_LIST.map((p) => {
                const hasAccess =
                  user.projects.includes("All Projects") ||
                  user.projects.includes(p);
                return (
                  <div
                    key={p}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border ${hasAccess ? "bg-card border-border" : "bg-muted/10 border-border/50"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${hasAccess ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                    <span
                      className={`text-[11px] font-semibold flex-1 ${hasAccess ? "text-foreground" : "text-muted-foreground"}`}
                    >
                      {p}
                    </span>
                    {hasAccess ? (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                        {["admin", "super-admin"].includes(user.role)
                          ? "Full"
                          : [
                                "project-manager",
                                "senior-coder",
                                "senior-auditor",
                              ].includes(user.role)
                            ? "Edit"
                            : "View"}
                      </span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">
                        No Access
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </SectionBlock>

          {/* Login & Security */}
          <SectionBlock title="Login & Security">
            <div className="space-y-2">
              {/* 2FA */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground">
                      Two-Factor Authentication
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      TOTP authenticator app
                    </p>
                  </div>
                </div>
                <Toggle
                  on={localTwoFA}
                  onChange={() => setLocalTwoFA(!localTwoFA)}
                  size="md"
                />
              </div>
              {/* SSO */}
              <div className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-border bg-muted/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-foreground">
                      SSO / SAML Login
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      Azure AD integration
                    </p>
                  </div>
                </div>
                <Toggle
                  on={localSso}
                  onChange={() => setLocalSso(!localSso)}
                  size="md"
                />
              </div>
              {/* Session info */}
              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 rounded-xl border border-border bg-muted/10">
                  <div className="text-[9px] text-muted-foreground">
                    Last Login
                  </div>
                  <div className="text-[10px] font-semibold text-foreground mt-0.5">
                    {user.lastLogin}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-xl border border-border bg-muted/10">
                  <div className="text-[9px] text-muted-foreground">
                    Session Timeout
                  </div>
                  <div className="text-[10px] font-semibold text-foreground mt-0.5">
                    {user.sessionTimeout} min
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>

          {/* Shift */}
          <SectionBlock title="Shift Assignment">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/10">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-foreground">
                  {user.shift} Shift
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {user.shiftHours} · Mon–Fri
                </p>
              </div>
              <ShiftChip shift={user.shift} />
            </div>
          </SectionBlock>

          {/* Activity Log */}
          <SectionBlock title="Recent Activity">
            <div className="space-y-1.5">
              {activity.map((a, i) => {
                const Icon = a.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/20 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] text-foreground flex-1">
                      {a.action}
                    </span>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                      {a.time.split(",")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionBlock>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-border px-5 py-3.5 flex gap-2 bg-muted/5 flex-shrink-0">
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
            <Edit2 className="w-3.5 h-3.5" />
            Edit User
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-border rounded-xl hover:bg-muted text-foreground transition-colors whitespace-nowrap">
            <Key className="w-3.5 h-3.5" />
            Reset Password
          </button>
          <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-red-200 rounded-xl hover:bg-red-50 text-red-600 transition-colors whitespace-nowrap">
            <UserX className="w-3.5 h-3.5" />
            Deactivate
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  INVITE USER MODAL  */
function InviteUserModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "coder" as RoleId,
    department: "",
    projects: [] as string[],
    shift: "Morning" as ShiftType,
    require2FA: true,
    sendEmail: true,
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative bg-card rounded-2xl shadow-2xl border border-border w-full max-w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-sm font-black text-foreground">
            Invite New User
          </h3>
          <button
            onClick={onClose}
            className="ml-auto w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Full Name", "name", "text", "e.g. Priya Sharma"],
              ["Email Address", "email", "email", "user@healthsys.com"],
            ].map(([label, key, type, ph]) => (
              <div key={key} className={key === "name" ? "" : ""}>
                <label className="block text-[10px] font-bold text-foreground mb-1">
                  {label}
                </label>
                <input
                  type={type}
                  placeholder={ph}
                  className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Role
              </label>
              <select className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none appearance-none">
                {Object.entries(ROLE_META).map(([id, m]) => (
                  <option key={id} value={id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Shift
              </label>
              <select className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none appearance-none">
                {SHIFTS_LIST.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-foreground mb-1.5">
              Project Access
            </label>
            <div className="space-y-1">
              {PROJECTS_LIST.map((p) => (
                <label
                  key={p}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/20 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    className="accent-primary w-3.5 h-3.5"
                  />
                  <span className="text-[11px] text-foreground">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-border">
            {[
              ["Require 2FA on first login", "require2FA"],
              ["Send invitation email", "sendEmail"],
            ].map(([label, key]) => (
              <label
                key={key}
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20 cursor-pointer"
              >
                <span className="text-[11px] font-semibold text-foreground">
                  {label}
                </span>
                <input
                  type="checkbox"
                  defaultChecked
                  className="accent-primary w-3.5 h-3.5"
                />
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-border bg-muted/5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[11px] font-bold border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
            <Mail className="w-3.5 h-3.5" />
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  VIEW: USERS  */
function UsersView({ onSelectUser }: { onSelectUser: (u: User) => void }) {
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      USERS_DATA.filter((u) => {
        const q = search.toLowerCase();
        if (
          q &&
          !u.name.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !u.roleName.toLowerCase().includes(q)
        )
          return false;
        if (filterRole !== "all" && u.role !== filterRole) return false;
        if (filterStatus !== "all" && u.status !== filterStatus) return false;
        return true;
      }),
    [search, filterRole, filterStatus],
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const stats = [
    {
      label: "Total Users",
      value: USERS_DATA.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active",
      value: USERS_DATA.filter((u) => u.status === "active").length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Inactive",
      value: USERS_DATA.filter((u) => u.status === "inactive").length,
      icon: XCircle,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "2FA Enabled",
      value: USERS_DATA.filter((u) => u.twoFA).length,
      icon: Smartphone,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "SSO Users",
      value: USERS_DATA.filter((u) => u.sso).length,
      icon: Globe,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Stat strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              <div
                className={`w-8 h-8 ${s.bg} rounded-lg flex items-center justify-center flex-shrink-0`}
              >
                <Icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <div className="text-xl font-black text-foreground leading-none">
                  {s.value}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email or role…"
            className="w-full pl-8 pr-4 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          <option value="all">All Roles</option>
          {Object.entries(ROLE_META).map(([id, m]) => (
            <option key={id} value={id}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl">
            <span className="text-[10px] font-bold text-primary">
              {selected.size} selected
            </span>
            <button className="text-[10px] text-primary font-bold hover:underline">
              Assign Role
            </button>
            <button className="text-[10px] text-red-600 font-bold hover:underline">
              Deactivate
            </button>
          </div>
        )}
        <div className="flex-1" />
        <button className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Invite User
        </button>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    className="accent-primary w-3.5 h-3.5"
                  />
                </th>
                {[
                  "User",
                  "Email",
                  "Role",
                  "Projects",
                  "Status",
                  "Last Login",
                  "2FA",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className={`hover:bg-muted/10 transition-colors ${selected.has(u.id) ? "bg-primary/5" : ""}`}
                >
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selected.has(u.id)}
                      onChange={() => toggleSelect(u.id)}
                      className="accent-primary w-3.5 h-3.5"
                    />
                  </td>
                  <td className="px-3 py-3.5">
                    <button
                      onClick={() => onSelectUser(u)}
                      className="flex items-center gap-2.5 hover:opacity-80 transition-opacity text-left group"
                    >
                      <Avatar initials={u.initials} />
                      <div>
                        <p className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">
                          {u.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {u.employeeId}
                        </p>
                      </div>
                    </button>
                  </td>
                  <td className="px-3 py-3.5">
                    <span className="text-[11px] text-muted-foreground">
                      {u.email}
                    </span>
                  </td>
                  <td className="px-3 py-3.5">
                    <RoleBadge roleId={u.role} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {u.projects.slice(0, 2).map((p) => (
                        <span
                          key={p}
                          className="text-[9px] font-semibold px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground"
                        >
                          {p.split(" ")[0]}
                        </span>
                      ))}
                      {u.projects.length > 2 && (
                        <span className="text-[9px] font-bold text-muted-foreground">
                          +{u.projects.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <StatusBadge status={u.status} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {u.lastLogin}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1.5">
                      {u.twoFA ? (
                        <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 text-muted-foreground/40" />
                      )}
                      {u.sso && (
                        <Globe className="w-3.5 h-3.5 text-violet-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectUser(u)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                        <Edit2 className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/5">
          <span className="text-[10px] text-muted-foreground">
            Showing {filtered.length} of {USERS_DATA.length} users
          </span>
          <div className="flex items-center gap-1">
            {[1].map((p) => (
              <button
                key={p}
                className="w-6 h-6 text-[10px] font-bold bg-primary text-white rounded-md"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
      {showInvite && <InviteUserModal onClose={() => setShowInvite(false)} />}
    </div>
  );
}

/* ════════════════════════════════════════════  VIEW: ROLES & PERMISSIONS  */
function RolesView() {
  const [selectedRole, setSelectedRole] = useState<RoleId>("coder");
  const [perms, setPerms] =
    useState<Record<string, Record<string, boolean>>>(buildPermState);
  const [showAddRole, setShowAddRole] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Main", "Operations", "Insights", "Administration"]),
  );

  const togglePerm = (key: string) => {
    setPerms((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: !prev[selectedRole][key],
      },
    }));
  };

  const toggleGroup = (g: string) => {
    setExpandedGroups((prev) => {
      const n = new Set(prev);
      n.has(g) ? n.delete(g) : n.add(g);
      return n;
    });
  };

  const countGranted = (roleId: RoleId) =>
    Object.values(perms[roleId] ?? {}).filter(Boolean).length;

  const groups = ["Main", "Operations", "Insights", "Administration"];
  const rm = ROLE_META[selectedRole];

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* LEFT: Role List */}
      <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-black text-foreground">
            System Roles
          </span>
          <button
            onClick={() => setShowAddRole(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-bold bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3 h-3" />
            New
          </button>
        </div>
        {(Object.keys(ROLE_META) as RoleId[]).map((roleId) => {
          const m = ROLE_META[roleId];
          const granted = countGranted(roleId);
          const active = selectedRole === roleId;
          return (
            <button
              key={roleId}
              onClick={() => setSelectedRole(roleId)}
              className={`w-full text-left px-3 py-3 rounded-xl border transition-all group ${active ? "bg-primary/8 border-primary/25 shadow-sm" : "bg-card border-border hover:bg-muted/30"}`}
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: m.color + "20" }}
                >
                  <UserCog className="w-4 h-4" style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-[11px] font-bold truncate ${active ? "text-primary" : "text-foreground"}`}
                  >
                    {m.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground">
                    {m.userCount} user{m.userCount !== 1 ? "s" : ""}
                  </p>
                </div>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(granted / 91) * 100}%`,
                    backgroundColor: m.color,
                  }}
                />
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {granted} permissions granted
              </div>
            </button>
          );
        })}
      </div>

      {/* RIGHT: Permission Matrix */}
      <div className="w-full flex-1 min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
        {/* Role header */}
        <div className="flex items-center gap-4 px-5 py-4 border-b border-border bg-muted/5 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: rm.color + "20" }}
          >
            <UserCog className="w-5 h-5" style={{ color: rm.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-black text-foreground truncate">
                {rm.label}
              </h3>
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                · {rm.userCount} user{rm.userCount !== 1 ? "s" : ""}
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap flex-shrink-0"
                style={{
                  backgroundColor: rm.color + "15",
                  borderColor: rm.color + "40",
                  color: rm.color,
                }}
              >
                Level {rm.level}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground break-words">
              {rm.desc}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors whitespace-nowrap">
              <Copy className="w-3 h-3" />
              Clone Role
            </button>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-primary text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
              <Check className="w-3 h-3" />
              Save Changes
            </button>
          </div>
        </div>

        {/* Action legend */}
        <div className="flex items-center gap-3 px-5 py-2 border-b border-border bg-muted/5 flex-shrink-0 overflow-x-auto">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide flex-shrink-0">
            Actions:
          </span>
          {ACTIONS.map((a) => (
            <span
              key={a.id}
              className="text-[9px] text-muted-foreground flex-shrink-0"
              title={a.tip}
            >
              <strong className="text-foreground">{a.abbr}</strong> —{" "}
              {a.tip.split(" ").slice(0, 4).join(" ")}…
            </span>
          ))}
        </div>

        {/* Matrix Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-muted/20">
                <th className="w-52 px-5 py-2.5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wide">
                  Module
                </th>
                {ACTIONS.map((a) => (
                  <th
                    key={a.id}
                    className="px-3 py-2.5 text-center text-[10px] font-black text-muted-foreground uppercase tracking-wide min-w-[64px]"
                    title={a.tip}
                  >
                    {a.abbr}
                  </th>
                ))}
              </tr>
            </thead>
            {groups.map((group) => {
              const groupMods = MODULES.filter((m) => m.group === group);
              const expanded = expandedGroups.has(group);
              return (
                <tbody key={group}>
                  {/* Group Header Row */}
                  <tr
                    className="bg-muted/20 border-y border-border/80 cursor-pointer"
                    onClick={() => toggleGroup(group)}
                  >
                    <td colSpan={8} className="px-5 py-1.5">
                      <div className="flex items-center gap-2">
                        {expanded ? (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                          {group}
                        </span>
                        <span className="text-[9px] text-muted-foreground">
                          {groupMods.length} modules
                        </span>
                      </div>
                    </td>
                  </tr>
                  {/* Module Rows */}
                  {expanded &&
                    groupMods.map((mod, mi) => {
                      const Icon = mod.icon;
                      return (
                        <tr
                          key={mod.id}
                          className={`border-b border-border/50 hover:bg-muted/10 transition-colors ${mi % 2 === 0 ? "" : "bg-muted/5"}`}
                        >
                          <td className="px-5 py-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-[11px] font-semibold text-foreground">
                                {mod.label}
                              </span>
                            </div>
                          </td>
                          {ACTIONS.map((action) => {
                            const key = `${mod.id}:${action.id}`;
                            const isNA = (NA_ACTIONS[mod.id] ?? []).includes(
                              action.id,
                            );
                            const isOn = perms[selectedRole]?.[key] ?? false;
                            return (
                              <td
                                key={action.id}
                                className="px-3 py-2.5 text-center"
                              >
                                {isNA ? (
                                  <span className="text-muted-foreground/30 text-sm select-none">
                                    —
                                  </span>
                                ) : (
                                  <div className="flex justify-center">
                                    <Toggle
                                      on={isOn}
                                      onChange={() => togglePerm(key)}
                                    />
                                  </div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                </tbody>
              );
            })}
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  VIEW: PROJECT ACCESS  */
function ProjectAccessView() {
  const [access, setAccess] = useState(initProjectAccess);
  const [filterDept, setFilterDept] = useState("all");

  const depts = [
    "all",
    ...Array.from(new Set(USERS_DATA.map((u) => u.department))),
  ];
  const filtered =
    filterDept === "all"
      ? USERS_DATA
      : USERS_DATA.filter((u) => u.department === filterDept);

  const updateAccess = (
    userId: string,
    project: string,
    level: AccessLevel,
  ) => {
    setAccess((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [project]: level },
    }));
  };

  const levelColor: Record<AccessLevel, string> = {
    full: "bg-emerald-500",
    edit: "bg-blue-500",
    view: "bg-slate-300",
    none: "bg-red-200",
  };

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs font-bold text-foreground">
          Project-Based Access Control
        </span>
        <div className="flex items-center gap-3 ml-4">
          {(["full", "edit", "view", "none"] as AccessLevel[]).map((l) => (
            <div
              key={l}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
            >
              <span className={`w-3 h-3 rounded-sm ${levelColor[l]}`} />
              <span className="capitalize font-semibold">{l}</span>
            </div>
          ))}
        </div>
        <div className="flex-1" />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="px-3 py-1.5 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          {depts.map((d) => (
            <option key={d} value={d}>
              {d === "all" ? "All Departments" : d}
            </option>
          ))}
        </select>
      </div>

      {/* Matrix Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto relative">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wide sticky left-0 z-40 bg-muted min-w-[180px]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wide min-w-[100px]">
                  Role
                </th>
                {PROJECTS_LIST.map((p) => (
                  <th
                    key={p}
                    className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground min-w-[140px]"
                  >
                    <div className="leading-tight">
                      {p.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div className="text-[8px] opacity-60">
                      {p.split(" ").slice(2).join(" ")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((u, ri) => (
                <tr
                  key={u.id}
                  className={`hover:bg-muted/10 transition-colors ${ri % 2 === 0 ? "" : "bg-muted/5"}`}
                >
                  <td className="px-5 py-3 sticky left-0 z-30 bg-card shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2">
                      <Avatar initials={u.initials} size={7} />
                      <div>
                        <p className="text-[11px] font-bold text-foreground">
                          {u.name}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {u.department}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 z-10">
                    <RoleBadge roleId={u.role} small />
                  </td>
                  {PROJECTS_LIST.map((p) => {
                    const level = access[u.id]?.[p] ?? "none";
                    return (
                      <td key={p} className="px-4 py-3 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-full max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden mx-auto">
                            <div
                              className={`h-full rounded-full ${levelColor[level]}`}
                              style={{
                                width:
                                  level === "full"
                                    ? "100%"
                                    : level === "edit"
                                      ? "66%"
                                      : level === "view"
                                        ? "33%"
                                        : "0%",
                              }}
                            />
                          </div>
                          <AccessChip
                            level={level}
                            onChange={(lv) => updateAccess(u.id, p, lv)}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2.5 border-t border-border bg-muted/5">
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Info className="w-3.5 h-3.5" />
            <span>
              Changes take effect immediately. Full = create/read/update/delete.
              Edit = read/update. View = read-only. None = no access.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  VIEW: SHIFT MANAGEMENT  */
function ShiftView() {
  const [schedule, setSchedule] = useState(initShiftSchedule);
  const [filterShift, setFilterShift] = useState<ShiftType | "all">("all");

  const updateShift = (userId: string, day: WeekDay, shift: ShiftType) => {
    setSchedule((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [day]: shift },
    }));
  };

  const shiftColors: Record<ShiftType, string> = {
    Morning: "bg-blue-50 text-blue-700 border-blue-200",
    Afternoon: "bg-amber-50 text-amber-700 border-amber-200",
    Night: "bg-violet-50 text-violet-700 border-violet-200",
    General: "bg-teal-50 text-teal-700 border-teal-200",
    Off: "bg-slate-100 text-slate-400 border-slate-200",
  };

  const filteredUsers =
    filterShift === "all"
      ? USERS_DATA
      : USERS_DATA.filter((u) => u.shift === filterShift);

  return (
    <div className="space-y-4">
      {/* Legend + Filter */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          {(Object.entries(shiftColors) as [ShiftType, string][]).map(
            ([shift, cls]) => (
              <div
                key={shift}
                className="flex items-center gap-1.5 text-[10px]"
              >
                <span className={`w-3 h-3 rounded-sm border ${cls}`} />
                <span className="font-semibold text-muted-foreground">
                  {shift}
                </span>
              </div>
            ),
          )}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-bold">
            Filter shift:
          </span>
          <div className="flex gap-1">
            {(["all", ...SHIFTS_LIST] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterShift(s as ShiftType | "all")}
                className={`px-2 py-1 text-[10px] font-bold rounded-lg border transition-colors ${filterShift === s ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-primary text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
          <Check className="w-3.5 h-3.5" />
          Save Schedule
        </button>
      </div>

      {/* Week header */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-xs font-black text-foreground">
              Week of Feb 16–22, 2026
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors">
              ← Prev Week
            </button>
            <span className="text-[10px] text-muted-foreground">
              Current Week
            </span>
            <button className="px-3 py-1 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors">
              Next Week →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto relative">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-5 py-2.5 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wide min-w-[180px] sticky left-0 z-40 bg-muted border-r border-border">
                  Coder / Auditor
                </th>
                {WEEK_DAYS.map((d, i) => (
                  <th
                    key={d}
                    className={`px-3 py-2.5 text-center text-[10px] font-bold text-muted-foreground min-w-[110px] ${i >= 5 ? "opacity-50" : ""}`}
                  >
                    <div>{d}</div>
                    <div className="text-[8px] font-normal">{`Feb ${16 + i}`}</div>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-center text-[10px] font-bold text-muted-foreground">
                  Default
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.map((u, ri) => (
                <tr
                  key={u.id}
                  className={`hover:bg-muted/10 transition-colors ${ri % 2 === 0 ? "" : "bg-muted/5"}`}
                >
                  <td className="px-5 py-3 sticky left-0 z-30 bg-card border-r border-border shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={u.initials} size={7} />
                      <div>
                        <p className="text-[11px] font-bold text-foreground">
                          {u.name}
                        </p>
                        <RoleBadge roleId={u.role} small />
                      </div>
                    </div>
                  </td>
                  {WEEK_DAYS.map((d, di) => {
                    const sh = schedule[u.id]?.[d] ?? "Off";
                    return (
                      <td
                        key={d}
                        className="px-3 py-3 text-center relative z-10"
                      >
                        <select
                          value={sh}
                          onChange={(e) =>
                            updateShift(u.id, d, e.target.value as ShiftType)
                          }
                          className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border appearance-none cursor-pointer w-full text-center ${shiftColors[sh]}`}
                        >
                          {SHIFTS_LIST.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center relative z-10">
                    <ShiftChip shift={u.shift} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2.5 border-t border-border bg-muted/5 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            Showing {filteredUsers.length} of {USERS_DATA.length} users
          </span>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            <span>
              2 users have overlapping shift gaps this week — review recommended
            </span>
          </div>
        </div>
      </div>

      {/* Shift Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SHIFTS_LIST.map((s) => {
          const count = USERS_DATA.filter((u) => u.shift === s).length;
          const cls = shiftColors[s];
          return (
            <div
              key={s}
              className={`rounded-xl border p-3 text-center ${cls.split(" ")[0]} ${cls.split(" ")[2]}`}
            >
              <div className={`text-2xl font-black ${cls.split(" ")[1]}`}>
                {count}
              </div>
              <div className={`text-[10px] font-bold ${cls.split(" ")[1]}`}>
                {s}
              </div>
              <div className="text-[9px] text-muted-foreground mt-0.5">
                {s === "Morning"
                  ? "08:00–16:00"
                  : s === "Afternoon"
                    ? "14:00–22:00"
                    : s === "Night"
                      ? "22:00–06:00"
                      : s === "General"
                        ? "09:00–18:00"
                        : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  MAIN EXPORT  */
export function UsersRoles() {
  const [view, setView] = useState<ViewTab>("users");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const TABS: {
    id: ViewTab;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    { id: "users", label: "Users", icon: Users, count: USERS_DATA.length },
    { id: "roles", label: "Roles & Permissions", icon: Shield },
    { id: "projects", label: "Project Access", icon: FolderKanban },
    { id: "shifts", label: "Shift Management", icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Users & Role Management
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage user accounts · role assignments · permission matrix ·
            project access · shift scheduling
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <strong className="text-foreground">
              {USERS_DATA.filter((u) => u.status === "active").length} Active
            </strong>
          </span>
          <span>·</span>
          <span>{Object.keys(ROLE_META).length} Roles</span>
          <span>·</span>
          <span>{PROJECTS_LIST.length} Projects</span>
        </div>
      </div>

      {/* Sub-nav */}
      <div className="flex items-center gap-0.5 bg-card border border-border rounded-2xl p-1.5 shadow-sm overflow-x-auto flex-shrink-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = view === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setView(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                active
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count !== undefined && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  {t.count}
                </span>
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 pr-1 text-[10px] text-muted-foreground flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>HIPAA-compliant access control</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {view === "users" && (
          <UsersView onSelectUser={(u) => setSelectedUser(u)} />
        )}
        {view === "roles" && <RolesView />}
        {view === "projects" && <ProjectAccessView />}
        {view === "shifts" && <ShiftView />}
      </div>

      {/* User Profile Slide-over */}
      {selectedUser && (
        <UserProfile
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}
