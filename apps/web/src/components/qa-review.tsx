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
  ClipboardCheck,
  Shield,
  Eye,
  EyeOff,
  ZoomIn,
  ZoomOut,
  Download,
  Star,
  Sparkles,
  ShieldCheck,
  BookOpen,
  Minus,
  Hash,
  Check,
  Layers,
  User,
  Stethoscope,
  Info,
  ExternalLink,
  Calendar,
  ChevronUp,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type QueueStatus =
  | "pending"
  | "in-review"
  | "approved"
  | "returned"
  | "escalated";
type Priority = "critical" | "high" | "medium" | "low";
type CheckState = "pass" | "fail" | "warn" | "na" | "pending";
type Decision = null | "pass" | "fail" | "revision";
type CenterTab = "evidence" | "comparison";

interface QueueCase {
  id: string;
  caseRef: string;
  member: string;
  memberId: string;
  measureCode: string;
  measureName: string;
  abstractor: string;
  submittedAt: string;
  dueBy: string;
  hoursRemaining: number;
  priority: Priority;
  status: QueueStatus;
  qaSampled: boolean;
  fieldCount: number;
  discrepancies: number;
}
interface ChecklistItem {
  id: string;
  group: "eligibility" | "evidence" | "documentation" | "coding";
  label: string;
  description: string;
  ncqaRef: string;
  abstractorValue?: string;
  documentValue?: string;
  state: CheckState;
  discrepancy?: string;
}
interface ComparisonField {
  field: string;
  abstractorValue: string;
  documentValue: string;
  aiValue: string;
  match: "match" | "discrepancy" | "warn" | "na";
}

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — QUEUE (8 cases)
───────────────────────────────────────────────────────────── */
const QUEUE: QueueCase[] = [
  {
    id: "qr-031",
    caseRef: "CASE-20250720-0031",
    member: "Williams, Sandra B.",
    memberId: "MBR-567123",
    measureCode: "BCS",
    measureName: "Breast Cancer Screening",
    abstractor: "Kim, Jenny",
    submittedAt: "Jul 20 · 3:15 PM",
    dueBy: "Jul 21",
    hoursRemaining: 2,
    priority: "critical",
    status: "in-review",
    qaSampled: true,
    fieldCount: 6,
    discrepancies: 2,
  },
  {
    id: "qr-042",
    caseRef: "CASE-20250721-0042",
    member: "Anderson, Jennifer K.",
    memberId: "MBR-789456",
    measureCode: "CDC",
    measureName: "Comprehensive Diabetes Care",
    abstractor: "Torres, Maria",
    submittedAt: "Jul 21 · 11:08 AM",
    dueBy: "Jul 22",
    hoursRemaining: 14,
    priority: "high",
    status: "pending",
    qaSampled: false,
    fieldCount: 10,
    discrepancies: 1,
  },
  {
    id: "qr-039",
    caseRef: "CASE-20250721-0039",
    member: "Nguyen, Robert T.",
    memberId: "MBR-234891",
    measureCode: "CBP",
    measureName: "Controlling High Blood Pressure",
    abstractor: "Patel, Ravi",
    submittedAt: "Jul 21 · 9:42 AM",
    dueBy: "Jul 22",
    hoursRemaining: 8,
    priority: "critical",
    status: "pending",
    qaSampled: true,
    fieldCount: 8,
    discrepancies: 0,
  },
  {
    id: "qr-028",
    caseRef: "CASE-20250720-0028",
    member: "Martinez, Carlos R.",
    memberId: "MBR-112334",
    measureCode: "COL",
    measureName: "Colorectal Cancer Screening",
    abstractor: "Torres, Maria",
    submittedAt: "Jul 20 · 1:00 PM",
    dueBy: "Jul 21",
    hoursRemaining: 4,
    priority: "high",
    status: "pending",
    qaSampled: false,
    fieldCount: 7,
    discrepancies: 0,
  },
  {
    id: "qr-019",
    caseRef: "CASE-20250719-0019",
    member: "Johnson, Patricia A.",
    memberId: "MBR-889043",
    measureCode: "W34",
    measureName: "Well-Child Visits (Ages 3–6)",
    abstractor: "Okonkwo, Emeka",
    submittedAt: "Jul 19 · 4:30 PM",
    dueBy: "Jul 22",
    hoursRemaining: 38,
    priority: "medium",
    status: "pending",
    qaSampled: false,
    fieldCount: 5,
    discrepancies: 0,
  },
  {
    id: "qr-015",
    caseRef: "CASE-20250719-0015",
    member: "Davis, Thomas W.",
    memberId: "MBR-344782",
    measureCode: "AMR",
    measureName: "Asthma Medication Ratio",
    abstractor: "Kim, Jenny",
    submittedAt: "Jul 19 · 10:20 AM",
    dueBy: "Jul 21",
    hoursRemaining: 6,
    priority: "high",
    status: "pending",
    qaSampled: false,
    fieldCount: 9,
    discrepancies: 3,
  },
  {
    id: "qr-008",
    caseRef: "CASE-20250718-0008",
    member: "Wilson, Grace M.",
    memberId: "MBR-667234",
    measureCode: "CDC",
    measureName: "Comprehensive Diabetes Care",
    abstractor: "Patel, Ravi",
    submittedAt: "Jul 18 · 2:45 PM",
    dueBy: "Jul 20",
    hoursRemaining: 0,
    priority: "high",
    status: "approved",
    qaSampled: true,
    fieldCount: 10,
    discrepancies: 0,
  },
  {
    id: "qr-005",
    caseRef: "CASE-20250718-0005",
    member: "Brown, Michael S.",
    memberId: "MBR-451287",
    measureCode: "CBP",
    measureName: "Controlling High Blood Pressure",
    abstractor: "Okonkwo, Emeka",
    submittedAt: "Jul 18 · 9:00 AM",
    dueBy: "Jul 19",
    hoursRemaining: 0,
    priority: "medium",
    status: "returned",
    qaSampled: false,
    fieldCount: 8,
    discrepancies: 3,
  },
];

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — SELECTED CASE DETAIL
───────────────────────────────────────────────────────────── */
const CASE_DETAIL = {
  caseRef: "CASE-20250720-0031",
  member: "Williams, Sandra B.",
  memberId: "MBR-567123",
  dob: "Mar 15, 1973",
  age: 52,
  measureCode: "BCS",
  measureName: "Breast Cancer Screening",
  measurementYear: "MY 2025",
  productLine: "Medicare",
  abstractor: "Kim, Jenny",
  submittedAt: "Jul 20, 2025 · 3:15 PM",
  dueBy: "Jul 21, 2025 · 3:15 PM",
  facility: "Advanced Imaging Center, Boston, MA",
  reviewer: "Dr. Sarah Chen, RHIA",
  reviewStarted: "Jul 21, 2025 · 10:02 AM",
};

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — VALIDATION CHECKLIST
───────────────────────────────────────────────────────────── */
const INITIAL_CHECKLIST: ChecklistItem[] = [
  // ELIGIBILITY
  {
    id: "el1",
    group: "eligibility",
    label: "Age Criteria (50–74 years)",
    description:
      "Member must be 50–74 years old as of Dec 31 of the measurement year.",
    ncqaRef: "BCS Technical Spec §2.1",
    abstractorValue: "Age 52 (DOB: Mar 15, 1973)",
    documentValue: "Verified via claims eligibility file",
    state: "pass",
  },
  {
    id: "el2",
    group: "eligibility",
    label: "Continuous Enrollment Verified",
    description:
      "Member must have continuous enrollment with no gaps > 45 days during the measurement year.",
    ncqaRef: "General Eligibility §1.3",
    abstractorValue: "No enrollment gaps found",
    documentValue: "Eligibility file 2025 — confirmed",
    state: "pass",
  },
  {
    id: "el3",
    group: "eligibility",
    label: "Product Line: Medicare",
    description: "Product line must match the measure-eligible population.",
    ncqaRef: "BCS Technical Spec §1.1",
    abstractorValue: "Medicare",
    documentValue: "Medicare Plan M-567123",
    state: "pass",
  },
  {
    id: "el4",
    group: "eligibility",
    label: "No Bilateral Mastectomy Exclusion",
    description:
      "Members with a history of bilateral mastectomy are excluded from this measure.",
    ncqaRef: "BCS Technical Spec §3.2 — Exclusions",
    abstractorValue: "No exclusion found",
    documentValue: "No mastectomy codes in claims history",
    state: "pass",
  },
  // EVIDENCE
  {
    id: "ev1",
    group: "evidence",
    label: "Mammography Screening Found in Chart",
    description:
      "At least one mammography screening must be documented in the 2-year lookback window.",
    ncqaRef: "BCS Technical Spec §4.1",
    abstractorValue: "Mammography report dated 2024-08-15",
    documentValue: "Mammogram_567123_20240815.pdf — confirmed",
    state: "pass",
  },
  {
    id: "ev2",
    group: "evidence",
    label: "Service Date Valid in Lookback Period",
    description:
      "Service date must fall within Oct 1 of the prior year through Dec 31 of the measurement year (Oct 2023–Dec 2025).",
    ncqaRef: "BCS Technical Spec §4.2",
    abstractorValue: "Aug 15, 2025 (abstractor entry)",
    documentValue: "Aug 15, 2024 (source document)",
    state: "warn",
    discrepancy:
      "Year discrepancy: abstractor entered 2025 but source document clearly shows 2024. Both dates fall within the lookback window but the entry must match the source document exactly.",
  },
  {
    id: "ev3",
    group: "evidence",
    label: "Lookback Period Met (Oct 2023–Dec 2025)",
    description:
      "The documented service must occur within the defined 2-year lookback window for BCS.",
    ncqaRef: "BCS Technical Spec §4.2",
    abstractorValue: "2024-08-15 — within window",
    documentValue: "Aug 2024 — confirmed within Oct 2023–Dec 2025",
    state: "pass",
  },
  {
    id: "ev4",
    group: "evidence",
    label: "Bilateral Notation Present",
    description:
      "Bilateral or unilateral notation must be documented. Bilateral (CPT 77067) satisfies the numerator.",
    ncqaRef: "BCS Technical Spec §4.3",
    abstractorValue: "Bilateral (CPT 77067)",
    documentValue: "Report confirms bilateral mammography",
    state: "pass",
  },
  // DOCUMENTATION
  {
    id: "dc1",
    group: "documentation",
    label: "Source Document Uploaded",
    description:
      "The original source document used for abstraction must be attached to the case.",
    ncqaRef: "HEDIS Documentation Standards §2.0",
    abstractorValue: "Mammogram_567123_20240815.pdf attached",
    documentValue: "File present and readable",
    state: "pass",
  },
  {
    id: "dc2",
    group: "documentation",
    label: "Abstractor Entry Matches Source",
    description:
      "All abstracted fields must be accurately transcribed from the source document.",
    ncqaRef: "HEDIS Documentation Standards §3.1",
    abstractorValue: "Service date: 2025-08-15",
    documentValue: "Source date: 2024-08-15",
    state: "fail",
    discrepancy:
      'Service year is incorrect. Abstractor entered "2025" but source document shows "2024". This is a data entry error that must be corrected before numerator closure.',
  },
  {
    id: "dc3",
    group: "documentation",
    label: "Highlight / Annotation Present",
    description:
      "Relevant evidence must be highlighted or annotated within the source document.",
    ncqaRef: "HEDIS Documentation Standards §2.3",
    abstractorValue: "Annotation ANN-567-001 on page 2",
    documentValue: "Yellow highlight visible on exam date line — valid",
    state: "pass",
  },
  {
    id: "dc4",
    group: "documentation",
    label: "Provider Signature & Credentials",
    description:
      "Interpreting radiologist must be credentialed and signature must be present on the report.",
    ncqaRef: "BCS Technical Spec §5.0",
    abstractorValue: "Dr. Michael Torres, MD — signed",
    documentValue: "Signature on page 3 — verified",
    state: "pass",
  },
  // CODING
  {
    id: "co1",
    group: "coding",
    label: "CPT 77067 — Bilateral Screening Mammography",
    description:
      "CPT 77067 is the correct code for bilateral screening mammography. Verify against documentation.",
    ncqaRef: "BCS Technical Spec §6.1 — CPT Code Table",
    abstractorValue: "CPT 77067",
    documentValue: "Report confirms bilateral — CPT 77067 appropriate",
    state: "pass",
  },
  {
    id: "co2",
    group: "coding",
    label: "ICD-10 Z12.31 — Screening Diagnosis",
    description:
      "Diagnosis code Z12.31 (encounter for screening mammogram) must be present or supportable.",
    ncqaRef: "BCS Technical Spec §6.2",
    abstractorValue: "Z12.31 — Encounter for screening mammogram",
    documentValue: "ICD-10 Z12.31 documented in report header",
    state: "pass",
  },
  {
    id: "co3",
    group: "coding",
    label: "Rendering Provider NPI Documented",
    description:
      "NPI of the rendering/interpreting provider must be present for claims-based verification.",
    ncqaRef: "HEDIS Documentation Standards §4.0",
    abstractorValue: "NPI: 1234567890",
    documentValue: "NPI present on report letterhead",
    state: "pass",
  },
];

