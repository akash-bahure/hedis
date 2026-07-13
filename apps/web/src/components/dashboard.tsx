import { useState, useId } from "react";
import type React from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  Users,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Clock,
  Target,
  Activity,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  Shield,
  Calendar,
  FileText,
  RefreshCw,
  Zap,
  Star,
  Flag,
  Info,
  Layers,
  X,
  CircleDot,
} from "lucide-react";
import {
  useGetApiDashboardMeasureRates,
  useGetApiDashboardQueueByMeasure,
  useGetApiRecentActivity,
  useGetApiDashboardAbstractionVelocity,
  useGetApiDashboardQueueByDomain,
  useGetApiDashboardStats,
  useGetApiDashboardDeadlines,
} from "@/api";
import { Pagination } from "./Pagination";

/* ─── Colours ──────────────────────────────────────────── */
const C = {
  primary: "#0891b2",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  violet: "#8b5cf6",
  blue: "#3b82f6",
  slate: "#64748b",
  rose: "#f43f5e",
  indigo: "#6366f1",
};

/* ─── HEDIS Measure data ────────────────────────────────── */
const hedisRates = [
  {
    measure: "CBP",
    name: "Controlling High Blood Pressure",
    rate: 72.4,
    benchmark: 74.0,
    target: 76.0,
    domain: "Cardiovascular",
    change: +1.8,
    status: "below",
  },
  {
    measure: "CDC",
    name: "Comprehensive Diabetes Care",
    rate: 68.1,
    benchmark: 69.3,
    target: 72.0,
    domain: "Diabetes",
    change: +0.9,
    status: "below",
  },
  {
    measure: "BCS",
    name: "Breast Cancer Screening",
    rate: 77.3,
    benchmark: 75.8,
    target: 78.0,
    domain: "Preventive",
    change: +2.1,
    status: "above",
  },
  {
    measure: "COL",
    name: "Colorectal Cancer Screening",
    rate: 65.8,
    benchmark: 68.0,
    target: 70.0,
    domain: "Preventive",
    change: +0.4,
    status: "below",
  },
  {
    measure: "AMR",
    name: "Medication Management – Asthma",
    rate: 81.2,
    benchmark: 80.5,
    target: 82.0,
    domain: "Respiratory",
    change: +3.2,
    status: "above",
  },
  {
    measure: "EED",
    name: "Eye Exam for Patients w/ Diabetes",
    rate: 60.7,
    benchmark: 62.1,
    target: 65.0,
    domain: "Diabetes",
    change: -0.5,
    status: "below",
  },
  {
    measure: "HBD",
    name: "Hemoglobin A1c Testing",
    rate: 87.4,
    benchmark: 85.0,
    target: 88.0,
    domain: "Diabetes",
    change: +4.1,
    status: "above",
  },
  {
    measure: "W15",
    name: "Well-Child Visits (15 months)",
    rate: 63.9,
    benchmark: 67.4,
    target: 70.0,
    domain: "Child Health",
    change: +1.1,
    status: "below",
  },
  {
    measure: "FUH",
    name: "Follow-Up After Hospitalization",
    rate: 55.2,
    benchmark: 57.0,
    target: 60.0,
    domain: "Mental Health",
    change: -1.2,
    status: "below",
  },
];

/* ─── Abstraction velocity trend ────────────────────────── */
const velocityTrend = [
  { day: "Feb 11", charts: 34, target: 40, aiAssist: 28 },
  { day: "Feb 12", charts: 41, target: 40, aiAssist: 34 },
  { day: "Feb 13", charts: 38, target: 40, aiAssist: 31 },
  { day: "Feb 14", charts: 45, target: 40, aiAssist: 38 },
  { day: "Feb 15", charts: 42, target: 40, aiAssist: 36 },
  { day: "Feb 16", charts: 39, target: 40, aiAssist: 33 },
  { day: "Feb 17", charts: 47, target: 40, aiAssist: 42 },
  { day: "Feb 18", charts: 51, target: 40, aiAssist: 46 },
  { day: "Feb 19", charts: 48, target: 40, aiAssist: 43 },
  { day: "Feb 20", charts: 44, target: 40, aiAssist: 39 },
  { day: "Feb 21", charts: 53, target: 40, aiAssist: 49 },
  { day: "Feb 22", charts: 49, target: 40, aiAssist: 45 },
  { day: "Feb 23", charts: 56, target: 40, aiAssist: 51 },
  { day: "Feb 24", charts: 52, target: 40, aiAssist: 47 },
];

/* ─── Domain breakdown ───────────────────────────────────── */
const domainData = [
  { name: "Preventive", value: 28, color: C.emerald },
  { name: "Diabetes", value: 24, color: C.primary },
  { name: "Cardiovascular", value: 19, color: C.cyan },
  { name: "Mental Health", value: 13, color: C.violet },
  { name: "Respiratory", value: 9, color: C.teal },
  { name: "Child Health", value: 7, color: C.amber },
];

