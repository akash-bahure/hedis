import {
  X,
  Download,
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  Users,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Award,
  AlertCircle,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  UserPlus,
  ClipboardList,
  Send,
  Phone,
  Mail,
  Flag,
  Shield,
  Settings,
  Eye,
  MessageSquare,
  Smartphone,
  Mailbox,
  Bell,
  Edit,
  Save,
} from "lucide-react";
import { useState } from "react";

interface DetailedReportModalProps {
  onClose: () => void;
}

// Mock detailed performance data
const mockMemberData = [
  {
    id: "M001",
    memberId: "MEM-2025-001234",
    memberName: "Johnson, Sarah M.",
    age: 58,
    complianceStatus: "compliant",
    lastServiceDate: "2024-11-15",
    provider: "Dr. Smith, Internal Medicine",
    documentationQuality: 95,
    evidenceCount: 3,
    reviewStatus: "approved",
    abstractor: "John Martinez",
    reviewer: "Dr. Sarah Chen",
    notes: "Complete documentation, all criteria met",
  },
  {
    id: "M002",
    memberId: "MEM-2025-001235",
    memberName: "Williams, Robert J.",
    age: 62,
    complianceStatus: "compliant",
    lastServiceDate: "2024-10-22",
    provider: "Dr. Johnson, Cardiology",
    documentationQuality: 88,
    evidenceCount: 2,
    reviewStatus: "approved",
    abstractor: "Lisa Johnson",
    reviewer: "Dr. James Park",
    notes: "Meets all requirements",
  },
  {
    id: "M003",
    memberId: "MEM-2025-001236",
    memberName: "Davis, Maria L.",
    age: 54,
    complianceStatus: "non-compliant",
    lastServiceDate: "2024-09-18",
    provider: "Dr. Chen, Family Practice",
    documentationQuality: 42,
    evidenceCount: 1,
    reviewStatus: "pending",
    abstractor: "Maria Rodriguez",
    reviewer: "Pending",
    notes: "Missing follow-up BP reading",
  },
  {
    id: "M004",
    memberId: "MEM-2025-001237",
    memberName: "Martinez, James A.",
    age: 67,
    complianceStatus: "compliant",
    lastServiceDate: "2024-12-03",
    provider: "Dr. Park, Internal Medicine",
    documentationQuality: 92,
    evidenceCount: 4,
    reviewStatus: "approved",
    abstractor: "John Martinez",
    reviewer: "Dr. Sarah Chen",
    notes: "Excellent documentation",
  },
  {
    id: "M005",
    memberId: "MEM-2025-001238",
    memberName: "Anderson, Patricia K.",
    age: 71,
    complianceStatus: "excluded",
    lastServiceDate: "N/A",
    provider: "N/A",
    documentationQuality: 0,
    evidenceCount: 0,
    reviewStatus: "excluded",
    abstractor: "System Auto",
    reviewer: "System Auto",
    notes: "End-stage renal disease exclusion",
  },
];

const mockTrendData = [
  { month: "Jan 2024", rate: 78.2, numerator: 695, denominator: 889 },
  { month: "Feb 2024", rate: 79.5, numerator: 721, denominator: 907 },
  { month: "Mar 2024", rate: 80.1, numerator: 753, denominator: 940 },
  { month: "Apr 2024", rate: 81.3, numerator: 782, denominator: 962 },
  { month: "May 2024", rate: 82.0, numerator: 804, denominator: 980 },
  { month: "Jun 2024", rate: 82.8, numerator: 823, denominator: 994 },
  { month: "Jul 2024", rate: 83.4, numerator: 835, denominator: 1001 },
  { month: "Aug 2024", rate: 83.9, numerator: 839, denominator: 1000 },
  { month: "Sep 2024", rate: 84.2, numerator: 843, denominator: 1001 },
  { month: "Oct 2024", rate: 84.5, numerator: 845, denominator: 1000 },
  { month: "Nov 2024", rate: 84.7, numerator: 847, denominator: 1000 },
  { month: "Dec 2024", rate: 84.7, numerator: 847, denominator: 1000 },
];

const mockGapAnalysis = [
  {
    category: "Missing Evidence",
    count: 23,
    impact: -2.3,
    description:
      "Members with diagnosed hypertension but no BP readings in measurement year",
    actionable: true,
  },
  {
    category: "Documentation Quality",
    count: 45,
    impact: -4.5,
    description:
      "BP readings documented but not clearly linked to encounter date",
    actionable: true,
  },
  {
    category: "Eligibility Issues",
    count: 12,
    impact: -1.2,
    description: "Members with enrollment gaps during measurement year",
    actionable: false,
  },
  {
    category: "Provider Variation",
    count: 31,
    impact: -3.1,
    description: "Low-performing provider groups with <70% compliance rate",
    actionable: true,
  },
];

const mockBenchmarks = [
  { label: "Your Performance", value: 84.7, color: "bg-blue-500" },
  { label: "National Average", value: 82.3, color: "bg-gray-400" },
  { label: "Regional Average", value: 83.1, color: "bg-gray-400" },
  { label: "NCQA 90th Percentile", value: 88.5, color: "bg-green-500" },
  { label: "NCQA 75th Percentile", value: 85.2, color: "bg-green-400" },
  { label: "NCQA 50th Percentile", value: 81.8, color: "bg-yellow-500" },
];

