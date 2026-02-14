import { defineStore } from 'pinia';

import type { ProjectItem } from '@/api/model/projectModel';

export const useProjectStore = defineStore('_enterprise_project_list', {
  state: () => ({
    projects: {} as Record<string, ProjectItem>,
  }),
  actions: {
    // 存储当前页面的项目列表
    setProjects(projects: ProjectItem[]) {
      // 清空旧数据
      this.projects = {};
      this.projects = projects.reduce(
        (prev, cur) => {
          prev[cur.id] = cur;
          return prev;
        },
        {} as Record<string, ProjectItem>,
      );
    },
    getProject(id: string): ProjectItem | undefined {
      return this.projects[id];
    },
  },
  persist: true,
});
