import { useState, useMemo, useEffect } from "react";
import type { ElementType } from "react";
import {
  getApiPatientsExport,
  useGetApiWorkQueue,
  usePostApiChartAssignmentsBulkAssign,
} from "@/api";
import {
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Clock,
  RotateCcw,
  ScanSearch,
  UserPlus,
  RefreshCw,
  SendHorizontal,
  Flag,
  XCircle,
  ShieldAlert,
  AlertTriangle,
  ArrowUpDown,
  ChevronUp,
  ArrowUpRight,
  ArrowDownRight,
  CalendarDays,
  ClipboardList,
  Users,
  Activity,
  Download,
  CheckSquare,
  Square,
  Play,
  Eye,
  CornerDownLeft,
  Zap,
  Circle,
  Shield,
  FileSearch,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Layers,
  ListFilter,
  Sparkles,
  Target,
  RefreshCcw,
  CircleDot,
  Plus,
  Building2,
  User,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import {
  postApiPatientsIdAssignMutationRequestRoleEnum,
  useGetApiPatients,
  useGetApiUsers,
  usePatchApiPatientsIdStage,
  usePostApiPatientsIdAssign,
} from "@/api";
import { toast } from "sonner";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type Status =
  | "Not Started"
  | "Assigned"
  | "In Progress"
  | "Pending QA"
  | "QA Returned"
  | "Rework"
  | "Completed"
  | "Audit Sample"
  | "Submission Ready";

type Priority = "Urgent" | "High" | "Medium" | "Low";
type Plan = "Medicare" | "Medicaid" | "Commercial";

interface ChartRow {
  id: string;
  patientName: string;
  mrn: string;
  dob: string;
  measure: string;
  measureCode: string;
  plan: Plan;
  priority: Priority;
  status: Status;
  step: number;
  assignedTo: string;
  dueDate: string;
  slaHoursLeft: number;
  qaFlag: boolean;
  qaNote?: string;
  auditSample: boolean;
  lastActivity: string;
  overdue: boolean;
  riskScore: number;
}

interface Client {
  id: string;
  name: string;
  type: "Health Plan" | "Provider Group" | "ACO" | "State Program";
  status: "Active" | "Onboarding" | "Inactive";
  activeCases: number;
  completedCases: number;
  memberCount: number;
  contractStart: string;
  primaryContact: string;
  logo?: string;
}

/* ─────────────────────────────────────────────────────────────
   PIPELINE STAGES
───────────────────────────────────────────────────────────── */
const PIPELINE: {
  step: number;
  status: Status;
  label: string;
  short: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  ring: string;
}[] = [
  {
    step: 1,
    status: "Not Started",
    label: "Not Started",
    short: "Not Started",
    bg: "bg-slate-50",
    text: "text-slate-700",
    border: "border-slate-200",
    dot: "bg-slate-400",
    ring: "ring-slate-200",
  },
  {
    step: 2,
    status: "Assigned",
    label: "Assigned",
    short: "Assigned",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
  {
    step: 3,
    status: "In Progress",
    label: "In Progress",
    short: "In Progress",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    border: "border-cyan-200",
    dot: "bg-cyan-500",
    ring: "ring-cyan-200",
  },
  {
    step: 4,
    status: "Pending QA",
    label: "Pending QA",
    short: "Pending QA",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
    ring: "ring-amber-200",
  },
  {
    step: 5,
    status: "QA Returned",
    label: "QA Returned",
    short: "QA Return",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-200",
    dot: "bg-orange-500",
    ring: "ring-orange-200",
  },
  {
    step: 6,
    status: "Rework",
    label: "Rework",
    short: "Rework",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
  {
    step: 7,
    status: "Completed",
    label: "Completed",
    short: "Completed",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  {
    step: 8,
    status: "Audit Sample",
    label: "Audit Sample",
    short: "Audit",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-500",
    ring: "ring-violet-200",
  },
  {
    step: 9,
    status: "Submission Ready",
    label: "Submission Ready",
    short: "Ready",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
    ring: "ring-teal-200",
  },
];

function getPipeline(s: Status) {
  return PIPELINE.find((p) => p.status === s) ?? PIPELINE[0];
}

/* ─────────────────────────────────────────────────────────────
   MOCK DATA  (38 charts across all 9 stages)
───────────────────────────────────────────────────────────── */
const MOCK: ChartRow[] = [
  {
    id: "CHT-5001",
    patientName: "Adams, William K.",
    mrn: "M-05001",
    dob: "08/14/1958",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Medicare",
    priority: "Urgent",
    status: "Not Started",
    step: 1,
    assignedTo: "—",
    dueDate: "2026-02-26",
    slaHoursLeft: 24,
    qaFlag: false,
    auditSample: false,
    lastActivity: "2h ago",
    overdue: false,
    riskScore: 2.8,
  },
  {
    id: "CHT-5002",
    patientName: "Chen, Linda M.",
    mrn: "M-05002",
    dob: "03/22/1967",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Medicaid",
    priority: "Urgent",
    status: "Not Started",
    step: 1,
    assignedTo: "—",
    dueDate: "2026-02-26",
    slaHoursLeft: 18,
    qaFlag: false,
    auditSample: false,
    lastActivity: "1h ago",
    overdue: false,
    riskScore: 2.1,
  },
  {
    id: "CHT-5003",
    patientName: "Patel, Raj S.",
    mrn: "M-05003",
    dob: "11/09/1971",
    measure: "Colorectal Cancer Screening",
    measureCode: "COL",
    plan: "Commercial",
    priority: "High",
    status: "Not Started",
    step: 1,
    assignedTo: "—",
    dueDate: "2026-02-27",
    slaHoursLeft: 36,
    qaFlag: false,
    auditSample: false,
    lastActivity: "3h ago",
    overdue: false,
    riskScore: 1.6,
  },
  {
    id: "CHT-5004",
    patientName: "Washington, Barbara J.",
    mrn: "M-05004",
    dob: "07/18/1954",
    measure: "Child Immunization Status",
    measureCode: "CIS",
    plan: "Medicare",
    priority: "High",
    status: "Not Started",
    step: 1,
    assignedTo: "—",
    dueDate: "2026-02-28",
    slaHoursLeft: 48,
    qaFlag: false,
    auditSample: false,
    lastActivity: "5h ago",
    overdue: false,
    riskScore: 3.1,
  },
  {
    id: "CHT-5005",
    patientName: "Okonkwo, Emeka D.",
    mrn: "M-05005",
    dob: "02/04/1982",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicaid",
    priority: "Medium",
    status: "Not Started",
    step: 1,
    assignedTo: "—",
    dueDate: "2026-03-01",
    slaHoursLeft: 72,
    qaFlag: false,
    auditSample: false,
    lastActivity: "4h ago",
    overdue: false,
    riskScore: 1.4,
  },
  {
    id: "CHT-5006",
    patientName: "Rodriguez, Elena M.",
    mrn: "M-05006",
    dob: "06/30/1965",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Commercial",
    priority: "Medium",
    status: "Not Started",
    step: 1,
    assignedTo: "—",
    dueDate: "2026-03-01",
    slaHoursLeft: 68,
    qaFlag: false,
    auditSample: false,
    lastActivity: "6h ago",
    overdue: false,
    riskScore: 1.8,
  },
  {
    id: "CHT-4892",
    patientName: "Martinez, Carlos R.",
    mrn: "M-00287",
    dob: "01/12/1968",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Medicare",
    priority: "Urgent",
    status: "Assigned",
    step: 2,
    assignedTo: "R. Gupta",
    dueDate: "2026-02-25",
    slaHoursLeft: 8,
    qaFlag: false,
    auditSample: false,
    lastActivity: "1h ago",
    overdue: false,
    riskScore: 2.4,
  },
  {
    id: "CHT-4893",
    patientName: "Kumar, David S.",
    mrn: "M-00621",
    dob: "05/28/1975",
    measure: "Follow-Up After Hosp.",
    measureCode: "FUH",
    plan: "Medicaid",
    priority: "High",
    status: "Assigned",
    step: 2,
    assignedTo: "M. Joshi",
    dueDate: "2026-02-25",
    slaHoursLeft: 10,
    qaFlag: false,
    auditSample: false,
    lastActivity: "2h ago",
    overdue: false,
    riskScore: 1.9,
  },
  {
    id: "CHT-4894",
    patientName: "Williams, Sandra L.",
    mrn: "M-00391",
    dob: "09/14/1980",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Commercial",
    priority: "High",
    status: "Assigned",
    step: 2,
    assignedTo: "P. Rao",
    dueDate: "2026-02-26",
    slaHoursLeft: 28,
    qaFlag: false,
    auditSample: false,
    lastActivity: "3h ago",
    overdue: false,
    riskScore: 1.2,
  },
  {
    id: "CHT-5007",
    patientName: "Fernandez, Jose A.",
    mrn: "M-05007",
    dob: "12/19/1959",
    measure: "Colorectal Cancer Screening",
    measureCode: "COL",
    plan: "Medicare",
    priority: "Medium",
    status: "Assigned",
    step: 2,
    assignedTo: "D. Pillai",
    dueDate: "2026-02-27",
    slaHoursLeft: 44,
    qaFlag: false,
    auditSample: false,
    lastActivity: "4h ago",
    overdue: false,
    riskScore: 2.0,
  },
  {
    id: "CHT-5008",
    patientName: "Kim, Susan J.",
    mrn: "M-05008",
    dob: "04/07/1974",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Medicaid",
    priority: "Medium",
    status: "Assigned",
    step: 2,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-28",
    slaHoursLeft: 52,
    qaFlag: false,
    auditSample: false,
    lastActivity: "5h ago",
    overdue: false,
    riskScore: 1.5,
  },
  {
    id: "CHT-4891",
    patientName: "Anderson, Jennifer K.",
    mrn: "M-00142",
    dob: "10/03/1971",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicare",
    priority: "High",
    status: "In Progress",
    step: 3,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-25",
    slaHoursLeft: 8,
    qaFlag: false,
    auditSample: false,
    lastActivity: "2h ago",
    overdue: false,
    riskScore: 2.2,
  },
  {
    id: "CHT-4895",
    patientName: "Thompson, Robert M.",
    mrn: "M-00445",
    dob: "07/22/1966",
    measure: "Well-Child Visits",
    measureCode: "W34",
    plan: "Medicaid",
    priority: "Medium",
    status: "In Progress",
    step: 3,
    assignedTo: "D. Pillai",
    dueDate: "2026-02-26",
    slaHoursLeft: 36,
    qaFlag: false,
    auditSample: false,
    lastActivity: "5h ago",
    overdue: false,
    riskScore: 1.1,
  },
  {
    id: "CHT-4898",
    patientName: "Nguyen, Thi Lan",
    mrn: "M-00934",
    dob: "02/15/1984",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Commercial",
    priority: "Medium",
    status: "In Progress",
    step: 3,
    assignedTo: "M. Joshi",
    dueDate: "2026-02-27",
    slaHoursLeft: 48,
    qaFlag: false,
    auditSample: false,
    lastActivity: "2h ago",
    overdue: false,
    riskScore: 1.3,
  },
  {
    id: "CHT-4900",
    patientName: "Singh, Amarpreet J.",
    mrn: "M-01143",
    dob: "11/29/1977",
    measure: "Follow-Up After Hosp.",
    measureCode: "FUH",
    plan: "Medicare",
    priority: "High",
    status: "In Progress",
    step: 3,
    assignedTo: "R. Gupta",
    dueDate: "2026-02-27",
    slaHoursLeft: 42,
    qaFlag: false,
    auditSample: false,
    lastActivity: "3h ago",
    overdue: false,
    riskScore: 2.5,
  },
  {
    id: "CHT-4906",
    patientName: "Davis, Michael P.",
    mrn: "M-01634",
    dob: "08/11/1988",
    measure: "Well-Child Visits",
    measureCode: "W34",
    plan: "Medicaid",
    priority: "Medium",
    status: "In Progress",
    step: 3,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-28",
    slaHoursLeft: 30,
    qaFlag: false,
    auditSample: false,
    lastActivity: "4h ago",
    overdue: false,
    riskScore: 0.9,
  },
  {
    id: "CHT-4904",
    patientName: "Lee, Stephanie J.",
    mrn: "M-01389",
    dob: "05/06/1979",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicaid",
    priority: "Low",
    status: "In Progress",
    step: 3,
    assignedTo: "P. Rao",
    dueDate: "2026-02-28",
    slaHoursLeft: 52,
    qaFlag: false,
    auditSample: false,
    lastActivity: "1d ago",
    overdue: false,
    riskScore: 1.6,
  },
  {
    id: "CHT-4908",
    patientName: "Taylor, Amanda N.",
    mrn: "M-01878",
    dob: "03/19/1960",
    measure: "Follow-Up After Hosp.",
    measureCode: "FUH",
    plan: "Commercial",
    priority: "Low",
    status: "In Progress",
    step: 3,
    assignedTo: "D. Pillai",
    dueDate: "2026-02-28",
    slaHoursLeft: 60,
    qaFlag: false,
    auditSample: false,
    lastActivity: "1d ago",
    overdue: false,
    riskScore: 1.0,
  },
  {
    id: "CHT-4912",
    patientName: "Verma, Sunita P.",
    mrn: "M-03094",
    dob: "01/25/1970",
    measure: "Well-Child Visits",
    measureCode: "W34",
    plan: "Medicare",
    priority: "Medium",
    status: "In Progress",
    step: 3,
    assignedTo: "R. Gupta",
    dueDate: "2026-02-28",
    slaHoursLeft: 44,
    qaFlag: false,
    auditSample: false,
    lastActivity: "1h ago",
    overdue: false,
    riskScore: 1.4,
  },
  {
    id: "CHT-4896",
    patientName: "Clark, Daniel F.",
    mrn: "M-00991",
    dob: "06/08/1963",
    measure: "Colorectal Cancer Screening",
    measureCode: "COL",
    plan: "Medicare",
    priority: "High",
    status: "Pending QA",
    step: 4,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-25",
    slaHoursLeft: 9,
    qaFlag: false,
    auditSample: true,
    lastActivity: "1h ago",
    overdue: false,
    riskScore: 2.3,
  },
  {
    id: "CHT-4899",
    patientName: "Gonzalez, Maria E.",
    mrn: "M-01021",
    dob: "09/17/1972",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Medicaid",
    priority: "Medium",
    status: "Pending QA",
    step: 4,
    assignedTo: "P. Rao",
    dueDate: "2026-02-27",
    slaHoursLeft: 40,
    qaFlag: false,
    auditSample: false,
    lastActivity: "1h ago",
    overdue: false,
    riskScore: 1.7,
  },
  {
    id: "CHT-4907",
    patientName: "Wilson, Elizabeth J.",
    mrn: "M-01756",
    dob: "04/12/1969",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Commercial",
    priority: "Medium",
    status: "Pending QA",
    step: 4,
    assignedTo: "R. Gupta",
    dueDate: "2026-02-28",
    slaHoursLeft: 32,
    qaFlag: false,
    auditSample: false,
    lastActivity: "2h ago",
    overdue: false,
    riskScore: 1.3,
  },
  {
    id: "CHT-4914",
    patientName: "Ahmed, Farida S.",
    mrn: "M-03339",
    dob: "12/30/1978",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Medicare",
    priority: "Medium",
    status: "Pending QA",
    step: 4,
    assignedTo: "P. Rao",
    dueDate: "2026-02-27",
    slaHoursLeft: 20,
    qaFlag: false,
    auditSample: true,
    lastActivity: "3h ago",
    overdue: false,
    riskScore: 1.9,
  },
  {
    id: "CHT-5009",
    patientName: "Brown, Naomi L.",
    mrn: "M-05009",
    dob: "07/15/1955",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicaid",
    priority: "High",
    status: "Pending QA",
    step: 4,
    assignedTo: "M. Joshi",
    dueDate: "2026-02-26",
    slaHoursLeft: 12,
    qaFlag: false,
    auditSample: false,
    lastActivity: "45m ago",
    overdue: false,
    riskScore: 2.6,
  },
  {
    id: "CHT-4903",
    patientName: "Moore, Patricia S.",
    mrn: "M-00603",
    dob: "08/29/1970",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicare",
    priority: "Urgent",
    status: "QA Returned",
    step: 5,
    assignedTo: "R. Gupta",
    dueDate: "2026-02-22",
    slaHoursLeft: -3,
    qaFlag: true,
    qaNote: "Missing service date — CPT 83036 not documented",
    auditSample: false,
    lastActivity: "1h ago",
    overdue: true,
    riskScore: 2.1,
  },
  {
    id: "CHT-4905",
    patientName: "Sharma, Kavitha R.",
    mrn: "M-01512",
    dob: "03/14/1973",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Medicaid",
    priority: "High",
    status: "QA Returned",
    step: 5,
    assignedTo: "M. Joshi",
    dueDate: "2026-02-27",
    slaHoursLeft: 18,
    qaFlag: true,
    qaNote: "BP reading illegible — re-abstract from source",
    auditSample: false,
    lastActivity: "6h ago",
    overdue: false,
    riskScore: 1.8,
  },
  {
    id: "CHT-5010",
    patientName: "Park, James H.",
    mrn: "M-05010",
    dob: "11/07/1961",
    measure: "Colorectal Cancer Screening",
    measureCode: "COL",
    plan: "Commercial",
    priority: "High",
    status: "QA Returned",
    step: 5,
    assignedTo: "P. Rao",
    dueDate: "2026-02-25",
    slaHoursLeft: 6,
    qaFlag: true,
    qaNote: "Incorrect lookback period applied",
    auditSample: false,
    lastActivity: "3h ago",
    overdue: false,
    riskScore: 2.0,
  },
  {
    id: "CHT-4901",
    patientName: "White, Karen L.",
    mrn: "M-00481",
    dob: "06/22/1966",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Medicare",
    priority: "Urgent",
    status: "Rework",
    step: 6,
    assignedTo: "D. Pillai",
    dueDate: "2026-02-22",
    slaHoursLeft: -6,
    qaFlag: true,
    qaNote: "No valid mammogram CPT in lookback window",
    auditSample: true,
    lastActivity: "6h ago",
    overdue: true,
    riskScore: 2.9,
  },
  {
    id: "CHT-4902",
    patientName: "Brown, Christopher D.",
    mrn: "M-01267",
    dob: "09/08/1958",
    measure: "Colorectal Cancer Screening",
    measureCode: "COL",
    plan: "Commercial",
    priority: "High",
    status: "Rework",
    step: 6,
    assignedTo: "D. Pillai",
    dueDate: "2026-02-27",
    slaHoursLeft: 24,
    qaFlag: true,
    qaNote: "FIT test date outside measurement year",
    auditSample: true,
    lastActivity: "2h ago",
    overdue: false,
    riskScore: 1.7,
  },
  {
    id: "CHT-5011",
    patientName: "Gupta, Priya V.",
    mrn: "M-05011",
    dob: "04/18/1976",
    measure: "Follow-Up After Hosp.",
    measureCode: "FUH",
    plan: "Medicaid",
    priority: "Medium",
    status: "Rework",
    step: 6,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-28",
    slaHoursLeft: 30,
    qaFlag: true,
    qaNote: "Discharge date does not match encounter record",
    auditSample: false,
    lastActivity: "4h ago",
    overdue: false,
    riskScore: 1.2,
  },
  {
    id: "CHT-4910",
    patientName: "Harris, Rebecca M.",
    mrn: "M-02237",
    dob: "02/11/1980",
    measure: "Colorectal Cancer Screening",
    measureCode: "COL",
    plan: "Medicare",
    priority: "Low",
    status: "Completed",
    step: 7,
    assignedTo: "M. Joshi",
    dueDate: "2026-02-24",
    slaHoursLeft: 0,
    qaFlag: false,
    auditSample: false,
    lastActivity: "3h ago",
    overdue: false,
    riskScore: 1.0,
  },
  {
    id: "CHT-4911",
    patientName: "Jackson, Thomas R.",
    mrn: "M-02359",
    dob: "07/30/1955",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Commercial",
    priority: "Low",
    status: "Completed",
    step: 7,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-24",
    slaHoursLeft: 0,
    qaFlag: false,
    auditSample: false,
    lastActivity: "12h ago",
    overdue: false,
    riskScore: 0.8,
  },
  {
    id: "CHT-4913",
    patientName: "Iyer, Lakshmi D.",
    mrn: "M-03217",
    dob: "05/04/1969",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicare",
    priority: "Low",
    status: "Completed",
    step: 7,
    assignedTo: "D. Pillai",
    dueDate: "2026-02-24",
    slaHoursLeft: 0,
    qaFlag: false,
    auditSample: false,
    lastActivity: "2d ago",
    overdue: false,
    riskScore: 1.1,
  },
  {
    id: "CHT-4915",
    patientName: "Nair, Gopalan V.",
    mrn: "M-03462",
    dob: "10/22/1963",
    measure: "Follow-Up After Hosp.",
    measureCode: "FUH",
    plan: "Medicaid",
    priority: "Low",
    status: "Completed",
    step: 7,
    assignedTo: "M. Joshi",
    dueDate: "2026-02-23",
    slaHoursLeft: 0,
    qaFlag: false,
    auditSample: false,
    lastActivity: "6h ago",
    overdue: false,
    riskScore: 0.9,
  },
  {
    id: "CHT-4897",
    patientName: "Patel, Rohan K.",
    mrn: "M-00812",
    dob: "01/09/1977",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicare",
    priority: "High",
    status: "Audit Sample",
    step: 8,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-26",
    slaHoursLeft: 22,
    qaFlag: false,
    auditSample: true,
    lastActivity: "45m ago",
    overdue: false,
    riskScore: 2.2,
  },
  {
    id: "CHT-4909",
    patientName: "Lewis, Sandra K.",
    mrn: "M-02114",
    dob: "08/16/1971",
    measure: "HbA1c Testing (CDC)",
    measureCode: "HbA1c",
    plan: "Medicaid",
    priority: "High",
    status: "Audit Sample",
    step: 8,
    assignedTo: "P. Rao",
    dueDate: "2026-02-27",
    slaHoursLeft: 14,
    qaFlag: false,
    auditSample: true,
    lastActivity: "5h ago",
    overdue: false,
    riskScore: 1.8,
  },
  {
    id: "CHT-5012",
    patientName: "Morris, Dana K.",
    mrn: "M-05012",
    dob: "03/27/1968",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Commercial",
    priority: "Medium",
    status: "Audit Sample",
    step: 8,
    assignedTo: "R. Gupta",
    dueDate: "2026-02-28",
    slaHoursLeft: 36,
    qaFlag: false,
    auditSample: true,
    lastActivity: "2h ago",
    overdue: false,
    riskScore: 1.5,
  },
  {
    id: "CHT-5013",
    patientName: "Martinez, Rosa A.",
    mrn: "M-05013",
    dob: "02/09/1962",
    measure: "Breast Cancer Screening",
    measureCode: "BCS",
    plan: "Medicaid",
    priority: "Low",
    status: "Submission Ready",
    step: 9,
    assignedTo: "S. Johnson",
    dueDate: "2026-02-24",
    slaHoursLeft: 0,
    qaFlag: false,
    auditSample: false,
    lastActivity: "1d ago",
    overdue: false,
    riskScore: 1.3,
  },
  {
    id: "CHT-5014",
    patientName: "Chen, Robert L.",
    mrn: "M-05014",
    dob: "06/01/1957",
    measure: "Controlling Blood Pressure",
    measureCode: "CBP",
    plan: "Medicare",
    priority: "Low",
    status: "Submission Ready",
    step: 9,
    assignedTo: "D. Pillai",
    dueDate: "2026-02-24",
    slaHoursLeft: 0,
    qaFlag: false,
    auditSample: false,
    lastActivity: "2d ago",
    overdue: false,
    riskScore: 1.0,
  },
];

/* ─────────────────────────────────────────────────────────────
   MOCK CLIENTS DATA 
───────────────────────────────────────────────────────────── */
const MOCK_CLIENTS: Client[] = [
  {
    id: "CLT-001",
    name: "BlueCross BlueShield MA",
    type: "Health Plan",
    status: "Active",
    activeCases: 142,
    completedCases: 1834,
    memberCount: 45200,
    contractStart: "Jan 2024",
    primaryContact: "Sarah Mitchell",
  },
  {
    id: "CLT-002",
    name: "Aetna Better Health",
    type: "Health Plan",
    status: "Active",
    activeCases: 98,
    completedCases: 1203,
    memberCount: 32100,
    contractStart: "Mar 2024",
    primaryContact: "James Chen",
  },
  {
    id: "CLT-003",
    name: "UnitedHealthcare Community Plan",
    type: "Health Plan",
    status: "Active",
    activeCases: 87,
    completedCases: 967,
    memberCount: 28400,
    contractStart: "Jun 2024",
    primaryContact: "Maria Rodriguez",
  },
  {
    id: "CLT-004",
    name: "Tufts Health Plan",
    type: "Health Plan",
    status: "Active",
    activeCases: 56,
    completedCases: 789,
    memberCount: 19800,
    contractStart: "Feb 2024",
    primaryContact: "David Kim",
  },
  {
    id: "CLT-005",
    name: "Community Health Partners ACO",
    type: "ACO",
    status: "Active",
    activeCases: 34,
    completedCases: 456,
    memberCount: 12300,
    contractStart: "Aug 2024",
    primaryContact: "Emily Johnson",
  },
  {
    id: "CLT-006",
    name: "Boston Medical Center Physicians",
    type: "Provider Group",
    status: "Active",
    activeCases: 29,
    completedCases: 378,
    memberCount: 8900,
    contractStart: "May 2025",
    primaryContact: "Robert Patel",
  },
  {
    id: "CLT-007",
    name: "MassHealth MCO",
    type: "State Program",
    status: "Active",
    activeCases: 201,
    completedCases: 2456,
    memberCount: 67800,
    contractStart: "Jan 2023",
    primaryContact: "Linda Wong",
  },
  {
    id: "CLT-008",
    name: "Neighborhood Health Plan",
    type: "Health Plan",
    status: "Onboarding",
    activeCases: 12,
    completedCases: 45,
    memberCount: 15600,
    contractStart: "Feb 2026",
    primaryContact: "Michael Torres",
  },
  {
    id: "CLT-009",
    name: "Harvard Pilgrim Health Care",
    type: "Health Plan",
    status: "Active",
    activeCases: 67,
    completedCases: 892,
    memberCount: 24500,
    contractStart: "Apr 2024",
    primaryContact: "Jessica Park",
  },
  {
    id: "CLT-010",
    name: "WellSense Health Plan",
    type: "Health Plan",
    status: "Active",
    activeCases: 43,
    completedCases: 567,
    memberCount: 16700,
    contractStart: "Jul 2024",
    primaryContact: "Brian Lee",
  },
];

/* ─────────────────────────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────────────────────────── */
const ASSIGNEES = [
  "All",
  "S. Johnson",
  "R. Gupta",
  "D. Pillai",
  "M. Joshi",
  "P. Rao",
];
const MEASURES = ["All", "CBP", "HbA1c", "BCS", "COL", "FUH", "W34", "CIS"];
const PLAN_OPTIONS = ["All Plans", "Medicare", "Medicaid", "Commercial"];
const PRIORITY_OPTS = ["All", "Urgent", "High", "Medium", "Low"];
const PAGE_SIZES = [10, 25, 50];
const PRIORITY_ORDER: Record<Priority, number> = {
  Urgent: 0,
  High: 1,
  Medium: 2,
  Low: 3,
};

/* ─────────────────────────────────────────────────────────────
   BADGE COMPONENTS
──────────────────────────────────────────��────────────────── */
function StatusBadge({ status }: { status: Status }) {
  const p = getPipeline(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${p.bg} ${p.text} ${p.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${p.dot}`} />
      {status}
    </span>
  );
}

const PRIO_STYLES: Record<Priority, { pill: string; dot: string }> = {
  Urgent: { pill: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" },
  High: {
    pill: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
  },
  Medium: {
    pill: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  Low: {
    pill: "bg-slate-50 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const s = PRIO_STYLES[priority];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-bold ${s.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
      {priority}
    </span>
  );
}

const PLAN_STYLES: Record<Plan, string> = {
  Medicare: "bg-blue-50 text-blue-700 border-blue-200",
  Medicaid: "bg-violet-50 text-violet-700 border-violet-200",
  Commercial: "bg-teal-50 text-teal-700 border-teal-200",
};

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${PLAN_STYLES[plan]}`}
    >
      {plan}
    </span>
  );
}

function SlaBadge({ hours }: { hours: number }) {
  if (hours < 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold bg-red-50 text-red-700 border-red-200">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
        {Math.abs(hours)}h over
      </span>
    );
  if (hours === 0)
    return <span className="text-[10px] text-muted-foreground">—</span>;
  if (hours <= 12)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold bg-amber-50 text-amber-700 border-amber-200">
        <Clock className="w-2.5 h-2.5 flex-shrink-0" />
        {hours}h
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold bg-emerald-50 text-emerald-700 border-emerald-200">
      <Clock className="w-2.5 h-2.5 flex-shrink-0" />
      {hours}h
    </span>
  );
}

/* Row action button based on stage */
function RowAction({
  row,
  onOpen,
  onOpenWorkspace,
  onOpenQAReview,
  role,
}: {
  row: ChartRow;
  onOpen: () => void;
  onOpenWorkspace?: () => void;
  onOpenQAReview?: () => void;
  role?: "program-manager" | "abstractor" | "qa-analyst";
}) {
  const [phase, setPhase] = useState<"idle" | "loading" | "ready">("idle");
  const [launching, setLaunching] = useState(false);

  // ===================== PROGRAM MANAGER / ADMIN =====================
  if (role === "program-manager") {
    // Only show Assign button (mainly for Not Started / Unassigned charts)
    if (row.step === 1 || row.assignedTo === "—") {
      return (
        <button
          onClick={onOpen}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold text-blue-600 hover:bg-blue-50 border-blue-200 transition-colors"
        >
          <UserPlus className="w-3 h-3" />
          Assign
        </button>
      );
    }

    // For other stages - simple View button
    return (
      // <button
      //   onClick={onOpen}
      //   className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold text-slate-600 hover:bg-slate-50 border-slate-200 transition-colors"
      // >
      //   <Eye className="w-3 h-3" />
      //   View
      // </button>
      <div className="flex items-center justify-center py-2">
        <span className="text-slate-400 text-base font-light">—</span>
      </div>
    );
  }

  /* ── Step 2: multi-phase "Begin Review" ── */
  if (row.step === 2) {
    const handleBeginClick = () => {
      if (phase !== "idle") return;
      setPhase("loading");
      setTimeout(() => setPhase("ready"), 1100);
    };
    const handleLaunch = () => {
      if (launching) return;
      setLaunching(true);
      setTimeout(() => {
        setPhase("idle");
        setLaunching(false);
        if (role === "qa-analyst") {
          onOpenQAReview?.();
        } else {
          onOpenWorkspace?.();
        }
      }, 900);
    };
    const handleCancel = () => {
      setPhase("idle");
      setLaunching(false);
    };

    return (
      <>
        <button
          onClick={handleBeginClick}
          disabled={phase === "loading"}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-all duration-200 whitespace-nowrap ${
            phase === "ready"
              ? "bg-[#0891b2] text-white border-[#0891b2] shadow-sm"
              : phase === "loading"
                ? "bg-[#0891b2]/10 text-[#0891b2] border-[#0891b2]/20 cursor-wait"
                : "text-cyan-600 hover:bg-cyan-50 border-cyan-200"
          }`}
        >
          {phase === "loading" ? (
            <>
              <svg
                className="w-3 h-3 animate-spin flex-shrink-0"
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
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Opening…
            </>
          ) : phase === "ready" ? (
            <>
              <CheckCircle2 className="w-3 h-3" /> Ready
            </>
          ) : (
            <>
              <Play className="w-3 h-3" /> Begin Review
            </>
          )}
        </button>

        {phase === "ready" && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={handleCancel}
          >
            <div
              className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-[#f0f9ff] to-white">
                <div className="w-9 h-9 rounded-xl bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-4 h-4 text-[#0891b2]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-slate-800">
                    Chart Ready for Abstraction
                  </h3>
                  <p className="text-[10px] text-slate-500 truncate">
                    {row.id} · {row.patientName}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Measure
                    </p>
                    <p className="text-[12px] font-bold text-slate-800">
                      {row.measureCode}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">
                      {row.measure}
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2.5">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Plan · Priority
                    </p>
                    <p className="text-[12px] font-bold text-slate-800">
                      {row.plan}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {row.priority} Priority
                    </p>
                  </div>
                </div>

                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                    row.slaHoursLeft <= 12
                      ? "bg-amber-50 border-amber-200"
                      : "bg-emerald-50 border-emerald-100"
                  }`}
                >
                  <Clock
                    className={`w-3.5 h-3.5 flex-shrink-0 ${row.slaHoursLeft <= 12 ? "text-amber-500" : "text-emerald-500"}`}
                  />
                  <div>
                    <p
                      className={`text-[11px] font-bold ${row.slaHoursLeft <= 12 ? "text-amber-700" : "text-emerald-700"}`}
                    >
                      {row.slaHoursLeft}h SLA Remaining
                    </p>
                    <p
                      className={`text-[9px] ${row.slaHoursLeft <= 12 ? "text-amber-600" : "text-emerald-600"}`}
                    >
                      Due {row.dueDate}
                    </p>
                  </div>
                  <span
                    className={`ml-auto text-[9px] font-black px-2 py-0.5 rounded-full ${
                      row.slaHoursLeft <= 12
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {row.slaHoursLeft <= 12 ? "AT RISK" : "ON TRACK"}
                  </span>
                </div>

                <div className="flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-blue-700 leading-snug">
                    AI pre-analysis ready ·{" "}
                    <span className="font-bold">3 evidence items</span> flagged
                    for review in this chart
                  </p>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-2 text-[11px] font-semibold border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLaunch}
                    disabled={launching}
                    className="flex-[2] py-2 text-[11px] font-bold rounded-xl text-white bg-[#0891b2] hover:bg-[#0e7490] transition-all inline-flex items-center justify-center gap-1.5 disabled:opacity-70 shadow-sm whitespace-nowrap"
                  >
                    {launching ? (
                      <>
                        <svg
                          className="w-3 h-3 animate-spin flex-shrink-0"
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
                            d="M4 12a8 8 0 018-8v8z"
                          />
                        </svg>
                        Launching…
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" /> Launch Workspace
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  /* ── All other steps — original simple button ── */
  const cfg: Record<number, { label: string; icon: ElementType; cls: string }> =
    {
      1: {
        label: "Assign",
        icon: UserPlus,
        cls: "text-blue-600 hover:bg-blue-50 border-blue-200",
      },
      3: {
        label: "Submit to QA",
        icon: SendHorizontal,
        cls: "text-amber-600 hover:bg-amber-50 border-amber-200",
      },
      4: {
        label: "View QA",
        icon: Eye,
        cls: "text-amber-600 hover:bg-amber-50 border-amber-200",
      },
      5: {
        label: "Start Rework",
        icon: RotateCcw,
        cls: "text-orange-600 hover:bg-orange-50 border-orange-200",
      },
      6: {
        label: "Resubmit",
        icon: CornerDownLeft,
        cls: "text-rose-600 hover:bg-rose-50 border-rose-200",
      },
      7: {
        label: "View",
        icon: Eye,
        cls: "text-emerald-600 hover:bg-emerald-50 border-emerald-200",
      },
      8: {
        label: "View Audit",
        icon: Shield,
        cls: "text-violet-600 hover:bg-violet-50 border-violet-200",
      },
      9: {
        label: "Ready ✓",
        icon: CheckCircle2,
        cls: "text-teal-600 hover:bg-teal-50 border-teal-200",
      },
    };
  const c = cfg[row.step];
  const Icon = c.icon;
  return (
    <button
      onClick={onOpen}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition-colors ${c.cls}`}
    >
      <Icon className="w-3 h-3" />
      {c.label}
    </button>
  );
}

/* Sort header */
function Th({
  col,
  label,
  active,
  dir,
  onSort,
  className = "",
}: {
  col: string;
  label: string;
  active: boolean;
  dir: "asc" | "desc";
  onSort: () => void;
  className?: string;
}) {
  return (
    <th
      onClick={onSort}
      className={`px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground whitespace-nowrap transition-colors ${className}`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )
        ) : (
          <ArrowUpDown className="w-3 h-3 opacity-30" />
        )}
      </span>
    </th>
  );
}

/* Filter select */
function Sel({
  value,
  onChange,
  options,
  icon: Icon,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  icon?: ElementType;
}) {
  return (
    <div className="relative flex items-center">
      {Icon && (
        <Icon className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none z-10" />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none border border-border rounded-lg bg-card text-foreground text-[12px] font-medium pr-6 py-[6px] focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer hover:border-primary/40 transition-colors ${Icon ? "pl-7" : "pl-3"}`}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   KPI CARD COMPONENT
───────────────────────────────────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  colorIcon,
  colorBg,
  trend,
  trendUp,
  onClick,
  active,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: ElementType;
  colorIcon: string;
  colorBg: string;
  trend?: string;
  trendUp?: boolean;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-card border rounded-xl p-4 flex flex-col gap-2.5 hover:shadow-sm transition-all text-left w-full ${
        active
          ? "border-primary ring-2 ring-primary/20 shadow-sm"
          : "border-border"
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorBg}`}
        >
          <Icon className={`w-4 h-4 ${colorIcon}`} />
        </div>
        {trend && (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="w-2.5 h-2.5" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5" />
            )}
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-xl font-bold text-foreground leading-none">
          {value}
        </div>
        <div className="text-[11px] font-semibold text-muted-foreground mt-1">
          {label}
        </div>
        <div className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</div>
      </div>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   ASSIGN MODAL
���──────────────────────────────────────────────────────────── */
function AssignModal({
  chartIds,
  onClose,
  onAssign,
  roleType = "Abstractor",
}: {
  chartIds: string[];
  onClose: () => void;
  onAssign: (payload: {
    userId: string;
    userName: string;
    role: "Abstractor" | "QA";
  }) => void;
  roleType?: "Abstractor" | "QA";
}) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [priority, setPriority] = useState<Priority>("High");
  const [note, setNote] = useState("");
  const { data: usersResponse, isLoading } = useGetApiUsers(
    {
      page: 1,
      limit: 100,
      search: "",
    },
    {
      query: {
        select: (data: any) => {
          const filteredUsers =
            data?.results?.filter((user: any) => {
              const roleName = user?.user_role?.name?.trim();

              return ["Chart Abstractor", "Quality Analyst"].includes(roleName);
            }) || [];

          return {
            ...data,
            results: filteredUsers,
          };
        },
      },
    },
  );

  const users = usersResponse?.results || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[460px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-foreground">
                Assign Chart{chartIds.length > 1 ? "s" : ""}
              </h2>
              <p className="text-[11px] text-muted-foreground">
                {chartIds.length} chart{chartIds.length > 1 ? "s" : ""} selected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Chart IDs */}
          <div className="flex flex-wrap gap-1.5">
            {chartIds.map((id) => (
              <span
                key={id}
                className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold border border-primary/20"
              >
                {id}
              </span>
            ))}
          </div>

          {/* Assignee */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Assign To
            </label>

            {isLoading ? (
              <div className="text-[12px] text-muted-foreground">
                Loading users...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {users.map((user: any) => (
                  <button
                    key={user?.id}
                    onClick={() => setSelectedUser(user)}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-semibold text-left transition-all ${
                      selectedUser?.id === user?.id
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-foreground hover:border-primary/40"
                    }`}
                  >
                    <div className="font-semibold">{user?.full_name}</div>

                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {user?.user_role?.name}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Priority
            </label>
            <div className="flex gap-2">
              {(["Urgent", "High", "Medium", "Low"] as Priority[]).map((p) => {
                const s = PRIO_STYLES[p];
                return (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg border text-[11px] font-bold transition-all ${priority === p ? `${s.pill} ring-2 ring-offset-1` : "border-border text-muted-foreground hover:border-primary/40"}`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Assignment Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add instructions for the abstractor..."
              rows={3}
              className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-[12px] font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!selectedUser}
              onClick={() => {
                if (!selectedUser) return;

                onAssign({
                  userId: selectedUser?.id,
                  userName: selectedUser?.full_name,
                  role: roleType,
                });

                onClose();
              }}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[12px] font-bold hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Assign{" "}
              {chartIds.length > 1 ? `${chartIds.length} Charts` : "Chart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ADD CLIENT MODAL
───────────────────────────────────────────────────────────── */
function AddClientModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (clientData: any) => void;
}) {
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState<
    "Medicare" | "Medicaid" | "Commercial"
  >("Medicare");
  const [contractId, setContractId] = useState("");
  const [programYear, setProgramYear] = useState("MY2026");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmit = () => {
    if (!clientName.trim()) return;

    onAdd({
      clientName,
      clientType,
      contractId,
      programYear,
      contactName,
      contactEmail,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-[520px] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-violet-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-foreground">
                Add New Client
              </h2>
              <p className="text-[11px] text-muted-foreground">
                Create a new HEDIS client record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Client Name */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Client Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g., Blue Cross Health Plan"
              className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
          </div>

          {/* Client Type */}
          <div>
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Plan Type
            </label>
            <div className="flex gap-2">
              {(["Medicare", "Medicaid", "Commercial"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setClientType(type)}
                  className={`flex-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    clientType === type
                      ? "border-violet-500 bg-violet-50 text-violet-700 ring-2 ring-violet-200 ring-offset-1"
                      : "border-border text-muted-foreground hover:border-violet-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Contract ID & Program Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Contract ID
              </label>
              <input
                type="text"
                value={contractId}
                onChange={(e) => setContractId(e.target.value)}
                placeholder="e.g., H1234"
                className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Program Year
              </label>
              <select
                value={programYear}
                onChange={(e) => setProgramYear(e.target.value)}
                className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              >
                <option>MY2026</option>
                <option>MY2025</option>
                <option>MY2027</option>
              </select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="pt-2 border-t border-border">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
              Primary Contact
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  Contact Name
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g., Jane Smith"
                  className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1.5">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="e.g., jane.smith@healthplan.com"
                  className="w-full px-3 py-2 text-[12px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-foreground text-[12px] font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!clientName.trim()}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-[12px] font-bold hover:bg-violet-700 transition-colors inline-flex items-center justify-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Client
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   BULK ACTION BAR
───────────────────────────────────────────────────────────── */
function BulkBar({ count, onClear }: { count: number; onClear: () => void }) {
  const actions = [
    {
      label: "Bulk Assign",
      icon: UserPlus,
      cls: "text-primary hover:bg-primary/10",
    },
    {
      label: "Reassign",
      icon: RefreshCw,
      cls: "text-cyan-600 hover:bg-cyan-50",
    },
    {
      label: "Change Priority",
      icon: Flag,
      cls: "text-amber-600 hover:bg-amber-50",
    },
    {
      label: "Send to QA",
      icon: SendHorizontal,
      cls: "text-violet-600 hover:bg-violet-50",
    },
    {
      label: "Mark Complete",
      icon: CheckCircle2,
      cls: "text-emerald-600 hover:bg-emerald-50",
    },
  ];
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 border-b border-primary/20">
      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
        <span className="text-white text-[9px] font-bold">{count}</span>
      </div>
      <span className="text-[12px] font-semibold text-foreground mr-1">
        {count} selected
      </span>
      <div className="w-px h-4 bg-border mx-1" />
      {actions.map((a) => {
        const Icon = a.icon;
        return (
          <button
            key={a.label}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${a.cls}`}
          >
            <Icon className="w-3.5 h-3.5" />
            {a.label}
          </button>
        );
      })}
      <div className="flex-1" />
      <button
        onClick={onClear}
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Deselect all
      </button>
    </div>
  );
}

/* ───────────────────────────────────────────────────��─────────
   PIPELINE PROGRESS BAR
───────────────────────────────────────────────────────────── */
function PipelineBar({
  stageCounts,
}: {
  stageCounts: (typeof PIPELINE)[0][] & { count: number }[];
}) {
  const total = MOCK.length;
  return (
    <div className="flex items-center gap-0.5 h-1.5 rounded-full overflow-hidden">
      {stageCounts.map((s) => {
        const pct = (s.count / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={s.status}
            className={`h-full ${s.dot} opacity-80`}
            style={{ width: `${pct}%` }}
            title={`${s.label}: ${s.count}`}
          />
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function WorkQueue({
  role,
  onStartAbstraction,
  onOpenPatient360,
  onOpenQAReview,
}: {
  role?: "program-manager" | "abstractor" | "qa-analyst";
  onStartAbstraction: () => void;
  onOpenPatient360: () => void;
  onOpenQAReview?: () => void;
}) {
  // Component state
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<Status | "All">("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterAssignee, setFilterAssignee] = useState("All");
  const [filterMeasure, setFilterMeasure] = useState("All");
  const [filterPlan, setFilterPlan] = useState("All Plans");
  const [myWorkQueue, setMyWorkQueue] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortCol, setSortCol] = useState("step");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [assignModal, setAssignModal] = useState<string[]>([]);
  const [showQaNote, setShowQaNote] = useState<string | null>(null);
  const [showAddClient, setShowAddClient] = useState(false);
  const [clientSidebarCollapsed, setClientSidebarCollapsed] = useState(false);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState("");

  const { userDetail } = usePermissions();
  const rawRole = userDetail?.user_role?.name?.toLowerCase();

  // ===============================
  // ASSIGN MUTATION
  // ===============================
  const assignPatientMutation = usePostApiPatientsIdAssign({
    mutation: {
      onSuccess: () => {
        toast.success("Chart assigned successfully");
        refetch();
      },

      onError: () => {
        toast.error("Failed to assign chart");
      },
    },
  });

  const updateStageMutation = usePatchApiPatientsIdStage({
    mutation: {
      onSuccess: () => {
        toast.success("Stage updated successfully");
        refetch();
      },

      onError: () => {
        toast.error("Failed to update stage");
      },
    },
  });

  const bulkAssignMutation = usePostApiChartAssignmentsBulkAssign({
    mutation: {
      onSuccess: () => {
        toast.success("Charts assigned successfully");
        refetch();
      },

      onError: () => {
        toast.error("Failed to assign charts");
      },
    },
  });

  const effectiveRole = useMemo(() => {
    if (
      rawRole &&
      ["admin", "super admin", "operations/program manager"].includes(rawRole)
    )
      return "program-manager";
    if (rawRole === "chart abstractor") return "abstractor";
    if (rawRole === "quality analyst") return "qa-analyst";
    return role || "abstractor";
  }, [rawRole, role]);

  // Current user - in a real app this would come from auth context
  // const currentUser = userDetail?.full_name || "S. Johnson";
  const currentUser = "S. Johnson";

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setClientSidebarCollapsed(true); // collapse on small screens
      } else {
        setClientSidebarCollapsed(false); // expand on large screens
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const {
  //   data: patientsResponse,
  //   isLoading,
  //   isFetching,
  //   refetch,
  // } = useGetApiPatients(
  //   {
  //     search: search || undefined,
  //     stage: filterStage !== "All" ? filterStage : undefined,
  //     page_no: page,
  //     page_size: pageSize,
  //   },
  //   {
  //     query: {
  //       keepPreviousData: true,
  //       refetchOnWindowFocus: false,
  //     },
  //   },
  // );

  // const apiPatients = patientsResponse?.data ?? [];

  const workQueueTabMap: Record<string, string> = {
    All: "all",
    "Not Started": "not-started",
    Assigned: "assigned",
    "In Progress": "in-progress",
    "Pending QA": "pending-qa",
    "QA Returned": "qa-returned",
    Rework: "rework",
    Completed: "completed",
    "Submission Ready": "submission-ready",
  };

  const selectedTab = myWorkQueue
    ? "my-work"
    : workQueueTabMap[filterStage] || "all";

  const {
    data: workQueueResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetApiWorkQueue(
    {
      tab: selectedTab as any,

      search: search || undefined,

      plan: filterPlan !== "All Plans" ? filterPlan : undefined,

      priority: filterPriority !== "All" ? filterPriority : undefined,

      page_no: page,

      page_size: pageSize,
    },
    {
      query: {
        keepPreviousData: true,
        refetchOnWindowFocus: false,
      },
    },
  );

  const apiPatients = workQueueResponse?.data ?? [];
  const { data: usersResponse } = useGetApiUsers(
    {
      page: 1,
      limit: 100,
    },
    {
      query: {
        select: (data: any) => {
          return (
            data?.results?.filter((user: any) => {
              const roleName = user?.user_role?.name?.trim();

              return (
                roleName === "Chart Abstractor" ||
                roleName === "Quality Analyst"
              );
            }) || []
          );
        },
      },
    },
  );

  const ASSIGNEES = useMemo(() => {
    const users = usersResponse || [];

    return ["All", ...users.map((user: any) => `${user.full_name}`)];
  }, [usersResponse]);

  const workQueueData = useMemo(
    () =>
      apiPatients.map((item: any) => ({
        id: item?.patient_uuid,

        patientId: item?.patient_uuid,

        chartId: item?.chart_id,

        mrn: item?.mrn || "—",

        patientName:
          item?.patient_name ||
          `${item?.last_name || ""}, ${item?.first_name || ""}`,

        dob: item?.dob ? new Date(item.dob).toLocaleDateString() : "—",

        measureCode: item?.measure || "—",

        measure: item?.measure || "—",

        plan: item?.plan || "—",

        priority: item?.priority || "Medium",

        status: item?.stage || "Not Started",

        step: item?.step || 1,

        assignedTo:
          item?.abstractor_name ||
          item?.assigned_to_name ||
          (item?.stage === "Assigned" ? "Assigned" : "—"),

        dueDate: item?.due_date
          ? new Date(item.due_date).toLocaleDateString()
          : "—",

        slaHoursLeft: item?.sla_hours_left || 0,

        qaFlag: item?.qa_flag || false,

        qaNote: item?.qa_note || "",

        auditSample: item?.audit_sample || false,

        lastActivity: item?.updated_at
          ? new Date(item.updated_at).toLocaleString()
          : "—",

        overdue: item?.overdue || false,
      })),
    [apiPatients],
  );

  /* ── Pipeline counts ── */
  const counts = workQueueResponse?.counts;

  const stageCounts = [
    {
      status: "Not Started",
      short: "Not Started",
      count: counts?.notStarted || 0,
      dot: "bg-red-500",
    },
    {
      status: "Assigned",
      short: "Assigned",
      count: counts?.assigned || 0,
      dot: "bg-blue-500",
    },
    {
      status: "In Progress",
      short: "In Progress",
      count: counts?.inProgress || 0,
      dot: "bg-yellow-500",
    },
    {
      status: "Pending QA",
      short: "Pending QA",
      count: counts?.pendingQa || 0,
      dot: "bg-orange-500",
    },
    {
      status: "QA Returned",
      short: "QA Returned",
      count: counts?.qaReturned || 0,
      dot: "bg-red-500",
    },
    {
      status: "Rework",
      short: "Rework",
      count: counts?.rework || 0,
      dot: "bg-purple-500",
    },
    {
      status: "Completed",
      short: "Completed",
      count: counts?.completed || 0,
      dot: "bg-green-500",
    },
    {
      status: "Submission Ready",
      short: "Submission Ready",
      count: counts?.submissionReady || 0,
      dot: "bg-emerald-500",
    },
  ];

  /* ── KPIs ── */
  const kpi = {
    total: counts?.all || 0,
    overdue: 0,
    qaIssues: (counts?.qaReturned || 0) + (counts?.rework || 0),
    notStarted: counts?.notStarted || 0,
    myQueue: counts?.myWork || 0,
    ready: counts?.submissionReady || 0,
  };

  /* ── Filter + sort ── */
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return workQueueData.filter((r) => {
      if (
        q &&
        !r.patientName.toLowerCase().includes(q) &&
        !r.id.toLowerCase().includes(q) &&
        !r.mrn.toLowerCase().includes(q)
      )
        return false;

      // For abstractor role, always filter to current user's assignments
      // if (effectiveRole === "abstractor" && r.assignedTo !== currentUser)
      //   return false;

      // if (myWorkQueue && r.assignedTo !== currentUser) return false;
      // if (filterStage !== "All" && r.status !== filterStage) return false;
      if (filterPriority !== "All" && r.priority !== filterPriority)
        return false;
      if (filterAssignee !== "All" && r.assignedTo !== filterAssignee)
        return false;
      if (filterMeasure !== "All" && r.measureCode !== filterMeasure)
        return false;
      if (filterPlan !== "All Plans" && r.plan !== filterPlan) return false;
      return true;
    });
  }, [
    search,
    myWorkQueue,
    currentUser,
    filterStage,
    filterPriority,
    filterAssignee,
    filterMeasure,
    filterPlan,
    role,
  ]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        let cmp = 0;
        if (sortCol === "step") cmp = a.step - b.step;
        if (sortCol === "priority")
          cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        if (sortCol === "sla") cmp = a.slaHoursLeft - b.slaHoursLeft;
        if (sortCol === "patient")
          cmp = a.patientName.localeCompare(b.patientName);
        if (sortCol === "due") cmp = a.dueDate.localeCompare(b.dueDate);
        return sortDir === "asc" ? cmp : -cmp;
      }),
    [filtered, sortCol, sortDir],
  );

  const totalRecords = workQueueResponse?.total || sorted.length;

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (col: string) => {
    if (sortCol === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortCol(col);
      setSortDir("asc");
    }
  };

  const allOnPage =
    paginated.length > 0 && paginated.every((r) => selected.has(r.id));
  const toggleAll = () => {
    setSelected((s) => {
      const n = new Set(s);
      allOnPage
        ? paginated.forEach((r) => n.delete(r.id))
        : paginated.forEach((r) => n.add(r.id));
      return n;
    });
  };
  const toggleRow = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleRowOpen = (row: ChartRow) => {
    if (row.step === 1) {
      setAssignModal([row.id]);
      return;
    }
    onStartAbstraction();
  };

  const handleStageChange = async (patientId: string, stage: string) => {
    try {
      await updateStageMutation.mutateAsync({
        id: patientId,
        data: {
          stage,
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const hasActiveFilters =
    search ||
    myWorkQueue ||
    filterStage !== "All" ||
    filterPriority !== "All" ||
    filterAssignee !== "All" ||
    filterMeasure !== "All" ||
    filterPlan !== "All Plans";
  const clearAllFilters = () => {
    setSearch("");
    setMyWorkQueue(false);
    setFilterStage("All");
    setFilterPriority("All");
    setFilterAssignee("All");
    setFilterMeasure("All");
    setFilterPlan("All Plans");
    setPage(1);
  };

  // Filter clients
  const filteredClients = MOCK_CLIENTS.filter((client) => {
    if (!clientSearch) return true;
    const q = clientSearch.toLowerCase();
    return (
      client.name.toLowerCase().includes(q) ||
      client.type.toLowerCase().includes(q) ||
      client.primaryContact.toLowerCase().includes(q)
    );
  });

  const handleExport = async () => {
    try {
      toast.loading("Preparing export...", { id: "export-toast" });

      const blob = await getApiPatientsExport(
        {
          format: "csv",
        },
        {
          responseType: "blob",
        },
      );

      // Create downloadable link
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `patients_export_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Patients export downloaded successfully", {
        id: "export-toast",
      });
    } catch (err: any) {
      console.error("Patient export failed:", err);

      toast.error("Failed to export patients. Please try again.", {
        id: "export-toast",
      });
    }
  };

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ══════════════════════════════════════════════════════
          LEFT PANEL: CLIENT SIDEBAR (PM Only)
      ══════════════════════════════════════════════════════ */}
      {effectiveRole === "program-manager" && (
        <div
          className={`flex-shrink-0 flex flex-col border-r border-border overflow-hidden bg-card transition-all duration-300 ${clientSidebarCollapsed ? "w-12" : "w-80"}`}
        >
          {clientSidebarCollapsed ? (
            // Collapsed state
            <div className="flex flex-col items-center py-3 h-full">
              <button
                onClick={() => setClientSidebarCollapsed(false)}
                className="inline-flex items-center gap-2 whitespace-nowrap p-2 rounded hover:bg-muted transition-colors"
                title="Expand clients"
              >
                <ChevronRight className="w-4 h-4 text-primary" />
              </button>
              <div className="mt-3 flex flex-col items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                  {MOCK_CLIENTS.filter((c) => c.status === "Active").length}
                </span>
              </div>
            </div>
          ) : (
            <>
              {/* Client sidebar header */}
              <div className="flex-shrink-0 px-3 pt-3 pb-2.5 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary" />
                    <span className="text-[12px] font-bold text-foreground">
                      Clients
                    </span>
                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">
                      {MOCK_CLIENTS.filter((c) => c.status === "Active").length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <button
                      onClick={() => setShowAddClient(true)}
                      className="inline-flex items-center gap-1 whitespace-nowrap px-2 py-1 text-[10px] font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                      title="Add new client"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                    <button
                      onClick={() => setClientSidebarCollapsed(true)}
                      className="inline-flex items-center gap-2 whitespace-nowrap p-1 rounded hover:bg-muted transition-colors"
                      title="Minimize clients"
                    >
                      <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={clientSearch}
                    onChange={(e) => setClientSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Client list */}
              <div className="flex-1 overflow-y-auto">
                {filteredClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() =>
                      setSelectedClient(
                        client.id === selectedClient ? null : client.id,
                      )
                    }
                    className={`w-full text-left px-3 py-2.5 border-b border-border hover:bg-muted/50 transition-colors ${selectedClient === client.id ? "bg-primary/5" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-foreground truncate">
                            {client.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {client.type}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0 ${
                          client.status === "Active"
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                            : client.status === "Onboarding"
                              ? "bg-blue-100 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-2">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-foreground">
                          {client.activeCases}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          Active
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-foreground">
                          {client.completedCases}
                        </p>
                        <p className="text-[9px] text-muted-foreground">Done</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-foreground">
                          {(client.memberCount / 1000).toFixed(1)}k
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          Members
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {client.primaryContact}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredClients.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Search className="w-7 h-7 opacity-30 mb-2" />
                    <p className="text-[12px]">No clients found</p>
                  </div>
                )}
              </div>

              {/* Client stats footer */}
              <div className="flex-shrink-0 border-t border-border px-3 py-2.5">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm font-bold text-emerald-600">
                      {MOCK_CLIENTS.filter((c) => c.status === "Active").length}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-blue-600">
                      {
                        MOCK_CLIENTS.filter((c) => c.status === "Onboarding")
                          .length
                      }
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Onboarding
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      {MOCK_CLIENTS.reduce((sum, c) => sum + c.activeCases, 0)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      Total Cases
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          MAIN CONTENT AREA
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col flex-1 h-full overflow-hidden bg-background">
        {/* ════════════════════════════════════════════════════
          PAGE HEADER
      ════════════════════════════════════════════════════ */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border">
          <div className="flex items-center justify-between gap-4">
            {/* Left: title + meta */}
            <div className="flex items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <h1 className="text-base font-bold text-foreground">
                    Work Queue
                  </h1>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary px-2 py-0.5 rounded-full border border-primary/30">
                    <CircleDot className="w-2 h-2 fill-primary" />
                    Live
                  </span>
                </div>
                <p className="text-[12px] text-muted-foreground">
                  HEDIS Gap Closure Pipeline · MY2026 · Last refreshed Feb 24,
                  2026 at 09:41 AM
                </p>
              </div>
              <div className="h-8 w-px border-l border-border" />
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                  <span>
                    <span className="font-semibold text-foreground">
                      {kpi.overdue}
                    </span>{" "}
                    overdue
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span>
                    <span className="font-semibold text-foreground">
                      {kpi.qaIssues}
                    </span>{" "}
                    QA issues
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>
                    <span className="font-semibold text-foreground">
                      {kpi.ready}
                    </span>{" "}
                    ready
                  </span>
                </span>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              {effectiveRole === "program-manager" && null}
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                <RefreshCcw
                  className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`}
                />
                {isFetching ? "Refreshing..." : "Refresh"}
              </button>
              <button
                disabled={selected.size === 0}
                onClick={() => {
                  setAssignModal(Array.from(selected));
                }}
                className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs font-bold rounded-lg transition-colors
                ${
                  selected.size === 0
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary/90"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                Bulk Assign
                {selected.size > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px]">
                    {selected.size}
                  </span>
                )}
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
          KPI CARDS
      ════════════════════════════════════════════════════ */}

        {/* ════════════════════════════════════════════════════
          PIPELINE TAB STRIP
      ════════════════════════════════════════════════════ */}
        <div className="flex-shrink-0 border-b border-border bg-card">
          <div className="flex items-end overflow-x-auto px-4 gap-0">
            {/* For Chart Abstractor: Only show My Work Queue and Rework tabs */}
            {effectiveRole === "abstractor" ? (
              <>
                {/* My Work Queue tab */}
                <button
                  onClick={() => {
                    setMyWorkQueue(true);
                    setFilterStage("All");
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                    myWorkQueue && filterStage === "All"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  My Work Queue
                  {kpi.myQueue > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        myWorkQueue && filterStage === "All"
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {kpi.myQueue}
                    </span>
                  )}
                </button>

                {/* Rework tab - shows only user's assigned rework items */}
                <button
                  onClick={() => {
                    setFilterStage("Rework");
                    setMyWorkQueue(false);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                    filterStage === "Rework" && !myWorkQueue
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  {workQueueData.filter(
                    (r) =>
                      r.status === "Rework" && r.assignedTo === currentUser,
                  ).length > 0 && (
                    <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                      <span
                        className={`animate-ping absolute inline-flex h-full w-full rounded-full ${getPipeline("Rework").dot} opacity-60`}
                      />
                      <span
                        className={`relative inline-flex rounded-full h-1.5 w-1.5 ${getPipeline("Rework").dot}`}
                      />
                    </span>
                  )}
                  Rework
                  {workQueueData.filter(
                    (r) =>
                      r.status === "Rework" && r.assignedTo === currentUser,
                  ).length > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        filterStage === "Rework" && !myWorkQueue
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {
                        workQueueData.filter(
                          (r) =>
                            r.status === "Rework" &&
                            r.assignedTo === currentUser,
                        ).length
                      }
                    </span>
                  )}
                </button>
              </>
            ) : (
              <>
                {/* All tab - for other roles */}
                <button
                  onClick={() => {
                    setFilterStage("All");
                    setMyWorkQueue(false);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                    filterStage === "All" && !myWorkQueue
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  All Charts
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      filterStage === "All" && !myWorkQueue
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {kpi.total}
                  </span>
                </button>

                {/* My Work Queue tab - for other roles */}
                <button
                  onClick={() => {
                    setMyWorkQueue(true);
                    setFilterStage("All");
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                    myWorkQueue
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  My Work Queue
                  {kpi.myQueue > 0 && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                        myWorkQueue
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {kpi.myQueue}
                    </span>
                  )}
                </button>

                {/* Stage tabs - for other roles */}
                {stageCounts.map((stage) => (
                  <button
                    key={stage.status}
                    onClick={() => {
                      setFilterStage(stage.status);
                      setMyWorkQueue(false);
                      setPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors flex-shrink-0 ${
                      filterStage === stage.status && !myWorkQueue
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    {(stage.status === "Not Started" ||
                      stage.status === "QA Returned" ||
                      stage.status === "Rework") &&
                      stage.count > 0 && (
                        <span className="relative flex h-1.5 w-1.5 flex-shrink-0">
                          <span
                            className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stage.dot} opacity-60`}
                          />
                          <span
                            className={`relative inline-flex rounded-full h-1.5 w-1.5 ${stage.dot}`}
                          />
                        </span>
                      )}
                    {stage.short}
                    {stage.count > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                          filterStage === stage.status && !myWorkQueue
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {stage.count}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
          FIXED FILTER TOOLBAR
      ════════════════════════════════════════════════════ */}
        <div className="flex-shrink-0 bg-card border-b border-border px-6 py-2.5 flex items-center gap-2 flex-wrap shadow-sm">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
            <ListFilter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </div>
          <div className="w-px h-4 bg-border mx-0.5" />
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search patient, ID, MRN…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 pr-3 py-[6px] w-52 text-[12px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <Sel
            value={filterMeasure}
            onChange={(v) => {
              setFilterMeasure(v);
              setPage(1);
            }}
            options={MEASURES}
          />
          <Sel
            value={filterPlan}
            onChange={(v) => {
              setFilterPlan(v);
              setPage(1);
            }}
            options={PLAN_OPTIONS}
          />
          <Sel
            value={filterPriority}
            onChange={(v) => {
              setFilterPriority(v);
              setPage(1);
            }}
            options={PRIORITY_OPTS}
          />
          <Sel
            value={filterAssignee}
            onChange={(v) => {
              setFilterAssignee(v);
              setPage(1);
            }}
            options={ASSIGNEES}
            icon={Users}
          />
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 px-2.5 py-[6px] rounded-lg bg-primary/5 hover:bg-primary/10 border border-primary/20 transition-colors font-semibold"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          )}
          <div className="flex-1" />
          <span className="text-[11px] text-muted-foreground font-medium">
            {filtered.length} of {kpi.total} charts
          </span>
          <div className="w-px h-4 bg-border mx-0.5" />
          <Sel
            value={String(pageSize)}
            onChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
            options={PAGE_SIZES.map(String)}
          />
        </div>

        {/* ════════════════════════════════════════════════════
          SCROLLABLE TABLE BODY
      ════════════════════════════════════════════════════ */}
        <div className="flex-1 overflow-auto">
          {/* Bulk bar */}
          {selected.size > 0 && (
            <BulkBar
              count={selected.size}
              onClear={() => setSelected(new Set())}
            />
          )}

          {/* Table */}
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="bg-muted/40 border-b border-border">
                <th className="px-3 py-3 w-8">
                  <button
                    onClick={toggleAll}
                    className="flex items-center justify-center w-4 h-4"
                  >
                    {allOnPage ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </th>
                <Th
                  col="id"
                  label="Chart ID"
                  active={sortCol === "id"}
                  dir={sortDir}
                  onSort={() => handleSort("id")}
                />
                <Th
                  col="patient"
                  label="Patient"
                  active={sortCol === "patient"}
                  dir={sortDir}
                  onSort={() => handleSort("patient")}
                />
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Measure
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Plan
                </th>
                <Th
                  col="priority"
                  label="Priority"
                  active={sortCol === "priority"}
                  dir={sortDir}
                  onSort={() => handleSort("priority")}
                />
                <Th
                  col="step"
                  label="Stage"
                  active={sortCol === "step"}
                  dir={sortDir}
                  onSort={() => handleSort("step")}
                />
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Assigned To
                </th>
                <Th
                  col="due"
                  label="Due / SLA"
                  active={sortCol === "due"}
                  dir={sortDir}
                  onSort={() => handleSort("due")}
                />
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  QA / Audit
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Activity
                </th>
                <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={12}
                    className="py-16 text-center text-muted-foreground"
                  >
                    Loading patients...
                  </td>
                </tr>
              ) : (
                paginated.flatMap((row) => {
                  const isSel = selected.has(row.id);
                  const p = getPipeline(row.status);
                  const rows: JSX.Element[] = [];
                  rows.push(
                    <tr
                      key={row.id}
                      className={`group hover:bg-muted/20 transition-colors ${isSel ? "bg-primary/5" : "bg-card"} ${row.overdue ? "border-l-2 border-l-red-400" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleRow(row.id)}
                          className="flex items-center justify-center w-4 h-4"
                        >
                          {isSel ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                          )}
                        </button>
                      </td>

                      {/* Chart ID */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenPatient360();
                            }}
                            className="text-[11px] font-bold text-primary hover:underline cursor-pointer text-left"
                          >
                            {row.chartId}
                          </button>
                          <span className="text-[9px] text-muted-foreground font-medium">
                            {row.mrn}
                          </span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-[9px] font-bold text-primary">
                              {row.patientName
                                .split(",")[0]
                                .trim()
                                .substring(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[12px] font-semibold text-foreground whitespace-nowrap">
                              {row.patientName}
                            </span>
                            <span className="text-[9px] text-muted-foreground">
                              DOB: {row.dob}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Measure */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold w-fit border border-primary/20">
                            {row.measureCode}
                          </span>
                          <span className="text-[9px] text-muted-foreground truncate max-w-[130px]">
                            {row.measure}
                          </span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="px-3 py-3">
                        <PlanBadge plan={row.plan} />
                      </td>

                      {/* Priority */}
                      <td className="px-3 py-3">
                        <PriorityBadge priority={row.priority} />
                      </td>

                      {/* Stage */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <StatusBadge status={row.status} />
                          <div className="flex items-center gap-1">
                            {[...Array(9)].map((_, i) => (
                              <div
                                key={i}
                                className={`h-2 w-2 rounded-full flex-shrink-0 ${i < row.step ? p.dot : "bg-muted"}`}
                              />
                            ))}
                            <span className="text-[9px] text-muted-foreground ml-1">
                              {row.step}/9
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Assigned To */}
                      <td className="px-3 py-3">
                        {row.assignedTo === "—" ? (
                          <span className="text-[11px] text-muted-foreground italic">
                            Unassigned
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                              <span className="text-[8px] font-bold text-secondary-foreground">
                                {row.assignedTo
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </span>
                            </div>
                            <span className="text-[11px] font-semibold text-foreground">
                              {row.assignedTo}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Due / SLA */}
                      <td className="px-3 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-[11px] text-foreground font-medium">
                            {row.dueDate}
                          </span>
                          <SlaBadge hours={row.slaHoursLeft} />
                        </div>
                      </td>

                      {/* QA / Audit */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          {row.qaFlag && (
                            <button
                              onClick={() =>
                                setShowQaNote(
                                  showQaNote === row.id ? null : row.id,
                                )
                              }
                              title={row.qaNote}
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 hover:underline px-1.5 py-0.5 rounded-md bg-orange-50 border border-orange-200"
                            >
                              <RotateCcw className="w-3 h-3" />
                              QA
                            </button>
                          )}
                          {row.auditSample && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-600 px-1.5 py-0.5 rounded-md bg-violet-50 border border-violet-200">
                              <ScanSearch className="w-3 h-3" />
                              Audit
                            </span>
                          )}
                          {!row.qaFlag && !row.auditSample && (
                            <span className="text-muted-foreground/30 text-xs">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Activity */}
                      <td className="px-3 py-3">
                        <span className="text-[11px] text-muted-foreground">
                          {row.lastActivity}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3">
                        <RowAction
                          row={row}
                          onOpen={() => handleRowOpen(row)}
                          onOpenWorkspace={onStartAbstraction}
                          onOpenQAReview={onOpenQAReview}
                          role={effectiveRole}
                        />
                      </td>
                    </tr>,
                  );

                  if (showQaNote === row.id && row.qaNote) {
                    rows.push(
                      <tr key={`${row.id}-qa`} className="bg-orange-50/80">
                        <td colSpan={12} className="px-6 py-3">
                          <div className="flex items-start gap-2">
                            <div className="w-6 h-6 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-orange-700">
                                QA Return Note:{" "}
                              </span>
                              <span className="text-[11px] text-orange-700">
                                {row.qaNote}
                              </span>
                            </div>
                            <button
                              onClick={() => setShowQaNote(null)}
                              className="ml-auto text-orange-400 hover:text-orange-600 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>,
                    );
                  }

                  return rows;
                })
              )}
            </tbody>
          </table>

          {!isLoading && paginated.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <FileSearch className="w-7 h-7 opacity-40" />
              </div>
              <p className="text-[13px] font-semibold text-foreground">
                No charts match your filters
              </p>
              <p className="text-[11px] mt-1 text-muted-foreground">
                Try adjusting the stage, priority, or search terms
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors border border-primary/20"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════════════════
          PAGINATION
      ════════════════════════════════════════════════════ */}
        <div className="flex-shrink-0 border-t border-border px-6 py-3 flex items-center justify-between gap-4 bg-card">
          <div className="flex items-center gap-3">
            <span className="text-[12px] text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {Math.min((page - 1) * pageSize + 1, totalRecords)}
              </span>
              –
              <span className="font-semibold text-foreground">
                {Math.min(page * pageSize, totalRecords)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {totalRecords}
              </span>{" "}
              charts
            </span>
            {selected.size > 0 && (
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                {selected.size} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = i + 1;
              return (
                <button
                  key={pg}
                  onClick={() => setPage(pg)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-colors
                  ${page === pg ? "bg-primary text-white shadow-sm" : "border border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {pg}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* MODALS */}
        {assignModal.length > 0 && (
          <AssignModal
            chartIds={assignModal}
            roleType={effectiveRole === "qa-analyst" ? "QA" : "Abstractor"}
            onClose={() => setAssignModal([])}
            onAssign={async ({ userId, role }) => {
              try {
                const assignedRole =
                  role === "QA" ? "Quality Analyst" : "Chart Abstractor";

                // SINGLE CHART ASSIGN
                if (assignModal.length === 1) {
                  const chartId = assignModal[0];

                  await assignPatientMutation.mutateAsync({
                    id: chartId,
                    data: {
                      userId,
                      role: assignedRole,
                    },
                  });

                  await updateStageMutation.mutateAsync({
                    id: chartId,
                    data: {
                      stage: "Assigned",
                    },
                  });

                  toast.success("Chart assigned successfully");
                }

                // BULK CHART ASSIGN
                else {
                  const payload = {
                    chart_ids: assignModal,
                    assigned_users: [
                      {
                        user_id: userId,
                        assigned_role: assignedRole,
                      },
                    ],
                    priority: "Medium",
                    assignment_note: "Bulk assigned from Work Queue",
                  };

                  console.log("Bulk Assign Payload", payload);

                  await bulkAssignMutation.mutateAsync({
                    data: payload,
                  });

                  toast.success(
                    `${assignModal.length} charts assigned successfully`,
                  );
                }

                setAssignModal([]);
                setSelected(new Set());

                refetch();
              } catch (error) {
                console.error(error);

                toast.error("Failed to assign charts");
              }
            }}
          />
        )}

        {showAddClient && (
          <AddClientModal
            onClose={() => setShowAddClient(false)}
            onAdd={(clientData) => {
              console.log("Adding new client:", clientData);
              // In a real app, this would call an API
              setShowAddClient(false);
            }}
          />
        )}
      </div>
    </div>
  );
}
