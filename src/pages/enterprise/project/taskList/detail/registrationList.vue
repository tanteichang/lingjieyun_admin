<template>
  <div class="registration-list-card">
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
      <template #apply_status="{ record }">
        <t-tag :theme="statusTag[record.apply_status].theme">{{ statusTag[record.apply_status].label }}</t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link
            :disabled="record.apply_status !== TaskApplyStatus.pending"
            theme="primary"
            hover="color"
            @click="openConfirm('pass', record)"
            >同意</t-link
          >
          <t-link
            :disabled="record.apply_status !== TaskApplyStatus.pending"
            theme="danger"
            hover="color"
            @click="openConfirm('reject', record)"
            >拒绝</t-link
          >
          <t-link hover="color">详情</t-link>
        </t-space>
      </template>
    </common-table>
    <t-dialog
      v-model:visible="confirmVisible"
      :header="confirmHeader"
      :body="confirmBody"
      :on-cancel="handleConfirmCancel"
      @confirm="handleConfirmSubmit"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import type { Row } from '@/api/model/common';
import type { TaskApplyItem, TaskApplyQuery } from '@/api/model/taskModel';
import { TaskApplyStatus } from '@/api/model/taskModel';
import { getTaskApplyList, reviewTaskApply } from '@/api/task';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'RegistrationList',
});

const emit = defineEmits<{
  (e: 'update:pending', pending: number): void;
}>();

const pending = ref(0);

watch(
  () => pending.value,
  (pending) => {
    emit('update:pending', pending);
  },
  { immediate: true },
);

const route = useRoute();

type RegistrationRow = TaskApplyItem & Row;

const statusOptions = [
  { label: '待审核', value: TaskApplyStatus.pending },
  { label: '已通过', value: TaskApplyStatus.passed },
  { label: '已拒绝', value: TaskApplyStatus.rejected },
];

const statusTag: Record<TaskApplyStatus, { label: string; theme: string }> = {
  [TaskApplyStatus.pending]: { label: '待审核', theme: 'warning' },
  [TaskApplyStatus.passed]: { label: '已通过', theme: 'success' },
  [TaskApplyStatus.rejected]: { label: '已拒绝', theme: 'danger' },
};

const formConfig = {
  formItem: [
    { label: '姓名', name: 'keyword_name', type: 'input', placeholder: '请输入姓名或名称', span: 6 },
    { label: '手机号码', name: 'keyword_mobile', type: 'input', placeholder: '请输入手机号', span: 6 },
    {
      label: '审核状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择审核状态',
      span: 6,
      props: {
        options: statusOptions,
      },
    },
  ],
  formData: {
    product_id: Number(route.query.taskID),
    page: 1,
    limit: 10,
  },
};

const tableConfig: TableConfig<RegistrationRow, keyof RegistrationRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '姓名', colKey: 'user_info_real_name', width: 120, align: 'center' },
    { title: '手机号码', colKey: 'user_info_mobile', width: 150, align: 'center' },
    { title: '审核状态', colKey: 'apply_status', width: 120, align: 'center' },
    { title: '报名时间', colKey: 'created_at', width: 180, align: 'center' },
    { title: '操作', colKey: 'op', width: 200, align: 'center', fixed: 'right' },
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

const tableHook = useCommonTable<TaskApplyQuery, RegistrationRow>({
  fetcher: async (params) => {
    const { data } = await getTaskApplyList(params);
    pending.value = data.stats.pending || 0;
    return {
      list: data.list.map((item, index) => ({
        ...item,
        index: index + 1,
        user_info_real_name: item.user_info.real_name,
        user_info_mobile: item.user_info.mobile,
      })),
      total: data.total,
    };
  },
  defaultQuery: formConfig.formData,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search: handleSearch, reset: handleReset, handlePageChange } = tableHook;

type ConfirmAction = 'pass' | 'reject';

const confirmVisible = ref(false);
const confirmAction = ref<ConfirmAction>('pass');
const confirmRecord = ref<RegistrationRow | null>(null);

const confirmHeader = computed(() => (confirmAction.value === 'pass' ? '确认同意报名？' : '确认拒绝报名？'));
const confirmBody = computed(() => {
  const record = confirmRecord.value as RegistrationRow | null;
  const name = (record as any)?.user_info_username || record?.user_info?.username || '该用户';
  return confirmAction.value === 'pass' ? `确认同意 ${name} 的报名申请？` : `确认拒绝 ${name} 的报名申请？`;
});

const openConfirm = (action: ConfirmAction, record: RegistrationRow) => {
  confirmAction.value = action;
  confirmRecord.value = record;
  confirmVisible.value = true;
};

const handleConfirmCancel = () => {
  confirmVisible.value = false;
};

const handleConfirmSubmit = () => {
  confirmVisible.value = false;
  console.log(confirmRecord.value);
  if (!confirmRecord.value) {
    return;
  }
  reviewTaskApply({
    apply_id: confirmRecord.value.id,
    apply_status: confirmAction.value === 'pass' ? TaskApplyStatus.passed : TaskApplyStatus.rejected,
    review_remark: '',
  }).then(() => {
    handleSearch();
  });
};
</script>
<style lang="less" scoped>
.registration-list-card {
  padding: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 16px;
  gap: 12px;

  :deep(.t-form) {
    flex: 1;
  }
}
</style>
