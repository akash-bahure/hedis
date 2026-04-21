import { useState } from "react";
import type { ElementType } from "react";
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  RotateCcw,
  Send,
  ChevronDown,
  X,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Download,
  Sparkles,
  BookOpen,
  Minus,
  Hash,
  Check,
  Layers,
  Lock,
  User,
  Calendar,
  Activity,
  Info,
  Flag,
  Stethoscope,
  UserCheck,
  Award,
  ExternalLink,
  RefreshCw,
  CheckSquare,
  ListChecks,
  Microscope,
  ClipboardCheck,
  BadgeCheck,
  Siren,
  FileBadge,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type AuditStatus = "pending" | "in-review" | "approved" | "failed" | "rework";
type Priority = "critical" | "high" | "medium" | "low";
type CheckState = "pass" | "fail" | "warn" | "na" | "pending";
type Decision = null | "approve" | "fail" | "rework";
type ViewTab = "evidence" | "comparison";
type AuditLevel = "L1" | "L2" | "L3";
type CheckGroup = "eligibility" | "documentation" | "measure-logic";

interface AuditCase {
  id: string;
  caseRef: string;
  member: string;
  memberId: string;
  measureCode: string;
  measureName: string;
  abstractor: string;
  qaReviewer: string;
  submittedAt: string;
  dueBy: string;
  hoursRemaining: number;
  priority: Priority;
  status: AuditStatus;
  auditLevel: AuditLevel;
  fieldCount: number;
  discrepancies: number;
  sampleFlag: string;
}
interface CheckItem {
  id: string;
  group: CheckGroup;
  label: string;
  description: string;
  ncqaRef: string;
  abstractorValue?: string;
  documentValue?: string;
  state: CheckState;
  discrepancy?: string;
}
interface ComparisonRow {
  field: string;
  abstractorValue: string;
  documentValue: string;
  aiValue: string;
  match: "match" | "discrepancy" | "warn" | "na";
  critical?: boolean;
}

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — QUEUE
═══════════════════════════════════════════════════════════ */
const QUEUE: AuditCase[] = [
  {
    id: "ar-089",
    caseRef: "AUD-20250715-0089",
    member: "Garcia, Maria E.",
    memberId: "MBR-445521",
    measureCode: "CBP",
    measureName: "Controlling High Blood Pressure",
    abstractor: "Torres, Maria",
    qaReviewer: "Dr. S. Chen",
    submittedAt: "Jul 15 · 2:30 PM",
    dueBy: "Jul 16",
    hoursRemaining: 3,
    priority: "critical",
    status: "in-review",
    auditLevel: "L2",
    fieldCount: 8,
    discrepancies: 2,
    sampleFlag: "RANDOM-5%",
  },
  {
    id: "ar-077",
    caseRef: "AUD-20250714-0077",
    member: "Patel, Rohan K.",
    memberId: "MBR-008121",
    measureCode: "HbA1c",
    measureName: "HbA1c Testing (CDC)",
    abstractor: "Kim, Jenny",
    qaReviewer: "Dr. J. Park",
    submittedAt: "Jul 14 · 9:10 AM",
    dueBy: "Jul 16",
    hoursRemaining: 18,
    priority: "high",
    status: "pending",
    auditLevel: "L1",
    fieldCount: 10,
    discrepancies: 0,
    sampleFlag: "TARGETED",
  },
  {
    id: "ar-063",
    caseRef: "AUD-20250714-0063",
    member: "Clark, Daniel F.",
    memberId: "MBR-009912",
    measureCode: "COL",
    measureName: "Colorectal Cancer Screening",
    abstractor: "Okonkwo, Emeka",
    qaReviewer: "Dr. S. Chen",
    submittedAt: "Jul 14 · 11:45 AM",
    dueBy: "Jul 15",
    hoursRemaining: 4,
    priority: "critical",
    status: "pending",
    auditLevel: "L2",
    fieldCount: 7,
    discrepancies: 1,
    sampleFlag: "RANDOM-5%",
  },
  {
    id: "ar-055",
    caseRef: "AUD-20250713-0055",
    member: "Lewis, Sandra K.",
    memberId: "MBR-021144",
    measureCode: "HbA1c",
    measureName: "HbA1c Testing (CDC)",
    abstractor: "Patel, Ravi",
    qaReviewer: "Dr. J. Park",
    submittedAt: "Jul 13 · 3:00 PM",
    dueBy: "Jul 16",
    hoursRemaining: 22,
    priority: "high",
    status: "pending",
    auditLevel: "L3",
    fieldCount: 10,
    discrepancies: 0,
    sampleFlag: "STRATIFIED",
  },
  {
    id: "ar-048",
    caseRef: "AUD-20250713-0048",
    member: "White, Karen L.",
    memberId: "MBR-004813",
    measureCode: "BCS",
    measureName: "Breast Cancer Screening",
    abstractor: "Torres, Maria",
    qaReviewer: "Dr. S. Chen",
    submittedAt: "Jul 13 · 10:20 AM",
    dueBy: "Jul 15",
    hoursRemaining: 6,
    priority: "high",
    status: "pending",
    auditLevel: "L2",
    fieldCount: 6,
    discrepancies: 3,
    sampleFlag: "TARGETED",
  },
  {
    id: "ar-041",
    caseRef: "AUD-20250712-0041",
    member: "Morris, Dana K.",
    memberId: "MBR-050127",
    measureCode: "BCS",
    measureName: "Breast Cancer Screening",
    abstractor: "Kim, Jenny",
    qaReviewer: "Dr. J. Park",
    submittedAt: "Jul 12 · 1:15 PM",
    dueBy: "Jul 14",
    hoursRemaining: 0,
    priority: "medium",
    status: "approved",
    auditLevel: "L1",
    fieldCount: 6,
    discrepancies: 0,
    sampleFlag: "RANDOM-5%",
  },
  {
    id: "ar-034",
    caseRef: "AUD-20250712-0034",
    member: "Ahmed, Farida S.",
    memberId: "MBR-033398",
    measureCode: "CBP",
    measureName: "Controlling High Blood Pressure",
    abstractor: "Patel, Ravi",
    qaReviewer: "Dr. S. Chen",
    submittedAt: "Jul 12 · 8:45 AM",
    dueBy: "Jul 13",
    hoursRemaining: 0,
    priority: "high",
    status: "failed",
    auditLevel: "L2",
    fieldCount: 8,
    discrepancies: 4,
    sampleFlag: "TARGETED",
  },
  {
    id: "ar-027",
    caseRef: "AUD-20250711-0027",
    member: "Verma, Sunita P.",
    memberId: "MBR-030944",
    measureCode: "COL",
    measureName: "Colorectal Cancer Screening",
    abstractor: "Okonkwo, Emeka",
    qaReviewer: "Dr. J. Park",
    submittedAt: "Jul 11 · 4:00 PM",
    dueBy: "Jul 13",
    hoursRemaining: 0,
    priority: "medium",
    status: "rework",
    auditLevel: "L1",
    fieldCount: 7,
    discrepancies: 2,
    sampleFlag: "RANDOM-5%",
  },
];

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — ACTIVE CASE DETAIL
═══════════════════════════════════════════════════════════ */
const CASE = {
  caseRef: "AUD-20250715-0089",
  member: "Garcia, Maria E.",
  memberId: "MBR-445521",
  dob: "Jun 12, 1954",
  age: 71,
  measureCode: "CBP",
  measureName: "Controlling High Blood Pressure",
  measurementYear: "MY 2025",
  productLine: "Medicare",
  auditLevel: "L2" as AuditLevel,
  abstractor: "Torres, Maria",
  qaReviewer: "Dr. Sarah Chen, RHIA",
  submittedAt: "Jul 15, 2025 · 2:30 PM",
  dueBy: "Jul 16, 2025 · 2:30 PM",
  facility: "Metro Health Primary Care, Chicago IL",
  auditor: "Dr. Priya Nair, RHIA, CCS",
  auditStarted: "Jul 15, 2025 · 4:02 PM",
  irrScore: "0.94",
  sampleFlag: "RANDOM-5%",
};

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════ */
const CHECKLIST_INIT: CheckItem[] = [
  // ELIGIBILITY
  {
    id: "el1",
    group: "eligibility",
    label: "Age Criteria (18–85 yrs)",
    description:
      "Member must be 18–85 years old as of Dec 31 of the measurement year.",
    ncqaRef: "CBP Technical Spec §2.1",
    abstractorValue: "Age 71 (DOB: Jun 12, 1954)",
    documentValue: "Confirmed via claims eligibility",
    state: "pass",
  },
  {
    id: "el2",
    group: "eligibility",
    label: "Continuous Enrollment",
    description:
      "Member must have continuous enrollment with no gaps > 45 days during MY.",
    ncqaRef: "General Eligibility §1.3",
    abstractorValue: "No enrollment gaps found",
    documentValue: "Eligibility file MY2025 — confirmed",
    state: "pass",
  },
  {
    id: "el3",
    group: "eligibility",
    label: "Product Line: Medicare",
    description: "Product line must match the measure-eligible population.",
    ncqaRef: "CBP Technical Spec §1.1",
    abstractorValue: "Medicare",
    documentValue: "Medicare Plan M-445521",
    state: "pass",
  },
  {
    id: "el4",
    group: "eligibility",
    label: "ESRD / Hospice Exclusion",
    description:
      "Members with ESRD, on dialysis, or in hospice care are excluded.",
    ncqaRef: "CBP Technical Spec §3.2",
    abstractorValue: "No exclusion codes found",
    documentValue: "No exclusion codes in claims history",
    state: "pass",
  },
  {
    id: "el5",
    group: "eligibility",
    label: "Hypertension Dx (ICD-10 I10–I16)",
    description:
      "Member must have a hypertension diagnosis on or before Dec 31 of MY.",
    ncqaRef: "CBP Technical Spec §2.3",
    abstractorValue: "ICD-10 I10 — Essential Hypertension",
    documentValue: "I10 in problem list & claims",
    state: "pass",
  },
  // DOCUMENTATION
  {
    id: "dc1",
    group: "documentation",
    label: "Source Document Uploaded",
    description:
      "The original clinical document used for abstraction must be attached.",
    ncqaRef: "HEDIS Doc Standards §2.0",
    abstractorValue: "OfficeVisit_Garcia_20250414.pdf",
    documentValue: "File present, readable, complete",
    state: "pass",
  },
  {
    id: "dc2",
    group: "documentation",
    label: "Evidence Highlighted / Annotated",
    description:
      "The specific BP reading used for numerator determination must be annotated.",
    ncqaRef: "HEDIS Doc Standards §2.3",
    abstractorValue: "Annotation ANN-445-001 on page 2",
    documentValue: "Yellow highlight on page 2 — valid",
    state: "pass",
  },
  {
    id: "dc3",
    group: "documentation",
    label: "Document Legibility",
    description:
      "All relevant data fields must be clearly legible in the source document.",
    ncqaRef: "HEDIS Doc Standards §2.1",
    abstractorValue: "Legible — typed EHR note",
    documentValue: "Typed EHR note — fully legible",
    state: "pass",
  },
  {
    id: "dc4",
    group: "documentation",
    label: "Provider Credentials & Signature",
    description:
      "Treating provider must be a licensed clinician with valid credentials.",
    ncqaRef: "CBP Technical Spec §5.0",
    abstractorValue: "Dr. Elena Reyes, MD — signed",
    documentValue: "Provider credentials confirmed — signed",
    state: "pass",
  },
  // MEASURE LOGIC
  {
    id: "ml1",
    group: "measure-logic",
    label: "BP Reading ≤140/90 mmHg (Numerator)",
    description:
      "Most recent BP reading in MY must be <140/90 mmHg to satisfy the numerator.",
    ncqaRef: "CBP Technical Spec §4.1 — Numerator",
    abstractorValue: "138/84 mmHg (abstractor entry)",
    documentValue: "142/88 mmHg (source document)",
    state: "fail",
    discrepancy:
      "Critical numerator error: abstractor entered 138/84 mmHg (MET) but source document shows 142/88 mmHg (systolic ≥ 140 — NOT MET). This transcription error flips HEDIS compliance status.",
  },
  {
    id: "ml2",
    group: "measure-logic",
    label: "Service Date Valid (Jan 1–Dec 31, 2025)",
    description: "The BP reading must occur within the measurement year.",
    ncqaRef: "CBP Technical Spec §4.2",
    abstractorValue: "Apr 14, 2025 — within MY 2025",
    documentValue: "Visit date Apr 14, 2025 — confirmed",
    state: "pass",
  },
  {
    id: "ml3",
    group: "measure-logic",
    label: "Most Recent BP Reading Used",
    description:
      "Abstractor must use the most recent BP reading in the measurement year.",
    ncqaRef: "CBP Technical Spec §4.3",
    abstractorValue: "Apr 14, 2025 — most recent",
    documentValue: "One visit in MY 2025 — confirmed",
    state: "warn",
    discrepancy:
      "Confirm no additional BP readings exist after Apr 14 in supplemental records or telehealth visits.",
  },
  {
    id: "ml4",
    group: "measure-logic",
    label: "ICD-10 Code Matches Diagnosis",
    description:
      "Hypertension ICD-10 code (I10–I16) must match the documented diagnosis.",
    ncqaRef: "CBP Technical Spec §6.1",
    abstractorValue: "I10 — Essential Hypertension",
    documentValue: "I10 in problem list and visit note",
    state: "pass",
  },
  {
    id: "ml5",
    group: "measure-logic",
    label: "Lookback Period Compliance",
    description:
      "Lookback period of 2 years prior to measurement year must be validated.",
    ncqaRef: "CBP Technical Spec §4.5",
    abstractorValue: "MY 2023–2025 lookback verified",
    documentValue: "Claims history confirmed 2023–2025",
    state: "pass",
  },
];

