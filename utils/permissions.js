/**
 * Centralized Permission Logic for BugTracker
 * 
 * Roles:
 * - ADMIN: Full access to everything.
 * - PROJECT_MANAGER: Full access to bugs and projects, but cannot manage users/settings.
 * - TESTER: Can report bugs and verify/reopen them.
 * - DEVELOPER: Can update status/assignees of assigned bugs, but cannot change priority or delete.
 */

export const ROLES = {
    ADMIN: 'ADMIN',
    PM: 'PROJECT_MANAGER',
    TESTER: 'TESTER',
    DEV: 'DEVELOPER'
};

/**
 * Check if a user can perform an action based on their role.
 */
export const permissions = {
    // Bug Creation
    canReportBug: (u) => u && [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(u.designation?.toUpperCase()),

    // Bug Deletion
    canDeleteBug: (u) => u && [ROLES.ADMIN, ROLES.PM].includes(u.designation?.toUpperCase()),

    // Bug Editing (General fields like title/description)
    // Management and Tester can edit, Developer cannot (even if reporter, as per request)
    canEditBug: (u) => u && [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(u.designation?.toUpperCase()),

    // Field Level Permissions
    canChangeBugStatus: (u) => u && [ROLES.DEV, ROLES.PM, ROLES.ADMIN, ROLES.TESTER].includes(u.designation?.toUpperCase()),

    canChangeBugPriority: (u) => u && [ROLES.PM, ROLES.ADMIN].includes(u.role?.toUpperCase()),

    canReassignBug: (u) => u && [ROLES.DEV, ROLES.PM, ROLES.ADMIN, ROLES.TESTER].includes(u.designation?.toUpperCase()),

    canVerifyBug: (u) => u && [ROLES.TESTER, ROLES.PM, ROLES.ADMIN].includes(u.designation?.toUpperCase()),

    // File Uploads
    canUploadAttachment: (u) => u && [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(u.designation?.toUpperCase()),

    // Project Management
    canManageProjects: (u) => u && [ROLES.PM, ROLES.ADMIN].includes(u.designation?.toUpperCase()),

    // System Management
    canManageUsers: (u) => u && u.designation?.toUpperCase() === ROLES.ADMIN,
    canManageSettings: (u) => u && u.designation?.toUpperCase() === ROLES.ADMIN
};