/* ─────────────────────────────────────────────────────────────
   MOCK DATA — FIELD COMPARISON TABLE
────────────���──────────────────────────────────────────────── */
const COMPARISON: ComparisonField[] = [
  {
    field: "Service Date",
    abstractorValue: "2025-08-15",
    documentValue: "2024-08-15",
    aiValue: "2024-08-15",
    match: "discrepancy",
  },
  {
    field: "Screening Type",
    abstractorValue: "Bilateral Mammogram",
    documentValue: "Bilateral Mammogram",
    aiValue: "Bilateral Mammogram",
    match: "match",
  },
  {
    field: "CPT Code",
    abstractorValue: "77067",
    documentValue: "77067",
    aiValue: "77067",
    match: "match",
  },
  {
    field: "ICD-10 Code",
    abstractorValue: "Z12.31",
    documentValue: "Z12.31",
    aiValue: "Z12.31",
    match: "match",
  },
  {
    field: "BI-RADS Result",
    abstractorValue: "Negative (BI-RADS 1)",
    documentValue: "BI-RADS 1 — No abnormality",
    aiValue: "Negative",
    match: "match",
  },
  {
    field: "Ordering Physician",
    abstractorValue: "Dr. Torres, Michael MD",
    documentValue: "Michael Torres, MD",
    aiValue: "Dr. Michael Torres",
    match: "match",
  },
  {
    field: "Facility",
    abstractorValue: "Advanced Imaging Center",
    documentValue: "Advanced Imaging Center, Boston MA",
    aiValue: "Advanced Imaging Center",
    match: "match",
  },
  {
    field: "LOINC Code",
    abstractorValue: "N/A",
    documentValue: "N/A",
    aiValue: "N/A",
    match: "na",
  },
];

