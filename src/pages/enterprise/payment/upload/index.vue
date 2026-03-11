<template>
  <div class="page-content">
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #task_status="{ record }">
        <t-tag
          :theme="TASK_STATUS_TAG[(record as SettlementRow).task_status].theme"
          :variant="TASK_STATUS_TAG[(record as SettlementRow).task_status].variant"
        >
          {{ TASK_STATUS_TAG[(record as SettlementRow).task_status].label || '-' }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link>结算记录</t-link>
          <t-link theme="primary" @click="handlePay(record)">结算</t-link>
        </t-space>
      </template>
    </common-table>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';

import { getSettlementList } from '@/api/enterprise/settlement';
import type { Row } from '@/api/model/common';
import type { Settlement, SettlementListPayload } from '@/api/model/enterprise/settlement';
import { TASK_STATUS_TAG } from '@/api/model/enterprise/taskModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

defineOptions({
  name: 'SettlementListPage',
});

type SettlementRow = Settlement & Row;

const formConfig: FormConfig<SettlementListPayload, keyof SettlementListPayload> = {
  formItem: [{ label: '任务名称', name: 'task_name', type: 'input', span: 8, placeholder: '请输入任务名称' }],
  formData: {
    page: 1,
    limit: 20,
  },
};

const router = useRouter();

const tableConfig: TableConfig<SettlementRow, keyof SettlementRow> = {
  tableItem: [
    { title: '任务编号', colKey: 'task_no', minWidth: 120, align: 'center' },
    { title: '任务名称', colKey: 'task_title', minWidth: 120, align: 'center' },
    { title: '发布时间', colKey: 'publish_time', minWidth: 120, align: 'center' },
    { title: '任务类型', colKey: 'task_type_name', minWidth: 180, align: 'center' },
    { title: '所属项目', colKey: 'project_name', minWidth: 150, align: 'center' },
    { title: '发票类型', colKey: 'invoice_type_name', minWidth: 180, align: 'center' },
    { title: '任务状态', colKey: 'task_status', minWidth: 220, align: 'center' },
    { title: '操作', colKey: 'op', width: 200, align: 'left', fixed: 'right' },
  ],
};

const tableHook = useCommonTable<SettlementListPayload, SettlementRow>({
  fetcher: async (params) => {
    const { data } = await getSettlementList(params);
    return {
      list: data.list || [],
      total: data.total || 0,
    };
  },
  defaultQuery: formConfig.formData as SettlementListPayload,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;

const handleSearch = (payload?: Partial<SettlementListPayload>) => {
  search(payload || {});
};

const handleReset = () => {
  reset();
};
const handlePay = (record: SettlementRow) => {
  router.push({
    name: 'PaymentDate',
    query: {
      id: record.id || '',
    },
  });
};
</script>
<style scoped lang="less">
.page-content {
  padding: 16px;
  background: #fff;
}
</style>
