<template>
  <t-card :bordered="false" class="log-list-card">
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
      <template #action="{ record }">
        <span class="log-action">{{ record.action }}</span>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue';

import { getLogList } from '@/api/enterprise/project';
import type { LogQuery, ProjectLogItem } from '@/api/model/enterprise/projectModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { parseDateRange } from '@/utils/date';

defineOptions({
  name: 'LogList',
});

const emit = defineEmits<{
  (e: 'update:total', total: number): void;
}>();

const store = useSettingStore();

type LogRow = ProjectLogItem;
type LogListQuery = LogQuery & {
  date_range?: string | [string, string];
};

const defaultQuery: LogListQuery = {
  keyword: '',
  date_range: '',
  page: 1,
  limit: 10,
};

const formConfig: FormConfig<LogListQuery, keyof LogListQuery> = {
  formItem: [
    { label: '关键字', name: 'keyword', type: 'input', placeholder: '请输入关键字', span: 6 },
    {
      label: '时间',
      name: 'date_range',
      type: 'date-range',
      placeholder: '请选择时间范围',
      span: 6,
      props: {
        clearable: true,
        disableDate: (date: Date) => date.getTime() > Date.now(),
      },
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<LogRow, keyof LogRow> = {
  tableItem: [
    { title: '操作人', colKey: 'operator_name', width: 100, align: 'center' as const },
    { title: '详情', colKey: 'desc', width: 200, align: 'center' as const },
    { title: '操作时间', colKey: 'created_at', width: 180, align: 'center' as const },
  ],
};

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<LogListQuery, LogRow>({
  fetcher: async (params) => {
    const { date_range, ...restParams } = params;
    const { start: start_time, end: end_time } = parseDateRange(date_range);
    const res = await getLogList({
      ...restParams,
      start_time,
      end_time,
    });
    const { list = [], total = 0 } = res.data || {};
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
