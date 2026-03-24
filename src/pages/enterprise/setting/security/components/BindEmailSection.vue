<template>
  <security-action-card
    title="绑定邮箱"
    description="用于接收安全提醒、登录通知和后续账户验证信息。"
    status-text="未绑定"
    status-tone="warning"
    icon-tone="lilac"
    action-text="暂未开放"
    :action-disabled="true"
  >
    <template #icon>
      <span class="card-icon-symbol">
        <t-icon name="mail" />
      </span>
    </template>
  </security-action-card>
</template>
<script setup lang="ts">
import SecurityActionCard from './SecurityActionCard.vue';

defineOptions({
  name: 'BindEmailSection',
});
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
</style>
