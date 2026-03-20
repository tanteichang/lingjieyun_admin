<template>
  <div class="wechat-bind-page">
    <login-header />

    <main class="wechat-bind-page__main">
      <section class="wechat-bind-card">
        <div class="wechat-bind-card__intro">
          <div class="wechat-bind-card__icon-group">
            <span class="wechat-bind-card__icon wechat-bind-card__icon--wechat">
              <t-icon name="logo-wechat-stroke" />
            </span>
            <span class="wechat-bind-card__connector">
              <t-icon name="link" />
            </span>
            <span class="wechat-bind-card__icon wechat-bind-card__icon--account">
              <t-icon name="user" />
            </span>
          </div>

          <h1 class="wechat-bind-card__title">欢迎来到灵捷云</h1>
          <p class="wechat-bind-card__desc">微信已扫码授权成功，但当前微信尚未绑定企业账号。</p>
          <p class="wechat-bind-card__desc">请输入已注册手机号，通过密码或短信验证码完成绑定。</p>
          <!-- <div class="wechat-bind-card__notice">当前仅支持绑定已注册的企业管理员账号。</div> -->
        </div>

        <div class="wechat-bind-card__panel">
          <div class="wechat-bind-card__tabs">
            <button
              class="wechat-bind-card__tab"
              :class="{ 'wechat-bind-card__tab--active': activeTab === 'password' }"
              type="button"
              @click="activeTab = 'password'"
            >
              密码绑定
            </button>
            <button
              class="wechat-bind-card__tab"
              :class="{ 'wechat-bind-card__tab--active': activeTab === 'sms' }"
              type="button"
              @click="activeTab = 'sms'"
            >
              短信绑定
            </button>
          </div>

          <t-form
            v-if="activeTab === 'password'"
            class="wechat-bind-form"
            :data="passwordFormData"
            :rules="passwordFormRules"
            label-width="0"
            @submit="handlePasswordSubmit"
          >
            <div class="wechat-bind-form__field-label">手机号</div>
            <t-form-item name="mobile">
              <t-input v-model="passwordFormData.mobile" size="large" placeholder="请输入已注册手机号">
                <template #prefix-icon>
                  <t-icon name="mobile" />
                </template>
              </t-input>
            </t-form-item>

            <div class="wechat-bind-form__field-head">
              <span>登录密码</span>
              <t-link theme="primary" hover="color" @click="handleForgotPassword">忘记密码?</t-link>
            </div>
            <t-form-item name="password">
              <t-input
                v-model="passwordFormData.password"
                size="large"
                :type="showPassword ? 'text' : 'password'"
                clearable
                placeholder="请输入登录密码"
              >
                <template #prefix-icon>
                  <t-icon name="lock-on" />
                </template>
                <template #suffix-icon>
                  <t-icon :name="showPassword ? 'browse' : 'browse-off'" @click="showPassword = !showPassword" />
                </template>
              </t-input>
            </t-form-item>

            <div class="wechat-bind-form__field-label">图形验证码</div>
            <t-form-item class="wechat-bind-form__captcha" name="captcha_code">
              <captcha-input
                ref="passwordCaptchaInputRef"
                v-model="passwordFormData.captcha_code"
                placeholder="请输入图形验证码"
              />
            </t-form-item>

            <div class="wechat-bind-form__actions">
              <t-button class="wechat-bind-form__register" size="large" variant="outline" @click="handleRegister">
                立即注册
              </t-button>
              <t-button class="wechat-bind-form__submit" size="large" theme="primary" type="submit" :loading="loading">
                授权并登录
              </t-button>
            </div>
          </t-form>

          <t-form
            v-else
            ref="smsFormRef"
            class="wechat-bind-form"
            :data="smsFormData"
            :rules="smsFormRules"
            label-width="0"
            @submit="handleSmsSubmit"
          >
            <div class="wechat-bind-form__field-label">手机号</div>
            <t-form-item name="mobile">
              <t-input v-model="smsFormData.mobile" size="large" placeholder="请输入已注册手机号">
                <template #prefix-icon>
                  <t-icon name="mobile" />
                </template>
              </t-input>
            </t-form-item>

            <div class="wechat-bind-form__field-label">图形验证码</div>
            <t-form-item class="wechat-bind-form__captcha" name="captcha_code">
              <captcha-input
                ref="smsCaptchaInputRef"
                v-model="smsFormData.captcha_code"
                placeholder="请输入图形验证码"
              />
            </t-form-item>

            <div class="wechat-bind-form__field-label">短信验证码</div>
            <t-form-item class="wechat-bind-form__captcha" name="sms_code">
              <sms-code-input
                v-model="smsFormData.sms_code"
                placeholder="请输入短信验证码"
                send-text="发送验证码"
                :duration="60"
                :send-handler="handleSendSmsCode"
              />
            </t-form-item>

            <div class="wechat-bind-form__actions">
              <t-button class="wechat-bind-form__register" size="large" variant="outline" @click="handleRegister">
                立即注册
              </t-button>
              <t-button class="wechat-bind-form__submit" size="large" theme="primary" type="submit">
                验证码绑定
              </t-button>
            </div>
          </t-form>

          <div class="wechat-bind-form__agreement">
            <t-checkbox v-model="agreed">我已阅读并同意</t-checkbox>
            <t-link theme="primary" href="/agreement.html" target="_blank">《用户服务协议》</t-link>
            <span>与</span>
            <t-link theme="primary" href="/privacy.html" target="_blank">《隐私政策》</t-link>
          </div>

          <div class="wechat-bind-form__back">
            <t-link theme="primary" hover="color" @click="handleBackToLogin">返回扫码登录</t-link>
          </div>
        </div>
      </section>
    </main>

    <div class="wechat-bind-page__footer">
      <l-footer />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { bindWeChat, login } from '@/api/enterprise/auth';
