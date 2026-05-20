import { useState } from "react";
import type { ElementType } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import {
  FlaskConical,
  BarChart3,
  ClipboardList,
  Package,
  Lock,
  Download,
  Search,
  Filter,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Plus,
  RefreshCcw,
  Eye,
  FileText,
  Calendar,
  Clock,
  User,
  Users,
  Shuffle,
  Shield,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Trash2,
  ArrowUpRight,
  Upload,
  Hash,
  Layers,
  Settings,
  LockKeyhole,
  LockKeyholeOpen,
  History,
  FilePlus,
  FileDown,
  AlertCircle,
  CircleAlert,
  Hourglass,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Printer,
  Send,
  RotateCcw,
  Star,
  Activity,
  Target,
  Award,
  TrendingUp,
  BookOpen,
  Pencil,
  Copy,
  MoreHorizontal,
  Paperclip,
} from "lucide-react";

type TabId =
  | "sample-selection"
  | "oversampling"
  | "audit-tracker"
  | "packet-builder"
  | "submission-lock"
  | "export-history";
type LockStatus = "locked" | "unlocked" | "pending-attestation";
type AuditStatus =
  | "not-started"
  | "in-progress"
  | "complete"
  | "overdue"
  | "on-hold";
type Priority = "critical" | "high" | "medium" | "low";

/* ─────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────── */

const MEASURES = [
  "CDC",
  "CBP",
  "BCS",
  "COL",
  "AMR",
  "W34",
  "FUH",
  "AWC",
  "ADD",
];
const PRODUCT_LINES = ["Medicare", "Commercial", "Medicaid"];

const sampleMembers = [
  {
    id: "MBR-789456",
    name: "Anderson, Jennifer K.",
    dob: "06/14/1959",
    age: 65,
    product: "Medicare",
    eligible: true,
    selected: true,
    stratum: "Age 65–70",
  },
  {
    id: "MBR-234891",
    name: "Nguyen, Robert T.",
    dob: "03/22/1951",
    age: 73,
    product: "Medicare",
    eligible: true,
    selected: true,
    stratum: "Age 71–75",
  },
  {
    id: "MBR-567123",
    name: "Williams, Sandra B.",
    dob: "11/08/1962",
    age: 62,
    product: "Commercial",
    eligible: true,
    selected: false,
    stratum: "Age 55–65",
  },
  {
    id: "MBR-112334",
    name: "Martinez, Carlos R.",
    dob: "07/30/1948",
    age: 76,
    product: "Medicaid",
    eligible: false,
    selected: false,
    stratum: "Age 76+",
  },
  {
    id: "MBR-889043",
    name: "Johnson, Patricia A.",
    dob: "09/12/1955",
    age: 69,
    product: "Medicare",
    eligible: true,
    selected: true,
    stratum: "Age 65–70",
  },
  {
    id: "MBR-344782",
    name: "Davis, Thomas W.",
    dob: "02/19/1967",
    age: 58,
    product: "Commercial",
    eligible: true,
    selected: true,
    stratum: "Age 55–65",
  },
  {
    id: "MBR-667234",
    name: "Wilson, Grace M.",
    dob: "05/03/1950",
    age: 74,
    product: "Medicare",
    eligible: true,
    selected: false,
    stratum: "Age 71–75",
  },
  {
    id: "MBR-451287",
    name: "Brown, Michael S.",
    dob: "12/27/1958",
    age: 66,
    product: "Medicaid",
    eligible: true,
    selected: true,
    stratum: "Age 65–70",
  },
  {
    id: "MBR-990123",
    name: "Taylor, Helen R.",
    dob: "08/14/1953",
    age: 71,
    product: "Commercial",
    eligible: true,
    selected: false,
    stratum: "Age 71–75",
  },
  {
    id: "MBR-223344",
    name: "Clark, David J.",
    dob: "01/05/1960",
    age: 65,
    product: "Medicare",
    eligible: true,
    selected: true,
    stratum: "Age 65–70",
  },
];

const oversampleReplacements = [
  {
    id: "rep-001",
    originalId: "MBR-112334",
    originalName: "Martinez, Carlos R.",
    replacementId: "MBR-556677",
    replacementName: "Harris, Evelyn M.",
    reason: "Ineligible — Age > 75",
    replacedBy: "Torres, Maria",
    replacedAt: "07/18/2025",
    status: "active",
  },
  {
    id: "rep-002",
    originalId: "MBR-667234",
    originalName: "Wilson, Grace M.",
    replacementId: "MBR-778899",
    replacementName: "Lewis, Raymond T.",
    reason: "Non-responder — record unavailable",
    replacedBy: "Kim, Jenny",
    replacedAt: "07/19/2025",
    status: "active",
  },
  {
    id: "rep-003",
    originalId: "MBR-990123",
    originalName: "Taylor, Helen R.",
    replacementId: "MBR-334455",
    replacementName: "Robinson, Clara B.",
    reason: "Disenrolled during measurement year",
    replacedBy: "Patel, Ravi",
    replacedAt: "07/20/2025",
    status: "active",
  },
];

const auditItems = [
  {
    id: "AUD-001",
    caseRef: "CASE-20250721-0042",
    member: "Anderson, Jennifer K.",
    memberId: "MBR-789456",
    measure: "CDC",
    product: "Medicare",
    assignedTo: "Torres, Maria",
    dueDate: "07/25/2025",
    status: "in-progress" as AuditStatus,
    completion: 60,
    priority: "high" as Priority,
    documentsReady: true,
  },
  {
    id: "AUD-002",
    caseRef: "CASE-20250721-0039",
    member: "Nguyen, Robert T.",
    memberId: "MBR-234891",
    measure: "CBP",
    product: "Medicare",
    assignedTo: "Patel, Ravi",
    dueDate: "07/24/2025",
    status: "overdue" as AuditStatus,
    completion: 30,
    priority: "critical" as Priority,
    documentsReady: false,
  },
  {
    id: "AUD-003",
    caseRef: "CASE-20250720-0031",
    member: "Williams, Sandra B.",
    memberId: "MBR-567123",
    measure: "BCS",
    product: "Commercial",
    assignedTo: "Kim, Jenny",
    dueDate: "07/26/2025",
    status: "complete" as AuditStatus,
    completion: 100,
    priority: "medium" as Priority,
    documentsReady: true,
  },
  {
    id: "AUD-004",
    caseRef: "CASE-20250720-0028",
    member: "Martinez, Carlos R.",
    memberId: "MBR-112334",
    measure: "COL",
    product: "Medicaid",
    assignedTo: "Torres, Maria",
    dueDate: "07/28/2025",
    status: "not-started" as AuditStatus,
    completion: 0,
    priority: "medium" as Priority,
    documentsReady: false,
  },
  {
    id: "AUD-005",
    caseRef: "CASE-20250719-0019",
    member: "Johnson, Patricia A.",
    memberId: "MBR-889043",
    measure: "AMR",
    product: "Medicaid",
    assignedTo: "Okonkwo, Emeka",
    dueDate: "07/23/2025",
    status: "on-hold" as AuditStatus,
    completion: 45,
    priority: "high" as Priority,
    documentsReady: true,
  },
  {
    id: "AUD-006",
    caseRef: "CASE-20250719-0015",
    member: "Davis, Thomas W.",
    memberId: "MBR-344782",
    measure: "CDC",
    product: "Commercial",
    assignedTo: "Kim, Jenny",
    dueDate: "07/27/2025",
    status: "in-progress" as AuditStatus,
    completion: 80,
    priority: "low" as Priority,
    documentsReady: true,
  },
  {
    id: "AUD-007",
    caseRef: "CASE-20250718-0008",
    member: "Wilson, Grace M.",
    memberId: "MBR-667234",
    measure: "CBP",
    product: "Medicare",
    assignedTo: "Patel, Ravi",
    dueDate: "07/22/2025",
    status: "complete" as AuditStatus,
    completion: 100,
    priority: "high" as Priority,
    documentsReady: true,
  },
  {
    id: "AUD-008",
    caseRef: "CASE-20250718-0005",
    member: "Brown, Michael S.",
    memberId: "MBR-451287",
    measure: "BCS",
    product: "Medicaid",
    assignedTo: "Okonkwo, Emeka",
    dueDate: "07/29/2025",
    status: "not-started" as AuditStatus,
    completion: 0,
    priority: "low" as Priority,
    documentsReady: false,
  },
];

