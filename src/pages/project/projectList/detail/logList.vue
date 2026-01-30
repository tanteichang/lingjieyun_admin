<template>
  <t-card :bordered="false" class="log-list-card">
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
      <template #action="{ record }">
        <span class="log-action">{{ record.action }}</span>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue';

import { getLogList } from '@/api/project';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'LogList',
});

const emit = defineEmits<{
  (e: 'update:total', total: number): void;
}>();

const store = useSettingStore();

// Log相关类型定义
export interface LogItem {
  id: number;
  operator: string;
  action: string;
  operateTime: string;
}

type LogRow = LogItem;

const defaultQuery = {
  name: '',
  time: '',
  status: '',
  page: 1,
  limit: 20,
};

const formConfig = {
  formItem: [
    { label: '关键字', name: 'name', type: 'input', placeholder: '请输入名称标签', span: 6 },
    { label: '时间', name: 'time', type: 'input', placeholder: '请输入时间范围', span: 6 },
    {
      label: '任务状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择合同编号',
      options: [],
      span: 6
    },
  ],
  formData: {
    name: '',
    time: '',
    status: '',
  },
};

const tableConfig: TableConfig<LogRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 80, align: 'center' as const, fixed: 'left' },
    { title: '操作人', colKey: 'operator', width: 120, align: 'center' as const },
    { title: '操作', colKey: 'action', minWidth: 300, ellipsis: true },
    { title: '操作时间', colKey: 'operateTime', width: 180, align: 'center' as const },
  ],
};

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable({
  fetcher: async (params) => {
    const { list, total } = await getLogList(params);
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
    emit('update:total', newTotal);
  },
  { immediate: true },
);
</script>
<style lang="less" scoped>
.log-list-card {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.log-action {
  color: #333;
}
</style>