import type { LoginPayload } from '@/api/model/enterprise/auth';
import CaptchaInput from '@/components/captcha-input/index.vue';
import SmsCodeInput from '@/components/sms-code-input/index.vue';
import LFooter from '@/layouts/components/Footer.vue';
import LoginHeader from '@/pages/enterprise/login/components/Header.vue';
import { useEnterpriseLoginSuccess } from '@/pages/enterprise/login/components/useEnterpriseLoginSuccess';
import { usePermissionStore, useUserLoginAndRegister, useUserStore } from '@/store';
import { validator } from '@/utils/validator';

import type { LoginMode } from '../components/types';

defineOptions({
  name: 'WechatBindPage',
});

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const userLoginAndRegisterStore = useUserLoginAndRegister();
const permissionStore = usePermissionStore();
const { handleLoginSuccess } = useEnterpriseLoginSuccess();

const activeTab = ref<'password' | 'sms'>('password');
const showPassword = ref(false);
const loading = ref(false);
const agreed = ref(true);
const smsFormRef = ref<FormInstanceFunctions>();
const passwordCaptchaInputRef = ref<InstanceType<typeof CaptchaInput> | null>(null);
const smsCaptchaInputRef = ref<InstanceType<typeof CaptchaInput> | null>(null);
const passwordFormData = ref<LoginPayload & { captcha_code: string }>({
  mobile: '',
  password: '',
  captcha_code: '',
});
const smsFormData = ref<{
  mobile: string;
  captcha_code: string;
  sms_code: string;
}>({
  mobile: '',
  captcha_code: '',
  sms_code: '',
});

const redirect = computed(() => (typeof route.query.redirect === 'string' ? route.query.redirect : ''));
const key = computed(() => (typeof route.query.key === 'string' ? route.query.key : ''));

const passwordFormRules: Record<string, FormRule[]> = {
  mobile: [
    { required: true, message: '请输入手机号', type: 'error' },
    {
      trigger: 'change',
      message: validator.mobile.message,
      type: 'error',
      validator: validator.mobile.validator,
    },
  ],
  password: [{ required: true, message: '请输入登录密码', type: 'error' }],
  captcha_code: [{ required: true, message: '请输入图形验证码', type: 'error' }],
};
const smsFormRules: Record<string, FormRule[]> = {
  mobile: passwordFormRules.mobile,
  captcha_code: [{ required: true, message: '请输入图形验证码', type: 'error' }],
  sms_code: [{ required: true, message: '请输入短信验证码', type: 'error' }],
};

const buildLoginQuery = ({ type, mode }: { type?: string; mode?: LoginMode }) => ({
  ...(type ? { type } : {}),
  ...(mode ? { mode } : {}),
  ...(redirect.value ? { redirect: redirect.value } : {}),
});

