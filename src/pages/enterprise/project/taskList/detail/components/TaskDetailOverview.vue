<template>
  <div class="task-detail-overview">
    <task-basic-info-card :task-info="taskInfo" />

    <t-collapse v-if="taskInfo" :expand-icon="true" :borderless="true" class="detail-collapse">
      <t-collapse-panel value="0" header="任务描述">
        <div class="desc-text" v-html="taskInfo?.desc || '-'" />
      </t-collapse-panel>
      <t-collapse-panel value="1" header="验收标准">
        <div class="desc-text" v-html="taskInfo?.accept || '-'" />
      </t-collapse-panel>
      <t-collapse-panel value="2" header="交付物要求">
        <div class="desc-text" v-html="taskInfo?.delivery_standard || '-'" />
      </t-collapse-panel>
    </t-collapse>
  </div>
</template>
<script setup lang="ts">
import type { TaskDetailResult } from '@/api/model/enterprise/taskModel';

import TaskBasicInfoCard from './TaskBasicInfoCard.vue';

defineOptions({
  name: 'TaskDetailOverview',
});

withDefaults(
  defineProps<{
    taskInfo: TaskDetailResult | null;
    loading?: boolean;
  }>(),
  {
    loading: false,
  },
);
</script>
<style lang="less" scoped>
.task-detail-overview {
  display: grid;
  gap: 16px;
}

.desc-text {
  margin: 0 0 12px;
  color: #333;
  line-height: 1.6;
}

.detail-collapse {
  border-radius: 6px;
  overflow: hidden;
}
</style>
