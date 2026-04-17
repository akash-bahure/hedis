import { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  ParkingCircle,
  ArrowRight,
  User,
  CalendarDays,
  FileText,
  Cpu,
  Clock,
  Flag,
  Shield,
  RotateCcw,
  Hash,
  Activity,
} from "lucide-react";

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
type CheckStatus = "loading" | "pass" | "warn" | "fail";

interface Check {
  id: string;
  label: string;
  icon: React.ElementType;
  passDetail: string;
  failTitle?: string;
  failDetail?: string;
  status: CheckStatus;
  blocking: boolean;
}

/* ─────────────────────────────────────────────
   STATIC DATA  — matches work queue row CHT-78401
───────────────────────────────────────────── */
const CHART = {
  id: "CHT-78401",
  patientName: "Anderson, Jennifer K.",
  mrn: "MBR-2026-00142",
  dob: "15 Mar 1965",
  gender: "Female",
  encounterType: "Inpatient",
  admitDate: "14 Jan 2026",
  dischargeDate: "18 Jan 2026",
  los: "4 days",
  provider: "Dr. Rajesh Sharma, MD",
  facility: "Apollo Hospital – New Delhi",
  specialty: "General Medicine",
  workingDrg: "871 — Septicemia, Severe Sepsis",
  aiSuggestions: { icd: 9, cpt: 4, avgConf: 88.3 },
  priority: "High",
  slaHours: 3.4,
  slaStatus: "At Risk" as const,
};

const DOCS = [
  { name: "Discharge Summary", pages: 6, ocr: "Complete", conf: 99.2 },
  { name: "Laboratory Report", pages: 4, ocr: "Complete", conf: 98.7 },
  { name: "Operative/Procedure Note", pages: 14, ocr: "Complete", conf: 97.4 },
  { name: "Nursing Assessment", pages: 8, ocr: "Processing", conf: null },
  { name: "Radiology Report", pages: 0, ocr: "Missing", conf: null },
];

/* checks fire in sequence with staggered delays */
const CHECK_DELAYS = [400, 700, 1000, 1350];

