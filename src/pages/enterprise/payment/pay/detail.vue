<template>
  <div class="payment-pay-detail">
    <div class="detail-main">
      <section class="hero-card">
        <div class="hero-header">
          <div class="hero-title-group">
            <t-icon name="chevron-left" size="24" @click="handleBack" />
            <div>
              <h1 class="hero-title">账单支付详情</h1>
              <p class="hero-subtitle">批次号：{{ detailData?.batch_no }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="content-main">
        <div v-if="showAlertBanner" class="alert-banner">
          <div class="alert-main">
            <div class="alert-icon">
              <error-circle-filled-icon />
            </div>
            <div>
              <div class="alert-title">{{ detail.statusTitle }}</div>
              <div class="alert-desc">{{ detail.statusDesc }}</div>
            </div>
          </div>
          <div class="hero-actions">
            <t-button variant="outline" theme="default" @click="handleDownloadBill">
              <template #icon><download-icon /></template>
              下载结算单模版
            </t-button>
            <t-button theme="primary" @click="handleReupload">
              <template #icon><refresh-icon /></template>
              重新上传结算单
            </t-button>
          </div>
        </div>

        <div class="overview-grid">
          <div class="metric-card">
            <div class="metric-label">合计支付总额</div>
            <div class="metric-value">¥{{ detailData?.total_payment_amount }}</div>
          </div>
          <div class="metric-card">
            <div class="metric-head">
              <span class="metric-label">支付进度</span>
              <span class="metric-pill">{{ detail.progress }}%</span>
            </div>
            <t-progress
              theme="line"
              :percentage="detail.progress"
              :show-label="false"
              track-color="#ebeff5"
              :color="{ from: '#2f6ce5', to: '#4b84ff' }"
              :stroke-width="8"
            />
            <div class="progress-meta">
              <span class="success">成功 {{ detailData?.payment_success_count }} 笔</span>
              <span class="fail">失败 {{ detailData?.payment_fail_count }} 笔</span>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-label">实发人数 / 总人数</div>
            <div class="metric-value">{{ detailData?.payment_success_count }} / {{ detailData?.settlement_count }}</div>
            <div class="metric-tip">包含待处理记录</div>
          </div>
        </div>

        <div class="table-shell">
          <div class="table-toolbar">
            <div class="status-tabs">
              <div
                v-for="tab in tabs"
                :key="tab.value"
                class="status-tab"
                :class="{ active: activeTab === tab.value }"
                @click="handleTabChange(tab.value)"
              >
                {{ tab.label }}
              </div>
            </div>
          </div>

          <common-table
            :data="tableData"
            :loading="loading"
            :pagination="pagination"
            :form-config="formConfig"
            :table-config="tableConfig"
            :auto-search="false"
            @page-change="handlePageChange"
          >
            <template #payment_status="{ record }">
              <t-tag
                :theme="getPaymentStatusTag((record as BillDetailPaymentItem).payment_status).theme"
                :variant="getPaymentStatusTag((record as BillDetailPaymentItem).payment_status).variant"
                :color="getPaymentStatusTag((record as BillDetailPaymentItem).payment_status).color"
              >
                {{ getPaymentStatusLabel((record as BillDetailPaymentItem).payment_status) }}
              </t-tag>
            </template>
            <template #operation="{ record }">
              <t-link theme="primary" hover="color" @click="handleDownloadVoucher(record as BillDetailPaymentItem)">
                下载凭证
              </t-link>
            </template>
          </common-table>
        </div>
      </section>

      <payment-detail-side-panel
        :detail-data="detailData"
        :summary="{
          channel: detail.channel,
          totalAmount: detail.totalAmount,
          finishTime: detail.finishTime,
        }"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { DownloadIcon, ErrorCircleFilledIcon, RefreshIcon } from 'tdesign-icons-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getBillDetail } from '@/api/enterprise/bill';
import type { BillDetailData, BillDetailPaymentItem, PaymentStatus } from '@/api/model/enterprise/bill';
import { PaymentStatusMap, PaymentStatusTag } from '@/api/model/enterprise/bill';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

import PaymentDetailSidePanel from './component/PaymentDetailSidePanel.vue';

defineOptions({
  name: 'PaymentPayDetail',
});

type RecordTab = 'all' | 'success' | 'fail';

interface DetailViewModel {
  billNo: string;
  statusTitle: string;
  statusDesc: string;
  totalAmount: string;
  progress: number;
  successCount: number;
  failCount: number;
  paidUsers: number;
  totalUsers: number;
  channel: string;
  serviceRate: string;
  issueAmount: string;
  serviceFee: string;
  personalTax: string;
  finishTime: string;
  task: string;
  project: string;
  enterprise: string;
}

const route = useRoute();
const router = useRouter();
const detailData = ref<BillDetailData | null>(null);

