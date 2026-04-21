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
            onStartAbstraction={() => navigate("start-coding")}
            onOpenPatient360={() => navigate("patient-360")}
            onOpenQAReview={() => navigate("qa-review")}
          />
        );

      case "patient-360":
        return (
          <Patient360
            onBack={() => navigate(previousView)}
            onOpenWorkspace={() => navigate("abstraction")}
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
        return <AbstractionWorkspace onBack={() => navigate("work-queue")} />;
      case "audit-sampling":
        return <AuditReview onOpenPatient360={() => navigate("patient-360")} />;
      case "qa-review":
        return <QAReview onOpenPatient360={() => navigate("patient-360")} />;
      case "measure-library":
        return <MeasuresLibrary />;

      /* ── Insights ── */
      case "reports-submissions":
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
