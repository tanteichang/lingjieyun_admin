<template>
  <security-action-card
    title="绑定邮箱"
    description="用于接收安全提醒、登录通知和后续账户验证信息。"
    :status-text="emailStatusText"
    :status-tone="emailStatusTone"
    icon-tone="lilac"
    :action-text="emailActionText"
    @action="handleGoBindEmail"
  >
    <template #icon>
      <span class="card-icon-symbol">
        <t-icon name="mail" />
      </span>
    </template>

    <div v-if="boundEmail" class="email-value">已绑定：{{ boundEmail }}</div>
  </security-action-card>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { useUserStore } from '@/store';

import SecurityActionCard from './SecurityActionCard.vue';

defineOptions({
  name: 'BindEmailSection',
});

const props = defineProps({
  isBound: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const userStore = useUserStore();

const boundEmail = computed(() => userStore.userInfo.email?.trim() || '');
const isEmailBound = computed(() => props.isBound || !!boundEmail.value);
const emailStatusText = computed(() => (isEmailBound.value ? '已绑定' : '未绑定'));
const emailStatusTone = computed(() => (isEmailBound.value ? 'success' : 'warning'));
const emailActionText = computed(() => (isEmailBound.value ? '修改绑定邮箱' : '去绑定邮箱'));

const handleGoBindEmail = () => {
  router.push({ name: 'SettingSecurityBindEmail' });
};
</script>
<style lang="less" scoped>
.card-icon-symbol {
  color: #6d5dfc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-icon-symbol :deep(.t-icon) {
  font-size: 30px;
}

.email-value {
  font-size: 12px;
  line-height: 1.6;
  color: #97a6c2;
  word-break: break-all;
}
</style>