const handleForgotPassword = () => {
  void router.push({
    name: 'login',
    query: {
      ...buildLoginQuery({ type: 'login', mode: 'forget-password' }),
    },
  });
};

const handleRegister = () => {
  void router.push({
    name: 'login',
    query: buildLoginQuery({ type: 'login' }),
  });
};

const handleBackToLogin = () => {
  void router.push({
    name: 'login',
    query: buildLoginQuery({ type: 'login', mode: 'qrcode' }),
  });
};

const resetLoginState = async () => {
  await userStore.logout();
  userLoginAndRegisterStore.logout();
  await permissionStore.restoreRoutes();
};

const getErrorMessage = (error: unknown) => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;

  const responseMessage = (error as { response?: { data?: { msg?: string } } })?.response?.data?.msg;
  return typeof responseMessage === 'string' ? responseMessage : '账号绑定失败';
};

const ensureWechatAuth = async () => {
  if (key.value) return true;

  MessagePlugin.error('微信授权信息不存在或已过期，请重新扫码登录');
  await router.replace({
    name: 'login',
    query: buildLoginQuery({ type: 'login', mode: 'qrcode' }),
  });
  return false;
};

const validateAgreement = () => {
  if (agreed.value) return true;

  MessagePlugin.error('请先阅读并同意用户服务协议与隐私政策');
  return false;
};

const handlePasswordSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;
  if (!validateAgreement()) return;
  if (!(await ensureWechatAuth())) return;

  try {
    loading.value = true;
    const isCaptchaValid = await passwordCaptchaInputRef.value?.verifyCaptchaCode(passwordFormData.value.captcha_code);
    if (!isCaptchaValid) return;

    const loginRes = await login({
      mobile: passwordFormData.value.mobile,
      password: passwordFormData.value.password,
    });
    userStore.setToken(loginRes.data.token);

    const res = await bindWeChat({
      key: key.value,
    });
    if (res.code !== 200) {
      throw new Error(res.msg || '微信绑定失败');
    } else {
      MessagePlugin.success('微信绑定成功');
      await handleLoginSuccess(loginRes.data, passwordFormData.value.mobile);
    }
  } catch (error) {
    await resetLoginState();
    passwordCaptchaInputRef.value?.refreshCaptcha();
    MessagePlugin.error(getErrorMessage(error));
  } finally {
    loading.value = false;
  }
};

const handleSendSmsCode = async () => {
  const validateResult = await smsFormRef.value?.validate?.({ fields: ['mobile', 'captcha_code'] });
  if (validateResult !== true) return false;

  const isCaptchaValid = await smsCaptchaInputRef.value
    ?.verifyCaptchaCode(smsFormData.value.captcha_code)
    .catch(() => false);
  if (!isCaptchaValid) {
    smsCaptchaInputRef.value?.refreshCaptcha();
    return false;
  }
  MessagePlugin.info('短信验证码发送接口暂未接入');
  return false;
};

const handleSmsSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;
  if (!validateAgreement()) return;
  if (!(await ensureWechatAuth())) return;

  MessagePlugin.info('短信绑定接口暂未接入');
};

