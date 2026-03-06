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
    <t-form-item class="verification-code" name="sms_code">
      <t-input v-model="formData.sms_code" size="large" placeholder="请输入验证码" />
      <t-button
        variant="outline"
        :disabled="countDown > 0"
        @click="handleCounter(sendVerificationCode, validateMobile)"
      >
        {{ countDown === 0 ? '发送验证码' : `${countDown}秒后可重发` }}
      </t-button>
    </t-form-item>

    <t-form-item class="check-container" name="checked">
      <t-checkbox v-model="checked">我已阅读并同意 </t-checkbox> <span>TDesign服务协议</span> 和
      <span>TDesign 隐私声明</span>
    </t-form-item>

    <t-form-item>
      <t-button block size="large" type="submit"> 注册 </t-button>
    </t-form-item>

    <div class="switch-container">
      <span class="tip" @click="switchType(type === 'phone' ? 'email' : 'phone')">{{
        type === 'phone' ? '使用邮箱注册' : '使用手机号注册'
      }}</span>
    </div>
  </t-form>
</template>
<script setup lang="ts">
import type { FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { useUserLoginAndRegister } from '@/store/modules/user';

const router = useRouter();
const userLoginAndRegisterStore = useUserLoginAndRegister();

import { register, sendSmsCode } from '@/api/enterprise/auth';
import type { RegisterPayload } from '@/api/model/enterprise/auth';
import { useCounter } from '@/hooks';

interface RegisterFormData extends RegisterPayload {
  confirm_password: string;
}

const INITIAL_DATA: RegisterFormData = {
  mobile: '',
  password: '',
  confirm_password: '',
  sms_code: '',
};

const FORM_RULES: Record<string, FormRule[]> = {
  mobile: [{ required: true, message: '手机号必填', type: 'error' }],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  confirm_password: [{ required: true, message: '请再次输入登录密码', type: 'error' }],
  sms_code: [{ required: true, message: '验证码必填', type: 'error' }],
};

const type = ref('phone');

const form = ref();
const formData = ref({ ...INITIAL_DATA });

const checked = ref(true);

const showPsw = ref(false);
const showConfirmPsw = ref(false);

const [countDown, handleCounter] = useCounter(60);

const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    if (formData.value.password !== formData.value.confirm_password) {
      MessagePlugin.error('两次输入的登录密码不一致');
      return;
    }
    if (!checked.value) {
      MessagePlugin.error('请同意TDesign服务协议和TDesign 隐私声明');
      return;
    }
    const payload: RegisterPayload = {
      mobile: formData.value.mobile,
      password: formData.value.password,
      sms_code: formData.value.sms_code,
    };
    register(payload).then((res) => {
      console.log(res);
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

const switchType = (val: string) => {
  form.value.reset();
  type.value = val;
};

const validateMobile = () => {
  if (!formData.value.mobile) {
    MessagePlugin.error('请输入管理员电话');
    return false;
  }
  return true;
};

const sendVerificationCode = () => {
  sendSmsCode({ mobile: formData.value.mobile, type: 'register' }).then((res) => {
    console.log(res);
    if (res.code === 200) {
      MessagePlugin.success('验证码发送成功');
    } else {
      MessagePlugin.error(res.msg || '验证码发送失败');
    }
  });
};
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
