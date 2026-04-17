import { useState } from "react";
import type { ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileText,
  Sparkles,
  Shield,
  User,
  Building2,
  FolderKanban,
  Calendar,
  Stethoscope,
  Activity,
  PauseCircle,
  MessageSquare,
  TrendingUp,
  Eye,
  Upload,
  Play,
  X,
  Hash,
  Layers,
  BarChart3,
  RefreshCw,
  Check,
  Lock,
  Flag,
  ClipboardList,
  Zap,
  BookOpen,
} from "lucide-react";

/* ═══════════════════════════════════════
   TYPES
═══════════════════════════════════════ */
type AlertLevel = "error" | "warning" | "info" | "success";

interface ValidationAlert {
  id: string;
  level: AlertLevel;
  title: string;
  detail: string;
  action?: string;
  blocking: boolean;
}

interface Document {
  id: string;
  name: string;
  type: string;
  pages: number;
  uploadedAt: string;
  uploadedBy: string;
  sizeKb: number;
  ocrStatus: "Complete" | "Processing" | "Failed" | "Pending";
  ocrConfidence?: number;
  aiAnnotated: boolean;
  highlights: number;
}

/* ══════════════════════════════════��════
   CHART DATA
═══════════════════════════════════════ */
const CHART = {
  id: "CHT-78542",
  patientName: "Anderson, Jennifer K.",
  mrn: "MBR-2026-00142",
  dob: "15 Mar 1965",
  age: 60,
  gender: "Female",
  bloodType: "O+",
  encounterType: "Inpatient",
  specialty: "General Medicine",
  facility: "Apollo Hospital & Research Centre – New Delhi",
  facilityType: "Multi-Specialty Tertiary Care",
  provider: "Dr. Rajesh Sharma, MD, FACP",
  npi: "1234567890",
  project: "Apollo Inpatient FY26",
  projectId: "PRJ-001",
  admitDate: "14 Jan 2026",
  dischargeDate: "18 Jan 2026",
  los: 4,
  assignedDate: "15 Feb 2026",
  assignedTo: "Ankit Sharma",
  auditor: "Dr. Priya Nair, RHIA",
  drg: "871",
  drgDesc: "Septicemia or Severe Sepsis Without MV ≥96 Hrs",
  drgWeight: 1.82,
  prevCoded: false,
  priority: "High" as "Critical" | "High" | "Medium" | "Low",
  slaDeadline: "21 Feb 2026, 15:00 IST",
  slaHrsLeft: 3.4,
  slaDaysAssigned: 6,
  slaStatus: "At Risk" as "On Track" | "At Risk" | "Breached",
};

const DOCUMENTS: Document[] = [
  {
    id: "DOC-001",
    name: "Discharge Summary",
    type: "Discharge Summary",
    pages: 6,
    uploadedAt: "14 Jan 2026, 21:34",
    uploadedBy: "Medical Records Dept",
    sizeKb: 842,
    ocrStatus: "Complete",
    ocrConfidence: 99.2,
    aiAnnotated: true,
    highlights: 14,
  },
  {
    id: "DOC-002",
    name: "Laboratory Report",
    type: "Lab Results",
    pages: 4,
    uploadedAt: "14 Jan 2026, 23:12",
    uploadedBy: "Lab Interface (HL7)",
    sizeKb: 310,
    ocrStatus: "Complete",
    ocrConfidence: 98.7,
    aiAnnotated: true,
    highlights: 9,
  },
  {
    id: "DOC-003",
    name: "Operative / Procedure Note",
    type: "Procedure Note",
    pages: 14,
    uploadedAt: "17 Jan 2026, 11:05",
    uploadedBy: "Dr. Rajesh Sharma",
    sizeKb: 2140,
    ocrStatus: "Complete",
    ocrConfidence: 97.4,
    aiAnnotated: true,
    highlights: 22,
  },
  {
    id: "DOC-004",
    name: "Nursing Assessment",
    type: "Nursing Notes",
    pages: 8,
    uploadedAt: "15 Jan 2026, 08:22",
    uploadedBy: "Nursing Staff – G7",
    sizeKb: 680,
    ocrStatus: "Processing",
    ocrConfidence: undefined,
    aiAnnotated: false,
    highlights: 0,
  },
  {
    id: "DOC-005",
    name: "Radiology Report",
    type: "Imaging Report",
    pages: 2,
    uploadedAt: "15 Jan 2026, 14:44",
    uploadedBy: "Radiology Dept",
    sizeKb: 224,
    ocrStatus: "Complete",
    ocrConfidence: 99.6,
    aiAnnotated: true,
    highlights: 5,
  },
];

