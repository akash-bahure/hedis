import { useMemo } from "react";

export type PermissionType =
  | "can_view"
  | "can_edit"
  | "can_assign"
  | "can_approve"
  | "can_reject"
  | "can_export"
  | "can_override";

export interface ModulePermission {
  id: string;
  module: string;
  module_group: string;
  can_view: boolean;
  can_edit: boolean;
  can_assign: boolean;
  can_approve: boolean;
  can_reject: boolean;
  can_export: boolean;
  can_override: boolean;
}

export interface PermissionGroup {
  group: string;
  modules: ModulePermission[];
}

export interface UserDetail {
  id: number;
  full_name: string;
  email: string;
  user_role?: {
    id: string;
    name: string;
    permissions?: PermissionGroup[];
  };
  [key: string]: any;
}

export function usePermissions() {
  const userDetail: UserDetail | null = useMemo(() => {
    const rawData = localStorage.getItem("userDetail");
    if (!rawData) return null;
    try {
      return JSON.parse(rawData);
    } catch (e) {
      console.error("Error parsing userDetail from localStorage", e);
      return null;
    }
  }, []);

  const permissions = userDetail?.user_role?.permissions || [];

  /**
   * Check if user has a specific permission for a module
   */
  const hasPermission = (
    moduleName: string,
    permissionType: PermissionType
  ): boolean => {
    // If super admin or superuser flag is set, grant all
    if (userDetail?.is_super_administrator || userDetail?.is_superuser)
      return true;

    const roleName = userDetail?.user_role?.name?.toLowerCase();
    const adminRoles = ["admin", "super admin", "operations/program manager"];
    if (roleName && adminRoles.includes(roleName))
      return true;

    for (const group of permissions) {
      const modulePerm = group.modules.find((m) => m.module === moduleName);
      if (modulePerm) {
        return !!modulePerm[permissionType];
      }
    }
    return false;
  };

  /**
   * Shorthand to check if user can view a module
   */
  const canView = (moduleName: string): boolean =>
    hasPermission(moduleName, "can_view");

  /**
   * Shorthand to check if user can edit/create in a module
   */
  const canEdit = (moduleName: string): boolean =>
    hasPermission(moduleName, "can_edit");

  return {
    userDetail,
    permissions,
    hasPermission,
    canView,
    canEdit,
    isSuperAdmin: !!(
      userDetail?.is_super_administrator || userDetail?.is_superuser
    ),
  };
}
