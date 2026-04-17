import React, { useState, useEffect } from "react";
import {
  LayoutList,
  FolderOpen,
  Zap,
  RotateCcw,
  ShieldCheck,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  User,
  ChevronRight,
  FileText,
  MessageSquare,
  ArrowUpRight,
  Hash,
  MoreHorizontal,
  RefreshCw,
  BadgeCheck,
  Filter,
  TrendingUp,
  CircleDot,
  ClipboardList,
  Stethoscope,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TYPES & CONSTANTS
───────────────────────────────────────────────────────────── */
type SubTabId =
  | "work-queue"
  | "assigned-charts"
  | "priority-queue"
  | "qa-returns"
  | "audit-samples";

const SUBTABS: {
  id: SubTabId;
  label: string;
  icon: React.ElementType;
  count: number;
  urgency?: "error" | "warning";
}[] = [
  { id: "work-queue", label: "Work Queue", icon: LayoutList, count: 24 },
  {
    id: "assigned-charts",
    label: "Assigned Charts",
    icon: FolderOpen,
    count: 8,
  },
  {
    id: "priority-queue",
    label: "Priority Queue",
    icon: Zap,
    count: 3,
    urgency: "error",
  },
  {
    id: "qa-returns",
    label: "QA Returns",
    icon: RotateCcw,
    count: 5,
    urgency: "warning",
  },
  { id: "audit-samples", label: "Audit Samples", icon: ShieldCheck, count: 12 },
];

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */
const assignedCharts = [
  {
    id: "ac-1",
    patient: "Anderson, Jennifer K.",
    memberId: "MBR-789456",
    measure: "CDC",
    measureName: "Comprehensive Diabetes Care",
    assignedDate: "07/15/2025",
    dueDate: "07/31/2025",
    status: "in-progress",
    priority: "high",
    completion: 70,
  },
  {
    id: "ac-2",
    patient: "Williams, David M.",
    memberId: "MBR-667890",
    measure: "CBP",
    measureName: "Controlling High Blood Pressure",
    assignedDate: "07/16/2025",
    dueDate: "07/31/2025",
    status: "not-started",
    priority: "high",
    completion: 0,
  },
  {
    id: "ac-3",
    patient: "Thompson, Sandra A.",
    memberId: "MBR-332178",
    measure: "BCS",
    measureName: "Breast Cancer Screening",
    assignedDate: "07/14/2025",
    dueDate: "07/29/2025",
    status: "in-progress",
    priority: "medium",
    completion: 45,
  },
  {
    id: "ac-4",
    patient: "Martinez, Robert L.",
    memberId: "MBR-445512",
    measure: "COL",
    measureName: "Colorectal Cancer Screening",
    assignedDate: "07/17/2025",
    dueDate: "07/30/2025",
    status: "not-started",
    priority: "medium",
    completion: 0,
  },
  {
    id: "ac-5",
    patient: "Chen, Lisa W.",
    memberId: "MBR-112453",
    measure: "CDC",
    measureName: "Comprehensive Diabetes Care",
    assignedDate: "07/13/2025",
    dueDate: "07/28/2025",
    status: "qa-pending",
    priority: "low",
    completion: 100,
  },
  {
    id: "ac-6",
    patient: "Johnson, Patricia E.",
    memberId: "MBR-998201",
    measure: "CBP",
    measureName: "Controlling High Blood Pressure",
    assignedDate: "07/18/2025",
    dueDate: "08/01/2025",
    status: "not-started",
    priority: "low",
    completion: 0,
  },
  {
    id: "ac-7",
    patient: "Ramirez, Carlos A.",
    memberId: "MBR-554320",
    measure: "AMR",
    measureName: "Medication Management – Asthma",
    assignedDate: "07/12/2025",
    dueDate: "07/27/2025",
    status: "final",
    priority: "low",
    completion: 100,
  },
  {
    id: "ac-8",
    patient: "Kim, Susan Y.",
    memberId: "MBR-771092",
    measure: "CDC",
    measureName: "Comprehensive Diabetes Care",
    assignedDate: "07/19/2025",
    dueDate: "08/02/2025",
    status: "not-started",
    priority: "medium",
    completion: 0,
  },
];

const priorityItems = [
  {
    id: "pq-1",
    patient: "Chen, Lisa W.",
    memberId: "MBR-112453",
    measure: "CDC",
    measureName: "Comprehensive Diabetes Care",
    dueDate: "07/19/2025",
    urgency: "overdue",
    daysLabel: "1 day overdue",
    priority: "critical",
    note: "HbA1c result window closes end of measurement year. NCQA compliance at risk.",
  },
  {
    id: "pq-2",
    patient: "Ramirez, Carlos A.",
    memberId: "MBR-554320",
    measure: "CBP",
    measureName: "Controlling High Blood Pressure",
    dueDate: "07/20/2025",
    urgency: "overdue",
    daysLabel: "Due today",
    priority: "high",
    note: "Denominator validation pending. Provider record fax received this morning.",
  },
  {
    id: "pq-3",
    patient: "Williams, David M.",
    memberId: "MBR-667890",
    measure: "COL",
    measureName: "Colorectal Cancer Screening",
    dueDate: "07/21/2025",
    urgency: "due-soon",
    daysLabel: "Due tomorrow",
    priority: "high",
    note: "Chart received from facility. Screener confirmed 3 pages available for review.",
  },
];

const qaReturns = [
  {
    id: "qr-1",
    patient: "Thompson, Sandra A.",
    memberId: "MBR-332178",
    measure: "CDC",
    measureName: "Comprehensive Diabetes Care",
    returnedDate: "07/18/2025",
    reviewer: "K. Smith, RN",
    reason: "Missing Evidence",
    comment:
      "HbA1c date of service not supported by attached lab report. Please verify page 2.",
    status: "new",
    reworkDue: "07/22/2025",
  },
  {
    id: "qr-2",
    patient: "Martinez, Robert L.",
    memberId: "MBR-445512",
    measure: "CBP",
    measureName: "Controlling High Blood Pressure",
    returnedDate: "07/17/2025",
    reviewer: "K. Smith, RN",
    reason: "Date Discrepancy",
    comment:
      "BP reading date (04/02) does not fall within the valid measurement window per NCQA spec §3.2.",
    status: "new",
    reworkDue: "07/21/2025",
  },
  {
    id: "qr-3",
    patient: "Anderson, Jennifer K.",
    memberId: "MBR-789456",
    measure: "COL",
    measureName: "Colorectal Cancer Screening",
    returnedDate: "07/16/2025",
    reviewer: "J. Torres, CPC",
    reason: "Code Error",
    comment:
      "CPT 45378 documented but no corresponding provider attestation. Recheck exclusion criteria.",
    status: "in-rework",
    reworkDue: "07/23/2025",
  },
  {
    id: "qr-4",
    patient: "Kim, Susan Y.",
    memberId: "MBR-771092",
    measure: "BCS",
    measureName: "Breast Cancer Screening",
    returnedDate: "07/15/2025",
    reviewer: "J. Torres, CPC",
    reason: "Incomplete Abstraction",
    comment:
      "Provider name and NPI fields are blank. Required for hybrid submission.",
    status: "in-rework",
    reworkDue: "07/20/2025",
  },
  {
    id: "qr-5",
    patient: "Johnson, Patricia E.",
    memberId: "MBR-998201",
    measure: "AMR",
    measureName: "Medication Management – Asthma",
    returnedDate: "07/14/2025",
    reviewer: "M. Patel, RHIA",
    reason: "Eligibility Question",
    comment:
      "Enrollment gap detected 04/01–04/18. Confirm gap ≤45 days per NCQA hybrid method.",
    status: "new",
    reworkDue: "07/24/2025",
  },
];

const auditSamples = [
  {
    id: "as-01",
    sampleId: "AUD-2025-0041",
    patient: "Anderson, Jennifer K.",
    memberId: "MBR-789456",
    measure: "CDC",
    sampleType: "Random",
    selectedDate: "07/01/2025",
    auditor: "M. Patel, RHIA",
    status: "pending",
    notes: "Initial review",
  },
  {
    id: "as-02",
    sampleId: "AUD-2025-0042",
    patient: "Williams, David M.",
    memberId: "MBR-667890",
    measure: "CBP",
    sampleType: "Targeted",
    selectedDate: "07/01/2025",
    auditor: "M. Patel, RHIA",
    status: "complete",
    notes: "Passed",
  },
  {
    id: "as-03",
    sampleId: "AUD-2025-0043",
    patient: "Thompson, Sandra A.",
    memberId: "MBR-332178",
    measure: "BCS",
    sampleType: "Random",
    selectedDate: "07/01/2025",
    auditor: "L. Wang, CPC",
    status: "pending",
    notes: "",
  },
  {
    id: "as-04",
    sampleId: "AUD-2025-0044",
    patient: "Martinez, Robert L.",
    memberId: "MBR-445512",
    measure: "COL",
    sampleType: "Random",
    selectedDate: "07/01/2025",
    auditor: "L. Wang, CPC",
    status: "in-review",
    notes: "Discrepancy flagged",
  },
  {
    id: "as-05",
    sampleId: "AUD-2025-0045",
    patient: "Chen, Lisa W.",
    memberId: "MBR-112453",
    measure: "CDC",
    sampleType: "Targeted",
    selectedDate: "07/02/2025",
    auditor: "M. Patel, RHIA",
    status: "complete",
    notes: "Passed",
  },
  {
    id: "as-06",
    sampleId: "AUD-2025-0046",
    patient: "Johnson, Patricia E.",
    memberId: "MBR-998201",
    measure: "AMR",
    sampleType: "Random",
    selectedDate: "07/02/2025",
    auditor: "J. Torres, CPC",
    status: "pending",
    notes: "",
  },
  {
    id: "as-07",
    sampleId: "AUD-2025-0047",
    patient: "Ramirez, Carlos A.",
    memberId: "MBR-554320",
    measure: "CBP",
    sampleType: "Random",
    selectedDate: "07/03/2025",
    auditor: "J. Torres, CPC",
    status: "pending",
    notes: "",
  },
  {
    id: "as-08",
    sampleId: "AUD-2025-0048",
    patient: "Kim, Susan Y.",
    memberId: "MBR-771092",
    measure: "CDC",
    sampleType: "Targeted",
    selectedDate: "07/03/2025",
    auditor: "L. Wang, CPC",
    status: "in-review",
    notes: "Awaiting provider clarification",
  },
  {
    id: "as-09",
    sampleId: "AUD-2025-0049",
    patient: "Nguyen, Thomas H.",
    memberId: "MBR-230187",
    measure: "BCS",
    sampleType: "Random",
    selectedDate: "07/05/2025",
    auditor: "M. Patel, RHIA",
    status: "complete",
    notes: "Passed",
  },
  {
    id: "as-10",
    sampleId: "AUD-2025-0050",
    patient: "Foster, Rebecca M.",
    memberId: "MBR-403922",
    measure: "COL",
    sampleType: "Random",
    selectedDate: "07/05/2025",
    auditor: "J. Torres, CPC",
    status: "pending",
    notes: "",
  },
  {
    id: "as-11",
    sampleId: "AUD-2025-0051",
    patient: "Okafor, Chidi E.",
    memberId: "MBR-661045",
    measure: "CDC",
    sampleType: "Targeted",
    selectedDate: "07/07/2025",
    auditor: "L. Wang, CPC",
    status: "complete",
    notes: "Minor finding",
  },
  {
    id: "as-12",
    sampleId: "AUD-2025-0052",
    patient: "Hernandez, Maria L.",
    memberId: "MBR-887623",
    measure: "CBP",
    sampleType: "Random",
    selectedDate: "07/07/2025",
    auditor: "M. Patel, RHIA",
    status: "pending",
    notes: "",
  },
];

/* ─────────────────────────────────────────────────────────────
   SHARED SMALL COMPONENTS
───────────────────────────────────────────────────────────── */
function MeasureChip({ code }: { code: string }) {
  return (
    <span className="inline-flex items-center justify-center w-10 h-5 bg-secondary/60 text-primary border border-primary/20 rounded text-[10px] font-bold">
      {code}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "not-started": "bg-muted/60 text-muted-foreground border-border",
    "in-progress": "bg-secondary/70 text-primary border-primary/30",
    "qa-pending": "bg-amber-50 text-amber-700 border-amber-300",
    final: "bg-emerald-50 text-emerald-700 border-emerald-300",
    new: "bg-blue-50 text-blue-700 border-blue-200",
    "in-rework": "bg-orange-50 text-orange-700 border-orange-300",
    pending: "bg-muted/60 text-muted-foreground border-border",
    complete: "bg-emerald-50 text-emerald-700 border-emerald-300",
    "in-review": "bg-secondary/70 text-primary border-primary/30",
  };
  const labels: Record<string, string> = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    "qa-pending": "QA Pending",
    final: "Final",
    new: "New Return",
    "in-rework": "In Rework",
    pending: "Pending",
    complete: "Complete",
    "in-review": "In Review",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${map[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function PriorityDot({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-400",
    medium: "bg-amber-400",
    low: "bg-muted-foreground/40",
  };
  return (
    <span
      className={`w-2 h-2 rounded-full flex-shrink-0 ${map[priority] ?? "bg-muted-foreground/40"}`}
    />
  );
}

function SectionHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-base font-bold text-foreground">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div
      className={`bg-card border rounded-xl p-4 flex flex-col gap-1 ${accent ? `border-l-2 ${accent}` : "border-border"}`}
    >
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ASSIGNED CHARTS VIEW
───────────────────────────────────────────────────────────── */
function AssignedChartsView() {
  const inProgress = assignedCharts.filter(
    (c) => c.status === "in-progress",
  ).length;
  const notStarted = assignedCharts.filter(
    (c) => c.status === "not-started",
  ).length;
  const dueThisWeek = assignedCharts.filter(
    (c) => c.dueDate <= "07/31/2025" && c.status !== "final",
  ).length;
  const completed = assignedCharts.filter(
    (c) => c.status === "final" || c.status === "qa-pending",
  ).length;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="My Assigned Charts"
        subtitle="Charts assigned to you for abstraction in the current measurement year"
      >
        <button className="btn-outline text-xs px-3 py-1.5 gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filter
        </button>
        <button className="btn-primary text-xs px-3 py-1.5 gap-1.5">
          <ArrowUpRight className="w-3.5 h-3.5" />
          Open Next Chart
        </button>
      </SectionHeader>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Assigned"
          value={assignedCharts.length}
          sub="HEDIS MY 2025"
        />
        <StatCard
          label="Due This Week"
          value={dueThisWeek}
          sub="by 07/31/2025"
          accent="border-l-primary"
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          sub="abstraction open"
        />
        <StatCard label="Completed" value={completed} sub="submitted / QA" />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Patient
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Measure
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Assigned
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Due Date
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Progress
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {assignedCharts.map((chart) => (
              <tr
                key={chart.id}
                className="hover:bg-muted/10 transition-colors group"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <PriorityDot priority={chart.priority} />
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {chart.patient}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {chart.memberId}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <MeasureChip code={chart.measure} />
                    <span className="text-[11px] text-muted-foreground hidden xl:block truncate max-w-[160px]">
                      {chart.measureName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {chart.assignedDate}
                  </div>
                </td>
                <td className="px-4 py-3 text-[11px] whitespace-nowrap">
                  <div
                    className={`flex items-center gap-1 font-medium ${chart.dueDate <= "07/25/2025" && chart.status !== "final" ? "text-amber-600" : "text-foreground"}`}
                  >
                    <Clock className="w-3 h-3" />
                    {chart.dueDate}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {chart.completion > 0 ? (
                    <div className="flex items-center gap-2 min-w-[80px]">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${chart.status === "final" ? "bg-emerald-500" : chart.status === "qa-pending" ? "bg-amber-400" : "bg-primary"}`}
                          style={{ width: `${chart.completion}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">
                        {chart.completion}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={chart.status} />
                </td>
                <td className="px-4 py-3">
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
  );
}

/* ─────────────────────────────────────────────────────────────
   PRIORITY QUEUE VIEW
───────────────────────────────────────────────────────────── */
function PriorityQueueView() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Priority Queue"
        subtitle="Urgent and overdue items requiring immediate attention"
      >
        <button className="btn-primary text-xs px-3 py-1.5 gap-1.5">
          <Zap className="w-3.5 h-3.5" />
          Start Urgent Review
        </button>
      </SectionHeader>

      {/* Alert banner */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-sm font-bold text-red-800">
            {priorityItems.filter((i) => i.urgency === "overdue").length} charts
            are overdue
          </div>
          <p className="text-[11px] text-red-700 mt-0.5">
            These charts have passed their abstraction deadline. NCQA compliance
            may be affected if not completed today.
          </p>
        </div>
      </div>

      {/* Priority cards */}
      <div className="space-y-3">
        {priorityItems.map((item) => (
          <div
            key={item.id}
            className={`bg-card border rounded-xl p-5 flex items-start gap-5 ${
              item.urgency === "overdue"
                ? "border-red-200 shadow-sm"
                : "border-amber-200"
            }`}
          >
            {/* Urgency indicator */}
            <div
              className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 rounded-xl border ${
                item.urgency === "overdue"
                  ? "bg-red-50 border-red-200"
                  : "bg-amber-50 border-amber-200"
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 mb-1 ${item.urgency === "overdue" ? "text-red-600" : "text-amber-600"}`}
              />
              <span
                className={`text-[9px] font-bold uppercase text-center leading-tight px-1 ${
                  item.urgency === "overdue" ? "text-red-700" : "text-amber-700"
                }`}
              >
                {item.urgency === "overdue" ? "Over\nDue" : "Due\nSoon"}
              </span>
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <span className="text-sm font-bold text-foreground">
                      {item.patient}
                    </span>
                    <MeasureChip code={item.measure} />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {item.memberId} · {item.measureName}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div
                    className={`flex items-center gap-1.5 text-xs font-bold ${item.urgency === "overdue" ? "text-red-700" : "text-amber-700"}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {item.daysLabel}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Deadline: {item.dueDate}
                  </div>
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg border border-border">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {item.note}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="flex-shrink-0 flex flex-col gap-2">
              <button className="btn-primary text-xs px-4 py-2 gap-1.5 whitespace-nowrap">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Open Chart
              </button>
              <button className="btn-outline text-xs px-4 py-2 gap-1.5 whitespace-nowrap">
                <MoreHorizontal className="w-3.5 h-3.5" />
                Actions
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No more items */}
      <div className="flex items-center justify-center gap-2 py-5 text-[11px] text-muted-foreground border border-dashed border-border rounded-xl bg-muted/10">
        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        No additional priority items beyond the {priorityItems.length} listed
        above
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   QA RETURNS VIEW
───────────────────────────────────────────────────────────── */
function QAReturnsView() {
  const newReturns = qaReturns.filter((r) => r.status === "new").length;
  const inRework = qaReturns.filter((r) => r.status === "in-rework").length;

  const reasonColors: Record<string, string> = {
    "Missing Evidence": "bg-red-50 text-red-700 border-red-200",
    "Date Discrepancy": "bg-amber-50 text-amber-700 border-amber-200",
    "Code Error": "bg-orange-50 text-orange-700 border-orange-200",
    "Incomplete Abstraction": "bg-purple-50 text-purple-700 border-purple-200",
    "Eligibility Question": "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="QA Returns"
        subtitle="Charts returned by reviewers requiring corrections before re-submission"
      >
        <button className="btn-outline text-xs px-3 py-1.5 gap-1.5">
          <Filter className="w-3.5 h-3.5" />
          Filter by Reason
        </button>
        <button className="btn-primary text-xs px-3 py-1.5 gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Start Rework
        </button>
      </SectionHeader>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Returns"
          value={qaReturns.length}
          sub="this cycle"
        />
        <StatCard
          label="New Returns"
          value={newReturns}
          sub="need rework"
          accent="border-l-red-400"
        />
        <StatCard
          label="In Rework"
          value={inRework}
          sub="being corrected"
          accent="border-l-amber-400"
        />
        <StatCard label="Avg. Rework Due" value="3 days" sub="remaining avg." />
      </div>

      {/* Return items */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="divide-y divide-border">
          {qaReturns.map((item) => (
            <div
              key={item.id}
              className="p-4 hover:bg-muted/10 transition-colors group"
            >
              <div className="flex items-start gap-4">
                {/* Left: status + patient info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-sm font-bold text-foreground">
                      {item.patient}
                    </span>
                    <MeasureChip code={item.measure} />
                    <StatusBadge status={item.status} />
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${reasonColors[item.reason] ?? "bg-muted text-muted-foreground border-border"}`}
                    >
                      {item.reason}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="font-mono">{item.memberId}</span>
                    <span>·</span>
                    <span>{item.measureName}</span>
                  </div>
                  {/* Reviewer comment */}
                  <div className="flex items-start gap-2 p-3 bg-muted/20 border border-border rounded-lg">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-muted-foreground mb-0.5">
                        {item.reviewer} commented:
                      </div>
                      <p className="text-[11px] text-foreground leading-relaxed">
                        {item.comment}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: dates + actions */}
                <div className="flex-shrink-0 text-right space-y-2">
                  <div className="text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1 justify-end">
                      <RotateCcw className="w-3 h-3" />
                      Returned {item.returnedDate}
                    </div>
                    <div className="flex items-center gap-1 justify-end mt-0.5 text-amber-600 font-medium">
                      <Clock className="w-3 h-3" />
                      Rework due {item.reworkDue}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="btn-primary text-[11px] px-3 py-1.5 gap-1.5">
                      <RefreshCw className="w-3 h-3" />
                      Rework
                    </button>
                    <button className="btn-outline text-[11px] px-3 py-1.5 gap-1.5">
                      <FileText className="w-3 h-3" />
                      View
                    </button>
                  </div>
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
   AUDIT SAMPLES VIEW
───────────────────────────────────────────────────────────── */
function AuditSamplesView() {
  const pending = auditSamples.filter((s) => s.status === "pending").length;
  const inReview = auditSamples.filter((s) => s.status === "in-review").length;
  const complete = auditSamples.filter((s) => s.status === "complete").length;
  const targetedCt = auditSamples.filter(
    (s) => s.sampleType === "Targeted",
  ).length;

  const statusAuditColor: Record<string, string> = {
    pending: "bg-muted/60 text-muted-foreground border-border",
    "in-review": "bg-secondary/70 text-primary border-primary/30",
    complete: "bg-emerald-50 text-emerald-700 border-emerald-300",
  };

  return (
    <div className="space-y-5">
      <SectionHeader
        title="NCQA Audit Samples"
        subtitle="Charts randomly and systematically selected for the HEDIS audit cycle"
      >
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary/50 border border-primary/20 rounded-lg text-[11px] text-primary font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          HEDIS MY 2025 · NCQA Hybrid
        </span>
        <button className="btn-outline text-xs px-3 py-1.5 gap-1.5">
          <TrendingUp className="w-3.5 h-3.5" />
          Export Report
        </button>
      </SectionHeader>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Total Sampled"
          value={auditSamples.length}
          sub="this audit cycle"
        />
        <StatCard
          label="Pending Review"
          value={pending}
          sub="awaiting auditor"
          accent="border-l-primary"
        />
        <StatCard label="In Review" value={inReview} sub="auditor assigned" />
        <StatCard
          label="Complete"
          value={complete}
          sub={`of ${auditSamples.length} samples`}
          accent="border-l-emerald-500"
        />
      </div>

      {/* Sample breakdown pills */}
      <div className="flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-xl text-[11px]">
        <ShieldCheck className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        <span className="text-muted-foreground">Sample breakdown:</span>
        <span className="font-semibold text-foreground">
          {auditSamples.length - targetedCt} Random
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="font-semibold text-foreground">
          {targetedCt} Targeted
        </span>
        <span className="text-muted-foreground ml-2">·</span>
        <span className="text-muted-foreground ml-0.5">Completion rate:</span>
        <span className="font-semibold text-emerald-700">
          {Math.round((complete / auditSamples.length) * 100)}%
        </span>
        <div className="flex-1 mx-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${(complete / auditSamples.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Sample ID
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Patient
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Measure
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Type
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Selected
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Auditor
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Status
              </th>
              <th className="text-left px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                Notes
              </th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {auditSamples.map((sample) => (
              <tr
                key={sample.id}
                className="hover:bg-muted/10 transition-colors group"
              >
                <td className="px-4 py-3">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {sample.sampleId}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm font-semibold text-foreground">
                    {sample.patient}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {sample.memberId}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <MeasureChip code={sample.measure} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${sample.sampleType === "Targeted" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-muted text-muted-foreground border-border"}`}
                  >
                    {sample.sampleType}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {sample.selectedDate}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <User className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate max-w-[130px]">
                      {sample.auditor}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-semibold ${statusAuditColor[sample.status] ?? "bg-muted text-muted-foreground border-border"}`}
                  >
                    {sample.status === "in-review"
                      ? "In Review"
                      : sample.status.charAt(0).toUpperCase() +
                        sample.status.slice(1)}
                  </span>
                </td>
                <td className="px-4 py-3 text-[11px] text-muted-foreground max-w-[140px]">
                  {sample.notes ? (
                    <span
                      className={
                        sample.notes.toLowerCase().includes("flag") ||
                        sample.notes.toLowerCase().includes("finding")
                          ? "text-amber-600 font-medium"
                          : ""
                      }
                    >
                      {sample.notes}
                    </span>
                  ) : (
                    <span className="text-muted-foreground/50">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1 text-[11px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Review <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   SUBTAB CONTENT ROUTER
───────────────────────────────────────────────────────────── */
function SubtabContent({ activeSubTab }: { activeSubTab: SubTabId }) {
  switch (activeSubTab) {
    case "assigned-charts":
      return <AssignedChartsView />;
    case "priority-queue":
      return <PriorityQueueView />;
    case "qa-returns":
      return <QAReturnsView />;
    case "audit-samples":
      return <AuditSamplesView />;
    default:
      return null;
  }
}

/* ─────────────────────────────────────────────────────────────
   MAIN EXPORT — WorkspaceSubtabs wrapper
───────────────────────────────────────────────────────────── */
export function WorkspaceSubtabs({
  children,
  activeView,
}: {
  children: React.ReactNode;
  activeView: string;
}) {
  const [activeSubTab, setActiveSubTab] = useState<SubTabId>("work-queue");

  // Reset to Work Queue whenever the left-nav view changes
  useEffect(() => {
    setActiveSubTab("work-queue");
  }, [activeView]);

  return (
    <div className="flex flex-col h-full">
      {/* ── Content Area ── */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Subtab bar */}
        <div className="flex-shrink-0 bg-card border-b border-border px-6"></div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto">
            {activeSubTab === "work-queue" ? (
              children
            ) : (
              <SubtabContent activeSubTab={activeSubTab} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
