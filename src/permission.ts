import 'nprogress/nprogress.css'; // progress bar style

import NProgress from 'nprogress'; // progress bar
import { MessagePlugin } from 'tdesign-vue-next';

import router from '@/router';
import { getPermissionStore, useUserLoginAndRegister, useUserStore } from '@/store';
import { UserStatus } from '@/store/modules/user';

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, from, next) => {
  NProgress.start();
  const userLoginAndRegisterStore = useUserLoginAndRegister();
  const permissionStore = getPermissionStore();
  const { whiteListRouters } = permissionStore;

  const userStore = useUserStore();

  // 登录状态且加入了企业
  if (userStore.token !== '' && userLoginAndRegisterStore.status === UserStatus.Joined) {
    if (to.path === '/login') {
      next();
      return;
    }
    try {
      if (!permissionStore.isRoutesInitialized) {
        await permissionStore.buildAsyncRoutes();
      }
      if (router.hasRoute(to.name)) {
        const hasDeniedRoute = to.matched.some((route) => {
          return !permissionStore.canAccessPermission(route.meta?.permission as string | string[] | undefined);
        });
        if (hasDeniedRoute) {
          MessagePlugin.warning('暂无访问权限');
          next(`/`);
          return;
        }
        next();
      } else {
        next(`/`);
      }
    } catch (error) {
      MessagePlugin.error(error.message);
      next({
        path: '/login',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
      NProgress.done();
    }
  } else {
    /* white list router */
    if (whiteListRouters.includes(to.path)) {
      next();
    } else {
      next({
        path: '/login',
        query: { redirect: encodeURIComponent(to.fullPath) },
      });
    }
    NProgress.done();
  }
});

router.afterEach((to) => {
  if (to.path === '/login') {
    const userStore = useUserStore();
    const permissionStore = getPermissionStore();
    userStore.logout();
    const userLoginAndRegisterStore = useUserLoginAndRegister();
    userLoginAndRegisterStore.logout();
    permissionStore.restoreRoutes();
  }
  NProgress.done();
});
