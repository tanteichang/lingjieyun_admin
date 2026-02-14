<template>
  <t-card class="payment-record-page" :bordered="false">
    <div class="status-tabs">
      <div
        v-for="tab in statusTabs"
        :key="tab.value"
        class="status-tab"
        :class="{ active: activeStatus === tab.value }"
        @click="handleStatusTabChange(tab.value)"
      >
        {{ tab.label }} ({{ tab.count }})
      </div>
    </div>

    <div class="table-main">
      <common-table
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :form-config="formConfig"
        :table-config="tableConfig"
        selection-type="multiple"
        :selected-row-keys="selectedRowKeys"
        @search="handleSearch"
        @reset="handleReset"
        @page-change="handlePageChange"
        @selection-change="handleSelectionChange"
        @update:selected-row-keys="handleSelectedRowKeysChange"
      >
        <template #toolbar>
          <div class="toolbar-wrap">
            <t-button :disabled="selectedRowKeys.length === 0" theme="primary">导出</t-button>
            <div class="summary">
              <span
                >共计 <span class="summary-count">{{ summary.total }}</span> 条记录</span
              >
              <span
                >支付成功: <span class="summary-count">{{ summary.success }}</span> 条</span
              >
              <span
                >支付失败: <span class="summary-count">{{ summary.failed }}</span> 条</span
              >
              <span
                >支付中: <span class="summary-count">{{ summary.pending }}</span> 条</span
              >
              <span
                >发放金额: <span class="summary-count">{{ summary.issueAmount }}</span> 元</span
              >
              <span
                >个税: <span class="summary-count">{{ summary.personalTax }}</span> 元</span
              >
              <span
                >合计金额: <span class="summary-count">{{ summary.totalAmount }}</span> 元</span
              >
            </div>
          </div>
        </template>
        <template #payResult="{ record }">
          <t-tag :theme="resultTagTheme[(record as PaymentRecordRow).payResult]" variant="light">
            {{ (record as PaymentRecordRow).payResult }}
          </t-tag>
        </template>
        <template #op>
          <t-link theme="primary" hover="color">详情</t-link>
        </template>
      </common-table>
    </div>
  </t-card>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

import type { PaymentRecordQuery, PaymentRecordRow, PayResult } from './mock';
import {
  defaultQuery,
  enterpriseOptions,
  fullList,
  nameOptions,
  payResultOptions,
  projectOptions,
  taskOptions,
} from './mock';

defineOptions({
  name: 'PaymentRecord',
});

const activeStatus = ref<'全部' | PayResult>('全部');
const currentQuery = reactive<PaymentRecordQuery>({ ...defaultQuery });
const selectedRowKeys = ref<Array<string | number>>([]);
const selectedRows = ref<PaymentRecordRow[]>([]);
const filteredRows = ref<PaymentRecordRow[]>([...fullList]);

