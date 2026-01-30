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
import type { DropdownOption } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { Row } from '@/api/model/common';
import type { TaskItem, TaskQuery } from '@/api/model/taskModel';
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

type TaskStatus = 'processing' | 'paused' | 'completed' | 'terminated' | 'draft';

type TaskRow = TaskItem & Row;

const statusTabs: Array<{ label: string; value: TaskStatus | '' }> = [
  { label: '全部', value: '' },
  { label: '未发布', value: 'draft' },
  { label: '进行中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已终止', value: 'terminated' },
];

const statusTag: Record<TaskStatus, { label: string; theme: DropdownOption['theme'] }> = {
  processing: { label: '进行中', theme: 'warning' },
  paused: { label: '已暂停', theme: 'primary' },
  completed: { label: '已完成', theme: 'success' },
  terminated: { label: '已终止', theme: 'danger' },
  draft: { label: '未发布', theme: 'primary' },
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

const tableConfig: TableConfig<TaskRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '任务编号', colKey: 'code', width: 120, align: 'center' },
    { title: '任务名称', colKey: 'name', minWidth: 180, ellipsis: true },
    { title: '任务类型', colKey: 'type', width: 140 },
    { title: '所属项目', colKey: 'project', minWidth: 200, ellipsis: true },
    { title: '招募方式', colKey: 'recruitType', width: 120 },
    { title: '任务时间', colKey: 'taskPeriod', width: 180 },
    { title: '任务状态', colKey: 'status', width: 110, align: 'center' },
    { title: '所需人员', colKey: 'requiredPeople', width: 100, align: 'center' },
    { title: '成员数量', colKey: 'memberCount', width: 100, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' },
  ],
};

const currentStatus = ref<string>('');
const tabCounts = reactive<Record<string, number>>({
  '': 0,
  draft: 0,
  processing: 0,
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
    tabCounts[''] = data.total || 0;
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

// watch(
//   () => tableData.value,
//   (list) => {
//     const countMap: Record<string, number> = { '': pagination.total || 0 };
//     list?.forEach((item) => {
//       countMap[item.status] = (countMap[item.status] || 0) + 1;
//     });
//     Object.keys(tabCounts).forEach((key) => {
//       tabCounts[key] = countMap[key] ?? tabCounts[key];
//     });
//   },
// );

const handleTabChange = (value: string | number) => {
  currentStatus.value = String(value);
  query.status = currentStatus.value;
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
