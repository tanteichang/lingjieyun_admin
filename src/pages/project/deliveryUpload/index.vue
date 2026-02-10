<template>
  <t-card class="delivery-upload-page" :bordered="false">
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      :header-affixed-top="headerAffixedTop"
      selection-type="multiple"
      :selected-row-keys="[]"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #customer_info="{ record }">
        <t-tooltip :content="record.customer_info?.full_name || '-'">
          <span>{{ record.customer_info?.name || '-' }}</span>
        </t-tooltip>
      </template>
      <template #delivery_mode="{ record }">
        {{ getDeliveryModeText(record.delivery_mode) }}
      </template>
      <template #project="{ record }">
        {{ record.project?.name || '-' }}
      </template>
      <template #op="{ record }">
        <t-button theme="primary" variant="text">交付物明细</t-button>
        <t-button theme="primary" variant="text" @click="handleUpload(record)">上传交付物</t-button>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { Row } from '@/api/model/common';
import type { TaskItem, TaskQuery } from '@/api/model/taskModel';
import { DeliveryMode } from '@/api/model/taskModel';
import { getTaskList } from '@/api/task';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'DeliveryUpload',
});

const router = useRouter();

const route = useRoute();

type TaskListQuery = TaskQuery;

type TaskRow = TaskItem & Row;

const formConfig = {
  formItem: [],
  formData: {},
};

const tableConfig: TableConfig<TaskRow, keyof TaskRow> = {
  tableItem: [
    { title: 'ID', colKey: 'id', width: 80, align: 'center', fixed: 'left' },
    { title: '发布时间', colKey: 'created_at', width: 200, align: 'center' },
    { title: '任务名称', colKey: 'name', minWidth: 200, ellipsis: true },
    { title: '所属项目', colKey: 'project', minWidth: 200, ellipsis: true },
    { title: '所属企业', colKey: 'customer_info', width: 140, align: 'center' },
    { title: '交付模式', colKey: 'delivery_mode', width: 140, align: 'center' },
    { title: '任务状态', colKey: 'task_status_text', width: 140, align: 'center' },
    { title: '任务时间', colKey: 'task_time', width: 180, align: 'center' },
    { title: '操作', colKey: 'op', width: 120, align: 'center', fixed: 'right' },
  ],
};

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<TaskListQuery, TaskRow>({
  fetcher: async (params) => {
    const { data } = await getTaskList(params);
    const list = data.list || [];
    return {
      list,
      total: data.total ?? list.length,
    };
  },
  defaultQuery: formConfig.formData,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search: handleSearch, reset: handleReset, handlePageChange } = tableHook;

const handleUpload = (record: TaskRow) => {
  router.push({
    name: 'DeliveryUploadDetail',
    query: {
      task_id: record.id,
    },
  });
};

const getDeliveryModeText = (deliveryMode: DeliveryMode) => {
  switch (deliveryMode) {
    case DeliveryMode.MINI_APP:
      return '小程序上传';
    case DeliveryMode.SYSTEM_BATCH:
      return '系统批量上传';
    case DeliveryMode.BOTH:
      return '小程序上传/系统批量上传';
    default:
      return '-';
  }
};
</script>
<style lang="less" scoped>
.delivery-upload-page {
  padding: 0;
}
</style>
