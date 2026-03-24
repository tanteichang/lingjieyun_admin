<template>
  <div class="page-content">
    <settlement-task-info-card :task-info="taskInfo" :plan-date="route.query.date" />
    <t-tabs v-model="activeTab" class="settlement-tabs">
      <t-tab-panel value="task" label="任务结算">
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
          <template #toolbar>
            <t-button theme="primary" @click="handleDownloadTemplate">
              下载模板
              <template #icon>
                <t-icon name="user-arrow-down" />
              </template>
            </t-button>
            <t-button theme="primary" @click="handleImportSettlement">
              上传结算单
              <template #icon>
                <t-icon name="upload-1" />
              </template>
            </t-button>
          </template>
          <template #delivery_status="{ record }">
            <t-tag
              :theme="getDeliveryStatusTag((record as DeliveryRow).delivery_status).theme"
              :variant="getDeliveryStatusTag((record as DeliveryRow).delivery_status).variant"
              :color="getDeliveryStatusTag((record as DeliveryRow).delivery_status).color"
              >{{ getDeliveryStatusTag((record as DeliveryRow).delivery_status).label || '-' }}</t-tag
            >
          </template>
        </common-table>
      </t-tab-panel>
      <t-tab-panel value="records" label="结算记录">
        <common-table
          :data="recordTableData"
          :loading="recordLoading"
          :pagination="recordPagination"
          :form-config="recordFormConfig"
          :table-config="recordTableConfig"
          @page-change="handleRecordPageChange"
        >
          <template #status_text="{ record }">
            <t-tag :theme="(record as SettlementRecordRow).fail_count > 0 ? 'warning' : 'success'" variant="light">
              {{ (record as SettlementRecordRow).status_text }}
            </t-tag>
          </template>
          <template #action>
            <t-link theme="primary" hover="color">查看详情</t-link>
          </template>
        </common-table>
      </t-tab-panel>
    </t-tabs>

    <t-dialog
      v-model:visible="uploadDialogVisible"
      header="上传结算单"
      width="560px"
      :close-on-overlay-click="false"
      :confirm-btn="{ content: '确认导入', loading: importSubmitting }"
      @confirm="handleConfirmImport"
      @cancel="handleCancelImport"
      @close="handleCancelImport"
    >
      <t-space direction="vertical" style="width: 100%">
        <t-alert theme="info" title="请上传结算单文件（.xlsx/.xls），上传后将自动执行文件传输。" />
        <auto-upload v-model="uploadFiles" :max="1" accept=".xlsx,.xls">
          <t-button theme="default"
            >选择文件
            <template #icon>
              <t-icon name="file-excel" />
            </template>
          </t-button>
        </auto-upload>
      </t-space>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { UploadFile } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import {
  downloadSettlementTemplate,
  getImportSettlementList,
  getSettlementDetail,
  importSettlement,
} from '@/api/enterprise/settlement';
import type { Row } from '@/api/model/common';
import { DELIVERY_STATUS_TAG } from '@/api/model/enterprise/delivery';
import type {
  ImportSettlementListLogPayload,
  ImportSettlementLog,
  SettlementDeliveryItem,
  SettlementDetailPayload,
  SettlementTaskInfo,
} from '@/api/model/enterprise/settlement';
import AutoUpload from '@/components/auto-upload/index.vue';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

import SettlementTaskInfoCard from './components/SettlementTaskInfoCard.vue';

defineOptions({
  name: 'SettlementDetailPage',
});

type DeliveryRow = SettlementDeliveryItem & Row;
interface SettlementRecordRow extends Row {
  id: number;
  upload_no: string;
  file_name: string;
  created_at: string;
  settlement_count: number;
  success_count: number;
  fail_count: number;
  status_text: string;
  action?: string;
}

const route = useRoute();
const taskInfo = ref<SettlementTaskInfo | null>(null);
const activeTab = ref<'task' | 'records'>('task');
const uploadFiles = ref<UploadFile[]>([]);
const uploadDialogVisible = ref(false);
const importSubmitting = ref(false);

const formConfig: FormConfig<SettlementDetailPayload, keyof SettlementDetailPayload> = {
  formItem: [],
  formData: {
    product_id: Number(route.query.id) || 0,
    plan_date: String(route.query.date || ''),
    name: '',
    mobile: '',
    page: 1,
    limit: 20,
  },
};

