<template>
  <common-table :table-config="tableConfig" :form-config="formConfig"> </common-table>
</template>
<script setup lang="ts">
import { reactive } from 'vue';

import type { TaskQuery } from '@/api/model/projectModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';

const query = reactive<TaskQuery>({
  name: '',
  status: '',
  page: 1,
  limit: 20,
});

const tableConfig: TableConfig = {
  tableItem: [
    { title: '#', colKey: 'index', width: 50 },
    { title: '任务编号', colKey: 'code', width: 120 },
    { title: '任务名称', colKey: 'name', width: 120 },
    { title: '任务类型', colKey: 'type', width: 120 },
    { title: '招募方式', colKey: 'recruitType', width: 120 },
    { title: '任务状态', colKey: 'status', width: 120 },
    { title: '成员数量', colKey: 'memberCount', width: 120 },
    { title: '操作', colKey: 'op', width: 120 },
  ],
};
const formConfig: FormConfig<keyof TaskQuery> = {
  formItem: [
    { label: '任务名称', name: 'name', span: 6, type: 'input' },
    {
      label: '任务类型',
      name: 'status',
      span: 6,
      type: 'select',
      options: [
        { label: '资讯服务费', value: 12 },
        { label: '移动端项目', value: 23 },
        { label: '企业服务', value: 43 },
      ],
    },
  ],
  formData: query,
};
</script>
