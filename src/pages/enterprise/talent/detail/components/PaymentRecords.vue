<template>
  <div class="panel">
    <common-table
      row-key="id"
      :data="tableData"
      :loading="loading"
      table-layout="auto"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #amount="{ record }">
        <span class="amount">{{ record.amount }}</span>
      </template>
    </common-table>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from 'vue-router';

import { getPaymentList } from '@/api/enterprise/talentpool';
import type { PaymentListItem, PaymentListPayload } from '@/api/model/enterprise/talentpool';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';
import { parseDateRange } from '@/utils/date';

defineOptions({
  name: 'TalentPaymentRecords',
});
const route = useRoute();
interface PaymentQuery {
  time: string | [string, string];
  project: string;
}

interface PaymentRecord {
  id: number;
  time: string;
  settleName: string;
  taskName: string;
  project: string;
  amount: string;
}

const defaultQuery: PaymentQuery = {
  time: '',
  project: '',
};

const formConfig: FormConfig<PaymentQuery, keyof PaymentQuery> = {
  formItem: [
    {
      label: '时间',
      name: 'time',
      type: 'date-range',
      placeholder: '请选择时间',
      span: 4,
    },
    {
      label: '所属项目',
      name: 'project',
      type: 'input',
      placeholder: '请输入所属项目',
      span: 4,
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<PaymentRecord, keyof PaymentRecord> = {
  tableItem: [
    { title: '时间', colKey: 'time' },
    { title: '结算单名称', colKey: 'settleName' },
    { title: '所属任务', colKey: 'taskName' },
    { title: '所属项目', colKey: 'project' },
    { title: '金额', colKey: 'amount', fixed: 'right' },
  ],
};

const mapPaymentRow = (item: PaymentListItem): PaymentRecord => ({
  id: item.id,
  time: item.payment_time_formatted || item.payment_time || '-',
  settleName: item.settlement_name || item.statement_no || '-',
  taskName: item.task_name || '-',
  project: item.project_name || '-',
  amount: item.amount_text || `+${item.payment_amount || '0.00'}`,
});

const tableHook = useCommonTable<PaymentQuery, PaymentRecord>({
  fetcher: async (params) => {
    const rawId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;
    const talentPoolId = Number(rawId);
    if (!talentPoolId) {
      return { list: [], total: 0 };
    }

    const { start: start_date, end: end_date } = parseDateRange(params.time);
    const queryParams: PaymentListPayload = {
      talent_pool_id: talentPoolId,
      page: params.page || 1,
      limit: params.limit || 10,
      project_name: params.project?.trim() || undefined,
      start_time: start_date,
      end_time: end_date,
    };
    const { data } = await getPaymentList(queryParams);

    return {
      list: (data.list || []).map(mapPaymentRow),
      total: data.total || 0,
    };
  },
  defaultQuery,
  defaultPagination: {
    current: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showJumper: false,
    showPageSize: true,
    totalContent: true,
  },
  autoSearch: true,
  debounceWait: 0,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;

const handleSearch = (payload: Partial<PaymentQuery>) => {
  search(payload);
};

const handleReset = () => {
  reset();
};
</script>
<style lang="less" scoped>
.panel {
  padding: 24px;

  :deep(.list-common-table .project-toolbar) {
    display: none;
  }

  :deep(.list-common-table .table-container) {
    margin-top: 16px;
  }

  :deep(.list-common-table .t-table th) {
    background: var(--td-bg-color-secondarycontainer);
  }

  :deep(.list-common-table .t-table th:first-child),
  :deep(.list-common-table .t-table td:first-child) {
    display: none;
  }

  :deep(.list-common-table .t-form .t-row > .t-col:first-child) {
    flex: 1;
    max-width: none;
  }

  :deep(.list-common-table .t-form .t-row > .t-col:last-child) {
    flex: 0 0 auto;
    max-width: none;
  }
}

.amount {
  color: var(--td-brand-color);
  font-weight: 500;
}
</style>
