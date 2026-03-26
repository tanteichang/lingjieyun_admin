<template>
  <t-card class="page-content" :bordered="false">
    <common-table
      row-key="id"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
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
          :theme="TASK_STATUS_TAG[(record as SettlementRow).task_status].theme"
          :variant="TASK_STATUS_TAG[(record as SettlementRow).task_status].variant"
        >
          {{ TASK_STATUS_TAG[(record as SettlementRow).task_status].label || '-' }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link @click="handlePay(record, 'records')">结算记录</t-link>
          <t-link theme="primary" @click="handlePay(record, 'task')">结算</t-link>
        </t-space>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router';

import { getSettlementList } from '@/api/enterprise/settlement';
import type { Row } from '@/api/model/common';
import type { Settlement, SettlementListPayload } from '@/api/model/enterprise/settlement';
import { TASK_STATUS_TAG, TaskStatus } from '@/api/model/enterprise/taskModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useDictStore } from '@/store/modules/enterprise/dict';
import { parseDateRange } from '@/utils/date';

import type { Tab } from './date.vue';

defineOptions({
  name: 'SettlementListPage',
});

const dictStore = useDictStore();

type SettlementRow = Settlement & Row;
type SettlementListQuery = SettlementListPayload & {
  date_range?: string | [string, string];
};

const defaultQuery: SettlementListQuery = {
  page: 1,
  limit: 20,
  date_range: '',
};

const formConfig: FormConfig<SettlementListQuery, keyof SettlementListQuery> = {
  formItem: [
    { label: '任务名称', name: 'task_name', type: 'input', span: 4, placeholder: '请输入任务名称' },
    {
      label: '所属企业',
      name: 'customer_id',
      type: 'select',
      span: 4,
      placeholder: '请选择所属企业',
      props: {
        clearable: true,
        options: dictStore.getCustomerTypeOptions,
      },
    },
    {
      label: '项目名称',
      name: 'project_keyword',
      type: 'input',
      span: 4,
      placeholder: '请输入项目名称',
    },
    {
      label: '任务状态',
      name: 'task_status',
      type: 'select',
      span: 4,
      placeholder: '请选择任务状态',
      props: {
        clearable: true,
        options: [
          { label: '未发布', value: TaskStatus.unpublished },
          { label: '待开始', value: TaskStatus.pending },
          { label: '进行中', value: TaskStatus.ongoing },
          { label: '已暂停', value: TaskStatus.paused },
          { label: '已完成', value: TaskStatus.completed },
          { label: '已终止', value: TaskStatus.terminated },
        ],
      },
    },
    {
      label: '发布时间',
      name: 'date_range',
      type: 'date-range',
      span: 5,
      placeholder: '请选择发布时间',
      props: {
        clearable: true,
        disableDate: (date: Date) => date.getTime() > Date.now(),
      },
    },
  ],
  formData: { ...defaultQuery },
};

const router = useRouter();

const tableConfig: TableConfig<SettlementRow, keyof SettlementRow> = {
  tableItem: [
    { title: '任务编号', colKey: 'task_no', minWidth: 120, align: 'center' },
    { title: '任务名称', colKey: 'task_title', minWidth: 200, align: 'center' },
    { title: '发布时间', colKey: 'publish_time', minWidth: 120, align: 'center' },
    { title: '任务类型', colKey: 'job_name', minWidth: 180, align: 'center' },
    { title: '所属项目', colKey: 'project_name', minWidth: 150, align: 'center' },
    { title: '发票类型', colKey: 'invoice_type_name', minWidth: 180, align: 'center' },
    { title: '任务状态', colKey: 'task_status', minWidth: 220, align: 'center' },
    { title: '操作', colKey: 'op', width: 200, align: 'left', fixed: 'right' },
  ],
};

const tableHook = useCommonTable<SettlementListQuery, SettlementRow>({
  fetcher: async (params) => {
    const { date_range, ...restParams } = params;
    const { start: start_time, end: end_time } = parseDateRange(date_range);
    const { data } = await getSettlementList({
      ...restParams,
      start_time,
      end_time,
    });
    return {
      list: data.list || [],
      total: data.total || 0,
    };
  },
  defaultQuery,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;

const handleSearch = (payload?: Partial<SettlementListQuery>) => {
  search(payload || {});
};

const handleReset = () => {
  reset();
};
const handlePay = (record: SettlementRow, tab: Tab) => {
  router.push({
    name: 'PaymentDate',
    query: {
      id: record.id || '',
      tab,
    },
  });
};
</script>
<style scoped lang="less">
.page-content {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
