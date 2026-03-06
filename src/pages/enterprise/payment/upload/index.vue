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
      <template #op>
        <t-link theme="primary" hover="color">详情</t-link>
      </template>
    </common-table>
  </div>
</template>
<script setup lang="ts">
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
  formItem: [],
  formData: {
    page: 1,
    limit: 20,
  },
};

const tableConfig: TableConfig<SettlementRow, keyof SettlementRow> = {
  tableItem: [
    { title: 'task_no', colKey: 'task_no', width: 80, align: 'center' },
    { title: '任务名称', colKey: 'task_title', minWidth: 120, align: 'center' },
    { title: '所属项目', colKey: 'project_name', minWidth: 150, align: 'center' },
    { title: '所属公司', colKey: 'customer_name', minWidth: 180, align: 'center' },
    { title: '任务状态', colKey: 'task_status', minWidth: 220, align: 'center' },
    { title: '操作', colKey: 'op', width: 100, align: 'left', fixed: 'right' },
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
</script>
<style scoped lang="less">
.page-content {
  padding: 16px;
}
</style>
