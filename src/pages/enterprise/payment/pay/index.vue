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
        row-key="upload_id"
        @search="handleSearch"
        @reset="handleReset"
        @page-change="handlePageChange"
      >
        <template #billStatus="{ record }">
          <t-tag :theme="statusTagTheme[(record as BillListItem).payment_status_text]" variant="light">
            {{ (record as BillListItem).payment_status_text }}
          </t-tag>
        </template>
        <template #op="{ record }">
          <t-space size="small">
            <t-link theme="primary" hover="color" @click="handleOpenDetail(record as BillListItem)">详情</t-link>
            <t-link
              v-if="(record as BillListItem).payment_status === PaymentStatus.Pending"
              theme="primary"
              hover="color"
              @click="handleOpenConfirmDialog(record as BillListItem)"
            >
              确认发放
            </t-link>
            <t-link v-else theme="default" hover="color">导出</t-link>
          </t-space>
        </template>
      </common-table>
    </div>
    <confirm-issue-dialog
      v-model:visible="confirmDialogVisible"
      :record="currentRecord"
      @close-success="handleCloseSuccess"
    />
  </t-card>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getBillList, sendDisburseCode } from '@/api/enterprise/bill';
import type { BillListItem, BillTabCounts } from '@/api/model/enterprise/bill';
import { PaymentStatus } from '@/api/model/enterprise/bill';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';
import { parseDateRange } from '@/utils/date';

import ConfirmIssueDialog from './component/ConfirmIssueDialog.vue';

defineOptions({
  name: 'PaymentPay',
});

type BillTabValue = 'all' | 'pending' | 'paying' | 'success' | 'partial' | 'fail' | 'closed';
interface PaymentPayQuery {
  dateRange: [string, string];
  payment_status: '' | PaymentStatus;
  bill_no: string;
}
type PaymentBillTableRow = BillListItem & {
  billStatus?: string;
  op?: string;
};

const defaultQuery: PaymentPayQuery = {
  dateRange: ['', ''],
  payment_status: '',
  bill_no: '',
};

const statusOptions = [
  { label: '待支付', value: PaymentStatus.Pending },
  { label: '支付中', value: PaymentStatus.Processing },
  { label: '已支付', value: PaymentStatus.Paid },
];

const activeStatus = ref<BillTabValue>('all');
const confirmDialogVisible = ref(false);
const currentRecord = ref<BillListItem | null>(null);
const router = useRouter();
const currentQuery = reactive<PaymentPayQuery>({ ...defaultQuery });
const tabCounts = ref<BillTabCounts>({
  all: 0,
  pending: 0,
  paying: 0,
  success: 0,
  partial: 0,
  fail: 0,
  closed: 0,
});

