<template>
  <t-card class="task-info-card" :bordered="false">
    <div class="task-title-row">
      <div class="task-title">{{ taskInfo?.task_title || '-' }}</div>
      <div class="task-no">任务编号：{{ taskInfo?.task_no || '-' }}</div>
    </div>
    <div class="task-info-grid">
      <div class="info-item">
        <span class="label">任务类型</span>
        <span class="value">{{ taskInfo?.task_type_name || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">结算方式</span>
        <span class="value">{{ taskInfo?.settlement_type_text || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">佣金结算</span>
        <span class="value">{{ commissionText }}</span>
      </div>
      <div class="info-item">
        <span class="label">所属项目</span>
        <span class="value">{{ taskInfo?.project_name || '-' }}</span>
      </div>
      <div class="info-item">
        <span class="label">任务状态</span>
        <span class="value status">{{ taskInfo?.task_status_text || '-' }}</span>
      </div>
    </div>
  </t-card>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import type { SettlementTaskInfo } from '@/api/model/enterprise/settlement';

const props = defineProps<{
  taskInfo: SettlementTaskInfo | null;
}>();

const commissionText = computed(() => {
  if (!props.taskInfo) return '-';
  if (props.taskInfo.commission_settlement_type_text) return props.taskInfo.commission_settlement_type_text;
  if (props.taskInfo.commission) return String(props.taskInfo.commission);
  if (props.taskInfo.commission_min || props.taskInfo.commission_max) {
    return `${props.taskInfo.commission_min}-${props.taskInfo.commission_max}`;
  }
  return '-';
});
</script>
<style scoped lang="less">
.task-info-card {
  :deep(.t-card__body) {
    padding: 20px 24px;
  }
}

.task-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.task-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.task-no {
  color: var(--td-text-color-secondary);
  font-size: 13px;
}

.task-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px 24px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 24px;

  .label {
    color: var(--td-text-color-placeholder);
    font-size: 14px;
  }

  .value {
    color: var(--td-text-color-primary);
    font-size: 14px;
  }

  .status {
    color: #ed7b2f;
    font-weight: 500;
  }
}

@media (max-width: 1200px) {
  .task-info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 768px) {
  .task-title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .task-info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