const packetMembers = [
  {
    id: "MBR-789456",
    name: "Anderson, Jennifer K.",
    measure: "CDC",
    docs: {
      coverSheet: true,
      eligibility: true,
      progressNotes: true,
      labReports: true,
      claimsData: true,
      providerAttestation: false,
    },
    status: "incomplete",
  },
  {
    id: "MBR-234891",
    name: "Nguyen, Robert T.",
    measure: "CBP",
    docs: {
      coverSheet: true,
      eligibility: true,
      progressNotes: false,
      labReports: false,
      claimsData: true,
      providerAttestation: false,
    },
    status: "incomplete",
  },
  {
    id: "MBR-889043",
    name: "Johnson, Patricia A.",
    measure: "AMR",
    docs: {
      coverSheet: true,
      eligibility: true,
      progressNotes: true,
      labReports: true,
      claimsData: true,
      providerAttestation: true,
    },
    status: "complete",
  },
  {
    id: "MBR-344782",
    name: "Davis, Thomas W.",
    measure: "CDC",
    docs: {
      coverSheet: true,
      eligibility: true,
      progressNotes: true,
      labReports: true,
      claimsData: true,
      providerAttestation: true,
    },
    status: "complete",
  },
  {
    id: "MBR-451287",
    name: "Brown, Michael S.",
    measure: "BCS",
    docs: {
      coverSheet: false,
      eligibility: false,
      progressNotes: false,
      labReports: false,
      claimsData: false,
      providerAttestation: false,
    },
    status: "not-started",
  },
];

const lockRows = [
  {
    measure: "CDC",
    product: "Medicare",
    denominator: 411,
    sampled: 82,
    audited: 76,
    status: "locked" as LockStatus,
    lockedBy: "Chen, Lisa",
    lockedAt: "07/20/2025 3:14 PM",
    validationPassed: true,
  },
  {
    measure: "CDC",
    product: "Commercial",
    denominator: 289,
    sampled: 58,
    audited: 58,
    status: "pending-attestation" as LockStatus,
    lockedBy: "",
    lockedAt: "",
    validationPassed: true,
  },
  {
    measure: "CBP",
    product: "Medicare",
    denominator: 334,
    sampled: 67,
    audited: 52,
    status: "unlocked" as LockStatus,
    lockedBy: "",
    lockedAt: "",
    validationPassed: false,
  },
  {
    measure: "CBP",
    product: "Medicaid",
    denominator: 178,
    sampled: 36,
    audited: 36,
    status: "locked" as LockStatus,
    lockedBy: "Chen, Lisa",
    lockedAt: "07/19/2025 11:00 AM",
    validationPassed: true,
  },
  {
    measure: "BCS",
    product: "Medicare",
    denominator: 512,
    sampled: 103,
    audited: 103,
    status: "locked" as LockStatus,
    lockedBy: "Admin",
    lockedAt: "07/18/2025 9:45 AM",
    validationPassed: true,
  },
  {
    measure: "BCS",
    product: "Commercial",
    denominator: 245,
    sampled: 49,
    audited: 41,
    status: "unlocked" as LockStatus,
    lockedBy: "",
    lockedAt: "",
    validationPassed: false,
  },
  {
    measure: "COL",
    product: "Medicaid",
    denominator: 198,
    sampled: 40,
    audited: 40,
    status: "pending-attestation" as LockStatus,
    lockedBy: "",
    lockedAt: "",
    validationPassed: true,
  },
  {
    measure: "AMR",
    product: "Commercial",
    denominator: 142,
    sampled: 29,
    audited: 22,
    status: "unlocked" as LockStatus,
    lockedBy: "",
    lockedAt: "",
    validationPassed: false,
  },
];

const exportHistory = [
  {
    id: "EXP-2025-0091",
    type: "Sample List",
    measure: "CDC",
    productLine: "Medicare",
    exportedBy: "Chen, Lisa",
    exportedAt: "07/21/2025 2:34 PM",
    format: "CSV",
    records: 82,
    hipaaCompliant: true,
    status: "complete",
    fileSize: "48 KB",
  },
  {
    id: "EXP-2025-0090",
    type: "Audit Packet",
    measure: "BCS",
    productLine: "Medicare",
    exportedBy: "Torres, Maria",
    exportedAt: "07/20/2025 11:15 AM",
    format: "PDF",
    records: 103,
    hipaaCompliant: true,
    status: "complete",
    fileSize: "14.2 MB",
  },
  {
    id: "EXP-2025-0089",
    type: "Discrepancy Report",
    measure: "CBP",
    productLine: "All",
    exportedBy: "Kim, Jenny",
    exportedAt: "07/19/2025 4:00 PM",
    format: "XLSX",
    records: 67,
    hipaaCompliant: true,
    status: "complete",
    fileSize: "210 KB",
  },
  {
    id: "EXP-2025-0088",
    type: "HEDIS Submission File",
    measure: "All",
    productLine: "Medicare",
    exportedBy: "Admin",
    exportedAt: "07/18/2025 9:00 AM",
    format: "XML",
    records: 1842,
    hipaaCompliant: true,
    status: "complete",
    fileSize: "3.8 MB",
  },
  {
    id: "EXP-2025-0087",
    type: "Sample List",
    measure: "AMR",
    productLine: "Commercial",
    exportedBy: "Patel, Ravi",
    exportedAt: "07/17/2025 3:20 PM",
    format: "CSV",
    records: 29,
    hipaaCompliant: true,
    status: "complete",
    fileSize: "18 KB",
  },
  {
    id: "EXP-2025-0086",
    type: "Audit Packet",
    measure: "COL",
    productLine: "Medicaid",
    exportedBy: "Chen, Lisa",
    exportedAt: "07/16/2025 10:45 AM",
    format: "PDF",
    records: 40,
    hipaaCompliant: true,
    status: "failed",
    fileSize: "—",
  },
  {
    id: "EXP-2025-0085",
    type: "Oversampling Report",
    measure: "CDC",
    productLine: "All",
    exportedBy: "Torres, Maria",
    exportedAt: "07/15/2025 1:30 PM",
    format: "XLSX",
    records: 12,
    hipaaCompliant: true,
    status: "complete",
    fileSize: "95 KB",
  },
  {
    id: "EXP-2025-0084",
    type: "Lock Status Report",
    measure: "All",
    productLine: "All",
    exportedBy: "Admin",
    exportedAt: "07/14/2025 5:00 PM",
    format: "PDF",
    records: 0,
    hipaaCompliant: false,
    status: "complete",
    fileSize: "320 KB",
  },
];

