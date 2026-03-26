<template>
  <t-card :bordered="false" class="task-basic-info-card">
    <div v-if="taskInfo" class="basic-info-section">
      <h3 class="section-title">基本信息</h3>
      <div class="basic-info-grid">
        <div class="info-item">
          <span class="info-label">任务编号：</span>
          <span class="info-value">{{ taskInfo.task_no || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">任务名称：</span>
          <span class="info-value">{{ taskInfo.task_name || taskInfo.name || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">任务状态：</span>
          <span class="info-value">
            <t-tag
              :theme="TASK_STATUS_TAG[taskInfo.task_status]?.theme"
              :color="TASK_STATUS_TAG[taskInfo.task_status]?.color"
              variant="light-outline"
            >
              {{ TASK_STATUS_TAG[taskInfo.task_status]?.label || taskInfo.task_status_text || '--' }}
            </t-tag>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">任务时间：</span>
          <div class="info-value">
            <date-range-display :start-time="taskInfo.start_time" :end-time="taskInfo.end_time" />
          </div>
        </div>
        <div class="info-item">
          <span class="info-label">任务类型：</span>
          <span class="info-value">{{ taskInfo.task_type_name || taskInfo.job_name || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">所属项目：</span>
          <span class="info-value">{{ taskInfo.project_name || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">招募方式：</span>
          <span class="info-value">{{ taskInfo.recruitment_type_text || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">招募人数：</span>
          <span class="info-value">
            <span>需要人数：{{ taskInfo.required_personnel || 0 }}</span>
            <span> 已招募 {{ recruitmentCountText }} </span>
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">佣金结算方式：</span>
          <span class="info-value">{{ commissionSettlementTypeText }}</span>
        </div>
      </div>
    </div>
    <t-empty v-else description="未找到任务信息" />
  </t-card>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import type { TaskDetailResult } from '@/api/model/enterprise/taskModel';
import { RecruitmentType, SETTLEMENT_TYPE_MAP, TASK_STATUS_TAG } from '@/api/model/enterprise/taskModel';
import DateRangeDisplay from '@/components/date-range-display/index.vue';
import { formatAmountDisplay } from '@/utils/amount';

defineOptions({
  name: 'TaskBasicInfoCard',
});

const props = defineProps<{
  taskInfo: TaskDetailResult | null;
}>();

const commissionSettlementTypeText = computed(() => {
  if (!props.taskInfo) {
    return '';
  }

  const settlementTypeText = SETTLEMENT_TYPE_MAP[props.taskInfo.settlement_type] || '--';
  const min = formatAmountDisplay(props.taskInfo.commission_min);
  const max = formatAmountDisplay(props.taskInfo.commission_max);
  const commission = formatAmountDisplay(props.taskInfo.commission);

  if (Number(min) && Number(max)) {
    return `${settlementTypeText} ${min}-${max}元/人`;
  }

  if (commission) {
    return `${settlementTypeText} ${commission}元/人`;
  }

  return settlementTypeText;
});

const recruitmentCountText = computed(() => {
  if (!props.taskInfo) {
    return '';
  }

  if (props.taskInfo.recruitment_type === RecruitmentType.BOTH) {
    return `自由: ${props.taskInfo.recruitment_count.free_recruitment_count} 定向: ${props.taskInfo.recruitment_count.direct_recruitment_count}`;
  }

  if (props.taskInfo.recruitment_type === RecruitmentType.FREE) {
    return `自由: ${props.taskInfo.recruitment_count.free_recruitment_count}`;
  }

  if (props.taskInfo.recruitment_type === RecruitmentType.DIRECTED) {
    return `定向: ${props.taskInfo.recruitment_count.direct_recruitment_count}`;
  }

  return '';
});
</script>
<style lang="less" scoped>
.task-basic-info-card {
  margin-bottom: 0;
}

.basic-info-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #181818;
    margin-bottom: 16px;
    padding-bottom: 8px;
  }

  .basic-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;

    .info-label {
      font-size: 14px;
      color: #666;
      min-width: 100px;
      margin-right: 12px;
    }

    .info-value {
      font-size: 14px;
      color: #181818;
      flex: 1;
      word-break: break-word;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      min-width: 0;
    }
  }
}
</style>