const formConfig: FormConfig<PaymentRecordQuery, keyof PaymentRecordQuery> = {
  formItem: [
    { label: '时间筛选', name: 'dateRange', type: 'date-range', span: 4 },
    {
      label: '账单状态',
      name: 'payResult',
      type: 'select',
      placeholder: '请输入合同状态',
      span: 4,
      props: { options: payResultOptions },
    },
    {
      label: '姓名',
      name: 'name',
      type: 'select',
      placeholder: '请输入合同编号',
      span: 4,
      props: { options: nameOptions },
    },
    {
      label: '所属企业',
      name: 'enterprise',
      type: 'select',
      placeholder: '请选择合同类型',
      span: 4,
      props: { options: enterpriseOptions },
    },
    {
      label: '所属项目',
      name: 'project',
      type: 'select',
      placeholder: '请输入合同状态',
      span: 4,
      props: { options: projectOptions },
    },
    {
      label: '所属任务',
      name: 'task',
      type: 'select',
      placeholder: '请输入合同名称',
      span: 4,
      props: { options: taskOptions },
    },
    { label: '账单编号', name: 'billNo', type: 'input', placeholder: '请选择合同类型', span: 4 },
    { label: '订单号', name: 'orderNo', type: 'input', placeholder: '请输入合同状态', span: 4 },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<PaymentRecordRow, keyof PaymentRecordRow> = {
  tableItem: [
    { title: '姓名', colKey: 'name', width: 90 },
    { title: '支付时间', colKey: 'payTime', width: 150 },
    { title: '支付结果', colKey: 'payResult', width: 100 },
    { title: '导入金额', colKey: 'importAmount', width: 100, align: 'right' },
    { title: '发放金额', colKey: 'issueAmount', width: 100, align: 'right' },
    { title: '手机号', colKey: 'phone', width: 110 },
    { title: '身份证号', colKey: 'idCard', width: 120 },
    { title: '银行卡账号', colKey: 'bankCard', width: 130 },
    { title: '个税', colKey: 'personalTax', width: 90, align: 'right' },
    { title: '所属项目', colKey: 'project', width: 120 },
    { title: '所属任务', colKey: 'task', width: 100 },
    { title: '所属企业', colKey: 'enterprise', width: 160, ellipsis: true },
    { title: '账单编号', colKey: 'billNo', width: 120 },
    { title: '订单号', colKey: 'orderNo', width: 120 },
    { title: '支付渠道', colKey: 'channel', width: 100 },
    { title: '备注', colKey: 'remark', width: 100 },
    { title: '操作', colKey: 'op', width: 80, fixed: 'right' },
  ],
};

const resultTagTheme: Record<PayResult, 'primary' | 'success' | 'danger'> = {
  支付中: 'primary',
  支付成功: 'success',
  支付失败: 'danger',
};

const statusTabs = computed(() => {
  const count = (status: '全部' | PayResult) =>
    status === '全部' ? fullList.length : fullList.filter((item) => item.payResult === status).length;

  return [
    { label: '全部', value: '全部' as const, count: count('全部') },
    { label: '支付中', value: '支付中' as const, count: count('支付中') },
    { label: '支付成功', value: '支付成功' as const, count: count('支付成功') },
    { label: '支付失败', value: '支付失败' as const, count: count('支付失败') },
  ];
});

const filterData = (params: PaymentRecordQuery) => {
  return fullList.filter((item) => {
    const matchTab = activeStatus.value === '全部' || item.payResult === activeStatus.value;
    const matchResult = !params.payResult || item.payResult === params.payResult;
    const matchName = !params.name || item.name.includes(params.name);
    const matchEnterprise = !params.enterprise || item.enterprise.includes(params.enterprise);
    const matchProject = !params.project || item.project.includes(params.project);
    const matchTask = !params.task || item.task.includes(params.task);
    const matchBillNo = !params.billNo || item.billNo.includes(params.billNo.trim());
    const matchOrderNo = !params.orderNo || item.orderNo.includes(params.orderNo.trim());
    return (
      matchTab &&
      matchResult &&
      matchName &&
      matchEnterprise &&
      matchProject &&
      matchTask &&
      matchBillNo &&
      matchOrderNo
    );
  });
};

const tableHook = useCommonTable<PaymentRecordQuery, PaymentRecordRow>({
  fetcher: async (params) => {
    const queryParams: PaymentRecordQuery = {
      dateRange: (params.dateRange as string) || '',
      payResult: (params.payResult as PaymentRecordQuery['payResult']) || '',
      name: params.name || '',
      enterprise: params.enterprise || '',
      project: params.project || '',
      task: params.task || '',
      billNo: params.billNo || '',
      orderNo: params.orderNo || '',
    };
    Object.assign(currentQuery, queryParams);

    const filtered = filterData(queryParams);
    filteredRows.value = filtered;
    const page = params.page || 1;
    const limit = params.limit || 20;
    const start = (page - 1) * limit;

    return {
      list: filtered.slice(start, start + limit),
      total: filtered.length,
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

const summaryRows = computed(() => selectedRows.value);

const summary = computed(() => {
  const rows = summaryRows.value;
  const total = rows.length;
  const success = rows.filter((item) => item.payResult === '支付成功').length;
  const failed = rows.filter((item) => item.payResult === '支付失败').length;
  const pending = rows.filter((item) => item.payResult === '支付中').length;

  const issueAmount = rows.reduce((sum, item) => sum + Number(item.issueAmount), 0).toFixed(2);
  const personalTax = rows.reduce((sum, item) => sum + Number(item.personalTax), 0).toFixed(2);
  const totalAmount = (Number(issueAmount) + Number(personalTax)).toFixed(2);

  return {
    total,
    success,
    failed,
    pending,
    issueAmount,
    personalTax,
    totalAmount,
  };
});

const handleStatusTabChange = (status: '全部' | PayResult) => {
  activeStatus.value = status;
  selectedRowKeys.value = [];
  selectedRows.value = [];
  search({ ...currentQuery });
};

const handleSearch = (payload: Partial<PaymentRecordQuery>) => {
  selectedRowKeys.value = [];
  selectedRows.value = [];
  search(payload);
};

const handleReset = () => {
  selectedRowKeys.value = [];
  selectedRows.value = [];
  reset();
};

const handleSelectionChange = (context: { selectedRowData?: PaymentRecordRow[] }) => {
  selectedRows.value = context.selectedRowData || [];
};

const handleSelectedRowKeysChange = (keys: Array<string | number>) => {
  selectedRowKeys.value = keys;
};
</script>
<style lang="less" scoped>
.payment-record-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }

  :deep(.list-common-table .t-table th) {
    background: var(--td-bg-color-secondarycontainer);
  }

  :deep(.list-common-table .t-table__content) {
    min-height: 420px;
  }
}

.table-main {
  padding-top: 16px;
}

.status-tabs {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid var(--td-component-stroke);
  padding: 0 16px;
  overflow-x: auto;
}

.status-tab {
  padding: 12px 18px;
  font-size: 14px;
  color: var(--td-text-color-primary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
  white-space: nowrap;
}

.status-tab.active {
  color: var(--td-brand-color);
  border-bottom-color: var(--td-brand-color);
  font-weight: 600;
}

.toolbar-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

.summary {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 12px;
  color: var(--td-text-color-secondary);
  background: #f2f3ff;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
}
.summary-count {
  color: var(--td-brand-color);
  font-weight: 600;
}

:deep(.list-common-table .project-toolbar) {
  margin: 10px 0 8px;
  padding: 0 4px;
}

@media (max-width: 1200px) {
  .status-tab {
    padding: 10px 12px;
    font-size: 13px;
  }

  .toolbar-wrap {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
