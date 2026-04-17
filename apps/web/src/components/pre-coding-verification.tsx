import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  User,
  Building2,
  FileText,
  Cpu,
  ShieldCheck,
  Clock,
  ArrowRight,
  ParkingCircle,
  MessageSquare,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Fingerprint,
  CalendarDays,
  Stethoscope,
  Layers,
  Brain,
  Flag,
  Eye,
  BadgeCheck,
  Zap,
  Lock,
  Unlock,
  CircleDot,
  ChevronDown,
  ChevronUp,
  Hash,
  Activity,
  BarChart3,
  ClipboardList,
  BookOpen,
  TriangleAlert,
  CircleCheck,
  Siren,
} from "lucide-react";

/* ═══════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════ */
type VerifyStatus = "idle" | "running" | "pass" | "warn" | "fail";
type FlagLevel = "critical" | "warning" | "info" | "pass";

interface RiskFlag {
  id: string;
  level: FlagLevel;
  title: string;
  detail: string;
  action?: string;
  blocking: boolean;
}

interface DocItem {
  id: string;
  name: string;
  type: string;
  pages: number;
  status: "complete" | "processing" | "failed" | "missing";
  ocrConfidence?: number;
  aiAnnotated: boolean;
  highlights: number;
  uploadedBy: string;
  uploadedAt: string;
}

/* ═══════════════════════════════════════════════
   MOCK DATA
═══════════════════════════════════════════════ */
const CHART = {
  id: "CHT-2024-0891",
  patientName: "Sharma, John Michael",
  mrn: "MRN-2024-0891",
  dob: "15 Mar 1968",
  age: 57,
  gender: "Male",
  insuranceId: "INS-TPA-9945331",
  matchScore: 99.8,
  encounterType: "Inpatient Hospitalization",
  admitDate: "14 Feb 2026",
  dischargeDate: "20 Feb 2026",
  los: 6,
  provider: "Dr. Priya Menon, MD",
  npiStatus: "Active — NPI 1098765432",
  facility: "Apollo Hospital, Bandra Kurla Complex, Mumbai",
  facilityContract: "Contracted — Network Tier 1",
  specialty: "Nephrology",
  workingDrg: "641",
  workingDrgDesc: "Misc Disorders of Kidney & Urinary Tract",
  drgWeight: 0.8214,
  project: "Q1 FY2026 Inpatient Coding",
  projectId: "PRJ-2026-003",
  priority: "High",
  slaDeadline: "23 Feb 2026, 17:00 IST",
  slaHrsLeft: 4.3,
  assignedCoder: "Sarah Johnson, CPC",
  auditor: "Deepak Kumar, CCS",
  auditLevel: "L2 — Concurrent Audit",
};

const PAYER_RECORD = {
  patientName: "Sharma, John Michael",
  mrn: "MRN-2024-0891",
  dob: "15 Mar 1968",
  gender: "Male",
  insuranceId: "INS-TPA-9945331",
};

const DOCUMENTS: DocItem[] = [
  {
    id: "D1",
    name: "Discharge Summary",
    type: "Discharge Summary",
    pages: 6,
    status: "complete",
    ocrConfidence: 99.2,
    aiAnnotated: true,
    highlights: 14,
    uploadedBy: "Medical Records Dept",
    uploadedAt: "20 Feb 2026, 14:32",
  },
  {
    id: "D2",
    name: "H&P (History & Physical)",
    type: "Clinical Note",
    pages: 5,
    status: "complete",
    ocrConfidence: 98.7,
    aiAnnotated: true,
    highlights: 9,
    uploadedBy: "Dr. Priya Menon",
    uploadedAt: "14 Feb 2026, 08:15",
  },
  {
    id: "D3",
    name: "Laboratory Report",
    type: "Lab Results",
    pages: 8,
    status: "complete",
    ocrConfidence: 99.5,
    aiAnnotated: true,
    highlights: 22,
    uploadedBy: "Lab Interface (HL7)",
    uploadedAt: "18 Feb 2026, 22:01",
  },
  {
    id: "D4",
    name: "Nursing Assessment",
    type: "Nursing Notes",
    pages: 10,
    status: "processing",
    ocrConfidence: undefined,
    aiAnnotated: false,
    highlights: 0,
    uploadedBy: "Nursing Staff – W4B",
    uploadedAt: "14 Feb 2026, 09:45",
  },
  {
    id: "D5",
    name: "Medication Reconciliation",
    type: "Med Rec",
    pages: 2,
    status: "complete",
    ocrConfidence: 97.8,
    aiAnnotated: true,
    highlights: 5,
    uploadedBy: "Pharmacy Interface",
    uploadedAt: "20 Feb 2026, 14:40",
  },
  {
    id: "D6",
    name: "Radiology Report",
    type: "Imaging",
    pages: 2,
    status: "missing",
    ocrConfidence: undefined,
    aiAnnotated: false,
    highlights: 0,
    uploadedBy: "—",
    uploadedAt: "—",
  },
];

