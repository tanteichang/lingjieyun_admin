<template>
  <t-form
    ref="form"
    class="item-container login-phone"
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

    <t-form-item class="verification-code" name="verifyCode">
      <sms-code-input
        v-model="formData.verifyCode"
        placeholder="请输入验证码"
        send-text="发送验证码"
        :duration="60"
        :send-handler="handleSendCode"
      />
    </t-form-item>

    <t-form-item class="btn-container">
      <t-button block size="large" type="submit"> 登录 </t-button>
    </t-form-item>

    <login-mode-switch current-mode="phone" @switch-mode="$emit('switch-mode', $event)" />
  </t-form>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';

import { sendSmsCode } from '@/api/enterprise/auth';
import SmsCodeInput from '@/components/sms-code-input/index.vue';
import { validator } from '@/utils/validator';

import LoginModeSwitch from './LoginModeSwitch.vue';
import type { LoginMode } from './types';

defineOptions({
  name: 'PhoneLoginForm',
});

defineEmits<{
  'switch-mode': [mode: LoginMode];
}>();

const form = ref<FormInstanceFunctions>();
const formData = ref({
  mobile: '',
  verifyCode: '',
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
  verifyCode: [{ required: true, message: '请输入验证码', type: 'error' }],
};

const handleSendCode = async () => {
  const validateResult = await form.value?.validate({ fields: ['mobile'] });
  if (validateResult !== true) return false;

  sendSmsCode({ mobile: formData.value.mobile, type: 'login' }).then((res) => {
    if (res.code === 200) {
      MessagePlugin.success(`短信验证码已发送至${formData.value.mobile}`);
    }
  });
  return false;
};

const handleSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;

  MessagePlugin.info('手机号登录暂未开放');
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
