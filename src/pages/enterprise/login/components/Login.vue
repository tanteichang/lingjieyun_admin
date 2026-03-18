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
        <t-input v-model="formData.mobile" size="large" placeholder="请输入手机号">
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

      <t-form-item class="verification-code" name="captcha_code">
        <captcha-input
          ref="captchaInputRef"
          v-model="formData.captcha_code"
          size="large"
          placeholder="请输图形入验证码"
        />
      </t-form-item>

      <div class="check-container remember-pwd">
        <t-checkbox v-model="rememberAccount">记住账号</t-checkbox>
        <t-link theme="primary" @click="() => (type = 'forget-password')">忘记密码</t-link>
      </div>
    </template>

    <!-- 扫码登录 -->
    <template v-else-if="type === 'qrcode'">
      <div class="tip-container">
        <span class="tip">请扫描下方二维码登录</span>
        <span class="refresh" @click="refreshWechatLogin">刷新二维码 <t-icon name="refresh" /> </span>
      </div>
      <div id="login_container" class="wechat-login-container"></div>
    </template>

    <!-- 手机号登录 -->
    <template v-else-if="type === 'phone'">
      <t-form-item name="phone">
        <t-input v-model="formData.mobile" size="large" placeholder="请输入手机号">
          <template #prefix-icon>
            <t-icon name="mobile" />
          </template>
        </t-input>
      </t-form-item>

      <t-form-item class="verification-code" name="verifyCode">
        <sms-code-input
          v-model="formData.verifyCode"
          placeholder="请输入验证码"
          send-text="发送验证码"
          :duration="60"
          :send-handler="sendCode"
        />
      </t-form-item>
    </template>

    <t-form-item v-if="type !== 'qrcode' && type !== 'forget-password'" class="btn-container">
      <t-button block size="large" type="submit" :loading="loading"> 登录 </t-button>
    </t-form-item>

    <!-- 忘记密码 -->
    <template v-else-if="type === 'forget-password'">
      <t-form-item name="forgetPassword">
        <t-input v-model="formData.forgetPassword" size="large" placeholder="请输入新密码">
          <template #prefix-icon>
            <t-icon name="user" />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item name="conformPassword">
        <t-input v-model="formData.conformPassword" size="large" placeholder="请确认新密码">
          <template #prefix-icon>
            <t-icon name="user" />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item class="verification-code" name="captcha_code">
        <captcha-input
          ref="captchaInputRef"
          v-model="formData.captcha_code"
          size="large"
          placeholder="请输图形入验证码"
        />
      </t-form-item>
      <t-form-item class="verification-code" name="phone">
        <t-input v-model="formData.mobile" size="large" placeholder="请输入手机号">
          <template #prefix-icon>
            <t-icon name="user" />
          </template>
        </t-input>
      </t-form-item>
      <t-form-item class="verification-code" name="sms_code">
        <sms-code-input
          v-model="formData.sms_code"
          placeholder="请输入验证码"
          :disabled="!captchaValid"
          send-text="发送验证码"
          :duration="60"
          :send-handler="sendCode"
        />
      </t-form-item>

      <t-button block size="large" type="submit" :loading="loading"> 重置密码 </t-button>
    </template>

    <div class="switch-container">
      <span v-if="type !== 'password'" class="tip" @click="switchType('password')">使用账号登录</span>
      <span v-if="type !== 'qrcode'" class="tip" @click="switchType('qrcode')">使用微信扫一扫登录</span>
      <span v-if="type !== 'phone'" class="tip" @click="switchType('phone')">使用手机号登录</span>
    </div>
  </t-form>
</template>
<script setup lang="ts">
import '@/lib/wxLogin';

import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { validator } from '@/utils/validator';
import { getAdminDetail } from '@/api/enterprise/admin';
import { login, loginByWeChat } from '@/api/enterprise/auth';
import { getEnterpriseInfo } from '@/api/enterprise/enterprise';
import type { LoginPayload, LoginResult } from '@/api/model/enterprise/auth';
import CaptchaInput from '@/components/captcha-input/index.vue';
import SmsCodeInput from '@/components/sms-code-input/index.vue';
import { useUserLoginAndRegister, useUserStore } from '@/store';
import { usePermissionStore } from '@/store/modules/permission';
import { UserStatus } from '@/store/modules/user';

const userStore = useUserStore();
const userLoginAndRegister = useUserLoginAndRegister();
const permissionStore = usePermissionStore();

const INITIAL_DATA: LoginPayload & {
  captcha_code: string;
  conformPassword: string;
  sms_code: string;
  forgetPassword: string;
} = {
  mobile: '',
  password: '',
  captcha_code: '',
  sms_code: '',
  conformPassword: '',
  forgetPassword: '',
};

