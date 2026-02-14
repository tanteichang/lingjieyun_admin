<template>
  <t-card class="payment-pay-page" :bordered="false">
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
        @search="handleSearch"
        @reset="handleReset"
        @page-change="handlePageChange"
      >
        <template #billStatus="{ record }">
          <t-tag :theme="statusTagTheme[(record as PaymentBillRow).billStatus]" variant="light">
            {{ (record as PaymentBillRow).billStatus }}
          </t-tag>
        </template>
        <template #op="{ record }">
          <t-space size="small">
            <t-link theme="primary" hover="color">详情</t-link>
            <t-link v-if="(record as PaymentBillRow).billStatus === '待支付'" theme="primary" hover="color">
              确认发放
            </t-link>
            <t-link v-else theme="default" hover="color">导出</t-link>
          </t-space>
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

import type { BillStatus, PaymentBillRow, PaymentPayQuery } from './mock';
import { defaultQuery, enterpriseOptions, fullList, projectOptions, statusOptions, taskOptions } from './mock';

defineOptions({
  name: 'PaymentPay',
});

const activeStatus = ref<'全部' | BillStatus>('全部');

const currentQuery = reactive<PaymentPayQuery>({ ...defaultQuery });

const formConfig: FormConfig<PaymentPayQuery, keyof PaymentPayQuery> = {
  formItem: [
    { label: '时间筛选', name: 'dateRange', type: 'date-range', span: 4 },
    {
      label: '账单状态',
      name: 'status',
      type: 'select',
      placeholder: '请输入合同状态',
      span: 4,
      props: { options: statusOptions },
    },
    {
      label: '所属企业',
      name: 'enterprise',
      type: 'select',
      placeholder: '请输入合同编号',
      span: 4,
      props: { options: enterpriseOptions },
    },
    {
      label: '所属项目',
      name: 'project',
      type: 'select',
      placeholder: '请选择合同类型',
      span: 4,
      props: { options: projectOptions },
    },
    {
      label: '所属任务',
      name: 'task',
      type: 'select',
      placeholder: '请输入合同状态',
      span: 4,
      props: { options: taskOptions },
    },
    { label: '账单编号', name: 'billNo', type: 'input', placeholder: '请输入合同名称', span: 4 },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<PaymentBillRow, keyof PaymentBillRow> = {
  tableItem: [
    { title: '创建时间', colKey: 'createTime', width: 130 },
    { title: '结算单名称', colKey: 'settleName', width: 120 },
    { title: '账单状态', colKey: 'billStatus', width: 100 },
    { title: '所属企业', colKey: 'enterprise', width: 120, ellipsis: true },
    { title: '所属项目', colKey: 'project', width: 120, ellipsis: true },
    { title: '所属任务', colKey: 'task', width: 100 },
    { title: '开票类型', colKey: 'invoiceType', width: 100 },
    { title: '结算数量', colKey: 'settleCount', width: 80, align: 'center' },
    { title: '导入金额', colKey: 'importAmount', width: 100, align: 'right' },
    { title: '发放金额', colKey: 'issueAmount', width: 100, align: 'right' },
    { title: '服务费', colKey: 'serviceFee', width: 90, align: 'right' },
    { title: '补缴服务费', colKey: 'subsidyServiceFee', width: 100, align: 'right' },
    { title: '个税', colKey: 'personalTax', width: 80, align: 'center' },
    { title: '增值税及附加', colKey: 'vatAndAdditional', width: 110, align: 'center' },
    { title: '合计费用', colKey: 'totalCost', width: 100, align: 'right' },
    { title: '支付信息', colKey: 'paymentInfo', width: 90, align: 'center' },
    { title: '账单编号', colKey: 'billNo', width: 100 },
    { title: '支付成功数量', colKey: 'successCount', width: 100, align: 'center' },
    { title: '支付成功金额', colKey: 'successAmount', width: 100, align: 'right' },
    { title: '已支付服务费', colKey: 'paidServiceFee', width: 100, align: 'right' },
    { title: '支付失败数量', colKey: 'failCount', width: 100, align: 'center' },
    { title: '支付失败金额', colKey: 'failAmount', width: 100, align: 'right' },
    { title: '操作', colKey: 'op', width: 120, fixed: 'right' },
  ],
};

const statusTagTheme: Record<BillStatus, 'warning' | 'primary' | 'success' | 'danger' | 'default'> = {
  待支付: 'warning',
  支付中: 'primary',
  支付成功: 'success',
  部分成功: 'primary',
  支付失败: 'danger',
  已关闭: 'default',
};

const statusTabs = computed(() => {
  const count = (status: '全部' | BillStatus) =>
    status === '全部' ? fullList.length : fullList.filter((item) => item.billStatus === status).length;

  return [
    { label: '全部', value: '全部' as const, count: count('全部') },
    { label: '待支付', value: '待支付' as const, count: count('待支付') },
    { label: '支付中', value: '支付中' as const, count: count('支付中') },
    { label: '支付成功', value: '支付成功' as const, count: count('支付成功') },
    { label: '部分成功', value: '部分成功' as const, count: count('部分成功') },
    { label: '支付失败', value: '支付失败' as const, count: count('支付失败') },
    { label: '已关闭', value: '已关闭' as const, count: count('已关闭') },
  ];
});

const filterData = (params: PaymentPayQuery) => {
  return fullList.filter((item) => {
    const matchTab = activeStatus.value === '全部' || item.billStatus === activeStatus.value;
    const matchStatus = !params.status || item.billStatus === params.status;
    const matchEnterprise = !params.enterprise || item.enterprise.includes(params.enterprise);
    const matchProject = !params.project || item.project.includes(params.project);
    const matchTask = !params.task || item.task.includes(params.task);
    const matchBillNo = !params.billNo || item.billNo.includes(params.billNo.trim());
    return matchTab && matchStatus && matchEnterprise && matchProject && matchTask && matchBillNo;
  });
};

const tableHook = useCommonTable<PaymentPayQuery, PaymentBillRow>({
  fetcher: async (params) => {
    const queryParams: PaymentPayQuery = {
      dateRange: (params.dateRange as string) || '',
      status: (params.status as PaymentPayQuery['status']) || '',
      enterprise: params.enterprise || '',
      project: params.project || '',
      task: params.task || '',
      billNo: params.billNo || '',
    };
    Object.assign(currentQuery, queryParams);

    const filtered = filterData(queryParams);
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

const handleStatusTabChange = (status: '全部' | BillStatus) => {
  activeStatus.value = status;
  search({ ...currentQuery });
};

const handleSearch = (payload: Partial<PaymentPayQuery>) => {
  search(payload);
};

const handleReset = () => {
  reset();
};
</script>
<style lang="less" scoped>
.payment-pay-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
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

@media (max-width: 1200px) {
  .status-tab {
    padding: 10px 12px;
    font-size: 13px;
  }
}
</style>
