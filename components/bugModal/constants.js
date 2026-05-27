export const getCategoryOptions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const data = sessionStorage.getItem('bug_categoryData')
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map(item => ({
        value: item.id,
        label: item.labelname
      }));
    }
  } catch (error) {
    console.error('Error loading category options from session storage:', error);
  }
  return [];
};

// Centralized function to filter status data based on user role
export const filterStatusDataByRole = (
  statusData,
  user = null,
  all = false
) => {
  if (!user) return statusData;

  // return all statuses when all=true
  if (all) return statusData;

  const designation = (user.designation || '').toLowerCase();

  const isDeveloper = designation.includes('developer');
  const isTester =
    designation.includes('tester') ||
    designation.includes('qa');

  const isAdmin = designation.includes('admin');

  // Admin gets all options
  if (isAdmin) return statusData;

  // Developer
  if (isDeveloper) {
    const devStatuses = [
      'In Progress',
      'Fixed',
      'Ready For Test',
      'Rejected',
    ];

    return statusData.filter((s) =>
      devStatuses.includes(s.labelname || s.label)
    );
  }

  // Tester
  if (isTester) {
    const testerStatuses = [
      'New',
      'Assigned',
      'Verified',
      'Closed',
      'Reopen',
      'Rejected',
    ];

    return statusData.filter((s) =>
      testerStatuses.includes(s.labelname || s.label)
    );
  }
  return statusData;
};

export const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  assigneeId: '',
  priority: '',
  status: '',
  dueDate: '',
  category: '',
  environment: {
    local: true,
    alpha: false,
    beta: false,
    live: false
  },
  taskNo: '',
  taskName: '',
  taskId: ''
};

export const getPriorityOptions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const data = sessionStorage.getItem('taskbugpriorityData');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map(item => ({
        value: item.id,
        label: item.labelname
      }));
    }
  } catch (error) {
    console.error('Error loading priority options from session storage:', error);
  }
  return [];
};

export const getStatusOptions = (user = null, all) => {
  if (typeof window === 'undefined') return [];
  try {
    const data = sessionStorage.getItem('taskbugstatusData');
    if (data) {
      const parsed = JSON.parse(data);
      const allOptions = parsed.map(item => ({
        value: item.id,
        label: item.labelname
      }));
      return filterStatusDataByRole(allOptions, user, all);
    }
  } catch (error) {
    console.error('Error loading status options from session storage:', error);
  }
  return [];
};
