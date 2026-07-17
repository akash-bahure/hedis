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
  Shield,
} from "lucide-react";
import {
  useGetApiAuditQueue,
  useGetApiAuditMeasuresPatientid,
  useGetApiHedisQaReviewEvaluationid,
  usePostApiAuditAuditStage, // ← NEW
  usePostApiAuditDecisions, // ← NEW
} from "@/api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
import { Pagination } from "./Pagination";
/* ═══════════════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════════════ */
type AuditStatus = "pending" | "in-review" | "approved" | "failed" | "rework";
type Priority = "critical" | "high" | "medium" | "low";
type CheckState = "pass" | "fail" | "warn" | "na" | "pending";
type Decision = null | "approve" | "fail" | "rework";
type CenterTab = "evidence" | "comparison";
type AuditLevel = "L1" | "L2" | "L3";
type CheckGroup =
  | "eligibility"
  | "evidence"
  | "documentation"
  | "coding"
  | "measure-logic";

interface ChecklistItem {
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

interface ApiAuditItem {
  patient_uuid: string;
  mrn?: string;
  first_name?: string;
  last_name?: string;
  measure?: string;
  plan?: string;
  patient_priority?: string;
  stage?: string;
  patient_due_date?: string;
  abstractor_name?: string;
  qa_name?: string;
  chart_priority?: string;
}

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

/* ═══════════════════════════════════════════════════════════
   HELPER: API → Component Data Mapper
═══════════════════════════════════════════════════════════ */
const mapApiToAuditCase = (item: ApiAuditItem): AuditCase => {
  const fullName = [item.first_name, item.last_name].filter(Boolean).join(", ");

  const priorityMap: Record<string, Priority> = {
    High: "high",
    Critical: "critical",
    Medium: "medium",
    Low: "low",
  };

  const statusMap: Record<string, AuditStatus> = {
    // Audit Stages (exact match from backend)
    "Audit Approved": "approved",
    "Audit Failed": "failed",
    REQUEST_REWORK: "rework",
    "Rework Required": "rework",

    // QA Stages fallback
    "QA Failed": "pending",
    QA_PASS: "pending",
    QA_FAIL: "pending",
    REQUEST_REVISION: "pending",

    // Generic fallbacks
    Pending: "pending",
    "In Review": "in-review",
    Approved: "approved",
    Failed: "failed",
    Rework: "rework",
  };

  const dueDate = item.patient_due_date
    ? new Date(item.patient_due_date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "TBD";

  return {
    id: item.patient_uuid,
    caseRef: item.mrn || `AUD-${item.patient_uuid.slice(0, 8)}`,
    member: fullName || "Unknown Patient",
    memberId: item.mrn || item.patient_uuid.slice(0, 12),
    measureCode: (item.measure || "HEDIS").split(" ")[0],
    measureName: item.measure || "HEDIS Measure",
    abstractor: item.abstractor_name || "Unassigned",
    qaReviewer: item.qa_name || "Unassigned",
    submittedAt: "Recent",
    dueBy: dueDate,
    hoursRemaining: 24,
    priority: priorityMap[item.patient_priority || "Medium"] || "medium",
    status: statusMap[item.stage || "Pending"] || "pending",
    auditLevel: "L2" as AuditLevel,
    fieldCount: 8,
    discrepancies: item.stage?.includes("Failed") ? 2 : 0,
    sampleFlag: "RANDOM-5%",
  };
};

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

const GROUP_META: Record<
  CheckGroup,
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
  "measure-logic": {
    label: "Measure Logic",
    icon: Microscope,
    color: "text-purple-600",
    bg: "bg-purple-50",
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
  const cfg = CHECK_MAP[item.state];
  const Icon = cfg.Icon;
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
  const pri = PRIORITY_MAP[item.priority] || PRIORITY_MAP.medium;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`relative w-full text-left transition-all cursor-pointer border-b border-border group
        ${selected ? "bg-violet-50/70 border-l-[3px] border-l-violet-500" : "border-l-[3px] border-l-transparent hover:bg-muted/20"}`}
    >
      <div className="px-3 py-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${selected ? "bg-violet-100 border-violet-300" : "bg-slate-100 border-slate-200 group-hover:bg-violet-50 group-hover:border-violet-200"}`}
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
              <button className="inline-flex items-center gap-0.5 text-[10px] font-mono text-primary hover:underline">
                {item.caseRef.slice(-8)}
                {/* <ExternalLink className="w-2.5 h-2.5" /> */}
              </button>
            </div>
          </div>
          <div className="flex-shrink-0 flex flex-col items-end gap-1">
            <SlaTimer hours={item.hoursRemaining} />
            <LevelBadge level={item.auditLevel} />
          </div>
        </div>
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

const mapApiToCaseDetail = (item: ApiAuditItem) => {
  const fullName = [item.first_name, item.last_name].filter(Boolean).join(", ");
  return {
    caseRef: item.mrn || `AUD-${item.patient_uuid?.slice(0, 8)}`,
    member: fullName || "Unknown Patient",
    memberId: item.mrn || item.patient_uuid?.slice(0, 12) || "",
    dob: item.dob
      ? new Date(item.dob).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    age: item.dob
      ? new Date().getFullYear() - new Date(item.dob).getFullYear()
      : 0,
    measureCode: (item.measure || "HEDIS").split(" ")[0],
    measureName: item.measure || "HEDIS Measure",
    auditLevel: "L2" as AuditLevel,
    abstractor: item.abstractor_name || "Unassigned",
    qaReviewer: item.qa_name || "Unassigned",
    submittedAt: "Recent",
    dueBy: item.patient_due_date
      ? new Date(item.patient_due_date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "TBD",
    facility: item.facility || "General Hospital",
    auditor: "Dr. Priya Nair, RHIA, CCS",
    auditStarted: "Just now",
    irrScore: "0.94",
    sampleFlag: "RANDOM-5%",
    plan: item.plan || "Medicare",
  };
};

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export function AuditReview({
  onOpenPatient360,
}: {
  onOpenPatient360: () => void;
}) {
  // ========== STATE ==========
  const [selectedId, setSelectedId] = useState<string>("");
  const [selectedMeasureCode, setSelectedMeasureCode] = useState<string>("");
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string>("");
  const [centerTab, setCenterTab] = useState<CenterTab>("evidence");
  const [pdfPage, setPdfPage] = useState(1);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pdfZoom, setPdfZoom] = useState(100);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [decision, setDecision] = useState<Decision>(null);
  const [failReason, setFailReason] = useState("");
  const [auditNote, setAuditNote] = useState("");
  const [phiVisible, setPhiVisible] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState<string>("");
  const [page, setPage] = useState(1);
  const [textRenderKey, setTextRenderKey] = useState(0);

  // ========== CHECKLIST STATE ==========
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [currentHighlightText, setCurrentHighlightText] = useState<
    string | null
  >(null);
  const [currentHighlightWords, setCurrentHighlightWords] = useState<string[]>(
    []
  );

  // ========== HEADER ACTION MODAL STATE ==========
  const [showHeaderModal, setShowHeaderModal] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<
    "approve" | "fail" | "rework" | null
  >(null);
  const [headerReason, setHeaderReason] = useState<string>("");
  const [headerNote, setHeaderNote] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // ========== PER-MEASURE DECISIONS STATE ==========
  const [measureDecisions, setMeasureDecisions] = useState<
    Record<
      string,
      {
        status: "AUDIT_APPROVE" | "REQUEST_REWORK" | "AUDIT_FAIL";
        reasons: string[];
        notes?: string;
        measureCode?: string;
        measureName?: string;
      }
    >
  >({});

  // ========== MUTATION HOOKS ==========
  const queryClient = useQueryClient();

  // Stage Update Mutation (Header buttons)
  const { mutateAsync: updateStage, isPending: isStageUpdating } =
    usePostApiAuditAuditStage();

  // Decisions Mutation (Footer save)
  const { mutateAsync: submitDecisions, isPending: isDecisionsSubmitting } =
    usePostApiAuditDecisions();

  // ========== API HOOKS ==========
  const { data: measuresResponse, isLoading: measuresLoading } =
    useGetApiAuditMeasuresPatientid(selectedId);

  const {
    data: auditQueueResponse,
    isLoading,
    refetch,
  } = useGetApiAuditQueue({
    search: search || undefined,
    stage: stage || undefined,
    page,
    limit: 20,
  });

  const {
    data: qaReviewData,
    isLoading: qaReviewLoading,
    error: qaReviewError,
  } = useGetApiHedisQaReviewEvaluationid(selectedEvaluationId || "", {
    query: { enabled: !!selectedEvaluationId },
  });

  // ========== DATA MAPPING ==========
  const auditQueue = useMemo(
    () => (auditQueueResponse?.data || []).map(mapApiToAuditCase),
    [auditQueueResponse]
  );

  const selectedCase = useMemo(
    () => auditQueue.find((item) => item.id === selectedId) ?? null,
    [auditQueue, selectedId]
  );

  const selectedApiItem = auditQueueResponse?.data?.find(
    (item: ApiAuditItem) => item.patient_uuid === selectedId
  );

  const selectedCaseDetail = useMemo(
    () => (selectedApiItem ? mapApiToCaseDetail(selectedApiItem) : null),
    [selectedApiItem]
  );

  const measureOptions = useMemo(() => {
    const measures = measuresResponse?.measures || [];
    return measures.map((m: any) => ({
      code: m.measure_code,
      label: `${m.measure_code}`,
      evaluationId: m.evaluation_id || m.id,
      full: m,
    }));
  }, [measuresResponse]);

  const detail = qaReviewData?.data ?? qaReviewData ?? null;

  // ========== API CHECKLIST MAPPING ==========
  const apiChecklist = useMemo(() => {
    if (!detail?.validationChecklist) return [];

    const mapped: ChecklistItem[] = [];
    const groups: CheckGroup[] = [
      "eligibility",
      "evidence",
      "documentation",
      "coding",
    ];

    groups.forEach((group) => {
      const items = detail.validationChecklist[group] || [];
      items.forEach((item: any, idx: number) => {
        mapped.push({
          id: `${group}-${idx}`,
          group,
          label: item.rule || "Validation Rule",
          description: item.message || "",
          ncqaRef: item.ncqaRef || "HEDIS Spec",
          abstractorValue:
            item.abstractorEntry || item.abstractorValue || "N/A",
          documentValue:
            item.sourceDocument || item.sourceDocumentValue || "Not Found",
          state: (item.status?.toLowerCase() as CheckState) || "pending",
          discrepancy:
            item.status === "FAIL" || item.status === "DISCREPANCY"
              ? item.message
              : undefined,
        });
      });
    });

    return mapped;
  }, [detail]);

  // ========== SYNC CHECKLIST ==========
  useEffect(() => {
    setChecklist(apiChecklist);
  }, [apiChecklist]);

  // ========== EVIDENCE CARDS ==========
  const EVIDENCE_CARDS = useMemo(() => {
    if (!detail?.extractedEvidence?.length) return [];
    return detail.extractedEvidence.map((ev: any) => ({
      label: ev.field,
      abstractor: ev.abstractorValue || "N/A",
      document: ev.sourceDocumentValue || "Not Found",
      discrepancy:
        ev.status === "DISCREPANCY" ||
        ev.status === "FAIL" ||
        ev.status === "MISSING_IN_SOURCE",
      critical: ev.critical || false,
      icon: Activity,
      highlightText: ev.highlightText,
      highlightWords: ev.highlightWords,
      pageNumber: ev.pageNumber,
    }));
  }, [detail]);

  // ========== COMPARISON ==========
  const COMPARISON_FIELDS = useMemo(() => {
    if (!detail?.extractedEvidence?.length) return [];
    return detail.extractedEvidence.map((item: any) => ({
      field: item.field,
      abstractorValue: item.abstractorValue || "",
      documentValue: item.sourceDocumentValue || "",
      aiValue: item.aiValue || item.abstractorValue || "",
      match:
        item.status === "DISCREPANCY" ||
        item.status === "FAIL" ||
        item.status === "MISSING_IN_SOURCE"
          ? "discrepancy"
          : "match",
    }));
  }, [detail]);

  // ========== PDF URL ==========
  const pdfUrl = detail?.pdfUrl || null;

  // ========== TEXT RENDERER ==========
  const textRenderer = useMemo(() => {
    if (!currentHighlightWords.length) return undefined;

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
      pattern.lastIndex = 0;

      const parts = str.split(pattern);
      return (
        <>
          {parts.map((part: string, i: number) =>
            pattern.test(part) && part.length > 0 ? (
              <mark
                key={i}
                style={{
                  backgroundColor: "#fef08c",
                  color: "#1f2937",
                  padding: "1px 4px",
                  borderRadius: "3px",
                  boxShadow: "0 0 0 2px rgba(250, 204, 21, 0.5)",
                  fontWeight: "600",
                }}
              >
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

  // ========== PDF HANDLERS ==========
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF Load Error:", error);
    toast.error("Failed to load PDF document");
  };

  // ========== AUTO-SELECT ==========
  useEffect(() => {
    if (!selectedId && auditQueue.length > 0) {
      setSelectedId(auditQueue[0].id);
    }
  }, [auditQueue, selectedId]);

  useEffect(() => {
    if (measureOptions.length > 0 && !selectedMeasureCode) {
      const first = measureOptions[0];
      setSelectedMeasureCode(first.code);
      if (first.evaluationId) setSelectedEvaluationId(first.evaluationId);
    }
  }, [measureOptions, selectedMeasureCode]);

  // ========== HANDLERS ==========
  const handleMeasureChange = (code: string) => {
    setSelectedMeasureCode(code);
    setCurrentHighlightText(null);
    setCurrentHighlightWords([]);
    const selectedMeasure = measureOptions.find((m) => m.code === code);
    if (selectedMeasure?.evaluationId) {
      setSelectedEvaluationId(selectedMeasure.evaluationId);
      setPdfPage(1);
    }
  };

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

  const byGroup = (g: CheckGroup) => checklist.filter((c) => c.group === g);

  // ========== STATS ==========
  const passCount = checklist.filter((c) => c.state === "pass").length;
  const failCount = checklist.filter((c) => c.state === "fail").length;
  const warnCount = checklist.filter((c) => c.state === "warn").length;
  const totalCount = checklist.length;

  // ========== REPLACE canSave ==========
  const canSave = Object.keys(measureDecisions).length > 0;

  // ========== DECISION STATUS ==========
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
    return (
      STATUS_MAP[selectedCase?.status || "pending"] ?? {
        label: "Pending",
        cls: "bg-slate-100 text-slate-600 border-slate-200",
      }
    );
  };

  // ========== HEADER ACTION HANDLER ==========
  const handleHeaderAction = async () => {
    if (!selectedId || !pendingAction) {
      toast.error("No patient selected or action not specified");
      return;
    }

    // Validate reason for fail/rework
    if (
      (pendingAction === "fail" || pendingAction === "rework") &&
      !headerReason
    ) {
      toast.error("Please select a reason for this action");
      return;
    }

    const actionMap = {
      approve: "AUDIT_APPROVE",
      fail: "AUDIT_FAIL",
      rework: "REQUEST_REWORK",
    };

    setIsSubmitting(true);
    try {
      await updateStage({
        data: {
          patientId: selectedId,
          action: actionMap[pendingAction] as any,
          reason: headerReason || undefined,
          additionalNotes: headerNote || undefined,
        },
      });

      // Update local state
      setDecision(pendingAction);
      setFailReason(headerReason);
      setAuditNote(headerNote);

      toast.success(
        `Audit ${pendingAction === "approve" ? "approved" : pendingAction === "fail" ? "failed" : "rework requested"} successfully!`
      );

      // Close modal
      setShowHeaderModal(false);
      setPendingAction(null);
      setHeaderReason("");
      setHeaderNote("");

      // Refresh queue
      await refetch();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to update patient stage"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========== FOOTER SAVE HANDLER ==========
  const handleSaveDecisions = async () => {
    if (!selectedId) {
      toast.error("No patient selected");
      return;
    }

    // Build decisions array from measureDecisions state
    const decisionsArray = Object.entries(measureDecisions).map(
      ([evalId, data]) => {
        const measure = measureOptions.find((m) => m.evaluationId === evalId);
        return {
          measureId: evalId,
          measureCode: measure?.code || "",
          measureName: measure?.full?.measure_name || "",
          auditStatus: data.status,
          reasons: data.reasons || [],
        };
      }
    );

    if (decisionsArray.length === 0) {
      toast.error("No decisions to save. Please make at least one decision.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitDecisions({
        data: {
          patientId: selectedId,
          chartId: selectedApiItem?.chart_uuid || "",
          decisions: decisionsArray,
        },
      });

      toast.success(`Successfully saved ${decisionsArray.length} decision(s)!`);

      // Close modal
      setShowSaveModal(false);

      // Refresh queue
      await refetch();

      // Clear decisions after successful save
      setMeasureDecisions({});
      setDecision(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to save audit decisions"
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  // ========== RIGHT PANEL DECISION HANDLER ==========
  const handleRightPanelDecision = (action: "approve" | "fail" | "rework") => {
    if (!selectedEvaluationId || !selectedMeasureCode) {
      toast.error("No measure selected");
      return;
    }

    // Get the current measure details
    const currentMeasure = measureOptions.find(
      (m) => m.code === selectedMeasureCode
    );

    const statusMap = {
      approve: "AUDIT_APPROVE",
      fail: "AUDIT_FAIL",
      rework: "REQUEST_REWORK",
    };

    const currentStatus = measureDecisions[selectedEvaluationId]?.status;

    // If same action is already selected, clear it (toggle off)
    if (currentStatus === statusMap[action]) {
      setMeasureDecisions((prev) => {
        const newDecisions = { ...prev };
        delete newDecisions[selectedEvaluationId];
        return newDecisions;
      });
      setDecision(null);
      setFailReason("");
      setAuditNote("");
      toast.success(`Cleared ${action} decision for ${selectedMeasureCode}`);
      return;
    }

    // For fail/rework, check if we have a reason selected
    if (action === "fail" || action === "rework") {
      // If no reason yet, just set the status to show the bar
      if (!failReason) {
        // Set a temporary status to show the bar, but with empty reasons
        setMeasureDecisions((prev) => ({
          ...prev,
          [selectedEvaluationId]: {
            status: statusMap[action] as any,
            reasons: [],
            notes: auditNote || undefined,
            measureCode: selectedMeasureCode,
            measureName: currentMeasure?.full?.measure_name || "",
          },
        }));
        setDecision(action);
        toast.info(`Please select a reason for ${action} from the bar below`);
        return;
      }

      // Has reason - save the full decision
      setMeasureDecisions((prev) => ({
        ...prev,
        [selectedEvaluationId]: {
          status: statusMap[action] as any,
          reasons: [failReason],
          notes: auditNote || undefined,
          measureCode: selectedMeasureCode,
          measureName: currentMeasure?.full?.measure_name || "",
        },
      }));
      setDecision(action);
      toast.success(`Decision set to ${action} for ${selectedMeasureCode}`);
      // Don't clear failReason - keep it visible in the bar
      return;
    }

    // For approve - just save directly
    setMeasureDecisions((prev) => ({
      ...prev,
      [selectedEvaluationId]: {
        status: statusMap[action] as any,
        reasons: [],
        notes: auditNote || undefined,
        measureCode: selectedMeasureCode,
        measureName: currentMeasure?.full?.measure_name || "",
      },
    }));
    setDecision(action);
    // Clear any fail reason for approve
    setFailReason("");
    setAuditNote("");
    toast.success(`Decision set to ${action} for ${selectedMeasureCode}`);
  };

  // ========== RENDER ==========
  return (
    <div className="flex h-full overflow-hidden bg-background flex-col lg:flex-row">
      {/* LEFT PANEL - QUEUE */}
      <div className="w-full lg:w-[272px] flex-shrink-0 flex flex-col border-r border-border overflow-hidden bg-card">
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
                {auditQueueResponse?.counts?.auditSample ?? 0}
              </span>
              <button
                onClick={() => refetch()}
                className="w-6 h-6 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </div>
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
          {/* Stage Filter Pills - Audit Focused */}
          <div className="flex gap-1 flex-wrap">
            {[
              ["all", "All"],
              ["Audit Approved", "Approved"],
              ["Audit Failed", "Failed"],
              ["Rework Required", "Rework"], // or "Audit Rework" if your backend uses this
            ].map(([val, lbl]) => {
              const isActive = val === "all" ? !stage : stage === val;

              return (
                <button
                  key={val}
                  onClick={() => setStage(val === "all" ? "" : val)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all ${
                    isActive
                      ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                      : "border-border text-muted-foreground hover:border-violet-300 hover:text-violet-700"
                  }`}
                >
                  {lbl}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : auditQueue.length > 0 ? (
            auditQueue.map((item) => (
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
        {/* LEFT PANEL BOTTOM - Pagination + Stats */}
        <div className="flex-shrink-0 border-t border-border bg-card">
          {/* Quick Stats Row */}
          <div className="px-4 py-2.5 border-b border-border">
            <div className="grid grid-cols-4 gap-1 text-center">
              {[
                {
                  label: "Pending",
                  count: auditQueue.filter((q) => q.status === "pending")
                    .length,
                  cls: "text-slate-600",
                },
                {
                  label: "Review",
                  count: auditQueue.filter((q) => q.status === "rework").length,
                  cls: "text-violet-600",
                },
                {
                  label: "Approved",
                  count: auditQueue.filter((q) => q.status === "approved")
                    .length,
                  cls: "text-emerald-600",
                },
                {
                  label: "Failed",
                  count: auditQueue.filter((q) => q.status === "failed").length,
                  cls: "text-red-600",
                },
              ].map((s) => (
                <div key={s.label}>
                  <p className={`text-[13px] font-bold ${s.cls}`}>{s.count}</p>
                  <p className="text-[9px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination Component */}
          <Pagination
            page={page}
            totalPages={auditQueueResponse?.total_pages || 1}
            totalRecords={auditQueueResponse?.total || 0}
            pageSize={20}
            onPageChange={(newPage) => setPage(newPage)}
            recordLabel="patients"
          />
        </div>
      </div>

      {/* RIGHT SIDE - MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Auditor Mode Banner */}
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
              <ShieldCheck className="w-3 h-3" /> NCQA MY2025
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-white bg-white/15 border border-white/25 px-2 py-0.5 rounded-full">
              <FileBadge className="w-3 h-3" /> RANDOM-5%
            </span>
          </div>
        </div>

        {/* HEADER */}
        <div className="flex-shrink-0 border-b border-border">
          <div className="flex items-center gap-4 px-4 py-3">
            {/* Patient Avatar + Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-full bg-violet-100 border-2 border-violet-200 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-violet-700">
                  {selectedCaseDetail?.member
                    ?.split(",")[0]
                    ?.substring(0, 2)
                    ?.toUpperCase() || "??"}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-sm font-bold text-foreground">
                    {phiVisible
                      ? selectedCaseDetail?.member || "Unknown Patient"
                      : "████████████"}
                  </h1>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {phiVisible
                      ? selectedCaseDetail?.memberId || ""
                      : "██████████"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${activeDecisionStatus().cls}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                    {activeDecisionStatus().label}
                  </span>
                  {selectedCaseDetail?.auditLevel && (
                    <LevelBadge level={selectedCaseDetail.auditLevel} />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground mt-1">
                  <span className="inline-flex items-center gap-1 min-w-0">
                    <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold border border-primary/20">
                      {selectedCaseDetail?.measureCode || "N/A"}
                    </span>
                    <span className="truncate max-w-[180px]">
                      {selectedCaseDetail?.measureName || "Unknown"}
                    </span>
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="inline-flex items-center gap-1">
                    <User className="w-3 h-3" />{" "}
                    <span className="font-medium">Abstractor:</span>{" "}
                    {selectedCaseDetail?.abstractor || "Unassigned"}
                  </span>
                  <span className="hidden sm:inline">·</span>
                  <span className="inline-flex items-center gap-1">
                    <UserCheck className="w-3 h-3" />{" "}
                    <span className="font-medium">QA:</span>{" "}
                    {selectedCaseDetail?.qaReviewer || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Measure Dropdown */}
            <div className="flex items-center gap-2 border border-border rounded-lg px-3 py-1.5 bg-card flex-shrink-0">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <select
                value={selectedMeasureCode || ""}
                onChange={(e) => handleMeasureChange(e.target.value)}
                className="bg-transparent border-none text-[11px] font-bold text-primary focus:ring-0 cursor-pointer p-0 min-w-[140px]"
              >
                {measureOptions.length > 0 ? (
                  measureOptions.map((opt: any) => (
                    <option key={opt.code} value={opt.code}>
                      {opt.label}
                    </option>
                  ))
                ) : (
                  <option value="">No measures available</option>
                )}
              </select>
            </div>

            {/* Action Buttons */}
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
                  setPendingAction("rework");
                  setHeaderReason("");
                  setHeaderNote("");
                  setShowHeaderModal(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                  decision === "rework"
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-orange-300 text-orange-700 hover:bg-orange-50"
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Request Rework
              </button>

              <button
                onClick={() => {
                  setPendingAction("fail");
                  setHeaderReason("");
                  setHeaderNote("");
                  setShowHeaderModal(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                  decision === "fail"
                    ? "bg-red-600 text-white border-red-600"
                    : "border-red-300 text-red-700 hover:bg-red-50"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" /> Audit Fail
              </button>

              <button
                onClick={() => {
                  setPendingAction("approve");
                  setHeaderReason("");
                  setHeaderNote("");
                  setShowHeaderModal(true);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                  decision === "approve"
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Audit Approve
              </button>
            </div>
          </div>

          {/* Fail/Rework Reason Bar */}
          {/* ── PER-MEASURE REASON BAR ── */}
          {(measureDecisions[selectedEvaluationId]?.status === "AUDIT_FAIL" ||
            measureDecisions[selectedEvaluationId]?.status ===
              "REQUEST_REWORK" ||
            decision === "fail" ||
            decision === "rework") && (
            <div
              className={`flex items-center gap-3 px-4 py-2.5 border-t ${
                measureDecisions[selectedEvaluationId]?.status ===
                  "AUDIT_FAIL" || decision === "fail"
                  ? "bg-red-50 border-red-100"
                  : "bg-orange-50 border-orange-100"
              }`}
            >
              <Flag
                className={`w-4 h-4 flex-shrink-0 ${
                  measureDecisions[selectedEvaluationId]?.status ===
                    "AUDIT_FAIL" || decision === "fail"
                    ? "text-red-500"
                    : "text-orange-500"
                }`}
              />
              <span
                className={`text-[11px] font-bold whitespace-nowrap ${
                  measureDecisions[selectedEvaluationId]?.status ===
                    "AUDIT_FAIL" || decision === "fail"
                    ? "text-red-700"
                    : "text-orange-700"
                }`}
              >
                {measureDecisions[selectedEvaluationId]?.status ===
                  "AUDIT_FAIL" || decision === "fail"
                  ? "Failure reason:"
                  : "Rework instruction:"}
              </span>
              <select
                value={
                  failReason ||
                  measureDecisions[selectedEvaluationId]?.reasons?.[0] ||
                  ""
                }
                onChange={(e) => {
                  const reason = e.target.value;
                  setFailReason(reason);
                  // If we have a decision already, update it with the reason
                  if (
                    selectedEvaluationId &&
                    measureDecisions[selectedEvaluationId]
                  ) {
                    const currentStatus =
                      measureDecisions[selectedEvaluationId].status;
                    // Only update if status is fail/rework
                    if (
                      currentStatus === "AUDIT_FAIL" ||
                      currentStatus === "REQUEST_REWORK"
                    ) {
                      setMeasureDecisions((prev) => ({
                        ...prev,
                        [selectedEvaluationId]: {
                          ...prev[selectedEvaluationId],
                          reasons: reason ? [reason] : [],
                        },
                      }));
                    }
                  }
                }}
                className={`px-3 py-1.5 text-[11px] border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 flex-1 ${
                  measureDecisions[selectedEvaluationId]?.status ===
                    "AUDIT_FAIL" || decision === "fail"
                    ? "border-red-300 focus:ring-red-200"
                    : "border-orange-300 focus:ring-orange-200"
                }`}
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
                value={
                  auditNote ||
                  measureDecisions[selectedEvaluationId]?.notes ||
                  ""
                }
                onChange={(e) => {
                  const note = e.target.value;
                  setAuditNote(note);
                  if (
                    selectedEvaluationId &&
                    measureDecisions[selectedEvaluationId]
                  ) {
                    setMeasureDecisions((prev) => ({
                      ...prev,
                      [selectedEvaluationId]: {
                        ...prev[selectedEvaluationId],
                        notes: note || undefined,
                      },
                    }));
                  }
                }}
                placeholder="Additional comments…"
                className={`flex-1 px-3 py-1.5 text-[11px] border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                  measureDecisions[selectedEvaluationId]?.status ===
                    "AUDIT_FAIL" || decision === "fail"
                    ? "border-red-300 focus:ring-red-200"
                    : "border-orange-300 focus:ring-orange-200"
                }`}
              />
              <button
                onClick={() => {
                  if (selectedEvaluationId) {
                    setMeasureDecisions((prev) => {
                      const newDecisions = { ...prev };
                      delete newDecisions[selectedEvaluationId];
                      return newDecisions;
                    });
                  }
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

        {/* MIDDLE CONTENT ROW */}
        <div className="flex-1 flex overflow-hidden">
          {/* CENTER PANEL - Evidence Viewer */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
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
                    className={`inline-flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
                      centerTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
              <div className="flex-1" />
              {selectedCase && selectedCase.discrepancies > 0 && (
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-red-600 pr-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {selectedCase.discrepancies} discrepanc
                  {selectedCase.discrepancies === 1 ? "y" : "ies"} flagged
                </div>
              )}
            </div>

            {/* Center Content */}
            <div className="flex-1 overflow-hidden">
              {qaReviewLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                    <p className="text-sm text-muted-foreground">
                      Loading QA Review...
                    </p>
                  </div>
                </div>
              ) : qaReviewError || !detail || !detail.extractedEvidence ? (
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
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />{" "}
                      Processing...
                    </div>
                  </div>
                </div>
              ) : centerTab === "evidence" ? (
                <div className="flex h-full overflow-hidden">
                  {/* PDF Viewer */}
                  <div
                    className="flex flex-col border-r border-border"
                    style={{ width: "57%" }}
                  >
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
                          <Download className="w-3 h-3" /> Export
                        </button>
                      </div>
                    </div>

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

                    {pdfUrl && numPages && (
                      <div className="flex-shrink-0 border-t border-border bg-card flex items-center justify-between px-4 py-2">
                        <button
                          onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
                          disabled={pdfPage === 1}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4" /> Previous
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
                          Next <ChevronRight className="w-4 h-4" />
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
                        <Layers className="w-3.5 h-3.5 text-primary" />{" "}
                        Extracted Evidence
                      </h3>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Auto-extracted from source · AI-verified · Abstractor
                        vs. Document
                      </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                      {EVIDENCE_CARDS.length > 0 ? (
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
                                if (ev.pageNumber) setPdfPage(ev.pageNumber);
                                if (ev.highlightText) {
                                  setCurrentHighlightText(ev.highlightText);
                                  const words = ev.highlightWords?.length
                                    ? ev.highlightWords
                                    : (ev.highlightText || "")
                                        .trim()
                                        .split(/[\s:,\-–—/()[\].]+/)
                                        .map((w: string) => w.trim())
                                        .filter((w: string) => w.length > 1);
                                  setCurrentHighlightWords(words);
                                  setTextRenderKey((k) => k + 1);
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
                                    <AlertTriangle className="w-2.5 h-2.5" />{" "}
                                    Discrepancy
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                                    <Check className="w-2.5 h-2.5" /> Match
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
                                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />{" "}
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

                      {/* All Evidences Found */}
                      {detail?.all_evidences &&
                        detail.all_evidences.length > 0 && (
                          <div className="mt-4 border-t border-border pt-4">
                            <h4 className="text-[11px] font-bold text-foreground mb-2 flex items-center gap-1.5 uppercase tracking-wider">
                              <BookOpen className="w-3.5 h-3.5 text-primary" />{" "}
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
                                            () =>
                                              setTextRenderKey((k) => k + 1),
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
                                          <Info className="w-2.5 h-2.5" />{" "}
                                          {ev.relevance}
                                        </span>
                                        <span className="bg-muted px-1 rounded flex items-center gap-1">
                                          <FileText className="w-2.5 h-2.5" />{" "}
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
                /* Field Comparison */
                <div className="flex-1 overflow-auto p-5">
                  {COMPARISON_FIELDS.length > 0 ? (
                    <div className="bg-card border border-border rounded-xl overflow-hidden">
                      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                        <div>
                          <h3 className="text-[13px] font-bold text-foreground">
                            Abstraction vs. Source Document Comparison
                          </h3>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {selectedCase?.caseRef || "N/A"} ·{" "}
                            {selectedCase?.measureCode || "N/A"} · Abstractor:{" "}
                            {selectedCase?.abstractor || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />{" "}
                            {
                              COMPARISON_FIELDS.filter(
                                (r) => r.match === "discrepancy"
                              ).length
                            }{" "}
                            discrepancy
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />{" "}
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
                                    <Sparkles className="w-3 h-3 text-primary flex-shrink-0" />{" "}
                                    {row.aiValue}
                                  </span>
                                </td>
                                <td className="px-5 py-3">
                                  {row.match === "discrepancy" ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                                      <AlertTriangle className="w-3 h-3" />{" "}
                                      Discrepancy
                                    </span>
                                  ) : (
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

          {/* RIGHT PANEL - Validation Checklist */}
          <div className="w-80 flex-shrink-0 flex flex-col border-l border-border overflow-hidden bg-card">
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
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{" "}
                  {passCount} Pass
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />{" "}
                  {warnCount} Warn
                </span>
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />{" "}
                  {failCount} Fail
                </span>
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <Info className="w-3 h-3" /> Click to cycle state
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
              {qaReviewLoading ? (
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

            {/* Decision Section */}
            <div className="flex-shrink-0 border-t border-border p-3 space-y-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Audit Decision
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
                  className={`flex items-center gap-2 p-2.5 rounded-lg border ${decision === "approve" ? "border-emerald-200 bg-emerald-50" : decision === "fail" ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}
                >
                  {decision === "approve" && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  )}
                  {decision === "fail" && (
                    <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  )}
                  {decision === "rework" && (
                    <RotateCcw className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <p
                    className={`text-[11px] font-bold leading-tight ${decision === "approve" ? "text-emerald-700" : decision === "fail" ? "text-red-700" : "text-amber-700"}`}
                  >
                    {decision === "approve"
                      ? "Cleared for HEDIS submission"
                      : decision === "fail"
                        ? "Returned for correction & re-QA"
                        : "Sent back to abstractor"}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    // If approve is already selected, clear it
                    if (
                      measureDecisions[selectedEvaluationId]?.status ===
                      "AUDIT_APPROVE"
                    ) {
                      setMeasureDecisions((prev) => {
                        const newDecisions = { ...prev };
                        delete newDecisions[selectedEvaluationId];
                        return newDecisions;
                      });
                      setDecision(null);
                      setFailReason("");
                      setAuditNote("");
                      return;
                    }
                    handleRightPanelDecision("approve");
                  }}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all 
      ${
        measureDecisions[selectedEvaluationId]?.status === "AUDIT_APPROVE"
          ? "bg-emerald-600 text-white border-emerald-600"
          : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
      }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  onClick={() => {
                    // If rework is already selected with a reason, clear it
                    if (
                      measureDecisions[selectedEvaluationId]?.status ===
                      "REQUEST_REWORK"
                    ) {
                      setMeasureDecisions((prev) => {
                        const newDecisions = { ...prev };
                        delete newDecisions[selectedEvaluationId];
                        return newDecisions;
                      });
                      setDecision(null);
                      setFailReason("");
                      setAuditNote("");
                      return;
                    }
                    handleRightPanelDecision("rework");
                  }}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all 
      ${
        measureDecisions[selectedEvaluationId]?.status === "REQUEST_REWORK"
          ? "bg-orange-500 text-white border-orange-500"
          : "border-orange-300 text-orange-700 hover:bg-orange-50"
      }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Rework
                </button>
                <button
                  onClick={() => {
                    // If fail is already selected with a reason, clear it
                    if (
                      measureDecisions[selectedEvaluationId]?.status ===
                      "AUDIT_FAIL"
                    ) {
                      setMeasureDecisions((prev) => {
                        const newDecisions = { ...prev };
                        delete newDecisions[selectedEvaluationId];
                        return newDecisions;
                      });
                      setDecision(null);
                      setFailReason("");
                      setAuditNote("");
                      return;
                    }
                    handleRightPanelDecision("fail");
                  }}
                  className={`inline-flex items-center justify-center gap-1 py-2 rounded-lg border text-[11px] font-bold transition-all 
      ${
        measureDecisions[selectedEvaluationId]?.status === "AUDIT_FAIL"
          ? "bg-red-600 text-white border-red-600"
          : "border-red-300 text-red-700 hover:bg-red-50"
      }`}
                >
                  <XCircle className="w-3.5 h-3.5" /> Fail
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex-shrink-0 border-t border-border px-5 py-2.5 bg-card flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-violet-100 border border-violet-200 flex items-center justify-center">
                <span className="text-[8px] font-bold text-violet-700">PN</span>
              </div>
              <span>
                Auditor:{" "}
                <span className="font-semibold text-foreground">
                  Dr. Priya Nair, RHIA, CCS
                </span>
              </span>
            </div>
            <span className="text-muted-foreground/40">·</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3 h-3" /> Started Just now
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-violet-500" /> NCQA MY2025 ·
              L2 Audit · Hybrid Methodology
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {Object.keys(measureDecisions).length === 0 && (
              <span className="text-[10px] text-muted-foreground font-semibold">
                No decisions made
              </span>
            )}
            {Object.keys(measureDecisions).length > 0 && (
              <span className="text-[10px] text-emerald-600 font-semibold">
                {Object.keys(measureDecisions).length} decision(s) ready
              </span>
            )}
            <button
              onClick={() => setShowSaveModal(true)}
              disabled={Object.keys(measureDecisions).length === 0}
              className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-[12px] font-bold rounded-lg transition-all bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              Save Decisions ({Object.keys(measureDecisions).length})
            </button>
          </div>
        </div>
      </div>

      {/* ── HEADER ACTION CONFIRMATION MODAL ── */}
      {showHeaderModal && pendingAction && (
        <>
          {/* BACKDROP OVERLAY */}
          <div
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={() => setShowHeaderModal(false)}
          />

          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-2 sm:p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-3 sm:mx-0 max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div
                className={`px-4 sm:px-6 py-4 border-b border-border flex items-start sm:items-center gap-3
            ${pendingAction === "approve" ? "bg-emerald-50" : pendingAction === "fail" ? "bg-red-50" : "bg-orange-50"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center
              ${pendingAction === "approve" ? "bg-emerald-100" : pendingAction === "fail" ? "bg-red-100" : "bg-orange-100"}`}
                >
                  {pendingAction === "approve" && (
                    <BadgeCheck className="w-5 h-5 text-emerald-600" />
                  )}
                  {pendingAction === "fail" && (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  {pendingAction === "rework" && (
                    <RotateCcw className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <p
                    className={`text-[13px] font-bold ${pendingAction === "approve" ? "text-emerald-700" : pendingAction === "fail" ? "text-red-700" : "text-orange-700"}`}
                  >
                    {pendingAction === "approve"
                      ? "Confirm Audit Approval"
                      : pendingAction === "fail"
                        ? "Confirm Audit Failure"
                        : "Confirm Rework Request"}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    This action will update the patient's audit stage.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowHeaderModal(false);
                    setPendingAction(null);
                    setHeaderReason("");
                    setHeaderNote("");
                  }}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-4 sm:px-6 py-4 space-y-4 overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {[
                    ["Patient", selectedCase?.member || "Unknown"],
                    ["MRN", selectedCase?.memberId || "N/A"],
                    [
                      "Measure",
                      `${selectedCase?.measureCode || "N/A"} — ${selectedCase?.measureName || "Unknown"}`,
                    ],
                    [
                      "Current Stage",
                      STATUS_MAP[selectedCase?.status || "pending"]?.label ||
                        "Pending",
                    ],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="bg-muted/20 rounded-lg p-2 border border-border"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
                        {k}
                      </p>
                      <p className="font-semibold text-foreground text-[11px] break-words">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>

                {(pendingAction === "fail" || pendingAction === "rework") && (
                  <div>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">
                      {pendingAction === "fail"
                        ? "Failure Reason"
                        : "Rework Reason"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={headerReason}
                      onChange={(e) => setHeaderReason(e.target.value)}
                      className={`w-full px-3 py-2 text-[11px] border rounded-lg bg-white text-foreground focus:outline-none focus:ring-2 ${pendingAction === "fail" ? "border-red-300 focus:ring-red-200" : "border-orange-300 focus:ring-orange-200"}`}
                    >
                      <option value="">— Select reason —</option>
                      {FAIL_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground mb-1.5">
                    Additional Notes
                  </label>
                  <textarea
                    value={headerNote}
                    onChange={(e) => setHeaderNote(e.target.value)}
                    rows={3}
                    placeholder="Add any additional context or instructions..."
                    className="w-full px-3 py-2 text-[11px] border border-border rounded-lg bg-white text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet-300/50 focus:border-violet-300 resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 sm:px-6 py-3 border-t border-border bg-muted/10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  onClick={() => {
                    setShowHeaderModal(false);
                    setPendingAction(null);
                    setHeaderReason("");
                    setHeaderNote("");
                  }}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleHeaderAction}
                  disabled={
                    isSubmitting ||
                    ((pendingAction === "fail" || pendingAction === "rework") &&
                      !headerReason)
                  }
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-[12px] font-bold rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed
              ${pendingAction === "approve" ? "bg-emerald-600 text-white hover:bg-emerald-700" : pendingAction === "fail" ? "bg-red-600 text-white hover:bg-red-700" : "bg-orange-500 text-white hover:bg-orange-600"}`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      {pendingAction === "approve"
                        ? "Confirm & Approve"
                        : pendingAction === "fail"
                          ? "Confirm & Fail"
                          : "Confirm & Request Rework"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── SAVE DECISIONS MODAL (READ-ONLY) ── */}
      {showSaveModal && (
        <>
          {/* BACKDROP OVERLAY */}
          <div
            className="fixed inset-0 bg-black/60 z-[70]"
            onClick={() => setShowSaveModal(false)}
          />

          <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-2 sm:p-4">
            <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg sm:max-w-xl mx-3 sm:mx-0 max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-4 sm:px-6 py-4 border-b border-border bg-violet-50 flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-violet-700">
                    Review & Submit Decisions
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Review all measure decisions before submitting
                  </p>
                </div>
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-4 sm:px-6 py-4 space-y-3 overflow-y-auto max-h-[60vh]">
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-muted/20 px-3 py-2 border-b border-border flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Measure Decisions ({Object.keys(measureDecisions).length})
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      Status • Reason
                    </span>
                  </div>
                  <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
                    {Object.entries(measureDecisions).map(([evalId, data]) => {
                      const measure = measureOptions.find(
                        (m) => m.evaluationId === evalId
                      );
                      const statusLabel = {
                        AUDIT_APPROVE: "Approved",
                        REQUEST_REWORK: "Rework",
                        AUDIT_FAIL: "Failed",
                      }[data.status];

                      return (
                        <div
                          key={evalId}
                          className="border-b border-border/50 pb-3 last:border-0 last:pb-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-[11px] font-semibold text-foreground">
                                {measure?.code || evalId.slice(0, 8)}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                                {measure?.full?.measure_name || ""}
                              </p>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${data.status === "AUDIT_APPROVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : data.status === "AUDIT_FAIL" ? "bg-red-50 text-red-700 border-red-200" : "bg-orange-50 text-orange-700 border-orange-200"}`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          {data.reasons?.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {data.reasons.map((r: string) => (
                                <span
                                  key={r}
                                  className="text-[9px] bg-muted/30 border border-border px-1.5 py-0.5 rounded text-muted-foreground"
                                >
                                  {r}
                                </span>
                              ))}
                            </div>
                          )}
                          {data.notes && (
                            <p className="text-[10px] text-muted-foreground mt-1 italic bg-muted/20 p-1.5 rounded">
                              "{data.notes}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-4 sm:px-6 py-3 border-t border-border bg-muted/10 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <button
                  onClick={() => setShowSaveModal(false)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDecisions}
                  disabled={
                    isDecisionsSubmitting ||
                    Object.keys(measureDecisions).length === 0
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 text-[12px] font-bold rounded-lg shadow-sm transition-all bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDecisionsSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Submit {Object.keys(measureDecisions).length} Decision(s)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