/* ─────────────────────────────────────────────────────────────
   CONSTANTS / STYLE MAPS
───────────────────────────────────────────────────────────── */
const PRIORITY_STYLES: Record<Priority, string> = {
  critical: "bg-red-50 text-red-700 border-red-200",
  high: "bg-orange-50 text-orange-700 border-orange-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  low: "bg-slate-50 text-slate-600 border-slate-200",
};
const STATUS_STYLES: Record<QueueStatus, { badge: string; label: string }> = {
  pending: {
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Pending QA",
  },
  "in-review": {
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    label: "In Review",
  },
  approved: {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Approved",
  },
  returned: {
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Returned",
  },
  escalated: {
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    label: "Escalated",
  },
};
const CHECK_CFG: Record<
  CheckState,
  {
    icon: ElementType;
    color: string;
    bg: string;
    border: string;
    label: string;
  }
> = {
  pass: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    label: "Pass",
  },
  fail: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    label: "Fail",
  },
  warn: {
    icon: AlertCircle,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    label: "Warning",
  },
  na: {
    icon: Minus,
    color: "text-slate-400",
    bg: "bg-slate-50",
    border: "border-slate-200",
    label: "N/A",
  },
  pending: {
    icon: Circle,
    color: "text-muted-foreground",
    bg: "bg-muted/20",
    border: "border-border",
    label: "Unreviewed",
  },
};
const GROUP_META: Record<
  ChecklistItem["group"],
  { label: string; icon: ElementType; color: string; bg: string }
