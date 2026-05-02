/**
 * Normalizes bug data by enriching it with full objects from session storage.
 * This ensures consistent display of status, priority, category, assignee, and reporter
 * across all components (buglist, bugdetail, cards, etc.).
 *
 * @param {Object} bug - Raw bug object from API
 * @returns {Object} Normalized bug object with enriched fields
 */
export function normalizeBugData(bug) {
  console.log("normalizeBugData", bug);
  if (!bug) return null;

  const normalized = { ...bug };

  // Load reference data from session storage
  let statusData = [];
  let priorityData = [];
  let categoryData = [];
  let assigneeData = [];

  if (typeof window !== 'undefined') {
    try {
      statusData = JSON.parse(sessionStorage.getItem('taskbugstatusData') || '[]');
      priorityData = JSON.parse(sessionStorage.getItem('taskbugpriorityData') || '[]');
      categoryData = JSON.parse(sessionStorage.getItem('taskworkcategoryData') || sessionStorage.getItem('taskbugcategoryData') || '[]');
      assigneeData = JSON.parse(sessionStorage.getItem('taskAssigneeData') || '[]');
    } catch (error) {
      console.error('Error loading reference data for bug normalization:', error);
    }
  }

  // Normalize status (by id)
  const statusId = bug.statusId;
  const statusObj = statusData.find(s =>
    String(s?.id) === String(statusId)
  );
  if (statusObj) {
    normalized.status = statusObj.labelname || "";
  }

  // Normalize priority (by id or label)
  const priorityId = bug.priorityId;
  const priorityObj = priorityData.find(p =>
    String(p?.id) === String(priorityId)
  );
  if (priorityObj) {
    normalized.priority = priorityObj.labelname || "";
  }

  // Normalize category (by id)
  const categoryId = bug.categoryId;
  const categoryObj = categoryData.find(c =>
    String(c?.id) === String(categoryId)
  );
  if (categoryObj) {
    normalized.category = categoryObj.labelname || "";
  }

  // Normalize assignee (by id)
  const assigneeId = bug.assigneeId;
  const assigneeObj = assigneeData.find(a =>
    String(a?.id) === String(assigneeId) ||
    String(a?.userid) === String(assigneeId)
  );
  if (assigneeObj) {
    normalized.assignee = {
      id: assigneeObj.id,
      userid: assigneeObj.userid,
      firstname: assigneeObj.firstname,
      lastname: assigneeObj.lastname,
      fullName: `${assigneeObj.firstname || ''} ${assigneeObj.lastname || ''}`.trim(),
      department: assigneeObj.department,
      designation: assigneeObj.designation,
      avatar: assigneeObj.avatar,
    };
  }

  // Normalize reporter (by id)
  const reporterId = bug.reporterId;
  const reporterObj = assigneeData.find(r =>
    String(r?.id) === String(reporterId) ||
    String(r?.userid) === String(reporterId)
  );
  if (reporterObj) {
    normalized.reporter = {
      id: reporterObj.id,
      userid: reporterObj.userid,
      firstname: reporterObj.firstname,
      lastname: reporterObj.lastname,
      fullName: `${reporterObj.firstname || ''} ${reporterObj.lastname || ''}`.trim(),
      department: reporterObj.department,
      designation: reporterObj.designation,
      avatar: reporterObj.avatar,
    };
  }

  return normalized;
}

/**
 * Normalizes an array of bug objects.
 *
 * @param {Array} bugs - Array of raw bug objects from API
 * @returns {Array} Array of normalized bug objects
 */
export function normalizeBugList(bugs) {
  if (!Array.isArray(bugs)) return [];
  return bugs.map(bug => normalizeBugData(bug));
}
