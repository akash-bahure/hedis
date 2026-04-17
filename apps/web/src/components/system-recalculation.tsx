import { useState, useEffect, useRef } from "react";
import {
  Activity,
  RefreshCw,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Database,
  ArrowRight,
  Hash,
  User,
  FileText,
  Edit3,
  Filter,
  Search,
  ChevronDown,
  Download,
  Play,
  Pause,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type TabId = "realtime" | "recalculation" | "audit-trail";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */
const MEASURES = ["CDC-HbA1c", "BCS", "CBP", "COL", "W34", "AMR"];

function genRate() {
  return (60 + Math.random() * 30).toFixed(1);
}

const INITIAL_RATES: Record<string, string> = Object.fromEntries(
  MEASURES.map((m) => [m, genRate()]),
);

const RECALC_QUEUE = [
  {
    id: "RCQ-0041",
    member: "MBR-441892",
    measure: "CDC-HbA1c",
    trigger: "Chart submission",
    status: "complete",
    latency: "0.31 s",
    prevRate: "76.2",
    newRate: "77.1",
    ts: "09:14:22",
  },
  {
    id: "RCQ-0040",
    member: "MBR-330214",
    measure: "BCS",
    trigger: "Supplemental data",
    status: "complete",
    latency: "0.28 s",
    prevRate: "68.9",
    newRate: "69.4",
    ts: "09:13:58",
  },
  {
    id: "RCQ-0039",
    member: "MBR-779021",
    measure: "CBP",
    trigger: "Manual correction",
    status: "running",
    latency: "—",
    prevRate: "71.2",
    newRate: "—",
    ts: "09:13:41",
  },
  {
    id: "RCQ-0038",
    member: "MBR-102847",
    measure: "COL",
    trigger: "Chart submission",
    status: "complete",
    latency: "0.44 s",
    prevRate: "58.1",
    newRate: "58.9",
    ts: "09:12:30",
  },
  {
    id: "RCQ-0037",
    member: "MBR-556781",
    measure: "W34",
    trigger: "QA approval",
    status: "complete",
    latency: "0.19 s",
    prevRate: "83.0",
    newRate: "83.2",
    ts: "09:11:17",
  },
  {
    id: "RCQ-0036",
    member: "MBR-667890",
    measure: "AMR",
    trigger: "Chart submission",
    status: "failed",
    latency: "—",
    prevRate: "74.5",
    newRate: "—",
    ts: "09:10:03",
  },
  {
    id: "RCQ-0035",
    member: "MBR-223344",
    measure: "CDC-HbA1c",
    trigger: "Supplemental data",
    status: "complete",
    latency: "0.36 s",
    prevRate: "76.8",
    newRate: "77.1",
    ts: "09:09:51",
  },
  {
    id: "RCQ-0034",
    member: "MBR-118872",
    measure: "BCS",
    trigger: "Manual correction",
    status: "complete",
    latency: "0.22 s",
    prevRate: "69.0",
    newRate: "69.4",
    ts: "09:08:40",
  },
];

const AUDIT_EVENTS = [
  {
    id: "AUD-2041",
    ts: "09:14:22",
    user: "System Engine",
    action: "Numerator added",
    member: "MBR-441892",
    measure: "CDC-HbA1c",
    prev: "Excluded",
    next: "Included",
    reason: "HbA1c lab result ≤ 9% confirmed via supplemental upload",
  },
  {
    id: "AUD-2040",
    ts: "09:13:58",
    user: "System Engine",
    action: "Rate recalculated",
    member: "MBR-330214",
    measure: "BCS",
    prev: "68.9%",
    next: "69.4%",
    reason: "Mammography claim matched within measurement period",
  },
  {
    id: "AUD-2039",
    ts: "09:12:30",
    user: "M. Rodriguez",
    action: "Evidence entered",
    member: "MBR-102847",
    measure: "COL",
    prev: "Gap open",
    next: "Gap closed",
    reason: "Colonoscopy 2021-08-14 documented in office notes",
  },
  {
    id: "AUD-2038",
    ts: "09:11:17",
    user: "System Engine",
    action: "Rate recalculated",
    member: "MBR-556781",
    measure: "W34",
    prev: "83.0%",
    next: "83.2%",
    reason: "Well-child visit confirmed — QA approved chart submission",
  },
  {
    id: "AUD-2037",
    ts: "09:10:03",
    user: "System Engine",
    action: "Recalculation failed",
    member: "MBR-667890",
    measure: "AMR",
    prev: "74.5%",
    next: "74.5%",
    reason: "Duplicate claim detected — manual review required",
  },
  {
    id: "AUD-2036",
    ts: "09:08:40",
    user: "J. Patel",
    action: "QA approved",
    member: "MBR-223344",
    measure: "CDC-HbA1c",
    prev: "QA hold",
    next: "Approved",
    reason: "Supporting lab documentation validated by QA reviewer",
  },
  {
    id: "AUD-2035",
    ts: "09:07:12",
    user: "K. Thompson",
    action: "Evidence entered",
    member: "MBR-118872",
    measure: "BCS",
    prev: "Gap open",
    next: "Gap closed",
    reason: "Bilateral mammography completed — date verified in EHR",
  },
  {
    id: "AUD-2034",
    ts: "09:05:44",
    user: "System Engine",
    action: "Denominator removed",
    member: "MBR-009912",
    measure: "CBP",
    prev: "Included",
    next: "Excluded",
    reason: "Member disenrolled — coverage ended 2026-01-15",
  },
  {
    id: "AUD-2033",
    ts: "09:04:30",
    user: "S. Lee",
    action: "Source selected",
    member: "MBR-774412",
    measure: "AMR",
    prev: "Claims",
    next: "Suppl.",
    reason: "Pharmacy fill record confirmed as primary evidence source",
  },
  {
    id: "AUD-2032",
    ts: "09:03:18",
    user: "System Engine",
    action: "Rate recalculated",
    member: "MBR-881123",
    measure: "COL",
    prev: "58.6%",
    next: "58.9%",
    reason: "Automated batch recalculation — end-of-shift cycle",
  },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const STATUS_CFG: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  complete: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Complete",
  },
  running: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Running",
  },
  failed: {
    bg: "bg-red-50 border-red-200",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Failed",
  },
};

