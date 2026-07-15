/**
 * Normalizes bug data by enriching it with full objects from session storage.
 * This ensures consistent display of status, priority, category, assignee, and reporter
 * across all components (buglist, bugdetail, cards, etc.).
 *
 * @param {Object} bug - Raw bug object from API
 * @returns {Object} Normalized bug object with enriched fields
 */
export function normalizeBugData(bug, refData = null) {
  if (!bug) return null;

  const normalized = { ...bug };

  // Load reference data from localStorage only if not provided
  let statusData = refData?.statusData ?? [];
  let priorityData = refData?.priorityData ?? [];
  let categoryData = refData?.categoryData ?? [];
  let assigneeData = refData?.assigneeData ?? [];

  if (!refData && typeof window !== 'undefined') {
    try {
      statusData = JSON.parse(localStorage.getItem('taskbugstatusData') || '[]');
      priorityData = JSON.parse(localStorage.getItem('taskbugpriorityData') || '[]');
      categoryData = JSON.parse(localStorage.getItem('bug_categoryData') || localStorage.getItem('taskbugcategoryData') || '[]');
      assigneeData = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');
    } catch (error) {
      console.error('Error loading reference data for bug normalization:', error);
    }
  }

  // Build lookup maps for O(1) access instead of O(n) .find()
  const statusMap = refData?.statusMap;
  const priorityMap = refData?.priorityMap;
  const categoryMap = refData?.categoryMap;
  const assigneeMap = refData?.assigneeMap;

  // Normalize status (by id)
  const statusId = bug.statusId;
  if (statusMap) {
    const statusObj = statusMap[String(statusId)];
    if (statusObj) normalized.status = statusObj.labelname || "";
  } else {
    const statusObj = statusData.find(s => String(s?.id) === String(statusId));
    if (statusObj) normalized.status = statusObj.labelname || "";
  }

  // Normalize priority (by id or label)
  const priorityId = bug.priorityId;
  if (priorityMap) {
    const priorityObj = priorityMap[String(priorityId)];
    if (priorityObj) normalized.priority = priorityObj.labelname || "";
  } else {
    const priorityObj = priorityData.find(p => String(p?.id) === String(priorityId));
    if (priorityObj) normalized.priority = priorityObj.labelname || "";
  }

  // Normalize category (by id)
  const categoryId = bug.categoryId;
  if (categoryMap) {
    const categoryObj = categoryMap[String(categoryId)];
    if (categoryObj) normalized.category = categoryObj.labelname || "";
  } else {
    const categoryObj = categoryData.find(c => String(c?.id) === String(categoryId));
    if (categoryObj) normalized.category = categoryObj.labelname || "";
  }

  // Normalize assignee (by id)
  const assigneeId = bug.assigneeId;
  let assigneeObj = null;
  if (assigneeMap) {
    assigneeObj = assigneeMap[String(assigneeId)] ?? assigneeMap[String(assigneeData.find(a => String(a?.userid) === String(assigneeId))?.id)];
  } else {
    assigneeObj = assigneeData.find(a => String(a?.id) === String(assigneeId) || String(a?.userid) === String(assigneeId));
  }
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
  let reporterObj = null;
  if (assigneeMap) {
    reporterObj = assigneeMap[String(reporterId)] ?? assigneeMap[String(assigneeData.find(r => String(r?.userid) === String(reporterId))?.id)];
  } else {
    reporterObj = assigneeData.find(r => String(r?.id) === String(reporterId) || String(r?.userid) === String(reporterId));
  }
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

  // Pre-load reference data once for the entire list
  let refData = null;
  if (typeof window !== 'undefined') {
    try {
      const statusData = JSON.parse(localStorage.getItem('taskbugstatusData') || '[]');
      const priorityData = JSON.parse(localStorage.getItem('taskbugpriorityData') || '[]');
      const categoryData = JSON.parse(localStorage.getItem('bug_categoryData') || localStorage.getItem('taskbugcategoryData') || '[]');
      const assigneeData = JSON.parse(localStorage.getItem('taskAssigneeData') || '[]');

      const toMap = (arr) => {
        const map = {};
        for (let i = 0; i < arr.length; i++) {
          const item = arr[i];
          if (item?.id !== undefined) map[String(item.id)] = item;
        }
        return map;
      };

      refData = {
        statusData,
        priorityData,
        categoryData,
        assigneeData,
        statusMap: toMap(statusData),
        priorityMap: toMap(priorityData),
        categoryMap: toMap(categoryData),
        assigneeMap: toMap(assigneeData),
      };
    } catch (error) {
      console.error('Error loading reference data for bug list normalization:', error);
    }
  }

  return bugs.map(bug => normalizeBugData(bug, refData));
}
