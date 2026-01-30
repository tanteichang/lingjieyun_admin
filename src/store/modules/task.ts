import { defineStore } from 'pinia';

import type { TaskItem } from '@/api/model/taskModel';

export const useTaskStore = defineStore('_task_list', {
  state: () => ({
    tasks: {} as Record<string, TaskItem>,
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
  },
  persist: true,
});