const RISK_FLAGS: RiskFlag[] = [
  {
    id: "f1",
    level: "warning",
    blocking: false,
    title: "Radiology Report — Not Uploaded",
    detail:
      "A radiology report is expected for this encounter type (Nephrology Inpatient) but has not been uploaded. Chest X-ray or renal ultrasound may be referenced in clinical notes. Request upload before submitting final codes.",
    action: "Request Upload",
  },
  {
    id: "f2",
    level: "warning",
    blocking: false,
    title: "Nursing Assessment — OCR In Progress",
    detail:
      "DOC-D4 (Nursing Assessment, 10 pages) is still being processed by the OCR engine. AI suggestion coverage may be incomplete (~80% complete). Estimated completion in 3–5 minutes.",
    action: "Refresh Status",
  },
  {
    id: "f3",
    level: "warning",
    blocking: false,
    title: "Provider Query Recommended",
    detail:
      "Serum creatinine of 2.4 mg/dL with CKD Stage 3 is documented, but the attending's Assessment section does not explicitly link the two. A physician query may be required to clarify CKD as a complication of diabetes vs. standalone condition.",
    action: "Generate Query",
  },
  {
    id: "f4",
    level: "pass",
    blocking: false,
    title: "Duplicate Encounter Check — Passed",
    detail:
      "No duplicate encounter found for MRN-2024-0891 within the project window (Q1 FY2026). ADT cross-reference complete. Encounter is unique.",
    action: undefined,
  },
  {
    id: "f5",
    level: "info",
    blocking: false,
    title: "Prior Year Coding Reference",
    detail:
      "Patient was coded in MY2024 (Encounter: ENC-2024-0312) with ICD codes E11.9, I10, N18.3. Prior DRG was 638 (weight 0.97). Review for continuity and HCC risk adjustment.",
    action: "View Prior Year",
  },
  {
    id: "f6",
    level: "info",
    blocking: false,
    title: "HCC Risk — High Value Encounter",
    detail:
      "This encounter contains potential HCC-relevant codes (E11.22, N18.3). Accurate and complete coding will directly impact risk adjustment factor (RAF) scores for this member.",
    action: undefined,
  },
];

