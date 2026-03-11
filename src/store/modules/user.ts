import { defineStore } from 'pinia';

import type { AdminType } from '@/api/model/enterprise/admin';
import type { EnterpriseInfo } from '@/api/model/enterprise/enterprise';
import { usePermissionStore } from '@/store';

export interface UserInfo {
  name?: string; // 用户名，用于展示在页面右上角头像处
  phone?: string; // 手机号
  enterprise_id?: number; // 企业ID
  enterprise_name?: string; // 企业名称
  admin_id?: number; // 管理员ID
  admin_type?: AdminType;
  wechat?: string; // 微信昵称
  security_level?: number; // 安全等级
  security_level_text?: string; // 安全等级文本
  has_pay_password?: boolean; // 是否设置支付密码
}

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '', // 默认token不走权限
    userInfo: {} as UserInfo,
    enterpriseInfo: {} as EnterpriseInfo,
    register_admin_mobile_masked: '', // 注册管理员手机号掩码
  }),
  getters: {},
  actions: {
    setToken(token: string) {
      this.token = token;
    },
    shouldLogin() {
      console.log('token', this.token);
      return this.token === '';
    },
    updateUserInfo(userInfo: UserInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo };
    },
    updateEnterpriseInfo(enterpriseInfo: EnterpriseInfo) {
      this.enterpriseInfo = { ...this.enterpriseInfo, ...enterpriseInfo };
    },

    // async login(userInfo: Record<string, unknown>) {
    //   const mockLogin = async (userInfo: Record<string, unknown>) => {
    //     // 登录请求流程
    //     console.log(`用户信息:`, userInfo);
    //     // const { account, password } = userInfo;
    //     // if (account !== 'td') {
    //     //   return {
    //     //     code: 401,
    //     //     message: '账号不存在',
    //     //   };
    //     // }
    //     // if (['main_', 'dev_'].indexOf(password) === -1) {
    //     //   return {
    //     //     code: 401,
    //     //     message: '密码错误',
    //     //   };
    //     // }
    //     // const token = {
    //     //   main_: 'main_token',
    //     //   dev_: 'dev_token',
    //     // }[password];
    //     return {
    //       code: 200,
    //       message: '登录成功',
    //       data: 'main_token',
    //     };
    //   };

    //   const res = await mockLogin(userInfo);
    //   if (res.code === 200) {
    //     this.token = res.data;
    //   } else {
    //     throw res;
    //   }
    // },
    async logout() {
      this.token = '';
      this.userInfo = {} as UserInfo;
      this.enterpriseInfo = {} as EnterpriseInfo;
      if (typeof document !== 'undefined') {
        // 清除当前域名下可见 cookie
        document.cookie.split(';').forEach((item) => {
          const cookieName = item.split('=')[0]?.trim();
          if (!cookieName) return;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
        });
      }
    },
  },
  persist: {
    afterRestore: () => {
      const permissionStore = usePermissionStore();
      permissionStore.initRoutes();
    },
    storage: window.sessionStorage,
    key: 'user',
    paths: ['token', 'userInfo', 'enterpriseInfo', 'register_admin_mobile_masked'],
  },
});

export enum UserStatus {
  NotDo = 0, // 未选择加入或创建企业
  JoinPending = 1, // 加入企业审核中
  CreatePending = 2, // 创建企业审核中
  CreateSignPending = 3, // 创建企业通过，待签约
}

/**
 * 用户登录和注册状态管理
 */
export const useUserLoginAndRegister = defineStore('userLoginAndRegister', {
  state: () => ({
    admin_id: -1,
    phone: '',
    pending_join_apply: false,
    status: UserStatus.NotDo,
  }),
  actions: {
    logout() {
      this.admin_id = -1;
      this.phone = '';
      this.pending_join_apply = false;
    },
    setAdminId(admin_id: number) {
      this.admin_id = admin_id;
    },
    setPhone(phone: string) {
      this.phone = phone;
    },
    setPendingJoinApply(pending_join_apply: boolean) {
      this.pending_join_apply = pending_join_apply;
    },
    setStatus(status: UserStatus) {
      this.status = status;
    },
  },
  persist: {
    storage: window.sessionStorage,
  },
});
