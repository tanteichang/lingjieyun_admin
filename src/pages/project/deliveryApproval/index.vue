<template>
  <t-card :bordered="false" class="delivery-approval-page">
    <t-tabs :value="currentStatus" @change="handleTabChange">
      <t-tab-panel
        v-for="tab in statusTabs"
        :key="tab.value"
        :value="tab.value"
        :label="`${tab.label} (${tabCounts[tab.value] ?? 0})`"
      />
    </t-tabs>
    <div style="height: 20px"></div>
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      :header-affixed-top="headerAffixedTop"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #submit_status="{ record }">
        <t-tag :theme="submitStatusTag[record.submit_status].theme">
          {{ submitStatusTag[record.submit_status].label }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link @click="handlePreview(record)">查看</t-link>
          <t-link
            :disabled="record.submit_status !== DeliverySubmitStatus.Pending"
            theme="primary"
            hover="color"
            @click="openConfirm('pass', record)"
          >
            通过
          </t-link>
          <t-link
            :disabled="record.submit_status !== DeliverySubmitStatus.Pending"
            theme="danger"
            hover="color"
            @click="openConfirm('reject', record)"
          >
            驳回
          </t-link>
        </t-space>
      </template>
    </common-table>
    <t-dialog
      v-model:visible="confirmVisible"
      :header="confirmHeader"
      :on-cancel="handleConfirmCancel"
      @confirm="handleConfirmSubmit"
    >
      <template #body>
        <t-space direction="vertical">
          <div>{{ confirmBody }}</div>
          <t-input v-model="review_remark" clearable placeholder="审核备注" />
        </t-space>
      </template>
    </t-dialog>
    <t-drawer v-model:visible="previewVisible" size="50%" :confirm-btn="null" cancel-btn="返回">
      <template #body>
        <file-viewer :files="previewFiles"></file-viewer>
      </template>
    </t-drawer>
  </t-card>
</template>
<script setup lang="ts">
import type { TdTagProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';

import { getDeliveryList, reviewDelivery } from '@/api/delivery';
import type { Row } from '@/api/model/common';
import type { DeliveryItem, DeliveryListPayload } from '@/api/model/delivery';
import { DeliverySubmitStatus } from '@/api/model/delivery';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import type { FileViewerItem } from '@/components/file-viewer/index.vue';
import FileViewer from '@/components/file-viewer/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'DeliveryApproval',
});

type DeliveryListQuery = DeliveryListPayload;

type DeliveryRow = DeliveryItem & Row;

const statusTabs: Array<{ label: string; value: 'all' | DeliverySubmitStatus }> = [
  { label: '全部', value: 'all' },
  { label: '待验收', value: DeliverySubmitStatus.Pending },
  { label: '已验收', value: DeliverySubmitStatus.Accepted },
  { label: '不合格需重提', value: DeliverySubmitStatus.RejectedNeedResubmit },
];

const submitStatusTag: Record<DeliverySubmitStatus, { label: string; theme: TdTagProps['theme'] }> = {
  [DeliverySubmitStatus.Pending]: { label: '待验收', theme: 'warning' },
  [DeliverySubmitStatus.Accepted]: { label: '已验收', theme: 'success' },
  [DeliverySubmitStatus.RejectedNeedResubmit]: { label: '不合格需重提', theme: 'danger' },
};

const defaultQuery: DeliveryListQuery = {
  keyword_name: '',
  date_range: '',
  keyword_mobile: '',
  project_id: undefined,
  submit_status: undefined,
  page: 1,
  limit: 20,
};

