<template>
  <div class="records-wrap">
    <t-table :data="recordList" :columns="recordColumns" row-key="id" :pagination="null" :hover="false">
      <template #amount="{ row }">¥ {{ row.amount }}</template>
      <template #op>
        <t-link theme="primary" hover="color">详情</t-link>
      </template>
    </t-table>
  </div>
</template>

<script setup lang="ts">
import type { PrimaryTableCol } from 'tdesign-vue-next';

import { recordList } from '../mock';
import type { RecordRow } from '../mock';

defineOptions({
  name: 'PaymentUploadSettlementRecords',
});

const recordColumns: PrimaryTableCol<RecordRow>[] = [
  { title: '#', colKey: 'id', width: 60, align: 'center' },
  { title: '结算单号', colKey: 'settleNo', width: 220 },
  { title: '上传时间', colKey: 'uploadTime', width: 180 },
  { title: '人数', colKey: 'totalCount', width: 120 },
  { title: '金额', colKey: 'amount', width: 140 },
  { title: '状态', colKey: 'status', width: 140 },
  { title: '操作', colKey: 'op', width: 100 },
];
</script>

<style lang="less" scoped>
.records-wrap {
  :deep(.t-table th) {
    background: var(--td-bg-color-secondarycontainer);
  }

  :deep(.t-table) {
    margin: 0 12px 16px;
  }
}
</style>
