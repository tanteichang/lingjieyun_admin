<template>
  <div v-if="loading" class="loading-container">
    <div class="wechat-login-callback__title">微信登录处理中</div>
    <div class="wechat-login-callback__desc">正在完成扫码登录，请稍候...</div>
  </div>
  <div v-else class="item-container login-qrcode">
    <div class="tip-container">
      <span class="tip">请扫描下方二维码登录</span>
      <span class="refresh" @click="refreshWechatLogin">刷新二维码 <t-icon name="refresh" /> </span>
    </div>
    <div id="login_container" class="wechat-login-container"></div>
    <login-mode-switch current-mode="qrcode" @switch-mode="$emit('switch-mode', $event)" />
  </div>
</template>
<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { loginByWeChat } from '@/api/enterprise/auth';
import { WeChat } from '@/utils/thirdAccount';

import LoginModeSwitch from './LoginModeSwitch.vue';
import type { LoginMode } from './types';
import { useEnterpriseLoginSuccess } from './useEnterpriseLoginSuccess';

defineOptions({
  name: 'QrcodeLoginForm',
});

defineEmits<{
  'switch-mode': [mode: LoginMode];
}>();

const loading = ref(false);
const route = useRoute();
const router = useRouter();
const { handleLoginSuccess } = useEnterpriseLoginSuccess();

let wxLoginInstance: { onCleanup?: () => void } | null = null;

const getStringQuery = (value: unknown) => (typeof value === 'string' ? value : '');

const initWechatLogin = async () => {
  await nextTick();

  const container = document.getElementById('login_container');
  if (!container) return;

  wxLoginInstance?.onCleanup?.();
  wxLoginInstance = await WeChat.getLoginQRCode({
    id: 'login_container',
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
  const state = getStringQuery(route.query.state);
  console.log('code', code);
  console.log('state', state);
  if (!code || !state) return;

  loading.value = true;
  loginByWeChat({ code })
    .then((res) => {
      if (res.code === 1022) {
        // 去绑定账号页面
        router.replace({
          name: 'wechatBindAccount',
          query: {
            key: res.data.key,
            ...(getStringQuery(route.query.redirect) ? { redirect: getStringQuery(route.query.redirect) } : {}),
          },
        });
      } else {
        handleLoginSuccess(res.data);
      }
    })
    .catch((error) => {})
    .finally(() => {
      loading.value = false;
    });
};

watch(
  () => route.query.code,
  (code) => {
    if (typeof code === 'string' && code) {
      void handleWeChatCallback();
    }
  },
  { immediate: true },
);

onMounted(() => {
  if (!getStringQuery(route.query.code)) {
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
