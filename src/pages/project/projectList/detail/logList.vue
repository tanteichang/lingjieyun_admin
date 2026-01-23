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
import { computed } from 'vue';

import type { LogQuery } from '@/api/model/projectModel';
import { getLogList } from '@/api/project';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'LogList',
});

const store = useSettingStore();

// Log相关类型定义
export interface LogItem {
  id: number;
  operator: string;
  operateTime: string;
}

type LogRow = LogItem;

const defaultQuery: LogQuery = {
  dateRange: [],
  page: 1,
  limit: 20,
};

const formConfig: FormConfig<LogQuery, keyof LogQuery> = {
  formItem: [{ label: '时间范围', name: 'dateRange', type: 'date-range', placeholder: '请输入操作时间范围', span: 12 }],
  formData: {
    dateRange: ['2022-01-01 11:11:11', '2022-08-08 12:12:12'],
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

const tableHook = useCommonTable<TaskQuery, LogRow>({
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
