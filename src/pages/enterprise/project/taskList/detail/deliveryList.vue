<template>
  <div class="delivery-list-card">
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
        <t-tag :theme="submitStatusTag[record.submit_status].theme">{{
          submitStatusTag[record.submit_status].label
        }}</t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link @click="handlePreview(record)"> 查看 </t-link>
          <t-link
            :disabled="record.submit_status !== DeliverySubmitStatus.Pending"
            theme="primary"
            hover="color"
            @click="openConfirm('pass', record)"
            >通过</t-link
          >
          <t-link
            :disabled="record.submit_status !== DeliverySubmitStatus.Pending"
            theme="danger"
            hover="color"
            @click="openConfirm('reject', record)"
            >驳回</t-link
          >
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
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import { getDeliveryList, reviewDelivery } from '@/api/delivery';
import type { Row } from '@/api/model/common';
import type { DeliveryItem, DeliveryListPayload } from '@/api/model/delivery';
import { DeliveryStatus, DeliverySubmitStatus } from '@/api/model/delivery';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import type { FileViewerItem } from '@/components/file-viewer/index.vue';
import FileViewer from '@/components/file-viewer/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'DeliveryList',
});

const emit = defineEmits<{
  (e: 'update:pending', pending: number): void;
}>();

const route = useRoute();

const previewVisible = ref(false);
const previewFiles = ref<FileViewerItem[]>([]);
const review_remark = ref('');

const pending = ref(0);

watch(
  () => pending.value,
  (pending) => {
    emit('update:pending', pending);
  },
  { immediate: true },
);

type DeliveryListQuery = DeliveryListPayload & {
  submit_status?: DeliverySubmitStatus;
};

type DeliveryRow = DeliveryItem & Row;

const submitStatusOptions = [
  { label: '待验收', value: DeliverySubmitStatus.Pending },
  { label: '已验收', value: DeliverySubmitStatus.Accepted },
  { label: '不合格需重提', value: DeliverySubmitStatus.RejectedNeedResubmit },
];

const submitStatusTag: Record<DeliverySubmitStatus, { label: string; theme: string }> = {
  [DeliverySubmitStatus.Pending]: { label: '待验收', theme: 'warning' },
  [DeliverySubmitStatus.Accepted]: { label: '已验收', theme: 'success' },
  [DeliverySubmitStatus.RejectedNeedResubmit]: { label: '不合格需重提', theme: 'danger' },
};

const formConfig = {
  formItem: [
    {
      label: '提交状态',
      name: 'submit_status',
      type: 'select',
      placeholder: '请选择提交状态',
      span: 6,
      props: {
        options: submitStatusOptions,
      },
    },
  ],
  formData: {
    keyword_name: '',
    submit_status: null,
    date_range: '',
    keyword_mobile: '',
    project_id: route.query.taskID,
  },
};

const tableConfig: TableConfig<DeliveryRow, keyof DeliveryRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '姓名', colKey: 'user_name', width: 140, align: 'center' },
    { title: '提交类型', colKey: 'submit_type_text', width: 120, align: 'center' },
    { title: '提交状态', colKey: 'submit_status', width: 120, align: 'center' },
    { title: '提交次数', colKey: 'submit_count', width: 100, align: 'center' },
    { title: '提交时间', colKey: 'created_at', width: 180, align: 'center' },
    { title: '操作', colKey: 'op', width: 160, align: 'center', fixed: 'right' },
  ],
};

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
    pending.value = data.stats?.pending || 0;
    return {
      list: list.map((item, index) => ({
        ...item,
        index: index + 1,
        user_info_username: item.user_info?.username,
      })),
      total: data.total ?? list.length,
    };
  },
  defaultQuery: formConfig.formData,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search: handleSearch, reset: handleReset, handlePageChange } = tableHook;

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
  confirmVisible.value = true;
};

const handleConfirmCancel = () => {
  confirmVisible.value = false;
};

const handleConfirmSubmit = () => {
  confirmVisible.value = false;
  if (!confirmRecord.value) {
    return;
  }
  const param = {
    submit_id: confirmRecord.value.id,
    submit_status:
      confirmAction.value === 'pass' ? DeliverySubmitStatus.Accepted : DeliverySubmitStatus.RejectedNeedResubmit,
    review_remark: '',
  };
  console.log(param);
  reviewDelivery(param).then(() => {
    handleSearch();
  });
};

const handlePreview = (record: DeliveryRow) => {
  previewVisible.value = true;
  previewFiles.value = record.files.map((item) => ({ name: item.name, url: item.url }));
};
</script>
<style lang="less" scoped>
.delivery-list-card {
  padding: 0;
}
</style>
