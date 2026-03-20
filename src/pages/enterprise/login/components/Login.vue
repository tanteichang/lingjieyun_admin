<template>
  <account-login-form v-if="type === 'password'" @switch-mode="switchType" />
  <qrcode-login-form v-else-if="type === 'qrcode'" @switch-mode="switchType" />
  <phone-login-form v-else-if="type === 'phone'" @switch-mode="switchType" />
  <forgot-password-form v-else-if="type === 'forget-password'" @switch-mode="switchType" />
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import AccountLoginForm from './AccountLoginForm.vue';
import ForgotPasswordForm from './ForgotPasswordForm.vue';
import PhoneLoginForm from './PhoneLoginForm.vue';
import QrcodeLoginForm from './QrcodeLoginForm.vue';
import type { LoginMode } from './types';

defineOptions({
  name: 'LoginForms',
});

const route = useRoute();
const getLoginMode = () => {
  return (route.query.mode as LoginMode) || ('password' as LoginMode);
};

const type = ref<LoginMode>(getLoginMode());

const switchType = (mode: LoginMode) => {
  type.value = mode;
};

watch(
  () => [route.query.code, route.query.mode],
  () => {
    type.value = getLoginMode();
  },
);
</script>
