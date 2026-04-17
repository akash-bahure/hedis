import {
  Shield,
  Download,
  FileText,
  Eye,
  EyeOff,
  Clock,
  User,
  Edit3,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Search,
  Filter,
  ChevronRight,
  Link2,
  Calendar,
  Hash,
  Lock,
  Unlock,
  Package,
  ArrowRight,
  History,
  FileSpreadsheet,
  ExternalLink,
  Info,
  XCircle,
  X,
  Database,
  Activity,
  MapPin,
  Share2,
  GitBranch,
} from "lucide-react";
import { useState } from "react";

type AuditTab =
  | "overview"
  | "traceability"
  | "sampling"
  | "change-history"
  | "packet-generation";

// Mock data for change history
const mockChangeHistory = [
  {
    id: "CH001",
    timestamp: "2025-02-06 14:23:15",
    user: "John Martinez",
    role: "Abstractor",
    measureId: "CBP-2025",
    measureName: "Controlling High Blood Pressure",
    memberId: "M789456",
    memberName: "Johnson, Robert",
    changeType: "Field Edit",
    fieldName: "BP Reading - Systolic",
    oldValue: "145",
    newValue: "142",
    source: "Manual Entry",
    justification: "Corrected misread digit from handwritten chart",
    documentRef: "Chart_789456_20241015.pdf, Page 3",
    reviewStatus: "Approved",
    reviewedBy: "Dr. Sarah Chen",
    reviewedAt: "2025-02-06 15:10:22",
  },
  {
    id: "CH002",
    timestamp: "2025-02-06 13:45:08",
    user: "Lisa Johnson",
    role: "Abstractor",
    measureId: "BCS-2025",
    measureName: "Breast Cancer Screening",
    memberId: "M456789",
    memberName: "Williams, Patricia",
    changeType: "Override",
    fieldName: "Screening Date",
    oldValue: "Not Found",
    newValue: "2024-08-15",
    source: "Document Evidence",
    justification:
      "Mammography report found in supplemental documents folder, was misfiled",
    documentRef: "Mammogram_456789_20240815.pdf, Page 1",
    reviewStatus: "Approved",
    reviewedBy: "Dr. James Park",
    reviewedAt: "2025-02-06 14:02:33",
  },
  {
    id: "CH003",
    timestamp: "2025-02-06 12:18:42",
    user: "Maria Rodriguez",
    role: "QA Reviewer",
    measureId: "CDC-2025",
    measureName: "Comprehensive Diabetes Care",
    memberId: "M234567",
    memberName: "Davis, Michael",
    changeType: "QA Override",
    fieldName: "HbA1c Result",
    oldValue: "7.2%",
    newValue: "6.8%",
    source: "Lab Report Verification",
    justification:
      "Initial value was from preliminary report. Final lab report shows 6.8%",
    documentRef: "LabReport_234567_20240922.pdf, Page 2",
    reviewStatus: "Final",
    reviewedBy: "System",
    reviewedAt: "2025-02-06 12:18:42",
  },
  {
    id: "CH004",
    timestamp: "2025-02-06 11:32:19",
    user: "Robert Kim",
    role: "Abstractor",
    measureId: "COL-2025",
    measureName: "Colorectal Cancer Screening",
    memberId: "M345678",
    memberName: "Garcia, Maria",
    changeType: "Status Change",
    fieldName: "Compliance Status",
    oldValue: "Non-Compliant",
    newValue: "Compliant",
    source: "Document Evidence",
    justification:
      "Colonoscopy report was received after initial review, dated within measurement year",
    documentRef: "Colonoscopy_345678_20241203.pdf, Pages 1-3",
    reviewStatus: "Pending Review",
    reviewedBy: null,
    reviewedAt: null,
  },
  {
    id: "CH005",
    timestamp: "2025-02-06 10:15:33",
    user: "John Martinez",
    role: "Abstractor",
    measureId: "CBP-2025",
    measureName: "Controlling High Blood Pressure",
    memberId: "M567890",
    memberName: "Miller, Jennifer",
    changeType: "Data Correction",
    fieldName: "BP Reading - Diastolic",
    oldValue: "92",
    newValue: "82",
    source: "Manual Entry",
    justification:
      "Transposition error corrected. Original chart clearly shows 82",
    documentRef: "Chart_567890_20240818.pdf, Page 5",
    reviewStatus: "Approved",
    reviewedBy: "Dr. Sarah Chen",
    reviewedAt: "2025-02-06 10:45:12",
  },
];