const tabs = [
  { label: '全部记录', value: 'all' as const },
  { label: '支付成功', value: 'success' as const },
  { label: '支付失败', value: 'fail' as const },
];

const activeTab = ref<RecordTab>('all');

const formConfig: FormConfig<Record<string, never>, never> = {
  formItem: [],
  formData: {},
};

const tableConfig: TableConfig<BillDetailPaymentItem, keyof BillDetailPaymentItem> = {
  tableItem: [
    { title: '收款人', colKey: 'recipient_name', minWidth: 80 },
    { title: '导入金额', colKey: 'import_amount', minWidth: 160, align: 'center' },
    { title: '发放金额', colKey: 'distribution_amount', minWidth: 160, align: 'center' },
    { title: '个税', colKey: 'personal_tax', width: 160, align: 'center' },
    { title: '服务费', colKey: 'service_fee', width: 160, align: 'center' },
    { title: '支付状态', colKey: 'payment_status', width: 160, align: 'center' },
    { title: '操作', colKey: 'operation', width: 130, align: 'right', fixed: 'right' },
  ],
};

const formatPercent = (value: string | undefined) => {
  if (!value) return '-';
  return value.includes('%') ? value : `${value}%`;
};

const getPaymentStatusTag = (status: PaymentStatus) => PaymentStatusTag[status];

const getPaymentStatusLabel = (status: PaymentStatus) => PaymentStatusMap[status];

const getRowStatusType = (statusText: string, statusValue: unknown): 'success' | 'fail' | 'processing' => {
  if (statusText.includes('成功')) return 'success';
  if (statusText.includes('失败')) return 'fail';
  if (typeof statusValue === 'number') {
    if (statusValue === 2) return 'success';
    if (statusValue === 3 || statusValue === 4 || statusValue === 5) return 'fail';
  }
  return 'processing';
};

const sourceList = computed<BillDetailPaymentItem[]>(() => {
  return detailData.value?.payment_list || [];
});

const getFilteredList = () => {
  return sourceList.value.filter((item) => {
    const matchTab =
      activeTab.value === 'all' ||
      (activeTab.value === 'success' &&
        getRowStatusType(item.payment_status_text, item.payment_status) === 'success') ||
      (activeTab.value === 'fail' && getRowStatusType(item.payment_status_text, item.payment_status) === 'fail');
    return matchTab;
  });
};

const tableHook = useCommonTable<Record<string, never>, BillDetailPaymentItem>({
  fetcher: async (params) => {
    const filtered = getFilteredList();
    const current = params.page || 1;
    const pageSize = params.limit || 5;
    const start = (current - 1) * pageSize;
    return {
      list: filtered.slice(start, start + pageSize),
      total: filtered.length,
    };
  },
  defaultQuery: {},
  defaultPagination: {
    current: 1,
    pageSize: 5,
    pageSizeOptions: [5, 10, 20],
    showJumper: false,
    showPageSize: false,
    totalContent: false,
  },
  autoSearch: true,
  debounceWait: 0,
});

const { data: tableData, loading, pagination, search, handlePageChange } = tableHook;

const detail = computed<DetailViewModel>(() => {
  const data = detailData.value;
  if (!data) {
    return {
      billNo: '-',
      statusTitle: '支付处理中',
      statusDesc: '正在获取账单详情',
      totalAmount: '0.00',
      progress: 0,
      successCount: 0,
      failCount: 0,
      paidUsers: 0,
      totalUsers: 0,
      channel: '-',
      serviceRate: '-',
      issueAmount: '¥ 0.00',
      serviceFee: '¥ 0.00',
      personalTax: '¥ 0.00',
      finishTime: '-',
      task: '-',
      project: '-',
      enterprise: '-',
    };
  }

  const successCount = data.success_count ?? data.payment_success_count ?? 0;
  const failCount = data.fail_count ?? data.payment_fail_count ?? 0;
  const totalUsers = data.settlement_count || successCount + failCount;
  const progress = totalUsers > 0 ? Math.round((successCount / totalUsers) * 100) : 0;
  const failReason = data.payment_fail_reasons?.[0];
  const failText =
    (typeof failReason?.reason === 'string' && failReason.reason) ||
    (typeof failReason?.message === 'string' && failReason.message) ||
    '';
  const statusTitle = failCount > 0 ? '支付部分失败' : data.payment_status_text || '支付处理中';
  const statusDesc = failText || (failCount > 0 ? '存在失败记录，请核对失败原因后重试' : '支付状态正常');

  return {
    billNo: data.batch_no || data.bill_no || '-',
    statusTitle,
    statusDesc,
    totalAmount: data.total_payment_amount || data.distribution_amount || '0.00',
    progress,
    successCount,
    failCount,
    paidUsers: successCount,
    totalUsers,
    channel: data.payment_info?.payment_channel || '-',
    serviceRate: formatPercent(data.payment_info?.service_fee_rate),
    issueAmount: `¥ ${data.payment_info?.distribution_amount || data.distribution_amount || '0.00'}`,
    serviceFee: `¥ ${data.payment_info?.service_fee || data.service_fee || '0.00'}`,
    personalTax: `¥ ${data.payment_info?.personal_tax || data.personal_tax || '0.00'}`,
    finishTime: data.payment_info?.payment_date || data.created_at || '-',
    task: data.task_name || '-',
    project: data.project_name || '-',
    enterprise: data.enterprise_name || '-',
  };
});

