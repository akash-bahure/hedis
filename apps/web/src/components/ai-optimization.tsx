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
  ComposedChart,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import {
  Sparkles,
  Cpu,
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  BarChart2,
  GitBranch,
  Upload,
  Download,
  Play,
  Settings,
  FileText,
  Layers,
  Hash,
  Target,
  ChevronRight,
  Package,
  GitCommit,
  RotateCcw,
  Info,
  Scan,
  UserCheck,
  Code2,
  FlaskConical,
  Wand2,
  CircuitBoard,
  Workflow,
  Database,
  ArrowRight,
  Clock,
  Star,
  Check,
  ShieldCheck,
  Eye,
  Microscope,
  Gauge,
  Network,
  ChevronDown,
  TriangleAlert,
} from "lucide-react";

/* ════════════════════════════════════════════  PALETTE  */
const C = {
  violet: "#8b5cf6",
  purple: "#a855f7",
  blue: "#2563eb",
  sky: "#0ea5e9",
  teal: "#0d9488",
  cyan: "#0891b2",
  emerald: "#10b981",
  lime: "#84cc16",
  amber: "#f59e0b",
  orange: "#f97316",
  red: "#ef4444",
  rose: "#f43f5e",
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

const OCR_TREND = WEEKS.map((w, i) => ({
  week: w,
  total: [2847, 2693, 2891, 3014, 2978, 3121, 3241, 3062][i],
  success: [94.2, 94.5, 94.6, 94.8, 94.8, 95.1, 95.3, 95.4][i],
  failed: [2.3, 2.2, 2.1, 2.0, 2.0, 1.9, 1.8, 1.8][i],
  lowConf: [3.5, 3.3, 3.3, 3.2, 3.2, 3.0, 2.9, 2.8][i],
}));

const OCR_FAIL_REASONS = [
  { name: "Poor scan quality", value: 38, color: C.red },
  { name: "Low resolution", value: 24, color: C.orange },
  { name: "Missing pages", value: 18, color: C.amber },
  { name: "Handwritten text", value: 12, color: C.violet },
  { name: "Corrupted file", value: 8, color: C.slate },
];

const DOC_TYPES = [
  { type: "Discharge Summary", count: 18241, success: 96.8 },
  { type: "Op Notes", count: 11492, success: 95.1 },
  { type: "Lab Reports", count: 9847, success: 97.2 },
  { type: "Radiology", count: 7214, success: 93.4 },
  { type: "Pathology", count: 4182, success: 91.2 },
  { type: "ED Notes", count: 1871, success: 89.8 },
];

const MEMBER_TREND = WEEKS.map((w, i) => ({
  week: w,
  accuracy: [89.1, 89.4, 89.8, 90.2, 90.5, 91.0, 91.2, 91.4][i],
  duplicates: [28, 31, 24, 29, 22, 18, 21, 19][i],
  autoVerified: [84.2, 84.7, 85.1, 85.6, 86.0, 86.4, 86.8, 87.1][i],
}));

const MATCH_SCORE_DIST = [
  { range: "< 70%", count: 89, label: "Manual review" },
  { range: "70–80%", count: 234, label: "Likely match" },
  { range: "80–90%", count: 1841, label: "Good match" },
  { range: "90–95%", count: 4892, label: "Strong match" },
  { range: "> 95%", count: 41235, label: "Auto-verified" },
];

const ACC_TREND = [
  { date: "Feb 7", acc: 76.1, override: 15.8, autoAcc: 72.4 },
  { date: "Feb 8", acc: 74.8, override: 16.3, autoAcc: 71.1 },
  { date: "Feb 9", acc: 77.3, override: 15.1, autoAcc: 73.8 },
  { date: "Feb 10", acc: 78.5, override: 14.4, autoAcc: 74.9 },
  { date: "Feb 11", acc: 76.9, override: 14.9, autoAcc: 73.2 },
  { date: "Feb 12", acc: 79.2, override: 13.8, autoAcc: 75.6 },
  { date: "Feb 13", acc: 78.1, override: 14.1, autoAcc: 74.4 },
  { date: "Feb 16", acc: 80.4, override: 13.2, autoAcc: 76.8 },
  { date: "Feb 17", acc: 79.8, override: 13.5, autoAcc: 76.1 },
  { date: "Feb 18", acc: 78.6, override: 13.7, autoAcc: 74.9 },
  { date: "Feb 19", acc: 81.2, override: 12.9, autoAcc: 77.5 },
  { date: "Feb 20", acc: 79.5, override: 13.4, autoAcc: 75.8 },
];

const AI_CONF_DIST = [
  { range: "< 50%", codes: 824, pct: 1.6, fill: C.red },
  { range: "50–60%", codes: 2141, pct: 4.1, fill: C.orange },
  { range: "60–70%", codes: 4382, pct: 8.3, fill: C.amber },
  { range: "70–80%", codes: 9821, pct: 18.6, fill: C.sky },
  { range: "80–90%", codes: 18432, pct: 34.9, fill: C.blue },
  { range: "90–95%", codes: 12241, pct: 23.2, fill: C.violet },
  { range: "95–100%", codes: 4976, pct: 9.4, fill: C.emerald },
];

const SPECIALTY_ACC = [
  { spec: "Orthopedics", icd: 91.4, cpt: 93.2 },
  { spec: "Cardiology", icd: 89.2, cpt: 90.8 },
  { spec: "General Med", icd: 87.3, cpt: 88.6 },
  { spec: "Gastroenterology", icd: 85.1, cpt: 86.4 },
  { spec: "Neurology", icd: 78.4, cpt: 80.1 },
  { spec: "Oncology", icd: 74.1, cpt: 76.3 },
];

const FEEDBACK_TREND = WEEKS.map((w, i) => ({
  week: w,
  rejected: [312, 298, 324, 281, 267, 248, 231, 219][i],
  modified: [812, 788, 841, 809, 776, 751, 724, 698][i],
  partial: [201, 188, 214, 196, 181, 172, 164, 158][i],
}));

const OVERRIDE_REASONS = [
  { reason: "Modifier Error", count: 2311, pct: 32.0, color: C.orange },
  { reason: "Undercoding", count: 1731, pct: 24.0, color: C.violet },
  { reason: "Overcoding", count: 1298, pct: 18.0, color: C.blue },
  { reason: "Wrong Specificity", count: 1082, pct: 15.0, color: C.amber },
  { reason: "Missing Secondary Dx", count: 796, pct: 11.0, color: C.teal },
];

const MODEL_VERSIONS = [
  {
    ver: "v2.4.1",
    date: "Feb 1, 2026",
    acc: 94.2,
    precision: 91.4,
    recall: 88.7,
    f1: 90.0,
    auc: 0.948,
    status: "current",
    training: "14,821 signals",
    changes: [
      "+2.4% ICD-10 accuracy",
      "Oncology NLP tuning",
      "Confidence calibration fix",
      "Drift reset after retraining",
    ],
  },
  {
    ver: "v2.3.8",
    date: "Jan 5, 2026",
    acc: 92.8,
    precision: 90.1,
    recall: 87.2,
    f1: 88.6,
    auc: 0.934,
    status: "previous",
    training: "11,204 signals",
    changes: [
      "Specialty-aware code ranking",
      "Reduced modifier errors -18%",
      "Improved duplicate detection",
    ],
  },
  {
    ver: "v2.3.5",
    date: "Dec 10, 2025",
    acc: 91.4,
    precision: 89.2,
    recall: 86.1,
    f1: 87.6,
    auc: 0.921,
    status: "previous",
    training: "9,847 signals",
    changes: [
      "OCR preprocessing enhancement",
      "Member matching v2 integration",
    ],
  },
  {
    ver: "v2.2.12",
    date: "Nov 12, 2025",
    acc: 89.7,
    precision: 87.8,
    recall: 84.3,
    f1: 86.0,
    auc: 0.908,
    status: "retired",
    training: "8,291 signals",
    changes: ["F1 improvement +0.9", "Cardiology fine-tuning"],
  },
  {
    ver: "v2.2.9",
    date: "Oct 14, 2025",
    acc: 88.1,
    precision: 86.4,
    recall: 82.8,
    f1: 84.6,
    auc: 0.894,
    status: "retired",
    training: "7,012 signals",
    changes: ["Initial feedback loop integration"],
  },
  {
    ver: "v2.1.4",
    date: "Sep 8, 2025",
    acc: 85.3,
    precision: 83.1,
    recall: 80.2,
    f1: 81.6,
    auc: 0.871,
    status: "retired",
    training: "5,241 signals",
    changes: ["Baseline production model"],
  },
];

const PR_F1_TREND = WEEKS.map((w, i) => ({
  week: w,
  precision: [88.1, 88.8, 89.4, 90.1, 90.6, 91.0, 91.3, 91.4][i],
  recall: [85.4, 86.1, 86.8, 87.4, 87.9, 88.3, 88.6, 88.7][i],
  f1: [86.7, 87.4, 88.1, 88.7, 89.2, 89.6, 89.9, 90.0][i],
  auc: [87.1, 87.4, 91.2, 92.1, 93.2, 93.8, 94.4, 94.8][i],
}));

const DRIFT_TREND = WEEKS.map((w, i) => ({
  week: w,
  drift: [2.1, 2.4, 3.1, 2.8, 2.2, 1.9, 1.7, 1.8][i],
}));

const MODEL_ACC_VER = MODEL_VERSIONS.map((v) => ({
  ver: v.ver,
  acc: v.acc,
  f1: v.f1,
})).reverse();

/* ════════════════════════════════════════════  HELPERS  */
function CustomTip({ active, payload, label, unit = "" }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl shadow-xl px-3 py-2.5 min-w-[130px]">
      <p className="text-[10px] font-bold text-muted-foreground mb-1.5">
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 text-[11px]"
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
              ? p.value.toFixed(p.value > 10 ? 1 : 2)
              : p.value}
            {unit}
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
        {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

function MetricRing({
  pct,
  value,
  label,
  color,
  sub,
}: {
  pct: number;
  value: string;
  label: string;
  color: string;
  sub?: string;
}) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const dash = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[84px] h-[84px]">
        <svg viewBox="0 0 88 88" className="w-full h-full -rotate-90">
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
          />
          <circle
            cx="44"
            cy="44"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeDasharray={circ}
            strokeDashoffset={dash}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-base font-black text-foreground leading-none">
            {value}
          </span>
          {sub && (
            <span className="text-[8px] text-muted-foreground">{sub}</span>
          )}
        </div>
      </div>
      <p className="text-[9px] font-bold text-muted-foreground text-center leading-tight max-w-[84px]">
        {label}
      </p>
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
  accent = false,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  trend?: { dir: "up" | "down" | "flat"; val: string; good?: boolean };
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  accent?: boolean;
}) {
  const TIcon =
    trend?.dir === "up"
      ? TrendingUp
      : trend?.dir === "down"
        ? TrendingDown
        : Activity;
  const tGood = trend?.good ?? trend?.dir === "up";
  return (
    <div
      className={`rounded-2xl px-4 py-4 border shadow-sm hover:shadow-md transition-shadow ${accent ? "bg-primary/5 border-primary/20" : "bg-card border-border"}`}
    >
      <div className="flex items-start justify-between mb-2.5">
        <div
          className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full ${tGood ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
          >
            <TIcon className="w-2.5 h-2.5" />
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

function InsightPill({
  type = "info",
  text,
}: {
  type?: "info" | "warn" | "success" | "alert";
  text: string;
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
      icon: TriangleAlert,
    },
  }[type];
  const Icon = cfg.icon;
  return (
    <div
      className={`flex items-start gap-2 px-3 py-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}
    >
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${cfg.text}`} />
      <p className={`text-[10px] ${cfg.text} leading-relaxed`}>{text}</p>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: OVERVIEW  */
function OverviewTab() {
  const aiOutcomes = [
    { name: "Auto-Accepted", value: 38241, pct: 72.4, color: C.emerald },
    { name: "Auditor-Accepted", value: 4392, pct: 8.3, color: C.blue },
    { name: "Overridden", value: 7218, pct: 13.7, color: C.orange },
    { name: "Rejected", value: 2996, pct: 5.7, color: C.red },
  ];

  const systemHealth = [
    { label: "OCR Engine", score: 95.4, color: C.blue, status: "Operational" },
    {
      label: "Member Matching",
      score: 91.4,
      color: C.teal,
      status: "Operational",
    },
    {
      label: "ICD-10 Coder",
      score: 94.2,
      color: C.violet,
      status: "Operational",
    },
    { label: "CPT Coder", score: 93.8, color: C.purple, status: "Operational" },
    {
      label: "Feedback Pipeline",
      score: 87.3,
      color: C.amber,
      status: "Training",
    },
    {
      label: "Model Registry",
      score: 100,
      color: C.emerald,
      status: "v2.4.1 live",
    },
  ];

  return (
    <div className="space-y-5">
      {/* KPI Strip */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Total Docs Processed"
          value={52847}
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ dir: "up", val: "+8.3%" }}
          sub="OCR pipeline, Feb 2026"
        />
        <KpiCard
          label="AI Code Suggestions"
          value={52847}
          icon={Sparkles}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          trend={{ dir: "up", val: "+12.4%" }}
          sub="ICD + CPT combined"
          accent
        />
        <KpiCard
          label="Overall Acceptance"
          value="78.6"
          unit="%"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ dir: "up", val: "+2.4%" }}
          sub="auto + auditor-accepted"
        />
        <KpiCard
          label="Avg AI Confidence"
          value="87.3"
          unit="%"
          icon={Brain}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend={{ dir: "up", val: "+0.9%" }}
          sub="per suggestion"
        />
      </div>

      {/* Four system panels */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* OCR Summary */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Scan}
            title="OCR Processing Engine"
            sub="Character recognition across all document types"
            color="text-blue-600"
          />
          <div className="flex items-center gap-4">
            <MetricRing
              pct={95.4}
              value="95.4%"
              label="OCR Success Rate"
              color={C.blue}
            />
            <div className="flex-1 space-y-2.5">
              {[
                {
                  label: "Documents Processed",
                  val: "52,847",
                  bar: 100,
                  color: "bg-blue-500",
                },
                {
                  label: "Successfully Parsed",
                  val: "50,421",
                  bar: 95.4,
                  color: "bg-emerald-500",
                },
                {
                  label: "Parse Failures",
                  val: "1,204",
                  bar: 2.3,
                  color: "bg-red-400",
                },
                {
                  label: "Low Confidence",
                  val: "1,222",
                  bar: 2.3,
                  color: "bg-amber-400",
                },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-bold text-foreground">{r.val}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${r.color} rounded-full`}
                      style={{ width: `${r.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart
                data={OCR_TREND}
                margin={{ top: 2, right: 0, bottom: 0, left: -30 }}
              >
                <defs>
                  <linearGradient id="ocrG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.blue} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 8, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[93, 97]}
                  tick={{ fontSize: 8, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTip unit="%" />} />
                <Area
                  type="monotone"
                  dataKey="success"
                  name="Success Rate"
                  stroke={C.blue}
                  fill="url(#ocrG)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Member Verification */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={UserCheck}
            title="Member Verification Engine"
            sub="Patient identity matching and duplicate detection"
            color="text-teal-600"
          />
          <div className="flex items-center gap-4">
            <MetricRing
              pct={91.4}
              value="91.4%"
              label="Match Accuracy"
              color={C.teal}
            />
            <div className="flex-1 space-y-2.5">
              {[
                {
                  label: "Auto-Verified (>95%)",
                  val: "41,235",
                  bar: 87.1,
                  color: "bg-teal-500",
                },
                {
                  label: "Manual Review (<80%)",
                  val: "323",
                  bar: 0.7,
                  color: "bg-amber-400",
                },
                {
                  label: "Duplicates Detected",
                  val: "234",
                  bar: 0.5,
                  color: "bg-orange-400",
                },
                {
                  label: "False Positives",
                  val: "28",
                  bar: 0.1,
                  color: "bg-red-400",
                },
              ].map((r) => (
                <div key={r.label}>
                  <div className="flex justify-between text-[9px] mb-0.5">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="font-bold text-foreground">{r.val}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${r.color} rounded-full`}
                      style={{ width: `${r.bar}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={70}>
              <AreaChart
                data={MEMBER_TREND}
                margin={{ top: 2, right: 0, bottom: 0, left: -30 }}
              >
                <defs>
                  <linearGradient id="mvG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 8, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  domain={[88, 93]}
                  tick={{ fontSize: 8, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomTip unit="%" />} />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  name="Match Accuracy"
                  stroke={C.teal}
                  fill="url(#mvG)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Coding Summary */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Sparkles}
            title="AI Coding Engine"
            sub="ICD-10 + CPT suggestions, acceptance and override rates"
            color="text-violet-600"
          />
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <PieChart width={120} height={120}>
                <Pie
                  data={aiOutcomes}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={58}
                  paddingAngle={2}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {aiOutcomes.map((d, i) => (
                    <Cell key={i} fill={d.color} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </div>
            <div className="flex-1 space-y-1.5">
              {aiOutcomes.map((d) => (
                <div key={d.name} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: d.color }}
                  />
                  <span className="text-[10px] text-muted-foreground flex-1">
                    {d.name}
                  </span>
                  <span className="text-[10px] font-black text-foreground">
                    {d.pct}%
                  </span>
                  <span className="text-[9px] text-muted-foreground">
                    ({d.value.toLocaleString()})
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-border/50">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">
                    Total suggestions
                  </span>
                  <span className="font-black text-foreground">52,847</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">Net acceptance</span>
                  <span className="font-black text-emerald-600">80.7%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback + Health */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Brain}
            title="Feedback & Model Health"
            sub="Correction signals and active model performance"
            color="text-purple-600"
          />
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              {
                label: "Correction Signals",
                val: "10,214",
                sub: "this period",
                color: C.violet,
              },
              {
                label: "Training Batches",
                val: "3",
                sub: "completed",
                color: C.purple,
              },
              {
                label: "F1 Score",
                val: "90.0%",
                sub: "current model",
                color: C.emerald,
              },
              {
                label: "Drift Score",
                val: "1.8/10",
                sub: "healthy range",
                color: C.teal,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-muted/20 rounded-xl px-3 py-2.5 border border-border/50"
              >
                <div
                  className="text-sm font-black text-foreground"
                  style={{ color: s.color }}
                >
                  {s.val}
                </div>
                <div className="text-[10px] font-semibold text-foreground">
                  {s.label}
                </div>
                <div className="text-[9px] text-muted-foreground">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* System health row */}
          <div className="space-y-1.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              System Status
            </p>
            {systemHealth.map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: s.color }}
                />
                <span className="text-[10px] text-muted-foreground flex-1">
                  {s.label}
                </span>
                <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${s.score}%`, background: s.color }}
                  />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground w-20 text-right">
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: OCR  */
function OCRTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Docs Processed"
          value={52847}
          icon={FileText}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          trend={{ dir: "up", val: "+8.3%" }}
          sub="all document types"
        />
        <KpiCard
          label="OCR Success Rate"
          value="95.4"
          unit="%"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ dir: "up", val: "+0.3%" }}
          sub="+1.2pp since Jan"
        />
        <KpiCard
          label="Failure Rate"
          value="2.3"
          unit="%"
          icon={XCircle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          trend={{ dir: "down", val: "−0.5%", good: true }}
          sub="1,204 docs failed"
        />
        <KpiCard
          label="Low Confidence"
          value="2.3"
          unit="%"
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ dir: "down", val: "−1.2%", good: true }}
          sub="<70% confidence score"
        />
      </div>

      {/* OCR Trend */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={TrendingUp}
          title="OCR Performance Trend — 8 Weeks"
          sub="Success rate, failure rate and low-confidence rate (%)"
          color="text-blue-600"
        />
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart
            data={OCR_TREND}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              <linearGradient id="ocr2G" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.blue} stopOpacity={0.2} />
                <stop offset="100%" stopColor={C.blue} stopOpacity={0.02} />
              </linearGradient>
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
              domain={[0, 100]}
              unit="%"
            />
            <Tooltip content={<CustomTip unit="%" />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
            />
            <Area
              type="monotone"
              dataKey="success"
              name="Success Rate %"
              stroke={C.blue}
              fill="url(#ocr2G)"
              strokeWidth={2.5}
              dot={{ fill: C.blue, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="failed"
              name="Failure Rate %"
              stroke={C.red}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
            <Line
              type="monotone"
              dataKey="lowConf"
              name="Low Confidence %"
              stroke={C.amber}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="6 3"
            />
            <ReferenceLine
              y={90}
              stroke="#d1d5db"
              strokeDasharray="4 2"
              label={{ value: "90% target", fontSize: 8, fill: "#94a3b8" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Failure Reasons Pie */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={XCircle}
            title="OCR Failure Root Causes"
            sub="Distribution of 1,204 failed documents"
            color="text-red-500"
          />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie
                  data={OCR_FAIL_REASONS}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={72}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {OCR_FAIL_REASONS.map((d, i) => (
                    <Cell key={i} fill={d.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => [`${v}%`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {OCR_FAIL_REASONS.map((r) => (
                <div key={r.name} className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: r.color }}
                  />
                  <span className="text-[10px] text-muted-foreground flex-1">
                    {r.name}
                  </span>
                  <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${r.value}%`, background: r.color }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-foreground w-8 text-right">
                    {r.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          <InsightPill
            type="warn"
            text="Handwritten notes account for 12% of failures. Expanding the HTR (Handwritten Text Recognition) sub-model is queued for v2.5.0."
          />
        </div>

        {/* Document Type Breakdown */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={FileText}
            title="OCR Accuracy by Document Type"
            sub="Success rate and volume per document category"
            color="text-blue-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={DOC_TYPES}
              layout="vertical"
              margin={{ top: 0, right: 50, bottom: 0, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                domain={[85, 100]}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="type"
                tick={{ fontSize: 9, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
                width={110}
              />
              <Tooltip content={<CustomTip unit="%" />} />
              <Bar
                dataKey="success"
                name="Success Rate"
                radius={[0, 4, 4, 0]}
                maxBarSize={14}
              >
                {DOC_TYPES.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.success >= 95
                        ? C.emerald
                        : d.success >= 92
                          ? C.blue
                          : d.success >= 90
                            ? C.amber
                            : C.red
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <InsightPill
            type="alert"
            text="ED Notes (89.8%) and Pathology (91.2%) below 92% threshold. Targeted model fine-tuning scheduled for next sprint."
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: MEMBER VERIFICATION  */
function MemberTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Patient Match Accuracy"
          value="91.4"
          unit="%"
          icon={UserCheck}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          trend={{ dir: "up", val: "+0.4%" }}
          sub="vs prior period"
        />
        <KpiCard
          label="Auto-Verified"
          value={41235}
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ dir: "up", val: "+2.9%" }}
          sub="87.1% of total"
        />
        <KpiCard
          label="Duplicates Found"
          value={234}
          icon={Layers}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          trend={{ dir: "down", val: "−12.7%", good: true }}
          sub="consolidated"
        />
        <KpiCard
          label="Manual Review"
          value={323}
          icon={Eye}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ dir: "down", val: "−18.2%", good: true }}
          sub="pending verification"
        />
      </div>

      {/* Match accuracy trend */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={TrendingUp}
          title="Member Verification Accuracy — 8-Week Trend"
          sub="Match accuracy %, auto-verified rate, and duplicate detections"
          color="text-teal-600"
        />
        <ResponsiveContainer width="100%" height={200}>
          <ComposedChart
            data={MEMBER_TREND}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              <linearGradient id="mvG2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.teal} stopOpacity={0.2} />
                <stop offset="100%" stopColor={C.teal} stopOpacity={0.02} />
              </linearGradient>
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
              domain={[83, 94]}
              unit="%"
            />
            <Tooltip content={<CustomTip unit="%" />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
            />
            <Area
              type="monotone"
              dataKey="accuracy"
              name="Match Accuracy %"
              stroke={C.teal}
              fill="url(#mvG2)"
              strokeWidth={2.5}
              dot={{ fill: C.teal, r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="autoVerified"
              name="Auto-Verified Rate %"
              stroke={C.emerald}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 3"
            />
            <ReferenceLine
              y={90}
              stroke="#d1d5db"
              strokeDasharray="4 2"
              label={{ value: "Target 90%", fontSize: 8, fill: "#94a3b8" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Match Score Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={BarChart2}
            title="Match Confidence Score Distribution"
            sub="Volume of records at each confidence tier"
            color="text-teal-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={MATCH_SCORE_DIST}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              barSize={32}
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
              <Bar dataKey="count" name="Records" radius={[4, 4, 0, 0]}>
                {MATCH_SCORE_DIST.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 0
                        ? C.red
                        : i === 1
                          ? C.amber
                          : i === 2
                            ? C.sky
                            : i === 3
                              ? C.blue
                              : C.emerald
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-5 gap-1 mt-2 text-center">
            {MATCH_SCORE_DIST.map((d, i) => (
              <div key={d.range} className="text-[8px] text-muted-foreground">
                <div className="font-black text-foreground text-[9px]">
                  {d.count.toLocaleString()}
                </div>
                <div>{d.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Status */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={ShieldCheck}
            title="Verification Status Breakdown"
            sub="Current period: 48,291 records processed"
            color="text-emerald-600"
          />
          <div className="space-y-3 mt-2">
            {[
              {
                label: "Auto-Verified (>95% confidence)",
                count: 41235,
                pct: 87.1,
                color: "bg-emerald-500",
                light: "bg-emerald-50",
                text: "text-emerald-700",
              },
              {
                label: "Manual Verified (staff review)",
                count: 6408,
                pct: 13.6,
                color: "bg-blue-500",
                light: "bg-blue-50",
                text: "text-blue-700",
              },
              {
                label: "Pending Manual Review (<80%)",
                count: 323,
                pct: 0.7,
                color: "bg-amber-400",
                light: "bg-amber-50",
                text: "text-amber-700",
              },
              {
                label: "Unverified / Escalated",
                count: 91,
                pct: 0.2,
                color: "bg-red-500",
                light: "bg-red-50",
                text: "text-red-700",
              },
              {
                label: "Duplicate — Merged",
                count: 234,
                pct: 0.5,
                color: "bg-orange-400",
                light: "bg-orange-50",
                text: "text-orange-700",
              },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl border ${s.light} ${s.light.replace("50", "200")}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className={`text-[10px] font-bold ${s.text}`}>
                      {s.label}
                    </span>
                    <span className={`text-[10px] font-black ${s.text} ml-4`}>
                      {s.pct}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-white/60 rounded-full overflow-hidden w-full">
                    <div
                      className={`h-full ${s.color} rounded-full`}
                      style={{ width: `${s.pct}%` }}
                    />
                  </div>
                  <p className={`text-[9px] ${s.text} opacity-70 mt-0.5`}>
                    {s.count.toLocaleString()} records
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: CODING PERFORMANCE  */
function CodingTab() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Codes Suggested"
          value={52847}
          icon={Sparkles}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          trend={{ dir: "up", val: "+12.4%" }}
          sub="52,847 ICD+CPT"
          accent
        />
        <KpiCard
          label="AI Acceptance Rate"
          value="78.6"
          unit="%"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ dir: "up", val: "+2.4%" }}
          sub="incl. auditor-accepted"
        />
        <KpiCard
          label="Override Rate"
          value="13.7"
          unit="%"
          icon={RotateCcw}
          iconBg="bg-orange-50"
          iconColor="text-orange-600"
          trend={{ dir: "down", val: "−1.3%", good: true }}
          sub="coder-overridden"
        />
        <KpiCard
          label="Avg Confidence"
          value="87.3"
          unit="%"
          icon={Brain}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          trend={{ dir: "up", val: "+0.9%" }}
          sub="per code suggestion"
        />
      </div>

      {/* Acceptance trend */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={TrendingUp}
          title="Acceptance & Override Rate — Daily Trend"
          sub="AI acceptance rate, auto-accepted portion and override rate over last 12 working days"
          color="text-violet-600"
        />
        <ResponsiveContainer width="100%" height={210}>
          <ComposedChart
            data={ACC_TREND}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              <linearGradient id="accG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.violet} stopOpacity={0.2} />
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
              domain={[10, 90]}
              unit="%"
            />
            <Tooltip content={<CustomTip unit="%" />} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
            />
            <Area
              type="monotone"
              dataKey="acc"
              name="Total Acceptance %"
              stroke={C.violet}
              fill="url(#accG)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="autoAcc"
              name="Auto-Accepted %"
              stroke={C.emerald}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 3"
            />
            <Line
              type="monotone"
              dataKey="override"
              name="Override Rate %"
              stroke={C.orange}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Confidence Distribution */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Gauge}
            title="AI Confidence Score Distribution"
            sub="All 52,847 code suggestions by confidence band"
            color="text-violet-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={AI_CONF_DIST}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              barSize={28}
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
              <Bar dataKey="codes" name="Suggestions" radius={[4, 4, 0, 0]}>
                {AI_CONF_DIST.map((d, i) => (
                  <Cell key={i} fill={d.fill} />
                ))}
              </Bar>
              <ReferenceLine
                x="80–90%"
                stroke={C.emerald}
                strokeDasharray="5 3"
              />
            </BarChart>
          </ResponsiveContainer>
          <InsightPill
            type="success"
            text="67.5% of suggestions scored 80%+ confidence — these auto-accept at 94.2% rate, requiring minimal auditor intervention."
          />
        </div>

        {/* Specialty Acceptance */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Target}
            title="Acceptance Rate by Specialty"
            sub="ICD-10 vs CPT acceptance % per clinical specialty"
            color="text-blue-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart
              data={SPECIALTY_ACC}
              layout="vertical"
              margin={{ top: 0, right: 50, bottom: 0, left: 10 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e5e7eb"
                strokeOpacity={0.5}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                domain={[65, 100]}
                unit="%"
              />
              <YAxis
                type="category"
                dataKey="spec"
                tick={{ fontSize: 9, fill: "#475569" }}
                tickLine={false}
                axisLine={false}
                width={105}
              />
              <Tooltip content={<CustomTip unit="%" />} />
              <Bar
                dataKey="icd"
                name="ICD-10 %"
                fill={C.blue}
                fillOpacity={0.85}
                radius={[0, 3, 3, 0]}
                maxBarSize={8}
              />
              <Bar
                dataKey="cpt"
                name="CPT %"
                fill={C.violet}
                fillOpacity={0.85}
                radius={[0, 3, 3, 0]}
                maxBarSize={8}
              />
            </BarChart>
          </ResponsiveContainer>
          <InsightPill
            type="alert"
            text="Oncology ICD acceptance (74.1%) is 16pp below the team average. Oncology-specific NLP retraining scheduled for v2.5.0."
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  TAB: FEEDBACK & LEARNING  */
function FeedbackTab() {
  const PIPELINE_STEPS = [
    {
      label: "Override & Rejections",
      count: "10,214",
      icon: XCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200",
    },
    {
      label: "Signal Extraction",
      count: "8,841",
      icon: FlaskConical,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
    {
      label: "Feature Engineering",
      count: "7,203",
      icon: CircuitBoard,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Model Fine-Tuning",
      count: "3 batches",
      icon: Brain,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
    {
      label: "Validation & QA",
      count: "94.2% acc",
      icon: ShieldCheck,
      color: "text-teal-600",
      bg: "bg-teal-50",
      border: "border-teal-200",
    },
    {
      label: "Deployment (v2.4.1)",
      count: "Live",
      icon: Zap,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KpiCard
          label="Correction Signals"
          value={10214}
          icon={Workflow}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          trend={{ dir: "up", val: "+8.1%" }}
          sub="this period total"
        />
        <KpiCard
          label="Rejected Codes"
          value={2996}
          icon={XCircle}
          iconBg="bg-red-50"
          iconColor="text-red-600"
          trend={{ dir: "down", val: "−6.2%", good: true }}
          sub="sent as feedback"
        />
        <KpiCard
          label="Modified Codes"
          value={7218}
          icon={Edit2}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          trend={{ dir: "down", val: "−3.8%", good: true }}
          sub="override corrections"
        />
        <KpiCard
          label="Model Improvement"
          value="+1.4"
          unit="%"
          icon={TrendingUp}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          trend={{ dir: "up", val: "+0.4pp" }}
          sub="accuracy gain per cycle"
        />
      </div>

      {/* Correction signals trend */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={TrendingUp}
          title="Correction Signals Feeding Model Training — 8-Week Trend"
          sub="Rejected codes, modified codes and partial corrections by week"
          color="text-violet-600"
        />
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart
            data={FEEDBACK_TREND}
            margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
          >
            <defs>
              {[C.red, C.orange, C.violet].map((c, i) => (
                <linearGradient
                  key={i}
                  id={`fbG${i}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={c} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.03} />
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
              dataKey="modified"
              name="Modified Codes"
              stroke={C.orange}
              fill="url(#fbG1)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="rejected"
              name="Rejected Codes"
              stroke={C.red}
              fill="url(#fbG0)"
              strokeWidth={2}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="partial"
              name="Partial Corrections"
              stroke={C.violet}
              fill="url(#fbG2)"
              strokeWidth={2}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
        <InsightPill
          type="success"
          text="Correction signals are trending down 14% over 8 weeks — model quality is improving with each training cycle."
        />
      </div>

      {/* Training Pipeline Flow */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={Workflow}
          title="Active Training Pipeline"
          sub="Feedback → Signal Extraction → Fine-Tuning → Validation → Deployment"
          color="text-purple-600"
        />
        <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
          {PIPELINE_STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="flex items-center gap-2 flex-shrink-0"
              >
                <div
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl border ${step.bg} ${step.border} min-w-[120px]`}
                >
                  <div className="w-9 h-9 bg-white/70 rounded-xl flex items-center justify-center shadow-sm">
                    <Icon className={`w-4.5 h-4.5 ${step.color}`} />
                  </div>
                  <div className="text-center">
                    <div className={`text-xs font-black ${step.color}`}>
                      {step.count}
                    </div>
                    <div className="text-[9px] text-muted-foreground leading-tight">
                      {step.label}
                    </div>
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div
                      className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${step.bg} ${step.color} border ${step.border}`}
                    >
                      {i === 3 ? "🔄 In Progress" : "✓ Complete"}
                    </div>
                  )}
                  {i === PIPELINE_STEPS.length - 1 && (
                    <div className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      🟢 Live
                    </div>
                  )}
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Training job status */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-violet-700">
                Current Training Job — v2.5.0
              </span>
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-violet-600">
                <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                Running
              </span>
            </div>
            <div className="space-y-1">
              {[
                ["Training Data", "14,821 correction signals"],
                ["Current Epoch", "18 / 30"],
                ["Validation Loss", "0.0847 ↓"],
                ["ETA", "~4.2 hours"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-[10px]">
                  <span className="text-violet-600">{l}</span>
                  <span className="font-bold text-violet-800">{v}</span>
                </div>
              ))}
              <div className="mt-2 h-2 bg-violet-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-violet-500 rounded-full animate-pulse"
                  style={{ width: "60%" }}
                />
              </div>
              <p className="text-[8px] text-violet-500 text-right">
                60% complete · Est. complete: Feb 23, 2026
              </p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-emerald-700">
                Expected Improvements — v2.5.0
              </span>
              <Package className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="space-y-1">
              {[
                ["Overall Accuracy", "94.2% → ~95.6% (+1.4pp)"],
                ["Oncology ICD", "74.1% → ~79.8% (+5.7pp)"],
                ["Override Rate", "13.7% → ~11.2% (−2.5pp)"],
                ["HTR Coverage", "New: 65% handwritten text"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between text-[10px]">
                  <span className="text-emerald-700">{l}</span>
                  <span className="font-bold text-emerald-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Edit2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

/* ════════════════════════════════════════════  TAB: MODEL MANAGEMENT  */
function ModelTab() {
  const [selected, setSelected] = useState("v2.4.1");
  const sel = MODEL_VERSIONS.find((v) => v.ver === selected)!;

  const driftStatus = {
    score: 1.8,
    label: "Healthy",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    barColor: "bg-emerald-500",
    pct: 36,
  };

  return (
    <div className="space-y-5">
      {/* AI Health Gauges Row */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
        <SectionHdr
          icon={Microscope}
          title="AI Health Monitor — Current Model (v2.4.1)"
          sub="Key ML performance metrics for the active production model"
          color="text-violet-600"
        />
        <div className="flex items-center justify-around flex-wrap gap-4">
          {[
            { pct: 91.4, value: "91.4%", label: "Precision", color: C.blue },
            { pct: 88.7, value: "88.7%", label: "Recall", color: C.teal },
            { pct: 90.0, value: "90.0%", label: "F1 Score", color: C.violet },
            {
              pct: 94.8,
              value: "0.948",
              label: "AUC-ROC",
              color: C.emerald,
              sub: "(0–1)",
            },
            {
              pct: 93.2,
              value: "93.2%",
              label: "Specificity",
              color: C.indigo,
            },
            {
              pct: 82,
              value: "1.8/10",
              label: "Drift Score",
              color: C.amber,
              sub: "low=good",
            },
          ].map((m) => (
            <MetricRing
              key={m.label}
              pct={m.pct}
              value={m.value}
              label={m.label}
              color={m.color}
              sub={m.sub}
            />
          ))}
        </div>
      </div>

      {/* Model Version Selector + Details */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Version List */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-muted/5">
            <GitBranch className="w-4 h-4 text-violet-600" />
            <span className="text-xs font-black text-foreground">
              Model Registry
            </span>
            <span className="ml-auto text-[10px] text-muted-foreground">
              {MODEL_VERSIONS.length} versions
            </span>
          </div>
          <div className="divide-y divide-border">
            {MODEL_VERSIONS.map((v) => {
              const statusCfg = {
                current: {
                  bg: "bg-emerald-50",
                  border: "border-emerald-200",
                  text: "text-emerald-700",
                  dot: "bg-emerald-500",
                },
                previous: {
                  bg: "bg-blue-50",
                  border: "border-blue-200",
                  text: "text-blue-700",
                  dot: "bg-blue-400",
                },
                retired: {
                  bg: "bg-muted",
                  border: "border-border",
                  text: "text-slate-500",
                  dot: "bg-slate-300",
                },
              }[v.status];
              const active = selected === v.ver;
              return (
                <button
                  key={v.ver}
                  onClick={() => setSelected(v.ver)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors ${active ? "bg-primary/5 border-l-2 border-l-primary" : ""}`}
                >
                  <GitCommit
                    className={`w-4 h-4 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-black ${active ? "text-primary" : "text-foreground"}`}
                      >
                        {v.ver}
                      </span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.text} capitalize`}
                      >
                        {v.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-violet-500 rounded-full"
                          style={{ width: `${v.acc}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-foreground">
                        {v.acc}%
                      </span>
                    </div>
                    <p className="text-[8px] text-muted-foreground">{v.date}</p>
                  </div>
                  {active && (
                    <ChevronRight className="w-3.5 h-3.5 text-primary" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Version Details */}
        <div className="xl:col-span-2 space-y-4">
          {/* Version detail card */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-black text-foreground">
                    {sel.ver}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                      sel.status === "current"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : sel.status === "previous"
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "bg-muted border-border text-muted-foreground"
                    } capitalize`}
                  >
                    {sel.status}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Deployed: {sel.date} · Trained on: {sel.training}
                </p>
              </div>
              <div className="flex gap-2">
                {sel.status !== "current" && (
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold bg-primary text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap">
                    <Play className="w-3 h-3" />
                    Deploy
                  </button>
                )}
                {sel.status === "current" && (
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                    <RotateCcw className="w-3 h-3" />
                    Rollback
                  </button>
                )}
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold border border-border rounded-lg hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                {
                  label: "Accuracy",
                  val: `${sel.acc}%`,
                  color: "text-emerald-600",
                },
                {
                  label: "Precision",
                  val: `${sel.precision}%`,
                  color: "text-blue-600",
                },
                {
                  label: "Recall",
                  val: `${sel.recall}%`,
                  color: "text-teal-600",
                },
                {
                  label: "F1 Score",
                  val: `${sel.f1}%`,
                  color: "text-violet-600",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className="bg-muted/20 rounded-xl p-2.5 text-center border border-border/50"
                >
                  <div className={`text-base font-black ${m.color}`}>
                    {m.val}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Changes in This Version
              </p>
              <ul className="space-y-1">
                {sel.changes.map((c) => (
                  <li
                    key={c}
                    className="flex items-center gap-2 text-[10px] text-foreground"
                  >
                    <Check className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Model accuracy timeline */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
            <SectionHdr
              icon={TrendingUp}
              title="Accuracy Improvement by Model Version"
              sub="Accuracy % and F1 score progression across all releases"
              color="text-emerald-600"
            />
            <ResponsiveContainer width="100%" height={150}>
              <ComposedChart
                data={MODEL_ACC_VER}
                margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#e5e7eb"
                  strokeOpacity={0.5}
                />
                <XAxis
                  dataKey="ver"
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#94a3b8" }}
                  tickLine={false}
                  axisLine={false}
                  domain={[82, 97]}
                  unit="%"
                />
                <Tooltip content={<CustomTip unit="%" />} />
                <Bar
                  dataKey="acc"
                  name="Accuracy"
                  fill={C.violet}
                  fillOpacity={0.7}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Line
                  type="monotone"
                  dataKey="f1"
                  name="F1 Score"
                  stroke={C.emerald}
                  strokeWidth={2}
                  dot={{ fill: C.emerald, r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Precision/Recall/F1 trend + Drift Detection */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={Activity}
            title="Precision / Recall / F1 Trend — 8 Weeks"
            sub="Key ML performance metrics over the evaluation period"
            color="text-blue-600"
          />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={PR_F1_TREND}
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
                domain={[84, 93]}
                unit="%"
              />
              <Tooltip content={<CustomTip unit="%" />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: "10px", paddingTop: "6px" }}
              />
              <Line
                type="monotone"
                dataKey="precision"
                name="Precision"
                stroke={C.blue}
                strokeWidth={2}
                dot={{ fill: C.blue, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="recall"
                name="Recall"
                stroke={C.teal}
                strokeWidth={2}
                dot={{ fill: C.teal, r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="f1"
                name="F1 Score"
                stroke={C.violet}
                strokeWidth={2.5}
                dot={{ fill: C.violet, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-1 text-[10px] text-muted-foreground">
            <span>
              Current: <strong className="text-blue-600">P=91.4%</strong>
            </span>
            <span>
              <strong className="text-teal-600">R=88.7%</strong>
            </span>
            <span>
              <strong className="text-violet-600">F1=90.0%</strong>
            </span>
            <span className="ml-auto text-emerald-600 font-bold">
              All metrics improving ↑
            </span>
          </div>
        </div>

        {/* Drift Detection */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <SectionHdr
            icon={AlertCircle}
            title="Model Drift Detection"
            sub="Data drift score over time — higher = more drift from training distribution"
            color="text-amber-600"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Drift: HEALTHY (1.8/10)
            </div>
          </SectionHdr>
          <ResponsiveContainer width="100%" height={170}>
            <ComposedChart
              data={DRIFT_TREND}
              margin={{ top: 4, right: 8, bottom: 0, left: -10 }}
            >
              <ReferenceArea y1={0} y2={3.5} fill="#d1fae5" fillOpacity={0.3} />
              <ReferenceArea
                y1={3.5}
                y2={5.0}
                fill="#fef3c7"
                fillOpacity={0.4}
              />
              <ReferenceArea
                y1={5.0}
                y2={8.0}
                fill="#fee2e2"
                fillOpacity={0.4}
              />
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                strokeOpacity={0.4}
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
                domain={[0, 7]}
              />
              <Tooltip content={<CustomTip />} />
              <ReferenceLine
                y={3.5}
                stroke={C.amber}
                strokeDasharray="5 3"
                label={{
                  value: "Warning (3.5)",
                  fontSize: 8,
                  fill: C.amber,
                  position: "right",
                }}
              />
              <ReferenceLine
                y={5.0}
                stroke={C.red}
                strokeDasharray="5 3"
                label={{
                  value: "Critical (5.0)",
                  fontSize: 8,
                  fill: C.red,
                  position: "right",
                }}
              />
              <Line
                type="monotone"
                dataKey="drift"
                name="Drift Score"
                stroke={C.violet}
                strokeWidth={2.5}
                dot={{ fill: C.violet, r: 3.5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2">
            {[
              { label: "Safe Zone", color: "bg-emerald-200", range: "< 3.5" },
              {
                label: "Warning Zone",
                color: "bg-amber-200",
                range: "3.5–5.0",
              },
              { label: "Critical", color: "bg-red-200", range: "> 5.0" },
            ].map((z) => (
              <div
                key={z.label}
                className="flex items-center gap-1.5 text-[9px] text-muted-foreground"
              >
                <span className={`w-3 h-3 rounded-sm ${z.color}`} />
                {z.label} ({z.range})
              </div>
            ))}
          </div>
          <InsightPill
            type="success"
            text="Drift score dropped from 3.1 (Jan 6) to 1.8 (Feb 10) following v2.4.1 retraining on 14,821 fresh correction signals. No action required."
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════  MAIN EXPORT  */
type AITab = "overview" | "ocr" | "member" | "coding" | "feedback" | "models";

export function AIOptimization() {
  const [tab, setTab] = useState<AITab>("overview");

  const TABS: {
    id: AITab;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[] = [
    { id: "overview", label: "AI Overview", icon: Sparkles, badge: "Live" },
    { id: "ocr", label: "OCR Processing", icon: Scan },
    { id: "member", label: "Member Verification", icon: UserCheck },
    { id: "coding", label: "Coding Performance", icon: Code2 },
    {
      id: "feedback",
      label: "Feedback & Learning",
      icon: Brain,
      badge: "Training",
    },
    {
      id: "models",
      label: "Model Management",
      icon: GitBranch,
      badge: "v2.4.1",
    },
  ];

  return (
    <div className="flex flex-col gap-5 min-h-full">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-foreground tracking-tight">
              AI Optimization
            </h2>
            <span className="flex items-center gap-1.5 text-[10px] font-black px-2 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-700">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              Model v2.4.1 Active
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            OCR engine · member matching · AI coding performance · feedback
            learning · model health &amp; drift monitoring
          </p>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <strong className="text-foreground">All Systems Operational</strong>
          </span>
        </div>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold border border-border rounded-xl hover:bg-muted transition-colors text-muted-foreground whitespace-nowrap">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
        <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold bg-violet-600 text-white rounded-xl hover:opacity-90 transition-opacity whitespace-nowrap">
          <Zap className="w-3.5 h-3.5" />
          Trigger Retraining
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-0.5 bg-card border border-border rounded-2xl p-1.5 shadow-sm overflow-x-auto flex-shrink-0">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          const isTrain = t.badge === "Training";
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[11px] font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${active ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-muted-foreground hover:text-foreground hover:bg-muted/40"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
              {t.badge && (
                <span
                  className={`text-[8px] font-black px-1.5 py-0.5 rounded-full ${
                    isTrain
                      ? active
                        ? "bg-white/20 text-white"
                        : "bg-violet-50 text-violet-700 border border-violet-200"
                      : active
                        ? "bg-white/20 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isTrain && !active ? "🔄 " : ""}
                  {t.badge}
                </span>
              )}
            </button>
          );
        })}
        <div className="flex-1" />
        <div className="flex items-center gap-3 pr-2 text-[10px] text-muted-foreground flex-shrink-0">
          <span className="flex items-center gap-1.5">
            <Database className="w-3 h-3" />
            52,847 records
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Feb 2026
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="w-3 h-3 text-amber-500" />
            F1: 90.0%
          </span>
        </div>
      </div>

      {/* Content */}
      {tab === "overview" && <OverviewTab />}
      {tab === "ocr" && <OCRTab />}
      {tab === "member" && <MemberTab />}
      {tab === "coding" && <CodingTab />}
      {tab === "feedback" && <FeedbackTab />}
      {tab === "models" && <ModelTab />}
    </div>
  );
}
