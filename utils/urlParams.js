export const encodeUrlParams = (params) => {
  try {
    const paramsString = JSON.stringify(params);
    return encodeURIComponent(btoa(paramsString));
  } catch (error) {
    console.error('Error encoding base64 params:', error);
    return '';
  }
};

export const decodeUrlParams = (dataParam) => {
  if (!dataParam) {
    return {
      taskno: '',
      taskname: '',
      taskid: '',
      assigneeids: '',
      duedate: ''
    };
  }

  try {
    const decodedParams = JSON.parse(atob(decodeURIComponent(dataParam)));
    return {
      taskno: decodedParams.taskno || '',
      taskname: decodedParams.taskname || '',
      taskid: decodedParams.taskid || '',
      assigneeids: decodedParams.assigneeids || '',
      duedate: decodedParams.duedate || decodedParams.dueDate || ''
    };
  } catch (error) {
    console.error('Error decoding base64 params:', error);
    return {
      taskno: '',
      taskname: '',
      taskid: '',
      assigneeids: '',
      duedate: ''
    };
  }
};
