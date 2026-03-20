<template>
  <t-input v-model="model" size="large" placeholder="请输入图形验证码" @change="handleCaptchaChange">
    <template #prefix-icon>
      <t-icon name="verified" />
    </template>
  </t-input>
  <img class="captcha" :src="captchaImage" alt="验证码" @click="refreshCaptcha" />
</template>
<script lang="ts" setup>
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { captcha, verifyCaptcha } from '@/api/enterprise/auth';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    autoCheck?: boolean;
  }>(),
  {
    modelValue: '',
    autoCheck: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'captcha-length-change': [value: number];
  'verify-captcha-change': [value: boolean];
}>();

const REFRESH_INTERVAL = 1000;

const model = computed({
  get: () => props.modelValue,
  set: (value: string) => {
    emit('update:modelValue', value);
  },
});
const captchaImage = ref('');
const captchaId = ref('');
const lastRefreshAt = ref(0);
const captchaLength = ref(0);

const refreshCaptcha = () => {
  const now = Date.now();
  const remaining = REFRESH_INTERVAL - (now - lastRefreshAt.value);

  if (remaining > 0) {
    MessagePlugin.warning(`请${Math.ceil(remaining / 1000)}秒后再刷新验证码`);
    return false;
  }

  lastRefreshAt.value = now;
  fetchCaptchaImage();
  return true;
};

const fetchCaptchaImage = () => {
  captcha().then((res) => {
    if (res.code === 200) {
      captchaImage.value = res.data.captcha_image;
      captchaId.value = res.data.captcha_id;
      captchaLength.value = res.data.captcha_length;
      emit('captcha-length-change', res.data.captcha_length);
    }
  });
};

const verifyCaptchaCode = (captchaCode?: string) => {
  return new Promise((resolve, reject) => {
    verifyCaptcha({
      captcha_id: captchaId.value,
      captcha_code: captchaCode ?? model.value,
    })
      .then((res) => {
        if (res.code === 200) {
          resolve(true);
        } else {
          reject(res.msg);
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const handleCaptchaChange = (val: string) => {
  if (props.autoCheck && val.length === captchaLength.value) {
    verifyCaptchaCode(val)
      .then((res) => {
        emit('verify-captcha-change', res === true);
      })
      .catch(() => {
        emit('verify-captcha-change', false);
      });
  }
};

defineExpose({
  refreshCaptcha,
  verifyCaptchaCode,
});

onMounted(() => {
  lastRefreshAt.value = Date.now();
  fetchCaptchaImage();
});
</script>
<style scoped>
.captcha {
  cursor: pointer;
  height: 40px;
}
</style>
