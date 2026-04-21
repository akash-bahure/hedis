import { useState } from "react";
import {
  Layers,
  TrendingUp,
  Users,
  AlertTriangle,
  ClipboardList,
  CheckSquare,
  ShieldCheck,
  BarChart2,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  AlertCircle,
  Activity,
  Target,
  Zap,
  ChevronRight,
  RefreshCw,
  User,
  Calendar,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
──────────────────────────────────────���────────────────────── */
const QUEUE_DATA = [
  {
    id: "work-queue",
    stage: "Work Queue",
    icon: ClipboardList,
    color: "blue",
    total: 247,
    urgent: 18,
    normal: 156,
    onHold: 73,
    avgWait: "2.4 hrs",
    trend: +12,
    slaAt: 84,
  },
  {
    id: "qa-review",
    stage: "QA Review",
    icon: CheckSquare,
    color: "amber",
    total: 89,
    urgent: 7,
    normal: 62,
    onHold: 20,
    avgWait: "4.1 hrs",
    trend: -5,
    slaAt: 91,
  },
  {
    id: "audit",
    stage: "Audit & Sampling",
    icon: ShieldCheck,
    color: "violet",
    total: 34,
    urgent: 3,
    normal: 28,
    onHold: 3,
    avgWait: "1.2 hrs",
    trend: +2,
    slaAt: 97,
  },
  {
    id: "reports",
    stage: "Reports / Submission",
    icon: BarChart2,
    color: "emerald",
    total: 12,
    urgent: 1,
    normal: 9,
    onHold: 2,
    avgWait: "0.8 hrs",
    trend: 0,
    slaAt: 100,
  },
];

const PROGRESS_DATA = [
  {
    measure: "CDC – A1c Testing",
    target: 85,
    current: 78.4,
    completed: 312,
    total: 398,
    dueDate: "Mar 28",
  },
  {
    measure: "BCS – Breast Cancer Screen",
    target: 72,
    current: 69.1,
    completed: 241,
    total: 349,
    dueDate: "Mar 25",
  },
  {
    measure: "CBP – Blood Pressure",
    target: 68,
    current: 71.6,
    completed: 287,
    total: 401,
    dueDate: "Apr 04",
  },
  {
    measure: "COL – Colorectal Screen",
    target: 65,
    current: 58.9,
    completed: 176,
    total: 299,
    dueDate: "Mar 22",
  },
  {
    measure: "W34 – Well-Child Visit",
    target: 80,
    current: 83.2,
    completed: 124,
    total: 149,
    dueDate: "Apr 10",
  },
  {
    measure: "AMR – Asthma Medications",
    target: 75,
    current: 74.8,
    completed: 198,
    total: 265,
    dueDate: "Mar 30",
  },
];

const STAFF_DATA = [
  {
    name: "M. Rodriguez",
    role: "Lead Abstractor",
    assigned: 18,
    completed: 12,
    capacity: 25,
    online: true,
    efficiency: 94,
  },
  {
    name: "K. Thompson",
    role: "Abstractor",
    assigned: 14,
    completed: 9,
    capacity: 20,
    online: true,
    efficiency: 88,
  },
  {
    name: "J. Patel",
    role: "QA Reviewer",
    assigned: 22,
    completed: 19,
    capacity: 30,
    online: true,
    efficiency: 96,
  },
  {
    name: "S. Lee",
    role: "Abstractor",
    assigned: 8,
    completed: 5,
    capacity: 20,
    online: true,
    efficiency: 72,
  },
  {
    name: "A. Williams",
    role: "Sr. Abstractor",
    assigned: 20,
    completed: 17,
    capacity: 25,
    online: false,
    efficiency: 91,
  },
  {
    name: "R. Martinez",
    role: "QA Reviewer",
    assigned: 15,
    completed: 14,
    capacity: 25,
    online: true,
    efficiency: 98,
  },
  {
    name: "C. Davis",
    role: "Abstractor",
    assigned: 11,
    completed: 6,
    capacity: 20,
    online: true,
    efficiency: 65,
  },
];

const BOTTLENECK_DATA = [
  {
    stage: "Work Queue → QA",
    waitTime: "4.8 hrs",
    throughput: 28,
    capacity: 45,
    severity: "high",
    cause: "Insufficient QA reviewer coverage — 2 reviewers out today",
    action: "Reassign 12 charts from queue to available reviewer J. Patel",
  },
  {
    stage: "QA → Audit",
    waitTime: "1.9 hrs",
    throughput: 14,
    capacity: 20,
    severity: "medium",
    cause: "CDC measure cluster pending secondary review before audit",
    action: "Clear 8 CDC pending items from QA hold queue",
  },
  {
    stage: "Abstraction Entry",
    waitTime: "22 min",
    throughput: 38,
    capacity: 50,
    severity: "low",
    cause: "Two abstractors at 65-72% efficiency — may need training support",
    action: "Schedule peer-review session for S. Lee & C. Davis",
  },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const COLOR_MAP: Record<
  string,
  { bg: string; text: string; border: string; bar: string; light: string }
> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    bar: "bg-blue-500",
    light: "bg-blue-100",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    bar: "bg-amber-500",
    light: "bg-amber-100",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    bar: "bg-violet-500",
    light: "bg-violet-100",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    bar: "bg-emerald-500",
    light: "bg-emerald-100",
  },
};