/* ═══════════════════════════════════════════════════════════
   MOCK DATA — FIELD COMPARISON
═══════════════════════════════════════════════════════════ */
const COMPARISON: ComparisonRow[] = [
  {
    field: "BP (Systolic)",
    abstractorValue: "138 mmHg",
    documentValue: "142 mmHg",
    aiValue: "142 mmHg",
    match: "discrepancy",
    critical: true,
  },
  {
    field: "BP (Diastolic)",
    abstractorValue: "84 mmHg",
    documentValue: "88 mmHg",
    aiValue: "88 mmHg",
    match: "discrepancy",
    critical: true,
  },
  {
    field: "Service Date",
    abstractorValue: "Apr 14, 2025",
    documentValue: "Apr 14, 2025",
    aiValue: "Apr 14, 2025",
    match: "match",
  },
  {
    field: "ICD-10 Code",
    abstractorValue: "I10",
    documentValue: "I10",
    aiValue: "I10",
    match: "match",
  },
  {
    field: "Numerator Status",
    abstractorValue: "MET (138/84)",
    documentValue: "NOT MET (142/88)",
    aiValue: "NOT MET",
    match: "discrepancy",
    critical: true,
  },
  {
    field: "Provider",
    abstractorValue: "Dr. Reyes, Elena",
    documentValue: "Dr. Elena Reyes, MD",
    aiValue: "Dr. E. Reyes",
    match: "match",
  },
  {
    field: "Visit Type",
    abstractorValue: "Office Visit",
    documentValue: "Office Visit (99214)",
    aiValue: "Office Visit",
    match: "match",
  },
  {
    field: "Cuff Position",
    abstractorValue: "N/A",
    documentValue: "Right arm, seated",
    aiValue: "N/A",
    match: "na",
  },
];

/* ═══════════════════════════════════════════════════════════
   STYLE MAPS
═══════════════════════════════════════════════════════════ */
const STATUS_MAP: Record<
  AuditStatus,
  { badge: string; dot: string; label: string }
