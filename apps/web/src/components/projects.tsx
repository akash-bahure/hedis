import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Search,
  Filter,
  Plus,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Building2,
  FolderKanban,
  Users,
  ShieldCheck,
  Clock,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MoreHorizontal,
  Calendar,
  TrendingUp,
  Settings,
  Target,
  Zap,
  UserCheck,
  UserCog,
  ToggleLeft,
  ToggleRight,
  Edit3,
  Save,
  RefreshCw,
  Download,
  BookOpen,
  GitBranch,
  Award,
  Activity,
  BarChart3,
  AlertCircle,
  ChevronUp,
  Layers,
  Globe,
  Lock,
  Star,
  Eye,
  X,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────── */
type ProjectStatus = "Active" | "On Hold" | "Completed" | "Draft" | "At Risk";
type TabId =
  | "overview"
  | "scope"
  | "workflow"
  | "sla"
  | "team"
  | "allocation"
  | "performance"
  | "exceptions"
  | "compliance";

interface Project {
  id: string;
  name: string;
  client: string;
  type: string;
  specialty: string;
  team: string;
  slaCompliance: number;
  totalCharts: number;
  completedCharts: number;
  pendingCharts: number;
  wipCharts: number;
  status: ProjectStatus;
  startDate: string;
  endDate: string;
  pm: string;
  coders: number;
  auditors: number;
  priority: "High" | "Medium" | "Low";
}

/* ─── Mock Data ─────────────────────────────────────────────── */
const PROJECTS: Project[] = [
  {
    id: "PRJ-001",
    name: "Apollo Inpatient Coding FY26",
    client: "Apollo Hospitals – Delhi",
    type: "Inpatient",
    specialty: "Multi-Specialty",
    team: "Team Alpha",
    slaCompliance: 94,
    totalCharts: 3200,
    completedCharts: 2847,
    pendingCharts: 212,
    wipCharts: 141,
    status: "Active",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
    pm: "Riya Mehta",
    coders: 12,
    auditors: 4,
    priority: "High",
  },
  {
    id: "PRJ-002",
    name: "Fortis Cardiology HCC Coding",
    client: "Fortis Healthcare – Gurugram",
    type: "HCC",
    specialty: "Cardiology",
    team: "Team Beta",
    slaCompliance: 87,
    totalCharts: 1850,
    completedCharts: 1402,
    pendingCharts: 318,
    wipCharts: 130,
    status: "At Risk",
    startDate: "2026-01-15",
    endDate: "2026-07-15",
    pm: "Arun Sinha",
    coders: 8,
    auditors: 3,
    priority: "High",
  },
  {
    id: "PRJ-003",
    name: "Manipal Outpatient CPT Coding",
    client: "Manipal Hospitals – Bangalore",
    type: "Outpatient",
    specialty: "Orthopedics",
    team: "Team Gamma",
    slaCompliance: 98,
    totalCharts: 2100,
    completedCharts: 2050,
    pendingCharts: 40,
    wipCharts: 10,
    status: "Active",
    startDate: "2025-11-01",
    endDate: "2026-04-30",
    pm: "Seema Rao",
    coders: 9,
    auditors: 3,
    priority: "Medium",
  },
  {
    id: "PRJ-004",
    name: "Max ED Visit Coding – Q1",
    client: "Max Healthcare – Saket",
    type: "ED Visit",
    specialty: "Emergency Med.",
    team: "Team Delta",
    slaCompliance: 91,
    totalCharts: 980,
    completedCharts: 834,
    pendingCharts: 98,
    wipCharts: 48,
    status: "Active",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    pm: "Vikram Nair",
    coders: 5,
    auditors: 2,
    priority: "Medium",
  },
  {
    id: "PRJ-005",
    name: "Medanta Radiology Coding Pilot",
    client: "Medanta – The Medicity",
    type: "Outpatient",
    specialty: "Radiology",
    team: "Team Epsilon",
    slaCompliance: 100,
    totalCharts: 420,
    completedCharts: 420,
    pendingCharts: 0,
    wipCharts: 0,
    status: "Completed",
    startDate: "2025-10-01",
    endDate: "2026-01-31",
    pm: "Priya Thomas",
    coders: 4,
    auditors: 2,
    priority: "Low",
  },
  {
    id: "PRJ-006",
    name: "Narayana Cardiothoracic Coding",
    client: "Narayana Health – Bangalore",
    type: "Inpatient",
    specialty: "Cardiothoracic",
    team: "Team Alpha",
    slaCompliance: 76,
    totalCharts: 1540,
    completedCharts: 980,
    pendingCharts: 420,
    wipCharts: 140,
    status: "At Risk",
    startDate: "2026-02-01",
    endDate: "2026-08-31",
    pm: "Riya Mehta",
    coders: 10,
    auditors: 4,
    priority: "High",
  },
  {
    id: "PRJ-007",
    name: "Aster Oncology HCC Risk Adjustment",
    client: "Aster DM Health – Kerala",
    type: "HCC",
    specialty: "Oncology",
    team: "Team Zeta",
    slaCompliance: 89,
    totalCharts: 760,
    completedCharts: 612,
    pendingCharts: 104,
    wipCharts: 44,
    status: "Active",
    startDate: "2026-01-20",
    endDate: "2026-07-20",
    pm: "Kiran Patel",
    coders: 6,
    auditors: 2,
    priority: "Medium",
  },
  {
    id: "PRJ-008",
    name: "Rainbow Pediatrics Coding Setup",
    client: "Rainbow Children's Hospital",
    type: "Outpatient",
    specialty: "Pediatrics",
    team: "Team Eta",
    slaCompliance: 0,
    totalCharts: 0,
    completedCharts: 0,
    pendingCharts: 0,
    wipCharts: 0,
    status: "Draft",
    startDate: "2026-03-01",
    endDate: "2026-09-30",
    pm: "Anjali Bose",
    coders: 0,
    auditors: 0,
    priority: "Low",
  },
];

const performanceTrend = [
  { week: "W1", coded: 142, audited: 95, rejected: 8 },
  { week: "W2", coded: 168, audited: 112, rejected: 6 },
  { week: "W3", coded: 155, audited: 103, rejected: 10 },
  { week: "W4", coded: 189, audited: 128, rejected: 5 },
  { week: "W5", coded: 201, audited: 140, rejected: 7 },
  { week: "W6", coded: 176, audited: 118, rejected: 9 },
  { week: "W7", coded: 214, audited: 152, rejected: 4 },
  { week: "W8", coded: 198, audited: 138, rejected: 6 },
];

const slaHeatData = [
  { day: "Mon", onTime: 48, late: 6 },
  { day: "Tue", onTime: 52, late: 3 },
  { day: "Wed", onTime: 44, late: 9 },
  { day: "Thu", onTime: 58, late: 2 },
  { day: "Fri", onTime: 50, late: 5 },
];

