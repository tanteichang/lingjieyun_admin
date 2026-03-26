<template>
  <t-card :bordered="false" class="talent-list-page">
    <common-table
      row-key="id"
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
      <template #toolbar>
        <t-space>
          <t-button theme="default" @click="openBatchImportDialog">批量新增</t-button>
          <t-button theme="default" @click="openIdCardUploadDialog">批量上传证件</t-button>
          <t-button theme="default" @click="openImportRecordDialog">批量记录</t-button>
        </t-space>
      </template>
      <template #select-auth_status-option="{ option }">
        <t-tag :theme="TalentAuthStatusTag[option.value as TalentAuthStatus].theme">
          {{ TalentAuthStatusTag[option.value as TalentAuthStatus].label }}
        </t-tag>
      </template>
      <template #select-sign_status-option="{ option }">
        <t-tag :theme="TalentSignStatusTag[option.value as TalentSignStatus].theme">
          {{ TalentSignStatusTag[option.value as TalentSignStatus].label }}
        </t-tag>
      </template>
      <template #auth_status_text="{ record }">
        <t-tag :theme="TalentAuthStatusTag[record.auth_status as TalentAuthStatus].theme">
          {{ TalentAuthStatusTag[record.auth_status as TalentAuthStatus].label }}
        </t-tag>
      </template>
      <template #sign_status_text="{ record }">
        <t-tag
          :theme="TalentSignStatusTag[record.sign_status as TalentSignStatus].theme"
          :variant="TalentSignStatusTag[record.sign_status as TalentSignStatus].variant"
        >
          {{ TalentSignStatusTag[record.sign_status as TalentSignStatus].label }}
        </t-tag>
      </template>
      <template #is_face_verified="{ record }">
        {{ record.is_face_verified }}
        <t-tooltip v-if="!record.face_photo_url" content="刷脸认证已过期" theme="danger">
          <t-icon name="info-circle" color="red" />
        </t-tooltip>
      </template>
      <template #join_time="{ record }">
        {{ formatSeconds(record.join_time) }}
      </template>
      <template #op="{ record }">
        <t-button variant="text" theme="primary" @click="handleDetail(record)">详情</t-button>
      </template>
    </common-table>

    <batch-import-dialog
      v-model:visible="batchImportVisible"
      title="导入人才"
      upload-text="点击批量导入人才文件"
      template-button-text="下载模板"
      tip-text="* 请先下载模板录入人才清单，再导入"
      confirm-text="确认导入"
      :confirm-loading="batchImportLoading"
      @download-template="handleDownloadTemplate"
      @confirm="handleConfirmBatchImport"
    />
    <id-card-upload-drawer v-model:visible="idCardUploadDialogVisible" :submit="handleBatchRealnameUpload" />
    <t-drawer v-model:visible="recordDialogVisible" header="批量新增记录" size="80%" :footer="false" destroy-on-close>
      <div class="record-dialog-body">
        <common-table
          row-key="id"
          :data="recordTableData"
          :loading="recordLoading"
          :pagination="recordPagination"
          :form-config="recordFormConfig"
          :table-config="recordTableConfig"
          @search="handleRecordSearch"
          @reset="handleRecordReset"
          @page-change="handleRecordPageChange"
        >
          <template #start_time="{ record }">
            {{ formatTimestamp((record as ImportRecordRow).start_time) }}
          </template>
          <template #end_time="{ record }">
            {{ formatTimestamp((record as ImportRecordRow).end_time) }}
          </template>
          <template #status="{ record }">
            <t-tag :theme="(record as ImportRecordRow).fail_count > 0 ? 'warning' : 'success'" variant="light">
              {{ (record as ImportRecordRow).fail_count > 0 ? '失败' : '成功' }}
            </t-tag>
          </template>
          <template #op="{ record }">
            <t-space :size="16">
              <t-link
                :disabled="(record as ImportRecordRow).success_count === 0"
                theme="primary"
                hover="color"
                @click="viewSuccessRecord(record as ImportRecordRow)"
              >
                成功记录
              </t-link>
              <t-link
                theme="danger"
                hover="color"
                :disabled="(record as ImportRecordRow).fail_count === 0"
                @click="viewFailRecord(record as ImportRecordRow)"
              >
                失败记录
              </t-link>
            </t-space>
          </template>
        </common-table>
      </div>
    </t-drawer>
    <t-dialog v-model:visible="successDialogVisible" header="成功记录" width="980px" :footer="false" destroy-on-close>
      <t-table row-key="row_index" :data="successDetailList" :columns="successDetailColumns" :pagination="null" />
    </t-dialog>
    <t-dialog v-model:visible="failDialogVisible" header="失败记录" width="1080px" :footer="false" destroy-on-close>
      <t-table row-key="row_index" :data="failDetailList" :columns="failDetailColumns" :pagination="null" />
    </t-dialog>
  </t-card>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import type { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getImportLogList } from '@/api/enterprise/import';
