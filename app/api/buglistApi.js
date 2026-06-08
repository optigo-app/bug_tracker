import { bugApi } from './bugApi';

const toNullableInt = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export const fetchBugListApi = async (params = {}) => {
  return bugApi('buglist', {
    p: {
      bugid: toNullableInt(params.bugid),
      taskId: toNullableInt(params.taskId),
      status: params.status ?? null,
      assigneeId: toNullableInt(params.assigneeId),
      reporterId: toNullableInt(params.reporterId),
      filterType: params.filterType || ""
    },
    f: 'Bug Management (bugmaster)',
  });
};
