import { useState } from "react";
import type { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetApiHedisReportsAbstractorProductivity } from "@/api";
import {
  useGetApiHedisReportsMeasurePerformance,
  useGetApiHedisReportsSubmissionReadiness,
  useGetApiHedisReportsGapClosureTrend,
  useGetApiHedisReportsQaOutcomes,
  useGetApiHedisReportsPlanLevelPerformance,
  useGetApiHedisReportsDashboardStats,
  getApiHedisReportsSubmissionReadinessExport,
  getApiHedisReportsExport,
} from "@/api";
import { toast } from "sonner";

import { Pagination } from "./Pagination";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Download,
  Calendar,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Users,
  Target,
  BarChart2,
  Shield,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Activity,
  Sparkles,
  RefreshCw,
  FileText,
  Clock,
  Award,
  X,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   PALETTE
───────────────────────────────────────────────────────────── */
const C = {
  primary: "#0891b2",
  blue: "#3b82f6",
  teal: "#14b8a6",
  emerald: "#10b981",
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
  violet: "#8b5cf6",
  slate: "#94a3b8",
  cyan: "#06b6d4",
};

const QA_DONUT = [
  { name: "Passed", value: 0, color: C.emerald },
  { name: "Pending", value: 0, color: C.amber },
  { name: "Failed", value: 0, color: C.red },
  { name: "Returned", value: 0, color: C.orange },
];
const QA_TOTAL = QA_DONUT.reduce((s, d) => s + d.value, 0);

const DISCREPANCY = [
  { type: "Missing Documentation", count: 34, pct: 38.2, color: C.red },
  { type: "Incorrect Date / Period", count: 22, pct: 24.7, color: C.orange },
  { type: "Coding Error (CPT/ICD)", count: 19, pct: 21.3, color: C.amber },
  { type: "Eligibility Error", count: 14, pct: 15.7, color: C.violet },
];

const PLAN_PERF = [
  { plan: "Medicare", completed: 456, gap: 234, pendingQA: 89 },
  { plan: "Medicaid", completed: 389, gap: 178, pendingQA: 67 },
  { plan: "Commercial", completed: 278, gap: 134, pendingQA: 45 },
];

const KPIS = [
  {
    label: "Overall Gap Rate",
    value: "42.3%",
    sub: "↓ 2.1 pts vs last month",
    trend: "down" as const,
    trendGood: true,
    icon: Target,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 border-amber-200",
    accentBar: "bg-amber-400",
  },
  {
    label: "Numerator Compliance",
    value: "67.8%",
    sub: "↑ 3.4 pts vs last month",
    trend: "up" as const,
    trendGood: true,
    icon: CheckCircle2,
    iconColor: "text-primary",
    iconBg: "bg-primary/10 border-primary/20",
    accentBar: "bg-primary",
  },
  {
    label: "Charts Completed",
    value: "1,847",
    sub: "of 2,234 total (82.7%)",
    trend: "up" as const,
    trendGood: true,
    icon: BarChart2,
    iconColor: "text-teal-600",
    iconBg: "bg-teal-50 border-teal-200",
    accentBar: "bg-teal-500",
  },
  {
    label: "QA Disagreement Rate",
    value: "6.2%",
    sub: "↓ 0.8 pts vs last week",
    trend: "down" as const,
    trendGood: true,
    icon: Users,
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50 border-emerald-200",
    accentBar: "bg-emerald-500",
  },
  {
    label: "Submission Readiness",
    value: "74.1%",
    sub: "↑ 5.2 pts this quarter",
    trend: "up" as const,
    trendGood: true,
    icon: Shield,
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50 border-violet-200",
    accentBar: "bg-violet-500",
  },
];

