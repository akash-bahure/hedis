import { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  RefreshCw,
  PauseCircle,
  Cpu,
  Flag,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  X,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Minus,
  RotateCcw,
  Send,
  FileText,
  Edit3,
  ArrowRight,
  Check,
  Calendar,
  FolderKanban,
  Users,
  Shield,
  Zap,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BadgeAlert,
  ClipboardList,
  Building2,
  Hash,
  Sparkles,
  Copy,
  CornerDownRight,
  MessageSquare,
  UserCheck,
  CircleAlert,
  Info,
} from "lucide-react";

/* ════════════════════════════════════════════
   TYPES
════════════════════════════════════════════ */
type ExcType =
  | "parked"
  | "sla-risk"
  | "sla-breached"
  | "rework"
  | "coding-delayed"
  | "ai-failed";
type Priority = "Critical" | "High" | "Medium" | "Low";
type SortKey =
  | "chartId"
  | "patientName"
  | "excType"
  | "assignedCoder"
  | "reworkCount"
  | "slaHrsLeft"
  | "priority"
  | "raisedDate";
type ActionType =
  | "reassign"
  | "escalate"
  | "override"
  | "request-doc"
  | "send-back"
  | null;

interface ExcRow {
  id: string;
  chartId: string;
  patientName: string;
  mrn: string;
  excType: ExcType;
  assignedCoder: string;
  coderInitials: string;
  project: string;
  facility: string;
  drg: string;
  drgWeight: number;
  reworkCount: number;
  slaHrsLeft: number;
  priority: Priority;
  raisedDate: string;
  raisedDaysAgo: number;
  notes: string;
}

/* ════════════════════════════════════════════
   CONFIG
════════════════════════════════════════════ */
const EXC_CFG: Record<
  ExcType,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    dot: string;
    icon: React.ElementType;
    desc: string;
  }
> = {
  parked: {
    label: "Parked",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-300",
    dot: "bg-slate-500",
    icon: PauseCircle,
    desc: "Chart manually parked by coder",
  },
  "sla-risk": {
    label: "SLA At Risk",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
    dot: "bg-amber-500",
    icon: Clock,
    desc: "SLA deadline within 6 hours",
  },
  "sla-breached": {
    label: "SLA Breached",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    dot: "bg-red-500",
    icon: AlertCircle,
    desc: "SLA deadline has passed",
  },
  rework: {
    label: "Rework",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-300",
    dot: "bg-orange-500",
    icon: RotateCcw,
    desc: "Chart returned for recoding",
  },
  "coding-delayed": {
    label: "Coding Delayed",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
    dot: "bg-yellow-500",
    icon: Flag,
    desc: "Coding not started within threshold",
  },
  "ai-failed": {
    label: "AI Failed",
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-300",
    dot: "bg-violet-500",
    icon: Cpu,
    desc: "AI model processing error",
  },
};

const PRI_CFG: Record<
  Priority,
  { bg: string; text: string; border: string; order: number }
> = {
  Critical: {
    bg: "bg-red-100",
    text: "text-red-700",
    border: "border-red-300",
    order: 0,
  },
  High: {
    bg: "bg-orange-100",
    text: "text-orange-700",
    border: "border-orange-300",
    order: 1,
  },
  Medium: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    border: "border-amber-200",
    order: 2,
  },
  Low: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    order: 3,
  },
};

const CODERS = [
  "All Coders",
  "Ankit Sharma",
  "Priti Gupta",
  "Rahul Verma",
  "Sunita Patel",
  "Kavita Rao",
  "Mohammed Irfan",
  "Deepa Nair",
];
const PROJECTS = [
  "All Projects",
  "Apollo Inpatient FY26",
  "Max Healthcare Q1",
  "Fortis Cardiology FY26",
  "AIIMS Oncology FY26",
  "Manipal General FY26",
];