const ALERTS: ValidationAlert[] = [
  {
    id: "a1",
    level: "warning",
    title: "Lab Result Pages Incomplete",
    detail:
      "Laboratory Report (DOC-002) appears to be missing pages 3–4 based on sequential numbering. Upload may be truncated.",
    action: "Request re-upload",
    blocking: false,
  },
  {
    id: "a2",
    level: "warning",
    title: "Provider Query Recommended",
    detail:
      "Fasting glucose 312 mg/dL documented without explicit hyperglycemia attestation in the Assessment section. Physician query may be required before submitting.",
    action: "Generate Query",
    blocking: false,
  },
  {
    id: "a3",
    level: "info",
    title: "Nursing Assessment OCR In Progress",
    detail:
      "DOC-004 (Nursing Assessment) OCR extraction is still running. AI suggestions may be incomplete until processing completes (~4 min).",
    action: "Refresh Status",
    blocking: false,
  },
  {
    id: "a4",
    level: "success",
    title: "Duplicate Chart Check — Passed",
    detail:
      "No duplicate encounter found for MRN MBR-2026-00142 within the project window (Apollo Inpatient FY26).",
    blocking: false,
  },
  {
    id: "a5",
    level: "info",
    title: "Previous Measurement Year Reference",
    detail:
      "Patient was coded in MY2024 with E11.9, I10. Review prior year DRG assignment (DRG 638, weight 0.97) for comparison.",
    blocking: false,
  },
];

const GUIDELINES = [
  "Assign principal diagnosis (PDX) as the condition established after study to be chiefly responsible for the admission.",
  "All conditions that affect patient care, treatment, or management must be coded as secondary diagnoses.",
  "Capture POA (Present on Admission) indicator for all inpatient diagnoses per CMS guidelines.",
  "Link each CPT procedure code to at least one supporting ICD-10 diagnosis code.",
  "Glucose ≥250 mg/dL with Type 2 DM: Use E11.65 (with hyperglycemia), not E11.9, if clinically documented.",
  "CKD Stage must be confirmed by eGFR and creatinine lab values — do not code from history alone.",
  "Use modifier -26 (Professional Component) for all echo and imaging reads billed by facility.",
  "Insulin long-term use (Z79.4) is mandatory when patient uses insulin for T2DM management.",
];

const PREV_NOTES = [
  {
    author: "Supervisor – Meena Joshi",
    date: "10 Feb 2026",
    note: "This facility uses CMS facility billing rules. Ensure all CPT codes are facility-billable (not physician). Check for outpatient procedure CPTs that may not apply to inpatient setting.",
    type: "supervisor" as const,
  },
  {
    author: "QA Return Note",
    date: "28 Jan 2026",
    note: "Previous chart (CHT-77840, same patient, Oct 2025 encounter) was returned due to missing POA indicator on N18.3. Please ensure CKD stage is documented with POA this encounter.",
    type: "qa" as const,
  },
];

