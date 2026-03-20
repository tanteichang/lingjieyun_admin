<template>
  <t-card :bordered="false" class="task-list-page">
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
      <template #project="{ record }">
        {{ record.project?.name || '-' }}
      </template>
      <template #task_status="{ record }">
        <t-tag :theme="statusTag[(record as TaskRow).task_status]?.theme" variant="light">
          {{ statusTag[(record as TaskRow).task_status]?.label || '-' }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleDetail(record as TaskRow)">详情</t-link>
          <t-link
            v-if="(record as TaskRow).task_status === TaskStatus.ongoing"
            hover="color"
            @click="handlePause(record as TaskRow)"
          >
            暂停
          </t-link>
          <t-link
            v-if="(record as TaskRow).task_status === TaskStatus.paused"
            theme="primary"
            hover="color"
            @click="handleResume(record as TaskRow)"
          >
            恢复
          </t-link>
          <t-link
            v-if="
              (record as TaskRow).task_status === TaskStatus.ongoing ||
              (record as TaskRow).task_status === TaskStatus.paused ||
              (record as TaskRow).task_status === TaskStatus.pending
            "
            theme="danger"
            hover="color"
            @click="handleTerminate(record as TaskRow)"
            >终止</t-link
          >
        </t-space>
      </template>
    </common-table>
    <t-dialog
      v-model:visible="actionDialogVisible"
      :header="`确认${currentActionLabel}`"
      :confirm-btn="{
        content: `确认${currentActionLabel}`,
        theme: currentActionType === 'terminate' ? 'danger' : 'primary',
      }"
      cancel-btn="取消"
      @confirm="handleConfirmAction"
    >
      <p>确认{{ currentActionLabel }}任务「{{ currentActionRow?.name || '-' }}」吗？</p>
    </t-dialog>
  </t-card>
</template>
<script setup lang="ts">
import type { TdTagProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getTaskList, pauseTask, resumeTask, terminateTask } from '@/api/enterprise/task';
import type { Row } from '@/api/model/common';
import type { Status_Counts, TaskItem, TaskQuery } from '@/api/model/enterprise/taskModel';
import { TASK_STATUS_OPTIONS, TaskStatus } from '@/api/model/enterprise/taskModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { useDictStore } from '@/store/modules/enterprise/dict';
import { useTaskStore } from '@/store/modules/enterprise/task';
import { enumToOptions } from '@/utils/type';

defineOptions({
  name: 'TaskList',
});

const taskStore = useTaskStore();
const dictStore = useDictStore();
const router = useRouter();

type TaskRow = TaskItem & Row;
type TaskActionType = 'pause' | 'resume' | 'terminate';

console.log(enumToOptions(TaskStatus, TASK_STATUS_OPTIONS));