const tableConfig: TableConfig<DeliveryRow, keyof DeliveryRow> = {
  tableItem: [
    { title: '姓名', colKey: 'name', minWidth: 120, align: 'center' },
    { title: '手机号', colKey: 'mobile', minWidth: 140, align: 'center' },
    { title: '身份证号', colKey: 'id_card', minWidth: 180, align: 'center' },
    { title: '交付状态', colKey: 'delivery_status', minWidth: 120, align: 'center' },
    { title: '计划交付日期', colKey: 'plan_delivery_date', minWidth: 150, align: 'center' },
    { title: '创建时间', colKey: 'created_at', minWidth: 180, align: 'center' },
  ],
};
const recordFormConfig: FormConfig<Record<string, never>, never> = {
  formItem: [],
  formData: {},
};
const recordTableConfig: TableConfig<SettlementRecordRow, keyof SettlementRecordRow> = {
  tableItem: [
    { title: '上传编号', colKey: 'upload_no', minWidth: 180, align: 'center' },
    { title: '文件名', colKey: 'file_name', minWidth: 240, align: 'center' },
    { title: '上传时间', colKey: 'created_at', minWidth: 180, align: 'center' },
    { title: '结算人数', colKey: 'settlement_count', minWidth: 100, align: 'center' },
    { title: '成功人数', colKey: 'success_count', minWidth: 100, align: 'center' },
    { title: '失败人数', colKey: 'fail_count', minWidth: 100, align: 'center' },
    { title: '结果', colKey: 'status_text', minWidth: 120, align: 'center' },
    { title: '操作', colKey: 'action', minWidth: 120, align: 'center' },
  ],
};

const tableHook = useCommonTable<SettlementDetailPayload, DeliveryRow>({
  fetcher: async (params) => {
    const { data } = await getSettlementDetail(params);
    taskInfo.value = data.task_info || null;
    return {
      list: data.delivery_list || [],
      total: data.delivery_total || 0,
    };
  },
  defaultQuery: formConfig.formData as SettlementDetailPayload,
  autoSearch: true,
  debounceWait: 300,
});
const recordTableHook = useCommonTable<ImportSettlementListLogPayload, SettlementRecordRow>({
  fetcher: async (params) => {
    const { data } = await getImportSettlementList(params);
    console.log(data);
    const source = data.list || [];
    const list = source.map((item: ImportSettlementLog) => {
      let statusText = '导入失败';
      if ((item.fail_count || 0) === 0) {
        statusText = '导入成功';
      } else if ((item.success_count || 0) > 0) {
        statusText = '部分成功';
      }

      return {
        id: item.id,
        upload_no: item.batch_no,
        file_name: item.remark || '-',
        created_at: item.start_time_text || '-',
        settlement_count: item.stats?.settlement_count || item.total_count || 0,
        success_count: item.success_count || 0,
        fail_count: item.fail_count || 0,
        status_text: statusText,
      };
    });
    return {
      list,
      total: data.total || 0,
    };
  },
  defaultQuery: {
    page: 1,
    limit: 20,
  },
  defaultPagination: {
    current: 1,
    pageSize: 20,
    pageSizeOptions: [20, 50, 100],
    showJumper: false,
    showPageSize: true,
    totalContent: true,
  },
  autoSearch: true,
  debounceWait: 0,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;
const {
  data: recordTableData,
  loading: recordLoading,
  pagination: recordPagination,
  handlePageChange: handleRecordPageChange,
  refresh: refreshRecordTable,
} = recordTableHook;

const handleSearch = (payload?: Partial<SettlementDetailPayload>) => {
  search(payload || {});
};

const handleReset = () => {
  reset();
};

const getDeliveryStatusTag = (status: DeliveryRow['delivery_status']) => {
  return DELIVERY_STATUS_TAG[status];
};

const handleImportSettlement = (_e: Event) => {
  uploadDialogVisible.value = true;
};

const handleCancelImport = () => {
  uploadDialogVisible.value = false;
  uploadFiles.value = [];
};

const handleConfirmImport = async () => {
  const currentFile = uploadFiles.value[0];
  const fileUrl = currentFile?.url;
  if (!currentFile || !fileUrl) {
    MessagePlugin.warning('请先上传结算单文件');
    return;
  }

  importSubmitting.value = true;
  try {
    const { msg, data, code } = await importSettlement({
      file_url: fileUrl,
      file_name: currentFile.name || '',
    });
    if (code === 200) {
      MessagePlugin.success(msg);
    } else {
      MessagePlugin.error(msg, 0);
    }

    if (data.errors.length > 0) {
      data.errors.forEach((item) => {
        MessagePlugin.warning(item.error || '');
      });
    }
    refreshRecordTable();
    uploadDialogVisible.value = false;
    uploadFiles.value = [];
    search({});
  } finally {
    importSubmitting.value = false;
  }
};

const handleDownloadTemplate = () => {
  downloadSettlementTemplate({
    type: 'with_members',
    product_id: formConfig.formData.product_id,
    plan_date: formConfig.formData.plan_date,
  }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${taskInfo.value?.task_title || ''}${formConfig.formData.plan_date}结算单.xlsx`);
    document.body.appendChild(link);
    link.click();
  });
};
</script>
<style scoped lang="less">
.page-content {
  display: grid;
  gap: 12px;
  padding: 16px;
  background: #fff;
}

.settlement-tabs {
  :deep(.t-tabs__nav) {
    padding: 10px;
  }
}
</style>
