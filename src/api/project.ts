import type { ProjectListResult, ProjectQuery } from '@/api/model/projectModel';
import { request } from '@/utils/request';

const Api = {
  ProjectList: '/project/list',
};

export function getProjectList(params: ProjectQuery) {
  return request.get<ProjectListResult>({
    url: Api.ProjectList,
    params,
  });
}
