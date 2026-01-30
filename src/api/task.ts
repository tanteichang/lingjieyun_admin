import { request } from '@/utils/request';

import type {
  TaskListResponse,
  TaskMemberListPayload,
  TaskMemberListResponse,
  TaskPausePayload,
  TaskPauseResponse,
  TaskPublishPayload,
  TaskPublishResponse,
  TaskQuery,
  TaskResumePayload,
  TaskResumeResponse,
  TaskTerminatePayload,
  TaskTerminateResponse,
} from './model/taskModel';

const API = {
  TaskList: '/admin/enterprise/task/list',
  TaskPublish: '/admin/enterprise/task/publish',
  TaskPause: '/admin/enterprise/task/pause',
  TaskResume: '/admin/enterprise/task/resume',
  TaskTerminate: '/admin/enterprise/task/terminate',
  TaskMemberList: '/admin/enterprise/task/member/list',
};
/**
 * 获取任务列表
 */
export const getTaskList = (params: TaskQuery) => {
  return request.get<TaskListResponse>({
    url: API.TaskList,
    params,
  });
};
/**
 * 发布任务
 */
export const publishTask = (params: TaskPublishPayload) => {
  return request.post<TaskPublishResponse>({
    url: API.TaskPublish,
    params,
  });
};
/**
 * 暂停任务
 */
export const pauseTask = (params: TaskPausePayload) => {
  return request.post<TaskPauseResponse>({
    url: API.TaskPause,
    params,
  });
};
/**
 * 恢复任务
 */
export const resumeTask = (params: TaskResumePayload) => {
  return request.post<TaskResumeResponse>({
    url: API.TaskResume,
    params,
  });
};
/**
 * 终止任务
 */
export const terminateTask = (params: TaskTerminatePayload) => {
  return request.post<TaskTerminateResponse>({
    url: API.TaskTerminate,
    params,
  });
};
/**
 * 获取任务成员列表
 */
export const getTaskMemberList = (params: TaskMemberListPayload) => {
  return request.get<TaskMemberListResponse>({
    url: API.TaskMemberList,
    params,
  });
};
