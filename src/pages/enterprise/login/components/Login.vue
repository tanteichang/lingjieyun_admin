<template>
  <t-form
    ref="form"
    class="item-container"
    :class="[`login-${type}`]"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <template v-if="type === 'password'">
      <t-form-item name="mobile">
        <t-input v-model="formData.mobile" size="large" :placeholder="t('pages.login.input.phone')">
          <template #prefix-icon>
            <t-icon name="mobile" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item name="password">
        <t-input
          v-model="formData.password"
          size="large"
          :type="showPsw ? 'text' : 'password'"
          clearable
          placeholder="请输入登录密码"
        >
          <template #prefix-icon>
            <t-icon name="lock-on" />
          </template>
          <template #suffix-icon>
            <t-icon :name="showPsw ? 'browse' : 'browse-off'" @click="showPsw = !showPsw" />
          </template>
        </t-input>
      </t-form-item>

      <div class="check-container remember-pwd">
        <t-checkbox v-model="rememberAccount">记住账号</t-checkbox>
        <span class="tip">忘记密码</span>
      </div>
    </template>

    <!-- 扫码登录 -->
    <template v-else-if="type === 'qrcode'">
      <div class="tip-container">
        <span class="tip">{{ t('pages.login.wechatLogin') }}</span>
        <span class="refresh">{{ t('pages.login.refresh') }} <t-icon name="refresh" /> </span>
      </div>
      <qrcode-vue value="" :size="160" level="H" />
    </template>

    <!-- 手机号登录 -->
    <template v-else>
      <t-form-item name="phone">
        <t-input v-model="formData.phone" size="large" :placeholder="t('pages.login.input.phone')">
          <template #prefix-icon>
            <t-icon name="mobile" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item class="verification-code" name="verifyCode">
        <t-input v-model="formData.verifyCode" size="large" :placeholder="t('pages.login.input.verification')" />
        <t-button size="large" variant="outline" :disabled="countDown > 0" @click="sendCode">
          {{ countDown === 0 ? t('pages.login.sendVerification') : `${countDown}秒后可重发` }}
        </t-button>
      </t-form-item>
    </template>

    <t-form-item v-if="type !== 'qrcode'" class="btn-container">
      <t-button block size="large" type="submit" :loading="loading"> 登录 </t-button>
    </t-form-item>

    <div class="switch-container">
      <span v-if="type !== 'password'" class="tip" @click="switchType('password')">{{
        t('pages.login.accountLogin')
      }}</span>
      <span v-if="type !== 'qrcode'" class="tip" @click="switchType('qrcode')">{{ t('pages.login.wechatLogin') }}</span>
      <span v-if="type !== 'phone'" class="tip" @click="switchType('phone')">{{ t('pages.login.phoneLogin') }}</span>
    </div>
  </t-form>
</template>
<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getAdminDetail } from '@/api/enterprise/admin';
import { login } from '@/api/enterprise/auth';
import { getEnterpriseInfo } from '@/api/enterprise/enterprise';
import type { LoginPayload } from '@/api/model/enterprise/auth';
import { useCounter } from '@/hooks';
import { t } from '@/locales';
import { useUserLoginAndRegister, useUserStore } from '@/store';
import { usePermissionStore } from '@/store/modules/permission';
import { UserStatus } from '@/store/modules/user';

const userStore = useUserStore();
const userLoginAndRegister = useUserLoginAndRegister();
const permissionStore = usePermissionStore();

const INITIAL_DATA: LoginPayload = {
  mobile: '',
  password: '',
};

const FORM_RULES: Record<string, FormRule[]> = {
  phone: [{ required: true, message: t('pages.login.required.phone'), type: 'error' }],
  account: [{ required: true, message: t('pages.login.required.account'), type: 'error' }],
  password: [{ required: true, message: t('pages.login.required.password'), type: 'error' }],
  verifyCode: [{ required: true, message: t('pages.login.required.verification'), type: 'error' }],
};

const type = ref('password');

const form = ref<FormInstanceFunctions>();
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);
const rememberAccount = ref(false);
const loading = ref(false);

// 初始化时从本地存储读取记住的账号
const initRememberAccount = () => {
  const savedAccount = localStorage.getItem('rememberedAccount');
  if (savedAccount) {
    formData.value.mobile = savedAccount;
    rememberAccount.value = true;
  }
};