// Mock data for evidence traceability
const mockTraceability = [
  {
    measureId: "CBP-2025",
    measureName: "Controlling High Blood Pressure",
    memberId: "M789456",
    memberName: "Johnson, Robert",
    numeratorStatus: "Met",
    dataPoints: [
      {
        field: "BP Reading (Systolic/Diastolic)",
        value: "142/88 mmHg",
        source: "Manual Abstraction",
        documentRef: "Chart_789456_20241015.pdf",
        pageNumber: 3,
        annotationId: "ANN-78945-001",
        enteredBy: "John Martinez",
        enteredAt: "2025-02-06 14:23:15",
        verifiedBy: "Dr. Sarah Chen",
        verifiedAt: "2025-02-06 15:10:22",
      },
      {
        field: "Reading Date",
        value: "2024-10-15",
        source: "Extracted from Document",
        documentRef: "Chart_789456_20241015.pdf",
        pageNumber: 3,
        annotationId: "ANN-78945-002",
        enteredBy: "System Auto",
        enteredAt: "2025-02-06 14:20:05",
        verifiedBy: "John Martinez",
        verifiedAt: "2025-02-06 14:23:15",
      },
      {
        field: "Diagnosis - Hypertension",
        value: "ICD-10: I10 (Essential Hypertension)",
        source: "Claims Data",
        documentRef: "Claims_789456_2024Q3.csv",
        pageNumber: null,
        annotationId: null,
        enteredBy: "System Auto",
        enteredAt: "2025-01-15 03:22:10",
        verifiedBy: null,
        verifiedAt: null,
      },
    ],
  },
  {
    measureId: "BCS-2025",
    measureName: "Breast Cancer Screening",
    memberId: "M456789",
    memberName: "Williams, Patricia",
    numeratorStatus: "Met",
    dataPoints: [
      {
        field: "Mammography Date",
        value: "2024-08-15",
        source: "Manual Abstraction",
        documentRef: "Mammogram_456789_20240815.pdf",
        pageNumber: 1,
        annotationId: "ANN-45678-001",
        enteredBy: "Lisa Johnson",
        enteredAt: "2025-02-06 13:45:08",
        verifiedBy: "Dr. James Park",
        verifiedAt: "2025-02-06 14:02:33",
      },
      {
        field: "Procedure Code",
        value: "CPT: 77067 (Screening Mammography, Bilateral)",
        source: "Extracted from Document",
        documentRef: "Mammogram_456789_20240815.pdf",
        pageNumber: 1,
        annotationId: "ANN-45678-002",
        enteredBy: "System Auto",
        enteredAt: "2025-02-06 13:40:12",
        verifiedBy: "Lisa Johnson",
        verifiedAt: "2025-02-06 13:45:08",
      },
    ],
  },
];

// Mock data for sampling logic
const mockSamplingLogic = {
  measureId: "CBP-2025",
  measureName: "Controlling High Blood Pressure",
  productLine: "Commercial",
  measurementYear: 2025,
  samplingMethod: "Stratified Random Sampling",
  totalPopulation: 1000,
  sampleSize: 411,
  confidenceLevel: "95%",
  marginOfError: "±5%",
  stratificationCriteria: [
    {
      criterion: "Age Group",
      values: ["18-44", "45-64", "65+"],
      distribution: [25, 45, 30],
    },
    { criterion: "Gender", values: ["Male", "Female"], distribution: [48, 52] },
    {
      criterion: "Prior Year Compliance",
      values: ["Compliant", "Non-Compliant"],
      distribution: [82, 18],
    },
  ],
  selectionCriteria: [
    "Active enrollment during entire measurement year (2024-01-01 to 2024-12-31)",
    "Diagnosis of hypertension (ICD-10: I10-I16) on or before measurement year",
    "Age 18-85 years as of December 31, 2024",
    "At least one outpatient visit or telephone visit during measurement year",
  ],
  exclusionCriteria: [
    "Members with ESRD diagnosis",
    "Members in hospice care",
    "Pregnant members during measurement year",
    "Members with evidence of frailty",
  ],
  randomSeed: "CBP2025-SEED-847362",
  samplingDate: "2025-01-10",
  approvedBy: "Dr. Sarah Chen",
  ncqaCompliant: true,
};