> = {
  eligibility: {
    label: "Eligibility",
    icon: Shield,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  evidence: {
    label: "Evidence",
    icon: FileText,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  documentation: {
    label: "Documentation",
    icon: BookOpen,
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  coding: {
    label: "Coding",
    icon: Hash,
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
};
const FAIL_REASONS = [
  "Service date incorrect",
  "Screening type mismatch",
  "CPT / LOINC code error",
  "Documentation missing",
  "Member not eligible",
  "Lookback period not met",
  "Provider credentials missing",
  "Highlight annotation invalid",
  "Duplicate record",
  "Other (specify in notes)",
];

/* ─────────────────────────────────────────────────────────────
   SUB-COMPONENTS
───────────────────────────────────────────────────────────── */
function SlaChip({ hours }: { hours: number }) {
  if (hours <= 0)
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
        Overdue
      </span>
    );
  if (hours <= 8)
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-red-600">
        <Clock className="w-3 h-3" />
        {hours}h
      </span>
    );
  if (hours <= 24)
    return (
      <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600">
        <Clock className="w-3 h-3" />
        {hours}h
      </span>
    );
  return (
    <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
      <Clock className="w-3 h-3" />
      {hours}h
    </span>
  );
}

function QueueCard({
  item,
  selected,
  onClick,
  onOpenPatient360,
}: {
  item: QueueCase;
  selected: boolean;
  onClick: () => void;
  onOpenPatient360: () => void;
}) {
  const ss = STATUS_STYLES[item.status];
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`w-full text-left px-3 py-3 border-b border-border transition-all hover:bg-muted/30 cursor-pointer ${
        selected
          ? "bg-primary/5 border-l-[3px] border-l-primary"
          : "border-l-[3px] border-l-transparent"
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-primary">
              {item.member.split(",")[0].trim().substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-foreground truncate leading-tight">
              {item.member}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenPatient360();
              }}
              className="inline-flex items-center gap-0.5 text-[10px] font-mono text-primary hover:underline cursor-pointer"
            >
              {item.caseRef.slice(-8)}
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {item.qaSampled && (
            <Star
              className="w-3 h-3 text-amber-500 fill-amber-400"
              title="QA Sampled"
            />
          )}
          <SlaChip hours={item.hoursRemaining} />
        </div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
            {item.measureCode}
          </span>
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${ss.badge}`}
          >
            {ss.label}
          </span>
        </div>
        {item.discrepancies > 0 && (
          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600">
            <AlertTriangle className="w-3 h-3" />
            {item.discrepancies}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">
          {item.abstractor.split(",")[0]}
        </span>
        <span className="text-[10px] text-muted-foreground">
          {item.submittedAt}
        </span>
      </div>
    </div>
  );
}

/* ── PDF Viewer Simulation ── */
function PDFPage({ page }: { page: number }) {
  if (page === 1)
    return (
      <div className="space-y-3 text-[11px] text-gray-800">
        <div className="text-center border-b border-gray-300 pb-3">
          <p className="font-bold text-sm text-gray-900">
            ADVANCED IMAGING CENTER
          </p>
          <p className="text-gray-500 text-[10px]">
            1200 Radiology Blvd · Boston, MA 02115 · Tel: (617) 555-0142 · NPI:
            1234567890
          </p>
        </div>
        <p className="text-center font-bold uppercase tracking-wider text-gray-800 text-[12px]">
          Mammography Screening Report
        </p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 border border-gray-200 rounded-md p-2.5 bg-gray-50">
          {[
            ["Patient Name", "Williams, Sandra B."],
            ["MRN", "MRN-567123"],
            ["Date of Birth", "03/15/1973"],
            ["Age at Exam", "51 years"],
            ["Gender", "Female"],
            ["Insurance", "Medicare M-567123"],
            ["Ordering Physician", "Dr. Patricia Chen, MD"],
            ["Accession #", "AIC-2024-08982"],
          ].map(([k, v]) => (
            <div key={k}>
              <span className="font-semibold text-gray-600">{k}: </span>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <div className="border border-gray-200 rounded-md p-2.5 space-y-1">
          <div>
            <span className="font-semibold text-gray-600">Order Date: </span>
            08/10/2024
          </div>
          <div>
            <span className="font-semibold text-gray-600">Procedure: </span>
            Screening Mammogram — Bilateral with Tomosynthesis
          </div>
          <div>
            <span className="font-semibold text-gray-600">CPT: </span>
            <span className="font-bold text-blue-700">77067</span>
          </div>
        </div>
        <p className="text-[10px] text-gray-400 text-center italic">
          — Continued on Page 2 —
        </p>
      </div>
    );
  if (page === 2)
    return (
      <div className="space-y-3 text-[11px] text-gray-800">
        <div className="text-center border-b border-gray-300 pb-2">
          <p className="font-bold text-gray-900 text-[12px]">
            Radiologist Interpretation — Page 2 of 3
          </p>
          <p className="text-gray-500 text-[10px]">
            Advanced Imaging Center · AIC-2024-08982
          </p>
        </div>
        {/* Key evidence — highlighted */}
        <div className="border border-yellow-300 rounded-md p-2.5 bg-yellow-50/50 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Exam Date:</span>
            <mark className="bg-yellow-200 px-1 rounded font-bold text-gray-900">
              August 15, 2024
            </mark>
            <span className="text-red-600 text-[9px] font-bold bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
              ⚠ Abstractor: 2025
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-600">Procedure:</span>
            <mark className="bg-yellow-200 px-1 rounded font-semibold text-gray-900">
              Screening Mammography, Bilateral
            </mark>
            <span className="font-bold text-blue-700">CPT 77067</span>
          </div>
          <div>
            <span className="font-semibold text-gray-600">Exam Time:</span>{" "}
            09:32 AM &nbsp;·&nbsp;{" "}
            <span className="font-semibold text-gray-600">Facility:</span>{" "}
            Advanced Imaging Center, Boston MA
          </div>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-1">
            Clinical Indication:
          </p>
          <p>
            Annual screening mammogram. No current breast complaints. Family
            history: maternal aunt — breast cancer at age 68.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-1">Technique:</p>
          <p>
            Standard bilateral two-view mammography (CC and MLO views).
            Tomosynthesis (3D) views obtained in addition to standard 2D.
          </p>
        </div>
        <div>
          <p className="font-semibold text-gray-700 mb-1">Findings:</p>
          <p>
            <span className="font-semibold">Breast Density:</span>{" "}
            Heterogeneously dense (Category C).
          </p>
          <p className="mt-1">
            <span className="font-semibold">Right Breast:</span> No suspicious
            masses, distortion, or microcalcifications.
          </p>
          <p className="mt-1">
            <span className="font-semibold">Left Breast:</span> Stable benign
            calcifications upper outer quadrant, unchanged. No suspicious
            findings.
          </p>
        </div>
        <div className="border-l-4 border-emerald-400 pl-3 bg-emerald-50 rounded-r-md p-2.5">
          <p className="font-bold text-gray-900 mb-1">Impression:</p>
          <mark className="bg-yellow-200 px-0.5 rounded font-semibold text-gray-900">
            BI-RADS Category 1: Negative.
          </mark>
          <p className="mt-1">
            No mammographic evidence of malignancy. Routine annual screening
            recommended.
          </p>
          <p className="mt-1 text-[10px] text-gray-600">
            ICD-10: <span className="font-bold text-gray-800">Z12.31</span> —
            Encounter for screening mammogram
          </p>
        </div>
      </div>
    );
  return (
    <div className="space-y-3 text-[11px] text-gray-800">
      <div className="text-center border-b border-gray-300 pb-2">
        <p className="font-bold text-gray-900 text-[12px]">
          Provider Attestation & Billing — Page 3 of 3
        </p>
        <p className="text-gray-500 text-[10px]">
          Advanced Imaging Center · AIC-2024-08982
        </p>
      </div>
      <div className="border border-gray-200 rounded-md p-2.5 space-y-1">
        {[
          ["Interpreting Radiologist", "Dr. Michael Torres, MD, FACR"],
          ["Radiologist NPI", "1234567890"],
          ["Board Certification", "ABR — Diagnostic Radiology, 2010"],
          ["Report Signed", "August 15, 2024 at 11:45 AM"],
        ].map(([k, v]) => (
          <div key={k}>
            <span className="font-semibold text-gray-600">{k}: </span>
            <span>{v}</span>
          </div>
        ))}
      </div>
      <div className="border border-gray-200 rounded-md p-2.5">
        <p className="font-semibold text-gray-700 mb-2">Billing Summary:</p>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left pb-1 text-gray-600">CPT</th>
              <th className="text-left pb-1 text-gray-600">Description</th>
              <th className="text-left pb-1 text-gray-600">Units</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="pt-1 font-bold text-blue-700">77067</td>
              <td className="pt-1">Screening Mammography, Bilateral</td>
              <td className="pt-1">1</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="border-t border-gray-300 pt-2 text-[10px] text-gray-500">
        <p>
          Electronic signature:{" "}
          <span className="font-semibold text-gray-700">
            Michael Torres, MD
          </span>
        </p>
        <p className="mt-0.5">
          Report status:{" "}
          <span className="font-bold text-emerald-700">FINAL</span>
        </p>
      </div>
    </div>
  );
}

/* ── Validation Checklist Item ── */
function CheckItem({
  item,
  onToggle,
  expanded,
  onExpand,
}: {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  expanded: boolean;
  onExpand: (id: string) => void;
}) {
  const cfg = CHECK_CFG[item.state];
  const Icon = cfg.icon;
  return (
    <div
      className={`border rounded-lg overflow-hidden ${item.state === "fail" ? "border-red-200" : item.state === "warn" ? "border-amber-200" : "border-border"}`}
    >
      <div
        className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition-colors ${item.state === "fail" ? "bg-red-50/50" : item.state === "warn" ? "bg-amber-50/50" : item.state === "pass" ? "bg-emerald-50/30" : "bg-card"}`}
        onClick={() => onExpand(item.id)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
          className="flex-shrink-0"
          title={`Status: ${cfg.label} — click to cycle`}
        >
          <Icon className={`w-4 h-4 ${cfg.color}`} />
        </button>
        <span className="flex-1 text-[12px] font-semibold text-foreground text-left leading-tight">
          {item.label}
        </span>
        {item.discrepancy && (
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        )}
        <ChevronDown
          className={`w-3.5 h-3.5 text-muted-foreground flex-shrink-0 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </div>
      {expanded && (
        <div
          className={`px-3 py-2.5 border-t space-y-2 text-[11px] ${item.state === "fail" ? "bg-red-50/20 border-red-100" : item.state === "warn" ? "bg-amber-50/20 border-amber-100" : "bg-muted/10 border-border"}`}
        >
          <p className="text-muted-foreground">{item.description}</p>
          {(item.abstractorValue || item.documentValue) && (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-card rounded p-1.5 border border-border">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Abstractor Entry
                </p>
                <p
                  className={`font-medium ${item.state === "fail" ? "text-red-700" : item.state === "warn" ? "text-amber-700" : "text-foreground"}`}
                >
                  {item.abstractorValue}
                </p>
              </div>
              <div className="bg-card rounded p-1.5 border border-border">
                <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                  Source Document
                </p>
                <p className="font-medium text-foreground">
                  {item.documentValue}
                </p>
              </div>
            </div>
          )}
          {item.discrepancy && (
            <div className="flex items-start gap-1.5 text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>{item.discrepancy}</span>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span className="italic">{item.ncqaRef}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function QAReview({
  onOpenPatient360,
}: {
  onOpenPatient360: () => void;
}) {
  const [selectedId, setSelectedId] = useState("qr-031");
  const [queueSearch, setQueueSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<
    "all" | "pending" | "in-review" | "returned"
  >("all");
  const [centerTab, setCenterTab] = useState<CenterTab>("evidence");
  const [pdfPage, setPdfPage] = useState(2);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [checklist, setChecklist] =
    useState<ChecklistItem[]>(INITIAL_CHECKLIST);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["ev2", "dc2"]),
  );
  const [decision, setDecision] = useState<Decision>(null);
  const [failReason, setFailReason] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [phiVisible, setPhiVisible] = useState(true);
  const [queueCollapsed, setQueueCollapsed] = useState(false);

  const selectedCase = QUEUE.find((q) => q.id === selectedId)!;
  const filteredQueue = QUEUE.filter((item) => {
    if (queueFilter !== "all" && item.status !== queueFilter) return false;
    if (queueSearch) {
      const q = queueSearch.toLowerCase();
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

  const toggleCheck = (id: string) => {
    const order: CheckState[] = ["pending", "pass", "warn", "fail", "na"];
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const idx = order.indexOf(item.state);
        return { ...item, state: order[(idx + 1) % order.length] };
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

  const byGroup = (g: ChecklistItem["group"]) =>
    checklist.filter((c) => c.group === g);
  const canSave =
    decision !== null &&
    ((decision !== "fail" && decision !== "revision") || !!failReason);

  const EVIDENCE_CARDS = [
    {
      label: "Service Date",
      abstractor: "Aug 15, 2025",
      document: "Aug 15, 2024",
      discrepancy: true,
      icon: Calendar,
    },
    {
      label: "Screening Type",
      abstractor: "Bilateral Mammogram",
      document: "Bilateral Mammogram",
      discrepancy: false,
      icon: Stethoscope,
    },
    {
      label: "CPT Code",
      abstractor: "77067",
      document: "77067",
      discrepancy: false,
      icon: Hash,
    },
    {
      label: "ICD-10 Diagnosis",
      abstractor: "Z12.31",
      document: "Z12.31",
      discrepancy: false,
      icon: Hash,
    },
    {
      label: "BI-RADS Result",
      abstractor: "BI-RADS 1 — Negative",
      document: "BI-RADS 1 — No abnormality",
      discrepancy: false,
      icon: ShieldCheck,
    },
    {
      label: "Ordering Physician",
      abstractor: "Dr. Torres, Michael MD",
      document: "Michael Torres, MD",
      discrepancy: false,
      icon: User,
    },
    {
      label: "Facility",
      abstractor: "Advanced Imaging Center",
      document: "Advanced Imaging Center, Boston",
      discrepancy: false,
      icon: FileText,
    },
    {
      label: "Report Status",
      abstractor: "Final",
      document: "FINAL",
      discrepancy: false,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ══════════════════════════════════════════════════════
          LEFT PANEL: QA QUEUE (Full Height)
      ══════════════════════════════════════════════════════ */}
      <div
        className={`flex-shrink-0 flex flex-col border-r border-border overflow-hidden bg-card transition-all duration-300 ${queueCollapsed ? "w-12" : "w-72"}`}
      >
        {queueCollapsed ? (
          // Collapsed state - vertical button
          <div className="flex flex-col items-center py-3 h-full">
            <button
              onClick={() => setQueueCollapsed(false)}
              className="inline-flex items-center gap-2 whitespace-nowrap p-2 rounded hover:bg-muted transition-colors"
              title="Expand queue"
            >
              <ChevronRight className="w-4 h-4 text-primary" />
            </button>
            <div className="mt-3 flex flex-col items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                {
                  QUEUE.filter(
                    (q) => q.status === "pending" || q.status === "in-review",
                  ).length
                }
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Panel header */}
            <div className="flex-shrink-0 px-3 pt-3 pb-2.5 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-primary" />
                  <span className="text-[12px] font-bold text-foreground">
                    QA Queue
                  </span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full border border-amber-200">
                    {
                      QUEUE.filter(
                        (q) =>
                          q.status === "pending" || q.status === "in-review",
                      ).length
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="text-[10px] text-muted-foreground">
                    {QUEUE.length} total
                  </span>
                  <button
                    onClick={() => setQueueCollapsed(true)}
                    className="inline-flex items-center gap-2 whitespace-nowrap p-1 rounded hover:bg-muted transition-colors"
                    title="Minimize queue"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                </div>
              </div>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search case, member, measure…"
                  value={queueSearch}
                  onChange={(e) => setQueueSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-1 flex-wrap">
                {(["all", "pending", "in-review", "returned"] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setQueueFilter(f)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${queueFilter === f ? "bg-primary text-white border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}
                    >
                      {f === "all"
                        ? "All"
                        : f === "in-review"
                          ? "In Review"
                          : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ),
                )}
              </div>
            </div>

            {/* Queue list */}
            <div className="flex-1 overflow-y-auto">
              {filteredQueue.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  selected={item.id === selectedId}
                  onClick={() => setSelectedId(item.id)}
                  onOpenPatient360={onOpenPatient360}
                />
              ))}
              {filteredQueue.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Search className="w-7 h-7 opacity-30 mb-2" />
                  <p className="text-[12px]">No cases found</p>
                </div>
              )}
            </div>

            {/* Queue stats footer */}
            <div className="flex-shrink-0 border-t border-border px-3 py-2.5">
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  {
                    label: "Pending",
                    count: QUEUE.filter((q) => q.status === "pending").length,
                    cls: "text-amber-600",
                  },
                  {
                    label: "Approved",
                    count: QUEUE.filter((q) => q.status === "approved").length,
                    cls: "text-emerald-600",
                  },
                  {
                    label: "At Risk",
                    count: QUEUE.filter(
                      (q) => q.hoursRemaining > 0 && q.hoursRemaining <= 8,
                    ).length,
                    cls: "text-red-600",
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <p className={`text-sm font-bold ${s.cls}`}>{s.count}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════
          RIGHT SIDE: MAIN CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* TOP HEADER — patient info + action buttons */}
        <div className="flex-shrink-0 border-b border-border">
          {/* Main header row */}
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Avatar + patient / case info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-primary">SW</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h1 className="text-sm font-bold text-foreground">
                    {phiVisible ? CASE_DETAIL.member : "████████████"}
                  </h1>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {phiVisible ? CASE_DETAIL.memberId : "██████████"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                      decision === "pass"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : decision === "fail"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : decision === "revision"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : STATUS_STYLES[selectedCase.status].badge
                    }`}
                  >
                    {decision === "pass"
                      ? "QA Passed"
                      : decision === "fail"
                        ? "QA Failed"
                        : decision === "revision"
                          ? "Revision Requested"
                          : STATUS_STYLES[selectedCase.status].label}
                  </span>
                  {selectedCase.qaSampled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400" />
                      QA Sample
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                      {CASE_DETAIL.measureCode}
                    </span>
                    {CASE_DETAIL.measureName}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {CASE_DETAIL.abstractor}
                    </span>{" "}
                    · Submitted {CASE_DETAIL.submittedAt}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    {CASE_DETAIL.measurementYear} · {CASE_DETAIL.productLine}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Due {CASE_DETAIL.dueBy}
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setPhiVisible((v) => !v)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                {phiVisible ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                {phiVisible ? "Mask PHI" : "Show PHI"}
              </button>
              <div className="w-px h-5 bg-border" />
              <button
                onClick={() => {
                  setDecision("revision");
                  setFailReason("");
                  setReviewNotes("");
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${decision === "revision" ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Request Revision
              </button>
              <button
                onClick={() => {
                  setDecision("fail");
                  setFailReason("");
                  setReviewNotes("");
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${decision === "fail" ? "bg-red-600 text-white border-red-600 shadow-sm" : "border-red-300 text-red-700 hover:bg-red-50"}`}
              >
                <XCircle className="w-3.5 h-3.5" />
                QA Fail
              </button>
              <button
                onClick={() => {
                  setDecision("pass");
                  setFailReason("");
                  setReviewNotes("");
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${decision === "pass" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                QA Pass
              </button>
            </div>
          </div>

          {/* Fail/Revision reason bar */}
          {(decision === "fail" || decision === "revision") && (
            <div
              className={`flex items-center gap-3 px-4 py-2.5 border-t ${decision === "fail" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}
            >
              <AlertTriangle
                className={`w-4 h-4 flex-shrink-0 ${decision === "fail" ? "text-red-500" : "text-amber-500"}`}
              />
              <span
                className={`text-[11px] font-bold whitespace-nowrap ${decision === "fail" ? "text-red-700" : "text-amber-700"}`}
              >
                {decision === "fail"
                  ? "Failure reason required:"
                  : "Revision reason required:"}
              </span>
              <select
                value={failReason}
                onChange={(e) => setFailReason(e.target.value)}
                className={`px-3 py-1.5 text-[11px] border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 ${decision === "fail" ? "border-red-300 focus:ring-red-200" : "border-amber-300 focus:ring-amber-200"}`}
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
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Additional notes for the abstractor…"
                className={`flex-1 px-3 py-1.5 text-[11px] border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${decision === "fail" ? "border-red-300 focus:ring-red-200" : "border-amber-300 focus:ring-amber-200"}`}
              />
              <button
                onClick={() => {
                  setDecision(null);
                  setFailReason("");
                  setReviewNotes("");
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* MIDDLE CONTENT ROW */}
        <div className="flex-1 flex overflow-hidden">
          {/* ── CENTER PANEL: EVIDENCE VIEWER ── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            {/* Center tab strip */}
            <div className="flex-shrink-0 border-b border-border bg-card flex items-center px-4">
              {[
                {
                  id: "evidence" as CenterTab,
                  label: "Evidence Viewer",
                  icon: FileText,
                },
                {
                  id: "comparison" as CenterTab,
                  label: "Field Comparison",
                  icon: Layers,
                },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCenterTab(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${centerTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="flex-1" />
              {selectedCase.discrepancies > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 pr-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {selectedCase.discrepancies} discrepanc
                  {selectedCase.discrepancies === 1 ? "y" : "ies"} flagged
                </div>
              )}
            </div>

            {/* Center content */}
            <div className="flex-1 overflow-hidden">
              {centerTab === "evidence" ? (
                /* SPLIT: PDF viewer + Extracted evidence */
                <div className="flex h-full overflow-hidden">
                  {/* PDF Viewer */}
                  <div
                    className="flex flex-col border-r border-border"
                    style={{ width: "57%" }}
                  >
                    {/* PDF toolbar */}
                    <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 border-b border-border bg-muted/20">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-[11px] font-semibold text-foreground truncate">
                          Mammogram_567123_20240815.pdf
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
                        <button className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded hover:bg-muted transition-colors">
                          <Download className="w-3 h-3" />
                          Export
                        </button>
                      </div>
                    </div>

                    {/* Document area */}
                    <div className="flex-1 overflow-auto bg-slate-200/80 p-4">
                      <div
                        className="bg-white shadow-lg rounded mx-auto p-6 transition-all origin-top"
                        style={{
                          maxWidth: 500,
                          transform: `scale(${pdfZoom / 100})`,
                          transformOrigin: "top center",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3 text-[9px] text-gray-400 uppercase tracking-widest">
                          <span>Page {pdfPage} of 3</span>
                          <span className="font-semibold">
                            {
                              [
                                "Patient Information",
                                "Radiologist Report",
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
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3].map((p) => (
                          <button
                            key={p}
                            onClick={() => setPdfPage(p)}
                            className={`w-7 h-7 rounded-lg text-[11px] font-bold transition-colors ${pdfPage === p ? "bg-primary text-white" : "border border-border text-muted-foreground hover:bg-muted"}`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => setPdfPage((p) => Math.min(3, p + 1))}
                        disabled={pdfPage === 3}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Extracted Evidence */}
                  <div
                    className="flex flex-col overflow-hidden bg-background"
                    style={{ width: "43%" }}
                  >
                    <div className="flex-shrink-0 px-4 py-2.5 border-b border-border">
                      <h3 className="text-[12px] font-bold text-foreground flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-primary" />
                        Extracted Evidence
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Auto-extracted from source · AI-verified · Abstractor
                        vs. Document
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {EVIDENCE_CARDS.map((ev) => {
                        const Icon = ev.icon;
                        return (
                          <div
                            key={ev.label}
                            className={`rounded-lg border p-2.5 ${ev.discrepancy ? "border-red-200 bg-red-50/30" : "border-border bg-card"}`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Icon
                                  className={`w-3.5 h-3.5 ${ev.discrepancy ? "text-red-500" : "text-muted-foreground"}`}
                                />
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wider ${ev.discrepancy ? "text-red-700" : "text-muted-foreground"}`}
                                >
                                  {ev.label}
                                </span>
                              </div>
                              {ev.discrepancy ? (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-red-600 bg-red-100 border border-red-200 px-1.5 py-0.5 rounded-full">
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                  Discrepancy
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                  <Check className="w-2.5 h-2.5" />
                                  Match
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <div className="bg-background rounded p-1.5 border border-border">
                                <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Abstractor
                                </p>
                                <p
                                  className={`text-[11px] font-semibold mt-0.5 ${ev.discrepancy ? "text-red-700" : "text-foreground"}`}
                                >
                                  {ev.abstractor}
                                </p>
                              </div>
                              <div className="bg-background rounded p-1.5 border border-border">
                                <p className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Source Doc
                                </p>
                                <p className="text-[11px] font-semibold text-foreground mt-0.5">
                                  {ev.document}
                                </p>
                              </div>
                            </div>
                            {ev.discrepancy && (
                              <p className="text-[10px] text-red-600 mt-1.5 flex items-start gap-1">
                                <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                Year mismatch: abstractor entered 2025, document
                                shows 2024. Requires correction before closure.
                              </p>
                            )}
                          </div>
                        );
                      })}

                      {/* AI Insight */}
                      <div className="border border-primary/20 rounded-lg p-2.5 bg-primary/5">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-primary" />
                          <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                            AI Analysis
                          </span>
                          <span className="text-[9px] text-muted-foreground ml-auto">
                            Confidence: 94%
                          </span>
                        </div>
                        <p className="text-[11px] text-foreground">
                          Detected a{" "}
                          <span className="font-bold text-red-600">
                            year discrepancy
                          </span>{" "}
                          in the service date field. All other extracted fields
                          match the source document. Compliance status is
                          unaffected — member remains numerator-compliant under
                          either date.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* FIELD COMPARISON TABLE */
                <div className="flex-1 overflow-auto p-5">
                  <div className="bg-card border border-border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                      <div>
                        <h3 className="text-[13px] font-bold text-foreground">
                          Abstraction vs. Source Document Comparison
                        </h3>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {CASE_DETAIL.caseRef} · {CASE_DETAIL.measureCode} ·
                          Abstractor: {CASE_DETAIL.abstractor}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3 h-3" />1 discrepancy
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" />7 matches
                        </span>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-muted/40 border-b border-border">
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
                              className={`hover:bg-muted/20 transition-colors ${row.match === "discrepancy" ? "bg-red-50/30" : ""}`}
                            >
                              <td className="px-5 py-3 text-[12px] font-semibold text-foreground">
                                {row.field}
                              </td>
                              <td
                                className={`px-5 py-3 text-[12px] ${row.match === "discrepancy" ? "text-red-700 font-bold" : "text-foreground"}`}
                              >
                                {row.abstractorValue}
                                {row.match === "discrepancy" && (
                                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 inline ml-1.5" />
                                )}
                              </td>
                              <td className="px-5 py-3 text-[12px] text-foreground">
                                {row.documentValue}
                              </td>
                              <td className="px-5 py-3 text-[12px]">
                                <span className="inline-flex items-center gap-1.5 text-foreground">
                                  <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />
                                  {row.aiValue}
                                </span>
                              </td>
                              <td className="px-5 py-3">
                                {row.match === "discrepancy" && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
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

          {/* ── RIGHT PANEL: VALIDATION CHECKLIST + DECISION ── */}
          <div className="w-80 flex-shrink-0 flex flex-col border-l border-border overflow-hidden bg-card">
            {/* Panel header */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-[12px] font-bold text-foreground">
                    Validation Checklist
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-medium">
                  NCQA-aligned
                </span>
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${(passCount / totalCount) * 100}%` }}
                  />
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${(warnCount / totalCount) * 100}%` }}
                  />
                  <div
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${(failCount / totalCount) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] font-bold text-foreground">
                  {passCount}/{totalCount}
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {passCount} Pass
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  {warnCount} Warn
                </span>
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {failCount} Fail
                </span>
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <Info className="w-3 h-3" />
                  Click to cycle state
                </span>
              </div>
            </div>

            {/* Checklist groups (scrollable) */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {(
                ["eligibility", "evidence", "documentation", "coding"] as const
              ).map((group) => {
                const meta = GROUP_META[group];
                const Icon = meta.icon;
                const items = byGroup(group);
                const gPass = items.filter((i) => i.state === "pass").length;
                const gFail = items.filter((i) => i.state === "fail").length;
                const gWarn = items.filter((i) => i.state === "warn").length;
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md ${meta.bg}`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${meta.color}`} />
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${meta.color}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px]">
                        {gFail > 0 && (
                          <span className="text-red-600 font-bold">
                            {gFail} fail
                          </span>
                        )}
                        {gWarn > 0 && (
                          <span className="text-amber-600 font-bold">
                            {gWarn} warn
                          </span>
                        )}
                        <span className="text-emerald-600 font-bold">
                          {gPass} pass
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <CheckItem
                          key={item.id}
                          item={item}
                          onToggle={toggleCheck}
                          expanded={expanded.has(item.id)}
                          onExpand={toggleExpand}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Decision section (pinned) */}
            <div className="flex-shrink-0 border-t border-border p-3 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                QA Decision
              </p>

              {(failCount > 0 || warnCount > 0) && !decision && (
                <div className="flex items-start gap-2 p-2 rounded-lg border border-amber-200 bg-amber-50">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-700">
                    {failCount > 0
                      ? `${failCount} check${failCount > 1 ? "s" : ""} failed. `
                      : ""}
                    {warnCount > 0
                      ? `${warnCount} item${warnCount > 1 ? "s" : ""} need attention.`
                      : ""}
                  </p>
                </div>
              )}

              {decision && (
                <div
                  className={`flex items-center gap-2 p-2.5 rounded-lg border ${decision === "pass" ? "border-emerald-200 bg-emerald-50" : decision === "fail" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
                >
                  {decision === "pass" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  {decision === "fail" && (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  {decision === "revision" && (
                    <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <p
                    className={`text-[11px] font-bold leading-tight ${decision === "pass" ? "text-emerald-700" : decision === "fail" ? "text-red-700" : "text-amber-700"}`}
                  >
                    {decision === "pass"
                      ? "QA Pass — Ready for numerator closure"
                      : ""}
                    {decision === "fail"
                      ? "QA Fail — Abstraction rejected"
                      : ""}
                    {decision === "revision"
                      ? "Revision Requested — Returned to abstractor"
                      : ""}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setDecision("pass")}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${decision === "pass" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pass
                </button>
                <button
                  onClick={() => {
                    setDecision("revision");
                    setFailReason("");
                    setReviewNotes("");
                  }}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${decision === "revision" ? "bg-amber-500 text-white border-amber-500 shadow-sm" : "border-amber-300 text-amber-700 hover:bg-amber-50"}`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Revise
                </button>
                <button
                  onClick={() => {
                    setDecision("fail");
                    setFailReason("");
                    setReviewNotes("");
                  }}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${decision === "fail" ? "bg-red-600 text-white border-red-600 shadow-sm" : "border-red-300 text-red-700 hover:bg-red-50"}`}
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Fail
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t border-border px-5 py-2.5 flex items-center justify-between gap-4 bg-card">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-primary">SC</span>
              </div>
              <span>
                Reviewer:{" "}
                <span className="font-semibold text-foreground">
                  {CASE_DETAIL.reviewer}
                </span>
              </span>
            </div>
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Review started {CASE_DETAIL.reviewStarted}
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              NCQA MY2025 · Hybrid Methodology · HEDIS®
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!canSave && decision && (
              <span className="text-[10px] text-red-600 font-semibold">
                Reason required to save
              </span>
            )}
            <button
              disabled={!canSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-lg transition-all bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Save Decision
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
