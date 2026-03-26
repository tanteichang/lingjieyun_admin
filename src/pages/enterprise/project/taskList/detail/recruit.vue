<template>
  <div class="recruit-page">
    <task-basic-info-card :task-info="taskInfo" />

    <t-card :bordered="false" class="action-card">
      <t-space :size="20">
        <t-button :theme="activeTab === 'batch' ? 'primary' : 'default'" @click="openBatchRecruitDialog"
          >批量招募</t-button
        >
        <t-button :theme="activeTab === 'upload' ? 'primary' : 'default'" @click="handleSwitchUploadTab">
          批量上传身份证件
        </t-button>
        <t-alert theme="warning" message="请先招募，再上传身份证照片" />
      </t-space>
    </t-card>

    <t-card v-if="batchRecruitResult" :bordered="false">
      <div class="progress-head">
        批量招募任务已完成招募进度：
        <span class="progress-value"
          >{{ batchRecruitResult?.success_count || 0 }}/{{ batchRecruitResult?.total_count || 0 }}</span
        >
      </div>
      <div class="progress-row">
        <t-progress
          :percentage="((batchRecruitResult?.success_count || 0) / (batchRecruitResult?.total_count || 0)) * 100"
          :show-label="false"
        />
      </div>
      <div class="metrics">
        <div class="metric-item">
          <span class="metric-label">开始时间</span>
          <span class="metric-value">{{ batchRecruitStartTime }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">完成时间</span>
          <span class="metric-value">{{ batchRecruitEndTime }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">招募人数</span>
          <span class="metric-value">{{ batchRecruitResult?.total_count || 0 }}</span>
        </div>
        <div class="metric-item">
          <span class="metric-label">成功</span>
          <span class="metric-value success">{{ batchRecruitResult?.success_count || 0 }}</span>
        </div>

        <div class="metric-item">
          <span class="metric-label">失败</span>
          <span class="metric-value fail">{{ batchRecruitResult?.fail_count || 0 }}</span>
        </div>
      </div>
    </t-card>

    <t-card :bordered="false">
      <h3 class="section-title">批量招募记录</h3>
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
        <template #start_time="{ record }">
          {{ new Date((record as RecruitRecordRow).start_time * 1000).toLocaleString() }}
        </template>
        <template #end_time="{ record }">
          {{ new Date((record as RecruitRecordRow).end_time * 1000).toLocaleString() }}
        </template>
        <template #status="{ record }">
          <t-tag :theme="(record as RecruitRecordRow).fail_count > 0 ? 'warning' : 'success'" variant="light">
            {{ (record as RecruitRecordRow).fail_count > 0 ? '失败' : '成功' }}
          </t-tag>
        </template>
        <template #op="{ record }">
          <t-space :size="16">
            <t-link
              :disabled="(record as RecruitRecordRow).success_count === 0"
              theme="primary"
              hover="color"
              @click="viewSuccessRecord(record as RecruitRecordRow)"
            >
              成功记录
            </t-link>
            <t-link
              theme="danger"
              hover="color"
              :disabled="(record as RecruitRecordRow).fail_count === 0"
              @click="viewFailRecord(record as RecruitRecordRow)"
            >
              失败记录
            </t-link>
          </t-space>
        </template>
      </common-table>
    </t-card>

    <batch-import-dialog
      v-model:visible="batchRecruitDialogVisible"
      :max="1"
      title="导入招募自由职业者"
      upload-text="点击批量导入自由职业者"
      template-button-text="下载模版"
      tip-text="* 请先下载模版录入招募清单，再导入"
      confirm-text="确认招募"
      @download-template="downloadTemplate"
      @confirm="handleConfirmBatchRecruit"
    />
    <id-card-upload-drawer v-model:visible="idCardUploadDialogVisible" :submit="handleBatchUploadIdCard" />
    <t-dialog v-model:visible="successDialogVisible" header="成功记录" width="900px" :footer="false" destroy-on-close>
      <t-table row-key="row_index" :data="successDetailList" :columns="successDetailColumns" :pagination="null" />
    </t-dialog>
    <t-dialog v-model:visible="failDialogVisible" header="失败记录" width="1000px" :footer="false" destroy-on-close>
      <t-table row-key="row_index" :data="failDetailList" :columns="failDetailColumns" :pagination="null" />
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getImportLogList } from '@/api/enterprise/import';
import { batchRealname } from '@/api/enterprise/talentpool';
import { batchRecruit, downloadRecruitTemplate, getTaskDetail } from '@/api/enterprise/task';
import type { Row } from '@/api/model/common';
import type { ImportDetailItem, ImportLogItem, ImportLogQuery } from '@/api/model/enterprise/import';
import { ImportDataType } from '@/api/model/enterprise/import';
import type { BatchRecruitResult, TaskDetailResult } from '@/api/model/enterprise/taskModel';
import type { BatchImportConfirmPayload } from '@/components/batch-import-dialog/index.vue';
import BatchImportDialog from '@/components/batch-import-dialog/index.vue';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useTaskStore } from '@/store/modules/enterprise/task';

