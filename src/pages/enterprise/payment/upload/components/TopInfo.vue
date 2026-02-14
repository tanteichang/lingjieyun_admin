<template>
  <div class="summary-wrap">
    <div class="balance-card">
      <div class="company">{{ topInfo.company }}</div>
      <div class="balance-title">
        <span class="dot">¥</span>
        <span>当前余额</span>
      </div>
      <div class="balance-amount">¥ {{ topInfo.balance }}</div>
      <div class="balance-foot">
        <div class="foot-item">
          <span class="label">支付渠道:</span>
          <span class="value">{{ topInfo.payChannel }}</span>
        </div>
        <div class="divider" />
        <div class="foot-item">
          <span class="label">账户信息:</span>
          <span class="value">{{ topInfo.accountNo }}</span>
        </div>
      </div>
    </div>

    <div class="task-info">
      <div class="task-name">{{ topInfo.accountName }}</div>
      <div class="task-grid">
        <div v-for="item in topInfo.details" :key="item.label" class="info-item">
          <span class="label">{{ item.label }}</span>
          <span class="value" :class="{ 'status-running': item.status === 'running' }">{{ item.value }}</span>
        </div>
      </div>
      <div class="detail-link">
        <t-button variant="text" theme="primary">查看任务详情</t-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { topInfo } from '../mock';

defineOptions({
  name: 'PaymentUploadTopInfo',
});
</script>
<style lang="less" scoped>
.summary-wrap {
  display: grid;
  grid-template-columns: 540px 1fr;
  gap: 24px;
  padding: 12px;
}

.balance-card {
  border: 1px solid #c9d9f8;
  border-radius: 8px;
  background: #edf3ff;
  padding: 20px;
}

.company {
  font-size: 28px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.balance-title {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--td-brand-color);
  color: #fff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.balance-amount {
  margin-top: 8px;
  color: var(--td-text-color-primary);
  font-size: 40px;
  font-weight: 700;
}

.balance-foot {
  margin-top: 24px;
  border-top: 1px solid #d2def3;
  padding-top: 16px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.foot-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.foot-item .label {
  color: var(--td-text-color-secondary);
}

.foot-item .value {
  color: var(--td-text-color-primary);
}

.divider {
  width: 1px;
  height: 18px;
  background: #d2def3;
}

.task-info {
  padding: 10px 0;
}

.task-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 18px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.info-item .label {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  white-space: nowrap;
}

.info-item .value {
  color: var(--td-text-color-primary);
  font-size: 14px;
}

.status-running {
  color: #ed7b2f !important;
}

.detail-link {
  margin-top: 16px;
  color: var(--td-brand-color);
  text-align: right;
  cursor: pointer;
}

@media (max-width: 1200px) {
  .summary-wrap {
    grid-template-columns: 1fr;
  }

  .balance-amount {
    font-size: 28px;
  }

  .company {
    font-size: 20px;
  }
}
</style>
