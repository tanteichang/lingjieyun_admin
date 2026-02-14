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
      <template #status="{ record }">
        <t-tag :theme="statusTag[(record as TaskRow).status]?.theme" variant="light">
          {{ statusTag[(record as TaskRow).status]?.label || '-' }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleDetail(record as TaskRow)">详情</t-link>
          <t-link
            v-if="(record as TaskRow).status === 'processing'"
            theme="danger"
            hover="color"
            @click="handlePause(record as TaskRow)"
          >
            暂停
          </t-link>
          <t-link
            v-else-if="(record as TaskRow).status === 'paused'"
            theme="primary"
            hover="color"
            @click="handleResume(record as TaskRow)"
          >
            恢复
          </t-link>
          <t-link theme="danger" hover="color" @click="handleTerminate(record as TaskRow)">终止</t-link>
        </t-space>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import type { TdTagProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { Row } from '@/api/model/common';
import type { Status_Counts, TaskItem, TaskQuery } from '@/api/model/taskModel';
import { TaskStatus } from '@/api/model/taskModel';
import { getTaskList } from '@/api/task';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'TaskList',
});

const router = useRouter();

type TaskRow = TaskItem & Row;

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

const taskTypeOptions = [
  { label: '软件开发', value: 'dev' },
  { label: '测试验证', value: 'qa' },
  { label: '设计/UI', value: 'design' },
];

const taskStatusOptions = statusTabs.slice(1);

const defaultQuery: TaskQuery = {
  page: 1,
  limit: 10,
};

const formConfig: FormConfig<TaskRow, keyof TaskRow> = {
  formItem: [
    { label: '任务名称', name: 'name', type: 'input', placeholder: '请输入任务名称', span: 6 },
    {
      label: '任务类型',
      name: 'type',
      type: 'select',
      placeholder: '请选择任务类型',
      options: taskTypeOptions,
      span: 6,
    },
    {
      label: '任务状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择任务状态',
      options: taskStatusOptions,
      span: 6,
    },
    { label: '所属项目', name: 'project', type: 'input', placeholder: '请输入项目名称', span: 6 },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<TaskRow, keyof TaskRow> = {
  tableItem: [
    { title: 'ID', colKey: 'id', width: 70, align: 'center', fixed: 'left' },
    { title: '任务编号', colKey: 'task_no', width: 120, align: 'center' },
    { title: '任务名称', colKey: 'name', minWidth: 180, ellipsis: true },
    { title: '任务类型', colKey: 'project', width: 140 },
    { title: '所属项目', colKey: 'project', minWidth: 200, ellipsis: true },
    { title: '招募方式', colKey: 'recruitment_type_text', width: 120 },
    { title: '任务时间', colKey: 'task_time', width: 180 },
    { title: '任务状态', colKey: 'task_status', width: 110, align: 'center' },
    { title: '所需人员', colKey: 'required_personnel', width: 100, align: 'center' },
    { title: '成员数量', colKey: 'member_count', width: 100, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' },
  ],
};

const currentStatus = ref<string>(statusTabs[0].value);
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
  MessagePlugin.info(`查看任务 ${row.name}`);
  router.push({ name: 'TaskDetail', query: { id: row.id } });
};
const handlePause = (row: TaskRow) => {
  MessagePlugin.warning(`暂停任务 ${row.name}`);
};
const handleResume = (row: TaskRow) => {
  MessagePlugin.success(`恢复任务 ${row.name}`);
};
const handleTerminate = (row: TaskRow) => {
  MessagePlugin.error(`终止任务 ${row.name}`);
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
