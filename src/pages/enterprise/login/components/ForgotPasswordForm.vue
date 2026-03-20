<template>
  <t-form
    ref="form"
    class="item-container login-forget-password"
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

    <t-form-item class="verification-code" name="captcha_code">
      <captcha-input ref="captchaInputRef" v-model="formData.captcha_code" />
    </t-form-item>
    <t-form-item class="verification-code" name="sms_code">
      <sms-code-input
        v-model="formData.sms_code"
        placeholder="请输入验证码"
        send-text="发送验证码"
        :duration="60"
        :send-handler="handleSendCode"
      />
    </t-form-item>

    <t-form-item name="newPassword">
      <t-input v-model="formData.newPassword" size="large" placeholder="请输入新密码">
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item name="confirmPassword">
      <t-input v-model="formData.confirmPassword" size="large" placeholder="请确认新密码">
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
      </t-input>
    </t-form-item>

    <t-form-item class="btn-container">
      <t-button block size="large" type="submit" :loading="loading"> 重置密码 </t-button>
    </t-form-item>

    <login-mode-switch current-mode="forget-password" @switch-mode="$emit('switch-mode', $event)" />
  </t-form>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';

import { forgetPassword, sendSmsCode } from '@/api/enterprise/auth';
import CaptchaInput from '@/components/captcha-input/index.vue';
import SmsCodeInput from '@/components/sms-code-input/index.vue';
import { validator } from '@/utils/validator';

import LoginModeSwitch from './LoginModeSwitch.vue';
import type { LoginMode } from './types';

defineOptions({
  name: 'ForgotPasswordForm',
});

const emit = defineEmits<{
  'switch-mode': [mode: LoginMode];
}>();

const form = ref<FormInstanceFunctions>();
const captchaInputRef = ref<InstanceType<typeof CaptchaInput> | null>(null);
const loading = ref(false);
const formData = ref({
  newPassword: '',
  confirmPassword: '',
  captcha_code: '',
  mobile: '',
  sms_code: '',
});

const validateConfirmPassword = (val: string) => val === formData.value.newPassword;

const formRules: Record<string, FormRule[]> = {
  newPassword: [
    { required: true, message: '请输入新密码', type: 'error' },
    {
      trigger: 'change',
      message: validator.password.message,
      type: 'error',
      validator: validator.password.validator,
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', type: 'error' },
    {
      trigger: 'change',
      message: '两次输入的密码不一致',
      type: 'error',
      validator: validateConfirmPassword,
    },
  ],
  captcha_code: [{ required: true, message: '请输入图形验证码', type: 'error' }],
  mobile: [
    { required: true, message: '请输入手机号', type: 'error' },
    {
      trigger: 'change',
      message: validator.mobile.message,
      type: 'error',
      validator: validator.mobile.validator,
    },
  ],
  sms_code: [{ required: true, message: '请输入短信验证码', type: 'error' }],
};

const handleSendCode = async () => {
  const validateResult = await form.value?.validate({ fields: ['mobile', 'captcha_code'] });
  if (validateResult !== true) return false;

  const captchaValid = await captchaInputRef.value?.verifyCaptchaCode();

  if (!captchaValid) {
    MessagePlugin.error('图形验证码错误');
    return false;
  }

  const res = await sendSmsCode({ mobile: formData.value.mobile, type: 'forget_password' });
  if (res.code !== 200) {
    MessagePlugin.error(res.msg || '验证码发送失败');
    return false;
  }

  MessagePlugin.success('验证码发送成功');
  return true;
};

const handleSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;

  try {
    loading.value = true;
    const res = await forgetPassword({
      mobile: formData.value.mobile,
      sms_code: formData.value.sms_code,
      new_password: formData.value.newPassword,
      confirm_password: formData.value.confirmPassword,
    });
    if (res.code !== 200) {
      MessagePlugin.error(res.msg || '重置密码失败');
      return;
    }

    MessagePlugin.success('密码重置成功');
    emit('switch-mode', 'password');
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : String(error));
  } finally {
    loading.value = false;
  }
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
