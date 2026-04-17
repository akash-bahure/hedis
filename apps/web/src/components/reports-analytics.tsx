import { useState } from "react";
import type { ReactNode } from "react";
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

/* ─────────────────────────────────────────────────────────────
   STATIC DATA
───────────────────────────────────────────────────────────── */
const MEASURE_PERF = [
  {
    measure: "CBP",
    numerator: 1245,
    denominator: 1834,
    exclusion: 89,
    rate: 67.9,
    benchmark: 72,
  },
  {
    measure: "HbA1c",
    numerator: 1567,
    denominator: 1923,
    exclusion: 45,
    rate: 81.5,
    benchmark: 78,
  },
  {
    measure: "BCS",
    numerator: 892,
    denominator: 1254,
    exclusion: 67,
    rate: 71.1,
    benchmark: 76,
  },
  {
    measure: "COL",
    numerator: 678,
    denominator: 1089,
    exclusion: 123,
    rate: 62.3,
    benchmark: 70,
  },
  {
    measure: "CIS",
    numerator: 234,
    denominator: 445,
    exclusion: 12,
    rate: 52.6,
    benchmark: 65,
  },
];

const GAP_MONTHLY = [
  { period: "Jan", open: 450, closed: 280 },
  { period: "Feb", open: 420, closed: 310 },
  { period: "Mar", open: 395, closed: 338 },
  { period: "Apr", open: 361, closed: 372 },
  { period: "May", open: 334, closed: 399 },
  { period: "Jun", open: 309, closed: 424 },
  { period: "Jul", open: 287, closed: 446 },
];
const GAP_WEEKLY = [
  { period: "Jun 23", open: 309, closed: 112 },
  { period: "Jun 30", open: 298, closed: 118 },
  { period: "Jul 7", open: 292, closed: 122 },
  { period: "Jul 14", open: 287, closed: 128 },
];

const QA_DONUT = [
  { name: "Passed", value: 847, color: C.emerald },
  { name: "Pending", value: 234, color: C.amber },
  { name: "Failed", value: 89, color: C.red },
  { name: "Returned", value: 67, color: C.orange },
];
const QA_TOTAL = QA_DONUT.reduce((s, d) => s + d.value, 0);

const DISCREPANCY = [
  { type: "Missing Documentation", count: 34, pct: 38.2, color: C.red },
  { type: "Incorrect Date / Period", count: 22, pct: 24.7, color: C.orange },
  { type: "Coding Error (CPT/ICD)", count: 19, pct: 21.3, color: C.amber },
  { type: "Eligibility Error", count: 14, pct: 15.7, color: C.violet },
];

const ABSTRACTORS = [
  {
    name: "Torres, Maria",
    short: "Torres",
    assigned: 267,
    completed: 234,
    avgMin: 8.2,
    qaFailPct: 4.2,
  },
  {
    name: "Patel, Ravi",
    short: "Patel",
    assigned: 312,
    completed: 287,
    avgMin: 7.8,
    qaFailPct: 5.1,
  },
  {
    name: "Kim, Jenny",
    short: "Kim",
    assigned: 221,
    completed: 198,
    avgMin: 9.1,
    qaFailPct: 3.8,
  },
  {
    name: "Okonkwo, Emeka",
    short: "Okonkwo",
    assigned: 198,
    completed: 176,
    avgMin: 10.2,
    qaFailPct: 2.9,
  },
  {
    name: "Chen, Michael",
    short: "Chen",
    assigned: 167,
    completed: 145,
    avgMin: 11.3,
    qaFailPct: 6.7,
  },
];

const PLAN_PERF = [
  { plan: "Medicare", completed: 456, gap: 234, pendingQA: 89 },
  { plan: "Medicaid", completed: 389, gap: 178, pendingQA: 67 },
  { plan: "Commercial", completed: 278, gap: 134, pendingQA: 45 },
];