import { batchImport, batchUploadIdCard, downloadImportTemplate, getList } from '@/api/enterprise/talentpool';
import type { Row } from '@/api/model/common';
import type { ImportDetailItem, ImportLogItem, ImportLogQuery } from '@/api/model/enterprise/import';
import { ImportDataType } from '@/api/model/enterprise/import';
import type { TalentPoolItem, TalentPoolListQuery } from '@/api/model/enterprise/talentpool';
import {
  TalentAuthStatus,
  TalentAuthStatusTag,
  TalentChannel,
  TalentSignStatus,
  TalentSignStatusTag,
} from '@/api/model/enterprise/talentpool';
import type { BatchImportConfirmPayload } from '@/components/batch-import-dialog/index.vue';
import BatchImportDialog from '@/components/batch-import-dialog/index.vue';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import IdCardUploadDrawer from '@/pages/enterprise/project/taskList/detail/components/IdCardUploadDrawer.vue';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'TalentList',
});

const router = useRouter();

type TalentRow = TalentPoolItem & Row;
type ImportRecordRow = ImportLogItem & Row;

const batchImportVisible = ref(false);
const batchImportLoading = ref(false);
const idCardUploadDialogVisible = ref(false);
const recordDialogVisible = ref(false);
const successDialogVisible = ref(false);
const successDetailList = ref<ImportDetailItem[]>([]);
const failDialogVisible = ref(false);
const failDetailList = ref<ImportDetailItem[]>([]);

const channelOptions = [
  { label: '微信小程序', value: TalentChannel.WechatMiniProgram },
  { label: '后台导入', value: TalentChannel.AdminImport },
  { label: 'H5', value: TalentChannel.H5 },
];

const authStatusOptions = [
  { label: '待认证', value: TalentAuthStatus.Pending },
  { label: '已认证', value: TalentAuthStatus.Verified },
];

const signStatusOptions = [
  { label: '待签约', value: TalentSignStatus.Pending },
  { label: '已签约', value: TalentSignStatus.Signed },
];

const formatSeconds = (value: number | string | null | undefined) => {
  if (!value) return '-';
  const seconds = typeof value === 'string' ? Number(value) : value;
  if (!seconds || Number.isNaN(seconds)) return '-';
  return dayjs(seconds * 1000).format('YYYY-MM-DD HH:mm:ss');
};

const formatTimestamp = (value: number | null | undefined) => {
  if (!value) return '-';
  return dayjs(value * 1000).format('YYYY-MM-DD HH:mm:ss');
};

const defaultQuery: TalentPoolListQuery = {
  page: 1,
  limit: 10,
  name: '',
  phone: '',
  sign_status: undefined,
  auth_status: undefined,
  channel: undefined,
};

