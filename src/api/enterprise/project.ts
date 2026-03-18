import { MessagePlugin } from 'tdesign-vue-next';

import type {
  LogQuery,
  MemberListQuery,
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
  ProjectLogListResponse,
  ProjectUpdatePayload,
  ProjectUpdateResponse,
  TaskQuery,
  ProjectLogQuery,
} from '@/api/model/enterprise/projectModel';
import { postRequest, request } from '@/utils/request';

const Api = {
  ProjectList: '/admin/enterprise/project/list',
  ProjectCreate: '/admin/enterprise/project/create',
  ProjectUpdate: '/admin/enterprise/project/update',
  ProjectClose: '/admin/enterprise/project/close',
  ProjectPause: '/admin/enterprise/project/pause',
  ProjectResume: '/admin/enterprise/project/resume',
  TaskList: '/project/task/list',
  MemberList: '/admin/enterprise/member/applyList',
  LogList: '/admin/enterprise/project/log/list',
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

export function getMemberList(params: MemberListQuery) {
  return request.get<MemberListResult>({
    url: Api.MemberList,
    params,
  });
}

export function getLogList(params: LogQuery) {
  return request.get<ProjectLogListResponse>({
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
  return postRequest<ProjectUpdateResponse>({
    url: Api.ProjectUpdate,
    data,
    showError: true,
  });
}

/**
 * 关闭项目
 */
export function closeProject(data: ProjectClosePayload) {
  return postRequest<ProjectCloseResponse>({
    url: Api.ProjectClose,
    data,
    showError: true,
  });
}
/**
 * 暂停项目
 */
export function pauseProject(data: ProjectPausePayload) {
  return postRequest<ProjectPauseResponse>({
    url: Api.ProjectPause,
    data,
    showError: true,
  });
}
/**
 * 终止项目
 */
export function terminateProject(data: ProjectTerminatePayload) {
  return postRequest<ProjectTerminateResponse>({
    url: Api.ProjectTerminate,
    data,
    showError: true,
  });
}
/**
 * 恢复项目
 */
export function resumeProject(data: ProjectResumePayload) {
  return postRequest<ProjectResumeResponse>({
    url: Api.ProjectResume,
    data,
  });
}
