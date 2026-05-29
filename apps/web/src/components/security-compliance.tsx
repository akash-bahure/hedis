import { useState, useMemo, useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetApiAuditLogs } from "@/api/hooks/Audit LogsHooks/useGetApiAuditLogs";
import { useGetApiSecurityPasswordPolicy } from "@/api/hooks/Security DashboardHooks/useGetApiSecurityPasswordPolicy";
import { usePutApiSecurityPasswordPolicy } from "@/api/hooks/Security DashboardHooks/usePutApiSecurityPasswordPolicy";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getApiSecurityDashboardMfaV2QueryKey,
  getApiSecurityDashboardSessionManagementV2QueryKey,
  putApiSecurityDashboardMfaV2MutationRequestGracePeriodEnum,
  putApiSecurityDashboardSessionManagementV2MutationRequestMaxConcurrentSessionsEnum,
  putApiSecurityDashboardSessionManagementV2MutationRequestSessionTimeoutEnum,
  useGetApiSecurityDashboardMfaV2,
  useGetApiSecurityDashboardSessionManagementV2,
  usePutApiSecurityDashboardMfaV2,
  usePutApiSecurityDashboardSessionManagementV2,
} from "@/api";
import { getApiAuditLogsExport } from "@/api";
import {
  useGetApiSecurityStats,
  useGetApiSecurityAllowedIps,
  useGetApiSecurityLoginActivity,
  usePostApiSecurityAllowedIps,
  useDeleteApiSecurityAllowedIpsId,
} from "@/api";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
  Smartphone,
  Globe,
  Mail,
  Users,
  Activity,
  FileText,
  Download,
  Search,
  RefreshCw,
  Calendar,
  Database,
  Bell,
  ChevronDown,
  ChevronRight,
  Info,
  LogIn,
  LogOut,
  Edit2,
  RotateCcw,
  Code2,
  ClipboardCheck,
  Zap,
  Monitor,
  Terminal,
  ShieldCheck,
  ShieldAlert,
  ShieldOff,
  FileLock2,
  EyeOff,
  MapPin,
  Hash,
  Plus,
  Trash2,
  Filter,
  Server,
  Cpu,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  X,
  Check,
  FolderKanban,
  AlertOctagon,
  Fingerprint,
  Network,
  Layers,
  BookOpen,
  UserX,
  ClipboardList,
  FileWarning,
  Loader2,
  Save,
} from "lucide-react";
import {
  getApiProjectsQueryParamsStatusEnum,
  getApiSecurityComplianceDataRetentionPolicyQueryKey,
  putApiSecurityComplianceAccessExpiryPolicyMutationRequestAuthTokenLifetimeEnum,
  putApiSecurityComplianceAccessExpiryPolicyMutationRequestForceReauthenticationEnum,
  putApiSecurityComplianceAccessExpiryPolicyMutationRequestInactivityDeactivationEnum,
  PutApiSecurityComplianceDataRetentionPolicyMutationRequest,
  putApiSecurityComplianceDataRetentionPolicyMutationRequestAuditLogsEnum,
  putApiSecurityComplianceDataRetentionPolicyMutationRequestBackupSnapshotsEnum,
  putApiSecurityComplianceDataRetentionPolicyMutationRequestExportLogsEnum,
  putApiSecurityComplianceDataRetentionPolicyMutationRequestPhiRecordsEnum,
  putApiSecurityComplianceDataRetentionPolicyMutationRequestSessionLogsEnum,
  useGetApiProjects,
  useGetApiSecurityComplianceAccessExpiryPolicy,
  useGetApiSecurityComplianceDataRetentionPolicy,
  usePutApiSecurityComplianceAccessExpiryPolicy,
  usePutApiSecurityComplianceDataRetentionPolicy,
} from "@/api";

/* ════════════════════════════════════════════  PALETTE  */
const C = {
  blue: "#2563eb",
  teal: "#0d9488",
  emerald: "#10b981",
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
  violet: "#8b5cf6",
  slate: "#64748b",
};

/* ════════════════════════════════════════════  DATA  */
const LOGIN_ACTIVITY = [
  { h: "00", logins: 0, failed: 0 },
  { h: "01", logins: 0, failed: 0 },
  { h: "02", logins: 1, failed: 0 },
  { h: "03", logins: 0, failed: 0 },
  { h: "04", logins: 0, failed: 0 },
  { h: "05", logins: 0, failed: 0 },
  { h: "06", logins: 0, failed: 0 },
  { h: "07", logins: 2, failed: 0 },
  { h: "08", logins: 8, failed: 1 },
  { h: "09", logins: 5, failed: 9 },
  { h: "10", logins: 3, failed: 0 },
  { h: "11", logins: 2, failed: 0 },
  { h: "12", logins: 1, failed: 0 },
  { h: "13", logins: 2, failed: 0 },
  { h: "14", logins: 1, failed: 0 },
  { h: "15", logins: 0, failed: 0 },
  { h: "16", logins: 0, failed: 0 },
  { h: "17", logins: 1, failed: 0 },
  { h: "18", logins: 0, failed: 0 },
  { h: "19", logins: 0, failed: 0 },
  { h: "20", logins: 0, failed: 0 },
  { h: "21", logins: 0, failed: 0 },
  { h: "22", logins: 0, failed: 0 },
  { h: "23", logins: 0, failed: 0 },
];

type EventType =
  | "login"
  | "logout"
  | "access"
  | "coding"
  | "audit"
  | "reassign"
  | "override"
  | "export"
  | "user_mgmt"
  | "settings"
  | "failed_login";
type RiskLevel = "low" | "medium" | "high" | "critical";
type LogStatus = "success" | "warning" | "failed";
type AlertSev = "critical" | "high" | "medium" | "low";
type AlertStatus = "active" | "investigating" | "resolved";
type AccessType = "view" | "code" | "audit" | "export" | "edit";

interface AuditLog {
  id: string;
  ts: string;
  user: string;
  userId: string | null;
  eventType: EventType;
  details: string;
  ip: string;
  device: string;
  location: string;
  status: LogStatus;
  risk: RiskLevel;
  project: string | null;
  chartId: string | null;
}
interface AccessLog {
  id: string;
  chartId: string;
  patient: string;
  user: string;
  role: string;
  accessType: AccessType;
  ts: string;
  duration: string;
  ip: string;
  project: string;
}
interface SecurityAlert {
  id: string;
  type: string;
  severity: AlertSev;
  user: string | null;
  description: string;
  ts: string;
  status: AlertStatus;
  ip: string | null;
  details: string;
  category: string;
}