/* ═══════════════════════════════════════════════
   HELPER COMPONENTS
═══════════════════════════════════════════════ */
function StatusPill({
  status,
  label,
}: {
  status: VerifyStatus;
  label?: string;
}) {
  const cfg = {
    idle: {
      bg: "bg-slate-100 border-slate-200",
      text: "text-slate-600",
      icon: CircleDot,
      txt: "Not Verified",
    },
    running: {
      bg: "bg-blue-50 border-blue-200",
      text: "text-blue-600",
      icon: RefreshCw,
      txt: "Checking…",
    },
    pass: {
      bg: "bg-emerald-50 border-emerald-200",
      text: "text-emerald-700",
      icon: CheckCircle2,
      txt: "Verified",
    },
    warn: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-700",
      icon: AlertTriangle,
      txt: "Attention",
    },
    fail: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-700",
      icon: XCircle,
      txt: "Failed",
    },
  }[status];
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-black ${cfg.bg} ${cfg.text}`}
    >
      <Icon
        className={`w-2.5 h-2.5 ${status === "running" ? "animate-spin" : ""}`}
      />
      {label ?? cfg.txt}
    </span>
  );
}

function FieldRow({
  label,
  chartVal,
  payerVal,
  match,
}: {
  label: string;
  chartVal: string;
  payerVal?: string;
  match?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2 border-b border-border/40 last:border-0">
      <span className="text-[10px] text-muted-foreground w-28 flex-shrink-0">
        {label}
      </span>
      <span className="text-[10px] font-semibold text-foreground flex-1">
        {chartVal}
      </span>
      {payerVal !== undefined && (
        <span className="text-[10px] text-muted-foreground flex-1">
          {payerVal}
        </span>
      )}
      {match !== undefined &&
        (match ? (
          <span className="flex items-center gap-1 text-[9px] font-black text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />
            Match
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[9px] font-black text-red-600">
            <XCircle className="w-3 h-3" />
            Mismatch
          </span>
        ))}
    </div>
  );
}

function SectionCard({
  icon: Icon,
  title,
  subtitle,
  status,
  verified,
  onVerify,
  verifyLabel,
  verifiedLabel,
  children,
  accentColor,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  status: VerifyStatus;
  verified: boolean;
  onVerify: () => void;
  verifyLabel?: string;
  verifiedLabel?: string;
  children: React.ReactNode;
  accentColor?: string;
}) {
  const borderCls = verified
    ? "border-emerald-300"
    : status === "warn"
      ? "border-amber-300"
      : status === "fail"
        ? "border-red-300"
        : "border-border";
  const bgCls = verified
    ? "bg-emerald-50/30"
    : status === "warn"
      ? "bg-amber-50/20"
      : "bg-card";

  return (
    <div
      className={`rounded-2xl border-2 ${borderCls} ${bgCls} overflow-hidden shadow-sm transition-all`}
    >
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border/60 bg-card">
        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${accentColor ?? "bg-primary/10"}`}
        >
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-black text-foreground leading-none">
            {title}
          </p>
          {subtitle && (
            <p className="text-[9px] text-muted-foreground mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        <StatusPill status={status} />
        <button
          onClick={onVerify}
          disabled={verified}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all whitespace-nowrap ${
            verified
              ? "border-emerald-300 bg-emerald-50 text-emerald-700 cursor-default"
              : "border-primary bg-primary text-white hover:opacity-90 shadow-sm"
          }`}
        >
          {verified ? (
            <>
              <CheckCircle2 className="w-3 h-3" />
              {verifiedLabel ?? "Verified"}
            </>
          ) : (
            <>{verifyLabel ?? "Confirm"}</>
          )}
        </button>
      </div>
      {/* Card body */}
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
export function PreCodingVerification({
  onBeginCoding,
  onGoBack,
}: {
  onBeginCoding: () => void;
  onGoBack: () => void;
}) {
  /* ─── Verification state ─── */
  const [memberVerified, setMemberVerified] = useState(false);
  const [encounterVerified, setEncounterVerified] = useState(false);
  const [docsAcknowledged, setDocsAcknowledged] = useState(false);
  const [aiConfirmed, setAiConfirmed] = useState(false);
  const [acknowledgedFlags, setAcknowledgedFlags] = useState<Set<string>>(
    new Set(["f4"]),
  ); // duplicate check auto-passed
  const [running, setRunning] = useState<string | null>(null);

  /* ─── UI state ─── */
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);
  const [expandedFlag, setExpandedFlag] = useState<string | null>(null);
  const [showSubmitPulse, setShowSubmitPulse] = useState(false);
  const [launchAnim, setLaunchAnim] = useState(false);

  /* ─── Derived ─── */
  const totalDocs = DOCUMENTS.length;
  const completeDocs = DOCUMENTS.filter((d) => d.status === "complete").length;
  const processingDocs = DOCUMENTS.filter(
    (d) => d.status === "processing",
  ).length;
  const missingDocs = DOCUMENTS.filter((d) => d.status === "missing").length;
  const totalPages = DOCUMENTS.filter((d) => d.status === "complete").reduce(
    (s, d) => s + d.pages,
    0,
  );
  const totalHighlights = DOCUMENTS.reduce((s, d) => s + d.highlights, 0);

  const nonPassFlags = RISK_FLAGS.filter(
    (f) => f.level !== "pass" && f.level !== "info",
  );
  const blockingFlags = RISK_FLAGS.filter((f) => f.blocking);
  const allFlagsAcked = nonPassFlags.every((f) => acknowledgedFlags.has(f.id));
  const noBlockingFlags = blockingFlags.every((f) =>
    acknowledgedFlags.has(f.id),
  );

  const allVerified =
    memberVerified &&
    encounterVerified &&
    docsAcknowledged &&
    aiConfirmed &&
    allFlagsAcked;

  const steps = [
    { label: "Member", done: memberVerified },
    { label: "Encounter", done: encounterVerified },
    { label: "Documents", done: docsAcknowledged },
    { label: "AI Ready", done: aiConfirmed },
    { label: "Risk Flags", done: allFlagsAcked },
  ];
  const stepsDone = steps.filter((s) => s.done).length;

  /* ─── Simulate running check then setting state ─── */
  function runCheck(key: string, setter: (v: boolean) => void) {
    setRunning(key);
    setTimeout(() => {
      setter(true);
      setRunning(null);
    }, 900);
  }

  /* Pulse submit when all done */
  useEffect(() => {
    if (allVerified) setShowSubmitPulse(true);
  }, [allVerified]);

  const handleBeginCoding = () => {
    setLaunchAnim(true);
    setTimeout(onBeginCoding, 700);
  };

  /* ─── Flag levels config ─── */
  const flagCfg: Record<
    FlagLevel,
    {
      bg: string;
      border: string;
      icon: React.ElementType;
      iconCls: string;
      titleCls: string;
      textCls: string;
      badge: string;
    }
  > = {
    critical: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: Siren,
      iconCls: "text-red-600",
      titleCls: "text-red-800",
      textCls: "text-red-600",
      badge: "bg-red-100 border-red-300 text-red-700",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      icon: TriangleAlert,
      iconCls: "text-amber-600",
      titleCls: "text-amber-800",
      textCls: "text-amber-600",
      badge: "bg-amber-100 border-amber-300 text-amber-700",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-100",
      icon: Info,
      iconCls: "text-blue-500",
      titleCls: "text-blue-800",
      textCls: "text-blue-600",
      badge: "bg-blue-100 border-blue-200 text-blue-600",
    },
    pass: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      icon: CircleCheck,
      iconCls: "text-emerald-600",
      titleCls: "text-emerald-800",
      textCls: "text-emerald-600",
      badge: "bg-emerald-100 border-emerald-300 text-emerald-700",
    },
  };

  return (
    <div
      className={`space-y-5 transition-all duration-500 ${launchAnim ? "scale-98 opacity-0" : "opacity-100"}`}
    >
      {/* ═══════════ PAGE HEADER ═══════════ */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Work Queue
          </button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-foreground">
            Pre-Coding Verification
          </span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-black text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-lg">
            {CHART.id}
          </span>
          <span className="text-sm font-bold text-foreground">
            {CHART.patientName}
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            · {CHART.mrn}
          </span>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
            {CHART.priority.toUpperCase()}
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 border border-border rounded-lg px-2 py-0.5">
            <Clock className="w-3 h-3" />
            {CHART.slaHrsLeft}h SLA remaining
          </span>
        </div>
      </div>

      {/* ═══════════ PROGRESS STEPS ═══════════ */}
      <div className="bg-card border border-border rounded-2xl px-6 py-4 shadow-sm">
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-center flex-1 min-w-0">
              {/* Node */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                    step.done
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : "bg-card border-border text-muted-foreground"
                  }`}
                >
                  {step.done ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <span className="text-[11px] font-black">{i + 1}</span>
                  )}
                </div>
                <span
                  className={`text-[9px] font-bold mt-1 whitespace-nowrap ${step.done ? "text-emerald-600" : "text-muted-foreground"}`}
                >
                  {step.label}
                </span>
              </div>
              {/* Connector */}
              {i < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-all ${step.done ? "bg-emerald-400" : "bg-border"}`}
                />
              )}
            </div>
          ))}
          {/* Arrow to Begin Coding */}
          <div className="flex items-center flex-shrink-0 ml-1">
            <div
              className={`w-px h-0.5 w-6 transition-all ${allVerified ? "bg-emerald-400" : "bg-border"}`}
            />
            <div className={`flex flex-col items-center ml-1`}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  allVerified
                    ? "bg-primary border-primary text-white shadow-md"
                    : "bg-muted border-border text-muted-foreground"
                }`}
              >
                {allVerified ? (
                  <Unlock className="w-4 h-4" />
                ) : (
                  <Lock className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-[9px] font-black mt-1 whitespace-nowrap ${allVerified ? "text-primary" : "text-muted-foreground"}`}
              >
                Begin Coding
              </span>
            </div>
          </div>
        </div>

        {/* Progress summary */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${(stepsDone / steps.length) * 100}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
            {stepsDone} / {steps.length} checks complete
          </span>
          {allVerified && (
            <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All checks passed — ready to code
            </span>
          )}
        </div>
      </div>

      {/* ═══════════ MAIN GRID ═══════════ */}
      <div className="grid grid-cols-2 gap-4">
        {/* ── 1. MEMBER VERIFICATION ── */}
        <SectionCard
          icon={Fingerprint}
          title="Member Verification"
          subtitle="Identity cross-check against payer master record"
          status={
            memberVerified ? "pass" : running === "member" ? "running" : "idle"
          }
          verified={memberVerified}
          onVerify={() => runCheck("member", setMemberVerified)}
          verifyLabel={running === "member" ? "Checking…" : "Confirm Identity"}
          verifiedLabel="Identity Confirmed"
          accentColor="bg-blue-100"
        >
          {/* Match Score banner */}
          <div className="flex items-center gap-3 mb-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-800">
                Member Match Score
              </p>
              <p className="text-2xl font-black text-emerald-600 leading-none">
                {CHART.matchScore}%
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[9px] text-emerald-600 font-bold">
                Payer Record
              </p>
              <p className="text-[9px] text-emerald-600 font-bold">Matched ✓</p>
            </div>
          </div>
          {/* Comparison table header */}
          <div className="flex items-center gap-3 pb-1 mb-1">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider w-28">
              Field
            </span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider flex-1">
              Chart Record
            </span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider flex-1">
              Payer Record
            </span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider w-16 text-right">
              Status
            </span>
          </div>
          <FieldRow
            label="Patient Name"
            chartVal={CHART.patientName}
            payerVal={PAYER_RECORD.patientName}
            match={true}
          />
          <FieldRow
            label="MRN"
            chartVal={CHART.mrn}
            payerVal={PAYER_RECORD.mrn}
            match={true}
          />
          <FieldRow
            label="Date of Birth"
            chartVal={CHART.dob}
            payerVal={PAYER_RECORD.dob}
            match={true}
          />
          <FieldRow
            label="Gender"
            chartVal={CHART.gender}
            payerVal={PAYER_RECORD.gender}
            match={true}
          />
          <FieldRow
            label="Insurance ID"
            chartVal={CHART.insuranceId}
            payerVal={PAYER_RECORD.insuranceId}
            match={true}
          />
          <FieldRow label="Age (calc.)" chartVal={`${CHART.age} years`} />
        </SectionCard>

        {/* ── 2. ENCOUNTER VERIFICATION ── */}
        <SectionCard
          icon={CalendarDays}
          title="Encounter Verification"
          subtitle="ADT cross-reference and provider NPI validation"
          status={
            encounterVerified
              ? "pass"
              : running === "encounter"
                ? "running"
                : "idle"
          }
          verified={encounterVerified}
          onVerify={() => runCheck("encounter", setEncounterVerified)}
          verifyLabel={
            running === "encounter" ? "Checking…" : "Confirm Encounter"
          }
          verifiedLabel="Encounter Confirmed"
          accentColor="bg-teal-100"
        >
          {/* Key encounter stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              {
                label: "Encounter Type",
                value: CHART.encounterType.split(" ")[0],
              },
              { label: "Length of Stay", value: `${CHART.los} Days` },
              { label: "Working DRG", value: CHART.workingDrg },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-2.5 bg-muted/40 rounded-xl border border-border"
              >
                <p className="text-[10px] font-black text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-base font-black text-foreground mt-0.5">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
          <FieldRow
            label="Encounter Type"
            chartVal={CHART.encounterType}
            match={true}
          />
          <FieldRow
            label="Admission Date"
            chartVal={`${CHART.admitDate} — ADT confirmed`}
            match={true}
          />
          <FieldRow
            label="Discharge Date"
            chartVal={`${CHART.dischargeDate} — ADT confirmed`}
            match={true}
          />
          <FieldRow label="Provider" chartVal={CHART.provider} match={true} />
          <FieldRow
            label="NPI Status"
            chartVal={CHART.npiStatus}
            match={true}
          />
          <FieldRow label="Facility" chartVal={CHART.facility} />
          <FieldRow label="Network Status" chartVal={CHART.facilityContract} />
          <FieldRow
            label="DRG Weight"
            chartVal={`${CHART.drgWeight} — ${CHART.workingDrgDesc}`}
          />
        </SectionCard>

        {/* ── 3. DOCUMENTATION CHECK ── */}
        <SectionCard
          icon={FileText}
          title="Documentation Check"
          subtitle={`${totalDocs} documents · ${totalPages} pages ready · ${missingDocs + processingDocs} requiring attention`}
          status={
            docsAcknowledged
              ? "pass"
              : running === "docs"
                ? "running"
                : missingDocs > 0
                  ? "warn"
                  : processingDocs > 0
                    ? "warn"
                    : "idle"
          }
          verified={docsAcknowledged}
          onVerify={() => runCheck("docs", setDocsAcknowledged)}
          verifyLabel={
            running === "docs" ? "Reviewing…" : "Acknowledge & Proceed"
          }
          verifiedLabel="Documents Acknowledged"
          accentColor="bg-violet-100"
        >
          {/* Doc stats */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              {
                label: "Total Docs",
                value: totalDocs,
                color: "text-foreground",
              },
              {
                label: "OCR Ready",
                value: completeDocs,
                color: "text-emerald-600",
              },
              {
                label: "Processing",
                value: processingDocs,
                color:
                  processingDocs > 0
                    ? "text-amber-600"
                    : "text-muted-foreground",
              },
              {
                label: "Missing",
                value: missingDocs,
                color:
                  missingDocs > 0 ? "text-red-600" : "text-muted-foreground",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-2 bg-muted/40 rounded-xl border border-border"
              >
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-muted-foreground font-bold">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
          {/* OCR readiness bar */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                OCR & AI Coverage
              </span>
              <span className="text-[9px] font-bold text-foreground">
                {completeDocs}/{totalDocs} docs · {totalHighlights} AI
                highlights
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${(completeDocs / totalDocs) * 100}%` }}
              />
            </div>
          </div>
          {/* Document list */}
          <div className="space-y-1.5">
            {DOCUMENTS.map((doc) => {
              const statusCfg = {
                complete: {
                  bg: "bg-emerald-50",
                  border: "border-emerald-200",
                  badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
                  label: "OCR Complete",
                  icon: CheckCircle2,
                  iconCls: "text-emerald-500",
                },
                processing: {
                  bg: "bg-amber-50",
                  border: "border-amber-200",
                  badge: "bg-amber-100 text-amber-700 border-amber-200",
                  label: "OCR Processing",
                  icon: RefreshCw,
                  iconCls: "text-amber-500",
                },
                failed: {
                  bg: "bg-red-50",
                  border: "border-red-200",
                  badge: "bg-red-100 text-red-700 border-red-200",
                  label: "OCR Failed",
                  icon: XCircle,
                  iconCls: "text-red-500",
                },
                missing: {
                  bg: "bg-red-50",
                  border: "border-red-200",
                  badge: "bg-red-100 text-red-700 border-red-200",
                  label: "Missing",
                  icon: AlertCircle,
                  iconCls: "text-red-500",
                },
              }[doc.status];
              const DocIcon = statusCfg.icon;
              const isExp = expandedDoc === doc.id;
              return (
                <div
                  key={doc.id}
                  className={`rounded-xl border ${statusCfg.bg} ${statusCfg.border} overflow-hidden`}
                >
                  <button
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-left"
                    onClick={() => setExpandedDoc(isExp ? null : doc.id)}
                  >
                    <DocIcon
                      className={`w-3.5 h-3.5 flex-shrink-0 ${statusCfg.iconCls} ${doc.status === "processing" ? "animate-spin" : ""}`}
                    />
                    <span className="text-[10px] font-bold text-foreground flex-1 truncate">
                      {doc.name}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {doc.pages}p
                    </span>
                    {doc.aiAnnotated && (
                      <span className="text-[8px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1 py-0.5 rounded">
                        AI ✦{doc.highlights}
                      </span>
                    )}
                    <span
                      className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${statusCfg.badge}`}
                    >
                      {statusCfg.label}
                    </span>
                    {isExp ? (
                      <ChevronUp className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                  {isExp && (
                    <div className="px-3 pb-2.5 pt-1 border-t border-border/40 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[9px]">
                      <span className="text-muted-foreground">Type:</span>{" "}
                      <span className="font-semibold">{doc.type}</span>
                      <span className="text-muted-foreground">
                        Uploaded by:
                      </span>
                      <span className="font-semibold">{doc.uploadedBy}</span>
                      <span className="text-muted-foreground">
                        Uploaded at:
                      </span>
                      <span className="font-semibold">{doc.uploadedAt}</span>
                      {doc.ocrConfidence && (
                        <>
                          <span className="text-muted-foreground">
                            OCR Confidence:
                          </span>
                          <span className="font-black text-emerald-600">
                            {doc.ocrConfidence}%
                          </span>
                        </>
                      )}
                      {doc.status === "missing" && (
                        <>
                          <span className="text-muted-foreground col-span-2 text-red-600 font-bold">
                            ⚠ Document not uploaded — request from facility or
                            proceed without.
                          </span>
                        </>
                      )}
                      {doc.status === "processing" && (
                        <>
                          <span className="text-muted-foreground col-span-2 text-amber-600 font-bold">
                            ⏳ OCR in progress — AI suggestions may be
                            incomplete until done (~3–5 min).
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ── 4. AI READINESS ── */}
        <SectionCard
          icon={Brain}
          title="AI Readiness Check"
          subtitle="Model status, OCR coverage and code suggestion availability"
          status={aiConfirmed ? "pass" : running === "ai" ? "running" : "idle"}
          verified={aiConfirmed}
          onVerify={() => runCheck("ai", setAiConfirmed)}
          verifyLabel={running === "ai" ? "Verifying…" : "Confirm AI Ready"}
          verifiedLabel="AI Ready Confirmed"
          accentColor="bg-emerald-100"
        >
          {/* AI stats row */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {[
              {
                label: "ICD-10 Suggestions",
                value: "12 codes",
                sub: "Avg 87.4% confidence",
                icon: Hash,
                ok: true,
              },
              {
                label: "CPT-4 Suggestions",
                value: "6 codes",
                sub: "Avg 84.1% confidence",
                icon: Activity,
                ok: true,
              },
              {
                label: "OCR Coverage",
                value: `${completeDocs}/${totalDocs} docs`,
                sub: `${totalPages} pages indexed`,
                icon: FileText,
                ok: completeDocs === totalDocs,
              },
              {
                label: "AI Highlights",
                value: totalHighlights.toString(),
                sub: "Terms annotated in docs",
                icon: Zap,
                ok: true,
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className={`p-3 rounded-xl border ${s.ok ? "border-emerald-200 bg-emerald-50/60" : "border-amber-200 bg-amber-50/60"}`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon
                      className={`w-3 h-3 ${s.ok ? "text-emerald-600" : "text-amber-600"}`}
                    />
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider ${s.ok ? "text-emerald-700" : "text-amber-700"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p
                    className={`text-lg font-black ${s.ok ? "text-emerald-700" : "text-amber-700"}`}
                  >
                    {s.value}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{s.sub}</p>
                </div>
              );
            })}
          </div>
          {/* Model info */}
          <div className="space-y-1.5">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-2">
              Active AI Models
            </p>
            {[
              {
                model: "ICD-BERT v2.4.1",
                task: "ICD-10-CM Classification",
                status: "Active",
                accuracy: "94.7% F1",
              },
              {
                model: "CPT-GPT v1.9",
                task: "CPT-4 Procedure Coding",
                status: "Active",
                accuracy: "91.3% F1",
              },
              {
                model: "NLP-OCR Engine v3.1",
                task: "Document OCR & Term Extraction",
                status: "Active",
                accuracy: "99.1% char acc.",
              },
              {
                model: "HCC-Risk v1.2",
                task: "HCC Risk Adjustment Scoring",
                status: "Active",
                accuracy: "95.4% AUC",
              },
            ].map((m) => (
              <div
                key={m.model}
                className="flex items-center gap-2 py-1.5 border-b border-border/40 last:border-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-black text-foreground">
                    {m.model}
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    {" "}
                    — {m.task}
                  </span>
                </div>
                <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded whitespace-nowrap">
                  {m.accuracy}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ═══════════ RISK FLAGS ═══════════ */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-muted/5">
          <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0">
            <Flag className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div>
            <p className="text-[12px] font-black text-foreground">
              Risk Flags & Compliance Checks
            </p>
            <p className="text-[9px] text-muted-foreground">
              Acknowledge all warnings to unlock Begin Coding
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {[
              {
                level: "critical" as FlagLevel,
                label: "Critical",
                count: RISK_FLAGS.filter((f) => f.level === "critical").length,
              },
              {
                level: "warning" as FlagLevel,
                label: "Warning",
                count: RISK_FLAGS.filter((f) => f.level === "warning").length,
              },
              {
                level: "info" as FlagLevel,
                label: "Info",
                count: RISK_FLAGS.filter((f) => f.level === "info").length,
              },
              {
                level: "pass" as FlagLevel,
                label: "Passed",
                count: RISK_FLAGS.filter((f) => f.level === "pass").length,
              },
            ]
              .filter((b) => b.count > 0)
              .map((b) => {
                const cfg = flagCfg[b.level];
                const BIcon = cfg.icon;
                return (
                  <span
                    key={b.level}
                    className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-1 rounded-full border ${cfg.badge}`}
                  >
                    <BIcon className="w-2.5 h-2.5" />
                    {b.count} {b.label}
                  </span>
                );
              })}
            {allFlagsAcked && (
              <StatusPill status="pass" label="All Acknowledged" />
            )}
          </div>
        </div>
        <div className="p-4 space-y-2.5">
          {RISK_FLAGS.map((flag) => {
            const cfg = flagCfg[flag.level];
            const FIcon = cfg.icon;
            const isAcked = acknowledgedFlags.has(flag.id);
            const isExp = expandedFlag === flag.id;
            const autoAcked = flag.level === "pass" || flag.level === "info";

            return (
              <div
                key={flag.id}
                className={`rounded-xl border overflow-hidden transition-all ${
                  isAcked
                    ? "opacity-60 border-border bg-muted/20"
                    : `${cfg.bg} ${cfg.border}`
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-2.5">
                  <FIcon
                    className={`w-4 h-4 flex-shrink-0 ${isAcked ? "text-muted-foreground" : cfg.iconCls}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`text-[11px] font-black ${isAcked ? "text-muted-foreground line-through" : cfg.titleCls}`}
                      >
                        {flag.title}
                      </p>
                      {isAcked && (
                        <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                          Acknowledged
                        </span>
                      )}
                      {flag.blocking && !isAcked && (
                        <span className="text-[8px] font-black text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded-full">
                          BLOCKING
                        </span>
                      )}
                    </div>
                    {!isExp && (
                      <p
                        className={`text-[9px] mt-0.5 line-clamp-1 ${isAcked ? "text-muted-foreground" : cfg.textCls}`}
                      >
                        {flag.detail}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => setExpandedFlag(isExp ? null : flag.id)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/5 transition-colors"
                    >
                      {isExp ? (
                        <ChevronUp className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      )}
                    </button>
                    {!isAcked && !autoAcked && (
                      <button
                        onClick={() =>
                          setAcknowledgedFlags(
                            (prev) => new Set([...prev, flag.id]),
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-border text-[9px] font-black text-foreground hover:bg-muted transition-colors whitespace-nowrap shadow-sm"
                      >
                        <Check className="w-2.5 h-2.5" />
                        Acknowledge
                      </button>
                    )}
                    {flag.action && !isAcked && (
                      <button
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[9px] font-black transition-colors whitespace-nowrap ${cfg.badge}`}
                      >
                        {flag.action}
                      </button>
                    )}
                  </div>
                </div>
                {isExp && (
                  <div className={`px-4 pb-3 pt-0 border-t ${cfg.border}`}>
                    <p
                      className={`text-[10px] leading-relaxed mt-2 ${isAcked ? "text-muted-foreground" : cfg.textCls}`}
                    >
                      {flag.detail}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {!isAcked && !autoAcked && (
                        <button
                          onClick={() =>
                            setAcknowledgedFlags(
                              (prev) => new Set([...prev, flag.id]),
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-border text-[10px] font-black text-foreground hover:bg-muted transition-colors shadow-sm"
                        >
                          <Check className="w-3 h-3" />
                          Mark Acknowledged
                        </button>
                      )}
                      {flag.action && (
                        <button
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-black transition-colors ${cfg.badge}`}
                        >
                          {flag.action} <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════ CHART CONTEXT STRIP ═══════════ */}
      <div className="bg-card border border-border rounded-2xl px-5 py-3 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
            Chart & Project Context
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-6 gap-y-1.5">
          {[
            ["Project", CHART.project],
            ["Assigned Coder", CHART.assignedCoder],
            ["Auditor", CHART.auditor],
            ["Audit Level", CHART.auditLevel],
            ["Specialty", CHART.specialty],
            ["Facility", CHART.facility],
            ["SLA Deadline", CHART.slaDeadline],
            [
              "DRG (Working)",
              `${CHART.workingDrg} — ${CHART.workingDrgDesc} (Wt: ${CHART.drgWeight})`,
            ],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col">
              <span className="text-[9px] text-muted-foreground">{k}</span>
              <span className="text-[10px] font-semibold text-foreground">
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ FOOTER ACTIONS ═══════════ */}
      <div className="sticky bottom-0 -mx-6 -mb-6 bg-card border-t-2 border-border px-6 py-3 flex items-center gap-3 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {/* Left: Summary */}
        <div className="flex items-center gap-3 flex-1">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${
              allVerified
                ? "bg-emerald-500 border-emerald-500"
                : "bg-muted border-border"
            }`}
          >
            {allVerified ? (
              <Unlock className="w-4 h-4 text-white" />
            ) : (
              <Lock className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <p
              className={`text-xs font-black ${allVerified ? "text-emerald-600" : "text-foreground"}`}
            >
              {allVerified
                ? "All checks passed — ready to begin coding"
                : `${stepsDone} of ${steps.length} verification checks complete`}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {allVerified
                ? `${CHART.patientName} · ${CHART.id} · Coding can begin`
                : "Complete all sections and acknowledge risk flags to unlock Begin Coding"}
            </p>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-sm font-bold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground"
          >
            <ParkingCircle className="w-4 h-4" />
            Park Chart
          </button>
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-sm font-bold border border-amber-200 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors text-amber-700">
            <MessageSquare className="w-4 h-4" />
            Request Clarification
          </button>

          <div className="w-px h-6 bg-border" />

          {/* Begin Coding — disabled until all verified */}
          <div className="relative">
            {showSubmitPulse && allVerified && (
              <span className="absolute inset-0 rounded-xl bg-primary opacity-30 animate-ping" />
            )}
            <button
              onClick={allVerified ? handleBeginCoding : undefined}
              disabled={!allVerified}
              className={`relative inline-flex items-center gap-2 whitespace-nowrap px-5 py-2.5 text-sm font-black rounded-xl transition-all shadow-sm ${
                allVerified
                  ? "bg-primary text-white hover:opacity-90 cursor-pointer"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
              }`}
            >
              {allVerified ? (
                <Unlock className="w-4 h-4" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {launchAnim ? "Launching…" : "Begin Coding"}
              {allVerified && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
