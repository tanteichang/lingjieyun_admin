<template>
  <div class="page-content">
    <settlement-task-info-card :task-info="taskInfo" />
    <t-card class="content-card" :bordered="false">
      <t-tabs v-model="activeTab" class="settlement-tabs">
        <t-tab-panel value="task" label="任务结算">
          <task-settlement :product-id="productId" />
        </t-tab-panel>
        <t-tab-panel value="records" label="结算记录">
          <settlement-records />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { getSettlementDetail } from '@/api/enterprise/settlement';
import type { SettlementTaskInfo } from '@/api/model/enterprise/settlement';

import SettlementRecords from './components/SettlementRecords.vue';
import SettlementTaskInfoCard from './components/SettlementTaskInfoCard.vue';
import TaskSettlement from './components/TaskSettlement.vue';

defineOptions({
  name: 'SettlementDetailPage',
});

const route = useRoute();
export type Tab = 'task' | 'records';
const activeTab = ref<Tab>((route.query.tab as Tab) || 'task');
const productId = ref(Number(route.query.id) || 0);
const taskInfo = ref<SettlementTaskInfo | null>(null);

const loadTaskInfo = async () => {
  if (!productId.value) {
    taskInfo.value = null;
    return;
  }

  const { data } = await getSettlementDetail({
    product_id: productId.value,
    page: 1,
    limit: 20,
    plan_date: '',
    name: '',
    mobile: '',
  });
  taskInfo.value = data.task_info || null;
};

watch(
  () => route.query.id,
  (value) => {
    productId.value = Number(value) || 0;
    void loadTaskInfo();
  },
  { immediate: true },
);
</script>
<style scoped lang="less">
.content-card {
  margin-top: 12px;
}

.settlement-tabs {
  :deep(.t-tabs__nav) {
    padding: 0 20px;
  }
}
</style>
