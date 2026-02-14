<template>
  <t-card :bordered="false" class="page">
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
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
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
  </t-card>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import type { Row } from '@/api/model/common';
import type { TaskApplyItem, TaskApplyQuery } from '@/api/model/taskModel';
import { TaskApplyStatus } from '@/api/model/taskModel';
import { getTaskApplyList, reviewTaskApply } from '@/api/task';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'RegistrationApproval',
});

type RegistrationRow = TaskApplyItem & Row;

interface ApplyStatusCounts {
  total: number;
  pending: number;
  passed: number;
  rejected: number;
}

const statusTabs: Array<{ label: string; value: keyof ApplyStatusCounts }> = [
  { label: '全部', value: 'total' },
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'passed' },
  { label: '已拒绝', value: 'rejected' },
];

const statusTag: Record<TaskApplyStatus, { label: string; theme: string }> = {
  [TaskApplyStatus.pending]: { label: '待审核', theme: 'warning' },
  [TaskApplyStatus.passed]: { label: '已通过', theme: 'success' },
  [TaskApplyStatus.rejected]: { label: '已拒绝', theme: 'danger' },
};

const statusOptions = [
  { label: '待审核', value: TaskApplyStatus.pending },
  { label: '已通过', value: TaskApplyStatus.passed },
  { label: '已拒绝', value: TaskApplyStatus.rejected },
];

const defaultQuery: TaskApplyQuery & {
  date_range?: Array<string | null>;
  keyword_name?: string;
  keyword_mobile?: string;
  keyword_task?: string;
  status?: TaskApplyStatus | '';
} = {
  page: 1,
  limit: 10,
  date_range: [null, null],
  keyword_name: '',
  keyword_mobile: '',
  keyword_task: '',
  status: '',
};

const formConfig: FormConfig<RegistrationRow, keyof RegistrationRow | keyof typeof defaultQuery> = {
  formItem: [
    {
      label: '申请日期',
      name: 'date_range',
      type: 'date-range',
      span: 12,
      placeholder: '请选择申请日期',
      props: {
        clearable: true,
        disableDate: (date) => {
          return date.getTime() > Date.now();
        },
      },
    },
    { label: '姓名', name: 'keyword_name', type: 'input', span: 6, placeholder: '请输入姓名' },
    { label: '电话', name: 'keyword_mobile', type: 'input', span: 6, placeholder: '请输入电话' },
    { label: '任务标题', name: 'keyword_task', type: 'input', span: 6, placeholder: '请输入任务标题' },
    {
      label: '审核状态',
      name: 'status',
      type: 'select',
      span: 6,
      placeholder: '请选择审核状态',
      props: {
        options: statusOptions,
      },
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<RegistrationRow, keyof RegistrationRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '姓名', colKey: 'user_info_real_name', width: 140, align: 'center' },
    { title: '手机号码', colKey: 'user_info_mobile', width: 150, align: 'center' },
    { title: '任务标题', colKey: 'task_title', minWidth: 200, ellipsis: true },
    { title: '项目名称', colKey: 'project_name', minWidth: 200, ellipsis: true },
    { title: '报名时间', colKey: 'apply_time_text', width: 180, align: 'center' },
    { title: '审核状态', colKey: 'apply_status', width: 120, align: 'center' },
    { title: '操作', colKey: 'op', width: 160, align: 'center', fixed: 'right' },
  ],
};

const currentStatus = ref<keyof ApplyStatusCounts>('total');
const tabCounts = reactive<Record<keyof ApplyStatusCounts, number>>({
  total: 0,
  pending: 0,
  passed: 0,
  rejected: 0,
});

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<typeof defaultQuery, RegistrationRow>({
  fetcher: async (params) => {
    if (params.date_range[0] && params.date_range[1]) {
      params.date_range = `${params.date_range[0]} - ${params.date_range[1]}`;
    }
    const { data } = await getTaskApplyList(params as TaskApplyQuery);
    tabCounts.total = data.stats?.total ?? data.total ?? 0;
    tabCounts.pending = data.stats?.pending ?? 0;
    tabCounts.passed = data.stats?.passed ?? 0;
    tabCounts.rejected = data.stats?.rejected ?? 0;
    return {
      list: data.list.map((item, index) => ({
        ...item,
        index: index + 1,
        user_info_real_name: item.user_info?.real_name ?? item.user_info_real_name,
        user_info_mobile: item.user_info?.mobile ?? item.user_info_mobile,
      })),
      total: data.total,
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

const handleTabChange = (value: keyof ApplyStatusCounts) => {
  currentStatus.value = value;
  query.status = value === 'total' ? '' : (TaskApplyStatus[value] as unknown as TaskApplyStatus);
  pagination.current = 1;
  handleSearch();
};

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
.page {
  height: 100%;
}
</style>