/* ─────────────────────────────────────────────────────────────
   SHARED BADGES
───────────────────────────────────────────────────────────── */
function PriorityBadge({ p }: { p: Priority }) {
  const s: Record<Priority, string> = {
    critical: "bg-red-100 text-red-800 border-red-300",
    high: "bg-orange-100 text-orange-800 border-orange-300",
    medium: "bg-amber-100 text-amber-800 border-amber-300",
    low: "bg-blue-100 text-blue-800 border-blue-300",
  };
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide ${s[p]}`}
    >
      {p}
    </span>
  );
}
function AuditStatusBadge({ s }: { s: AuditStatus }) {
  const map: Record<AuditStatus, { style: string; label: string }> = {
    "not-started": {
      style: "bg-gray-100 text-gray-600 border-gray-300",
      label: "Not Started",
    },
    "in-progress": {
      style: "bg-blue-50 text-blue-700 border-blue-300",
      label: "In Progress",
    },
    complete: {
      style: "bg-emerald-50 text-emerald-700 border-emerald-300",
      label: "Complete",
    },
    overdue: {
      style: "bg-red-50 text-red-700 border-red-300",
      label: "Overdue",
    },
    "on-hold": {
      style: "bg-purple-50 text-purple-700 border-purple-300",
      label: "On Hold",
    },
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${map[s].style}`}
    >
      {map[s].label}
    </span>
  );
}
function LockBadge({ s }: { s: LockStatus }) {
  const map: Record<
    LockStatus,
    { style: string; label: string; icon: ElementType }
  > = {
    locked: {
      style: "bg-emerald-50 text-emerald-700 border-emerald-300",
      label: "Locked",
      icon: LockKeyhole,
    },
    unlocked: {
      style: "bg-gray-100 text-gray-600 border-gray-300",
      label: "Unlocked",
      icon: LockKeyholeOpen,
    },
    "pending-attestation": {
      style: "bg-amber-50 text-amber-700 border-amber-300",
      label: "Pending Attestation",
      icon: Hourglass,
    },
  };
  const Icon = map[s].icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${map[s].style}`}
    >
      <Icon className="w-3 h-3" />
      {map[s].label}
    </span>
  );
}
function DocCheck({ ok }: { ok: boolean }) {
  return ok ? (
    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
  ) : (
    <CircleAlert className="w-4 h-4 text-gray-300" />
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB 1 — SAMPLE SELECTION
───────────────────────────────────────────────────────────── */
function SampleSelectionTab() {
  const [measure, setMeasure] = useState("CDC");
  const [product, setProduct] = useState("Medicare");
  const [method, setMethod] = useState<"random" | "stratified" | "systematic">(
    "stratified",
  );
  const [seed, setSeed] = useState("42891");
  const [samplePct, setSamplePct] = useState(20);
  const [search, setSearch] = useState("");
  const [members, setMembers] = useState(sampleMembers);
  const [generated, setGenerated] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const { canEdit, hasPermission } = usePermissions();

  const selected = members.filter((m) => m.selected);
  const denominator = members.filter((m) => m.eligible).length;
  const required = Math.ceil(denominator * (samplePct / 100));

  const toggleMember = (id: string) =>
    setMembers((p) =>
      p.map((m) => (m.id === id ? { ...m, selected: !m.selected } : m)),
    );

  const filtered = members.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.id.includes(search),
  );

  return (
    <div className="space-y-5">
      {/* Config Panel */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/30 flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            Sample Configuration
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground font-medium">
            MY 2025 · NCQA Hybrid Methodology
          </span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Measure
              </label>
              <select
                value={measure}
                onChange={(e) => setMeasure(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {MEASURES.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Product Line
              </label>
              <select
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PRODUCT_LINES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Sampling Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as typeof method)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="random">Simple Random</option>
                <option value="stratified">Stratified Random</option>
                <option value="systematic">Systematic</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Random Seed
              </label>
              <input
                type="text"
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring font-mono"
              />
            </div>
          </div>

          {/* Stratification options */}
          {method === "stratified" && (
            <div className="mb-4 p-3 bg-secondary/50 border border-primary/20 rounded-lg">
              <div className="text-xs font-bold text-primary mb-2">
                Stratification Criteria
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  ["Age Group", true],
                  ["Gender", false],
                  ["Product Line", true],
                  ["Geographic Region", false],
                  ["Risk Score", false],
                ].map(([label, checked]) => (
                  <label
                    key={label as string}
                    className="flex items-center gap-1.5 text-xs text-primary cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      defaultChecked={checked as boolean}
                      className="accent-primary"
                    />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Sample size slider */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs font-bold text-muted-foreground block mb-1.5">
                Sample Rate: <span className="text-primary">{samplePct}%</span>{" "}
                of eligible denominator
              </label>
              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={samplePct}
                onChange={(e) => setSamplePct(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                <span>5%</span>
                <span>NCQA Minimum: 20%</span>
                <span>100%</span>
              </div>
            </div>
            {canEdit("Auditing") && (
              <button
                onClick={() => setGenerated(true)}
                className="btn-primary text-xs px-4 py-2.5 whitespace-nowrap flex-shrink-0"
              >
                <Shuffle className="w-3.5 h-3.5" /> Generate Sample
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Summary */}
      {generated && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "Eligible Denominator",
              value: denominator,
              sub: `${measure} · ${product}`,
              color: "text-foreground",
              bg: "bg-card border-border",
            },
            {
              label: "Required Sample",
              value: required,
              sub: `≥${samplePct}% of denominator`,
              color: "text-primary",
              bg: "bg-secondary/50 border-primary/20",
            },
            {
              label: "Currently Selected",
              value: selected.length,
              sub: `${Math.round((selected.length / denominator) * 100)}% of denominator`,
              color:
                selected.length >= required
                  ? "text-emerald-700"
                  : "text-red-600",
              bg:
                selected.length >= required
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200",
            },
            {
              label: "Ineligible / Excluded",
              value: members.filter((m) => !m.eligible).length,
              sub: "Removed from pool",
              color: "text-amber-700",
              bg: "bg-amber-50 border-amber-200",
            },
          ].map((s) => (
            <div key={s.label} className={`border rounded-xl p-4 ${s.bg}`}>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs font-semibold text-foreground mt-0.5">
                {s.label}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {s.sub}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Member Table */}
      {generated && (
        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-3">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">
              Sample Frame — {measure} · {product}
            </span>
            <span className="ml-auto text-[11px] text-muted-foreground">
              {selected.length} selected of {members.length} total
            </span>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search members…"
                className="pl-8 pr-3 py-1.5 border border-border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-ring w-48"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-4 py-3 w-10">
                    <input type="checkbox" className="accent-primary" />
                  </th>
                  {[
                    "Member ID",
                    "Name",
                    "DOB / Age",
                    "Product",
                    "Stratum",
                    "Eligible",
                    "In Sample",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr
                    key={m.id}
                    className={`border-b border-border transition-colors ${m.selected ? "bg-accent/40" : "hover:bg-muted/30"} ${!m.eligible ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-2.5">
                      <input
                        type="checkbox"
                        checked={m.selected}
                        onChange={() => toggleMember(m.id)}
                        disabled={!m.eligible}
                        className="accent-primary"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-mono font-semibold text-primary">
                        {m.id}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs font-semibold text-foreground">
                        {m.name}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="text-xs text-foreground">{m.dob}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Age {m.age}
                      </div>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                        {m.product}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">
                        {m.stratum}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {m.eligible ? (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] text-red-600 font-semibold">
                          <X className="w-3.5 h-3.5" />
                          No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {m.selected ? (
                        <span className="flex items-center gap-1 text-[11px] text-primary font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          Selected
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {selected.length} selected
              </span>
              {selected.length < required && (
                <span className="flex items-center gap-1 text-amber-600 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Need {required - selected.length} more to meet minimum
                </span>
              )}
              {selected.length >= required && (
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Minimum sample met
                </span>
              )}
            </div>
            <div className="flex gap-2">
              {hasPermission("Auditing", "export") && (
                <button className="btn-outline text-xs px-3 py-1.5">
                  <FileDown className="w-3.5 h-3.5" /> Export Sample
                </button>
              )}
              {canEdit("Auditing") && (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={selected.length < required}
                  className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Confirm Sample
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Confirm Sample Selection
              </h3>
              <button onClick={() => setShowConfirm(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-secondary/50 border border-primary/20 rounded-lg space-y-2 text-sm">
                {[
                  ["Measure", `${measure} · ${product}`],
                  [
                    "Methodology",
                    method.charAt(0).toUpperCase() +
                      method.slice(1) +
                      " Random",
                  ],
                  ["Random Seed", seed],
                  ["Sample Size", `${selected.length} members`],
                  [
                    "Sample Rate",
                    `${Math.round((selected.length / denominator) * 100)}%`,
                  ],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-bold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Once confirmed, the sample will be locked for audit use.
                  Changes require supervisor approval and will be logged in the
                  audit trail.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="btn-primary text-sm px-5 py-2"
              >
                <ShieldCheck className="w-4 h-4" /> Confirm &amp; Lock Sample
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB 2 — OVERSAMPLING
───────────────────────────────────────────────────────────── */
function OversamplingTab() {
  const [showAddReplacement, setShowAddReplacement] = useState(false);
  const { canEdit } = usePermissions();
  const [form, setForm] = useState({
    originalId: "",
    reason: "",
    replacementId: "",
  });

  const oversampleConfig = [
    {
      measure: "CDC",
      product: "Medicare",
      base: 82,
      pct: 15,
      oversample: 12,
      used: 3,
      remaining: 9,
    },
    {
      measure: "CBP",
      product: "Medicare",
      base: 67,
      pct: 15,
      oversample: 10,
      used: 2,
      remaining: 8,
    },
    {
      measure: "BCS",
      product: "Medicare",
      base: 103,
      pct: 10,
      oversample: 10,
      used: 0,
      remaining: 10,
    },
    {
      measure: "COL",
      product: "Medicaid",
      base: 40,
      pct: 20,
      oversample: 8,
      used: 1,
      remaining: 7,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Oversampling Management
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Configure and track oversample pools used as replacements when
            primary sample members are unavailable
          </p>
        </div>
        <button
          onClick={() => setShowAddReplacement(true)}
          className="btn-primary text-xs px-3 py-2"
        >
          <Plus className="w-3.5 h-3.5" /> Add Replacement
        </button>
      </div>

      {/* NCQA Guidance */}
      <div className="p-4 bg-secondary/50 border border-primary/20 rounded-xl flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-primary mb-1">
            NCQA Oversampling Policy — MY 2025
          </div>
          <p className="text-xs text-primary leading-relaxed">
            Organizations may select up to <strong>15%</strong> of the required
            sample as an oversample pool. Replacement members must be drawn
            sequentially from the oversample list. All replacements must be
            documented with a valid reason. Replacement rates exceeding 5% of
            base sample require supervisor review.
          </p>
        </div>
      </div>

      {/* Oversample Config Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-foreground">
            Oversample Pool Configuration
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {[
                  "Measure",
                  "Product",
                  "Base Sample",
                  "Oversample %",
                  "Oversample Count",
                  "Used",
                  "Remaining",
                  "Pool Status",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {oversampleConfig.map((row) => {
                const usedPct = Math.round((row.used / row.oversample) * 100);
                return (
                  <tr
                    key={`${row.measure}-${row.product}`}
                    className="border-b border-border hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-primary text-primary-foreground rounded text-[11px] font-bold">
                        {row.measure}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                        {row.product}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">
                      {row.base}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">
                          {row.pct}%
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {row.pct <= 15 ? "✓ NCQA OK" : "⚠ Over limit"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">
                      {row.oversample}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold ${row.used > 0 ? "text-amber-700" : "text-gray-400"}`}
                      >
                        {row.used}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-emerald-700">
                      {row.remaining}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${usedPct >= 80 ? "bg-red-500" : usedPct >= 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${usedPct}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-muted-foreground">
                          {usedPct}% used
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

      {/* Replacement Log */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center gap-2">
          <RefreshCcw className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-bold text-foreground">
            Replacement Log
          </span>
          <span className="ml-2 bg-amber-100 text-amber-700 border border-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {oversampleReplacements.length}
          </span>
        </div>
        <div className="divide-y divide-border">
          {oversampleReplacements.map((rep, i) => (
            <div
              key={rep.id}
              className="p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-start gap-4 flex-wrap">
                <div className="flex items-start gap-3 flex-1 min-w-[260px]">
                  {/* Original → Replacement */}
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
                    <div className="text-[9px] font-bold text-red-600 uppercase">
                      Original
                    </div>
                    <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-700 text-[10px] font-bold">
                      {i + 1}
                    </div>
                    <div className="w-px h-4 bg-border"></div>
                    <ChevronDown className="w-3 h-3 text-muted-foreground -mt-2" />
                    <div className="text-[9px] font-bold text-emerald-600 uppercase">
                      Replace
                    </div>
                    <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold">
                      <ChevronRightIcon className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    {/* Original */}
                    <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
                      <div className="text-[10px] font-bold text-red-700 uppercase mb-0.5">
                        Replaced Member
                      </div>
                      <div className="text-xs font-bold text-red-900">
                        {rep.originalName}
                      </div>
                      <div className="text-[11px] font-mono text-red-700">
                        {rep.originalId}
                      </div>
                    </div>
                    {/* Replacement */}
                    <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <div className="text-[10px] font-bold text-emerald-700 uppercase mb-0.5">
                        Replacement Member
                      </div>
                      <div className="text-xs font-bold text-emerald-900">
                        {rep.replacementName}
                      </div>
                      <div className="text-[11px] font-mono text-emerald-700">
                        {rep.replacementId}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-[200px] space-y-2 pt-1">
                  <div>
                    <div className="text-[10px] font-bold text-muted-foreground uppercase mb-0.5">
                      Reason
                    </div>
                    <p className="text-xs text-foreground">{rep.reason}</p>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {rep.replacedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {rep.replacedAt}
                    </span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded text-[10px] font-bold">
                      {rep.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <button className="p-1.5 hover:bg-red-50 rounded transition-colors flex-shrink-0 self-start mt-1">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Replacement Modal */}
      {showAddReplacement && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <RefreshCcw className="w-4 h-4 text-amber-600" /> Add
                Replacement Member
              </h3>
              <button onClick={() => setShowAddReplacement(false)}>
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                ["Original Member ID", "originalId", "MBR-XXXXXX"],
                ["Replacement Member ID", "replacementId", "MBR-XXXXXX"],
                [
                  "Reason for Replacement",
                  "reason",
                  "e.g. Ineligible — moved out of service area",
                ],
              ].map(([label, key, placeholder]) => (
                <div key={key as string}>
                  <label className="text-xs font-bold text-foreground block mb-1">
                    {label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form[key as keyof typeof form]}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        [key as string]: e.target.value,
                      }))
                    }
                    placeholder={placeholder as string}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button
                onClick={() => setShowAddReplacement(false)}
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAddReplacement(false)}
                className="btn-primary text-sm px-4 py-2"
              >
                <Plus className="w-4 h-4" /> Add Replacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB 3 — AUDIT TRACKER
───────────────────────────────────────────────────────────── */
function AuditTrackerTab() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [measureFilter, setMeasureFilter] = useState("all");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const abstractors = [...new Set(auditItems.map((a) => a.assignedTo))];
  const measures = [...new Set(auditItems.map((a) => a.measure))];

  const filtered = auditItems.filter((a) => {
    if (
      search &&
      !a.member.toLowerCase().includes(search.toLowerCase()) &&
      !a.id.includes(search) &&
      !a.memberId.includes(search)
    )
      return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (measureFilter !== "all" && a.measure !== measureFilter) return false;
    if (assigneeFilter !== "all" && a.assignedTo !== assigneeFilter)
      return false;
    return true;
  });

  const total = auditItems.length;
  const complete = auditItems.filter((a) => a.status === "complete").length;
  const overdue = auditItems.filter((a) => a.status === "overdue").length;
  const avgCompletion = Math.round(
    auditItems.reduce((s, a) => s + a.completion, 0) / total,
  );

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Audit Items",
            value: total,
            icon: ClipboardList,
            color: "text-foreground",
            bg: "bg-card border-border",
          },
          {
            label: "Complete",
            value: complete,
            icon: CheckCircle2,
            color: "text-emerald-700",
            bg: "bg-emerald-50 border-emerald-200",
          },
          {
            label: "Overdue",
            value: overdue,
            icon: AlertTriangle,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
          {
            label: "Avg Completion",
            value: `${avgCompletion}%`,
            icon: Activity,
            color: "text-primary",
            bg: "bg-secondary/50 border-primary/20",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`border rounded-xl p-4 flex items-center gap-3 ${s.bg}`}
          >
            <s.icon className={`w-5 h-5 flex-shrink-0 ${s.color}`} />
            <div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress by Measure */}
      <div className="bg-card border border-border rounded-xl shadow-sm p-5">
        <div className="text-sm font-bold text-foreground mb-4">
          Progress by Measure
        </div>
        <div className="space-y-3">
          {measures.map((m) => {
            const items = auditItems.filter((a) => a.measure === m);
            const done = items.filter((a) => a.status === "complete").length;
            const pct = Math.round((done / items.length) * 100);
            return (
              <div key={m} className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-10 h-6 bg-primary text-primary-foreground rounded text-[11px] font-bold flex-shrink-0">
                  {m}
                </span>
                <div className="flex-1">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-muted-foreground">
                      {done}/{items.length} complete
                    </span>
                    <span className="font-bold text-primary">{pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct === 100 ? "bg-emerald-500" : pct >= 50 ? "bg-primary" : "bg-amber-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member, audit ID…"
            className="w-full pl-9 pr-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background"
          />
        </div>
        {[
          {
            val: statusFilter,
            set: setStatusFilter,
            opts: [
              ["all", "All Status"],
              ["not-started", "Not Started"],
              ["in-progress", "In Progress"],
              ["complete", "Complete"],
              ["overdue", "Overdue"],
              ["on-hold", "On Hold"],
            ],
          },
          {
            val: measureFilter,
            set: setMeasureFilter,
            opts: [["all", "All Measures"], ...measures.map((m) => [m, m])],
          },
          {
            val: assigneeFilter,
            set: setAssigneeFilter,
            opts: [
              ["all", "All Assignees"],
              ...abstractors.map((a) => [a, a.split(",")[0]]),
            ],
          },
        ].map((f, i) => (
          <select
            key={i}
            value={f.val}
            onChange={(e) => f.set(e.target.value)}
            className="px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-card text-foreground"
          >
            {f.opts.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {[
                  "Audit ID",
                  "Member",
                  "Measure",
                  "Assigned To",
                  "Due Date",
                  "Status",
                  "Completion",
                  "Priority",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <>
                  <tr
                    key={item.id}
                    className={`border-b border-border hover:bg-accent/30 transition-colors ${item.status === "overdue" ? "bg-red-50/30" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono font-bold text-primary">
                        {item.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-foreground">
                        {item.member}
                      </div>
                      <div className="text-[11px] font-mono text-muted-foreground">
                        {item.memberId}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 bg-primary text-primary-foreground rounded text-[11px] font-bold">
                          {item.measure}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {item.product}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-[10px] font-bold flex-shrink-0">
                          {item.assignedTo.split(",")[0].charAt(0)}
                          {item.assignedTo.split(" ").pop()?.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-700">
                          {item.assignedTo.split(",")[0]}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className={`flex items-center gap-1 text-xs font-semibold ${item.status === "overdue" ? "text-red-600" : "text-gray-700"}`}
                      >
                        <Calendar className="w-3 h-3" />
                        {item.dueDate}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <AuditStatusBadge s={item.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.completion === 100 ? "bg-emerald-500" : item.status === "overdue" ? "bg-red-500" : "bg-blue-500"}`}
                            style={{ width: `${item.completion}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-700">
                          {item.completion}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <PriorityBadge p={item.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() =>
                            setExpandedRow(
                              expandedRow === item.id ? null : item.id,
                            )
                          }
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="View details"
                        >
                          <Eye className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="More"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRow === item.id && (
                    <tr
                      key={`${item.id}-exp`}
                      className="border-b border-blue-200 bg-blue-50/40"
                    >
                      <td colSpan={9} className="px-6 py-4">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <span className="font-bold text-gray-600">
                              Case Reference:
                            </span>{" "}
                            <span className="font-mono text-blue-700">
                              {item.caseRef}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-600">
                              Documents Ready:
                            </span>{" "}
                            <span
                              className={
                                item.documentsReady
                                  ? "text-emerald-700 font-semibold"
                                  : "text-red-600 font-semibold"
                              }
                            >
                              {item.documentsReady
                                ? "Yes"
                                : "No — pending upload"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="btn-outline text-[11px] px-2 py-1">
                              <FileText className="w-3 h-3" /> Open Case
                            </button>
                            <button className="btn-outline text-[11px] px-2 py-1">
                              <Package className="w-3 h-3" /> Build Packet
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          <span className="text-xs text-gray-500">
            Showing {filtered.length} of {auditItems.length} items
          </span>
          <div className="flex gap-1">
            <button
              className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded">
              1
            </span>
            <button
              className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40"
              disabled
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB 4 — AUDIT PACKET BUILDER
───────────────────────────────────────────────────────────── */
const DOC_LABELS: Record<string, string> = {
  coverSheet: "NCQA Cover Sheet",
  eligibility: "Eligibility Verification",
  progressNotes: "Progress Notes",
  labReports: "Lab / Diagnostic Reports",
  claimsData: "Claims Data Extract",
  providerAttestation: "Provider Attestation",
};
const DOC_REQUIRED: Record<string, boolean> = {
  coverSheet: true,
  eligibility: true,
  progressNotes: true,
  labReports: true,
  claimsData: false,
  providerAttestation: false,
};

function PacketBuilderTab() {
  const [selected, setSelected] = useState<(typeof packetMembers)[0] | null>(
    packetMembers[0],
  );
  const [buildingAll, setBuildingAll] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const complete = packetMembers.filter((m) => m.status === "complete").length;
  const incomplete = packetMembers.filter(
    (m) => m.status === "incomplete",
  ).length;
  const notStarted = packetMembers.filter(
    (m) => m.status === "not-started",
  ).length;

  const packetStatusStyle: Record<string, string> = {
    complete: "bg-emerald-50 text-emerald-700 border-emerald-300",
    incomplete: "bg-amber-50 text-amber-700 border-amber-300",
    "not-started": "bg-gray-100 text-gray-600 border-gray-300",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Audit Packet Builder
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Assemble and export NCQA-compliant audit packets for each sampled
            member
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-outline text-xs px-3 py-2">
            <Printer className="w-3.5 h-3.5" /> Print All
          </button>
          <button
            onClick={() => setBuildingAll(true)}
            className="btn-primary text-xs px-3 py-2"
          >
            <Package className="w-3.5 h-3.5" /> Build All Complete Packets
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Complete",
            value: complete,
            color: "text-emerald-700",
            bg: "bg-emerald-50 border-emerald-200",
            icon: CheckCircle2,
          },
          {
            label: "Incomplete",
            value: incomplete,
            color: "text-amber-700",
            bg: "bg-amber-50 border-amber-200",
            icon: AlertCircle,
          },
          {
            label: "Not Started",
            value: notStarted,
            color: "text-gray-600",
            bg: "bg-gray-50 border-gray-200",
            icon: ClipboardList,
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`border rounded-xl p-4 flex items-center gap-3 ${s.bg}`}
          >
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-gray-600">{s.label} packets</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Member List */}
        <div className="xl:col-span-2 space-y-2">
          {packetMembers.map((m) => {
            const docKeys = Object.keys(m.docs) as (keyof typeof m.docs)[];
            const filled = docKeys.filter((k) => m.docs[k]).length;
            return (
              <button
                key={m.id}
                onClick={() => setSelected(m)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${selected?.id === m.id ? "border-blue-500 bg-blue-50/60 shadow-md" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="text-xs font-bold text-gray-900">
                      {m.name}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-mono text-gray-500">
                        {m.id}
                      </span>
                      <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                        {m.measure}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold capitalize ${packetStatusStyle[m.status]}`}
                  >
                    {m.status.replace("-", " ")}
                  </span>
                </div>
                {/* Doc progress */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.status === "complete" ? "bg-emerald-500" : m.status === "incomplete" ? "bg-amber-500" : "bg-gray-300"}`}
                      style={{ width: `${(filled / docKeys.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-gray-500">
                    {filled}/{docKeys.length} docs
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Packet Detail */}
        <div className="xl:col-span-3">
          {!selected ? (
            <div className="flex items-center justify-center h-64 bg-white border border-dashed border-gray-300 rounded-xl">
              <div className="text-center text-sm text-gray-400">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Select a member to build their packet
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    {selected.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-mono text-gray-500">
                      {selected.id}
                    </span>
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                      {selected.measure}
                    </span>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold capitalize ${packetStatusStyle[selected.status]}`}
                    >
                      {selected.status.replace("-", " ")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPreview(true)}
                    className="btn-outline text-xs px-2.5 py-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button className="btn-primary text-xs px-2.5 py-1.5">
                    <FileDown className="w-3.5 h-3.5" /> Export PDF
                  </button>
                </div>
              </div>

              {/* Document Checklist */}
              <div className="p-5 space-y-2">
                <div className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Paperclip className="w-3.5 h-3.5 text-gray-500" /> Document
                  Checklist
                </div>
                {(
                  Object.keys(selected.docs) as (keyof typeof selected.docs)[]
                ).map((docKey) => {
                  const ready = selected.docs[docKey];
                  const required = DOC_REQUIRED[docKey];
                  return (
                    <div
                      key={docKey}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${ready ? "bg-emerald-50 border-emerald-200" : required ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200"}`}
                    >
                      <DocCheck ok={ready} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-900">
                            {DOC_LABELS[docKey]}
                          </span>
                          {required && (
                            <span className="text-[9px] font-bold text-red-600 uppercase border border-red-300 px-1 py-0.5 rounded">
                              Required
                            </span>
                          )}
                        </div>
                        {!ready && (
                          <div className="text-[11px] text-gray-500 mt-0.5">
                            {required
                              ? "Missing — must be uploaded before packet generation"
                              : "Optional — not yet provided"}
                          </div>
                        )}
                        {ready && (
                          <div className="text-[11px] text-emerald-600 mt-0.5">
                            Document verified and attached
                          </div>
                        )}
                      </div>
                      {!ready && (
                        <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700 transition-colors flex-shrink-0">
                          <Upload className="w-3 h-3" /> Upload
                        </button>
                      )}
                    </div>
                  );
                })}

                {/* NCQA Cover Sheet Preview */}
                <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">
                    Packet Preview
                  </div>
                  <div className="space-y-1 text-[11px] text-gray-600">
                    {[
                      ["Member", selected.name],
                      ["Member ID", selected.id],
                      ["Measure", `${selected.measure} · MY 2025`],
                      ["Pages", "12 estimated"],
                      ["Generated", "Not yet generated"],
                    ].map(([k, v]) => (
                      <div key={k as string} className="flex justify-between">
                        <span>{k}</span>
                        <span className="font-semibold text-gray-900">{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" /> Packet Preview —{" "}
                {selected?.name}
              </h3>
              <button onClick={() => setShowPreview(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
                <FileText className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <div className="text-sm font-semibold text-gray-700">
                  NCQA Audit Packet Preview
                </div>
                <div className="text-xs text-gray-500 mt-1 mb-4">
                  {selected?.name} · {selected?.measure} · MY 2025 · ~12 pages
                </div>
                <div className="space-y-1.5 text-left max-w-xs mx-auto">
                  {Object.keys(selected?.docs || {}).map((k, i) => (
                    <div
                      key={k}
                      className="flex items-center gap-2 text-xs text-gray-700"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      {DOC_LABELS[k]}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowPreview(false)}
                className="btn-outline text-sm px-4 py-2"
              >
                Close
              </button>
              <button className="btn-primary text-sm px-4 py-2">
                <FileDown className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB 5 — SUBMISSION LOCK
───────────────────────────────────────────────────────────── */
function SubmissionLockTab() {
  const [rows, setRows] = useState(lockRows);
  const [showAttest, setShowAttest] = useState<(typeof lockRows)[0] | null>(
    null,
  );
  const [showLockConfirm, setShowLockConfirm] = useState<
    (typeof lockRows)[0] | null
  >(null);
  const [attestChecks, setAttestChecks] = useState({
    accuracy: false,
    hipaa: false,
    ncqa: false,
    supervisor: false,
  });
  const [filterStatus, setFilterStatus] = useState("all");

  const lockRow = (row: (typeof lockRows)[0]) =>
    setRows((p) =>
      p.map((r) =>
        r.measure === row.measure && r.product === row.product
          ? {
              ...r,
              status: "locked",
              lockedBy: "Current User",
              lockedAt: new Date().toLocaleString(),
            }
          : r,
      ),
    );
  const unlockRow = (row: (typeof lockRows)[0]) =>
    setRows((p) =>
      p.map((r) =>
        r.measure === row.measure && r.product === row.product
          ? { ...r, status: "unlocked", lockedBy: "", lockedAt: "" }
          : r,
      ),
    );

  const locked = rows.filter((r) => r.status === "locked").length;
  const pending = rows.filter((r) => r.status === "pending-attestation").length;
  const unlocked = rows.filter((r) => r.status === "unlocked").length;
  const allAttest = Object.values(attestChecks).every(Boolean);

  const ncqaWindow = {
    opens: "Aug 1, 2025",
    closes: "Sep 30, 2025",
    daysRemaining: 40,
  };

  const filtered = rows.filter(
    (r) => filterStatus === "all" || r.status === filterStatus,
  );

  return (
    <div className="space-y-5">
      {/* NCQA Submission Window Banner */}
      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-4">
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <Send className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-indigo-900">
            NCQA Submission Window — MY 2025
          </div>
          <div className="text-xs text-indigo-700 mt-0.5">
            Opens <strong>{ncqaWindow.opens}</strong> · Closes{" "}
            <strong>{ncqaWindow.closes}</strong> ·{" "}
            <strong className="text-indigo-900">
              {ncqaWindow.daysRemaining} days remaining
            </strong>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold text-indigo-700">
            {locked}/{rows.length}
          </div>
          <div className="text-[11px] text-indigo-600">measures locked</div>
        </div>
      </div>

      {/* Pre-Submission Checklist */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-gray-900">
            Pre-Submission Validation
          </span>
        </div>
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "All samples finalized", ok: true },
            { label: "Oversampling documented", ok: true },
            { label: "QA review ≥ 95% complete", ok: false },
            { label: "No open discrepancies", ok: false },
            { label: "All audit packets built", ok: false },
            { label: "HIPAA review signed", ok: true },
            { label: "Supervisor attestation", ok: false },
            { label: "Export log current", ok: true },
          ].map((item) => (
            <div
              key={item.label}
              className={`flex items-center gap-2 p-2.5 rounded-lg border ${item.ok ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
            >
              {item.ok ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <CircleAlert className="w-4 h-4 text-red-500 flex-shrink-0" />
              )}
              <span className="text-[11px] font-semibold text-gray-800">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* KPIs + Filter */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-3">
          {[
            {
              label: "Locked",
              value: locked,
              color: "text-emerald-700",
              bg: "bg-emerald-50 border-emerald-200",
            },
            {
              label: "Pending Attestation",
              value: pending,
              color: "text-amber-700",
              bg: "bg-amber-50 border-amber-200",
            },
            {
              label: "Unlocked",
              value: unlocked,
              color: "text-gray-600",
              bg: "bg-gray-50 border-gray-200",
            },
          ].map((s) => (
            <div
              key={s.label}
              className={`border rounded-lg px-4 py-2.5 text-center ${s.bg}`}
            >
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="locked">Locked</option>
            <option value="pending-attestation">Pending Attestation</option>
            <option value="unlocked">Unlocked</option>
          </select>
          <button className="btn-outline text-xs px-3 py-2">
            <LockKeyhole className="w-3.5 h-3.5" /> Lock All Validated
          </button>
        </div>
      </div>

      {/* Lock Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "Measure",
                  "Product Line",
                  "Denominator",
                  "Sampled",
                  "Audited",
                  "Validation",
                  "Status",
                  "Locked By / At",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr
                  key={`${row.measure}-${row.product}`}
                  className="border-b border-gray-100 hover:bg-blue-50/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 text-white rounded text-[11px] font-bold">
                      {row.measure}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                      {row.product}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {row.denominator.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    {row.sampled}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-sm font-bold ${row.audited === row.sampled ? "text-emerald-700" : "text-amber-700"}`}
                      >
                        {row.audited}
                      </span>
                      {row.audited < row.sampled && (
                        <span className="text-[10px] text-amber-600">
                          ({row.sampled - row.audited} pending)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {row.validationPassed ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Passed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-red-600 font-semibold">
                        <CircleAlert className="w-3.5 h-3.5" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <LockBadge s={row.status} />
                  </td>
                  <td className="px-4 py-3">
                    {row.lockedBy ? (
                      <div>
                        <div className="text-[11px] font-semibold text-gray-800">
                          {row.lockedBy}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {row.lockedAt}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {row.status === "locked" && (
                      <button
                        onClick={() => unlockRow(row)}
                        className="flex items-center gap-1 px-2.5 py-1.5 border border-red-300 text-red-700 rounded text-[11px] font-semibold hover:bg-red-50 transition-colors"
                      >
                        <LockKeyholeOpen className="w-3 h-3" /> Unlock
                      </button>
                    )}
                    {row.status === "unlocked" && (
                      <button
                        onClick={() => setShowLockConfirm(row)}
                        disabled={!row.validationPassed}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <LockKeyhole className="w-3 h-3" /> Lock
                      </button>
                    )}
                    {row.status === "pending-attestation" && (
                      <button
                        onClick={() => setShowAttest(row)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 text-white rounded text-[11px] font-semibold hover:bg-amber-700 transition-colors"
                      >
                        <ShieldCheck className="w-3 h-3" /> Attest
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lock Confirm Modal */}
      {showLockConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <LockKeyhole className="w-4 h-4 text-emerald-600" />
                Confirm Lock
              </h3>
              <button onClick={() => setShowLockConfirm(null)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm space-y-1.5">
                {[
                  ["Measure", showLockConfirm.measure],
                  ["Product", showLockConfirm.product],
                  ["Sample Size", `${showLockConfirm.sampled} members`],
                  [
                    "Audited",
                    `${showLockConfirm.audited} / ${showLockConfirm.sampled}`,
                  ],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex justify-between">
                    <span className="text-gray-500">{k}</span>
                    <span className="font-bold text-gray-900">{v}</span>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Locking this measure will prevent further edits to abstraction
                  data. Only supervisors can unlock after submission window
                  opens.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowLockConfirm(null)}
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  lockRow(showLockConfirm);
                  setShowLockConfirm(null);
                }}
                className="btn-primary text-sm px-4 py-2 bg-emerald-600 hover:bg-emerald-700 border-emerald-600"
              >
                <LockKeyhole className="w-4 h-4" /> Lock Measure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attestation Modal */}
      {showAttest && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Supervisor Attestation
              </h3>
              <button onClick={() => setShowAttest(null)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-xs text-gray-700 leading-relaxed">
                By attesting, you confirm that all audit records for{" "}
                <strong>
                  {showAttest.measure} · {showAttest.product}
                </strong>{" "}
                are complete, accurate, and compliant with NCQA standards for MY
                2025.
              </div>
              <div className="space-y-2.5">
                {[
                  [
                    "accuracy",
                    "All abstracted fields have been reviewed for accuracy",
                  ],
                  [
                    "hipaa",
                    "HIPAA compliance has been verified for all member data",
                  ],
                  ["ncqa", "Records meet NCQA technical specifications"],
                  [
                    "supervisor",
                    "I am authorized to submit this attestation as a supervisor",
                  ],
                ].map(([key, label]) => (
                  <label
                    key={key as string}
                    className="flex items-start gap-2.5 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={attestChecks[key as keyof typeof attestChecks]}
                      onChange={(e) =>
                        setAttestChecks((p) => ({
                          ...p,
                          [key as string]: e.target.checked,
                        }))
                      }
                      className="accent-blue-600 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-xs text-gray-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowAttest(null)}
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                disabled={!allAttest}
                onClick={() => {
                  lockRow(showAttest);
                  setShowAttest(null);
                  setAttestChecks({
                    accuracy: false,
                    hipaa: false,
                    ncqa: false,
                    supervisor: false,
                  });
                }}
                className="btn-primary text-sm px-4 py-2 disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" /> Attest &amp; Lock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB 6 — EXPORT HISTORY
───────────────────────────────────────────────────────────── */
function ExportHistoryTab() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formatFilter, setFormatFilter] = useState("all");
  const [hipaaFilter, setHipaaFilter] = useState("all");
  const [showNewExport, setShowNewExport] = useState(false);
  const [exportForm, setExportForm] = useState({
    type: "Sample List",
    measure: "CDC",
    product: "All",
    format: "CSV",
  });

  const types = [...new Set(exportHistory.map((e) => e.type))];
  const formats = [...new Set(exportHistory.map((e) => e.format))];

  const filtered = exportHistory.filter((e) => {
    if (
      search &&
      !e.id.includes(search) &&
      !e.member?.includes(search) &&
      !e.type.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    if (formatFilter !== "all" && e.format !== formatFilter) return false;
    if (hipaaFilter === "yes" && !e.hipaaCompliant) return false;
    if (hipaaFilter === "no" && e.hipaaCompliant) return false;
    return true;
  });

  const formatColor: Record<string, string> = {
    CSV: "bg-green-100 text-green-700 border-green-300",
    PDF: "bg-red-100 text-red-700 border-red-300",
    XLSX: "bg-emerald-100 text-emerald-700 border-emerald-300",
    XML: "bg-blue-100 text-blue-700 border-blue-300",
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Export History</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Audit trail of all data exports with HIPAA compliance tracking
          </p>
        </div>
        <button
          onClick={() => setShowNewExport(true)}
          className="btn-primary text-xs px-3 py-2"
        >
          <FileDown className="w-3.5 h-3.5" /> New Export
        </button>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Total Exports",
            value: exportHistory.length,
            icon: History,
            color: "text-gray-800",
            bg: "bg-white border-gray-200",
          },
          {
            label: "This Month",
            value: exportHistory.length,
            icon: Calendar,
            color: "text-blue-700",
            bg: "bg-blue-50 border-blue-200",
          },
          {
            label: "HIPAA Compliant",
            value: exportHistory.filter((e) => e.hipaaCompliant).length,
            icon: ShieldCheck,
            color: "text-emerald-700",
            bg: "bg-emerald-50 border-emerald-200",
          },
          {
            label: "Failed Exports",
            value: exportHistory.filter((e) => e.status === "failed").length,
            icon: AlertCircle,
            color: "text-red-600",
            bg: "bg-red-50 border-red-200",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`border rounded-xl p-4 flex items-center gap-3 ${s.bg}`}
          >
            <s.icon className={`w-5 h-5 ${s.color}`} />
            <div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[11px] text-gray-600">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* HIPAA Notice */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
        <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800">
          <strong>HIPAA Notice:</strong> All exports containing Protected Health
          Information (PHI) are logged and traceable. Unauthorized distribution
          of PHI is prohibited under 45 CFR Parts 160 and 164. Exports are
          retained for 7 years per CMS retention requirements.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search export ID, type…"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          />
        </div>
        {[
          {
            val: typeFilter,
            set: setTypeFilter,
            opts: [["all", "All Types"], ...types.map((t) => [t, t])],
          },
          {
            val: formatFilter,
            set: setFormatFilter,
            opts: [["all", "All Formats"], ...formats.map((f) => [f, f])],
          },
          {
            val: hipaaFilter,
            set: setHipaaFilter,
            opts: [
              ["all", "All HIPAA"],
              ["yes", "HIPAA Compliant"],
              ["no", "Non-Compliant"],
            ],
          },
        ].map((f, i) => (
          <select
            key={i}
            value={f.val}
            onChange={(e) => f.set(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700"
          >
            {f.opts.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        ))}
        {(search ||
          typeFilter !== "all" ||
          formatFilter !== "all" ||
          hipaaFilter !== "all") && (
          <button
            onClick={() => {
              setSearch("");
              setTypeFilter("all");
              setFormatFilter("all");
              setHipaaFilter("all");
            }}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Export Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {[
                  "Export ID",
                  "Type",
                  "Measure",
                  "Product",
                  "Exported By",
                  "Date / Time",
                  "Format",
                  "Records",
                  "HIPAA",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-[11px] font-bold text-gray-600 uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((e) => (
                <tr
                  key={e.id}
                  className={`border-b border-gray-100 hover:bg-blue-50/20 transition-colors ${e.status === "failed" ? "bg-red-50/30" : ""}`}
                >
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono font-bold text-blue-700">
                      {e.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-gray-800">
                      {e.type}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-600 text-white rounded text-[10px] font-bold">
                      {e.measure}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-600">
                      {e.productLine}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-[10px] font-bold flex-shrink-0">
                        {e.exportedBy.split(",")[0].charAt(0)}
                        {e.exportedBy.split(" ").pop()?.charAt(0)}
                      </div>
                      <span className="text-xs text-gray-700">
                        {e.exportedBy.split(",")[0]}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700">
                      {e.exportedAt.split(" ")[0]}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      {e.exportedAt.split(" ").slice(1).join(" ")}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-bold ${formatColor[e.format] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}
                    >
                      {e.format}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-gray-800">
                      {e.records > 0 ? e.records.toLocaleString() : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.hipaaCompliant ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Yes
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 font-semibold">
                        <ShieldAlert className="w-3.5 h-3.5" />
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.status === "complete" ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Complete
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-red-600 font-semibold">
                        <CircleAlert className="w-3.5 h-3.5" />
                        Failed
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {e.status === "complete" && (
                        <button
                          className="p-1.5 hover:bg-blue-50 rounded transition-colors"
                          title="Download"
                        >
                          <FileDown className="w-3.5 h-3.5 text-blue-600" />
                        </button>
                      )}
                      {e.status === "failed" && (
                        <button
                          className="p-1.5 hover:bg-amber-50 rounded transition-colors"
                          title="Retry"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                      )}
                      <button
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="Copy ID"
                      >
                        <Copy className="w-3.5 h-3.5 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={11}
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No exports match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Showing {filtered.length} of {exportHistory.length} exports
          </span>
          <div className="flex gap-1">
            <button
              className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <span className="px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded">
              1
            </span>
            <button
              className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-40"
              disabled
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* New Export Modal */}
      {showNewExport && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <FileDown className="w-4 h-4 text-blue-600" />
                New Export
              </h3>
              <button onClick={() => setShowNewExport(false)}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                {
                  label: "Export Type",
                  key: "type",
                  opts: [
                    "Sample List",
                    "Audit Packet",
                    "Discrepancy Report",
                    "HEDIS Submission File",
                    "Oversampling Report",
                    "Lock Status Report",
                  ],
                },
                {
                  label: "Measure",
                  key: "measure",
                  opts: ["All", ...MEASURES],
                },
                {
                  label: "Product Line",
                  key: "product",
                  opts: ["All", ...PRODUCT_LINES],
                },
                {
                  label: "Format",
                  key: "format",
                  opts: ["CSV", "XLSX", "PDF", "XML"],
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    {f.label}
                  </label>
                  <select
                    value={exportForm[f.key as keyof typeof exportForm]}
                    onChange={(e) =>
                      setExportForm((p) => ({ ...p, [f.key]: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {f.opts.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  This export may contain PHI. Ensure the recipient is
                  authorized under your organization's HIPAA policies. This
                  action will be logged.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowNewExport(false)}
                className="btn-outline text-sm px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowNewExport(false)}
                className="btn-primary text-sm px-4 py-2"
              >
                <FileDown className="w-4 h-4" /> Generate Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   ROOT EXPORT
───────────────────────────────────────────────────────────── */
export function AuditSampling() {
  const [activeTab, setActiveTab] = useState<TabId>("sample-selection");

  const tabs: {
    id: TabId;
    label: string;
    icon: ElementType;
    badge?: number;
  }[] = [
    { id: "sample-selection", label: "Sample Selection", icon: FlaskConical },
    {
      id: "oversampling",
      label: "Oversampling",
      icon: Layers,
      badge: oversampleReplacements.length,
    },
    {
      id: "audit-tracker",
      label: "Audit Tracker",
      icon: ClipboardList,
      badge: auditItems.filter((a) => a.status === "overdue").length,
    },
    {
      id: "packet-builder",
      label: "Audit Packet Builder",
      icon: Package,
      badge: packetMembers.filter(
        (m) => m.status === "incomplete" || m.status === "not-started",
      ).length,
    },
    {
      id: "submission-lock",
      label: "Submission Lock",
      icon: LockKeyhole,
      badge: lockRows.filter((r) => r.status === "pending-attestation").length,
    },
    { id: "export-history", label: "Export History", icon: Download },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-blue-600" /> Audit &amp;
            Sampling
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            NCQA hybrid sampling, audit management, packet building, and
            submission preparation · MY 2025
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-outline text-xs px-3 py-2">
            <RefreshCcw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button className="btn-primary text-xs px-3 py-2">
            <ExternalLink className="w-3.5 h-3.5" /> NCQA Portal
          </button>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b border-gray-200 mb-5">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.id ? "bg-secondary text-secondary-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "sample-selection" && <SampleSelectionTab />}
      {activeTab === "oversampling" && <OversamplingTab />}
      {activeTab === "audit-tracker" && <AuditTrackerTab />}
      {activeTab === "packet-builder" && <PacketBuilderTab />}
      {activeTab === "submission-lock" && <SubmissionLockTab />}
      {activeTab === "export-history" && <ExportHistoryTab />}
    </div>
  );
}
