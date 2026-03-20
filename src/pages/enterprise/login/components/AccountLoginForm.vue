<template>
  <t-form
    ref="form"
    class="item-container login-password"
    :data="formData"
    :rules="formRules"
    label-width="0"
    @submit="handleSubmit"
  >
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

    <t-form-item class="verification-code" name="captcha_code">
      <captcha-input ref="captchaInputRef" v-model="formData.captcha_code" placeholder="请输入图形验证码" />
    </t-form-item>

    <div class="check-container remember-pwd">
      <t-checkbox v-model="rememberAccount">记住账号</t-checkbox>
      <t-link theme="primary" @click="$emit('switch-mode', 'forget-password')">忘记密码</t-link>
    </div>

    <t-form-item class="btn-container">
      <t-button block size="large" type="submit" :loading="loading"> 登录 </t-button>
    </t-form-item>

    <login-mode-switch current-mode="password" @switch-mode="$emit('switch-mode', $event)" />
  </t-form>
</template>
<script setup lang="ts">
import type { FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';

import { login } from '@/api/enterprise/auth';
import type { LoginPayload } from '@/api/model/enterprise/auth';
import CaptchaInput from '@/components/captcha-input/index.vue';
import { validator } from '@/utils/validator';

import LoginModeSwitch from './LoginModeSwitch.vue';
import type { LoginMode } from './types';
import { useEnterpriseLoginSuccess } from './useEnterpriseLoginSuccess';

defineOptions({
  name: 'AccountLoginForm',
});

defineEmits<{
  'switch-mode': [mode: LoginMode];
}>();

const { handleLoginSuccess } = useEnterpriseLoginSuccess();

const captchaInputRef = ref<InstanceType<typeof CaptchaInput> | null>(null);
const showPassword = ref(false);
const rememberAccount = ref(false);
const loading = ref(false);
const formData = ref<LoginPayload & { captcha_code: string }>({
  mobile: '',
  password: '',
  captcha_code: '',
});

const formRules: Record<string, FormRule[]> = {
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

const initRememberAccount = () => {
  const savedAccount = localStorage.getItem('rememberedAccount');
  if (savedAccount) {
    formData.value.mobile = savedAccount;
    rememberAccount.value = true;
  }
};

initRememberAccount();

const handleSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;
  captchaInputRef.value
    ?.verifyCaptchaCode(formData.value.captcha_code)
    .then(async () => {
      try {
        loading.value = true;
        const res = await login(formData.value);

        if (res.code !== 200) {
          captchaInputRef.value?.refreshCaptcha();
          return;
        }

        if (rememberAccount.value) {
          localStorage.setItem('rememberedAccount', formData.value.mobile);
        } else {
          localStorage.removeItem('rememberedAccount');
        }

        await handleLoginSuccess(res.data, formData.value.mobile);
      } catch (error) {
        console.log(error);
        MessagePlugin.error(error instanceof Error ? error.message : String(error));
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {
      captchaInputRef.value?.refreshCaptcha();
    });
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