const TEAM_MEMBERS = {
  pms: [
    "Riya Mehta",
    "Arun Sinha",
    "Seema Rao",
    "Vikram Nair",
    "Priya Thomas",
    "Kiran Patel",
    "Anjali Bose",
  ],
  coders: [
    "Ankit Sharma",
    "Deepa Pillai",
    "Rahul Gupta",
    "Meena Joshi",
    "Suresh Iyer",
    "Pooja Singh",
    "Tarun Das",
    "Kavita Reddy",
    "Nikhil Bhat",
    "Swati Kumar",
    "Arnav Jain",
    "Lata Verma",
  ],
  auditors: [
    "Dr. Priya Nair",
    "Dr. Ramesh Babu",
    "Dr. Sunita Roy",
    "Dr. Anil Chopra",
    "Dr. Fiona DSilva",
  ],
};

const AUDIT_MEMBERS = {
  L1: [
    "Dr. Priya Nair",
    "Dr. Ramesh Babu",
    "Dr. Sunita Roy",
    "Dr. Anil Chopra",
    "Dr. Fiona DSilva",
  ],
  L2: [
    "Dr. Kavitha Menon",
    "Dr. Suresh Pillai",
    "Dr. Rekha Sharma",
    "Dr. Anand Kulkarni",
    "Dr. Nisha Patel",
  ],
  L3: [
    "Dr. Rajesh Iyer",
    "Dr. Meera Krishnan",
    "Dr. Vivek Bose",
    "Dr. Shalini Gupta",
  ],
};

/* ─── Palette ────────────────────────────────────────────────── */
const C = {
  primary: "#0891b2",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  violet: "#8b5cf6",
  slate: "#64748b",
  cyan: "#06b6d4",
  teal: "#14b8a6",
};