/* ════════════════════════════════════════════
   MOCK DATA — 20 ROWS
════════════════════════════════════════════ */
const RAW_DATA: ExcRow[] = [
  {
    id: "E001",
    chartId: "CHT-78421",
    patientName: "Verma, Rakesh K.",
    mrn: "MBR-2025-00891",
    excType: "sla-breached",
    assignedCoder: "Ankit Sharma",
    coderInitials: "AS",
    project: "Apollo Inpatient FY26",
    facility: "Apollo Hospital, New Delhi",
    drg: "871",
    drgWeight: 1.82,
    reworkCount: 0,
    slaHrsLeft: -8.5,
    priority: "Critical",
    raisedDate: "18 Feb 2026",
    raisedDaysAgo: 2,
    notes:
      "Coder reported missing operative documentation from facility. Pending re-upload request.",
  },
  {
    id: "E002",
    chartId: "CHT-78503",
    patientName: "Kapoor, Meera S.",
    mrn: "MBR-2026-00023",
    excType: "sla-risk",
    assignedCoder: "Priti Gupta",
    coderInitials: "PG",
    project: "Max Healthcare Q1",
    facility: "Max Super Speciality, Gurugram",
    drg: "638",
    drgWeight: 0.97,
    reworkCount: 1,
    slaHrsLeft: 2.2,
    priority: "High",
    raisedDate: "19 Feb 2026",
    raisedDaysAgo: 1,
    notes:
      "Pending physician query response for T2DM specificity. Query sent 18 Feb.",
  },
  {
    id: "E003",
    chartId: "CHT-77998",
    patientName: "Sharma, Aarav D.",
    mrn: "MBR-2026-00041",
    excType: "rework",
    assignedCoder: "Rahul Verma",
    coderInitials: "RV",
    project: "Apollo Inpatient FY26",
    facility: "Apollo Hospital, New Delhi",
    drg: "193",
    drgWeight: 2.1,
    reworkCount: 3,
    slaHrsLeft: 11.0,
    priority: "High",
    raisedDate: "17 Feb 2026",
    raisedDaysAgo: 3,
    notes:
      "3rd rework cycle. Auditor flagged missing POA and incorrect PDX sequencing each time.",
  },
  {
    id: "E004",
    chartId: "CHT-78612",
    patientName: "Nair, Lakshmi R.",
    mrn: "MBR-2026-00087",
    excType: "ai-failed",
    assignedCoder: "Sunita Patel",
    coderInitials: "SP",
    project: "Fortis Cardiology FY26",
    facility: "Fortis Escorts Heart Institute",
    drg: "246",
    drgWeight: 3.44,
    reworkCount: 0,
    slaHrsLeft: 18.5,
    priority: "Medium",
    raisedDate: "20 Feb 2026",
    raisedDaysAgo: 0,
    notes:
      "AI pipeline error: NLP model timeout after 300s on OCR batch D3. Retrying.",
  },
  {
    id: "E005",
    chartId: "CHT-78099",
    patientName: "Iyer, Krishnan T.",
    mrn: "MBR-2026-00104",
    excType: "parked",
    assignedCoder: "Ankit Sharma",
    coderInitials: "AS",
    project: "Apollo Inpatient FY26",
    facility: "Apollo Hospital, New Delhi",
    drg: "311",
    drgWeight: 1.38,
    reworkCount: 0,
    slaHrsLeft: 5.7,
    priority: "High",
    raisedDate: "19 Feb 2026",
    raisedDaysAgo: 1,
    notes:
      "Coder parked chart: awaiting nephrology consult note not yet uploaded by facility.",
  },
  {
    id: "E006",
    chartId: "CHT-78320",
    patientName: "Bose, Subhash P.",
    mrn: "MBR-2026-00119",
    excType: "coding-delayed",
    assignedCoder: "Mohammed Irfan",
    coderInitials: "MI",
    project: "AIIMS Oncology FY26",
    facility: "AIIMS, New Delhi",
    drg: "582",
    drgWeight: 1.75,
    reworkCount: 0,
    slaHrsLeft: 14.0,
    priority: "Medium",
    raisedDate: "18 Feb 2026",
    raisedDaysAgo: 2,
    notes:
      "Chart not opened in 48 hours after assignment. Coder on leave — no handover done.",
  },
  {
    id: "E007",
    chartId: "CHT-78517",
    patientName: "Menon, Geetha V.",
    mrn: "MBR-2026-00133",
    excType: "sla-breached",
    assignedCoder: "Kavita Rao",
    coderInitials: "KR",
    project: "Manipal General FY26",
    facility: "Manipal Hospital, Bengaluru",
    drg: "470",
    drgWeight: 2.05,
    reworkCount: 2,
    slaHrsLeft: -3.1,
    priority: "Critical",
    raisedDate: "19 Feb 2026",
    raisedDaysAgo: 1,
    notes:
      "SLA breached while awaiting manager approval for exception override. Needs immediate escalation.",
  },
  {
    id: "E008",
    chartId: "CHT-77843",
    patientName: "Gupta, Arvind B.",
    mrn: "MBR-2025-00978",
    excType: "rework",
    assignedCoder: "Deepa Nair",
    coderInitials: "DN",
    project: "Max Healthcare Q1",
    facility: "Max Super Speciality, Gurugram",
    drg: "291",
    drgWeight: 0.89,
    reworkCount: 2,
    slaHrsLeft: 22.5,
    priority: "Medium",
    raisedDate: "16 Feb 2026",
    raisedDaysAgo: 4,
    notes:
      "Auditor QA return: modifier -26 incorrectly applied on facility claim for CPT 93306.",
  },
  {
    id: "E009",
    chartId: "CHT-78411",
    patientName: "Pillai, Sreedevi N.",
    mrn: "MBR-2026-00202",
    excType: "sla-risk",
    assignedCoder: "Rahul Verma",
    coderInitials: "RV",
    project: "Fortis Cardiology FY26",
    facility: "Fortis Memorial, Gurugram",
    drg: "302",
    drgWeight: 1.12,
    reworkCount: 0,
    slaHrsLeft: 3.8,
    priority: "High",
    raisedDate: "20 Feb 2026",
    raisedDaysAgo: 0,
    notes:
      "Cardiologist procedure note uploaded late; OCR still processing. AI suggestions pending.",
  },
  {
    id: "E010",
    chartId: "CHT-78226",
    patientName: "Chatterjee, Rupa M.",
    mrn: "MBR-2026-00218",
    excType: "parked",
    assignedCoder: "Priti Gupta",
    coderInitials: "PG",
    project: "Apollo Inpatient FY26",
    facility: "Apollo Hospital, New Delhi",
    drg: "194",
    drgWeight: 1.6,
    reworkCount: 0,
    slaHrsLeft: 9.2,
    priority: "Medium",
    raisedDate: "19 Feb 2026",
    raisedDaysAgo: 1,
    notes:
      "Awaiting amended discharge summary. Facility notified — 24h response expected.",
  },
  {
    id: "E011",
    chartId: "CHT-78731",
    patientName: "Reddy, Venkata S.",
    mrn: "MBR-2026-00251",
    excType: "ai-failed",
    assignedCoder: "Sunita Patel",
    coderInitials: "SP",
    project: "AIIMS Oncology FY26",
    facility: "AIIMS, New Delhi",
    drg: "853",
    drgWeight: 2.31,
    reworkCount: 0,
    slaHrsLeft: 27.0,
    priority: "Low",
    raisedDate: "20 Feb 2026",
    raisedDaysAgo: 0,
    notes:
      "AI OCR failure: document scanned at low DPI (< 150 dpi). Re-scan requested.",
  },
  {
    id: "E012",
    chartId: "CHT-78104",
    patientName: "Singh, Manpreet K.",
    mrn: "MBR-2026-00289",
    excType: "sla-breached",
    assignedCoder: "Mohammed Irfan",
    coderInitials: "MI",
    project: "Apollo Inpatient FY26",
    facility: "Apollo Hospital, New Delhi",
    drg: "392",
    drgWeight: 0.72,
    reworkCount: 0,
    slaHrsLeft: -14.2,
    priority: "Critical",
    raisedDate: "17 Feb 2026",
    raisedDaysAgo: 3,
    notes:
      "Coder on unplanned absence. Chart stuck in queue with no substitute assigned.",
  },
  {
    id: "E013",
    chartId: "CHT-78559",
    patientName: "Agrawal, Pooja D.",
    mrn: "MBR-2026-00312",
    excType: "coding-delayed",
    assignedCoder: "Kavita Rao",
    coderInitials: "KR",
    project: "Manipal General FY26",
    facility: "Manipal Hospital, Bengaluru",
    drg: "127",
    drgWeight: 1.05,
    reworkCount: 0,
    slaHrsLeft: 6.5,
    priority: "High",
    raisedDate: "18 Feb 2026",
    raisedDaysAgo: 2,
    notes:
      "Chart idle for 72h. Coder acknowledged but cited high-complexity chart backlog.",
  },
  {
    id: "E014",
    chartId: "CHT-78642",
    patientName: "Das, Subrata R.",
    mrn: "MBR-2026-00344",
    excType: "rework",
    assignedCoder: "Ankit Sharma",
    coderInitials: "AS",
    project: "Fortis Cardiology FY26",
    facility: "Fortis Escorts Heart Institute",
    drg: "247",
    drgWeight: 3.11,
    reworkCount: 1,
    slaHrsLeft: 16.0,
    priority: "High",
    raisedDate: "19 Feb 2026",
    raisedDaysAgo: 1,
    notes:
      "Cardiac catheterization CPT codes need correction per auditor findings (L2 review).",
  },
  {
    id: "E015",
    chartId: "CHT-77902",
    patientName: "Krishnamurthy, Anand.",
    mrn: "MBR-2025-00801",
    excType: "parked",
    assignedCoder: "Deepa Nair",
    coderInitials: "DN",
    project: "Max Healthcare Q1",
    facility: "Max Super Speciality, Gurugram",
    drg: "176",
    drgWeight: 1.28,
    reworkCount: 0,
    slaHrsLeft: 4.1,
    priority: "High",
    raisedDate: "17 Feb 2026",
    raisedDaysAgo: 3,
    notes:
      "Parked: radiology report disputed by attending physician. Requires re-dictation.",
  },
  {
    id: "E016",
    chartId: "CHT-78488",
    patientName: "Joshi, Preethi A.",
    mrn: "MBR-2026-00401",
    excType: "sla-risk",
    assignedCoder: "Rahul Verma",
    coderInitials: "RV",
    project: "Apollo Inpatient FY26",
    facility: "Apollo Hospital, New Delhi",
    drg: "483",
    drgWeight: 1.95,
    reworkCount: 0,
    slaHrsLeft: 4.9,
    priority: "High",
    raisedDate: "20 Feb 2026",
    raisedDaysAgo: 0,
    notes:
      "Complex orthopaedic case — CPT bundling issues require senior coder review.",
  },
  {
    id: "E017",
    chartId: "CHT-78371",
    patientName: "Malik, Sanjay R.",
    mrn: "MBR-2026-00418",
    excType: "coding-delayed",
    assignedCoder: "Priti Gupta",
    coderInitials: "PG",
    project: "AIIMS Oncology FY26",
    facility: "AIIMS, New Delhi",
    drg: "834",
    drgWeight: 1.7,
    reworkCount: 0,
    slaHrsLeft: 31.0,
    priority: "Low",
    raisedDate: "18 Feb 2026",
    raisedDaysAgo: 2,
    notes:
      "Oncology chemotherapy chart. Awaiting pathology confirmation before coding can begin.",
  },
  {
    id: "E018",
    chartId: "CHT-78594",
    patientName: "Thomas, Reena M.",
    mrn: "MBR-2026-00467",
    excType: "ai-failed",
    assignedCoder: "Sunita Patel",
    coderInitials: "SP",
    project: "Manipal General FY26",
    facility: "Manipal Hospital, Bengaluru",
    drg: "552",
    drgWeight: 1.18,
    reworkCount: 0,
    slaHrsLeft: 20.0,
    priority: "Medium",
    raisedDate: "19 Feb 2026",
    raisedDaysAgo: 1,
    notes:
      "AI confidence < 40% on all ICD codes. GI endoscopy with multiple polypectomies — complex procedure mix.",
  },
  {
    id: "E019",
    chartId: "CHT-78209",
    patientName: "Banerjee, Souvik T.",
    mrn: "MBR-2026-00489",
    excType: "rework",
    assignedCoder: "Kavita Rao",
    coderInitials: "KR",
    project: "Apollo Inpatient FY26",
    facility: "Apollo Hospital, New Delhi",
    drg: "309",
    drgWeight: 0.94,
    reworkCount: 4,
    slaHrsLeft: 8.3,
    priority: "High",
    raisedDate: "14 Feb 2026",
    raisedDaysAgo: 6,
    notes:
      "4th rework — persistent sequencing disagreement. Recommend senior auditor override.",
  },
  {
    id: "E020",
    chartId: "CHT-78677",
    patientName: "Saxena, Nidhi P.",
    mrn: "MBR-2026-00511",
    excType: "sla-risk",
    assignedCoder: "Mohammed Irfan",
    coderInitials: "MI",
    project: "Fortis Cardiology FY26",
    facility: "Fortis Memorial, Gurugram",
    drg: "215",
    drgWeight: 1.47,
    reworkCount: 0,
    slaHrsLeft: 5.1,
    priority: "High",
    raisedDate: "20 Feb 2026",
    raisedDaysAgo: 0,
    notes:
      "ICD-10 specificity issues on neurology case. Awaiting neurology specialist input.",
  },
];

