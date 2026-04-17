import { useState, useRef, useCallback } from "react";
import type { ReactNode } from "react";
import {
  Search,
  Filter,
  Plus,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  Upload,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Eye,
  Download,
  Trash2,
  RotateCcw,
  Sparkles,
  Brain,
  ScanLine,
  Activity,
  ShieldCheck,
  Flag,
  History,
  MoreHorizontal,
  TrendingUp,
  AlertCircle,
  Layers,
  FilePlus2,
  Image as ImageIcon,
  Stethoscope,
  RefreshCw,
  Info,
  ZoomIn,
  ClipboardList,
  Users,
  UserCheck,
  CircleDot,
  ArrowUpRight,
  Star,
} from "lucide-react";

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
type PatientStatus = "Active" | "Inactive" | "Pending";
type ChartStatus =
  | "Uploaded"
  | "OCR Processing"
  | "AI Processed"
  | "Coding In Progress"
  | "Coding Complete"
  | "Audit Pending"
  | "Audit In Progress"
  | "Rework"
  | "Completed";
type SlaStatus = "On Track" | "At Risk" | "Breached";
type OcrStatus = "Pending" | "Processing" | "Complete" | "Failed";
type AiStatus = "Pending" | "Processing" | "Complete" | "Failed";
type AuditStatus = "Pending" | "In Progress" | "Passed" | "Rejected" | "N/A";

interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  age: number;
  gender: string;
  phone: string;
  email: string;
  address: string;
  project: string;
  projectId: string;
  admissionDate: string;
  dischargeDate: string;
  status: PatientStatus;
  riskLevel: "Low" | "Medium" | "High";
  primaryDx: string[];
  attending: string;
  facility: string;
  insurancePlan: string;
  memberId: string;
  payerType: string;
  totalCharts: number;
  completedCharts: number;
}

interface Chart {
  id: string;
  patientId: string;
  encounterType: string;
  encounterDate: string;
  admitDate: string;
  dischargeDate: string;
  coder: string;
  auditor: string;
  status: ChartStatus;
  slaStatus: SlaStatus;
  slaDeadline: string;
  slaHrsLeft: number;
  ocrStatus: OcrStatus;
  ocrPages: number;
  ocrComplete: number;
  aiStatus: AiStatus;
  aiConfidence: number;
  aiCodesCount: number;
  aiAccepted: number;
  auditStatus: AuditStatus;
  auditLevel: string;
  documents: Document[];
  codingHistory: HistoryEvent[];
  auditHistory: HistoryEvent[];
  exceptions: ExceptionFlag[];
  dxCodes: CodeEntry[];
  cptCodes: CodeEntry[];
  drg: string;
  drgWeight: number;
  facility: string;
  department: string;
}

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  ocrStatus: OcrStatus;
  pages: number;
}

interface HistoryEvent {
  id: string;
  date: string;
  user: string;
  role: string;
  action: string;
  note?: string;
}

interface ExceptionFlag {
  id: string;
  type: string;
  severity: "Low" | "Medium" | "High" | "Critical";
  description: string;
  raisedAt: string;
  status: "Open" | "Resolved";
}

interface CodeEntry {
  code: string;
  description: string;
  aiSuggested: boolean;
  accepted: boolean;
  confidence?: number;
}

/* ══════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════ */
const PATIENTS: Patient[] = [
  {
    id: "PT-001",
    mrn: "MBR-2026-00142",
    firstName: "Jennifer",
    lastName: "Anderson",
    dob: "1965-03-15",
    age: 60,
    gender: "Female",
    phone: "(512) 555-0142",
    email: "j.anderson@email.com",
    address: "421 Lakeview Dr, Austin, TX 78701",
    project: "Apollo Inpatient Coding FY26",
    projectId: "PRJ-001",
    admissionDate: "2026-01-14",
    dischargeDate: "2026-01-18",
    status: "Active",
    riskLevel: "High",
    primaryDx: ["E11.9", "I10", "N18.3"],
    attending: "Dr. Rajesh Sharma, MD",
    facility: "Apollo Hospital – Delhi",
    insurancePlan: "Blue Cross Blue Shield",
    memberId: "BCBS-98765432",
    payerType: "Commercial",
    totalCharts: 4,
    completedCharts: 3,
  },
  {
    id: "PT-002",
    mrn: "MBR-2026-00287",
    firstName: "Carlos",
    lastName: "Martinez",
    dob: "1958-07-22",
    age: 67,
    gender: "Male",
    phone: "(713) 555-0287",
    email: "c.martinez@email.com",
    address: "987 Oak Blvd, Houston, TX 77002",
    project: "Fortis Cardiology HCC Coding",
    projectId: "PRJ-002",
    admissionDate: "2026-01-28",
    dischargeDate: "2026-02-01",
    status: "Active",
    riskLevel: "High",
    primaryDx: ["I25.10", "E11.65", "I50.9"],
    attending: "Dr. Priya Nair, MD",
    facility: "Fortis Healthcare – Gurugram",
    insurancePlan: "Aetna",
    memberId: "AET-12345678",
    payerType: "Medicare",
    totalCharts: 3,
    completedCharts: 1,
  },
  {
    id: "PT-003",
    mrn: "MBR-2026-00391",
    firstName: "Sandra",
    lastName: "Williams",
    dob: "1972-11-08",
    age: 53,
    gender: "Female",
    phone: "(214) 555-0391",
    email: "s.williams@email.com",
    address: "234 Elm St, Dallas, TX 75201",
    project: "Manipal Outpatient CPT Coding",
    projectId: "PRJ-003",
    admissionDate: "2026-02-05",
    dischargeDate: "2026-02-05",
    status: "Active",
    riskLevel: "Medium",
    primaryDx: ["M54.5", "M47.816"],
    attending: "Dr. Anil Chopra, MD",
    facility: "Manipal Hospital – Bangalore",
    insurancePlan: "UnitedHealthcare",
    memberId: "UHC-55667788",
    payerType: "Commercial",
    totalCharts: 2,
    completedCharts: 2,
  },
  {
    id: "PT-004",
    mrn: "MBR-2026-00445",
    firstName: "Robert",
    lastName: "Thompson",
    dob: "1960-05-30",
    age: 65,
    gender: "Male",
    phone: "(210) 555-0445",
    email: "r.thompson@email.com",
    address: "556 Cedar Ln, San Antonio, TX 78201",
    project: "Apollo Inpatient Coding FY26",
    projectId: "PRJ-001",
    admissionDate: "2026-02-10",
    dischargeDate: "2026-02-14",
    status: "Active",
    riskLevel: "Medium",
    primaryDx: ["J18.9", "I10", "E78.5"],
    attending: "Dr. Sunita Roy, MD",
    facility: "Apollo Hospital – Delhi",
    insurancePlan: "Humana",
    memberId: "HUM-99887766",
    payerType: "Medicare",
    totalCharts: 2,
    completedCharts: 0,
  },
  {
    id: "PT-005",
    mrn: "MBR-2026-00508",
    firstName: "Patricia",
    lastName: "Chen",
    dob: "1968-09-14",
    age: 57,
    gender: "Female",
    phone: "(832) 555-0508",
    email: "p.chen@email.com",
    address: "778 Maple Ave, Sugar Land, TX 77479",
    project: "Fortis Cardiology HCC Coding",
    projectId: "PRJ-002",
    admissionDate: "2026-01-20",
    dischargeDate: "2026-01-23",
    status: "Pending",
    riskLevel: "Low",
    primaryDx: ["I48.0", "R00.1"],
    attending: "Dr. Ramesh Babu, MD",
    facility: "Fortis Healthcare – Gurugram",
    insurancePlan: "Cigna",
    memberId: "CIG-44556677",
    payerType: "Commercial",
    totalCharts: 1,
    completedCharts: 0,
  },
  {
    id: "PT-006",
    mrn: "MBR-2026-00621",
    firstName: "David",
    lastName: "Kumar",
    dob: "1955-12-20",
    age: 70,
    gender: "Male",
    phone: "(469) 555-0621",
    email: "d.kumar@email.com",
    address: "103 Birch Rd, Plano, TX 75024",
    project: "Max ED Visit Coding – Q1",
    projectId: "PRJ-004",
    admissionDate: "2026-02-18",
    dischargeDate: "2026-02-18",
    status: "Active",
    riskLevel: "High",
    primaryDx: ["S72.001A", "M79.3", "Z79.1"],
    attending: "Dr. Vikram Mehta, MD",
    facility: "Max Healthcare – Saket",
    insurancePlan: "Medicare Part B",
    memberId: "MCR-PART-B-0621",
    payerType: "Medicare",
    totalCharts: 3,
    completedCharts: 1,
  },
  {
    id: "PT-007",
    mrn: "MBR-2026-00734",
    firstName: "Linda",
    lastName: "Okafor",
    dob: "1975-04-02",
    age: 50,
    gender: "Female",
    phone: "(281) 555-0734",
    email: "l.okafor@email.com",
    address: "654 Spruce Dr, Katy, TX 77450",
    project: "Manipal Outpatient CPT Coding",
    projectId: "PRJ-003",
    admissionDate: "2026-02-12",
    dischargeDate: "2026-02-12",
    status: "Inactive",
    riskLevel: "Low",
    primaryDx: ["Z00.00", "Z23"],
    attending: "Dr. Fiona DSilva, MD",
    facility: "Manipal Hospital – Bangalore",
    insurancePlan: "Medicaid",
    memberId: "MCD-TX-0734",
    payerType: "Medicaid",
    totalCharts: 1,
    completedCharts: 1,
  },
];

