<template>
  <t-space>
    <t-card>
      微信绑定
      <t-button type="primary" @click="handleBindWechat">绑定微信</t-button>
      <div id="login_container"></div>
    </t-card>
  </t-space>
</template>
<script setup lang="ts">
import '@/lib/wxLogin';

import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

defineOptions({
  name: 'AccountBindInfo',
});

const route = useRoute();

const handleBindWechat = () => {
  const APP_ID = 'wx377743ca48ff6c19';
  const REDIRECT_URI = encodeURIComponent('https://enterprise.lingjieyun.com/setting/profile?tab=benefits');
  const SCOPE = 'snsapi_login';
  const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&state=STATE#wechat_redirect`;
  window.location.href = url;
};

onMounted(() => {
  const code = (route.query.code as string) || '';
  if (code) {
  }

  new WxLogin({
    self_redirect: false,
    id: 'login_container',
    appid: 'wx377743ca48ff6c19',
    scope: 'snsapi_login',
    redirect_uri: encodeURIComponent('https://enterprise.lingjieyun.com/setting/profile?tab=benefits'),
    style: '',
    fast_login: 0,
    href: '',
    onReady(isReady) {
      console.log('isReady');
      console.log(isReady);
    },
  });
});

const activeTab = ref<'wechat' | 'phone'>('wechat');
</script>
<style scoped lang="less">
:deep(.loginPanel .title) {
  display: none;
}
</style>