const AUDIT_LOGS: AuditLog[] = [
  {
    id: "AL001",
    ts: "20 Feb, 11:23",
    user: "Arjun Mishra",
    userId: "U013",
    eventType: "export",
    details:
      "PHI bulk export attempt: 847 charts from Apollo project. Access denied.",
    ip: "172.16.8.45",
    device: "Chrome/Win10",
    location: "Pune, IN",
    status: "failed",
    risk: "critical",
    project: "Apollo Inpatient FY26",
    chartId: null,
  },
  {
    id: "AL002",
    ts: "20 Feb, 11:21",
    user: "Sarah Mitchell",
    userId: "U001",
    eventType: "settings",
    details: "Password policy updated: minimum length 8 → 10 characters.",
    ip: "172.16.8.10",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL003",
    ts: "20 Feb, 10:55",
    user: "Ankit Sharma",
    userId: "U003",
    eventType: "coding",
    details: "Coding submitted: CHT-78421 — 12 ICD codes, 4 CPT codes, Apollo.",
    ip: "172.16.8.22",
    device: "Chrome/Win10",
    location: "Pune, IN",
    status: "success",
    risk: "low",
    project: "Apollo Inpatient FY26",
    chartId: "CHT-78421",
  },
  {
    id: "AL004",
    ts: "20 Feb, 10:42",
    user: "Kavita Rao",
    userId: "U007",
    eventType: "access",
    details: "Anomaly: 31 charts accessed in 2 hours (baseline avg: 8/hr).",
    ip: "172.16.8.35",
    device: "Chrome/Win10",
    location: "Delhi, IN",
    status: "warning",
    risk: "high",
    project: "AIIMS Oncology FY26",
    chartId: null,
  },
  {
    id: "AL005",
    ts: "20 Feb, 10:38",
    user: "Shruti Mehta",
    userId: "U010",
    eventType: "override",
    details: "Audit override: CHT-78388 status changed Approved → Rework.",
    ip: "172.16.8.30",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "medium",
    project: "Apollo Inpatient FY26",
    chartId: "CHT-78388",
  },
  {
    id: "AL006",
    ts: "20 Feb, 10:35",
    user: "Vinod Kumar",
    userId: "U011",
    eventType: "audit",
    details: "Audit decision: CHT-78399 Approved — 14 codes validated.",
    ip: "172.16.8.31",
    device: "Firefox/Win10",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: "Apollo Inpatient FY26",
    chartId: "CHT-78399",
  },
  {
    id: "AL007",
    ts: "20 Feb, 10:31",
    user: "Rajesh Kumar",
    userId: "U002",
    eventType: "reassign",
    details: "CHT-78402 reassigned: Mohammed Irfan → Ankit Sharma.",
    ip: "172.16.8.15",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: "Apollo Inpatient FY26",
    chartId: "CHT-78402",
  },
  {
    id: "AL008",
    ts: "20 Feb, 10:28",
    user: "Priti Gupta",
    userId: "U004",
    eventType: "access",
    details: "Chart access: CHT-78422 (Pillai, Sreedevi N.) — coding session.",
    ip: "172.16.8.23",
    device: "Chrome/Win10",
    location: "Pune, IN",
    status: "success",
    risk: "low",
    project: "Apollo Inpatient FY26",
    chartId: "CHT-78422",
  },
  {
    id: "AL009",
    ts: "20 Feb, 10:22",
    user: "Deepa Nair",
    userId: "U009",
    eventType: "access",
    details: "Chart access: CHT-78505 (Nambiar, Rajan T.) — coding session.",
    ip: "172.16.8.41",
    device: "Chrome/Win10",
    location: "Bangalore, IN",
    status: "success",
    risk: "low",
    project: "Max Healthcare Q1",
    chartId: "CHT-78505",
  },
  {
    id: "AL010",
    ts: "20 Feb, 10:15",
    user: "Mohammed Irfan",
    userId: "U008",
    eventType: "access",
    details: "Chart access: CHT-78411 (Pillai, Sreedevi N.) — coding session.",
    ip: "172.16.8.36",
    device: "Chrome/Win10",
    location: "Delhi, IN",
    status: "success",
    risk: "low",
    project: "Fortis Cardiology FY26",
    chartId: "CHT-78411",
  },
  {
    id: "AL011",
    ts: "20 Feb, 09:58",
    user: "Sunita Patel",
    userId: "U006",
    eventType: "coding",
    details: "Coding submitted: CHT-78517 — 9 ICD codes, 4 CPT codes, Fortis.",
    ip: "172.16.8.34",
    device: "Chrome/Win10",
    location: "Delhi, IN",
    status: "success",
    risk: "low",
    project: "Fortis Cardiology FY26",
    chartId: "CHT-78517",
  },
  {
    id: "AL012",
    ts: "20 Feb, 09:42",
    user: "Sarah Mitchell",
    userId: "U001",
    eventType: "login",
    details: "Successful login via Azure AD SSO — 2FA not required (SSO).",
    ip: "172.16.8.10",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL013",
    ts: "20 Feb, 09:33",
    user: "Pooja Rao",
    userId: "U014",
    eventType: "login",
    details: "Successful login with password + 2FA (TOTP).",
    ip: "172.16.8.42",
    device: "Firefox/Win10",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL014",
    ts: "20 Feb, 09:21",
    user: "System",
    userId: null,
    eventType: "failed_login",
    details:
      '7 failed login attempts for "admin" from IP 103.221.45.88 (Singapore).',
    ip: "103.221.45.88",
    device: "Unknown",
    location: "Singapore (Ext)",
    status: "failed",
    risk: "critical",
    project: null,
    chartId: null,
  },
  {
    id: "AL015",
    ts: "20 Feb, 09:15",
    user: "Shruti Mehta",
    userId: "U010",
    eventType: "login",
    details: "Successful login via Azure AD SSO.",
    ip: "172.16.8.30",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL016",
    ts: "20 Feb, 09:02",
    user: "Deepa Nair",
    userId: "U009",
    eventType: "login",
    details: "Successful login with password + 2FA (Email OTP).",
    ip: "172.16.8.41",
    device: "Chrome/Win10",
    location: "Bangalore, IN",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL017",
    ts: "20 Feb, 08:51",
    user: "Mohammed Irfan",
    userId: "U008",
    eventType: "login",
    details: "Successful login with password + 2FA (TOTP).",
    ip: "172.16.8.36",
    device: "Chrome/Win10",
    location: "Delhi, IN",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL018",
    ts: "20 Feb, 08:34",
    user: "Priti Gupta",
    userId: "U004",
    eventType: "login",
    details:
      "Login from new device fingerprint — email verification completed.",
    ip: "172.16.8.23",
    device: "Chrome/Win10 (new)",
    location: "Pune, IN",
    status: "warning",
    risk: "medium",
    project: null,
    chartId: null,
  },
  {
    id: "AL019",
    ts: "20 Feb, 08:15",
    user: "Rajesh Kumar",
    userId: "U002",
    eventType: "login",
    details: "Successful login via Azure AD SSO.",
    ip: "172.16.8.15",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL020",
    ts: "20 Feb, 07:58",
    user: "Ankit Sharma",
    userId: "U003",
    eventType: "login",
    details: "Successful login with password + 2FA (TOTP).",
    ip: "172.16.8.22",
    device: "Chrome/Win10",
    location: "Pune, IN",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL021",
    ts: "20 Feb, 02:14",
    user: "Rahul Verma",
    userId: "U005",
    eventType: "access",
    details:
      "After-hours PHI access: CHT-78319 at 02:14 IST (outside 08:00–20:00).",
    ip: "172.16.8.24",
    device: "Chrome/Win10",
    location: "Pune, IN",
    status: "warning",
    risk: "high",
    project: "Max Healthcare Q1",
    chartId: "CHT-78319",
  },
  {
    id: "AL022",
    ts: "19 Feb, 18:22",
    user: "Kavita Rao",
    userId: "U007",
    eventType: "export",
    details: "Report export: AIIMS Oncology Q4 summary (CSV, 411 records).",
    ip: "172.16.8.35",
    device: "Chrome/Win10",
    location: "Delhi, IN",
    status: "success",
    risk: "medium",
    project: "AIIMS Oncology FY26",
    chartId: null,
  },
  {
    id: "AL023",
    ts: "19 Feb, 17:44",
    user: "Leena Prasad",
    userId: "U012",
    eventType: "logout",
    details: "User logged out — session duration: 8h 14m.",
    ip: "172.16.8.40",
    device: "Chrome/Win10",
    location: "Bangalore, IN",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL024",
    ts: "19 Feb, 16:30",
    user: "Leena Prasad",
    userId: "U012",
    eventType: "access",
    details: "Chart access: CHT-78288 (Nair, Sudha M.) — audit review.",
    ip: "172.16.8.40",
    device: "Chrome/Win10",
    location: "Bangalore, IN",
    status: "success",
    risk: "low",
    project: "AIIMS Oncology FY26",
    chartId: "CHT-78288",
  },
  {
    id: "AL025",
    ts: "19 Feb, 16:11",
    user: "Rahul Verma",
    userId: "U005",
    eventType: "coding",
    details: "Coding submitted: CHT-78319 — 7 ICD codes, 3 CPT codes.",
    ip: "172.16.8.24",
    device: "Chrome/Win10",
    location: "Pune, IN",
    status: "success",
    risk: "low",
    project: "Max Healthcare Q1",
    chartId: "CHT-78319",
  },
  {
    id: "AL026",
    ts: "19 Feb, 14:22",
    user: "Arjun Mishra",
    userId: "U013",
    eventType: "access",
    details: "Chart access by inactive user (on leave): CHT-78291.",
    ip: "172.16.8.45",
    device: "Chrome/Win10",
    location: "Pune, IN",
    status: "warning",
    risk: "medium",
    project: "Apollo Inpatient FY26",
    chartId: "CHT-78291",
  },
  {
    id: "AL027",
    ts: "19 Feb, 11:55",
    user: "Sarah Mitchell",
    userId: "U001",
    eventType: "user_mgmt",
    details: "User Arjun Mishra (U013) status changed: Active → Inactive.",
    ip: "172.16.8.10",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
  {
    id: "AL028",
    ts: "19 Feb, 09:18",
    user: "System",
    userId: null,
    eventType: "failed_login",
    details:
      "3 failed login attempts for rajesh.kumar@healthsys.com (IP: 202.43.18.91).",
    ip: "202.43.18.91",
    device: "Unknown",
    location: "Chennai (Ext)",
    status: "failed",
    risk: "high",
    project: null,
    chartId: null,
  },
  {
    id: "AL029",
    ts: "18 Feb, 17:10",
    user: "Shruti Mehta",
    userId: "U010",
    eventType: "audit",
    details:
      "Audit override: CHT-78244 — escalated to Manager with documentation note.",
    ip: "172.16.8.30",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "medium",
    project: "Max Healthcare Q1",
    chartId: "CHT-78244",
  },
  {
    id: "AL030",
    ts: "18 Feb, 16:01",
    user: "Sarah Mitchell",
    userId: "U001",
    eventType: "settings",
    details: "2FA policy updated: TOTP required for all external-IP logins.",
    ip: "172.16.8.10",
    device: "Chrome/Mac",
    location: "Mumbai HQ",
    status: "success",
    risk: "low",
    project: null,
    chartId: null,
  },
];

const ACCESS_LOGS: AccessLog[] = [
  {
    id: "AX001",
    chartId: "CHT-78421",
    patient: "Verma, Rakesh K.",
    user: "Ankit Sharma",
    role: "Senior Coder",
    accessType: "code",
    ts: "20 Feb, 10:55",
    duration: "8m 32s",
    ip: "172.16.8.22",
    project: "Apollo Inpatient",
  },
  {
    id: "AX002",
    chartId: "CHT-78422",
    patient: "Pillai, Sreedevi N.",
    user: "Priti Gupta",
    role: "Coder",
    accessType: "code",
    ts: "20 Feb, 10:28",
    duration: "12m 11s",
    ip: "172.16.8.23",
    project: "Apollo Inpatient",
  },
  {
    id: "AX003",
    chartId: "CHT-78399",
    patient: "Kapoor, Meera S.",
    user: "Vinod Kumar",
    role: "Auditor (L2)",
    accessType: "audit",
    ts: "20 Feb, 09:55",
    duration: "18m 44s",
    ip: "172.16.8.31",
    project: "Apollo Inpatient",
  },
  {
    id: "AX004",
    chartId: "CHT-78401",
    patient: "Singh, Manpreet K.",
    user: "Shruti Mehta",
    role: "Sr. Auditor",
    accessType: "audit",
    ts: "20 Feb, 09:22",
    duration: "22m 18s",
    ip: "172.16.8.30",
    project: "Max Healthcare",
  },
  {
    id: "AX005",
    chartId: "CHT-78505",
    patient: "Nambiar, Rajan T.",
    user: "Deepa Nair",
    role: "Coder",
    accessType: "code",
    ts: "20 Feb, 10:22",
    duration: "14m 05s",
    ip: "172.16.8.41",
    project: "Max Healthcare",
  },
  {
    id: "AX006",
    chartId: "CHT-78388",
    patient: "Iyer, Krishnan T.",
    user: "Shruti Mehta",
    role: "Sr. Auditor",
    accessType: "audit",
    ts: "20 Feb, 10:38",
    duration: "31m 12s",
    ip: "172.16.8.30",
    project: "Apollo Inpatient",
  },
  {
    id: "AX007",
    chartId: "CHT-78411",
    patient: "Pillai, Sreedevi N.",
    user: "Mohammed Irfan",
    role: "Coder",
    accessType: "code",
    ts: "20 Feb, 10:15",
    duration: "16m 22s",
    ip: "172.16.8.36",
    project: "Fortis Cardiology",
  },
  {
    id: "AX008",
    chartId: "CHT-78517",
    patient: "Gupta, Neha R.",
    user: "Sunita Patel",
    role: "Senior Coder",
    accessType: "code",
    ts: "20 Feb, 09:58",
    duration: "11m 45s",
    ip: "172.16.8.34",
    project: "Fortis Cardiology",
  },
  {
    id: "AX009",
    chartId: "CHT-78601",
    patient: "Kumar, Ravi J.",
    user: "Pooja Rao",
    role: "Jr. Auditor",
    accessType: "audit",
    ts: "20 Feb, 09:55",
    duration: "9m 30s",
    ip: "172.16.8.42",
    project: "Max Healthcare",
  },
  {
    id: "AX010",
    chartId: "CHT-78319",
    patient: "Sharma, Priya V.",
    user: "Rahul Verma",
    role: "Coder",
    accessType: "code",
    ts: "20 Feb, 02:14",
    duration: "23m 08s",
    ip: "172.16.8.24",
    project: "Max Healthcare",
  },
  {
    id: "AX011",
    chartId: "CHT-78291",
    patient: "Arora, Mohan D.",
    user: "Arjun Mishra",
    role: "Jr. Auditor",
    accessType: "view",
    ts: "19 Feb, 14:22",
    duration: "4m 18s",
    ip: "172.16.8.45",
    project: "Apollo Inpatient",
  },
  {
    id: "AX012",
    chartId: "CHT-78288",
    patient: "Nair, Sudha M.",
    user: "Leena Prasad",
    role: "Auditor (L2)",
    accessType: "audit",
    ts: "19 Feb, 16:30",
    duration: "15m 22s",
    ip: "172.16.8.40",
    project: "AIIMS Oncology",
  },
  {
    id: "AX013",
    chartId: "CHT-78102",
    patient: "Gupta, Rahul B.",
    user: "Kavita Rao",
    role: "Coder",
    accessType: "code",
    ts: "20 Feb, 10:42",
    duration: "3m 12s",
    ip: "172.16.8.35",
    project: "AIIMS Oncology",
  },
  {
    id: "AX014",
    chartId: "CHT-78104",
    patient: "Menon, Geetha V.",
    user: "Kavita Rao",
    role: "Coder",
    accessType: "code",
    ts: "20 Feb, 10:38",
    duration: "2m 48s",
    ip: "172.16.8.35",
    project: "AIIMS Oncology",
  },
  {
    id: "AX015",
    chartId: "CHT-78244",
    patient: "Pillai, Nandini J.",
    user: "Shruti Mehta",
    role: "Sr. Auditor",
    accessType: "audit",
    ts: "19 Feb, 17:10",
    duration: "28m 42s",
    ip: "172.16.8.30",
    project: "Max Healthcare",
  },
];

const SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: "SA001",
    type: "Unauthorized PHI Export Attempt",
    severity: "critical",
    user: "Arjun Mishra",
    description:
      "Bulk export of 847 PHI records attempted from Apollo project. Access denied by DLP.",
    ts: "20 Feb, 11:23",
    status: "active",
    ip: "172.16.8.45",
    details:
      "Pattern: all-charts URL export. Account suspended pending investigation. Manager notified.",
    category: "data_exfil",
  },
  {
    id: "SA002",
    type: "Brute Force Login Attempt",
    severity: "critical",
    user: null,
    description:
      '7 consecutive failed login attempts for "admin" from external IP 103.221.45.88 (Singapore).',
    ts: "20 Feb, 09:14",
    status: "investigating",
    ip: "103.221.45.88",
    details:
      "IP not in corporate whitelist. Automated lockout triggered. Blocking rule applied.",
    category: "brute_force",
  },
  {
    id: "SA003",
    type: "Abnormal Chart Access Rate",
    severity: "high",
    user: "Kavita Rao",
    description:
      "31 charts accessed in 2 hours — 3.9× above established baseline of 8 charts/hour.",
    ts: "20 Feb, 10:42",
    status: "active",
    ip: "172.16.8.35",
    details:
      "Delhi office IP, within working hours. Possible credential sharing. Investigation open.",
    category: "anomaly",
  },
  {
    id: "SA004",
    type: "After-Hours PHI Access",
    severity: "high",
    user: "Rahul Verma",
    description:
      "PHI chart (CHT-78319) accessed at 02:14 IST — outside approved window of 08:00–20:00 IST.",
    ts: "20 Feb, 02:14",
    status: "resolved",
    ip: "172.16.8.24",
    details:
      "User claimed emergency rework. Supervisor confirmed. Alert resolved with supervisor note.",
    category: "anomaly",
  },
  {
    id: "SA005",
    type: "New Device Authentication",
    severity: "medium",
    user: "Priti Gupta",
    description:
      "Successful login from unrecognized device — new browser fingerprint detected.",
    ts: "20 Feb, 08:34",
    status: "resolved",
    ip: "172.16.8.23",
    details:
      "User confirmed via email verification challenge. Device fingerprint whitelisted.",
    category: "auth",
  },
  {
    id: "SA006",
    type: "Password Expiry Warning",
    severity: "medium",
    user: null,
    description:
      "3 user accounts have passwords expiring within 7 days: Rahul Verma, Kavita Rao, Arjun Mishra.",
    ts: "20 Feb, 08:00",
    status: "active",
    ip: null,
    details:
      "Automated notifications sent. Force-change policy triggers on day 90 (Feb 27, 2026).",
    category: "policy",
  },
  {
    id: "SA007",
    type: "External IP Failed Login",
    severity: "high",
    user: null,
    description:
      "3 failed login attempts for rajesh.kumar@healthsys.com from unknown external IP 202.43.18.91.",
    ts: "19 Feb, 09:18",
    status: "resolved",
    ip: "202.43.18.91",
    details:
      "IP geo: Chennai. Not a corporate IP. Account locked 30 min. User notified via email.",
    category: "brute_force",
  },
  {
    id: "SA008",
    type: "Inactive User Access",
    severity: "medium",
    user: "Arjun Mishra",
    description:
      "User marked inactive (on leave) accessed 1 chart without re-activation approval.",
    ts: "19 Feb, 14:22",
    status: "resolved",
    ip: "172.16.8.45",
    details:
      "Pre-existing authenticated token used. Token invalidated immediately. Access revoked.",
    category: "policy",
  },
  {
    id: "SA009",
    type: "Session Timeout Policy Override",
    severity: "low",
    user: "Sarah Mitchell",
    description:
      "Admin extended session timeout 30 → 120 min for planned maintenance window.",
    ts: "19 Feb, 23:00",
    status: "resolved",
    ip: "172.16.8.10",
    details:
      "Planned maintenance window. Change approved by CISO. Reverted at 00:30 IST.",
    category: "config",
  },
  {
    id: "SA010",
    type: "Authorized Bulk Data Export",
    severity: "low",
    user: "Kavita Rao",
    description:
      "CSV export of AIIMS Oncology Q4 report (411 records) — within authorized scope.",
    ts: "19 Feb, 18:22",
    status: "resolved",
    ip: "172.16.8.35",
    details:
      "Export within authorized project scope and role. Full audit trail preserved.",
    category: "export",
  },
];

