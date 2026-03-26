import { defineStore } from 'pinia';

import type { TaskItem } from '@/api/model/enterprise/taskModel';

export const useTaskStore = defineStore('_enterprise_task_list', {
  state: () => ({
    tasks: {} as Record<string, TaskItem>,
    taskDetailRefreshMarks: {} as Record<string, number>,
  }),
  actions: {
    // 存储当前页面的任务列表
    setTasks(tasks: TaskItem[]) {
      this.tasks = {};
      this.tasks = tasks.reduce(
        (prev, cur) => {
          prev[cur.id] = cur;
          return prev;
        },
        {} as Record<string, TaskItem>,
      );
    },
    getTask(id: string): TaskItem | undefined {
      return this.tasks[id];
    },
    markTaskDetailShouldRefresh(id: string) {
      this.taskDetailRefreshMarks[id] = Date.now();
    },
    shouldRefreshTaskDetail(id: string) {
      return !!this.taskDetailRefreshMarks[id];
    },
    clearTaskDetailRefreshMark(id: string) {
      delete this.taskDetailRefreshMarks[id];
    },
  },
  persist: true,
});