const formConfig: FormConfig<TalentPoolListQuery, keyof TalentPoolListQuery> = {
  formItem: [
    { label: '姓名', name: 'name', type: 'input', placeholder: '请输入姓名', span: 4 },
    { label: '手机号', name: 'phone', type: 'input', placeholder: '请输入手机号', span: 4 },
    {
      label: '入驻渠道',
      name: 'channel',
      type: 'select',
      placeholder: '请选择渠道',
      span: 4,
      props: { options: channelOptions },
    },
    {
      label: '认证状态',
      name: 'auth_status',
      type: 'select',
      placeholder: '请选择认证状态',
      span: 4,
      props: { options: authStatusOptions },
    },
    {
      label: '签约状态',
      name: 'sign_status',
      type: 'select',
      placeholder: '请选择签约状态',
      span: 4,
      props: { options: signStatusOptions },
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<TalentRow, keyof TalentRow> = {
  tableItem: [
    { title: '姓名', colKey: 'name', width: 120, align: 'center' },
    { title: '手机号', colKey: 'phone_masked', width: 140, align: 'center' },
    { title: '身份证号', colKey: 'id_card_masked', width: 160, align: 'center' },
    { title: '银行卡号', colKey: 'bank_card_masked', width: 140, align: 'center' },
    { title: '认证状态', colKey: 'auth_status_text', width: 120, align: 'center' },
    { title: '签约状态', colKey: 'sign_status_text', width: 120, align: 'center' },
    { title: '人脸验证', colKey: 'is_face_verified', width: 120, align: 'center' },
    { title: '入驻渠道', colKey: 'channel', width: 120, align: 'center' },
    { title: '评分等级', colKey: 'score_level', width: 120, align: 'center' },
    { title: '签约日期', colKey: 'sign_date', width: 160, align: 'center' },
    { title: '操作', colKey: 'op', width: 120, align: 'left', fixed: 'right' },
  ],
};

const recordDefaultQuery: ImportLogQuery = {
  page: 1,
  limit: 10,
  data_type: ImportDataType.Talent,
};

const recordFormConfig: FormConfig<ImportLogQuery, keyof ImportLogQuery> = {
  formItem: [],
  formData: { ...recordDefaultQuery },
};

const recordTableConfig: TableConfig<ImportRecordRow, keyof ImportRecordRow> = {
  tableItem: [
    { title: '开始时间', colKey: 'start_time', width: 180, align: 'center' },
    { title: '完成时间', colKey: 'end_time', width: 180, align: 'center' },
    { title: '成功数', colKey: 'success_count', width: 100, align: 'center' },
    { title: '失败数', colKey: 'fail_count', width: 100, align: 'center' },
    { title: '状态', colKey: 'status', width: 100, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' },
  ],
};

const detailFieldValue = (row: ImportDetailItem, index: number) => {
  const value = row.data?.[index];
  if (value === undefined || value === null || value === '') return '-';
  return String(value);
};

const successDetailColumns: PrimaryTableCol<TableRowData>[] = [
  {
    title: '姓名',
    colKey: 'name',
    cell: (_, { row }) => detailFieldValue(row as ImportDetailItem, 0),
  },
  {
    title: '手机号',
    colKey: 'phone',
    cell: (_, { row }) => detailFieldValue(row as ImportDetailItem, 1),
  },
  {
    title: '身份证号',
    colKey: 'id_card',
    cell: (_, { row }) => detailFieldValue(row as ImportDetailItem, 2),
  },
  {
    title: '银行卡号',
    colKey: 'bank_card',
    cell: (_, { row }) => detailFieldValue(row as ImportDetailItem, 3),
  },
];

const failDetailColumns: PrimaryTableCol<TableRowData>[] = [
  ...successDetailColumns,
  {
    title: '失败原因',
    colKey: 'error',
    minWidth: 280,
    cell: (_, { row }) => ((row as ImportDetailItem).status === 'fail' ? (row as ImportDetailItem).error || '-' : '-'),
  },
];

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<TalentPoolListQuery, TalentRow>({
  fetcher: async (params) => {
    const res = await getList(params);
    const payload = (res as any).data ?? res;
    const list = payload.list || [];
    return {
      list,
      total: payload.total ?? list.length,
    };
  },
  defaultQuery,
  debounceWait: 300,
});

const {
  data: tableData,
  loading,
  pagination,
  search: searchTalentTable,
  reset: resetTalentTable,
  refresh: refreshTalentTable,
  handlePageChange,
} = tableHook;

const recordTableHook = useCommonTable<ImportLogQuery, ImportRecordRow>({
  fetcher: async (params) => {
    const { data } = await getImportLogList({
      ...params,
      data_type: ImportDataType.Talent,
    });
    return {
      list: data.list || [],
      total: data.total || 0,
    };
  },
  defaultQuery: recordDefaultQuery,
  autoSearch: true,
  debounceWait: 300,
});

const {
  data: recordTableData,
  loading: recordLoading,
  pagination: recordPagination,
  search: searchImportRecord,
  reset: resetImportRecord,
  refresh: refreshImportRecord,
  handlePageChange: handleRecordPageChange,
} = recordTableHook;

const handleSearch = (payload?: Partial<TalentPoolListQuery>) => {
  searchTalentTable(payload);
};

const handleReset = () => {
  resetTalentTable();
};

const handleRecordSearch = (payload?: Partial<ImportLogQuery>) => {
  searchImportRecord({
    ...(payload || {}),
    data_type: ImportDataType.Talent,
  });
};

const handleRecordReset = () => {
  resetImportRecord();
  searchImportRecord({
    data_type: ImportDataType.Talent,
  });
};

const handleDetail = (record: TalentRow) => {
  router.push({
    name: 'TalentDetail',
    query: {
      id: record.id,
    },
  });
};

const openBatchImportDialog = () => {
  batchImportVisible.value = true;
};

const openIdCardUploadDialog = () => {
  idCardUploadDialogVisible.value = true;
};

const handleBatchRealnameUpload = (images: Array<{ url: string; filename: string }>) => {
  return batchUploadIdCard({ images });
};

const openImportRecordDialog = () => {
  recordDialogVisible.value = true;
};

const downloadFile = (blob: BlobPart, fileName: string) => {
  const url = window.URL.createObjectURL(new Blob([blob]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

const handleDownloadTemplate = async () => {
  const res = await downloadImportTemplate();
  downloadFile(res, '人才导入模板.xlsx');
};

const handleConfirmBatchImport = async (payload: BatchImportConfirmPayload) => {
  try {
    batchImportLoading.value = true;
    const res = await batchImport({
      source_url: payload.sourceUrl,
    });
    MessagePlugin.success(res.msg || '批量新增任务已提交');
    batchImportVisible.value = false;
    refreshTalentTable();
    refreshImportRecord();
    recordDialogVisible.value = true;
  } catch {
    MessagePlugin.error('批量新增失败');
  } finally {
    batchImportLoading.value = false;
  }
};

const viewSuccessRecord = (row: ImportRecordRow) => {
  if (!row.import_details?.length) {
    MessagePlugin.warning('暂无成功记录');
    return;
  }

  const successRows = row.import_details.filter((item) => item.status === 'success');
  if (!successRows.length) {
    MessagePlugin.info('暂无成功记录');
    return;
  }

  successDetailList.value = successRows;
  successDialogVisible.value = true;
};

const viewFailRecord = (row: ImportRecordRow) => {
  if (!row.import_details?.length) {
    MessagePlugin.warning('暂无失败记录');
    return;
  }

  const failRows = row.import_details.filter((item) => item.status === 'fail');
  if (!failRows.length) {
    MessagePlugin.info('暂无失败记录');
    return;
  }

  failDetailList.value = failRows;
  failDialogVisible.value = true;
};
</script>
<style lang="less" scoped>
.talent-list-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.record-dialog-body {
  :deep(.project-toolbar) {
    display: none;
  }
}
</style>
