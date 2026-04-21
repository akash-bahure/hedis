import { useState } from "react";
import {
  Cpu,
  UserCheck,
  ClipboardList,
  RefreshCw,
  BarChart2,
  Database,
  Zap,
  Layers,
  Target,
  Activity,
  Search,
  TrendingUp,
  UserPlus,
  FileText,
  Shield,
  BookOpen,
  Upload,
  SendHorizontal,
  AlertTriangle,
  Users,
  Clock,
  RefreshCcw,
  ShieldCheck,
  ChevronRight,
  CheckCircle2,
  Play,
  Eye,
  Calendar,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────── */
type ActorKind = "Automated" | "Human" | "Management";

interface Task {
  icon: React.ElementType;
  label: string;
  detail: string;
}

interface Metric {
  label: string;
  value: string;
}

interface Actor {
  id: string;
  pipelineStep: number; // logical pipeline order (1-5)
  title: string;
  subtitle: string;
  kind: ActorKind;
  icon: React.ElementType;
  description: string;
  tasks: Task[];
  metrics: Metric[];
  /* colour tokens */
  bg: string;
  text: string;
  border: string;
  iconBg: string;
  taskBg: string;
  dot: string;
  ring: string;
  headerBorder: string;
}

/* ─────────────────────────────────────────────────────────────
   ACTOR DATA  (pipeline order 1 → 5)
───────────────────────────────────────────────────────────── */
const ACTORS: Actor[] = [
  /* ── Step 1 ─ HEDIS Engine ─────────────────────────────── */
  {
    id: "engine",
    pipelineStep: 1,
    title: "HEDIS Engine",
    subtitle: "Automated Data System",
    kind: "Automated",
    icon: Cpu,
    description:
      "Continuously ingests clinical data, executes NCQA-certified measure logic, and drives the abstraction pipeline in real time.",
    tasks: [
      {
        icon: Database,
        label: "Automated data ingestion",
        detail: "Claims, lab results, pharmacy records",
      },
      {
        icon: Zap,
        label: "Measure logic execution",
        detail: "NCQA-certified rule engine processing",
      },
      {
        icon: Layers,
        label: "Numerator / denominator assignment",
        detail: "Per HEDIS measure specification",
      },
      {
        icon: Target,
        label: "Care gap identification",
        detail: "Real-time gap analysis & flagging",
      },
    ],
    metrics: [
      { label: "Records Processed", value: "47,284" },
      { label: "Gaps Flagged", value: "3,947" },
      { label: "Engine Uptime", value: "99.9%" },
    ],
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    iconBg: "bg-teal-500",
    taskBg: "bg-teal-50",
    dot: "bg-teal-500",
    ring: "ring-teal-300",
    headerBorder: "border-teal-200",
  },

  /* ── Step 2 ─ Quality Analyst ───────────────────────────── */
  {
    id: "qa-analyst",
    pipelineStep: 2,
    title: "Quality Analyst",
    subtitle: "QA & Performance Review",
    kind: "Human",
    icon: UserCheck,
    description:
      "Reviews measure performance, validates engine-identified gaps, and routes work items to the appropriate reviewers and abstractors.",
    tasks: [
      {
        icon: TrendingUp,
        label: "Review measure performance",
        detail: "Rate analysis by measure & plan type",
      },
      {
        icon: Activity,
        label: "Analyze gap trends",
        detail: "Month-over-month trend review",
      },
      {
        icon: Shield,
        label: "Validate system-identified gaps",
        detail: "Confirm or override engine flags",
      },
      {
        icon: UserPlus,
        label: "Assign tasks to reviewers/abstractor",
        detail: "Priority-based queue routing",
      },
    ],
    metrics: [
      { label: "Reviewed Today", value: "142" },
      { label: "Tasks Assigned", value: "38" },
      { label: "Validation Rate", value: "96.2%" },
    ],
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    iconBg: "bg-emerald-500",
    taskBg: "bg-emerald-50",
    dot: "bg-emerald-500",
    ring: "ring-emerald-300",
    headerBorder: "border-emerald-200",
  },

  /* ── Step 3 ─ Chart Abstractor ──────────────────────────── */
  {
    id: "abstractor",
    pipelineStep: 3,
    title: "Chart Abstractor",
    subtitle: "Clinical Documentation Specialist",
    kind: "Human",
    icon: ClipboardList,
    description:
      "Opens assigned charts, searches clinical documentation, validates and enters evidence to support HEDIS measure compliance.",
    tasks: [
      {
        icon: Play,
        label: "Open assigned work queue",
        detail: "Priority-sorted chart queue",
      },
      {
        icon: FileText,
        label: "Review member records",
        detail: "Demographics, history, encounters",
      },
      {
        icon: Search,
        label: "Search clinical documentation",
        detail: "Structured & unstructured data sources",
      },
      {
        icon: CheckCircle2,
        label: "Validate service evidence",
        detail: "CPT, ICD-10, LOINC codes verified",
      },
      {
        icon: ClipboardList,
        label: "Enter clinical evidence",
        detail: "Standardized data entry forms",
      },
      {
        icon: BookOpen,
        label: "Select evidence source",
        detail: "Primary vs. supplemental data",
      },
      {
        icon: Upload,
        label: "Upload documentation",
        detail: "Scanned records, lab results, faxes",
      },
      {
        icon: SendHorizontal,
        label: "Submit record for processing",
        detail: "Triggers system recalculation",
      },
    ],
    metrics: [
      { label: "Charts Completed", value: "24" },
      { label: "Pending Review", value: "17" },
      { label: "Avg. Cycle Time", value: "18 min" },
    ],
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    iconBg: "bg-blue-500",
    taskBg: "bg-blue-50",
    dot: "bg-blue-500",
    ring: "ring-blue-300",
    headerBorder: "border-blue-200",
  },

  /* ── Step 4 ─ System Recalculation ─────────────────────── */
  {
    id: "recalculation",
    pipelineStep: 4,
    title: "System Recalculation",
    subtitle: "Automated Processing Layer",
    kind: "Automated",
    icon: RefreshCw,
    description:
      "Automatically recalculates measure rates upon chart submission, maintaining a full audit trail of every data change.",
    tasks: [
      {
        icon: Activity,
        label: "Real-time updates",
        detail: "Instant rate refresh on submission",
      },
      {
        icon: RefreshCcw,
        label: "Automated recalculation",
        detail: "Numerator / denominator recomputation",
      },
      {
        icon: ShieldCheck,
        label: "Audit trail maintained",
        detail: "Full change history & timestamps logged",
      },
    ],
    metrics: [
      { label: "Recalcs Today", value: "1,847" },
      { label: "Avg. Latency", value: "0.4 s" },
      { label: "Audit Events", value: "12,394" },
    ],
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200",
    iconBg: "bg-slate-500",
    taskBg: "bg-slate-100",
    dot: "bg-slate-500",
    ring: "ring-slate-300",
    headerBorder: "border-slate-200",
  },

  /* ── Step 5 ─ Operations / Program Manager ──────────────── */
  {
    id: "operations",
    pipelineStep: 5,
    title: "Operations / PM",
    subtitle: "Workflow Oversight",
    kind: "Management",
    icon: BarChart2,
    description:
      "Monitors queue volumes, tracks SLA progress, manages resource allocation, and identifies workflow bottlenecks across the program.",
    tasks: [
      {
        icon: Eye,
        label: "Monitor queue volumes",
        detail: "Real-time work queue dashboards",
      },
      {
        icon: TrendingUp,
        label: "Track review progress",
        detail: "SLA compliance & velocity metrics",
      },
      {
        icon: Users,
        label: "Manage resource allocation",
        detail: "Abstractor & reviewer assignments",
      },
      {
        icon: AlertTriangle,
        label: "Identify workflow bottlenecks",
        detail: "Stage-level throughput analysis",
      },
    ],
    metrics: [
      { label: "SLA Compliance", value: "91.4%" },
      { label: "Active Staff", value: "12" },
      { label: "Throughput", value: "284 / day" },
    ],
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    iconBg: "bg-violet-500",
    taskBg: "bg-violet-50",
    dot: "bg-violet-500",
    ring: "ring-violet-300",
    headerBorder: "border-violet-200",
  },
];

/* ─────────────────────────────────────────────────────────────
   KIND PILL STYLES
───────────────────────────────────────────────────────────── */
const KIND_PILL: Record<ActorKind, string> = {
  Automated: "bg-teal-100 text-teal-700",
  Human: "bg-blue-100 text-blue-700",
  Management: "bg-violet-100 text-violet-700",
};

/* ─────────────────────────────────────────────────────────────
   PIPELINE NODE BUTTON
───────────────────────────────────────────────────────────── */
function PipelineNode({
  actor,
  active,
  onClick,
}: {
  actor: Actor;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = actor.icon;
  return (
    <button
      onClick={onClick}
      className={[
        "flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 transition-all duration-200 flex-shrink-0",
        active
          ? `${actor.bg} ${actor.border} shadow-sm ring-2 ${actor.ring}`
          : "bg-card border-border hover:bg-muted/40",
      ].join(" ")}
    >
      {/* Step number */}
      <div
        className={[
          "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black transition-colors",
          active
            ? `${actor.iconBg} text-white shadow-sm`
            : "bg-muted text-muted-foreground",
        ].join(" ")}
      >
        {actor.pipelineStep}
      </div>

      {/* Icon */}
      <div
        className={[
          "w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors",
          active
            ? `${actor.iconBg} text-white`
            : "bg-muted/60 text-muted-foreground",
        ].join(" ")}
      >
        <Icon className="w-3.5 h-3.5" />
      </div>

      {/* Label */}
      <div className="text-left min-w-0">
        <div
          className={`text-[11px] font-bold leading-tight whitespace-nowrap ${active ? actor.text : "text-foreground"}`}
        >
          {actor.title}
        </div>
        <div
          className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${KIND_PILL[actor.kind]}`}
        >
          {actor.kind}
        </div>
      </div>

      {/* Live dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${actor.dot} ${active ? "animate-pulse" : "opacity-25"}`}
      />
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────
   ACTOR DETAIL CARD
───────────────────────────────────────────────────────────── */
function ActorCard({
  actor,
  dimmed,
  highlighted,
}: {
  actor: Actor;
  dimmed: boolean;
  highlighted: boolean;
}) {
  const Icon = actor.icon;

  return (
    <div
      className={[
        "flex flex-col rounded-xl border-2 bg-card overflow-hidden transition-all duration-300 h-full",
        highlighted
          ? `${actor.border} ring-2 ${actor.ring} shadow-lg`
          : "border-border",
        dimmed ? "opacity-30" : "",
      ].join(" ")}
    >
      {/* ── Header ─────────────────────────── */}
      <div
        className={`px-4 pt-4 pb-3 border-b-2 ${actor.headerBorder} ${actor.bg}`}
      >
        <div className="flex items-start gap-3 mb-2">
          <div
            className={`w-10 h-10 rounded-xl ${actor.iconBg} flex items-center justify-center flex-shrink-0 shadow-sm`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-0.5">
              <span
                className={`text-[9px] font-black uppercase tracking-widest ${actor.text}`}
              >
                Step {actor.pipelineStep}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${KIND_PILL[actor.kind]}`}
              >
                {actor.kind}
              </span>
            </div>
            <h3 className={`text-sm font-bold leading-tight ${actor.text}`}>
              {actor.title}
            </h3>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {actor.subtitle}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${actor.dot} animate-pulse`}
            />
            <span className={`text-[9px] font-bold ${actor.text}`}>Live</span>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed">
          {actor.description}
        </p>
      </div>

      {/* ── Responsibilities header ─────────── */}
      <div className="px-4 py-2 border-b border-border bg-muted/20">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          Responsibilities · {actor.tasks.length} tasks
        </span>
      </div>

      {/* ── Task list ──────────────────────── */}
      <div className="flex-1 px-3 py-2.5 space-y-0.5 overflow-auto">
        {actor.tasks.map((task, i) => {
          const TaskIcon = task.icon;
          return (
            <div
              key={i}
              className="flex items-start gap-2.5 px-2 py-2 rounded-lg hover:bg-muted/40 transition-colors group/task"
            >
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${actor.taskBg} border ${actor.border}`}
              >
                <TaskIcon className={`w-3.5 h-3.5 ${actor.text}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground leading-tight">
                  {task.label}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {task.detail}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Metrics footer ─────────────────── */}
      <div
        className={`border-t-2 ${actor.headerBorder} px-4 py-3 ${actor.bg} flex-shrink-0`}
      >
        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mb-2">
          Live Metrics · MY2026
        </p>
        <div className="grid grid-cols-3 gap-2">
          {actor.metrics.map((m, i) => (
            <div
              key={i}
              className="bg-white/60 rounded-lg px-2 py-1.5 border border-white/80 text-center"
            >
              <p
                className={`text-[13px] font-black leading-tight ${actor.text}`}
              >
                {m.value}
              </p>
              <p className="text-[9px] text-muted-foreground leading-tight mt-0.5">
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────── */
export function HedisWorkflow() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const toggle = (step: number) =>
    setActiveStep((prev) => (prev === step ? null : step));

  const totalTasks = ACTORS.reduce((n, a) => n + a.tasks.length, 0);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      {/* ── Page header ───────────────────────────────────── */}
      <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-foreground">HEDIS Abstraction Workflow</h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[12px] text-muted-foreground">
              End-to-end HEDIS abstraction pipeline — 5 stages from automated
              ingestion to program oversight
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-[11px] font-semibold text-primary whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5" />
              HEDIS MY2026
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted border border-border rounded-lg text-[11px] font-semibold text-muted-foreground whitespace-nowrap">
              5-Stage Pipeline
            </span>
          </div>
        </div>
      </div>

      {/* ── Pipeline strip ────────────────────────────────── */}
      <div className="flex-shrink-0 bg-card border-b border-border px-6 py-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {ACTORS.flatMap((actor, i) => {
            const nodes = [
              <PipelineNode
                key={actor.id}
                actor={actor}
                active={activeStep === actor.pipelineStep}
                onClick={() => toggle(actor.pipelineStep)}
              />,
            ];
            if (i < ACTORS.length - 1) {
              nodes.push(
                <ChevronRight
                  key={`arr-${i}`}
                  className={`w-5 h-5 flex-shrink-0 transition-colors ${
                    activeStep === null
                      ? "text-primary/40"
                      : "text-muted-foreground/20"
                  }`}
                />,
              );
            }
            return nodes;
          })}

          {activeStep !== null && (
            <button
              onClick={() => setActiveStep(null)}
              className="ml-auto flex-shrink-0 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted/60 transition-colors whitespace-nowrap"
            >
              Show all
            </button>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          {activeStep !== null
            ? `Focused on Step ${activeStep}: ${ACTORS.find((a) => a.pipelineStep === activeStep)?.title} — click again or "Show all" to reset`
            : "Click any stage to focus · All 5 stages run concurrently within the live program"}
        </p>
      </div>

      {/* ── Actor cards ───────────────────────────────────── */}
      <div className="flex-1 overflow-auto p-5">
        <div className="flex gap-4 min-h-full" style={{ minWidth: 1100 }}>
          {ACTORS.map((actor) => (
            <div key={actor.id} className="flex-1 flex flex-col min-w-[210px]">
              <ActorCard
                actor={actor}
                dimmed={
                  activeStep !== null && activeStep !== actor.pipelineStep
                }
                highlighted={activeStep === actor.pipelineStep}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Footer summary ────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-border bg-card px-6 py-2.5 flex items-center gap-6 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-semibold text-muted-foreground">
            All systems operational
          </span>
        </div>
        <div className="h-3.5 w-px bg-border" />
        {[
          {
            label: "Automated Stages",
            value: String(ACTORS.filter((a) => a.kind === "Automated").length),
          },
          {
            label: "Human Stages",
            value: String(ACTORS.filter((a) => a.kind === "Human").length),
          },
          {
            label: "Oversight",
            value: String(ACTORS.filter((a) => a.kind === "Management").length),
          },
          { label: "Total Tasks", value: String(totalTasks) },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-foreground">
              {s.value}
            </span>
            <span className="text-[11px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            Last updated: just now
          </span>
        </div>
      </div>
    </div>
  );
}
