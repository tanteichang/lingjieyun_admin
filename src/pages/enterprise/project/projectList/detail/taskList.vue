<template>
  <t-card :bordered="false" class="task-list-card">
    <common-table
      :data="tableData"
      :loading="dataLoading"
      row-key="id"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #select-task_status-option="{ option }">
        <t-tag
          :color="TASK_STATUS_TAG[option.value as TaskStatus]?.color"
          :theme="TASK_STATUS_TAG[option.value as TaskStatus]?.theme"
          :variant="TASK_STATUS_TAG[option.value as TaskStatus]?.variant"
        >
          {{ TASK_STATUS_TAG[option.value as TaskStatus]?.label || option.label }}
        </t-tag>
      </template>
      <template #task_status="{ record }">
        <t-tag
          :color="TASK_STATUS_TAG[(record as TaskItem).task_status].color"
          :variant="TASK_STATUS_TAG[(record as TaskItem).task_status].variant"
          :theme="TASK_STATUS_TAG[(record as TaskItem).task_status].theme"
        >
          {{ TASK_STATUS_TAG[(record as TaskItem).task_status].label }}
        </t-tag>
      </template>
      <template #recruitment_type_text="{ record }">
        <div v-for="item in record.recruitment_type_text.split(',')" :key="item">
          {{ item.trim() }}
        </div>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-row align="middle" justify="space-around">
            <t-col>
              <t-link theme="primary" hover="color" @click="handleView(record)">详情</t-link>
            </t-col>
          </t-row>
        </t-space>
      </template>
      <template #toolbar>
        <t-button theme="primary" @click="handleCreate">发布任务</t-button>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';

import { getTaskList } from '@/api/enterprise/task';
import type { Row } from '@/api/model/common';
import type { TaskItem, TaskQuery } from '@/api/model/enterprise/taskModel';
import { TASK_STATUS_TAG, TaskStatus } from '@/api/model/enterprise/taskModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { useTaskStore } from '@/store/modules/enterprise/task';

defineOptions({
  name: 'TaskList',
});

const emit = defineEmits<{
  (e: 'update:total', total: number): void;
}>();
const store = useSettingStore();
const taskStore = useTaskStore();
const router = useRouter();

type TaskRow = TaskItem & Row;

const defaultQuery: TaskQuery = {
  task_name: '',
  task_status: null,
  project_id: Number(router.currentRoute.value.query.projectID),
  page: 1,
  limit: 20,
};

const formConfig: FormConfig<TaskQuery, keyof TaskQuery> = {
  formItem: [
    {
      label: '任务名称',
      name: 'task_name',
      type: 'input',
      placeholder: '请输入任务名称',
      span: 6,
      props: { clearable: true },
    },
    {
      label: '任务状态',
      name: 'task_status',
      type: 'select',
      placeholder: '请选择任务状态',
      props: {
        clearable: true,
        options: [
          { label: '未发布', value: TaskStatus.unpublished },
          { label: '进行中', value: TaskStatus.ongoing },
          { label: '已暂停', value: TaskStatus.paused },
          { label: '已完成', value: TaskStatus.completed },
          { label: '已终止', value: TaskStatus.terminated },
        ],
      },
      span: 6,
    },
  ],
  formData: {
    task_name: '',
    task_status: null,
  },
};

const tableConfig: TableConfig<TaskRow, keyof TaskRow> = {
  tableItem: [
    { title: '任务编号', colKey: 'task_no', width: 120, align: 'center' as const },
    { title: '任务名称', colKey: 'name', width: 200, ellipsis: true },
    { title: '任务类型', colKey: 'job_name', width: 120, align: 'center' as const },
    { title: '招募方式', colKey: 'recruitment_type_text', width: 120, align: 'center' as const },
    { title: '任务状态', colKey: 'task_status', width: 120, align: 'center' as const },
    { title: '成员数量', colKey: 'member_count', width: 120, align: 'center' as const },
    { title: '操作', colKey: 'op', width: 60, fixed: 'right', align: 'center' as const },
  ],
};

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
    // 存储当前页面的任务列表
    taskStore.setTasks(data?.list || []);
    return {
      list: data?.list || [],
      total: data?.total || 0,
    };
  },
  defaultQuery,
  debounceWait: 400,
});

const {
  data: tableData,
  loading: dataLoading,
  pagination,
  search: handleSearch,
  reset: handleReset,
  handlePageChange,
} = tableHook;

// 监听总数变化，传递给父组件
watch(
  () => pagination.total,
  (newTotal) => {
    if (newTotal !== undefined) {
      emit('update:total', newTotal);
    }
  },
  { immediate: true },
);

const handleView = (row: TaskRow) => {
  router.push({ name: 'TaskDetail', query: { id: row.id } });
};

const handleCreate = () => {
  const projectID = router.currentRoute.value.query.projectID as string;
  router.push({ name: 'ProjectPublishTask', query: { projectID } });
};
</script>
<style lang="less" scoped>
.task-list-card {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