onMounted(() => {
  if (key.value) return;
  void ensureWechatAuth();
});
</script>
<style lang="less" scoped>
.light {
  .wechat-bind-page {
    background:
      radial-gradient(circle at 20% 20%, rgb(255 255 255 / 92%), rgb(255 255 255 / 70%) 35%, transparent 65%),
      linear-gradient(135deg, #f5f8ff 0%, #eef4ff 40%, #dfeaff 100%);
  }
}

.dark {
  .wechat-bind-page {
    background:
      radial-gradient(circle at 20% 20%, rgb(23 31 51 / 88%), rgb(16 23 39 / 76%) 35%, transparent 65%),
      linear-gradient(135deg, #0f1729 0%, #152037 40%, #1f3254 100%);
  }
}

.wechat-bind-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.wechat-bind-page__main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 88px;
}

.wechat-bind-card {
  width: min(1120px, 100%);
  min-height: 620px;
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  border-radius: 32px;
  overflow: hidden;
  background: rgb(255 255 255 / 84%);
  box-shadow: 0 28px 80px rgb(76 110 168 / 18%);
  backdrop-filter: blur(26px);
}

.wechat-bind-card__intro {
  padding: 72px 56px;
  background:
    linear-gradient(180deg, rgb(246 250 255 / 96%), rgb(237 244 255 / 88%)),
    linear-gradient(135deg, #eef4ff 0%, #e6f0ff 100%);
  border-right: 1px solid rgb(105 145 219 / 10%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.wechat-bind-card__icon-group {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 36px;
}

.wechat-bind-card__icon {
  width: 88px;
  height: 88px;
  border-radius: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 92%);
  box-shadow: 0 14px 30px rgb(84 116 178 / 12%);

  :deep(.t-icon) {
    font-size: 44px;
  }
}

.wechat-bind-card__icon--wechat {
  color: #16b368;
}

.wechat-bind-card__icon--account {
  color: #2f6fed;
}

.wechat-bind-card__connector {
  color: #7ba7f6;

  :deep(.t-icon) {
    font-size: 28px;
  }
}

.wechat-bind-card__title {
  margin: 0 0 18px;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 700;
  color: #20293a;
}

.wechat-bind-card__desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.8;
  color: #5f6f86;
}

.wechat-bind-card__notice {
  margin-top: 28px;
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 12px;
  color: #2f6fed;
  background: rgb(47 111 237 / 8%);
}

.wechat-bind-card__panel {
  padding: 56px 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.wechat-bind-card__tabs {
  display: flex;
  align-items: center;
  gap: 36px;
  padding-bottom: 18px;
  margin-bottom: 40px;
  border-bottom: 1px solid rgb(219 228 242);
}

.wechat-bind-card__tab {
  position: relative;
  padding-bottom: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #98a6ba;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: color 0.2s ease;
}

.wechat-bind-card__tab--active {
  color: #2f6fed;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -19px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, #2f6fed 0%, #69a4ff 100%);
  }
}

.wechat-bind-form {
  :deep(.t-form__item) {
    margin-bottom: 24px;
  }

  :deep(.t-input) {
    height: 52px;
    border-radius: 20px;
  }

  :deep(.t-input__wrap) {
    border-radius: 20px;
  }

  :deep(.t-button) {
    border-radius: 20px;
    height: 52px;
    font-size: 16px;
    font-weight: 600;
  }
}

.wechat-bind-form__field-label,
.wechat-bind-form__field-head {
  margin-bottom: 14px;
  font-size: 12px;
  font-weight: 600;
  color: #5b6880;
}

.wechat-bind-form__captcha {
  :deep(.t-form__controls) {
    width: 100%;

    button {
      flex-shrink: 0;
      margin-left: 16px;
      width: 128px;
    }
  }
}

.wechat-bind-form__field-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.wechat-bind-form__actions {
  display: grid;
  grid-template-columns: 172px 1fr;
  gap: 20px;
  margin-top: 10px;
}

.wechat-bind-form__register {
  background: rgb(255 255 255 / 72%);
}

.wechat-bind-form__submit {
  background: linear-gradient(90deg, #2f6fed 0%, #69a4ff 100%);
  border-color: transparent;
  box-shadow: 0 14px 28px rgb(70 126 219 / 22%);
}

.wechat-bind-form__agreement {
  margin-top: 28px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #7c889c;
}

.wechat-bind-form__back {
  margin-top: 18px;
}

.wechat-bind-page__footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 16px;
  text-align: center;
}

@media (max-width: 1024px) {
  .wechat-bind-page__main {
    padding: 24px 16px 80px;
  }

  .wechat-bind-card {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .wechat-bind-card__intro,
  .wechat-bind-card__panel {
    padding: 40px 28px;
  }

  .wechat-bind-card__title {
    font-size: 24px;
  }
}

@media (max-width: 640px) {
  .wechat-bind-card {
    border-radius: 24px;
  }

  .wechat-bind-card__tabs {
    gap: 18px;
  }

  .wechat-bind-card__tab {
    font-size: 15px;
  }

  .wechat-bind-form__actions {
    grid-template-columns: 1fr;
  }

  .wechat-bind-card__icon {
    width: 72px;
    height: 72px;

    :deep(.t-icon) {
      font-size: 36px;
    }
  }

  .wechat-bind-card__desc {
    font-size: 12px;
  }
}
</style>