/* ════════════════════════════════════════════
   INSIGHT CARDS DATA
════════════════════════════════════════════ */
const INSIGHT_CARDS = [
  {
    label: "Total Exceptions",
    value: 20,
    change: +3,
    changePct: 17.6,
    icon: BadgeAlert,
    color: "text-foreground",
    bg: "bg-muted/30",
    border: "border-border",
    barData: [8, 11, 9, 14, 12, 16, 20],
    barColor: "bg-primary",
    sub: "across 5 projects",
  },
  {
    label: "SLA Breached",
    value: 3,
    change: +1,
    changePct: 50,
    icon: AlertCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    barData: [1, 2, 1, 3, 2, 2, 3],
    barColor: "bg-red-500",
    sub: "require immediate action",
  },
  {
    label: "SLA At Risk",
    value: 4,
    change: -2,
    changePct: 33,
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    barData: [3, 4, 6, 5, 4, 6, 4],
    barColor: "bg-amber-500",
    sub: "within 6-hour window",
  },
  {
    label: "Parked Charts",
    value: 4,
    change: +1,
    changePct: 33,
    icon: PauseCircle,
    color: "text-slate-600",
    bg: "bg-slate-50",
    border: "border-slate-200",
    barData: [2, 3, 2, 4, 3, 3, 4],
    barColor: "bg-slate-400",
    sub: "pending facility response",
  },
  {
    label: "Rework Required",
    value: 4,
    change: 0,
    changePct: 0,
    icon: RotateCcw,
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-200",
    barData: [3, 5, 4, 3, 5, 4, 4],
    barColor: "bg-orange-500",
    sub: "avg 2.5 rework cycles",
  },
  {
    label: "AI Processing Failed",
    value: 3,
    change: +2,
    changePct: 200,
    icon: Cpu,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-200",
    barData: [0, 1, 0, 2, 1, 1, 3],
    barColor: "bg-violet-500",
    sub: "OCR / model errors",
  },
];

