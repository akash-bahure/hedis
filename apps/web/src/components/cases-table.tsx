import {
  Filter,
  Download,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
} from "lucide-react";

interface Case {
  id: string;
  memberId: string;
  memberName: string;
  measure: string;
  status: "completed" | "in-progress" | "pending" | "review" | "flagged";
  abstractor: string;
  dueDate: string;
  priority: "high" | "medium" | "low";
  compliance: number;
}

const mockCases: Case[] = [
  {
    id: "M-2845",
    memberId: "MBR-100234",
    memberName: "Anderson, Jennifer",
    measure: "BCS",
    status: "completed",
    abstractor: "Dr. Martinez",
    dueDate: "2025-02-10",
    priority: "high",
    compliance: 100,
  },
  {
    id: "M-2844",
    memberId: "MBR-100198",
    memberName: "Thompson, Robert",
    measure: "CDC",
    status: "in-progress",
    abstractor: "Sarah Johnson",
    dueDate: "2025-02-08",
    priority: "high",
    compliance: 67,
  },
  {
    id: "M-2843",
    memberId: "MBR-100167",
    memberName: "Williams, Patricia",
    measure: "COL",
    status: "review",
    abstractor: "Dr. Chen",
    dueDate: "2025-02-09",
    priority: "medium",
    compliance: 85,
  },
  {
    id: "M-2842",
    memberId: "MBR-100156",
    memberName: "Davis, Michael",
    measure: "CBP",
    status: "pending",
    abstractor: "Unassigned",
    dueDate: "2025-02-12",
    priority: "medium",
    compliance: 0,
  },
  {
    id: "M-2841",
    memberId: "MBR-100145",
    memberName: "Rodriguez, Maria",
    measure: "BPD",
    status: "flagged",
    abstractor: "Sarah Johnson",
    dueDate: "2025-02-07",
    priority: "high",
    compliance: 45,
  },
  {
    id: "M-2840",
    memberId: "MBR-100134",
    memberName: "Miller, James",
    measure: "BCS",
    status: "completed",
    abstractor: "Dr. Martinez",
    dueDate: "2025-02-06",
    priority: "low",
    compliance: 100,
  },
  {
    id: "M-2839",
    memberId: "MBR-100123",
    memberName: "Garcia, Linda",
    measure: "CDC",
    status: "in-progress",
    abstractor: "Dr. Chen",
    dueDate: "2025-02-11",
    priority: "medium",
    compliance: 52,
  },
  {
    id: "M-2838",
    memberId: "MBR-100112",
    memberName: "Martinez, David",
    measure: "COL",
    status: "review",
    abstractor: "Sarah Johnson",
    dueDate: "2025-02-08",
    priority: "high",
    compliance: 78,
  },
];

export function CasesTable() {
  const getStatusBadge = (status: Case["status"]) => {
    const statusConfig = {
      completed: {
        label: "Completed",
        color: "bg-[#10b981]/10 text-[#10b981]",
        icon: CheckCircle,
      },
      "in-progress": {
        label: "In Progress",
        color: "bg-primary/10 text-primary",
        icon: Clock,
      },
      pending: {
        label: "Pending",
        color: "bg-muted text-muted-foreground",
        icon: Clock,
      },
      review: {
        label: "Review",
        color: "bg-[#f59e0b]/10 text-[#f59e0b]",
        icon: Eye,
      },
      flagged: {
        label: "Flagged",
        color: "bg-destructive/10 text-destructive",
        icon: AlertTriangle,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: Case["priority"]) => {
    const colors = {
      high: "text-destructive",
      medium: "text-[#f59e0b]",
      low: "text-muted-foreground",
    };

    return (
      <span className={`text-xs font-medium ${colors[priority]} capitalize`}>
        {priority}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-1">
            Active Cases
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage and track HEDIS abstraction cases
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Case ID
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Member
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Measure
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Abstractor
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Due Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Priority
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Compliance
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockCases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-primary">
                      {caseItem.id}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {caseItem.memberName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {caseItem.memberId}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground font-medium">
                      {caseItem.measure}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(caseItem.status)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {caseItem.abstractor}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-foreground">
                      {caseItem.dueDate}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {getPriorityBadge(caseItem.priority)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 w-16 bg-muted rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            caseItem.compliance >= 80
                              ? "bg-[#10b981]"
                              : caseItem.compliance >= 50
                                ? "bg-[#f59e0b]"
                                : "bg-destructive"
                          }`}
                          style={{ width: `${caseItem.compliance}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground w-8">
                        {caseItem.compliance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1 hover:bg-accent rounded transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-muted/20">
          <p className="text-sm text-muted-foreground">
            Showing 1-8 of 1,247 cases
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 border border-border rounded hover:bg-accent transition-colors text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 transition-colors text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
