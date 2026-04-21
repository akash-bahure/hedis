import { useState } from "react";
import {
  AreaChart,
  Area,
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
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ReferenceLine,
} from "recharts";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Users,
  Target,
  BarChart2,
  Cpu,
  RotateCcw,
  FolderKanban,
  Zap,
  Brain,
  ShieldCheck,
  RefreshCw,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ChevronRight,
  Eye,
  Hash,
  Timer,
  Layers,
  GitBranch,
  Gauge,
  Search,
  FileWarning,
  Edit,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

/* ════════════════════════════════════════════  PALETTE  */
const C = {
  blue: "#2563eb",
  sky: "#0ea5e9",
  cyan: "#0891b2",
  teal: "#0d9488",
  emerald: "#10b981",
  lime: "#84cc16",
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  purple: "#a855f7",
  slate: "#64748b",
  indigo: "#6366f1",
};

/* ════════════════════════════════════════════  DATA  */
const WEEKS = [
  "Dec 23",
  "Dec 30",
  "Jan 6",
  "Jan 13",
  "Jan 20",
  "Jan 27",
  "Feb 3",
  "Feb 10",
];

const HOURLY = [
  { hour: "08:00", received: 15, completed: 9, inProg: 6, queue: 62 },
  { hour: "09:00", received: 31, completed: 24, inProg: 13, queue: 69 },
  { hour: "10:00", received: 28, completed: 26, inProg: 15, queue: 71 },
  { hour: "11:00", received: 22, completed: 28, inProg: 9, queue: 65 },
  { hour: "12:00", received: 8, completed: 14, inProg: 3, queue: 59 },
  { hour: "13:00", received: 19, completed: 21, inProg: 1, queue: 57 },
  { hour: "14:00", received: 26, completed: 23, inProg: 4, queue: 60 },
  { hour: "15:00", received: 24, completed: 22, inProg: 6, queue: 62 },
  { hour: "16:00", received: 21, completed: 24, inProg: 3, queue: 59 },
  { hour: "17:00", received: 12, completed: 18, inProg: 0, queue: 53 },
  { hour: "18:00", received: 4, completed: 8, inProg: 0, queue: 49 },
];

const TAT_DIST = [
  { bin: "0–5m", charts: 12, pct: 4.2 },
  { bin: "5–10m", charts: 48, pct: 16.8 },
  { bin: "10–15m", charts: 87, pct: 30.5 },
  { bin: "15–20m", charts: 72, pct: 25.2 },
  { bin: "20–25m", charts: 42, pct: 14.7 },
  { bin: "25–30m", charts: 18, pct: 6.3 },
  { bin: "30m+", charts: 7, pct: 2.3 },
];

const SLA_TREND_60D = [
  { date: "Dec 22", rate: 88.4, target: 90 },
  { date: "Dec 29", rate: 86.2, target: 90 },
  { date: "Jan 5", rate: 88.8, target: 90 },
  { date: "Jan 12", rate: 91.2, target: 90 },
  { date: "Jan 19", rate: 89.6, target: 90 },
  { date: "Jan 26", rate: 90.3, target: 90 },
  { date: "Feb 2", rate: 92.1, target: 90 },
  { date: "Feb 9", rate: 91.3, target: 90 },
  { date: "Feb 16", rate: 93.2, target: 90 },
  { date: "Feb 20", rate: 91.3, target: 90 },
];

const WORKLOAD_CODERS = [
  "Ankit S.",
  "Sunita P.",
  "Priti G.",
  "M. Irfan",
  "Deepa N.",
  "Rahul V.",
  "Kavita R.",
];
const WORKLOAD_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const WORKLOAD_GRID: number[][] = [
  [22, 20, 21, 24, 18],
  [18, 18, 20, 22, 16],
  [17, 17, 19, 21, 14],
  [16, 15, 17, 19, 14],
  [16, 15, 17, 18, 13],
  [15, 14, 16, 18, 13],
  [14, 13, 15, 16, 12],
];

/* Coder productivity weekly trend */
const PROD_TREND = WEEKS.map((w, i) => ({
  week: w,
  Ankit: [17.1, 17.8, 18.0, 17.5, 18.2, 18.6, 18.1, 18.4][i],
  Sunita: [16.8, 17.1, 17.5, 17.8, 17.2, 17.6, 17.9, 17.8][i],
  Priti: [15.8, 16.2, 16.0, 16.5, 16.8, 16.9, 17.1, 16.9][i],
  "M.Irfan": [15.2, 15.5, 15.8, 16.0, 15.9, 16.1, 16.3, 16.1][i],
  Rahul: [13.9, 14.1, 14.8, 15.2, 14.9, 15.1, 15.3, 15.3][i],
}));

const ACC_TREND = WEEKS.map((w, i) => ({
  week: w,
  Ankit: [95.1, 95.4, 95.8, 96.0, 95.9, 96.1, 96.3, 96.2][i],
  Sunita: [94.8, 95.0, 95.2, 95.4, 95.3, 95.5, 95.7, 95.6][i],
  Priti: [93.8, 94.1, 94.4, 94.6, 94.5, 94.7, 94.9, 94.8][i],
  "M.Irfan": [92.9, 93.1, 93.3, 93.5, 93.4, 93.6, 93.2, 93.3][i],
  Rahul: [91.2, 91.4, 91.8, 92.0, 91.9, 92.1, 92.0, 92.1][i],
}));

const REJ_TREND = WEEKS.map((w, i) => ({
  week: w,
  Ankit: [2.4, 2.2, 2.1, 2.0, 2.1, 2.0, 1.9, 2.1][i],
  Sunita: [2.9, 2.8, 2.7, 2.6, 2.8, 2.7, 2.5, 2.9][i],
  Priti: [3.6, 3.4, 3.3, 3.2, 3.4, 3.3, 3.2, 3.4][i],
  "M.Irfan": [4.2, 4.0, 3.9, 3.8, 4.0, 3.9, 3.8, 4.1][i],
  Rahul: [5.9, 5.7, 5.5, 5.4, 5.6, 5.5, 5.7, 5.8][i],
}));