/* ─── Shared Mini Components ─────────────────────────────────── */
function StatusBadge({ status }: { status: ProjectStatus }) {
  const map: Record<ProjectStatus, string> = {
    Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
    "At Risk": "bg-red-50 text-red-700 border-red-200",
    Completed: "bg-sky-50 text-sky-700 border-sky-200",
    "On Hold": "bg-amber-50 text-amber-700 border-amber-200",
    Draft: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const dot: Record<ProjectStatus, string> = {
    Active: "bg-emerald-500",
    "At Risk": "bg-red-500",
    Completed: "bg-sky-500",
    "On Hold": "bg-amber-500",
    Draft: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${map[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status}
    </span>
  );
}

function PriorityBadge({ p }: { p: "High" | "Medium" | "Low" }) {
  const map = {
    High: "text-red-600 bg-red-50",
    Medium: "text-amber-600 bg-amber-50",
    Low: "text-slate-500 bg-slate-100",
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${map[p]}`}>
      {p}
    </span>
  );
}

function SlaRing({ pct }: { pct: number }) {
  const color = pct >= 95 ? C.emerald : pct >= 85 ? C.amber : C.red;
  const r = 16,
    stroke = 4,
    circ = 2 * Math.PI * r;
  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: 44, height: 44 }}
    >
      <svg width={44} height={44} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={22}
          cy={22}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={22}
          cy={22}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-[9px] font-bold" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}

function ProgressBar({
  pct,
  color = C.primary,
}: {
  pct: number;
  color?: string;
}) {
  return (
    <div className="h-1.5 bg-muted rounded-full overflow-hidden w-full">
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${value ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-1"}`}
      />
    </button>
  );
}

function TabBtn({
  id,
  label,
  active,
  onClick,
}: {
  id: TabId;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
      }`}
    >
      {label}
    </button>
  );
}

/* ─── DETAIL TABS ─────────────────────────────────────────────── */

/* Overview */
function OverviewTab({ p }: { p: Project }) {
  const completionPct =
    p.totalCharts > 0
      ? Math.round((p.completedCharts / p.totalCharts) * 100)
      : 0;
  const stats = [
    {
      label: "Total Charts",
      value: p.totalCharts.toLocaleString(),
      color: C.primary,
      icon: FileText,
    },
    {
      label: "Completed",
      value: p.completedCharts.toLocaleString(),
      color: C.emerald,
      icon: CheckCircle2,
    },
    {
      label: "In Progress (WIP)",
      value: p.wipCharts.toLocaleString(),
      color: C.cyan,
      icon: Activity,
    },
    {
      label: "Pending",
      value: p.pendingCharts.toLocaleString(),
      color: C.amber,
      icon: Clock,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${s.color}18` }}
                >
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
              <div className="text-xl font-bold text-foreground">{s.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {s.label}
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Project Summary */}
        <Card className="p-5 col-span-2">
          <h4 className="text-sm font-bold text-foreground mb-4">
            Project Summary
          </h4>
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            {[
              { label: "Project ID", value: p.id },
              { label: "Client", value: p.client },
              { label: "Project Type", value: p.type },
              { label: "Specialty", value: p.specialty },
              { label: "Start Date", value: p.startDate },
              { label: "End Date", value: p.endDate },
              { label: "Project Manager", value: p.pm },
              { label: "Priority", value: <PriorityBadge p={p.priority} /> },
            ].map((r) => (
              <div key={r.label}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-0.5">
                  {r.label}
                </div>
                <div className="text-xs font-semibold text-foreground">
                  {r.value}
                </div>
              </div>
            ))}
          </div>

          {/* Work Progress */}
          <div className="mt-5 pt-5 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-foreground">
                Overall Progress
              </span>
              <span className="text-xs font-bold text-primary">
                {completionPct}%
              </span>
            </div>
            <div className="h-2.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground">
                {p.completedCharts.toLocaleString()} completed
              </span>
              <span className="text-[10px] text-muted-foreground">
                {p.totalCharts.toLocaleString()} total
              </span>
            </div>
          </div>
        </Card>

        {/* SLA + Team */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-4">
              SLA Compliance
            </h4>
            <div className="flex items-center justify-center mb-3">
              <div className="relative" style={{ width: 100, height: 100 }}>
                <svg
                  width={100}
                  height={100}
                  style={{ transform: "rotate(-90deg)" }}
                >
                  <circle
                    cx={50}
                    cy={50}
                    r={38}
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth={10}
                  />
                  <circle
                    cx={50}
                    cy={50}
                    r={38}
                    fill="none"
                    stroke={
                      p.slaCompliance >= 95
                        ? C.emerald
                        : p.slaCompliance >= 85
                          ? C.amber
                          : C.red
                    }
                    strokeWidth={10}
                    strokeDasharray={`${(p.slaCompliance / 100) * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-foreground">
                    {p.slaCompliance}%
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    Compliant
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              {[
                {
                  label: "Coding SLA",
                  pct: Math.min(p.slaCompliance + 2, 100),
                  color: C.primary,
                },
                {
                  label: "Audit SLA",
                  pct: Math.max(p.slaCompliance - 4, 0),
                  color: C.cyan,
                },
                {
                  label: "Rework SLA",
                  pct: Math.max(p.slaCompliance - 8, 0),
                  color: C.teal,
                },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground">
                      {r.label}
                    </span>
                    <span className="text-[10px] font-bold text-foreground">
                      {r.pct}%
                    </span>
                  </div>
                  <ProgressBar pct={r.pct} color={r.color} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-xs font-bold text-foreground mb-3">
              Team Overview
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <UserCog className="w-3.5 h-3.5" />
                  Project Manager
                </span>
                <span className="text-[11px] font-semibold text-foreground">
                  {p.pm}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Coders
                </span>
                <span className="text-[11px] font-bold text-foreground">
                  {p.coders}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5" />
                  Auditors
                </span>
                <span className="text-[11px] font-bold text-foreground">
                  {p.auditors}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* Scope Setup */
function ScopeTab() {
  const [selectedSpecialties, setSelectedSpecialties] = useState([
    "Cardiology",
    "Internal Medicine",
    "Emergency Medicine",
  ]);
  const [codingType, setCodingType] = useState("Professional");
  const [codeSystem, setCodeSystem] = useState("ICD-10-CM");
  const [encounterTypes, setEncounterTypes] = useState([
    "Inpatient",
    "Outpatient",
  ]);

  const specialties = [
    "Cardiology",
    "Internal Medicine",
    "Emergency Medicine",
    "Orthopedics",
    "Oncology",
    "Radiology",
    "Neurology",
    "Gastroenterology",
    "Nephrology",
    "Pulmonology",
    "Pediatrics",
    "Psychiatry",
    "OB/GYN",
    "Urology",
    "Ophthalmology",
  ];
  const codingTypes = ["Professional", "Facility", "Both"];
  const codeSystems = [
    "ICD-10-CM",
    "ICD-10-PCS",
    "CPT-4",
    "HCPCS Level II",
    "MS-DRG",
    "APR-DRG",
    "HCC/RAF",
  ];
  const encounters = [
    "Inpatient",
    "Outpatient",
    "ED Visit",
    "Observation",
    "Ambulatory Surgery",
    "Telehealth",
    "SNF",
    "Home Health",
  ];

  const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    arr.includes(val)
      ? setArr(arr.filter((x) => x !== val))
      : setArr([...arr, val]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        {/* Specialty Selection */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-1">
            Specialty Selection
          </h4>
          <p className="text-[11px] text-muted-foreground mb-4">
            Select all applicable clinical specialties for this project
          </p>
          <div className="flex flex-wrap gap-2">
            {specialties.map((s) => {
              const active = selectedSpecialties.includes(s);
              return (
                <button
                  key={s}
                  onClick={() =>
                    toggle(selectedSpecialties, setSelectedSpecialties, s)
                  }
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                    active
                      ? "bg-primary text-white border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary hover:text-primary"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3">
            {selectedSpecialties.length} selected
          </p>
        </Card>

        <div className="space-y-4">
          {/* Coding Type */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-1">
              Coding Type
            </h4>
            <p className="text-[11px] text-muted-foreground mb-3">
              Select the billing entity type for this project
            </p>
            <div className="flex gap-2">
              {codingTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setCodingType(t)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    codingType === t
                      ? "bg-primary text-white border-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Card>

          {/* Code System */}
          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-1">
              Code System
            </h4>
            <p className="text-[11px] text-muted-foreground mb-3">
              Primary code sets applied during coding
            </p>
            <div className="grid grid-cols-2 gap-2">
              {codeSystems.map((cs) => {
                const active = codeSystem === cs;
                return (
                  <button
                    key={cs}
                    onClick={() => setCodeSystem(cs)}
                    className={`text-left px-3 py-2 rounded-lg border text-[11px] font-semibold transition-colors ${
                      active
                        ? "bg-primary/10 border-primary text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {active && (
                      <CheckCircle2 className="w-3 h-3 inline mr-1.5 text-primary" />
                    )}
                    {cs}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Encounter Types */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-foreground mb-1">
          Encounter Types
        </h4>
        <p className="text-[11px] text-muted-foreground mb-4">
          Define which encounter categories are in scope
        </p>
        <div className="grid grid-cols-4 gap-2">
          {encounters.map((e) => {
            const active = encounterTypes.includes(e);
            return (
              <button
                key={e}
                onClick={() => toggle(encounterTypes, setEncounterTypes, e)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-[11px] font-semibold transition-colors ${
                  active
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                    : "border-border text-muted-foreground hover:border-border"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${active ? "bg-emerald-500 border-emerald-500" : "border-border"}`}
                >
                  {active && (
                    <span className="text-white text-[8px] font-bold">✓</span>
                  )}
                </div>
                {e}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* Workflow Setup */
function WorkflowTab() {
  const [codingRequired, setCodingRequired] = useState(true);
  const [auditRequired, setAuditRequired] = useState(true);
  const [auditL1, setAuditL1] = useState(true);
  const [auditL2, setAuditL2] = useState(true);
  const [auditL3, setAuditL3] = useState(false);
  const [reworkAllowed, setReworkAllowed] = useState(true);
  const [qaReview, setQaReview] = useState(true);
  const [aiAssist, setAiAssist] = useState(true);
  const [autoRelease, setAutoRelease] = useState(false);
  const [dualCoding, setDualCoding] = useState(false);

  const SettingRow = ({
    label,
    sub,
    value,
    onChange,
  }: {
    label: string;
    sub: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div>
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        {/* Core Workflow */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-1">
            Core Workflow
          </h4>
          <p className="text-[11px] text-muted-foreground mb-4">
            Configure the primary workflow stages for this project
          </p>
          <SettingRow
            label="Coding Required"
            sub="Enable the coding stage for all charts"
            value={codingRequired}
            onChange={setCodingRequired}
          />
          <SettingRow
            label="Audit Required"
            sub="Enable post-coding audit review stage"
            value={auditRequired}
            onChange={setAuditRequired}
          />
          <SettingRow
            label="Rework Allowed"
            sub="Allow rejected charts to be re-coded"
            value={reworkAllowed}
            onChange={setReworkAllowed}
          />
          <SettingRow
            label="QA Review"
            sub="Enable QA sampling before chart completion"
            value={qaReview}
            onChange={setQaReview}
          />
        </Card>

        {/* AI & Automation */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-1">
            AI & Automation
          </h4>
          <p className="text-[11px] text-muted-foreground mb-4">
            Configure AI-assisted coding and automation rules
          </p>
          <SettingRow
            label="AI Code Assist"
            sub="Enable AI-suggested codes during coding"
            value={aiAssist}
            onChange={setAiAssist}
          />
          <SettingRow
            label="Auto-Release"
            sub="Auto-release charts after audit pass"
            value={autoRelease}
            onChange={setAutoRelease}
          />
          <SettingRow
            label="Dual Coding"
            sub="Require two coders to code independently"
            value={dualCoding}
            onChange={setDualCoding}
          />
        </Card>
      </div>

      {/* Audit Level Configuration */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-foreground mb-1">
          Audit Level Configuration
        </h4>
        <p className="text-[11px] text-muted-foreground mb-5">
          Define which audit levels are active. Each level adds an additional
          review gate before chart completion.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              id: "l1",
              label: "L1 — Initial Review",
              sub: "First-pass audit by junior auditor. Checks code accuracy, DX sequence, and modifier usage.",
              value: auditL1,
              onChange: setAuditL1,
              color: "primary",
            },
            {
              id: "l2",
              label: "L2 — Secondary Review",
              sub: "Senior auditor review. Focuses on DRG optimization, risk adjustment, and payer-specific rules.",
              value: auditL2,
              onChange: setAuditL2,
              color: "cyan",
            },
            {
              id: "l3",
              label: "L3 — Escalation",
              sub: "Physician-level or compliance escalation. Triggered for disputed or high-risk charts.",
              value: auditL3,
              onChange: setAuditL3,
              color: "amber",
            },
          ].map((level) => (
            <div
              key={level.id}
              className={`p-4 rounded-xl border-2 transition-colors ${level.value ? "border-primary/40 bg-primary/5" : "border-border bg-muted/20"}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-foreground">
                  {level.label}
                </span>
                <Toggle value={level.value} onChange={level.onChange} />
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {level.sub}
              </p>
              <div
                className={`mt-3 text-[10px] font-bold px-2 py-0.5 rounded inline-block ${level.value ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}
              >
                {level.value ? "ENABLED" : "DISABLED"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Workflow Summary */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-foreground mb-4">
          Active Workflow Pipeline
        </h4>
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { label: "Chart Received", active: true },
            { label: "AI Suggestion", active: aiAssist },
            { label: "Coding", active: codingRequired },
            { label: "L1 Audit", active: auditRequired && auditL1 },
            { label: "L2 Audit", active: auditRequired && auditL2 },
            { label: "L3 Escalation", active: auditRequired && auditL3 },
            { label: "Rework", active: reworkAllowed },
            { label: "QA Review", active: qaReview },
            { label: "Completed", active: true },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center gap-2">
              <div
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border ${
                  step.active
                    ? "bg-primary text-white border-primary"
                    : "bg-muted/40 text-muted-foreground border-dashed border-border line-through"
                }`}
              >
                {step.label}
              </div>
              {i < arr.length - 1 && (
                <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* SLA Configuration */
function SLATab() {
  const [tat, setTat] = useState("48");
  const [codingSla, setCodingSla] = useState("24");
  const [auditSla, setAuditSla] = useState("12");
  const [reworkSla, setReworkSla] = useState("8");
  const [escalation, setEscalation] = useState("4");
  const [tatUnit, setTatUnit] = useState("hours");
  const [breach, setBreach] = useState("notify");

  const FieldRow = ({
    label,
    sub,
    value,
    setValue,
    unit = "hrs",
  }: {
    label: string;
    sub: string;
    value: string;
    setValue: (v: string) => void;
    unit?: string;
  }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-border last:border-0">
      <div className="flex-1">
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{sub}</div>
      </div>
      <div className="flex items-center gap-2 ml-8">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-20 text-center text-sm font-bold border border-border rounded-lg py-1.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <span className="text-[11px] text-muted-foreground w-8">{unit}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        {/* SLA Timers */}
        <Card className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-1">SLA Timers</h4>
          <p className="text-[11px] text-muted-foreground mb-4">
            Define time limits for each workflow stage
          </p>
          <FieldRow
            label="Turnaround Time (TAT)"
            sub="Total time from chart receipt to delivery"
            value={tat}
            setValue={setTat}
            unit={tatUnit}
          />
          <FieldRow
            label="Coding SLA"
            sub="Max time for a coder to complete a chart"
            value={codingSla}
            setValue={setCodingSla}
            unit="hrs"
          />
          <FieldRow
            label="Audit SLA"
            sub="Max time for an auditor to review a chart"
            value={auditSla}
            setValue={setAuditSla}
            unit="hrs"
          />
          <FieldRow
            label="Rework SLA"
            sub="Max time to re-code a rejected chart"
            value={reworkSla}
            setValue={setReworkSla}
            unit="hrs"
          />
          <FieldRow
            label="Escalation Time"
            sub="Time before auto-escalation triggers"
            value={escalation}
            setValue={setEscalation}
            unit="hrs"
          />

          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs font-semibold text-foreground mb-2">
              TAT Unit
            </div>
            <div className="flex gap-2">
              {["hours", "days", "business days"].map((u) => (
                <button
                  key={u}
                  onClick={() => setTatUnit(u)}
                  className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg border transition-colors ${
                    tatUnit === u
                      ? "bg-primary text-white border-primary"
                      : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Breach Policy */}
        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-1">
              Breach Policy
            </h4>
            <p className="text-[11px] text-muted-foreground mb-4">
              Define action taken when SLA is breached
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "notify",
                  label: "Notify Only",
                  sub: "Send notification to PM and team lead",
                },
                {
                  id: "escalate",
                  label: "Auto-Escalate",
                  sub: "Reassign chart to senior coder",
                },
                {
                  id: "flag",
                  label: "Flag & Hold",
                  sub: "Flag chart and pause workflow",
                },
                {
                  id: "override",
                  label: "Supervisor Override",
                  sub: "Require supervisor approval to proceed",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setBreach(opt.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    breach === opt.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        breach === opt.id
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {breach === opt.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-foreground">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {opt.sub}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-3">
              SLA Summary
            </h4>
            <div className="space-y-2">
              {[
                { label: "TAT", value: `${tat} ${tatUnit}`, bar: 100 },
                {
                  label: "Coding",
                  value: `${codingSla} hrs`,
                  bar: Math.round((+codingSla / +tat) * 100),
                },
                {
                  label: "Audit",
                  value: `${auditSla} hrs`,
                  bar: Math.round((+auditSla / +tat) * 100),
                },
                {
                  label: "Rework",
                  value: `${reworkSla} hrs`,
                  bar: Math.round((+reworkSla / +tat) * 100),
                },
              ].map((r, i) => (
                <div key={r.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] text-muted-foreground">
                      {r.label}
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {r.value}
                    </span>
                  </div>
                  <ProgressBar
                    pct={r.bar}
                    color={[C.primary, C.cyan, C.teal, C.amber][i]}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* Team Allocation */
function TeamTab({ p }: { p: Project }) {
  const [pm, setPm] = useState(p.pm);
  const [selectedCoders, setSelectedCoders] = useState(
    TEAM_MEMBERS.coders.slice(0, p.coders),
  );
  const [selectedAuditors, setSelectedAuditors] = useState(
    TEAM_MEMBERS.auditors.slice(0, p.auditors),
  );

  const initials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2);

  const Avatar = ({
    name,
    role,
    onRemove,
  }: {
    name: string;
    role?: string;
    onRemove?: () => void;
  }) => (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border group hover:border-primary/30 transition-colors">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
        {initials(name)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold text-foreground truncate">
          {name}
        </div>
        {role && (
          <div className="text-[10px] text-muted-foreground">{role}</div>
        )}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 transition-all"
        >
          <XCircle className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-5">
        {/* Project Manager */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">
                Project Manager
              </h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                1 PM per project
              </p>
            </div>
            <UserCog className="w-4 h-4 text-primary" />
          </div>
          <div className="mb-4">
            <Avatar name={pm} role="Project Manager" />
          </div>
          <div className="mt-3">
            <label className="text-[11px] text-muted-foreground mb-1.5 block">
              Change PM
            </label>
            <select
              value={pm}
              onChange={(e) => setPm(e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-2.5 py-1.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {TEAM_MEMBERS.pms.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </Card>

        {/* Coders */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Coders</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {selectedCoders.length} assigned
              </p>
            </div>
            <Users className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto mb-3">
            {selectedCoders.map((c) => (
              <Avatar
                key={c}
                name={c}
                role="Medical Coder"
                onRemove={() =>
                  setSelectedCoders(selectedCoders.filter((x) => x !== c))
                }
              />
            ))}
          </div>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value && !selectedCoders.includes(e.target.value))
                setSelectedCoders([...selectedCoders, e.target.value]);
              e.target.value = "";
            }}
            className="w-full text-xs border border-dashed border-primary/50 rounded-lg px-2.5 py-1.5 bg-primary/5 text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">+ Add Coder</option>
            {TEAM_MEMBERS.coders
              .filter((c) => !selectedCoders.includes(c))
              .map((c) => (
                <option key={c}>{c}</option>
              ))}
          </select>
        </Card>

        {/* Auditors */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-foreground">Auditors</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {selectedAuditors.length} assigned
              </p>
            </div>
            <UserCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="space-y-1.5 max-h-52 overflow-y-auto mb-3">
            {selectedAuditors.map((a) => (
              <Avatar
                key={a}
                name={a}
                role="Clinical Auditor"
                onRemove={() =>
                  setSelectedAuditors(selectedAuditors.filter((x) => x !== a))
                }
              />
            ))}
          </div>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value && !selectedAuditors.includes(e.target.value))
                setSelectedAuditors([...selectedAuditors, e.target.value]);
              e.target.value = "";
            }}
            className="w-full text-xs border border-dashed border-primary/50 rounded-lg px-2.5 py-1.5 bg-primary/5 text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">+ Add Auditor</option>
            {TEAM_MEMBERS.auditors
              .filter((a) => !selectedAuditors.includes(a))
              .map((a) => (
                <option key={a}>{a}</option>
              ))}
          </select>
        </Card>
      </div>

      {/* Capacity Overview */}
      <Card className="p-5">
        <h4 className="text-sm font-bold text-foreground mb-4">
          Team Capacity Overview
        </h4>
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              role: "Coders",
              count: selectedCoders.length,
              capacity: selectedCoders.length * 45,
              utilization: 78,
              color: C.primary,
            },
            {
              role: "Auditors",
              count: selectedAuditors.length,
              capacity: selectedAuditors.length * 30,
              utilization: 82,
              color: C.cyan,
            },
            {
              role: "Rework Pool",
              count: Math.ceil(selectedCoders.length * 0.3),
              capacity: Math.ceil(selectedCoders.length * 0.3) * 20,
              utilization: 45,
              color: C.amber,
            },
          ].map((r) => (
            <div
              key={r.role}
              className="p-4 rounded-xl bg-muted/20 border border-border"
            >
              <div className="flex justify-between mb-2">
                <span className="text-xs font-semibold text-foreground">
                  {r.role}
                </span>
                <span className="text-xs font-bold text-foreground">
                  {r.count} members
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mb-2">
                Daily capacity: {r.capacity} charts
              </div>
              <ProgressBar pct={r.utilization} color={r.color} />
              <div className="text-[10px] text-muted-foreground mt-1">
                {r.utilization}% utilized
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* Allocation Rules */
function AllocationTab() {
  const [method, setMethod] = useState("round-robin");
  const [priority, setPriority] = useState("sla");

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <Card className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-1">
            Assignment Method
          </h4>
          <p className="text-[11px] text-muted-foreground mb-4">
            How charts are distributed among the team
          </p>
          <div className="space-y-2">
            {[
              {
                id: "round-robin",
                label: "Round Robin",
                sub: "Distribute charts evenly across all coders in rotation",
              },
              {
                id: "load-balance",
                label: "Load Balancing",
                sub: "Assign charts based on current coder workload and capacity",
              },
              {
                id: "skill-match",
                label: "Skill-Based Matching",
                sub: "Route charts to coders with matching specialty expertise",
              },
              {
                id: "manual",
                label: "Manual Assignment",
                sub: "PM manually assigns charts to specific coders",
              },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setMethod(opt.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${method === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-border"}`}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className={`w-3.5 h-3.5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${method === opt.id ? "border-primary" : "border-muted-foreground"}`}
                  >
                    {method === opt.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-bold text-foreground">
                      {opt.label}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {opt.sub}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-1">
              Priority Rules
            </h4>
            <p className="text-[11px] text-muted-foreground mb-4">
              How charts are prioritized in the queue
            </p>
            <div className="space-y-2">
              {[
                {
                  id: "sla",
                  label: "SLA Due Date",
                  sub: "Prioritize charts closest to breach",
                },
                {
                  id: "received",
                  label: "Date Received",
                  sub: "FIFO — oldest charts first",
                },
                {
                  id: "value",
                  label: "Chart Value",
                  sub: "Higher DRG weight / RVU charts first",
                },
                {
                  id: "custom",
                  label: "Custom Rules",
                  sub: "Define custom priority logic",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setPriority(opt.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${priority === opt.id ? "border-primary bg-primary/5" : "border-border hover:border-border"}`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${priority === opt.id ? "border-primary" : "border-muted-foreground"}`}
                    >
                      {priority === opt.id && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-foreground">
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {opt.sub}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h4 className="text-sm font-bold text-foreground mb-3">
              Chart Cap Per Coder
            </h4>
            <div className="space-y-3">
              {[
                { label: "Daily Cap", value: "50 charts" },
                { label: "Weekly Cap", value: "220 charts" },
                { label: "Max WIP", value: "8 charts" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-[11px] text-muted-foreground">
                    {r.label}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* Performance Metrics */
function PerformanceTab({ p }: { p: Project }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Coding Accuracy",
            value: "96.2%",
            trend: "+0.4%",
            up: true,
            color: C.emerald,
          },
          {
            label: "Audit Pass Rate",
            value: "94.8%",
            trend: "+1.2%",
            up: true,
            color: C.primary,
          },
          {
            label: "Avg. Coding Time",
            value: "20.4m",
            trend: "-2.1m",
            up: true,
            color: C.cyan,
          },
          {
            label: "Rejection Rate",
            value: "5.2%",
            trend: "-0.8%",
            up: false,
            color: C.amber,
          },
        ].map((m) => (
          <Card key={m.label} className="p-4">
            <div className="text-[10px] text-muted-foreground mb-1">
              {m.label}
            </div>
            <div className="text-xl font-bold text-foreground">{m.value}</div>
            <div
              className={`text-[10px] font-semibold mt-0.5 ${m.up ? "text-emerald-600" : "text-amber-600"}`}
            >
              {m.trend} vs. last period
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-5">
        <Card className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-4">
            Weekly Coding & Audit Volume
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={performanceTrend} barSize={16}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="week"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar
                dataKey="coded"
                name="Coded"
                fill={C.primary}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="audited"
                name="Audited"
                fill={C.cyan}
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="rejected"
                name="Rejected"
                fill={C.red}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h4 className="text-sm font-bold text-foreground mb-4">
            Daily SLA Compliance
          </h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={slaHeatData} barSize={28}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                vertical={false}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip
                contentStyle={{
                  fontSize: 11,
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                }}
              />
              <Bar
                dataKey="onTime"
                name="On Time"
                stackId="a"
                fill={C.emerald}
                radius={0}
              />
              <Bar
                dataKey="late"
                name="Late"
                stackId="a"
                fill={C.red}
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5">
        <h4 className="text-sm font-bold text-foreground mb-4">
          Coder Performance Breakdown
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Coder",
                  "Charts Coded",
                  "Accuracy",
                  "Avg. Time",
                  "Rejected",
                  "SLA Met",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TEAM_MEMBERS.coders.slice(0, 5).map((c, i) => {
                const acc = [98.2, 97.6, 96.8, 95.4, 94.1][i];
                const charts = [52, 47, 41, 38, 29][i];
                const time = ["18m", "21m", "22m", "24m", "26m"][i];
                const rejected = [1, 1, 2, 2, 3][i];
                const sla = [99, 97, 95, 93, 90][i];
                return (
                  <tr
                    key={c}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary">
                          {c
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="font-semibold text-foreground">
                          {c}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-foreground">
                      {charts}
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${acc >= 97 ? "text-emerald-600" : acc >= 95 ? "text-amber-600" : "text-red-500"}`}
                      >
                        {acc}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-foreground">{time}</td>
                    <td className="py-2.5 px-3 text-red-500 font-semibold">
                      {rejected}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <ProgressBar
                          pct={sla}
                          color={sla >= 95 ? C.emerald : C.amber}
                        />
                        <span className="text-[10px] font-bold text-foreground w-8">
                          {sla}%
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${acc >= 97 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                      >
                        {acc >= 97 ? "Excellent" : "Good"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* Exceptions */
function ExceptionsTab() {
  const exceptions = [
    {
      id: "EXC-001",
      chart: "CHT-78542",
      patient: "Anderson, J.K.",
      type: "Coding Conflict",
      reason: "Conflicting DX codes assigned – E11.9 vs E11.65",
      raised: "2026-02-18",
      severity: "High",
      status: "Open",
    },
    {
      id: "EXC-002",
      chart: "CHT-78601",
      patient: "Martinez, C.D.",
      type: "SLA Breach",
      reason: "Chart exceeded 48hr TAT without completion",
      raised: "2026-02-17",
      severity: "Critical",
      status: "Escalated",
    },
    {
      id: "EXC-003",
      chart: "CHT-78388",
      patient: "Thompson, R.A.",
      type: "Missing Document",
      reason: "Operative note missing for CPT 27447 justification",
      raised: "2026-02-16",
      severity: "Medium",
      status: "Parked",
    },
    {
      id: "EXC-004",
      chart: "CHT-77904",
      patient: "Williams, S.M.",
      type: "Audit Disagreement",
      reason: "L2 auditor overturned coder DRG assignment",
      raised: "2026-02-15",
      severity: "High",
      status: "In Review",
    },
    {
      id: "EXC-005",
      chart: "CHT-77211",
      patient: "Chen, P.L.",
      type: "AI Override",
      reason: "Coder overrode AI-suggested code with no rationale",
      raised: "2026-02-14",
      severity: "Low",
      status: "Resolved",
    },
    {
      id: "EXC-006",
      chart: "CHT-76889",
      patient: "Kumar, S.",
      type: "Payer Rule Conflict",
      reason: "CPT-modifier combination rejected by payer LCD rule",
      raised: "2026-02-13",
      severity: "Medium",
      status: "Open",
    },
  ];

  const sevColor: Record<string, string> = {
    Critical: "bg-red-100 text-red-800 border-red-200",
    High: "bg-orange-50 text-orange-700 border-orange-200",
    Medium: "bg-amber-50 text-amber-700 border-amber-200",
    Low: "bg-slate-50 text-slate-600 border-slate-200",
  };
  const statColor: Record<string, string> = {
    Open: "bg-red-50 text-red-700",
    Escalated: "bg-violet-50 text-violet-700",
    Parked: "bg-amber-50 text-amber-700",
    "In Review": "bg-sky-50 text-sky-700",
    Resolved: "bg-emerald-50 text-emerald-700",
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Open",
            count: 2,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
          {
            label: "Escalated",
            count: 1,
            color: "text-violet-700",
            bg: "bg-violet-50 border-violet-200",
          },
          {
            label: "In Review",
            count: 1,
            color: "text-sky-700",
            bg: "bg-sky-50 border-sky-200",
          },
          {
            label: "Resolved",
            count: 1,
            color: "text-emerald-700",
            bg: "bg-emerald-50 border-emerald-200",
          },
        ].map((s) => (
          <Card key={s.label} className={`p-4 border ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h4 className="text-sm font-bold text-foreground">Exception Log</h4>
          <button className="inline-flex items-center gap-1.5 text-[11px] text-primary font-semibold hover:underline">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {[
                  "Exception ID",
                  "Chart",
                  "Patient",
                  "Type",
                  "Reason",
                  "Raised",
                  "Severity",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-2.5 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exceptions.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="py-2.5 px-3 font-mono text-[11px] text-primary font-bold">
                    {e.id}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                    {e.chart}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-foreground whitespace-nowrap">
                    {e.patient}
                  </td>
                  <td className="py-2.5 px-3 text-foreground whitespace-nowrap">
                    {e.type}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground max-w-xs truncate">
                    {e.reason}
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {e.raised}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${sevColor[e.severity]}`}
                    >
                      {e.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statColor[e.status]}`}
                    >
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* Compliance */
function ComplianceTab() {
  const checks = [
    {
      label: "HIPAA Data Handling",
      status: "Pass",
      date: "2026-02-01",
      score: 100,
    },
    {
      label: "CMS Coding Guidelines Adherence",
      status: "Pass",
      date: "2026-02-15",
      score: 98,
    },
    {
      label: "AHIMA Standards Compliance",
      status: "Pass",
      date: "2026-02-10",
      score: 97,
    },
    {
      label: "OIG Exclusion List Screening",
      status: "Pass",
      date: "2026-02-20",
      score: 100,
    },
    {
      label: "Payer-Specific LCD/NCD Rules",
      status: "Warn",
      date: "2026-02-18",
      score: 84,
    },
    {
      label: "Audit Trail Completeness",
      status: "Pass",
      date: "2026-02-20",
      score: 99,
    },
    {
      label: "Coder Credential Validation",
      status: "Pass",
      date: "2026-01-15",
      score: 100,
    },
    {
      label: "Data Encryption at Rest & Transit",
      status: "Pass",
      date: "2026-02-01",
      score: 100,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Overall Score",
            value: "97.2%",
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
            icon: Award,
          },
          {
            label: "Last Audit",
            value: "Feb 20, 2026",
            color: "text-primary",
            bg: "bg-sky-50 border-sky-200",
            icon: Calendar,
          },
          {
            label: "Open Issues",
            value: "1 Warning",
            color: "text-amber-600",
            bg: "bg-amber-50 border-amber-200",
            icon: AlertCircle,
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className={`p-4 border ${s.bg}`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${s.color}`} />
                <div>
                  <div className={`text-base font-bold ${s.color}`}>
                    {s.value}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {s.label}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border">
          <h4 className="text-sm font-bold text-foreground">
            Compliance Checklist
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Automated compliance checks run daily
          </p>
        </div>
        <div className="divide-y divide-border">
          {checks.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-4 px-5 py-3 hover:bg-muted/20 transition-colors"
            >
              {c.status === "Pass" ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">
                  {c.label}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Last checked: {c.date}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-24">
                  <ProgressBar
                    pct={c.score}
                    color={c.score >= 95 ? C.emerald : C.amber}
                  />
                </div>
                <span className="text-[11px] font-bold text-foreground w-10 text-right">
                  {c.score}%
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    c.status === "Pass"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {c.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ─── PROJECT DETAIL VIEW ─────────────────────────────────────── */
function ProjectDetail({
  project,
  onBack,
}: {
  project: Project;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");

  const TABS: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "scope", label: "Scope Setup" },
    { id: "workflow", label: "Workflow Setup" },
    { id: "sla", label: "SLA Configuration" },
    { id: "team", label: "Team Allocation" },
    { id: "allocation", label: "Allocation Rules" },
    { id: "performance", label: "Performance Metrics" },
    { id: "exceptions", label: "Exceptions" },
    { id: "compliance", label: "Compliance" },
  ];

  return (
    <div className="space-y-4">
      {/* Detail Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[11px] font-mono text-muted-foreground">
                {project.id}
              </span>
              <StatusBadge status={project.status} />
              <PriorityBadge p={project.priority} />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {project.name}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              {project.client}
              <span className="text-border">·</span>
              <FolderKanban className="w-3.5 h-3.5" />
              {project.type}
              <span className="text-border">·</span>
              <Users className="w-3.5 h-3.5" />
              {project.team}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Edit3 className="w-3.5 h-3.5" />
            Edit
          </button>
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Save className="w-3.5 h-3.5" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <Card className="overflow-hidden">
        <div className="flex overflow-x-auto border-b border-border px-2 bg-muted/20">
          {TABS.map((t) => (
            <TabBtn
              key={t.id}
              id={t.id}
              label={t.label}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
            />
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-5">
          {activeTab === "overview" && <OverviewTab p={project} />}
          {activeTab === "scope" && <ScopeTab />}
          {activeTab === "workflow" && <WorkflowTab />}
          {activeTab === "sla" && <SLATab />}
          {activeTab === "team" && <TeamTab p={project} />}
          {activeTab === "allocation" && <AllocationTab />}
          {activeTab === "performance" && <PerformanceTab p={project} />}
          {activeTab === "exceptions" && <ExceptionsTab />}
          {activeTab === "compliance" && <ComplianceTab />}
        </div>
      </Card>
    </div>
  );
}

/* ─── NEW PROJECT MODAL ───────────────────────────────────────── */
const PROJECT_TYPES = [
  "Inpatient",
  "Outpatient",
  "HCC",
  "ED Visit",
  "Observation",
  "Telehealth",
];
const SPECIALTIES = [
  "Multi-Specialty",
  "Cardiology",
  "Orthopedics",
  "Emergency Med.",
  "Radiology",
  "Oncology",
  "Cardiothoracic",
  "Pediatrics",
  "Neurology",
  "Gastroenterology",
];
const PRIORITIES = ["High", "Medium", "Low"] as const;
const TEAMS = [
  "Team Alpha",
  "Team Beta",
  "Team Gamma",
  "Team Delta",
  "Team Epsilon",
  "Team Zeta",
  "Team Eta",
];

function NewProjectModal({ onClose }: { onClose: () => void }) {
  const [done, setDone] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [form, setForm] = useState({
    name: "",
    client: "",
    type: "Inpatient",
    specialty: "Multi-Specialty",
    pm: TEAM_MEMBERS.pms[0],
    team: TEAMS[0],
    startDate: "",
    endDate: "",
    priority: "High" as "High" | "Medium" | "Low",
    coders: "",
    auditors: "",
    notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  type AssignRole = "coders" | "auditL1" | "auditL2" | "auditL3";
  const [assigns, setAssigns] = useState<Record<AssignRole, string[]>>({
    coders: [],
    auditL1: [],
    auditL2: [],
    auditL3: [],
  });
  const toggleAssign = (role: AssignRole, name: string) =>
    setAssigns((a) => ({
      ...a,
      [role]: a[role].includes(name)
        ? a[role].filter((n) => n !== name)
        : [...a[role], name],
    }));
  const [openRole, setOpenRole] = useState<AssignRole | null>(null);

  const step1Valid = form.name.trim() !== "" && form.client.trim() !== "";
  const step2Valid = form.startDate !== "" && form.endDate !== "";

  const handleCreate = () => {
    if (!step2Valid) return;
    setDone(true);
  };

  const priorityStyle: Record<string, string> = {
    High: "border-red-400 bg-red-50 text-red-700",
    Medium: "border-amber-400 bg-amber-50 text-amber-700",
    Low: "border-slate-300 bg-slate-50 text-slate-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {!done ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center flex-shrink-0">
                <FolderKanban className="w-4 h-4 text-sky-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">
                  New Coding Project
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Step {step} of 2 —{" "}
                  {step === 1 ? "Project Details" : "Team & Timeline"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-0 border-b border-border">
              {([1, 2] as const).map((s) => (
                <div
                  key={s}
                  className={`flex-1 h-1 transition-colors ${step >= s ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>

            {/* Step 1 — Project Details */}
            {step === 1 && (
              <div className="px-5 py-4 space-y-3.5">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    autoFocus
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Apollo Inpatient Coding FY26"
                    className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    Client / Hospital <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={form.client}
                      onChange={(e) => set("client", e.target.value)}
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 pr-8 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
                    >
                      <option value="">— Select Client / Hospital —</option>
                      <option>Apollo Hospitals – Delhi</option>
                      <option>Fortis Healthcare – Gurugram</option>
                      <option>Manipal Hospitals – Bangalore</option>
                      <option>Max Healthcare – Saket</option>
                      <option>Medanta – The Medicity</option>
                      <option>Narayana Health – Bangalore</option>
                      <option>Aster DM Health – Kerala</option>
                      <option>Rainbow Children's Hospital</option>
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                      Project Type
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) => set("type", e.target.value)}
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {PROJECT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                      Specialty
                    </label>
                    <select
                      value={form.specialty}
                      onChange={(e) => set("specialty", e.target.value)}
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {SPECIALTIES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    Priority
                  </label>
                  <div className="flex gap-2">
                    {PRIORITIES.map((p) => (
                      <button
                        key={p}
                        onClick={() => set("priority", p)}
                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg border transition-colors ${form.priority === p ? priorityStyle[p] : "border-border text-muted-foreground hover:bg-muted"}`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    Notes{" "}
                    <span className="text-muted-foreground/50 normal-case font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    rows={2}
                    placeholder="Scope notes, special instructions…"
                    className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={onClose}
                    className="flex-1 py-2 text-xs font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!step1Valid}
                    className="flex-1 py-2 text-xs font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                  >
                    Next — Team & Timeline{" "}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Team & Timeline */}
            {step === 2 && (
              <div className="px-5 py-4 space-y-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      autoFocus
                      type="date"
                      value={form.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => set("endDate", e.target.value)}
                      className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block mb-1.5">
                    Project Manager
                  </label>
                  <select
                    value={form.pm}
                    onChange={(e) => set("pm", e.target.value)}
                    className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {TEAM_MEMBERS.pms.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Assign Team */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                    Assign Team Members
                  </label>
                  {(
                    [
                      {
                        role: "coders" as const,
                        label: "Coder",
                        members: TEAM_MEMBERS.coders,
                        accent: "bg-sky-50 text-sky-700 border-sky-200",
                      },
                      {
                        role: "auditL1" as const,
                        label: "Audit L1",
                        members: AUDIT_MEMBERS.L1,
                        accent:
                          "bg-violet-50 text-violet-700 border-violet-200",
                      },
                      {
                        role: "auditL2" as const,
                        label: "Audit L2",
                        members: AUDIT_MEMBERS.L2,
                        accent: "bg-teal-50 text-teal-700 border-teal-200",
                      },
                      {
                        role: "auditL3" as const,
                        label: "Audit L3",
                        members: AUDIT_MEMBERS.L3,
                        accent: "bg-amber-50 text-amber-700 border-amber-200",
                      },
                    ] as {
                      role: "coders" | "auditL1" | "auditL2" | "auditL3";
                      label: string;
                      members: string[];
                      accent: string;
                    }[]
                  ).map(({ role, label, members, accent }) => (
                    <div
                      key={role}
                      className="border border-border rounded-lg overflow-hidden"
                    >
                      {/* Role header / toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenRole(openRole === role ? null : role)
                        }
                        className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/60 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-foreground">
                            {label}
                          </span>
                          {assigns[role].length > 0 && (
                            <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold leading-none">
                              {assigns[role].length}
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-150 ${openRole === role ? "rotate-180" : ""}`}
                        />
                      </button>
                      {/* Checkbox list */}
                      {openRole === role && (
                        <div className="px-3 py-2 space-y-1.5 max-h-32 overflow-y-auto border-t border-border bg-background">
                          {members.map((m) => (
                            <label
                              key={m}
                              className="flex items-center gap-2 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={assigns[role].includes(m)}
                                onChange={() => toggleAssign(role, m)}
                                className="w-3.5 h-3.5 accent-primary rounded"
                              />
                              <span className="text-[11px] text-foreground group-hover:text-primary transition-colors">
                                {m}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                      {/* Selected chips */}
                      {assigns[role].length > 0 && (
                        <div className="px-3 py-2 flex flex-wrap gap-1 border-t border-border bg-background">
                          {assigns[role].map((m) => (
                            <span
                              key={m}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${accent}`}
                            >
                              {m}
                              <button
                                type="button"
                                onClick={() => toggleAssign(role, m)}
                                className="hover:opacity-60 transition-opacity ml-0.5"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Summary preview */}

                <div className="flex gap-2 pt-0.5">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-2 text-xs font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!step2Valid}
                    className="flex-1 py-2 text-xs font-bold rounded-xl text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Project
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-14 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="text-sm font-bold text-foreground">
              Project Created!
            </p>
            <p className="text-[11px] text-muted-foreground text-center px-8">
              <span className="font-semibold text-foreground">{form.name}</span>{" "}
              has been added as a Draft project and is ready for team
              assignment.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-5 py-2 text-xs font-bold rounded-xl border border-border text-muted-foreground hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── PROJECT LIST VIEW ──────────────���────────────────────────── */
function ProjectList({ onSelect }: { onSelect: (p: Project) => void }) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [filterSpec, setFilterSpec] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const types = ["All", "Inpatient", "Outpatient", "HCC", "ED Visit"];
  const specs = [
    "All",
    "Multi-Specialty",
    "Cardiology",
    "Orthopedics",
    "Emergency Med.",
    "Radiology",
    "Oncology",
    "Cardiothoracic",
    "Pediatrics",
  ];
  const statuses = [
    "All",
    "Active",
    "At Risk",
    "Completed",
    "On Hold",
    "Draft",
  ];

  const filtered = PROJECTS.filter((p) => {
    const q = search.toLowerCase();
    return (
      (p.name.toLowerCase().includes(q) ||
        p.client.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q)) &&
      (filterType === "All" || p.type === filterType) &&
      (filterSpec === "All" || p.specialty === filterSpec) &&
      (filterStatus === "All" || p.status === filterStatus)
    );
  });

  const stats = [
    {
      label: "Total Projects",
      value: PROJECTS.length,
      color: C.primary,
      bg: "bg-sky-50",
    },
    {
      label: "Active",
      value: PROJECTS.filter((p) => p.status === "Active").length,
      color: C.emerald,
      bg: "bg-emerald-50",
    },
    {
      label: "At Risk",
      value: PROJECTS.filter((p) => p.status === "At Risk").length,
      color: C.red,
      bg: "bg-red-50",
    },
    {
      label: "Completed",
      value: PROJECTS.filter((p) => p.status === "Completed").length,
      color: C.slate,
      bg: "bg-slate-50",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Projects</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage coding projects, clients, and team assignments
          </p>
        </div>
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <Card
            key={s.label}
            className={`p-4 border ${s.bg} border-transparent`}
          >
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {s.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, clients, IDs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-lg bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] text-muted-foreground font-semibold">
              Filter by:
            </span>
          </div>

          {(
            [
              {
                label: "Type",
                value: filterType,
                set: setFilterType,
                opts: types,
              },
              {
                label: "Specialty",
                value: filterSpec,
                set: setFilterSpec,
                opts: specs,
              },
              {
                label: "Status",
                value: filterStatus,
                set: setFilterStatus,
                opts: statuses,
              },
            ] as const
          ).map((f) => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                {f.label}:
              </span>
              <select
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className="text-xs border border-border rounded-lg px-2 py-1.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {f.opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}

          <span className="text-[11px] text-muted-foreground ml-auto">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} shown
          </span>
        </div>
      </Card>

      {/* Project Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {[
                  "Project",
                  "Client",
                  "Type",
                  "Specialty",
                  "Team",
                  "SLA",
                  "Progress",
                  "Charts",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const completionPct =
                  p.totalCharts > 0
                    ? Math.round((p.completedCharts / p.totalCharts) * 100)
                    : 0;
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {p.id}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground">{p.client}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 bg-secondary text-secondary-foreground rounded">
                        {p.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {p.specialty}
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground font-semibold">
                        {p.team}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {p.pm}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <SlaRing pct={p.slaCompliance} />
                    </td>
                    <td className="py-3 px-4 w-32">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <ProgressBar
                            pct={completionPct}
                            color={
                              completionPct >= 90
                                ? C.emerald
                                : completionPct >= 60
                                  ? C.primary
                                  : C.amber
                            }
                          />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground w-8">
                          {completionPct}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-foreground font-bold">
                        {p.totalCharts.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {p.pendingCharts} pending
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelect(p);
                        }}
                        className="p-1.5 rounded-lg border border-transparent hover:border-border hover:bg-muted transition-colors"
                      >
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showNewProjectModal && (
        <NewProjectModal onClose={() => setShowNewProjectModal(false)} />
      )}
    </div>
  );
}

/* ─── ROOT EXPORT ─────────────────────────────────────────────── */
export function Projects() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return selectedProject ? (
    <ProjectDetail
      project={selectedProject}
      onBack={() => setSelectedProject(null)}
    />
  ) : (
    <ProjectList onSelect={setSelectedProject} />
  );
}