const HIPAA_CONTROLS = [
  {
    ref: "§164.312(a)(1)",
    title: "Access Control",
    desc: "Unique user IDs, automatic logoff, encryption/decryption",
    status: "pass",
    score: 100,
  },
  {
    ref: "§164.312(b)",
    title: "Audit Controls",
    desc: "Hardware, software, procedural mechanisms for audit trails",
    status: "pass",
    score: 100,
  },
  {
    ref: "§164.312(c)(1)",
    title: "Integrity Controls",
    desc: "Authenticate ePHI — protect from improper alteration/destruction",
    status: "pass",
    score: 98,
  },
  {
    ref: "§164.312(d)",
    title: "Person/Entity Authentication",
    desc: "Verify identity before granting access to ePHI",
    status: "pass",
    score: 100,
  },
  {
    ref: "§164.312(e)(1)",
    title: "Transmission Security",
    desc: "Guard against unauthorized access during ePHI transmission",
    status: "pass",
    score: 100,
  },
  {
    ref: "§164.308(a)(1)",
    title: "Security Management Process",
    desc: "Risk analysis, risk management, sanction policy",
    status: "pass",
    score: 96,
  },
  {
    ref: "§164.308(a)(3)",
    title: "Workforce Access Management",
    desc: "Workforce clearance and termination procedures",
    status: "warn",
    score: 82,
  },
  {
    ref: "§164.308(a)(4)",
    title: "Information Access Management",
    desc: "Isolating healthcare clearinghouse, access authorization",
    status: "pass",
    score: 94,
  },
  {
    ref: "§164.308(a)(5)",
    title: "Security Awareness Training",
    desc: "Security reminders, protection from malicious software",
    status: "pass",
    score: 91,
  },
  {
    ref: "§164.308(a)(6)",
    title: "Security Incident Procedures",
    desc: "Identify and respond to security incidents",
    status: "pass",
    score: 97,
  },
  {
    ref: "§164.310(a)",
    title: "Facility Access Controls",
    desc: "Physical access to electronic information systems",
    status: "warn",
    score: 78,
  },
  {
    ref: "§164.310(d)",
    title: "Device & Media Controls",
    desc: "Disposal, re-use, and accountability of media with ePHI",
    status: "pass",
    score: 88,
  },
];

/* ════════════════════════════════════════════  HELPERS  */
function Toggle({
  on,
  onChange,
  disabled = false,
}: {
  on: boolean;
  onChange: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={!disabled ? onChange : undefined}
      className={`relative w-9 h-5 rounded-full flex-shrink-0 transition-colors ${disabled ? "cursor-not-allowed opacity-40 bg-muted" : on ? "bg-primary cursor-pointer" : "bg-slate-200 cursor-pointer hover:bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${on ? "translate-x-4" : ""}`}
      />
    </button>
  );
}

function SeverityBadge({ s }: { s: AlertSev }) {
  const c = {
    critical: "bg-red-50 border-red-200 text-red-700",
    high: "bg-orange-50 border-orange-200 text-orange-700",
    medium: "bg-amber-50 border-amber-200 text-amber-700",
    low: "bg-slate-100 border-slate-200 text-slate-600",
  }[s];
  const Icon =
    s === "critical"
      ? AlertOctagon
      : s === "high"
        ? AlertCircle
        : s === "medium"
          ? AlertTriangle
          : Info;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border ${c}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {s.charAt(0).toUpperCase() + s.slice(1)}
    </span>
  );
}

function RiskBadge({ r }: { r: RiskLevel }) {
  const c = {
    critical: "bg-red-50 border-red-200 text-red-700",
    high: "bg-orange-50 border-orange-200 text-orange-700",
    medium: "bg-amber-50 border-amber-200 text-amber-700",
    low: "bg-emerald-50 border-emerald-200 text-emerald-700",
  }[r];
  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${c} capitalize`}
    >
      {r}
    </span>
  );
}

function EventBadge({ t }: { t?: string | null }) {
  const map: Record<
    string,
    { bg: string; text: string; Icon: React.ElementType; label: string }
  > = {
    login: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      Icon: LogIn,
      label: "Login",
    },
    logout: {
      bg: "bg-slate-100",
      text: "text-slate-600",
      Icon: LogOut,
      label: "Logout",
    },
    export: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      Icon: Download,
      label: "Export",
    },
    "user updated": {
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      Icon: Users,
      label: "User Mgmt",
    },
    "login failed": {
      bg: "bg-red-50",
      text: "text-red-700",
      Icon: XCircle,
      label: "Failed Login",
    },
    "2fa verification": {
      bg: "bg-cyan-50",
      text: "text-cyan-700",
      Icon: Shield,
      label: "2FA",
    },
    "2fa verification failed": {
      bg: "bg-red-50",
      text: "text-red-700",
      Icon: XCircle,
      label: "2FA Failed",
    },
  };

  const normalized =
    t?.toString()?.trim()?.toLowerCase()?.replace(/\s+/g, " ") || "";

  // Try exact match first, then partial match
  let config =
    map[normalized] ||
    Object.values(map).find((c) => normalized.includes(c.label.toLowerCase()));

  if (!config) {
    config = {
      bg: "bg-muted",
      text: "text-muted-foreground",
      Icon: Activity,
      label: t?.split(" ")[0] || "Unknown", // Fallback: first word
    };
  }

  const { bg, text, Icon, label } = config;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${bg} ${text} whitespace-nowrap`}
    >
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}
function AccessTypeBadge({ t }: { t: AccessType }) {
  const c = {
    code: "bg-blue-50 text-blue-700",
    audit: "bg-teal-50 text-teal-700",
    view: "bg-slate-100 text-slate-600",
    export: "bg-amber-50 text-amber-700",
    edit: "bg-violet-50 text-violet-700",
  }[t];
  return (
    <span
      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${c} capitalize`}
    >
      {t}
    </span>
  );
}

function StatusDot({ s }: { s: LogStatus }) {
  const c = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    failed: "bg-red-500",
  }[s];
  const label = { success: "Success", warning: "Warning", failed: "Failed" }[s];
  const tc = {
    success: "text-emerald-700",
    warning: "text-amber-700",
    failed: "text-red-700",
  }[s];
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-bold ${tc}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c}`} />
      {label}
    </span>
  );
}

function AlertStatusBadge({ s }: { s: AlertStatus }) {
  const c = {
    active: "bg-red-50 border-red-200 text-red-700",
    investigating: "bg-amber-50 border-amber-200 text-amber-700",
    resolved: "bg-emerald-50 border-emerald-200 text-emerald-700",
  }[s];
  return (
    <span
      className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${c} capitalize`}
    >
      {s}
    </span>
  );
}

function SecurityScoreGauge({ score = 92 }: { score: number }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = circ - (score / 100) * circ;
  const col = score >= 90 ? C.emerald : score >= 75 ? C.amber : C.red;
  const lbl = score >= 90 ? "Excellent" : score >= 75 ? "Good" : "At Risk";
  const lcls =
    score >= 90
      ? "text-emerald-600"
      : score >= 75
        ? "text-amber-600"
        : "text-red-600";
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-28 h-28">
        <svg viewBox="0 0 116 116" className="w-full h-full -rotate-90">
          <circle
            cx="58"
            cy="58"
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="10"
          />
          <circle
            cx="58"
            cy="58"
            r={r}
            fill="none"
            stroke={col}
            strokeWidth="10"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black" style={{ color: col }}>
            {score}
          </span>
          <span className="text-[9px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-black text-foreground">Security Score</p>
      <p className={`text-[10px] font-bold ${lcls}`}>{lbl}</p>
    </div>
  );
}

function SettingCard({
  title,
  icon: Icon,
  iconColor = "text-primary",
  children,
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
        <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center flex-shrink-0">
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="text-xs font-black text-foreground">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onChange,
  badge,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onChange: () => void;
  badge?: { text: string; cls: string };
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-foreground">
            {label}
          </span>
          {badge && (
            <span
              className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${badge.cls}`}
            >
              {badge.text}
            </span>
          )}
        </div>
        {sub && (
          <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight">
            {sub}
          </p>
        )}
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

function CustomTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl px-3 py-2 text-[11px]">
      <p className="font-bold text-muted-foreground mb-1">{label}:00</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color || p.fill }}
          />
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-bold text-foreground ml-auto">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: SECURITY DASHBOARD  */
function SecurityDashboardTab() {
  const [phi, setPhi] = useState({
    encRest: true,
    encTransit: true,
    phiMask: true,
    auditTrail: true,
    deIdExport: true,
    dlp: true,
  });

  const queryClient = useQueryClient();
  const { data: policyData, isLoading: isLoadingPolicy } =
    useGetApiSecurityPasswordPolicy();

  const [pass, setPass] = useState({
    minLen: 10,
    upper: true,
    lower: true,
    nums: true,
    symbols: true,
    expiry: 90,
    history: 10,
    maxAttempts: 5,
  });

  // Sync state when data is loaded
  useEffect(() => {
    if (policyData?.data) {
      const policy = policyData.data;

      setPass({
        minLen: policy.min_length ?? 8,
        upper: policy.require_uppercase ?? true,
        lower: policy.require_lowercase ?? true,
        nums: policy.require_numbers ?? true,
        symbols: policy.require_symbols ?? true,
        expiry: policy.expiry_days ?? 90,
        history: policy.history_count ?? 10,
        maxAttempts: policy.max_failed_attempts ?? 5,
      });
    }
  }, [policyData]);

  const { mutate: updatePolicy, isPending: isUpdatingPolicy } =
    usePutApiSecurityPasswordPolicy({
      mutation: {
        onSuccess: () => {
          toast.success("Password policy updated successfully");
          queryClient.invalidateQueries({
            queryKey: [{ url: "/api/security/password-policy" }],
          });
        },
        onError: (error: any) => {
          toast.error(
            error?.response?.data?.message || "Failed to update password policy"
          );
        },
      },
    });

  const handleSavePolicy = () => {
    updatePolicy({
      data: {
        min_length: pass.minLen,
        expiry_days: pass.expiry,
        history_count: pass.history,
        require_uppercase: pass.upper,
        require_lowercase: pass.lower,
        require_numbers: pass.nums,
        require_symbols: pass.symbols,
        max_failed_attempts: pass.maxAttempts,
      },
    });
  };

  const [sess, setSess] = useState({
    timeout: 30,
    maxConc: 1,
    idleLogout: true,
    ipBind: true,
    rememberMe: false,
  });
  const [tfa, setTfa] = useState({
    enabled: true,
    totp: true,
    sms: false,
    email: true,
    newDevice: true,
    gracePeriod: 24,
  });

  const [newIp, setNewIp] = useState("");

  const {
    data: sessionManagementData,
    isLoading: isSessionManagementLoading,
    refetch: refetchSessionManagement,
  } = useGetApiSecurityDashboardSessionManagementV2({
    query: {
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    const sessionData = sessionManagementData?.data;

    if (!sessionData) return;

    setSess((prev) => ({
      ...prev,

      timeout:
        sessionData.session_timeout === "15 min"
          ? 15
          : sessionData.session_timeout === "30 min"
            ? 30
            : sessionData.session_timeout === "1 hour"
              ? 60
              : 120,

      maxConc:
        sessionData.max_concurrent_sessions === "1 session"
          ? 1
          : sessionData.max_concurrent_sessions === "2 sessions"
            ? 2
            : 5,
    }));
  }, [sessionManagementData]);
  const {
    mutate: updateSessionManagement,
    isPending: isUpdatingSessionManagement,
  } = usePutApiSecurityDashboardSessionManagementV2({
    mutation: {
      onSuccess: async () => {
        toast.success("Session management updated successfully");

        await queryClient.invalidateQueries({
          queryKey: getApiSecurityDashboardSessionManagementV2QueryKey(),
        });

        refetchSessionManagement();
      },

      onError: () => {
        toast.error("Failed to update session management");
      },
    },
  });

  const handleUpdateSessionManagement = () => {
    updateSessionManagement({
      data: {
        session_timeout:
          sess.timeout === 15
            ? putApiSecurityDashboardSessionManagementV2MutationRequestSessionTimeoutEnum[
                "15minutes"
              ]
            : sess.timeout === 60
              ? putApiSecurityDashboardSessionManagementV2MutationRequestSessionTimeoutEnum[
                  "1hr"
                ]
              : sess.timeout === 120
                ? putApiSecurityDashboardSessionManagementV2MutationRequestSessionTimeoutEnum[
                    "2hr"
                  ]
                : putApiSecurityDashboardSessionManagementV2MutationRequestSessionTimeoutEnum[
                    "30"
                  ],

        max_concurrent_sessions:
          sess.maxConc === 1
            ? putApiSecurityDashboardSessionManagementV2MutationRequestMaxConcurrentSessionsEnum[
                "1 session"
              ]
            : sess.maxConc === 2
              ? putApiSecurityDashboardSessionManagementV2MutationRequestMaxConcurrentSessionsEnum[
                  "2 sessions"
                ]
              : putApiSecurityDashboardSessionManagementV2MutationRequestMaxConcurrentSessionsEnum[
                  "5 sessions"
                ],

        idle_session_logout: sess.idleLogout,
        session_ip_binding: sess.ipBind,
        remember_me: sess.rememberMe,
      },
    });
  };

  const {
    data: mfaData,
    isLoading: isMfaLoading,
    refetch: refetchMfa,
  } = useGetApiSecurityDashboardMfaV2({
    query: {
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    const policy = mfaData?.data;

    if (!policy) return;

    setTfa({
      enabled: policy.require_2fa ?? true,
      totp: policy.totp_authenticator ?? true,
      sms: policy.sms_otp ?? false,
      email: policy.email_otp ?? true,
      newDevice: policy.new_device_verify ?? true,

      gracePeriod:
        policy.grace_period === "none"
          ? 0
          : policy.grace_period === "6h"
            ? 6
            : policy.grace_period === "12h"
              ? 12
              : policy.grace_period === "24hr"
                ? 24
                : 48,
    });
  }, [mfaData]);

  const { mutate: updateMfa, isPending: isUpdatingMfa } =
    usePutApiSecurityDashboardMfaV2({
      mutation: {
        onSuccess: async () => {
          toast.success("MFA settings updated successfully");

          await queryClient.invalidateQueries({
            queryKey: getApiSecurityDashboardMfaV2QueryKey(),
          });

          refetchMfa();
        },

        onError: () => {
          toast.error("Failed to update MFA settings");
        },
      },
    });

  const handleUpdateMfa = () => {
    updateMfa({
      data: {
        require_2fa: tfa.enabled,
        totp_authenticator: tfa.totp,
        sms_otp: tfa.sms,
        email_otp: tfa.email,
        new_device_verify: tfa.newDevice,

        grace_period:
          tfa.gracePeriod === 0
            ? putApiSecurityDashboardMfaV2MutationRequestGracePeriodEnum.none
            : tfa.gracePeriod === 6
              ? putApiSecurityDashboardMfaV2MutationRequestGracePeriodEnum["6h"]
              : tfa.gracePeriod === 12
                ? putApiSecurityDashboardMfaV2MutationRequestGracePeriodEnum[
                    "12h"
                  ]
                : tfa.gracePeriod === 24
                  ? putApiSecurityDashboardMfaV2MutationRequestGracePeriodEnum[
                      "24hr"
                    ]
                  : putApiSecurityDashboardMfaV2MutationRequestGracePeriodEnum[
                      "48hr"
                    ],
      },
    });
  };

  // Allowed IP APIs
  const { data: allowedIpsData, isLoading: isLoadingAllowedIps } =
    useGetApiSecurityAllowedIps();

  const { mutate: addAllowedIp, isPending: isAddingIp } =
    usePostApiSecurityAllowedIps({
      mutation: {
        onSuccess: () => {
          toast.success("IP range added successfully");

          setNewIp("");

          queryClient.invalidateQueries({
            queryKey: [{ url: "/api/security/allowed-ips" }],
          });
        },

        onError: (error: any) => {
          toast.error(error?.response?.data?.error || "Failed to add IP range");
        },
      },
    });

  const { mutate: deleteAllowedIp } = useDeleteApiSecurityAllowedIpsId({
    mutation: {
      onSuccess: () => {
        toast.success("IP range deleted successfully");

        queryClient.invalidateQueries({
          queryKey: [{ url: "/api/security/allowed-ips" }],
        });
      },

      onError: (error: any) => {
        toast.error(
          error?.response?.data?.message || "Failed to delete IP range"
        );
      },
    },
  });

  // Safe allowed IP mapping
  const allowedIps = Array.isArray(allowedIpsData?.data)
    ? allowedIpsData.data
    : [];

  const handleAddIp = () => {
    const trimmedIp = newIp.trim();

    if (!trimmedIp) {
      toast.error("CIDR range is required");
      return;
    }

    addAllowedIp({
      data: {
        cidr: trimmedIp,
        description: "Allowed network",
      },
    });
  };

  const toggle = (obj: any, set: any, key: string) =>
    set({ ...obj, [key]: !obj[key] });

  // Fetch Security Stats
  const { data: statsData, isLoading: isLoadingStats } =
    useGetApiSecurityStats();

  // Safe stats object
  const stats = statsData?.data;

  // Stats type
  type SecurityStats = NonNullable<typeof stats>;

  // Helper to safely access stats
  const getStat = <K extends keyof SecurityStats>(
    key: K,
    fallback: NonNullable<SecurityStats[K]>
  ): NonNullable<SecurityStats[K]> => {
    return (stats?.[key] ?? fallback) as NonNullable<SecurityStats[K]>;
  };

  // Login Activity API
  const { data: loginActivityData, isLoading: isLoadingLoginActivity } =
    useGetApiSecurityLoginActivity();

  // Login activity data safe handling
  const loginActivity =
    loginActivityData?.data?.hourly?.map((item: any) => ({
      h: new Date(item.hour).getHours().toString().padStart(2, "0"),
      logins: Number(item.successful) || 0,
      failed: Number(item.failed) || 0,
    })) ?? [];

  // Totals
  const successfulTotal = loginActivityData?.data?.totals?.successful ?? 0;

  const failedTotal = loginActivityData?.data?.totals?.failed ?? 0;

  // Peak anomaly hour (highest failed attempts)
  const peakAnomaly =
    loginActivity.length > 0
      ? loginActivity.reduce((prev: any, current: any) =>
          current.failed > prev.failed ? current : prev
        )
      : null;

  return (
    <div className="space-y-5">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {isLoadingStats
          ? // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card border border-border rounded-2xl px-4 py-6 animate-pulse"
              />
            ))
          : [
              {
                key: "securityScore",
                label: getStat("securityScore", {}).label || "Security Score",
                value: `${getStat("securityScore", {}).score || 92}/100`,
                sub: getStat("securityScore", {}).posture || "Good posture",
                icon: ShieldCheck,
                bg: "bg-emerald-50",
                color: "text-emerald-600",
                badge: getStat("securityScore", {}).trend || "↑ +2 this week",
              },
              {
                key: "activeSessions",
                label: getStat("activeSessions", {}).label || "Active Sessions",
                value: getStat("activeSessions", {}).value ?? 0,
                sub: getStat("activeSessions", {}).footer || "right now",
                icon: Monitor,
                bg: "bg-blue-50",
                color: "text-blue-600",
                badge: null,
              },
              {
                key: "phiEvents",
                label: getStat("phiEvents", {}).label || "PHI Events (24h)",
                value: getStat("phiEvents", {}).value ?? 0,
                sub: getStat("phiEvents", {}).footer || "chart accesses",
                icon: FileText,
                bg: "bg-violet-50",
                color: "text-violet-600",
                badge: null,
              },
              {
                key: "failedLogins",
                label:
                  getStat("failedLogins", {}).label || "Failed Logins (24h)",
                value: getStat("failedLogins", {}).value ?? 0,
                sub: getStat("failedLogins", {}).footer || "",
                icon: ShieldAlert,
                bg: "bg-red-50",
                color: "text-red-600",
                badge: getStat("failedLogins", {}).criticalCount
                  ? `${getStat("failedLogins", {}).criticalCount} critical`
                  : null,
              },
            ].map((k) => {
              const Icon = k.icon;
              return (
                <div
                  key={k.key}
                  className="bg-card border border-border rounded-2xl px-4 py-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <div
                      className={`w-9 h-9 ${k.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className={`w-4.5 h-4.5 ${k.color}`} />
                    </div>
                    {k.badge && (
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded-full ${
                          k.badge.includes("critical")
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : "bg-emerald-50 text-emerald-700"
                        }`}
                      >
                        {k.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-2xl font-black text-foreground leading-none">
                    {k.value}
                  </div>
                  <div className="text-[11px] font-semibold text-foreground mt-0.5">
                    {k.label}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {k.sub}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Login Activity + Score Gauge */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-primary" />
            </div>

            <div>
              <p className="text-xs font-black text-foreground">
                Login Activity — Today (Hourly)
              </p>

              <p className="text-[10px] text-muted-foreground">
                Successful logins vs failed attempts over 24 hours
              </p>
            </div>
          </div>

          {isLoadingLoginActivity ? (
            <div className="h-[180px] flex items-center justify-center">
              <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <ComposedChart
                  data={loginActivity}
                  margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
                >
                  <defs>
                    <linearGradient id="lgGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={C.blue} stopOpacity={0.2} />
                      <stop
                        offset="100%"
                        stopColor={C.blue}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e5e7eb"
                    strokeOpacity={0.5}
                  />

                  <XAxis
                    dataKey="h"
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}h`}
                  />

                  <YAxis
                    tick={{ fontSize: 9, fill: "#94a3b8" }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip content={<CustomTip />} />

                  <Area
                    type="monotone"
                    dataKey="logins"
                    name="Successful"
                    stroke={C.blue}
                    fill="url(#lgGrad)"
                    strokeWidth={2}
                    dot={false}
                  />

                  <Bar
                    dataKey="failed"
                    name="Failed"
                    fill={C.red}
                    fillOpacity={0.8}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={14}
                  />

                  {peakAnomaly && peakAnomaly.failed > 0 && (
                    <ReferenceLine
                      x={peakAnomaly.h}
                      stroke={C.amber}
                      strokeDasharray="4 2"
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>

              <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded bg-blue-500" />
                  Successful ({successfulTotal} total)
                </span>

                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-1.5 rounded bg-red-400" />
                  Failed ({failedTotal} total)
                </span>

                {peakAnomaly && peakAnomaly.failed > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span
                      className="w-3 h-px bg-amber-400 inline-block"
                      style={{
                        borderTop: "2px dashed #f59e0b",
                        width: "12px",
                      }}
                    />
                    Peak anomaly ({peakAnomaly.h}:00)
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {/* Score Gauge */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center gap-4">
          <SecurityScoreGauge score={92} />
          <div className="w-full space-y-2 mt-1">
            {[
              { label: "Authentication", score: 98, c: "bg-emerald-500" },
              { label: "Data Protection", score: 95, c: "bg-emerald-500" },
              { label: "Access Control", score: 91, c: "bg-blue-500" },
              { label: "Audit Coverage", score: 88, c: "bg-blue-500" },
              { label: "Facility/Device", score: 80, c: "bg-amber-500" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2">
                <span className="text-[9px] text-muted-foreground w-28 flex-shrink-0">
                  {s.label}
                </span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${s.c} rounded-full`}
                    style={{ width: `${s.score}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-foreground w-7 text-right">
                  {s.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Settings Row 1: PHI + Password */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="PHI & Encryption Controls"
          icon={FileLock2}
          iconColor="text-teal-600"
        >
          <ToggleRow
            label="Encryption at Rest"
            sub="AES-256 for all stored ePHI (database + backups)"
            on={phi.encRest}
            onChange={() => toggle(phi, setPhi, "encRest")}
            badge={{
              text: "FIPS 140-2",
              cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
            }}
          />
          <ToggleRow
            label="Encryption in Transit"
            sub="TLS 1.3 enforced for all API and web traffic"
            on={phi.encTransit}
            onChange={() => toggle(phi, setPhi, "encTransit")}
            badge={{
              text: "TLS 1.3",
              cls: "bg-blue-50 text-blue-700 border border-blue-200",
            }}
          />
          <ToggleRow
            label="PHI Masking in Logs"
            sub="Redact patient identifiers in system audit logs"
            on={phi.phiMask}
            onChange={() => toggle(phi, setPhi, "phiMask")}
          />
          <ToggleRow
            label="Full Access Audit Trail"
            sub="Log every PHI read, write, export and delete"
            on={phi.auditTrail}
            onChange={() => toggle(phi, setPhi, "auditTrail")}
            badge={{
              text: "HIPAA §164.312(b)",
              cls: "bg-violet-50 text-violet-700 border border-violet-200",
            }}
          />
          <ToggleRow
            label="De-identify on Export"
            sub="Auto-apply Safe Harbor de-identification on CSV/PDF exports"
            on={phi.deIdExport}
            onChange={() => toggle(phi, setPhi, "deIdExport")}
          />
          <ToggleRow
            label="DLP Controls"
            sub="Block bulk download/screen-scrape of PHI records"
            on={phi.dlp}
            onChange={() => toggle(phi, setPhi, "dlp")}
          />
        </SettingCard>

        <SettingCard
          title="Password Policy"
          icon={Key}
          iconColor="text-amber-600"
        >
          <div className="space-y-3 relative">
            {isLoadingPolicy && (
              <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-xl">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Min Length",
                  key: "minLen",
                  opts: [8, 10, 12, 14, 16],
                  val: pass.minLen,
                  onChange: (v: number) => setPass({ ...pass, minLen: v }),
                },
                {
                  label: "Expiry (days)",
                  key: "expiry",
                  opts: [30, 60, 90, 180, 365],
                  val: pass.expiry,
                  onChange: (v: number) => setPass({ ...pass, expiry: v }),
                },
                {
                  label: "History",
                  key: "history",
                  opts: [5, 10, 15, 20],
                  val: pass.history,
                  onChange: (v: number) => setPass({ ...pass, history: v }),
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="block text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                    {f.label}
                  </label>
                  <select
                    value={f.val}
                    onChange={(e) => f.onChange(Number(e.target.value))}
                    className="w-full px-2 py-1.5 text-[11px] bg-muted/30 border border-border rounded-lg focus:outline-none appearance-none"
                  >
                    {f.opts.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="pt-1 border-t border-border/50">
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-2">
                Complexity Requirements
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  ["Uppercase letters", "upper"],
                  ["Lowercase letters", "lower"],
                  ["Numbers (0–9)", "nums"],
                  ["Special symbols (!@#$)", "symbols"],
                ].map(([lbl, k]) => (
                  <label
                    key={k}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={(pass as any)[k]}
                      onChange={() =>
                        setPass({ ...pass, [k]: !(pass as any)[k] })
                      }
                      className="accent-primary w-3.5 h-3.5"
                    />
                    <span className="text-[10px] text-foreground">{lbl}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div>
                <p className="text-[10px] font-semibold text-foreground">
                  Max failed attempts
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Lock account after N failures
                </p>
              </div>
              <select
                value={pass.maxAttempts}
                onChange={(e) =>
                  setPass({ ...pass, maxAttempts: Number(e.target.value) })
                }
                className="px-2 py-1.5 text-[11px] bg-muted/30 border border-border rounded-lg focus:outline-none appearance-none w-16 text-center"
              >
                {[3, 5, 7, 10].map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            {/* Save Button */}
            {"Security & Compliance" && (
              <div className="pt-3 border-t border-border/50 flex justify-end">
                <button
                  onClick={handleSavePolicy}
                  disabled={isUpdatingPolicy}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                >
                  {isUpdatingPolicy ? (
                    <RefreshCw className="w-3 h-3 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3" />
                  )}
                  Save Policy
                </button>
              </div>
            )}
          </div>
        </SettingCard>
      </div>

      {/* Settings Row 2: Session + 2FA + IP */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SettingCard
          title="Session Management"
          icon={Clock}
          iconColor="text-blue-600"
        >
          <div className="space-y-2.5">
            {isSessionManagementLoading && (
              <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-xl">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            )}

            {[
              {
                label: "Session Timeout",
                key: "timeout",
                opts: [
                  { v: 15, l: "15 min" },
                  { v: 30, l: "30 min" },
                  { v: 60, l: "1 hour" },
                  { v: 120, l: "2 hours" },
                ],
                val: sess.timeout,
                set: (v: number) => setSess({ ...sess, timeout: v }),
              },
              {
                label: "Max Concurrent Sessions",
                key: "maxConc",
                opts: [
                  { v: 1, l: "1 session" },
                  { v: 2, l: "2 sessions" },
                  { v: 5, l: "5 sessions" },
                ],
                val: sess.maxConc,
                set: (v: number) => setSess({ ...sess, maxConc: v }),
              },
            ].map((f) => (
              <div key={f.key} className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">
                  {f.label}
                </span>
                <select
                  value={f.val}
                  onChange={(e) => f.set(Number(e.target.value))}
                  className="px-2 py-1 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none appearance-none"
                >
                  {f.opts.map((o) => (
                    <option key={o.v} value={o.v}>
                      {o.l}
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <ToggleRow
              label="Idle Session Logout"
              sub="Auto-logout after inactivity period"
              on={sess.idleLogout}
              onChange={() => toggle(sess, setSess, "idleLogout")}
            />
            <ToggleRow
              label="Session IP Binding"
              sub="Invalidate session on IP change"
              on={sess.ipBind}
              onChange={() => toggle(sess, setSess, "ipBind")}
            />
            <ToggleRow
              label="Remember Me"
              sub="Allow persistent sessions (non-PHI)"
              on={sess.rememberMe}
              onChange={() => toggle(sess, setSess, "rememberMe")}
            />

            <div className="pt-3 border-t border-border/50 flex justify-end">
              <button
                onClick={handleUpdateSessionManagement}
                disabled={isUpdatingSessionManagement}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isUpdatingSessionManagement ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}

                {isUpdatingSessionManagement
                  ? "Updating..."
                  : "Save Session Settings"}
              </button>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          title="Multi-Factor Authentication"
          icon={Smartphone}
          iconColor="text-violet-600"
        >
          <div className="space-y-2 relative">
            {isMfaLoading && (
              <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center rounded-xl">
                <RefreshCw className="w-5 h-5 animate-spin text-primary" />
              </div>
            )}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-primary/5 border border-primary/15 mb-3">
              <div>
                <p className="text-[11px] font-black text-foreground">
                  Require 2FA — All Users
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Master enforcement policy
                </p>
              </div>
              <Toggle
                on={tfa.enabled}
                onChange={() => setTfa({ ...tfa, enabled: !tfa.enabled })}
              />
            </div>
            {[
              {
                label: "TOTP Authenticator",
                sub: "Google Auth / Microsoft Auth",
                key: "totp",
                icon: Fingerprint,
              },
              {
                label: "SMS OTP",
                sub: "One-time code via registered mobile",
                key: "sms",
                icon: Smartphone,
              },
              {
                label: "Email OTP",
                sub: "One-time code via registered email",
                key: "email",
                icon: Mail,
              },
              {
                label: "New Device Verify",
                sub: "Verify identity on unknown devices",
                key: "newDevice",
                icon: Monitor,
              },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.key}
                  className="flex items-center justify-between py-1.5 border-b border-border/40 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-semibold text-foreground">
                        {m.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {m.sub}
                      </p>
                    </div>
                  </div>
                  <Toggle
                    on={(tfa as any)[m.key]}
                    onChange={() =>
                      setTfa({ ...tfa, [m.key]: !(tfa as any)[m.key] })
                    }
                    disabled={!tfa.enabled}
                  />
                </div>
              );
            })}
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-foreground">
                Grace period (first login)
              </span>
              <select
                value={tfa.gracePeriod}
                onChange={(e) =>
                  setTfa({ ...tfa, gracePeriod: Number(e.target.value) })
                }
                className="px-2 py-1 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none appearance-none"
              >
                {[0, 6, 12, 24, 48].map((h) => (
                  <option key={h} value={h}>
                    {h === 0 ? "None" : `${h}h`}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-3 border-t border-border/50 flex justify-end">
              <button
                onClick={handleUpdateMfa}
                disabled={isUpdatingMfa}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isUpdatingMfa ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}

                {isUpdatingMfa ? "Updating..." : "Save MFA Settings"}
              </button>
            </div>
          </div>
        </SettingCard>

        <SettingCard
          title="IP Allowlist & Network"
          icon={Network}
          iconColor="text-teal-600"
        >
          <div className="space-y-1">
            <p className="text-[9px] text-muted-foreground mb-2">
              Only allow logins from these CIDR ranges. External IPs require
              additional 2FA.
            </p>
            {isLoadingAllowedIps ? (
              <div className="flex items-center justify-center py-6">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : allowedIps.length === 0 ? (
              <div className="text-[10px] text-muted-foreground text-center py-4">
                No allowed IP ranges found
              </div>
            ) : (
              allowedIps.map((ip: any) => (
                <div
                  key={ip.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/20 border border-border group"
                >
                  <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-mono font-semibold text-foreground truncate">
                      {ip.cidr}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!ip?.id) {
                        toast.error("Invalid IP ID");
                        return;
                      }

                      deleteAllowedIp({
                        id: ip.id,
                      });
                    }}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))
            )}{" "}
            <div className="flex gap-2 mt-2">
              <input
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                placeholder="e.g. 192.168.1.0/24"
                className="flex-1 px-2.5 py-1.5 text-[10px] font-mono bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={handleAddIp}
                className="px-2.5 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                disabled={isAddingIp}
              >
                {isAddingIp ? (
                  <RefreshCw className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}{" "}
              </button>
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: AUDIT LOGS  */
// const EVENT_TYPES: { id: EventType | "all"; label: string }[] = [
//   { id: "all", label: "All Events" },
//   { id: "login", label: "Login" },
//   { id: "logout", label: "Logout" },
//   { id: "access", label: "Chart Access" },
//   { id: "coding", label: "Coding" },
//   { id: "audit", label: "Audit" },
//   { id: "reassign", label: "Reassign" },
//   { id: "override", label: "Override" },
//   { id: "export", label: "Export" },
//   { id: "user_mgmt", label: "User Mgmt" },
//   { id: "failed_login", label: "Failed Login" },
// ];

/* ════════════════════════════════════════════  TAB: AUDIT LOGS  */

const EVENT_TYPE_MAP: Record<string, { label: string; matches: string[] }> = {
  all: { label: "All Events", matches: [] },
  login: { label: "Login", matches: ["Login Success", "Login Failed"] },
  logout: { label: "Logout", matches: ["Logout"] },
  export: { label: "Export", matches: ["Export action"] },
  user_mgmt: { label: "User Mgmt", matches: ["User updated"] },
  failed_login: { label: "Failed Login", matches: ["Login Failed"] },
  "2fa": {
    label: "2FA",
    matches: ["2FA Verification", "2FA Verification Failed"],
  },
};

const EVENT_TYPES = Object.entries(EVENT_TYPE_MAP).map(([id, { label }]) => ({
  id,
  label,
}));

function AuditLogsTab() {
  const { hasPermission } = usePermissions();

  const [search, setSearch] = useState("");
  const [evType, setEvType] = useState<string>("all");
  const [riskF, setRiskF] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  // Get matching backend event types
  const selectedEventConfig = EVENT_TYPE_MAP[evType];

  const eventTypeFilter =
    evType === "all" ? undefined : selectedEventConfig?.matches?.[0];

  const {
    data: auditLogsData,
    isLoading,
    isPlaceholderData,
  } = useGetApiAuditLogs({
    page,
    limit: PER_PAGE,
    search: search || undefined,
    // Send array of possible event types (most APIs support this)
    event_type: eventTypeFilter,
    risk_level:
      riskF === "all"
        ? undefined
        : ((riskF.charAt(0).toUpperCase() + riskF.slice(1)) as any),
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const logs = auditLogsData?.data || [];
  const pagination = auditLogsData?.pagination;
  const totalPages = pagination?.totalPages || 1;
  const totalLogs = pagination?.total || 0;

  // Since we don't have counts for all risks from the paginated API easily without another call,
  // we'll keep the summary based on the current page or just show total.
  // Ideally there's a separate stats API or the backend returns it.
  const criticalCount = logs.filter((l) => l.risk_level === "Critical").length;
  const highCount = logs.filter((l) => l.risk_level === "High").length;

  const handleExport = async () => {
    try {
      toast.loading("Preparing audit logs export...", {
        id: "audit-export",
      });

      const blob = await getApiAuditLogsExport(
        {
          search: search || undefined,
          event_type:
            evType === "all" ? undefined : selectedEventConfig?.matches?.[0],
          risk_level:
            riskF === "all"
              ? undefined
              : riskF.charAt(0).toUpperCase() + riskF.slice(1),
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        },
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;

      link.download = `audit_logs_${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Audit logs exported successfully", {
        id: "audit-export",
      });
    } catch (err: any) {
      console.error("Audit logs export failed:", err);

      toast.error("Failed to export audit logs", {
        id: "audit-export",
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Risk Summary */}
      <div className="flex items-center gap-3 flex-wrap">
        {[
          {
            label: "Critical Events",
            count: criticalCount,
            cls: "bg-red-50 border-red-200 text-red-700",
            Icon: AlertOctagon,
          },
          {
            label: "High Risk",
            count: highCount,
            cls: "bg-orange-50 border-orange-200 text-orange-700",
            Icon: AlertCircle,
          },
          {
            label: "Total Logs",
            count: totalLogs,
            cls: "bg-muted border-border text-foreground",
            Icon: BookOpen,
          },
          {
            label: "Showing",
            count: logs.length,
            cls: "bg-blue-50 border-blue-200 text-blue-700",
            Icon: Filter,
          },
        ].map((s) => {
          const Icon = s.Icon;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-bold ${s.cls}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}: <strong>{s.count}</strong>
            </div>
          );
        })}
        <div className="flex-1" />
        {hasPermission("Security & Compliance", "export") && (
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border border-border rounded-xl hover:bg-muted transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export Logs
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search user, details…"
            className="w-full pl-8 pr-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={evType}
          onChange={(e) => {
            setEvType(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          {EVENT_TYPES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={riskF}
          onChange={(e) => {
            setRiskF(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          <option value="all">All Risk Levels</option>
          {["critical", "high", "medium", "low"].map((r) => (
            <option key={r} value={r} className="capitalize">
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 border border-border rounded-xl px-2 bg-card">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="py-2 text-[10px] bg-transparent focus:outline-none"
          />
          <span className="text-muted-foreground text-[10px]">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="py-2 text-[10px] bg-transparent focus:outline-none"
          />
        </div>
        {(startDate ||
          endDate ||
          search ||
          evType !== "all" ||
          riskF !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setEvType("all");
              setRiskF("all");
              setStartDate("");
              setEndDate("");
              setPage(1);
            }}
            className="px-3 py-2 text-[11px] font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm relative">
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 z-10 flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                {[
                  "Timestamp",
                  "User",
                  "Event Type",
                  "Details",
                  "IP / Device",
                  "Location",
                  "Risk",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.length === 0 && !isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-10 text-center text-muted-foreground text-[11px]"
                  >
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log, i) => (
                  <tr
                    key={log.id}
                    className={`hover:bg-muted/10 transition-colors ${log.risk_level === "Critical" ? "bg-red-50/30" : log.risk_level === "High" ? "bg-orange-50/20" : i % 2 === 0 ? "" : "bg-muted/5"}`}
                  >
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-mono font-semibold text-foreground whitespace-nowrap">
                        {log.created_at
                          ? new Date(log.created_at).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-[10px] font-semibold text-foreground whitespace-nowrap">
                        {log.user_name}
                      </span>
                      {log.user_id && (
                        <p className="text-[8px] text-muted-foreground font-mono">
                          {log.user_id}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <EventBadge t={log.event_type} />
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <p
                        className="text-[10px] text-foreground leading-snug truncate"
                        title={log.details}
                      >
                        {log.details}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <p className="text-[9px] font-mono text-foreground">
                        {log.ip_address}
                      </p>
                      <p className="text-[8px] text-muted-foreground">
                        {log.device}
                      </p>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                        <MapPin className="w-2.5 h-2.5" />
                        {log.location || "N/A"}{" "}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <RiskBadge
                        r={
                          (log.risk_level?.toLowerCase() as RiskLevel) || "low"
                        }
                      />
                    </td>
                    <td className="px-3 py-2.5">
                      <StatusDot
                        s={
                          (log.status?.toLowerCase() as LogStatus) || "success"
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/5">
          <span className="text-[10px] text-muted-foreground">
            Showing {(page - 1) * PER_PAGE + 1}–
            {Math.min(page * PER_PAGE, totalLogs)} of {totalLogs} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 text-[10px] font-bold border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Simple pagination logic for showing a few pages
              let pageNum = i + 1;
              if (totalPages > 5 && page > 3) {
                pageNum = page - 3 + i;
                if (pageNum + (4 - i) > totalPages)
                  pageNum = totalPages - 4 + i;
              }
              if (pageNum <= 0) return null;
              if (pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-6 h-6 text-[10px] font-bold rounded-md ${page === pageNum ? "bg-primary text-white" : "border border-border hover:bg-muted text-muted-foreground"}`}
                >
                  {pageNum}
                </button>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <span className="text-[10px] px-1 text-muted-foreground">
                ...
              </span>
            )}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 text-[10px] font-bold border border-border rounded-lg hover:bg-muted disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: ACCESS MONITOR  */
function AccessMonitorTab() {
  const [search, setSearch] = useState("");
  const [projF, setProjF] = useState("all");
  const [typeF, setTypeF] = useState("all");

  const filtered = useMemo(
    () =>
      ACCESS_LOGS.filter((l) => {
        if (
          projF !== "all" &&
          !l.project.toLowerCase().includes(projF.toLowerCase())
        )
          return false;
        if (typeF !== "all" && l.accessType !== typeF) return false;
        if (search) {
          const q = search.toLowerCase();
          if (
            !l.user.toLowerCase().includes(q) &&
            !l.chartId.toLowerCase().includes(q) &&
            !l.patient.toLowerCase().includes(q)
          )
            return false;
        }
        return true;
      }),
    [search, projF, typeF]
  );

  const stats = [
    {
      label: "Active Sessions",
      value: 8,
      icon: Monitor,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      label: "Charts Accessed (24h)",
      value: 42,
      icon: FileText,
      bg: "bg-teal-50",
      color: "text-teal-600",
    },
    {
      label: "Avg Access Duration",
      value: "14.2m",
      icon: Clock,
      bg: "bg-violet-50",
      color: "text-violet-600",
    },
    {
      label: "Anomalies Detected",
      value: 3,
      icon: AlertTriangle,
      bg: "bg-red-50",
      color: "text-red-600",
    },
  ];

  const projects = [
    "all",
    "Apollo Inpatient",
    "Max Healthcare",
    "Fortis Cardiology",
    "AIIMS Oncology",
  ];

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              <div
                className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
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

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, chart ID or patient name…"
            className="w-full pl-8 pr-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <select
          value={projF}
          onChange={(e) => setProjF(e.target.value)}
          className="px-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          {projects.map((p) => (
            <option key={p} value={p}>
              {p === "all" ? "All Projects" : p}
            </option>
          ))}
        </select>
        <select
          value={typeF}
          onChange={(e) => setTypeF(e.target.value)}
          className="px-3 py-2 text-[11px] bg-card border border-border rounded-xl focus:outline-none appearance-none"
        >
          <option value="all">All Access Types</option>
          {["code", "audit", "view", "export", "edit"].map((t) => (
            <option key={t} value={t} className="capitalize">
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </select>
        <div className="flex-1" />
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Live monitoring active
        </div>
      </div>

      {/* Access Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/5">
          <Eye className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Chart Access Log — PHI Access Trail
          </span>
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} records shown
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/10">
                {[
                  "Chart ID",
                  "Patient (PHI)",
                  "Accessed By",
                  "Role",
                  "Access Type",
                  "Timestamp",
                  "Duration",
                  "IP Address",
                  "Project",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((l, i) => {
                const isAnomaly =
                  l.ts.includes("02:14") || l.user === "Kavita Rao";
                return (
                  <tr
                    key={l.id}
                    className={`hover:bg-muted/10 transition-colors ${isAnomaly ? "bg-orange-50/30" : i % 2 === 0 ? "" : "bg-muted/5"}`}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        {isAnomaly && (
                          <AlertTriangle className="w-3 h-3 text-orange-500 flex-shrink-0" />
                        )}
                        <span className="text-[10px] font-mono font-bold text-primary">
                          {l.chartId}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1.5">
                        <EyeOff className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-[10px] text-foreground">
                          {l.patient}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] font-semibold text-foreground">
                      {l.user}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground">
                      {l.role}
                    </td>
                    <td className="px-3 py-2.5">
                      <AccessTypeBadge t={l.accessType} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`text-[10px] font-mono ${isAnomaly ? "text-red-600 font-bold" : "text-foreground"}`}
                      >
                        {l.ts}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground">
                      {l.duration}
                    </td>
                    <td className="px-3 py-2.5 text-[9px] font-mono text-muted-foreground">
                      {l.ip}
                    </td>
                    <td className="px-3 py-2.5 text-[10px] text-muted-foreground">
                      {l.project}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-2.5 border-t border-border bg-muted/5 flex items-center gap-2">
          <EyeOff className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">
            Patient names shown for authorized audit purposes only. All access
            is logged.
          </span>
          <span className="ml-auto text-[10px] text-orange-600 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />2 anomalous access patterns
            flagged
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: COMPLIANCE  */
function ComplianceTab() {
  const [retention, setRetention] = useState({
    phi: 7,
    auditLogs: 6,
    backups: 90,
    sessionLogs: 365,
    exportLogs: 730,
  });
  const [expiry, setExpiry] = useState({
    inactivityDays: 90,
    forceReauthDays: 30,
    tokenHours: 24,
  });

  const queryClient = useQueryClient();

  const { data: projectsData, isLoading: isProjectsLoading } =
    useGetApiProjects(
      {
        page_no: 1,
        page_size: 10,
        status: getApiProjectsQueryParamsStatusEnum.Active,
      },
      {
        query: {
          refetchOnWindowFocus: false,
        },
      }
    );

  const { data: retentionPolicyData, isLoading: isRetentionLoading } =
    useGetApiSecurityComplianceDataRetentionPolicy({
      query: {
        refetchOnWindowFocus: false,
      },
    });

  useEffect(() => {
    if (retentionPolicyData?.data) {
      const policy = retentionPolicyData.data;

      setRetention({
        phi:
          policy.phi_records === "6 years"
            ? 6
            : policy.phi_records === "7 years"
              ? 7
              : policy.phi_records === "10 years"
                ? 10
                : 15,

        auditLogs:
          policy.audit_logs === "3 years"
            ? 3
            : policy.audit_logs === "6 years"
              ? 6
              : 10,

        sessionLogs:
          policy.session_logs === "90 days"
            ? 90
            : policy.session_logs === "180 days"
              ? 180
              : policy.session_logs === "1 year"
                ? 365
                : 730,

        exportLogs:
          policy.export_logs === "1 year"
            ? 365
            : policy.export_logs === "2 years"
              ? 730
              : 1825,

        backups:
          policy.backup_snapshots === "30 days"
            ? 30
            : policy.backup_snapshots === "60 days"
              ? 60
              : policy.backup_snapshots === "90 days"
                ? 90
                : 180,
      });
    }
  }, [retentionPolicyData]);

  const { mutate: updateRetentionPolicy, isPending: isUpdatingRetention } =
    usePutApiSecurityComplianceDataRetentionPolicy({
      mutation: {
        onSuccess: async () => {
          toast.success("Data retention policy updated successfully");

          await queryClient.invalidateQueries({
            queryKey: getApiSecurityComplianceDataRetentionPolicyQueryKey(),
          });
        },

        onError: () => {
          toast.error("Failed to update data retention policy");
        },
      },
    });

  const handleUpdateRetentionPolicy = () => {
    updateRetentionPolicy({
      data: {
        phi_records:
          retention.phi === 6
            ? putApiSecurityComplianceDataRetentionPolicyMutationRequestPhiRecordsEnum[
                "6 years"
              ]
            : retention.phi === 7
              ? putApiSecurityComplianceDataRetentionPolicyMutationRequestPhiRecordsEnum[
                  "7 years"
                ]
              : retention.phi === 10
                ? putApiSecurityComplianceDataRetentionPolicyMutationRequestPhiRecordsEnum[
                    "10 years"
                  ]
                : putApiSecurityComplianceDataRetentionPolicyMutationRequestPhiRecordsEnum[
                    "15 years"
                  ],

        audit_logs:
          retention.auditLogs === 3
            ? putApiSecurityComplianceDataRetentionPolicyMutationRequestAuditLogsEnum[
                "3 years"
              ]
            : retention.auditLogs === 6
              ? putApiSecurityComplianceDataRetentionPolicyMutationRequestAuditLogsEnum[
                  "6 years"
                ]
              : putApiSecurityComplianceDataRetentionPolicyMutationRequestAuditLogsEnum[
                  "10 years"
                ],

        session_logs:
          retention.sessionLogs === 90
            ? putApiSecurityComplianceDataRetentionPolicyMutationRequestSessionLogsEnum[
                "90 days"
              ]
            : retention.sessionLogs === 180
              ? putApiSecurityComplianceDataRetentionPolicyMutationRequestSessionLogsEnum[
                  "180 days"
                ]
              : retention.sessionLogs === 365
                ? putApiSecurityComplianceDataRetentionPolicyMutationRequestSessionLogsEnum[
                    "1 year"
                  ]
                : putApiSecurityComplianceDataRetentionPolicyMutationRequestSessionLogsEnum[
                    "2 years"
                  ],

        export_logs:
          retention.exportLogs === 365
            ? putApiSecurityComplianceDataRetentionPolicyMutationRequestExportLogsEnum[
                "1 year"
              ]
            : retention.exportLogs === 730
              ? putApiSecurityComplianceDataRetentionPolicyMutationRequestExportLogsEnum[
                  "2 years"
                ]
              : putApiSecurityComplianceDataRetentionPolicyMutationRequestExportLogsEnum[
                  "5 years"
                ],

        backup_snapshots:
          retention.backups === 30
            ? putApiSecurityComplianceDataRetentionPolicyMutationRequestBackupSnapshotsEnum[
                "30 days"
              ]
            : retention.backups === 60
              ? putApiSecurityComplianceDataRetentionPolicyMutationRequestBackupSnapshotsEnum[
                  "60 days"
                ]
              : retention.backups === 90
                ? putApiSecurityComplianceDataRetentionPolicyMutationRequestBackupSnapshotsEnum[
                    "90 days"
                  ]
                : putApiSecurityComplianceDataRetentionPolicyMutationRequestBackupSnapshotsEnum[
                    "180 days"
                  ],
      },
    });
  };

  const {
    data: accessExpiryPolicyData,
    refetch: refetchAccessExpiryPolicy,
    isLoading: isAccessExpiryLoading,
  } = useGetApiSecurityComplianceAccessExpiryPolicy({
    query: {
      refetchOnWindowFocus: false,
    },
  });

  useEffect(() => {
    const policy = accessExpiryPolicyData?.data;

    if (!policy) return;

    setExpiry({
      inactivityDays:
        policy.inactivity_deactivation === "30 days"
          ? 30
          : policy.inactivity_deactivation === "60 days"
            ? 60
            : policy.inactivity_deactivation === "90 days"
              ? 90
              : 180,

      forceReauthDays:
        policy.force_reauthentication === "7 days"
          ? 7
          : policy.force_reauthentication === "14 days"
            ? 14
            : policy.force_reauthentication === "30 days"
              ? 30
              : 60,

      tokenHours:
        policy.auth_token_lifetime === "1 hour"
          ? 1
          : policy.auth_token_lifetime === "8 hours"
            ? 8
            : policy.auth_token_lifetime === "24 hours"
              ? 24
              : 48,
    });
  }, [accessExpiryPolicyData]);

  const {
    mutate: updateAccessExpiryPolicy,
    isPending: isUpdatingAccessExpiry,
  } = usePutApiSecurityComplianceAccessExpiryPolicy({
    mutation: {
      onSuccess: () => {
        toast.success("Access expiry policy updated successfully");
        refetchAccessExpiryPolicy();
      },
      onError: () => {
        toast.error("Failed to update access expiry policy");
      },
    },
  });

  const handleUpdateAccessExpiryPolicy = () => {
    updateAccessExpiryPolicy({
      data: {
        inactivity_deactivation:
          expiry.inactivityDays === 30
            ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestInactivityDeactivationEnum[
                "30 days"
              ]
            : expiry.inactivityDays === 60
              ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestInactivityDeactivationEnum[
                  "60 days"
                ]
              : expiry.inactivityDays === 90
                ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestInactivityDeactivationEnum[
                    "90 days"
                  ]
                : putApiSecurityComplianceAccessExpiryPolicyMutationRequestInactivityDeactivationEnum[
                    "180 days"
                  ],

        force_reauthentication:
          expiry.forceReauthDays === 7
            ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestForceReauthenticationEnum[
                "7 days"
              ]
            : expiry.forceReauthDays === 14
              ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestForceReauthenticationEnum[
                  "14 days"
                ]
              : expiry.forceReauthDays === 30
                ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestForceReauthenticationEnum[
                    "30 days"
                  ]
                : putApiSecurityComplianceAccessExpiryPolicyMutationRequestForceReauthenticationEnum[
                    "60 days"
                  ],

        auth_token_lifetime:
          expiry.tokenHours === 1
            ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestAuthTokenLifetimeEnum[
                "1 hour"
              ]
            : expiry.tokenHours === 8
              ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestAuthTokenLifetimeEnum[
                  "8 hours"
                ]
              : expiry.tokenHours === 24
                ? putApiSecurityComplianceAccessExpiryPolicyMutationRequestAuthTokenLifetimeEnum[
                    "24 hours"
                  ]
                : putApiSecurityComplianceAccessExpiryPolicyMutationRequestAuthTokenLifetimeEnum[
                    "48 hours"
                  ],
      },
    });
  };

  const passCount = HIPAA_CONTROLS.filter((c) => c.status === "pass").length;
  const overallScore = Math.round(
    HIPAA_CONTROLS.reduce((s, c) => s + c.score, 0) / HIPAA_CONTROLS.length
  );

  return (
    <div className="space-y-5">
      {/* Compliance Score Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* HIPAA Score */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3">
          <SecurityScoreGauge score={overallScore} />
          <div className="w-full grid grid-cols-3 gap-2 text-center">
            {[
              {
                label: "Controls Passing",
                value: `${passCount}/${HIPAA_CONTROLS.length}`,
                color: "text-emerald-600",
              },
              {
                label: "Avg Score",
                value: `${overallScore}%`,
                color: "text-blue-600",
              },
              {
                label: "Warnings",
                value: HIPAA_CONTROLS.filter((c) => c.status === "warn").length,
                color: "text-amber-600",
              },
            ].map((s) => (
              <div key={s.label} className="bg-muted/20 rounded-lg py-2">
                <div className={`text-base font-black ${s.color}`}>
                  {s.value}
                </div>
                <div className="text-[9px] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <div className="w-full flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-muted-foreground">Pass: {passCount}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-muted-foreground">
                Warn: {HIPAA_CONTROLS.filter((c) => c.status === "warn").length}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-muted-foreground">Fail: 0</span>
            </div>
          </div>
        </div>

        {/* HIPAA Controls checklist */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-foreground">
              HIPAA Technical & Administrative Safeguards
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              45 CFR Part 164
            </span>
          </div>
          <div className="overflow-y-auto max-h-[340px] divide-y divide-border">
            {HIPAA_CONTROLS.map((c) => (
              <div
                key={c.ref}
                className={`flex items-start gap-3 px-5 py-3 hover:bg-muted/10 transition-colors ${c.status === "warn" ? "bg-amber-50/30" : ""}`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {c.status === "pass" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[9px] font-mono font-bold text-muted-foreground">
                      {c.ref}
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {c.title}
                    </span>
                    <span
                      className={`ml-auto text-[9px] font-black ${c.score >= 95 ? "text-emerald-600" : c.score >= 85 ? "text-blue-600" : "text-amber-600"}`}
                    >
                      {c.score}%
                    </span>
                  </div>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">
                    {c.desc}
                  </p>
                  <div className="h-1 bg-muted rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${c.score >= 95 ? "bg-emerald-500" : c.score >= 85 ? "bg-blue-500" : "bg-amber-500"}`}
                      style={{ width: `${c.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Data Governance Settings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SettingCard
          title="Data Retention Policy"
          icon={Database}
          iconColor="text-blue-600"
        >
          <div className="space-y-3">
            {isRetentionLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {[
                  {
                    label: "PHI Records (HIPAA)",
                    key: "phi",
                    unit: "years",
                    opts: [
                      { v: 6, l: "6 years" },
                      { v: 7, l: "7 years (recommended)" },
                      { v: 10, l: "10 years" },
                      { v: 15, l: "15 years" },
                    ],
                  },
                  {
                    label: "Audit Logs",
                    key: "auditLogs",
                    unit: "years",
                    opts: [
                      { v: 3, l: "3 years" },
                      { v: 6, l: "6 years" },
                      { v: 10, l: "10 years" },
                    ],
                  },
                  {
                    label: "Session Logs",
                    key: "sessionLogs",
                    unit: "days",
                    opts: [
                      { v: 90, l: "90 days" },
                      { v: 180, l: "180 days" },
                      { v: 365, l: "1 year" },
                      { v: 730, l: "2 years" },
                    ],
                  },
                  {
                    label: "Export Logs",
                    key: "exportLogs",
                    unit: "days",
                    opts: [
                      { v: 365, l: "1 year" },
                      { v: 730, l: "2 years" },
                      { v: 1825, l: "5 years" },
                    ],
                  },
                  {
                    label: "Backup Snapshots",
                    key: "backups",
                    unit: "days",
                    opts: [
                      { v: 30, l: "30 days" },
                      { v: 60, l: "60 days" },
                      { v: 90, l: "90 days" },
                      { v: 180, l: "180 days" },
                    ],
                  },
                ].map((f) => (
                  <div
                    key={f.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-[11px] font-semibold text-foreground">
                        {f.label}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        Retain for
                      </p>
                    </div>
                    <select
                      value={(retention as any)[f.key]}
                      onChange={(e) =>
                        setRetention({
                          ...retention,
                          [f.key]: Number(e.target.value),
                        })
                      }
                      className="px-2.5 py-1.5 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none appearance-none min-w-[130px]"
                    >
                      {f.opts.map((o) => (
                        <option key={o.v} value={o.v}>
                          {o.l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="pt-2 border-t border-border/50 flex items-start gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />

                    <p className="text-[9px] text-muted-foreground">
                      HIPAA requires PHI and audit records retained for minimum
                      6 years from creation or last use. Selected 7-year policy
                      exceeds requirement.
                    </p>
                  </div>

                  <button
                    onClick={handleUpdateRetentionPolicy}
                    disabled={isUpdatingRetention}
                    className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-[10px] font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {isUpdatingRetention ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3" />
                    )}

                    {isUpdatingRetention ? "Updating..." : "Update Policy"}
                  </button>
                </div>
              </>
            )}
          </div>
        </SettingCard>

        <SettingCard
          title="Access Expiry & Auto-Deprovisioning"
          icon={UserX}
          iconColor="text-orange-600"
        >
          <div className="space-y-3">
            {[
              {
                label: "Inactivity Deactivation",
                sub: "Auto-deactivate accounts with no login for N days",
                key: "inactivityDays",
                opts: [
                  { v: 30, l: "30 days" },
                  { v: 60, l: "60 days" },
                  { v: 90, l: "90 days" },
                  { v: 180, l: "180 days" },
                ],
              },
              {
                label: "Force Re-authentication",
                sub: "Require fresh login after N days since last auth",
                key: "forceReauthDays",
                opts: [
                  { v: 7, l: "7 days" },
                  { v: 14, l: "14 days" },
                  { v: 30, l: "30 days" },
                  { v: 60, l: "60 days" },
                ],
              },
              {
                label: "Auth Token Lifetime",
                sub: "API and session token maximum valid duration",
                key: "tokenHours",
                opts: [
                  { v: 1, l: "1 hour" },
                  { v: 8, l: "8 hours" },
                  { v: 24, l: "24 hours" },
                  { v: 48, l: "48 hours" },
                ],
              },
            ].map((f) => (
              <div
                key={f.key}
                className="border-b border-border/50 pb-3 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-foreground">
                      {f.label}
                    </p>
                    <p className="text-[9px] text-muted-foreground">{f.sub}</p>
                  </div>
                  <select
                    value={(expiry as any)[f.key]}
                    onChange={(e) =>
                      setExpiry({ ...expiry, [f.key]: Number(e.target.value) })
                    }
                    className="px-2.5 py-1.5 text-[10px] bg-muted/30 border border-border rounded-lg focus:outline-none appearance-none"
                  >
                    {f.opts.map((o) => (
                      <option key={o.v} value={o.v}>
                        {o.l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                  Project-Based Access Restrictions
                </p>

                <span className="text-[9px] text-muted-foreground">
                  {projectsData?.total ?? 0} Projects
                </span>
              </div>

              <div className="space-y-1.5">
                {isProjectsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  </div>
                ) : projectsData?.data?.length ? (
                  projectsData.data.map((project) => {
                    const isActive = project.status === "Active";

                    return (
                      <div
                        key={project.id}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/20 border border-border"
                      >
                        <FolderKanban className="w-3 h-3 text-muted-foreground flex-shrink-0" />

                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold text-foreground block truncate">
                            {project.project_name}
                          </span>

                          <span className="text-[8px] text-muted-foreground">
                            {project.project_type} • {project.specialty}
                          </span>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : project.status === "At Risk"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {project.status}
                        </span>

                        <button className="text-[9px] text-primary font-bold hover:underline">
                          Edit
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-[10px] text-muted-foreground border border-dashed border-border rounded-lg">
                    No projects found
                  </div>
                )}
              </div>
            </div>
            <div className="pt-3 border-t border-border/50 flex justify-end">
              <button
                onClick={handleUpdateAccessExpiryPolicy}
                disabled={isUpdatingAccessExpiry}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-xl hover:opacity-90 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {isUpdatingAccessExpiry ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Save className="w-3 h-3" />
                )}

                {isUpdatingAccessExpiry
                  ? "Updating..."
                  : "Update Access Policy"}
              </button>
            </div>
          </div>
        </SettingCard>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: SECURITY ALERTS  */
function AlertsTab() {
  const [sevF, setSevF] = useState<AlertSev | "all">("all");
  const [statF, setStatF] = useState<AlertStatus | "all">("all");
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["SA001", "SA002"])
  );

  const filtered = useMemo(
    () =>
      SECURITY_ALERTS.filter((a) => {
        if (sevF !== "all" && a.severity !== sevF) return false;
        if (statF !== "all" && a.status !== statF) return false;
        return true;
      }),
    [sevF, statF]
  );

  const counts = {
    critical: SECURITY_ALERTS.filter((a) => a.severity === "critical").length,
    high: SECURITY_ALERTS.filter((a) => a.severity === "high").length,
    medium: SECURITY_ALERTS.filter((a) => a.severity === "medium").length,
    low: SECURITY_ALERTS.filter((a) => a.severity === "low").length,
    active: SECURITY_ALERTS.filter((a) => a.status === "active").length,
  };

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const alertCfg: Record<
    AlertSev,
    { border: string; bg: string; hdr: string; icon: React.ElementType }
  > = {
    critical: {
      border: "border-red-300",
      bg: "bg-red-50/60",
      hdr: "bg-red-50",
      icon: AlertOctagon,
    },
    high: {
      border: "border-orange-300",
      bg: "bg-orange-50/40",
      hdr: "bg-orange-50",
      icon: AlertCircle,
    },
    medium: {
      border: "border-amber-300",
      bg: "bg-amber-50/30",
      hdr: "bg-amber-50",
      icon: AlertTriangle,
    },
    low: {
      border: "border-slate-200",
      bg: "bg-slate-50/30",
      hdr: "bg-muted/20",
      icon: Info,
    },
  };

  return (
    <div className="space-y-4">
      {/* Severity Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          {
            label: "Critical",
            count: counts.critical,
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-700",
            dot: "bg-red-500",
            icon: AlertOctagon,
          },
          {
            label: "High",
            count: counts.high,
            bg: "bg-orange-50",
            border: "border-orange-200",
            text: "text-orange-700",
            dot: "bg-orange-500",
            icon: AlertCircle,
          },
          {
            label: "Medium",
            count: counts.medium,
            bg: "bg-amber-50",
            border: "border-amber-200",
            text: "text-amber-700",
            dot: "bg-amber-500",
            icon: AlertTriangle,
          },
          {
            label: "Low",
            count: counts.low,
            bg: "bg-slate-100",
            border: "border-slate-200",
            text: "text-slate-600",
            dot: "bg-slate-400",
            icon: Info,
          },
          {
            label: "Active Now",
            count: counts.active,
            bg: "bg-red-50",
            border: "border-red-200",
            text: "text-red-700",
            dot: "bg-red-500",
            icon: Bell,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              onClick={() => {
                if (["Critical", "High", "Medium", "Low"].includes(s.label))
                  setSevF(s.label.toLowerCase() as AlertSev);
                else setSevF("all");
              }}
              className={`flex flex-col items-center gap-1 px-4 py-3 rounded-2xl border cursor-pointer transition-all hover:shadow-md ${s.bg} ${s.border} ${s.text}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-2xl font-black">{s.count}</span>
              <span className="text-[10px] font-bold">{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[11px] font-bold text-foreground">Filter:</span>
        {(["all", "critical", "high", "medium", "low"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSevF(s)}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-colors capitalize ${sevF === s ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            {s === "all" ? "All Severities" : s}
          </button>
        ))}
        <div className="w-px h-5 bg-border mx-1" />
        {(["all", "active", "investigating", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatF(s)}
            className={`px-3 py-1 text-[10px] font-bold rounded-lg border transition-colors capitalize ${statF === s ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
          >
            {s === "all" ? "All Status" : s}
          </button>
        ))}
        <div className="flex-1" />
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border border-border rounded-xl hover:bg-muted transition-colors whitespace-nowrap text-muted-foreground">
          <Download className="w-3.5 h-3.5" />
          Export Alerts
        </button>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.map((alert) => {
          const cfg = alertCfg[alert.severity];
          const Icon = cfg.icon;
          const isExpanded = expanded.has(alert.id);

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border overflow-hidden shadow-sm ${cfg.border} ${cfg.bg}`}
            >
              {/* Alert Header */}
              <button
                className={`w-full flex items-start gap-3 px-5 py-3.5 text-left ${cfg.hdr} hover:opacity-95 transition-opacity`}
                onClick={() => toggle(alert.id)}
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Icon
                    className={`w-4.5 h-4.5 ${alert.severity === "critical" ? "text-red-600" : alert.severity === "high" ? "text-orange-600" : alert.severity === "medium" ? "text-amber-600" : "text-slate-500"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-black text-foreground">
                      {alert.type}
                    </span>
                    <SeverityBadge s={alert.severity} />
                    <AlertStatusBadge s={alert.status} />
                    {alert.user && (
                      <span className="text-[9px] text-muted-foreground">
                        User: <strong>{alert.user}</strong>
                      </span>
                    )}
                    {alert.ip && (
                      <span className="text-[9px] font-mono text-muted-foreground">
                        {alert.ip}
                      </span>
                    )}
                    <span className="text-[9px] text-muted-foreground ml-auto flex-shrink-0">
                      {alert.ts}
                    </span>
                  </div>
                  <p className="text-[10px] text-foreground mt-0.5 leading-snug">
                    {alert.description}
                  </p>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                )}
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-5 py-4 border-t border-current/10 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Terminal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-bold text-foreground mb-0.5">
                        Investigation Details
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {alert.details}
                      </p>
                    </div>
                  </div>
                  {alert.status !== "resolved" && (
                    <div className="flex items-center gap-2 pt-1">
                      {alert.status === "active" && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-amber-600 text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                          <Search className="w-3 h-3" />
                          Investigate
                        </button>
                      )}
                      {alert.user && alert.status !== "resolved" && (
                        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-red-600 text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                          <Lock className="w-3 h-3" />
                          Block User
                        </button>
                      )}
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                        <Check className="w-3 h-3" />
                        Mark Resolved
                      </button>
                      <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                        <FileText className="w-3 h-3" />
                        Add Note
                      </button>
                    </div>
                  )}
                  {alert.status === "resolved" && (
                    <div className="flex items-center gap-2 text-[10px] text-emerald-600 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolved — no further action required
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ShieldCheck className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-semibold">
              No alerts match the current filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  MAIN EXPORT  */
type SecTab = "dashboard" | "audit" | "access" | "compliance" | "alerts";

export function SecurityCompliance() {
  const [tab, setTab] = useState<SecTab>("dashboard");
  const { canEdit, hasPermission } = usePermissions();
  const { data: auditLogsCountData } = useGetApiAuditLogs({
    page: 1,
    limit: 1,
  });

  const auditLogsCount = auditLogsCountData?.pagination?.total || 0;

  const TABS: {
    id: SecTab;
    label: string;
    icon: React.ElementType;
    alert?: string;
  }[] = [
    { id: "dashboard", label: "Security Dashboard", icon: Shield },
    {
      id: "audit",
      label: "Audit Logs",
      icon: BookOpen,
      alert: auditLogsCount.toString(),
    },
    { id: "access", label: "Access Monitor", icon: Eye, alert: "LIVE" },
    { id: "compliance", label: "Compliance Controls", icon: ShieldCheck },
    { id: "alerts", label: "Security Alerts", icon: Bell, alert: "2 active" },
  ];

  const activeCritical = SECURITY_ALERTS.filter(
    (a) => a.status === "active" && a.severity === "critical"
  ).length;

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Security & Compliance
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            PHI protection · access control · audit logs · HIPAA compliance ·
            threat detection
          </p>
        </div>
        <div className="flex-1" />
        {activeCritical > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl">
            <AlertOctagon className="w-4 h-4 text-red-600" />
            <span className="text-[11px] font-black text-red-700">
              {activeCritical} critical alert{activeCritical > 1 ? "s" : ""}{" "}
              require immediate action
            </span>
            <button
              onClick={() => setTab("alerts")}
              className="text-[10px] font-bold text-red-600 underline"
            >
              View →
            </button>
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Live ·{" "}
            <strong className="text-foreground">20 Feb 2026, 10:45 IST</strong>
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-border rounded-xl hover:bg-muted transition-colors whitespace-nowrap text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 bg-card border border-border rounded-2xl p-1.5 shadow-sm overflow-x-auto flex-shrink-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          const isCriticalAlerts = t.id === "alerts" && activeCritical > 0;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${active ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.alert && (
                <span
                  className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${isCriticalAlerts ? "bg-red-500 text-white animate-pulse" : active ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  {t.alert}
                </span>
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-2 pr-2 text-[10px] text-muted-foreground flex-shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>HIPAA · SOC 2 · ISO 27001</span>
        </div>
      </div>

      {/* Content */}
      {tab === "dashboard" && <SecurityDashboardTab />}
      {tab === "audit" && <AuditLogsTab />}
      {tab === "access" && <AccessMonitorTab />}
      {tab === "compliance" && <ComplianceTab />}
      {tab === "alerts" && <AlertsTab />}
    </div>
  );
}
