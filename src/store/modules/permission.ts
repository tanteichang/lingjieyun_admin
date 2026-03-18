import { defineStore } from 'pinia';
import type { RouteRecordRaw } from 'vue-router';

import { AdminType } from '@/api/model/enterprise/admin';
import router, { fixedRouterList, homepageRouterList } from '@/router';
import { store } from '@/store';

type RoutePermission = string | string[] | undefined;
const SUPER_ADMIN_ONLY = '__super_admin_only__';

const filterMenuRoutesByPermission = (
  routes: RouteRecordRaw[],
  canAccess: (permission: RoutePermission) => boolean,
): RouteRecordRaw[] => {
  return routes.reduce((acc, route) => {
    const children = Array.isArray(route.children)
      ? filterMenuRoutesByPermission(route.children as RouteRecordRaw[], canAccess)
      : [];
    const currentPermission = route.meta?.permission as RoutePermission;
    const currentAllowed = canAccess(currentPermission);

    // 菜单级：当前路由有权限，或至少有一个可访问子路由时展示
    if (!currentAllowed && children.length === 0) {
      return acc;
    }

    acc.push({
      ...route,
      ...(Array.isArray(route.children) ? { children } : {}),
    });
    return acc;
  }, [] as RouteRecordRaw[]);
};

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    adminType: -1,
    whiteListRouters: ['/login', '/loginByWeChat', '/enterprise-register', '/enterprise-register/join', '/enterprise-register/form'],
    routers: [],
    removeRoutes: [],
    asyncRoutes: [],
    isRoutesInitialized: false,
    permissionCodes: [] as string[],
    permissionCodeMap: {} as Record<string, true>,
    isPermissionLoaded: false,
  }),
  getters: {
    isSuperAdmin: (state) => state.adminType === AdminType.Super,
    hasPermission: (state) => (code: string) => {
      if (!code) return false;
      return !!state.permissionCodeMap[code];
    },
    hasAnyPermission: (state) => (codes: string[]) => {
      if (!Array.isArray(codes) || !codes.length) return false;
      return codes.some((code) => !!state.permissionCodeMap[code]);
    },
    hasAllPermissions: (state) => (codes: string[]) => {
      if (!Array.isArray(codes) || !codes.length) return false;
      return codes.every((code) => !!state.permissionCodeMap[code]);
    },
  },
  actions: {
    setAdminType(type: AdminType) {
      this.adminType = type;
    },
    setPermissionCodes(codes: string[]) {
      const baseCodes = (codes || []).filter(Boolean);
      if (this.isSuperAdmin) {
        baseCodes.push(SUPER_ADMIN_ONLY);
      }
      const normalized = Array.from(new Set(baseCodes));
      this.permissionCodes = normalized;
      this.permissionCodeMap = normalized.reduce(
        (acc, code) => {
          acc[code] = true;
          return acc;
        },
        {} as Record<string, true>,
      );
      this.isPermissionLoaded = true;
    },
    clearPermissionCodes() {
      this.permissionCodes = [];
      this.permissionCodeMap = {};
      this.isPermissionLoaded = false;
    },
    has(code: string) {
      if (this.isSuperAdmin) {
        return true;
      }
      if (!code) return false;
      return !!this.permissionCodeMap[code];
    },
    hasAny(codes: string[]) {
      if (this.isSuperAdmin) {
        return true;
      }
      if (!Array.isArray(codes) || !codes.length) return false;
      return codes.some((code) => !!this.permissionCodeMap[code]);
    },
    hasAll(codes: string[]) {
      if (this.isSuperAdmin) {
        return true;
      }
      if (!Array.isArray(codes) || !codes.length) return false;
      return codes.every((code) => !!this.permissionCodeMap[code]);
    },
    canAccessPermission(permission?: RoutePermission) {
      if (!permission) return true;
      if (permission === SUPER_ADMIN_ONLY) {
        return this.isSuperAdmin;
      }
      if (Array.isArray(permission)) {
        return this.hasAny(permission);
      }
      return this.has(permission);
    },
    async initRoutes() {
      // 在菜单展示固定路由，并按路由 meta.permission 过滤
      const sourceRoutes = [...homepageRouterList, ...fixedRouterList] as RouteRecordRaw[];
      this.routers = filterMenuRoutesByPermission(sourceRoutes, (permission) => this.canAccessPermission(permission));
      this.isRoutesInitialized = true;
    },
    async buildAsyncRoutes() {
      try {
        // 不再通过接口获取菜单，直接使用本地路由
        this.asyncRoutes = [];
        await this.initRoutes();
        return this.asyncRoutes;
      } catch {
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
      this.adminType = 0;
      this.clearPermissionCodes();
    },
  },
  persist: {
    afterRestore: (ctx) => {
      ctx.store.setPermissionCodes(ctx.store.permissionCodes || []);
    },
    storage: window.sessionStorage,
    paths: ['adminType', 'permissionCodes', 'isPermissionLoaded'],
  },
});

export function getPermissionStore() {
  return usePermissionStore(store);
}
