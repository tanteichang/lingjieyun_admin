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
        row-key="id"
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
                >支付金额: <span class="summary-count">{{ summary.paymentAmount }}</span> 元</span
              >
            </div>
          </div>
        </template>
        <template #paymentStatusText="{ record }">
          <t-tag :theme="resultTagTheme[(record as PaymentRecordRow).paymentStatusText]" variant="light">
            {{ (record as PaymentRecordRow).paymentStatusText }}
          </t-tag>
        </template>
        <template #receiveConfirmStatusText="{ record }">
          <t-tag :theme="receiveConfirmTagTheme[(record as PaymentRecordRow).receiveConfirmStatusText]" variant="light">
            {{ (record as PaymentRecordRow).receiveConfirmStatusText }}
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

import { getPaymentList } from '@/api/enterprise/payment';
import type { PaymentListItem } from '@/api/model/enterprise/payment';
import { PaymentStatus } from '@/api/model/enterprise/payment';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

type PayResult = '支付中' | '支付成功' | '支付失败';

interface PaymentRecordQuery {
  page: number;
  limit: number;
  payResult: '' | PayResult;
}

interface PaymentRecordRow {
  id: number;
  name: string;
  payTime: string;
  paymentStatus: PaymentStatus;
  paymentStatusText: PayResult;
  paymentAmount: string;
  orderNo: string;
  statementNo: string;
  paymentChannel: string;
  receiveConfirmStatusText: string;
  createdAt: string;
  remark: string;
  op?: string;
}

defineOptions({
  name: 'PaymentRecord',
});

const defaultQuery: PaymentRecordQuery = {
  page: 1,
  limit: 10,
  payResult: '',
};

const payResultOptions = [
  { label: '支付中', value: '支付中' },
  { label: '支付成功', value: '支付成功' },
  { label: '支付失败', value: '支付失败' },
];

const activeStatus = ref<'全部' | PayResult>('全部');
const currentQuery = reactive<PaymentRecordQuery>({ ...defaultQuery });
const selectedRowKeys = ref<Array<string | number>>([]);
const selectedRows = ref<PaymentRecordRow[]>([]);
const statusCounts = reactive<Record<'all' | PayResult, number>>({
  all: 0,
  支付中: 0,
  支付成功: 0,
  支付失败: 0,
});

const formConfig: FormConfig<PaymentRecordQuery, keyof PaymentRecordQuery> = {
  formItem: [
    {
      label: '账单状态',
      name: 'payResult',
      type: 'select',
      placeholder: '请选择账单状态',
      span: 4,
      props: { options: payResultOptions },
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<PaymentRecordRow, keyof PaymentRecordRow> = {
  tableItem: [
    { title: '姓名', colKey: 'name', width: 90 },
    { title: '支付时间', colKey: 'payTime', width: 150 },
    { title: '支付结果', colKey: 'paymentStatusText', width: 100 },
    { title: '支付金额', colKey: 'paymentAmount', width: 120, align: 'right' },
    { title: '账单编号', colKey: 'statementNo', width: 150 },
    { title: '订单号', colKey: 'orderNo', width: 150 },
    { title: '支付渠道', colKey: 'paymentChannel', width: 120 },
    { title: '收款确认状态', colKey: 'receiveConfirmStatusText', width: 130 },
    { title: '创建时间', colKey: 'createdAt', width: 160 },
    { title: '备注', colKey: 'remark', width: 100 },
    { title: '操作', colKey: 'op', width: 80, fixed: 'right' },
  ],
};

const resultTagTheme: Record<PayResult, 'primary' | 'success' | 'danger'> = {
  支付中: 'primary',
  支付成功: 'success',
  支付失败: 'danger',
};

const receiveConfirmTagTheme: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  待确认: 'warning',
  已确认: 'success',
  有异议: 'danger',
  '-': 'default',
};

const statusTabs = computed(() => {
  return [
    { label: '全部', value: '全部' as const, count: statusCounts.all },
    { label: '支付中', value: '支付中' as const, count: statusCounts.支付中 },
    { label: '支付成功', value: '支付成功' as const, count: statusCounts.支付成功 },
    { label: '支付失败', value: '支付失败' as const, count: statusCounts.支付失败 },
  ];
});

const normalizePaymentStatus = (status: PaymentStatus): PayResult => {
  if (status === PaymentStatus.Paid) return '支付成功';
  if (status === PaymentStatus.Cancelled) return '支付失败';
  return '支付中';
};

const getApiPaymentStatus = (status: '' | PayResult | '全部') => {
  if (status === '支付成功') return PaymentStatus.Paid;
  if (status === '支付失败') return PaymentStatus.Cancelled;
  if (status === '支付中') return PaymentStatus.Paying;
  return undefined;
};

const mapPaymentRow = (item: PaymentListItem): PaymentRecordRow => {
  const paymentStatusText = normalizePaymentStatus(item.payment_status);
  return {
    id: item.id,
    name: item.user_info?.username || '-',
    payTime: item.payment_time || '-',
    paymentStatus: item.payment_status,
    paymentStatusText,
    paymentAmount: item.payment_amount || '0.00',
    orderNo: item.order_no || '-',
    statementNo: item.statement_no || '-',
    paymentChannel: item.payment_channel || '-',
    receiveConfirmStatusText: item.receive_confirm_status_text || '-',
    createdAt: item.created_at || '-',
    remark: item.receive_dispute_remark || '-',
  };
};

const refreshStatusCounts = async () => {
  const [allRes, payingRes, paidRes, cancelledRes] = await Promise.all([
    getPaymentList({ page: 1, limit: 1 }),
    getPaymentList({ page: 1, limit: 1, payment_status: PaymentStatus.Paying }),
    getPaymentList({ page: 1, limit: 1, payment_status: PaymentStatus.Paid }),
    getPaymentList({ page: 1, limit: 1, payment_status: PaymentStatus.Cancelled }),
  ]);

  statusCounts.all = allRes.data?.total || 0;
  statusCounts.支付中 = payingRes.data?.total || 0;
  statusCounts.支付成功 = paidRes.data?.total || 0;
  statusCounts.支付失败 = cancelledRes.data?.total || 0;
};

const tableHook = useCommonTable<PaymentRecordQuery, PaymentRecordRow>({
  fetcher: async (params) => {
    const queryParams: PaymentRecordQuery = {
      payResult: (params.payResult as PaymentRecordQuery['payResult']) || '',
      page: params.page || 1,
      limit: params.limit || 10,
    };
    Object.assign(currentQuery, queryParams);
    const payment_status = getApiPaymentStatus(
      activeStatus.value === '全部' ? queryParams.payResult : activeStatus.value,
    );
    const response = await getPaymentList({
      page: queryParams.page,
      limit: queryParams.limit,
      payment_status,
    });
    await refreshStatusCounts();

    return {
      list: (response.data?.list || []).map(mapPaymentRow),
      total: response.data?.total || 0,
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
  const success = rows.filter((item) => item.paymentStatusText === '支付成功').length;
  const failed = rows.filter((item) => item.paymentStatusText === '支付失败').length;
  const pending = rows.filter((item) => item.paymentStatusText === '支付中').length;
  const paymentAmount = rows.reduce((sum, item) => sum + Number(item.paymentAmount || 0), 0).toFixed(2);

  return {
    total,
    success,
    failed,
    pending,
    paymentAmount,
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
