<template>
  <div class="payment-upload-page">
    <t-card class="summary-card" :bordered="false">
      <top-info />
    </t-card>

    <t-card class="content-card" :bordered="false">
      <t-tabs v-model="activeTab" class="upload-tabs">
        <t-tab-panel value="settle" label="任务结算">
          <task-settlement />
        </t-tab-panel>
        <t-tab-panel value="records" label="结算记录">
          <settlement-records />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import SettlementRecords from './components/SettlementRecords.vue';
import TaskSettlement from './components/TaskSettlement.vue';
import TopInfo from './components/TopInfo.vue';

defineOptions({
  name: 'PaymentUpload',
});

const activeTab = ref<'settle' | 'records'>('settle');
</script>
<style lang="less" scoped>
.payment-upload-page {
  display: grid;
  gap: 16px;
}

.summary-card,
.content-card {
  :deep(.t-card__body) {
    padding: 0;
  }
}

.upload-tabs {
  :deep(.t-tabs__nav) {
    padding: 0 20px;
  }
}
</style>