// Mock affected members by gap category
const mockAffectedMembersByGap: Record<string, any[]> = {
  "Missing Evidence": [
    {
      id: "AM001",
      memberId: "MEM-2025-002341",
      memberName: "Thompson, Elizabeth R.",
      age: 61,
      lastVisit: "2024-08-15",
      provider: "Dr. Williams, Family Medicine",
      gapDetail: "No BP reading documented in MY2025",
      priority: "high",
      daysOverdue: 45,
    },
    {
      id: "AM002",
      memberId: "MEM-2025-002458",
      memberName: "Garcia, Michael T.",
      age: 55,
      lastVisit: "2024-07-22",
      provider: "Dr. Smith, Internal Medicine",
      gapDetail: "HTN diagnosis present, no follow-up BP",
      priority: "high",
      daysOverdue: 67,
    },
    {
      id: "AM003",
      memberId: "MEM-2025-002567",
      memberName: "Chen, Patricia L.",
      age: 68,
      lastVisit: "2024-09-10",
      provider: "Dr. Park, Cardiology",
      gapDetail: "Missing second BP reading for control",
      priority: "medium",
      daysOverdue: 30,
    },
    {
      id: "AM004",
      memberId: "MEM-2025-002678",
      memberName: "Brown, David K.",
      age: 72,
      lastVisit: "2024-06-18",
      provider: "Dr. Johnson, Internal Medicine",
      gapDetail: "No BP readings in measurement year",
      priority: "high",
      daysOverdue: 89,
    },
    {
      id: "AM005",
      memberId: "MEM-2025-002789",
      memberName: "Martinez, Susan M.",
      age: 59,
      lastVisit: "2024-10-05",
      provider: "Dr. Chen, Family Practice",
      gapDetail: "HTN documented, no BP evidence",
      priority: "medium",
      daysOverdue: 15,
    },
  ],
  "Documentation Quality": [
    {
      id: "AM006",
      memberId: "MEM-2025-003112",
      memberName: "Wilson, James A.",
      age: 64,
      lastVisit: "2024-11-12",
      provider: "Dr. Lee, Internal Medicine",
      gapDetail: "BP reading lacks encounter date",
      priority: "medium",
      daysOverdue: 0,
    },
    {
      id: "AM007",
      memberId: "MEM-2025-003223",
      memberName: "Anderson, Mary K.",
      age: 57,
      lastVisit: "2024-10-28",
      provider: "Dr. Rodriguez, Family Medicine",
      gapDetail: "Unclear BP measurement location",
      priority: "low",
      daysOverdue: 0,
    },
    {
      id: "AM008",
      memberId: "MEM-2025-003334",
      memberName: "Taylor, Robert J.",
      age: 70,
      lastVisit: "2024-11-20",
      provider: "Dr. Smith, Internal Medicine",
      gapDetail: "BP documented without provider signature",
      priority: "medium",
      daysOverdue: 0,
    },
    {
      id: "AM009",
      memberId: "MEM-2025-003445",
      memberName: "Moore, Jennifer L.",
      age: 62,
      lastVisit: "2024-09-15",
      provider: "Dr. Williams, Cardiology",
      gapDetail: "BP reading format non-standard",
      priority: "low",
      daysOverdue: 0,
    },
    {
      id: "AM010",
      memberId: "MEM-2025-003556",
      memberName: "Jackson, William P.",
      age: 66,
      lastVisit: "2024-11-08",
      provider: "Dr. Park, Family Practice",
      gapDetail: "Missing CPT code for BP encounter",
      priority: "medium",
      daysOverdue: 0,
    },
  ],
  "Provider Variation": [
    {
      id: "AM011",
      memberId: "MEM-2025-004112",
      memberName: "White, Linda M.",
      age: 58,
      lastVisit: "2024-10-30",
      provider: "Dr. Adams, Family Medicine",
      gapDetail: "Provider group compliance rate: 65%",
      priority: "high",
      daysOverdue: 18,
    },
    {
      id: "AM012",
      memberId: "MEM-2025-004223",
      memberName: "Harris, Charles R.",
      age: 69,
      lastVisit: "2024-09-22",
      provider: "Dr. Adams, Family Medicine",
      gapDetail: "Provider group compliance rate: 65%",
      priority: "high",
      daysOverdue: 45,
    },
    {
      id: "AM013",
      memberId: "MEM-2025-004334",
      memberName: "Martin, Barbara J.",
      age: 63,
      lastVisit: "2024-11-15",
      provider: "Dr. Thompson, Internal Medicine",
      gapDetail: "Provider group compliance rate: 68%",
      priority: "medium",
      daysOverdue: 5,
    },
    {
      id: "AM014",
      memberId: "MEM-2025-004445",
      memberName: "Thomas, Richard S.",
      age: 71,
      lastVisit: "2024-08-20",
      provider: "Dr. Adams, Family Medicine",
      gapDetail: "Provider group compliance rate: 65%",
      priority: "high",
      daysOverdue: 60,
    },
    {
      id: "AM015",
      memberId: "MEM-2025-004556",
      memberName: "Garcia, Nancy L.",
      age: 60,
      lastVisit: "2024-10-12",
      provider: "Dr. Thompson, Internal Medicine",
      gapDetail: "Provider group compliance rate: 68%",
      priority: "medium",
      daysOverdue: 25,
    },
  ],
};

type MemberFilterStatus =
  | "all"
  | "compliant"
  | "non-compliant"
  | "excluded"
  | "pending";

