<template>
  <t-card class="delivery-upload-page" :bordered="false">
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      :header-affixed-top="headerAffixedTop"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #customer_info="{ record }">
        <t-tooltip :content="record.customer_info?.full_name || '-'">
          <span>{{ record.customer_info?.name || '-' }}</span>
        </t-tooltip>
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
import { useRouter } from 'vue-router';

import { getDeliveryUploadList } from '@/api/delivery';
import type { Row } from '@/api/model/common';
import type { DeliveryUploadItem, DeliveryUploadListPayload } from '@/api/model/delivery';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'DeliveryUpload',
});

const router = useRouter();

type DeliveryUploadListQuery = DeliveryUploadListPayload;

type DeliveryUploadRow = DeliveryUploadItem & Row;

const formConfig: FormConfig<DeliveryUploadListQuery, keyof DeliveryUploadListQuery> = {
  formItem: [
    { label: '企业名称', name: 'enterprise_name', type: 'input', placeholder: '请输入企业名称', span: 6 },
    { label: '项目名称', name: 'project_name', type: 'input', placeholder: '请输入所属项目名称', span: 6 },
    {
      label: '交付状态',
      name: 'delivery_status',
      type: 'select',
      placeholder: '请选择交付状态',
      span: 6,
      props: {
        options: [],
      },
    },
  ],
  formData: {
    project_name: '',
    enterprise_name: '',
    delivery_status: null,
    page: 1,
    limit: 20,
  },
};

const tableConfig: TableConfig<DeliveryUploadRow, keyof DeliveryUploadRow> = {
  tableItem: [
    { title: '发布时间', colKey: 'created_at', width: 200, align: 'center' },
    { title: '任务名称', colKey: 'name', minWidth: 200, ellipsis: true },
    { title: '所属项目', colKey: 'project_name', minWidth: 200, ellipsis: true },
    { title: '所属企业', colKey: 'enterprise_name', width: 140, align: 'center' },
    { title: '交付模式', colKey: 'delivery_mode_text', width: 140, align: 'center' },
    { title: '交付物上传更新时间', colKey: 'delivery_upload_time', width: 180, align: 'center' },
    { title: '状态', colKey: 'status', width: 140, align: 'center' },
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

const tableHook = useCommonTable<DeliveryUploadListQuery, DeliveryUploadRow>({
  fetcher: async (params) => {
    const { data } = await getDeliveryUploadList(params);
    const list = data.list || [];
    return {
      list,
      total: data.total ?? list.length,
    };
  },
  defaultQuery: formConfig.formData as DeliveryUploadListQuery,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search: handleSearch, reset: handleReset, handlePageChange } = tableHook;

const handleUpload = (record: DeliveryUploadRow) => {
  router.push({
    name: 'DeliveryUploadDetail',
    query: {
      task_id: record.id,
    },
  });
};
</script>
<style lang="less" scoped>
.delivery-upload-page {
  padding: 0;
}
</style>
