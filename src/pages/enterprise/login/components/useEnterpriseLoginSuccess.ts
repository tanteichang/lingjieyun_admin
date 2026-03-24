import { MessagePlugin } from 'tdesign-vue-next';
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getAdminDetail } from '@/api/enterprise/admin';
import { getEnterpriseInfo } from '@/api/enterprise/enterprise';
import type { LoginResult } from '@/api/model/enterprise/auth';
import { useUserLoginAndRegister, useUserStore } from '@/store';
import { usePermissionStore } from '@/store/modules/permission';
import { UserStatus } from '@/store/modules/user';
import { emitLoginSuccessEvent } from '@/utils/authEvent';

export function useEnterpriseLoginSuccess() {
  const router = useRouter();
  const route = useRoute();
  const userStore = useUserStore();
  const userLoginAndRegister = useUserLoginAndRegister();
  const permissionStore = usePermissionStore();

  const getStringQuery = (value: unknown) => (typeof value === 'string' ? value : '');

  const loginRedirect = computed(() => {
    const redirect = getStringQuery(route.query.redirect) || getStringQuery(route.query.state);
    return redirect ? decodeURIComponent(redirect) : '/dashboard';
  });

  const handleLoginSuccess = async (loginResult: LoginResult, mobile = '') => {
    const currentMobile = mobile || '';
    userStore.setToken(loginResult.token);

    if (loginResult.need_enterprise_info || loginResult.rejected_join_apply === true) {
      MessagePlugin.info(loginResult.message);
      userLoginAndRegister.setAdminId(loginResult.admin_id ?? -1);
      userLoginAndRegister.setPhone(currentMobile);
      userLoginAndRegister.setStatus(UserStatus.NotDo);
      await router.push({ name: 'enterpriseRegisterEntry' });
      return;
    }

    if (loginResult.enterprise && loginResult.enterprise.audit_status === 0) {
      userLoginAndRegister.setAdminId(loginResult.enterprise.id);
      userLoginAndRegister.setPhone(currentMobile);
      userLoginAndRegister.setStatus(UserStatus.CreatePending);
      await router.push({ name: 'enterpriseRegister' });
      return;
    }
    // 企业审核未通过
    if (loginResult.enterprise && loginResult.enterprise.audit_status === 2) {
      userLoginAndRegister.setAdminId(loginResult.enterprise.id);
      userLoginAndRegister.setPhone(currentMobile);
      userLoginAndRegister.setStatus(UserStatus.CreateRejected);
      await router.push({ name: 'enterpriseRegister' });
      return;
    }

    if (loginResult.agreement && loginResult.agreement.sign_status === 0) {
      // userLoginAndRegister.setAdminId(loginResult.admin_id ?? -1);
      userLoginAndRegister.setPhone(currentMobile);
      userLoginAndRegister.setStatus(UserStatus.CreateSignPending);
      await router.push({ name: 'enterpriseRegister' });
      return;
    }

    if (loginResult.pending_join_apply) {
      // userLoginAndRegister.setAdminId(loginResult.admin_id ?? -1);
      userLoginAndRegister.setPhone(currentMobile);
      userLoginAndRegister.setStatus(UserStatus.JoinPending);
      userLoginAndRegister.setPendingJoinApply(true);
      await router.push({ name: 'enterpriseJoin' });
      return;
    }

    userLoginAndRegister.setStatus(UserStatus.Joined);
    userStore.updateUserInfo({
      enterprise_id: loginResult.enterprise_id,
      enterprise_name: loginResult.enterprise_name,
    });
    userStore.setToken(loginResult.token);
    permissionStore.setAdminType(loginResult.admin_info.admin_type);
    permissionStore.setPermissionCodes(loginResult.permission_paths);
    permissionStore.isRoutesInitialized = false;

    const enterpriseRes = await getEnterpriseInfo();
    if (enterpriseRes.code === 200) {
      userStore.register_admin_mobile_masked = enterpriseRes.data.register_admin_mobile_masked;
      userStore.updateEnterpriseInfo(enterpriseRes.data.enterprise);
      userStore.updateUserInfo({
        phone: enterpriseRes.data.admin.mobile,
        security_level: enterpriseRes.data.admin.security_level,
        security_level_text: enterpriseRes.data.admin.security_level_text,
        has_pay_password: enterpriseRes.data.admin.has_pay_password,
        admin_id: enterpriseRes.data.admin.id,
        admin_type: enterpriseRes.data.admin.admin_type,
      });
    }

    emitLoginSuccessEvent();
    await router.push(loginRedirect.value);
  };

  return {
    handleLoginSuccess,
  };
}