const ACTION_CFG: Record<string, string> = {
  "Numerator added": "bg-emerald-100 text-emerald-700",
  "Rate recalculated": "bg-blue-100 text-blue-700",
  "Evidence entered": "bg-teal-100 text-teal-700",
  "QA approved": "bg-violet-100 text-violet-700",
  "Recalculation failed": "bg-red-100 text-red-700",
  "Denominator removed": "bg-amber-100 text-amber-700",
  "Source selected": "bg-slate-100 text-slate-700",
};

const MEASURE_COLORS: Record<string, string> = {
  "CDC-HbA1c": "bg-teal-100 text-teal-700",
  BCS: "bg-pink-100 text-pink-700",
  CBP: "bg-blue-100 text-blue-700",
  COL: "bg-amber-100 text-amber-700",
  W34: "bg-violet-100 text-violet-700",
  AMR: "bg-emerald-100 text-emerald-700",
};

/* ─────────────────────────────────────────────────────────────
   TAB DEFINITIONS
───────────────────────────────────────────────────────────── */
const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  {
    id: "realtime",
    label: "Real-Time Updates",
    icon: Activity,
    desc: "Live measure rate feed and engine pulse monitor",
  },
  {
    id: "recalculation",
    label: "Automated Recalculation",
    icon: RefreshCw,
    desc: "Recalculation queue, trigger log, and latency tracking",
  },
  {
    id: "audit-trail",
    label: "Audit Trail",
    icon: ShieldCheck,
    desc: "Full immutable change history with actor and timestamps",
  },
];

