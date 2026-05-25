import { useMemo } from "react";
import { usePermissions } from "./usePermissions";

export interface ProjectAccess {
  project_id: string;
  project_name: string;
  access_level: string; // 'None', 'View', 'Full', etc.
}

export function useProjectAccess() {
  const { userDetail, isSuperAdmin } = usePermissions();

  const userProjects: ProjectAccess[] = useMemo(() => {
    return userDetail?.project_access || [];
  }, [userDetail]);

  /**
   * Check if user has any access to a project
   */
  const canAccessProject = (projectId: string): boolean => {
    if (isSuperAdmin) return true;
    
    const roleName = userDetail?.user_role?.name?.toLowerCase();
    if (roleName === "admin" || roleName === "super admin") return true;

    return userProjects.some(
      (p) => p.project_id === projectId && p.access_level !== "None"
    );
  };

  /**
   * Get the specific access level for a project
   */
  const getAccessLevel = (projectId: string): string => {
    if (isSuperAdmin) return "Full";
    
    const roleName = userDetail?.user_role?.name?.toLowerCase();
    if (roleName === "admin" || roleName === "super admin") return "Full";

    const project = userProjects.find((p) => p.project_id === projectId);
    return project ? project.access_level : "None";
  };

  /**
   * Check if user can edit a project
   */
  const canEditProject = (projectId: string): boolean => {
    if (isSuperAdmin) return true;
    
    const roleName = userDetail?.user_role?.name?.toLowerCase();
    if (roleName === "admin" || roleName === "super admin") return true;

    const level = getAccessLevel(projectId);
    return level === "Full" || level === "Edit";
  };

  /**
   * Check if user has any project access at all
   */
  const hasAnyProjectAccess = useMemo(() => {
    if (isSuperAdmin) return true;
    
    const roleName = userDetail?.user_role?.name?.toLowerCase();
    if (roleName === "admin" || roleName === "super admin") return true;

    return userProjects.length > 0;
  }, [userProjects, isSuperAdmin, userDetail]);

  return {
    userProjects,
    canAccessProject,
    getAccessLevel,
    canEditProject,
    hasAnyProjectAccess,
    isSuperAdmin,
  };
}
