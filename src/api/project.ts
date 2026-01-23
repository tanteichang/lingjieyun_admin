import type { ProjectListResult, ProjectQuery, TaskQuery } from '@/api/model/projectModel';
import { request } from '@/utils/request';

const Api = {
  ProjectList: '/project/list',
  TaskList: '/project/task/list',
  MemberList: '/project/member/list',
  LogList: '/project/log/list',
};

export function getProjectList(params: ProjectQuery) {
  return request.get<ProjectListResult>({
    url: Api.ProjectList,
    params,
  });
}

interface TaskListResult {
  list: any[];
  total: number;
}

export function getTaskList(params: TaskQuery) {
  return request.get<TaskListResult>({
    url: Api.TaskList,
    params,
  });
}

interface MemberListResult {
  list: any[];
  total: number;
}

export function getMemberList(params: TaskQuery) {
  return request.get<MemberListResult>({
    url: Api.MemberList,
    params,
  });
}

interface LogListResult {
  list: any[];
  total: number;
}

export function getLogList(params: TaskQuery) {
  return request.get<LogListResult>({
    url: Api.LogList,
    params,
  });
}