import IdCardUploadDrawer from './components/IdCardUploadDrawer.vue';
import TaskBasicInfoCard from './components/TaskBasicInfoCard.vue';

defineOptions({
  name: 'Recruit',
});

type RecruitRecordRow = ImportLogItem & Row;

const route = useRoute();
const taskStore = useTaskStore();

const activeTab = ref<'batch' | 'upload'>('batch');
const taskInfo = ref<TaskDetailResult | null>(null);
const batchRecruitDialogVisible = ref(false);
const idCardUploadDialogVisible = ref(false);
const batchRecruitResult = ref<BatchRecruitResult>(null);
const batchRecruitStartTime = ref<string>('');
const batchRecruitEndTime = ref<string>('');
const successDialogVisible = ref(false);
const successDetailList = ref<ImportDetailItem[]>([]);
const failDialogVisible = ref(false);
const failDetailList = ref<ImportDetailItem[]>([]);
const formConfig: FormConfig<ImportLogQuery, keyof ImportLogQuery> = {
  formItem: [],
  formData: {
    page: 1,
    limit: 20,
    data_type: ImportDataType.BatchRecruit,
  },
};

const tableConfig: TableConfig<RecruitRecordRow, keyof RecruitRecordRow> = {
  tableItem: [
    { title: '开始时间', colKey: 'start_time', width: 180, align: 'center' },
    { title: '完成时间', colKey: 'end_time', width: 180, align: 'center' },
    { title: '成功数', colKey: 'success_count', width: 100, align: 'center' },
    { title: '失败数', colKey: 'fail_count', width: 100, align: 'center' },
    { title: '状态', colKey: 'status', width: 100, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' },
  ],
};

const tableHook = useCommonTable<ImportLogQuery, RecruitRecordRow>({
  fetcher: async (params) => {
    const { data } = await getImportLogList({
      ...params,
      task_id: Number(route.query.id),
      data_type: ImportDataType.BatchRecruit,
    });
    return {
      list: data.list || [],
      total: data.total || 0,
    };
  },
  defaultQuery: formConfig.formData as ImportLogQuery,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;

const successDetailColumns: PrimaryTableCol<TableRowData>[] = [
  {
    title: '姓名',
    colKey: 'name',
    cell: (_, { row }) => ((row as ImportDetailItem).data?.[0] as string) || '-',
  },
  {
    title: '手机号',
    colKey: 'phone',
    cell: (_, { row }) => String((row as ImportDetailItem).data?.[1] ?? '-'),
  },
  {
    title: '身份证号',
    colKey: 'id_card',
    cell: (_, { row }) => ((row as ImportDetailItem).data?.[2] as string) || '-',
  },
];

const failDetailColumns: PrimaryTableCol<TableRowData>[] = [
  {
    title: '姓名',
    colKey: 'name',
    cell: (_, { row }) => ((row as ImportDetailItem).data?.[0] as string) || '-',
  },
  {
    title: '手机号',
    colKey: 'phone',
    cell: (_, { row }) => String((row as ImportDetailItem).data?.[1] ?? '-'),
  },
  {
    title: '身份证号',
    colKey: 'id_card',
    cell: (_, { row }) => ((row as ImportDetailItem).data?.[2] as string) || '-',
  },
  {
    title: '失败原因',
    colKey: 'error',
    minWidth: 240,
    cell: (_, { row }) => ((row as ImportDetailItem).status === 'fail' ? (row as ImportDetailItem).error || '-' : '-'),
  },
];

const formatDateTime = (date: Date) => {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())} ${pad(date.getHours())}:${pad(
    date.getMinutes(),
  )}:${pad(date.getSeconds())}`;
};

const fetchTaskDetail = () => {
  const taskId = Number(route.query.id);
  if (!taskId) {
    return;
  }
  getTaskDetail({ task_id: taskId }).then((res) => {
    if (res.code === 200) {
      taskInfo.value = res.data;
    }
  });
};

onMounted(() => {
  fetchTaskDetail();
});

const handleSwitchUploadTab = () => {
  activeTab.value = 'upload';
  idCardUploadDialogVisible.value = true;
};

const handleBatchUploadIdCard = (images: Array<{ url: string; filename: string }>) => {
  return batchRealname({ images });
};

const openBatchRecruitDialog = () => {
  activeTab.value = 'batch';
  batchRecruitDialogVisible.value = true;
};

const downloadTemplate = () => {
  downloadRecruitTemplate().then((res) => {
    const url = window.URL.createObjectURL(new Blob([res]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `招募自由者模版.xlsx`);
    document.body.appendChild(link);
    link.click();
  });
};

const handleConfirmBatchRecruit = (payload: BatchImportConfirmPayload) => {
  batchRecruitStartTime.value = formatDateTime(new Date());
  batchRecruitEndTime.value = '-';
  batchRecruit({
    task_id: Number(route.query.id),
    source_url: payload.file.url,
  })
    .then((res) => {
      if (res.code === 200) {
        taskStore.markTaskDetailShouldRefresh(String(route.query.id || ''));
        fetchTaskDetail();
      }
      batchRecruitResult.value = res.data;
      batchRecruitEndTime.value = formatDateTime(new Date());
      MessagePlugin.success(res.msg);
      res.data.import_details.forEach((item) => {
        if (item.error) {
          MessagePlugin.error(`第${item.row_index}行：${item.error}`);
        }
      });
    })
    .catch(() => {
      batchRecruitEndTime.value = formatDateTime(new Date());
    })
    .finally(() => {
      batchRecruitDialogVisible.value = false;
    });
};

const handleSearch = (payload?: Partial<ImportLogQuery>) => {
  search({
    ...(payload || {}),
    data_type: ImportDataType.BatchRecruit,
  });
};

const handleReset = () => {
  reset();
  search({
    data_type: ImportDataType.BatchRecruit,
  });
};

const viewSuccessRecord = (row: RecruitRecordRow) => {
  if (!row.import_details) {
    MessagePlugin.warning('暂无成功记录');
    return;
  }

  const details = row.import_details as ImportDetailItem[];

  const successRows = details.filter((item) => item.status === 'success');
  if (!successRows.length) {
    MessagePlugin.info('暂无成功记录');
    return;
  }

  successDetailList.value = successRows;
  successDialogVisible.value = true;
};

const viewFailRecord = (row: RecruitRecordRow) => {
  if (!row.import_details) {
    MessagePlugin.warning('暂无失败记录');
    return;
  }

  const details = row.import_details as ImportDetailItem[];
  if (!details) {
    MessagePlugin.error('记录解析失败');
    return;
  }

  const failRows = details.filter((item) => item.status === 'fail');
  if (!failRows.length) {
    MessagePlugin.info('暂无失败记录');
    return;
  }

  failDetailList.value = failRows;
  failDialogVisible.value = true;
};
</script>
<style lang="less" scoped>
.recruit-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.progress-head {
  margin-bottom: 14px;
  font-size: 20px;
  font-weight: 600;
}

.progress-value {
  color: var(--td-brand-color);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  :deep(.t-progress) {
    flex: 1;
  }
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 14px 18px;
}

.metric-item {
  display: flex;
  gap: 8px;
}

.metric-label {
  color: var(--td-text-color-placeholder);
}

.metric-value {
  color: var(--td-text-color-primary);
}

.success {
  color: var(--td-success-color);
}

.fail {
  color: var(--td-error-color);
}

@media (max-width: 1200px) {
  .metrics {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }
}
</style>