export function Audit() {
  const [activeTab, setActiveTab] = useState<AuditTab>("overview");
  const [phiVisible, setPhiVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterChangeType, setFilterChangeType] = useState<string>("all");
  const [filterReviewStatus, setFilterReviewStatus] = useState<string>("all");
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const tabs = [
    { id: "overview" as AuditTab, label: "Audit Overview", icon: Shield },
    {
      id: "traceability" as AuditTab,
      label: "Evidence Traceability",
      icon: Link2,
    },
    { id: "sampling" as AuditTab, label: "Sampling Logic", icon: Hash },
    {
      id: "change-history" as AuditTab,
      label: "Change History",
      icon: History,
    },
    {
      id: "packet-generation" as AuditTab,
      label: "Audit Packet",
      icon: Package,
    },
  ];

  // Filter change history
  const filteredHistory = mockChangeHistory.filter((item) => {
    const matchesSearch =
      searchTerm === "" ||
      item.measureName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fieldName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      filterChangeType === "all" || item.changeType === filterChangeType;
    const matchesStatus =
      filterReviewStatus === "all" || item.reviewStatus === filterReviewStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Auditor Role Banner */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100">
                Read-Only Auditor Mode Active
              </h3>
              <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded">
                AUDITOR
              </span>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              You are viewing the system in audit mode. All data is read-only to
              preserve clinical and audit integrity. No edits can be made from
              this view.
            </p>
          </div>
        </div>
      </div>

      {/* Audit Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Total Measures
              </div>
              <div className="text-2xl font-semibold text-foreground">12</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Audited in MY 2025
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">
                Compliant Records
              </div>
              <div className="text-2xl font-semibold text-foreground">
                3,847
              </div>
            </div>
          </div>
          <div className="text-xs text-green-600 dark:text-green-400">
            93.7% compliance rate
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Changes</div>
              <div className="text-2xl font-semibold text-foreground">287</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Fully documented & traceable
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Active Users</div>
              <div className="text-2xl font-semibold text-foreground">24</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Abstractors & Reviewers
          </div>
        </div>
      </div>

      {/* Audit Scope & Certification */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Audit Scope
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Measurement Year:</span>
              <span className="font-medium text-foreground">2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Audit Period:</span>
              <span className="font-medium text-foreground">
                Jan 1 - Feb 6, 2025
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Product Lines:</span>
              <span className="font-medium text-foreground">
                Commercial, Medicare, Medicaid
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sample Size:</span>
              <span className="font-medium text-foreground">
                411 records per measure
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Confidence Level:</span>
              <span className="font-medium text-foreground">
                95% (±5% margin)
              </span>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            NCQA Certification Status
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Sampling Methodology:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                <CheckCircle className="w-3 h-3" />
                Compliant
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Documentation Standards:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                <CheckCircle className="w-3 h-3" />
                Compliant
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Audit Trail Integrity:
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                <CheckCircle className="w-3 h-3" />
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Inter-Rater Reliability:
              </span>
              <span className="font-medium text-foreground">96.2%</span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Last NCQA Audit
              </div>
              <div className="font-medium text-foreground">
                December 15, 2024
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Recent Audit Activity
          </h3>
        </div>
        <div className="p-5">
          <div className="space-y-3">
            {mockChangeHistory.slice(0, 5).map((change) => (
              <div
                key={change.id}
                className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                  <Edit3 className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-foreground text-sm">
                      {change.user}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {change.role}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {change.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Modified{" "}
                    <span className="font-medium text-foreground">
                      {change.fieldName}
                    </span>{" "}
                    in {change.measureName} for{" "}
                    {phiVisible ? change.memberName : "████████"}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 text-xs font-medium rounded flex-shrink-0 ${
                    change.reviewStatus === "Approved"
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                      : change.reviewStatus === "Pending Review"
                        ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  }`}
                >
                  {change.reviewStatus}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTraceability = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              End-to-End Evidence Traceability
            </h3>
            <p className="text-sm text-muted-foreground">
              Every reported value is fully traceable from measure output to
              source evidence. Click any data point to view its complete lineage
              including source document, page number, annotations, and user
              attribution.
            </p>
          </div>
        </div>
      </div>

      {mockTraceability.map((record) => (
        <div
          key={`${record.measureId}-${record.memberId}`}
          className="bg-card border border-border rounded-lg overflow-hidden"
        >
          <div className="bg-muted/50 p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-semibold text-foreground">
                    {record.measureName}
                  </h3>
                  <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                    {record.measureId}
                  </span>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded ${
                      record.numeratorStatus === "Met"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    Numerator {record.numeratorStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-3.5 h-3.5" />
                  <span>
                    Member: {phiVisible ? record.memberName : "████████"}
                  </span>
                  <span>•</span>
                  <span>ID: {phiVisible ? record.memberId : "████████"}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Data Field
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Value
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Source Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Source Document
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Entered By
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Verified By
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {record.dataPoints.map((point, idx) => (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {point.field}
                    </td>
                    <td className="px-4 py-3 text-foreground">{point.value}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded ${
                          point.source === "Manual Abstraction"
                            ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                            : point.source === "System Auto" ||
                                point.source === "Extracted from Document"
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                              : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                        }`}
                      >
                        {point.source === "Manual Abstraction" && (
                          <Edit3 className="w-3 h-3" />
                        )}
                        {point.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">
                          {point.documentRef}
                        </span>
                        {point.pageNumber && (
                          <span className="text-xs text-muted-foreground ml-1">
                            (p.{point.pageNumber})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">{point.enteredBy}</div>
                      <div className="text-xs text-muted-foreground">
                        {point.enteredAt}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {point.verifiedBy ? (
                        <>
                          <div className="text-foreground">
                            {point.verifiedBy}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {point.verifiedAt}
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Not verified
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedDocument({
                              ...point,
                              measureName: record.measureName,
                              measureId: record.measureId,
                              memberId: record.memberId,
                              memberName: record.memberName,
                            });
                            setShowDocumentViewer(true);
                          }}
                          className="p-1.5 hover:bg-muted rounded transition-colors"
                          title="View document"
                        >
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        </button>
                        {point.annotationId && (
                          <button
                            className="p-1.5 hover:bg-muted rounded transition-colors"
                            title="View annotation"
                          >
                            <Link2 className="w-4 h-4 text-primary" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSamplingLogic = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-foreground">
                {mockSamplingLogic.measureName}
              </h2>
              <span className="px-2 py-0.5 bg-primary/10 text-primary text-sm font-medium rounded">
                {mockSamplingLogic.measureId}
              </span>
              {mockSamplingLogic.ncqaCompliant && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                  <CheckCircle className="w-3 h-3" />
                  NCQA Compliant
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{mockSamplingLogic.productLine}</span>
              <span>•</span>
              <span>MY {mockSamplingLogic.measurementYear}</span>
              <span>•</span>
              <span>Sampled: {mockSamplingLogic.samplingDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Total Population
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {mockSamplingLogic.totalPopulation.toLocaleString()}
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Sample Size
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {mockSamplingLogic.sampleSize.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {(
                (mockSamplingLogic.sampleSize /
                  mockSamplingLogic.totalPopulation) *
                100
              ).toFixed(1)}
              % of population
            </div>
          </div>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">
              Confidence Level
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {mockSamplingLogic.confidenceLevel}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {mockSamplingLogic.marginOfError} margin
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-foreground mb-2">
              Sampling Methodology
            </h3>
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4 text-primary" />
                <span className="font-medium text-foreground">
                  {mockSamplingLogic.samplingMethod}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Random sample selected using stratified methodology to ensure
                representative distribution across key demographic and clinical
                characteristics. Sampling algorithm uses cryptographically
                secure random seed for reproducibility.
              </p>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>Random Seed:</span>
                  <code className="px-2 py-0.5 bg-muted rounded font-mono text-foreground">
                    {mockSamplingLogic.randomSeed}
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-3">
              Stratification Criteria
            </h3>
            <div className="space-y-3">
              {mockSamplingLogic.stratificationCriteria.map((strata, idx) => (
                <div key={idx} className="bg-muted/30 rounded-lg p-4">
                  <div className="font-medium text-foreground mb-2">
                    {strata.criterion}
                  </div>
                  <div className="flex gap-2">
                    {strata.values.map((value, vIdx) => (
                      <div
                        key={vIdx}
                        className="flex-1 bg-card rounded p-2 border border-border"
                      >
                        <div className="text-xs text-muted-foreground mb-1">
                          {value}
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          {strata.distribution[vIdx]}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Selection Criteria (Inclusion)
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <ul className="space-y-2">
                  {mockSamplingLogic.selectionCriteria.map((criterion, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-3">
                Exclusion Criteria
              </h3>
              <div className="bg-muted/30 rounded-lg p-4">
                <ul className="space-y-2">
                  {mockSamplingLogic.exclusionCriteria.map((criterion, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  NCQA Compliance Verification
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                  This sampling methodology has been verified to meet NCQA HEDIS
                  technical specifications for statistical validity and
                  representativeness. Approved by {mockSamplingLogic.approvedBy}{" "}
                  on {mockSamplingLogic.samplingDate}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChangeHistory = () => (
    <div className="space-y-4">
      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by measure, member, user, or field name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterChangeType}
              onChange={(e) => setFilterChangeType(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Change Types</option>
              <option value="Field Edit">Field Edit</option>
              <option value="Override">Override</option>
              <option value="QA Override">QA Override</option>
              <option value="Status Change">Status Change</option>
              <option value="Data Correction">Data Correction</option>
            </select>

            <select
              value={filterReviewStatus}
              onChange={(e) => setFilterReviewStatus(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Review Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Final">Final</option>
            </select>
          </div>
        </div>
      </div>

      {/* Change History Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border sticky top-0">
              <tr>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Timestamp
                  </div>
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  User / Role
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  Measure
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  Member
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  Change Type
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  Field
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  Old → New Value
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  Source Evidence
                </th>
                <th className="text-left px-3 py-3 font-semibold text-foreground">
                  Review Status
                </th>
                <th className="text-right px-3 py-3 font-semibold text-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredHistory.map((change) => (
                <tr
                  key={change.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 py-3 text-muted-foreground whitespace-nowrap">
                    {change.timestamp}
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-foreground">
                      {change.user}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {change.role}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="font-medium text-foreground">
                      {change.measureId}
                    </div>
                    <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                      {change.measureName}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div>
                        <div className="font-medium text-foreground">
                          {phiVisible ? change.memberId : "████████"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {phiVisible ? change.memberName : "████████"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-block px-2 py-0.5 bg-muted text-foreground text-xs font-medium rounded">
                      {change.changeType}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-medium text-foreground max-w-[120px] truncate">
                    {change.fieldName}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-400 line-through">
                        {change.oldValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        {change.newValue}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-1 text-muted-foreground max-w-[180px]">
                      <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate text-xs">
                        {change.documentRef}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div>
                      <span
                        className={`inline-block px-2 py-0.5 text-xs font-medium rounded mb-1 ${
                          change.reviewStatus === "Approved"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : change.reviewStatus === "Pending Review"
                              ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                              : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        }`}
                      >
                        {change.reviewStatus}
                      </span>
                      {change.reviewedBy && (
                        <div className="text-xs text-muted-foreground">
                          by {change.reviewedBy}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                        title="View full details"
                      >
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-muted rounded transition-colors"
                        title="View source document"
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredHistory.length === 0 && (
          <div className="p-12 text-center">
            <History className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">
              No change history found matching your filters
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredHistory.length} of {mockChangeHistory.length} changes
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4" />
          <span>All changes are immutable and cryptographically signed</span>
        </div>
      </div>
    </div>
  );

  const renderPacketGeneration = () => (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-start gap-3 mb-4">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              One-Click Audit Packet Generation
            </h3>
            <p className="text-sm text-muted-foreground">
              Generate complete, audit-ready documentation packets instantly.
              Each packet includes all measures, evidence documents,
              annotations, sampling logic, change history, and decision
              rationale required for NCQA submission and external audits.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Full Audit Packet */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Complete Audit Packet
              </h3>
              <p className="text-xs text-muted-foreground">
                All measures • MY 2025
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>12 HEDIS measures with full documentation</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>3,847 member records with evidence</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Sampling methodology & justification</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Complete change history (287 events)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Inter-rater reliability analysis</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>NCQA certification documentation</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium">
              <Download className="w-4 h-4" />
              Download Complete Packet (PDF)
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors">
              <FileSpreadsheet className="w-4 h-4" />
              Export Data Tables (Excel)
            </button>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded text-xs text-muted-foreground">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-medium">
                Estimated generation time: 2-3 minutes
              </span>
            </div>
            <div>Package size: ~450 MB (includes all source documents)</div>
          </div>
        </div>

        {/* Measure-Specific Packets */}
        <div className="bg-card border border-border rounded-lg p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">
                Measure-Specific Packets
              </h3>
              <p className="text-xs text-muted-foreground">
                Individual measure documentation
              </p>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            {[
              "CBP - Controlling High Blood Pressure",
              "CDC - Comprehensive Diabetes Care",
              "BCS - Breast Cancer Screening",
              "CCS - Cervical Cancer Screening",
            ].map((measure, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 hover:bg-muted/50 rounded transition-colors"
              >
                <span className="text-sm text-foreground">{measure}</span>
                <button
                  className="p-1.5 hover:bg-muted rounded transition-colors"
                  title="Download measure packet"
                >
                  <Download className="w-4 h-4 text-primary" />
                </button>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <button
              onClick={() =>
                alert(
                  "Custom packet generation initiated. Select measures and date range to continue.",
                )
              }
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
            >
              <Package className="w-4 h-4" />
              Generate Custom Packet
            </button>
          </div>
        </div>
      </div>

      {/* Packet Contents Breakdown */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Audit Packet Contents
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm">
                Measure Documentation
              </h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Measure specifications & value sets</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Logic flow diagrams</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Performance rates & targets</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Denominator & numerator populations</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm">
                Evidence & Traceability
              </h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Source documents (PDFs, images)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Document annotations & highlights</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Evidence traceability matrix</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Data lineage documentation</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-foreground text-sm">
                Audit Trail & QA
              </h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Complete change history</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Sampling methodology & seed</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Inter-rater reliability scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>User activity logs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Generation History */}
      <div className="bg-card border border-border rounded-lg">
        <div className="p-5 border-b border-border">
          <h3 className="font-semibold text-foreground">
            Recent Packet Generations
          </h3>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              date: "2025-02-05 16:45",
              type: "Complete Audit Packet",
              user: "Dr. Sarah Chen",
              size: "447 MB",
              status: "Completed",
            },
            {
              date: "2025-02-03 14:20",
              type: "CBP Measure Packet",
              user: "John Martinez",
              size: "38 MB",
              status: "Completed",
            },
            {
              date: "2025-02-01 09:30",
              type: "Custom Packet (5 measures)",
              user: "Dr. James Park",
              size: "185 MB",
              status: "Completed",
            },
          ].map((gen, idx) => (
            <div
              key={idx}
              className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="font-medium text-foreground text-sm">
                    {gen.type}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Generated by {gen.user} • {gen.date} • {gen.size}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
                  {gen.status}
                </span>
                <button
                  className="p-2 hover:bg-muted rounded transition-colors"
                  title="Download packet"
                >
                  <Download className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Audit Module
          </h1>
          <p className="text-sm text-muted-foreground">
            Comprehensive audit trail, evidence traceability, and compliance
            documentation
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhiVisible(!phiVisible)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
              phiVisible
                ? "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300"
                : "bg-card border-border text-foreground hover:bg-muted"
            }`}
          >
            {phiVisible ? (
              <>
                <Eye className="w-4 h-4" />
                <span className="text-sm font-medium">PHI Visible</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                <span className="text-sm font-medium">PHI Masked</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center border-b border-border overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "traceability" && renderTraceability()}
          {activeTab === "sampling" && renderSamplingLogic()}
          {activeTab === "change-history" && renderChangeHistory()}
          {activeTab === "packet-generation" && renderPacketGeneration()}
        </div>
      </div>

      {/* Document Viewer Modal */}
      {showDocumentViewer && selectedDocument && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4">
          <div className="bg-background rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Audit Record Detail
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Complete traceability and evidence lineage
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDocumentViewer(false);
                  setSelectedDocument(null);
                }}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Primary Details */}
                <div className="col-span-2 space-y-5">
                  {/* Record Header */}
                  <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-lg p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-base font-bold text-foreground">
                            {selectedDocument.measureName}
                          </h4>
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded">
                            {selectedDocument.measureId}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">Member:</span>{" "}
                          {selectedDocument.memberName} (
                          {selectedDocument.memberId})
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedDocument.verifiedBy && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Data Field
                        </div>
                        <div className="font-semibold text-foreground">
                          {selectedDocument.field}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Abstracted Value
                        </div>
                        <div className="font-semibold text-foreground">
                          {selectedDocument.value}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Source Information */}
                  <div className="bg-card border border-border rounded-lg">
                    <div className="px-5 py-3 border-b border-border">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        Source Document Information
                      </h4>
                    </div>
                    <div className="p-5 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1.5">
                            Document Reference
                          </div>
                          <div className="text-sm text-foreground font-medium">
                            {selectedDocument.documentRef}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1.5">
                            Page Number
                          </div>
                          <div className="text-sm text-foreground">
                            Page {selectedDocument.pageNumber}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-medium text-muted-foreground mb-1.5">
                            Source Type
                          </div>
                          <div>
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded ${
                                selectedDocument.source === "Manual Abstraction"
                                  ? "bg-orange-100 text-orange-700"
                                  : selectedDocument.source === "System Auto" ||
                                      selectedDocument.source ===
                                        "Extracted from Document"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {selectedDocument.source ===
                                "Manual Abstraction" && (
                                <Edit3 className="w-3 h-3" />
                              )}
                              {selectedDocument.source === "System Auto" && (
                                <Database className="w-3 h-3" />
                              )}
                              {selectedDocument.source}
                            </span>
                          </div>
                        </div>
                        {selectedDocument.annotationId && (
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-1.5">
                              Annotation ID
                            </div>
                            <div className="flex items-center gap-2">
                              <Link2 className="w-3.5 h-3.5 text-primary" />
                              <span className="text-sm text-primary font-medium">
                                {selectedDocument.annotationId}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Document Preview */}
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-xs font-medium text-muted-foreground">
                            Document Preview
                          </div>
                          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
                            <ExternalLink className="w-3 h-3" />
                            Open Full Document
                          </button>
                        </div>
                        <div className="bg-muted/30 border border-border rounded-lg p-4 h-48 flex items-center justify-center">
                          <div className="text-center text-muted-foreground">
                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-40" />
                            <div className="text-sm">
                              Document preview would display here
                            </div>
                            <div className="text-xs mt-1">
                              {selectedDocument.documentRef}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attribution & Timeline */}
                  <div className="bg-card border border-border rounded-lg">
                    <div className="px-5 py-3 border-b border-border">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Activity className="w-4 h-4 text-primary" />
                        Attribution & Timeline
                      </h4>
                    </div>
                    <div className="p-5">
                      <div className="space-y-4">
                        {/* Data Entry Event */}
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <Edit3 className="w-4 h-4 text-blue-600" />
                            </div>
                            <div className="w-px h-full bg-border mt-2"></div>
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex items-center justify-between mb-1">
                              <div className="font-semibold text-sm text-foreground">
                                Data Entry
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {selectedDocument.enteredAt}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              <User className="w-3.5 h-3.5 inline mr-1" />
                              {selectedDocument.enteredBy}
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 inline-block">
                              Initial abstraction from source document
                            </div>
                          </div>
                        </div>

                        {/* Verification Event */}
                        {selectedDocument.verifiedBy && (
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <div className="font-semibold text-sm text-foreground">
                                  Verification
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {selectedDocument.verifiedAt}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground mb-2">
                                <User className="w-3.5 h-3.5 inline mr-1" />
                                {selectedDocument.verifiedBy}
                              </div>
                              <div className="text-xs text-muted-foreground bg-muted/30 rounded px-2 py-1 inline-block">
                                Clinical reviewer verified accuracy
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Data Lineage */}
                  <div className="bg-card border border-border rounded-lg">
                    <div className="px-5 py-3 border-b border-border">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-primary" />
                        Data Lineage & Flow
                      </h4>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-medium text-purple-900">
                            Medical Record
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                          <Edit3 className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-orange-900">
                            Manual Abstraction
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="font-medium text-green-900">
                            Clinical Verification
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                          <Share2 className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-blue-900">
                            HEDIS Reporting
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground bg-muted/30 rounded-lg p-3">
                        <MapPin className="w-3.5 h-3.5 inline mr-1" />
                        This data point has been captured, verified, and is
                        ready for inclusion in quality measure reporting to
                        NCQA.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Metadata & Actions */}
                <div className="space-y-5">
                  {/* Quick Stats */}
                  <div className="bg-card border border-border rounded-lg">
                    <div className="px-4 py-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">
                        Record Metadata
                      </h4>
                    </div>
                    <div className="p-4 space-y-3">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">
                          Status
                        </div>
                        {selectedDocument.verifiedBy ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            <CheckCircle className="w-3 h-3" />
                            Verified & Complete
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded">
                            <Clock className="w-3 h-3" />
                            Pending Verification
                          </span>
                        )}
                      </div>
                      <div className="pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">
                          Created By
                        </div>
                        <div className="text-sm font-medium text-foreground">
                          {selectedDocument.enteredBy}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {selectedDocument.enteredAt}
                        </div>
                      </div>
                      {selectedDocument.verifiedBy && (
                        <div className="pt-3 border-t border-border">
                          <div className="text-xs text-muted-foreground mb-1">
                            Verified By
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {selectedDocument.verifiedBy}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {selectedDocument.verifiedAt}
                          </div>
                        </div>
                      )}
                      <div className="pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground mb-1">
                          Record ID
                        </div>
                        <div className="text-xs font-mono text-foreground bg-muted/30 px-2 py-1 rounded">
                          {selectedDocument.annotationId || "N/A"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compliance Indicators */}
                  <div className="bg-card border border-border rounded-lg">
                    <div className="px-4 py-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">
                        Compliance Checks
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          HEDIS specifications met
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          Source documentation present
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          Audit trail complete
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          Dual verification completed
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs text-foreground">
                          NCQA reportable
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Related Records */}
                  <div className="bg-card border border-border rounded-lg">
                    <div className="px-4 py-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">
                        Related Records
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <button className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 rounded-lg text-xs transition-colors">
                        <span className="text-foreground">
                          View all member records
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 rounded-lg text-xs transition-colors">
                        <span className="text-foreground">
                          View measure history
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                      <button className="w-full flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 rounded-lg text-xs transition-colors">
                        <span className="text-foreground">View change log</span>
                        <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                      </button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="bg-card border border-border rounded-lg">
                    <div className="px-4 py-3 border-b border-border">
                      <h4 className="text-sm font-semibold text-foreground">
                        Actions
                      </h4>
                    </div>
                    <div className="p-4 space-y-2">
                      <button className="w-full flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-xs font-medium transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Export Record
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 text-foreground rounded-lg text-xs font-medium transition-colors">
                        <FileText className="w-3.5 h-3.5" />
                        Print Audit Trail
                      </button>
                      <button className="w-full flex items-center gap-2 px-3 py-2 bg-muted/30 hover:bg-muted/50 text-foreground rounded-lg text-xs font-medium transition-colors">
                        <History className="w-3.5 h-3.5" />
                        View Related Events
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-card">
              <div className="text-xs text-muted-foreground">
                <Shield className="w-3.5 h-3.5 inline mr-1" />
                This record is immutable and audit-logged for compliance
              </div>
              <button
                onClick={() => {
                  setShowDocumentViewer(false);
                  setSelectedDocument(null);
                }}
                className="px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