const CHARTS: Chart[] = [
  {
    id: "CHT-78542",
    patientId: "PT-001",
    encounterType: "Inpatient",
    encounterDate: "2026-01-14",
    admitDate: "2026-01-14",
    dischargeDate: "2026-01-18",
    coder: "Ankit Sharma",
    auditor: "Dr. Priya Nair",
    status: "Audit In Progress",
    slaStatus: "At Risk",
    slaDeadline: "2026-02-21",
    slaHrsLeft: 3.4,
    ocrStatus: "Complete",
    ocrPages: 24,
    ocrComplete: 24,
    aiStatus: "Complete",
    aiConfidence: 91.4,
    aiCodesCount: 8,
    aiAccepted: 7,
    auditStatus: "In Progress",
    auditLevel: "L2",
    dxCodes: [
      {
        code: "E11.9",
        description: "Type 2 diabetes mellitus without complications",
        aiSuggested: true,
        accepted: true,
        confidence: 96,
      },
      {
        code: "I10",
        description: "Essential (primary) hypertension",
        aiSuggested: true,
        accepted: true,
        confidence: 98,
      },
      {
        code: "N18.3",
        description: "Chronic kidney disease, stage 3",
        aiSuggested: true,
        accepted: true,
        confidence: 88,
      },
      {
        code: "E78.5",
        description: "Hyperlipidemia, unspecified",
        aiSuggested: true,
        accepted: false,
        confidence: 72,
      },
    ],
    cptCodes: [
      {
        code: "99223",
        description: "Initial hospital care, high complexity",
        aiSuggested: true,
        accepted: true,
        confidence: 94,
      },
      {
        code: "93306",
        description: "Echocardiography, transthoracic, complete",
        aiSuggested: true,
        accepted: true,
        confidence: 91,
      },
      {
        code: "36415",
        description: "Venipuncture for blood collection",
        aiSuggested: false,
        accepted: true,
        confidence: 0,
      },
    ],
    drg: "871",
    drgWeight: 1.82,
    facility: "Apollo Hospital – Delhi",
    department: "General Medicine",
    documents: [
      {
        id: "DOC-001",
        name: "Discharge_Summary_78542.pdf",
        type: "PDF",
        size: "2.4 MB",
        uploadedAt: "2026-01-19 09:14",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 6,
      },
      {
        id: "DOC-002",
        name: "Lab_Results_78542.pdf",
        type: "PDF",
        size: "1.1 MB",
        uploadedAt: "2026-01-19 09:15",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 4,
      },
      {
        id: "DOC-003",
        name: "OP_Note_78542.pdf",
        type: "PDF",
        size: "3.2 MB",
        uploadedAt: "2026-01-19 09:16",
        uploadedBy: "Ankit Sharma",
        ocrStatus: "Complete",
        pages: 14,
      },
    ],
    codingHistory: [
      {
        id: "CH-1",
        date: "2026-01-20 10:30",
        user: "Ankit Sharma",
        role: "Coder",
        action: "Chart assigned and opened",
      },
      {
        id: "CH-2",
        date: "2026-01-20 14:22",
        user: "Ankit Sharma",
        role: "Coder",
        action: "AI codes reviewed – 7/8 accepted",
      },
      {
        id: "CH-3",
        date: "2026-01-21 09:45",
        user: "Ankit Sharma",
        role: "Coder",
        action: "Coding submitted for audit",
        note: "DRG 871 confirmed",
      },
    ],
    auditHistory: [
      {
        id: "AH-1",
        date: "2026-01-21 11:00",
        user: "Dr. Priya Nair",
        role: "Auditor",
        action: "L1 Audit started",
      },
      {
        id: "AH-2",
        date: "2026-01-21 15:30",
        user: "Dr. Priya Nair",
        role: "Auditor",
        action: "L1 Audit passed – escalated to L2",
        note: "Minor modifier issue noted",
      },
      {
        id: "AH-3",
        date: "2026-02-19 09:00",
        user: "Dr. Ramesh Babu",
        role: "Sr. Auditor",
        action: "L2 Audit in progress",
      },
    ],
    exceptions: [
      {
        id: "EXC-001",
        type: "AI Override",
        severity: "Low",
        description:
          "Coder removed AI-suggested E78.5 without documented rationale",
        raisedAt: "2026-01-21",
        status: "Open",
      },
    ],
  },
  {
    id: "CHT-78603",
    patientId: "PT-001",
    encounterType: "Outpatient",
    encounterDate: "2025-12-18",
    admitDate: "2025-12-18",
    dischargeDate: "2025-12-18",
    coder: "Deepa Pillai",
    auditor: "Dr. Priya Nair",
    status: "Completed",
    slaStatus: "On Track",
    slaDeadline: "2025-12-26",
    slaHrsLeft: 0,
    ocrStatus: "Complete",
    ocrPages: 8,
    ocrComplete: 8,
    aiStatus: "Complete",
    aiConfidence: 96.2,
    aiCodesCount: 5,
    aiAccepted: 5,
    auditStatus: "Passed",
    auditLevel: "L1",
    dxCodes: [
      {
        code: "E11.9",
        description: "Type 2 diabetes mellitus without complications",
        aiSuggested: true,
        accepted: true,
        confidence: 97,
      },
      {
        code: "Z79.4",
        description: "Long-term (current) use of insulin",
        aiSuggested: true,
        accepted: true,
        confidence: 99,
      },
    ],
    cptCodes: [
      {
        code: "99214",
        description: "Office visit, moderate complexity",
        aiSuggested: true,
        accepted: true,
        confidence: 95,
      },
      {
        code: "83036",
        description: "Hemoglobin A1C",
        aiSuggested: true,
        accepted: true,
        confidence: 98,
      },
    ],
    drg: "N/A",
    drgWeight: 0,
    facility: "Apollo Hospital – Delhi",
    department: "Endocrinology",
    documents: [
      {
        id: "DOC-004",
        name: "Clinic_Note_78603.pdf",
        type: "PDF",
        size: "1.8 MB",
        uploadedAt: "2025-12-19 08:30",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 8,
      },
    ],
    codingHistory: [
      {
        id: "CH-4",
        date: "2025-12-19 09:00",
        user: "Deepa Pillai",
        role: "Coder",
        action: "Coding completed – all AI codes accepted",
      },
    ],
    auditHistory: [
      {
        id: "AH-4",
        date: "2025-12-20 11:00",
        user: "Dr. Priya Nair",
        role: "Auditor",
        action: "L1 Audit passed",
      },
    ],
    exceptions: [],
  },
  {
    id: "CHT-79011",
    patientId: "PT-002",
    encounterType: "Inpatient",
    encounterDate: "2026-01-28",
    admitDate: "2026-01-28",
    dischargeDate: "2026-02-01",
    coder: "Rahul Gupta",
    auditor: "Dr. Ramesh Babu",
    status: "Rework",
    slaStatus: "Breached",
    slaDeadline: "2026-02-18",
    slaHrsLeft: -12,
    ocrStatus: "Complete",
    ocrPages: 32,
    ocrComplete: 32,
    aiStatus: "Complete",
    aiConfidence: 78.3,
    aiCodesCount: 10,
    aiAccepted: 6,
    auditStatus: "Rejected",
    auditLevel: "L1",
    dxCodes: [
      {
        code: "I25.10",
        description: "Atherosclerotic heart disease of native coronary artery",
        aiSuggested: true,
        accepted: true,
        confidence: 92,
      },
      {
        code: "E11.65",
        description: "Type 2 diabetes mellitus with hyperglycemia",
        aiSuggested: true,
        accepted: true,
        confidence: 88,
      },
      {
        code: "I50.9",
        description: "Heart failure, unspecified",
        aiSuggested: true,
        accepted: false,
        confidence: 62,
      },
    ],
    cptCodes: [
      {
        code: "93458",
        description: "Left heart catheterization",
        aiSuggested: true,
        accepted: true,
        confidence: 91,
      },
      {
        code: "33533",
        description: "Coronary artery bypass using arterial graft",
        aiSuggested: false,
        accepted: true,
        confidence: 0,
      },
    ],
    drg: "236",
    drgWeight: 4.12,
    facility: "Fortis Healthcare – Gurugram",
    department: "Cardiology",
    documents: [
      {
        id: "DOC-005",
        name: "Cath_Report_79011.pdf",
        type: "PDF",
        size: "4.1 MB",
        uploadedAt: "2026-02-02 10:00",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 12,
      },
      {
        id: "DOC-006",
        name: "Op_Note_CABG_79011.pdf",
        type: "PDF",
        size: "5.6 MB",
        uploadedAt: "2026-02-02 10:01",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 18,
      },
    ],
    codingHistory: [
      {
        id: "CH-5",
        date: "2026-02-03 09:00",
        user: "Rahul Gupta",
        role: "Coder",
        action: "Coding started – AI confidence low (78%)",
      },
      {
        id: "CH-6",
        date: "2026-02-04 16:00",
        user: "Rahul Gupta",
        role: "Coder",
        action: "Submitted for audit",
      },
      {
        id: "CH-7",
        date: "2026-02-18 09:30",
        user: "Rahul Gupta",
        role: "Coder",
        action: "Rework started – addressing audit send-back",
      },
    ],
    auditHistory: [
      {
        id: "AH-5",
        date: "2026-02-05 11:00",
        user: "Dr. Ramesh Babu",
        role: "Auditor",
        action: "L1 Audit started",
      },
      {
        id: "AH-6",
        date: "2026-02-06 14:00",
        user: "Dr. Ramesh Babu",
        role: "Auditor",
        action: "L1 Audit rejected – send-back",
        note: "I50.9 not supported by documentation. CABG CPT requires pre-auth note.",
      },
    ],
    exceptions: [
      {
        id: "EXC-002",
        type: "SLA Breach",
        severity: "Critical",
        description: "Chart exceeded 48hr TAT – breached by 12 hours",
        raisedAt: "2026-02-18",
        status: "Open",
      },
      {
        id: "EXC-003",
        type: "Coding Conflict",
        severity: "High",
        description: "I50.9 assigned without supporting documentation",
        raisedAt: "2026-02-06",
        status: "Open",
      },
    ],
  },
  {
    id: "CHT-79244",
    patientId: "PT-004",
    encounterType: "Inpatient",
    encounterDate: "2026-02-10",
    admitDate: "2026-02-10",
    dischargeDate: "2026-02-14",
    coder: "",
    auditor: "",
    status: "AI Processed",
    slaStatus: "On Track",
    slaDeadline: "2026-02-24",
    slaHrsLeft: 48,
    ocrStatus: "Complete",
    ocrPages: 18,
    ocrComplete: 18,
    aiStatus: "Complete",
    aiConfidence: 89.7,
    aiCodesCount: 7,
    aiAccepted: 0,
    auditStatus: "N/A",
    auditLevel: "",
    dxCodes: [
      {
        code: "J18.9",
        description: "Pneumonia, unspecified organism",
        aiSuggested: true,
        accepted: false,
        confidence: 92,
      },
      {
        code: "I10",
        description: "Essential (primary) hypertension",
        aiSuggested: true,
        accepted: false,
        confidence: 97,
      },
    ],
    cptCodes: [
      {
        code: "99223",
        description: "Initial hospital care, high complexity",
        aiSuggested: true,
        accepted: false,
        confidence: 88,
      },
      {
        code: "71046",
        description: "Chest X-ray, 2 views",
        aiSuggested: true,
        accepted: false,
        confidence: 99,
      },
    ],
    drg: "195",
    drgWeight: 1.31,
    facility: "Apollo Hospital – Delhi",
    department: "Pulmonology",
    documents: [
      {
        id: "DOC-007",
        name: "Admit_Note_79244.pdf",
        type: "PDF",
        size: "2.2 MB",
        uploadedAt: "2026-02-15 08:00",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 8,
      },
      {
        id: "DOC-008",
        name: "CXR_Report_79244.pdf",
        type: "PDF",
        size: "0.8 MB",
        uploadedAt: "2026-02-15 08:01",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 2,
      },
      {
        id: "DOC-009",
        name: "Discharge_79244.pdf",
        type: "PDF",
        size: "1.9 MB",
        uploadedAt: "2026-02-15 08:02",
        uploadedBy: "System",
        ocrStatus: "Processing",
        pages: 8,
      },
    ],
    codingHistory: [],
    auditHistory: [],
    exceptions: [],
  },
  {
    id: "CHT-79301",
    patientId: "PT-006",
    encounterType: "ED Visit",
    encounterDate: "2026-02-18",
    admitDate: "2026-02-18",
    dischargeDate: "2026-02-18",
    coder: "Meena Joshi",
    auditor: "",
    status: "Coding In Progress",
    slaStatus: "On Track",
    slaDeadline: "2026-02-22",
    slaHrsLeft: 28,
    ocrStatus: "Complete",
    ocrPages: 10,
    ocrComplete: 10,
    aiStatus: "Complete",
    aiConfidence: 84.2,
    aiCodesCount: 6,
    aiAccepted: 4,
    auditStatus: "N/A",
    auditLevel: "",
    dxCodes: [
      {
        code: "S72.001A",
        description: "Fracture of femoral head, right, initial encounter",
        aiSuggested: true,
        accepted: true,
        confidence: 88,
      },
      {
        code: "M79.3",
        description: "Panniculitis, unspecified",
        aiSuggested: true,
        accepted: false,
        confidence: 58,
      },
      {
        code: "Z79.1",
        description: "Long-term use of non-steroidal anti-inflammatory drugs",
        aiSuggested: true,
        accepted: true,
        confidence: 92,
      },
    ],
    cptCodes: [
      {
        code: "99285",
        description: "ED visit, high complexity",
        aiSuggested: true,
        accepted: true,
        confidence: 86,
      },
      {
        code: "73721",
        description: "MRI joint lower extremity",
        aiSuggested: true,
        accepted: true,
        confidence: 91,
      },
    ],
    drg: "536",
    drgWeight: 2.44,
    facility: "Max Healthcare – Saket",
    department: "Emergency",
    documents: [
      {
        id: "DOC-010",
        name: "ED_Note_79301.pdf",
        type: "PDF",
        size: "1.4 MB",
        uploadedAt: "2026-02-18 22:00",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 5,
      },
      {
        id: "DOC-011",
        name: "MRI_Report_79301.pdf",
        type: "PDF",
        size: "3.1 MB",
        uploadedAt: "2026-02-18 22:01",
        uploadedBy: "System",
        ocrStatus: "Complete",
        pages: 5,
      },
    ],
    codingHistory: [
      {
        id: "CH-8",
        date: "2026-02-19 08:30",
        user: "Meena Joshi",
        role: "Coder",
        action: "Coding started – AI suggestions reviewed",
      },
    ],
    auditHistory: [],
    exceptions: [],
  },
];

