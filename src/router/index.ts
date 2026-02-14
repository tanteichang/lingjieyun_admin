import uniq from 'lodash/uniq';
import type { RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';

import homepageAdmin from '@/router/modules/homepage.admin';
import homepageEnterprise from '@/router/modules/homepage.enterprise';

const env = import.meta.env.MODE || 'development';
const appSide = (import.meta.env.VITE_APP_SIDE || 'enterprise').toLowerCase();

// 导入modules非homepage相关固定路由
const fixedModules = import.meta.glob('./modules/**/!(homepage.enterprise|homepage.admin).ts', { eager: true });

// 其他固定路由
const defaultRouterList: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/enterprise/login/index.vue'),
  },
  {
    path: '/enterprise-register',
    name: 'enterpriseRegisterEntry',
    component: () => import('@/pages/enterprise/login/enterprise-entry.vue'),
  },
  {
    path: '/enterprise-register/form',
    name: 'enterpriseRegister',
    component: () => import('@/pages/enterprise/login/enterprise.vue'),
  },
  {
    path: '/',
    redirect: '/dashboard/base',
  },
  {
    path: '/base',
    redirect: '/dashboard/base',
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];
// 存放固定路由
const homepageRouteModule = appSide === 'admin' ? homepageAdmin : homepageEnterprise;
export const homepageRouterList: Array<RouteRecordRaw> = Array.isArray(homepageRouteModule)
  ? homepageRouteModule
  : [homepageRouteModule];
export const fixedRouterList: Array<RouteRecordRaw> = mapModuleRouterList(fixedModules);

export const allRoutes = [...homepageRouterList, ...fixedRouterList, ...defaultRouterList];

// 固定路由模块转换为路由
export function mapModuleRouterList(modules: Record<string, unknown>): Array<RouteRecordRaw> {
  const routerList: Array<RouteRecordRaw> = [];
  Object.keys(modules).forEach((key) => {
    // @ts-expect-error 外部赋值不太好直接写类型
    const mod = modules[key].default || {};
    const modList = Array.isArray(mod) ? [...mod] : [mod];
    routerList.push(...modList);
  });
  return routerList;
}

/**
 *
 * @deprecated 未使用
 */
export const getRoutesExpanded = () => {
  const expandedRoutes: Array<string> = [];

  fixedRouterList.forEach((item) => {
    if (item.meta && item.meta.expanded) {
      expandedRoutes.push(item.path);
    }
    if (item.children && item.children.length > 0) {
      item.children
        .filter((child) => child.meta && child.meta.expanded)
        .forEach((child: RouteRecordRaw) => {
          expandedRoutes.push(item.path);
          expandedRoutes.push(`${item.path}/${child.path}`);
        });
    }
  });
  return uniq(expandedRoutes);
};

export const getActive = (maxLevel = 3): string => {
  // 非组件内调用必须通过Router实例获取当前路由
  const route = router.currentRoute.value;

  if (!route.path) {
    return '';
  }

  return route.path
    .split('/')
    .filter((_item: string, index: number) => index <= maxLevel && index > 0)
    .map((item: string) => `/${item}`)
    .join('');
};

const router = createRouter({
  history: createWebHistory(env === 'site' ? '/starter/vue-next/' : import.meta.env.VITE_BASE_URL),
  routes: allRoutes,
  scrollBehavior() {
    return {
      el: '#app',
      top: 0,
      behavior: 'smooth',
    };
  },
});

export default router;
