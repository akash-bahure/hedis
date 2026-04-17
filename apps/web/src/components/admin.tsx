import {
  Shield,
  Users,
  Lock,
  BookOpen,
  Upload,
  Link2,
  Database,
  Cpu,
  FileText,
  Clock,
  Settings,
  Plus,
  Edit2,
  Trash2,
  UserMinus,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Circle,
  Check,
  X,
  Info,
  Save,
  AlertCircle,
  TrendingUp,
  Activity,
  Zap,
  FileUp,
  ExternalLink,
  Calendar,
  User,
} from "lucide-react";
import { useState, Fragment } from "react";

type AdminTab =
  | "users"
  | "permissions"
  | "measures"
  | "specs"
  | "fhir"
  | "pipelines"
  | "nlp"
  | "audit-logs"
  | "retention";

interface ModalState {
  isOpen: boolean;
  type:
    | "add-user"
    | "edit-user"
    | "deactivate-user"
    | "edit-permission"
    | "edit-measure"
    | "upload-spec"
    | "edit-fhir"
    | "view-fhir"
    | "pipeline-action"
    | "view-pipeline"
    | "nlp-rollback"
    | "view-nlp"
    | "retention-policy"
    | "view-retention"
    | null;
  data?: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "locked";
  lastLogin: string;
  scope: string;
}

interface Permission {
  module: string;
  permissions: {
    [role: string]: {
      view: boolean;
      edit: boolean;
      submit: boolean;
      audit: boolean;
    };
  };
}

interface Measure {
  id: string;
  code: string;
  name: string;
  year: string;
  enabled: boolean;
  type: "digital" | "hybrid";
  version: string;
}

interface NCQASpec {
  id: string;
  name: string;
  version: string;
  year: string;
  uploadDate: string;
  status: "active" | "archived";
  fileSize: string;
}

interface FHIRConnection {
  id: string;
  name: string;
  endpoint: string;
  status: "connected" | "disconnected" | "error";
  enabled: boolean;
  lastSync: string;
  scope: string;
}

interface Pipeline {
  id: string;
  name: string;
  type: "claims" | "ehr" | "documents";
  status: "running" | "paused" | "error";
  lastRun: string;
  recordsProcessed: number;
  errors: number;
}

interface NLPModel {
  id: string;
  name: string;
  version: string;
  status: "active" | "historical";
  confidence: number;
  coverage: number;
  deployedDate: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  ipAddress: string;
}

interface RetentionPolicy {
  id: string;
  name: string;
  dataType: string;
  retentionPeriod: string;
  enabled: boolean;
  lastRun: string;
  recordsAffected: number;
}

