import { MessagePlugin } from 'tdesign-vue-next';

import type {
  ProjectClosePayload,
  ProjectCloseResponse,
  ProjectCreatePayload,
  ProjectCreateResponse,
  ProjectListResponse,
  ProjectPausePayload,
  ProjectPauseResponse,
  ProjectQuery,
  ProjectResumePayload,
  ProjectResumeResponse,
  ProjectTerminatePayload,
  ProjectTerminateResponse,
  ProjectUpdatePayload,
  ProjectUpdateResponse,
  TaskQuery,
} from '@/api/model/projectModel';
import { request, postRequest } from '@/utils/request';

const Api = {
  ProjectList: '/admin/enterprise/project/list',
  ProjectCreate: '/admin/enterprise/project/create',
  ProjectUpdate: '/admin/enterprise/project/update',
  ProjectClose: '/admin/enterprise/project/close',
  ProjectPause: '/admin/enterprise/project/pause',
  ProjectResume: '/admin/enterprise/project/resume',
  TaskList: '/project/task/list',
  MemberList: '/project/member/list',
  LogList: '/project/log/list',
  ProjectTerminate: '/admin/enterprise/project/terminate',
};

export function getProjectList(params: ProjectQuery) {
  return request
    .get<ProjectListResponse>({
      url: Api.ProjectList,
      params,
    })
    .then((res) => {
      if (res.code !== 200) {
        MessagePlugin.error(res.msg || '获取项目列表失败');
      }
      return res;
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
/**
 * 创建项目
 */
export function createProject(data: ProjectCreatePayload) {
  return postRequest<ProjectCreateResponse>({
    url: Api.ProjectCreate,
    data,
    showError: true,
  });
}
/**
 * 更新项目
 */
export function updateProject(data: ProjectUpdatePayload) {
  return request.post<ProjectUpdateResponse>({
    url: Api.ProjectUpdate,
    data,
  });
}

/**
 * 关闭项目
 */
export function closeProject(data: ProjectClosePayload) {
  return request.post<ProjectCloseResponse>({
    url: Api.ProjectClose,
    data,
  });
}
/**
 * 暂停项目
 */
export function pauseProject(data: ProjectPausePayload) {
  return request.post<ProjectPauseResponse>({
    url: Api.ProjectPause,
    data,
  });
}
/**
 * 终止项目
 */
export function terminateProject(data: ProjectTerminatePayload) {
  return request.post<ProjectTerminateResponse>({
    url: Api.ProjectTerminate,
    data,
  });
}
/**
 * 恢复项目
 */
export function resumeProject(data: ProjectResumePayload) {
  return request.post<ProjectResumeResponse>({
    url: Api.ProjectResume,
    data,
  });
}
