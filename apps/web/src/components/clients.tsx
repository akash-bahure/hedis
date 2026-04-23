import { useState } from "react";
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  Filter,
  Download,
  ExternalLink,
  TrendingUp,
  FileText,
  Activity,
  Star,
  Shield,
  X,
  ChevronRight,
  BarChart2,
  UserCheck,
  ClipboardList,
  Layers,
  ArrowLeft,
  Target,
  AlertTriangle,
} from "lucide-react";

/* ─── Types ─────────────────────────────────────────────── */
type ClientStatus = "active" | "onboarding" | "at-risk" | "inactive";
type ContractType =
  | "HEDIS Hybrid"
  | "HEDIS Administrative"
  | "HEDIS Electronic"
  | "Multi-Measure";

interface Client {
  id: string;
  name: string;
  shortCode: string;
  contractType: ContractType;
  status: ClientStatus;
  region: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  measureYear: string;
  chartsTotal: number;
  chartsCompleted: number;
  chartsAbstracted: number;
  chartsPending: number;
  dueDate: string;
  startDate: string;
  complianceScore: number;
  abstractors: number;
  plan: string;
  lastActivity: string;
}

/* ─── Mock data ───��─────────────────────────────────────── */
const CLIENTS: Client[] = [
  {
    id: "CLT-001",
    name: "Midwest Health Alliance",
    shortCode: "MHA",
    contractType: "HEDIS Hybrid",
    status: "active",
    region: "Midwest",
    contactName: "Dr. Patricia Chen",
    contactEmail: "p.chen@midwesthealth.org",
    contactPhone: "(312) 555-0182",
    measureYear: "MY2026",
    chartsTotal: 1840,
    chartsCompleted: 1124,
    chartsAbstracted: 987,
    chartsPending: 716,
    dueDate: "2026-04-15",
    startDate: "2026-01-10",
    complianceScore: 94,
    abstractors: 8,
    plan: "Enterprise",
    lastActivity: "2 hours ago",
  },
  {
    id: "CLT-002",
    name: "Southeast Regional Medical",
    shortCode: "SRM",
    contractType: "HEDIS Administrative",
    status: "active",
    region: "Southeast",
    contactName: "James R. Whitfield",
    contactEmail: "j.whitfield@srmed.com",
    contactPhone: "(404) 555-0247",
    measureYear: "MY2026",
    chartsTotal: 3210,
    chartsCompleted: 2780,
    chartsAbstracted: 2601,
    chartsPending: 430,
    dueDate: "2026-03-30",
    startDate: "2025-12-01",
    complianceScore: 97,
    abstractors: 14,
    plan: "Enterprise",
    lastActivity: "15 min ago",
  },
  {
    id: "CLT-003",
    name: "Pacific Coast Health Plan",
    shortCode: "PCHP",
    contractType: "Multi-Measure",
    status: "onboarding",
    region: "West",
    contactName: "Maria Gonzalez, RN",
    contactEmail: "m.gonzalez@pchp.net",
    contactPhone: "(213) 555-0394",
    measureYear: "MY2026",
    chartsTotal: 950,
    chartsCompleted: 120,
    chartsAbstracted: 88,
    chartsPending: 830,
    dueDate: "2026-05-01",
    startDate: "2026-02-15",
    complianceScore: 82,
    abstractors: 4,
    plan: "Professional",
    lastActivity: "1 day ago",
  },
  {
    id: "CLT-004",
    name: "Northeast Physicians Group",
    shortCode: "NPG",
    contractType: "HEDIS Hybrid",
    status: "at-risk",
    region: "Northeast",
    contactName: "Dr. Alan Morse",
    contactEmail: "a.morse@npghealth.org",
    contactPhone: "(617) 555-0519",
    measureYear: "MY2026",
    chartsTotal: 2100,
    chartsCompleted: 740,
    chartsAbstracted: 688,
    chartsPending: 1360,
    dueDate: "2026-03-20",
    startDate: "2026-01-05",
    complianceScore: 71,
    abstractors: 6,
    plan: "Enterprise",
    lastActivity: "3 days ago",
  },
  {
    id: "CLT-005",
    name: "Mountain States Medical",
    shortCode: "MSM",
    contractType: "HEDIS Electronic",
    status: "active",
    region: "Mountain",
    contactName: "Sandra Kim",
    contactEmail: "s.kim@msmed.org",
    contactPhone: "(303) 555-0661",
    measureYear: "MY2026",
    chartsTotal: 780,
    chartsCompleted: 734,
    chartsAbstracted: 720,
    chartsPending: 46,
    dueDate: "2026-04-30",
    startDate: "2026-01-20",
    complianceScore: 99,
    abstractors: 3,
    plan: "Professional",
    lastActivity: "30 min ago",
  },
  {
    id: "CLT-006",
    name: "Gulf Coast Health Network",
    shortCode: "GCHN",
    contractType: "HEDIS Hybrid",
    status: "inactive",
    region: "South",
    contactName: "Robert Tatum",
    contactEmail: "r.tatum@gchn.org",
    contactPhone: "(504) 555-0733",
    measureYear: "MY2025",
    chartsTotal: 1400,
    chartsCompleted: 1400,
    chartsAbstracted: 1392,
    chartsPending: 0,
    dueDate: "2025-09-30",
    startDate: "2025-01-15",
    complianceScore: 96,
    abstractors: 0,
    plan: "Enterprise",
    lastActivity: "4 months ago",
  },
];

/* ─── Status config ──────────────────────────────────────── */
const STATUS_CONFIG: Record<
  ClientStatus,
  {
    label: string;
    icon: React.ElementType;
    badgeCls: string;
    dotCls: string;
  }
> = {
  active: {
    label: "Active",
    icon: CheckCircle2,
    badgeCls:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
    dotCls: "bg-emerald-500",
  },
  onboarding: {
    label: "Onboarding",
    icon: Clock,
    badgeCls:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700",
    dotCls: "bg-blue-500",
  },
  "at-risk": {
    label: "At Risk",
    icon: AlertCircle,
    badgeCls:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
    dotCls: "bg-amber-500",
  },
  inactive: {
    label: "Inactive",
    icon: Clock,
    badgeCls:
      "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    dotCls: "bg-gray-400",
  },
};

/* ─── Helpers ────────────────────────────────────────────── */
function pct(done: number, total: number) {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function ProgressBar({
  value,
  colorCls = "bg-primary",
}: {
  value: number;
  colorCls?: string;
}) {
  return (
    <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorCls}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: ClientStatus }) {
  const s = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${s.badgeCls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dotCls} flex-shrink-0`} />
      {s.label}
    </span>
  );
}

/* ─── Summary KPI strip ──────────────────────────────────── */
function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  colorCls,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  colorCls: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorCls}`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-xl font-bold text-foreground leading-tight mt-0.5">
          {value}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

/* ─── Full Profile Modal ─────────────────────────────────── */
type ProfileTab = "overview" | "charts" | "contract" | "contact";

const PROFILE_TABS: {
  id: ProfileTab;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "charts", label: "Charts", icon: ClipboardList },
  { id: "contract", label: "Contract", icon: FileText },
  { id: "contact", label: "Contact", icon: UserCheck },
];