const AUDITORS = [
  {
    name: "Shruti Mehta",
    role: "L3 Expert",
    reviewed: 312,
    passRate: 94.2,
    avgTime: 8.4,
    findings: 1.8,
    score: 96,
  },
  {
    name: "Vinod Kumar",
    role: "L2 Senior",
    reviewed: 489,
    passRate: 91.8,
    avgTime: 11.2,
    findings: 2.4,
    score: 92,
  },
  {
    name: "Leena Prasad",
    role: "L2 Senior",
    reviewed: 467,
    passRate: 92.4,
    avgTime: 10.8,
    findings: 2.2,
    score: 93,
  },
  {
    name: "Arjun Mishra",
    role: "L1 Staff",
    reviewed: 621,
    passRate: 89.1,
    avgTime: 13.5,
    findings: 3.1,
    score: 88,
  },
  {
    name: "Pooja Rao",
    role: "L1 Staff",
    reviewed: 598,
    passRate: 88.4,
    avgTime: 14.1,
    findings: 3.4,
    score: 86,
  },
];

const AI_ACC_DAILY = [
  { date: "Feb 7", acc: 76.1, override: 15.8, conf: 87.2 },
  { date: "Feb 8", acc: 74.8, override: 16.3, conf: 86.8 },
  { date: "Feb 9", acc: 77.3, override: 15.1, conf: 88.1 },
  { date: "Feb 10", acc: 78.5, override: 14.4, conf: 87.9 },
  { date: "Feb 11", acc: 76.9, override: 14.9, conf: 87.4 },
  { date: "Feb 12", acc: 79.2, override: 13.8, conf: 88.5 },
  { date: "Feb 13", acc: 78.1, override: 14.1, conf: 88.0 },
  { date: "Feb 16", acc: 80.4, override: 13.2, conf: 89.2 },
  { date: "Feb 17", acc: 79.8, override: 13.5, conf: 89.0 },
  { date: "Feb 18", acc: 78.6, override: 13.7, conf: 88.6 },
  { date: "Feb 19", acc: 81.2, override: 12.9, conf: 89.4 },
  { date: "Feb 20", acc: 79.5, override: 13.4, conf: 88.8 },
];

const AI_LIFT = [
  { coder: "Ankit S.", withAI: 18.4, withoutAI: 13.2, lift: 5.2 },
  { coder: "Sunita P.", withAI: 17.8, withoutAI: 12.8, lift: 5.0 },
  { coder: "Priti G.", withAI: 16.9, withoutAI: 12.0, lift: 4.9 },
  { coder: "M.Irfan", withAI: 16.1, withoutAI: 11.4, lift: 4.7 },
  { coder: "Deepa N.", withAI: 15.8, withoutAI: 11.1, lift: 4.7 },
  { coder: "Rahul V.", withAI: 15.3, withoutAI: 10.7, lift: 4.6 },
  { coder: "Kavita R.", withAI: 14.2, withoutAI: 9.9, lift: 4.3 },
];

const AI_CONF_DIST = [
  { range: "< 50%", codes: 824, pct: 1.6 },
  { range: "50–60%", codes: 2141, pct: 4.1 },
  { range: "60–70%", codes: 4382, pct: 8.3 },
  { range: "70–80%", codes: 9821, pct: 18.6 },
  { range: "80–90%", codes: 18432, pct: 34.9 },
  { range: "90–95%", codes: 12241, pct: 23.2 },
  { range: "95–100%", codes: 4976, pct: 9.4 },
];

const ERROR_TREND = WEEKS.map((w, i) => ({
  week: w,
  modifier: [24, 22, 26, 21, 23, 20, 19, 18][i],
  docMismatch: [18, 20, 17, 19, 16, 18, 15, 14][i],
  undercoding: [12, 11, 13, 10, 11, 9, 8, 9][i],
  overcoding: [8, 9, 7, 8, 9, 7, 8, 6][i],
  sequencing: [6, 7, 5, 6, 7, 5, 6, 5][i],
}));

const ERROR_RADAR_DATA = [
  {
    subject: "Modifier",
    Ankit: 8,
    Priti: 14,
    Rahul: 22,
    Sunita: 10,
    Kavita: 28,
  },
  {
    subject: "Doc Mismatch",
    Ankit: 12,
    Priti: 16,
    Rahul: 21,
    Sunita: 11,
    Kavita: 24,
  },
  {
    subject: "Undercoding",
    Ankit: 6,
    Priti: 11,
    Rahul: 18,
    Sunita: 8,
    Kavita: 22,
  },
  {
    subject: "Overcoding",
    Ankit: 4,
    Priti: 9,
    Rahul: 14,
    Sunita: 6,
    Kavita: 18,
  },
  {
    subject: "Sequencing",
    Ankit: 5,
    Priti: 10,
    Rahul: 17,
    Sunita: 7,
    Kavita: 20,
  },
];

const TOP_ERRORS = [
  {
    code: "M47.816",
    desc: "Spondylosis without myelopathy, lumbar",
    type: "Modifier Error",
    count: 42,
    trend: "down",
    pct: 8.4,
  },
  {
    code: "I25.10",
    desc: "Athscl heart disease unsp type vessel",
    type: "Undercoding",
    count: 38,
    trend: "down",
    pct: 7.6,
  },
  {
    code: "J18.9",
    desc: "Unspecified pneumonia",
    type: "Doc Mismatch",
    count: 34,
    trend: "stable",
    pct: 6.8,
  },
  {
    code: "E11.9",
    desc: "Type 2 diabetes without complications",
    type: "Overcoding",
    count: 31,
    trend: "down",
    pct: 6.2,
  },
  {
    code: "K92.1",
    desc: "Melena",
    type: "Sequencing Error",
    count: 28,
    trend: "up",
    pct: 5.6,
  },
  {
    code: "N18.6",
    desc: "End stage renal disease",
    type: "Modifier Error",
    count: 24,
    trend: "stable",
    pct: 4.8,
  },
  {
    code: "Z87.891",
    desc: "Personal history of nicotine dependence",
    type: "Doc Mismatch",
    count: 21,
    trend: "down",
    pct: 4.2,
  },
  {
    code: "G89.29",
    desc: "Other chronic pain",
    type: "Undercoding",
    count: 19,
    trend: "up",
    pct: 3.8,
  },
];

const SLA_RISK_PROJECTS = [
  {
    name: "Apollo Inpatient FY26",
    short: "Apollo",
    risk: 34,
    chartsAtRisk: 23,
    avgTat: 13.8,
    pending: 153,
    trend: "stable",
    factors: ["Coder Absence (low)", "Doc Delays (med)"],
  },
  {
    name: "Max Healthcare Q1",
    short: "Max HC",
    risk: 48,
    chartsAtRisk: 31,
    avgTat: 15.2,
    pending: 69,
    trend: "rising",
    factors: ["Rework Volume (med)", "AI Failures (low)"],
  },
  {
    name: "Fortis Cardiology FY26",
    short: "Fortis",
    risk: 28,
    chartsAtRisk: 14,
    avgTat: 12.9,
    pending: 42,
    trend: "falling",
    factors: ["Complex DRGs (low)"],
  },
  {
    name: "AIIMS Oncology FY26",
    short: "AIIMS",
    risk: 72,
    chartsAtRisk: 41,
    avgTat: 17.1,
    pending: 59,
    trend: "rising",
    factors: [
      "Missing Path Reports (high)",
      "Rework (high)",
      "AI Confidence Low (med)",
    ],
  },
  {
    name: "Manipal General FY26",
    short: "Manipal",
    risk: 55,
    chartsAtRisk: 28,
    avgTat: 16.0,
    pending: 48,
    trend: "stable",
    factors: ["Coder Absence (med)", "Doc Delays (med)"],
  },
];