const statusTabs: Array<{ label: string; value: keyof Status_Counts }> = [
  { label: '全部', value: 'all' },
  { label: '未发布', value: 'unpublished' },
  { label: '进行中', value: 'ongoing' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已终止', value: 'terminated' },
];

const statusTag: Record<TaskStatus, { label: string; theme: TdTagProps['theme'] }> = {
  [TaskStatus.ongoing]: { label: '进行中', theme: 'warning' },
  [TaskStatus.paused]: { label: '已暂停', theme: 'primary' },
  [TaskStatus.completed]: { label: '已完成', theme: 'success' },
  [TaskStatus.terminated]: { label: '已终止', theme: 'danger' },
  [TaskStatus.unpublished]: { label: '未发布', theme: 'primary' },
};

const defaultQuery: TaskQuery = {
  page: 1,
  limit: 10,
};

const formConfig: FormConfig<TaskRow, keyof TaskRow> = {
  formItem: [
    { label: '任务名称', name: 'task_name', type: 'input', placeholder: '请输入任务名称', span: 6 },
    {
      label: '任务类型',
      name: 'job_id',
      type: 'treeSelect',
      placeholder: '请选择任务类型',
      props: { data: dictStore.getJobOptions },
      span: 6,
    },
    {
      label: '任务状态',
      name: 'task_status',
      type: 'select',
      placeholder: '请选择任务状态',
      props: { options: enumToOptions(TaskStatus, TASK_STATUS_OPTIONS) },
      span: 6,
    },
    { label: '所属项目', name: 'project', type: 'input', placeholder: '请输入项目名称', span: 6 },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<TaskRow, keyof TaskRow> = {
  tableItem: [
    { title: '任务编号', colKey: 'task_no', width: 120 },
    { title: '任务名称', colKey: 'name', width: 200, ellipsis: true, fixed: 'left' },
    // { title: '任务类型', colKey: 'project', width: 140 },
    { title: '所属项目', colKey: 'project', width: 200 },
    { title: '招募方式', colKey: 'recruitment_type_text', width: 120 },
    { title: '任务时间', colKey: 'task_time', width: 200 },
    { title: '任务状态', colKey: 'task_status', width: 110, align: 'center' },
    { title: '所需人员', colKey: 'required_personnel', width: 100, align: 'center' },
    { title: '成员数量', colKey: 'member_count', width: 100, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, fixed: 'right' },
  ],
};

const currentStatus = ref<string>(statusTabs[0].value);
const actionDialogVisible = ref(false);
const currentActionType = ref<TaskActionType>('pause');
const currentActionRow = ref<TaskRow | null>(null);
const tabCounts = reactive<Record<keyof Status_Counts, number>>({
  all: 0,
  unpublished: 0,
  ongoing: 0,
  completed: 0,
  paused: 0,
  terminated: 0,
});

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<TaskQuery, TaskRow>({
  fetcher: async (params) => {
    const { data } = await getTaskList(params);
    taskStore.setTasks(data.list);
    tabCounts.all = data.total || 0;
    Object.keys(data.status_counts).forEach((key) => {
      const typedKey = key as keyof Status_Counts;
      tabCounts[typedKey] = data.status_counts[typedKey];
    });
    return { list: data.list, total: data.total, status_counts: data.status_counts || {} };
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

const handleTabChange = (value: keyof Status_Counts) => {
  console.log('切换标签:', value);
  currentStatus.value = value;

  // 处理 'all' 特殊情况，因为它不在 TaskStatus 枚举中
  let statusValue: TaskStatus | undefined;
  if (value !== 'all') {
    // 创建状态映射，将字符串键转换为对应的枚举值
    const statusMap: Record<Exclude<keyof Status_Counts, 'all'>, TaskStatus> = {
      ongoing: TaskStatus.ongoing,
      paused: TaskStatus.paused,
      terminated: TaskStatus.terminated,
      completed: TaskStatus.completed,
      unpublished: TaskStatus.unpublished,
    };
    statusValue = statusMap[value];
  }

  console.log('状态值:', statusValue);
  query.task_status = statusValue ? String(statusValue) : '';
  pagination.current = 1;
  handleSearch();
};

const handleDetail = (row: TaskRow) => {
  router.push({ name: 'TaskDetail', query: { id: row.id } });
};
const handlePause = (row: TaskRow) => {
  openActionConfirm('pause', row);
};
const handleResume = (row: TaskRow) => {
  openActionConfirm('resume', row);
};
const handleTerminate = (row: TaskRow) => {
  openActionConfirm('terminate', row);
};

const currentActionLabel = computed(() => {
  const actionLabelMap: Record<TaskActionType, string> = {
    pause: '暂停',
    resume: '恢复',
    terminate: '终止',
  };
  return actionLabelMap[currentActionType.value];
});

const openActionConfirm = (action: TaskActionType, row: TaskRow) => {
  currentActionType.value = action;
  currentActionRow.value = row;
  actionDialogVisible.value = true;
};

const handleConfirmAction = async () => {
  const row = currentActionRow.value;
  if (!row) return;
  try {
    let code = -1;
    if (currentActionType.value === 'pause') {
      ({ code } = await pauseTask({ id: row.id }));
    } else if (currentActionType.value === 'resume') {
      ({ code } = await resumeTask({ id: row.id }));
    } else if (currentActionType.value === 'terminate') {
      ({ code } = await terminateTask({ id: row.id }));
    }
    if (code === 200) {
      MessagePlugin.success(`${currentActionLabel.value}任务 ${row.name} 成功`);
    }
    actionDialogVisible.value = false;
    handleSearch();
  } catch {
    MessagePlugin.error(`${currentActionLabel.value}任务 ${row.name} 失败`);
  }
};
</script>
<style lang="less" scoped>
.task-list-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
