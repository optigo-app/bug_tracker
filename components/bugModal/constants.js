export const CATEGORY_OPTIONS = [
  { value: 'UI/UX', label: 'UI/UX' },
  { value: 'FUNCTIONALITY', label: 'Functionality' },
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'SECURITY', label: 'Security' },
  { value: 'OTHER', label: 'Other' }
];

export const getCategoryOptions = () => {
  if (typeof window === 'undefined') return CATEGORY_OPTIONS;
  try {
    const data = sessionStorage.getItem('taskworkcategoryData')
      || sessionStorage.getItem('taskbugcategoryData');
    if (data) {
      const parsed = JSON.parse(data);
      const mapped = parsed.map(item => ({
        value: item.id,
        label: item.labelname || item.label || item.name || String(item.id)
      }));
      if (mapped.length > 0) return mapped;
    }
  } catch (error) {
    console.error('Error loading category options from session storage:', error);
  }
  return CATEGORY_OPTIONS;
};

export const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  assigneeId: '',
  priority: '',
  status: '',
  dueDate: '',
  category: '',
  environment: { local: false, live: false },
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

export const getStatusOptions = () => {
  if (typeof window === 'undefined') return [];
  try {
    const data = sessionStorage.getItem('taskbugstatusData');
    if (data) {
      const parsed = JSON.parse(data);
      return parsed.map(item => ({
        value: item.id,
        label: item.labelname
      }));
    }
  } catch (error) {
    console.error('Error loading status options from session storage:', error);
  }
  return [];
};