/* ═══════════════════════════════════════
   SLA RING (SVG Circular Progress)
═══════════════════════════════════════ */
function SlaRing({ hrs, status }: { hrs: number; status: string }) {
  const maxHrs = 72;
  const pct = Math.min(100, Math.max(0, (Math.abs(hrs) / maxHrs) * 100));
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const remaining = circ - dash;

  const ringColor =
    status === "Breached"
      ? "#ef4444"
      : status === "At Risk"
        ? "#f59e0b"
        : "#10b981";
  const textColor =
    status === "Breached"
      ? "text-red-600"
      : status === "At Risk"
        ? "text-amber-600"
        : "text-emerald-600";
  const bgColor =
    status === "Breached"
      ? "bg-red-50"
      : status === "At Risk"
        ? "bg-amber-50"
        : "bg-emerald-50";
  const borderColor =
    status === "Breached"
      ? "border-red-200"
      : status === "At Risk"
        ? "border-amber-200"
        : "border-emerald-200";

  const h = Math.floor(Math.abs(hrs));
  const m = Math.round((Math.abs(hrs) - h) * 60);

  return (
    <div
      className={`flex flex-col items-center justify-center p-4 rounded-2xl border ${bgColor} ${borderColor}`}
    >
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Track */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-border opacity-30"
          />
          {/* Progress */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeDasharray={`${dash} ${remaining}`}
            strokeLinecap="round"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-lg font-black ${textColor}`}>
            {h}h{m > 0 ? ` ${m}m` : ""}
          </span>
          <span
            className={`text-[9px] font-bold uppercase tracking-wide ${textColor} opacity-70`}
          >
            remaining
          </span>
        </div>
        {/* Pulse dot for at-risk */}
        {status !== "On Track" && (
          <span
            className="absolute top-1 right-1 w-3 h-3 rounded-full bg-current animate-ping"
            style={{ color: ringColor, opacity: 0.6 }}
          />
        )}
      </div>
      <div className={`mt-2 text-xs font-bold ${textColor}`}>{status}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">
        Deadline: {CHART.slaDeadline}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MINI DOCUMENT CARD
═══════════════════════════════════════ */
function DocCard({
  doc,
  selected,
  onClick,
}: {
  doc: Document;
  selected: boolean;
  onClick: () => void;
}) {
  const ocrColors: Record<Document["ocrStatus"], string> = {
    Complete: "text-emerald-600 bg-emerald-50 border-emerald-200",
    Processing: "text-amber-600 bg-amber-50 border-amber-200",
    Failed: "text-red-600 bg-red-50 border-red-200",
    Pending: "text-slate-500 bg-slate-50 border-slate-200",
  };

  /* Simulated document thumbnail */
  const ThumbLines = ({ count }: { count: number }) => (
    <div className="space-y-1">
      {Array.from({ length: Math.min(count, 7) }).map((_, i) => (
        <div
          key={i}
          className={`rounded-full bg-slate-200 ${
            i === 0
              ? "h-2 w-full"
              : i === 1
                ? "h-1.5 w-4/5"
                : i === 2
                  ? "h-1 w-full"
                  : i % 3 === 0
                    ? "h-1 w-3/4"
                    : i % 3 === 1
                      ? "h-1 w-full"
                      : "h-1 w-1/2"
          }`}
        />
      ))}
      {doc.aiAnnotated && (
        <div className="flex gap-0.5 mt-1">
          <div className="h-1.5 w-6 rounded-full bg-blue-200" />
          <div className="h-1.5 w-4 rounded-full bg-emerald-200" />
          <div className="h-1.5 w-5 rounded-full bg-blue-200" />
        </div>
      )}
    </div>
  );

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border rounded-xl p-3 transition-all hover:shadow-sm flex gap-3 ${
        selected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      {/* Thumbnail */}
      <div className="w-12 h-16 bg-slate-50 border border-slate-200 rounded-lg p-1.5 flex-shrink-0 flex flex-col gap-0.5 overflow-hidden">
        <ThumbLines count={doc.pages} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1 mb-1">
          <span className="text-[11px] font-bold text-foreground leading-tight">
            {doc.name}
          </span>
          {doc.aiAnnotated && (
            <span className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-0.5">
              <Sparkles className="w-2 h-2" />
              AI
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <FileText className="w-2.5 h-2.5" />
            {doc.pages} pages
          </span>
          <span className="text-[10px] text-muted-foreground">
            {(doc.sizeKb / 1024).toFixed(1)} MB
          </span>
        </div>

        <div className="flex flex-wrap gap-1">
          <span
            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${ocrColors[doc.ocrStatus]}`}
          >
            {doc.ocrStatus === "Processing" ? (
              <span className="flex items-center gap-1">
                <RefreshCw className="w-2 h-2 animate-spin" />
                OCR {doc.ocrStatus}
              </span>
            ) : (
              `OCR ${doc.ocrStatus}`
            )}
          </span>
          {doc.highlights > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {doc.highlights} highlights
            </span>
          )}
          {doc.ocrConfidence && (
            <span className="text-[9px] text-muted-foreground font-semibold">
              {doc.ocrConfidence}%
            </span>
          )}
        </div>

        <div className="mt-1.5 text-[9px] text-muted-foreground leading-tight">
          <span>{doc.uploadedAt}</span>
          <br />
          <span className="opacity-70">{doc.uploadedBy}</span>
        </div>
      </div>
    </button>
  );
}