/* ─── Queue summary by measure ───────────────────────────── */
const queueByMeasure = [
  { measure: "CDC", open: 84, inProgress: 23, completed: 312, total: 419 },
  { measure: "CBP", open: 67, inProgress: 18, completed: 278, total: 363 },
  { measure: "COL", open: 102, inProgress: 31, completed: 198, total: 331 },
  { measure: "BCS", open: 45, inProgress: 12, completed: 289, total: 346 },
  { measure: "AMR", open: 38, inProgress: 9, completed: 156, total: 203 },
  { measure: "EED", open: 71, inProgress: 14, completed: 187, total: 272 },
  { measure: "HBD", open: 29, inProgress: 8, completed: 341, total: 378 },
  { measure: "FUH", open: 93, inProgress: 22, completed: 112, total: 227 },
];

/* ─── Recent activity ─────────────────────────────────────── */
const recentActivity = [
  {
    id: 1,
    user: "S. Johnson",
    action: "Completed abstraction",
    detail: "CDC — Member MBR-789456",
    time: "2 min ago",
    icon: CheckCircle2,
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    id: 2,
    user: "R. Gupta",
    action: "QA return resolved",
    detail: "CBP — Member MBR-667890",
    time: "14 min ago",
    icon: RefreshCw,
    color: "text-blue-600 bg-blue-50",
  },
  {
    id: 3,
    user: "AI Engine",
    action: "AI suggestion accepted",
    detail: "COL — HbA1c conf. 94%",
    time: "21 min ago",
    icon: Sparkles,
    color: "text-violet-600 bg-violet-50",
  },
  {
    id: 4,
    user: "M. Patel",
    action: "Audit sample reviewed",
    detail: "BCS — AUD-2025-0044",
    time: "38 min ago",
    icon: Shield,
    color: "text-primary bg-primary/10",
  },
  {
    id: 5,
    user: "D. Pillai",
    action: "Chart uploaded",
    detail: "AMR — Member MBR-554320",
    time: "1 hr ago",
    icon: FileText,
    color: "text-slate-600 bg-slate-100",
  },
  {
    id: 6,
    user: "S. Johnson",
    action: "Exception flagged",
    detail: "EED — Member MBR-771092",
    time: "1.5 hrs ago",
    icon: AlertTriangle,
    color: "text-amber-600 bg-amber-50",
  },
];

/* ─── SLA / Deadline tracker ──────────────────────────────── */
const deadlines = [
  {
    measure: "COL",
    label: "Colorectal Cancer Screening",
    due: "Feb 28",
    remaining: 4,
    total: 102,
    completed: 61,
    urgency: "high",
  },
  {
    measure: "FUH",
    label: "Follow-Up After Hospitalization",
    due: "Mar 5",
    remaining: 9,
    total: 93,
    completed: 40,
    urgency: "medium",
  },
  {
    measure: "EED",
    label: "Eye Exam – Diabetes",
    due: "Mar 12",
    remaining: 16,
    total: 71,
    completed: 38,
    urgency: "low",
  },
  {
    measure: "CDC",
    label: "Comprehensive Diabetes Care",
    due: "Mar 20",
    remaining: 24,
    total: 84,
    completed: 52,
    urgency: "low",
  },
];