> = {
  pending: {
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    label: "Pending",
  },
  "in-review": {
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    dot: "bg-violet-500",
    label: "In Review",
  },
  approved: {
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Approved",
  },
  failed: {
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    label: "Failed",
  },
  rework: {
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    label: "Rework",
  },
};
const PRIORITY_MAP: Record<Priority, { bar: string; label: string }> = {
  critical: { bar: "bg-red-500", label: "Critical" },
  high: { bar: "bg-orange-400", label: "High" },
  medium: { bar: "bg-amber-400", label: "Medium" },
  low: { bar: "bg-slate-300", label: "Low" },
};
const LEVEL_MAP: Record<AuditLevel, string> = {
  L1: "bg-blue-100 text-blue-700 border-blue-200",
  L2: "bg-violet-100 text-violet-700 border-violet-200",
  L3: "bg-rose-100 text-rose-700 border-rose-200",
};
const CHECK_MAP: Record<
  CheckState,
  {
    Icon: ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  pass: {
    Icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Pass",
  },
  fail: {
    Icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-300",
    label: "Fail",
  },
  warn: {
    Icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Warning",
  },
  na: {
    Icon: Minus,
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "N/A",
  },
  pending: {
    Icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/30",
    border: "border-border",
    label: "Unreviewed",
  },
};
const GROUP_MAP: Record<
  CheckGroup,
  {
    label: string;
    Icon: ElementType;
    color: string;
    bg: string;
    border: string;
  }
> = {
  eligibility: {
    label: "Eligibility",
    Icon: ShieldCheck,
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  documentation: {
    label: "Documentation",
    Icon: FileBadge,
    color: "text-cyan-700",
    bg: "bg-cyan-50",
    border: "border-cyan-200",
  },
  "measure-logic": {
    label: "Measure Logic",
    Icon: Microscope,
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
  },
};
const FAIL_REASONS = [
  "BP value transcription error",
  "Service date outside measurement year",
  "Incorrect numerator determination",
  "ICD-10 code mismatch",
  "Provider not eligible for measure",
  "Missing supporting documentation",
  "Lookback period error",
  "Enrollment gap not identified",
  "Exclusion criteria not applied",
  "Evidence not highlighted / annotated",
  "Most recent reading not used",
  "Other (specify in comments)",
];

/* ═══════════════════════════════════════════════════════════
   MICRO-COMPONENTS
═══════════════════════════════════════════════════════════ */
function SlaTimer({ hours }: { hours: number }) {
  if (hours <= 0)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Overdue
      </span>
    );
  if (hours <= 8)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
        <Clock className="w-3 h-3" />
        {hours}h
      </span>
    );
  if (hours <= 24)
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600">
        <Clock className="w-3 h-3" />
        {hours}h
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
      <Clock className="w-3 h-3" />
      {hours}h
    </span>
  );
}

function LevelBadge({ level }: { level: AuditLevel }) {
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[9px] font-bold tracking-wider ${LEVEL_MAP[level]}`}
    >
      {level}
    </span>
  );
}

function StatusBadge({ status }: { status: AuditStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${s.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

function SampleFlag({ flag }: { flag: string }) {
  const isTargeted = flag === "TARGETED";
  return (
    <span
      className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold border ${isTargeted ? "bg-rose-50 text-rose-700 border-rose-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}
    >
      <Flag className="w-2.5 h-2.5" />
      {flag}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUEUE CARD
═══════════════════════════════════════════════════════════ */
function QueueCard({
  item,
  selected,
  onClick,
  onOpenP360,
}: {
  item: AuditCase;
  selected: boolean;
  onClick: () => void;
  onOpenP360: () => void;
}) {
  const pri = PRIORITY_MAP[item.priority];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`relative w-full text-left transition-all cursor-pointer border-b border-border group
        ${
          selected
            ? "bg-violet-50/70 border-l-[3px] border-l-violet-500"
            : "border-l-[3px] border-l-transparent hover:bg-muted/20"
        }`}
    >
      {/* Priority stripe */}
      <div
        className={`absolute left-0 top-0 w-0.5 h-full ${pri.bar} opacity-0 group-hover:opacity-100 transition-opacity ${selected ? "opacity-0" : ""}`}
      />

      <div className="px-3 py-3">
        {/* Row 1: avatar + name + SLA */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors
              ${selected ? "bg-violet-100 border-violet-300" : "bg-slate-100 border-slate-200 group-hover:bg-violet-50 group-hover:border-violet-200"}`}
            >
              <span
                className={`text-[9px] font-bold ${selected ? "text-violet-700" : "text-slate-500"}`}
              >
                {item.member.split(",")[0].substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-foreground truncate leading-tight">
                {item.member}
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenP360();
                }}
                className="inline-flex items-center gap-0.5 text-[10px] font-mono text-primary hover:underline"
              >
                {item.caseRef.slice(-8)}
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <SlaTimer hours={item.hoursRemaining} />
            <LevelBadge level={item.auditLevel} />
          </div>
        </div>

        {/* Row 2: measure + status + discrepancies */}
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold border border-primary/20">
              {item.measureCode}
            </span>
            <StatusBadge status={item.status} />
          </div>
          {item.discrepancies > 0 && (
            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600">
              <AlertTriangle className="w-3 h-3" />
              {item.discrepancies}
            </span>
          )}
        </div>

        {/* Row 3: abstractor + sample flag + date */}
        <div className="flex items-center justify-between gap-2">
          <SampleFlag flag={item.sampleFlag} />
          <span className="text-[10px] text-muted-foreground truncate">
            {item.submittedAt}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   PDF PAGES