const formConfig: FormConfig<DeliveryListQuery, keyof DeliveryListQuery> = {
  formItem: [
    { label: '姓名', name: 'keyword_name', type: 'input', placeholder: '请输入姓名', span: 6 },
    { label: '手机号', name: 'keyword_mobile', type: 'input', placeholder: '请输入手机号', span: 6 },
    {
      label: '日期范围',
      name: 'date_range',
      type: 'date-range',
      placeholder: '请选择日期范围',
      span: 6,
      props: {
        type: 'daterange',
      },
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<DeliveryRow, keyof DeliveryRow> = {
  tableItem: [
    { title: '姓名', colKey: 'user_name', width: 140, align: 'center' },
    { title: '手机号', colKey: 'user_mobile', width: 140, align: 'center' },
    { title: '提交类型', colKey: 'submit_type_text', width: 120, align: 'center' },
    { title: '提交状态', colKey: 'submit_status', width: 140, align: 'center' },
    { title: '提交次数', colKey: 'submit_count', width: 100, align: 'center' },
    { title: '提交时间', colKey: 'created_at', width: 180, align: 'center' },
    { title: '操作', colKey: 'op', width: 160, align: 'center', fixed: 'right' },
  ],
};

const currentStatus = ref<'all' | DeliverySubmitStatus>(statusTabs[0].value);
const tabCounts = reactive<Record<'all' | DeliverySubmitStatus, number>>({
  all: 0,
  [DeliverySubmitStatus.Pending]: 0,
  [DeliverySubmitStatus.Accepted]: 0,
  [DeliverySubmitStatus.RejectedNeedResubmit]: 0,
});

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<DeliveryListQuery, DeliveryRow>({
  fetcher: async (params) => {
    const { data } = await getDeliveryList(params);
    const list = data.list || [];
    tabCounts.all = data.stats?.total || 0;
    tabCounts[DeliverySubmitStatus.Pending] = data.stats?.pending || 0;
    tabCounts[DeliverySubmitStatus.Accepted] = data.stats?.passed || 0;
    tabCounts[DeliverySubmitStatus.RejectedNeedResubmit] = data.stats?.rejected || 0;
    return {
      list,
      total: data.total ?? list.length,
    };
  },
  defaultQuery,
  debounceWait: 300,
});

const {
  data: tableData,
  loading,
  pagination,
  search: handleSearch,
  reset: handleReset,
  handlePageChange,
  query,
} = tableHook;

const handleTabChange = (value: 'all' | DeliverySubmitStatus) => {
  currentStatus.value = value;
  query.submit_status = value === 'all' ? undefined : value;
  pagination.current = 1;
  handleSearch();
};

const previewVisible = ref(false);
const previewFiles = ref<FileViewerItem[]>([]);
const review_remark = ref('');

const handlePreview = (record: DeliveryRow) => {
  previewVisible.value = true;
  previewFiles.value = record.files.map((item) => ({ name: item.name, url: item.url }));
};

type ConfirmAction = 'pass' | 'reject';

const confirmVisible = ref(false);
const confirmAction = ref<ConfirmAction>('pass');
const confirmRecord = ref<DeliveryRow | null>(null);

const confirmHeader = computed(() => (confirmAction.value === 'pass' ? '确认通过交付？' : '确认驳回交付？'));
const confirmBody = computed(() => {
  const record = confirmRecord.value as DeliveryRow | null;
  const name = record?.user_name || record?.user_info?.username || '该用户';
  return confirmAction.value === 'pass' ? `确认通过 ${name} 的交付？` : `确认驳回 ${name} 的交付？`;
});

const openConfirm = (action: ConfirmAction, record: DeliveryRow) => {
  confirmAction.value = action;
  confirmRecord.value = record;
  review_remark.value = '';
  confirmVisible.value = true;
};

const handleConfirmCancel = () => {
  confirmVisible.value = false;
};

const handleConfirmSubmit = async () => {
  confirmVisible.value = false;
  if (!confirmRecord.value) {
    return;
  }
  const params = {
    submit_id: confirmRecord.value.id,
    submit_status:
      confirmAction.value === 'pass' ? DeliverySubmitStatus.Accepted : DeliverySubmitStatus.RejectedNeedResubmit,
    review_remark: review_remark.value || undefined,
  };
  await reviewDelivery(params);
  MessagePlugin.success('审核提交成功');
  handleSearch();
};
</script>
<style lang="less" scoped>
.delivery-approval-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