/* ─── Shared sub-components ───────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  trend,
  trendUp,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ElementType;
  color: string;
  trend?: string;
  trendUp?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}
        >
          <Icon className="w-4 h-4" />
        </div>
        {trend && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
              trendUp
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {trendUp ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {trend}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold text-foreground leading-none">
          {value}
        </div>
        <div className="text-[11px] font-semibold text-muted-foreground mt-1">
          {label}
        </div>
        <div className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

function SectionTitle({
  title,
  sub,
  children,
}: {
  title: string;
  sub?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {sub && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

/* ─── Modal Component (Reusable) ─────────────────────────── */
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─── Updated MeasureRateRow (handles API shape) ──────────── */
function MeasureRateRow({ m }: { m: any }) {
  const rate = m.currentRate ?? 0;
  const target = m.targetRate ?? 80;
  const yoy = m.yoy ?? 0;
  const benchmarkStatus =
    m.benchmarkStatus || (rate >= target ? "Above" : "Below");

  const pct = Math.round((rate / target) * 100);
  const aboveBench = benchmarkStatus === "Above";

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
      <span className="w-10 inline-flex items-center justify-center h-6 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold flex-shrink-0">
        {m.measureCode}
      </span>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-foreground truncate">
          {m.measureName}
        </div>
        <div className="text-[10px] text-muted-foreground">{m.domain}</div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="w-28 hidden lg:flex flex-col gap-0.5">
          <div className="flex items-center justify-between text-[9px] text-muted-foreground">
            <span>{rate}%</span>
            <span>Target {target}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden relative">
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
              style={{ left: `${((target * 0.9) / target) * 100}%` }} // rough benchmark marker
            />
            <div
              className={`h-full rounded-full ${aboveBench ? "bg-emerald-500" : "bg-primary"}`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>
        </div>

        <span
          className={`flex items-center gap-0.5 text-[10px] font-bold w-14 justify-end ${
            yoy >= 0 ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {yoy >= 0 ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          {yoy >= 0 ? "+" : ""}
          {yoy}%
        </span>

        <span
          className={`text-[9px] font-bold px-1.5 py-0.5 rounded border w-16 text-center flex-shrink-0 ${
            aboveBench
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-amber-50 border-amber-200 text-amber-700"
          }`}
        >
          {aboveBench ? "▲ Above" : "▼ Below"}
        </span>
      </div>
    </div>
  );
}

function QueueRow({ q }: { q: any }) {
  const pct = q.completionPercentage ?? 0;

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
      <span className="w-10 inline-flex items-center justify-center h-6 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold flex-shrink-0">
        {q.measureCode}
      </span>

      <div className="w-24 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                pct >= 80
                  ? "bg-emerald-500"
                  : pct >= 60
                    ? "bg-primary"
                    : "bg-amber-500"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] font-bold text-foreground w-8 text-right">
            {pct}%
          </span>
        </div>
      </div>

      <span className="flex-1 text-xs font-semibold text-foreground">
        {q.open}
      </span>
      <span className="w-16 text-xs text-muted-foreground text-right">
        {q.inProgress}
      </span>
      <span className="w-20 text-xs font-semibold text-emerald-700 text-right">
        {q.completed.toLocaleString()}
      </span>
    </div>
  );
}

/* ─── New: Activity Row with Relative Time ──────────────────────────────── */
function ActivityRow({ activity }: { activity: any }) {
  const getIconAndColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "qa approved":
      case "completed":
        return { Icon: CheckCircle2, color: "text-emerald-600 bg-emerald-50" };
      case "qa returned":
      case "qa fail":
        return { Icon: RefreshCw, color: "text-blue-600 bg-blue-50" };
      case "ai evaluation completed":
      case "ai suggestion":
        return { Icon: Sparkles, color: "text-violet-600 bg-violet-50" };
      case "audit":
        return { Icon: Shield, color: "text-primary bg-primary/10" };
      case "patient chart uploaded":
      case "chart uploaded":
        return { Icon: FileText, color: "text-slate-600 bg-slate-100" };
      case "exception":
      case "flagged":
        return { Icon: AlertTriangle, color: "text-amber-600 bg-amber-50" };
      default:
        return { Icon: Clock, color: "text-slate-600 bg-slate-100" };
    }
  };

  const { Icon, color } = getIconAndColor(activity.activityType);

  // ── Smart Relative Time ─────────────────────────────────────
  const getRelativeTime = (dateString: string): string => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return created.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const relativeTime = getRelativeTime(activity.createdAt);

  return (
    <div className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-muted/10 transition-colors">
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-1">
          <span className="text-[11px] font-semibold text-foreground truncate">
            {activity.activityType}
          </span>
          <span className="text-[9px] text-muted-foreground/70 flex-shrink-0">
            {relativeTime}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {activity.description}
        </div>
        <div className="text-[9px] text-muted-foreground/60 mt-0.5">
          {activity.performedBy}
        </div>
      </div>
    </div>
  );
}

/* ─── Abstraction Velocity Chart Component ───────────────────────────── */
function AbstractionVelocityChart() {
  const {
    data: velocityResponse,
    isLoading,
    error,
  } = useGetApiDashboardAbstractionVelocity({ days: 14 });

  const chartData =
    velocityResponse?.data?.map((item: any) => {
      const date = new Date(item.date);
      const dayLabel = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      return {
        day: dayLabel,
        charts: item.totalCharts || 0,
        aiAssist: item.aiAssisted || 0,
        target: item.target || 40,
      };
    }) ?? [];

  // Fallback to mock if no data
  const finalData = chartData.length > 0 ? chartData : velocityTrend;

  const uid = useId();
  const gradChartsId = `gradCharts-${uid}`;
  const gradAIId = `gradAI-${uid}`;

  if (isLoading) {
    return (
      <div className="h-[180px] flex items-center justify-center text-muted-foreground">
        Loading velocity data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[180px] flex items-center justify-center text-red-500">
        Failed to load abstraction velocity.
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart
          data={finalData}
          margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id={gradChartsId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.primary} stopOpacity={0.15} />
              <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id={gradAIId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.violet} stopOpacity={0.12} />
              <stop offset="95%" stopColor={C.violet} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 11,
            }}
            labelStyle={{ fontWeight: 700 }}
          />
          <Line
            type="monotone"
            dataKey="target"
            stroke={C.amber}
            strokeDasharray="4 3"
            strokeWidth={1.5}
            dot={false}
            name="Daily Target"
          />
          <Area
            type="monotone"
            dataKey="charts"
            stroke={C.primary}
            strokeWidth={2}
            fill={`url(#${gradChartsId})`}
            name="Total Charts"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="aiAssist"
            stroke={C.violet}
            strokeWidth={1.5}
            fill={`url(#${gradAIId})`}
            name="AI-Assisted"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-primary inline-block rounded" />
          Total Charts
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-violet-500 inline-block rounded" />
          AI-Assisted
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-400 inline-block" />
          Target
        </span>
      </div>
    </>
  );
}

/* ─── Queue by Domain Chart Component ───────────────────────────── */
function DomainBreakdownChart() {
  const {
    data: domainResponse,
    isLoading,
    error,
  } = useGetApiDashboardQueueByDomain();

  const apiDomainData = domainResponse?.data ?? [];

  // Map API data to chart format + assign colors
  const chartData = apiDomainData.map((item: any, index: number) => {
    const colors = [
      C.emerald,
      C.primary,
      C.cyan,
      C.violet,
      C.teal,
      C.amber,
      "#64748b",
    ];
    return {
      name: item.domain,
      value: item.percentage || 0,
      count: item.count || 0,
      color: colors[index % colors.length],
    };
  });

  // Fallback to mock if API returns empty
  const finalData = chartData.length > 0 ? chartData : domainData;

  if (isLoading) {
    return (
      <div className="h-[160px] flex items-center justify-center text-muted-foreground">
        Loading domain distribution...
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[160px] flex items-center justify-center text-red-500">
        Failed to load domain breakdown.
      </div>
    );
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={160}>
        <PieChart>
          <Pie
            data={finalData}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
          >
            {finalData.map((d: any, index: number) => (
              <Cell key={`cell-${index}`} fill={d.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 11,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <div className="space-y-1.5 mt-1">
        {finalData.map((d: any) => (
          <div
            key={d.name}
            className="flex items-center justify-between text-[10px]"
          >
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: d.color }}
              />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
            <span className="font-semibold text-foreground">{d.value}%</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ─── Dashboard KPI Cards Component ───────────────────────────── */
/* ─── Dashboard KPI Cards Component ───────────────────────────── */
function DashboardKpiCards() {
  const { data: statsResponse, isLoading, error } = useGetApiDashboardStats();

  const stats = statsResponse?.data ?? {};

  const getValue = (obj: any, fallback: string = "0") => {
    const val = obj?.value ?? null;
    return val !== null && val !== undefined ? val : fallback;
  };

  const getTrend = (obj: any) => {
    const trend = obj?.trend ?? "";
    return trend || "0%";
  };

  const getTrendUp = (obj: any) => {
    const type = obj?.trendType;
    if (type === "up") return true;
    if (type === "down") return false;
    return undefined;
  };

  // Loading skeleton for each card
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 animate-pulse"
          >
            <div className="w-9 h-9 bg-muted rounded-lg" />
            <div>
              <div className="h-8 w-16 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded mt-2" />
              <div className="h-3 w-20 bg-muted rounded mt-1" />
            </div>
          </div>
        ))}
      </>
    );
  }

  if (error) {
    return (
      <div className="col-span-full h-32 flex items-center justify-center text-red-500 border border-border rounded-xl">
        Failed to load dashboard statistics.
      </div>
    );
  }

  return (
    <>
      <KpiCard
        label="Open Queue"
        value={getValue(stats.openQueue).toLocaleString()}
        sub="charts pending abstraction"
        icon={ClipboardList}
        color="bg-primary/10 text-primary"
        trend={getTrend(stats.openQueue)}
        trendUp={getTrendUp(stats.openQueue)}
      />

      <KpiCard
        label="Completed Today"
        value={getValue(stats.completedToday).toString()}
        sub="abstractions finalized"
        icon={CheckCircle2}
        color="bg-emerald-100 text-emerald-700"
        trend={getTrend(stats.completedToday)}
        trendUp={getTrendUp(stats.completedToday)}
      />

      <KpiCard
        label="Overall HEDIS Rate"
        value={`${getValue(stats.overallHedisRate)}%`}
        sub="blended MY2026 rate"
        icon={Target}
        color="bg-cyan-100 text-cyan-700"
        trend={getTrend(stats.overallHedisRate)}
        trendUp={getTrendUp(stats.overallHedisRate)}
      />

      <KpiCard
        label="AI Assist Rate"
        value={`${getValue(stats.aiAssistRate)}%`}
        sub="suggestions accepted"
        icon={Sparkles}
        color="bg-violet-100 text-violet-700"
        trend={getTrend(stats.aiAssistRate)}
        trendUp={getTrendUp(stats.aiAssistRate)}
      />

      <KpiCard
        label="SLA Compliance"
        value={`${getValue(stats.slaCompliance)}%`}
        sub="charts on-time"
        icon={Shield}
        color="bg-amber-100 text-amber-700"
        trend={getTrend(stats.slaCompliance)}
        trendUp={getTrendUp(stats.slaCompliance)}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export function Dashboard() {
  const [activeTab, setActiveTab] = useState<"rates" | "queue">("rates");
  const [ratesModalOpen, setRatesModalOpen] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [modalPage, setModalPage] = useState(1);
  const [queueModalPage, setQueueModalPage] = useState(1);
  const [activityPage, setActivityPage] = useState(1);
  const uid = useId();
  const gradChartsId = `gradCharts-${uid}`;
  const gradAIId = `gradAI-${uid}`;

  const totalOpen = queueByMeasure.reduce((s, q) => s + q.open, 0);
  const totalProgress = queueByMeasure.reduce((s, q) => s + q.inProgress, 0);
  const totalCompleted = queueByMeasure.reduce((s, q) => s + q.completed, 0);
  const totalDenominator = queueByMeasure.reduce((s, q) => s + q.total, 0);
  const completionPct = Math.round((totalCompleted / totalDenominator) * 100);

  // API Integration - HEDIS Measure Rates
  const {
    data: ratesResponse,
    isLoading: ratesLoading,
    error: ratesError,
  } = useGetApiDashboardMeasureRates({
    page_no: 1,
    page_size: 9, // keep small for dashboard preview
  });

  const apiRates = ratesResponse?.data ?? [];
  const paginationInfo = ratesResponse?.pagination;

  // Fallback / computed values
  const avgRate = apiRates.length
    ? Math.round(
        (apiRates.reduce((sum, m) => sum + (m.currentRate ?? 0), 0) /
          apiRates.length) *
          10,
      ) / 10
    : 72.8;

  const aboveBenchCt = apiRates.filter(
    (m) =>
      m.benchmarkStatus === "Above" ||
      (m.currentRate ?? 0) >= (m.targetRate ?? 80),
  ).length;

  const {
    data: deadlinesData,
    isLoading: deadlinesLoading,
    isError: deadlinesError,
    refetch,
  } = useGetApiDashboardDeadlines();
  // const deadlines =
  //   deadlinesData?.map((item: any) => ({
  //     measure: item.measure,
  //     label: item.measure_name,
  //     due: item.due_date,
  //     remaining: item.remaining_days,
  //     total: item.total,
  //     completed: item.completed,
  //     open: item.open,
  //     urgency: item.urgency,
  //   })) ?? [];

  // For full modal pagination
  const { data: fullRatesResponse, isLoading: fullRatesLoading } =
    useGetApiDashboardMeasureRates(
      {
        page_no: modalPage,
        page_size: 10,
      },
      { enabled: ratesModalOpen },
    );

  const fullRates = fullRatesResponse?.data ?? [];
  const fullPagination = fullRatesResponse?.pagination;

  // ====================== QUEUE API ======================
  const {
    data: queueResponse,
    isLoading: queueLoading,
    error: queueError,
  } = useGetApiDashboardQueueByMeasure({ page_no: 1, page_size: 8 });

  const apiQueue = queueResponse?.data ?? [];
  const summary = queueResponse?.summary ?? {
    totalOpen: 0,
    totalInProgress: 0,
    totalCompleted: 0,
    completionPercentage: 0,
  };

  // Full modal data for Queue
  const { data: fullQueueResponse, isLoading: fullQueueLoading } =
    useGetApiDashboardQueueByMeasure(
      { page_no: queueModalPage, page_size: 10 },
      { enabled: queueModalOpen },
    );

  const fullQueue = fullQueueResponse?.data ?? [];
  const fullQueuePagination = fullQueueResponse?.pagination;

  const {
    data: activityResponse,
    isLoading: activityLoading,
    error: activityError,
  } = useGetApiRecentActivity({ page: 1, limit: 6 }); // small for sidebar
  const recentActivities = activityResponse?.data ?? [];

  const { data: fullActivityResponse, isLoading: fullActivityLoading } =
    useGetApiRecentActivity(
      { page: activityPage, limit: 10 },
      { enabled: activityModalOpen },
    );

  const fullActivities = fullActivityResponse?.data ?? [];
  const activityMeta = fullActivityResponse?.metadata;

  return (
    <div className="space-y-5">
      <div className="max-w-screen-2xl mx-auto px-4 py-4 space-y-5">
        {/* ── Page header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-foreground">
              HEDIS Abstractor Dashboard
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Measurement Year 2026 · NCQA Hybrid Methodology · Last updated Feb
              24, 2026 at 09:41 AM
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <DashboardKpiCards />
        </div>

        {/* ── Row 2: Velocity + Domain Breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Abstraction Velocity */}
          {/* Abstraction Velocity */}
          <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
            <SectionTitle
              title="Abstraction Velocity"
              sub="Daily charts completed vs. target — AI-assisted vs. manual"
            >
              <span className="flex items-center gap-1 text-[10px] text-muted-foreground border border-border rounded px-2 py-1">
                <Calendar className="w-3 h-3" />
                Last 14 days
              </span>
            </SectionTitle>

            <AbstractionVelocityChart />
          </div>

          {/* Domain Breakdown */}
          {/* Domain Breakdown */}
          <div className="bg-card border border-border rounded-xl p-5">
            <SectionTitle
              title="Queue by Domain"
              sub="Open charts by HEDIS domain"
            />
            <DomainBreakdownChart />
          </div>
        </div>

        {/* ── Row 3: Measure Rates + Queue + Activity ── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Left: Measure Rates / Queue table (tab-switched) */}
          <div className="xl:col-span-2 bg-card border border-border rounded-xl overflow-hidden">
            {/* Tab header */}
            <div className="flex items-center border-b border-border px-4 pt-3 pb-0 gap-4">
              <button
                onClick={() => setActiveTab("rates")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "rates"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                HEDIS Measure Rates
              </button>
              <button
                onClick={() => setActiveTab("queue")}
                className={`pb-2.5 text-xs font-bold border-b-2 transition-colors ${
                  activeTab === "queue"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Queue by Measure
              </button>
              <div className="ml-auto flex items-center gap-2 pb-2">
                {activeTab === "rates" && (
                  <button
                    onClick={() => setRatesModalOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                )}
                {activeTab === "queue" && (
                  <button
                    onClick={() => setQueueModalOpen(true)}
                    className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    View All <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            {activeTab === "rates" ? (
              <div className="divide-y divide-border/30">
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/20">
                  <span className="w-10 text-[9px] font-black text-muted-foreground uppercase flex-shrink-0">
                    Code
                  </span>
                  <span className="flex-1 text-[9px] font-black text-muted-foreground uppercase">
                    Measure Name
                  </span>
                  <span className="w-28 text-[9px] font-black text-muted-foreground uppercase hidden lg:block">
                    Rate vs Target
                  </span>
                  <span className="w-14 text-[9px] font-black text-muted-foreground uppercase text-right">
                    YoY
                  </span>
                  <span className="w-16 text-[9px] font-black text-muted-foreground uppercase text-center">
                    Bench
                  </span>
                </div>
                {ratesLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading measure rates...
                  </div>
                ) : ratesError ? (
                  <div className="p-8 text-center text-red-500">
                    Failed to load rates. Please try again.
                  </div>
                ) : (
                  apiRates.map((m: any) => (
                    <MeasureRateRow key={m.measureCode} m={m} />
                  ))
                )}
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 px-4 py-2 bg-muted/20">
                  <span className="w-10 text-[9px] font-black text-muted-foreground uppercase flex-shrink-0">
                    Code
                  </span>
                  <span className="w-24 text-[9px] font-black text-muted-foreground uppercase flex-shrink-0">
                    Completion
                  </span>
                  <span className="flex-1 text-[9px] font-black text-muted-foreground uppercase">
                    Open
                  </span>
                  <span className="w-16 text-[9px] font-black text-muted-foreground uppercase text-right">
                    In Progress
                  </span>
                  <span className="w-20 text-[9px] font-black text-muted-foreground uppercase text-right">
                    Completed
                  </span>
                </div>
                {queueLoading ? (
                  <div className="p-8 text-center">Loading queue...</div>
                ) : queueError ? (
                  <div className="p-8 text-center text-red-500">
                    Failed to load queue data.
                  </div>
                ) : (
                  apiQueue.map((q: any) => (
                    <QueueRow key={q.measureCode} q={q} />
                  ))
                )}

                {/* Summary Footer */}
                <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/10 border-t border-border">
                  <span className="w-10 flex-shrink-0 text-[10px] font-black text-muted-foreground">
                    TOTAL
                  </span>
                  <div className="w-24 flex-shrink-0">
                    <span className="text-[10px] font-black text-foreground">
                      {summary.completionPercentage}% done
                    </span>
                  </div>
                  <span className="flex-1 text-xs font-bold text-foreground">
                    {summary.totalOpen}
                  </span>
                  <span className="w-16 text-xs font-semibold text-foreground text-right">
                    {summary.totalInProgress}
                  </span>
                  <span className="w-20 text-xs font-bold text-emerald-700 text-right">
                    {summary.totalCompleted.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Activity Feed */}
          <div className="space-y-4">
            {/* Recent Activity */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">
                    Recent Activity
                  </span>
                  <button
                    onClick={() => setActivityModalOpen(true)}
                    className="text-[10px] text-primary hover:underline"
                  >
                    View all
                  </button>
                </div>
              </div>
              <div className="divide-y divide-border">
                {activityLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Loading activity...
                  </div>
                ) : activityError ? (
                  <div className="p-8 text-center text-red-500">
                    Failed to load recent activity.
                  </div>
                ) : (
                  recentActivities
                    .slice(0, 6)
                    .map((act: any) => (
                      <ActivityRow key={act.id} activity={act} />
                    ))
                )}
              </div>
            </div>

            {/* AI Performance card */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                </div>
                <span className="text-xs font-bold text-violet-800">
                  AI Engine Status
                </span>
                <span className="ml-auto text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
                  Live
                </span>
              </div>
              <div className="space-y-2">
                {[
                  {
                    label: "Suggestion Accuracy",
                    val: "94.2%",
                    bar: 94,
                    color: "bg-violet-500",
                  },
                  {
                    label: "Acceptance Rate",
                    val: "87.3%",
                    bar: 87,
                    color: "bg-primary",
                  },
                  {
                    label: "Avg. Confidence Score",
                    val: "91.8%",
                    bar: 92,
                    color: "bg-emerald-500",
                  },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-[10px] mb-0.5">
                      <span className="text-violet-700">{s.label}</span>
                      <span className="font-bold text-violet-900">{s.val}</span>
                    </div>
                    <div className="h-1.5 bg-violet-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${s.color}`}
                        style={{ width: `${s.bar}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-violet-500 mt-3">
                GPT-Med v4 · NCQA-validated · MY2026
              </p>
            </div>
          </div>
        </div>

        {/* ── Row 4: Deadline Tracker ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div>
              <span className="text-xs font-bold text-foreground">
                Upcoming Abstraction Deadlines
              </span>
              <span className="ml-2 text-[10px] text-muted-foreground">
                SLA tracking for open measure batches
              </span>
            </div>
            <button className="inline-flex items-center gap-1.5 text-[11px] text-primary hover:underline font-semibold">
              Full SLA Report <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {deadlinesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="border border-border rounded-lg p-4 animate-pulse"
                >
                  <div className="h-5 w-14 bg-muted rounded mb-3" />
                  <div className="h-4 w-40 bg-muted rounded mb-4" />
                  <div className="h-2 bg-muted rounded-full mb-3" />
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-muted rounded" />
                    <div className="h-3 w-20 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : deadlinesError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />

              <h3 className="text-sm font-semibold text-foreground">
                Failed to load deadlines
              </h3>

              <p className="text-xs text-muted-foreground mt-2">
                Please try refreshing the dashboard.
              </p>

              <button
                onClick={() => refetch()}
                className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-xs font-medium"
              >
                Retry
              </button>
            </div>
          ) : deadlines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />

              <h3 className="text-sm font-semibold text-foreground">
                No Upcoming Deadlines
              </h3>

              <p className="text-xs text-muted-foreground mt-2 text-center max-w-md">
                Great! There are currently no upcoming abstraction deadlines.
                All HEDIS measures are on schedule.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border">
              {deadlines.map((d) => {
                const pct = Math.round(((d.total - d.open) / d.total) * 100);

                const urgencyColor =
                  d.urgency === "high"
                    ? "text-red-600 bg-red-50 border-red-200"
                    : d.urgency === "medium"
                      ? "text-amber-600 bg-amber-50 border-amber-200"
                      : "text-emerald-600 bg-emerald-50 border-emerald-200";

                return (
                  <div key={d.measure} className="px-5 py-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-flex items-center justify-center w-10 h-5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">
                          {d.measure}
                        </span>

                        <div className="text-xs font-semibold text-foreground mt-1.5 leading-snug">
                          {d.label}
                        </div>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${urgencyColor}`}
                      >
                        {d.remaining}d left
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            d.urgency === "high"
                              ? "bg-red-500"
                              : d.urgency === "medium"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <span className="text-[10px] font-bold text-foreground">
                        {pct}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                      <span>
                        Due <strong className="text-foreground">{d.due}</strong>
                      </span>

                      <span>
                        {d.open} open · {d.completed} done
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Row 5: My Queue Preview ── */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                My Queue
              </span>
              <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                5 active
              </span>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-primary text-white rounded-lg hover:opacity-90 transition-opacity">
              Open Work Queue <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="min-w-[750px] w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {[
                    "Member",
                    "Measure",
                    "Status",
                    "Due Date",
                    "Progress",
                    "Action",
                  ].map((h, idx) => (
                    <th
                      key={`th-${idx}`}
                      className="text-left px-3 sm:px-4 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    member: "Anderson, Jennifer K.",
                    id: "MBR-789456",
                    measure: "CDC",
                    status: "In Progress",
                    due: "Feb 28",
                    pct: 70,
                    urgency: false,
                  },
                  {
                    member: "Williams, David M.",
                    id: "MBR-667890",
                    measure: "CBP",
                    status: "Not Started",
                    due: "Feb 28",
                    pct: 0,
                    urgency: false,
                  },
                  {
                    member: "Thompson, Sandra A.",
                    id: "MBR-332178",
                    measure: "BCS",
                    status: "In Progress",
                    due: "Feb 27",
                    pct: 45,
                    urgency: true,
                  },
                  {
                    member: "Martinez, Robert L.",
                    id: "MBR-445512",
                    measure: "COL",
                    status: "Not Started",
                    due: "Feb 26",
                    pct: 0,
                    urgency: true,
                  },
                  {
                    member: "Chen, Lisa W.",
                    id: "MBR-112453",
                    measure: "CDC",
                    status: "QA Pending",
                    due: "Feb 25",
                    pct: 100,
                    urgency: false,
                  },
                ].map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted/10 transition-colors group"
                  >
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-foreground">
                        {row.member}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {row.id}
                      </div>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-10 h-5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-bold">
                        {row.measure}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                          row.status === "QA Pending"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : row.status === "In Progress"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-muted text-muted-foreground border-border"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span
                        className={`flex items-center gap-1 font-semibold ${row.urgency ? "text-red-600" : "text-foreground"}`}
                      >
                        {row.urgency && <AlertTriangle className="w-3 h-3" />}
                        {row.due}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      {row.pct > 0 ? (
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${row.pct === 100 ? "bg-emerald-500" : "bg-primary"}`}
                              style={{ width: `${row.pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-muted-foreground">
                            {row.pct}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <button className="flex items-center gap-1 text-[11px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Open <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="h-2" />
      </div>

      {/* ── FULL RATES MODAL ── */}
      <Modal
        isOpen={ratesModalOpen}
        onClose={() => {
          setRatesModalOpen(false);
          setModalPage(1);
        }}
        title="All HEDIS Measure Rates"
      >
        <div className="space-y-4">
          <div className="divide-y divide-border/30 rounded-xl border border-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/20">
              <span className="w-10 text-[9px] font-black text-muted-foreground uppercase">
                Code
              </span>
              <span className="flex-1 text-[9px] font-black text-muted-foreground uppercase">
                Measure Name
              </span>
              <span className="w-28 text-[9px] font-black text-muted-foreground uppercase hidden lg:block">
                Rate vs Target
              </span>
              <span className="w-14 text-[9px] font-black text-muted-foreground uppercase text-right">
                YoY
              </span>
              <span className="w-16 text-[9px] font-black text-muted-foreground uppercase text-center">
                Bench
              </span>
            </div>

            {fullRatesLoading ? (
              <div className="p-12 text-center">Loading...</div>
            ) : (
              fullRates.map((m: any) => (
                <MeasureRateRow key={m.measureCode} m={m} />
              ))
            )}
          </div>

          {fullPagination && (
            <Pagination
              page={fullPagination.page}
              totalPages={fullPagination.totalPages}
              totalRecords={fullPagination.total}
              pageSize={fullPagination.limit}
              onPageChange={setModalPage}
              recordLabel="measures"
            />
          )}
        </div>
      </Modal>

      {/* QUEUE MODAL */}
      <Modal
        isOpen={queueModalOpen}
        onClose={() => {
          setQueueModalOpen(false);
          setQueueModalPage(1);
        }}
        title="All Queue by Measure"
      >
        <div className="space-y-4">
          <div className="divide-y divide-border/30 rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2 bg-muted/20">
              <span className="w-10 text-[9px] font-black text-muted-foreground uppercase">
                Code
              </span>
              <span className="w-24 text-[9px] font-black text-muted-foreground uppercase">
                Completion
              </span>
              <span className="flex-1 text-[9px] font-black text-muted-foreground uppercase">
                Open
              </span>
              <span className="w-16 text-[9px] font-black text-muted-foreground uppercase text-right">
                In Progress
              </span>
              <span className="w-20 text-[9px] font-black text-muted-foreground uppercase text-right">
                Completed
              </span>
            </div>

            {fullQueueLoading ? (
              <div className="p-12 text-center">Loading...</div>
            ) : (
              fullQueue.map((q: any) => <QueueRow key={q.measureCode} q={q} />)
            )}
          </div>

          {fullQueuePagination && (
            <Pagination
              page={fullQueuePagination.page}
              totalPages={fullQueuePagination.totalPages}
              totalRecords={fullQueuePagination.total}
              pageSize={fullQueuePagination.limit}
              onPageChange={setQueueModalPage}
              recordLabel="measures"
            />
          )}
        </div>
      </Modal>
      {/* ACTIVITY MODAL */}
      <Modal
        isOpen={activityModalOpen}
        onClose={() => {
          setActivityModalOpen(false);
          setActivityPage(1);
        }}
        title="All Recent Activity"
      >
        <div className="space-y-4">
          <div className="divide-y divide-border rounded-xl border border-border overflow-hidden">
            {fullActivityLoading ? (
              <div className="p-12 text-center">Loading activities...</div>
            ) : (
              fullActivities.map((act: any) => (
                <ActivityRow key={act.id} activity={act} />
              ))
            )}
          </div>

          {activityMeta && (
            <Pagination
              page={activityMeta.current_page}
              totalPages={activityMeta.pages}
              totalRecords={activityMeta.total}
              pageSize={activityMeta.limit}
              onPageChange={setActivityPage}
              recordLabel="activities"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
