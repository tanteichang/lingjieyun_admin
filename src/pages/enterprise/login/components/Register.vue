<template>
  <t-form
    ref="form"
    class="item-container"
    :class="[`register-${type}`]"
    :data="formData"
    :rules="FORM_RULES"
    label-width="0"
    @submit="onSubmit"
  >
    <t-form-item name="mobile">
      <t-input v-model="formData.mobile" type="text" size="large" placeholder="请输入您的手机号">
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
    <t-form-item name="confirm_password">
      <t-input
        v-model="formData.confirm_password"
        size="large"
        :type="showConfirmPsw ? 'text' : 'password'"
        clearable
        placeholder="请再次输入登录密码"
      >
        <template #prefix-icon>
          <t-icon name="lock-on" />
        </template>
        <template #suffix-icon>
          <t-icon :name="showConfirmPsw ? 'browse' : 'browse-off'" @click="showConfirmPsw = !showConfirmPsw" />
        </template>
      </t-input>
    </t-form-item>
    <t-form-item name="captcha_code">
      <captcha-input
        ref="captchaInputRef"
        v-model="formData.captcha_code"
        :auto-check="true"
        @verify-captcha-change="handleCaptchaVerifyChange"
      />
    </t-form-item>
    <t-form-item class="verification-code" name="sms_code">
      <sms-code-input
        v-model="formData.sms_code"
        placeholder="请输入短信验证码"
        send-text="发送验证码"
        :duration="60"
        :disabled="!captchaValid"
        :send-handler="sendVerificationCode"
      />
    </t-form-item>

    <t-form-item class="check-container" name="checked">
      <t-checkbox v-model="checked">我已阅读并同意 </t-checkbox>
      <t-link theme="primary" href="/agreement.html" target="_blank"> 服务协议 </t-link>
      和
      <t-link theme="primary" href="/privacy.html" target="_blank"> 隐私声明 </t-link>
    </t-form-item>

    <t-form-item>
      <t-button block size="large" type="submit"> 注册 </t-button>
    </t-form-item>
  </t-form>
</template>
<script setup lang="ts">
import type { FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { validator } from '@/utils/validator';
import CaptchaInput from '@/components/captcha-input/index.vue';
import SmsCodeInput from '@/components/sms-code-input/index.vue';
import { useUserLoginAndRegister } from '@/store/modules/user';

const router = useRouter();
const userLoginAndRegisterStore = useUserLoginAndRegister();

import { register, sendSmsCode } from '@/api/enterprise/auth';
import type { RegisterPayload } from '@/api/model/enterprise/auth';

interface RegisterFormData extends RegisterPayload {
  confirm_password: string;
}

const INITIAL_DATA: RegisterFormData & { captcha_code: string } = {
  mobile: '',
  password: '',
  confirm_password: '',
  sms_code: '',
  captcha_code: '',
};

const type = ref('phone');
const captchaValid = ref(false);
const form = ref();
const formData = ref({ ...INITIAL_DATA });

const checked = ref(true);
const captchaInputRef = ref<InstanceType<typeof CaptchaInput> | null>(null);
const showPsw = ref(false);
const showConfirmPsw = ref(false);

const validateConfirmPassword = (val: string) => val === formData.value.password;

const FORM_RULES: Record<string, FormRule[]> = {
  mobile: [
    { required: true, message: '手机号必填', type: 'error' },
    {
      message: validator.mobile.message,
      type: 'error',
      trigger: 'change',
      validator: validator.mobile.validator,
    },
  ],
  password: [
    { required: true, message: '密码必填', type: 'error' },
    {
      message: validator.password.message,
      type: 'error',
      trigger: 'change',
      validator: validator.password.validator,
    },
  ],
  confirm_password: [
    { required: true, message: '请再次输入登录密码', type: 'error', trigger: 'change' },
    {
      message: '两次输入的登录密码不一致',
      type: 'error',
      trigger: 'change',
      validator: validateConfirmPassword,
    },
  ],
  sms_code: [{ required: true, message: '短信验证码必填', type: 'error' }],
  captcha_code: [{ required: true, message: '图形验证码必填', type: 'error' }],
};

watch([() => formData.value.password, () => formData.value.confirm_password], ([, confirmPassword]) => {
  if (!confirmPassword) return;
  form.value?.validate?.({ fields: ['confirm_password'] });
});

const onSubmit = async (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    if (!checked.value) {
      MessagePlugin.error('请同意服务协议和隐私声明');
      return;
    }
    const payload: RegisterPayload = {
      mobile: formData.value.mobile,
      password: formData.value.password,
      sms_code: formData.value.sms_code,
    };
    register(payload).then((res) => {
      if (res.code === 200) {
        MessagePlugin.success(res.msg);
        userLoginAndRegisterStore.setAdminId(res.data.admin_id);
        userLoginAndRegisterStore.setPhone(res.data.mobile);
        router.push({ name: 'enterpriseRegisterEntry' });
      } else {
        MessagePlugin.error(res.msg || '注册失败');
      }
    });
  }
};

const validateMobile = () => {
  if (!formData.value.mobile) {
    MessagePlugin.error('请输入管理员电话');
    return false;
  }
  if (!validator.mobile.validator(formData.value.mobile)) {
    MessagePlugin.error('请输入正确的手机号');
    return false;
  }
  return true;
};

const handleCaptchaVerifyChange = (value: boolean) => {
  captchaValid.value = value;
};

const sendVerificationCode = async () => {
  if (!validateMobile()) {
    return false;
  }

  const res = await sendSmsCode({ mobile: formData.value.mobile, type: 'register' });
  if (res.code === 200) {
    MessagePlugin.success('验证码发送成功');
    return true;
  }

  MessagePlugin.error(res.msg || '验证码发送失败');
  return false;
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