const formConfig: FormConfig<PaymentPayQuery, keyof PaymentPayQuery> = {
  formItem: [
    {
      label: '日期范围',
      name: 'dateRange',
      type: 'date-range',
      placeholder: '请选择日期范围',
      span: 5,
      props: {
        clearable: true,
        disableDate: (date: Date) => {
          return date.getTime() > Date.now();
        },
      },
    },
    {
      label: '账单状态',
      name: 'payment_status',
      type: 'select',
      placeholder: '请选择账单状态',
      span: 4,
      props: { options: statusOptions },
    },
    { label: '账单编号', name: 'bill_no', type: 'input', placeholder: '请输入账单编号', span: 4 },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<PaymentBillTableRow, keyof PaymentBillTableRow> = {
  tableItem: [
    { title: '账单编号', colKey: 'bill_no', width: 170 },
    { title: '创建时间', colKey: 'created_at', width: 160 },
    { title: '结算单名称', colKey: 'settlement_name', width: 180, ellipsis: true },
    { title: '账单状态', colKey: 'billStatus', width: 100 },
    { title: '所属企业', colKey: 'enterprise_name', width: 140, ellipsis: true },
    { title: '所属项目', colKey: 'project_name', width: 140, ellipsis: true },
    { title: '所属任务', colKey: 'task_name', width: 120, ellipsis: true },
    { title: '开票类型', colKey: 'invoice_type', width: 100 },
    { title: '结算数量', colKey: 'settlement_count', width: 100, align: 'center' },
    { title: '导入金额', colKey: 'import_amount', width: 100, align: 'right' },
    { title: '发放金额', colKey: 'distribution_amount', width: 100, align: 'right' },
    { title: '服务费', colKey: 'service_fee', width: 90, align: 'right' },
    { title: '个税', colKey: 'personal_tax', width: 80, align: 'center' },
    { title: '增值税及附加', colKey: 'vat_and_surcharge', width: 110, align: 'center' },
    { title: '合计费用', colKey: 'total_fee', width: 100, align: 'right' },
    { title: '支付信息', colKey: 'payment_info', width: 100, align: 'center' },

    { title: '支付成功数量', colKey: 'payment_success_count', width: 110, align: 'center' },
    { title: '支付成功金额', colKey: 'payment_success_amount', width: 110, align: 'right' },
    { title: '已支付服务费', colKey: 'paid_service_fee', width: 110, align: 'right' },
    { title: '支付失败数量', colKey: 'payment_fail_count', width: 110, align: 'center' },
    { title: '支付失败金额', colKey: 'payment_fail_amount', width: 110, align: 'right' },
    { title: '操作', colKey: 'op', width: 140, fixed: 'right' },
  ],
};

const statusTagTheme: Record<string, 'warning' | 'primary' | 'success' | 'danger' | 'default'> = {
  待支付: 'warning',
  支付中: 'primary',
  已支付: 'success',
  支付成功: 'success',
  部分成功: 'primary',
  支付失败: 'danger',
  已关闭: 'default',
};

const statusTabs = computed(() => {
  return [
    { label: '全部', value: 'all' as const, count: tabCounts.value.all },
    { label: '待支付', value: 'pending' as const, count: tabCounts.value.pending },
    { label: '支付中', value: 'paying' as const, count: tabCounts.value.paying },
    { label: '支付成功', value: 'success' as const, count: tabCounts.value.success },
    { label: '部分成功', value: 'partial' as const, count: tabCounts.value.partial },
    { label: '支付失败', value: 'fail' as const, count: tabCounts.value.fail },
    { label: '已关闭', value: 'closed' as const, count: tabCounts.value.closed },
  ];
});

const getTabPaymentStatus = (status: BillTabValue): PaymentStatus | undefined => {
  if (status === 'pending') return PaymentStatus.Pending;
  if (status === 'paying') return PaymentStatus.Processing;
  if (status === 'success') return PaymentStatus.Paid;
  return undefined;
};

const parsePaymentStatus = (value: unknown): PaymentStatus | '' => {
  if (value === '' || value == null) return '';
  const status = Number(value);
  if (status === PaymentStatus.Pending || status === PaymentStatus.Processing || status === PaymentStatus.Paid) {
    return status;
  }
  return '';
};

const tableHook = useCommonTable<PaymentPayQuery, PaymentBillTableRow>({
  fetcher: async (params) => {
    const queryParams: PaymentPayQuery = {
      dateRange: (params.dateRange as [string, string]) || ['', ''],
      payment_status: parsePaymentStatus(params.payment_status),
      bill_no: params.bill_no || '',
    };
    Object.assign(currentQuery, queryParams);
    const { start: start_date, end: end_date } = parseDateRange(queryParams.dateRange);
    const tabStatus = getTabPaymentStatus(activeStatus.value);
    const payment_status = tabStatus ?? (queryParams.payment_status === '' ? undefined : queryParams.payment_status);
    const { data } = await getBillList({
      page: params.page || 1,
      limit: params.limit || 10,
      start_date,
      end_date,
      payment_status,
      bill_no: queryParams.bill_no?.trim() || undefined,
    });
    tabCounts.value = data.tab_counts;

    return {
      list: data.list,
      total: data.total,
    };
  },
  defaultQuery: { ...defaultQuery },
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

const handleStatusTabChange = (status: BillTabValue) => {
  activeStatus.value = status;
  search({ ...currentQuery });
};

const handleSearch = (payload: Partial<PaymentPayQuery>) => {
  search(payload);
};

const handleReset = () => {
  activeStatus.value = 'all';
  reset();
};

const handleOpenConfirmDialog = (record: BillListItem) => {
  currentRecord.value = record;
  confirmDialogVisible.value = true;
};

const handleOpenDetail = (record: BillListItem) => {
  router.push({ name: 'PaymentPayDetail', query: { id: record.upload_id } });
};

const handleCloseSuccess = () => {
  MessagePlugin.success('确认发放成功');
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
