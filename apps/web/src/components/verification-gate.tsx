import { useState, useEffect } from "react";
import {
  ChevronLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ArrowRight,
  Clock,
  User,
  FileText,
  Cpu,
  Heart,
  Sparkles,
  Shield,
  ClipboardList,
  Activity,
  AlertCircle,
  Calendar,
  ChevronRight,
  Flag,
} from "lucide-react";

/* ═══════════════════════════════════════════
   TYPES
═══════════════════════════════════════════ */
type CheckStatus = "loading" | "pass" | "warn" | "fail";

interface Check {
  id: string;
  icon: React.ElementType;
  label: string;
  category: string;
  passDetail: string;
  warnTitle?: string;
  warnDetail?: string;
  status: CheckStatus;
  blocking: boolean;
}

/* ═══════════════════════════════════════════
   DATA
═══════════════════════════════════════════ */
const CHART = {
  id: "CHT-4891",
  patientName: "Anderson, Jennifer K.",
  mrn: "MBR-2026-00142",
  dob: "10/03/1971",
  age: 54,
  gender: "Female",
  plan: "Medicare Advantage",
  measureCode: "CBP",
  measure: "Controlling Blood Pressure",
  measurePeriod: "Jan 1 – Dec 31, 2025",
  numerator: "Most recent BP < 140/90 mmHg",
  gapStatus: "Gap Open",
  assignedTo: "S. Johnson",
  slaHours: 8,
  slaStatus: "On Track" as "On Track" | "At Risk",
  docsUploaded: 3,
  docsReady: 2,
  aiFindings: 1,
  timelineEvents: 14,
};

const INITIAL_CHECKS: Check[] = [
  {
    id: "eligibility",
    icon: User,
    category: "Member",
    label: "Member Eligibility",
    passDetail: "Enrolled in Medicare Advantage · HEDIS denominator confirmed",
    warnTitle: undefined,
    status: "loading",
    blocking: true,
  },
  {
    id: "gap",
    icon: Heart,
    category: "Measure",
    label: "Gap Registry",
    passDetail: "CBP gap confirmed · No qualifying BP reading on file for 2025",
    status: "loading",
    blocking: true,
  },
  {
    id: "docs",
    icon: FileText,
    category: "Documents",
    label: "Chart Documents",
    passDetail:
      "3 of 3 documents uploaded · Discharge Summary, Labs, Nephrology Note",
    warnTitle: "Nephrology Note OCR still processing",
    warnDetail:
      "OCR is in progress for Doc-003. AI suggestions from other documents remain available. You may proceed.",
    status: "loading",
    blocking: false,
  },
  {
    id: "ocr",
    icon: Cpu,
    category: "AI",
    label: "OCR & AI Engine",
    passDetail: "2 documents fully indexed · 1 AI finding detected for CBP",
    status: "loading",
    blocking: false,
  },
  {
    id: "measure",
    icon: ClipboardList,
    category: "HEDIS",
    label: "Measure Criteria",
    passDetail: "CBP v2025 logic loaded · Numerator criteria validated",
    status: "loading",
    blocking: false,
  },
];

const DELAYS = [360, 620, 900, 1160, 1400];
const RESULTS: CheckStatus[] = ["pass", "pass", "warn", "pass", "pass"];

const AI_FINDING = {
  date: "Jul 22, 2025",
  title: "Nephrology Consult Note",
  detail:
    "BP 136/86 mmHg documented — satisfies CBP numerator criteria (<140/90)",
  docPage: 3,
  confidence: 94,
};

/* ═══════════════════════════════════════════
   CHECK ROW
═══════════════════════════════════════════ */
function CheckRow({ check, index }: { check: Check; index: number }) {
  const Icon = check.icon;

  const statusNode = {
    loading: (
      <div className="flex items-center gap-1.5">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground/50" />
        <span className="text-[10px] text-muted-foreground/50">Verifying…</span>
      </div>
    ),
    pass: (
      <div className="flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
        <span className="text-[10px] text-emerald-700 font-semibold">
          {check.passDetail}
        </span>
      </div>
    ),
    warn: (
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-[10px] text-amber-700 font-semibold">
          {check.warnTitle ?? check.passDetail}
        </span>
      </div>
    ),
    fail: (
      <div className="flex items-center gap-1.5">
        <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
        <span className="text-[10px] text-red-700 font-semibold">
          {check.warnTitle ?? "Check failed"}
        </span>
      </div>
    ),
  }[check.status];

  return (
    <div
      className={`flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0 transition-all duration-300 ${
        check.status === "loading" ? "opacity-35" : "opacity-100"
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {/* Step number */}
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black transition-colors ${
          check.status === "loading"
            ? "bg-muted text-muted-foreground/40"
            : check.status === "pass"
              ? "bg-emerald-100 text-emerald-600"
              : check.status === "warn"
                ? "bg-amber-100 text-amber-600"
                : "bg-red-100 text-red-600"
        }`}
      >
        {check.status === "loading" ? (
          index + 1
        ) : check.status === "pass" ? (
          <CheckCircle2 className="w-3 h-3" />
        ) : check.status === "warn" ? (
          <AlertTriangle className="w-3 h-3" />
        ) : (
          <XCircle className="w-3 h-3" />
        )}
      </div>

      {/* Label */}
      <div className="w-8 flex-shrink-0">
        <Icon
          className={`w-3.5 h-3.5 ${
            check.status === "loading"
              ? "text-muted-foreground/30"
              : check.status === "pass"
                ? "text-emerald-500"
                : check.status === "warn"
                  ? "text-amber-500"
                  : "text-red-500"
          }`}
        />
      </div>

      <span
        className={`text-[11px] font-bold w-36 flex-shrink-0 ${
          check.status === "loading"
            ? "text-muted-foreground/50"
            : "text-foreground"
        }`}
      >
        {check.label}
      </span>

      <div className="flex-1 min-w-0">{statusNode}</div>
    </div>
  );
}