const SEV_CONFIG: Record<
  string,
  { bar: string; text: string; bg: string; label: string }
> = {
  high: {
    bar: "bg-red-500",
    text: "text-red-700",
    bg: "bg-red-50 border-red-200",
    label: "Critical",
  },
  medium: {
    bar: "bg-amber-500",
    text: "text-amber-700",
    bg: "bg-amber-50 border-amber-200",
    label: "Moderate",
  },
  low: {
    bar: "bg-blue-400",
    text: "text-blue-700",
    bg: "bg-blue-50 border-blue-200",
    label: "Low",
  },
};

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  accent: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 px-5 py-4 border-b border-border bg-card`}
    >
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent}`}
      >
        <Icon className="w-4.5 h-4.5 text-white" />
      </div>
      <div>
        <h2 className="text-foreground">{title}</h2>
        <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function MiniBar({
  value,
  max = 100,
  barClass,
}: {
  value: number;
  max?: number;
  barClass: string;
}) {
  return (
    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${barClass}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  );
}

function TrendChip({ trend }: { trend: number }) {
  if (trend > 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
        <ArrowUp className="w-2.5 h-2.5" />+{trend}%
      </span>
    );
  if (trend < 0)
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
        <ArrowDown className="w-2.5 h-2.5" />
        {trend}%
      </span>
    );
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
      <Minus className="w-2.5 h-2.5" />
      0%
    </span>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB DEFINITIONS
───────────────────────────────────────────────────────────── */
type TabId = "queue" | "progress" | "resources" | "bottlenecks";

const TABS: {
  id: TabId;
  label: string;
  icon: React.ElementType;
  desc: string;
}[] = [
  {
    id: "queue",
    label: "Queue Volumes",
    icon: Layers,
    desc: "Real-time queue depth across all stages",
  },
  {
    id: "progress",
    label: "Review Progress",
    icon: TrendingUp,
    desc: "Measure-level SLA tracking & completion rates",
  },
  {
    id: "resources",
    label: "Resource Allocation",
    icon: Users,
    desc: "Staff workload, capacity & efficiency",
  },
  {
    id: "bottlenecks",
    label: "Workflow Bottlenecks",
    icon: AlertTriangle,
    desc: "Stage-level throughput analysis & remediation",
  },
];