export function Admin() {
  const [activeTab, setActiveTab] = useState<AdminTab>("users");
  const [modal, setModal] = useState<ModalState>({ isOpen: false, type: null });
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data
  const [users, setUsers] = useState<User[]>([
    {
      id: "1",
      name: "Sarah Johnson",
      email: "sarah.j@healthplan.com",
      role: "Admin",
      status: "active",
      lastLogin: "2025-02-06 09:15",
      scope: "All Plans",
    },
    {
      id: "2",
      name: "Michael Chen",
      email: "mchen@healthplan.com",
      role: "Abstractor",
      status: "active",
      lastLogin: "2025-02-06 10:30",
      scope: "Commercial",
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      email: "emily.r@healthplan.com",
      role: "Reviewer",
      status: "active",
      lastLogin: "2025-02-05 16:45",
      scope: "Medicare",
    },
    {
      id: "4",
      name: "David Park",
      email: "dpark@healthplan.com",
      role: "Auditor",
      status: "active",
      lastLogin: "2025-02-06 08:00",
      scope: "All Plans",
    },
    {
      id: "5",
      name: "Lisa Thompson",
      email: "lisa.t@healthplan.com",
      role: "Abstractor",
      status: "inactive",
      lastLogin: "2025-01-15 14:20",
      scope: "Medicaid",
    },
  ]);

  const [permissions, setPermissions] = useState<Permission[]>([
    {
      module: "Work Queue",
      permissions: {
        Admin: { view: true, edit: true, submit: true, audit: true },
        Abstractor: { view: true, edit: true, submit: false, audit: false },
        Reviewer: { view: true, edit: true, submit: true, audit: false },
        Auditor: { view: true, edit: false, submit: false, audit: true },
      },
    },
    {
      module: "Medical Records",
      permissions: {
        Admin: { view: true, edit: true, submit: true, audit: true },
        Abstractor: { view: true, edit: false, submit: false, audit: false },
        Reviewer: { view: true, edit: false, submit: false, audit: false },
        Auditor: { view: true, edit: false, submit: false, audit: true },
      },
    },
    {
      module: "Reports & Submissions",
      permissions: {
        Admin: { view: true, edit: true, submit: true, audit: true },
        Abstractor: { view: false, edit: false, submit: false, audit: false },
        Reviewer: { view: true, edit: false, submit: true, audit: false },
        Auditor: { view: true, edit: false, submit: false, audit: true },
      },
    },
    {
      module: "Admin Panel",
      permissions: {
        Admin: { view: true, edit: true, submit: true, audit: true },
        Abstractor: { view: false, edit: false, submit: false, audit: false },
        Reviewer: { view: false, edit: false, submit: false, audit: false },
        Auditor: { view: true, edit: false, submit: false, audit: true },
      },
    },
  ]);

  const [measures, setMeasures] = useState<Measure[]>([
    {
      id: "1",
      code: "BCS-E",
      name: "Breast Cancer Screening",
      year: "2025",
      enabled: true,
      type: "hybrid",
      version: "1.2",
    },
    {
      id: "2",
      code: "CDC-E",
      name: "Comprehensive Diabetes Care",
      year: "2025",
      enabled: true,
      type: "digital",
      version: "2.1",
    },
    {
      id: "3",
      code: "CBP-E",
      name: "Controlling High Blood Pressure",
      year: "2025",
      enabled: true,
      type: "hybrid",
      version: "1.8",
    },
    {
      id: "4",
      code: "COL-E",
      name: "Colorectal Cancer Screening",
      year: "2025",
      enabled: true,
      type: "hybrid",
      version: "1.5",
    },
    {
      id: "5",
      code: "HBD-E",
      name: "Hemoglobin A1c Control for Patients",
      year: "2025",
      enabled: false,
      type: "digital",
      version: "1.0",
    },
  ]);

  const [specs, setSpecs] = useState<NCQASpec[]>([
    {
      id: "1",
      name: "HEDIS MY 2025 Volume 2",
      version: "2025.1",
      year: "2025",
      uploadDate: "2024-11-15",
      status: "active",
      fileSize: "24.5 MB",
    },
    {
      id: "2",
      name: "HEDIS MY 2024 Volume 2",
      version: "2024.3",
      year: "2024",
      uploadDate: "2023-11-20",
      status: "archived",
      fileSize: "23.1 MB",
    },
    {
      id: "3",
      name: "HEDIS MY 2025 Errata",
      version: "2025.1a",
      year: "2025",
      uploadDate: "2025-01-10",
      status: "active",
      fileSize: "2.3 MB",
    },
  ]);

  const [fhirConnections, setFhirConnections] = useState<FHIRConnection[]>([
    {
      id: "1",
      name: "Epic FHIR Server",
      endpoint: "https://fhir.epic.com/api/FHIR/R4",
      status: "connected",
      enabled: true,
      lastSync: "2025-02-06 09:00",
      scope: "patient/*.read",
    },
    {
      id: "2",
      name: "Cerner FHIR Gateway",
      endpoint: "https://fhir.cerner.com/r4",
      status: "connected",
      enabled: true,
      lastSync: "2025-02-06 08:45",
      scope: "patient/*.read observation/*.read",
    },
    {
      id: "3",
      name: "NextGen FHIR API",
      endpoint: "https://api.nextgen.com/fhir/r4",
      status: "error",
      enabled: true,
      lastSync: "2025-02-05 22:30",
      scope: "patient/*.read",
    },
    {
      id: "4",
      name: "Allscripts FHIR",
      endpoint: "https://fhir.allscripts.com/r4",
      status: "disconnected",
      enabled: false,
      lastSync: "2025-01-28 14:15",
      scope: "patient/*.read",
    },
  ]);

  const [pipelines, setPipelines] = useState<Pipeline[]>([
    {
      id: "1",
      name: "Claims Data Ingestion",
      type: "claims",
      status: "running",
      lastRun: "2025-02-06 09:00",
      recordsProcessed: 45230,
      errors: 12,
    },
    {
      id: "2",
      name: "EHR Clinical Data Sync",
      type: "ehr",
      status: "running",
      lastRun: "2025-02-06 08:30",
      recordsProcessed: 12890,
      errors: 3,
    },
    {
      id: "3",
      name: "Document Processing Pipeline",
      type: "documents",
      status: "running",
      lastRun: "2025-02-06 09:15",
      recordsProcessed: 8760,
      errors: 45,
    },
    {
      id: "4",
      name: "Legacy Claims Import",
      type: "claims",
      status: "paused",
      lastRun: "2025-02-05 23:00",
      recordsProcessed: 0,
      errors: 0,
    },
  ]);

  const [nlpModels, setNlpModels] = useState<NLPModel[]>([
    {
      id: "1",
      name: "HEDIS Evidence Extraction",
      version: "v3.2.1",
      status: "active",
      confidence: 94.2,
      coverage: 87.5,
      deployedDate: "2025-01-15",
    },
    {
      id: "2",
      name: "HEDIS Evidence Extraction",
      version: "v3.1.5",
      status: "historical",
      confidence: 92.8,
      coverage: 85.1,
      deployedDate: "2024-11-01",
    },
    {
      id: "3",
      name: "Clinical Entity Recognition",
      version: "v2.8.0",
      status: "active",
      confidence: 96.7,
      coverage: 91.3,
      deployedDate: "2024-12-10",
    },
    {
      id: "4",
      name: "Clinical Entity Recognition",
      version: "v2.7.2",
      status: "historical",
      confidence: 95.1,
      coverage: 89.7,
      deployedDate: "2024-09-05",
    },
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: "2025-02-06 10:32:15",
      user: "Sarah Johnson",
      action: "User Access Disabled",
      module: "User Management",
      details: "Disabled access for Lisa Thompson",
      ipAddress: "192.168.1.45",
    },
    {
      id: "2",
      timestamp: "2025-02-06 10:15:42",
      user: "Sarah Johnson",
      action: "Permission Changed",
      module: "Role Permissions",
      details: "Updated Reviewer role - enabled Submit permission",
      ipAddress: "192.168.1.45",
    },
    {
      id: "3",
      timestamp: "2025-02-06 09:58:20",
      user: "David Park",
      action: "Audit Log Viewed",
      module: "Audit Logs",
      details: "Filtered logs for date range 2025-02-01 to 2025-02-05",
      ipAddress: "192.168.1.78",
    },
    {
      id: "4",
      timestamp: "2025-02-06 09:45:33",
      user: "Sarah Johnson",
      action: "FHIR Connection Modified",
      module: "FHIR Settings",
      details: "Updated endpoint URL for Epic FHIR Server",
      ipAddress: "192.168.1.45",
    },
    {
      id: "5",
      timestamp: "2025-02-06 09:30:12",
      user: "Sarah Johnson",
      action: "Measure Disabled",
      module: "Measure Configuration",
      details: "Disabled HBD-E measure for 2025",
      ipAddress: "192.168.1.45",
    },
  ]);

  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicy[]>(
    [
      {
        id: "1",
        name: "Medical Record Retention",
        dataType: "Medical Records",
        retentionPeriod: "7 years",
        enabled: true,
        lastRun: "2025-02-01",
        recordsAffected: 1250,
      },
      {
        id: "2",
        name: "Audit Log Retention",
        dataType: "Audit Logs",
        retentionPeriod: "10 years",
        enabled: true,
        lastRun: "2025-02-01",
        recordsAffected: 45000,
      },
      {
        id: "3",
        name: "Temporary File Cleanup",
        dataType: "Temp Files",
        retentionPeriod: "30 days",
        enabled: true,
        lastRun: "2025-02-06",
        recordsAffected: 8920,
      },
      {
        id: "4",
        name: "Draft Abstraction Purge",
        dataType: "Draft Abstractions",
        retentionPeriod: "90 days",
        enabled: false,
        lastRun: "2025-01-15",
        recordsAffected: 340,
      },
    ],
  );

  const tabs: { id: AdminTab; label: string; icon: React.ElementType }[] = [
    { id: "users", label: "User Management", icon: Users },
    { id: "permissions", label: "Role Permissions", icon: Lock },
    { id: "measures", label: "Measure Config", icon: BookOpen },
    { id: "specs", label: "NCQA Specs", icon: Upload },
    { id: "fhir", label: "FHIR Connections", icon: Link2 },
    { id: "pipelines", label: "Data Pipelines", icon: Database },
    { id: "nlp", label: "NLP Models", icon: Cpu },
    { id: "audit-logs", label: "Audit Logs", icon: FileText },
    { id: "retention", label: "Retention Policies", icon: Clock },
  ];

  const openModal = (type: ModalState["type"], data?: any) => {
    setModal({ isOpen: true, type, data });
  };

  const closeModal = () => {
    setModal({ isOpen: false, type: null, data: undefined });
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(
      users.map((user) => {
        if (user.id === userId) {
          return {
            ...user,
            status: user.status === "active" ? "inactive" : "active",
          };
        }
        return user;
      }),
    );
  };

  const togglePermission = (
    module: string,
    role: string,
    permission: string,
  ) => {
    openModal("edit-permission", { module, role, permission });
  };

  const toggleMeasure = (measureId: string) => {
    setMeasures(
      measures.map((measure) => {
        if (measure.id === measureId) {
          return { ...measure, enabled: !measure.enabled };
        }
        return measure;
      }),
    );
  };

  const toggleFhirConnection = (connectionId: string) => {
    setFhirConnections(
      fhirConnections.map((conn) => {
        if (conn.id === connectionId) {
          return { ...conn, enabled: !conn.enabled };
        }
        return conn;
      }),
    );
  };

  const togglePipelineStatus = (pipelineId: string) => {
    openModal("pipeline-action", { pipelineId });
  };

  const toggleRetentionPolicy = (policyId: string) => {
    setRetentionPolicies(
      retentionPolicies.map((policy) => {
        if (policy.id === policyId) {
          return { ...policy, enabled: !policy.enabled };
        }
        return policy;
      }),
    );
  };

  const renderUserManagement = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">User Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage platform users, roles, and access states
          </p>
        </div>
        <button
          onClick={() => openModal("add-user")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/70 transition-colors text-foreground"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Role
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Scope
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Last Login
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-foreground">
                        {user.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {user.scope}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleUserStatus(user.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          user.status === "active"
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            user.status === "active"
                              ? "translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-medium ${
                          user.status === "active"
                            ? "text-green-600 dark:text-green-400"
                            : user.status === "locked"
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {user.status === "active"
                          ? "Active"
                          : user.status === "locked"
                            ? "Locked"
                            : "Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {user.lastLogin}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("edit-user", user)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit user"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("deactivate-user", user)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-red-600"
                        title="Deactivate user"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
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

  const renderRolePermissions = () => {
    const roles = ["Admin", "Abstractor", "Reviewer", "Auditor"];

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              Role Permissions Matrix
            </h3>
            <p className="text-sm text-muted-foreground">
              Define granular permissions for each role across all modules
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Changes are audit-logged
            </span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider w-48">
                    Module
                  </th>
                  {roles.map((role) => (
                    <th
                      key={role}
                      className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                      colSpan={4}
                    >
                      {role}
                    </th>
                  ))}
                </tr>
                <tr className="bg-muted/30 border-b border-border">
                  <th></th>
                  {roles.map((role) => [
                    <th
                      key={`${role}-view`}
                      className="text-center px-2 py-2 text-[10px] font-medium text-muted-foreground uppercase"
                    >
                      View
                    </th>,
                    <th
                      key={`${role}-edit`}
                      className="text-center px-2 py-2 text-[10px] font-medium text-muted-foreground uppercase"
                    >
                      Edit
                    </th>,
                    <th
                      key={`${role}-submit`}
                      className="text-center px-2 py-2 text-[10px] font-medium text-muted-foreground uppercase"
                    >
                      Submit
                    </th>,
                    <th
                      key={`${role}-audit`}
                      className="text-center px-2 py-2 text-[10px] font-medium text-muted-foreground uppercase"
                    >
                      Audit
                    </th>,
                  ])}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissions.map((perm) => (
                  <tr key={perm.module} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {perm.module}
                    </td>
                    {roles.map((role) => [
                      <td
                        key={`${perm.module}-${role}-view`}
                        className="px-2 py-3 text-center"
                      >
                        <button
                          onClick={() =>
                            togglePermission(perm.module, role, "view")
                          }
                          className={`inline-flex h-5 w-9 items-center justify-center rounded-full transition-colors ${
                            perm.permissions[role]?.view
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          {perm.permissions[role]?.view ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </td>,
                      <td
                        key={`${perm.module}-${role}-edit`}
                        className="px-2 py-3 text-center"
                      >
                        <button
                          onClick={() =>
                            togglePermission(perm.module, role, "edit")
                          }
                          className={`inline-flex h-5 w-9 items-center justify-center rounded-full transition-colors ${
                            perm.permissions[role]?.edit
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          {perm.permissions[role]?.edit ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </td>,
                      <td
                        key={`${perm.module}-${role}-submit`}
                        className="px-2 py-3 text-center"
                      >
                        <button
                          onClick={() =>
                            togglePermission(perm.module, role, "submit")
                          }
                          className={`inline-flex h-5 w-9 items-center justify-center rounded-full transition-colors ${
                            perm.permissions[role]?.submit
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          {perm.permissions[role]?.submit ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </td>,
                      <td
                        key={`${perm.module}-${role}-audit`}
                        className="px-2 py-3 text-center"
                      >
                        <button
                          onClick={() =>
                            togglePermission(perm.module, role, "audit")
                          }
                          className={`inline-flex h-5 w-9 items-center justify-center rounded-full transition-colors ${
                            perm.permissions[role]?.audit
                              ? "bg-primary"
                              : "bg-muted-foreground/30"
                          }`}
                        >
                          {perm.permissions[role]?.audit ? (
                            <Check className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </button>
                      </td>,
                    ])}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-600 dark:text-blue-400">
            <strong>Permission Dependencies:</strong> Disabling critical
            permissions may affect dependent workflows. All changes are
            immediately logged and can trigger warnings if they impact active
            users.
          </div>
        </div>
      </div>
    );
  };

  const renderMeasureConfiguration = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Measure Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Control measure availability and processing behavior by reporting
            year
          </p>
        </div>
        <button
          onClick={() => openModal("edit-measure")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Measure
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Measure Code
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Year
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Version
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {measures.map((measure) => (
                <tr key={measure.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-semibold text-foreground">
                      {measure.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {measure.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {measure.year}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {measure.version}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        measure.type === "digital"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                          : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      }`}
                    >
                      {measure.type === "digital" ? "Digital" : "Hybrid"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleMeasure(measure.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          measure.enabled
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            measure.enabled
                              ? "translate-x-5"
                              : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-medium ${
                          measure.enabled
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {measure.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => openModal("edit-measure", measure)}
                      className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                      title="Edit measure"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNCQASpecs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            NCQA Specification Files
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage official NCQA specification versions
          </p>
        </div>
        <button
          onClick={() => openModal("upload-spec")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FileUp className="w-4 h-4" />
          Upload Spec
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Specification Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Version
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Year
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  File Size
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {specs.map((spec) => (
                <tr key={spec.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {spec.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {spec.version}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {spec.year}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {spec.uploadDate}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {spec.fileSize}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        spec.status === "active"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      }`}
                    >
                      {spec.status === "active" ? "Active" : "Archived"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
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

  const renderFHIRConnections = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            FHIR Connection Settings
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure and monitor interoperability connections
          </p>
        </div>
        <button
          onClick={() => openModal("edit-fhir")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Connection
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Last Sync
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Scope
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Enabled
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {fhirConnections.map((conn) => (
                <tr key={conn.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {conn.name}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {conn.endpoint}
                      </code>
                      <button className="text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          conn.status === "connected"
                            ? "bg-green-500"
                            : conn.status === "error"
                              ? "bg-red-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                      <span
                        className={`text-xs font-medium ${
                          conn.status === "connected"
                            ? "text-green-600 dark:text-green-400"
                            : conn.status === "error"
                              ? "text-red-600 dark:text-red-400"
                              : "text-muted-foreground"
                        }`}
                      >
                        {conn.status === "connected"
                          ? "Connected"
                          : conn.status === "error"
                            ? "Error"
                            : "Disconnected"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {conn.lastSync}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {conn.scope}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleFhirConnection(conn.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        conn.enabled ? "bg-primary" : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          conn.enabled ? "translate-x-5" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("edit-fhir", conn)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit connection"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("view-fhir", conn)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="View connection details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Security Notice:</strong> Credential changes and connection
          disabling require additional confirmation. All connection activities
          are audit-logged.
        </div>
      </div>
    </div>
  );

  const renderDataPipelines = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Data Ingestion Pipelines
          </h3>
          <p className="text-sm text-muted-foreground">
            Oversee inbound data processing workflows
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {pipelines.map((pipeline) => (
          <div
            key={pipeline.id}
            className="bg-card border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    pipeline.type === "claims"
                      ? "bg-blue-500/10"
                      : pipeline.type === "ehr"
                        ? "bg-green-500/10"
                        : "bg-purple-500/10"
                  }`}
                >
                  <Database
                    className={`w-5 h-5 ${
                      pipeline.type === "claims"
                        ? "text-blue-600 dark:text-blue-400"
                        : pipeline.type === "ehr"
                          ? "text-green-600 dark:text-green-400"
                          : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">
                    {pipeline.name}
                  </h4>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {pipeline.type}
                  </p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded ${
                  pipeline.status === "running"
                    ? "bg-green-500/10"
                    : pipeline.status === "error"
                      ? "bg-red-500/10"
                      : "bg-muted-foreground/10"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    pipeline.status === "running"
                      ? "bg-green-500 animate-pulse"
                      : pipeline.status === "error"
                        ? "bg-red-500"
                        : "bg-muted-foreground"
                  }`}
                />
                <span
                  className={`text-[10px] font-medium uppercase ${
                    pipeline.status === "running"
                      ? "text-green-600 dark:text-green-400"
                      : pipeline.status === "error"
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {pipeline.status}
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Run</span>
                <span className="text-foreground">{pipeline.lastRun}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Records Processed</span>
                <span className="font-mono text-foreground">
                  {pipeline.recordsProcessed.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Errors</span>
                <span
                  className={`font-mono ${pipeline.errors > 0 ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}
                >
                  {pipeline.errors}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => togglePipelineStatus(pipeline.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
              >
                {pipeline.status === "running" ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5" />
                    Start
                  </>
                )}
              </button>
              {pipeline.status === "error" && (
                <button
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg hover:bg-muted/70 transition-colors text-sm text-foreground"
                  title="Retry"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => openModal("view-pipeline", pipeline)}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-muted border border-border rounded-lg hover:bg-muted/70 transition-colors text-sm text-foreground"
                title="View details"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNLPModels = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">NLP Model Versions</h3>
          <p className="text-sm text-muted-foreground">
            Manage AI models used in abstraction and evidence detection
          </p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Model Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Version
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Confidence
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Coverage
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Deployed Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {nlpModels.map((model) => (
                <tr key={model.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {model.name}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-foreground bg-muted px-2 py-0.5 rounded">
                      {model.version}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium ${
                        model.status === "active"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      }`}
                    >
                      {model.status === "active" && <Zap className="w-3 h-3" />}
                      {model.status === "active" ? "Active" : "Historical"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${model.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10">
                        {model.confidence}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${model.coverage}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-foreground w-10">
                        {model.coverage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {model.deployedDate}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {model.status === "historical" && (
                        <button
                          onClick={() => openModal("nlp-rollback", model)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors text-xs"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Promote
                        </button>
                      )}
                      <button
                        onClick={() => openModal("view-nlp", model)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-amber-600 dark:text-amber-400">
          <strong>Model Promotion:</strong> Promoting or rolling back models
          requires confirmation and may impact active abstraction workflows.
          Impact analysis is provided before activation.
        </div>
      </div>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Audit Logs</h3>
          <p className="text-sm text-muted-foreground">
            Immutable activity log for compliance and forensic review
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/70 transition-colors text-foreground">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search audit logs by user, action, or module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-lg hover:bg-muted/70 transition-colors text-foreground"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Module
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Details
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  IP Address
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-xs font-mono text-foreground">
                        {log.timestamp}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {log.user}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {log.module}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {log.details}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      {log.ipAddress}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-blue-600 dark:text-blue-400">
          <strong>Audit Compliance:</strong> All logs are immutable and retained
          per regulatory requirements. Logs support HIPAA compliance, NCQA
          audits, and forensic analysis.
        </div>
      </div>
    </div>
  );

  const renderRetentionPolicies = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">
            Data Retention Policies
          </h3>
          <p className="text-sm text-muted-foreground">
            Configure data retention and automated purge rules
          </p>
        </div>
        <button
          onClick={() => openModal("retention-policy")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Policy
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Policy Name
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Data Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Retention Period
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Last Run
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Records Affected
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {retentionPolicies.map((policy) => (
                <tr key={policy.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {policy.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {policy.dataType}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {policy.retentionPeriod}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {policy.lastRun}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-foreground">
                    {policy.recordsAffected.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleRetentionPolicy(policy.id)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          policy.enabled
                            ? "bg-primary"
                            : "bg-muted-foreground/30"
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            policy.enabled ? "translate-x-5" : "translate-x-0.5"
                          }`}
                        />
                      </button>
                      <span
                        className={`text-xs font-medium ${
                          policy.enabled
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {policy.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openModal("retention-policy", policy)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit policy"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openModal("view-retention", policy)}
                        className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
                        title="Preview impact"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-red-600 dark:text-red-400">
          <strong>Irreversible Actions:</strong> Data purge operations are
          permanent and cannot be undone. All policy changes require multi-step
          confirmation and preview impact analysis.
        </div>
      </div>
    </div>
  );

  const renderModal = () => {
    if (!modal.isOpen) return null;

    const renderModalContent = () => {
      switch (modal.type) {
        case "add-user":
        case "edit-user":
          return (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {modal.type === "add-user" ? "Add New User" : "Edit User"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {modal.type === "add-user"
                    ? "Create a new user account with role assignment and scope definition."
                    : "Update user information, role assignment, or access scope."}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={modal.data?.name || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={modal.data?.email || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="user@healthplan.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Role
                  </label>
                  <select
                    defaultValue={modal.data?.role || "Abstractor"}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Abstractor">Abstractor</option>
                    <option value="Reviewer">Reviewer</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Access Scope
                  </label>
                  <select
                    defaultValue={modal.data?.scope || "All Plans"}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="All Plans">All Plans</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Medicare">Medicare</option>
                    <option value="Medicaid">Medicaid</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {modal.type === "add-user" ? "Create User" : "Save Changes"}
                </button>
              </div>
            </div>
          );

        case "deactivate-user":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Deactivate User Access
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to deactivate access for{" "}
                    <strong>{modal.data?.name}</strong>? This will immediately
                    revoke all platform access.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted border border-border rounded-lg text-sm text-foreground">
                <strong>Consequences:</strong>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  <li>• User will be logged out immediately</li>
                  <li>• Active sessions will be terminated</li>
                  <li>• Pending work will be reassigned</li>
                  <li>• Audit trail will be preserved</li>
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    toggleUserStatus(modal.data.id);
                    closeModal();
                  }}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Confirm Deactivation
                </button>
              </div>
            </div>
          );

        case "edit-permission":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Modify Permission
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    You are about to modify{" "}
                    <strong>{modal.data?.permission}</strong> permission for{" "}
                    <strong>{modal.data?.role}</strong> role in{" "}
                    <strong>{modal.data?.module}</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-amber-600 dark:text-amber-400">
                    <strong>Dependency Check:</strong> This permission may
                    affect dependent workflows or other permissions. Changes
                    will be audit-logged and applied immediately to all users
                    with this role.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          );

        case "pipeline-action":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Modify Pipeline Status
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to change the pipeline status? This
                    may affect data ingestion workflows.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Confirm
                </button>
              </div>
            </div>
          );

        case "view-nlp":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    modal.data?.status === "active"
                      ? "bg-green-500/10"
                      : "bg-muted-foreground/10"
                  }`}
                >
                  <Cpu
                    className={`w-5 h-5 ${
                      modal.data?.status === "active"
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {modal.data?.name}
                    </h3>
                    <span
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                        modal.data?.status === "active"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      }`}
                    >
                      {modal.data?.status === "active" && (
                        <Zap className="w-3 h-3" />
                      )}
                      {modal.data?.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded font-mono">
                      {modal.data?.version}
                    </code>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Confidence Score
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${modal.data?.confidence}%` }}
                          />
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {modal.data?.confidence}%
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Coverage Rate
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${modal.data?.coverage}%` }}
                          />
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {modal.data?.coverage}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Model Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Deployed Date
                      </span>
                      <span className="text-foreground font-medium">
                        {modal.data?.deployedDate}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Model Type</span>
                      <span className="text-foreground font-medium">
                        Transformer-based NER
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Training Dataset Size
                      </span>
                      <span className="text-foreground font-medium font-mono">
                        245,000 records
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Validation Accuracy
                      </span>
                      <span className="text-foreground font-medium">
                        {modal.data?.confidence
                          ? (modal.data.confidence - 2).toFixed(1)
                          : "92.2"}
                        %
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Entity Detection Performance
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        entity: "Diagnoses (ICD-10)",
                        precision: 96.2,
                        recall: 94.1,
                        f1: 95.1,
                      },
                      {
                        entity: "Medications",
                        precision: 94.8,
                        recall: 92.3,
                        f1: 93.5,
                      },
                      {
                        entity: "Lab Results",
                        precision: 97.1,
                        recall: 95.8,
                        f1: 96.4,
                      },
                      {
                        entity: "Procedures (CPT)",
                        precision: 93.4,
                        recall: 91.7,
                        f1: 92.5,
                      },
                      {
                        entity: "Dates & Times",
                        precision: 98.2,
                        recall: 97.6,
                        f1: 97.9,
                      },
                    ].map((metric, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground font-medium">
                            {metric.entity}
                          </span>
                          <span className="text-muted-foreground font-mono">
                            F1: {metric.f1}%
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px]">
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">
                              Precision:
                            </span>
                            <span className="text-foreground font-mono">
                              {metric.precision}%
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground">
                              Recall:
                            </span>
                            <span className="text-foreground font-mono">
                              {metric.recall}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Usage Statistics (30 Days)
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Documents Processed
                      </p>
                      <p className="text-lg font-semibold text-foreground font-mono">
                        {modal.data?.status === "active" ? "127,845" : "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Avg Processing Time
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {modal.data?.status === "active" ? "1.2s" : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Entities Extracted
                      </span>
                      <span className="text-foreground font-medium font-mono">
                        {modal.data?.status === "active" ? "1,456,923" : "0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Version Comparison
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-border">
                      <span className="text-muted-foreground">Metric</span>
                      <div className="flex gap-8">
                        <span className="text-muted-foreground w-16 text-right">
                          Current
                        </span>
                        <span className="text-muted-foreground w-16 text-right">
                          Previous
                        </span>
                      </div>
                    </div>
                    {[
                      {
                        metric: "Confidence",
                        current: modal.data?.confidence || 94.2,
                        prev: modal.data?.status === "active" ? 92.8 : 94.2,
                        improved: true,
                      },
                      {
                        metric: "Coverage",
                        current: modal.data?.coverage || 87.5,
                        prev: modal.data?.status === "active" ? 85.1 : 87.5,
                        improved: true,
                      },
                      {
                        metric: "Speed (docs/sec)",
                        current: "0.83",
                        prev: "0.71",
                        improved: true,
                      },
                    ].map((comp, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between py-1"
                      >
                        <span className="text-foreground font-medium">
                          {comp.metric}
                        </span>
                        <div className="flex gap-8 items-center">
                          <span className="text-foreground font-mono w-16 text-right">
                            {typeof comp.current === "number"
                              ? `${comp.current}%`
                              : comp.current}
                          </span>
                          <span className="text-muted-foreground font-mono w-16 text-right">
                            {typeof comp.prev === "number"
                              ? `${comp.prev}%`
                              : comp.prev}
                          </span>
                          {comp.improved && (
                            <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Training Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Training Duration
                      </span>
                      <span className="text-foreground font-medium">
                        48 hours
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Epochs Completed
                      </span>
                      <span className="text-foreground font-medium">25</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">GPU Hours</span>
                      <span className="text-foreground font-medium font-mono">
                        192
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Validation Set Size
                      </span>
                      <span className="text-foreground font-medium font-mono">
                        45,000 records
                      </span>
                    </div>
                  </div>
                </div>

                {modal.data?.status === "active" && (
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-600 dark:text-green-400">
                      <strong>Model Active:</strong> This model is currently
                      deployed in production and processing all new abstraction
                      requests.
                    </div>
                  </div>
                )}

                {modal.data?.status === "historical" && (
                  <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      <strong>Historical Version:</strong> This model has been
                      superseded by a newer version. You can promote it back to
                      active if needed.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Close
                </button>
                {modal.data?.status === "historical" && (
                  <button
                    onClick={() => {
                      closeModal();
                      openModal("nlp-rollback", modal.data);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Promote to Active
                  </button>
                )}
                {modal.data?.status === "active" && (
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                    <Download className="w-3.5 h-3.5" />
                    Export Metrics
                  </button>
                )}
              </div>
            </div>
          );

        case "nlp-rollback":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/10 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Promote Model Version
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Promoting{" "}
                    <strong>
                      {modal.data?.name} {modal.data?.version}
                    </strong>{" "}
                    will replace the current active model. This may impact
                    abstraction accuracy.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-muted border border-border rounded-lg space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Impact Assessment:
                  </span>
                  <span className="text-foreground font-medium">
                    ~8,500 active abstractions
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Estimated Reprocessing Time:
                  </span>
                  <span className="text-foreground font-medium">2-4 hours</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Confirm Promotion
                </button>
              </div>
            </div>
          );

        case "retention-policy":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    {modal.data
                      ? "Modify Retention Policy"
                      : "Create Retention Policy"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {modal.data
                      ? "Changes to retention policies affect data purge timelines. This action cannot be undone once executed."
                      : "Define a new data retention and purge policy for automated compliance."}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Policy Name
                  </label>
                  <input
                    type="text"
                    defaultValue={modal.data?.name || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter policy name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Data Type
                  </label>
                  <select
                    defaultValue={modal.data?.dataType || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="">Select data type</option>
                    <option value="Medical Records">Medical Records</option>
                    <option value="Audit Logs">Audit Logs</option>
                    <option value="Temp Files">Temp Files</option>
                    <option value="Draft Abstractions">
                      Draft Abstractions
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Retention Period
                  </label>
                  <select
                    defaultValue={modal.data?.retentionPeriod || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="30 days">30 days</option>
                    <option value="90 days">90 days</option>
                    <option value="1 year">1 year</option>
                    <option value="7 years">7 years</option>
                    <option value="10 years">10 years</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {modal.data ? "Save Changes" : "Create Policy"}
                </button>
              </div>
            </div>
          );

        case "view-retention":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    modal.data?.enabled
                      ? "bg-green-500/10"
                      : "bg-muted-foreground/10"
                  }`}
                >
                  <Clock
                    className={`w-5 h-5 ${
                      modal.data?.enabled
                        ? "text-green-600 dark:text-green-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {modal.data?.name}
                    </h3>
                    <span
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                        modal.data?.enabled
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-muted-foreground/10 text-muted-foreground"
                      }`}
                    >
                      {modal.data?.enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Automated retention and purge policy
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Policy Configuration
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Data Type</span>
                      <span className="text-foreground font-medium">
                        {modal.data?.dataType}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Retention Period
                      </span>
                      <span className="text-foreground font-medium">
                        {modal.data?.retentionPeriod}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Last Execution
                      </span>
                      <span className="text-foreground font-medium">
                        {modal.data?.lastRun}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Records Affected
                      </span>
                      <span className="text-foreground font-medium font-mono">
                        {modal.data?.recordsAffected?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Impact Analysis
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Current Data Volume
                        </span>
                        <span className="text-foreground font-medium font-mono">
                          {modal.data?.dataType === "Medical Records"
                            ? "124,850 records"
                            : modal.data?.dataType === "Audit Logs"
                              ? "2.4M entries"
                              : modal.data?.dataType === "Temp Files"
                                ? "45.2 GB"
                                : "12,340 records"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-muted-foreground">
                          Storage Space Used
                        </span>
                        <span className="text-foreground font-medium font-mono">
                          {modal.data?.dataType === "Medical Records"
                            ? "1.2 TB"
                            : modal.data?.dataType === "Audit Logs"
                              ? "89.5 GB"
                              : modal.data?.dataType === "Temp Files"
                                ? "45.2 GB"
                                : "3.8 GB"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Records Eligible for Purge
                        </span>
                        <span className="text-foreground font-medium font-mono">
                          {modal.data?.recordsAffected?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Compliance Requirements
                  </h4>
                  <div className="space-y-2 text-xs">
                    {modal.data?.dataType === "Medical Records" && (
                      <>
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-foreground font-medium">
                              HIPAA Retention: 7 years minimum
                            </p>
                            <p className="text-muted-foreground">
                              42 CFR Part 2 requires medical records retention
                              for at least 7 years from last patient encounter.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-foreground font-medium">
                              NCQA HEDIS: Records used in measures
                            </p>
                            <p className="text-muted-foreground">
                              Medical records supporting HEDIS measures must be
                              retained for audit period (minimum 10 years for
                              Medicare).
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    {modal.data?.dataType === "Audit Logs" && (
                      <>
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-foreground font-medium">
                              HIPAA Audit Trail: 6 years
                            </p>
                            <p className="text-muted-foreground">
                              45 CFR 164.312 requires audit logs retention for
                              at least 6 years from creation or last update.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-foreground font-medium">
                              NCQA Accreditation: 10 years
                            </p>
                            <p className="text-muted-foreground">
                              Audit trails for quality reporting activities must
                              be retained for the full accreditation cycle.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                    {modal.data?.dataType === "Temp Files" && (
                      <div className="flex items-start gap-2">
                        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-foreground font-medium">
                            Temporary Processing Files
                          </p>
                          <p className="text-muted-foreground">
                            No regulatory retention requirements for temporary
                            processing artifacts. Safe to purge after processing
                            completion.
                          </p>
                        </div>
                      </div>
                    )}
                    {modal.data?.dataType === "Draft Abstractions" && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-foreground font-medium">
                            Incomplete Work Items
                          </p>
                          <p className="text-muted-foreground">
                            Draft abstractions represent incomplete workflows.
                            Recommended retention: 90 days to allow abstractor
                            recovery.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Deletion Schedule
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Execution Frequency
                      </span>
                      <span className="text-foreground font-medium">
                        {modal.data?.dataType === "Temp Files"
                          ? "Daily at 2:00 AM"
                          : "Monthly on 1st at 3:00 AM"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Next Scheduled Run
                      </span>
                      <span className="text-foreground font-medium">
                        {modal.data?.dataType === "Temp Files"
                          ? "2025-02-07 02:00"
                          : "2025-03-01 03:00"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Estimated Duration
                      </span>
                      <span className="text-foreground font-medium">
                        {modal.data?.dataType === "Audit Logs"
                          ? "45-60 minutes"
                          : "5-10 minutes"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Execution History (Last 6 Runs)
                  </h4>
                  <div className="space-y-1.5">
                    {[
                      {
                        date: modal.data?.lastRun || "2025-02-01",
                        records: modal.data?.recordsAffected || 1250,
                        duration: "8m 23s",
                        status: "success",
                      },
                      {
                        date: "2025-01-01",
                        records: 1180,
                        duration: "7m 45s",
                        status: "success",
                      },
                      {
                        date: "2024-12-01",
                        records: 1340,
                        duration: "9m 12s",
                        status: "success",
                      },
                      {
                        date: "2024-11-01",
                        records: 1295,
                        duration: "8m 56s",
                        status: "success",
                      },
                      {
                        date: "2024-10-01",
                        records: 0,
                        duration: "0s",
                        status: "skipped",
                      },
                      {
                        date: "2024-09-01",
                        records: 1420,
                        duration: "10m 3s",
                        status: "success",
                      },
                    ].map((run, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
                      >
                        <span className="text-muted-foreground font-mono">
                          {run.date}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-foreground font-mono">
                            {run.records.toLocaleString()} records
                          </span>
                          <span className="text-muted-foreground">
                            {run.duration}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${
                              run.status === "success"
                                ? "text-green-600 dark:text-green-400"
                                : "text-muted-foreground"
                            }`}
                          >
                            {run.status === "success" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : (
                              <Circle className="w-3 h-3" />
                            )}
                            {run.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Protected Records
                  </h4>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>
                      The following records are automatically exempted from
                      purge operations:
                    </p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li>Records with active legal holds</li>
                      <li>Records referenced in open audit findings</li>
                      <li>
                        Records supporting submitted HEDIS measures (current
                        year + 2)
                      </li>
                      <li>Records flagged for quality improvement review</li>
                      {modal.data?.dataType === "Medical Records" && (
                        <li>
                          Records for patients with ongoing appeals or
                          grievances
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Data Volume Trend (12 Months)
                  </h4>
                  <div className="space-y-1">
                    {[
                      {
                        month: "Feb 2025",
                        total: 124850,
                        purged: modal.data?.recordsAffected || 1250,
                      },
                      { month: "Jan 2025", total: 126100, purged: 1180 },
                      { month: "Dec 2024", total: 127280, purged: 1340 },
                      { month: "Nov 2024", total: 128620, purged: 1295 },
                      { month: "Oct 2024", total: 129915, purged: 0 },
                      { month: "Sep 2024", total: 129915, purged: 1420 },
                    ].map((trend, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-20">
                          {trend.month}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <div className="flex-1 h-6 bg-muted rounded overflow-hidden flex">
                            <div
                              className="bg-blue-500 flex items-center justify-end pr-2"
                              style={{
                                width: `${(trend.total / 130000) * 100}%`,
                              }}
                            >
                              <span className="text-[10px] text-white font-mono font-medium">
                                {trend.total.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs text-red-600 dark:text-red-400 font-mono w-16 text-right">
                            -{trend.purged.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {modal.data?.enabled ? (
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-600 dark:text-green-400">
                      <strong>Policy Active:</strong> This retention policy is
                      currently enabled and will execute automatically on
                      schedule. All purge operations are logged and
                      irreversible.
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      <strong>Policy Disabled:</strong> This retention policy is
                      currently disabled and will not execute. Data accumulation
                      may impact storage capacity and compliance posture.
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-red-600 dark:text-red-400">
                    <strong>Irreversible Operation:</strong> Purge operations
                    permanently delete data and cannot be undone. Ensure
                    compliance requirements are met before enabling or modifying
                    policies.
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    openModal("retention-policy", modal.data);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit Policy
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Export Report
                </button>
              </div>
            </div>
          );

        case "edit-measure":
          return (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {modal.data
                    ? "Edit Measure Configuration"
                    : "Add New Measure"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {modal.data
                    ? "Update measure details, version, and configuration settings."
                    : "Configure a new HEDIS measure for the reporting year."}
                </p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Measure Code
                    </label>
                    <input
                      type="text"
                      defaultValue={modal.data?.code || ""}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., BCS-E"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Reporting Year
                    </label>
                    <select
                      defaultValue={modal.data?.year || "2025"}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Measure Name
                  </label>
                  <input
                    type="text"
                    defaultValue={modal.data?.name || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter measure name"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Type
                    </label>
                    <select
                      defaultValue={modal.data?.type || "hybrid"}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="digital">Digital</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Version
                    </label>
                    <input
                      type="text"
                      defaultValue={modal.data?.version || ""}
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., 1.2"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <button
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        modal.data?.enabled !== false
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          modal.data?.enabled !== false
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-foreground">
                      Enable this measure
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  <strong>Configuration Impact:</strong> Changes to measure
                  configuration may affect active abstraction workflows and
                  reporting timelines. All changes are audit-logged.
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {modal.data ? "Save Changes" : "Add Measure"}
                </button>
              </div>
            </div>
          );

        case "upload-spec":
          return (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  Upload NCQA Specification
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload official NCQA specification files for measure
                  configuration and validation.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Specification Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., HEDIS MY 2025 Volume 2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Version
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="e.g., 2025.1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Reporting Year
                    </label>
                    <select
                      defaultValue="2025"
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Specification File
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer bg-muted/30">
                    <FileUp className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-foreground font-medium mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PDF files up to 50MB
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  <strong>Validation Required:</strong> Uploaded specifications
                  will be validated for authenticity and version compatibility
                  before activation.
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Upload Specification
                </button>
              </div>
            </div>
          );

        case "edit-fhir":
          return (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  {modal.data ? "Edit FHIR Connection" : "Add FHIR Connection"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {modal.data
                    ? "Update FHIR endpoint configuration and authentication settings."
                    : "Configure a new FHIR server connection for data interoperability."}
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Connection Name
                  </label>
                  <input
                    type="text"
                    defaultValue={modal.data?.name || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="e.g., Epic FHIR Server"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Endpoint URL
                  </label>
                  <input
                    type="url"
                    defaultValue={modal.data?.endpoint || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="https://fhir.example.com/api/FHIR/R4"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    FHIR Scope
                  </label>
                  <input
                    type="text"
                    defaultValue={modal.data?.scope || ""}
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="patient/*.read observation/*.read"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Client ID
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Enter client ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Client Secret
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder="Enter client secret"
                    />
                    <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      <EyeOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <button
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        modal.data?.enabled !== false
                          ? "bg-primary"
                          : "bg-muted-foreground/30"
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          modal.data?.enabled !== false
                            ? "translate-x-5"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-foreground">
                      Enable this connection
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-red-600 dark:text-red-400">
                  <strong>Security Warning:</strong> FHIR credentials grant
                  access to protected health information (PHI). All credential
                  changes are audit-logged and require elevated privileges.
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {modal.data ? "Save Changes" : "Add Connection"}
                </button>
              </div>
            </div>
          );

        case "view-fhir":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    modal.data?.status === "connected"
                      ? "bg-green-500/10"
                      : modal.data?.status === "error"
                        ? "bg-red-500/10"
                        : "bg-muted-foreground/10"
                  }`}
                >
                  <Link2
                    className={`w-5 h-5 ${
                      modal.data?.status === "connected"
                        ? "text-green-600 dark:text-green-400"
                        : modal.data?.status === "error"
                          ? "text-red-600 dark:text-red-400"
                          : "text-muted-foreground"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {modal.data?.name}
                    </h3>
                    <span
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                        modal.data?.status === "connected"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : modal.data?.status === "error"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-muted-foreground/10 text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          modal.data?.status === "connected"
                            ? "bg-green-500"
                            : modal.data?.status === "error"
                              ? "bg-red-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                      {modal.data?.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    FHIR R4 Connection
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Connection Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">
                        Endpoint URL
                      </span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-foreground bg-muted px-2 py-0.5 rounded font-mono">
                          {modal.data?.endpoint}
                        </code>
                        <button className="text-muted-foreground hover:text-foreground">
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        FHIR Version
                      </span>
                      <span className="text-foreground font-medium">R4</span>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-muted-foreground">Scope</span>
                      <code className="text-xs text-foreground bg-muted px-2 py-0.5 rounded font-mono max-w-[300px] text-right">
                        {modal.data?.scope}
                      </code>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Last Sync</span>
                      <span className="text-foreground font-medium">
                        {modal.data?.lastSync}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Connection Enabled
                      </span>
                      <span
                        className={`text-foreground font-medium ${
                          modal.data?.enabled
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }`}
                      >
                        {modal.data?.enabled ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Connection Health
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Uptime (30d)
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {modal.data?.status === "connected"
                          ? "99.8%"
                          : modal.data?.status === "error"
                            ? "87.2%"
                            : "0%"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Avg Response Time
                      </p>
                      <p className="text-lg font-semibold text-foreground">
                        {modal.data?.status === "connected"
                          ? "245ms"
                          : modal.data?.status === "error"
                            ? "N/A"
                            : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Total Requests (7d)
                      </span>
                      <span className="text-foreground font-medium font-mono">
                        {modal.data?.status === "connected"
                          ? "15,234"
                          : modal.data?.status === "error"
                            ? "8,450"
                            : "0"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Resource Mapping
                  </h4>
                  <div className="space-y-2">
                    {[
                      { resource: "Patient", enabled: true, count: "5,234" },
                      {
                        resource: "Observation",
                        enabled: true,
                        count: "24,891",
                      },
                      { resource: "Condition", enabled: true, count: "12,456" },
                      {
                        resource: "Procedure",
                        enabled: modal.data?.status === "connected",
                        count: "8,923",
                      },
                      {
                        resource: "MedicationRequest",
                        enabled: modal.data?.status === "connected",
                        count: "15,678",
                      },
                    ].map((mapping, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {mapping.enabled ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-muted-foreground" />
                          )}
                          <span className="text-foreground font-medium">
                            {mapping.resource}
                          </span>
                        </div>
                        <span className="text-muted-foreground font-mono">
                          {mapping.count} records
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Sync Activity
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        time: "2 hours ago",
                        status: "success",
                        records: "1,234",
                      },
                      {
                        time: "8 hours ago",
                        status: "success",
                        records: "1,189",
                      },
                      {
                        time: "14 hours ago",
                        status: "success",
                        records: "1,201",
                      },
                      {
                        time: "20 hours ago",
                        status:
                          modal.data?.status === "error" ? "error" : "success",
                        records: "978",
                      },
                    ].map((sync, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {sync.status === "success" ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          )}
                          <span className="text-muted-foreground">
                            {sync.time}
                          </span>
                        </div>
                        <span className="text-foreground font-mono">
                          {sync.records} records
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Authentication
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Auth Method</span>
                      <span className="text-foreground font-medium">
                        OAuth 2.0 Client Credentials
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Token Expiry
                      </span>
                      <span className="text-foreground font-medium">
                        7 days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Last Token Refresh
                      </span>
                      <span className="text-foreground font-medium">
                        2 days ago
                      </span>
                    </div>
                  </div>
                </div>

                {modal.data?.status === "error" && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-600 dark:text-red-400">
                      <strong>Connection Error:</strong> SSL certificate
                      validation failed. Please verify the endpoint SSL
                      configuration and certificate chain.
                    </div>
                  </div>
                )}

                {modal.data?.status === "connected" && (
                  <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-green-600 dark:text-green-400">
                      <strong>Connection Active:</strong> FHIR server is
                      responding normally. All resource endpoints are
                      accessible.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Close
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                  Test Connection
                </button>
              </div>
            </div>
          );

        case "view-pipeline":
          return (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-lg ${
                    modal.data?.type === "claims"
                      ? "bg-blue-500/10"
                      : modal.data?.type === "ehr"
                        ? "bg-green-500/10"
                        : "bg-purple-500/10"
                  }`}
                >
                  <Database
                    className={`w-5 h-5 ${
                      modal.data?.type === "claims"
                        ? "text-blue-600 dark:text-blue-400"
                        : modal.data?.type === "ehr"
                          ? "text-green-600 dark:text-green-400"
                          : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground">
                      {modal.data?.name}
                    </h3>
                    <span
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                        modal.data?.status === "running"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : modal.data?.status === "error"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400"
                            : "bg-muted-foreground/10 text-muted-foreground"
                      }`}
                    >
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          modal.data?.status === "running"
                            ? "bg-green-500 animate-pulse"
                            : modal.data?.status === "error"
                              ? "bg-red-500"
                              : "bg-muted-foreground"
                        }`}
                      />
                      {modal.data?.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {modal.data?.type} Pipeline
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Pipeline Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Records Processed
                      </p>
                      <p className="text-lg font-semibold text-foreground font-mono">
                        {modal.data?.recordsProcessed?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Error Count
                      </p>
                      <p
                        className={`text-lg font-semibold font-mono ${
                          modal.data?.errors > 0
                            ? "text-red-600 dark:text-red-400"
                            : "text-foreground"
                        }`}
                      >
                        {modal.data?.errors}
                      </p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Last Run</span>
                      <span className="text-foreground font-medium">
                        {modal.data?.lastRun}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Configuration
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Pipeline Type
                      </span>
                      <span className="text-foreground font-medium capitalize">
                        {modal.data?.type}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Schedule</span>
                      <span className="text-foreground font-medium">
                        Every 6 hours
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Auto-retry on Error
                      </span>
                      <span className="text-foreground font-medium">
                        Enabled (3 attempts)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Batch Size</span>
                      <span className="text-foreground font-medium font-mono">
                        1,000 records
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Recent Execution History
                  </h4>
                  <div className="space-y-2">
                    {[
                      {
                        time: "2 hours ago",
                        status: "success",
                        records: "12,450",
                      },
                      {
                        time: "8 hours ago",
                        status: "success",
                        records: "11,892",
                      },
                      {
                        time: "14 hours ago",
                        status: "success",
                        records: "13,201",
                      },
                      {
                        time: "20 hours ago",
                        status:
                          modal.data?.status === "error" ? "error" : "success",
                        records: "9,765",
                      },
                    ].map((run, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          {run.status === "success" ? (
                            <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          )}
                          <span className="text-muted-foreground">
                            {run.time}
                          </span>
                        </div>
                        <span className="text-foreground font-mono">
                          {run.records} records
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {modal.data?.status === "error" && (
                  <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-red-600 dark:text-red-400">
                      <strong>Last Error:</strong> Connection timeout to source
                      database. Retrying in 15 minutes.
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/70 transition-colors"
                >
                  Close
                </button>
                {modal.data?.status === "error" && (
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Retry Now
                  </button>
                )}
                {modal.data?.status !== "error" && (
                  <button
                    onClick={closeModal}
                    className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Configure
                  </button>
                )}
              </div>
            </div>
          );

        default:
          return null;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card border border-border rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl relative">
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
          {renderModalContent()}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return renderUserManagement();
      case "permissions":
        return renderRolePermissions();
      case "measures":
        return renderMeasureConfiguration();
      case "specs":
        return renderNCQASpecs();
      case "fhir":
        return renderFHIRConnections();
      case "pipelines":
        return renderDataPipelines();
      case "nlp":
        return renderNLPModels();
      case "audit-logs":
        return renderAuditLogs();
      case "retention":
        return renderRetentionPolicies();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-1">
          Admin Panel
        </h2>
        <p className="text-sm text-muted-foreground">
          Governance and configuration hub for platform administration
        </p>
      </div>

      <div className="bg-card border border-border rounded-lg">
        <div className="border-b border-border overflow-x-auto">
          <nav className="flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">{renderContent()}</div>
      </div>

      {renderModal()}
    </div>
  );
}
