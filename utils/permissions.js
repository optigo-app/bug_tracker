/**
 * Centralized Permission Logic for BugTracker
 *
 * Roles:
 * - admin: Full access to everything.
 * - project_manager: Full access to bugs and projects.
 * - tester: Can report bugs, but can only see assigned bugs and cannot change anything.
 * - developer: Can only see assigned bugs and cannot change anything.
 * - other roles: Full readonly access (can see all bugs but cannot change anything).
 */

export const ROLES = {
    ADMIN: 'admin',
    PM: 'project_manager',
    TESTER: 'tester',
    DEV: 'developer'
};

export const getRole = (u) => {
    if (!u || !u.designation) return null;
    const desig = u.designation.toLowerCase();
    if (desig.includes('developer')) return ROLES.DEV;
    if (desig.includes('tester') || desig.includes('qa')) return ROLES.TESTER;
    if (desig.includes('admin')) return ROLES.ADMIN;
    if (desig.includes('project manager') || desig === 'pm' || desig === 'project_manager') return ROLES.PM;
    return desig;
};

/**
 * Check if a user can perform an action based on their role.
 */
export const permissions = {
    // Bug Creation
    canReportBug: (u) => [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(getRole(u)),

    // Bug Deletion
    canDeleteBug: (u) => [ROLES.ADMIN, ROLES.PM].includes(getRole(u)),

    // Bug Editing (General fields like title/description)
    // Management and Tester can edit, Developer cannot (even if reporter, as per request)
    canEditBug: (u) => [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(getRole(u)),

    // Field Level Permissions
    canChangeBugStatus: (u) => [ROLES.DEV, ROLES.PM, ROLES.ADMIN, ROLES.TESTER].includes(getRole(u)),

    canChangeBugPriority: (u) => [ROLES.PM, ROLES.ADMIN].includes(getRole(u)),

    canReassignBug: (u) => [ROLES.DEV, ROLES.PM, ROLES.ADMIN, ROLES.TESTER].includes(getRole(u)),

    canVerifyBug: (u) => [ROLES.TESTER, ROLES.PM, ROLES.ADMIN].includes(getRole(u)),

    // File Uploads
    canUploadAttachment: (u) => [ROLES.ADMIN, ROLES.PM, ROLES.TESTER].includes(getRole(u)),

    // Project Management
    canManageProjects: (u) => [ROLES.PM, ROLES.ADMIN].includes(getRole(u)),

    // System Management
    canManageUsers: (u) => getRole(u) === ROLES.ADMIN,
    canManageSettings: (u) => getRole(u) === ROLES.ADMIN,

    // Bug Visibility - Check if user should only see assigned bugs
    shouldFilterByAssignee: (u) => {
        const role = getRole(u);
        return role === ROLES.TESTER || role === ROLES.DEV;
    },

    // Check if user has any write access (for UI to show/hide edit buttons)
    hasWriteAccess: (u) => {
        const role = getRole(u);
        return role === ROLES.ADMIN || role === ROLES.PM;
    }
};