const INITIAL_CHECKS: Check[] = [
  {
    id: "member",
    label: "Member Match",
    icon: User,
    passDetail: "99.8% confidence · MBR-2026-00142 verified",
    status: "loading",
    blocking: false,
  },
  {
    id: "encounter",
    label: "Encounter Validity",
    icon: CalendarDays,
    passDetail: "ADT confirmed · 14 Jan – 18 Jan 2026",
    status: "loading",
    blocking: false,
  },
  {
    id: "docs",
    label: "Documentation",
    icon: FileText,
    passDetail: "3 of 5 documents OCR ready",
    failTitle: "Radiology Report not uploaded",
    failDetail:
      "1 document missing, 1 OCR processing. You may proceed; AI suggestions will be incomplete.",
    status: "loading",
    blocking: false, // warning only — does not block coding
  },
  {
    id: "ocr",
    label: "OCR & AI Status",
    icon: Cpu,
    passDetail: "9 ICD · 4 CPT suggestions ready · Avg 88.3% confidence",
    status: "loading",
    blocking: false,
  },
];

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export function VerificationSlidePanel({
  onBeginCoding,
  onClose,
}: {
  onBeginCoding: () => void;
  onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [expanded, setExpanded] = useState(false);
  const [launching, setLaunching] = useState(false);

  /* slide in on mount */
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    return () => clearTimeout(t);
  }, []);

  /* staggered check resolution */
  useEffect(() => {
    const results: CheckStatus[] = ["pass", "pass", "warn", "pass"];
    const timers = CHECK_DELAYS.map((delay, i) =>
      setTimeout(() => {
        setChecks((prev) =>
          prev.map((c, idx) => (idx === i ? { ...c, status: results[i] } : c)),
        );
      }, delay),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  /* derived */
  const allResolved = checks.every((c) => c.status !== "loading");
  const failures = checks.filter(
    (c) => c.status === "fail" || c.status === "warn",
  );
  const blockingFails = checks.filter((c) => c.blocking && c.status === "fail");
  const canProceed = allResolved && blockingFails.length === 0;
  const hasWarnings = failures.length > 0;

  const handleBegin = () => {
    setLaunching(true);
    setTimeout(onBeginCoding, 500);
  };

  /* ── check row renderer ── */
  const CheckRow = ({ check }: { check: Check }) => {
    const Icon = check.icon;
    const cfg = {
      loading: {
        icon: Loader2,
        cls: "text-muted-foreground animate-spin",
        label: "text-muted-foreground",
        detail: "Checking…",
        badge: null,
      },
      pass: {
        icon: CheckCircle2,
        cls: "text-emerald-500",
        label: "text-foreground",
        detail: check.passDetail,
        badge: null,
      },
      warn: {
        icon: AlertTriangle,
        cls: "text-amber-500",
        label: "text-foreground",
        detail: check.passDetail,
        badge: (
          <span className="text-[9px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
            Attention
          </span>
        ),
      },
      fail: {
        icon: XCircle,
        cls: "text-red-500",
        label: "text-foreground",
        detail: check.failTitle ?? "",
        badge: (
          <span className="text-[9px] font-black text-red-700 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded-full">
            Failed
          </span>
        ),
      },
    }[check.status];
    const StatusIcon = cfg.icon;

    return (
      <div
        className={`flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0 transition-all duration-300 ${
          check.status === "loading" ? "opacity-50" : "opacity-100"
        }`}
      >
        {/* Domain icon */}
        <Icon className="w-3.5 h-3.5 text-muted-foreground/50 mt-0.5 flex-shrink-0" />
        {/* Label + detail */}
        <div className="flex-1 min-w-0">
          <span className={`text-[11px] font-bold ${cfg.label}`}>
            {check.label}
          </span>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug truncate">
            {cfg.detail}
          </p>
        </div>
        {/* Status badge */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {cfg.badge}
          <StatusIcon className={`w-4 h-4 ${cfg.cls}`} />
        </div>
      </div>
    );
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 bg-slate-900/25 backdrop-blur-[1.5px] z-40 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      {/* ── Panel ── */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-[420px] bg-card border-l border-border shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          visible ? "translate-x-0" : "translate-x-full"
        } ${launching ? "opacity-0 translate-x-8" : ""}`}
      >
        {/* ══ Header ══ */}
        <div className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-border">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                Pre-Coding Verification
              </p>
              <h2 className="text-[15px] font-black text-foreground leading-tight">
                {CHART.patientName}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors flex-shrink-0 mt-0.5"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Chart meta chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-mono text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
              {CHART.id}
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              {CHART.mrn}
            </span>
            <span className="text-muted-foreground text-[10px]">·</span>
            <span className="text-[10px] text-foreground">
              {CHART.encounterType}
            </span>
            <span className="text-muted-foreground text-[10px]">·</span>
            <span
              className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                CHART.slaStatus === "At Risk"
                  ? "bg-amber-50 border-amber-200 text-amber-700"
                  : CHART.slaStatus === "Breached"
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
              }`}
            >
              <Clock className="w-2.5 h-2.5 inline mr-0.5 -mt-0.5" />
              {CHART.slaHours}h · {CHART.slaStatus}
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded border bg-red-50 border-red-200 text-red-700">
              {CHART.priority}
            </span>
          </div>
        </div>

        {/* ══ Scrollable body ══ */}
        <div className="flex-1 overflow-y-auto">
          {/* ── System Checks ── */}
          <div className="px-5 pt-4 pb-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                System Checks
              </p>
              {allResolved && (
                <span
                  className={`text-[9px] font-bold flex items-center gap-1 ${hasWarnings ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {hasWarnings ? (
                    <>
                      <AlertTriangle className="w-3 h-3" />
                      {failures.length} attention required
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      All checks passed
                    </>
                  )}
                </span>
              )}
            </div>
            <div>
              {checks.map((c) => (
                <CheckRow key={c.id} check={c} />
              ))}
            </div>
          </div>

          {/* ── Failed / Attention items (only when resolved + have issues) ── */}
          {allResolved && failures.length > 0 && (
            <div className="mx-5 mb-4 rounded-xl border border-amber-200 bg-amber-50/60 overflow-hidden">
              <div className="px-3.5 py-2.5 border-b border-amber-200/70 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="text-[10px] font-black text-amber-800">
                  {failures.filter((f) => f.blocking).length > 0
                    ? "Blocking Issues"
                    : "Non-Blocking Warnings"}
                </span>
              </div>
              <div className="px-3.5 py-3 space-y-2.5">
                {failures.map((f) => (
                  <div key={f.id}>
                    <p className="text-[10px] font-bold text-amber-900">
                      {f.failTitle ?? f.label}
                    </p>
                    {f.failDetail && (
                      <p className="text-[10px] text-amber-700 mt-0.5 leading-relaxed">
                        {f.failDetail}
                      </p>
                    )}
                  </div>
                ))}
                {!blockingFails.length && (
                  <p className="text-[9px] text-amber-600 border-t border-amber-200 pt-2 mt-1">
                    These warnings do not block coding. Verify & Begin Coding is
                    available.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── View Details (expandable) ── */}
          <div className="mx-5 mb-4 rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-muted/50 transition-colors"
            >
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                View Details
              </span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>

            {expanded && (
              <div className="border-t border-border divide-y divide-border/60">
                {/* Encounter */}
                <div className="px-3.5 py-3">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                    Encounter
                  </p>
                  {[
                    ["Encounter Type", CHART.encounterType],
                    ["Admission", CHART.admitDate],
                    ["Discharge", CHART.dischargeDate],
                    ["LOS", CHART.los],
                    ["Provider", CHART.provider],
                    ["Facility", CHART.facility],
                    ["Specialty", CHART.specialty],
                    ["Working DRG", CHART.workingDrg],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-baseline gap-2 py-0.5">
                      <span className="text-[9px] text-muted-foreground w-24 flex-shrink-0">
                        {k}
                      </span>
                      <span className="text-[10px] font-semibold text-foreground">
                        {v}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Documents */}
                <div className="px-3.5 py-3">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                    Documents ({DOCS.length})
                  </p>
                  <div className="space-y-1.5">
                    {DOCS.map((d) => {
                      const ocr = d.ocr;
                      const ocfg = {
                        Complete: {
                          dot: "bg-emerald-500",
                          label: "text-emerald-700",
                        },
                        Processing: {
                          dot: "bg-amber-400",
                          label: "text-amber-700",
                        },
                        Missing: { dot: "bg-red-500", label: "text-red-600" },
                      }[ocr] ?? {
                        dot: "bg-slate-300",
                        label: "text-muted-foreground",
                      };
                      return (
                        <div key={d.name} className="flex items-center gap-2">
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ocfg.dot}`}
                          />
                          <span className="text-[10px] text-foreground flex-1 truncate">
                            {d.name}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {d.pages > 0 ? `${d.pages}p` : "—"}
                          </span>
                          <span
                            className={`text-[9px] font-bold ${ocfg.label}`}
                          >
                            {ocr}
                          </span>
                          {d.conf && (
                            <span className="text-[9px] text-muted-foreground">
                              {d.conf}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Readiness */}
                <div className="px-3.5 py-3">
                  <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider mb-2">
                    AI Readiness
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "ICD Suggestions",
                        value: `${CHART.aiSuggestions.icd}`,
                      },
                      {
                        label: "CPT Suggestions",
                        value: `${CHART.aiSuggestions.cpt}`,
                      },
                      {
                        label: "Avg Confidence",
                        value: `${CHART.aiSuggestions.avgConf}%`,
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="text-center p-2 bg-muted/40 rounded-lg"
                      >
                        <p className="text-[13px] font-black text-foreground">
                          {s.value}
                        </p>
                        <p className="text-[8px] text-muted-foreground mt-0.5">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ══ Footer Actions ══ */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-border bg-card">
          {/* Status line above buttons */}
          {allResolved && (
            <div
              className={`flex items-center gap-1.5 mb-3 text-[10px] font-semibold ${
                canProceed
                  ? hasWarnings
                    ? "text-amber-600"
                    : "text-emerald-600"
                  : "text-red-600"
              }`}
            >
              {canProceed ? (
                hasWarnings ? (
                  <>
                    <AlertTriangle className="w-3 h-3" />
                    Warnings noted — you may proceed
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    All checks passed — ready to code
                  </>
                )
              ) : (
                <>
                  <XCircle className="w-3 h-3" />
                  Blocking issues must be resolved
                </>
              )}
            </div>
          )}
          {!allResolved && (
            <div className="flex items-center gap-1.5 mb-3 text-[10px] text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              Running verification checks…
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 whitespace-nowrap flex-1 justify-center px-3 py-2.5 text-[11px] font-bold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground"
            >
              <ParkingCircle className="w-3.5 h-3.5" />
              Park Chart
            </button>

            <button
              onClick={canProceed ? handleBegin : undefined}
              disabled={!canProceed || launching}
              className={`inline-flex items-center gap-2 whitespace-nowrap flex-[2] justify-center px-4 py-2.5 text-[11px] font-black rounded-xl transition-all ${
                canProceed && !launching
                  ? hasWarnings
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm"
                    : "bg-primary hover:opacity-90 text-white shadow-sm"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
              }`}
            >
              {launching ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Launching…
                </>
              ) : canProceed ? (
                <>
                  {hasWarnings ? (
                    <AlertTriangle className="w-3.5 h-3.5" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  Verify &amp; Begin Coding
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>Verify &amp; Begin Coding</>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