const mockTimeline = [
  {
    date: "2026-03-20",
    event: "Batch 12 submitted — 148 charts",
    type: "success",
  },
  {
    date: "2026-03-18",
    event: "QA review completed — 3 exceptions flagged",
    type: "warning",
  },
  {
    date: "2026-03-15",
    event: "Abstractor team expanded (+2 members)",
    type: "info",
  },
  {
    date: "2026-03-10",
    event: "Compliance audit passed — 94% score",
    type: "success",
  },
  {
    date: "2026-03-05",
    event: "Batch 11 submitted — 162 charts",
    type: "success",
  },
  { date: "2026-02-28", event: "Mid-cycle review meeting held", type: "info" },
  {
    date: "2026-02-20",
    event: "Exception raised — missing encounter data",
    type: "warning",
  },
];

const mockMeasures = [
  { code: "CDC", label: "Diabetes Care", total: 320, done: 278, pct: 87 },
  {
    code: "CBP",
    label: "Controlling Blood Pressure",
    total: 290,
    done: 265,
    pct: 91,
  },
  { code: "W34", label: "Well-Child Visits", total: 210, done: 198, pct: 94 },
  {
    code: "AWC",
    label: "Annual Wellness Check",
    total: 180,
    done: 142,
    pct: 79,
  },
  {
    code: "COL",
    label: "Colorectal Screening",
    total: 160,
    done: 110,
    pct: 69,
  },
  {
    code: "PPC",
    label: "Prenatal & Postpartum",
    total: 130,
    done: 130,
    pct: 100,
  },
];