/* ══════════════════════════════════════════════════════
   SHARED COMPONENTS
══════════════════════════════════════════════════════ */
const C = {
  primary: "#0891b2",
  emerald: "#10b981",
  amber: "#f59e0b",
  red: "#ef4444",
  violet: "#8b5cf6",
  slate: "#64748b",
  cyan: "#06b6d4",
  teal: "#14b8a6",
  blue: "#3b82f6",
};

function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-card border border-border rounded-xl ${className}`}>
      {children}
    </div>
  );
}

function ProgressBar({
  pct,
  color = C.primary,
  h = "h-1.5",
}: {
  pct: number;
  color?: string;
  h?: string;
}) {
  return (
    <div className={`${h} bg-muted rounded-full overflow-hidden w-full`}>
      <div
        className={`h-full rounded-full transition-all`}
        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
      />
    </div>
  );
}

function SlaTag({ s }: { s: SlaStatus }) {
  return s === "On Track" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      On Track
    </span>
  ) : s === "At Risk" ? (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50   text-amber-700   border border-amber-200">
      {" "}
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      At Risk
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50    text-red-700    border border-red-200">
      {" "}
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      Breached
    </span>
  );
}

function StatusTag({ s }: { s: ChartStatus }) {
  const map: Record<ChartStatus, string> = {
    Uploaded: "bg-slate-50  text-slate-600   border-slate-200",
    "OCR Processing": "bg-blue-50   text-blue-700    border-blue-200",
    "AI Processed": "bg-violet-50 text-violet-700  border-violet-200",
    "Coding In Progress": "bg-cyan-50   text-cyan-700    border-cyan-200",
    "Coding Complete": "bg-sky-50    text-sky-700     border-sky-200",
    "Audit Pending": "bg-amber-50  text-amber-700   border-amber-200",
    "Audit In Progress": "bg-orange-50 text-orange-700  border-orange-200",
    Rework: "bg-rose-50   text-rose-700    border-rose-200",
    Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[s]}`}
    >
      {s}
    </span>
  );
}