/* ════════════════════════════════════════════
   COMPONENTS
════════════════════════════════════════════ */
function MiniSparkbar({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-0.5 h-7">
      {data.map((v, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm transition-all ${color} ${i === data.length - 1 ? "opacity-100" : "opacity-40"}`}
          style={{ height: `${(v / max) * 100}%`, minHeight: 2 }}
        />
      ))}
    </div>
  );
}

function InsightCard({ card }: { card: (typeof INSIGHT_CARDS)[0] }) {
  const Icon = card.icon;
  const up = card.change > 0;
  const TrendIcon =
    card.change > 0 ? TrendingUp : card.change < 0 ? TrendingDown : Minus;
  return (
    <div
      className={`flex flex-col gap-3 px-4 pt-4 pb-3 rounded-2xl border ${card.bg} ${card.border} relative overflow-hidden`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-9 h-9 rounded-xl bg-white/70 flex items-center justify-center shadow-sm border border-white/80 flex-shrink-0`}
        >
          <Icon className={`w-4.5 h-4.5 ${card.color}`} />
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
            card.change > 0
              ? "bg-red-100 text-red-700"
              : card.change < 0
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground"
          }`}
        >
          <TrendIcon className="w-2.5 h-2.5" />
          {card.change !== 0 ? `${Math.abs(card.changePct)}%` : "No change"}
        </div>
      </div>
      <div>
        <div className={`text-2xl font-black leading-none ${card.color}`}>
          {card.value}
        </div>
        <div className="text-[11px] font-bold text-foreground mt-0.5">
          {card.label}
        </div>
        <div className="text-[9px] text-muted-foreground mt-0.5">
          {card.sub}
        </div>
      </div>
      <MiniSparkbar data={card.barData} color={card.barColor} />
    </div>
  );
}

function ExcBadge({ type }: { type: ExcType }) {
  const cfg = EXC_CFG[type];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-bold whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {cfg.label}
    </span>
  );
}

function PriBadge({ p }: { p: Priority }) {
  const cfg = PRI_CFG[p];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      {p === "Critical" && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
      )}
      {p}
    </span>
  );
}

function SlaCell({ hrs }: { hrs: number }) {
  const breached = hrs < 0;
  const atRisk = !breached && hrs < 6;
  const pct = breached ? 0 : Math.min(100, (hrs / 72) * 100);
  const barColor = breached
    ? "bg-red-500"
    : atRisk
      ? "bg-amber-500"
      : "bg-emerald-500";
  const textColor = breached
    ? "text-red-700"
    : atRisk
      ? "text-amber-700"
      : "text-emerald-700";
  const h = Math.floor(Math.abs(hrs));
  const m = Math.round((Math.abs(hrs) - h) * 60);
  return (
    <div className="min-w-[90px]">
      <div className={`text-[11px] font-black leading-none ${textColor}`}>
        {breached ? `−${h}h ${m}m` : `${h}h ${m}m`}
      </div>
      <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden w-20">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className={`text-[9px] font-bold mt-0.5 ${textColor}`}>
        {breached ? "BREACHED" : atRisk ? "AT RISK" : "On Track"}
      </div>
    </div>
  );
}

function CoderAvatar({ name, initials }: { name: string; initials: string }) {
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-emerald-100 text-emerald-700",
    "bg-orange-100 text-orange-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const c = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black flex-shrink-0 ${c}`}
      >
        {initials}
      </div>
      <span className="text-[11px] text-foreground truncate max-w-[90px]">
        {name}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════
   ACTION MODAL
════════════════════════════════════════════ */
function ActionModal({
  action,
  row,
  onClose,
}: {
  action: ActionType;
  row: ExcRow | null;
  onClose: () => void;
}) {
  const [val, setVal] = useState("");
  const [coder, setCoder] = useState("");
  const [reason, setReason] = useState("");
  const [done, setDone] = useState(false);

  if (!action || !row) return null;

  const confirm = () => {
    setDone(true);
    setTimeout(() => {
      onClose();
      setDone(false);
    }, 1800);
  };

  const MODAL_CFG = {
    reassign: {
      title: "Reassign Chart",
      icon: UserCheck,
      color: "bg-blue-600 hover:bg-blue-700",
      desc: "Select a new coder to handle this exception.",
    },
    escalate: {
      title: "Escalate Exception",
      icon: TrendingUp,
      color: "bg-rose-600 hover:bg-rose-700",
      desc: "Escalate to a senior auditor or manager for intervention.",
    },
    override: {
      title: "Manager Override",
      icon: Shield,
      color: "bg-violet-600 hover:bg-violet-700",
      desc: "Override the exception and mark chart as acceptable. Provide full justification.",
    },
    "request-doc": {
      title: "Request Documentation",
      icon: FileText,
      color: "bg-amber-600 hover:bg-amber-700",
      desc: "Send a documentation request to the facility or care team.",
    },
    "send-back": {
      title: "Send Back to Coding",
      icon: CornerDownRight,
      color: "bg-slate-700 hover:bg-slate-800",
      desc: "Return chart to coder queue with specific instructions.",
    },
  };

  const cfg = MODAL_CFG[action];
  const Icon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {!done ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-foreground" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-foreground">
                  {cfg.title}
                </h3>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {row.chartId} · {row.patientName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded-lg hover:bg-muted flex-shrink-0"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              {/* Chart context */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { l: "Exception", v: EXC_CFG[row.excType].label },
                  { l: "Priority", v: row.priority },
                  {
                    l: "SLA Left",
                    v:
                      row.slaHrsLeft < 0
                        ? `−${Math.abs(row.slaHrsLeft).toFixed(1)}h`
                        : `${row.slaHrsLeft}h`,
                  },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="px-3 py-2 rounded-lg bg-muted/30 border border-border text-center"
                  >
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
                      {s.l}
                    </div>
                    <div className="text-xs font-black text-foreground mt-0.5">
                      {s.v}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-muted-foreground">{cfg.desc}</p>

              {/* Action-specific fields */}
              {action === "reassign" && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-foreground">
                    Assign to Coder
                  </label>
                  <select
                    value={coder}
                    onChange={(e) => setCoder(e.target.value)}
                    className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select coder…</option>
                    {CODERS.slice(1)
                      .filter((c) => c !== row.assignedCoder)
                      .map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                  </select>
                </div>
              )}

              {(action === "escalate" || action === "override") && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-foreground">
                    {action === "escalate"
                      ? "Escalation Reason"
                      : "Override Justification"}
                  </label>
                  {action === "escalate" && (
                    <select className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2">
                      <option>Select escalation level…</option>
                      <option>L1 → L2 Audit</option>
                      <option>L2 → L3 Expert Review</option>
                      <option>Medical Director Review</option>
                      <option>Client Escalation</option>
                    </select>
                  )}
                </div>
              )}

              {action === "request-doc" && (
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-foreground">
                    Document Type Requested
                  </label>
                  <select className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                    <option>Operative / Procedure Note</option>
                    <option>Discharge Summary (Amended)</option>
                    <option>Physician Query Response</option>
                    <option>Lab / Pathology Report</option>
                    <option>Radiology Report</option>
                    <option>Consult Note</option>
                    <option>Other</option>
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-foreground">
                  {action === "send-back"
                    ? "Rework Instructions for Coder"
                    : action === "request-doc"
                      ? "Message to Facility"
                      : "Notes / Reason"}
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder={
                    action === "send-back"
                      ? "Describe specific corrections required…"
                      : action === "request-doc"
                        ? "Describe which documents are needed and why…"
                        : action === "override"
                          ? "Provide full clinical justification for override…"
                          : action === "escalate"
                            ? "Describe the issue requiring senior review…"
                            : "Reason for reassignment…"
                  }
                  className="w-full text-xs border border-border rounded-xl px-3 py-2.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl text-white transition-colors ${cfg.color}`}
                >
                  Confirm — {cfg.title}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="py-14 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <p className="text-sm font-bold text-foreground">
              {cfg.title} — Submitted
            </p>
            <p className="text-[11px] text-muted-foreground">
              Action recorded and notifications sent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   ROW DROPDOWN MENU
════════════════════════════════════════════ */
function RowMenu({
  row,
  onAction,
}: {
  row: ExcRow;
  onAction: (a: ActionType, r: ExcRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const actions: {
    id: ActionType;
    label: string;
    icon: React.ElementType;
    cls: string;
  }[] = [
    {
      id: "reassign",
      label: "Reassign Chart",
      icon: UserCheck,
      cls: "text-blue-600 hover:bg-blue-50",
    },
    {
      id: "escalate",
      label: "Escalate",
      icon: TrendingUp,
      cls: "text-rose-600 hover:bg-rose-50",
    },
    {
      id: "override",
      label: "Manager Override",
      icon: Shield,
      cls: "text-violet-600 hover:bg-violet-50",
    },
    {
      id: "request-doc",
      label: "Request Documentation",
      icon: FileText,
      cls: "text-amber-700 hover:bg-amber-50",
    },
    {
      id: "send-back",
      label: "Send Back to Coding",
      icon: CornerDownRight,
      cls: "text-slate-700 hover:bg-slate-50",
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg hover:bg-muted transition-colors group"
      >
        <MoreHorizontal className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-52 bg-card border border-border rounded-xl shadow-2xl shadow-black/10 overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">
              Manager Actions
            </p>
            <p className="text-[10px] font-semibold text-foreground">
              {row.chartId}
            </p>
          </div>
          <div className="py-1">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <button
                  key={a.id}
                  onClick={() => {
                    onAction(a.id, row);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[11px] font-semibold transition-colors ${a.cls}`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {a.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════
   BULK ACTION BAR
════════════════════════════════════════════ */
function BulkBar({
  count,
  onAction,
  onClear,
}: {
  count: number;
  onAction: (a: ActionType) => void;
  onClear: () => void;
}) {
  if (count === 0) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-5 py-3 bg-foreground rounded-2xl shadow-2xl text-background">
      <div className="flex items-center gap-2 pr-3 border-r border-white/20">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[11px] font-black">
          {count}
        </div>
        <span className="text-[12px] font-bold">
          chart{count > 1 ? "s" : ""} selected
        </span>
      </div>
      {(
        [
          ["reassign", "Reassign", UserCheck],
          ["escalate", "Escalate", TrendingUp],
          ["send-back", "Send Back", CornerDownRight],
        ] as [ActionType, string, React.ElementType][]
      ).map(([id, label, Icon]) => (
        <button
          key={id}
          onClick={() => onAction(id)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-white/10 hover:bg-white/20 rounded-xl transition-colors whitespace-nowrap"
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
      <button
        onClick={onClear}
        className="ml-1 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════ */
export function Exceptions() {
  /* Filter state */
  const [search, setSearch] = useState("");
  const [projFilter, setProjFilter] = useState("All Projects");
  const [typeFilter, setTypeFilter] = useState<ExcType | "all">("all");
  const [coderFilter, setCoderFilter] = useState("All Coders");
  const [slaFilter, setSlaFilter] = useState<
    "all" | "breached" | "risk" | "on-track"
  >("all");
  const [priFilter, setPriFilter] = useState<Priority | "all">("all");
  const [showFilters, setShowFilters] = useState(true);

  /* Sort */
  const [sortKey, setSortKey] = useState<SortKey>("slaHrsLeft");
  const [sortAsc, setSortAsc] = useState(true);

  /* Selection */
  const [selected, setSelected] = useState<Set<string>>(new Set());

  /* Expansion */
  const [expanded, setExpanded] = useState<string | null>(null);

  /* Page */
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  /* Action modal */
  const [modalAction, setModalAction] = useState<ActionType>(null);
  const [modalRow, setModalRow] = useState<ExcRow | null>(null);

  /* Category quick-filter chips */
  const CAT_CHIPS: { id: ExcType | "all"; label: string }[] = [
    { id: "all", label: "All" },
    { id: "sla-breached", label: "SLA Breached" },
    { id: "sla-risk", label: "SLA At Risk" },
    { id: "rework", label: "Rework" },
    { id: "parked", label: "Parked" },
    { id: "coding-delayed", label: "Coding Delayed" },
    { id: "ai-failed", label: "AI Failed" },
  ];

  /* Derived counts */
  const countByType = (t: ExcType) =>
    RAW_DATA.filter((r) => r.excType === t).length;

  /* Filtered + sorted data */
  const filtered = RAW_DATA.filter((r) => {
    const q = search.toLowerCase();
    if (
      q &&
      !r.chartId.toLowerCase().includes(q) &&
      !r.patientName.toLowerCase().includes(q) &&
      !r.mrn.toLowerCase().includes(q) &&
      !r.assignedCoder.toLowerCase().includes(q)
    )
      return false;
    if (projFilter !== "All Projects" && r.project !== projFilter) return false;
    if (typeFilter !== "all" && r.excType !== typeFilter) return false;
    if (coderFilter !== "All Coders" && r.assignedCoder !== coderFilter)
      return false;
    if (slaFilter !== "all") {
      if (slaFilter === "breached" && r.slaHrsLeft >= 0) return false;
      if (slaFilter === "risk" && (r.slaHrsLeft < 0 || r.slaHrsLeft >= 6))
        return false;
      if (slaFilter === "on-track" && r.slaHrsLeft < 6) return false;
    }
    if (priFilter !== "all" && r.priority !== priFilter) return false;
    return true;
  }).sort((a, b) => {
    let va: string | number = 0;
    let vb: string | number = 0;
    if (sortKey === "chartId") {
      va = a.chartId;
      vb = b.chartId;
    }
    if (sortKey === "patientName") {
      va = a.patientName;
      vb = b.patientName;
    }
    if (sortKey === "excType") {
      va = a.excType;
      vb = b.excType;
    }
    if (sortKey === "assignedCoder") {
      va = a.assignedCoder;
      vb = b.assignedCoder;
    }
    if (sortKey === "reworkCount") {
      va = a.reworkCount;
      vb = b.reworkCount;
    }
    if (sortKey === "slaHrsLeft") {
      va = a.slaHrsLeft;
      vb = b.slaHrsLeft;
    }
    if (sortKey === "priority") {
      va = PRI_CFG[a.priority].order;
      vb = PRI_CFG[b.priority].order;
    }
    if (sortKey === "raisedDate") {
      va = a.raisedDaysAgo;
      vb = b.raisedDaysAgo;
    }
    return sortAsc
      ? va < vb
        ? -1
        : va > vb
          ? 1
          : 0
      : va > vb
        ? -1
        : va < vb
          ? 1
          : 0;
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (k: SortKey) => {
    if (sortKey === k) setSortAsc((v) => !v);
    else {
      setSortKey(k);
      setSortAsc(true);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };
  const toggleAll = () => {
    if (selected.size === pageRows.length) setSelected(new Set());
    else setSelected(new Set(pageRows.map((r) => r.id)));
  };

  const openAction = (action: ActionType, row: ExcRow) => {
    setModalAction(action);
    setModalRow(row);
  };
  const openBulkAction = (action: ActionType) => {
    setModalAction(action);
    setModalRow(pageRows.find((r) => selected.has(r.id)) ?? null);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k)
      return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortAsc ? (
      <ArrowUp className="w-3 h-3 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 text-primary" />
    );
  };

  const hasFilters =
    search ||
    projFilter !== "All Projects" ||
    typeFilter !== "all" ||
    coderFilter !== "All Coders" ||
    slaFilter !== "all" ||
    priFilter !== "all";

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Exception Management
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Monitor, triage and resolve coding exceptions across all active
            projects
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Last refreshed:{" "}
            <strong className="text-foreground">20 Feb 2026, 10:45 IST</strong>
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap">
          <Copy className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* ══════════════════════════════════════
          INSIGHT CARDS
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {INSIGHT_CARDS.map((c) => (
          <InsightCard key={c.label} card={c} />
        ))}
      </div>

      {/* ══════════════════════════════════════
          FILTER PANEL
      ══════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div
          className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-muted/10 cursor-pointer"
          onClick={() => setShowFilters((v) => !v)}
        >
          <Filter className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Filters & Search
          </span>
          {hasFilters && (
            <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-primary text-white">
              Active
            </span>
          )}
          <div className="flex-1" />
          <span className="text-[10px] text-muted-foreground">
            {filtered.length} of {RAW_DATA.length} exceptions
          </span>
          {showFilters ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        {showFilters && (
          <div className="px-4 py-4 space-y-3">
            {/* Row 1: search + dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  placeholder="Search chart ID, patient, coder…"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-border rounded-lg bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Project */}
              <select
                value={projFilter}
                onChange={(e) => {
                  setProjFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {PROJECTS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>

              {/* Assigned Coder */}
              <select
                value={coderFilter}
                onChange={(e) => {
                  setCoderFilter(e.target.value);
                  setPage(1);
                }}
                className="text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {CODERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              {/* SLA Status */}
              <select
                value={slaFilter}
                onChange={(e) => {
                  setSlaFilter(e.target.value as typeof slaFilter);
                  setPage(1);
                }}
                className="text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All SLA Status</option>
                <option value="breached">Breached</option>
                <option value="risk">At Risk (&lt;6h)</option>
                <option value="on-track">On Track</option>
              </select>

              {/* Priority */}
              <select
                value={priFilter}
                onChange={(e) => {
                  setPriFilter(e.target.value as typeof priFilter);
                  setPage(1);
                }}
                className="text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="all">All Priorities</option>
                {(["Critical", "High", "Medium", "Low"] as Priority[]).map(
                  (p) => (
                    <option key={p}>{p}</option>
                  ),
                )}
              </select>
            </div>

            {/* Row 2: Category chips + clear */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex-shrink-0">
                Category:
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {CAT_CHIPS.map((chip) => {
                  const count =
                    chip.id === "all"
                      ? RAW_DATA.length
                      : countByType(chip.id as ExcType);
                  const active = typeFilter === chip.id;
                  const excCfg =
                    chip.id !== "all" ? EXC_CFG[chip.id as ExcType] : null;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => {
                        setTypeFilter(chip.id as typeof typeFilter);
                        setPage(1);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-colors whitespace-nowrap ${
                        active
                          ? excCfg
                            ? `${excCfg.bg} ${excCfg.text} ${excCfg.border} shadow-sm`
                            : "bg-primary text-white border-primary"
                          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
                      }`}
                    >
                      {excCfg &&
                        active &&
                        (() => {
                          const I = excCfg.icon;
                          return <I className="w-3 h-3" />;
                        })()}
                      {chip.label}
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${active ? "bg-white/30" : "bg-muted"}`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {hasFilters && (
                <button
                  onClick={() => {
                    setSearch("");
                    setProjFilter("All Projects");
                    setTypeFilter("all");
                    setCoderFilter("All Coders");
                    setSlaFilter("all");
                    setPriFilter("all");
                    setPage(1);
                  }}
                  className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════
          EXCEPTIONS TABLE
      ══════════════════════════════════════ */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        {/* Table header bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted/10">
          <ClipboardList className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold text-foreground">
            Exception Queue
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {filtered.length}
          </span>
          {selected.size > 0 && (
            <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">
              {selected.size} selected
            </span>
          )}
          <div className="flex-1" />
          {selected.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground font-semibold">
                Bulk actions:
              </span>
              {(
                [
                  [
                    "reassign",
                    "Reassign",
                    UserCheck,
                    "text-blue-600 border-blue-200 hover:bg-blue-50",
                  ],
                  [
                    "escalate",
                    "Escalate",
                    TrendingUp,
                    "text-rose-600 border-rose-200 hover:bg-rose-50",
                  ],
                  [
                    "send-back",
                    "Send Back",
                    CornerDownRight,
                    "text-slate-700 border-slate-200 hover:bg-slate-50",
                  ],
                ] as [ActionType, string, React.ElementType, string][]
              ).map(([id, label, Icon, cls]) => (
                <button
                  key={id}
                  onClick={() => openBulkAction(id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-colors whitespace-nowrap ${cls}`}
                >
                  <Icon className="w-3 h-3" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                <th className="px-4 py-2.5 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selected.size === pageRows.length && pageRows.length > 0
                    }
                    onChange={toggleAll}
                    className="w-3.5 h-3.5 accent-primary cursor-pointer"
                  />
                </th>
                {(
                  [
                    ["chartId", "Chart ID", "w-28"],
                    ["patientName", "Patient", "w-44"],
                    ["excType", "Exception Type", "w-36"],
                    ["assignedCoder", "Assigned Coder", "w-36"],
                    ["reworkCount", "Reworks", "w-20"],
                    ["slaHrsLeft", "SLA Remaining", "w-28"],
                    ["priority", "Priority", "w-24"],
                    ["raisedDate", "Raised", "w-28"],
                  ] as [SortKey, string, string][]
                ).map(([k, l, w]) => (
                  <th key={k} className={`${w} px-3 py-2.5 text-left`}>
                    <button
                      onClick={() => handleSort(k)}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide hover:text-foreground transition-colors whitespace-nowrap"
                    >
                      {l}
                      <SortIcon k={k} />
                    </button>
                  </th>
                ))}
                <th className="px-3 py-2.5 w-14 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center">
                  Actions
                </th>
              </tr>
            </thead>

            {pageRows.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={9} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                      <p className="text-sm font-bold text-muted-foreground">
                        No exceptions match your filters
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Try adjusting the search or category filters above.
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            ) : (
              pageRows.map((row) => {
                const isSelected = selected.has(row.id);
                const isExpanded = expanded === row.id;
                const excCfg = EXC_CFG[row.excType];

                return (
                  <tbody key={row.id}>
                    <tr
                      className={`group transition-colors cursor-pointer border-b border-border ${
                        isSelected
                          ? "bg-primary/5"
                          : isExpanded
                            ? "bg-muted/30"
                            : "hover:bg-muted/10"
                      }`}
                      onClick={() => setExpanded(isExpanded ? null : row.id)}
                    >
                      {/* Checkbox */}
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(row.id)}
                          className="w-3.5 h-3.5 accent-primary cursor-pointer"
                        />
                      </td>

                      {/* Chart ID */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          <div
                            className={`w-1.5 h-8 rounded-full flex-shrink-0 ${excCfg.dot}`}
                          />
                          <div>
                            <span className="font-mono text-[11px] font-black text-primary">
                              {row.chartId}
                            </span>
                            <div className="text-[9px] text-muted-foreground font-mono">
                              {row.mrn}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Patient */}
                      <td className="px-3 py-3">
                        <div>
                          <p className="text-[11px] font-bold text-foreground leading-tight">
                            {row.patientName}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {row.facility.split(",")[0]}
                          </p>
                        </div>
                      </td>

                      {/* Exception Type */}
                      <td className="px-3 py-3">
                        <ExcBadge type={row.excType} />
                      </td>

                      {/* Assigned Coder */}
                      <td className="px-3 py-3">
                        <CoderAvatar
                          name={row.assignedCoder}
                          initials={row.coderInitials}
                        />
                      </td>

                      {/* Reworks */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1.5">
                          {row.reworkCount > 0 ? (
                            <div className="flex items-center gap-1">
                              <span
                                className={`text-[11px] font-black ${row.reworkCount >= 3 ? "text-red-600" : row.reworkCount >= 2 ? "text-orange-600" : "text-amber-600"}`}
                              >
                                {row.reworkCount}
                              </span>
                              <div className="flex gap-0.5">
                                {Array.from({
                                  length: Math.min(row.reworkCount, 5),
                                }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-3 rounded-sm ${row.reworkCount >= 3 ? "bg-red-400" : "bg-orange-400"}`}
                                  />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-muted-foreground">
                              —
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SLA */}
                      <td className="px-3 py-3">
                        <SlaCell hrs={row.slaHrsLeft} />
                      </td>

                      {/* Priority */}
                      <td className="px-3 py-3">
                        <PriBadge p={row.priority} />
                      </td>

                      {/* Raised Date */}
                      <td className="px-3 py-3">
                        <div>
                          <p className="text-[11px] text-foreground">
                            {row.raisedDate}
                          </p>
                          <p className="text-[9px] text-muted-foreground">
                            {row.raisedDaysAgo === 0
                              ? "Today"
                              : `${row.raisedDaysAgo}d ago`}
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="px-3 py-3 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <RowMenu row={row} onAction={openAction} />
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {isExpanded && (
                      <tr className="bg-muted/10">
                        <td
                          colSpan={9}
                          className="px-6 py-4 border-t border-border"
                        >
                          <div className="grid grid-cols-12 gap-4">
                            {/* Left: context */}
                            <div className="col-span-12 md:col-span-5 space-y-2">
                              <div className="flex items-center gap-2 mb-2">
                                <Info className="w-3.5 h-3.5 text-primary" />
                                <span className="text-[11px] font-bold text-foreground">
                                  Exception Context
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-[10px]">
                                {[
                                  ["Project", row.project],
                                  ["Facility", row.facility],
                                  ["DRG", `${row.drg} (Wt ${row.drgWeight})`],
                                  ["Exception", EXC_CFG[row.excType].desc],
                                ].map(([k, v]) => (
                                  <div key={k} className="space-y-0.5">
                                    <div className="font-bold text-muted-foreground uppercase tracking-wide text-[9px]">
                                      {k}
                                    </div>
                                    <div className="text-foreground leading-tight">
                                      {v}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-2 px-3 py-2.5 bg-card rounded-xl border border-border">
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
                                  Exception Notes
                                </p>
                                <p className="text-[11px] text-foreground leading-relaxed">
                                  {row.notes}
                                </p>
                              </div>
                            </div>

                            {/* Right: quick actions */}
                            <div className="col-span-12 md:col-span-7">
                              <div className="flex items-center gap-2 mb-3">
                                <Zap className="w-3.5 h-3.5 text-amber-500" />
                                <span className="text-[11px] font-bold text-foreground">
                                  Manager Intervention
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {(
                                  [
                                    [
                                      "reassign",
                                      "Reassign Chart",
                                      UserCheck,
                                      "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
                                    ],
                                    [
                                      "escalate",
                                      "Escalate",
                                      TrendingUp,
                                      "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
                                    ],
                                    [
                                      "override",
                                      "Manager Override",
                                      Shield,
                                      "border-violet-200 bg-violet-50 text-violet-700 hover:bg-violet-100",
                                    ],
                                    [
                                      "request-doc",
                                      "Request Documentation",
                                      FileText,
                                      "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
                                    ],
                                    [
                                      "send-back",
                                      "Send Back to Coding",
                                      CornerDownRight,
                                      "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100",
                                    ],
                                  ] as [
                                    ActionType,
                                    string,
                                    React.ElementType,
                                    string,
                                  ][]
                                ).map(([id, label, Icon, cls]) => (
                                  <button
                                    key={id}
                                    onClick={() => openAction(id, row)}
                                    className={`flex items-center gap-2 px-3 py-2.5 text-[11px] font-bold rounded-xl border transition-colors ${cls}`}
                                  >
                                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })
            )}
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/5">
          <p className="text-[11px] text-muted-foreground">
            Showing{" "}
            <strong className="text-foreground">
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            of <strong className="text-foreground">{filtered.length}</strong>{" "}
            exceptions
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${page === n ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted"}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Exception legend */}
      <div className="flex items-center gap-4 flex-wrap px-1">
        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wide">
          Exception Types:
        </span>
        {(
          Object.entries(EXC_CFG) as [ExcType, (typeof EXC_CFG)[ExcType]][]
        ).map(([k, v]) => {
          const Icon = v.icon;
          return (
            <div
              key={k}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
            >
              <span className={`w-2 h-2 rounded-full ${v.dot}`} />
              <Icon className="w-3 h-3" />
              <span>{v.label}</span>
            </div>
          );
        })}
      </div>

      {/* Action Modal */}
      <ActionModal
        action={modalAction}
        row={modalRow}
        onClose={() => {
          setModalAction(null);
          setModalRow(null);
        }}
      />

      {/* Bulk Bar */}
      <BulkBar
        count={selected.size}
        onAction={openBulkAction}
        onClear={() => setSelected(new Set())}
      />
    </div>
  );
}