const FORM_RULES: Record<string, FormRule[]> = {
  phone: [{ required: true, message: '请输入手机号', type: 'error' }],
  account: [{ required: true, message: '请输入账号', type: 'error' }],
  password: [
    {
      trigger: 'change',
      required: true,
      message: validator.password.message,
      type: 'error',
      validator: validator.password.validator,
    },
  ],
  forgetPassword: [
    {
      trigger: 'change',
      required: true,
      message: validator.password.message,
      type: 'error',
      validator: validator.password.validator,
    },
  ],
  verifyCode: [{ required: true, message: '请输入验证码', type: 'error' }],
  captcha_code: [{ required: false, message: '请输入图形验证码', type: 'error' }],
  sms_code: [{ required: true, message: '请输入短信验证码', type: 'error' }],
};

const type = ref<'password' | 'qrcode' | 'phone' | 'forget-password'>('password');

const form = ref<FormInstanceFunctions>();
const captchaInputRef = ref<InstanceType<typeof CaptchaInput> | null>(null);
const formData = ref({ ...INITIAL_DATA });
const showPsw = ref(false);
const rememberAccount = ref(false);
const loading = ref(false);
const captchaValid = ref(false);

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

const switchType = (val: 'password' | 'qrcode' | 'phone' | 'forget-password') => {
  type.value = val;
};

const router = useRouter();
const route = useRoute();
let wxLoginInstance: { onCleanup?: () => void } | null = null;

const getStringQuery = (value: unknown) => (typeof value === 'string' ? value : '');

const getLoginRedirect = () => {
  const redirect = getStringQuery(route.query.redirect) || getStringQuery(route.query.state);
  return redirect ? decodeURIComponent(redirect) : '/dashboard';
};

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

  if (loginResult.agreement && loginResult.agreement.sign_status === 0) {
    userLoginAndRegister.setAdminId(loginResult.admin_id ?? -1);
    userLoginAndRegister.setPhone(currentMobile);
    userLoginAndRegister.setStatus(UserStatus.CreateSignPending);
    await router.push({ name: 'enterpriseRegister' });
    return;
  }

  if (loginResult.pending_join_apply) {
    userLoginAndRegister.setAdminId(loginResult.admin_id ?? -1);
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
      permissionStore.isRoutesInitialized = false;
    }
  }

  MessagePlugin.success('登录成功');
  await router.push(getLoginRedirect());
};

const initWechatLogin = async () => {
  if (type.value !== 'qrcode') return;

  await nextTick();

  const container = document.getElementById('login_container');
  if (!container || typeof WxLogin !== 'function') return;

  wxLoginInstance?.onCleanup?.();
  wxLoginInstance = new WxLogin({
    self_redirect: false,
    id: 'login_container',
    appid: 'wx377743ca48ff6c19',
    scope: 'snsapi_login',
    redirect_uri: encodeURI('https://enterprise.lingjieyun.com/loginByWeChat'),
    style: '',
    href: '',
    onReady(isReady) {
      console.log('isReady');
      console.log(isReady);
    },
  });
};

const refreshWechatLogin = async () => {
  await initWechatLogin();
};

const handleWeChatCallback = async () => {
  const code = getStringQuery(route.query.code);
  if (!code) return;

  try {
    loading.value = true;
    type.value = 'qrcode';
    const res = await loginByWeChat({ code });
    if (res.code !== 200) {
      MessagePlugin.error(res.msg || '微信登录失败');
      return;
    }
    await handleLoginSuccess(res.data);
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : String(error));
  } finally {
    loading.value = false;
  }
};

/**
 * 发送验证码
 */
const sendCode = () => {
  return form.value.validate({ fields: ['phone'] }).then((e) => e === true);
};

const onSubmit = async (ctx: SubmitContext) => {
  // if (ctx.validateResult === false) return;
  if (type.value === 'password') {
    const isCaptchaValid = await captchaInputRef.value?.verifyCaptchaCode(formData.value.captcha_code);
    if (!isCaptchaValid) {
      return;
    }
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
        await handleLoginSuccess(res.data, formData.value.mobile);
      }
    } finally {
      loading.value = false;
    }
  } else if (type.value === 'forget-password') {
    console.log(formData.value);
  }
};

watch(
  () => type.value,
  async (value) => {
    if (value === 'qrcode') {
      await initWechatLogin();
      return;
    }
    wxLoginInstance?.onCleanup?.();
    wxLoginInstance = null;
  },
  { flush: 'post' },
);

onMounted(() => {
  if (getStringQuery(route.query.code)) {
    void handleWeChatCallback();
    return;
  }
  if (type.value === 'qrcode') {
    void initWechatLogin();
  }
});

onUnmounted(() => {
  wxLoginInstance?.onCleanup?.();
  wxLoginInstance = null;
});
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