/* ══════════���════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function VerificationGate({
  onBeginAbstraction,
  onGoBack,
}: {
  onBeginAbstraction: () => void;
  onGoBack: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [checks, setChecks] = useState<Check[]>(INITIAL_CHECKS);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const timers = DELAYS.map((delay, i) =>
      setTimeout(
        () =>
          setChecks((prev) =>
            prev.map((c, idx) =>
              idx === i ? { ...c, status: RESULTS[i] } : c,
            ),
          ),
        delay,
      ),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const allDone = checks.every((c) => c.status !== "loading");
  const warnings = checks.filter((c) => c.status === "warn");
  const failures = checks.filter((c) => c.status === "fail");
  const blockingFail = checks.some((c) => c.blocking && c.status === "fail");
  const canProceed = allDone && !blockingFail;
  const passCnt = checks.filter((c) => c.status === "pass").length;

  const handleBegin = () => {
    if (!canProceed || launching) return;
    setLaunching(true);
    setTimeout(onBeginAbstraction, 440);
  };

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-full py-10 px-4 transition-all duration-350 ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      } ${launching ? "opacity-0 scale-95" : ""}`}
    >
      {/* ── Breadcrumb ── */}
      <div className="w-full max-w-[580px] flex items-center gap-1.5 mb-5 text-[11px]">
        <button
          onClick={onGoBack}
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Work Queue
        </button>
        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
        <span className="text-muted-foreground">Pre-Abstraction</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground/40" />
        <span className="text-foreground font-semibold">Verification</span>
      </div>

      {/* ── Main card ── */}
      <div className="w-full max-w-[580px] bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {/* ─── TOP HEADER BAND ─── */}
        <div className="px-6 pt-5 pb-4 border-b border-border bg-gradient-to-br from-[#f0f9ff] to-card">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              {/* Workflow label */}
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-1 rounded-full bg-[#0891b2]/10 text-[#0891b2] border border-[#0891b2]/20">
                  <ClipboardList className="w-2.5 h-2.5" />
                  HEDIS ABSTRACTION WORKFLOW
                </span>
              </div>
              {/* Patient */}
              <p className="text-[15px] font-black text-foreground leading-tight">
                {CHART.patientName}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="font-mono text-[9px] font-black bg-muted text-muted-foreground px-1.5 py-0.5 rounded border border-border">
                  {CHART.mrn}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  DOB {CHART.dob} · {CHART.age}y {CHART.gender}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {CHART.plan}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
              <span className="font-mono text-[10px] font-black text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md">
                {CHART.id}
              </span>
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                  CHART.slaStatus === "At Risk"
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                {CHART.slaHours}h · {CHART.slaStatus}
              </span>
            </div>
          </div>

          {/* Measure context band */}
          <div className="flex items-stretch gap-2 mt-1">
            <div className="flex-1 flex items-center gap-3 bg-white/70 border border-[#0891b2]/15 rounded-xl px-3 py-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0891b2]/10 flex items-center justify-center flex-shrink-0">
                <Heart className="w-3.5 h-3.5 text-[#0891b2]" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                  HEDIS Measure
                </p>
                <p className="text-[11px] font-black text-foreground">
                  {CHART.measureCode} — {CHART.measure}
                </p>
                <p className="text-[9px] text-muted-foreground">
                  {CHART.measurePeriod}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-red-50/80 border border-red-200 rounded-xl px-3 py-2.5 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black text-red-600 uppercase tracking-wide">
                  Gap Status
                </p>
                <p className="text-[11px] font-black text-red-700">OPEN</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-xl px-3 py-2.5 flex-shrink-0">
              <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-wide">
                  Assigned
                </p>
                <p className="text-[11px] font-bold text-foreground">
                  {CHART.assignedTo}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ─── SYSTEM CHECKS ─── */}
        <div className="px-6 py-1">
          {/* Section label */}
          <div className="flex items-center justify-between py-2.5 border-b border-border/40 mb-0.5">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Pre-Abstraction Checks
            </span>
            {allDone ? (
              <span
                className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
                  blockingFail
                    ? "bg-red-50 border-red-200 text-red-600"
                    : warnings.length > 0
                      ? "bg-amber-50 border-amber-200 text-amber-600"
                      : "bg-emerald-50 border-emerald-200 text-emerald-600"
                }`}
              >
                {blockingFail
                  ? `${failures.length} blocking issue`
                  : warnings.length > 0
                    ? `${passCnt}/5 passed · ${warnings.length} warning`
                    : "5/5 passed"}
              </span>
            ) : (
              <span className="text-[9px] text-muted-foreground font-semibold flex items-center gap-1">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Running…
              </span>
            )}
          </div>
          {checks.map((c, i) => (
            <CheckRow key={c.id} check={c} index={i} />
          ))}
        </div>

        {/* ─── WARNING DETAIL ─── */}
        {allDone && (warnings.length > 0 || failures.length > 0) && (
          <div className="px-6 pb-2">
            <div
              className={`rounded-xl border px-4 py-3 text-[10px] leading-relaxed ${
                failures.length > 0
                  ? "bg-red-50 border-red-200 text-red-700"
                  : "bg-amber-50 border-amber-200 text-amber-700"
              }`}
            >
              {[...failures, ...warnings].map((c) => (
                <p key={c.id} className="flex items-start gap-1.5">
                  <AlertTriangle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                  <span>
                    <span className="font-bold">
                      {c.warnTitle ?? c.label}:{" "}
                    </span>
                    {c.warnDetail ?? ""}
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ─── AI FINDING PANEL (shown once ready) ─── */}
        {allDone && canProceed && (
          <div className="px-6 pb-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-black text-emerald-800">
                      AI Evidence Detection — 1 Finding
                    </p>
                    <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-200 text-emerald-700 border border-emerald-300">
                      {AI_FINDING.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700 font-semibold">
                    {AI_FINDING.date} · {AI_FINDING.title}
                  </p>
                  <p className="text-[10px] text-emerald-600 leading-snug mt-0.5">
                    {AI_FINDING.detail}
                  </p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* ─── READY SUMMARY STATS ─── */}
        {allDone && canProceed && (
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-muted/30 border border-border">
                <span className="text-[15px] font-black text-foreground">
                  {CHART.timelineEvents}
                </span>
                <span className="text-[8px] font-semibold text-muted-foreground text-center uppercase tracking-wide">
                  Timeline Events
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-muted/30 border border-border">
                <span className="text-[15px] font-black text-foreground">
                  {CHART.docsReady}/{CHART.docsUploaded}
                </span>
                <span className="text-[8px] font-semibold text-muted-foreground text-center uppercase tracking-wide">
                  Docs Indexed
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[15px] font-black text-emerald-700">
                  {CHART.aiFindings}
                </span>
                <span className="text-[8px] font-semibold text-emerald-600 text-center uppercase tracking-wide">
                  AI Finding
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ─── FOOTER ACTIONS ─── */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-2.5 bg-muted/10">
          {/* Park / back */}
          <button
            onClick={onGoBack}
            className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2.5 text-[11px] font-bold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground"
          >
            <Flag className="w-3.5 h-3.5" />
            Park Chart
          </button>

          {/* Primary CTA */}
          <button
            onClick={handleBegin}
            disabled={!canProceed || launching}
            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap flex-1 px-4 py-2.5 text-[12px] font-black rounded-xl transition-all ${
              launching
                ? "bg-[#0891b2]/60 text-white cursor-default"
                : canProceed
                  ? warnings.length > 0
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-200"
                    : "bg-[#0891b2] hover:bg-[#0e7490] text-white shadow-sm shadow-[#0891b2]/20"
                  : "bg-muted text-muted-foreground border border-border cursor-not-allowed"
            }`}
          >
            {launching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Launching Workspace…
              </>
            ) : canProceed ? (
              <>
                {warnings.length > 0 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Begin Abstraction
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Status caption ── */}
      <div className="mt-4 flex items-center gap-1.5">
        {allDone ? (
          canProceed ? (
            <span className="flex items-center gap-1.5 text-[10px] text-emerald-600">
              <Shield className="w-3 h-3" />
              {warnings.length > 0
                ? "Non-blocking warnings noted. You may proceed to the abstraction workspace."
                : "All pre-abstraction checks passed. Ready to begin."}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-[10px] text-red-600">
              <AlertCircle className="w-3 h-3" />
              Resolve blocking issues before proceeding.
            </span>
          )
        ) : (
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
            <Activity className="w-3 h-3 animate-pulse" />
            Running pre-abstraction checks…
          </span>
        )}
      </div>
    </div>
  );
}