export function DetailedReportModal({ onClose }: DetailedReportModalProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "trends" | "gaps"
  >("overview");
  const [memberFilter, setMemberFilter] = useState<MemberFilterStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "date" | "quality">("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showChartModal, setShowChartModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<
    (typeof mockMemberData)[0] | null
  >(null);
  const [showAffectedMembersModal, setShowAffectedMembersModal] =
    useState(false);
  const [selectedGap, setSelectedGap] = useState<
    (typeof mockGapAnalysis)[0] | null
  >(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [taskMember, setTaskMember] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showBulkOutreachModal, setShowBulkOutreachModal] = useState(false);

  const filteredMembers = mockMemberData
    .filter((m) => {
      if (memberFilter !== "all" && m.complianceStatus !== memberFilter)
        return false;
      if (
        searchQuery &&
        !m.memberName.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !m.memberId.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "name") {
        comparison = a.memberName.localeCompare(b.memberName);
      } else if (sortBy === "date") {
        comparison = (a.lastServiceDate || "").localeCompare(
          b.lastServiceDate || "",
        );
      } else if (sortBy === "quality") {
        comparison = a.documentationQuality - b.documentationQuality;
      }
      return sortDirection === "asc" ? comparison : -comparison;
    });

  const getComplianceColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "text-green-700 bg-green-50 border-green-200";
      case "non-compliant":
        return "text-red-700 bg-red-50 border-red-200";
      case "excluded":
        return "text-gray-700 bg-gray-50 border-gray-200";
      case "pending":
        return "text-orange-700 bg-orange-50 border-orange-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Detailed Measure Report
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              CBP - Controlling High Blood Pressure • MY2025 • Commercial
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-2 border border-border bg-card hover:bg-accent rounded-lg transition-colors text-sm">
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border flex-shrink-0 px-6">
          <div className="flex gap-6">
            {[
              {
                id: "overview",
                label: "Performance Overview",
                icon: BarChart3,
              },
              { id: "members", label: "Member Details", icon: Users },
              { id: "trends", label: "Trends & Analytics", icon: TrendingUp },
              { id: "gaps", label: "Gap Analysis", icon: Target },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`pb-3 px-1 border-b-2 transition-colors text-sm font-medium flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Performance Rate
                    </span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-semibold text-foreground">
                    84.7%
                  </div>
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +4.7% vs target
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Compliant Members
                    </span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-3xl font-semibold text-foreground">
                    847
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    of 1,000 eligible
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Avg Quality Score
                    </span>
                    <Award className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-3xl font-semibold text-foreground">
                    89.2
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Documentation quality
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      Potential Gain
                    </span>
                    <Target className="w-4 h-4 text-orange-600" />
                  </div>
                  <div className="text-3xl font-semibold text-foreground">
                    11.1%
                  </div>
                  <div className="text-xs text-orange-600 font-medium mt-1">
                    111 addressable gaps
                  </div>
                </div>
              </div>

              {/* Benchmark Comparison */}
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Benchmark Comparison
                </h3>
                <div className="space-y-3">
                  {mockBenchmarks.map((benchmark, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-40 text-sm text-foreground font-medium">
                        {benchmark.label}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-6 relative">
                        <div
                          className={`${benchmark.color} h-6 rounded-full flex items-center justify-end px-2 transition-all`}
                          style={{ width: `${(benchmark.value / 100) * 100}%` }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {benchmark.value}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Distribution */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Compliance Status
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-foreground">
                          Compliant
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          847
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          84.7%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <span className="text-sm text-foreground">
                          Non-Compliant
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          111
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          11.1%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-gray-400" />
                        <span className="text-sm text-foreground">
                          Excluded
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          42
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          4.2%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documentation Quality
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-foreground">
                          Excellent (90-100)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          523
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          61.8%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm text-foreground">
                          Good (75-89)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          234
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          27.6%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-sm text-foreground">
                          Fair (&lt;75)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground">
                          90
                        </span>
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          10.6%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === "members" && (
            <div className="space-y-4">
              {/* Filters and Search */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filter:</span>
                  <div className="flex gap-2">
                    {(
                      [
                        "all",
                        "compliant",
                        "non-compliant",
                        "excluded",
                        "pending",
                      ] as MemberFilterStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        onClick={() => setMemberFilter(status)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          memberFilter === status
                            ? "bg-primary text-white"
                            : "bg-muted text-muted-foreground hover:bg-muted/70"
                        }`}
                      >
                        {status === "all"
                          ? "All"
                          : status.charAt(0).toUpperCase() +
                            status.slice(1).replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-border rounded-lg bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-80"
                  />
                </div>
              </div>

              {/* Members Table */}
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <button
                            onClick={() => {
                              if (sortBy === "name") {
                                setSortDirection(
                                  sortDirection === "asc" ? "desc" : "asc",
                                );
                              } else {
                                setSortBy("name");
                                setSortDirection("asc");
                              }
                            }}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Member
                            {sortBy === "name" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <button
                            onClick={() => {
                              if (sortBy === "date") {
                                setSortDirection(
                                  sortDirection === "asc" ? "desc" : "asc",
                                );
                              } else {
                                setSortBy("date");
                                setSortDirection("desc");
                              }
                            }}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Service Date
                            {sortBy === "date" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Provider
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <button
                            onClick={() => {
                              if (sortBy === "quality") {
                                setSortDirection(
                                  sortDirection === "asc" ? "desc" : "asc",
                                );
                              } else {
                                setSortBy("quality");
                                setSortDirection("desc");
                              }
                            }}
                            className="flex items-center gap-1 hover:text-foreground mx-auto"
                          >
                            Quality
                            {sortBy === "quality" &&
                              (sortDirection === "asc" ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              ))}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Evidence
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Review Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-foreground">
                              {member.memberName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.memberId} • Age {member.age}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getComplianceColor(member.complianceStatus)}`}
                            >
                              {member.complianceStatus === "compliant" && (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {member.complianceStatus === "non-compliant" && (
                                <XCircle className="w-3 h-3" />
                              )}
                              {member.complianceStatus === "excluded" && (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {member.complianceStatus === "pending" && (
                                <Clock className="w-3 h-3" />
                              )}
                              {member.complianceStatus.charAt(0).toUpperCase() +
                                member.complianceStatus
                                  .slice(1)
                                  .replace("-", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-foreground">
                              {member.lastServiceDate}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-foreground">
                              {member.provider}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {member.documentationQuality > 0 ? (
                              <div
                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                  member.documentationQuality >= 90
                                    ? "bg-green-50 text-green-700"
                                    : member.documentationQuality >= 75
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-orange-50 text-orange-700"
                                }`}
                              >
                                {member.documentationQuality}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                N/A
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className="text-sm text-foreground">
                              {member.evidenceCount}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-foreground">
                              {member.reviewStatus}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {member.reviewer}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMember(member);
                                  setShowChartModal(true);
                                }}
                                className="text-xs text-primary font-medium hover:underline"
                                title="View member chart"
                              >
                                View Chart
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                Showing {filteredMembers.length} of {mockMemberData.length}{" "}
                members
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === "trends" && (
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-5">
                <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Trend (MY2024)
                </h3>
                <div className="space-y-2">
                  {mockTrendData.map((data, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-24 text-xs text-muted-foreground">
                        {data.month}
                      </div>
                      <div className="flex-1 bg-muted rounded-full h-8 relative">
                        <div
                          className="bg-primary h-8 rounded-full flex items-center justify-between px-3 transition-all"
                          style={{ width: `${(data.rate / 100) * 100}%` }}
                        >
                          <span className="text-xs font-semibold text-white">
                            {data.rate}%
                          </span>
                          <span className="text-xs text-white/80">
                            {data.numerator}/{data.denominator}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-4">
                    Key Insights
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Steady Improvement
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          6.5 percentage point increase from Jan to Dec 2024
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Target Achieved
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Exceeded 80% target starting in March 2024
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Activity className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Stable Performance
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          Maintained 84%+ rate for last 4 months
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-5">
                  <h3 className="text-base font-semibold text-foreground mb-4">
                    Year-over-Year
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        MY2023 Final Rate
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        78.2%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        MY2024 Current Rate
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        84.7%
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <span className="text-sm font-medium text-foreground">
                        Improvement
                      </span>
                      <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        +6.5%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gaps Tab */}
          {activeTab === "gaps" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">
                      Gap Analysis Overview
                    </h3>
                    <p className="text-sm text-blue-700">
                      Identified{" "}
                      <span className="font-semibold">
                        111 addressable gaps
                      </span>{" "}
                      representing a potential{" "}
                      <span className="font-semibold">
                        11.1 percentage point improvement
                      </span>{" "}
                      to reach 95.8% performance rate
                    </p>
                  </div>
                </div>
              </div>

              {mockGapAnalysis.map((gap, idx) => (
                <div
                  key={idx}
                  className="bg-card border border-border rounded-lg p-5"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      {gap.actionable ? (
                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                      )}
                      <div>
                        <h4 className="text-base font-semibold text-foreground">
                          {gap.category}
                        </h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {gap.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-foreground">
                        {gap.count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        members
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-xs text-muted-foreground">
                          Potential Impact:
                        </span>
                        <span
                          className={`ml-2 text-sm font-semibold ${
                            gap.impact < 0 ? "text-red-600" : "text-green-600"
                          }`}
                        >
                          {gap.impact > 0 ? "+" : ""}
                          {gap.impact}%
                        </span>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                            gap.actionable
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-gray-50 text-gray-700 border border-gray-200"
                          }`}
                        >
                          {gap.actionable ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Actionable
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              System Issue
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    {gap.actionable && (
                      <button
                        onClick={() => {
                          setSelectedGap(gap);
                          setShowAffectedMembersModal(true);
                        }}
                        className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        View Affected Members
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Viewer Modal */}
      {showChartModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Chart Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Medical Chart Viewer
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedMember.memberName} • {selectedMember.memberId}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowChartModal(false);
                  setSelectedMember(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Chart Modal Content */}
            <div className="flex-1 overflow-hidden flex">
              {/* Left Panel - Patient Info */}
              <div className="w-64 bg-card border-r border-border flex flex-col overflow-hidden">
                <div className="sticky top-0 p-4 border-b border-border bg-card z-10">
                  <h4 className="text-sm font-semibold text-foreground">
                    Patient Information
                  </h4>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Name
                          </div>
                          <div className="text-sm text-foreground font-medium">
                            {selectedMember.memberName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <FileText className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Member ID
                          </div>
                          <div className="text-sm text-foreground font-medium">
                            {selectedMember.memberId}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Age
                          </div>
                          <div className="text-sm text-foreground font-medium">
                            {selectedMember.age} years
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Activity className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Compliance Status
                          </div>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getComplianceColor(selectedMember.complianceStatus)}`}
                            >
                              {selectedMember.complianceStatus ===
                                "compliant" && (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {selectedMember.complianceStatus ===
                                "non-compliant" && (
                                <XCircle className="w-3 h-3" />
                              )}
                              {selectedMember.complianceStatus ===
                                "excluded" && (
                                <AlertCircle className="w-3 h-3" />
                              )}
                              {selectedMember.complianceStatus
                                .charAt(0)
                                .toUpperCase() +
                                selectedMember.complianceStatus
                                  .slice(1)
                                  .replace("-", " ")}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Last Service Date
                          </div>
                          <div className="text-sm text-foreground font-medium">
                            {selectedMember.lastServiceDate}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Users className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Provider
                          </div>
                          <div className="text-sm text-foreground">
                            {selectedMember.provider}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <Award className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Documentation Quality
                          </div>
                          <div className="text-sm">
                            {selectedMember.documentationQuality > 0 ? (
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  selectedMember.documentationQuality >= 90
                                    ? "bg-green-50 text-green-700"
                                    : selectedMember.documentationQuality >= 75
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-orange-50 text-orange-700"
                                }`}
                              >
                                {selectedMember.documentationQuality}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                N/A
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Review Information */}
                    <div className="pt-4 border-t border-border">
                      <h4 className="text-sm font-semibold text-foreground mb-3">
                        Review Details
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Abstractor
                          </div>
                          <div className="text-sm text-foreground">
                            {selectedMember.abstractor}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Reviewer
                          </div>
                          <div className="text-sm text-foreground">
                            {selectedMember.reviewer}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Review Status
                          </div>
                          <div className="text-sm text-foreground capitalize">
                            {selectedMember.reviewStatus}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">
                            Evidence Count
                          </div>
                          <div className="text-sm text-foreground">
                            {selectedMember.evidenceCount} document(s)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    {selectedMember.notes && (
                      <div className="pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground mb-2">
                          Notes
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {selectedMember.notes}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Document Viewer */}
              <div className="flex-1 flex flex-col overflow-hidden bg-muted/20">
                {/* Document Toolbar */}
                <div className="bg-card border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-foreground">
                      Medical Documents
                    </span>
                    <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-semibold rounded">
                      {selectedMember.evidenceCount}{" "}
                      {selectedMember.evidenceCount === 1
                        ? "Document"
                        : "Documents"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg border border-border bg-card hover:bg-accent transition-colors text-xs">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Document Content Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="max-w-4xl mx-auto space-y-4">
                    {/* Document Cards */}
                    {Array.from({ length: selectedMember.evidenceCount }).map(
                      (_, idx) => (
                        <div
                          key={idx}
                          className="bg-card border border-border rounded-lg overflow-hidden"
                        >
                          {/* Document Header */}
                          <div className="bg-muted/30 px-4 py-3 border-b border-border">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-primary" />
                                <div>
                                  <div className="text-sm font-semibold text-foreground">
                                    {idx === 0
                                      ? "Progress Note"
                                      : idx === 1
                                        ? "Lab Results"
                                        : "Blood Pressure Reading"}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {selectedMember.lastServiceDate} •{" "}
                                    {selectedMember.provider}
                                  </div>
                                </div>
                              </div>
                              <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-card hover:bg-accent border border-border rounded text-xs transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                                Open Full View
                              </button>
                            </div>
                          </div>

                          {/* Document Content */}
                          <div className="p-6 bg-white">
                            <div className="space-y-4 text-sm">
                              {idx === 0 && (
                                <>
                                  <div>
                                    <div className="font-semibold text-gray-900 mb-1">
                                      Chief Complaint:
                                    </div>
                                    <div className="text-gray-700">
                                      Routine follow-up for hypertension
                                      management
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 mb-1">
                                      Vital Signs:
                                    </div>
                                    <div className="text-gray-700">
                                      BP:{" "}
                                      <span className="bg-blue-200 px-1">
                                        138/88 mmHg
                                      </span>
                                      , HR: 72 bpm, Temp: 98.6°F, Weight: 165
                                      lbs
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 mb-1">
                                      Assessment:
                                    </div>
                                    <div className="text-gray-700">
                                      <span className="bg-yellow-200 px-1">
                                        Hypertension
                                      </span>{" "}
                                      - adequately controlled on current
                                      medication regimen
                                    </div>
                                  </div>
                                  <div>
                                    <div className="font-semibold text-gray-900 mb-1">
                                      Plan:
                                    </div>
                                    <div className="text-gray-700">
                                      - Continue current BP medications
                                      <br />
                                      - Follow-up in 3 months
                                      <br />- Home BP monitoring recommended
                                    </div>
                                  </div>
                                </>
                              )}
                              {idx === 1 && (
                                <>
                                  <div>
                                    <div className="font-semibold text-gray-900 mb-1">
                                      Lab Results:
                                    </div>
                                    <div className="space-y-1 text-gray-700">
                                      <div>Creatinine: 1.1 mg/dL (Normal)</div>
                                      <div>Sodium: 140 mEq/L (Normal)</div>
                                      <div>Potassium: 4.2 mEq/L (Normal)</div>
                                      <div className="bg-green-200 px-1 inline-block">
                                        All values within normal limits
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                              {idx === 2 && (
                                <>
                                  <div>
                                    <div className="font-semibold text-gray-900 mb-1">
                                      Blood Pressure Reading:
                                    </div>
                                    <div className="text-gray-700">
                                      <span className="bg-blue-200 px-1">
                                        BP: 132/82 mmHg
                                      </span>{" "}
                                      - Controlled
                                      <br />
                                      Measured: {selectedMember.lastServiceDate}
                                      <br />
                                      Location:{" "}
                                      {selectedMember.provider.split(",")[0]}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Evidence Footer */}
                          <div className="bg-muted/20 px-4 py-2 border-t border-border">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3 text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3 text-green-600" />
                                  Meets criteria
                                </span>
                                <span>
                                  Quality Score:{" "}
                                  {selectedMember.documentationQuality}
                                </span>
                              </div>
                              <span className="text-muted-foreground">
                                Page 1 of 1
                              </span>
                            </div>
                          </div>
                        </div>
                      ),
                    )}

                    {/* No Documents Message */}
                    {selectedMember.evidenceCount === 0 && (
                      <div className="bg-card border border-border rounded-lg p-8 text-center">
                        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                        <div className="text-sm font-medium text-foreground mb-1">
                          No Medical Documents
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {selectedMember.complianceStatus === "excluded"
                            ? "Member is excluded from this measure"
                            : "No evidence documents have been submitted for this member"}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart Modal Footer */}
            <div className="px-6 py-3 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
              <div className="text-xs text-muted-foreground">
                Measure: CBP - Controlling High Blood Pressure • MY2025
              </div>
              <button
                onClick={() => {
                  setShowChartModal(false);
                  setSelectedMember(null);
                }}
                className="px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Affected Members Modal */}
      {showAffectedMembersModal && selectedGap && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Affected Members Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Affected Members - Gap Analysis
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedGap.category} • {selectedGap.count} Members •{" "}
                  {Math.abs(selectedGap.impact)}% Impact
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAffectedMembersModal(false);
                  setSelectedGap(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Gap Summary Banner */}
            <div className="px-6 py-4 bg-orange-50 border-b border-orange-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-orange-900 mb-1">
                    Gap Description
                  </div>
                  <div className="text-sm text-orange-800">
                    {selectedGap.description}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs">
                    <span className="flex items-center gap-1 text-orange-700">
                      <Target className="w-3 h-3" />
                      Performance Impact:{" "}
                      <span className="font-semibold">
                        {Math.abs(selectedGap.impact)}%
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-orange-700">
                      <Users className="w-3 h-3" />
                      Total Members:{" "}
                      <span className="font-semibold">{selectedGap.count}</span>
                    </span>
                    {selectedGap.actionable && (
                      <span className="flex items-center gap-1 text-green-700 bg-green-100 px-2 py-0.5 rounded">
                        <CheckCircle className="w-3 h-3" />
                        Actionable
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Priority Filter and Actions */}
            <div className="px-6 py-3 border-b border-border bg-muted/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">
                  Filter by Priority:
                </span>
                <div className="flex gap-2">
                  {["All", "High", "Medium", "Low"].map((priority) => (
                    <button
                      key={priority}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        priority === "All"
                          ? "bg-primary text-white"
                          : "bg-card border border-border text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowExportModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 border border-border bg-card hover:bg-accent rounded-lg text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Export List
                </button>
                <button
                  onClick={() => setShowBulkOutreachModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded-lg text-xs font-medium transition-colors"
                >
                  <Target className="w-3.5 h-3.5" />
                  Bulk Outreach
                </button>
              </div>
            </div>

            {/* Affected Members Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-3">
                {(mockAffectedMembersByGap[selectedGap.category] || []).map(
                  (member) => (
                    <div
                      key={member.id}
                      className="bg-card border border-border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          {/* Member Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <div className="text-sm font-semibold text-foreground">
                                  {member.memberName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {member.memberId} • Age {member.age}
                                </div>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  member.priority === "high"
                                    ? "bg-red-100 text-red-700"
                                    : member.priority === "medium"
                                      ? "bg-orange-100 text-orange-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {member.priority.toUpperCase()} PRIORITY
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  Last Visit:
                                </span>
                                <span className="text-foreground font-medium">
                                  {member.lastVisit}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">
                                  Provider:
                                </span>
                                <span className="text-foreground font-medium">
                                  {member.provider}
                                </span>
                              </div>
                              {member.daysOverdue > 0 && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
                                  <span className="text-muted-foreground">
                                    Days Overdue:
                                  </span>
                                  <span className="text-red-600 font-semibold">
                                    {member.daysOverdue}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Gap Detail */}
                            <div className="mt-3 p-3 bg-muted/50 rounded border border-border">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-xs font-semibold text-foreground mb-0.5">
                                    Gap Issue:
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {member.gapDetail}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button
                              onClick={() => {
                                // Create a temporary member object that matches mockMemberData structure
                                const tempMember = {
                                  id: member.id,
                                  memberId: member.memberId,
                                  memberName: member.memberName,
                                  age: member.age,
                                  complianceStatus: "non-compliant" as const,
                                  lastServiceDate: member.lastVisit,
                                  provider: member.provider,
                                  documentationQuality: 0,
                                  evidenceCount: 0,
                                  reviewStatus: "pending",
                                  abstractor: "Pending",
                                  reviewer: "Pending",
                                  notes: member.gapDetail,
                                };
                                setSelectedMember(tempMember);
                                setShowChartModal(true);
                                setShowAffectedMembersModal(false);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card hover:bg-accent rounded text-xs font-medium transition-colors whitespace-nowrap"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              View Chart
                            </button>
                            <button
                              onClick={() => {
                                setTaskMember(member);
                                setShowCreateTaskModal(true);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary/90 rounded text-xs font-medium transition-colors whitespace-nowrap"
                            >
                              <Target className="w-3.5 h-3.5" />
                              Create Task
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Recommendations Footer */}
                      <div className="px-4 py-2 bg-blue-50 border-t border-blue-200 rounded-b-lg">
                        <div className="flex items-center gap-2 text-xs">
                          <Award className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-blue-900 font-medium">
                            Recommended Action:
                          </span>
                          <span className="text-blue-800">
                            {selectedGap.category === "Missing Evidence" &&
                              "Schedule follow-up appointment for BP measurement"}
                            {selectedGap.category === "Documentation Quality" &&
                              "Request chart correction from provider"}
                            {selectedGap.category === "Provider Variation" &&
                              "Conduct provider education and outreach"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>

              {/* Empty State */}
              {(!mockAffectedMembersByGap[selectedGap.category] ||
                mockAffectedMembersByGap[selectedGap.category].length ===
                  0) && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <div className="text-sm font-medium text-foreground mb-1">
                    No Affected Members
                  </div>
                  <div className="text-xs text-muted-foreground">
                    There are no members affected by this gap category
                  </div>
                </div>
              )}
            </div>

            {/* Affected Members Modal Footer */}
            <div className="px-6 py-3 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
              <div className="text-xs text-muted-foreground">
                Showing{" "}
                {mockAffectedMembersByGap[selectedGap.category]?.length || 0}{" "}
                members • Potential gain: {Math.abs(selectedGap.impact)}%
                performance improvement
              </div>
              <button
                onClick={() => {
                  setShowAffectedMembersModal(false);
                  setSelectedGap(null);
                }}
                className="px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTaskModal && taskMember && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Create Task Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Create Task
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Assign task for member gap closure
                </p>
              </div>
              <button
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setTaskMember(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Create Task Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* Member Context Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-blue-900 mb-1">
                        Member Information
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                        <div className="text-blue-800">
                          <span className="font-medium">Name:</span>{" "}
                          {taskMember.memberName}
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">ID:</span>{" "}
                          {taskMember.memberId}
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">Age:</span>{" "}
                          {taskMember.age}
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">Last Visit:</span>{" "}
                          {taskMember.lastVisit}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-blue-800">
                        <span className="font-medium">Provider:</span>{" "}
                        {taskMember.provider}
                      </div>
                      <div className="mt-2 pt-2 border-t border-blue-200">
                        <div className="text-xs text-blue-800">
                          <span className="font-medium">Gap Issue:</span>{" "}
                          {taskMember.gapDetail}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Measure & Gap Category (Auto-filled) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      HEDIS Measure
                    </label>
                    <div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground">
                      CBP - Controlling High Blood Pressure
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Gap Category
                    </label>
                    <div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground">
                      {selectedGap?.category || "Missing Evidence"}
                    </div>
                  </div>
                </div>

                {/* Task Type */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Task Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      {
                        value: "outreach",
                        label: "Member Outreach",
                        icon: Phone,
                      },
                      {
                        value: "chart-review",
                        label: "Chart Review Request",
                        icon: FileText,
                      },
                      {
                        value: "provider-contact",
                        label: "Provider Contact",
                        icon: UserPlus,
                      },
                      {
                        value: "appointment",
                        label: "Schedule Appointment",
                        icon: Calendar,
                      },
                      {
                        value: "documentation",
                        label: "Documentation Correction",
                        icon: ClipboardList,
                      },
                      { value: "other", label: "Other", icon: Target },
                    ].map((taskType) => (
                      <button
                        key={taskType.value}
                        className="flex items-center gap-2 px-3 py-2.5 border-2 border-border hover:border-primary bg-card hover:bg-accent rounded-lg text-sm transition-colors text-left"
                      >
                        <taskType.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-foreground font-medium">
                          {taskType.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Priority Level */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Priority Level <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="px-4 py-2.5 border-2 border-red-300 bg-red-50 rounded-lg text-sm font-semibold text-red-700 hover:border-red-500 transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <Flag className="w-4 h-4" />
                        High
                      </div>
                    </button>
                    <button className="px-4 py-2.5 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium text-foreground transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <Flag className="w-4 h-4" />
                        Medium
                      </div>
                    </button>
                    <button className="px-4 py-2.5 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium text-foreground transition-colors">
                      <div className="flex items-center justify-center gap-2">
                        <Flag className="w-4 h-4" />
                        Low
                      </div>
                    </button>
                  </div>
                </div>

                {/* Assignment */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Assign To <span className="text-red-500">*</span>
                    </label>
                    <select className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                      <option value="">Select team member...</option>
                      <option value="sarah">Sarah Johnson - Abstractor</option>
                      <option value="michael">
                        Michael Chen - Lead Abstractor
                      </option>
                      <option value="emily">
                        Emily Rodriguez - Care Coordinator
                      </option>
                      <option value="david">David Kim - Quality Analyst</option>
                      <option value="jennifer">
                        Jennifer Lee - Nurse Reviewer
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Due Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      defaultValue="2025-02-17"
                      className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Task Description */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Task Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed task instructions and expectations..."
                    defaultValue={`Contact member ${taskMember.memberName} to schedule follow-up appointment for BP measurement.\n\nGap: ${taskMember.gapDetail}\nDays Overdue: ${taskMember.daysOverdue || 0}\n\nAction Required: Coordinate with ${taskMember.provider} to schedule in-office visit within 7 days.`}
                    className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  ></textarea>
                </div>

                {/* Notification Options */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Notifications
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Send email notification to assignee
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Add to assignee's work queue
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Send reminder 24 hours before due date
                      </span>
                    </label>
                  </div>
                </div>

                {/* Auto-Actions */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-green-900 mb-1">
                        Automated Actions
                      </div>
                      <div className="text-xs text-green-800 space-y-1">
                        <div>✓ Task will be logged in audit trail</div>
                        <div>
                          ✓ Member record will be flagged with pending action
                        </div>
                        <div>
                          ✓ Performance metrics will be updated upon completion
                        </div>
                        <div>
                          ✓ Gap analysis dashboard will reflect active
                          intervention
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Create Task Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
              <button
                onClick={() => {
                  setShowCreateTaskModal(false);
                  setTaskMember(null);
                }}
                className="px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors">
                  <Download className="w-4 h-4" />
                  Save as Draft
                </button>
                <button
                  onClick={() => {
                    // Here you would submit the task
                    setShowCreateTaskModal(false);
                    setTaskMember(null);
                    // Show success message (could add toast notification)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export List Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* Export Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Export Member List
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configure export settings and field selection
                </p>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Export Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-5">
                {/* HIPAA Compliance Notice */}
                <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-sm font-semibold text-amber-900 mb-1">
                        HIPAA Compliance Notice
                      </div>
                      <div className="text-xs text-amber-800">
                        This export contains Protected Health Information (PHI).
                        Ensure the exported file is:
                        <ul className="list-disc ml-4 mt-1 space-y-0.5">
                          <li>
                            Stored on encrypted, HIPAA-compliant systems only
                          </li>
                          <li>
                            Shared only with authorized personnel via secure
                            channels
                          </li>
                          <li>
                            Deleted securely after use according to retention
                            policies
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Format */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Export Format <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="px-4 py-3 border-2 border-primary bg-primary/5 rounded-lg text-sm font-semibold transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="w-5 h-5 text-primary" />
                        <span className="text-foreground">Excel (.xlsx)</span>
                        <span className="text-xs text-muted-foreground">
                          Formatted tables
                        </span>
                      </div>
                    </button>
                    <button className="px-4 py-3 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="text-foreground">CSV (.csv)</span>
                        <span className="text-xs text-muted-foreground">
                          Raw data
                        </span>
                      </div>
                    </button>
                    <button className="px-4 py-3 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <span className="text-foreground">PDF (.pdf)</span>
                        <span className="text-xs text-muted-foreground">
                          Print ready
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Field Selection */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Fields to Include <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-border rounded-lg p-4 bg-card">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Member ID
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Member Name
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Date of Birth
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Age
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Gap Category
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Gap Detail
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Priority Level
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Days Overdue
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Last Visit Date
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground font-medium">
                          Provider Name
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          Phone Number
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          Email Address
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          Insurance Plan
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          PCP Name
                        </span>
                      </label>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                      <button className="text-xs text-primary font-medium hover:underline">
                        Select All
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground hover:underline">
                        Clear All
                      </button>
                    </div>
                  </div>
                </div>

                {/* Filter Options */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Filter Options
                  </label>
                  <div className="border border-border rounded-lg p-4 bg-card space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                        Include Members
                      </label>
                      <select className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="all">
                          All Members (
                          {selectedGap
                            ? mockAffectedMembersByGap[selectedGap.category]
                                ?.length || 0
                            : "243"}
                          )
                        </option>
                        <option value="high-priority">
                          High Priority Only (45)
                        </option>
                        <option value="overdue">Overdue Only (78)</option>
                        <option value="active">Active Gaps Only (189)</option>
                        <option value="closed">Closed Gaps Only (54)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Date Range Start
                        </label>
                        <input
                          type="date"
                          defaultValue="2025-01-01"
                          className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Date Range End
                        </label>
                        <input
                          type="date"
                          defaultValue="2025-12-31"
                          className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* File Naming */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    File Name
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      defaultValue={`CBP_Member_List_${new Date().toISOString().split("T")[0]}`}
                      className="flex-1 px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="px-3 py-2 bg-muted border border-border rounded-lg text-sm text-muted-foreground">
                      .xlsx
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    File will include timestamp and measure code for tracking
                  </p>
                </div>

                {/* Export Preview */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Eye className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-blue-900 mb-2">
                        Export Preview
                      </div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        <div className="text-blue-800">
                          <span className="font-medium">Total Records:</span>{" "}
                          {selectedGap
                            ? mockAffectedMembersByGap[selectedGap.category]
                                ?.length || 0
                            : "243"}{" "}
                          members
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">Fields Selected:</span>{" "}
                          10 of 14
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">File Format:</span>{" "}
                          Excel Workbook
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">Est. File Size:</span>{" "}
                          ~125 KB
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">Measure:</span> CBP -
                          Controlling High Blood Pressure
                        </div>
                        <div className="text-blue-800">
                          <span className="font-medium">Gap Category:</span>{" "}
                          {selectedGap?.category || "All Categories"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Options */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Additional Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Include header row with column names
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Apply conditional formatting for priority levels
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Include summary sheet with gap analysis
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                      />
                      <span className="text-sm text-foreground">
                        Log export action in audit trail
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Export Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors">
                  <Settings className="w-4 h-4" />
                  Save Template
                </button>
                <button
                  onClick={() => {
                    // Here you would trigger the export
                    setShowExportModal(false);
                    // Show success message (could add toast notification)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Outreach Modal */}
      {showBulkOutreachModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
            {/* Bulk Outreach Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Bulk Outreach Campaign
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Configure and launch member outreach for care gap closure
                </p>
              </div>
              <button
                onClick={() => setShowBulkOutreachModal(false)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Outreach Configuration Form */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Configuration */}
                <div className="col-span-2 space-y-5">
                  {/* Compliance Notice */}
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-amber-900 mb-1">
                          HIPAA & TCPA Compliance Required
                        </div>
                        <div className="text-xs text-amber-800">
                          All outreach must comply with:
                          <ul className="list-disc ml-4 mt-1 space-y-0.5">
                            <li>
                              HIPAA Privacy Rules for PHI in communications
                            </li>
                            <li>TCPA consent requirements for calls/texts</li>
                            <li>CMS Marketing & Communications guidelines</li>
                            <li>
                              State-specific consent and opt-out regulations
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Outreach Channel Selection */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Outreach Channel <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                      <button className="px-3 py-3 border-2 border-primary bg-primary/5 rounded-lg text-sm font-semibold transition-colors">
                        <div className="flex flex-col items-center gap-1.5">
                          <Phone className="w-5 h-5 text-primary" />
                          <span className="text-foreground text-xs">
                            Phone Call
                          </span>
                        </div>
                      </button>
                      <button className="px-3 py-3 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                        <div className="flex flex-col items-center gap-1.5">
                          <Smartphone className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground text-xs">
                            SMS Text
                          </span>
                        </div>
                      </button>
                      <button className="px-3 py-3 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                        <div className="flex flex-col items-center gap-1.5">
                          <Mail className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground text-xs">Email</span>
                        </div>
                      </button>
                      <button className="px-3 py-3 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                        <div className="flex flex-col items-center gap-1.5">
                          <Mailbox className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground text-xs">Mail</span>
                        </div>
                      </button>
                      <button className="px-3 py-3 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                        <div className="flex flex-col items-center gap-1.5">
                          <MessageSquare className="w-5 h-5 text-muted-foreground" />
                          <span className="text-foreground text-xs">
                            Portal
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Target Audience <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                          Member Selection
                        </label>
                        <select className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                          <option value="all">
                            All Gap Members (243 members)
                          </option>
                          <option value="high-priority">
                            High Priority Only (45 members)
                          </option>
                          <option value="overdue">
                            Overdue Only (78 members)
                          </option>
                          <option value="no-bp-reading">
                            No BP Reading in 12mo (156 members)
                          </option>
                          <option value="uncontrolled">
                            Uncontrolled BP (87 members)
                          </option>
                          <option value="custom">Custom Filter...</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <label className="text-sm text-foreground">
                          Only include members with verified contact consent
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <label className="text-sm text-foreground">
                          Exclude members who opted out of communications
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <label className="text-sm text-foreground">
                          Exclude members contacted in last 30 days
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Message Template */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Message Template <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                      <select className="w-full px-3 py-2 border border-border bg-card rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                        <option value="">
                          Select a pre-approved template...
                        </option>
                        <option value="bp-checkup">
                          Blood Pressure Checkup Reminder (Approved)
                        </option>
                        <option value="annual-wellness">
                          Annual Wellness Visit (Approved)
                        </option>
                        <option value="screening-due">
                          Preventive Screening Due (Approved)
                        </option>
                        <option value="medication-adherence">
                          Medication Adherence (Approved)
                        </option>
                        <option value="custom">
                          Create Custom Template (Requires Approval)
                        </option>
                      </select>
                      <div className="border border-border rounded-lg bg-card">
                        <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground">
                            Message Content
                          </span>
                          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <Edit className="w-3 h-3" />
                            Customize
                          </button>
                        </div>
                        <div className="p-4">
                          <div className="text-sm text-foreground space-y-2">
                            <p className="font-medium">
                              Hi {"{{FirstName}}"} {"{{LastName}}"},
                            </p>
                            <p>
                              This is a friendly reminder from{" "}
                              {"{{HealthPlanName}}"} about your blood pressure
                              management. Our records show you may be due for a
                              blood pressure check.
                            </p>
                            <p>
                              Regular monitoring helps prevent serious health
                              complications. Please schedule an appointment with{" "}
                              {"{{PCPName}}"} at {"{{PCPPhone}}"} or call our
                              Member Services at 1-800-XXX-XXXX.
                            </p>
                            <p className="font-medium">
                              Best regards,
                              <br />
                              Your Care Team
                            </p>
                          </div>
                        </div>
                        <div className="px-3 py-2 border-t border-border">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-muted-foreground">
                              Merge Fields:
                            </span>
                            <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {"{{FirstName}}"}
                            </button>
                            <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {"{{LastName}}"}
                            </button>
                            <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {"{{PCPName}}"}
                            </button>
                            <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              {"{{GapType}}"}
                            </button>
                            <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                              +5 more
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scheduling Options */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Scheduling <span className="text-red-500">*</span>
                    </label>
                    <div className="border border-border rounded-lg p-4 bg-card space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        <button className="px-3 py-2 border-2 border-primary bg-primary/5 rounded-lg text-sm font-semibold transition-colors">
                          Send Now
                        </button>
                        <button className="px-3 py-2 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                          Schedule Later
                        </button>
                        <button className="px-3 py-2 border-2 border-border bg-card hover:border-primary rounded-lg text-sm font-medium transition-colors">
                          Recurring
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Send Date
                          </label>
                          <input
                            type="date"
                            defaultValue={
                              new Date().toISOString().split("T")[0]
                            }
                            className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                            Send Time (ET)
                          </label>
                          <input
                            type="time"
                            defaultValue="09:00"
                            className="w-full px-3 py-2 border border-border bg-background rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5 inline mr-1" />
                        Calls will be placed during business hours (9 AM - 5 PM
                        local time) to respect member preferences
                      </div>
                    </div>
                  </div>

                  {/* Advanced Options */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Advanced Options
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          Track response rates and engagement
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          Log all outreach attempts in member record
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          Send confirmation summary to campaign creator
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          Enable A/B testing with variant messages
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Preview & Summary */}
                <div className="space-y-5">
                  {/* Campaign Summary */}
                  <div className="border border-border rounded-lg bg-card">
                    <div className="px-4 py-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">
                        Campaign Summary
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Target Audience
                        </div>
                        <div className="text-lg font-bold text-foreground">
                          243 Members
                        </div>
                        <div className="text-xs text-muted-foreground">
                          After consent filters: 218 eligible
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">
                          Channel
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium text-foreground">
                            Phone Call
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">
                          Template
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          Blood Pressure Checkup
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle className="w-3 h-3 text-green-600" />
                          <span className="text-xs text-green-700">
                            Compliance Approved
                          </span>
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">
                          Scheduled For
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {new Date().toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          9:00 AM ET
                        </div>
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">
                          Estimated Cost
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          $87.20
                        </div>
                        <div className="text-xs text-muted-foreground">
                          $0.40 per call × 218 members
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="border border-border rounded-lg bg-card">
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-foreground">
                        Message Preview
                      </h4>
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-xs text-blue-900 font-semibold mb-2">
                          Sample Member: John Smith
                        </div>
                        <div className="text-xs text-blue-800 space-y-1.5">
                          <p className="font-medium">Hi John Smith,</p>
                          <p>
                            This is a friendly reminder from Blue Cross Health
                            Plan about your blood pressure management. Our
                            records show you may be due for a blood pressure
                            check.
                          </p>
                          <p>
                            Regular monitoring helps prevent serious health
                            complications. Please schedule an appointment with
                            Dr. Sarah Johnson at (555) 123-4567 or call our
                            Member Services at 1-800-XXX-XXXX.
                          </p>
                          <p className="font-medium">
                            Best regards,
                            <br />
                            Your Care Team
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Checklist */}
                  <div className="border border-border rounded-lg bg-card">
                    <div className="px-4 py-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">
                        Compliance Checks
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          HIPAA-compliant template
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          Consent verification enabled
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          Opt-out list applied
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          Business hours respected
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          Audit logging enabled
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Outreach Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
              <button
                onClick={() => setShowBulkOutreachModal(false)}
                className="px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 border border-border text-foreground hover:bg-accent rounded-lg text-sm font-medium transition-colors">
                  <Save className="w-4 h-4" />
                  Save as Draft
                </button>
                <button
                  onClick={() => {
                    // Here you would launch the campaign
                    setShowBulkOutreachModal(false);
                    // Show success message
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
                >
                  <Send className="w-4 h-4" />
                  Launch Campaign
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
