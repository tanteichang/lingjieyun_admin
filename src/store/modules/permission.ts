import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

import router, { fixedRouterList, homepageRouterList } from '@/router';
import { store } from '@/store';

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    whiteListRouters: ['/login'],
    routers: [],
    removeRoutes: [],
    asyncRoutes: [],
    isRoutesInitialized: false,
  }),
  actions: {
    async initRoutes() {
      // 在菜单展示全部固定路由
      this.routers = [...homepageRouterList, ...fixedRouterList];
      this.isRoutesInitialized = true;
    },
    async buildAsyncRoutes() {
      try {
        // 不再通过接口获取菜单，直接使用本地路由
        this.asyncRoutes = [];
        await this.initRoutes();
        return this.asyncRoutes;
      } catch (error) {
        throw new Error("Can't build routes");
      }
    },
    async restoreRoutes() {
      // 不需要在此额外调用initRoutes更新侧边导肮内容，在登录后asyncRoutes为空会调用
      this.asyncRoutes.forEach((item: RouteRecordRaw) => {
        if (item.name) {
          router.removeRoute(item.name);
        }
      });
      this.asyncRoutes = [];
      this.routers = [];
      this.isRoutesInitialized = false;
    },
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
