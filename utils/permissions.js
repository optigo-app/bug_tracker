/**
 * Centralized Permission Logic for BugTracker
 *
 * Roles:
 * - admin: Full access to everything.
 * - project_manager: Full access to bugs and projects, but cannot manage users/settings.
 * - tester: Can report bugs and verify/reopen them.
 * - developer: Can update status/assignees of assigned bugs, but cannot change priority or delete.
 */

export const ROLES = {
    ADMIN: 'admin',
    PM: 'project_manager',
    TESTER: 'tester',
    DEV: 'developer'
};

/**
 * Check if a user can perform an action based on their role.
 */
export const permissions = {
    // Bug Creation
    canReportBug: (u) => u && [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(u.designation?.toLowerCase()),

    // Bug Deletion
    canDeleteBug: (u) => u && [ROLES.ADMIN, ROLES.PM].includes(u.designation?.toLowerCase()),

    // Bug Editing (General fields like title/description)
    // Management and Tester can edit, Developer cannot (even if reporter, as per request)
    canEditBug: (u) => u && [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(u.designation?.toLowerCase()),

    // Field Level Permissions
    canChangeBugStatus: (u) => u && [ROLES.DEV, ROLES.PM, ROLES.ADMIN, ROLES.TESTER].includes(u.designation?.toLowerCase()),

    canChangeBugPriority: (u) => u && [ROLES.PM, ROLES.ADMIN].includes(u.role?.toLowerCase()),

    canReassignBug: (u) => u && [ROLES.DEV, ROLES.PM, ROLES.ADMIN, ROLES.TESTER].includes(u.designation?.toLowerCase()),

    canVerifyBug: (u) => u && [ROLES.TESTER, ROLES.PM, ROLES.ADMIN].includes(u.designation?.toLowerCase()),

    // File Uploads
    canUploadAttachment: (u) => u && [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(u.designation?.toLowerCase()),

    // Project Management
    canManageProjects: (u) => u && [ROLES.PM, ROLES.ADMIN].includes(u.designation?.toLowerCase()),

    // System Management
    canManageUsers: (u) => u && u.designation?.toLowerCase() === ROLES.ADMIN,
    canManageSettings: (u) => u && u.designation?.toLowerCase() === ROLES.ADMIN
};