const showAlertBanner = computed(() => {
  return true;
  return detailData.value?.can_reupload;
});

const handleTabChange = (tab: RecordTab) => {
  activeTab.value = tab;
  search({});
};

const handleBack = () => {
  router.back();
};

const handleDownloadBill = () => {
  MessagePlugin.success('对账单下载中');
};

const handleReupload = () => {
  if (!detailData.value?.can_reupload) {
    MessagePlugin.warning('当前账单不可重新上传');
    return;
  }
  MessagePlugin.success('已重新上传结算单');
};

const handleDownloadVoucher = (record: BillDetailPaymentItem) => {
  MessagePlugin.success(`已开始下载 ${record.recipient_name} 的支付凭证`);
};

const fetchDetail = async () => {
  const uploadId = Number(route.query.id);
  if (!uploadId) {
    MessagePlugin.error('账单ID无效');
    return;
  }
  try {
    const { data } = await getBillDetail({ upload_id: uploadId });
    detailData.value = data;
    search({});
  } catch {
    MessagePlugin.error('获取账单详情失败');
  }
};

onMounted(() => {
  fetchDetail();
});
</script>
<style scoped lang="less">
.payment-pay-detail {
  min-height: 100%;
  padding: 24px;
  background: #f8f9fa;
}

.detail-main {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 410px;
  gap: 24px;
  align-items: start;
}

.hero-card {
  grid-column: 1 / -1;
  padding: 8px 0 0;
}

.content-main {
  min-width: 0;
}

.hero-header {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.hero-title-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.hero-title {
  margin: 0;
  font-size: 20px;
  line-height: 1.1;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172f;
}

.hero-subtitle {
  margin: 8px 0 0;
  font-size: 16px;
  color: #7c8aa5;
  font-weight: 500;
}

.hero-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;

  :deep(.t-button) {
    height: 48px;
    padding: 0 22px;
    border-radius: 14px;
    font-weight: 600;
    box-shadow: none;
  }
}

.alert-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  padding: 22px 24px;
  border: 1px solid #f1c8c5;
  border-radius: 18px;
  background: linear-gradient(90deg, rgba(247, 92, 79, 0.08), rgba(247, 92, 79, 0.05));
}

.alert-main {
  display: flex;
  align-items: center;
  gap: 18px;
}

.alert-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.12);
  color: #e53935;
  font-size: 28px;
}

.alert-title {
  font-size: 16px;
  font-weight: 700;
  color: #b92828;
}

.alert-desc {
  margin-top: 8px;
  font-size: 14px;
  color: #ce3f3f;
}

.alert-badge {
  padding: 8px 12px;
  border-radius: 8px;
  background: #f7c6c2;
  font-size: 13px;
  line-height: 1;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #b73a37;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.metric-card {
  min-height: 152px;
  padding: 24px;
  border: 1px solid #e7ecf3;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 8px 24px rgba(15, 23, 47, 0.04);
}

.metric-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.metric-label {
  font-size: 14px;
  color: #75829b;
  font-weight: 600;
}

.metric-value {
  margin-top: 14px;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 700;
  color: #121a31;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eaf2ff;
  color: #2f6ce5;
  font-size: 14px;
  font-weight: 700;
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
  font-size: 14px;
  font-weight: 600;

  .success {
    color: #11a75c;
  }

  .fail {
    color: #f04438;
  }
}

.metric-tip {
  margin-top: 12px;
  font-size: 13px;
  color: #8e9ab1;
}

.table-shell {
  margin-top: 24px;

  :deep(.list-common-table > .t-form) {
    display: none;
  }

  :deep(.list-common-table .project-toolbar) {
    display: none;
  }

  :deep(.list-common-table .table-container) {
    margin-top: 0;
  }
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.status-tabs {
  display: flex;
  align-items: center;
  gap: 0;
  border-bottom: 1px solid var(--td-component-stroke);
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

@media (max-width: 1360px) {
  .detail-main {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .payment-pay-detail {
    padding: 16px;
  }

  .hero-header {
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;

    :deep(.t-button) {
      flex: 1;
    }
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .status-tab {
    padding: 10px 12px;
    font-size: 13px;
  }
}

@media (max-width: 640px) {
  .hero-title {
    font-size: 24px;
  }

  .hero-subtitle {
    font-size: 15px;
  }

  .alert-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-actions {
    flex-direction: column;
  }
}
</style>
