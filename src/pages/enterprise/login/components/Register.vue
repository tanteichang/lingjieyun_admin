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
    <t-form-item name="name">
      <t-input v-model="formData.name" :maxlength="11" size="large" placeholder="请输入您的企业名称">
        <template #prefix-icon>
          <t-icon name="user" />
        </template>
      </t-input>
    </t-form-item>
    <t-form-item name="credit_code">
      <t-input v-model="formData.credit_code" type="text" size="large" placeholder="请输入您的企业信用代码">
        <template #prefix-icon>
          <t-icon name="mail" />
        </template>
      </t-input>
    </t-form-item>
    <t-form-item name="mobile">
      <t-input v-model="formData.mobile" type="text" size="large" placeholder="请输入您的企业电话">
        <template #prefix-icon>
          <t-icon name="mail" />
        </template>
      </t-input>
    </t-form-item>
    <t-form-item name="address">
      <t-input v-model="formData.address" type="text" size="large" placeholder="请输入您的企业地址">
        <template #prefix-icon>
          <t-icon name="mail" />
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
    <t-form-item name="admin_mobile">
      <t-input v-model="formData.admin_mobile" type="text" size="large" placeholder="请输入您的管理员电话">
        <template #prefix-icon>
          <t-icon name="mail" />
        </template>
      </t-input>
    </t-form-item>
    <t-form-item name="admin_username">
      <t-input v-model="formData.admin_username" type="text" size="large" placeholder="请输入您的管理员用户名">
        <template #prefix-icon>
          <t-icon name="mail" />
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

import { register, sendSmsCode } from '@/api/auth';
import type { RegisterPayload } from '@/api/model/auth';
import { useCounter } from '@/hooks';

const INITIAL_DATA: RegisterPayload = {
  name: '',
  credit_code: '',
  mobile: '',
  address: '',
  business_license: '',
  password: '',
  admin_mobile: '',
  admin_username: '',
  sms_code: '',
};

const FORM_RULES: Record<string, FormRule[]> = {
  name: [{ required: true, message: '企业名称必填', type: 'error' }],
  credit_code: [{ required: true, message: '企业信用代码必填', type: 'error' }],
  mobile: [{ required: true, message: '企业电话必填', type: 'error' }],
  password: [{ required: true, message: '密码必填', type: 'error' }],
  admin_mobile: [{ required: true, message: '管理员电话必填', type: 'error' }],
  sms_code: [{ required: true, message: '验证码必填', type: 'error' }],
};

const type = ref('phone');

const form = ref();
const formData = ref({ ...INITIAL_DATA });

const checked = ref(true);

const showPsw = ref(false);

const [countDown, handleCounter] = useCounter(60);

const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    if (!checked.value) {
      MessagePlugin.error('请同意TDesign服务协议和TDesign 隐私声明');
      return;
    }
    register(formData.value).then((res) => {
      console.log(res);
      if (res.code === 200) {
        MessagePlugin.success(res.msg);
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
  if (!formData.value.admin_mobile) {
    MessagePlugin.error('请输入管理员电话');
    return false;
  }
  return true;
};

const sendVerificationCode = () => {
  sendSmsCode({ mobile: formData.value.admin_mobile, type: 'register' }).then((res) => {
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