function FullProfileModal({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ProfileTab>("overview");
  const completion = pct(client.chartsCompleted, client.chartsTotal);
  const abstraction = pct(client.chartsAbstracted, client.chartsTotal);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(client.dueDate).getTime() - Date.now()) / 86400000),
  );

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "100%", maxWidth: 860, maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal header ── */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold" style={{ fontSize: 15 }}>
                {client.shortCode.slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  className="font-bold text-foreground"
                  style={{ fontSize: 18 }}
                >
                  {client.name}
                </h2>
                <StatusBadge status={client.status} />
                <span
                  className="px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground"
                  style={{ fontSize: 11 }}
                >
                  {client.plan}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                {[
                  { icon: FileText, val: client.id },
                  { icon: MapPin, val: client.region },
                  { icon: Calendar, val: client.measureYear },
                ].map((m) => (
                  <span
                    key={m.val}
                    className="flex items-center gap-1 text-muted-foreground"
                    style={{ fontSize: 12 }}
                  >
                    <m.icon className="w-3 h-3" />
                    {m.val}
                  </span>
                ))}
                <span
                  className={`flex items-center gap-1 font-semibold ${daysLeft <= 14 ? "text-red-500" : daysLeft <= 30 ? "text-amber-500" : "text-emerald-600"}`}
                  style={{ fontSize: 12 }}
                >
                  <Clock className="w-3 h-3" />
                  {daysLeft}d remaining
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            {[
              {
                label: "Total Charts",
                value: client.chartsTotal.toLocaleString(),
                icon: Layers,
                cls: "text-foreground",
              },
              {
                label: "Completed",
                value: client.chartsCompleted.toLocaleString(),
                icon: CheckCircle2,
                cls: "text-emerald-600",
              },
              {
                label: "Pending",
                value: client.chartsPending.toLocaleString(),
                icon: Clock,
                cls:
                  client.chartsPending > 500
                    ? "text-amber-600"
                    : "text-foreground",
              },
              {
                label: "Compliance",
                value: `${client.complianceScore}%`,
                icon: Shield,
                cls:
                  client.complianceScore >= 90
                    ? "text-emerald-600"
                    : client.complianceScore >= 75
                      ? "text-amber-600"
                      : "text-red-500",
              },
            ].map((k) => (
              <div
                key={k.label}
                className="bg-muted/40 rounded-xl px-3 py-2.5 border border-border flex items-center gap-2 min-w-0"
              >
                <k.icon className={`w-4 h-4 flex-shrink-0 ${k.cls}`} />
                <div>
                  <p
                    className={`font-bold leading-tight ${k.cls} truncate`}
                    style={{ fontSize: 16 }}
                  >
                    {k.value}
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: 10 }}>
                    {k.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="flex-shrink-0 flex items-center gap-1 px-6 py-2 border-b border-border bg-muted/20">
          {PROFILE_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${tab === t.id ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
              style={{ fontSize: 13 }}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* OVERVIEW */}
          {tab === "overview" && (
            <div className="space-y-5">
              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Abstraction Progress
                </h3>
                <div className="space-y-3">
                  {[
                    {
                      label: "Completion",
                      val: completion,
                      color:
                        completion >= 90
                          ? "bg-emerald-500"
                          : completion >= 60
                            ? "bg-primary"
                            : "bg-amber-500",
                      textCls: "text-primary",
                    },
                    {
                      label: "Abstracted",
                      val: abstraction,
                      color: "bg-cyan-500",
                      textCls: "text-cyan-600",
                    },
                    {
                      label: "Compliance",
                      val: client.complianceScore,
                      color:
                        client.complianceScore >= 90
                          ? "bg-emerald-500"
                          : "bg-amber-500",
                      textCls: "text-emerald-600",
                    },
                  ].map((row) => (
                    <div key={row.label}>
                      <div
                        className="flex justify-between mb-1.5"
                        style={{ fontSize: 13 }}
                      >
                        <span className="text-foreground font-medium">
                          {row.label}
                        </span>
                        <span className={`font-bold ${row.textCls}`}>
                          {row.val}%
                        </span>
                      </div>
                      <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${row.color}`}
                          style={{ width: `${row.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Measure Breakdown
                </h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        {[
                          "Code",
                          "Description",
                          "Assigned",
                          "Done",
                          "Progress",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left text-muted-foreground font-semibold"
                            style={{
                              fontSize: 11,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mockMeasures.map((m, i) => (
                        <tr
                          key={m.code}
                          className={`border-b border-border last:border-b-0 ${i % 2 !== 0 ? "bg-muted/20" : ""}`}
                        >
                          <td className="px-3 py-2.5">
                            <span
                              className="px-2 py-0.5 rounded bg-primary/10 text-primary font-bold"
                              style={{ fontSize: 11 }}
                            >
                              {m.code}
                            </span>
                          </td>
                          <td
                            className="px-3 py-2.5 text-foreground"
                            style={{ fontSize: 12 }}
                          >
                            {m.label}
                          </td>
                          <td
                            className="px-3 py-2.5 text-muted-foreground font-medium"
                            style={{ fontSize: 12 }}
                          >
                            {m.total}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`font-semibold ${m.pct >= 90 ? "text-emerald-600" : m.pct >= 70 ? "text-foreground" : "text-amber-600"}`}
                              style={{ fontSize: 12 }}
                            >
                              {m.done}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 min-w-[120px]">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${m.pct >= 90 ? "bg-emerald-500" : m.pct >= 70 ? "bg-primary" : "bg-amber-500"}`}
                                  style={{ width: `${m.pct}%` }}
                                />
                              </div>
                              <span
                                className="text-muted-foreground flex-shrink-0"
                                style={{ fontSize: 11 }}
                              >
                                {m.pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Recent Activity
                </h3>
                <div className="space-y-0">
                  {mockTimeline.map((ev, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${ev.type === "success" ? "bg-emerald-500" : ev.type === "warning" ? "bg-amber-500" : "bg-blue-400"}`}
                        />
                        {i < mockTimeline.length - 1 && (
                          <div className="w-px flex-1 bg-border mt-1" />
                        )}
                      </div>
                      <div className="pb-4 min-w-0">
                        <p className="text-foreground" style={{ fontSize: 13 }}>
                          {ev.event}
                        </p>
                        <p
                          className="text-muted-foreground mt-0.5"
                          style={{ fontSize: 11 }}
                        >
                          {ev.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* CHARTS */}
          {tab === "charts" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  {
                    label: "Total Assigned",
                    val: client.chartsTotal,
                    icon: Layers,
                    cls: "bg-primary/10 text-primary",
                  },
                  {
                    label: "Completed",
                    val: client.chartsCompleted,
                    icon: CheckCircle2,
                    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                  },
                  {
                    label: "Abstracted",
                    val: client.chartsAbstracted,
                    icon: ClipboardList,
                    cls: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
                  },
                  {
                    label: "Pending",
                    val: client.chartsPending,
                    icon: Clock,
                    cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
                  },
                  {
                    label: "Abstractors",
                    val: client.abstractors,
                    icon: UserCheck,
                    cls: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
                  },
                  {
                    label: "Days Remaining",
                    val: daysLeft,
                    icon: Target,
                    cls:
                      daysLeft <= 14
                        ? "bg-red-100 text-red-600"
                        : "bg-muted text-foreground",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 min-w-0"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.cls}`}
                    >
                      <s.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p
                        className="font-bold text-foreground truncate"
                        style={{ fontSize: 18 }}
                      >
                        {s.val.toLocaleString()}
                      </p>
                      <p
                        className="text-muted-foreground break-words"
                        style={{ fontSize: 10 }}
                      >
                        {s.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Measure Chart Volumes
                </h3>
                <div className="space-y-2.5">
                  {mockMeasures.map((m) => (
                    <div key={m.code} className="flex items-center gap-3">
                      <span
                        className="text-muted-foreground font-mono flex-shrink-0 w-10 text-right"
                        style={{ fontSize: 11 }}
                      >
                        {m.code}
                      </span>
                      <div className="flex-1 h-7 bg-muted/40 rounded-lg overflow-hidden relative border border-border">
                        <div
                          className={`absolute inset-y-0 left-0 rounded-lg ${m.pct >= 90 ? "bg-emerald-500" : m.pct >= 70 ? "bg-primary" : "bg-amber-500"} opacity-80`}
                          style={{ width: `${m.pct}%` }}
                        />
                        <span
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground font-semibold z-10"
                          style={{ fontSize: 11 }}
                        >
                          {m.done}/{m.total}
                        </span>
                      </div>
                      <span
                        className="text-muted-foreground flex-shrink-0 w-8 text-right"
                        style={{ fontSize: 11 }}
                      >
                        {m.pct}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-3">
                  {[
                    { cls: "bg-emerald-500", label: "≥90%" },
                    { cls: "bg-primary", label: "70–89%" },
                    { cls: "bg-amber-500", label: "<70%" },
                  ].map((l) => (
                    <div
                      key={l.label}
                      className="flex items-center gap-1.5"
                      style={{ fontSize: 11 }}
                    >
                      <div className={`w-2.5 h-2.5 rounded-sm ${l.cls}`} />
                      <span className="text-muted-foreground">
                        {l.label} complete
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Open Exceptions
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      id: "EXC-041",
                      chart: "CHT-8842",
                      reason: "Missing encounter date",
                      severity: "high",
                    },
                    {
                      id: "EXC-038",
                      chart: "CHT-7721",
                      reason: "Illegible provider signature",
                      severity: "medium",
                    },
                    {
                      id: "EXC-035",
                      chart: "CHT-6609",
                      reason: "Incomplete lab result",
                      severity: "medium",
                    },
                  ].map((ex) => (
                    <div
                      key={ex.id}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/20"
                    >
                      <AlertTriangle
                        className={`w-4 h-4 flex-shrink-0 ${ex.severity === "high" ? "text-red-500" : "text-amber-500"}`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="font-semibold text-foreground"
                            style={{ fontSize: 12 }}
                          >
                            {ex.id}
                          </span>
                          <span
                            className="text-muted-foreground"
                            style={{ fontSize: 11 }}
                          >
                            · {ex.chart}
                          </span>
                        </div>
                        <p
                          className="text-muted-foreground truncate"
                          style={{ fontSize: 12 }}
                        >
                          {ex.reason}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold flex-shrink-0 ${ex.severity === "high" ? "bg-red-50 text-red-600 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        {ex.severity}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* CONTRACT */}
          {tab === "contract" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <section className="space-y-2">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Contract Details
                  </h3>
                  <div className="rounded-xl border border-border overflow-hidden">
                    {[
                      { label: "Client ID", value: client.id },
                      { label: "Contract Type", value: client.contractType },
                      { label: "Measure Year", value: client.measureYear },
                      { label: "Plan Tier", value: client.plan },
                      { label: "Region", value: client.region },
                      {
                        label: "Status",
                        value:
                          client.status.charAt(0).toUpperCase() +
                          client.status.slice(1),
                      },
                    ].map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex justify-between items-center px-3 py-2.5 ${i % 2 === 0 ? "bg-muted/20" : ""}`}
                        style={{ fontSize: 12 }}
                      >
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="font-semibold text-foreground">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-2">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    Timeline
                  </h3>
                  <div className="rounded-xl border border-border overflow-hidden">
                    {[
                      { label: "Start Date", value: client.startDate },
                      { label: "Due Date", value: client.dueDate },
                      {
                        label: "Days Elapsed",
                        value: `${Math.max(0, Math.ceil((Date.now() - new Date(client.startDate).getTime()) / 86400000))}d`,
                      },
                      { label: "Days Remaining", value: `${daysLeft}d` },
                      {
                        label: "Total Duration",
                        value: `${Math.ceil((new Date(client.dueDate).getTime() - new Date(client.startDate).getTime()) / 86400000)}d`,
                      },
                      { label: "Last Activity", value: client.lastActivity },
                    ].map((row, i) => (
                      <div
                        key={row.label}
                        className={`flex justify-between items-center px-3 py-2.5 ${i % 2 === 0 ? "bg-muted/20" : ""}`}
                        style={{ fontSize: 12 }}
                      >
                        <span className="text-muted-foreground">
                          {row.label}
                        </span>
                        <span className="font-semibold text-foreground">
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Contract Timeline
                </h3>
                <div className="bg-muted/30 rounded-xl p-4 border border-border">
                  <div
                    className="flex justify-between mb-2"
                    style={{ fontSize: 12 }}
                  >
                    <span className="text-muted-foreground">
                      {client.startDate}
                    </span>
                    <span className="text-muted-foreground">
                      {client.dueDate}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-cyan-500 transition-all duration-700"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <div
                    className="flex justify-between mt-2"
                    style={{ fontSize: 11 }}
                  >
                    <span className="text-primary font-semibold">
                      {completion}% elapsed
                    </span>
                    <span
                      className={`font-semibold ${daysLeft <= 14 ? "text-red-500" : "text-muted-foreground"}`}
                    >
                      {daysLeft} days left
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  SLA Status
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    {
                      label: "Chart Completion",
                      target: "≥95%",
                      current: `${completion}%`,
                      ok: completion >= 95,
                    },
                    {
                      label: "Abstraction Rate",
                      target: "≥90%",
                      current: `${abstraction}%`,
                      ok: abstraction >= 90,
                    },
                    {
                      label: "Compliance Score",
                      target: "≥92%",
                      current: `${client.complianceScore}%`,
                      ok: client.complianceScore >= 92,
                    },
                  ].map((sla) => (
                    <div
                      key={sla.label}
                      className={`rounded-xl border p-3 ${sla.ok ? "border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-800" : "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {sla.ok ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        )}
                        <span
                          className={`font-semibold ${sla.ok ? "text-emerald-700 dark:text-emerald-300" : "text-amber-700 dark:text-amber-300"}`}
                          style={{ fontSize: 11 }}
                        >
                          {sla.ok ? "On Track" : "At Risk"}
                        </span>
                      </div>
                      <p
                        className="text-foreground font-bold"
                        style={{ fontSize: 18 }}
                      >
                        {sla.current}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: 11 }}
                      >
                        {sla.label}
                      </p>
                      <p
                        className="text-muted-foreground mt-0.5"
                        style={{ fontSize: 10 }}
                      >
                        Target: {sla.target}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* CONTACT */}
          {tab === "contact" && (
            <div className="space-y-5">
              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Primary Contact
                </h3>
                <div className="rounded-xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span
                        className="text-primary font-bold"
                        style={{ fontSize: 14 }}
                      >
                        {client.contactName
                          .split(" ")
                          .filter((w) => /^[A-Z]/.test(w))
                          .slice(0, 2)
                          .map((w) => w[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p
                        className="font-bold text-foreground"
                        style={{ fontSize: 15 }}
                      >
                        {client.contactName}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: 12 }}
                      >
                        Primary Contact · {client.name}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        icon: Mail,
                        label: "Email",
                        value: client.contactEmail,
                      },
                      {
                        icon: Phone,
                        label: "Phone",
                        value: client.contactPhone,
                      },
                      { icon: MapPin, label: "Region", value: client.region },
                      {
                        icon: Building2,
                        label: "Organization",
                        value: client.name,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-start gap-2.5 p-2.5 rounded-lg bg-card border border-border"
                      >
                        <row.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p
                            className="text-muted-foreground"
                            style={{ fontSize: 10 }}
                          >
                            {row.label}
                          </p>
                          <p
                            className="font-medium text-foreground truncate"
                            style={{ fontSize: 12 }}
                          >
                            {row.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Assigned Abstractor Team
                </h3>
                <div className="space-y-2">
                  {Array.from(
                    {
                      length: Math.max(
                        Math.min(client.abstractors, 5),
                        client.abstractors > 0 ? 1 : 0,
                      ),
                    },
                    (_, i) => {
                      const names = [
                        "Jordan Liu",
                        "Priya Nair",
                        "Carlos Mendez",
                        "Aisha Brooks",
                        "Tom Fielding",
                      ];
                      const counts = [48, 52, 41, 0, 38];
                      const active = [true, true, true, false, true];
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-muted/20"
                        >
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <span
                              className="text-white font-bold"
                              style={{ fontSize: 9 }}
                            >
                              {names[i]
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-foreground"
                              style={{ fontSize: 12 }}
                            >
                              {names[i]}
                            </p>
                            <p
                              className="text-muted-foreground"
                              style={{ fontSize: 11 }}
                            >
                              Chart Abstractor
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p
                              className="font-semibold text-foreground"
                              style={{ fontSize: 12 }}
                            >
                              {counts[i]} charts
                            </p>
                            <span
                              className={`text-[10px] font-semibold ${active[i] ? "text-emerald-600" : "text-amber-600"}`}
                            >
                              {active[i] ? "active" : "on-leave"}
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                  {client.abstractors === 0 && (
                    <p
                      className="text-muted-foreground text-center py-4"
                      style={{ fontSize: 13 }}
                    >
                      No abstractors assigned yet.
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Send Email", icon: Mail },
                    { label: "Schedule Meeting", icon: Calendar },
                    { label: "Assign Abstractor", icon: UserCheck },
                    { label: "View Audit Log", icon: Activity },
                  ].map((a) => (
                    <button
                      key={a.label}
                      className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-2.5 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
                      style={{ fontSize: 13 }}
                    >
                      <a.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {a.label}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        {/* ── Modal footer ── */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 border-t border-border bg-muted/10">
          <p className="text-muted-foreground" style={{ fontSize: 12 }}>
            Last activity: {client.lastActivity}
          </p>
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              style={{ fontSize: 13 }}
            >
              <FileText className="w-3.5 h-3.5" />
              Export Report
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              style={{ fontSize: 13 }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Client detail slide panel ──────────────────────────── */
function ClientPanel({
  client,
  onClose,
}: {
  client: Client;
  onClose: () => void;
}) {
  const [showFullProfile, setShowFullProfile] = useState(false);
  const completion = pct(client.chartsCompleted, client.chartsTotal);
  const abstraction = pct(client.chartsAbstracted, client.chartsTotal);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] max-w-full bg-card border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
          <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                <span
                  className="text-primary font-bold"
                  style={{ fontSize: 13 }}
                >
                  {client.shortCode.slice(0, 2)}
                </span>
              </div>
              <div className="min-w-0">
                <h2
                  className="font-bold text-foreground truncate sm:whitespace-nowrap"
                  style={{ fontSize: 15 }}
                >
                  {client.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="text-muted-foreground"
                    style={{ fontSize: 11 }}
                  >
                    {client.id}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <StatusBadge status={client.status} />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Progress overview */}
          <section className="space-y-3">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Chart Progress
            </h3>
            <div className="space-y-2.5">
              <div>
                <div
                  className="flex justify-between mb-1"
                  style={{ fontSize: 12 }}
                >
                  <span className="text-foreground font-medium">
                    Completion
                  </span>
                  <span className="font-bold text-primary">{completion}%</span>
                </div>
                <ProgressBar
                  value={completion}
                  colorCls={
                    completion >= 90
                      ? "bg-emerald-500"
                      : completion >= 60
                        ? "bg-primary"
                        : "bg-amber-500"
                  }
                />
              </div>
              <div>
                <div
                  className="flex justify-between mb-1"
                  style={{ fontSize: 12 }}
                >
                  <span className="text-foreground font-medium">
                    Abstracted
                  </span>
                  <span className="font-bold text-cyan-600">
                    {abstraction}%
                  </span>
                </div>
                <ProgressBar value={abstraction} colorCls="bg-cyan-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {[
                {
                  label: "Total",
                  val: client.chartsTotal.toLocaleString(),
                  cls: "text-foreground",
                },
                {
                  label: "Done",
                  val: client.chartsCompleted.toLocaleString(),
                  cls: "text-emerald-600 dark:text-emerald-400",
                },
                {
                  label: "Pending",
                  val: client.chartsPending.toLocaleString(),
                  cls:
                    client.chartsPending > 500
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-foreground",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="bg-muted/40 rounded-lg p-2.5 text-center"
                >
                  <p className={`font-bold ${s.cls}`} style={{ fontSize: 16 }}>
                    {s.val}
                  </p>
                  <p
                    className="text-muted-foreground mt-0.5"
                    style={{ fontSize: 10 }}
                  >
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Contract details */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Contract Details
            </h3>
            <div className="bg-muted/30 rounded-xl overflow-hidden border border-border">
              {[
                { label: "Contract Type", value: client.contractType },
                { label: "Measure Year", value: client.measureYear },
                { label: "Start Date", value: client.startDate },
                { label: "Due Date", value: client.dueDate },
                { label: "Plan", value: client.plan },
                {
                  label: "Abstractors",
                  value: `${client.abstractors} assigned`,
                },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-3 py-2 gap-2 flex-wrap sm:flex-nowrap ${i % 2 === 0 ? "bg-muted/20" : ""}`}
                  style={{ fontSize: 12 }}
                >
                  <span className="text-muted-foreground">{row.label}</span>
                  <span className="font-semibold text-foreground">
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="space-y-2">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Primary Contact
            </h3>
            <div className="rounded-xl border border-border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span
                    className="text-primary font-bold"
                    style={{ fontSize: 10 }}
                  >
                    {client.contactName
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                </div>
                <span
                  className="font-semibold text-foreground"
                  style={{ fontSize: 13 }}
                >
                  {client.contactName}
                </span>
              </div>
              {[
                { icon: Mail, val: client.contactEmail },
                { icon: Phone, val: client.contactPhone },
              ].map((row) => (
                <div
                  key={row.val}
                  className="flex items-center gap-2 text-muted-foreground"
                  style={{ fontSize: 12 }}
                >
                  <row.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="break-all">{row.val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Compliance score */}
          <section>
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
              Compliance Score
            </h3>
            <div className="flex items-center gap-3 bg-muted/30 rounded-xl px-4 py-3 border border-border">
              <div
                className={`text-2xl font-bold ${client.complianceScore >= 90 ? "text-emerald-600" : client.complianceScore >= 75 ? "text-amber-600" : "text-red-500"}`}
              >
                {client.complianceScore}%
              </div>
              <div className="flex-1">
                <ProgressBar
                  value={client.complianceScore}
                  colorCls={
                    client.complianceScore >= 90
                      ? "bg-emerald-500"
                      : client.complianceScore >= 75
                        ? "bg-amber-500"
                        : "bg-red-500"
                  }
                />
                <p
                  className="text-muted-foreground mt-1"
                  style={{ fontSize: 10 }}
                >
                  NCQA HEDIS compliance threshold
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowFullProfile(true)}
            className="inline-flex items-center justify-center w-full sm:w-auto gap-2 whitespace-nowrap flex-1 justify-center px-3 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
            style={{ fontSize: 13 }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open Full Profile
          </button>
          <button
            className="inline-flex items-center justify-center w-full sm:w-auto gap-2 whitespace-nowrap px-3 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
            style={{ fontSize: 13 }}
          >
            <FileText className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      </aside>

      {showFullProfile && (
        <FullProfileModal
          client={client}
          onClose={() => setShowFullProfile(false)}
        />
      )}
    </>
  );
}

/* ─── Add Client Modal ───────────────────────────────────── */
type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Organization",
  2: "Contract",
  3: "Contact & Team",
};

interface AddClientForm {
  /* Step 1 */
  name: string;
  shortCode: string;
  region: string;
  plan: string;
  /* Step 2 */
  contractType: ContractType | "";
  measureYear: string;
  startDate: string;
  dueDate: string;
  chartsTotal: string;
  /* Step 3 */
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  abstractors: string;
  status: ClientStatus;
}

const EMPTY_FORM: AddClientForm = {
  name: "",
  shortCode: "",
  region: "",
  plan: "Professional",
  contractType: "",
  measureYear: "MY2026",
  startDate: "",
  dueDate: "",
  chartsTotal: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  abstractors: "",
  status: "onboarding",
};

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className="text-muted-foreground font-medium"
        style={{ fontSize: 12 }}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all";

function AddClientModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (c: Client) => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<AddClientForm>(EMPTY_FORM);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddClientForm, string>>
  >({});

  const set = (k: keyof AddClientForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const validateStep = (): boolean => {
    const errs: Partial<Record<keyof AddClientForm, string>> = {};
    if (step === 1) {
      if (!form.name.trim()) errs.name = "Required";
      if (!form.shortCode.trim()) errs.shortCode = "Required";
      if (!form.region.trim()) errs.region = "Required";
    }
    if (step === 2) {
      if (!form.contractType) errs.contractType = "Required";
      if (!form.startDate) errs.startDate = "Required";
      if (!form.dueDate) errs.dueDate = "Required";
      if (!form.chartsTotal || isNaN(Number(form.chartsTotal)))
        errs.chartsTotal = "Must be a number";
    }
    if (step === 3) {
      if (!form.contactName.trim()) errs.contactName = "Required";
      if (!form.contactEmail.trim()) errs.contactEmail = "Required";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (validateStep()) setStep((s) => (s < 3 ? ((s + 1) as Step) : s));
  };
  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const submit = () => {
    if (!validateStep()) return;
    const total = Number(form.chartsTotal) || 0;
    const newClient: Client = {
      id: `CLT-00${Math.floor(Math.random() * 900) + 100}`,
      name: form.name,
      shortCode: form.shortCode.toUpperCase(),
      contractType: form.contractType as ContractType,
      status: form.status,
      region: form.region,
      contactName: form.contactName,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      measureYear: form.measureYear,
      chartsTotal: total,
      chartsCompleted: 0,
      chartsAbstracted: 0,
      chartsPending: total,
      dueDate: form.dueDate,
      startDate: form.startDate,
      complianceScore: 0,
      abstractors: Number(form.abstractors) || 0,
      plan: form.plan,
      lastActivity: "Just now",
    };
    onAdd(newClient);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
          style={{ maxHeight: "90vh" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
            <div>
              <h2
                className="font-bold text-foreground"
                style={{ fontSize: 16 }}
              >
                Add New Client
              </h2>
              <p
                className="text-muted-foreground mt-0.5"
                style={{ fontSize: 12 }}
              >
                Step {step} of 3 — {STEP_LABELS[step]}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Step indicator ── */}
          <div className="flex items-center gap-0 px-6 py-3 border-b border-border flex-shrink-0">
            {([1, 2, 3] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      s < step
                        ? "bg-emerald-500 text-white"
                        : s === step
                          ? "bg-primary text-white"
                          : "bg-muted text-muted-foreground border border-border"
                    }`}
                    style={{ fontSize: 11, fontWeight: 700 }}
                  >
                    {s < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : s}
                  </div>
                  <span
                    className={`hidden sm:block transition-colors ${s === step ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                    style={{ fontSize: 12 }}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`flex-1 h-px mx-3 ${s < step ? "bg-emerald-400" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* STEP 1 — Organization */}
            {step === 1 && (
              <div className="space-y-4">
                <Field label="Organization Name" required>
                  <input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Midwest Health Alliance"
                    className={`${inputCls} ${errors.name ? "border-red-400 focus:ring-red-200" : ""}`}
                    style={{ fontSize: 13 }}
                  />
                  {errors.name && (
                    <p className="text-red-500 mt-0.5" style={{ fontSize: 11 }}>
                      {errors.name}
                    </p>
                  )}
                </Field>

                <Field label="Short Code" required>
                  <input
                    value={form.shortCode}
                    onChange={(e) =>
                      set("shortCode", e.target.value.toUpperCase())
                    }
                    placeholder="e.g. MHA"
                    maxLength={6}
                    className={`${inputCls} ${errors.shortCode ? "border-red-400 focus:ring-red-200" : ""}`}
                    style={{ fontSize: 13 }}
                  />
                  {errors.shortCode && (
                    <p className="text-red-500 mt-0.5" style={{ fontSize: 11 }}>
                      {errors.shortCode}
                    </p>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Region" required>
                    <div className="relative">
                      <select
                        value={form.region}
                        onChange={(e) => set("region", e.target.value)}
                        className={`appearance-none ${inputCls} pr-7 cursor-pointer ${errors.region ? "border-red-400" : ""}`}
                        style={{ fontSize: 13 }}
                      >
                        <option value="">Select…</option>
                        {[
                          "Northeast",
                          "Southeast",
                          "Midwest",
                          "Mountain",
                          "West",
                          "South",
                          "Southwest",
                        ].map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                    {errors.region && (
                      <p
                        className="text-red-500 mt-0.5"
                        style={{ fontSize: 11 }}
                      >
                        {errors.region}
                      </p>
                    )}
                  </Field>

                  <Field label="Plan Tier">
                    <div className="relative">
                      <select
                        value={form.plan}
                        onChange={(e) => set("plan", e.target.value)}
                        className={`appearance-none ${inputCls} pr-7 cursor-pointer`}
                        style={{ fontSize: 13 }}
                      >
                        <option>Professional</option>
                        <option>Enterprise</option>
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>

                {/* Preview badge */}
                {form.shortCode && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/20">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <span
                        className="text-primary font-bold"
                        style={{ fontSize: 11 }}
                      >
                        {form.shortCode.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p
                        className="font-semibold text-foreground"
                        style={{ fontSize: 13 }}
                      >
                        {form.name || "Client Name"}
                      </p>
                      <p
                        className="text-muted-foreground"
                        style={{ fontSize: 11 }}
                      >
                        {form.region || "Region"} · {form.plan}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Contract */}
            {step === 2 && (
              <div className="space-y-4">
                <Field label="Contract Type" required>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        "HEDIS Hybrid",
                        "HEDIS Administrative",
                        "HEDIS Electronic",
                        "Multi-Measure",
                      ] as ContractType[]
                    ).map((ct) => (
                      <button
                        key={ct}
                        type="button"
                        onClick={() => set("contractType", ct)}
                        className={`px-3 py-2.5 rounded-lg border text-left transition-all ${
                          form.contractType === ct
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-foreground hover:bg-accent"
                        }`}
                        style={{ fontSize: 12 }}
                      >
                        <span className="font-semibold">{ct}</span>
                      </button>
                    ))}
                  </div>
                  {errors.contractType && (
                    <p className="text-red-500 mt-0.5" style={{ fontSize: 11 }}>
                      {errors.contractType}
                    </p>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Measure Year">
                    <div className="relative">
                      <select
                        value={form.measureYear}
                        onChange={(e) => set("measureYear", e.target.value)}
                        className={`appearance-none ${inputCls} pr-7 cursor-pointer`}
                        style={{ fontSize: 13 }}
                      >
                        {["MY2024", "MY2025", "MY2026", "MY2027"].map((y) => (
                          <option key={y}>{y}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>

                  <Field label="Total Charts" required>
                    <input
                      value={form.chartsTotal}
                      onChange={(e) => set("chartsTotal", e.target.value)}
                      placeholder="e.g. 1500"
                      type="number"
                      min="0"
                      className={`${inputCls} ${errors.chartsTotal ? "border-red-400" : ""}`}
                      style={{ fontSize: 13 }}
                    />
                    {errors.chartsTotal && (
                      <p
                        className="text-red-500 mt-0.5"
                        style={{ fontSize: 11 }}
                      >
                        {errors.chartsTotal}
                      </p>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Start Date" required>
                    <input
                      value={form.startDate}
                      onChange={(e) => set("startDate", e.target.value)}
                      type="date"
                      className={`${inputCls} ${errors.startDate ? "border-red-400" : ""}`}
                      style={{ fontSize: 13 }}
                    />
                    {errors.startDate && (
                      <p
                        className="text-red-500 mt-0.5"
                        style={{ fontSize: 11 }}
                      >
                        {errors.startDate}
                      </p>
                    )}
                  </Field>

                  <Field label="Due Date" required>
                    <input
                      value={form.dueDate}
                      onChange={(e) => set("dueDate", e.target.value)}
                      type="date"
                      className={`${inputCls} ${errors.dueDate ? "border-red-400" : ""}`}
                      style={{ fontSize: 13 }}
                    />
                    {errors.dueDate && (
                      <p
                        className="text-red-500 mt-0.5"
                        style={{ fontSize: 11 }}
                      >
                        {errors.dueDate}
                      </p>
                    )}
                  </Field>
                </div>
              </div>
            )}

            {/* STEP 3 — Contact & Team */}
            {step === 3 && (
              <div className="space-y-4">
                <Field label="Primary Contact Name" required>
                  <input
                    value={form.contactName}
                    onChange={(e) => set("contactName", e.target.value)}
                    placeholder="e.g. Dr. Patricia Chen"
                    className={`${inputCls} ${errors.contactName ? "border-red-400" : ""}`}
                    style={{ fontSize: 13 }}
                  />
                  {errors.contactName && (
                    <p className="text-red-500 mt-0.5" style={{ fontSize: 11 }}>
                      {errors.contactName}
                    </p>
                  )}
                </Field>

                <Field label="Contact Email" required>
                  <input
                    value={form.contactEmail}
                    onChange={(e) => set("contactEmail", e.target.value)}
                    placeholder="e.g. contact@healthplan.org"
                    type="email"
                    className={`${inputCls} ${errors.contactEmail ? "border-red-400" : ""}`}
                    style={{ fontSize: 13 }}
                  />
                  {errors.contactEmail && (
                    <p className="text-red-500 mt-0.5" style={{ fontSize: 11 }}>
                      {errors.contactEmail}
                    </p>
                  )}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Contact Phone">
                    <input
                      value={form.contactPhone}
                      onChange={(e) => set("contactPhone", e.target.value)}
                      placeholder="(555) 000-0000"
                      type="tel"
                      className={inputCls}
                      style={{ fontSize: 13 }}
                    />
                  </Field>

                  <Field label="Abstractors Assigned">
                    <input
                      value={form.abstractors}
                      onChange={(e) => set("abstractors", e.target.value)}
                      placeholder="0"
                      type="number"
                      min="0"
                      className={inputCls}
                      style={{ fontSize: 13 }}
                    />
                  </Field>
                </div>

                <Field label="Initial Status">
                  <div className="grid grid-cols-2 gap-2">
                    {(["onboarding", "active"] as ClientStatus[]).map((s) => {
                      const cfg = STATUS_CONFIG[s];
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => set("status", s)}
                          className={`px-3 py-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                            form.status === s
                              ? "border-primary bg-primary/10"
                              : "border-border hover:bg-accent"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${cfg.dotCls} flex-shrink-0`}
                          />
                          <span
                            className={`font-semibold ${form.status === s ? "text-primary" : "text-foreground"}`}
                            style={{ fontSize: 12 }}
                          >
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Field>

                {/* Summary */}
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Summary
                  </p>
                  {[
                    { label: "Client", val: form.name },
                    { label: "Contract", val: form.contractType || "—" },
                    { label: "Region", val: form.region || "—" },
                    { label: "Charts", val: form.chartsTotal || "0" },
                    { label: "Due", val: form.dueDate || "—" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex justify-between"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold text-foreground truncate max-w-[200px]">
                        {row.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 bg-muted/20">
            <button
              onClick={step === 1 ? onClose : back}
              className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              style={{ fontSize: 13 }}
            >
              {step === 1 ? "Cancel" : "← Back"}
            </button>

            <div className="flex items-center gap-1.5">
              {([1, 2, 3] as Step[]).map((s) => (
                <div
                  key={s}
                  className={`rounded-full transition-all ${s === step ? "w-5 h-2 bg-primary" : "w-2 h-2 bg-border"}`}
                />
              ))}
            </div>

            {step < 3 ? (
              <button
                onClick={next}
                className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
                style={{ fontSize: 13 }}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={submit}
                className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                style={{ fontSize: 13 }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Create Client
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Main component ────────────────────────��────────────── */
export function Clients() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatus] = useState<ClientStatus | "all">("all");
  const [regionFilter, setRegion] = useState("all");
  const [selectedClient, setSelected] = useState<Client | null>(null);
  const [view, setView] = useState<"table" | "grid">("table");
  const [showAddModal, setShowAddModal] = useState(false);
  const [clientList, setClientList] = useState<Client[]>(CLIENTS);

  const regions = [
    "all",
    ...Array.from(new Set(clientList.map((c) => c.region))),
  ];

  const filtered = clientList.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q);
    const matchStatus = statusFilter === "all" || c.status === statusFilter;
    const matchRegion = regionFilter === "all" || c.region === regionFilter;
    return matchSearch && matchStatus && matchRegion;
  });

  const totalCharts = clientList.reduce((s, c) => s + c.chartsTotal, 0);
  const doneCharts = clientList.reduce((s, c) => s + c.chartsCompleted, 0);
  const activeClients = clientList.filter((c) => c.status === "active").length;
  const atRisk = clientList.filter((c) => c.status === "at-risk").length;

  return (
    <div className="relative flex flex-col h-full overflow-hidden bg-background">
      {/* ── Page header ──────────────────────────── */}
      <div className="flex-shrink-0 px-6 pt-5 pb-4 border-b border-border bg-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-bold text-foreground" style={{ fontSize: 20 }}>
              Clients
            </h1>
            <p
              className="text-muted-foreground mt-0.5"
              style={{ fontSize: 13 }}
            >
              Manage client contracts, chart progress, and compliance tracking
              across all health plans.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg border border-border text-foreground hover:bg-accent transition-colors"
              style={{ fontSize: 13 }}
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              style={{ fontSize: 13 }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Client
            </button>
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          <KpiCard
            label="Total Clients"
            value={CLIENTS.length}
            sub={`${activeClients} active`}
            icon={Users}
            colorCls="bg-primary"
          />
          <KpiCard
            label="Charts Assigned"
            value={totalCharts.toLocaleString()}
            sub="across all clients"
            icon={FileText}
            colorCls="bg-cyan-500"
          />
          <KpiCard
            label="Completion Rate"
            value={`${pct(doneCharts, totalCharts)}%`}
            sub={`${doneCharts.toLocaleString()} completed`}
            icon={TrendingUp}
            colorCls="bg-emerald-500"
          />
          <KpiCard
            label="At Risk"
            value={atRisk}
            sub="need immediate attention"
            icon={AlertCircle}
            colorCls="bg-amber-500"
          />
        </div>
      </div>

      {/* ── Toolbar ──────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-3 flex flex-wrap items-center gap-3 border-b border-border bg-card/60">
        {/* Search */}
        <div className="relative flex-1 w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients…"
            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            style={{ fontSize: 13 }}
          />
        </div>

        {/* Status filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatus(e.target.value as ClientStatus | "all")}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            style={{ fontSize: 13 }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="onboarding">Onboarding</option>
            <option value="at-risk">At Risk</option>
            <option value="inactive">Inactive</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        {/* Region filter */}
        <div className="relative w-full sm:w-auto">
          <select
            value={regionFilter}
            onChange={(e) => setRegion(e.target.value)}
            className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-border bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            style={{ fontSize: 13 }}
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r === "all" ? "All Regions" : r}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>

        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-1 border border-border rounded-lg overflow-hidden">
          {(["table", "grid"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex-1 sm:flex-none px-3 py-1.5 transition-colors ${
                view === v
                  ? "bg-primary text-white"
                  : "bg-background text-muted-foreground hover:bg-accent"
              }`}
              style={{ fontSize: 12 }}
            >
              {v === "table" ? "Table" : "Cards"}
            </button>
          ))}
        </div>

        <span
          className="w-full sm:w-auto text-muted-foreground text-center sm:text-left"
          style={{ fontSize: 12 }}
        >
          {filtered.length} of {CLIENTS.length}
        </span>
      </div>

      {/* ── Content ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {view === "table" ? (
          /* TABLE VIEW */
          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1000px] border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    {[
                      "Client",
                      "Status",
                      "Contract",
                      "Region",
                      "Charts",
                      "Completion",
                      "Due Date",
                      "Score",
                      "",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-muted-foreground font-semibold"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((client, i) => {
                    const comp = pct(
                      client.chartsCompleted,
                      client.chartsTotal,
                    );
                    return (
                      <tr
                        key={client.id}
                        onClick={() => setSelected(client)}
                        className={`border-b border-border last:border-b-0 cursor-pointer transition-colors hover:bg-primary/5 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                      >
                        {/* Client */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                              <span
                                className="text-primary font-bold"
                                style={{ fontSize: 10 }}
                              >
                                {client.shortCode.slice(0, 2)}
                              </span>
                            </div>
                            <div>
                              <p
                                className="font-semibold text-foreground truncate max-w-[160px]"
                                style={{ fontSize: 13 }}
                              >
                                {client.name}
                              </p>
                              <p
                                className="text-muted-foreground"
                                style={{ fontSize: 11 }}
                              >
                                {client.id} · {client.measureYear}
                              </p>
                            </div>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3">
                          <StatusBadge status={client.status} />
                        </td>
                        {/* Contract */}
                        <td className="px-4 py-3">
                          <span
                            className="text-foreground"
                            style={{ fontSize: 12 }}
                          >
                            {client.contractType}
                          </span>
                        </td>
                        {/* Region */}
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center gap-1 text-muted-foreground"
                            style={{ fontSize: 12 }}
                          >
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            {client.region}
                          </div>
                        </td>
                        {/* Charts */}
                        <td className="px-4 py-3">
                          <div style={{ fontSize: 12 }}>
                            <span className="font-semibold text-foreground">
                              {client.chartsCompleted.toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              {" "}
                              / {client.chartsTotal.toLocaleString()}
                            </span>
                          </div>
                        </td>
                        {/* Completion bar */}
                        <td className="px-4 py-3 min-w-[100px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1">
                              <ProgressBar
                                value={comp}
                                colorCls={
                                  comp >= 90
                                    ? "bg-emerald-500"
                                    : comp >= 60
                                      ? "bg-primary"
                                      : "bg-amber-500"
                                }
                              />
                            </div>
                            <span
                              className="text-foreground font-semibold flex-shrink-0"
                              style={{ fontSize: 11 }}
                            >
                              {comp}%
                            </span>
                          </div>
                        </td>
                        {/* Due date */}
                        <td className="px-4 py-3">
                          <div
                            className="flex items-center gap-1 text-muted-foreground"
                            style={{ fontSize: 12 }}
                          >
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            {client.dueDate}
                          </div>
                        </td>
                        {/* Score */}
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold ${client.complianceScore >= 90 ? "text-emerald-600" : client.complianceScore >= 75 ? "text-amber-600" : "text-red-500"}`}
                            style={{ fontSize: 13 }}
                          >
                            {client.complianceScore}%
                          </span>
                        </td>
                        {/* Actions */}
                        <td className="px-4 py-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelected(client);
                            }}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-16 text-center text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p style={{ fontSize: 14 }}>No clients match your filters.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* GRID / CARD VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((client) => {
              const comp = pct(client.chartsCompleted, client.chartsTotal);
              return (
                <div
                  key={client.id}
                  onClick={() => setSelected(client)}
                  className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all group"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                        <span
                          className="text-primary font-bold"
                          style={{ fontSize: 12 }}
                        >
                          {client.shortCode.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p
                          className="font-bold text-foreground"
                          style={{ fontSize: 13 }}
                        >
                          {client.name}
                        </p>
                        <p
                          className="text-muted-foreground"
                          style={{ fontSize: 11 }}
                        >
                          {client.id} · {client.contractType}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>

                  {/* Progress */}
                  <div className="mb-3">
                    <div
                      className="flex justify-between mb-1"
                      style={{ fontSize: 12 }}
                    >
                      <span className="text-muted-foreground">
                        Chart Completion
                      </span>
                      <span className="font-bold text-foreground">{comp}%</span>
                    </div>
                    <ProgressBar
                      value={comp}
                      colorCls={
                        comp >= 90
                          ? "bg-emerald-500"
                          : comp >= 60
                            ? "bg-primary"
                            : "bg-amber-500"
                      }
                    />
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      {
                        label: "Total",
                        val: client.chartsTotal.toLocaleString(),
                      },
                      {
                        label: "Done",
                        val: client.chartsCompleted.toLocaleString(),
                      },
                      {
                        label: "Pending",
                        val: client.chartsPending.toLocaleString(),
                      },
                    ].map((s) => (
                      <div
                        key={s.label}
                        className="bg-muted/40 rounded-lg p-2 text-center"
                      >
                        <p
                          className="font-bold text-foreground"
                          style={{ fontSize: 14 }}
                        >
                          {s.val}
                        </p>
                        <p
                          className="text-muted-foreground"
                          style={{ fontSize: 10 }}
                        >
                          {s.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Footer meta */}
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <div
                      className="flex items-center gap-1 text-muted-foreground"
                      style={{ fontSize: 11 }}
                    >
                      <MapPin className="w-3 h-3" />
                      {client.region}
                    </div>
                    <div
                      className="flex items-center gap-1 text-muted-foreground"
                      style={{ fontSize: 11 }}
                    >
                      <Shield className="w-3 h-3" />
                      <span
                        className={`font-semibold ${client.complianceScore >= 90 ? "text-emerald-600" : client.complianceScore >= 75 ? "text-amber-600" : "text-red-500"}`}
                      >
                        {client.complianceScore}%
                      </span>
                      compliance
                    </div>
                    <div
                      className="flex items-center gap-1 text-muted-foreground"
                      style={{ fontSize: 11 }}
                    >
                      <Calendar className="w-3 h-3" />
                      {client.dueDate}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p style={{ fontSize: 14 }}>No clients match your filters.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail slide panel ────────────────────── */}
      {selectedClient && (
        <ClientPanel
          client={selectedClient}
          onClose={() => setSelected(null)}
        />
      )}

      {/* ── Add Client modal ──────────────────────── */}
      {showAddModal && (
        <AddClientModal
          onClose={() => setShowAddModal(false)}
          onAdd={(c) => setClientList((prev) => [c, ...prev])}
        />
      )}
    </div>
  );
}
