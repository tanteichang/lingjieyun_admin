<template>
  <div class="wechat-login-callback">
    <div class="wechat-login-callback__title">微信登录处理中</div>
    <div class="wechat-login-callback__desc">正在完成扫码登录，请稍候...</div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

onMounted(() => {
  const code = typeof route.query.code === 'string' ? route.query.code : '';
  const state = typeof route.query.state === 'string' ? route.query.state : '';
  const target = new URL(`${window.location.origin}/login`);

  if (code) {
    target.searchParams.set('code', code);
  }
  if (state) {
    target.searchParams.set('state', state);
    target.searchParams.set('redirect', state);
  }

  if (!code) {
    if (window.top && window.top !== window) {
      window.top.location.replace(target.toString());
      return;
    }
    void router.replace({ name: 'login' });
    return;
  }

  if (window.top && window.top !== window) {
    window.top.location.replace(target.toString());
    return;
  }

  void router.replace({
    name: 'login',
    query: {
      code,
      ...(state ? { state, redirect: state } : {}),
    },
  });
});
</script>

<style lang="less" scoped>
.wechat-login-callback {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
}

.wechat-login-callback__title {
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.wechat-login-callback__desc {
  font-size: 14px;
  color: #6b7280;
}
</style>