function PatientStatusTag({ s }: { s: PatientStatus }) {
  return s === "Active" ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      Active
    </span>
  ) : s === "Inactive" ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-50   text-slate-600   border border-slate-200">
      {" "}
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50   text-amber-700   border border-amber-200">
      {" "}
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Pending
    </span>
  );
}

function RiskTag({ r }: { r: "Low" | "Medium" | "High" }) {
  return r === "High" ? (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-50    text-red-700">
      High
    </span>
  ) : r === "Medium" ? (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50  text-amber-700">
      Medium
    </span>
  ) : (
    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
      Low
    </span>
  );
}

function OcrTag({ s }: { s: OcrStatus }) {
  return s === "Complete" ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
      Complete
    </span>
  ) : s === "Processing" ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 animate-pulse">
      Processing
    </span>
  ) : s === "Failed" ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
      Failed
    </span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
      Pending
    </span>
  );
}

function ConfidenceRing({
  pct,
  size = 72,
  stroke = 8,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) {
  const color = pct >= 90 ? C.emerald : pct >= 75 ? C.amber : C.red;
  const textColor =
    pct >= 90
      ? "text-emerald-600"
      : pct >= 75
        ? "text-amber-600"
        : "text-red-500";
  // Small size: render as plain colored text (no SVG circle)
  if (size <= 44) {
    return <span className={`text-xs font-bold ${textColor}`}>{pct}%</span>;
  }
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold"
          style={{ fontSize: size > 60 ? 14 : 10, color }}
        >
          {pct}%
        </span>
        {size > 50 && (
          <span className="text-[8px] text-muted-foreground mt-0.5">
            AI Score
          </span>
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CHART LIFECYCLE TRACKER
══════════════════════════════════════════════════════ */
const LIFECYCLE_STAGES: { key: ChartStatus; label: string; short: string }[] = [
  { key: "Uploaded", label: "Uploaded", short: "Uploaded" },
  { key: "OCR Processing", label: "OCR Processed", short: "OCR" },
  { key: "AI Processed", label: "AI Processed", short: "AI" },
  { key: "Coding In Progress", label: "Coding", short: "Coding" },
  { key: "Audit Pending", label: "Audit Pending", short: "Audit" },
  { key: "Audit In Progress", label: "Audit Review", short: "Review" },
  { key: "Rework", label: "Rework", short: "Rework" },
  { key: "Completed", label: "Completed", short: "Done" },
];

const STAGE_ORDER: ChartStatus[] = [
  "Uploaded",
  "OCR Processing",
  "AI Processed",
  "Coding In Progress",
  "Coding Complete",
  "Audit Pending",
  "Audit In Progress",
  "Rework",
  "Completed",
];

function ChartLifecycleTracker({ status }: { status: ChartStatus }) {
  const stages = LIFECYCLE_STAGES.filter((s) => s.key !== "Coding Complete");
  const currentIdx = STAGE_ORDER.indexOf(status);

  const getStageState = (key: ChartStatus): "done" | "active" | "pending" => {
    const si = STAGE_ORDER.indexOf(key);
    if (key === "Rework") return status === "Rework" ? "active" : "pending";
    if (si < currentIdx) return "done";
    if (si === currentIdx) return "active";
    return "pending";
  };

  return (
    <div className="relative">
      {/* connector line */}
      <div className="absolute top-4 left-4 right-4 h-0.5 bg-muted" />
      <div className="relative flex justify-between">
        {stages.map((stage, i) => {
          const state = getStageState(stage.key);
          return (
            <div
              key={stage.key}
              className="flex flex-col items-center gap-2 relative z-10"
              style={{ minWidth: 0 }}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 ${
                  state === "done"
                    ? "bg-primary border-primary"
                    : state === "active"
                      ? stage.key === "Rework"
                        ? "bg-rose-500 border-rose-500"
                        : "bg-primary border-primary ring-4 ring-primary/20"
                      : "bg-card border-border"
                }`}
              >
                {state === "done" ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                ) : state === "active" ? (
                  stage.key === "Rework" ? (
                    <RotateCcw className="w-3.5 h-3.5 text-white" />
                  ) : (
                    <CircleDot className="w-3.5 h-3.5 text-white" />
                  )
                ) : (
                  <div className="w-2 h-2 rounded-full bg-border" />
                )}
              </div>
              <div className="text-center px-1">
                <div
                  className={`text-[9px] font-bold leading-tight ${
                    state === "done"
                      ? "text-primary"
                      : state === "active"
                        ? stage.key === "Rework"
                          ? "text-rose-600"
                          : "text-primary"
                        : "text-muted-foreground"
                  }`}
                >
                  {stage.short}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DOCUMENT UPLOAD ZONE
══════════════════════════════════════════════════════ */
function DocumentUploadZone({ chartId }: { chartId: string }) {
  const [files, setFiles] = useState<
    {
      name: string;
      size: number;
      type: string;
      status: "queued" | "uploading" | "done";
    }[]
  >([]);
  const [drag, setDrag] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/tiff"];
  const MAX_MB = 50;

  const addFiles = useCallback((incoming: File[]) => {
    const valid = incoming.filter(
      (f) => ALLOWED.includes(f.type) && f.size <= MAX_MB * 1024 * 1024,
    );
    setFiles((prev) => {
      const names = new Set(prev.map((f) => f.name));
      return [
        ...prev,
        ...valid
          .filter((f) => !names.has(f.name))
          .map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            status: "queued" as const,
          })),
      ];
    });
  }, []);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    addFiles(Array.from(e.dataTransfer.files));
  };
  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = "";
  };
  const remove = (name: string) =>
    setFiles((f) => f.filter((x) => x.name !== name));

  const handleUpload = () => {
    setFiles((f) => f.map((x) => ({ ...x, status: "uploading" })));
    setTimeout(() => {
      setFiles((f) => f.map((x) => ({ ...x, status: "done" })));
      setUploaded(true);
    }, 1800);
  };

  const fmtSize = (b: number) =>
    b < 1024 * 1024
      ? `${(b / 1024).toFixed(1)} KB`
      : `${(b / 1024 / 1024).toFixed(1)} MB`;
  const iconFor = (t: string) => (t === "application/pdf" ? "PDF" : "IMG");

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors ${
          drag
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/20"
        }`}
      >
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Upload className="w-5 h-5 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-foreground">
            Drag &amp; drop files here, or click to browse
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            PDF, JPEG, PNG, TIFF · Max 50 MB per file · Bulk upload supported
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.tiff"
          multiple
          className="hidden"
          onChange={onPick}
        />
      </div>

      {/* File queue */}
      {files.length > 0 && (
        <div className="space-y-1.5">
          {files.map((f) => (
            <div
              key={f.name}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors ${
                f.status === "done"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-muted/20 border-border"
              }`}
            >
              <div
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${f.type === "application/pdf" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
              >
                {iconFor(f.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-foreground truncate">
                  {f.name}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {fmtSize(f.size)}
                </p>
              </div>
              {f.status === "uploading" && (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
              )}
              {f.status === "done" && (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              )}
              {f.status === "queued" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    remove(f.name);
                  }}
                  className="text-muted-foreground hover:text-red-500 flex-shrink-0 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}

          {!uploaded && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-muted-foreground">
                {files.filter((f) => f.status === "queued").length} file(s)
                ready
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFiles([])}
                  className="text-[11px] text-muted-foreground hover:text-foreground font-semibold px-3 py-1.5 border border-border rounded-lg transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={handleUpload}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload {files.length} File{files.length > 1 ? "s" : ""}
                </button>
              </div>
            </div>
          )}
          {uploaded && (
            <div className="flex items-center gap-2 text-emerald-700 text-[11px] font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              {files.length} file{files.length > 1 ? "s" : ""} uploaded
              successfully — OCR processing queued
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CHART DETAIL PAGE
══════════════════════════════════════════════════════ */
function ChartDetail({ chart, onBack }: { chart: Chart; onBack: () => void }) {
  const [tab, setTab] = useState<
    "overview" | "codes" | "documents" | "history"
  >("overview");

  const TABS = [
    { id: "overview" as const, label: "Overview" },
    { id: "codes" as const, label: "ICD / CPT Codes" },
    { id: "documents" as const, label: "Documents" },
    { id: "history" as const, label: "History & Audit" },
  ];

  const ocrPct =
    chart.ocrPages > 0
      ? Math.round((chart.ocrComplete / chart.ocrPages) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-mono text-muted-foreground">
                {chart.id}
              </span>
              <StatusTag s={chart.status} />
              <SlaTag s={chart.slaStatus} />
              {chart.exceptions.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                  <Flag className="w-3 h-3" />
                  {chart.exceptions.length} Exception
                  {chart.exceptions.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-foreground">
              {chart.encounterType} Encounter — {chart.encounterDate}
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {chart.facility} · {chart.department}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        </div>
      </div>

      {/* Lifecycle Tracker */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-bold text-foreground">Chart Lifecycle</h4>
          {chart.slaStatus === "At Risk" && (
            <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {chart.slaHrsLeft}h remaining
            </span>
          )}
          {chart.slaStatus === "Breached" && (
            <span className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              SLA Breached {Math.abs(chart.slaHrsLeft)}h ago
            </span>
          )}
        </div>
        <ChartLifecycleTracker status={chart.status} />
      </Card>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="flex border-b border-border px-2 bg-muted/20 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── OVERVIEW TAB ── */}
          {tab === "overview" && (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-4">
                {/* Chart Metadata */}
                <Card className="p-4 col-span-1">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-3.5 h-3.5 text-primary" />
                    Chart Metadata
                  </h4>
                  <div className="space-y-2.5">
                    {[
                      { label: "Chart ID", value: chart.id },
                      { label: "Encounter Type", value: chart.encounterType },
                      { label: "Admit Date", value: chart.admitDate },
                      { label: "Discharge", value: chart.dischargeDate },
                      { label: "Facility", value: chart.facility },
                      { label: "Department", value: chart.department },
                      {
                        label: "DRG",
                        value:
                          chart.drg === "N/A"
                            ? "N/A"
                            : `${chart.drg} (Weight: ${chart.drgWeight})`,
                      },
                      { label: "Assigned Coder", value: chart.coder || "—" },
                      {
                        label: "Assigned Auditor",
                        value: chart.auditor || "—",
                      },
                      { label: "SLA Deadline", value: chart.slaDeadline },
                    ].map((r) => (
                      <div key={r.label} className="flex gap-2">
                        <span className="text-[10px] text-muted-foreground w-28 flex-shrink-0">
                          {r.label}
                        </span>
                        <span className="text-[11px] font-semibold text-foreground">
                          {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="col-span-2 space-y-4">
                  {/* OCR Status */}
                  <Card className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <ScanLine className="w-3.5 h-3.5 text-blue-500" />
                        OCR Processing
                      </h4>
                      <OcrTag s={chart.ocrStatus} />
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      {[
                        { label: "Total Pages", value: chart.ocrPages },
                        { label: "Processed", value: chart.ocrComplete },
                        { label: "Accuracy", value: "99.2%" },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="text-center p-2 bg-muted/20 rounded-lg"
                        >
                          <div className="text-base font-bold text-foreground">
                            {m.value}
                          </div>
                          <div className="text-[10px] text-muted-foreground">
                            {m.label}
                          </div>
                        </div>
                      ))}
                    </div>
                    <ProgressBar
                      pct={ocrPct}
                      color={
                        chart.ocrStatus === "Complete" ? C.emerald : C.blue
                      }
                    />
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {ocrPct}% complete · {chart.ocrComplete}/{chart.ocrPages}{" "}
                      pages processed
                    </p>
                  </Card>

                  {/* AI Processing Status */}
                  <Card className="p-4">
                    <div className="flex items-start gap-4">
                      <ConfidenceRing
                        pct={chart.aiConfidence}
                        size={80}
                        stroke={9}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                            <Brain className="w-3.5 h-3.5 text-violet-500" />
                            AI Processing
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              chart.aiStatus === "Complete"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : chart.aiStatus === "Processing"
                                  ? "bg-violet-50 text-violet-700 border-violet-200 animate-pulse"
                                  : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {chart.aiStatus}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {[
                            {
                              label: "Codes Suggested",
                              value: chart.aiCodesCount,
                              color: "text-foreground",
                            },
                            {
                              label: "Accepted",
                              value: chart.aiAccepted,
                              color: "text-emerald-600",
                            },
                            {
                              label: "Overridden",
                              value: chart.aiCodesCount - chart.aiAccepted,
                              color: "text-amber-600",
                            },
                          ].map((m) => (
                            <div
                              key={m.label}
                              className="text-center p-2 bg-muted/20 rounded-lg"
                            >
                              <div className={`text-base font-bold ${m.color}`}>
                                {m.value}
                              </div>
                              <div className="text-[9px] text-muted-foreground">
                                {m.label}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between mb-0.5">
                            <span className="text-[10px] text-muted-foreground">
                              Acceptance Rate
                            </span>
                            <span className="text-[10px] font-bold text-foreground">
                              {chart.aiCodesCount > 0
                                ? Math.round(
                                    (chart.aiAccepted / chart.aiCodesCount) *
                                      100,
                                  )
                                : 0}
                              %
                            </span>
                          </div>
                          <ProgressBar
                            pct={
                              chart.aiCodesCount > 0
                                ? Math.round(
                                    (chart.aiAccepted / chart.aiCodesCount) *
                                      100,
                                  )
                                : 0
                            }
                            color={C.teal}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Exception Flags */}
              {chart.exceptions.length > 0 && (
                <Card className="p-4">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5 text-red-500" />
                    Exception Flags
                  </h4>
                  <div className="space-y-2">
                    {chart.exceptions.map((ex) => (
                      <div
                        key={ex.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          ex.severity === "Critical"
                            ? "bg-red-50 border-red-200"
                            : ex.severity === "High"
                              ? "bg-orange-50 border-orange-200"
                              : "bg-amber-50 border-amber-200"
                        }`}
                      >
                        <AlertTriangle
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            ex.severity === "Critical"
                              ? "text-red-500"
                              : ex.severity === "High"
                                ? "text-orange-500"
                                : "text-amber-500"
                          }`}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-foreground">
                              {ex.type}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                ex.severity === "Critical"
                                  ? "bg-red-100 text-red-700"
                                  : ex.severity === "High"
                                    ? "bg-orange-100 text-orange-700"
                                    : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {ex.severity}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${
                                ex.status === "Open"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {ex.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {ex.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Raised {ex.raisedAt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Document Upload */}
              <Card className="p-4">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  Upload Documents
                </h4>
                <DocumentUploadZone chartId={chart.id} />
              </Card>
            </div>
          )}

          {/* ── CODES TAB ── */}
          {tab === "codes" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Diagnosis Codes */}
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    Diagnosis Codes (ICD-10-CM)
                  </h4>
                  <div className="space-y-2">
                    {chart.dxCodes.map((c, i) => (
                      <div
                        key={c.code}
                        className={`p-3 rounded-xl border ${c.accepted ? "border-border" : "border-dashed border-amber-300 bg-amber-50/40"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 text-center mt-0.5">
                            <span className="text-[9px] text-muted-foreground font-bold block">
                              P{i + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-xs font-bold text-primary">
                                {c.code}
                              </span>
                              {c.aiSuggested && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  AI
                                </span>
                              )}
                              {!c.accepted && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                  Overridden
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">
                              {c.description}
                            </p>
                            {c.confidence && c.confidence > 0 && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <ProgressBar
                                  pct={c.confidence}
                                  color={
                                    c.confidence >= 90
                                      ? C.emerald
                                      : c.confidence >= 75
                                        ? C.amber
                                        : C.red
                                  }
                                  h="h-1"
                                />
                                <span className="text-[9px] font-bold text-muted-foreground w-8">
                                  {c.confidence}%
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {c.accepted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <XCircle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CPT Codes */}
                <div>
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-cyan-500" />
                    Procedure Codes (CPT-4)
                  </h4>
                  <div className="space-y-2">
                    {chart.cptCodes.map((c) => (
                      <div
                        key={c.code}
                        className={`p-3 rounded-xl border ${c.accepted ? "border-border" : "border-dashed border-amber-300 bg-amber-50/40"}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-mono text-xs font-bold text-cyan-700">
                                {c.code}
                              </span>
                              {c.aiSuggested && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  AI
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground leading-tight">
                              {c.description}
                            </p>
                            {c.confidence && c.confidence > 0 && (
                              <div className="flex items-center gap-2 mt-1.5">
                                <ProgressBar
                                  pct={c.confidence}
                                  color={
                                    c.confidence >= 90
                                      ? C.emerald
                                      : c.confidence >= 75
                                        ? C.amber
                                        : C.red
                                  }
                                  h="h-1"
                                />
                                <span className="text-[9px] font-bold text-muted-foreground w-8">
                                  {c.confidence}%
                                </span>
                              </div>
                            )}
                          </div>
                          {c.accepted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* DRG Summary */}
                  {chart.drg !== "N/A" && (
                    <div className="mt-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-[10px] text-muted-foreground mb-1">
                        MS-DRG Assignment
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-primary">
                          DRG {chart.drg}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          Weight: {chart.drgWeight}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── DOCUMENTS TAB ── */}
          {tab === "documents" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-foreground">
                  {chart.documents.length} Document
                  {chart.documents.length !== 1 ? "s" : ""} attached
                </p>
              </div>
              <div className="space-y-2">
                {chart.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/20 transition-colors group"
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${doc.type === "PDF" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}
                    >
                      {doc.type === "PDF" ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <ImageIcon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-semibold text-foreground truncate">
                        {doc.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {doc.size} · {doc.pages} pages · Uploaded{" "}
                        {doc.uploadedAt} by {doc.uploadedBy}
                      </p>
                    </div>
                    <OcrTag s={doc.ocrStatus} />
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t border-border">
                <h4 className="text-xs font-bold text-foreground mb-3">
                  Upload Additional Documents
                </h4>
                <DocumentUploadZone chartId={chart.id} />
              </div>
            </div>
          )}

          {/* ── HISTORY TAB ── */}
          {tab === "history" && (
            <div className="grid grid-cols-2 gap-5">
              {/* Coding History */}
              <div>
                <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-primary" />
                  Coding History
                </h4>
                {chart.codingHistory.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    No coding activity yet.
                  </p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted" />
                    <div className="space-y-4">
                      {chart.codingHistory.map((e) => (
                        <div key={e.id} className="relative flex gap-3 pl-8">
                          <div className="absolute left-0 w-7 h-7 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-primary">
                              {e.user
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="flex-1 pb-3">
                            <p className="text-[11px] font-semibold text-foreground">
                              {e.action}
                            </p>
                            {e.note && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                                "{e.note}"
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {e.user} · {e.role} · {e.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {/* Audit History */}
              <div>
                <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Audit History
                </h4>
                {chart.auditHistory.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">
                    No audit activity yet.
                  </p>
                ) : (
                  <div className="relative">
                    <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted" />
                    <div className="space-y-4">
                      {chart.auditHistory.map((e) => (
                        <div key={e.id} className="relative flex gap-3 pl-8">
                          <div className="absolute left-0 w-7 h-7 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center flex-shrink-0">
                            <span className="text-[8px] font-bold text-emerald-700">
                              {e.user
                                .replace("Dr. ", "")
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                          <div className="flex-1 pb-3">
                            <p className="text-[11px] font-semibold text-foreground">
                              {e.action}
                            </p>
                            {e.note && (
                              <p className="text-[10px] text-muted-foreground mt-0.5 italic">
                                "{e.note}"
                              </p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {e.user} · {e.role} · {e.date}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CHART LIST VIEW
══════════════════════════════════════════════════════ */
function ChartList({
  charts,
  onSelectChart,
  onBack,
}: {
  charts: Chart[];
  onSelectChart: (c: Chart) => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterSla, setFilterSla] = useState("All");
  const [filterType, setFilterType] = useState("All");

  const statuses = [
    "All",
    "Uploaded",
    "OCR Processing",
    "AI Processed",
    "Coding In Progress",
    "Coding Complete",
    "Audit Pending",
    "Audit In Progress",
    "Rework",
    "Completed",
  ];
  const slas = ["All", "On Track", "At Risk", "Breached"];
  const types = [
    "All",
    "Inpatient",
    "Outpatient",
    "ED Visit",
    "HCC",
    "Observation",
  ];

  const filtered = charts.filter(
    (c) =>
      (c.id.toLowerCase().includes(search.toLowerCase()) ||
        c.coder.toLowerCase().includes(search.toLowerCase()) ||
        c.auditor.toLowerCase().includes(search.toLowerCase())) &&
      (filterStatus === "All" || c.status === filterStatus) &&
      (filterSla === "All" || c.slaStatus === filterSla) &&
      (filterType === "All" || c.encounterType === filterType),
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <div>
          <h4 className="text-sm font-bold text-foreground">Charts</h4>
          <p className="text-[11px] text-muted-foreground">
            {charts.length} charts associated with this patient
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-40">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search chart ID, coder…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-border rounded-lg bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {[
            {
              label: "Status",
              val: filterStatus,
              set: setFilterStatus,
              opts: statuses,
            },
            { label: "SLA", val: filterSla, set: setFilterSla, opts: slas },
            { label: "Type", val: filterType, set: setFilterType, opts: types },
          ].map((f) => (
            <select
              key={f.label}
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              className="text-xs border border-border rounded-lg px-2 py-1.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {f.opts.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-muted/30 border-b border-border">
              {[
                "Chart ID",
                "Encounter Type",
                "Encounter Date",
                "Assigned Coder",
                "Assigned Auditor",
                "OCR",
                "AI Score",
                "Status",
                "SLA",
                "",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr
                key={c.id}
                onClick={() => onSelectChart(c)}
                className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-3 font-mono font-bold text-primary group-hover:underline">
                  {c.id}
                </td>
                <td className="py-3 px-3 font-semibold text-foreground">
                  {c.encounterType}
                </td>
                <td className="py-3 px-3 text-muted-foreground">
                  {c.encounterDate}
                </td>
                <td className="py-3 px-3 text-foreground">
                  {c.coder || (
                    <span className="text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
                </td>
                <td className="py-3 px-3 text-foreground">
                  {c.auditor || (
                    <span className="text-muted-foreground italic">—</span>
                  )}
                </td>
                <td className="py-3 px-3">
                  <OcrTag s={c.ocrStatus} />
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1.5">
                    <ConfidenceRing pct={c.aiConfidence} size={32} stroke={4} />
                  </div>
                </td>
                <td className="py-3 px-3">
                  <StatusTag s={c.status} />
                </td>
                <td className="py-3 px-3">
                  <SlaTag s={c.slaStatus} />
                </td>
                <td className="py-3 px-3">
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PATIENT 360 TAB
══════════════════════════════════════════════════════ */
function Patient360({
  patient,
  charts,
  onSelectChart,
}: {
  patient: Patient;
  charts: Chart[];
  onSelectChart: (c: Chart) => void;
}) {
  const exceptionCharts = charts.filter((c) => c.exceptions.length > 0);
  const allExceptions = exceptionCharts.flatMap((c) =>
    c.exceptions.map((e) => ({ ...e, chartId: c.id })),
  );

  return (
    <div className="space-y-5">
      {/* 4 KPI Tiles */}
      <div className="grid grid-cols-4 gap-3">
        {[
          {
            label: "Total Charts",
            value: patient.totalCharts,
            color: C.primary,
            icon: FileText,
          },
          {
            label: "Completed",
            value: patient.completedCharts,
            color: C.emerald,
            icon: CheckCircle2,
          },
          {
            label: "In Progress",
            value: charts.filter((c) =>
              [
                "Coding In Progress",
                "Audit In Progress",
                "Audit Pending",
              ].includes(c.status),
            ).length,
            color: C.cyan,
            icon: Activity,
          },
          {
            label: "Exceptions Open",
            value: allExceptions.filter((e) => e.status === "Open").length,
            color: C.red,
            icon: AlertTriangle,
          },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="p-4">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: `${kpi.color}18` }}
              >
                <Icon className="w-4 h-4" style={{ color: kpi.color }} />
              </div>
              <div className="text-xl font-bold text-foreground">
                {kpi.value}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {kpi.label}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <Card className="p-5">
        <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          All Charts
        </h4>
        <div className="space-y-3">
          {charts.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectChart(c)}
              className="flex items-center gap-4 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-muted/20 cursor-pointer transition-all group"
            >
              <div className="flex-shrink-0 flex flex-col items-center justify-center w-14 gap-0.5">
                <span
                  className={`text-sm font-bold ${c.aiConfidence >= 90 ? "text-emerald-600" : c.aiConfidence >= 75 ? "text-amber-600" : "text-red-500"}`}
                >
                  {c.aiConfidence}%
                </span>
                <span className="text-[9px] text-muted-foreground">
                  AI Score
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[11px] font-bold text-primary group-hover:underline">
                    {c.id}
                  </span>
                  <StatusTag s={c.status} />
                  <SlaTag s={c.slaStatus} />
                  {c.exceptions.length > 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-0.5">
                      <Flag className="w-2.5 h-2.5" />
                      {c.exceptions.length}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-foreground">
                  {c.encounterType} · {c.encounterDate} · {c.facility}
                </p>
                <div className="flex items-center gap-4 mt-1.5">
                  <span className="text-[10px] text-muted-foreground">
                    Coder:{" "}
                    <span className="text-foreground font-semibold">
                      {c.coder || "Unassigned"}
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    Auditor:{" "}
                    <span className="text-foreground font-semibold">
                      {c.auditor || "—"}
                    </span>
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    DX:{" "}
                    <span className="font-mono font-bold text-primary">
                      {c.dxCodes
                        .filter((d) => d.accepted)
                        .map((d) => d.code)
                        .slice(0, 2)
                        .join(", ") || "Pending"}
                    </span>
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 space-y-1">
                <div className="text-[10px] text-muted-foreground">OCR</div>
                <OcrTag s={c.ocrStatus} />
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
          ))}
        </div>
      </Card>

      {/* Exception Flags */}
      {allExceptions.length > 0 && (
        <Card className="p-5">
          <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5 text-red-500" />
            Exception Flags Across All Charts
          </h4>
          <div className="space-y-2">
            {allExceptions.map((ex) => (
              <div
                key={ex.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  ex.severity === "Critical"
                    ? "bg-red-50 border-red-200"
                    : ex.severity === "High"
                      ? "bg-orange-50 border-orange-200"
                      : "bg-amber-50 border-amber-200"
                }`}
              >
                <AlertTriangle
                  className={`w-3.5 h-3.5 flex-shrink-0 mt-0.5 ${ex.severity === "Critical" ? "text-red-500" : ex.severity === "High" ? "text-orange-500" : "text-amber-500"}`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {ex.chartId}
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {ex.type}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-auto ${ex.status === "Open" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                    >
                      {ex.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {ex.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Combined Timeline */}
      <Card className="p-5">
        <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-primary" />
          Coding &amp; Audit Timeline
        </h4>
        <div className="relative">
          <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-muted" />
          <div className="space-y-3">
            {charts
              .flatMap((c) => [
                ...c.codingHistory.map((e) => ({
                  ...e,
                  chartId: c.id,
                  kind: "coding" as const,
                })),
                ...c.auditHistory.map((e) => ({
                  ...e,
                  chartId: c.id,
                  kind: "audit" as const,
                })),
              ])
              .sort((a, b) => b.date.localeCompare(a.date))
              .slice(0, 10)
              .map((e) => (
                <div key={e.id} className="relative flex gap-3 pl-9">
                  <div
                    className={`absolute left-0 w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      e.kind === "audit"
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-sky-50 border-sky-300"
                    }`}
                  >
                    {e.kind === "audit" ? (
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <ClipboardList className="w-3 h-3 text-sky-600" />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] text-muted-foreground">
                        {e.chartId}
                      </span>
                      <span className="text-[11px] font-semibold text-foreground">
                        {e.action}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {e.user} · {e.date}
                    </p>
                    {e.note && (
                      <p className="text-[10px] text-muted-foreground italic mt-0.5">
                        "{e.note}"
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PATIENT PROFILE TAB
══════════════════════════════════════════════════════ */
function PatientProfileTab({ patient }: { patient: Patient }) {
  const totalCharts = patient.totalCharts;
  const completedPct =
    totalCharts > 0
      ? Math.round((patient.completedCharts / totalCharts) * 100)
      : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-4">
        {/* Demographics */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-primary" />
            Demographics
          </h4>
          <div className="space-y-3">
            {[
              {
                label: "Full Name",
                value: `${patient.firstName} ${patient.lastName}`,
              },
              {
                label: "Date of Birth",
                value: `${patient.dob} (Age ${patient.age})`,
              },
              { label: "Gender", value: patient.gender },
              { label: "MRN", value: patient.mrn },
            ].map((r) => (
              <div key={r.label}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {r.label}
                </div>
                <div className="text-xs font-semibold text-foreground mt-0.5">
                  {r.value}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border space-y-2">
              <div className="flex items-center gap-2 text-[11px] text-foreground">
                <Phone className="w-3 h-3 text-muted-foreground" />
                {patient.phone}
              </div>
              <div className="flex items-center gap-2 text-[11px] text-foreground">
                <Mail className="w-3 h-3 text-muted-foreground" />
                {patient.email}
              </div>
              <div className="flex items-start gap-2 text-[11px] text-foreground">
                <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                {patient.address}
              </div>
            </div>
          </div>
        </Card>

        {/* Admission & Insurance */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            Admission & Insurance
          </h4>
          <div className="space-y-3">
            {[
              { label: "Facility", value: patient.facility },
              { label: "Attending", value: patient.attending },
              { label: "Admission Date", value: patient.admissionDate },
              { label: "Discharge Date", value: patient.dischargeDate },
              {
                label: "LOS",
                value: `${Math.ceil((new Date(patient.dischargeDate).getTime() - new Date(patient.admissionDate).getTime()) / 86400000)} day(s)`,
              },
            ].map((r) => (
              <div key={r.label}>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  {r.label}
                </div>
                <div className="text-xs font-semibold text-foreground mt-0.5">
                  {r.value}
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-border space-y-2">
              {[
                { label: "Insurance Plan", value: patient.insurancePlan },
                { label: "Member ID", value: patient.memberId },
                { label: "Payer Type", value: patient.payerType },
              ].map((r) => (
                <div key={r.label} className="flex justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {r.label}
                  </span>
                  <span className="text-[11px] font-semibold text-foreground">
                    {r.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Coding Summary */}
        <Card className="p-5">
          <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
            <ClipboardList className="w-3.5 h-3.5 text-primary" />
            Coding Summary
          </h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[10px] text-muted-foreground">
                  Completion
                </span>
                <span className="text-[10px] font-bold text-foreground">
                  {completedPct}%
                </span>
              </div>
              <ProgressBar
                pct={completedPct}
                color={
                  completedPct >= 80
                    ? C.emerald
                    : completedPct >= 50
                      ? C.primary
                      : C.amber
                }
                h="h-2"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                {patient.completedCharts} of {patient.totalCharts} charts
                complete
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Total Charts",
                  value: patient.totalCharts,
                  color: "text-foreground",
                },
                {
                  label: "Completed",
                  value: patient.completedCharts,
                  color: "text-emerald-600",
                },
                {
                  label: "In Progress",
                  value: patient.totalCharts - patient.completedCharts,
                  color: "text-cyan-600",
                },
                {
                  label: "Project",
                  value: patient.projectId,
                  color: "text-primary",
                },
              ].map((m) => (
                <div key={m.label} className="p-2 bg-muted/20 rounded-lg">
                  <div className={`text-sm font-bold ${m.color}`}>
                    {m.value}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-[10px] text-muted-foreground mb-1.5">
                Primary Diagnoses
              </div>
              <div className="flex flex-wrap gap-1.5">
                {patient.primaryDx.map((dx) => (
                  <span
                    key={dx}
                    className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary"
                  >
                    {dx}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">
                Risk Level
              </span>
              <RiskTag r={patient.riskLevel} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PATIENT PROFILE PAGE
══════════════════════════════════════════════════════ */
type PatientView = "profile" | "360" | "charts" | "chart-detail";

function PatientProfile({
  patient,
  onBack,
}: {
  patient: Patient;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"profile" | "360" | "charts">("profile");
  const [view, setView] = useState<PatientView>("profile");
  const [selectedChart, setSelectedChart] = useState<Chart | null>(null);

  const patientCharts = CHARTS.filter((c) => c.patientId === patient.id);

  const handleSelectChart = (c: Chart) => {
    setSelectedChart(c);
    setView("chart-detail");
  };

  if (view === "chart-detail" && selectedChart) {
    return (
      <ChartDetail
        chart={selectedChart}
        onBack={() => {
          setView("charts");
          setTab("charts");
        }}
      />
    );
  }
  if (view === "charts") {
    return (
      <ChartList
        charts={patientCharts}
        onSelectChart={handleSelectChart}
        onBack={() => setView("profile")}
      />
    );
  }

  const TABS = [
    { id: "profile" as const, label: "Patient Profile" },
    { id: "360" as const, label: "Patient 360 View" },
    { id: "charts" as const, label: `Charts (${patientCharts.length})` },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button
            onClick={onBack}
            className="mt-0.5 p-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="font-mono text-[11px] text-muted-foreground">
                {patient.mrn}
              </span>
              <PatientStatusTag s={patient.status} />
              <RiskTag r={patient.riskLevel} />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {patient.firstName} {patient.lastName}
            </h2>
            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              {patient.facility}
              <span className="text-border">·</span>
              <Stethoscope className="w-3.5 h-3.5" />
              {patient.attending}
              <span className="text-border">·</span>
              <span className="font-semibold text-foreground">
                {patient.project}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setView("charts");
              setTab("charts");
            }}
            className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            View Charts
          </button>
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Add Chart
          </button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="overflow-hidden">
        <div className="flex border-b border-border px-2 bg-muted/20">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "profile" && <PatientProfileTab patient={patient} />}
          {tab === "360" && (
            <Patient360
              patient={patient}
              charts={patientCharts}
              onSelectChart={handleSelectChart}
            />
          )}
          {tab === "charts" && (
            <ChartList
              charts={patientCharts}
              onSelectChart={handleSelectChart}
              onBack={() => setTab("profile")}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PATIENT LIST VIEW
══════════════════════════════════════════════════════ */
function PatientList({ onSelect }: { onSelect: (p: Patient) => void }) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRisk, setFilterRisk] = useState("All");
  const [filterProject, setFilterProject] = useState("All");
  const [filterGender, setFilterGender] = useState("All");

  const projects = [
    "All",
    ...Array.from(new Set(PATIENTS.map((p) => p.project))),
  ];

  const filtered = PATIENTS.filter((p) => {
    const q = search.toLowerCase();
    return (
      (`${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.mrn.toLowerCase().includes(q) ||
        p.memberId?.toLowerCase().includes(q)) &&
      (filterStatus === "All" || p.status === filterStatus) &&
      (filterRisk === "All" || p.riskLevel === filterRisk) &&
      (filterProject === "All" || p.project === filterProject) &&
      (filterGender === "All" || p.gender === filterGender)
    );
  });

  const kpis = [
    {
      label: "Total Patients",
      value: PATIENTS.length,
      color: C.primary,
      bg: "bg-sky-50 border-sky-100",
    },
    {
      label: "Active",
      value: PATIENTS.filter((p) => p.status === "Active").length,
      color: C.emerald,
      bg: "bg-emerald-50 border-emerald-100",
    },
    {
      label: "High Risk",
      value: PATIENTS.filter((p) => p.riskLevel === "High").length,
      color: C.red,
      bg: "bg-red-50 border-red-100",
    },
    {
      label: "Charts Pending",
      value: PATIENTS.reduce(
        (a, p) => a + (p.totalCharts - p.completedCharts),
        0,
      ),
      color: C.amber,
      bg: "bg-amber-50 border-amber-100",
    },
  ];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Patients &amp; Charts
          </h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Manage patient records, chart assignments, and coding workflow
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          <button className="inline-flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold">
            <Plus className="w-3.5 h-3.5" />
            Add Patient
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-4 gap-3">
        {kpis.map((k) => (
          <Card key={k.label} className={`p-4 border ${k.bg}`}>
            <div className="text-2xl font-bold" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="text-[11px] text-muted-foreground mt-0.5">
              {k.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, MRN, Member ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-border rounded-lg bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <Filter className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          {[
            {
              label: "Status",
              val: filterStatus,
              set: setFilterStatus,
              opts: ["All", "Active", "Inactive", "Pending"],
            },
            {
              label: "Risk",
              val: filterRisk,
              set: setFilterRisk,
              opts: ["All", "High", "Medium", "Low"],
            },
            {
              label: "Project",
              val: filterProject,
              set: setFilterProject,
              opts: projects,
            },
            {
              label: "Gender",
              val: filterGender,
              set: setFilterGender,
              opts: ["All", "Male", "Female", "Other"],
            },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">
                {f.label}:
              </span>
              <select
                value={f.val}
                onChange={(e) => f.set(e.target.value)}
                className="text-xs border border-border rounded-lg px-2 py-1.5 bg-input-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {f.opts.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>
          ))}
          <span className="text-[11px] text-muted-foreground ml-auto">
            {filtered.length} patient{filtered.length !== 1 ? "s" : ""} shown
          </span>
        </div>
      </Card>

      {/* Patient Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                {[
                  "Patient",
                  "MRN",
                  "Age / Gender",
                  "Facility",
                  "Project",
                  "Charts",
                  "Risk",
                  "Status",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-[10px] font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const completionPct =
                  p.totalCharts > 0
                    ? Math.round((p.completedCharts / p.totalCharts) * 100)
                    : 0;
                return (
                  <tr
                    key={p.id}
                    onClick={() => onSelect(p)}
                    className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.firstName} {p.lastName}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {p.attending}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-primary">
                      {p.mrn}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {p.age}y · {p.gender}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {p.facility}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground truncate max-w-[140px]">
                        {p.project}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {p.projectId}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 w-28">
                        <ProgressBar
                          pct={completionPct}
                          color={
                            completionPct >= 80
                              ? C.emerald
                              : completionPct >= 50
                                ? C.primary
                                : C.amber
                          }
                        />
                        <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap">
                          {p.completedCharts}/{p.totalCharts}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <RiskTag r={p.riskLevel} />
                    </td>
                    <td className="py-3 px-4">
                      <PatientStatusTag s={p.status} />
                    </td>
                    <td className="py-3 px-4">
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   ROOT EXPORT
══════════════════════════════════════════════════════ */
export function Patients() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  return selectedPatient ? (
    <PatientProfile
      patient={selectedPatient}
      onBack={() => setSelectedPatient(null)}
    />
  ) : (
    <PatientList onSelect={setSelectedPatient} />
  );
}
