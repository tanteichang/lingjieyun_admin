import { getRequest } from '@/utils/request';

import type { ImportLogQuery, ImportLogResponse } from '../model/enterprise/import';

const Api = {
  LogList: '/admin/enterprise/import/logList',
};

export function getImportLogList(query: ImportLogQuery) {
  return getRequest<ImportLogResponse>({
    url: Api.LogList,
    params: query,
  });
}
