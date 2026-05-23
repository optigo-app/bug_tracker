import { bugApi } from './bugApi';

export const fetchBugListApi = async (params = {}) => {
  return bugApi('buglist', {
    p: {
      bugid: params.bugid || "",
      taskId: params.taskId || "",
      status: params.status || "",
      assigneeId: params.assigneeId || "",
      reporterId: params.reporterId || "",
      filterType: params.filterType || ""
    },
    f: 'Bug Management (bugmaster)',
  });
};