// 初始化
initRememberAccount();

const [countDown, handleCounter] = useCounter();

const switchType = (val: string) => {
  type.value = val;
};

const router = useRouter();
const route = useRoute();

/**
 * 发送验证码
 */
const sendCode = () => {
  form.value.validate({ fields: ['phone'] }).then((e) => {
    if (e === true) {
      handleCounter();
    }
  });
};

const onSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    try {
      loading.value = true;
      const res = await login(formData.value);
      if (res.code === 200) {
        // 处理记住账号
        if (rememberAccount.value) {
          localStorage.setItem('rememberedAccount', formData.value.mobile);
        } else {
          localStorage.removeItem('rememberedAccount');
        }

        if (res.data.need_enterprise_info) {
          // 注册账号，需要新建或加入企业
          userLoginAndRegister.setAdminId(res.data.admin_id);
          userLoginAndRegister.setPhone(formData.value.mobile);
          userLoginAndRegister.setStatus(UserStatus.NotDo);
          router.push({ name: 'enterpriseRegisterEntry' });
          return;
        } else if (res.data.enterprise && res.data.enterprise.audit_status === 0) {
          // 申请了新建企业，企业审核中
          userLoginAndRegister.setAdminId(res.data.enterprise.id);
          userLoginAndRegister.setPhone(formData.value.mobile);
          userLoginAndRegister.setStatus(UserStatus.CreatePending);
          router.push({ name: 'enterpriseRegister' });
          return;
        } else if (res.data.agreement && res.data.agreement.sign_status === 0) {
          // 申请了新建企业, 审核通过待签约
          userLoginAndRegister.setAdminId(res.data.admin_id);
          userLoginAndRegister.setPhone(formData.value.mobile);
          userLoginAndRegister.setStatus(UserStatus.CreateSignPending);
          userStore.setToken(res.data.token);
          router.push({ name: 'enterpriseRegister' });
          return;
        } else if (res.data.pending_join_apply) {
          // 申请了加入企业，企业审核中
          userLoginAndRegister.setAdminId(res.data.admin_id);
          userLoginAndRegister.setPhone(formData.value.mobile);
          userLoginAndRegister.setStatus(UserStatus.JoinPending);
          userLoginAndRegister.setPendingJoinApply(true);
          router.push({ name: 'enterpriseJoin' });
          return;
        }
        userStore.updateUserInfo({
          enterprise_id: res.data.enterprise_id,
          enterprise_name: res.data.enterprise_name,
        });

        userStore.setToken(res.data.token);
        const enterpriseRes = await getEnterpriseInfo();
        if (enterpriseRes.code === 200) {
          userStore.register_admin_mobile_masked = enterpriseRes.data.register_admin_mobile_masked;
          userStore.updateEnterpriseInfo(enterpriseRes.data.enterprise);
          userStore.updateUserInfo({
            phone: enterpriseRes.data.admin.mobile,
            security_level: enterpriseRes.data.admin.security_level,
            security_level_text: enterpriseRes.data.admin.security_level_text,
            has_pay_password: enterpriseRes.data.admin.has_pay_password,
          });

          const adminDetailRes = await getAdminDetail({ admin_id: enterpriseRes.data.admin.id });
          if (adminDetailRes.code === 200) {
            userStore.updateUserInfo({
              admin_id: enterpriseRes.data.admin.id,
              admin_type: adminDetailRes.data.admin_type,
            });
            permissionStore.setPermissionCodes(adminDetailRes.data.rules || []);
            permissionStore.setAdminType(adminDetailRes.data.admin_type);
            // 权限更新后重新初始化菜单，避免首次登录菜单未按权限过滤
            permissionStore.isRoutesInitialized = false;
          }
        }

        MessagePlugin.success('登录成功');
        const redirect = route.query.redirect as string;
        const redirectUrl = redirect ? decodeURIComponent(redirect) : '/dashboard';
        await router.push(redirectUrl);
      } else {
        MessagePlugin.error(res.msg || '登录失败');
      }
    } catch (e) {
      MessagePlugin.error(e);
    } finally {
      loading.value = false;
    }
  }
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