/* ─────────────────────────────────────────────────────────────
   PANEL 1 — REAL-TIME UPDATES
───────────────────────────────────────────────────────────── */
function RealTimeUpdates() {
  const [rates, setRates] = useState(INITIAL_RATES);
  const [pulseLog, setPulseLog] = useState<
    { id: number; measure: string; old: string; next: string; ts: string }[]
  >([]);
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const logId = useRef(1);

  // Simulate live rate ticks every 3 s
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const m = MEASURES[Math.floor(Math.random() * MEASURES.length)];
      const nextRate = genRate();
      setRates((prev) => {
        const entry = {
          id: logId.current++,
          measure: m,
          old: prev[m],
          next: nextRate,
          ts: new Date().toLocaleTimeString("en-US", { hour12: false }),
        };
        setPulseLog((log) => [entry, ...log].slice(0, 20));
        return { ...prev, [m]: nextRate };
      });
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(t);
  }, [live]);

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${live ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}
          />
          <span
            className={`text-[11px] font-bold ${live ? "text-emerald-600" : "text-muted-foreground"}`}
          >
            {live ? "Engine live — receiving updates" : "Feed paused"}
          </span>
        </div>
        <button
          onClick={() => setLive((l) => !l)}
          className={`inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${live ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100" : "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100"}`}
        >
          {live ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {live ? "Pause Feed" : "Resume Feed"}
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {tick} updates received this session
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Live rate tiles */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Live Measure Rates · HEDIS MY2026
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MEASURES.map((m) => {
              const val = parseFloat(rates[m]);
              const target = 72;
              const ok = val >= target;
              return (
                <div
                  key={m}
                  className={`rounded-xl border-2 px-4 py-3 flex flex-col gap-1.5 ${ok ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span
                      className={`text-[9px] font-black uppercase tracking-widest ${MEASURE_COLORS[m]?.split(" ")[1] ?? "text-primary"}`}
                    >
                      {m}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${live ? (ok ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse") : "bg-slate-300"}`}
                    />
                  </div>
                  <p
                    className={`text-3xl font-black leading-none ${ok ? "text-emerald-700" : "text-amber-700"}`}
                  >
                    {rates[m]}%
                  </p>
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${ok ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(100, val)}%` }}
                    />
                  </div>
                  <p
                    className={`text-[9px] font-semibold ${ok ? "text-emerald-600" : "text-amber-600"}`}
                  >
                    {ok ? "▲" : "▼"} {ok ? "Above" : "Below"} target ({target}%)
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pulse log */}
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
            Update Event Log
          </p>
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border max-h-[340px] overflow-y-auto">
              {pulseLog.length === 0 ? (
                <div className="px-4 py-8 text-center text-[11px] text-muted-foreground">
                  {live
                    ? "Waiting for first update…"
                    : "Feed paused — resume to see updates"}
                </div>
              ) : (
                pulseLog.map((e) => {
                  const delta = (
                    parseFloat(e.next) - parseFloat(e.old)
                  ).toFixed(1);
                  const up = parseFloat(delta) >= 0;
                  return (
                    <div
                      key={e.id}
                      className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${MEASURE_COLORS[e.measure]}`}
                          >
                            {e.measure}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {e.old}%
                          </span>
                          <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                          <span className="text-[10px] font-bold text-foreground">
                            {e.next}%
                          </span>
                          <span
                            className={`text-[9px] font-bold ${up ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {up ? "+" : ""}
                            {delta}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] text-muted-foreground flex-shrink-0 font-mono">
                        {e.ts}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Engine stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Updates / Min",
            value: "4.2",
            icon: Zap,
            color: "text-primary",
          },
          {
            label: "Engine Uptime",
            value: "99.97%",
            icon: Activity,
            color: "text-emerald-600",
          },
          {
            label: "Avg Latency",
            value: "0.4 s",
            icon: Clock,
            color: "text-teal-600",
          },
          {
            label: "Records Live",
            value: "47,284",
            icon: Database,
            color: "text-violet-600",
          },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div>
                <p className={`text-lg font-black leading-tight ${k.color}`}>
                  {k.value}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {k.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 2 — AUTOMATED RECALCULATION
───────────────────────────────────────────────────────────── */
function AutomatedRecalculation() {
  const [filterMeasure, setFilterMeasure] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const filtered = RECALC_QUEUE.filter(
    (r) =>
      (filterMeasure === "All" || r.measure === filterMeasure) &&
      (filterStatus === "All" || r.status === filterStatus.toLowerCase()),
  );

  const completeCount = RECALC_QUEUE.filter(
    (r) => r.status === "complete",
  ).length;
  const failedCount = RECALC_QUEUE.filter((r) => r.status === "failed").length;
  const runningCount = RECALC_QUEUE.filter(
    (r) => r.status === "running",
  ).length;
  const avgLatency = (
    RECALC_QUEUE.filter((r) => r.latency !== "—")
      .map((r) => parseFloat(r.latency))
      .reduce((a, b) => a + b, 0) /
    RECALC_QUEUE.filter((r) => r.latency !== "—").length
  ).toFixed(2);

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Completed",
            value: String(completeCount),
            color: "text-emerald-600",
            bg: "bg-emerald-50 border-emerald-200",
          },
          {
            label: "Running",
            value: String(runningCount),
            color: "text-blue-600",
            bg: "bg-blue-50 border-blue-200",
          },
          {
            label: "Failed",
            value: String(failedCount),
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
          {
            label: "Avg Latency",
            value: `${avgLatency} s`,
            color: "text-primary",
            bg: "bg-primary/5 border-primary/20",
          },
        ].map((k) => (
          <div
            key={k.label}
            className={`${k.bg} border rounded-xl px-4 py-3 text-center`}
          >
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {k.label}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-semibold text-muted-foreground">
            Filter:
          </span>
        </div>
        <select
          value={filterMeasure}
          onChange={(e) => setFilterMeasure(e.target.value)}
          className="text-[11px] font-semibold bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option>All</option>
          {MEASURES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="text-[11px] font-semibold bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {["All", "Complete", "Running", "Failed"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {filtered.length} records
        </span>
      </div>

      {/* Recalc queue table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 grid grid-cols-[80px_110px_90px_140px_90px_70px_1fr_70px] gap-3 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
          <span>Job ID</span>
          <span>Member</span>
          <span>Measure</span>
          <span>Trigger</span>
          <span>Status</span>
          <span>Latency</span>
          <span>Rate Change</span>
          <span>Time</span>
        </div>
        <div className="divide-y divide-border max-h-[380px] overflow-y-auto">
          {filtered.map((r) => {
            const s = STATUS_CFG[r.status];
            const hasChange = r.newRate !== "—";
            const delta = hasChange
              ? (parseFloat(r.newRate) - parseFloat(r.prevRate)).toFixed(1)
              : null;
            const up = delta && parseFloat(delta) >= 0;
            return (
              <div
                key={r.id}
                className="px-5 py-3 grid grid-cols-[80px_110px_90px_140px_90px_70px_1fr_70px] gap-3 items-center hover:bg-muted/20 transition-colors"
              >
                <span className="text-[10px] font-mono font-bold text-primary">
                  {r.id}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {r.member}
                </span>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold w-fit ${MEASURE_COLORS[r.measure]}`}
                >
                  {r.measure}
                </span>
                <span className="text-[10px] text-foreground">{r.trigger}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot} ${r.status === "running" ? "animate-pulse" : ""}`}
                  />
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${s.bg} ${s.text}`}
                  >
                    {s.label}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold ${r.latency === "—" ? "text-muted-foreground" : "text-foreground"}`}
                >
                  {r.latency}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    {r.prevRate}%
                  </span>
                  {hasChange && (
                    <ArrowRight className="w-2.5 h-2.5 text-muted-foreground" />
                  )}
                  {hasChange && (
                    <span className="text-[10px] font-bold text-foreground">
                      {r.newRate}%
                    </span>
                  )}
                  {delta && (
                    <span
                      className={`text-[9px] font-bold ${up ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {up ? "+" : ""}
                      {delta}
                    </span>
                  )}
                  {!hasChange && (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </div>
                <span className="text-[9px] font-mono text-muted-foreground">
                  {r.ts}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trigger breakdown */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Recalculation Triggers · Today
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Chart Submission", count: 4, color: "bg-blue-500" },
            { label: "Supplemental Data", count: 2, color: "bg-teal-500" },
            { label: "Manual Correction", count: 2, color: "bg-violet-500" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg ${t.color} flex items-center justify-center flex-shrink-0`}
              >
                <span className="text-white text-[11px] font-black">
                  {t.count}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground">
                  {t.label}
                </p>
                <div className="mt-1 h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${t.color} rounded-full`}
                    style={{ width: `${(t.count / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL 3 — AUDIT TRAIL
───────────────────────────────────────────────────────────── */
function AuditTrail() {
  const [search, setSearch] = useState("");
  const [filterAction, setFilterAction] = useState("All");

  const actions = [
    "All",
    ...Array.from(new Set(AUDIT_EVENTS.map((e) => e.action))),
  ];

  const filtered = AUDIT_EVENTS.filter(
    (e) =>
      (filterAction === "All" || e.action === filterAction) &&
      (search === "" ||
        e.member.toLowerCase().includes(search.toLowerCase()) ||
        e.measure.toLowerCase().includes(search.toLowerCase()) ||
        e.user.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Events Today", value: "284", color: "text-primary" },
          { label: "System Events", value: "198", color: "text-teal-600" },
          { label: "User Events", value: "86", color: "text-violet-600" },
          {
            label: "Integrity Score",
            value: "100%",
            color: "text-emerald-600",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-card border border-border rounded-xl px-4 py-3 text-center"
          >
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {k.label}
            </p>
          </div>
        ))}
      </div>

      {/* NCQA compliance badge */}
      <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl">
        <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0" />
        <div>
          <p className="text-[12px] font-bold text-emerald-700">
            NCQA Audit Trail Compliant — Immutable &amp; Timestamped
          </p>
          <p className="text-[10px] text-emerald-600 mt-0.5">
            All change events are cryptographically signed and cannot be
            modified. Full chain-of-custody maintained per HEDIS Technical
            Specifications.
          </p>
        </div>
        <span className="ml-auto flex-shrink-0 px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-lg text-[9px] font-black text-emerald-700 uppercase tracking-wider whitespace-nowrap">
          Verified
        </span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member, measure, user…"
            className="w-full pl-9 pr-4 py-1.5 bg-card border border-border rounded-lg text-[11px] focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
          />
        </div>
        <select
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
          className="text-[11px] font-semibold bg-card border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {actions.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
        <button className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 bg-card border border-border rounded-lg text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
        <span className="text-[10px] text-muted-foreground">
          {filtered.length} events
        </span>
      </div>

      {/* Audit event list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 grid grid-cols-[70px_80px_1fr_110px_90px_80px] gap-3 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
          <span>Event ID</span>
          <span>Time</span>
          <span>Change / Reason</span>
          <span>Actor</span>
          <span>Measure</span>
          <span>Action</span>
        </div>
        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="px-5 py-3.5 grid grid-cols-[70px_80px_1fr_110px_90px_80px] gap-3 items-start hover:bg-muted/20 transition-colors"
            >
              {/* Event ID */}
              <span className="text-[9px] font-mono font-bold text-primary mt-0.5">
                {e.id}
              </span>

              {/* Timestamp */}
              <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                {e.ts}
              </span>

              {/* Change + reason */}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {e.prev}
                  </span>
                  <ArrowRight className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                  <span className="text-[10px] font-bold text-foreground font-mono">
                    {e.next}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug">
                  {e.reason}
                </p>
              </div>

              {/* Actor */}
              <div className="flex items-center gap-1.5 min-w-0">
                {e.user === "System Engine" ? (
                  <Zap className="w-3 h-3 text-teal-500 flex-shrink-0" />
                ) : (
                  <User className="w-3 h-3 text-violet-500 flex-shrink-0" />
                )}
                <span className="text-[10px] text-foreground truncate">
                  {e.user}
                </span>
              </div>

              {/* Measure */}
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold w-fit h-fit ${MEASURE_COLORS[e.measure] ?? "bg-slate-100 text-slate-700"}`}
              >
                {e.measure}
              </span>

              {/* Action badge */}
              <span
                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold w-fit h-fit leading-tight ${ACTION_CFG[e.action] ?? "bg-muted text-muted-foreground"}`}
              >
                {e.action}
              </span>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-10 text-center text-[11px] text-muted-foreground">
              No events match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export function SystemRecalculation({
  defaultTab = "realtime",
}: {
  defaultTab?: TabId;
}) {
  const [activeTab, setActiveTab] = useState<TabId>(defaultTab);
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-foreground">System Recalculation</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 text-teal-700 border border-teal-200 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                Engine Active
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Live rate monitoring, automated recalculation queue, and
              NCQA-compliant immutable audit trail
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[11px] font-semibold text-primary whitespace-nowrap">
              <RefreshCw className="w-3.5 h-3.5" />
              HEDIS MY2026
            </span>
          </div>
        </div>
      </div>

      {/* ── Tabs ────────────────────────────────────────── */}
      <div className="flex-shrink-0 bg-card border-b border-border px-5">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const sel = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-[12px] font-semibold border-b-2 transition-all flex-shrink-0",
                  sel
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
                ].join(" ")}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sub-header ──────────────────────────────────── */}
      <div className="flex-shrink-0 border-b border-border bg-card px-6 py-3 flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            activeTab === "realtime"
              ? "bg-teal-500"
              : activeTab === "recalculation"
                ? "bg-primary"
                : "bg-emerald-500"
          }`}
        >
          <active.icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-foreground">
            {active.label}
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {active.desc}
          </p>
        </div>
      </div>

      {/* ── Panel ───────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {activeTab === "realtime" && <RealTimeUpdates />}
        {activeTab === "recalculation" && <AutomatedRecalculation />}
        {activeTab === "audit-trail" && <AuditTrail />}
      </div>
    </div>
  );
}