/* ─────────────────────────────────────────────────────────────
   PANEL — QUEUE VOLUMES
───────────────────────────────────────────────────────────── */
function QueueVolumes() {
  const totalCharts = QUEUE_DATA.reduce((s, q) => s + q.total, 0);
  const totalUrgent = QUEUE_DATA.reduce((s, q) => s + q.urgent, 0);

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total in Queue",
            value: String(totalCharts),
            icon: Layers,
            color: "text-primary",
          },
          {
            label: "Urgent / Priority",
            value: String(totalUrgent),
            icon: AlertCircle,
            color: "text-red-600",
          },
          {
            label: "Avg SLA Adherence",
            value: "93.0%",
            icon: Target,
            color: "text-emerald-600",
          },
          {
            label: "Throughput Today",
            value: "284 charts",
            icon: Activity,
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

      {/* Stage cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {QUEUE_DATA.map((q) => {
          const Icon = q.icon;
          const c = COLOR_MAP[q.color];
          return (
            <div
              key={q.id}
              className={`rounded-xl border-2 ${c.border} bg-card overflow-hidden flex flex-col`}
            >
              {/* Header */}
              <div
                className={`px-4 py-3 ${c.bg} border-b ${c.border} flex items-center gap-2`}
              >
                <div
                  className={`w-7 h-7 rounded-lg ${c.bar} flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-[11px] font-bold ${c.text} truncate`}>
                    {q.stage}
                  </p>
                </div>
                <TrendChip trend={q.trend} />
              </div>

              {/* Volume number */}
              <div className="px-4 pt-4 pb-2 text-center">
                <p className={`text-4xl font-black ${c.text}`}>{q.total}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  charts in queue
                </p>
              </div>

              {/* Breakdown */}
              <div className="px-4 pb-3 space-y-2">
                {[
                  { label: "Urgent", count: q.urgent, barCls: "bg-red-500" },
                  { label: "Normal", count: q.normal, barCls: c.bar },
                  { label: "On Hold", count: q.onHold, barCls: "bg-slate-300" },
                ].map((row) => (
                  <div key={row.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {row.label}
                      </span>
                      <span className="text-[10px] font-bold text-foreground">
                        {row.count}
                      </span>
                    </div>
                    <MiniBar
                      value={row.count}
                      max={q.total}
                      barClass={row.barCls}
                    />
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div
                className={`mt-auto border-t ${c.border} ${c.bg} px-4 py-2.5 flex items-center justify-between`}
              >
                <div className="flex items-center gap-1.5">
                  <Clock className={`w-3 h-3 ${c.text}`} />
                  <span className={`text-[10px] font-semibold ${c.text}`}>
                    Avg wait {q.avgWait}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] text-muted-foreground">SLA</span>
                  <span
                    className={`text-[10px] font-bold ${q.slaAt >= 95 ? "text-emerald-600" : q.slaAt >= 85 ? "text-amber-600" : "text-red-600"}`}
                  >
                    {q.slaAt}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL — REVIEW PROGRESS
───────────────────────────────────────────────────────────── */
function ReviewProgress() {
  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Measures On Track",
            value: "4 / 6",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200",
          },
          {
            label: "Measures At Risk",
            value: "2 / 6",
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-200",
          },
          {
            label: "Overall Completion",
            value: "72.8%",
            color: "text-primary",
            bg: "bg-primary/5",
            border: "border-primary/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border ${s.border} rounded-xl px-4 py-3 text-center`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* Measure table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Measure Performance · HEDIS MY2026
          </span>
        </div>
        <div className="divide-y divide-border">
          {PROGRESS_DATA.map((m) => {
            const pct = Math.round((m.completed / m.total) * 100);
            const onTrack = m.current >= m.target;
            const gap = m.current - m.target;
            return (
              <div
                key={m.measure}
                className="px-5 py-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {onTrack ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-[12px] font-semibold text-foreground">
                        {m.measure}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Due {m.dueDate} · {m.completed}/{m.total} charts
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`text-[13px] font-black ${onTrack ? "text-emerald-600" : "text-amber-600"}`}
                    >
                      {m.current}%
                    </p>
                    <p
                      className={`text-[10px] font-semibold ${onTrack ? "text-emerald-500" : "text-amber-500"}`}
                    >
                      {gap >= 0 ? "+" : ""}
                      {gap.toFixed(1)}% vs target {m.target}%
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${onTrack ? "bg-emerald-500" : "bg-amber-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">
                      {pct}% charts abstracted
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      Target {m.target}%
                    </span>
                  </div>
                </div>

                {/* Target marker overlay row */}
                <div className="relative mt-0.5 h-0">
                  <div
                    className="absolute top-0 -translate-y-3 w-px h-3 bg-slate-400"
                    style={{ left: `${m.target}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL — RESOURCE ALLOCATION
───────────────────────────────────────────────────────────── */
function ResourceAllocation() {
  const totalAssigned = STAFF_DATA.reduce((s, r) => s + r.assigned, 0);
  const totalCompleted = STAFF_DATA.reduce((s, r) => s + r.completed, 0);
  const onlineCount = STAFF_DATA.filter((r) => r.online).length;
  const avgEfficiency = Math.round(
    STAFF_DATA.reduce((s, r) => s + r.efficiency, 0) / STAFF_DATA.length,
  );

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Active Staff",
            value: `${onlineCount} / ${STAFF_DATA.length}`,
            color: "text-emerald-600",
          },
          {
            label: "Charts Assigned",
            value: String(totalAssigned),
            color: "text-primary",
          },
          {
            label: "Completed Today",
            value: String(totalCompleted),
            color: "text-teal-600",
          },
          {
            label: "Avg Efficiency",
            value: `${avgEfficiency}%`,
            color: "text-violet-600",
          },
        ].map((k) => (
          <div
            key={k.label}
            className="bg-card border border-border rounded-xl px-4 py-3"
          >
            <p className={`text-2xl font-black ${k.color}`}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {k.label}
            </p>
          </div>
        ))}
      </div>

      {/* Staff table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Staff Workload · Today
          </span>
        </div>
        <div className="divide-y divide-border">
          {STAFF_DATA.map((staff) => {
            const pct = Math.round((staff.assigned / staff.capacity) * 100);
            const effCls =
              staff.efficiency >= 90
                ? "text-emerald-600"
                : staff.efficiency >= 75
                  ? "text-amber-600"
                  : "text-red-600";
            const loadBarCls =
              pct >= 90
                ? "bg-red-500"
                : pct >= 70
                  ? "bg-amber-500"
                  : "bg-emerald-500";

            return (
              <div
                key={staff.name}
                className="px-5 py-3.5 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                      <span className="text-white text-[9px] font-bold">
                        {staff.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card ${staff.online ? "bg-emerald-500" : "bg-slate-300"}`}
                    />
                  </div>

                  {/* Name / role */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div>
                        <p className="text-[12px] font-semibold text-foreground">
                          {staff.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {staff.role}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`text-[11px] font-bold ${effCls}`}>
                          {staff.efficiency}% eff.
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {staff.completed}/{staff.assigned} done
                        </p>
                      </div>
                    </div>
                    {/* Load bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${loadBarCls}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-muted-foreground w-16 text-right flex-shrink-0">
                        {staff.assigned}/{staff.capacity} cap.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PANEL — WORKFLOW BOTTLENECKS
───────────────────────────────────────────────────────────── */
function WorkflowBottlenecks() {
  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Header alert */}
      <div className="flex items-start gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[12px] font-bold text-red-700">
            1 critical bottleneck detected
          </p>
          <p className="text-[11px] text-red-600 mt-0.5">
            QA reviewer coverage gap is causing a pipeline slowdown — action
            recommended within 2 hrs to maintain SLA.
          </p>
        </div>
      </div>

      {/* Bottleneck cards */}
      <div className="flex flex-col gap-4">
        {BOTTLENECK_DATA.map((b, i) => {
          const sev = SEV_CONFIG[b.severity];
          const throughputPct = Math.round((b.throughput / b.capacity) * 100);

          return (
            <div
              key={i}
              className={`bg-card border-2 rounded-xl overflow-hidden ${sev.bg}`}
            >
              {/* Card header */}
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${sev.bar} flex-shrink-0`}
                  />
                  <p className="text-[13px] font-bold text-foreground">
                    {b.stage}
                  </p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${sev.bg} ${sev.text} border`}
                  >
                    {sev.label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Clock className={`w-3 h-3 ${sev.text}`} />
                  <span className={`text-[11px] font-bold ${sev.text}`}>
                    Wait: {b.waitTime}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Throughput gauge */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Throughput vs Capacity
                  </p>
                  <div className="flex items-end gap-1.5 mb-2">
                    <span className={`text-2xl font-black ${sev.text}`}>
                      {b.throughput}
                    </span>
                    <span className="text-[11px] text-muted-foreground mb-0.5">
                      / {b.capacity} charts/hr
                    </span>
                  </div>
                  <MiniBar
                    value={b.throughput}
                    max={b.capacity}
                    barClass={sev.bar}
                  />
                  <p className="text-[9px] text-muted-foreground mt-1">
                    {throughputPct}% of capacity used
                  </p>
                </div>

                {/* Root cause */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Root Cause
                  </p>
                  <div className="flex items-start gap-2">
                    <Zap
                      className={`w-3.5 h-3.5 ${sev.text} flex-shrink-0 mt-0.5`}
                    />
                    <p className="text-[11px] text-foreground leading-relaxed">
                      {b.cause}
                    </p>
                  </div>
                </div>

                {/* Recommended action */}
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Recommended Action
                  </p>
                  <div className="flex items-start gap-2">
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${sev.text} flex-shrink-0 mt-0.5`}
                    />
                    <p className="text-[11px] text-foreground leading-relaxed">
                      {b.action}
                    </p>
                  </div>
                  <button
                    className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors whitespace-nowrap ${sev.bg} ${sev.text} hover:opacity-80`}
                  >
                    <RefreshCw className="w-3 h-3" />
                    Apply Fix
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline flow visual */}
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">
          Pipeline Flow · Charts per Hour
        </p>
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { label: "Abstraction", val: 38, max: 50, color: "bg-blue-500" },
            { label: "→", val: 0, max: 0, color: "" },
            { label: "QA Review", val: 28, max: 45, color: "bg-amber-500" },
            { label: "→", val: 0, max: 0, color: "" },
            { label: "Audit", val: 14, max: 20, color: "bg-violet-500" },
            { label: "→", val: 0, max: 0, color: "" },
            { label: "Submission", val: 12, max: 20, color: "bg-emerald-500" },
          ].map((s, i) => {
            if (s.label === "→")
              return (
                <ChevronRight
                  key={i}
                  className="w-5 h-5 text-muted-foreground/30 flex-shrink-0"
                />
              );
            const pct = Math.round((s.val / s.max) * 100);
            const barCls =
              pct < 70 ? s.color : pct < 85 ? "bg-amber-500" : "bg-red-500";
            return (
              <div
                key={s.label}
                className="flex-1 min-w-[100px] bg-muted/40 rounded-xl p-3 border border-border"
              >
                <p className="text-[10px] font-semibold text-muted-foreground truncate mb-2">
                  {s.label}
                </p>
                <p className="text-[18px] font-black text-foreground leading-tight">
                  {s.val}
                  <span className="text-[10px] font-semibold text-muted-foreground ml-1">
                    / hr
                  </span>
                </p>
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barCls}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">
                  {pct}% of cap.
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export function OperationsOverview() {
  const [activeTab, setActiveTab] = useState<TabId>("queue");
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-foreground">Operations Overview</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              Real-time pipeline monitoring, SLA tracking, and resource
              management for HEDIS MY2026
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[11px] font-semibold text-primary whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" />
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
                {tab.id === "bottlenecks" && (
                  <span className="w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section header ──────────────────────────────── */}
      <SectionHeader
        icon={active.icon}
        title={active.label}
        subtitle={active.desc}
        accent={
          activeTab === "queue"
            ? "bg-primary"
            : activeTab === "progress"
              ? "bg-emerald-500"
              : activeTab === "resources"
                ? "bg-violet-500"
                : "bg-red-500"
        }
      />

      {/* ── Panel ───────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {activeTab === "queue" && <QueueVolumes />}
        {activeTab === "progress" && <ReviewProgress />}
        {activeTab === "resources" && <ResourceAllocation />}
        {activeTab === "bottlenecks" && <WorkflowBottlenecks />}
      </div>
    </div>
  );
}
