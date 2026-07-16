import { useState, useEffect, useMemo, useRef } from "react";
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
  User,
  Stethoscope,
  Calendar,
  ChevronUp,
  Layers,
  UserCheck2,
  Info,
  Save,
  Plus,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";
import {
  useGetApiHedisQaReviewEvaluationid,
  useGetApiHedisEvaluationsId,
  usePostApiHedisAssignAbstractor,
  usePostApiHedisAddMissingEvidence,
  usePostApiHedisPatientQaStage,
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
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
type Decision = null | "qaPass" | "qaFail" | "requestRevision";
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

/* Helper for icons in Evidence Cards */
const getIconForField = (field: string): ElementType => {
  const lower = field.toLowerCase();
  if (lower.includes("date")) return Calendar;
  if (lower.includes("type") || lower.includes("screening")) return Stethoscope;
  if (lower.includes("cpt") || lower.includes("code")) return Hash;
  if (lower.includes("icd")) return Hash;
  if (lower.includes("result") || lower.includes("bi-rads")) return ShieldCheck;
  if (lower.includes("physician") || lower.includes("provider")) return User;
  if (lower.includes("facility")) return FileText;
  return CheckCircle2;
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

/* ══════════════════════════════════════════════════════════════
   ADD MISSING EVIDENCE MODAL (QA Version)
══════════════════════════════════════════════════════════════ */
function AddEvidenceModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isSubmitting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  isSubmitting: boolean;
}) {
  if (!isOpen) return null;

  const updateField = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
            <Plus className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Add Missing Evidence</h3>
            <p className="text-[11px] text-muted-foreground">
              Manual timeline entry for QA review
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
              Evidence Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.eventTitle}
              onChange={(e) => updateField("eventTitle", e.target.value)}
              placeholder="e.g. Home BP Reading - 138/82 mmHg"
              className="form-input w-full"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-muted-foreground mb-1">
              Summary / Clinical Context
            </label>
            <textarea
              value={formData.summary}
              onChange={(e) => updateField("summary", e.target.value)}
              rows={4}
              placeholder="Patient reported BP reading from home monitor on Jul 22..."
              className="form-input w-full resize-y min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                Event Date
              </label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => updateField("eventDate", e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-muted-foreground mb-1">
                Document Type
              </label>
              <select
                value={formData.documentType}
                onChange={(e) => updateField("documentType", e.target.value)}
                className="form-input w-full"
              >
                <option value="External Document">External Document</option>
                <option value="Patient Reported">Patient Reported</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Office Note">Office Note</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-semibold border border-border rounded-xl hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={!formData.eventTitle.trim() || isSubmitting}
            className="flex-1 py-2.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <>Adding to Timeline...</>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Add Evidence
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function QAReview({
  patientId,
  patientData,
  onOpenPatient360,
  onBack,
}: {
  patientId?: string;
  patientData?: any;
  onOpenPatient360: () => void;
  onBack: () => void;
}) {
  console.log(" QAReview component mounted with patientId:", patientId);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [queueSearch, setQueueSearch] = useState("");
  const [queueFilter, setQueueFilter] = useState<
    "all" | "pending" | "in-review" | "returned"
  >("all");
  const [centerTab, setCenterTab] = useState<CenterTab>("evidence");
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfPage, setPdfPage] = useState(1); // already exists
  const [pdfZoom, setPdfZoom] = useState(100);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(["ev2", "dc2"])
  );
  const [decision, setDecision] = useState<Decision>(null);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [reviewNotes, setReviewNotes] = useState("");
  const [phiVisible, setPhiVisible] = useState(true);
  const [queueCollapsed, setQueueCollapsed] = useState(false);
  const [selectedMeasureCode, setSelectedMeasureCode] = useState<string | null>(
    null
  );
  const [textRenderKey, setTextRenderKey] = useState(0);
  // New state for multi-measure decisions
  const [measureDecisions, setMeasureDecisions] = useState<
    Record<
      string,
      {
        qaStatus: Decision;
        reasons: string[];
        notes: string;
      }
    >
  >({});
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);

  const [showHeaderModal, setShowHeaderModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<
    "qaPass" | "qaFail" | "requestRevision" | null
  >(null);
  const [headerReason, setHeaderReason] = useState<string>("");
  const [headerNote, setHeaderNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Array of individual word tokens from the highlight phrase.
  // PDF.js splits text into one span per word, so we must match token-by-token.
  // === HIGHLIGHT STATE ===
  // === HIGHLIGHT STATE (keep as is) ===
  const [currentHighlightText, setCurrentHighlightText] = useState<
    string | null
  >(null);
  const [currentHighlightWords, setCurrentHighlightWords] = useState<string[]>(
    []
  );

  const HIGHLIGHT_STYLE: React.CSSProperties = {
    backgroundColor: "#fef08c",
    color: "#1f2937",
    padding: "1px 4px",
    borderRadius: "3px",
    boxShadow: "0 0 0 2px rgba(250, 204, 21, 0.5)",
    fontWeight: "600",
  };

  // === BEST TEXT RENDERER FOR MEDICAL PDFs ===
  // === IMPROVED TEXT RENDERER (Best for this PDF) ===
  const textRenderer = useMemo(() => {
    if (!currentHighlightWords.length) {
      return undefined; // let react-pdf use default rendering when nothing to highlight
    }

    // Build a single case-insensitive regex from all highlight words,
    // longest first so "Enrollment:" doesn't get shadowed by "Enrollment".
    const escaped = [...currentHighlightWords]
      .filter((w) => w.trim().length > 1)
      .sort((a, b) => b.length - a.length)
      .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));

    if (escaped.length === 0) return undefined;

    const pattern = new RegExp(`(${escaped.join("|")})`, "gi");

    return (textItem: any) => {
      const str = textItem?.str ?? "";
      if (!str.trim()) return str;

      if (!pattern.test(str)) return str;
      pattern.lastIndex = 0; // reset after .test()

      const parts = str.split(pattern);
      return (
        <>
          {parts.map((part: string, i: number) =>
            pattern.test(part) && part.length > 0 ? (
              <mark key={i} style={HIGHLIGHT_STYLE}>
                {part}
              </mark>
            ) : (
              <span key={i}>{part}</span>
            )
          )}
        </>
      );
    };
  }, [currentHighlightWords]);

  // QA Stage Update Mutation (Header buttons)
  const { mutateAsync: updateQaStage, isPending: isQaStageUpdating } =
    usePostApiHedisPatientQaStage();

  // === FETCH EVALUATIONS ===
  const { data: evaluationsData, isLoading: evalLoading } =
    useGetApiHedisEvaluationsId(patientId || "", {
      query: { enabled: !!patientId },
    });

  // Correct mapping from actual response structure
  const allEvaluations = useMemo(() => {
    return (
      evaluationsData?.evaluations || evaluationsData?.data?.evaluations || []
    );
  }, [evaluationsData]);

  // Filter out "Not Eligible" measures for dropdown
  const eligibleMeasures = useMemo(() => {
    return allEvaluations.filter((m: any) => {
      const status = (m.status || "").toLowerCase();
      // return m.eligible === true && status !== "not eligible";
      return status !== "error";
    });
  }, [allEvaluations]);

  // === FETCH QA REVIEW DETAILS (AI Analysis) ===
  const {
    data: reviewData,
    isLoading: reviewLoading,
    error: reviewError,
  } = useGetApiHedisQaReviewEvaluationid(selectedId || "", {
    query: {
      enabled: !!selectedId,
    },
  });

  // Derived states from API (fallback to mock for now if needed)
  const detail = reviewData?.data ?? reviewData ?? null;
  const pdfUrl = detail?.pdfUrl || null;

  // === DROPDOWN OPTIONS ===
  const measureOptions = useMemo(() => {
    if (eligibleMeasures.length === 0) {
      return [
        {
          code: selectedMeasureCode || "N/A",
          label: `${selectedMeasureCode || "No Measure"} - No Eligible Measures`,
        },
      ];
    }

    return eligibleMeasures.map((m: any) => ({
      code: m.measure_code,
      label: `${m.measure_code} - ${m.status || "Gap"}`,
      full: m,
    }));
  }, [eligibleMeasures, selectedMeasureCode]);

  // Auto-select first eligible measure
  useEffect(() => {
    if (measureOptions.length > 0 && !selectedMeasureCode) {
      const firstMeasure = measureOptions[0];
      setSelectedMeasureCode(firstMeasure.code);
      if (firstMeasure.full?.id) {
        const mid = firstMeasure.full.id;
        setSelectedId(mid);

        // Sync initial state if exists
        if (measureDecisions[mid]) {
          setDecision(measureDecisions[mid].qaStatus);
          setSelectedReasons(measureDecisions[mid].reasons);
          setReviewNotes(measureDecisions[mid].notes);
        } else {
          setDecision(null);
          setSelectedReasons([]);
          setReviewNotes("");
        }
      }
    }
  }, [measureOptions, selectedMeasureCode, measureDecisions]);

  // Handle measure selection change
  const handleMeasureChange = (code: string) => {
    setSelectedMeasureCode(code);
    // Clear stale highlights from the previous measure
    setCurrentHighlightText(null);
    setCurrentHighlightWords([]);
    const measure = eligibleMeasures.find((m: any) => m.measure_code === code);
    if (measure?.id) {
      const mid = measure.id;
      setSelectedId(mid);
      setPdfPage(1);

      // Restore previously made decision for this measure
      const prev = measureDecisions[mid];
      if (prev) {
        setDecision(prev.qaStatus);
        setSelectedReasons(prev.reasons);
        setReviewNotes(prev.notes);
      } else {
        setDecision(null);
        setSelectedReasons([]);
        setReviewNotes("");
      }
    }
  };

  // Sync current measure decision to global state
  const syncMeasureDecision = (
    newStatus: Decision,
    newReasons: string[],
    newNotes: string
  ) => {
    if (!selectedId) return;
    setMeasureDecisions((prev) => ({
      ...prev,
      [selectedId]: {
        qaStatus: newStatus,
        reasons: newReasons,
        notes: newNotes,
      },
    }));
  };

  const handleDecisionClick = (action: Decision) => {
    const finalDecision = decision === action ? null : action;
    setDecision(finalDecision);
    if (finalDecision !== "qaFail" && finalDecision !== "requestRevision") {
      setSelectedReasons([]);
    }
    syncMeasureDecision(finalDecision, selectedReasons, reviewNotes);
  };

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) => {
      const next = prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason];
      syncMeasureDecision(decision, next, reviewNotes);
      return next;
    });
  };

  const handleNotesChange = (notes: string) => {
    setReviewNotes(notes);
    syncMeasureDecision(decision, selectedReasons, notes);
  };

  // VALIDATION CHECKLIST — Pure API Mapping (No Mock Fallback)
  const apiChecklist = useMemo(() => {
    if (!detail?.validationChecklist) return [];

    const mapped: ChecklistItem[] = [];
    const groups = [
      "eligibility",
      "evidence",
      "documentation",
      "coding",
    ] as const;

    groups.forEach((group) => {
      const items = detail.validationChecklist[group] || [];
      items.forEach((item: any, idx: number) => {
        mapped.push({
          id: `${group}-${idx}`,
          group,
          label: item.rule || "Validation Rule",
          description: item.message || "",
          ncqaRef: item.ncqaRef || "HEDIS Spec",
          abstractorValue: item.abstractorEntry || "N/A",
          documentValue: item.sourceDocument || "Not Found",
          state: (item.status?.toLowerCase() as CheckState) || "pending",
          discrepancy: item.status === "FAIL" ? item.message : undefined,
        });
      });
    });

    return mapped;
  }, [detail]);

  // Sync API data
  useEffect(() => {
    setChecklist(apiChecklist);
  }, [apiChecklist]);

  // 2. EXTRACTED EVIDENCE CARDS
  const EVIDENCE_CARDS = useMemo(() => {
    if (!detail?.extractedEvidence?.length) return [];

    return detail.extractedEvidence.map((ev: any) => ({
      label: ev.field,
      abstractor: ev.abstractorValue || "N/A",
      document: ev.sourceDocumentValue || "Not Found",
      discrepancy:
        ev.status === "MISSING_IN_SOURCE" ||
        ev.status?.includes("DISCREPANCY") ||
        ev.status === "FAIL"
          ? ev.reason
          : undefined,
      icon: getIconForField(ev.field),
      highlightText: ev.highlightText,
      highlightWords: ev.highlightWords, // ← ADD THIS, was missing
      pageNumber: ev.pageNumber,
    }));
  }, [detail]);

  // 3. FIELD COMPARISON
  const COMPARISON_FIELDS: ComparisonField[] = useMemo(() => {
    if (!detail?.extractedEvidence?.length) return [];

    return detail.extractedEvidence.map((item: any) => ({
      field: item.field,
      abstractorValue: item.abstractorValue || "",
      documentValue: item.sourceDocumentValue || "",
      aiValue: item.aiValue || item.abstractorValue || "",
      match:
        item.status === "MISSING_IN_SOURCE" ||
        item.status?.includes("DISCREPANCY") ||
        item.status === "FAIL"
          ? "discrepancy"
          : "match",
    }));
  }, [detail]);

  // Auto-scroll to the first highlighted <mark> after the page renders
  useEffect(() => {
    if (!currentHighlightWords.length) return;
    // Delay slightly so react-pdf finishes painting the text layer
    const timer = setTimeout(() => {
      const mark = document.querySelector<HTMLElement>(
        ".react-pdf__Page__textContent mark"
      );
      if (mark) {
        mark.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 450);
    return () => clearTimeout(timer);
  }, [pdfPage, currentHighlightWords]);

  // PDF Load Success
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    // setPdfPage(1); // Removed to prevent resetting on every load if we have a target page
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF Load Error:", error);
  };

  const passCount = checklist.filter((c) => c.state === "pass").length;
  const failCount = checklist.filter((c) => c.state === "fail").length;
  const warnCount = checklist.filter((c) => c.state === "warn").length;
  const totalCount = checklist.length;

  // Derive selectedCase from the current selection and patientData
  const selectedCase = useMemo(() => {
    const currentMeasure = eligibleMeasures.find(
      (m: any) => m.id === selectedId
    );
    return {
      id: selectedId || "",
      status: (currentMeasure?.status?.toLowerCase() ||
        "pending") as QueueStatus,
      qaSampled: false,
      discrepancies: failCount,
      caseRef: currentMeasure?.measure_code || "N/A",
      member: patientData?.patientName || "Unknown Patient",
      memberId: patientData?.mrn || patientId || "",
      measureCode: currentMeasure?.measure_code || "N/A",
      measureName: currentMeasure?.measure_name || "Unknown Measure",
      abstractor: "System",
      submittedAt: "",
      dueBy: "TBD",
      hoursRemaining: 24,
      priority: "medium" as Priority,
    };
  }, [selectedId, eligibleMeasures, patientData, patientId, failCount]);

  // Auto-select first measure if none selected
  useEffect(() => {
    if (eligibleMeasures.length > 0 && !selectedId) {
      setSelectedId(eligibleMeasures[0].id);
    }
  }, [eligibleMeasures, selectedId]);

  const toggleCheck = (id: string) => {
    const order: CheckState[] = ["pending", "pass", "warn", "fail", "na"];
    setChecklist((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const idx = order.indexOf(item.state);
        return { ...item, state: order[(idx + 1) % order.length] };
      })
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
  const canSave = Object.keys(measureDecisions).length > 0;

  // === ADD EVIDENCE STATE ===
  const queryClient = useQueryClient();
  const addMissingEvidenceMutation = usePostApiHedisAddMissingEvidence();

  const [showAddEvidenceModal, setShowAddEvidenceModal] = useState(false);
  const [addEvidenceForm, setAddEvidenceForm] = useState({
    eventTitle: "",
    summary: "",
    eventDate: new Date().toISOString().split("T")[0],
    documentType: "External Document",
  });

  const handleAddMissingEvidence = async () => {
    if (!addEvidenceForm.eventTitle.trim()) {
      toast.error("Evidence title is required");
      return;
    }

    try {
      await addMissingEvidenceMutation.mutateAsync({
        data: {
          patientId: patientId!,
          chartId: patientData?.chart_uuid || "", // or selected measure's chart if available
          eventTitle: addEvidenceForm.eventTitle,
          summary: addEvidenceForm.summary,
          eventDate: addEvidenceForm.eventDate,
          documentType: addEvidenceForm.documentType,
        },
      });

      toast.success("Missing evidence added successfully to timeline!");

      // Close modal & reset
      setShowAddEvidenceModal(false);
      setAddEvidenceForm({
        eventTitle: "",
        summary: "",
        eventDate: new Date().toISOString().split("T")[0],
        documentType: "External Document",
      });
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Failed to add missing evidence"
      );
    }
  };

  // ========== HEADER QA STAGE ACTION HANDLER ==========
const handleHeaderQaAction = async () => {
  if (!patientId || !pendingAction) {
    toast.error("No patient selected or action not specified");
    return;
  }

  if ((pendingAction === "qaFail" || pendingAction === "requestRevision") && !headerReason) {
    toast.error("Please select a reason");
    return;
  }

  const actionMap: Record<"qaPass" | "qaFail" | "requestRevision", string> = {
    qaPass: "QA_PASS",
    qaFail: "QA_FAIL",
    requestRevision: "REQUEST_REVISION",
  };

  setIsSubmitting(true);
  try {
    await updateQaStage({
      data: {
        patientId,
        action: actionMap[pendingAction] as any,
        reason: headerReason || undefined,
        additionalNotes: headerNote || undefined,
      },
    });

    toast.success(
      pendingAction === "qaPass"
        ? "QA Passed successfully!"
        : pendingAction === "qaFail"
          ? "QA Failed & returned"
          : "Revision requested successfully!"
    );

    // Reset & close
    setShowHeaderModal(false);
    setPendingAction(null);
    setHeaderReason("");
    setHeaderNote("");

    // Optional: refresh data
    queryClient.invalidateQueries({ queryKey: ["qa-review", patientId] });
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Failed to update QA stage");
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* ══════════════════════════════════════════════════════
          RIGHT SIDE: MAIN CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* TOP HEADER — patient info + action buttons */}
        <div className="flex-shrink-0 border-b border-border">
          {/* Main header row */}
          <div className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={onBack}
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-[11px] font-semibold whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Queue
            </button>
            {/* Avatar + patient / case info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-primary">
                  {(phiVisible
                    ? patientData?.patientName || selectedCase.member
                    : "██"
                  )
                    ?.split(",")[0]
                    ?.trim()
                    .substring(0, 2)
                    .toUpperCase() || "JD"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <h1 className="text-sm font-bold text-foreground">
                    {phiVisible
                      ? patientData?.patientName || selectedCase.member
                      : "████████████"}
                  </h1>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {phiVisible
                      ? patientData?.mrn || selectedCase.memberId
                      : "██████████"}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold ${
                      decision === "qaPass"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : decision === "qaFail"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : decision === "requestRevision"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : STATUS_STYLES[selectedCase.status as QueueStatus]
                                ?.badge ||
                              "bg-amber-50 text-amber-700 border-amber-200"
                    }`}
                  >
                    {decision === "qaPass"
                      ? "QA Passed"
                      : decision === "qaFail"
                        ? "QA Failed"
                        : decision === "requestRevision"
                          ? "Revision Requested"
                          : STATUS_STYLES[selectedCase.status as QueueStatus]
                              ?.label || "Pending QA"}
                  </span>
                  {selectedCase.qaSampled && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-amber-400" />
                      QA Sample
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-[11px] text-muted-foreground">
                    DOB: {phiVisible ? patientData?.dob || "—" : "██/██/████"}
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    Plan:{" "}
                    <span className="font-semibold text-foreground">
                      {patientData?.plan || "—"}
                    </span>
                  </span>
                  <span className="text-muted-foreground/40">·</span>
                  <span className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {selectedCase.abstractor}
                    </span>{" "}
                    · Submitted {selectedCase.submittedAt || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* MEASURE SELECTION DROPDOWN - Placed before action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 border border-border rounded-lg px-3 py-1.5 bg-card">
                <Layers className="w-3.5 h-3.5 text-primary" />
                <select
                  value={selectedMeasureCode || ""}
                  onChange={(e) => handleMeasureChange(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-bold text-primary focus:ring-0 cursor-pointer hover:underline p-0 min-w-[140px]"
                >
                  {measureOptions.map((opt: any) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowAddEvidenceModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold border border-emerald-300 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Evidence
              </button>
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
      setPendingAction("requestRevision");
      setHeaderReason("");
      setHeaderNote("");
      setShowHeaderModal(true);
    }}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
      decision === "requestRevision"
        ? "bg-amber-500 text-white border-amber-500"
        : "border-amber-300 text-amber-700 hover:bg-amber-50"
    }`}
  >
    <RotateCcw className="w-3.5 h-3.5" /> Request Revision
  </button>

  <button
    onClick={() => {
      setPendingAction("qaFail");
      setHeaderReason("");
      setHeaderNote("");
      setShowHeaderModal(true);
    }}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
      decision === "qaFail"
        ? "bg-red-600 text-white border-red-600"
        : "border-red-300 text-red-700 hover:bg-red-50"
    }`}
  >
    <XCircle className="w-3.5 h-3.5" /> QA Fail
  </button>

  <button
    onClick={() => {
      setPendingAction("qaPass");
      setHeaderReason("");
      setHeaderNote("");
      setShowHeaderModal(true);
    }}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
      decision === "qaPass"
        ? "bg-emerald-600 text-white border-emerald-600"
        : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
    }`}
  >
    <CheckCircle2 className="w-3.5 h-3.5" /> QA Pass
  </button>
            </div>
          </div>

          {/* Fail/Revision reason */}
          {(decision === "qaFail" || decision === "requestRevision") && (
            <div
              className={`flex-col gap-3 px-4 py-3 border-t ${decision === "qaFail" ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <AlertTriangle
                  className={`w-4 h-4 flex-shrink-0 ${decision === "qaFail" ? "text-red-500" : "text-amber-500"}`}
                />
                <span
                  className={`text-[11px] font-bold whitespace-nowrap ${decision === "qaFail" ? "text-red-700" : "text-amber-700"}`}
                >
                  {decision === "qaFail"
                    ? "Select failure reasons (multiple allowed):"
                    : "Select revision reasons (multiple allowed):"}
                </span>
              </div>

              <div className="flex flex-wrap gap-x-4 gap-y-2 mb-3">
                {FAIL_REASONS.map((r) => (
                  <div key={r} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`reason-${r}`}
                      checked={selectedReasons.includes(r)}
                      onChange={() => handleReasonToggle(r)}
                      className={`w-3.5 h-3.5 rounded border ${decision === "qaFail" ? "text-red-600 border-red-300 focus:ring-red-500" : "text-amber-600 border-amber-300 focus:ring-amber-500"}`}
                    />
                    <label
                      htmlFor={`reason-${r}`}
                      className={`text-[11px] cursor-pointer font-medium ${decision === "qaFail" ? "text-red-900" : "text-amber-900"}`}
                    >
                      {r}
                    </label>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  placeholder="Additional notes for the abstractor…"
                  className={`flex-1 px-3 py-1.5 text-[11px] border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${decision === "qaFail" ? "border-red-300 focus:ring-red-200" : "border-amber-300 focus:ring-amber-200"}`}
                />
                <button
                  onClick={() => handleDecisionClick(decision)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
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
            {/* Center content */}
            <div className="flex-1 overflow-hidden">
              {reviewLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-sm text-muted-foreground">
                      Loading QA Review...
                    </p>
                  </div>
                </div>
              ) : reviewError || !detail || !detail.extractedEvidence ? (
                /* ─────── QA REVIEW NOT READY STATE ─────── */
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mb-5">
                      <Clock className="w-7 h-7 text-amber-600" />
                    </div>

                    <h3 className="text-[16px] font-semibold text-foreground mb-2">
                      QA Analysis in Progress
                    </h3>

                    <p className="text-[14px] text-muted-foreground leading-relaxed mb-6">
                      The detailed QA review analysis for this evaluation has
                      not been processed yet.
                      <br />
                      Background workers are currently running the extraction
                      and validation.
                    </p>

                    <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full border border-amber-200 mb-6">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      Processing...
                    </div>
                  </div>
                </div>
              ) : centerTab === "evidence" ? (
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
                          {pdfUrl ? pdfUrl.split("/").pop() : "Document.pdf"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() =>
                            setPdfZoom((z) => Math.max(50, z - 25))
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
                            setPdfZoom((z) => Math.min(200, z + 25))
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
                    <div className="flex-1 overflow-auto bg-slate-200/80 p-4 flex items-start justify-center">
                      {!pdfUrl ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
                          <p>No PDF available for this case</p>
                        </div>
                      ) : (
                        <Document
                          file={pdfUrl}
                          onLoadSuccess={onDocumentLoadSuccess}
                          onLoadError={onDocumentLoadError}
                          loading={
                            <div className="flex items-center justify-center h-96">
                              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                            </div>
                          }
                          className="shadow-lg rounded"
                        >
                          <Page
                            key={`page-${pdfPage}-${textRenderKey}`}
                            pageNumber={pdfPage}
                            scale={pdfZoom / 100}
                            className="bg-white shadow-md"
                            renderTextLayer={true}
                            renderAnnotationLayer={true}
                            {...(textRenderer
                              ? { customTextRenderer: textRenderer }
                              : {})}
                          />
                        </Document>
                      )}
                    </div>

                    {/* Page navigation */}
                    {pdfUrl && numPages && (
                      <div className="flex-shrink-0 border-t border-border bg-card flex items-center justify-between px-4 py-2">
                        <button
                          onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                          disabled={pdfPage === 1}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          Previous
                        </button>

                        <div className="flex items-center gap-2 text-sm">
                          <span>Page</span>
                          <input
                            type="number"
                            value={pdfPage}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              if (val >= 1 && val <= (numPages || 1))
                                setPdfPage(val);
                            }}
                            className="w-12 text-center border border-border rounded px-2 py-1 text-sm"
                          />
                          <span>of {numPages}</span>
                        </div>

                        <button
                          onClick={() =>
                            setPdfPage((p) => Math.min(numPages || 1, p + 1))
                          }
                          disabled={pdfPage === numPages}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          Next
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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
                      {reviewLoading ? (
                        <div className="flex items-center justify-center h-64">
                          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                      ) : EVIDENCE_CARDS.length > 0 ? (
                        EVIDENCE_CARDS.map((ev: any) => {
                          const Icon = ev.icon;
                          const isSelectedHighlight =
                            currentHighlightText === ev.highlightText;
                          return (
                            <div
                              key={ev.label}
                              role="button"
                              tabIndex={0}
                              onClick={() => {
                                if (ev.pageNumber) {
                                  setPdfPage(ev.pageNumber);
                                }

                                if (ev.highlightText) {
                                  setCurrentHighlightText(ev.highlightText);
                                  // Prefer the API-provided tokens; fall back to manual split only if absent
                                  const words = ev.highlightWords?.length
                                    ? ev.highlightWords
                                    : (ev.highlightText || "")
                                        .trim()
                                        .split(/[\s:,\-–—/()[\].]+/)
                                        .map((w: string) => w.trim())
                                        .filter((w: string) => w.length > 1);

                                  setCurrentHighlightWords(words);
                                  setTextRenderKey((k) => k + 1); // ← real remount trigger, replaces the zoom hack
                                }
                              }}
                              className={`rounded-lg border p-2.5 transition-all cursor-pointer hover:shadow-md ${isSelectedHighlight ? "ring-2 ring-primary ring-offset-1 border-primary" : ""} ${ev.discrepancy ? "border-red-200 bg-red-50/30" : "border-border bg-card"}`}
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
                                  {ev.discrepancy}
                                </p>
                              )}
                              {ev.highlightText &&
                                ev.highlightText !== "N/A" && (
                                  <div className="mt-2 pt-2 border-t border-border/50 flex items-center gap-1.5">
                                    <Sparkles className="w-2.5 h-2.5 text-primary" />
                                    <span className="text-[9px] font-medium text-muted-foreground truncate">
                                      Evidence on Page {ev.pageNumber}
                                    </span>
                                  </div>
                                )}
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No extracted evidence available
                        </div>
                      )}

                      {/* NEW: All Evidences Found */}
                      {detail?.all_evidences &&
                        detail.all_evidences.length > 0 && (
                          <div className="mt-4 border-t border-border pt-4">
                            <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />
                              All Contextual Evidences
                            </h4>
                            <div className="space-y-2">
                              {detail.all_evidences.map(
                                (ev: any, idx: number) => {
                                  const isSelectedHighlight =
                                    currentHighlightText === ev.content;
                                  return (
                                    <div
                                      key={idx}
                                      role="button"
                                      tabIndex={0}
                                      onClick={() => {
                                        if (ev.pageNumber)
                                          setPdfPage(ev.pageNumber);
                                        if (ev.content) {
                                          setCurrentHighlightText(ev.content);
                                          const words = ev.content
                                            .split(/[\s:,\-–—/()[\]]+/)
                                            .map((w: string) => w.trim())
                                            .filter(Boolean);
                                          setCurrentHighlightWords(words);

                                          setTimeout(
                                            () => setPdfZoom((z) => z),
                                            80
                                          );
                                        }
                                      }}
                                      className={`rounded p-2 border transition-all cursor-pointer hover:shadow-sm text-[11px] ${
                                        isSelectedHighlight
                                          ? "bg-primary/5 border-primary ring-1 ring-primary/20"
                                          : "bg-muted/30 border-border/50"
                                      }`}
                                    >
                                      <p className="text-foreground leading-relaxed italic mb-1">
                                        "{ev.content}"
                                      </p>
                                      <div className="flex items-center justify-between text-[9px] text-muted-foreground font-semibold">
                                        <span className="flex items-center gap-1">
                                          <Info className="w-2.5 h-2.5" />
                                          {ev.relevance}
                                        </span>
                                        <span className="bg-muted px-1 rounded flex items-center gap-1">
                                          <FileText className="w-2.5 h-2.5" />
                                          Page {ev.pageNumber}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              ) : (
                /* FIELD COMPARISON TABLE */
                <div className="flex-1 overflow-auto p-5">
                  {reviewLoading ? (
                    <div className="flex items-center justify-center h-full py-20">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">
                          Loading field comparison...
                        </p>
                      </div>
                    </div>
                  ) : COMPARISON_FIELDS.length > 0 ? (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <div>
                          <h3 className="text-[13px] font-bold text-foreground">
                            Abstraction vs. Source Document Comparison
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {selectedCase.caseRef} · {selectedCase.measureCode}{" "}
                            · Abstractor: {selectedCase.abstractor}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            {
                              COMPARISON_FIELDS.filter(
                                (r) => r.match === "discrepancy"
                              ).length
                            }{" "}
                            discrepancy
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            {
                              COMPARISON_FIELDS.filter(
                                (r) => r.match === "match"
                              ).length
                            }{" "}
                            matches
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
                            {COMPARISON_FIELDS.map((row, i) => (
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
                                      <AlertTriangle className="w-3 h-3" />{" "}
                                      Discrepancy
                                    </span>
                                  )}
                                  {row.match === "match" && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                      <Check className="w-3 h-3" /> Match
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                      <Layers className="w-12 h-12 mb-4 opacity-40" />
                      <p>No comparison data available for this case</p>
                    </div>
                  )}
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
              {reviewLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                    <p>Analyzing chart against rules...</p>
                  </div>
                </div>
              ) : checklist.length > 0 ? (
                (
                  [
                    "eligibility",
                    "evidence",
                    "documentation",
                    "coding",
                  ] as const
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
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <Shield className="w-12 h-12 mb-4 opacity-40" />
                  <p className="font-medium">No Validation Checklist Yet</p>
                  <p className="text-sm text-center mt-2 max-w-xs">
                    The QA engine is still processing this case. Please refresh
                    shortly.
                  </p>
                </div>
              )}
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
                  className={`flex items-center gap-2 p-2.5 rounded-lg border ${decision === "qaPass" ? "border-emerald-200 bg-emerald-50" : decision === "qaFail" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
                >
                  {decision === "qaPass" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  {decision === "qaFail" && (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  {decision === "requestRevision" && (
                    <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <p
                    className={`text-[11px] font-bold leading-tight ${decision === "qaPass" ? "text-emerald-700" : decision === "qaFail" ? "text-red-700" : "text-amber-700"}`}
                  >
                    {decision === "qaPass"
                      ? "QA Pass — Ready for numerator closure"
                      : ""}
                    {decision === "qaFail"
                      ? "QA Fail — Abstraction rejected"
                      : ""}
                    {decision === "requestRevision"
                      ? "Revision Requested — Returned to abstractor"
                      : ""}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleDecisionClick("qaPass")}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    decision === "qaPass"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pass
                </button>

                <button
                  onClick={() => handleDecisionClick("requestRevision")}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    decision === "requestRevision"
                      ? "bg-amber-500 text-white border-amber-500"
                      : "border-amber-300 text-amber-700 hover:bg-amber-50"
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Revise
                </button>

                <button
                  onClick={() => handleDecisionClick("qaFail")}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    decision === "qaFail"
                      ? "bg-red-600 text-white border-red-600"
                      : "border-red-300 text-red-700 hover:bg-red-50"
                  }`}
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
                  {/* {CASE_DETAIL.reviewer} */}
                </span>
              </span>
            </div>
            <span className="text-muted-foreground/40">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {/* Review started {CASE_DETAIL.reviewStarted} */}
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
              onClick={() => setIsAssignmentModalOpen(true)}
              disabled={!canSave}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold rounded-lg transition-all bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Save Decision
            </button>
          </div>
        </div>

        {/* Assignment Modal */}
        <AssignmentModal
          open={isAssignmentModalOpen}
          onOpenChange={setIsAssignmentModalOpen}
          patientId={patientId || ""}
          measureDecisions={measureDecisions}
          eligibleMeasures={eligibleMeasures}
          abstractorId={selectedCase.memberId || "system"} // Use memberId as a placeholder or fetch real ID
        />
      </div>

      {/* ADD EVIDENCE MODAL */}
      <AddEvidenceModal
        isOpen={showAddEvidenceModal}
        onClose={() => setShowAddEvidenceModal(false)}
        onSubmit={handleAddMissingEvidence}
        formData={addEvidenceForm}
        setFormData={setAddEvidenceForm}
        isSubmitting={addMissingEvidenceMutation.isPending}
      />

      {/* HEADER QA ACTION MODAL */}
{showHeaderModal && pendingAction && (
  <>
    <div className="fixed inset-0 bg-black/60 z-[70]" onClick={() => setShowHeaderModal(false)} />
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-2 sm:p-4">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-3 sm:mx-0 max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className={`px-6 py-4 border-b border-border flex items-start gap-3 ${pendingAction === "qaPass" ? "bg-emerald-50" : pendingAction === "qaFail" ? "bg-red-50" : "bg-amber-50"}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${pendingAction === "qaPass" ? "bg-emerald-100" : pendingAction === "qaFail" ? "bg-red-100" : "bg-amber-100"}`}>
            {pendingAction === "qaPass" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
            {pendingAction === "qaFail" && <XCircle className="w-5 h-5 text-red-600" />}
            {pendingAction === "requestRevision" && <RotateCcw className="w-5 h-5 text-amber-600" />}
          </div>
          <div>
            <p className={`font-bold ${pendingAction === "qaPass" ? "text-emerald-700" : pendingAction === "qaFail" ? "text-red-700" : "text-amber-700"}`}>
              {pendingAction === "qaPass" ? "Confirm QA Pass" : pendingAction === "qaFail" ? "Confirm QA Fail" : "Confirm Revision Request"}
            </p>
            <p className="text-[11px] text-muted-foreground">This will update patient QA stage</p>
          </div>
          <button onClick={() => { setShowHeaderModal(false); setPendingAction(null); }} className="ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {(pendingAction === "qaFail" || pendingAction === "requestRevision") && (
            <div>
              <label className="block text-xs font-bold mb-1.5">Reason <span className="text-red-500">*</span></label>
              <select value={headerReason} onChange={(e) => setHeaderReason(e.target.value)} className="w-full px-3 py-2 border rounded-lg">
                <option value="">— Select reason —</option>
                {FAIL_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold mb-1.5">Additional Notes</label>
            <textarea value={headerNote} onChange={(e) => setHeaderNote(e.target.value)} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Optional comments..." />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3">
          <button onClick={() => { setShowHeaderModal(false); setPendingAction(null); }} className="px-4 py-2 border rounded-lg">Cancel</button>
          <button onClick={handleHeaderQaAction} disabled={isSubmitting} className="px-6 py-2 bg-primary text-white font-bold rounded-lg disabled:opacity-50">
            {isSubmitting ? "Processing..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  </>
)}
    </div>
  );
}

function AssignmentModal({
  open,
  onOpenChange,
  patientId,
  measureDecisions,
  eligibleMeasures,
  abstractorId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  measureDecisions: any;
  eligibleMeasures: any[];
  abstractorId: string;
}) {
  const assignMutation = usePostApiHedisAssignAbstractor();

  const handleAssign = async () => {
    const decisionsArray = Object.entries(measureDecisions).map(
      ([mid, data]: any) => {
        const measure = eligibleMeasures.find((m) => m.id === mid);
        return {
          measureId: mid,
          measureCode: measure?.measure_code || "",
          measureName: measure?.measure_name || "",
          qaStatus:
            data.qaStatus === "qaPass"
              ? "QA_PASS"
              : data.qaStatus === "qaFail"
                ? "QA_FAIL"
                : "REQUEST_REVISION",
          reasons: data.reasons,
        };
      }
    );

    try {
      await assignMutation.mutateAsync({
        data: {
          patientId,
          assignedAbstractorId: abstractorId,
          decisions: decisionsArray as any,
        },
      });
      toast.success("Measures assigned back to abstractor successfully");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(
        err?.message || "Failed to assign measures. Please try again."
      );
    }
  };

  if (!open) return null;

  const decisionList = Object.entries(measureDecisions);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck2 className="w-5 h-5 text-primary" />
              <h3 className="text-[14px] font-bold text-foreground">
                Assign to Abstractor
              </h3>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[12px] text-muted-foreground mt-1">
            Review decisions for all measures before assigning back.
          </p>
        </div>

        <div className="p-6">
          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar border rounded-lg p-4 bg-muted/10">
            <div className="space-y-4">
              {decisionList.map(([mid, data]: any) => {
                const measure = eligibleMeasures.find((m) => m.id === mid);
                return (
                  <div
                    key={mid}
                    className="border-b border-border/50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-foreground capitalize">
                        {measure?.measure_code} - {measure?.measure_name}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border shadow-sm ${
                          data.qaStatus === "qaPass"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : data.qaStatus === "qaFail"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {data.qaStatus === "qaPass"
                          ? "Pass"
                          : data.qaStatus === "qaFail"
                            ? "Fail"
                            : "Revise"}
                      </span>
                    </div>
                    {data.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {data.reasons.map((r: string) => (
                          <span
                            key={r}
                            className="text-[9px] bg-background border border-border px-1.5 rounded text-muted-foreground"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                    {data.notes && (
                      <p className="text-[10px] text-muted-foreground mt-1.5 italic line-clamp-2 bg-muted/30 p-1 rounded">
                        "{data.notes}"
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 text-[11px] font-bold text-primary uppercase tracking-tight">
              <Info className="w-3.5 h-3.5" />
              Decision Summary
            </div>
            <div className="flex gap-4 mt-2 text-[11px] font-semibold">
              <span className="text-emerald-700">
                Pass:{" "}
                {
                  decisionList.filter(([_, d]: any) => d.qaStatus === "qaPass")
                    .length
                }
              </span>
              <span className="text-red-700">
                Fail:{" "}
                {
                  decisionList.filter(([_, d]: any) => d.qaStatus === "qaFail")
                    .length
                }
              </span>
              <span className="text-amber-700">
                Revise:{" "}
                {
                  decisionList.filter(
                    ([_, d]: any) => d.qaStatus === "requestRevision"
                  ).length
                }
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-lg text-xs font-bold border border-border hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAssign}
              disabled={assignMutation.isPending}
              className="px-6 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md hover:shadow-primary/20"
            >
              {assignMutation.isPending && (
                <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              )}
              Assign back to Abstractor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
