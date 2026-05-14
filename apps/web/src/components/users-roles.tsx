import { useState, useMemo, useEffect } from "react";
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
import {
  usePostApiUserRoles,
  usePatchApiUserRolesId,
  useGetApiUserRoles,
  useGetApiUserRolesId,
  getApiUserRolesQueryKey,
  usePostApiAuthForgotPassword,
} from "@/api";
import {
  usePostApiUsers,
  useGetApiUsers,
  usePatchApiUsersId,
  useGetApiProjects,
  getApiUsersQueryKey,
  useGetApiUsersExport,
  useGetApiUsersStats,
  usePostApiDepartments,
  useGetApiDepartments,
  usePostApiUsersDeactivate,
} from "@/api";
import {
  useGetApiProjectsAccessAll,
  getApiProjectsAccessAllQueryKey,
  usePatchApiProjectsIdAccess,
} from "@/api";
import { getApiUsersExport } from "@/api";

import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
function StatusBadge({ status }: { status: string }) {
  const key = status?.toLowerCase(); //  fix

  const config = {
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
    pending: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
    },
  };

  const cfg = config[key as keyof typeof config];

  //  fallback to prevent crash
  if (!cfg) {
    return (
      <span className="px-2 py-0.5 text-[10px] rounded-full border text-gray-500">
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold rounded-full border ${cfg.bg} ${cfg.border} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
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
      className={`inline-flex items-center font-bold rounded-full border px-2 py-0.5 text-[10px] bg-muted text-muted-foreground`}
    >
      {roleId}
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
/* ════════════════════════════════════════════  USER PROFILE SLIDE-OVER  */
function UserProfile({
  user,
  onClose,
  onEditRole,
}: {
  user: any; // Now receives enhanced object
  onClose: () => void;
  onEditRole?: () => void;
}) {
  const [localTwoFA, setLocalTwoFA] = useState(user.two_fa_auth ?? false);
  const [localSso, setLocalSso] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: forgotPasswordApi, isPending: isResetting } =
    usePostApiAuthForgotPassword({
      mutation: {
        onSuccess: (response: any) => {
          toast.success(
            response?.message || "Password reset link sent successfully."
          );
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to send reset link."
          );
        },
      },
    });

  const handleResetPassword = () => {
    if (!user.email) {
      toast.error("User email not found.");
      return;
    }
    forgotPasswordApi({
      data: {
        email: user.email,
      },
    });
  };

  const { mutate: deactivateUsers, isPending: isDeactivating } =
    usePostApiUsersDeactivate({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getApiUsersQueryKey() });
          toast.success("User deactivated successfully");
          onClose();
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to deactivate user"
          );
        },
      },
    });
  const handleDeactivateUser = () => {
    deactivateUsers({
      data: {
        user_ids: [user.id],
      },
    });
  };

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
                initials={
                  user.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "??"
                }
                color="bg-primary/15"
                textColor="text-primary"
                size={12}
              />
              <div>
                <h3 className="text-sm font-black text-foreground">
                  {user.full_name}
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  {user.email}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <RoleBadge roleId={user.roleName || user.user_role?.name} />
                  <StatusBadge status={user.status || user.user_status} />
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

          {/* Quick Info Cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Employee ID", value: user.employeeId || "N/A" },
              {
                label: "Department",
                value: user.department_name || "Not Assigned",
              },
              { label: "Shift", value: user.shift || "Not Assigned" },
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Account Information */}
          <SectionBlock title="Account Information">
            <div className="bg-muted/20 rounded-xl px-3 py-1 border border-border/50">
              <InfoRow icon={Mail} label="Email" value={user.email} />
              <InfoRow icon={Phone} label="Phone" value={user.phone || "N/A"} />
              <InfoRow
                icon={Building2}
                label="Department"
                value={user.department_name || "Not Assigned"}
              />
              <InfoRow
                icon={UserCheck}
                label="Job Title"
                value={user.job_title || "Not Specified"}
              />
              <InfoRow
                icon={MapPin}
                label="Location"
                value={user.location || "N/A"}
              />
              <InfoRow
                icon={Calendar}
                label="Member Since"
                value={
                  user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "N/A"
                }
              />
              <InfoRow
                icon={Tag}
                label="Employee ID"
                value={user.employeeId || "N/A"}
                mono
              />
            </div>
          </SectionBlock>

          {/* Role & Permissions */}
          <SectionBlock title="Role & Permissions">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/10 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-foreground">
                    {user.roleName || user.user_role_full?.name || "No Role"}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {user.user_role_full?.description ||
                    "No description available"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "View", on: true },
                { label: "Edit", on: true },
                { label: "Approve", on: false },
                { label: "Export", on: true },
              ].map((p) => (
                <div
                  key={p.label}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg border text-[9px] font-bold ${
                    p.on
                      ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                      : "bg-muted border-border text-muted-foreground"
                  }`}
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
              {user.projects && user.projects.length > 0 ? (
                user.projects.map((p: any) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg border bg-card border-border"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <span className="text-[11px] font-semibold flex-1">
                      {p.project_name}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                      Access
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No projects assigned
                </div>
              )}
            </div>
          </SectionBlock>

          {/* Login & Security */}
          <SectionBlock title="Login & Security">
            <div className="space-y-2">
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

              <div className="grid grid-cols-2 gap-2">
                <div className="px-3 py-2 rounded-xl border border-border bg-muted/10">
                  <div className="text-[9px] text-muted-foreground">
                    Last Login
                  </div>
                  <div className="text-[10px] font-semibold text-foreground mt-0.5">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString()
                      : "Never"}
                  </div>
                </div>
                <div className="px-3 py-2 rounded-xl border border-border bg-muted/10">
                  <div className="text-[9px] text-muted-foreground">Status</div>
                  <div className="text-[10px] font-semibold text-foreground mt-0.5">
                    {user.status || user.user_status}
                  </div>
                </div>
              </div>
            </div>
          </SectionBlock>

          {/* Shift Assignment */}
          <SectionBlock title="Shift Assignment">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border bg-muted/10">
              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-foreground">
                  {user.shift || "Not Assigned"} Shift
                </p>
              </div>
              <ShiftChip shift={user.shift} />
            </div>
          </SectionBlock>

          {/* Recent Activity */}
          <SectionBlock title="Recent Activity">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-muted/20 transition-colors">
                <div className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <LogIn className="w-3 h-3 text-muted-foreground" />
                </div>
                <span className="text-[10px] text-foreground flex-1">
                  Account Created
                </span>
                <span className="text-[9px] text-muted-foreground">
                  {user.created_at
                    ? new Date(user.created_at).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          </SectionBlock>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3.5 flex gap-2 bg-muted/5 flex-shrink-0">
          <button
            onClick={() => {
              /* Open edit modal logic here */
            }}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-primary text-white rounded-xl hover:opacity-90"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit User
          </button>
          <button
            onClick={handleResetPassword}
            disabled={isResetting}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-border rounded-xl hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResetting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Key className="w-3.5 h-3.5" />
            )}
            {isResetting ? "Sending..." : "Reset Password"}
          </button>
          <button
            onClick={handleDeactivateUser}
            disabled={isDeactivating}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-red-200 rounded-xl hover:bg-red-50 text-red-600 transition-colors whitespace-nowrap disabled:opacity-50"
          >
            <UserX className="w-3.5 h-3.5" />
            {isDeactivating ? "Deactivating..." : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  );
}
/* ════════════════════════════════════════════  INVITE USER MODAL  */
function InviteUserModal({
  onClose,
  onAdd,
  editUser,
}: {
  onClose: () => void;
  editUser?: User;
  onAdd: (u: User) => void;
}) {
  const queryClient = useQueryClient();

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    shift: "Morning",
    require2FA: true,
    sendEmail: true,
    projects: [] as string[],
    departmentId: "",
  });
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [deptSearch, setDeptSearch] = useState("");
  const [showCreateDept, setShowCreateDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");

  // Fetch departments
  const searchTerm = deptSearch?.trim() || undefined;
  const { data: departmentsData } = useGetApiDepartments({
    search: searchTerm,
  });
  const departments = Array.isArray(departmentsData) ? departmentsData : [];

  // ==================== POPULATE FORM ON EDIT ====================
  useEffect(() => {
    if (editUser) {
      const cleanProjects = Array.isArray(editUser.project_access)
        ? editUser.project_access.filter(
            (id): id is string => typeof id === "string" && id.length > 0
          )
        : [];

      setForm({
        name: editUser.full_name || "",
        email: editUser.email || "",
        role: editUser.user_role || "",
        shift: editUser.shift || "Morning",
        require2FA: editUser.two_fa_auth ?? true,
        sendEmail: editUser.send_email ?? true,
        projects: cleanProjects,
        departmentId: editUser.department_id || "",
      });

      setDeptSearch(editUser.department_name || "");
    } else {
      // Reset for new user
      setForm({
        name: "",
        email: "",
        role: "",
        shift: "Morning",
        require2FA: true,
        sendEmail: true,
        projects: [],
        departmentId: "",
      });
      setDeptSearch("");
    }
  }, [editUser]);

  // Mutations
  const { mutate: updateUser } = usePatchApiUsersId({
    mutation: { onSuccess: () => onClose() },
  });

  const { mutate: createDepartment, isLoading: isCreatingDept } =
    usePostApiDepartments({
      mutation: {
        onSuccess: (response: any) => {
          const createdDept = response?.data || response;

          toast.success("Department created successfully");

          setShowCreateDept(false);
          setNewDeptName("");

          // auto select created department
          setField("departmentId", createdDept.id || "");

          // show selected department in input
          setDeptSearch(createdDept.name || "");

          // close dropdown
          setShowDeptDropdown(false);
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "Failed to create department";

          toast.error(message);
        },
      },
    });

  const { mutate, isLoading } = usePostApiUsers({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getApiUsersQueryKey() });
        toast.success("User Created Successfully");
        onClose();
      },

      onError: (error: any) => {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to create User";

        toast.error(message);
      },
    },
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const setField = <K extends keyof typeof form>(k: K, v: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const toggleProject = (p: string) =>
    setForm((prev) => ({
      ...prev,
      projects: prev.projects.includes(p)
        ? prev.projects.filter((x) => x !== p)
        : [...prev.projects, p],
    }));

  // ==================== VALIDATION ====================
  const isFormValid =
    form.name.trim() &&
    form.email.trim() &&
    form.role.trim() &&
    form.departmentId.trim();

  const handleSubmit = () => {
    const errs: { name?: string; email?: string } = {};
    if (!form.name.trim()) errs.name = "Full name is required";
    if (!form.email.trim()) errs.email = "Email is required";

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    // Clean arrays before sending
    const cleanProjects = form.projects.filter(
      (id): id is string => typeof id === "string" && id.length > 0
    );

    const payload = {
      full_name: form.name.trim(),
      email: form.email.trim(),
      user_role: form.role || undefined,
      project_access: cleanProjects,
      send_email: form.sendEmail,
      two_fa_auth: form.require2FA,
      shift: form.shift,
      department_id: form.departmentId || undefined,
    };

    if (editUser) {
      updateUser(
        { id: editUser.id, data: payload },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getApiUsersQueryKey() });
            toast.success("User Updated Successfully");
            onClose();
          },
          onError: (error: any) => {
            const message =
              error?.response?.data?.message || "Failed to Update User";

            toast.error(message);
          },
        }
      );
    } else {
      mutate({ data: payload });
    }
  };

  const { data: projectsData } = useGetApiProjects();
  const { data: rolesdata } = useGetApiUserRoles();

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
            {" "}
            {editUser ? "Update User" : "Invite New User "}
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
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={form.name}
                onChange={(e) => {
                  setField("name", e.target.value);
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                className={`w-full px-3 py-2 text-[11px] bg-muted/30 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary ${errors.name ? "border-red-400" : "border-border"}`}
              />
              {errors.name && (
                <p className="text-[9px] text-red-500 mt-0.5">{errors.name}</p>
              )}
            </div>
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="user@healthsys.com"
                value={form.email}
                onChange={(e) => {
                  setField("email", e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full px-3 py-2 text-[11px] bg-muted/30 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary ${errors.email ? "border-red-400" : "border-border"}`}
              />
              {errors.email && (
                <p className="text-[9px] text-red-500 mt-0.5">{errors.email}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Role
              </label>
              <select
                value={form.role}
                onChange={(e) => setField("role", e.target.value)}
                className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none appearance-none"
              >
                <option value="">Select role</option>

                {rolesdata?.results?.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Shift
              </label>
              <select
                value={form.shift}
                onChange={(e) => setField("shift", e.target.value as ShiftType)}
                className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none appearance-none"
              >
                {SHIFTS_LIST.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ==================== DEPARTMENT FIELD ==================== */}
          <div>
            <label className="block text-[10px] font-bold text-foreground mb-1">
              Department
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search department..."
                value={deptSearch}
                onFocus={() => setShowDeptDropdown(true)}
                onChange={(e) => {
                  setDeptSearch(e.target.value);
                  setShowDeptDropdown(true);

                  if (form.departmentId) {
                    setField("departmentId", "");
                  }
                }}
                className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {showDeptDropdown && (deptSearch?.length ?? 0) > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-xl shadow-lg py-1 max-h-60 overflow-auto">
                  {departments.length > 0 ? (
                    departments.map((dept: any) => (
                      <div
                        key={dept.id}
                        onClick={() => {
                          setField("departmentId", dept.id);
                          setDeptSearch(dept.name || "");
                          setShowDeptDropdown(false);
                        }}
                        className="px-4 py-2 text-[11px] hover:bg-muted/50 cursor-pointer"
                      >
                        {dept.name}
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-center">
                      <p className="text-[11px] text-muted-foreground mb-2">
                        No department found
                      </p>
                      <button
                        onClick={() => setShowCreateDept(true)}
                        className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary/90"
                      >
                        + Create
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ==================== PROJECT ACCESS ==================== */}
          <div>
            <label className="block text-[10px] font-bold text-foreground mb-1.5">
              Project Access
            </label>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {projectsData?.data?.map(
                (project: { id: string; project_name: string }) => (
                  <label
                    key={project.id}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-muted/20 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.projects.includes(project.id)}
                      onChange={() => toggleProject(project.id)}
                      className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-[11px] text-foreground">
                      {project.project_name}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>
          <div className="space-y-2 pt-2 border-t border-border">
            <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20 cursor-pointer">
              <span className="text-[11px] font-semibold text-foreground">
                Require 2FA on first login
              </span>
              <input
                type="checkbox"
                checked={form.require2FA}
                onChange={(e) => setField("require2FA", e.target.checked)}
                className="accent-primary w-3.5 h-3.5"
              />
            </label>
            <label className="flex items-center justify-between px-3 py-2 rounded-xl bg-muted/20 cursor-pointer">
              <span className="text-[11px] font-semibold text-foreground">
                Send invitation email
              </span>
              <input
                type="checkbox"
                checked={form.sendEmail}
                onChange={(e) => setField("sendEmail", e.target.checked)}
                className="accent-primary w-3.5 h-3.5"
              />
            </label>
          </div>
        </div>
        <div className="flex gap-2 px-6 py-4 border-t border-border bg-muted/5">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-[11px] font-bold border border-border rounded-xl hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[11px] font-bold rounded-xl transition-opacity whitespace-nowrap
    ${
      !isFormValid || isLoading
        ? "bg-primary/50 cursor-not-allowed text-white"
        : "bg-primary text-white hover:opacity-90"
    }
  `}
          >
            {isLoading
              ? "Submitting..."
              : editUser
                ? "Update User"
                : "Add User"}
          </button>
        </div>
      </div>
      {/* ==================== CREATE DEPARTMENT MODAL ==================== */}
      {showCreateDept && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl w-full max-w-xs p-6 border border-border">
            <h4 className="font-bold text-sm mb-4">Create New Department</h4>

            <input
              type="text"
              placeholder="Department name"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-xl mb-4"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateDept(false);
                  setNewDeptName("");
                }}
                className="flex-1 py-2 text-sm border border-border rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newDeptName.trim()) {
                    createDepartment({ data: { name: newDeptName.trim() } });
                  }
                }}
                disabled={!newDeptName.trim() || isCreatingDept}
                className="flex-1 py-2 text-sm bg-primary text-white rounded-xl disabled:opacity-50"
              >
                {isCreatingDept ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════  VIEW: USERS  */
function UsersView({ onSelectUser }: { onSelectUser: (u: User) => void }) {
  const [users, setUsers] = useState<User[]>();
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showInvite, setShowInvite] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editUser, setEditUser] = useState<User | null>(null);

  const { data, isLoading } = useGetApiUsers({
    search: search || undefined,
    user_status: filterStatus !== "all" ? filterStatus : undefined,
    user_role: filterRole !== "all" ? filterRole : undefined,
    page_no: 1,
    page_size: 10,
  });

  const userslist = useMemo(() => {
    return (
      data?.results?.map((u: any) => ({
        id: u.id,
        uid: u.id,
        full_name: u.full_name,
        email: u.email,
        user_role: u.user_role?.id, // for form/edit
        shift: u.shift,
        two_fa_auth: u.two_fa_auth,
        send_email: u.send_email,
        project_access: u.projects?.map((p: any) => p.project_id) || [],

        // UI fields for table
        name: u.full_name,
        roleName: u.user_role?.name,
        status: u.user_status,
        lastLogin: u.last_login ? new Date(u.last_login).toLocaleString() : "-",
        initials: u.full_name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase(),
        employeeId: u.employee_id,

        // ← NEW: Full data for Profile
        department_name: u.department_name,
        user_role_full: u.user_role, // full role object
        projects: u.projects || [],
        phone: u.phone || u.mobile_phone,
        job_title: u.job_title,
        location: u.location,
        created_at: u.created_at,
        last_login: u.last_login,
        user_status: u.user_status,
        department_id: u.department_id,
      })) || []
    );
  }, [data]);

  const handleExport = async () => {
    try {
      toast.loading("Preparing export...", { id: "export-toast" });

      const blob = await getApiUsersExport(
        { format: "csv" }, // ← Explicitly request CSV
        {
          responseType: "blob", // Important for file download
        }
      );

      // Create downloadable link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`; // Nice filename
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export downloaded successfully", { id: "export-toast" });
    } catch (err: any) {
      console.error("Export failed:", err);
      toast.error("Failed to export users. Please try again.", {
        id: "export-toast",
      });
    }
  };

  const handleAddUser = (newUser: User) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  const filtered = useMemo(
    () =>
      userslist.filter((u) => {
        const q = search.toLowerCase();
        if (
          q &&
          !u.name?.toLowerCase().includes(q) &&
          !u.email?.toLowerCase().includes(q) &&
          !u.roleName?.toLowerCase().includes(q)
        )
          return false;

        // Fix filter comparison
        if (filterRole !== "all" && u.user_role !== filterRole) return false;
        if (filterStatus !== "all" && u.status !== filterStatus) return false;

        return true;
      }),
    [userslist, search, filterRole, filterStatus] // ← Fixed
  );

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const { data: userOverview } = useGetApiUsersStats();

  const statsData = userOverview?.stats;

  const stats = [
    {
      label: "Total Users",
      value: statsData?.total_users ?? 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Active",
      value: statsData?.active_users ?? 0,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Inactive",
      value: statsData?.inactive_users ?? 0,
      icon: XCircle,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
    {
      label: "2FA Enabled",
      value: statsData?.two_fa_enabled ?? 0,
      icon: Smartphone,
      color: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "SSO Users",
      value: statsData?.sso_users ?? 0,
      icon: Globe,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
  ];
  const queryClient = useQueryClient();

  const { data: rolesdata } = useGetApiUserRoles();

  const { mutate: deactivateUsers, isPending: isBulkDeactivating } =
    usePostApiUsersDeactivate({
      mutation: {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getApiUsersQueryKey() });
          toast.success("Selected users deactivated successfully");
          setSelected(new Set());
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message ||
              error?.message ||
              "Failed to deactivate users"
          );
        },
      },
    });
  const handleBulkDeactivate = () => {
    if (selected.size === 0) {
      toast.error("Please select users");
      return;
    }

    deactivateUsers({
      data: {
        user_ids: Array.from(selected),
      },
    });
  };

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
          <option value="">All Roles</option>
          {rolesdata?.results?.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
        {selected.size > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl">
            <span className="text-[10px] font-bold text-primary">
              {selected.size} selected
            </span>
            <button className="text-[10px] text-primary font-bold hover:underline">
              Assign Role
            </button>
            <button
              onClick={handleBulkDeactivate}
              disabled={isBulkDeactivating}
              className="text-[10px] text-red-600 font-bold hover:underline disabled:opacity-50"
            >
              {isBulkDeactivating ? "Deactivating..." : "Deactivate"}
            </button>
          </div>
        )}
        <div className="flex-1" />
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <button
          onClick={() => {
            setEditUser(null);
            setShowInvite(true);
          }}
          className="inline-flex items-center gap-2 px-6 py-2 text-[11px] font-black rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all uppercase tracking-widest shadow-sm whitespace-nowrap"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Add User
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
              {userslist.map((u) => (
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
                    <RoleBadge roleId={u.roleName} />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {u.projects.slice(0, 2).map((p) => (
                        <span
                          key={p.project_id}
                          className="text-[9px] font-semibold px-1.5 py-0.5 bg-muted rounded-md text-muted-foreground"
                        >
                          {p.project_name.split(" ")[0]}
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
                      <button
                        onClick={() => {
                          setEditUser(u);
                          setShowInvite(true);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap"
                      >
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
            Showing {filtered.length} of {userslist.length} users{" "}
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
      {showInvite && (
        <InviteUserModal
          onClose={() => {
            setShowInvite(false);
            setEditUser(null);
          }}
          onAdd={handleAddUser}
          editUser={editUser}
        />
      )}
    </div>
  );
}
interface AddRoleModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (roleName: string, perms: Record<string, boolean>) => void;
  basePerms: Record<string, boolean>;
  baseMeta?: { name?: string; description?: string; level?: number };
}

function AddRoleModal({
  open,
  onClose,
  basePerms,
  baseMeta,
}: AddRoleModalProps) {
  const { mutate: createRole, isPending } = usePostApiUserRoles();
  // const tokenStr = localStorage.getItem("userDetail");
  // const token = tokenStr ? JSON.parse(tokenStr) : null;
  // const uid = token?.user?.organization?.id;

  const [form, setForm] = useState({
    name: "",
    description: "",
    level: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [localPerms, setLocalPerms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (open) {
      setForm({
        name: baseMeta?.name ? `${baseMeta.name} (Copy)` : "",
        description: baseMeta?.description || "",
        level: baseMeta?.level !== undefined ? String(baseMeta.level) : "",
      });
      setLocalPerms(basePerms);
      setErrors({});
    }
  }, [open, basePerms, baseMeta]);

  const setField = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePerm = (key: string) => {
    setLocalPerms((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const buildRolePermissionsPayload = (perms: Record<string, boolean>) => {
    return MODULES.map((mod) => {
      const get = (action: string) => perms[`${mod.id}:${action}`] ?? false;
      return {
        module: mod.label,
        can_view: get("view"),
        can_edit: get("edit"),
        can_assign: get("assign"),
        can_approve: get("approve"),
        can_reject: get("reject"),
        can_export: get("export"),
        can_override: get("override"),
      };
    });
  };
  const queryClient = useQueryClient();

  const handleSave = () => {
    if (!form.name.trim()) {
      setErrors({ name: "Role name is required" });
      return;
    }

    const payload = {
      name: form.name,
      description: form.description || "",
      level: Number(form.level) || 0,
      active: true,
      role_permissions: buildRolePermissionsPayload(localPerms),
    };

    createRole(
      { data: payload },
      {
        onSuccess: () => {
          toast.success("Role Created successfully");
          queryClient.invalidateQueries({
            queryKey: getApiUserRolesQueryKey(),
          });
          onClose();
        },
        onError: (err) => {
          console.log("Create role failed", err);
        },
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-card w-[1000px] max-h-[90vh] rounded-2xl border border-border shadow-lg flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-black text-foreground">
            {baseMeta?.name
              ? `Clone Role — ${baseMeta.name}`
              : "Create New Role"}
          </h2>
        </div>

        {/* Body */}
        <div className="p-5 overflow-auto flex-1">
          {/* Inputs */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Role Name
              </label>
              <input
                type="text"
                placeholder="e.g. Team Lead"
                value={form.name}
                onChange={(e) => {
                  setField("name", e.target.value);
                  setErrors((prev: any) => ({ ...prev, name: undefined }));
                }}
                className={`w-full px-3 py-2 text-[11px] bg-muted/30 border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary ${
                  errors.name ? "border-red-400" : "border-border"
                }`}
              />
              {errors.name && (
                <p className="text-[9px] text-red-500 mt-0.5">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="Short description"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-foreground mb-1">
                Level
              </label>
              <input
                type="number"
                placeholder="e.g. 3"
                value={form.level}
                onChange={(e) => setField("level", e.target.value)}
                className="w-full px-3 py-2 text-[11px] bg-muted/30 border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Permission Table */}
          <div className="overflow-auto border border-border rounded-xl">
            <table className="w-full text-[11px]">
              <thead className="bg-muted/20 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2">Module</th>
                  {ACTIONS.map((a) => (
                    <th key={a.id} className="px-3 py-2 text-center">
                      {a.abbr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODULES.map((mod, i) => (
                  <tr key={mod.id} className={i % 2 ? "bg-muted/5" : ""}>
                    <td className="px-4 py-2 font-semibold">{mod.label}</td>
                    {ACTIONS.map((action) => {
                      const key = `${mod.id}:${action.id}`;
                      const isNA = (NA_ACTIONS[mod.id] ?? []).includes(
                        action.id
                      );
                      const isOn = localPerms[key] ?? false;
                      return (
                        <td key={action.id} className="px-3 py-2 text-center">
                          {isNA ? (
                            <span className="text-muted-foreground/30">—</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[11px] font-bold border border-border rounded-lg hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-3 py-1.5 text-[11px] font-bold bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  VIEW: ROLES & PERMISSIONS  */
function RolesView() {
  const [rolesMeta, setRolesMeta] = useState<any>({});
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [perms, setPerms] = useState<Record<string, Record<string, boolean>>>(
    {}
  );
  const [showAddRole, setShowAddRole] = useState(false);
  const [showCloneRole, setShowCloneRole] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(["Main", "Operations", "Insights", "Administration"])
  );

  const tokenStr = localStorage.getItem("userDetail");
  const token = tokenStr ? JSON.parse(tokenStr) : null;
  const uid = token?.user?.organization?.id;

  const { data: rolesList } = useGetApiUserRoles();
  const { data: roleDetails } = useGetApiUserRolesId(selectedRole, {
    query: { enabled: !!selectedRole },
  });
  const { mutate: updateRole, isPending: isUpdating } =
    usePatchApiUserRolesId();

  useEffect(() => {
    if (rolesList?.results) {
      const mapped: any = {};
      rolesList.results.forEach((r: any, index: number) => {
        mapped[r.id] = {
          label: r.name,
          color: ["#ef4444", "#8b5cf6", "#2563eb", "#10b981", "#f59e0b"][
            index % 5
          ],
          userCount: r.users,
          desc: r.description || "",
          level: 0,
        };
      });
      setRolesMeta(mapped);
      if (!selectedRole) {
        setSelectedRole(rolesList.results[0]?.id);
      }
    }
  }, [rolesList]);

  const buildRolePermissionsPayload = (rolePerms: Record<string, boolean>) => {
    const moduleMap: Record<string, any> = {};
    MODULES.forEach((mod) => {
      moduleMap[mod.id] = {
        module: mod.label,
        can_view: false,
        can_edit: false,
        can_assign: false,
        can_approve: false,
        can_reject: false,
        can_export: false,
        can_override: false,
      };
    });
    Object.entries(rolePerms).forEach(([key, value]) => {
      const [moduleId, action] = key.split(":");
      if (!moduleMap[moduleId]) return;
      moduleMap[moduleId][`can_${action}`] = value;
    });
    return Object.values(moduleMap);
  };
  const queryClient = useQueryClient();

  const handleSaveChanges = () => {
    if (!selectedRole) return;
    const rolePerms = perms[selectedRole] || {};
    const payload = {
      name: rolesMeta[selectedRole]?.label,
      description: rolesMeta[selectedRole]?.desc,
      level: rolesMeta[selectedRole]?.level,
      active: true,
      role_permissions: buildRolePermissionsPayload(rolePerms),
    };
    updateRole(
      { id: selectedRole, data: payload },
      {
        onSuccess: () => {
          toast.success("Role updated successfully");
          queryClient.invalidateQueries({
            queryKey: getApiUserRolesQueryKey(),
          });
        },
        onError: () => toast.error("Failed to update role"),
      }
    );
  };

  const mapApiToPermState = (data: any) => {
    const result: Record<string, boolean> = {};
    data?.permissions_all?.forEach((group: any) => {
      group.modules.forEach((mod: any) => {
        const moduleId = MODULES.find((m) => m.label === mod.module)?.id;
        if (!moduleId) return;
        result[`${moduleId}:view`] = mod.can_view;
        result[`${moduleId}:edit`] = mod.can_edit;
        result[`${moduleId}:assign`] = mod.can_assign;
        result[`${moduleId}:approve`] = mod.can_approve;
        result[`${moduleId}:reject`] = mod.can_reject;
        result[`${moduleId}:export`] = mod.can_export;
        result[`${moduleId}:override`] = mod.can_override;
      });
    });
    return result;
  };

  useEffect(() => {
    if (roleDetails && selectedRole) {
      setPerms((prev) => ({
        ...prev,
        [selectedRole]: mapApiToPermState(roleDetails),
      }));
      setRolesMeta((prev) => ({
        ...prev,
        [selectedRole]: {
          ...prev[selectedRole],
          level: roleDetails.level,
          desc: roleDetails.description,
          userCount: roleDetails.users_count,
        },
      }));
    }
  }, [roleDetails]);

  const togglePerm = (key: string) => {
    setPerms((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [key]: !prev[selectedRole]?.[key],
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

  const countGranted = (roleId: string) =>
    Object.values(perms[roleId] ?? {}).filter(Boolean).length;

  const groups = ["Main", "Operations", "Insights", "Administration"];
  const rm = rolesMeta[selectedRole] || {};

  const handleAddRole = (
    roleName: string,
    newPerms: Record<string, boolean>
  ) => {
    const newRoleId = roleName.toLowerCase().replace(/\s+/g, "-");
    setRolesMeta((prev) => ({
      ...prev,
      [newRoleId]: {
        label: roleName,
        color: "#6366f1",
        userCount: 0,
        desc: "Custom role",
        level: 99,
      },
    }));
    setPerms((prev) => ({ ...prev, [newRoleId]: newPerms }));
    setSelectedRole(newRoleId);
    setShowAddRole(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* LEFT: Role List */}
      <div className="lg:w-64 flex-shrink-0 space-y-2">
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

        {(Object.keys(rolesMeta) as string[]).map((roleId) => {
          const m = rolesMeta[roleId];
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
                  style={{ backgroundColor: (m.color || "#888") + "20" }}
                >
                  <UserCog
                    className="w-4 h-4"
                    style={{ color: m.color || "#888" }}
                  />
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
                    backgroundColor: m.color || "#888",
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
      <div className="flex-1 min-w-0 bg-card border border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
        {/* Role header */}
        <div className="flex flex-col lg:flex-row flex-start lg:items-center gap-4 px-5 py-4 border-b border-border bg-muted/5 flex-shrink-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: rm.color + "20" }}
          >
            <UserCog className="w-5 h-5" style={{ color: rm.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-foreground">{rm.label}</h3>
              <span className="text-[10px] text-muted-foreground">
                · {rm.userCount} user{rm.userCount !== 1 ? "s" : ""}
              </span>
              <span
                className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                style={{
                  backgroundColor: rm.color + "15",
                  borderColor: rm.color + "40",
                  color: rm.color,
                }}
              >
                Level {rm.level}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {rm.desc}
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowCloneRole(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors whitespace-nowrap"
            >
              <Copy className="w-3 h-3" />
              Clone Role
            </button>
            <button
              onClick={handleSaveChanges}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-primary text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Check className="w-3 h-3" />
              {isUpdating ? "Saving..." : "Save Changes"}
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
                              action.id
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

      {/* Add Role Modal */}
      <AddRoleModal
        open={showAddRole}
        onClose={() => setShowAddRole(false)}
        onSave={handleAddRole}
        basePerms={perms[selectedRole] ?? {}}
      />

      {/* NEW: Clone Role Modal */}
      <AddRoleModal
        open={showCloneRole}
        onClose={() => setShowCloneRole(false)}
        onSave={handleAddRole}
        basePerms={perms[selectedRole] ?? {}}
        baseMeta={{
          name: rm.label,
          description: rm.desc,
          level: rm.level,
        }}
      />
    </div>
  );
}

/* ════════════════════════════════════════════  VIEW: PROJECT ACCESS  */
function ProjectAccessView() {
  const [filterDeptId, setFilterDeptId] = useState<string>("all"); // Now using ID
  const [access, setAccess] = useState<
    Record<string, Record<string, AccessLevel>>
  >({});

  const { data: departmentsData, isLoading: deptsLoading } =
    useGetApiDepartments();
  //  API call
  const { data, isLoading, isError, refetch } = useGetApiProjectsAccessAll({
    department_id: filterDeptId === "all" ? undefined : filterDeptId,
  });
  const queryClient = useQueryClient();

  //  PATCH mutation
  const { mutate } = usePatchApiProjectsIdAccess({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: getApiProjectsAccessAllQueryKey(),
        });
      },
      onError: (err) => {
        console.error("Update failed", err);
      },
    },
  });

  // Transform departments for filter
  const departments = useMemo(() => {
    if (!departmentsData) return [];
    return departmentsData.map((dept: any) => ({
      id: dept.id || dept.department_id,
      name: dept.name || dept.department_name || dept.title,
    }));
  }, [departmentsData]);

  //  Transform users
  const users = useMemo(() => {
    if (!data) return [];

    return data.map((u: any) => ({
      id: u.uid,
      name: u.full_name,
      role: u.role,
      department: u.department,
      initials:
        u.full_name
          ?.split(" ")
          .map((n: string) => n[0])
          .join("") || "",
    }));
  }, [data]);

  //  Extract projects (keep UI as name, but store id mapping)
  const projects = useMemo(() => {
    if (!data?.[0]?.project_access) return [];
    return data[0].project_access.map((p: any) => ({
      id: p.project_id,
      name: p.project_name,
    }));
  }, [data]);
  //  name -> id map (for UI compatibility)
  const projectNameToIdMap = useMemo(() => {
    const map: Record<string, string> = {};
    projects.forEach((p) => {
      map[p.name] = p.id;
    });
    return map;
  }, [projects]);

  //  Convert access map (store by project_id internally)
  const accessMap = useMemo(() => {
    if (!data) return {};

    const map: Record<string, Record<string, AccessLevel>> = {};

    data.forEach((user: any) => {
      map[user.uid] = {};
      user.project_access.forEach((p: any) => {
        const level = p.access_level.toLowerCase() as AccessLevel;
        map[user.uid][p.project_id] = level;
      });
    });

    return map;
  }, [data]);

  //  Sync API → state
  useEffect(() => {
    if (accessMap) {
      setAccess(accessMap);
    }
  }, [accessMap]);

  // Filter options
  const depts = useMemo(() => {
    return [{ id: "all", name: "All Departments" }, ...departments];
  }, [departments]);

  const filteredUsers = users;

  //  Update access (UI uses project name, internally convert to id)
  const updateAccess = (
    userId: string,
    projectName: string,
    level: AccessLevel
  ) => {
    const projectId = projectNameToIdMap[projectName];
    if (!projectId) return;

    // Convert to backend format
    const backendLevel = level.charAt(0).toUpperCase() + level.slice(1);

    // Optimistic update (keep lowercase internally)
    setAccess((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [projectId]: level,
      },
    }));

    //  FIXED PAYLOAD
    mutate({
      id: projectId,
      data: {
        user_id: userId, // ← NOT user_uid
        access_level: backendLevel, // "Edit", "Full", etc.
      },
    });
  };
  const levelColor: Record<AccessLevel, string> = {
    full: "bg-emerald-500",
    edit: "bg-blue-500",
    view: "bg-slate-300",
    none: "bg-red-200",
  };

  // Loading / Error
  if (isLoading) return <div className="p-4 text-sm">Loading...</div>;
  if (isError)
    return <div className="p-4 text-sm text-red-500">Failed to load data</div>;

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
        {/* Department Filter */}
        <select
          value={filterDeptId}
          onChange={(e) => setFilterDeptId(e.target.value)}
          className="px-3 py-1.5 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          {depts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Matrix Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                <th className="px-5 py-3 text-left text-[10px] font-black text-muted-foreground uppercase tracking-wide lg:sticky left-0 bg-muted/10 min-w-[180px]">
                  User
                </th>
                <th className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wide min-w-[100px]">
                  Role
                </th>
                {projects.map((p) => (
                  <th
                    key={p.id}
                    className="px-4 py-3 text-center text-[10px] font-bold text-muted-foreground min-w-[140px]"
                  >
                    <div className="leading-tight">
                      {p.name.split(" ").slice(0, 2).join(" ")}
                    </div>
                    <div className="text-[8px] opacity-60">
                      {p.name.split(" ").slice(2).join(" ")}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {filteredUsers.map((u: any, ri: number) => (
                <tr
                  key={u.id}
                  className={`hover:bg-muted/10 transition-colors ${
                    ri % 2 === 0 ? "" : "bg-muted/5"
                  }`}
                >
                  <td className="px-5 py-3 lg:sticky left-0 bg-card">
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

                  <td className="px-4 py-3">
                    <RoleBadge roleId={u.role} small />
                  </td>

                  {projects.map((p) => {
                    const level = (access[u.id]?.[p.id] ??
                      "none") as AccessLevel;

                    return (
                      <td key={p.id} className="px-4 py-3 text-center">
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
                            onChange={(lv) => updateAccess(u.id, p.name, lv)}
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
            )
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

  // APIs
  const { data: usersData } = useGetApiUsers({
    user_status: "Active",
  });

  const { data: allUsersData } = useGetApiUsers();

  const { data: rolesData } = useGetApiUserRoles();

  const { data: projectsData } = useGetApiProjects();

  // Counts
  const activeUsers = usersData?.count ?? 0;

  const totalUsers = allUsersData?.count ?? 0;

  const totalRoles = rolesData?.count ?? 0;

  const totalProjects = projectsData?.total ?? 0;

  const TABS: {
    id: ViewTab;
    label: string;
    icon: React.ElementType;
    count?: number;
  }[] = [
    {
      id: "users",
      label: "Users",
      icon: Users,
      count: totalUsers,
    },
    {
      id: "roles",
      label: "Roles & Permissions",
      icon: Shield,
    },
    {
      id: "projects",
      label: "Project Access",
      icon: FolderKanban,
    },
    {
      id: "shifts",
      label: "Shift Management",
      icon: Clock,
    },
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

            <strong className="text-foreground">{activeUsers} Active</strong>
          </span>

          <span>·</span>

          <span>{totalRoles} Roles</span>

          <span>·</span>

          <span>{totalProjects} Projects</span>
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
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
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
