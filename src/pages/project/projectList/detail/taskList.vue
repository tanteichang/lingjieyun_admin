<template>
  <t-card :bordered="false" class="task-list-card">
    <common-table
      :data="tableData"
      :loading="dataLoading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #status="{ record }">
        <t-tag :theme="statusTag[(record as TaskRow).status].theme">
          {{ statusTag[(record as TaskRow).status].label }}
        </t-tag>
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

import type { TaskQuery } from '@/api/model/projectModel';
import { getTaskList } from '@/api/project';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'TaskList',
});

const emit = defineEmits<{
  (e: 'update:total', total: number): void;
}>();
const store = useSettingStore();
const router = useRouter();

// Task相关类型定义
export type TaskStatus = 'processing' | 'paused' | 'completed' | 'terminated' | '';

export interface TaskItem {
  id: number;
  code: string;
  name: string;
  type: string;
  recruitType: string;
  status: TaskStatus;
  memberCount: number;
}

type TaskRow = TaskItem;

const defaultQuery: TaskQuery = {
  name: '',
  status: '',
  page: 1,
  limit: 20,
};

const formConfig: FormConfig<TaskRow, keyof TaskRow> = {
  formItem: [
    { label: '任务名称', name: 'name', type: 'input', placeholder: '请输入任务名称', span: 6 },
    {
      label: '任务状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择任务状态',
      options: [
        { label: '进行中', value: 'processing' },
        { label: '已暂停', value: 'paused' },
        { label: '已完成', value: 'completed' },
        { label: '已终止', value: 'terminated' },
      ],
      span: 6,
    },
  ],
  formData: {
    name: '',
    status: '',
  },
};

const tableConfig: TableConfig<TaskRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 80, align: 'center' as const, fixed: 'left' },
    { title: '任务编号', colKey: 'code', width: 120, align: 'center' as const },
    { title: '任务名称', colKey: 'name', minWidth: 240, ellipsis: true },
    { title: '任务类型', colKey: 'type', width: 120, align: 'center' as const },
    { title: '招募方式', colKey: 'recruitType', width: 120, align: 'center' as const },
    { title: '任务状态', colKey: 'status', width: 120, align: 'center' as const },
    { title: '成员数量', colKey: 'memberCount', width: 120, align: 'center' as const },
    { title: '操作', colKey: 'op', width: 180, fixed: 'right', align: 'center' as const },
  ],
};

const statusTag: Record<
  TaskStatus,
  { label: string; theme: 'primary' | 'warning' | 'success' | 'danger'; variant?: 'light' | 'light-outline' }
> = {
  '': { label: '全部', theme: 'primary', variant: 'light' },
  processing: { label: '进行中', theme: 'success', variant: 'light' },
  paused: { label: '已暂停', theme: 'primary', variant: 'light-outline' },
  completed: { label: '已完成', theme: 'primary', variant: 'light' },
  terminated: { label: '已终止', theme: 'danger', variant: 'light' },
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
    const { list, total } = await getTaskList(params);
    return {
      list,
      total,
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
  router.push({ name: 'TaskPublish' });
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
