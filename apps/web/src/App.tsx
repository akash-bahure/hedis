import { useState, useEffect } from "react";
import { Sidebar } from "./components/sidebar";
import type { UserRole } from "./components/sidebar";
import { Header } from "./components/header";
import { Dashboard } from "./components/dashboard";
import { Projects } from "./components/projects";
import { WorkQueue } from "./components/work-queue";
import { Patients } from "./components/patients";
import { Clients } from "./components/clients";
import { Patient360 } from "./components/patient-360";
import { AbstractionWorkspace } from "./components/abstraction-workspace";
import { VerificationGate } from "./components/verification-gate";
import { MeasuresLibrary } from "./components/measures-library";
import { ReportsAnalytics } from "./components/reports-analytics";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { UsersRoles } from "./components/users-roles";
import { SecurityCompliance } from "./components/security-compliance";
import { AIOptimization } from "./components/ai-optimization";
import { SystemSettings } from "./components/system-settings";
import { Exceptions } from "./components/exceptions";
import { QAReview } from "./components/qa-review";
import { AuditorWorkspace } from "./components/auditor-workspace";
import { AuditReview } from "./components/audit-review";
import { WorkspaceSubtabs } from "./components/workspace-subtabs";
import { SidebarShowcase } from "./components/sidebar-showcase";
import { OperationsOverview } from "./components/operations-overview";
import { ProfilePreferences } from "./components/profile-preferences";

/* ── Views accessible by role ──────────────────────────────── */
const ROLE_ACCESS: Record<UserRole, string[]> = {
  "program-manager": [
    "dashboard",
    "work-queue",
    "clients",
    "qa-review",
    "audit-sampling",
    "reports-submissions",
    "measure-library",
    "admin-settings",
    "security",
    "ai-optimization",
    "settings",
  ],
  abstractor: [
    "dashboard",
    "work-queue",
    "reports-submissions",
    "measure-library",
  ],
  "qa-analyst": ["dashboard", "work-queue"],
};

/* ── Views that bypass role checks (workflow-driven) ────────── */
const BYPASS_VIEWS = new Set([
  "start-coding",
  "abstraction",
  "analytics",
  "sidebar-showcase",
  "patient-360",
]);

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [activeView, setActiveView] = useState("dashboard");
  const [previousView, setPreviousView] = useState("dashboard");
  const [role, setRole] = useState<UserRole>("program-manager");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null,
  );
  const [selectedChartId, setSelectedChartId] = useState<string | null>(null);
  const [selectedPatientData, setSelectedPatientData] = useState<any>(null);
  const [qaMode, setQaMode] = useState(false);

  /* Apply dark mode class */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* When role changes, reset to dashboard if current view isn't accessible */
  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (
      !ROLE_ACCESS[newRole].includes(activeView) &&
      !BYPASS_VIEWS.has(activeView)
    ) {
      setActiveView("dashboard");
    }
  };

  const navigate = (view: string) => {
    setPreviousView(activeView);
    setActiveView(view);
    setMobileSidebarOpen(false);
  };
  const handleBackToQueue = () => {
    navigate("/work-queue");
  };

  const renderContent = () => {
    switch (activeView) {
      /* ── Main ── */
      case "dashboard":
        return <Dashboard />;
      case "projects":
        return <Projects />;
      case "patients":
        return <Patients />;
      case "clients":
        return <Clients />;
      case "work-queue":
        return (
          <WorkQueue
            role={role}
            onStartAbstraction={(patientId, chartId, patientData) => {
              setSelectedPatientId(patientId || null);
              setSelectedChartId(chartId || null);
              setSelectedPatientData(patientData || null);
              navigate("abstraction");
            }}
            onOpenPatient360={(patientId, chartId, patientData) => {
              setQaMode(false);
              setSelectedPatientId(patientId || null);
              setSelectedChartId(chartId || null);
              setSelectedPatientData(patientData || null);
              navigate("patient-360");
            }}
            onOpenQAReview={(patientId, chartId, patientData) => {
              setQaMode(true);
              setSelectedPatientId(patientId || null);
              setSelectedChartId(chartId || null);
              setSelectedPatientData(patientData || null);
              navigate("patient-360");
            }}
          />
        );

      // case "patient-360":
      //   return (
      //     <Patient360
      //       patientId={selectedPatientId || ""}
      //       chartId={selectedChartId || ""}
      //       onBack={() => navigate(previousView)}
      //       onOpenWorkspace={() => navigate("abstraction")}
      //       {...selectedPatientData}
      //     />
      //   );
      case "patient-360":
        return (
          <Patient360
            patientId={selectedPatientId || ""}
            chartId={selectedChartId || ""}
            onBack={() => navigate(previousView)}
            onOpenWorkspace={() => {
              if (qaMode) {
                navigate("qa-review");
              } else {
                navigate("abstraction");
              }
            }}
            {...selectedPatientData}
          />
        );

      /* ── Operations ── */
      case "start-coding":
        return (
          <VerificationGate
            onBeginAbstraction={() => navigate("abstraction")}
            onGoBack={() => navigate("work-queue")}
          />
        );
      case "abstraction":
        return (
          <AbstractionWorkspace
            patientId={selectedPatientId || ""}
            chartId={selectedChartId || ""}
            patientData={selectedPatientData}
            onBack={() => navigate("work-queue")}
          />
        );
      case "audit-sampling":
        return <AuditReview onOpenPatient360={() => navigate("patient-360")} />;
      case "qa-review":
        return (
          <QAReview
            patientId={selectedPatientId || undefined}
            patientData={selectedPatientData}
            onOpenPatient360={() => navigate("patient-360")}
          />
        );
      case "measure-library":
        return <MeasuresLibrary />;

      /* ── Insights ── */
      case "reports-analytics":
        return <ReportsAnalytics />;
      case "analytics":
        return <AnalyticsDashboard />;

      /* ── Administration ── */
      case "admin-settings":
        return <UsersRoles />;
      case "security":
        return <SecurityCompliance />;
      case "ai-optimization":
        return <AIOptimization />;
      case "settings":
        return <SystemSettings />;

      /* ── Design System ── */
      case "sidebar-showcase":
        return <SidebarShowcase />;

      /* ── Profile ── */
      case "profile":
        return (
          <ProfilePreferences
            onBack={() => navigate(previousView)}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode((d) => !d)}
          />
        );

      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeView={activeView}
        onViewChange={navigate}
        role={role}
        onRoleChange={handleRoleChange}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode((d) => !d)}
          activeView={activeView}
          onMenuClick={() => setMobileSidebarOpen(true)}
          onNavigate={navigate}
        />

        <main className="flex-1 overflow-hidden flex flex-col">
          <WorkspaceSubtabs activeView={activeView}>
            {renderContent()}
          </WorkspaceSubtabs>
        </main>
      </div>
    </div>
  );
}
