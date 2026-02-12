<template>
  <div>
    <div class="actions-row">
      <t-button theme="primary">模板下载</t-button>
      <t-button theme="primary">上传结算单</t-button>
      <t-button variant="outline" theme="primary">导出自由职业者名单</t-button>
    </div>

    <div class="filter-row">
      <div class="filter-item">
        <span class="label">姓名:</span>
        <t-input v-model="query.name" placeholder="请输入合同名称" clearable />
      </div>
      <div class="filter-item">
        <span class="label">手机号:</span>
        <t-input v-model="query.phone" placeholder="请输入合同状态" clearable />
      </div>
      <div class="filter-item">
        <span class="label">交付状态:</span>
        <t-select v-model="query.status" :options="statusOptions" placeholder="请输入合同编号" clearable />
      </div>
      <div class="filter-actions">
        <t-button theme="primary" @click="handleSearch">查询</t-button>
        <t-button variant="base" theme="default" @click="handleReset">重置</t-button>
      </div>
    </div>

    <t-table :data="filteredSettleList" :columns="settleColumns" row-key="id" :pagination="null" :hover="false">
      <template #deliveryStatus="{ row }">
        <t-tag :theme="row.deliveryStatus === '待交付' ? 'warning' : 'success'" variant="light">
          {{ row.deliveryStatus }}
        </t-tag>
      </template>
      <template #op>
        <t-link theme="primary" hover="color">记录</t-link>
      </template>
    </t-table>
  </div>
</template>

<script setup lang="ts">
import type { PrimaryTableCol } from 'tdesign-vue-next';
import { computed, reactive } from 'vue';

import { settleList, statusOptions } from '../mock';
import type { SettleRow } from '../mock';

defineOptions({
  name: 'PaymentUploadTaskSettlement',
});

const settleColumns: PrimaryTableCol<SettleRow>[] = [
  { title: '#', colKey: 'id', width: 60, align: 'center' },
  { title: '姓名', colKey: 'name', width: 120 },
  { title: '手机号', colKey: 'phone', width: 160 },
  { title: '身份证号', colKey: 'idCard', width: 180 },
  { title: '交付状态', colKey: 'deliveryStatus', width: 140 },
  { title: '上次交付时间', colKey: 'submitTime', width: 180 },
  { title: '操作', colKey: 'op', width: 100 },
];

const query = reactive({
  name: '',
  phone: '',
  status: '',
});

const submitQuery = reactive({
  name: '',
  phone: '',
  status: '',
});

const filteredSettleList = computed(() => {
  return settleList.filter((item) => {
    const matchName = !submitQuery.name || item.name.includes(submitQuery.name.trim());
    const matchPhone = !submitQuery.phone || item.phone.includes(submitQuery.phone.trim());
    const matchStatus = !submitQuery.status || item.deliveryStatus === submitQuery.status;
    return matchName && matchPhone && matchStatus;
  });
});

const handleSearch = () => {
  submitQuery.name = query.name;
  submitQuery.phone = query.phone;
  submitQuery.status = query.status;
};

const handleReset = () => {
  query.name = '';
  query.phone = '';
  query.status = '';
  submitQuery.name = '';
  submitQuery.phone = '';
  submitQuery.status = '';
};
</script>

<style lang="less" scoped>
.actions-row {
  padding: 16px 20px;
  display: flex;
  gap: 12px;
}

.filter-row {
  padding: 8px 20px 16px;
  display: grid;
  grid-template-columns: minmax(240px, 1fr) minmax(240px, 1fr) minmax(240px, 1fr) auto;
  gap: 16px;
  align-items: center;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-item .label {
  color: var(--td-text-color-primary);
  white-space: nowrap;
}

.filter-actions {
  display: inline-flex;
  gap: 8px;
  justify-content: flex-end;
}

:deep(.t-table th) {
  background: var(--td-bg-color-secondarycontainer);
}

:deep(.t-table) {
  margin: 0 12px 16px;
}

@media (max-width: 1200px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .filter-actions {
    justify-content: flex-start;
  }
}
</style>
