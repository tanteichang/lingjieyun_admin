<template>
  <div class="panel">
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
      <template #amount="{ record }">
        <span class="amount">+{{ record.amount }}</span>
      </template>
    </common-table>
  </div>
</template>
<script setup lang="ts">
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

defineOptions({
  name: 'TalentPaymentRecords',
});

interface PaymentQuery {
  time: string;
  project: string;
}

interface PaymentRecord {
  id: string;
  time: string;
  settleName: string;
  taskName: string;
  project: string;
  amount: string;
}

const sourceList: PaymentRecord[] = [
  {
    id: '1',
    time: '2025.12.28 11:48:50',
    settleName: '安卓开发三月份佣金',
    taskName: '安卓开发',
    project: '灵捷云服务平台APP项目',
    amount: '5000',
  },
  {
    id: '2',
    time: '2025.12.28 11:48:50',
    settleName: '安卓开发二月份佣金',
    taskName: '安卓开发',
    project: '灵捷云服务平台APP项目',
    amount: '5000',
  },
  {
    id: '3',
    time: '2025.12.28 11:48:50',
    settleName: '安卓开发一月份佣金',
    taskName: '安卓开发',
    project: '灵捷云服务平台APP项目',
    amount: '5000',
  },
];

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
      span: 6,
    },
    {
      label: '所属项目',
      name: 'project',
      type: 'input',
      placeholder: '请输入所属项目',
      span: 6,
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<PaymentRecord, keyof PaymentRecord> = {
  tableItem: [
    { title: '时间', colKey: 'time', width: 220 },
    { title: '结算单名称', colKey: 'settleName', minWidth: 220 },
    { title: '所属任务', colKey: 'taskName', width: 180 },
    { title: '所属项目', colKey: 'project', minWidth: 240 },
    { title: '金额', colKey: 'amount', width: 120, align: 'right' },
  ],
};

const tableHook = useCommonTable<PaymentQuery, PaymentRecord>({
  fetcher: async (params) => {
    const keyword = params.project?.trim() || '';
    const time = params.time || '';
    const filtered = sourceList.filter((item) => {
      const matchTime = !time || item.time.startsWith(time);
      const matchProject = !keyword || item.project.includes(keyword);
      return matchTime && matchProject;
    });

    return {
      list: filtered,
      total: filtered.length,
    };
  },
  defaultQuery,
  defaultPagination: {
    pageSize: 10,
    pageSizeOptions: [10, 20, 50],
    showJumper: false,
    showPageSize: false,
    totalContent: false,
  },
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

  :deep(.list-common-table .t-pagination) {
    display: none;
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