const PROJECT_RADAR = [
  {
    metric: "Throughput",
    Apollo: 88,
    Max: 82,
    Fortis: 91,
    AIIMS: 76,
    Manipal: 81,
  },
  { metric: "SLA %", Apollo: 94, Max: 92, Fortis: 93, AIIMS: 88, Manipal: 90 },
  {
    metric: "Accuracy",
    Apollo: 95,
    Max: 93,
    Fortis: 95,
    AIIMS: 93,
    Manipal: 94,
  },
  {
    metric: "AI Acc %",
    Apollo: 79,
    Max: 78,
    Fortis: 81,
    AIIMS: 74,
    Manipal: 77,
  },
  {
    metric: "Completion",
    Apollo: 88,
    Max: 92,
    Fortis: 92,
    AIIMS: 86,
    Manipal: 88,
  },
];

/* ════════════════════════════════════════════  SHARED COMPONENTS  */
function CustomTip({ active, payload, label, suffix = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl px-3 py-2.5 min-w-[130px]">
      <p className="text-[10px] font-bold text-muted-foreground mb-1.5">
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 text-[11px] leading-relaxed"
        >
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: p.color || p.fill }}
            />
            {p.name}
          </span>
          <span className="font-bold text-foreground">
            {typeof p.value === "number"
              ? p.value % 1 === 0
                ? p.value
                : p.value.toFixed(1)
              : p.value}
            {suffix}
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionHdr({
  icon: Icon,
  title,
  sub,
  color = "text-primary",
  children,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
  color?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-xs font-black text-foreground">{title}</h3>
        {sub && (
          <p className="text-[10px] text-muted-foreground leading-tight">
            {sub}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function KpiCard({
  label,
  value,
  unit = "",
  sub,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
  highlight = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  trend?: { dir: "up" | "down" | "flat"; val: string; good?: boolean };
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  highlight?: boolean;
}) {
  const TrendIcon =
    trend?.dir === "up"
      ? TrendingUp
      : trend?.dir === "down"
        ? TrendingDown
        : Minus;
  const trendGood = trend?.good ?? trend?.dir === "up";
  return (
    <div
      className={`rounded-2xl p-4 border shadow-sm transition-shadow hover:shadow-md ${highlight ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div
          className={`w-8 h-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${trendGood ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
          >
            <TrendIcon className="w-2.5 h-2.5" />
            {trend.val}
          </div>
        )}
      </div>
      <div className="text-2xl font-black text-foreground leading-none">
        {typeof value === "number" ? value.toLocaleString() : value}
        <span className="text-base font-semibold text-muted-foreground ml-0.5">
          {unit}
        </span>
      </div>
      <div className="text-[11px] font-semibold text-foreground mt-0.5">
        {label}
      </div>
      {sub && (
        <div className="text-[9px] text-muted-foreground mt-0.5">{sub}</div>
      )}
    </div>
  );
}

function InsightBox({
  type = "info",
  title,
  body,
}: {
  type?: "info" | "warn" | "success" | "alert";
  title: string;
  body: string;
}) {
  const cfg = {
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-700",
      icon: Info,
    },
    warn: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
      icon: AlertTriangle,
    },
    success: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
      icon: CheckCircle2,
    },
    alert: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-700",
      icon: AlertCircle,
    },
  }[type];
  const Icon = cfg.icon;
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${cfg.text}`} />
      <div>
        <p className={`text-[11px] font-bold ${cfg.text}`}>{title}</p>
        <p
          className={`text-[10px] ${cfg.text} opacity-80 leading-relaxed mt-0.5`}
        >
          {body}
        </p>
      </div>
    </div>
  );
}

/* Heatmap cell */
function HCell({ v, maxV = 25 }: { v: number; maxV?: number }) {
  const pct = Math.min(v / maxV, 1);
  const stops = [
    { t: 0, bg: "bg-slate-100", text: "text-slate-400" },
    { t: 0.35, bg: "bg-sky-100", text: "text-sky-700" },
    { t: 0.55, bg: "bg-blue-200", text: "text-blue-800" },
    { t: 0.75, bg: "bg-blue-400", text: "text-white" },
    { t: 1, bg: "bg-blue-600", text: "text-white" },
  ];
  const s = stops.findLast((s) => pct >= s.t) ?? stops[0];
  return (
    <div
      className={`flex items-center justify-center rounded-lg text-[10px] font-black h-8 ${s.bg} ${s.text} transition-all cursor-default`}
      title={`${v} charts`}
    >
      {v}
    </div>
  );
}

/* SLA Risk Gauge */
function RiskGauge({ score }: { score: number }) {
  const color = score >= 70 ? C.red : score >= 45 ? C.amber : C.emerald;
  const label = score >= 70 ? "HIGH" : score >= 45 ? "MEDIUM" : "LOW";
  const labelCls =
    score >= 70
      ? "text-red-600"
      : score >= 45
        ? "text-amber-600"
        : "text-emerald-600";
  const gaugeData = [
    { value: score, fill: color },
    { value: 100 - score, fill: "#f1f5f9" },
  ];
  return (
    <div className="flex flex-col items-center relative">
      <div className="relative">
        <ResponsiveContainer width={120} height={68}>
          <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={42}
              outerRadius={58}
              dataKey="value"
              strokeWidth={0}
            >
              {gaugeData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center">
          <span className={`text-xl font-black leading-none ${labelCls}`}>
            {score}
          </span>
          <span className={`text-[9px] font-black ${labelCls}`}>{label}</span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: OPERATIONAL  */
function OperationalTab() {
  const throughputNow = HOURLY[HOURLY.length - 1];
  return (
    <div className="space-y-5">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Throughput / Hour"
          value={throughputNow.completed}
          unit=" charts"
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ dir: "up", val: "+12%" }}
          sub="current hour output"
        />
        <KpiCard
          label="Live Queue Depth"
          value={throughputNow.queue}
          icon={Layers}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ dir: "down", val: "−8", good: true }}
          sub="charts awaiting coding"
        />
        <KpiCard
          label="Avg TAT (Today)"
          value="14.2"
          unit=" min"
          icon={Timer}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          trend={{ dir: "down", val: "−0.8m", good: true }}
          sub="end-to-end per chart"
        />
        <KpiCard
          label="SLA Rate Now"
          value="91.3"
          unit="%"
          icon={ShieldCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ dir: "up", val: "+1.2%" }}
          sub="rolling 7-day"
          highlight
        />
      </div>

      {/* Hourly Throughput Chart */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={Activity}
          title="Operational Throughput — Today (Hourly)"
          sub="Charts received, completed and in-progress by hour"
        />
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart
            data={HOURLY}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              <linearGradient id="rcvGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.sky} stopOpacity={0.2} />
                <stop offset="100%" stopColor={C.sky} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="cmpGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.emerald} stopOpacity={0.3} />
                <stop offset="100%" stopColor={C.emerald} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="hour"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
            />
            <Area
              type="monotone"
              dataKey="received"
              name="Received"
              stroke={C.sky}
              fill="url(#rcvGrad)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke={C.emerald}
              fill="url(#cmpGrad)"
              strokeWidth={2}
              dot={false}
            />
            <Bar
              dataKey="inProg"
              name="In Progress"
              fill={C.violet}
              fillOpacity={0.6}
              radius={[3, 3, 0, 0]}
              maxBarSize={14}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* TAT Distribution + SLA Trend */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* TAT Distribution */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Timer}
            title="TAT Distribution"
            sub="Coding time distribution (all coders, today)"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={TAT_DIST}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              barSize={28}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.6}
                vertical={false}
              />
              <XAxis
                dataKey="bin"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTip />} />
              <Bar dataKey="charts" name="Charts" radius={[4, 4, 0, 0]}>
                {TAT_DIST.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 2
                        ? C.blue
                        : i < 2
                          ? C.teal
                          : i < 5
                            ? C.indigo
                            : C.violet
                    }
                  />
                ))}
              </Bar>
              <ReferenceLine
                y={87}
                stroke={C.amber}
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: "Peak (87)",
                  position: "right",
                  fontSize: 9,
                  fill: C.amber,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
          <InsightBox
            type="info"
            title="Peak TAT bucket: 10–15 min (30.5%)"
            body="Median coding time of 14.2 min is within acceptable range. 97.7% of charts complete within 30 min."
          />
        </div>

        {/* SLA Compliance 60-day trend */}
        <div className="xl:col-span-3 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={TrendingUp}
            title="SLA Compliance — 60-Day Trend"
            sub="Weekly compliance rate vs 90% target threshold"
            color="text-emerald-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart
              data={SLA_TREND_60D}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            >
              <defs>
                <linearGradient id="slaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.teal} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={C.teal} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.6}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                domain={[82, 96]}
                unit="%"
              />
              <Tooltip content={<CustomTip suffix="%" />} />
              <Area
                type="monotone"
                dataKey="rate"
                name="SLA Rate %"
                stroke={C.teal}
                fill="url(#slaGrad)"
                strokeWidth={2.5}
                dot={{ fill: C.teal, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="target"
                name="Target (90%)"
                stroke={C.amber}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="6 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
          <InsightBox
            type="success"
            title="SLA trending above target for 4 consecutive weeks"
            body="Feb 9–20 average: 92.1% — 2.1 percentage points above the 90% threshold. Improvement driven by reduced rework and AI automation gains."
          />
        </div>
      </div>

      {/* Workload Heatmap */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={Layers}
          title="Workload Distribution Heatmap"
          sub="Charts completed per coder per weekday (current week avg)"
          color="text-indigo-600"
        >
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="w-4 h-3 rounded bg-slate-200 inline-block" />
              Low
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-3 rounded bg-blue-300 inline-block" />
              Mid
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-3 rounded bg-blue-600 inline-block" />
              High
            </span>
          </div>
        </SectionHdr>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left pb-2 pr-4 w-28">
                  Coder
                </th>
                {WORKLOAD_DAYS.map((d) => (
                  <th
                    key={d}
                    className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center pb-2 px-1.5 w-1/5"
                  >
                    {d}
                  </th>
                ))}
                <th className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-center pb-2 px-1.5">
                  Avg
                </th>
              </tr>
            </thead>
            <tbody>
              {WORKLOAD_CODERS.map((coder, ci) => {
                const row = WORKLOAD_GRID[ci];
                const avg = Math.round(
                  row.reduce((s, v) => s + v, 0) / row.length,
                );
                return (
                  <tr key={coder}>
                    <td className="py-1 pr-4">
                      <span className="text-[11px] font-semibold text-foreground whitespace-nowrap">
                        {coder}
                      </span>
                    </td>
                    {row.map((v, di) => (
                      <td key={di} className="py-1 px-1.5">
                        <HCell v={v} maxV={25} />
                      </td>
                    ))}
                    <td className="py-1 px-1.5">
                      <div className="flex items-center justify-center rounded-lg h-8 bg-primary/10 text-primary text-[10px] font-black">
                        {avg}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground pt-2 border-t border-border">
          <span>
            ↑ <strong className="text-foreground">Thursday</strong> is
            consistently the highest-throughput day across all coders (+14% vs
            Mon avg)
          </span>
          <span className="ml-auto">·</span>
          <span>
            <strong className="text-amber-600">Kavita R.</strong> showing lowest
            workload — flagged for capacity review
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: PERFORMANCE  */
function PerformanceTab() {
  const [perfView, setPerfView] = useState<
    "productivity" | "accuracy" | "rejection"
  >("productivity");
  const trendData =
    perfView === "accuracy"
      ? ACC_TREND
      : perfView === "rejection"
        ? REJ_TREND
        : PROD_TREND;
  const colors = [C.blue, C.teal, C.violet, C.amber, C.orange];
  const coderKeys = ["Ankit", "Sunita", "Priti", "M.Irfan", "Rahul"];
  const suffix = perfView === "productivity" ? "" : "%";
  const domain: [number | "auto", number | "auto"] =
    perfView === "accuracy"
      ? [89, 97]
      : perfView === "rejection"
        ? [0, 8]
        : [12, 21];

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Team Avg Charts/Day"
          value="16.4"
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ dir: "up", val: "+0.6" }}
          sub="all active coders"
        />
        <KpiCard
          label="Team Accuracy"
          value="94.1"
          unit="%"
          icon={Target}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ dir: "up", val: "+0.8%" }}
          sub="audit-validated"
        />
        <KpiCard
          label="Avg Rejection Rate"
          value="4.2"
          unit="%"
          icon={RotateCcw}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          trend={{ dir: "down", val: "−0.6%", good: true }}
          sub="rework returned"
        />
        <KpiCard
          label="Active Coders"
          value={7}
          icon={Users}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          sub="5 projects · 3 levels"
        />
      </div>

      {/* Multi-line trend + toggle */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={TrendingUp}
          title="Coder Performance Trend — 8 Weeks"
          sub="Compare individual coder trajectories across key metrics"
        >
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {(["productivity", "accuracy", "rejection"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setPerfView(v)}
                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-colors capitalize ${perfView === v ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v === "productivity"
                  ? "Charts/Day"
                  : v === "rejection"
                    ? "Rejection %"
                    : "Accuracy %"}
              </button>
            ))}
          </div>
        </SectionHdr>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart
            data={trendData}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              domain={domain}
              unit={suffix}
            />
            <Tooltip content={<CustomTip suffix={suffix} />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
            />
            {coderKeys.map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={colors[i]}
                strokeWidth={2}
                dot={{ fill: colors[i], r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
            {perfView === "accuracy" && (
              <ReferenceLine
                y={90}
                stroke={C.amber}
                strokeDasharray="5 3"
                strokeWidth={1}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Per-coder performance cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {[
          {
            coder: "Ankit Sharma",
            charts: 18.4,
            acc: 96.2,
            rej: 2.1,
            trend: "up",
            score: 97,
            color: "emerald",
          },
          {
            coder: "Sunita Patel",
            charts: 17.8,
            acc: 95.6,
            rej: 2.9,
            trend: "up",
            score: 95,
            color: "blue",
          },
          {
            coder: "Priti Gupta",
            charts: 16.9,
            acc: 94.8,
            rej: 3.4,
            trend: "up",
            score: 93,
            color: "violet",
          },
          {
            coder: "Mohammed Irfan",
            charts: 16.1,
            acc: 93.3,
            rej: 4.1,
            trend: "flat",
            score: 90,
            color: "teal",
          },
          {
            coder: "Deepa Nair",
            charts: 15.8,
            acc: 94.0,
            rej: 3.7,
            trend: "flat",
            score: 91,
            color: "cyan",
          },
          {
            coder: "Rahul Verma",
            charts: 15.3,
            acc: 92.1,
            rej: 5.8,
            trend: "up",
            score: 87,
            color: "indigo",
          },
          {
            coder: "Kavita Rao",
            charts: 14.2,
            acc: 91.4,
            rej: 6.2,
            trend: "flat",
            score: 84,
            color: "slate",
          },
        ].map((c, i) => {
          const clr: Record<string, string> = {
            emerald: "bg-emerald-50 text-emerald-600",
            blue: "bg-blue-50 text-blue-600",
            violet: "bg-violet-50 text-violet-600",
            teal: "bg-teal-50 text-teal-600",
            cyan: "bg-cyan-50 text-cyan-600",
            indigo: "bg-indigo-50 text-indigo-600",
            slate: "bg-slate-100 text-slate-600",
          };
          const ic = clr[c.color];
          const TIcon =
            c.trend === "up"
              ? ArrowUpRight
              : c.trend === "down"
                ? ArrowDownRight
                : ChevronRight;
          return (
            <div
              key={c.coder}
              className="bg-card border border-border rounded-xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-xl ${ic.split(" ")[0]} flex items-center justify-center text-[10px] font-black ${ic.split(" ")[1]} flex-shrink-0`}
                >
                  {c.coder
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-foreground truncate">
                    {c.coder}
                  </p>
                  <div
                    className={`flex items-center gap-1 text-[9px] font-black ${c.score >= 95 ? "text-emerald-600" : c.score >= 90 ? "text-blue-600" : c.score >= 85 ? "text-amber-600" : "text-red-600"}`}
                  >
                    <TIcon className="w-3 h-3" />
                    Score {c.score}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1 text-center">
                {[
                  ["Charts", "" + c.charts + "/d", "text-foreground"],
                  [
                    "Accuracy",
                    c.acc + "%",
                    c.acc >= 95
                      ? "text-emerald-600"
                      : c.acc >= 92
                        ? "text-blue-600"
                        : "text-amber-600",
                  ],
                  [
                    "Reject",
                    c.rej + "%",
                    c.rej < 3
                      ? "text-emerald-600"
                      : c.rej < 5
                        ? "text-amber-600"
                        : "text-red-600",
                  ],
                ].map(([l, v, tc]) => (
                  <div key={l} className="bg-muted/20 rounded-lg py-1.5">
                    <div className={`text-[11px] font-black ${tc}`}>{v}</div>
                    <div className="text-[9px] text-muted-foreground">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2.5 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${ic.split(" ")[0].replace("50", "500")}`}
                  style={{ width: `${c.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Auditor Performance */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={Eye}
          title="Auditor Performance Analytics"
          sub="Review volume, pass rate, avg audit time and findings per chart"
          color="text-teal-600"
        />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {[
                  "Auditor",
                  "Role",
                  "Charts Reviewed",
                  "Pass Rate",
                  "Avg Audit Time",
                  "Findings/Chart",
                  "Score",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {AUDITORS.map((a, i) => (
                <tr
                  key={a.name}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-[9px] font-black">
                        {a.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")}
                      </div>
                      <span className="text-[11px] font-semibold text-foreground">
                        {a.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.role.includes("L3") ? "bg-violet-50 text-violet-700" : a.role.includes("L2") ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-semibold text-foreground">
                    {a.reviewed.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${a.passRate >= 93 ? "bg-emerald-500" : a.passRate >= 90 ? "bg-blue-500" : "bg-amber-500"}`}
                          style={{ width: `${a.passRate}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-foreground">
                        {a.passRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-foreground">
                    {a.avgTime} min
                  </td>
                  <td className="px-4 py-3 text-[11px] text-foreground">
                    {a.findings}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-14 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full"
                          style={{ width: `${a.score}%` }}
                        />
                      </div>
                      <span
                        className={`text-[11px] font-black ${a.score >= 95 ? "text-emerald-600" : a.score >= 90 ? "text-blue-600" : "text-amber-600"}`}
                      >
                        {a.score}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: AI ANALYTICS  */
function AIAnalyticsTab() {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Avg Acceptance Rate"
          value="78.6"
          unit="%"
          icon={Sparkles}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          trend={{ dir: "up", val: "+2.4%" }}
          sub="last 12 days"
          highlight
        />
        <KpiCard
          label="Override Rate"
          value="13.7"
          unit="%"
          icon={GitBranch}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          trend={{ dir: "down", val: "−1.3%", good: true }}
          sub="coder-overridden"
        />
        <KpiCard
          label="AI Productivity Lift"
          value="+4.8"
          unit="/day"
          icon={Zap}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ dir: "up", val: "+0.3" }}
          sub="extra charts vs no-AI"
        />
        <KpiCard
          label="Avg AI Confidence"
          value="88.3"
          unit="%"
          icon={Brain}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ dir: "up", val: "+0.9%" }}
          sub="per suggestion"
        />
      </div>

      {/* Acceptance + Override trend */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={TrendingUp}
            title="AI Acceptance Rate — 12-Day Trend"
            sub="Daily acceptance %, override % and model confidence"
            color="text-violet-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart
              data={AI_ACC_DAILY}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            >
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.violet} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={C.violet} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                domain={[70, 95]}
                unit="%"
              />
              <Tooltip content={<CustomTip suffix="%" />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
              />
              <Area
                type="monotone"
                dataKey="acc"
                name="Acceptance %"
                stroke={C.violet}
                fill="url(#accGrad)"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="override"
                name="Override %"
                stroke={C.orange}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="4 2"
              />
              <Line
                type="monotone"
                dataKey="conf"
                name="Confidence %"
                stroke={C.blue}
                strokeWidth={1.5}
                dot={false}
                strokeDasharray="6 3"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* AI Confidence Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Gauge}
            title="AI Confidence Score Distribution"
            sub="Breakdown of all code suggestions by confidence band"
            color="text-blue-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={AI_CONF_DIST}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              barSize={30}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="range"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTip />} />
              <Bar
                dataKey="codes"
                name="Code Suggestions"
                radius={[4, 4, 0, 0]}
              >
                {AI_CONF_DIST.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      i < 2
                        ? C.red
                        : i < 3
                          ? C.amber
                          : i < 4
                            ? C.sky
                            : i < 6
                              ? C.blue
                              : C.emerald
                    }
                  />
                ))}
              </Bar>
              <ReferenceLine
                x="80–90%"
                stroke={C.emerald}
                strokeDasharray="5 3"
              />
            </BarChart>
          </ResponsiveContainer>
          <InsightBox
            type="success"
            title="67.5% of suggestions scored 80%+ confidence"
            body="High-confidence zone (80–100%) contains 35,649 codes — these are auto-accepted at 94.2% rate, requiring minimal auditor review."
          />
        </div>
      </div>

      {/* AI Productivity Lift */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={Zap}
          title="AI-Assisted Productivity Lift — Per Coder"
          sub="Charts coded per day: with AI assistance vs estimated baseline without AI"
          color="text-amber-600"
        />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={AI_LIFT}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            barSize={22}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="coder"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
              domain={[0, 22]}
            />
            <Tooltip content={<CustomTip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
            />
            <Bar
              dataKey="withoutAI"
              name="Without AI (est.)"
              fill={C.slate}
              fillOpacity={0.5}
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="withAI"
              name="With AI (actual)"
              fill={C.violet}
              fillOpacity={0.85}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-3 flex items-center gap-6 flex-wrap">
          {AI_LIFT.map((d) => (
            <div
              key={d.coder}
              className="flex items-center gap-1.5 text-[10px]"
            >
              <span className="text-muted-foreground">{d.coder}</span>
              <span className="font-black text-violet-600">
                +{d.lift.toFixed(1)}/d
              </span>
              <span className="text-muted-foreground">
                ({Math.round((d.lift / d.withoutAI) * 100)}% lift)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <InsightBox
          type="success"
          title="Model performance improving"
          body="7-day avg acceptance rate (79.8%) is 3.2pp above the 30-day average (76.6%), indicating positive model drift in the right direction."
        />
        <InsightBox
          type="warn"
          title="Override rate above threshold"
          body="AIIMS Oncology project has 22.4% override rate — significantly above the 15% target. Oncology-specific NLP model tuning recommended."
        />
        <InsightBox
          type="info"
          title="AI saves ~33 min/coder/day"
          body="Average AI acceptance of 78.6% means each coder benefits from ~4.8 pre-coded charts per day, reducing manual coding burden by ~33 minutes."
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: ERROR PATTERNS  */
function ErrorTab() {
  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Total Errors (Period)"
          value={498}
          icon={FileWarning}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          trend={{ dir: "down", val: "−42", good: true }}
          sub="vs prior period"
        />
        <KpiCard
          label="Modifier Errors"
          value={18}
          icon={Edit}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          trend={{ dir: "down", val: "−6", good: true }}
          sub="current week"
        />
        <KpiCard
          label="Doc Mismatch"
          value={14}
          icon={FileWarning}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ dir: "down", val: "−4", good: true }}
          sub="current week"
        />
        <KpiCard
          label="Under/Overcoding"
          value={15}
          icon={Layers}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          trend={{ dir: "down", val: "−5", good: true }}
          sub="combined this week"
        />
      </div>

      {/* Stacked area error trend */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={TrendingDown}
          title="Error Pattern Trends — 8 Weeks"
          sub="Weekly count of each error category (all coders combined)"
          color="text-red-500"
        />
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart
            data={ERROR_TREND}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              {[C.orange, C.amber, C.violet, C.blue, C.teal].map((c, i) => (
                <linearGradient
                  key={i}
                  id={`eGrad${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.05} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#e5e7eb"
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "#94a3b8" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTip />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
            />
            <Area
              type="monotone"
              dataKey="modifier"
              name="Modifier Errors"
              stroke={C.orange}
              fill={`url(#eGrad0)`}
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="docMismatch"
              name="Doc Mismatch"
              stroke={C.amber}
              fill={`url(#eGrad1)`}
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="undercoding"
              name="Undercoding"
              stroke={C.violet}
              fill={`url(#eGrad2)`}
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="overcoding"
              name="Overcoding"
              stroke={C.blue}
              fill={`url(#eGrad3)`}
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="sequencing"
              name="Sequencing"
              stroke={C.teal}
              fill={`url(#eGrad4)`}
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Radar + Top Errors */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Error Radar by Coder */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Layers}
            title="Error Profile by Coder"
            sub="Error frequency radar — larger area = more errors"
            color="text-orange-600"
          />
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart
              data={ERROR_RADAR_DATA}
              margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            >
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fontSize: 9, fill: "#64748b" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 30]}
                tick={{ fontSize: 8 }}
                tickCount={4}
              />
              <Radar
                name="Ankit"
                dataKey="Ankit"
                stroke={C.blue}
                fill={C.blue}
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Radar
                name="Priti"
                dataKey="Priti"
                stroke={C.violet}
                fill={C.violet}
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Radar
                name="Kavita"
                dataKey="Kavita"
                stroke={C.red}
                fill={C.red}
                fillOpacity={0.15}
                strokeWidth={1.5}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px" }}
              />
              <Tooltip content={<CustomTip />} />
            </RadarChart>
          </ResponsiveContainer>
          <InsightBox
            type="alert"
            title="Kavita R. shows 3× error rate vs top coder"
            body="Particularly modifier and doc mismatch errors. Recommend targeted coaching session and 30-day watch period."
          />
        </div>

        {/* Top Error Codes Table */}
        <div className="xl:col-span-3 bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/10">
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-bold text-foreground">
              Top Error Codes by Frequency
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              Period: Feb 2026
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/5">
                  {[
                    "ICD Code",
                    "Description",
                    "Error Type",
                    "Count",
                    "Trend",
                    "% of Total",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {TOP_ERRORS.map((e) => {
                  const TIcon =
                    e.trend === "up"
                      ? TrendingUp
                      : e.trend === "down"
                        ? TrendingDown
                        : Minus;
                  const tCls =
                    e.trend === "up"
                      ? "text-red-600"
                      : e.trend === "down"
                        ? "text-emerald-600"
                        : "text-muted-foreground";
                  const typeCls: Record<string, string> = {
                    "Modifier Error":
                      "bg-orange-50 text-orange-700 border-orange-200",
                    Undercoding:
                      "bg-violet-50 text-violet-700 border-violet-200",
                    "Doc Mismatch":
                      "bg-amber-50 text-amber-700 border-amber-200",
                    Overcoding: "bg-blue-50 text-blue-700 border-blue-200",
                    "Sequencing Error": "bg-red-50 text-red-700 border-red-200",
                  };
                  return (
                    <tr
                      key={e.code}
                      className="hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-3 py-2.5">
                        <span className="font-mono text-[10px] font-black text-primary">
                          {e.code}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <p
                          className="text-[10px] text-foreground max-w-[160px] truncate"
                          title={e.desc}
                        >
                          {e.desc}
                        </p>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${typeCls[e.type] ?? "bg-muted text-muted-foreground border-border"}`}
                        >
                          {e.type}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-[11px] font-bold text-foreground">
                        {e.count}
                      </td>
                      <td className="px-3 py-2.5">
                        <TIcon className={`w-3.5 h-3.5 ${tCls}`} />
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-400 rounded-full"
                              style={{ width: `${e.pct * 8}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-foreground">
                            {e.pct}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <InsightBox
          type="success"
          title="Modifier errors down 25% over 8 weeks"
          body="Consistent reduction from 24 → 18/week since targeted modifier coding workshop held Dec 30. Training appears effective."
        />
        <InsightBox
          type="warn"
          title="K92.1 (Melena) sequencing errors trending up"
          body="3rd consecutive week of increase. Likely linked to new GI documentation template deployed Jan 27. Facility outreach recommended."
        />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: PREDICTIVE  */
function PredictiveTab() {
  return (
    <div className="space-y-5">
      {/* SLA Risk Gauge Cards */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={Brain}
          title="SLA Risk Prediction — All Active Projects"
          sub="ML-scored risk index (0=no risk, 100=certain breach) based on TAT, queue depth, rework rate, coder availability and AI failure patterns"
          color="text-violet-600"
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5 gap-4">
          {SLA_RISK_PROJECTS.map((p) => {
            const riskCls =
              p.risk >= 70
                ? "border-red-200 bg-red-50"
                : p.risk >= 45
                  ? "border-amber-200 bg-amber-50"
                  : "border-emerald-200 bg-emerald-50";
            const labelCls =
              p.risk >= 70
                ? "text-red-600"
                : p.risk >= 45
                  ? "text-amber-600"
                  : "text-emerald-600";
            const TIcon =
              p.trend === "rising"
                ? TrendingUp
                : p.trend === "falling"
                  ? TrendingDown
                  : Minus;
            return (
              <div
                key={p.name}
                className={`flex flex-col items-center rounded-2xl border px-4 pt-4 pb-3 ${riskCls}`}
              >
                <p className="text-[11px] font-bold text-foreground text-center mb-1">
                  {p.short}
                </p>
                <RiskGauge score={p.risk} />
                <div className="mt-2 space-y-1 w-full text-center">
                  <div
                    className={`flex items-center justify-center gap-1 text-[10px] font-bold ${labelCls}`}
                  >
                    <TIcon className="w-3 h-3" />
                    {p.trend === "rising"
                      ? "Risk Rising"
                      : p.trend === "falling"
                        ? "Risk Falling"
                        : "Stable"}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {p.chartsAtRisk} charts at risk
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {p.pending} pending · {p.avgTat}m avg TAT
                  </div>
                </div>
                <div className="mt-2 w-full space-y-0.5">
                  {p.factors.map((f) => (
                    <div
                      key={f}
                      className={`text-[9px] px-2 py-0.5 rounded-md text-center font-semibold ${
                        f.includes("high")
                          ? "bg-red-100 text-red-700"
                          : f.includes("med")
                            ? "bg-amber-100 text-amber-700"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <InsightBox
          type="alert"
          title="AIIMS Oncology FY26 — CRITICAL RISK (72)"
          body="Risk score has risen 18 points in 2 weeks. Primary drivers: missing pathology reports (blocking 23 charts), high rework rate (8.4%), and AI confidence below 60% on 31% of oncology codes. Immediate manager intervention required."
        />
      </div>

      {/* Project Comparison Radar + Risk Breakdown */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Project Radar */}
        <div className="xl:col-span-3 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Layers}
            title="Project Performance Radar"
            sub="5-dimension comparison: Throughput, SLA %, Accuracy, AI Acceptance, Completion %"
            color="text-teal-600"
          />
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart
              data={PROJECT_RADAR}
              margin={{ top: 10, right: 30, bottom: 10, left: 30 }}
            >
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 9, fill: "#64748b" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[65, 100]}
                tick={{ fontSize: 8 }}
                tickCount={4}
              />
              {(["Apollo", "Max", "Fortis", "AIIMS", "Manipal"] as const).map(
                (k, i) => {
                  const colors2 = [C.blue, C.teal, C.emerald, C.red, C.violet];
                  return (
                    <Radar
                      key={k}
                      name={k}
                      dataKey={k}
                      stroke={colors2[i]}
                      fill={colors2[i]}
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  );
                },
              )}
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }}
              />
              <Tooltip content={<CustomTip suffix="%" />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Factor Breakdown */}
        <div className="xl:col-span-2 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={AlertTriangle}
            title="Risk Factor Weights"
            sub="Contribution of each factor to predicted SLA risk"
            color="text-amber-600"
          />
          <div className="space-y-3 mt-2">
            {[
              { factor: "Rework Volume", weight: 28, color: "bg-red-500" },
              {
                factor: "Missing Documentation",
                weight: 22,
                color: "bg-orange-500",
              },
              {
                factor: "Coder Unavailability",
                weight: 18,
                color: "bg-amber-500",
              },
              {
                factor: "AI Processing Failures",
                weight: 14,
                color: "bg-violet-500",
              },
              {
                factor: "Chart Complexity (DRG)",
                weight: 10,
                color: "bg-blue-500",
              },
              {
                factor: "Facility Upload Delay",
                weight: 8,
                color: "bg-teal-500",
              },
            ].map((r) => (
              <div key={r.factor} className="space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-foreground font-semibold">
                    {r.factor}
                  </span>
                  <span className="font-black text-foreground">
                    {r.weight}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${r.color} rounded-full transition-all`}
                    style={{ width: `${r.weight * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t border-border">
            <p className="text-[9px] text-muted-foreground">
              Model: Gradient Boosted Risk Classifier · Last trained: Feb 14,
              2026 · F1-score: 0.87
            </p>
          </div>
        </div>
      </div>

      {/* High-risk chart table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-muted/10">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-xs font-bold text-foreground">
            High-Risk Charts — Predicted Breach within 24h
          </span>
          <span className="ml-auto px-2 py-0.5 text-[10px] font-black bg-red-50 text-red-700 border border-red-200 rounded-full">
            12 flagged
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/5">
                {[
                  "Chart ID",
                  "Patient",
                  "Project",
                  "Risk Score",
                  "SLA Left",
                  "Primary Risk Factor",
                  "Coder",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-3 py-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wide text-left whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[
                {
                  chart: "CHT-78421",
                  patient: "Verma, Rakesh K.",
                  project: "Apollo Inpatient",
                  risk: 94,
                  sla: "−8.5h",
                  factor: "SLA Already Breached",
                  coder: "Ankit S.",
                  action: "urgent",
                },
                {
                  chart: "CHT-78517",
                  patient: "Menon, Geetha V.",
                  project: "Manipal General",
                  risk: 89,
                  sla: "−3.1h",
                  factor: "SLA Already Breached",
                  coder: "Kavita R.",
                  action: "urgent",
                },
                {
                  chart: "CHT-78104",
                  patient: "Singh, Manpreet K.",
                  project: "Apollo Inpatient",
                  risk: 88,
                  sla: "−14.2h",
                  factor: "Coder Absent / Unassigned",
                  coder: "M.Irfan",
                  action: "urgent",
                },
                {
                  chart: "CHT-78503",
                  patient: "Kapoor, Meera S.",
                  project: "Max HC Q1",
                  risk: 76,
                  sla: "2.2h",
                  factor: "Physician Query Pending",
                  coder: "Priti G.",
                  action: "high",
                },
                {
                  chart: "CHT-78411",
                  patient: "Pillai, Sreedevi N.",
                  project: "Fortis Cardio",
                  risk: 71,
                  sla: "3.8h",
                  factor: "AI OCR Incomplete",
                  coder: "Rahul V.",
                  action: "high",
                },
                {
                  chart: "CHT-78099",
                  patient: "Iyer, Krishnan T.",
                  project: "Apollo Inpatient",
                  risk: 68,
                  sla: "5.7h",
                  factor: "Chart Parked — Doc Missing",
                  coder: "Ankit S.",
                  action: "high",
                },
              ].map((r) => (
                <tr
                  key={r.chart}
                  className="hover:bg-muted/10 transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[10px] font-black text-primary">
                      {r.chart}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-foreground">
                    {r.patient}
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-muted-foreground">
                    {r.project}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${r.risk >= 85 ? "bg-red-500" : r.risk >= 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${r.risk}%` }}
                        />
                      </div>
                      <span
                        className={`text-[10px] font-black ${r.risk >= 85 ? "text-red-600" : r.risk >= 70 ? "text-amber-600" : "text-emerald-600"}`}
                      >
                        {r.risk}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[10px] font-black ${r.sla.startsWith("−") ? "text-red-600" : "text-amber-600"}`}
                    >
                      {r.sla}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-foreground">
                    {r.factor}
                  </td>
                  <td className="px-3 py-2.5 text-[10px] text-foreground">
                    {r.coder}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${r.action === "urgent" ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                    >
                      {r.action === "urgent" ? "⚡ Urgent" : "↑ High Pri"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  MAIN EXPORT  */
type ATab = "operational" | "performance" | "ai" | "errors" | "predictive";

export function AnalyticsDashboard() {
  const [tab, setTab] = useState<ATab>("operational");

  const TABS: {
    id: ATab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    { id: "operational", label: "Operational", icon: Activity },
    { id: "performance", label: "Performance", icon: Users },
    { id: "ai", label: "AI Analytics", icon: Sparkles, badge: "Live" },
    { id: "errors", label: "Error Patterns", icon: FileWarning },
    { id: "predictive", label: "Predictive", icon: Brain, badge: "ML" },
  ];

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* HEADER */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Advanced Analytics
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Operational intelligence · Performance analytics · AI effectiveness
            · Error patterns · Predictive SLA risk
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Live ·{" "}
            <strong className="text-foreground">20 Feb 2026, 10:45 IST</strong>
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors whitespace-nowrap">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
          {(
            [
              ["7D", "7 Days"],
              ["30D", "30 Days"],
              ["90D", "90 Days"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors ${id === "30D" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB BAR */}
      <div className="flex items-center gap-0.5 bg-card border border-border rounded-2xl p-1.5 shadow-sm overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                active
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.badge && (
                <span
                  className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}
                >
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-3 pr-2 text-[10px] text-muted-foreground flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            Feb 2026
          </span>
          <span className="flex items-center gap-1.5">
            <FolderKanban className="w-3 h-3" />5 projects
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3 h-3" />7 coders · 5 auditors
          </span>
        </div>
      </div>

      {/* CONTENT */}
      {tab === "operational" && <OperationalTab />}
      {tab === "performance" && <PerformanceTab />}
      {tab === "ai" && <AIAnalyticsTab />}
      {tab === "errors" && <ErrorTab />}
      {tab === "predictive" && <PredictiveTab />}
    </div>
  );
}