/* ═══════════════════════════════════════
   VALIDATION ALERT ROW
═══════════════════════════════════════ */
function AlertRow({
  a,
  onDismiss,
}: {
  a: ValidationAlert;
  onDismiss: (id: string) => void;
}) {
  const cfg: Record<
    AlertLevel,
    { icon: React.ElementType; cls: string; iconCls: string }
  > = {
    error: {
      icon: AlertCircle,
      cls: "border-red-200 bg-red-50",
      iconCls: "text-red-500",
    },
    warning: {
      icon: AlertTriangle,
      cls: "border-amber-200 bg-amber-50",
      iconCls: "text-amber-500",
    },
    info: {
      icon: Info,
      cls: "border-blue-200 bg-blue-50",
      iconCls: "text-blue-500",
    },
    success: {
      icon: CheckCircle2,
      cls: "border-emerald-200 bg-emerald-50",
      iconCls: "text-emerald-500",
    },
  };
  const { icon: Icon, cls, iconCls } = cfg[a.level];

  return (
    <div
      className={`flex items-start gap-3 px-3 py-2.5 rounded-xl border ${cls} group`}
    >
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${iconCls}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-foreground">
            {a.title}
          </span>
          {a.blocking && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
              Blocking
            </span>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
          {a.detail}
        </p>
        {a.action && (
          <button className="mt-1 text-[10px] font-bold text-primary hover:underline">
            {a.action} →
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(a.id)}
        className="p-1 rounded hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════
   INFO GRID ROW
═══════════════════════════════════════ */
function MetaRow({
  label,
  value,
  mono,
  accent,
}: {
  label: string;
  value: ReactNode;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide flex-shrink-0 w-28">
        {label}
      </span>
      <span
        className={`text-[11px] flex-1 min-w-0 ${mono ? "font-mono" : ""} ${accent ? "font-bold text-primary" : "text-foreground"}`}
      >
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════
   CONFIRM MODAL  (for Park / Escalate / Clarification)
═══════════════════════════════════════ */
function ActionModal({
  type,
  onClose,
}: {
  type: "park" | "clarify" | "escalate" | null;
  onClose: () => void;
}) {
  const [note, setNote] = useState("");
  const [done, setDone] = useState(false);

  if (!type) return null;

  const cfg = {
    park: {
      title: "Park Chart",
      icon: PauseCircle,
      color: "bg-slate-600 hover:bg-slate-700",
      desc: "Chart will be parked and returned to the queue. Add a reason below.",
    },
    clarify: {
      title: "Request Clarification",
      icon: MessageSquare,
      color: "bg-blue-600 hover:bg-blue-700",
      desc: "Send a clarification request to the facility or supervisor.",
    },
    escalate: {
      title: "Escalate Chart",
      icon: TrendingUp,
      color: "bg-rose-500 hover:bg-rose-600",
      desc: "Escalate this chart to a senior coder or supervisor. Describe the issue.",
    },
  }[type];
  const Icon = cfg.icon;

  const handle = () => {
    setDone(true);
    setTimeout(() => {
      onClose();
      setDone(false);
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {!done ? (
          <>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">
                  {cfg.title}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {CHART.id} · {CHART.patientName}
                </p>
              </div>
              <button
                onClick={onClose}
                className="ml-auto p-1.5 rounded hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 py-4 space-y-3">
              <p className="text-xs text-muted-foreground">{cfg.desc}</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Enter reason or notes…"
                className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handle}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg text-white transition-colors ${cfg.color}`}
                >
                  {cfg.title}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="px-5 py-8 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <p className="text-sm font-bold text-foreground">
              {cfg.title} successful
            </p>
            <p className="text-[11px] text-muted-foreground">
              Chart status has been updated
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════ */
export function StartCoding({
  onStartCoding,
  onGoBack,
}: {
  onStartCoding: () => void;
  onGoBack: () => void;
}) {
  const [alerts, setAlerts] = useState<ValidationAlert[]>(ALERTS);
  const [selectedDoc, setSelectedDoc] = useState<string>("DOC-001");
  const [modal, setModal] = useState<"park" | "clarify" | "escalate" | null>(
    null,
  );
  const [starting, setStarting] = useState(false);

  const dismissAlert = (id: string) =>
    setAlerts((prev) => prev.filter((a) => a.id !== id));

  const blocking = alerts.filter((a) => a.blocking).length;

  const handleStart = () => {
    setStarting(true);
    onStartCoding();
  };

  const priorityColor =
    CHART.priority === "Critical"
      ? "bg-red-50 text-red-700 border-red-300"
      : CHART.priority === "High"
        ? "bg-orange-50 text-orange-700 border-orange-300"
        : CHART.priority === "Medium"
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-slate-50 text-slate-600 border-slate-200";

  const totalHighlights = DOCUMENTS.reduce((s, d) => s + d.highlights, 0);
  const ocrComplete = DOCUMENTS.filter(
    (d) => d.ocrStatus === "Complete",
  ).length;
  const aiAnnotated = DOCUMENTS.filter((d) => d.aiAnnotated).length;

  return (
    <div className="flex flex-col min-h-full bg-background">
      {/* ══ TOP NAV BAR ══ */}
      <div className="flex-shrink-0 bg-card border-b border-border px-4 py-2.5 flex items-center gap-3">
        {/* Breadcrumb */}
        <button
          onClick={onGoBack}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors font-semibold"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Work Queue
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-border" />
        <span className="text-[11px] text-muted-foreground">Coding</span>
        <ChevronRight className="w-3.5 h-3.5 text-border" />
        <span className="text-[11px] font-bold text-foreground">
          Start Coding
        </span>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Chart ID + Priority */}
        <span className="font-mono text-xs font-bold text-primary">
          {CHART.id}
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}
        >
          {CHART.priority} Priority
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            CHART.slaStatus === "At Risk"
              ? "bg-amber-50 text-amber-700 border-amber-300"
              : CHART.slaStatus === "Breached"
                ? "bg-red-50 text-red-700 border-red-300"
                : "bg-emerald-50 text-emerald-700 border-emerald-300"
          }`}
        >
          SLA {CHART.slaStatus}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Secondary actions */}
        <button
          onClick={() => setModal("escalate")}
          className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-semibold border border-rose-300 rounded-lg text-rose-700 hover:bg-rose-50 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Escalate
        </button>
        <button
          onClick={() => setModal("park")}
          className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
        >
          <PauseCircle className="w-3.5 h-3.5" />
          Park Chart
        </button>
        <button
          onClick={() => setModal("clarify")}
          className="inline-flex items-center gap-1.5 whitespace-nowrap px-3 py-1.5 text-xs font-semibold border border-blue-300 rounded-lg text-blue-700 hover:bg-blue-50 transition-colors"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          Request Clarification
        </button>

        {/* Primary CTA */}
        <button
          onClick={handleStart}
          disabled={blocking > 0 || starting}
          className={`inline-flex items-center gap-2 whitespace-nowrap px-4 py-1.5 text-xs font-bold rounded-lg text-white transition-all shadow-sm ${
            blocking > 0
              ? "bg-muted-foreground cursor-not-allowed"
              : starting
                ? "bg-primary/70 animate-pulse"
                : "bg-primary hover:bg-primary/90 hover:shadow"
          }`}
        >
          {starting ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Loading…
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              Start Coding
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1400px] mx-auto px-4 py-4 grid grid-cols-12 gap-4">
          {/* ═══════════════════════════════════════════
              LEFT COLUMN  (cols 1–8)
          ═══════════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-8 space-y-4">
            {/* ── PATIENT & CHART METADATA ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {/* Card header */}
              <div className="px-5 py-3.5 border-b border-border bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Patient & Chart Metadata
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {CHART.id}
                </span>
              </div>

              {/* Patient hero */}
              <div className="px-5 pt-4 pb-3 flex items-start gap-4 border-b border-border">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-black text-lg">AJ</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1">
                    <h3 className="text-base font-black text-foreground">
                      {CHART.patientName}
                    </h3>
                    <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-muted">
                      {CHART.mrn}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                      {CHART.bloodType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
                    <span>
                      <span className="font-semibold text-foreground">
                        DOB:
                      </span>{" "}
                      {CHART.dob}
                    </span>
                    <span className="text-border">·</span>
                    <span>
                      <span className="font-semibold text-foreground">
                        Age:
                      </span>{" "}
                      {CHART.age}y
                    </span>
                    <span className="text-border">·</span>
                    <span>
                      <span className="font-semibold text-foreground">
                        Sex:
                      </span>{" "}
                      {CHART.gender}
                    </span>
                    <span className="text-border">·</span>
                    <span>
                      <span className="font-semibold text-foreground">
                        Encounter:
                      </span>{" "}
                      {CHART.encounterType}
                    </span>
                    <span className="text-border">·</span>
                    <span>
                      <span className="font-semibold text-foreground">
                        LOS:
                      </span>{" "}
                      {CHART.los} days
                    </span>
                  </div>
                </div>

                {/* DRG badge */}
                <div className="flex-shrink-0 text-right">
                  <div className="inline-flex flex-col items-center px-3 py-2 rounded-xl border border-primary/20 bg-primary/5">
                    <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
                      DRG
                    </span>
                    <span className="text-xl font-black text-primary">
                      {CHART.drg}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-semibold">
                      Wt {CHART.drgWeight}
                    </span>
                  </div>
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-0 divide-x divide-border">
                <div className="px-5 py-3 space-y-0">
                  <MetaRow label="Specialty" value={CHART.specialty} />
                  <MetaRow label="Provider" value={CHART.provider} />
                  <MetaRow label="NPI" value={CHART.npi} mono />
                  <MetaRow label="Facility" value={CHART.facility} />
                  <MetaRow label="Facility Type" value={CHART.facilityType} />
                </div>
                <div className="px-5 py-3 space-y-0">
                  <MetaRow label="Project" value={CHART.project} accent />
                  <MetaRow label="Project ID" value={CHART.projectId} mono />
                  <MetaRow label="Admit Date" value={CHART.admitDate} />
                  <MetaRow label="Discharge" value={CHART.dischargeDate} />
                  <MetaRow
                    label="DRG Desc"
                    value={
                      <span className="line-clamp-1 text-[10px]">
                        {CHART.drgDesc}
                      </span>
                    }
                  />
                </div>
              </div>

              {/* Assignment footer */}
              <div className="px-5 py-2.5 bg-muted/10 border-t border-border flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                <span>
                  <span className="font-semibold text-foreground">
                    Assigned Coder:
                  </span>{" "}
                  {CHART.assignedTo}
                </span>
                <span className="text-border">·</span>
                <span>
                  <span className="font-semibold text-foreground">
                    Auditor:
                  </span>{" "}
                  {CHART.auditor}
                </span>
                <span className="text-border">·</span>
                <span>
                  <span className="font-semibold text-foreground">
                    Assigned:
                  </span>{" "}
                  {CHART.assignedDate}
                </span>
                <span className="text-border">·</span>
                <span className="font-semibold text-amber-600">
                  {CHART.slaDaysAssigned} days in queue
                </span>
              </div>
            </div>

            {/* ── VALIDATION ALERTS ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-foreground">
                    Pre-Coding Validation
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {alerts.length} checks
                  </span>
                </div>
                {blocking > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                    {blocking} blocking issue{blocking > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="px-4 py-3 space-y-2">
                {alerts.length === 0 ? (
                  <div className="flex items-center gap-3 px-4 py-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-bold">
                        All validation checks passed
                      </p>
                      <p className="text-[10px] opacity-80">
                        Chart is ready for coding. No issues detected.
                      </p>
                    </div>
                  </div>
                ) : (
                  alerts.map((a) => (
                    <AlertRow key={a.id} a={a} onDismiss={dismissAlert} />
                  ))
                )}
              </div>
            </div>

            {/* ── DOCUMENT PREVIEW ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border bg-muted/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-foreground">
                    Chart Documents
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {DOCUMENTS.length} files
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>
                    <span className="font-bold text-foreground">
                      {DOCUMENTS.reduce((s, d) => s + d.pages, 0)}
                    </span>{" "}
                    total pages
                  </span>
                  <span>·</span>
                  <span>
                    <span className="font-bold text-emerald-600">
                      {ocrComplete}
                    </span>
                    /{DOCUMENTS.length} OCR complete
                  </span>
                  <span>·</span>
                  <span>
                    <span className="font-bold text-violet-600">
                      {totalHighlights}
                    </span>{" "}
                    AI highlights
                  </span>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 xl:grid-cols-3 gap-3">
                {DOCUMENTS.map((doc) => (
                  <DocCard
                    key={doc.id}
                    doc={doc}
                    selected={selectedDoc === doc.id}
                    onClick={() => setSelectedDoc(doc.id)}
                  />
                ))}
              </div>

              {/* Selected doc detail */}
              {selectedDoc &&
                (() => {
                  const doc = DOCUMENTS.find((d) => d.id === selectedDoc);
                  if (!doc) return null;
                  return (
                    <div className="mx-4 mb-4 px-4 py-3 bg-muted/10 border border-border rounded-xl flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground">
                          {doc.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground flex-wrap">
                        <span>
                          <span className="font-semibold">Pages:</span>{" "}
                          {doc.pages}
                        </span>
                        <span>
                          <span className="font-semibold">Type:</span>{" "}
                          {doc.type}
                        </span>
                        <span>
                          <span className="font-semibold">OCR:</span>{" "}
                          {doc.ocrStatus}{" "}
                          {doc.ocrConfidence ? `· ${doc.ocrConfidence}%` : ""}
                        </span>
                        <span>
                          <span className="font-semibold">AI Highlights:</span>{" "}
                          {doc.highlights}
                        </span>
                        <span>
                          <span className="font-semibold">Uploaded:</span>{" "}
                          {doc.uploadedAt}
                        </span>
                      </div>
                      <button className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-primary/30 rounded-lg text-primary hover:bg-primary/5 transition-colors whitespace-nowrap">
                        <Eye className="w-3 h-3" />
                        Preview Document
                      </button>
                    </div>
                  );
                })()}
            </div>
          </div>

          {/* ═══════════════════════════════════════════
              RIGHT COLUMN  (cols 9–12)
          ═══════════════════════════════════════════ */}
          <div className="col-span-12 lg:col-span-4 space-y-4">
            {/* ── SLA INFORMATION ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border bg-muted/10 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-foreground">
                  SLA Information
                </span>
              </div>
              <div className="px-5 py-4 space-y-4">
                {/* Circular timer */}
                <SlaRing hrs={CHART.slaHrsLeft} status={CHART.slaStatus} />

                {/* SLA details */}
                <div className="space-y-0">
                  <MetaRow
                    label="Priority"
                    value={
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor}`}
                      >
                        {CHART.priority}
                      </span>
                    }
                  />
                  <MetaRow
                    label="SLA Status"
                    value={
                      <span
                        className={`text-[10px] font-bold ${CHART.slaStatus === "At Risk" ? "text-amber-600" : CHART.slaStatus === "Breached" ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {CHART.slaStatus}
                      </span>
                    }
                  />
                  <MetaRow label="Deadline" value={CHART.slaDeadline} />
                  <MetaRow
                    label="In Queue"
                    value={
                      <span className="font-bold text-amber-600">
                        {CHART.slaDaysAssigned} days
                      </span>
                    }
                  />
                  <MetaRow label="Assigned To" value={CHART.assignedTo} />
                </div>

                {/* SLA warning bar */}
                <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] text-amber-700 leading-relaxed">
                    This chart is <strong>at risk</strong> of breaching SLA in{" "}
                    {Math.floor(CHART.slaHrsLeft)}h{" "}
                    {Math.round((CHART.slaHrsLeft % 1) * 60)}m. Coding must be
                    completed and submitted promptly.
                  </p>
                </div>
              </div>
            </div>

            {/* ── CHART SUMMARY ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border bg-muted/10 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  Chart Summary
                </span>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-3">
                {[
                  {
                    label: "Total Documents",
                    value: `${DOCUMENTS.length}`,
                    icon: FileText,
                    color: "text-primary",
                  },
                  {
                    label: "Total Pages",
                    value: `${DOCUMENTS.reduce((s, d) => s + d.pages, 0)}`,
                    icon: Hash,
                    color: "text-foreground",
                  },
                  {
                    label: "Encounter Type",
                    value: CHART.encounterType,
                    icon: Activity,
                    color: "text-foreground",
                  },
                  {
                    label: "Specialty",
                    value: CHART.specialty,
                    icon: Stethoscope,
                    color: "text-foreground",
                  },
                  {
                    label: "OCR Complete",
                    value: `${ocrComplete}/${DOCUMENTS.length}`,
                    icon: CheckCircle2,
                    color: "text-emerald-600",
                  },
                  {
                    label: "AI Annotated",
                    value: `${aiAnnotated}/${DOCUMENTS.length}`,
                    icon: Sparkles,
                    color: "text-violet-600",
                  },
                  {
                    label: "AI Highlights",
                    value: `${totalHighlights}`,
                    icon: Flag,
                    color: "text-blue-600",
                  },
                  {
                    label: "LOS",
                    value: `${CHART.los} days`,
                    icon: Calendar,
                    color: "text-foreground",
                  },
                ].map(({ label, value, icon: Icon, color }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/10 border border-border"
                  >
                    <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${color}`} />
                    <div className="min-w-0">
                      <div className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground truncate">
                        {label}
                      </div>
                      <div className={`text-xs font-bold truncate ${color}`}>
                        {value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── AI READINESS ── */}
            <div className="bg-card border border-violet-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-violet-200 bg-violet-50/40 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-bold text-violet-900">
                    AI Readiness
                  </span>
                </div>
                <span className="text-[10px] font-bold text-violet-600">
                  GPT-Med v4 · ICD-10 FY2026
                </span>
              </div>
              <div className="px-5 py-4 space-y-4">
                {/* Confidence score */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 text-center">
                    <div className="text-3xl font-black text-violet-700">
                      91.4%
                    </div>
                    <div className="text-[9px] font-bold uppercase tracking-wide text-violet-500">
                      Avg Confidence
                    </div>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <div>
                      <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                        <span>ICD-10 Dx</span>
                        <span className="font-bold text-foreground">91.4%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: "91.4%" }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5">
                        <span>CPT Procedures</span>
                        <span className="font-bold text-foreground">88.7%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-400 rounded-full"
                          style={{ width: "88.7%" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI suggestions summary */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      label: "ICD Suggestions",
                      count: 12,
                      available: true,
                      color: "border-blue-200 bg-blue-50",
                    },
                    {
                      label: "CPT Suggestions",
                      count: 8,
                      available: true,
                      color: "border-emerald-200 bg-emerald-50",
                    },
                    {
                      label: "Pending Review",
                      count: 3,
                      available: true,
                      color: "border-amber-200 bg-amber-50",
                    },
                    {
                      label: "Auto-Accepted",
                      count: 6,
                      available: true,
                      color: "border-violet-200 bg-violet-50",
                    },
                  ].map(({ label, count, color }) => (
                    <div
                      key={label}
                      className={`flex flex-col items-center px-3 py-2.5 rounded-xl border ${color}`}
                    >
                      <span className="text-lg font-black text-foreground">
                        {count}
                      </span>
                      <span className="text-[9px] font-bold text-muted-foreground text-center leading-tight">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* AI processing metadata */}
                <div className="space-y-0 pt-1 border-t border-violet-100">
                  <MetaRow label="Model" value="GPT-Med v4.1 · ICD-10 FY2026" />
                  <MetaRow label="Processed" value="20 Feb 2026, 06:14 IST" />
                  <MetaRow label="Proc. Time" value="14.2 seconds" />
                  <MetaRow label="Text Blocks" value="186 extracted from OCR" />
                </div>

                {/* Readiness status */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-50 border border-violet-200">
                  <Check className="w-4 h-4 text-violet-600 flex-shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-violet-800">
                      AI Processing Complete
                    </p>
                    <p className="text-[10px] text-violet-600">
                      All ICD and CPT suggestions are ready for review.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── CODING INSTRUCTIONS ── */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border bg-muted/10 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs font-bold text-foreground">
                  Coding Instructions
                </span>
              </div>

              {/* Project guidelines */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <FolderKanban className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Project Guidelines — {CHART.project}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {GUIDELINES.map((g, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {g}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Previous notes */}
              <div className="px-5 pb-4 border-t border-border pt-3">
                <div className="flex items-center gap-2 mb-2.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    Previous Notes & QA Findings
                  </span>
                </div>
                <div className="space-y-2.5">
                  {PREV_NOTES.map((n, i) => (
                    <div
                      key={i}
                      className={`px-3 py-2.5 rounded-xl border ${
                        n.type === "qa"
                          ? "bg-rose-50/50 border-rose-200"
                          : "bg-amber-50/50 border-amber-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {n.type === "qa" ? (
                          <Flag className="w-3 h-3 text-rose-600" />
                        ) : (
                          <User className="w-3 h-3 text-amber-600" />
                        )}
                        <span className="text-[10px] font-bold text-foreground">
                          {n.author}
                        </span>
                        <span className="ml-auto text-[9px] text-muted-foreground">
                          {n.date}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {n.note}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ BOTTOM CTA STRIP ══ */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-3 flex items-center justify-between shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex-wrap gap-3">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  CHART.slaStatus === "Breached"
                    ? "bg-red-500 animate-pulse"
                    : CHART.slaStatus === "At Risk"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                }`}
              />
              <span>
                SLA {CHART.slaStatus} ·{" "}
                <strong className="text-foreground">
                  {Math.floor(CHART.slaHrsLeft)}h{" "}
                  {Math.round((CHART.slaHrsLeft % 1) * 60)}m remaining
                </strong>
              </span>
            </div>
            <span className="text-border">·</span>
            <span>
              <strong className="text-foreground">
                {DOCUMENTS.reduce((s, d) => s + d.pages, 0)}
              </strong>{" "}
              pages ·{" "}
              <strong className="text-foreground">{DOCUMENTS.length}</strong>{" "}
              documents
            </span>
            <span className="text-border">·</span>
            <span className="text-violet-600 font-semibold">
              <strong>12 ICD</strong> + <strong>8 CPT</strong> AI suggestions
              ready
            </span>
            {blocking > 0 && (
              <>
                <span className="text-border">·</span>
                <span className="text-red-600 font-bold">
                  {blocking} blocking issue{blocking > 1 ? "s" : ""}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setModal("escalate")}
              className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-semibold border border-rose-300 rounded-xl text-rose-700 hover:bg-rose-50 transition-colors"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Escalate
            </button>
            <button
              onClick={() => setModal("park")}
              className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-semibold border border-border rounded-xl text-muted-foreground hover:bg-muted transition-colors"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              Park Chart
            </button>
            <button
              onClick={() => setModal("clarify")}
              className="inline-flex items-center gap-1.5 whitespace-nowrap px-4 py-2 text-xs font-semibold border border-blue-300 rounded-xl text-blue-700 hover:bg-blue-50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Request Clarification
            </button>
            <div className="w-px h-5 bg-border" />
            <button
              onClick={handleStart}
              disabled={blocking > 0 || starting}
              className={`inline-flex items-center gap-2 whitespace-nowrap px-6 py-2 text-xs font-black rounded-xl text-white transition-all shadow-sm ${
                blocking > 0
                  ? "bg-muted-foreground cursor-not-allowed"
                  : starting
                    ? "bg-primary/70 animate-pulse"
                    : "bg-primary hover:bg-primary/90 hover:shadow-md"
              }`}
            >
              {starting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Opening Workspace…
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Start Coding Now
                  <ChevronRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ActionModal type={modal} onClose={() => setModal(null)} />
    </div>
  );
}