/* ─────────────────────────────────────────────────────────────
   MODAL + PAGINATION (Reused from Dashboard)
───────────────────────────────────────────────────────────── */
function Modal({
  isOpen,
  onClose,
  title,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MEASURE PERFORMANCE ROW (Updated for API shape)
───────────────────────────────────────────────────────────── */
function MeasurePerformanceRow({ m }: { m: any }) {
  const rate = Number(m.measureRate ?? m.rate ?? 0);
  const benchmark = Number(m.benchmark ?? 80);
  const below = m.belowBenchmark ?? rate < benchmark;

  return (
    <div
      className={`text-center rounded-lg p-2 ${below ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}
    >
      <p
        className={`text-xs font-bold ${below ? "text-red-700" : "text-emerald-700"}`}
      >
        {rate}%
      </p>
      <p className="text-[9px] text-muted-foreground">
        {m.measureCode || m.measure} rate
      </p>
      <p
        className={`text-[9px] font-semibold ${below ? "text-red-600" : "text-emerald-600"}`}
      >
        Bnchmk: {benchmark}%
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUBMISSION READINESS ITEM - Updated to match design
───────────────────────────────────────────────────────────── */
function SubmissionReadinessItem({ item }: { item: any }) {
  const readiness = Math.min(Number(item.readiness ?? 0), 100);
  const target = Number(item.target ?? 80);
  const diff = Number(item.difference ?? 0);
  const isAbove = item.aboveTarget ?? readiness >= target;
  const measureCode = item.measureCode || "N/A";
  const measureName = item.measureName || measureCode;

  const barColor = isAbove
    ? "bg-emerald-500"
    : diff < -20
      ? "bg-red-500"
      : "bg-amber-500";

  const textColor = isAbove
    ? "text-emerald-700"
    : diff < -20
      ? "text-red-700"
      : "text-amber-700";

  const bgColor = isAbove
    ? "bg-emerald-50 border-emerald-200"
    : diff < -20
      ? "bg-red-50 border-red-200"
      : "bg-amber-50 border-amber-200";

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${bgColor} ${textColor}`}
          >
            {measureCode}
          </span>
          <span className="text-[11px] font-semibold text-foreground truncate max-w-[120px]">
            {measureName}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`text-[10px] font-semibold flex items-center gap-0.5 ${diff >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {diff >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {diff >= 0 ? "+" : ""}
            {diff}%
          </span>
          <span className={`text-[12px] font-bold ${textColor}`}>
            {readiness}%
          </span>
        </div>
      </div>
      <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${readiness}%` }}
        />
        {/* Target marker */}
        <div
          className="absolute top-0 h-full w-0.5 bg-foreground/30"
          style={{ left: `${Math.min(target, 100)}%` }}
        />
      </div>
      <div className="flex justify-between mt-0.5">
        <span className="text-[9px] text-muted-foreground">0%</span>
        <span className="text-[9px] text-muted-foreground">
          Target {target}%
        </span>
        <span className="text-[9px] text-muted-foreground">100%</span>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CUSTOM TOOLTIP
───────────────────────────────────────────────────────────── */
function ChartTip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2.5 text-[11px] min-w-[140px]">
      <p className="font-bold text-foreground mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-4"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.color }}
            />
            {p.name}
          </span>
          <span className="font-bold text-foreground">
            {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
            {unit}
          </span>
        </div>
      ))}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  trend,
  trendGood,
  icon: Icon,
  iconColor,
  iconBg,
  accentBar,
  isLoading = false,
}: (typeof KPIS)[0] & { isLoading?: boolean }) {
  const isGood =
    (trend === "up" && trendGood) || (trend === "down" && trendGood);
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col transition-all hover:shadow-md">
      <div className={`h-1 ${accentBar} ${isLoading ? "opacity-50" : ""}`} />
      <div className="flex items-start gap-3 p-4 flex-1">
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconBg} ${isLoading ? "opacity-50" : ""}`}
        >
          <Icon
            className={`w-4.5 h-4.5 ${iconColor}`}
            style={{ width: 18, height: 18 }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-0.5">
            {label}
          </p>
          {isLoading ? (
            <div className="h-7 w-20 bg-muted/50 rounded animate-pulse mb-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground leading-none mb-1">
              {value}
            </p>
          )}
          {isLoading ? (
            <div className="h-3 w-24 bg-muted/50 rounded animate-pulse" />
          ) : (
            <div className="flex items-center gap-1">
              <TrendIcon
                className={`w-3 h-3 flex-shrink-0 ${isGood ? "text-emerald-600" : "text-red-500"}`}
              />
              <span
                className={`text-[10px] font-semibold ${isGood ? "text-emerald-600" : "text-red-500"}`}
              >
                {sub}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  subtitle,
  badge,
  actions,
  children,
  noPad = false,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  noPad?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="min-w-0">
            <h3 className="text-[13px] font-bold text-foreground leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {badge}
        </div>
        {actions && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
      <div className={`flex-1 min-h-0 ${noPad ? "" : "p-4"}`}>{children}</div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-7 py-1.5 text-[11px] font-semibold border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function ToggleGroup({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {options.map(([v, l]) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={`px-2.5 py-1 text-[10px] font-bold transition-colors ${value === v ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export function ReportsAnalytics() {
  const [dateRange, setDateRange] = useState("full");
  const [planFilter, setPlanFilter] = useState("all");
  const [measureFilter, setMeasureFilter] = useState("all");
  const [gapView, setGapView] = useState<"weekly" | "monthly">("monthly");
  const [exportOpen, setExportOpen] = useState(false);
  const { hasPermission } = usePermissions();
  const [measurementYear, setMeasurementYear] = useState("HEDIS MY2026");

  const [measureModalOpen, setMeasureModalOpen] = useState(false);
  const [modalPage, setModalPage] = useState(1);

  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [submissionModalPage, setSubmissionModalPage] = useState(1);

  // ====================== FETCH ALL MEASURES FOR FILTER ======================
  const { data: allMeasuresResponse, isLoading: allMeasuresLoading } =
    useGetApiHedisReportsMeasurePerformance({
      page: 1,
      limit: 100,
      measurementYear: measurementYear,
      plan: planFilter === "all" ? undefined : planFilter,
    });

  // Extract unique measure codes from the response
  const allMeasures = allMeasuresResponse?.data?.items ?? [];
  const uniqueMeasureCodes = Array.from(
    new Set(allMeasures.map((item: any) => item.measureCode || item.measure))
  )
    .filter(Boolean)
    .sort();

  // ====================== DASHBOARD STATS API ======================
  const {
    data: dashboardStatsResponse,
    isLoading: dashboardStatsLoading,
    error: dashboardStatsError,
  } = useGetApiHedisReportsDashboardStats({
    measurementYear: measurementYear,
    plan: planFilter === "all" ? undefined : planFilter,
  });

  // Transform dashboard stats data
  const dashboardData = dashboardStatsResponse?.data;

  // Build KPI data from API or fallback
  const kpiData = dashboardData
    ? [
        {
          label: "Overall Gap Rate",
          value: `${dashboardData.overallGapRate?.rate ?? 0}%`,
          sub: `${(dashboardData.overallGapRate?.delta ?? 0) >= 0 ? "↑" : "↓"} ${Math.abs(dashboardData.overallGapRate?.delta ?? 0)} pts vs last month`,
          trend:
            (dashboardData.overallGapRate?.delta ?? 0) < 0
              ? "down"
              : ("up" as const),
          trendGood: (dashboardData.overallGapRate?.delta ?? 0) < 0,
          icon: Target,
          iconColor: "text-amber-600",
          iconBg: "bg-amber-50 border-amber-200",
          accentBar: "bg-amber-400",
        },
        {
          label: "Numerator Compliance",
          value: `${dashboardData.numeratorCompliance?.rate ?? 0}%`,
          sub: `${(dashboardData.numeratorCompliance?.delta ?? 0) >= 0 ? "↑" : "↓"} ${Math.abs(dashboardData.numeratorCompliance?.delta ?? 0)} pts vs last month`,
          trend:
            (dashboardData.numeratorCompliance?.delta ?? 0) >= 0
              ? "up"
              : ("down" as const),
          trendGood: (dashboardData.numeratorCompliance?.delta ?? 0) >= 0,
          icon: CheckCircle2,
          iconColor: "text-primary",
          iconBg: "bg-primary/10 border-primary/20",
          accentBar: "bg-primary",
        },
        {
          label: "Charts Completed",
          value: `${(dashboardData.chartsCompleted?.completed ?? 0).toLocaleString()}`,
          sub: `of ${(dashboardData.chartsCompleted?.total ?? 0).toLocaleString()} total (${dashboardData.chartsCompleted?.percentage ?? 0}%)`,
          trend: "up" as const,
          trendGood: true,
          icon: BarChart2,
          iconColor: "text-teal-600",
          iconBg: "bg-teal-50 border-teal-200",
          accentBar: "bg-teal-500",
        },
        {
          label: "QA Disagreement Rate",
          value: `${dashboardData.qaDisagreementRate?.rate ?? 0}%`,
          sub: `${(dashboardData.qaDisagreementRate?.delta ?? 0) >= 0 ? "↑" : "↓"} ${Math.abs(dashboardData.qaDisagreementRate?.delta ?? 0)} pts vs last week`,
          trend:
            (dashboardData.qaDisagreementRate?.delta ?? 0) < 0
              ? "down"
              : ("up" as const),
          trendGood: (dashboardData.qaDisagreementRate?.delta ?? 0) < 0,
          icon: Users,
          iconColor: "text-emerald-600",
          iconBg: "bg-emerald-50 border-emerald-200",
          accentBar: "bg-emerald-500",
        },
        {
          label: "Submission Readiness",
          value: `${dashboardData.submissionReadiness?.rate ?? 0}%`,
          sub: `${(dashboardData.submissionReadiness?.delta ?? 0) >= 0 ? "↑" : "↓"} ${Math.abs(dashboardData.submissionReadiness?.delta ?? 0)} pts this quarter`,
          trend:
            (dashboardData.submissionReadiness?.delta ?? 0) >= 0
              ? "up"
              : ("down" as const),
          trendGood: (dashboardData.submissionReadiness?.delta ?? 0) >= 0,
          icon: Shield,
          iconColor: "text-violet-600",
          iconBg: "bg-violet-50 border-violet-200",
          accentBar: "bg-violet-500",
        },
      ]
    : KPIS;

  // ====================== MEASURE PERFORMANCE API ======================
  const {
    data: measureResponse,
    isLoading: measureLoading,
    error: measureError,
  } = useGetApiHedisReportsMeasurePerformance({
    page: 1,
    limit: 5,
    measurementYear: measurementYear,
    plan: planFilter === "all" ? undefined : planFilter,
    measureCode:
      measureFilter === "all" ? undefined : measureFilter.toUpperCase(),
  });

  // Strong transformation for Chart + UI compatibility
  const apiMeasuresRaw = measureResponse?.data?.items ?? [];

  const apiMeasures = apiMeasuresRaw.map((item: any) => ({
    measure: item.measureCode || item.measure || "N/A",
    measureCode: item.measureCode,
    numerator: Number(item.numerator) || 0,
    denominator: Number(item.denominator) || 0,
    exclusion: Number(item.exclusion) || 0,
    rate: Number(item.measureRate) || 0,
    measureRate: Number(item.measureRate) || 0,
    benchmark: Number(item.benchmark) || 80,
    belowBenchmark: item.belowBenchmark ?? false,
  }));

  const displayMeasures = apiMeasures ?? [];
  // Full modal data
  const { data: fullMeasureResponse, isLoading: fullMeasureLoading } =
    useGetApiHedisReportsMeasurePerformance(
      {
        page: modalPage,
        limit: 10,
        measurementYear: measurementYear,
        plan: planFilter === "all" ? undefined : planFilter,
        measureCode:
          measureFilter === "all" ? undefined : measureFilter.toUpperCase(),
      },
      { enabled: measureModalOpen }
    );

  const fullMeasures = (fullMeasureResponse?.data?.items ?? []).map(
    (item: any) => ({
      ...item,
      measure: item.measureCode || item.measure || "N/A",
      measureRate: item.measureRate ?? item.rate ?? 0,
    })
  );
  const fullMeasurePagination = fullMeasureResponse?.data?.pagination;

  // ====================== SUBMISSION READINESS API ======================
  const {
    data: submissionResponse,
    isLoading: submissionLoading,
    error: submissionError,
  } = useGetApiHedisReportsSubmissionReadiness({
    page: 1,
    limit: 6,
    measurementYear: measurementYear,
    plan: planFilter === "all" ? undefined : planFilter,
    measureCode:
      measureFilter === "all" ? undefined : measureFilter.toUpperCase(),
  });

  const submissionItems = submissionResponse?.data?.items ?? [];

  // Transform for display
  const submissionData = submissionItems.map((item: any) => ({
    ...item,
    readiness: Number(item.readiness ?? 0),
    target: Number(item.target ?? 80),
    difference: Number(item.difference ?? 0),
    aboveTarget:
      item.aboveTarget ??
      Number(item.readiness ?? 0) >= Number(item.target ?? 80),
  }));

  // Modal data
  const { data: fullSubmissionResponse, isLoading: fullSubmissionLoading } =
    useGetApiHedisReportsSubmissionReadiness(
      {
        page: submissionModalPage,
        limit: 10,
        measurementYear: measurementYear,
        plan: planFilter === "all" ? undefined : planFilter,
        measureCode:
          measureFilter === "all" ? undefined : measureFilter.toUpperCase(),
      },
      { enabled: submissionModalOpen }
    );

  const fullSubmissionItems = (fullSubmissionResponse?.data?.items ?? []).map(
    (item: any) => ({
      ...item,
      readiness: Number(item.readiness ?? 0),
      target: Number(item.target ?? 80),
      difference: Number(item.difference ?? 0),
      aboveTarget:
        item.aboveTarget ??
        Number(item.readiness ?? 0) >= Number(item.target ?? 80),
    })
  );

  const fullSubmissionPagination = fullSubmissionResponse?.data?.pagination;

  // Calculate summary stats
  const totalReady = submissionData.reduce(
    (acc, item) => acc + (item.readyCount || 0),
    0
  );
  const totalEvaluations = submissionData.reduce(
    (acc, item) => acc + (item.totalEvaluations || 0),
    0
  );
  const overallReadiness =
    totalEvaluations > 0
      ? Math.round((totalReady / totalEvaluations) * 100)
      : 0;
  const belowTargetCount = submissionData.filter(
    (item) => !item.aboveTarget
  ).length;

  // ====================== EXPORT SUBMISSION READINESS ======================
  const [isExporting, setIsExporting] = useState(false);

  const handleExportSubmissionReadiness = async () => {
    try {
      setIsExporting(true);
      toast.loading("Preparing export...", { id: "export-toast" });

      const blob = await getApiHedisReportsSubmissionReadinessExport(
        {
          measurementYear: measurementYear,
          plan: planFilter === "all" ? undefined : planFilter,
          measureCode: measureFilter === "all" ? undefined : measureFilter,
        },
        {
          responseType: "blob",
        }
      );

      // Create downloadable link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `submission-readiness_${measurementYear}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Export downloaded successfully", { id: "export-toast" });
    } catch (err: any) {
      console.error("Export failed:", err);
      toast.error(
        "Failed to export submission readiness report. Please try again.",
        {
          id: "export-toast",
        }
      );
    } finally {
      setIsExporting(false);
      setExportOpen(false);
    }
  };

  // ====================== MAIN EXPORT HANDLER ======================
  const [isMainExporting, setIsMainExporting] = useState(false);

  const handleMainExport = async (format: "csv" | "pdf" | "xlsx") => {
    try {
      setIsMainExporting(true);
      toast.loading(`Preparing ${format.toUpperCase()} export...`, {
        id: "main-export-toast",
      });

      const blob = await getApiHedisReportsExport(
        {
          format: format,
          measurementYear: measurementYear,
          plan: planFilter === "all" ? undefined : planFilter,
          measureCode: measureFilter === "all" ? undefined : measureFilter,
        },
        {
          responseType: "blob",
        }
      );

      // Create downloadable link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hedis-report_${measurementYear}_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`${format.toUpperCase()} export downloaded successfully`, {
        id: "main-export-toast",
      });
    } catch (err: any) {
      console.error("Export failed:", err);
      toast.error(
        `Failed to export ${format.toUpperCase()} report. Please try again.`,
        {
          id: "main-export-toast",
        }
      );
    } finally {
      setIsMainExporting(false);
      setExportOpen(false);
    }
  };

  // ====================== GAP CLOSURE TREND API ======================
  const {
    data: gapTrendResponse,
    isLoading: gapTrendLoading,
    error: gapTrendError,
  } = useGetApiHedisReportsGapClosureTrend({
    view: gapView,
    measurementYear: measurementYear,
    plan: planFilter === "all" ? undefined : planFilter,
    measureCode:
      measureFilter === "all" ? undefined : measureFilter.toUpperCase(),
  });

  // Transform gap trend data
  const gapTrendData = gapTrendResponse?.data?.trend ?? [];
  const gapSummary = gapTrendResponse?.data?.summary;

  // Use API data if available, fallback to static
  const gapChartData = gapTrendData.map((item: any) => ({
    period: item.label || "N/A",
    open: item.openGaps ?? 0,
    closed: item.closedGaps ?? 0,
  }));

  // Summary stats from API or fallback
  const openGaps = gapSummary?.openGaps ?? 0;
  const closedGaps = gapSummary?.closedGaps ?? 0;
  const gapRateDelta = gapSummary?.gapRateDelta ?? 0;
  const isDeltaImproving = gapRateDelta < 0;

  // ====================== QA OUTCOMES API ======================
  const {
    data: qaOutcomesResponse,
    isLoading: qaOutcomesLoading,
    error: qaOutcomesError,
  } = useGetApiHedisReportsQaOutcomes({
    // measurementYear: "HEDIS MY2026",
    // plan: planFilter === "all" ? undefined : planFilter,
    // measureCode:
    //   measureFilter === "all" ? undefined : measureFilter.toUpperCase(),
  });

  // Transform QA outcomes data
  const qaData = qaOutcomesResponse?.data;

  // Use API data if available, fallback to static
  const qaDonutData = qaData
    ? [
        { name: "Passed", value: qaData.passed ?? 0, color: C.emerald },
        { name: "Pending", value: qaData.pending ?? 0, color: C.amber },
        { name: "Failed", value: qaData.failed ?? 0, color: C.red },
        { name: "Returned", value: qaData.returned ?? 0, color: C.orange },
      ]
    : QA_DONUT;

  const qaTotal = qaDonutData.reduce((s, d) => s + d.value, 0);
  const qaPassRate = qaData?.passRate ?? (QA_DONUT[0].value / QA_TOTAL) * 100;

  // Discrepancy data from API or fallback
  const discrepancyData =
    qaData?.discrepancyBreakdown?.length > 0
      ? qaData.discrepancyBreakdown.map((item: any) => ({
          type: item.type || "Unknown",
          count: item.count ?? 0,
          pct: item.percentage ?? 0,
          color: item.type?.includes("Documentation")
            ? C.red
            : item.type?.includes("Date")
              ? C.orange
              : item.type?.includes("Coding")
                ? C.amber
                : C.violet,
        }))
      : DISCREPANCY;

  // ====================== PLAN-LEVEL PERFORMANCE API ======================
  const {
    data: planPerformanceResponse,
    isLoading: planPerformanceLoading,
    error: planPerformanceError,
  } = useGetApiHedisReportsPlanLevelPerformance({
    measurementYear: measurementYear,
    measureCode:
      measureFilter === "all" ? undefined : measureFilter.toUpperCase(),
  });

  // Transform plan performance data
  const planData = planPerformanceResponse?.data?.plans ?? [];
  const planSummary = planPerformanceResponse?.data?.summary;

  // Use API data if available, fallback to static
  const planChartData =
    planData.length > 0
      ? planData.map((item: any) => ({
          plan: item.plan || "Unknown",
          completed: item.completed ?? 0,
          gap: item.openGap ?? 0,
          pendingQA: item.pendingQA ?? 0,
          gapRate: item.gapRate ?? 0,
        }))
      : PLAN_PERF;

  // Summary stats
  const highestGapPlan = planSummary?.highestGapPlan;
  const highestGapPlanName = highestGapPlan?.plan || "N/A";
  const highestGapRate = highestGapPlan?.gapRate ?? 0;

  // ====================== ABSTRACTOR PRODUCTIVITY API ======================
  const {
    data: abstractorResponse,
    isLoading: abstractorLoading,
    error: abstractorError,
  } = useGetApiHedisReportsAbstractorProductivity({
    measurementYear: measurementYear,
    plan: planFilter === "all" ? undefined : planFilter,
  });

  // Transform abstractor data from new API
  const abstractorSummary = abstractorResponse?.data?.summary;
  const abstractorChartData = abstractorResponse?.data?.chartData ?? [];
  const abstractorTableData = abstractorResponse?.data?.tableData ?? [];

  // Use API data if available, fallback to static
  const abstractors = abstractorTableData.map((item: any) => ({
    id: item.abstractorId ?? "",
    name: item.abstractorName ?? "Unknown",
    short:
      (item.abstractorName ?? "")
        .split(" ")
        .map((n: string) => n.charAt(0))
        .join("")
        .toUpperCase() || "U",
    assigned: item.assigned ?? 0,
    completed: item.completed ?? 0,
    avgTime: item.avgTime ?? "0 min",
    qaFailPct: item.qaFailPercentage ?? 0,
    completedPct: item.completedPercentage ?? 0,
    atRisk: item.atRisk ?? false,
  }));

  // Use chart data from API or fallback
  const chartData =
    abstractorChartData.length > 0
      ? abstractorChartData.map((item: any) => ({
          short: item.label || "Unknown",
          completed: item.completed ?? 0,
        }))
      : abstractors.map((a: any) => ({
          short: a.short,
          completed: a.completed,
        }));

  // Summary stats from API or fallback
  const totalAbstractors = abstractorSummary?.totalAbstractors ?? 0;
  const totalAssigned = abstractorSummary?.totalAssigned ?? 0;
  const totalCompleted = abstractorSummary?.totalCompleted ?? 0;
  const atRiskCount = abstractorSummary?.atRiskCount ?? 0;

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* ══════════════════════════════════════════════════════
          STICKY HEADER — FILTERS + EXPORT
      ══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center gap-3 px-6 py-3 flex-wrap">
          {/* Title */}
          <div className="flex items-center gap-2 mr-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-foreground leading-tight">
                Reports & Analytics
              </h1>
              <p className="text-[10px] text-muted-foreground">
                {measurementYear} · NCQA Hybrid Methodology
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Measurement Year Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <FilterSelect
              value={measurementYear}
              onChange={setMeasurementYear}
              options={[
                ["HEDIS MY2026", "HEDIS 2026"],
                ["HEDIS MY2025", "HEDIS 2025"],
              ]}
            />
          </div>

          {/* Plan Filter */}
          <FilterSelect
            value={planFilter}
            onChange={setPlanFilter}
            options={[
              ["all", "All Plans"],
              ["medicare", "Medicare"],
              ["medicaid", "Medicaid"],
              ["commercial", "Commercial"],
            ]}
          />
          {/* Measure Filter */}
          <div className="flex items-center gap-1.5">
            <FilterSelect
              value={
                measureFilter === "all" ? "all" : measureFilter.toLowerCase()
              }
              onChange={(value) => {
                // If "all", keep as "all", otherwise uppercase the measure code
                if (value === "all") {
                  setMeasureFilter("all");
                } else {
                  // Find the original measure code from uniqueMeasureCodes
                  const originalCode = uniqueMeasureCodes.find(
                    (code) => code.toLowerCase() === value
                  );
                  setMeasureFilter(originalCode || value.toUpperCase());
                }
              }}
              options={[
                ["all", "All Measures"],
                ...uniqueMeasureCodes.map((code) => [code.toLowerCase(), code]),
              ]}
            />
            {allMeasuresLoading && (
              <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          {/* Provider Filter */}
          {/* <FilterSelect
            value="all"
            onChange={() => {}}
            options={[
              ["all", "All Providers"],
              ["reyes", "Dr. Reyes"],
              ["chen", "Dr. Chen"],
              ["patel", "Dr. Patel"],
            ]}
          /> */}

          <div className="flex-1" />

          {/* Refresh */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          {/* Export */}
          {hasPermission("Reports", "export") && (
            <div className="relative">
              <button
                onClick={() => setExportOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Export
                <ChevronDown className="w-3 h-3" />
              </button>
              {exportOpen && (
                <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[150px] z-30">
                  <button
                    onClick={() => handleMainExport("csv")}
                    disabled={isMainExporting}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {isMainExporting ? "Exporting..." : "Export CSV"}
                  </button>
                  <button
                    onClick={() => handleMainExport("pdf")}
                    disabled={isMainExporting}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-t border-border"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {isMainExporting ? "Exporting..." : "Export PDF"}
                  </button>
                  {/* XLSX option commented out - uncomment when ready */}
                  {/* <button
                    onClick={() => handleMainExport('xlsx')}
                    disabled={isMainExporting}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-t border-border"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {isMainExporting ? 'Exporting...' : 'Export XLSX'}
                  </button> */}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Last updated strip */}
        <div className="flex items-center gap-4 px-6 py-1.5 bg-muted/30 border-t border-border">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last refreshed: Jul 21,{" "}
            {measurementYear.includes("2026") ? "2026" : "2025"} · 10:04 AM
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            AI insights enabled
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Award className="w-3 h-3 text-violet-600" />
            {measurementYear} · Hybrid Methodology
          </span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MAIN SCROLLABLE CONTENT
      ══════════════════════════════════════════════════════ */}
      <div className="p-5 space-y-5">
        {/* ── SECTION 1: KPI SUMMARY ── */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Performance Summary
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] text-muted-foreground">
              {measurementYear} YTD
            </span>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {dashboardStatsLoading
              ? // Show loading skeletons
                KPIS.map((k, index) => (
                  <KpiCard key={k.label} {...k} isLoading={true} />
                ))
              : dashboardStatsError
                ? // Show error state with fallback data
                  KPIS.map((k) => <KpiCard key={k.label} {...k} />)
                : // Show API data
                  kpiData.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </div>

        {/* ── ROW 1: Measure Performance + Submission Readiness ── */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr" }}>
          {/* Measure Performance */}
          {/* ==================== MEASURE PERFORMANCE ==================== */}
          <SectionCard
            title="Measure Performance"
            subtitle={`Numerator, denominator, and exclusions by HEDIS measure · ${measurementYear}`}
            badge={
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full ml-2">
                <AlertTriangle className="w-2.5 h-2.5" />
                {
                  displayMeasures.filter(
                    (m: any) =>
                      m.belowBenchmark ??
                      (m.measureRate ?? m.rate) < (m.benchmark ?? 80)
                  ).length
                }{" "}
                below benchmark
              </span>
            }
            actions={
              <div className="flex items-center gap-2">
                {/* <FilterSelect
                  value="all"
                  onChange={() => {}} // You can connect this later if needed
                  options={[
                    ["all", "All Measures"],
                    ["cbp", "CBP"],
                    ["hba1c", "HbA1c"],
                    ["bcs", "BCS"],
                    ["col", "COL"],
                    ["cis", "CIS"],
                  ]}
                /> */}
                <button
                  onClick={() => setMeasureModalOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 whitespace-nowrap"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            }
          >
            {measureLoading ? (
              <div className="h-[230px] flex items-center justify-center text-muted-foreground">
                Loading measure performance...
              </div>
            ) : measureError ? (
              <div className="h-[230px] flex items-center justify-center text-red-500 border border-red-200 rounded-lg">
                Failed to load measure performance. Please try again.
              </div>
            ) : (
              <div style={{ height: 230 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={displayMeasures}
                    margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    barGap={2}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey={(m) => m.measureCode || m.measure}
                      tick={{
                        fontSize: 11,
                        fill: "var(--muted-foreground)",
                        fontWeight: 600,
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                    <Bar
                      dataKey="numerator"
                      name="Numerator"
                      fill={C.primary}
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="denominator"
                      name="Denominator"
                      fill={C.blue}
                      radius={[3, 3, 0, 0]}
                    />
                    <Bar
                      dataKey="exclusion"
                      name="Exclusion"
                      fill={C.slate}
                      radius={[3, 3, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Compliance rate strip */}
            <div className="mt-2 grid grid-cols-5 gap-2 border-t border-border pt-3">
              {displayMeasures.map((m: any, idx: number) => (
                <MeasurePerformanceRow
                  key={m.measureCode || m.measure || idx}
                  m={m}
                />
              ))}
            </div>
          </SectionCard>

          {/* Submission Readiness - Updated to use API data with existing design */}
          <SectionCard
            title="Submission Readiness"
            subtitle={`Progress toward NCQA submission targets · ${measurementYear}`}
            actions={
              <span className="text-[10px] text-muted-foreground font-medium">
                Target: 80%
              </span>
            }
          >
            {submissionLoading ? (
              <div className="h-[230px] flex items-center justify-center text-muted-foreground">
                Loading submission readiness...
              </div>
            ) : submissionError ? (
              <div className="h-[230px] flex items-center justify-center text-red-500 border border-red-200 rounded-lg">
                Failed to load submission readiness. Please try again.
              </div>
            ) : submissionItems.length === 0 ? (
              <div className="h-[230px] flex items-center justify-center text-muted-foreground">
                No submission readiness data available
              </div>
            ) : (
              <div className="space-y-3.5">
                {submissionItems.map((item) => (
                  <SubmissionReadinessItem key={item.measureCode} item={item} />
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <button
                onClick={() => setSubmissionModalOpen(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Package className="w-3.5 h-3.5" />
                View Audit Package
              </button>
              <button
                onClick={handleExportSubmissionReadiness}
                disabled={isExporting}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-3.5 h-3.5" />
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ── ROW 2: Gap Closure Trend + QA Outcomes ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Gap Closure Trend */}
          <SectionCard
            title="Gap Closure Trend"
            subtitle={`Open vs. closed gaps over time — ${measurementYear}`}
            actions={
              <ToggleGroup
                value={gapView}
                onChange={(v) => setGapView(v as any)}
                options={[
                  ["monthly", "Monthly"],
                  ["weekly", "Weekly"],
                ]}
              />
            }
          >
            {gapTrendLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Loading gap trend data...
              </div>
            ) : gapTrendError ? (
              <div className="h-[200px] flex items-center justify-center text-red-500 border border-red-200 rounded-lg">
                Failed to load gap trend data. Please try again.
              </div>
            ) : (
              <>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={gapChartData}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="period"
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTip />} />
                      <Legend
                        wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                        formatter={(v) => (
                          <span
                            style={{
                              color: "var(--muted-foreground)",
                              fontWeight: 600,
                            }}
                          >
                            {v}
                          </span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="open"
                        name="Open Gaps"
                        stroke={C.red}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: C.red, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="closed"
                        name="Closed Gaps"
                        stroke={C.emerald}
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: C.emerald, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Gap stats row */}
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3 text-center">
                  {[
                    {
                      label: "Open Gaps",
                      value: openGaps.toLocaleString(),
                      cls: "text-red-600",
                    },
                    {
                      label: "Closed Gaps",
                      value: closedGaps.toLocaleString(),
                      cls: "text-emerald-600",
                    },
                    {
                      label: "Gap Rate Δ",
                      value: `${isDeltaImproving ? "−" : "+"}${Math.abs(gapRateDelta)}%`,
                      cls: isDeltaImproving
                        ? "text-emerald-600"
                        : "text-red-600",
                    },
                  ].map((s) => (
                    <div key={s.label} className="bg-muted/30 rounded-lg py-2">
                      <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </SectionCard>

          {/* QA Outcomes */}
          <SectionCard
            title="QA Outcomes"
            subtitle={`${qaTotal.toLocaleString()} cases reviewed · ${measurementYear} YTD`}
            actions={
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {qaPassRate.toFixed(1)}% Pass Rate
              </span>
            }
          >
            {qaOutcomesLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading QA outcomes data...
              </div>
            ) : qaOutcomesError ? (
              <div className="h-[300px] flex items-center justify-center text-red-500 border border-red-200 rounded-lg">
                Failed to load QA outcomes. Please try again.
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  {/* Donut */}
                  <div
                    className="relative flex-shrink-0"
                    style={{ width: 160, height: 160 }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={qaDonutData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                          stroke="none"
                        >
                          {qaDonutData.map((d, i) => (
                            <Cell key={i} fill={d.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    {/* Center label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-xl font-bold text-foreground leading-none">
                        {qaTotal.toLocaleString()}
                      </p>
                      <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                        Total
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-2">
                    {qaDonutData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                            style={{ background: d.color }}
                          />
                          <span className="text-[12px] font-semibold text-foreground">
                            {d.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-bold text-foreground">
                            {d.value}
                          </span>
                          <span className="text-[10px] text-muted-foreground w-10 text-right">
                            {qaTotal > 0
                              ? ((d.value / qaTotal) * 100).toFixed(1)
                              : 0}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discrepancy breakdown */}
                <div className="mt-4 border-t border-border pt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2.5">
                    Discrepancy Type Breakdown
                  </p>
                  <div className="space-y-2">
                    {discrepancyData.map((d: any) => (
                      <div key={d.type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-foreground">
                            {d.type}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground">
                              {d.count} cases
                            </span>
                            <span className="text-[11px] font-bold text-foreground w-10 text-right">
                              {d.pct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(d.pct, 100)}%`,
                              background: d.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* ── ROW 3: Abstractor Productivity + Plan-Level Performance ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Abstractor Productivity */}
          <SectionCard
            title="Abstractor Productivity"
            subtitle={`Charts completed per coder · ${measurementYear}`}
            actions={
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {atRiskCount} at-risk coder{atRiskCount !== 1 ? "s" : ""}
              </span>
            }
          >
            {abstractorLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Loading abstractor productivity data...
              </div>
            ) : abstractorError ? (
              <div className="h-[300px] flex items-center justify-center text-red-500 border border-red-200 rounded-lg">
                Failed to load abstractor productivity. Please try again.
              </div>
            ) : (
              <>
                {/* Bar chart */}
                <div style={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 0, right: 60, left: 50, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="short"
                        tick={{
                          fontSize: 11,
                          fill: "var(--muted-foreground)",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                        width={46}
                      />
                      <Tooltip content={<ChartTip />} />
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        radius={[0, 3, 3, 0]}
                        maxBarSize={14}
                      >
                        {abstractors.map((a: any, i: number) => (
                          <Cell
                            key={i}
                            fill={a.atRisk ? C.orange : C.primary}
                          />
                        ))}
                        <LabelList
                          dataKey="completed"
                          position="right"
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            fill: "var(--foreground)",
                          }}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Abstractor table */}
                <div className="mt-3 border-t border-border pt-3 overflow-x-auto">
                  <table className="w-full text-sm min-w-[480px]">
                    <thead>
                      <tr className="border-b border-border">
                        {[
                          "Abstractor",
                          "Assigned",
                          "Completed",
                          "Avg Time",
                          "QA Fail %",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap pr-4"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {abstractors.map((a: any) => {
                        const atRisk = a.atRisk || a.qaFailPct > 6;
                        return (
                          <tr
                            key={a.id || a.name}
                            className={`hover:bg-muted/20 transition-colors ${atRisk ? "bg-red-50/40" : ""}`}
                          >
                            <td className="py-2 pr-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${atRisk ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}`}
                                >
                                  {a.name
                                    .split(" ")
                                    .map((n: string) => n.charAt(0))
                                    .join("")
                                    .slice(0, 2)}
                                </div>
                                <span className="text-[12px] font-semibold text-foreground">
                                  {a.name}
                                </span>
                                {atRisk && (
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                )}
                              </div>
                            </td>
                            <td className="py-2 pr-4 text-[12px] text-foreground">
                              {a.assigned}
                            </td>
                            <td className="py-2 pr-4">
                              <span className="text-[12px] font-semibold text-foreground">
                                {a.completed}
                              </span>
                              <span className="text-[10px] text-muted-foreground ml-1">
                                ({a.completedPct}%)
                              </span>
                            </td>
                            <td className="py-2 pr-4 text-[12px] text-foreground">
                              {a.avgTime || "0 min"}
                            </td>
                            <td className="py-2">
                              <span
                                className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  atRisk
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : a.qaFailPct > 4.5
                                      ? "bg-amber-50 text-amber-700 border-amber-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {a.qaFailPct}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Summary stats row */}
                {abstractorSummary && (
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-4 gap-3 text-center">
                    {[
                      {
                        label: "Total Abstractors",
                        value: totalAbstractors,
                        cls: "text-foreground",
                      },
                      {
                        label: "Total Assigned",
                        value: totalAssigned,
                        cls: "text-primary",
                      },
                      {
                        label: "Total Completed",
                        value: totalCompleted,
                        cls: "text-emerald-600",
                      },
                      {
                        label: "At Risk",
                        value: atRiskCount,
                        cls: "text-red-600",
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-muted/30 rounded-lg py-2"
                      >
                        <p className={`text-lg font-bold ${s.cls}`}>
                          {s.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </SectionCard>

          {/* Plan-Level Performance */}
          <SectionCard
            title="Plan-Level Performance"
            subtitle={`Chart status by line of business · ${measurementYear}`}
            actions={
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                  {[
                    { label: "Completed", color: "bg-primary" },
                    { label: "Open Gap", color: "bg-red-400" },
                    { label: "Pending QA", color: "bg-amber-400" },
                  ].map((l) => (
                    <span key={l.label} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-sm ${l.color}`} />
                      <span className="text-muted-foreground font-semibold">
                        {l.label}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            }
          >
            {planPerformanceLoading ? (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Loading plan performance data...
              </div>
            ) : planPerformanceError ? (
              <div className="h-[200px] flex items-center justify-center text-red-500 border border-red-200 rounded-lg">
                Failed to load plan performance. Please try again.
              </div>
            ) : (
              <>
                <div style={{ height: 200 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={planChartData}
                      margin={{ top: 5, right: 10, left: -10, bottom: 0 }}
                      barSize={44}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="plan"
                        tick={{
                          fontSize: 12,
                          fill: "var(--muted-foreground)",
                          fontWeight: 600,
                        }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<ChartTip />} />
                      <Bar
                        dataKey="completed"
                        name="Completed"
                        stackId="a"
                        fill={C.primary}
                      />
                      <Bar
                        dataKey="gap"
                        name="Open Gap"
                        stackId="a"
                        fill={C.red}
                      />
                      <Bar
                        dataKey="pendingQA"
                        name="Pending QA"
                        stackId="a"
                        fill={C.amber}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Plan summary cards */}
                <div className="mt-3 pt-3 border-t border-border grid grid-cols-3 gap-3">
                  {planChartData.map((p: any) => {
                    const total = p.completed + p.gap + p.pendingQA;
                    const compPct =
                      total > 0 ? Math.round((p.completed / total) * 100) : 0;
                    const gapPct =
                      total > 0 ? Math.round((p.gap / total) * 100) : 0;
                    return (
                      <div key={p.plan} className="bg-muted/30 rounded-lg p-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                          {p.plan}
                        </p>
                        <p className="text-lg font-bold text-foreground mb-0.5">
                          {compPct}%
                        </p>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${compPct}%` }}
                          />
                        </div>
                        <div className="space-y-0.5 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Completed
                            </span>
                            <span className="font-bold text-foreground">
                              {p.completed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Open Gap
                            </span>
                            <span className="font-bold text-red-600">
                              {p.gap}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Pending QA
                            </span>
                            <span className="font-bold text-amber-600">
                              {p.pendingQA}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-border pt-0.5 mt-0.5">
                            <span className="text-muted-foreground">
                              Gap Rate
                            </span>
                            <span
                              className={`font-bold ${p.gapRate > 50 ? "text-red-600" : "text-amber-600"}`}
                            >
                              {p.gapRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI insight - updated with dynamic data */}
                <div className="mt-3 border border-primary/20 rounded-lg p-3 bg-primary/5 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-foreground">
                    <span className="font-bold text-primary">AI Insight:</span>{" "}
                    {highestGapPlan && highestGapRate > 50
                      ? `The ${highestGapPlanName} plan has the highest gap rate at ${highestGapRate}%. Recommend targeted outreach for ${highestGapPlanName} measures before submission deadline.`
                      : "All plans are performing well. Continue monitoring gap rates and QA completion to maintain submission readiness."}
                  </p>
                </div>
              </>
            )}
          </SectionCard>
        </div>

        {/* ── BOTTOM SPACER / EXPORT CTA STRIP ── */}
        <div className="border border-border rounded-xl bg-card px-5 py-4 flex items-center gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-9 h-9 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0">
              <Package
                className="w-4.5 h-4.5 text-violet-600"
                style={{ width: 18, height: 18 }}
              />
            </div>
            <div>
              <p className="text-[12px] font-bold text-foreground">
                Ready to generate your HEDIS submission package?
              </p>
              <p className="text-[11px] text-muted-foreground">
                74.1% of measures are submission-ready. COL and BCS require
                attention before the Aug 15 deadline.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors">
              <Activity className="w-3.5 h-3.5" />
              View Gaps Report
            </button>
            <button className="inline-flex items-center gap-1.5 px-4 py-2 text-[11px] font-bold bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-sm">
              <Package className="w-3.5 h-3.5" />
              Generate Audit Package
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ====================== MEASURE PERFORMANCE MODAL ====================== */}
      <Modal
        isOpen={measureModalOpen}
        onClose={() => {
          setMeasureModalOpen(false);
          setModalPage(1);
        }}
        title="All HEDIS Measure Performance"
      >
        <div className="space-y-6">
          {/* Chart in Modal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Performance Overview</h4>
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    fullMeasures.length > 0 ? fullMeasures : displayMeasures
                  }
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  barGap={4}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey={(m) => m.measureCode || m.measure}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar
                    dataKey="numerator"
                    name="Numerator"
                    fill={C.primary}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="denominator"
                    name="Denominator"
                    fill={C.blue}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="exclusion"
                    name="Exclusion"
                    fill={C.slate}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Table */}
          <div>
            {fullMeasureLoading ? (
              <div className="p-12 text-center text-muted-foreground">
                Loading full data...
              </div>
            ) : fullMeasures.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {fullMeasures.map((m: any, idx: number) => (
                  <MeasurePerformanceRow key={m.measureCode || idx} m={m} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {fullMeasurePagination && (
            <Pagination
              page={fullMeasurePagination.page}
              totalPages={fullMeasurePagination.totalPages}
              totalRecords={fullMeasurePagination.total}
              pageSize={fullMeasurePagination.limit}
              onPageChange={setModalPage}
              recordLabel="measures"
            />
          )}
        </div>
      </Modal>

      {/* ====================== SUBMISSION READINESS MODAL ====================== */}
      <Modal
        isOpen={submissionModalOpen}
        onClose={() => {
          setSubmissionModalOpen(false);
          setSubmissionModalPage(1);
        }}
        title="HEDIS Submission Readiness - All Measures"
      >
        <div className="space-y-6">
          {/* Readiness items - same design as main view */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Measure Readiness</h4>
            {fullSubmissionLoading ? (
              <div className="p-12 text-center text-muted-foreground">
                Loading full data...
              </div>
            ) : (fullSubmissionItems.length === 0
                ? submissionItems
                : fullSubmissionItems
              ).length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="space-y-4">
                {(fullSubmissionItems.length > 0
                  ? fullSubmissionItems
                  : submissionItems
                ).map((item: any) => (
                  <SubmissionReadinessItem key={item.measureCode} item={item} />
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {(fullSubmissionPagination ||
            submissionResponse?.data?.pagination) && (
            <Pagination
              page={
                fullSubmissionPagination?.page ||
                submissionResponse?.data?.pagination?.page ||
                1
              }
              totalPages={
                fullSubmissionPagination?.totalPages ||
                submissionResponse?.data?.pagination?.totalPages ||
                1
              }
              totalRecords={
                fullSubmissionPagination?.total ||
                submissionResponse?.data?.pagination?.total ||
                0
              }
              pageSize={
                fullSubmissionPagination?.limit ||
                submissionResponse?.data?.pagination?.limit ||
                10
              }
              onPageChange={setSubmissionModalPage}
              recordLabel="measures"
            />
          )}
        </div>
      </Modal>
    </div>
  );
}
