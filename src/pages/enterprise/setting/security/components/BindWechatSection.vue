<template>
  <security-action-card
    title="绑定微信"
    description="用于微信扫码登录账户"
    :status-text="wechatStatusText"
    :status-tone="wechatStatusTone"
    icon-tone="mint"
    :action-text="wechatActionText"
    @action="handleBindWechat"
  >
    <template #icon>
      <span class="card-icon-symbol">
        <t-icon name="logo-wechat-stroke" />
      </span>
    </template>

    <div v-if="wechatName" class="wechat-name">已绑定：{{ wechatName }}</div>
  </security-action-card>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { useUserStore } from '@/store';

import SecurityActionCard from './SecurityActionCard.vue';

defineOptions({
  name: 'BindWechatSection',
});

const userStore = useUserStore();

const APP_ID = 'wx377743ca48ff6c19';
const REDIRECT_URI = encodeURIComponent('https://enterprise.lingjieyun.com/setting/security');
const SCOPE = 'snsapi_login';
const state = crypto.randomUUID();
const wechatName = computed(() => userStore.userInfo.wechat?.trim() || '');
const isWechatBound = computed(() => !!wechatName.value);
const wechatStatusText = computed(() => (isWechatBound.value ? '已绑定' : '未绑定'));
const wechatStatusTone = computed(() => (isWechatBound.value ? 'success' : 'warning'));
const wechatActionText = computed(() => (isWechatBound.value ? '更换绑定微信' : '去绑定微信'));

const handleBindWechat = () => {
  const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPE}&state=${state}#wechat_redirect`;
  window.open(url, '_blank');
};
</script>
<style lang="less" scoped>
.card-icon-symbol {
  color: #16b368;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-icon-symbol :deep(.t-icon) {
  font-size: 28px;
}

.wechat-name {
  font-size: 12px;
  line-height: 1.6;
  color: #97a6c2;
}

@media (max-width: 1200px) {
  .wechat-name {
    font-size: 11px;
  }
}
</style>