const SUBMISSION = [
  {
    measure: "HbA1c (CDC)",
    code: "HbA1c",
    pct: 89.3,
    target: 85,
    trend: +2.4,
    status: "above",
  },
  {
    measure: "CIS",
    code: "CIS",
    pct: 82.1,
    target: 80,
    trend: +1.8,
    status: "above",
  },
  {
    measure: "CBP",
    code: "CBP",
    pct: 78.4,
    target: 80,
    trend: -0.9,
    status: "close",
  },
  {
    measure: "BCS",
    code: "BCS",
    pct: 74.2,
    target: 80,
    trend: +3.1,
    status: "below",
  },
  {
    measure: "COL",
    code: "COL",
    pct: 65.8,
    target: 80,
    trend: -2.3,
    status: "critical",
  },
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

/* ─────────────────────────────────────────────────────────────
   REUSABLE COMPONENTS
───────────────────────────────────────────────────────────── */
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
}: (typeof KPIS)[0]) {
  const isGood =
    (trend === "up" && trendGood) || (trend === "down" && trendGood);
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
      <div className={`h-1 ${accentBar}`} />
      <div className="flex items-start gap-3 p-4 flex-1">
        <div
          className={`w-9 h-9 rounded-lg border flex items-center justify-center flex-shrink-0 ${iconBg}`}
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
          <p className="text-2xl font-bold text-foreground leading-none mb-1">
            {value}
          </p>
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

  const gapData = gapView === "monthly" ? GAP_MONTHLY : GAP_WEEKLY;

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
                HEDIS MY 2025 · NCQA Hybrid Methodology
              </p>
            </div>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Date Range */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <FilterSelect
              value={dateRange}
              onChange={setDateRange}
              options={[
                ["full", "MY 2025 (Full Year)"],
                ["q1", "Q1 2025"],
                ["q2", "Q2 2025"],
                ["h1", "H1 2025"],
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
          <FilterSelect
            value={measureFilter}
            onChange={setMeasureFilter}
            options={[
              ["all", "All Measures"],
              ["cbp", "CBP"],
              ["hba1c", "HbA1c"],
              ["bcs", "BCS"],
              ["col", "COL"],
              ["cis", "CIS"],
            ]}
          />

          {/* Provider Filter */}
          <FilterSelect
            value="all"
            onChange={() => {}}
            options={[
              ["all", "All Providers"],
              ["reyes", "Dr. Reyes"],
              ["chen", "Dr. Chen"],
              ["patel", "Dr. Patel"],
            ]}
          />

          <div className="flex-1" />

          {/* Refresh */}
          <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>

          {/* Export */}
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
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[130px] z-30">
                {[
                  ["csv", "Export CSV"],
                  ["pdf", "Export PDF"],
                  ["xlsx", "Export XLSX"],
                ].map(([f, l]) => (
                  <button
                    key={f}
                    onClick={() => setExportOpen(false)}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last updated strip */}
        <div className="flex items-center gap-4 px-6 py-1.5 bg-muted/30 border-t border-border">
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last refreshed: Jul 21, 2025 · 10:04 AM
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-primary" />
            AI insights enabled
          </span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Award className="w-3 h-3 text-violet-600" />
            NCQA MY 2025 · Hybrid Methodology
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
              MY 2025 YTD
            </span>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {KPIS.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </div>
        </div>

        {/* ── ROW 1: Measure Performance + Submission Readiness ── */}
        <div className="grid gap-5" style={{ gridTemplateColumns: "3fr 2fr" }}>
          {/* Measure Performance */}
          <SectionCard
            title="Measure Performance"
            subtitle="Numerator, denominator, and exclusions by HEDIS measure · MY 2025"
            badge={
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full ml-2">
                <AlertTriangle className="w-2.5 h-2.5" />2 below benchmark
              </span>
            }
            actions={
              <FilterSelect
                value="all"
                onChange={() => {}}
                options={[
                  ["all", "All Measures"],
                  ["cbp", "CBP"],
                  ["hba1c", "HbA1c"],
                  ["bcs", "BCS"],
                  ["col", "COL"],
                  ["cis", "CIS"],
                ]}
              />
            }
          >
            <div style={{ height: 230 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={MEASURE_PERF}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                  barGap={2}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="measure"
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
                  <Bar
                    dataKey="numerator"
                    name="Numerator"
                    fill={C.primary}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="denominator"
                    name="Denominator"
                    fill={C.blue}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                  <Bar
                    dataKey="exclusion"
                    name="Exclusion"
                    fill={C.slate}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={22}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Compliance rate strip */}
            <div className="mt-2 grid grid-cols-5 gap-2 border-t border-border pt-3">
              {MEASURE_PERF.map((m) => {
                const below = m.rate < m.benchmark;
                return (
                  <div
                    key={m.measure}
                    className={`text-center rounded-lg p-2 ${below ? "bg-red-50 border border-red-200" : "bg-emerald-50 border border-emerald-200"}`}
                  >
                    <p
                      className={`text-xs font-bold ${below ? "text-red-700" : "text-emerald-700"}`}
                    >
                      {m.rate}%
                    </p>
                    <p className="text-[9px] text-muted-foreground">
                      {m.measure} rate
                    </p>
                    <p
                      className={`text-[9px] font-semibold ${below ? "text-red-600" : "text-emerald-600"}`}
                    >
                      Bnchmk: {m.benchmark}%
                    </p>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Submission Readiness */}
          <SectionCard
            title="Submission Readiness"
            subtitle="Progress toward NCQA submission targets · MY 2025"
            actions={
              <span className="text-[10px] text-muted-foreground font-medium">
                Target: 80%
              </span>
            }
          >
            <div className="space-y-3.5">
              {SUBMISSION.map((s) => {
                const barColor =
                  s.status === "above"
                    ? "bg-emerald-500"
                    : s.status === "close"
                      ? "bg-amber-500"
                      : s.status === "below"
                        ? "bg-orange-500"
                        : "bg-red-500";
                const textColor =
                  s.status === "above"
                    ? "text-emerald-700"
                    : s.status === "close"
                      ? "text-amber-700"
                      : s.status === "below"
                        ? "text-orange-700"
                        : "text-red-700";
                const bgColor =
                  s.status === "above"
                    ? "bg-emerald-50 border-emerald-200"
                    : s.status === "close"
                      ? "bg-amber-50 border-amber-200"
                      : s.status === "below"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-red-50 border-red-200";
                return (
                  <div key={s.code}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${bgColor} ${textColor}`}
                        >
                          {s.code}
                        </span>
                        <span className="text-[11px] font-semibold text-foreground">
                          {s.measure}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-semibold flex items-center gap-0.5 ${s.trend >= 0 ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {s.trend >= 0 ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          {s.trend >= 0 ? "+" : ""}
                          {s.trend}%
                        </span>
                        <span className={`text-[12px] font-bold ${textColor}`}>
                          {s.pct}%
                        </span>
                      </div>
                    </div>
                    <div className="relative h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${barColor}`}
                        style={{ width: `${s.pct}%` }}
                      />
                      {/* Target marker */}
                      <div
                        className="absolute top-0 h-full w-0.5 bg-foreground/30"
                        style={{ left: `${s.target}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[9px] text-muted-foreground">
                        0%
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        Target {s.target}%
                      </span>
                      <span className="text-[9px] text-muted-foreground">
                        100%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <div className="mt-4 pt-3 border-t border-border flex items-center gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                <Package className="w-3.5 h-3.5" />
                View Audit Package
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-[11px] font-bold border border-border text-muted-foreground rounded-lg hover:bg-muted transition-colors">
                <FileText className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </SectionCard>
        </div>

        {/* ── ROW 2: Gap Closure Trend + QA Outcomes ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Gap Closure Trend */}
          <SectionCard
            title="Gap Closure Trend"
            subtitle="Open vs. closed gaps over time — MY 2025"
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
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={gapData}
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
                { label: "Open Gaps", value: "287", cls: "text-red-600" },
                { label: "Closed Gaps", value: "446", cls: "text-emerald-600" },
                { label: "Gap Rate Δ", value: "−2.1%", cls: "text-primary" },
              ].map((s) => (
                <div key={s.label} className="bg-muted/30 rounded-lg py-2">
                  <p className={`text-lg font-bold ${s.cls}`}>{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* QA Outcomes */}
          <SectionCard
            title="QA Outcomes"
            subtitle={`${QA_TOTAL.toLocaleString()} cases reviewed · MY 2025 YTD`}
            actions={
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {((QA_DONUT[0].value / QA_TOTAL) * 100).toFixed(1)}% Pass Rate
              </span>
            }
          >
            <div className="flex items-center gap-4">
              {/* Donut */}
              <div
                className="relative flex-shrink-0"
                style={{ width: 160, height: 160 }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={QA_DONUT}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
                      {QA_DONUT.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-xl font-bold text-foreground leading-none">
                    {QA_TOTAL.toLocaleString()}
                  </p>
                  <p className="text-[9px] text-muted-foreground font-semibold mt-0.5">
                    Total
                  </p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2">
                {QA_DONUT.map((d) => (
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
                        {((d.value / QA_TOTAL) * 100).toFixed(1)}%
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
                {DISCREPANCY.map((d) => (
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
                        style={{ width: `${d.pct}%`, background: d.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ── ROW 3: Abstractor Productivity + Plan-Level Performance ── */}
        <div className="grid grid-cols-2 gap-5">
          {/* Abstractor Productivity */}
          <SectionCard
            title="Abstractor Productivity"
            subtitle="Charts completed per coder · MY 2025 YTD"
            actions={
              <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />1 at-risk coder
              </span>
            }
          >
            {/* Bar chart */}
            <div style={{ height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ABSTRACTORS}
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
                    {ABSTRACTORS.map((a, i) => (
                      <Cell
                        key={i}
                        fill={a.qaFailPct > 6 ? C.orange : C.primary}
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
                  {ABSTRACTORS.map((a) => {
                    const atRisk = a.qaFailPct > 6;
                    return (
                      <tr
                        key={a.name}
                        className={`hover:bg-muted/20 transition-colors ${atRisk ? "bg-red-50/40" : ""}`}
                      >
                        <td className="py-2 pr-4">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold ${atRisk ? "bg-red-100 text-red-700" : "bg-primary/10 text-primary"}`}
                            >
                              {a.name.split(",")[0].charAt(0)}
                              {a.name.split(" ").pop()?.charAt(0)}
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
                            ({Math.round((a.completed / a.assigned) * 100)}%)
                          </span>
                        </td>
                        <td className="py-2 pr-4 text-[12px] text-foreground">
                          {a.avgMin} min
                        </td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${atRisk ? "bg-red-50 text-red-700 border-red-200" : a.qaFailPct > 4.5 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}
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
          </SectionCard>

          {/* Plan-Level Performance */}
          <SectionCard
            title="Plan-Level Performance"
            subtitle="Chart status by line of business · MY 2025"
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
            <div style={{ height: 200 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={PLAN_PERF}
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
                  <Bar dataKey="gap" name="Open Gap" stackId="a" fill={C.red} />
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
              {PLAN_PERF.map((p) => {
                const total = p.completed + p.gap + p.pendingQA;
                const compPct = Math.round((p.completed / total) * 100);
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
                        <span className="text-muted-foreground">Completed</span>
                        <span className="font-bold text-foreground">
                          {p.completed}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Open Gap</span>
                        <span className="font-bold text-red-600">{p.gap}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Pending QA
                        </span>
                        <span className="font-bold text-amber-600">
                          {p.pendingQA}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* AI insight */}
            <div className="mt-3 border border-primary/20 rounded-lg p-3 bg-primary/5 flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-foreground">
                <span className="font-bold text-primary">AI Insight:</span>{" "}
                Medicaid gap rate is 31.4%, exceeding the 25% plan threshold.
                Recommend targeted outreach for Medicaid CBP and COL measures
                before submission deadline.
              </p>
            </div>
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
    </div>
  );
}