═══════════════════════════════════════════════════════════ */
function PDFPage({ page }: { page: number }) {
  if (page === 1)
    return (
      <div className="space-y-3 text-[11px] text-gray-800">
        <div className="text-center border-b border-gray-200 pb-3">
          <p className="font-bold text-[13px] text-gray-900 tracking-tight">
            METRO HEALTH PRIMARY CARE
          </p>
          <p className="text-gray-400 text-[10px]">
            4200 W. Harrison St · Chicago, IL 60624 · NPI: 9876543210
          </p>
        </div>
        <p className="text-center font-bold uppercase tracking-widest text-gray-500 text-[9px]">
          Office Visit Note — Page 1 of 3
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 border border-gray-100 rounded-lg p-3 bg-gray-50/60">
          {[
            ["Patient", "Garcia, Maria E."],
            ["MRN", "MRN-445521"],
            ["DOB", "06/12/1954"],
            ["Age", "70 years"],
            ["Sex", "Female"],
            ["Insurance", "Medicare Plan M-445521"],
            ["PCP", "Dr. Elena Reyes, MD"],
            ["Visit Type", "Office Visit — Established"],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="font-semibold text-gray-500 text-[10px]">
                {k}:{" "}
              </span>
              <span className="text-gray-800">{v}</span>
            </div>
          ))}
        </div>
        <div className="border border-gray-100 rounded-lg p-2.5 space-y-1.5">
          <div>
            <span className="font-semibold text-gray-500">Visit Date: </span>
            <span className="font-bold text-gray-900">April 14, 2025</span>
          </div>
          <div>
            <span className="font-semibold text-gray-500">ICD-10: </span>
            <span className="font-bold text-blue-700">I10</span>
            <span className="text-gray-600">
              {" "}
              — Essential (Primary) Hypertension
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-500">CPT: </span>
            <span className="font-bold text-blue-700">99214</span>
            <span className="text-gray-600"> — E&M, moderate complexity</span>
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-600 mb-1">Chief Complaint:</p>
          <p className="text-gray-700">
            Follow-up for hypertension management. Good medication adherence. No
            chest pain or dyspnea.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-600 mb-1">
            Current Medications:
          </p>
          <p className="text-gray-700">
            Lisinopril 10 mg · Amlodipine 5 mg · Hydrochlorothiazide 25 mg
          </p>
        </div>
        <p className="text-[10px] text-gray-300 text-center italic border-t border-gray-100 pt-2">
          — Continued on Page 2 —
        </p>
      </div>
    );

  if (page === 2)
    return (
      <div className="space-y-3 text-[11px] text-gray-800">
        <div className="text-center border-b border-gray-200 pb-2">
          <p className="font-bold text-gray-900 text-[12px]">
            Clinical Examination — Page 2 of 3
          </p>
          <p className="text-gray-400 text-[10px]">
            Metro Health Primary Care · MRN-445521 · Apr 14, 2025
          </p>
        </div>

        {/* ★ Key Evidence — Vital Signs */}
        <div className="border-2 border-yellow-300 rounded-lg p-3 bg-yellow-50/50 relative">
          <div className="absolute -top-2.5 left-3 bg-yellow-300 text-yellow-900 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Evidence Zone
          </div>
          <p className="font-bold text-gray-900 mb-2 text-[11px] uppercase tracking-wider">
            Vital Signs
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
            <div className="col-span-2">
              <span className="font-semibold text-gray-600">
                Blood Pressure:{" "}
              </span>
              <mark className="bg-yellow-200 px-1.5 py-0.5 rounded font-bold text-gray-900 text-[12px]">
                142/88 mmHg
              </mark>
              <span className="ml-2 text-red-600 text-[9px] font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                ⚠ Abstractor recorded: 138/84
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-600">Heart Rate: </span>
              76 bpm
            </div>
            <div>
              <span className="font-semibold text-gray-600">SpO₂: </span>97%
            </div>
            <div>
              <span className="font-semibold text-gray-600">Weight: </span>164
              lbs
            </div>
            <div>
              <span className="font-semibold text-gray-600">
                Cuff Position:{" "}
              </span>
              Right arm, seated
            </div>
          </div>
          <div className="mt-2 flex items-start gap-1.5 text-[10px] text-red-700 font-semibold bg-red-50 border border-red-200 rounded-lg p-2">
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            AUDIT FINDING: BP 142/88 mmHg ≥ 140/90 threshold — CBP numerator NOT
            MET. Abstractor error flips compliance status.
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-600 mb-1">
            Physical Examination:
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">CV:</span> Regular rate and rhythm.
            No murmurs, gallops, or rubs. No edema.
          </p>
          <p className="mt-1 text-gray-700">
            <span className="font-semibold">Resp:</span> Clear bilaterally. No
            wheezes.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-600 mb-1">Assessment & Plan:</p>
          <p className="text-gray-700">
            <span className="font-semibold">1. HTN (I10)</span> — BP suboptimal
            142/88. Increase Lisinopril to 20 mg. RTC 6 weeks.
          </p>
          <p className="mt-1 text-gray-700">
            <span className="font-semibold">2. Hyperlipidemia (E78.5)</span> —
            Stable on Atorvastatin. Continue.
          </p>
        </div>
        <div className="border-l-4 border-red-400 pl-3 bg-red-50/60 rounded-r-lg p-2.5">
          <p className="font-bold text-gray-900 text-[10px] mb-0.5">
            Auditor Annotation:
          </p>
          <p className="text-gray-700">
            BP{" "}
            <mark className="bg-yellow-200 font-bold px-0.5 rounded">
              142/88 mmHg
            </mark>{" "}
            confirmed in EHR vitals. Systolic ≥ 140 — CBP numerator NOT
            satisfied.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-3 text-[11px] text-gray-800">
      <div className="text-center border-b border-gray-200 pb-2">
        <p className="font-bold text-gray-900 text-[12px]">
          Provider Attestation — Page 3 of 3
        </p>
        <p className="text-gray-400 text-[10px]">
          Metro Health Primary Care · MRN-445521 · Apr 14, 2025
        </p>
      </div>
      <div className="border border-gray-100 rounded-lg p-2.5 space-y-1.5">
        {[
          ["Treating Physician", "Dr. Elena Reyes, MD, FHM"],
          ["Provider NPI", "9876543210"],
          ["Board Certification", "ABIM — Internal Medicine, 2012"],
          ["Note Signed", "April 14, 2025 at 11:02 AM"],
        ].map(([k, v]) => (
          <div key={k}>
            <span className="font-semibold text-gray-500">{k}: </span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      <div className="border border-gray-100 rounded-lg p-2.5">
        <p className="font-semibold text-gray-600 mb-2">Billing Summary:</p>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-1 text-gray-500 font-semibold">
                CPT
              </th>
              <th className="text-left pb-1 text-gray-500 font-semibold">
                Description
              </th>
              <th className="text-left pb-1 text-gray-500 font-semibold">DX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pt-1 font-bold text-blue-700">99214</td>
              <td className="pt-1">E&M Office Visit — Established, Moderate</td>
              <td className="pt-1 font-bold">I10</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-100 pt-2">
        <p className="text-[10px] text-gray-400">
          Electronic attestation:{" "}
          <span className="font-semibold text-gray-700">Elena Reyes, MD</span>
        </p>
        <p className="mt-1 text-[10px] text-gray-400">
          Note status:{" "}
          <span className="font-bold text-emerald-700">FINAL / SIGNED</span>
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EVIDENCE CARD
═══════════════════════════════════════════════════════════ */
function EvidenceCard({
  label,
  abstractor,
  document: doc,
  discrepancy,
  critical,
  icon: Icon,
  field,
}: {
  label: string;
  abstractor: string;
  document: string;
  discrepancy: boolean;
  critical: boolean;
  icon: ElementType;
  field?: string;
}) {
  const isCrit = critical && discrepancy;
  return (
    <div
      className={`rounded-xl border p-3 transition-all
      ${
        isCrit
          ? "border-red-300 bg-red-50/50 shadow-sm shadow-red-100"
          : discrepancy
            ? "border-amber-200 bg-amber-50/30"
            : "border-border bg-card hover:border-slate-300"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-1.5">
          <div
            className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0
            ${isCrit ? "bg-red-100" : discrepancy ? "bg-amber-100" : "bg-muted/40"}`}
          >
            <Icon
              className={`w-3 h-3 ${isCrit ? "text-red-600" : discrepancy ? "text-amber-600" : "text-muted-foreground"}`}
            />
          </div>
          <span
            className={`text-[10px] font-bold uppercase tracking-wider
            ${isCrit ? "text-red-700" : discrepancy ? "text-amber-700" : "text-muted-foreground"}`}
          >
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isCrit && (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full">
              <Siren className="w-2.5 h-2.5" />
              CRITICAL
            </span>
          )}
          {discrepancy ? (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
              <AlertTriangle className="w-2.5 h-2.5" />
              Mismatch
            </span>
          ) : (
            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
              <Check className="w-2.5 h-2.5" />
              Match
            </span>
          )}
        </div>
      </div>

      {/* Values */}
      <div className="grid grid-cols-2 gap-1.5">
        <div
          className={`rounded-lg p-2 border ${isCrit ? "bg-red-50 border-red-200" : "bg-background border-border"}`}
        >
          <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
            Abstractor
          </p>
          <p
            className={`text-[11px] font-semibold leading-tight ${isCrit ? "text-red-700 line-through decoration-red-400" : discrepancy ? "text-amber-700" : "text-foreground"}`}
          >
            {abstractor}
          </p>
        </div>
        <div
          className={`rounded-lg p-2 border ${isCrit ? "bg-white border-red-200" : "bg-background border-border"}`}
        >
          <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
            Source Document
          </p>
          <p
            className={`text-[11px] font-semibold leading-tight ${isCrit ? "text-red-800" : "text-foreground"}`}
          >
            {doc}
          </p>
        </div>
      </div>

      {isCrit && discrepancy && (
        <p className="mt-2 flex items-start gap-1 text-[10px] text-red-700 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-red-500" />
          Numerator-flipping error: compliance status would be incorrectly
          reported.
        </p>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   VALIDATION CHECK ITEM
═══════════════════════════════════════════════════════════ */
function ValidationItem({
  item,
  onCycle,
  expanded,
  onToggle,
}: {
  item: CheckItem;
  onCycle: (id: string) => void;
  expanded: boolean;
  onToggle: (id: string) => void;
}) {
  const cfg = CHECK_MAP[item.state];
  const { Icon } = cfg;
  const isFail = item.state === "fail";
  const isWarn = item.state === "warn";

  return (
    <div
      className={`rounded-lg border overflow-hidden transition-all
      ${
        isFail
          ? "border-red-300 shadow-sm shadow-red-100/50"
          : isWarn
            ? "border-amber-200"
            : item.state === "pass"
              ? "border-emerald-200"
              : "border-border"
      }`}
    >
      {/* Header row */}
      <div
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors
          ${isFail ? "bg-red-50/60" : isWarn ? "bg-amber-50/40" : item.state === "pass" ? "bg-emerald-50/30" : "bg-card hover:bg-muted/20"}`}
        onClick={() => onToggle(item.id)}
      >
        <button
          title={`${cfg.label} — click to cycle`}
          onClick={(e) => {
            e.stopPropagation();
            onCycle(item.id);
          }}
          className="flex-shrink-0 p-0.5 rounded hover:bg-white/60 transition-colors"
        >
          <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
        </button>
        <span className="flex-1 text-[11px] font-semibold text-foreground leading-tight">
          {item.label}
        </span>
        {isFail && (
          <span className="text-[9px] font-bold text-red-600 bg-red-100 border border-red-200 px-1 py-0.5 rounded flex-shrink-0">
            FAIL
          </span>
        )}
        {isWarn && (
          <span className="text-[9px] font-bold text-amber-600 bg-amber-100 border border-amber-200 px-1 py-0.5 rounded flex-shrink-0">
            WARN
          </span>
        )}
        {item.discrepancy && (
          <AlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div
          className={`px-3 py-3 border-t space-y-2.5 text-[11px]
          ${isFail ? "bg-red-50/20 border-red-100" : isWarn ? "bg-amber-50/20 border-amber-100" : "bg-muted/5 border-border"}`}
        >
          <p className="text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          {(item.abstractorValue || item.documentValue) && (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-card border border-border rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Abstractor Entry
                </p>
                <p
                  className={`font-semibold text-[11px] ${isFail ? "text-red-700" : isWarn ? "text-amber-700" : "text-foreground"}`}
                >
                  {item.abstractorValue}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Source Document
                </p>
                <p className="font-semibold text-[11px] text-foreground">
                  {item.documentValue}
                </p>
              </div>
            </div>
          )}

          {item.discrepancy && (
            <div className="flex items-start gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-2.5">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{item.discrepancy}</span>
            </div>
          )}

          <div className="flex items-center gap-1 text-[10px] text-muted-foreground pt-0.5">
            <BookOpen className="w-3 h-3 flex-shrink-0" />
            <span className="italic">{item.ncqaRef}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export function AuditReview({
  onOpenPatient360,
}: {
  onOpenPatient360: () => void;
}) {
  const [selectedId, setSelectedId] = useState("ar-089");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AuditStatus>("all");
  const [viewTab, setViewTab] = useState<ViewTab>("evidence");
  const [pdfPage, setPdfPage] = useState(2);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [checklist, setChecklist] = useState<CheckItem[]>(CHECKLIST_INIT);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["ml1", "ml3"]),
  );
  const [decision, setDecision] = useState<Decision>(null);
  const [failReason, setFailReason] = useState("");
  const [auditNote, setAuditNote] = useState("");
  const [phiVisible, setPhiVisible] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const selectedCase = QUEUE.find((q) => q.id === selectedId)!;
  const filteredQueue = QUEUE.filter((item) => {
    if (statusFilter !== "all" && item.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        item.member.toLowerCase().includes(q) ||
        item.caseRef.toLowerCase().includes(q) ||
        item.measureCode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const passCount = checklist.filter((c) => c.state === "pass").length;
  const failCount = checklist.filter((c) => c.state === "fail").length;
  const warnCount = checklist.filter((c) => c.state === "warn").length;
  const totalCount = checklist.length;
  const reviewedCount = checklist.filter((c) => c.state !== "pending").length;

  const cycleCheck = (id: string) => {
    const order: CheckState[] = ["pending", "pass", "warn", "fail", "na"];
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          state: order[(order.indexOf(item.state) + 1) % order.length],
        };
      }),
    );
  };
  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };
  const byGroup = (g: CheckGroup) => checklist.filter((c) => c.group === g);
  const canSave =
    decision !== null &&
    ((decision !== "fail" && decision !== "rework") || !!failReason);

  const activeDecisionStatus = (): { label: string; cls: string } => {
    if (decision === "approve")
      return {
        label: "Audit Approved",
        cls: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    if (decision === "fail")
      return {
        label: "Audit Failed",
        cls: "bg-red-100 text-red-700 border-red-200",
      };
    if (decision === "rework")
      return {
        label: "Rework Requested",
        cls: "bg-orange-100 text-orange-700 border-orange-200",
      };
    return STATUS_MAP[selectedCase.status];
  };

  // Evidence cards data
  const EVIDENCE_CARDS = [
    {
      label: "BP Reading",
      abstractor: "138/84 mmHg",
      document: "142/88 mmHg",
      discrepancy: true,
      critical: true,
      icon: Activity,
      field: "vital-bp",
    },
    {
      label: "Numerator Status",
      abstractor: "MET",
      document: "NOT MET",
      discrepancy: true,
      critical: true,
      icon: Flag,
      field: "numerator",
    },
    {
      label: "Service Date",
      abstractor: "Apr 14, 2025",
      document: "Apr 14, 2025",
      discrepancy: false,
      critical: false,
      icon: Calendar,
      field: "service-date",
    },
    {
      label: "ICD-10 Code",
      abstractor: "I10",
      document: "I10",
      discrepancy: false,
      critical: false,
      icon: Hash,
      field: "icd10",
    },
    {
      label: "Visit Type",
      abstractor: "Office Visit",
      document: "Office Visit (99214)",
      discrepancy: false,
      critical: false,
      icon: Stethoscope,
      field: "visit-type",
    },
    {
      label: "Provider",
      abstractor: "Dr. Reyes, Elena",
      document: "Dr. Elena Reyes, MD",
      discrepancy: false,
      critical: false,
      icon: User,
      field: "provider",
    },
    {
      label: "Evidence Source",
      abstractor: "OfficeVisit_Garcia…",
      document: "Page 2, Vitals §",
      discrepancy: false,
      critical: false,
      icon: FileText,
      field: "evidence-src",
    },
    {
      label: "Lookback Met",
      abstractor: "MY 2023–2025",
      document: "Confirmed",
      discrepancy: false,
      critical: false,
      icon: CheckSquare,
      field: "lookback",
    },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ══════════════════════════════════════
          LEFT PANEL — AUDIT QUEUE (full height)
      ══════════════════════════════════════ */}
      <div className="w-[272px] flex-shrink-0 flex flex-col border-r border-border overflow-hidden bg-card">
        {/* Queue header */}
        <div className="flex-shrink-0 px-4 pt-4 pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center">
                <ListChecks className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-foreground leading-tight">
                  Audit Queue
                </p>
                <p className="text-[9px] text-muted-foreground">NCQA MY2025</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold bg-violet-100 text-violet-700 border border-violet-200 px-1.5 py-0.5 rounded-full">
                {
                  QUEUE.filter(
                    (q) => q.status === "pending" || q.status === "in-review",
                  ).length
                }
              </span>
              <button className="w-6 h-6 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-2.5">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search case, member, measure…"
              className="w-full pl-8 pr-3 py-1.5 text-[11px] bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-300/50 focus:border-violet-300"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex gap-1 flex-wrap">
            {(
              [
                ["all", "All"],
                ["pending", "Pending"],
                ["in-review", "Review"],
                ["failed", "Failed"],
                ["rework", "Rework"],
              ] as const
            ).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val as "all" | AuditStatus)}
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                  statusFilter === val
                    ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                    : "border-border text-muted-foreground hover:border-violet-300 hover:text-violet-700"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
        </div>

        {/* Queue list */}
        <div className="flex-1 overflow-y-auto">
          {filteredQueue.length > 0 ? (
            filteredQueue.map((item) => (
              <QueueCard
                key={item.id}
                item={item}
                selected={item.id === selectedId}
                onClick={() => setSelectedId(item.id)}
                onOpenP360={onOpenPatient360}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="w-8 h-8 opacity-20 mb-2" />
              <p className="text-[12px]">No cases found</p>
            </div>
          )}
        </div>

        {/* Queue stats footer */}
        <div className="flex-shrink-0 border-t border-border px-4 py-3 bg-card">
          <div className="grid grid-cols-4 gap-1 text-center mb-2.5">
            {[
              {
                label: "Pending",
                count: QUEUE.filter((q) => q.status === "pending").length,
                cls: "text-slate-600",
              },
              {
                label: "Review",
                count: QUEUE.filter((q) => q.status === "in-review").length,
                cls: "text-violet-600",
              },
              {
                label: "Approved",
                count: QUEUE.filter((q) => q.status === "approved").length,
                cls: "text-emerald-600",
              },
              {
                label: "Failed",
                count: QUEUE.filter((q) => q.status === "failed").length,
                cls: "text-red-600",
              },
            ].map((s) => (
              <div key={s.label}>
                <p className={`text-[13px] font-bold ${s.cls}`}>{s.count}</p>
                <p className="text-[9px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Award className="w-3 h-3 text-violet-500" />
              IRR:{" "}
              <span className="font-bold text-foreground ml-0.5">
                {CASE.irrScore} κ
              </span>
            </span>
            <span className="text-muted-foreground">
              {QUEUE.length} sampled
            </span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT SIDE — BANNER + HEADER + CONTENT + FOOTER
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* ── Auditor Mode Banner ── */}
        <div className="flex-shrink-0 bg-gradient-to-r from-violet-700 to-violet-600 px-5 py-2 flex items-center gap-3">
          <Lock className="w-3.5 h-3.5 text-violet-200 flex-shrink-0" />
          <p className="text-[11px] text-violet-100 flex-1">
            <span className="font-bold text-white">Auditor Mode Active</span>
            <span className="mx-1.5 text-violet-300">·</span>
            Read-only. No abstraction edits permitted. All actions are logged
            for NCQA compliance audit trail.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/15 border border-white/25 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              NCQA MY2025
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/15 border border-white/25 px-2 py-0.5 rounded-full">
              <FileBadge className="w-3 h-3" />
              {CASE.sampleFlag}
            </span>
          </div>
        </div>

        {/* ── Patient Header ── */}
        <div className="flex-shrink-0 border-b border-border bg-card">
          <div className="flex items-center gap-4 px-5 py-3">
            {/* Avatar + patient info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-violet-700">
                  {CASE.member.split(",")[0].substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <span className="text-[14px] font-bold text-foreground">
                    {phiVisible ? CASE.member : "████████████"}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {phiVisible ? CASE.memberId : "█████████"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${activeDecisionStatus().cls}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {activeDecisionStatus().label}
                  </span>
                  <LevelBadge level={CASE.auditLevel} />
                </div>
                <div className="flex items-center gap-2 flex-wrap text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold border border-primary/20">
                      {CASE.measureCode}
                    </span>
                    <span className="text-foreground/70">
                      {CASE.measureName}
                    </span>
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span className="font-medium text-foreground">
                      Abstractor:
                    </span>{" "}
                    {CASE.abstractor}
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />
                    <span className="font-medium text-foreground">
                      QA:
                    </span>{" "}
                    {CASE.qaReviewer}
                  </span>
                  <span className="text-border">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {CASE.dueBy}
                  </span>
                </div>
              </div>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setPhiVisible((v) => !v)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                {phiVisible ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {phiVisible ? "Mask PHI" : "Show PHI"}
              </button>
              <div className="w-px h-6 bg-border" />
              <button
                onClick={() => {
                  setDecision("rework");
                  setFailReason("");
                  setAuditNote("");
                }}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all
                  ${
                    decision === "rework"
                      ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                      : "border-orange-300 text-orange-700 hover:bg-orange-50"
                  }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Request Rework
              </button>
              <button
                onClick={() => {
                  setDecision("fail");
                  setFailReason("");
                  setAuditNote("");
                }}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all
                  ${
                    decision === "fail"
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "border-red-300 text-red-700 hover:bg-red-50"
                  }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                Audit Fail
              </button>
              <button
                onClick={() => {
                  setDecision("approve");
                  setFailReason("");
                  setAuditNote("");
                }}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all
                  ${
                    decision === "approve"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Audit Approve
              </button>
            </div>
          </div>

          {/* Fail / Rework reason bar */}
          {(decision === "fail" || decision === "rework") && (
            <div
              className={`flex items-center gap-3 px-5 py-2.5 border-t
              ${decision === "fail" ? "bg-red-50 border-red-100" : "bg-orange-50 border-orange-100"}`}
            >
              <Flag
                className={`w-4 h-4 flex-shrink-0 ${decision === "fail" ? "text-red-500" : "text-orange-500"}`}
              />
              <span
                className={`text-[11px] font-bold whitespace-nowrap ${decision === "fail" ? "text-red-700" : "text-orange-700"}`}
              >
                {decision === "fail"
                  ? "Failure reason required:"
                  : "Rework instruction required:"}
              </span>
              <select
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                className={`px-3 py-1.5 text-[11px] border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2
                  ${decision === "fail" ? "border-red-300 focus:ring-red-200" : "border-orange-300 focus:ring-orange-200"}`}
              >
                <option value="">— Select reason —</option>
                {FAIL_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={auditNote}
                onChange={(e) => setAuditNote(e.target.value)}
                placeholder="Additional comments for abstractor / QA reviewer…"
                className={`flex-1 px-3 py-1.5 text-[11px] border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2
                  ${decision === "fail" ? "border-red-300 focus:ring-red-200" : "border-orange-300 focus:ring-orange-200"}`}
              />
              <button
                onClick={() => {
                  setDecision(null);
                  setFailReason("");
                  setAuditNote("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── 3-Panel Content Row ── */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── CENTER PANEL — Document Viewer ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 border-r border-border">
            {/* Tab strip */}
            <div className="flex-shrink-0 border-b border-border bg-card flex items-center gap-1 px-4">
              {[
                {
                  id: "evidence" as ViewTab,
                  label: "Document Viewer",
                  Icon: FileText,
                },
                {
                  id: "comparison" as ViewTab,
                  label: "Field Comparison",
                  Icon: Layers,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewTab(tab.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-[11px] font-semibold border-b-2 transition-colors
                    ${
                      viewTab === tab.id
                        ? "border-violet-500 text-violet-700"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                >
                  <tab.Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
              <div className="flex-1" />
              {selectedCase.discrepancies > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 pr-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {selectedCase.discrepancies} critical discrepanc
                  {selectedCase.discrepancies === 1 ? "y" : "ies"}
                </div>
              )}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-hidden">
              {viewTab === "evidence" ? (
                <div className="flex h-full overflow-hidden">
                  {/* PDF Document Preview */}
                  <div
                    className="flex flex-col border-r border-border"
                    style={{ width: "56%" }}
                  >
                    {/* PDF toolbar */}
                    <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <div className="w-5 h-5 rounded bg-red-100 border border-red-200 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="text-[11px] font-semibold text-foreground truncate">
                          OfficeVisit_Garcia_20250414.pdf
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() =>
                            setPdfZoom((z) => Math.max(75, z - 25))
                          }
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-[10px] font-semibold text-muted-foreground w-9 text-center">
                          {pdfZoom}%
                        </span>
                        <button
                          onClick={() =>
                            setPdfZoom((z) => Math.min(150, z + 25))
                          }
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground transition-colors"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                        <div className="w-px h-4 bg-border mx-1" />
                        <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors whitespace-nowrap">
                          <Download className="w-3 h-3" />
                          Export
                        </button>
                      </div>
                    </div>

                    {/* Document area */}
                    <div className="flex-1 overflow-auto bg-slate-200/60 p-4">
                      <div
                        className="bg-white shadow-xl rounded-lg mx-auto p-6 transition-transform origin-top"
                        style={{
                          maxWidth: 480,
                          transform: `scale(${pdfZoom / 100})`,
                          transformOrigin: "top center",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3 text-[9px] text-gray-300 uppercase tracking-widest border-b border-gray-100 pb-2">
                          <span>Page {pdfPage} of 3</span>
                          <span className="font-semibold">
                            {
                              [
                                "Patient & Visit Info",
                                "Clinical Examination",
                                "Provider Attestation",
                              ][pdfPage - 1]
                            }
                          </span>
                        </div>
                        <PDFPage page={pdfPage} />
                      </div>
                    </div>

                    {/* Page navigation */}
                    <div className="flex-shrink-0 border-t border-border bg-card flex items-center justify-between px-4 py-2">
                      <button
                        onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                        disabled={pdfPage === 1}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPdfPage(p)}
                            className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-all ${pdfPage === p ? "bg-violet-600 text-white shadow-sm" : "border border-border text-muted-foreground hover:bg-muted"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setPdfPage((p) => Math.min(3, p + 1))}
                        disabled={pdfPage === 3}
                        className="inline-flex items-center gap-1 whitespace-nowrap text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Extracted Evidence Panel */}
                  <div
                    className="flex flex-col flex-[0_0_44%] overflow-hidden bg-background"
                    style={{ width: "44%" }}
                  >
                    {/* Panel header */}
                    <div className="flex-shrink-0 px-4 py-2.5 border-b border-border bg-card">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5">
                          <ClipboardCheck className="w-3.5 h-3.5 text-violet-600" />
                          <span className="text-[11px] font-bold text-foreground">
                            Extracted Evidence
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 justify-end">
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
                            <AlertTriangle className="w-2.5 h-2.5" />2 mismatch
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                            <Check className="w-2.5 h-2.5" />6 match
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Abstractor vs. Source Document · AI-verified
                      </p>
                    </div>

                    {/* Evidence cards list */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {EVIDENCE_CARDS.map((ev) => (
                        <EvidenceCard key={ev.label} {...ev} />
                      ))}

                      {/* AI Analysis card */}
                      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50/40 p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                          <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">
                            AI Audit Analysis
                          </span>
                          <span className="ml-auto text-[9px] text-muted-foreground bg-white/60 px-1.5 py-0.5 rounded-full border border-violet-100">
                            Confidence 97%
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground leading-relaxed">
                          Detected a{" "}
                          <span className="font-bold text-red-600">
                            critical BP transcription error
                          </span>{" "}
                          with numerator impact. Abstractor entered 138/84 (MET)
                          but source document shows 142/88 (NOT MET — systolic ≥
                          140). This error would inflate the CBP compliance
                          rate. Recommend{" "}
                          <span className="font-bold text-orange-700">
                            Audit Fail
                          </span>{" "}
                          with rework instruction to correct the BP value.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* FIELD COMPARISON TABLE */
                <div className="flex-1 h-full overflow-auto p-5">
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] font-bold text-foreground">
                          Abstraction vs. Source — Audit Comparison
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {CASE.caseRef} · {CASE.measureCode} ·{" "}
                          {CASE.abstractor} · QA: {CASE.qaReviewer}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <Flag className="w-3 h-3" />3 critical errors
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />5 matches
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/30 border-b border-border">
                          <tr>
                            {[
                              "Data Field",
                              "Abstractor Entry",
                              "Source Document",
                              "AI Extracted",
                              "Status",
                            ].map((h) => (
                              <th
                                key={h}
                                className="text-left px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap"
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {COMPARISON.map((row, i) => (
                            <tr
                              key={i}
                              className={`transition-colors hover:bg-muted/10
                              ${row.match === "discrepancy" && row.critical ? "bg-red-50/50" : row.match === "discrepancy" ? "bg-amber-50/30" : ""}`}
                            >
                              <td className="px-5 py-3">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[12px] font-semibold text-foreground">
                                    {row.field}
                                  </span>
                                  {row.critical &&
                                    row.match === "discrepancy" && (
                                      <span className="text-[9px] font-bold text-red-600 bg-red-100 border border-red-200 px-1 py-0.5 rounded">
                                        CRITICAL
                                      </span>
                                    )}
                                </div>
                              </td>
                              <td
                                className={`px-5 py-3 text-[12px] ${row.match === "discrepancy" ? (row.critical ? "font-bold text-red-700 line-through decoration-red-400" : "font-semibold text-amber-700") : "text-foreground"}`}
                              >
                                {row.abstractorValue}
                                {row.match === "discrepancy" && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline ml-1.5" />
                                )}
                              </td>
                              <td
                                className={`px-5 py-3 text-[12px] ${row.critical && row.match === "discrepancy" ? "font-bold text-red-700" : "text-foreground"}`}
                              >
                                {row.documentValue}
                              </td>
                              <td className="px-5 py-3 text-[12px]">
                                <span className="inline-flex items-center gap-1.5 text-foreground">
                                  <Sparkles className="w-3 h-3 text-violet-500 flex-shrink-0" />
                                  {row.aiValue}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {row.match === "discrepancy" &&
                                  row.critical && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                      <Flag className="w-3 h-3" />
                                      Critical Error
                                    </span>
                                  )}
                                {row.match === "discrepancy" &&
                                  !row.critical && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                      <AlertTriangle className="w-3 h-3" />
                                      Discrepancy
                                    </span>
                                  )}
                                {row.match === "match" && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                    <Check className="w-3 h-3" />
                                    Match
                                  </span>
                                )}
                                {row.match === "na" && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
                                    <Minus className="w-3 h-3" />
                                    N/A
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT PANEL — Validation Checklist + Decision ── */}
          <div className="w-[296px] flex-shrink-0 flex flex-col overflow-hidden bg-card">
            {/* Panel header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-lg bg-violet-100 border border-violet-200 flex items-center justify-center">
                    <ClipboardCheck className="w-3.5 h-3.5 text-violet-600" />
                  </div>
                  <span className="text-[12px] font-bold text-foreground">
                    Validation Checklist
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <LevelBadge level={CASE.auditLevel} />
                  <span className="text-[9px] font-bold text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded border border-border">
                    NCQA
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-1.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    {reviewedCount}/{totalCount} reviewed
                  </span>
                  <span className="text-[10px] font-bold text-foreground">
                    {passCount} pass · {warnCount} warn · {failCount} fail
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden flex gap-px">
                  <div
                    className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
                    style={{ width: `${(passCount / totalCount) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${(warnCount / totalCount) * 100}%` }}
                  />
                  <div
                    className="h-full bg-red-500 rounded-r-full transition-all duration-300"
                    style={{ width: `${(failCount / totalCount) * 100}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Info className="w-3 h-3" />
                Click status icon to cycle: Pass → Warn → Fail → N/A
              </p>
            </div>

            {/* Checklist (scrollable) */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {(["eligibility", "documentation", "measure-logic"] as const).map(
                (group) => {
                  const meta = GROUP_MAP[group];
                  const items = byGroup(group);
                  const gPass = items.filter((i) => i.state === "pass").length;
                  const gFail = items.filter((i) => i.state === "fail").length;
                  const gWarn = items.filter((i) => i.state === "warn").length;
                  return (
                    <div key={group}>
                      {/* Group label */}
                      <div
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-2 border ${meta.bg} ${meta.border}`}
                      >
                        <div className="flex items-center gap-1.5">
                          <meta.Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px]">
                          {gFail > 0 && (
                            <span className="font-bold text-red-600">
                              {gFail} fail
                            </span>
                          )}
                          {gWarn > 0 && (
                            <span className="font-bold text-amber-600">
                              {gWarn} warn
                            </span>
                          )}
                          <span className="font-bold text-emerald-600">
                            {gPass} pass
                          </span>
                        </div>
                      </div>
                      {/* Items */}
                      <div className="space-y-1.5">
                        {items.map((item) => (
                          <ValidationItem
                            key={item.id}
                            item={item}
                            onCycle={cycleCheck}
                            expanded={expanded.has(item.id)}
                            onToggle={toggleExpand}
                          />
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            {/* ── Decision Section (pinned) ── */}
            <div className="flex-shrink-0 border-t border-border bg-card">
              {/* Decision context banner */}
              {(failCount > 0 || warnCount > 0) && !decision && (
                <div className="flex items-start gap-2 mx-3 mt-3 p-2.5 rounded-lg border border-red-200 bg-red-50">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-700 leading-snug">
                    {failCount > 0
                      ? `${failCount} critical check${failCount > 1 ? "s" : ""} failed. `
                      : ""}
                    {warnCount > 0
                      ? `${warnCount} item${warnCount > 1 ? "s" : ""} need verification.`
                      : ""}
                  </p>
                </div>
              )}

              {decision && (
                <div
                  className={`flex items-center gap-2 mx-3 mt-3 p-2.5 rounded-lg border
                  ${decision === "approve" ? "border-emerald-200 bg-emerald-50" : decision === "fail" ? "border-red-200 bg-red-50" : "border-orange-200 bg-orange-50"}`}
                >
                  {decision === "approve" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  {decision === "fail" && (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  {decision === "rework" && (
                    <RotateCcw className="w-4 h-4 text-orange-600 flex-shrink-0" />
                  )}
                  <p
                    className={`text-[11px] font-bold leading-tight
                    ${decision === "approve" ? "text-emerald-700" : decision === "fail" ? "text-red-700" : "text-orange-700"}`}
                  >
                    {decision === "approve"
                      ? "Cleared for HEDIS submission"
                      : ""}
                    {decision === "fail"
                      ? "Returned for correction & re-QA"
                      : ""}
                    {decision === "rework" ? "Sent back to abstractor" : ""}
                  </p>
                </div>
              )}

              <div className="p-3 space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Audit Decision
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => setDecision("approve")}
                    className={`inline-flex items-center justify-center gap-1 whitespace-nowrap py-2 rounded-lg border text-[11px] font-bold transition-all
                      ${decision === "approve" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setDecision("rework");
                      setFailReason("");
                      setAuditNote("");
                    }}
                    className={`inline-flex items-center justify-center gap-1 whitespace-nowrap py-2 rounded-lg border text-[11px] font-bold transition-all
                      ${decision === "rework" ? "bg-orange-500 text-white border-orange-500 shadow-sm" : "border-orange-300 text-orange-700 hover:bg-orange-50"}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Rework
                  </button>
                  <button
                    onClick={() => {
                      setDecision("fail");
                      setFailReason("");
                      setAuditNote("");
                    }}
                    className={`inline-flex items-center justify-center gap-1 whitespace-nowrap py-2 rounded-lg border text-[11px] font-bold transition-all
                      ${decision === "fail" ? "bg-red-600 text-white border-red-600 shadow-sm" : "border-red-300 text-red-700 hover:bg-red-50"}`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Fail
                  </button>
                </div>

                {/* Inline reason for right-panel fail */}
                {(decision === "fail" || decision === "rework") && (
                  <div className="space-y-1.5">
                    <select
                      value={failReason}
                      onChange={(e) => setFailReason(e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-[11px] border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2
                        ${decision === "fail" ? "border-red-300 focus:ring-red-200" : "border-orange-300 focus:ring-orange-200"}`}
                    >
                      <option value="">— Select reason —</option>
                      {FAIL_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={auditNote}
                      onChange={(e) => setAuditNote(e.target.value)}
                      rows={2}
                      placeholder="Additional auditor comments…"
                      className={`w-full px-2.5 py-1.5 text-[11px] border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 resize-none
                        ${decision === "fail" ? "border-red-200 focus:ring-red-200" : "border-orange-200 focus:ring-orange-200"}`}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 border-t border-border px-5 py-2.5 bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center">
                <span className="text-[8px] font-bold text-violet-700">PN</span>
              </div>
              <span>
                Auditor:{" "}
                <span className="font-semibold text-foreground">
                  {CASE.auditor}
                </span>
              </span>
            </div>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Started {CASE.auditStarted}
            </span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-violet-500" />
              NCQA MY2025 · L{CASE.auditLevel.slice(1)} Audit · Hybrid
              Methodology
            </span>
            <span className="text-border">·</span>
            <span className="inline-flex items-center gap-1">
              <Award className="w-3 h-3 text-violet-500" />
              IRR {CASE.irrScore} κ — Excellent
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!canSave && decision && (
              <span className="text-[10px] text-red-600 font-semibold">
                Reason required before saving
              </span>
            )}
            <button
              disabled={!canSave}
              onClick={() => canSave && setShowSaveModal(true)}
              className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-[12px] font-bold rounded-lg transition-all bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Save Audit Decision
            </button>
          </div>
        </div>
      </div>

      {/* ── Save Confirmation Modal ── */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-[480px] overflow-hidden">
            {/* Modal header */}
            <div
              className={`px-6 py-4 border-b border-border flex items-center gap-3
              ${decision === "approve" ? "bg-emerald-50" : decision === "fail" ? "bg-red-50" : "bg-orange-50"}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center
                ${decision === "approve" ? "bg-emerald-100" : decision === "fail" ? "bg-red-100" : "bg-orange-100"}`}
              >
                {decision === "approve" && (
                  <BadgeCheck className="w-5 h-5 text-emerald-600" />
                )}
                {decision === "fail" && (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                {decision === "rework" && (
                  <RotateCcw className="w-5 h-5 text-orange-600" />
                )}
              </div>
              <div>
                <p
                  className={`text-[13px] font-bold
                  ${decision === "approve" ? "text-emerald-700" : decision === "fail" ? "text-red-700" : "text-orange-700"}`}
                >
                  {decision === "approve" ? "Confirm Audit Approval" : ""}
                  {decision === "fail" ? "Confirm Audit Failure" : ""}
                  {decision === "rework" ? "Confirm Rework Request" : ""}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  This action will be permanently logged in the NCQA audit
                  trail.
                </p>
              </div>
              <button
                onClick={() => setShowSaveModal(false)}
                className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                {[
                  ["Case Ref", CASE.caseRef],
                  ["Member", phiVisible ? CASE.member : "████████"],
                  ["Measure", `${CASE.measureCode} — ${CASE.measureName}`],
                  ["Abstractor", CASE.abstractor],
                  ["QA Reviewer", CASE.qaReviewer],
                  ["Audit Level", CASE.auditLevel],
                  [
                    "Checklist",
                    `${passCount} pass · ${warnCount} warn · ${failCount} fail`,
                  ],
                  [
                    "Decision",
                    decision === "approve"
                      ? "Approved"
                      : decision === "fail"
                        ? "Failed"
                        : "Rework",
                  ],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="bg-muted/20 rounded-lg p-2 border border-border"
                  >
                    <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                      {k}
                    </p>
                    <p className="font-semibold text-foreground text-[11px] truncate">
                      {v}
                    </p>
                  </div>
                ))}
              </div>

              {failReason && (
                <div
                  className={`p-3 rounded-lg border text-[11px]
                  ${decision === "fail" ? "bg-red-50 border-red-200 text-red-700" : "bg-orange-50 border-orange-200 text-orange-700"}`}
                >
                  <p className="font-bold mb-0.5">Reason:</p>
                  <p>{failReason}</p>
                  {auditNote && <p className="mt-1 opacity-80">{auditNote}</p>}
                </div>
              )}

              <div className="flex items-start gap-2 p-2.5 bg-violet-50 border border-violet-200 rounded-lg text-[10px] text-violet-700">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  This decision will be recorded with timestamp, auditor ID, and
                  IP address for NCQA compliance traceability.
                </span>
              </div>
            </div>

            {/* Modal footer */}
            <div className="px-6 py-3 border-t border-border bg-muted/10 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-[12px] font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap px-5 py-2 text-[12px] font-bold rounded-lg shadow-sm transition-all
                  ${
                    decision === "approve"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : decision === "fail"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                  }`}
              >
                <Send className="w-3.5 h-3.5" />
                {decision === "approve" ? "Save & Approve" : ""}
                {decision === "fail" ? "Save & Fail Case" : ""}
                {decision === "rework" ? "Save & Send Rework" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
