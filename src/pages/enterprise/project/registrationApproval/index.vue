<template>
  <t-card :bordered="false" class="page">
    <t-tabs :value="currentStatus" @change="handleTabChange">
      <t-tab-panel v-for="tab in statusTabs" :key="tab.value" :value="tab.value">
        <template #label>
          {{ tab.label }}
          <span :style="{ marginLeft: '5px', color: tab.color }"> ({{ tabCounts[tab.value] ?? 0 }}) </span>
        </template>
      </t-tab-panel>
    </t-tabs>
    <div style="height: 20px"></div>
    <common-table
      row-key="id"
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
        <t-tag :theme="TASK_APPLY_STATUS_TAG[record.apply_status as TaskApplyStatus].theme">{{
          TASK_APPLY_STATUS_TAG[record.apply_status as TaskApplyStatus].label
        }}</t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleViewResume(record)">详情</t-link>
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
    <t-drawer v-model:visible="resumeVisible" size="80%" confirm-btn="关闭" :cancel-btn="null">
      <template #body>
        <t-loading :loading="detailLoading">
          <div class="detail-drawer-body">
            <task-basic-info-card :task-info="taskDetail" :loading="taskLoading" />
            <t-card :bordered="false" class="resume-detail-card">
              <h3 class="resume-detail-card__title">简历信息</h3>
              <shared-resume-detail :user-resume="resumeDetail" />
            </t-card>
          </div>
        </t-loading>
      </template>
    </t-drawer>
  </t-card>
</template>
<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

import { userResume } from '@/api/enterprise/member';
import { getTaskApplyList, getTaskDetail, reviewTaskApply } from '@/api/enterprise/task';
import type { Row } from '@/api/model/common';
import type { UserResumeResult } from '@/api/model/enterprise/member';
import type { TaskApplyItem, TaskApplyQuery, TaskDetailResult } from '@/api/model/enterprise/taskModel';
import { TASK_APPLY_STATUS_TAG, TaskApplyStatus } from '@/api/model/enterprise/taskModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import SharedResumeDetail from '@/components/resume-detail/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

import TaskBasicInfoCard from '../taskList/detail/components/TaskBasicInfoCard.vue';

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

const statusTabs: Array<{ label: string; value: keyof ApplyStatusCounts; color: string }> = [
  { label: '全部', value: 'total', color: 'gray' },
  { label: '待审核', value: 'pending', color: 'red' },
  { label: '已通过', value: 'passed', color: 'gray' },
  { label: '已拒绝', value: 'rejected', color: 'gray' },
];

const defaultQuery: TaskApplyQuery & {
  date_range?: string | [string, string];
  keyword_name?: string;
  keyword_mobile?: string;
  keyword_task?: string;
  apply_status?: TaskApplyStatus;
} = {
  page: 1,
  limit: 10,
  date_range: '',
  keyword_name: '',
  keyword_mobile: '',
  keyword_task: '',
  apply_status: undefined,
};

const formConfig: FormConfig<RegistrationRow, keyof RegistrationRow | keyof typeof defaultQuery> = {
  formItem: [
    {
      label: '申请日期',
      name: 'date_range',
      type: 'date-range',
      span: 4,
      placeholder: '请选择申请日期',
      props: {
        clearable: true,
        disableDate: (date: Date) => {
          return date.getTime() > Date.now();
        },
      },
    },
    { label: '姓名', name: 'keyword_name', type: 'input', span: 4, placeholder: '请输入姓名' },
    { label: '电话', name: 'keyword_mobile', type: 'input', span: 4, placeholder: '请输入电话' },
    { label: '任务标题', name: 'keyword_task', type: 'input', span: 5, placeholder: '请输入任务标题' },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<RegistrationRow, keyof RegistrationRow> = {
  tableItem: [
    { title: '姓名', colKey: 'user_info_real_name', width: 100, align: 'center' },
    { title: '手机号码', colKey: 'user_info_mobile', width: 150, align: 'center' },
    { title: '任务标题', colKey: 'task_title', minWidth: 200, ellipsis: true },
    { title: '所属项目', colKey: 'project_name', minWidth: 200, ellipsis: true },
    { title: '所属企业', colKey: 'customer_name', minWidth: 200, ellipsis: true },
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
const currentApplyStatus = computed<TaskApplyStatus | undefined>(() => {
  if (currentStatus.value === 'total') {
    return undefined;
  }
  return TaskApplyStatus[currentStatus.value];
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

const { data: tableData, loading, pagination, search, handlePageChange } = tableHook;

const handleSearch = (payload?: Partial<typeof defaultQuery>) => {
  search({
    ...payload,
    apply_status: currentApplyStatus.value,
  });
};

const handleReset = () => {
  search({
    ...defaultQuery,
    apply_status: currentApplyStatus.value,
  });
};

const handleTabChange = (value: keyof ApplyStatusCounts) => {
  currentStatus.value = value;
  pagination.current = 1;
  handleSearch();
};

const resumeVisible = ref(false);
const resumeLoading = ref(false);
const taskLoading = ref(false);
const resumeRecord = ref<RegistrationRow | null>(null);
const resumeDetail = ref<UserResumeResult | null>(null);
const taskDetail = ref<TaskDetailResult | null>(null);
const detailLoading = computed(() => resumeLoading.value || taskLoading.value);

const fetchTaskDetailInfo = async (taskId?: number) => {
  if (!taskId) {
    taskDetail.value = null;
    return;
  }

  taskLoading.value = true;
  taskDetail.value = null;

  try {
    const taskRes = await getTaskDetail({ task_id: taskId });
    if (taskRes.code === 200) {
      taskDetail.value = taskRes.data;
    }
  } finally {
    taskLoading.value = false;
  }
};

const handleViewResume = async (record: RegistrationRow) => {
  resumeRecord.value = record;
  resumeVisible.value = true;
  resumeLoading.value = true;
  resumeDetail.value = null;
  void fetchTaskDetailInfo(record.product_id);

  try {
    const res = await userResume({
      user_id: record.user_id,
    });
    if (res.code === 200) {
      resumeDetail.value = res.data;
    }
  } finally {
    resumeLoading.value = false;
  }
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

.detail-drawer-body {
  display: grid;
  gap: 16px;
  max-height: calc(100vh - 140px);
  overflow-y: auto;
  padding-right: 8px;
}

.resume-detail-card {
  margin-bottom: 0;
}

.resume-detail-card__title {
  margin: 0 0 16px;
  padding-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #181818;
}
</style>
