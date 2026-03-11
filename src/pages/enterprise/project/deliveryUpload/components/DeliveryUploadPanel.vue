<template>
  <div class="delivery-upload-detail-page">
    <t-layout>
      <t-content>
        <t-card v-if="props.showBasicInfo" :bordered="false" class="delivery-upload-detail-header">
          <div class="delivery-upload-detail-header__title">基本信息</div>
          <div class="delivery-upload-detail-header__row">
            <div class="delivery-upload-detail-header__field">
              <span class="delivery-upload-detail-header__label">任务名称</span>
              <span class="delivery-upload-detail-header__value">{{ deliveryInfo?.task_title || '--' }}</span>
            </div>
            <div class="delivery-upload-detail-header__field">
              <span class="delivery-upload-detail-header__label">所属项目</span>
              <span class="delivery-upload-detail-header__value">{{ deliveryInfo?.project_name || '--' }}</span>
            </div>
            <div class="delivery-upload-detail-header__field">
              <span class="delivery-upload-detail-header__label">所属企业</span>
              <span class="delivery-upload-detail-header__value">{{ deliveryInfo?.enterprise_name || '--' }}</span>
            </div>
          </div>
        </t-card>
        <t-card class="delivery-upload-detail" :bordered="false">
          <common-table
            :auto-add-index="false"
            :data="tableData"
            :loading="loading"
            :pagination="pagination"
            :form-config="formConfig"
            :table-config="tableConfig"
            :header-affixed-top="headerAffixedTop"
            selection-type="multiple"
            :selection-disabled="selectionDisabled"
            row-key="id"
            @search="handleSearch"
            @reset="handleReset"
            @page-change="handlePageChange"
            @update:selected-row-keys="handleSelectedRowKeys"
          >
            <template #toolbar>
              <t-affix :z-index="1000" :offset-top="toolbarAffixTop" :container="affixContainer">
                <t-space align="center">
                  <t-radio-group
                    v-if="props.mode === 'switch'"
                    :value="switchMode"
                    variant="default-filled"
                    @change="handleSwitchModeChange"
                  >
                    <t-radio-button value="upload">上传</t-radio-button>
                    <t-radio-button value="download">下载</t-radio-button>
                  </t-radio-group>
                  <t-button
                    v-if="effectiveMode === 'upload'"
                    :disabled="selectedRowKeys.length === 0"
                    theme="primary"
                    @click="drawerVisible = true"
                    >{{ `已选 ${selectedRowKeys.length} 条记录，共计 ${pagination.total} 条记录`
                    }}{{ selectedRowKeys.length > 0 ? '  立即上传' : '' }}</t-button
                  >
                  <t-button
                    v-if="effectiveMode === 'download'"
                    :disabled="selectedRowKeys.length === 0"
                    theme="primary"
                    :loading="downloadLoading"
                    @click="handleBatchDownload"
                    >{{ `已选 ${selectedRowKeys.length} 条记录，共计 ${pagination.total} 条记录`
                    }}{{ selectedRowKeys.length > 0 ? '  立即下载' : '' }}
                  </t-button>
                </t-space>
              </t-affix>
            </template>
            <template #delivery_mode="{ record }">
              <span>{{ DeliverModeOptions[record.delivery_mode as keyof typeof DeliverModeOptions] }}</span>
            </template>
            <template #submit_status="{ record }">
              <t-tag :theme="statusTag[record.submit_status as DeliverySubmitStatus].theme">
                {{ statusTag[record.submit_status as DeliverySubmitStatus].label }}
              </t-tag>
            </template>
            <template #op="{ record }">
              <t-space>
                <t-link
                  v-if="
                    record.delivery_status === DeliveryStatus.Pending ||
                    record.delivery_status === DeliveryStatus.Approved
                  "
                  theme="primary"
                  @click="handleView(record)"
                  >查看</t-link
                >
                <!-- <t-link
                v-if="
                  record.delivery_status === DeliveryStatus.Pending ||
                  record.delivery_status === DeliveryStatus.Approved
                "
                theme="primary"
                @click="handelDownload(record)"
                >下载</t-link
              > -->
              </t-space>
            </template>
          </common-table>
        </t-card>
      </t-content>
      <t-dialog
        v-model:visible="drawerVisible"
        :close-on-overlay-click="false"
        :close-on-esc-keydown="false"
        size="70%"
        header="上传交付物"
        :close-btn="null"
        width="50%"
      >
        <t-space direction="vertical">
          <t-alert
            theme="warning"
            title="服务验收材料"
            message="根据任务验收要求，提供完整的服务过程佐证材料，包括但不限于技术服务过程中的影音资料、关键节点沟通记录、服务确认单、客户反馈意"
          />
          <auto-upload v-model="uploadFiles" :max="5" multiple tips="最多上传5个文件">
            <t-button
              >选择文件
              <template #icon>
                <t-icon name="upload" />
              </template>
            </t-button>
          </auto-upload>
        </t-space>

        <template #footer>
          <t-button variant="base" theme="default" type="reset" :disabled="requestLading" @click="handleCancelUpload"
            >取消</t-button
          >
          <t-button theme="primary" :disabled="requestLading" @click="handleUpload">上传</t-button>
        </template>
      </t-dialog>
      <t-drawer v-model:visible="previewVisible" size="50%" :confirm-btn="null" cancel-btn="返回">
        <template #body>
          <file-viewer :files="previewFiles"></file-viewer>
        </template>
      </t-drawer>
    </t-layout>
    <div v-if="downloadLoading" class="delivery-upload-detail-mask">
      <t-loading loading size="large" text="正在打包下载，请稍候..." />
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TagProps, UploadFile } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getDeliveryRecordList, uploadDelivery } from '@/api/enterprise/delivery';
import type { Row } from '@/api/model/common';
import type {
  DeliveryCompletionPayload,
  DeliveryListPayload,
  DeliveryRecordItem,
  DeliveryUploadItem,
  DeliveryUploadPayload,
} from '@/api/model/enterprise/delivery';
import {
  DeliverModeOptions,
  DeliveryMode,
  DeliveryStatus,
  DeliverySubmitStatus,
} from '@/api/model/enterprise/delivery';
import AutoUpload from '@/components/auto-upload/index.vue';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import type { FileViewerItem } from '@/components/file-viewer/index.vue';
import FileViewer from '@/components/file-viewer/index.vue';
import { isImage } from '@/components/file-viewer/util';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { useDeliveryStore } from '@/store/modules/enterprise/delivery';
import { downloadDeliveryRecordsZip } from '@/utils/download';

defineOptions({
  name: 'DeliveryUploadPanel',
});

const props = withDefaults(
  defineProps<{
    showBasicInfo?: boolean;
    mode?: 'upload' | 'download' | 'switch';
  }>(),
  {
    showBasicInfo: true,
    mode: 'upload',
  },
);

const deliveryStore = useDeliveryStore();
const route = useRoute();

const taskId = route.query.id as string | undefined;

const selectedRowKeys = ref<Array<number>>([]);
const drawerVisible = ref(false);
const uploadFiles = ref<UploadFile[]>([]);
const requestLading = ref(false);
const downloadLoading = ref(false);
const switchMode = ref<'upload' | 'download'>(props.mode === 'download' ? 'download' : 'upload');
const deliveryInfo = ref<DeliveryUploadItem | undefined>(undefined);
const previewVisible = ref(false);
const previewFiles = ref<FileViewerItem[]>([]);
const effectiveMode = computed<'upload' | 'download'>(() => (props.mode === 'switch' ? switchMode.value : props.mode));

type DeliveryListQuery = DeliveryListPayload;

type DeliveryRow = DeliveryRecordItem & Row;

const formConfig = {
  formItem: [
    { label: '姓名', name: 'keyword_name', span: 6, align: 'left', type: 'input' },
    { label: '手机号', name: 'keyword_mobile', span: 6, align: 'left', type: 'input', props: { type: 'number' } },
  ],
  formData: {
    product_id: taskId,
    keyword_name: '',
    keyword_mobile: '',
  },
};

const tableConfig: TableConfig<DeliveryRow, keyof DeliveryRow> = {
  tableItem: [
    { title: 'ID', colKey: 'id', width: 60, align: 'center' },
    { title: '姓名', colKey: 'real_name', width: 100, align: 'left' },
    { title: '手机号', colKey: 'mobile', width: 150, align: 'left' },
    { title: '交付模式', colKey: 'delivery_mode', width: 150, align: 'center' },
    { title: '交付日期', colKey: 'plan_date', align: 'center' },
    { title: '交付状态', colKey: 'delivery_status_text', width: 200, align: 'center' },
    { title: '操作', colKey: 'op', width: 120, fixed: 'right' },
  ],
};

const statusTag: Record<DeliverySubmitStatus, { label: string; theme: TagProps['theme'] }> = {
  [DeliverySubmitStatus.Accepted]: { label: '已交付', theme: 'success' },
  [DeliverySubmitStatus.Pending]: { label: '未交付', theme: 'warning' },
  [DeliverySubmitStatus.RejectedNeedResubmit]: { label: '已拒绝', theme: 'danger' },
};

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);
const affixContainer = computed(() => `.${prefix}-layout`);
const toolbarAffixTop = computed(() => (store.isUseTabsRouter ? 50 : 0) + 50);

onMounted(() => {
  console.log(taskId);
  const delivery = deliveryStore.getDelivery(taskId);
  deliveryInfo.value = delivery;
  console.log(delivery);

  // getDeliverySummary({ product_id: taskId }).then((res) => {
  //   console.log(res);
  // });
});

const tableHook = useCommonTable<DeliveryCompletionPayload, DeliveryRow>({
  fetcher: async (params) => {
    const { data } = await getDeliveryRecordList(params);
    const list = data.list || [];
    return {
      list: list.map((item, index) => ({
        ...item,
        index: index + 1,
      })),
      total: data.total ?? list.length,
    };
  },
  defaultQuery: formConfig.formData,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;

const handleSearch = (payload?: Partial<DeliveryListQuery>) => {
  search({
    ...(payload || {}),
    task_id: taskId.value,
  });
};

const handleReset = () => {
  reset();
  search({ task_id: taskId.value });
};

const handleCancelUpload = () => {
  drawerVisible.value = false;
  uploadFiles.value = [];
};

const handleUpload = () => {
  console.log('uploadFiles', uploadFiles.value);
  console.log(uploadFiles.value);
  const payload: DeliveryUploadPayload = {
    submit_ids: selectedRowKeys.value,
    files: uploadFiles.value.map((item) => ({
      name: item.name || '',
      url: item.url || '',
      type: isImage(item.url || '') ? 'image' : 'file',
    })),
  };
  console.log(payload);
  requestLading.value = true;
  uploadDelivery(payload)
    .then((res) => {
      MessagePlugin.info(res.msg || '上传成功');
      if (res.data.fail_count > 0) {
        res.data.fail_items.forEach((item) => {
          MessagePlugin.error(item.error);
        });
      } else {
        drawerVisible.value = false;
      }
    })
    .finally(() => {
      requestLading.value = false;
    });
};

const handleSelectedRowKeys = (rowKeys: Array<number>) => {
  console.log(rowKeys);
  selectedRowKeys.value = [...rowKeys];
};

const handleSwitchModeChange = (value: string | number) => {
  if (value !== 'upload' && value !== 'download') {
    return;
  }
  switchMode.value = value;
  selectedRowKeys.value = [];
};

const selectionDisabled = ({ row }: { row: DeliveryRow }) => {
  // 小程序交付模式不能上传，已通过和待审核状态不能上传
  const uploadDisabled =
    row.delivery_mode === DeliveryMode.MINI_APP ||
    row.delivery_status === DeliveryStatus.Approved ||
    row.delivery_status === DeliveryStatus.Pending;

  return effectiveMode.value === 'download' ? !uploadDisabled : uploadDisabled;
};

const handleView = (record: DeliveryRow) => {
  const files = Array.isArray(record.delivery_files) ? record.delivery_files : [];
  previewFiles.value = files.map((item) => ({
    name: item.name,
    url: item.url,
  }));
  previewVisible.value = true;
};

const handleBatchDownload = async () => {
  const selectedSet = new Set(selectedRowKeys.value);
  const selectedRows = tableData.value.filter((row) => selectedSet.has(Number(row.id)));
  if (!selectedRows.length) {
    MessagePlugin.warning('请先选择要下载的记录');
    return;
  }

  downloadLoading.value = true;
  try {
    const { addedCount, failedFiles } = await downloadDeliveryRecordsZip({
      rows: selectedRows,
      taskTitle: deliveryInfo.value?.task_title,
      useDevProxy: import.meta.env.DEV,
    });

    if (!addedCount) {
      MessagePlugin.error('未获取到可下载文件。开发环境请走代理；生产环境需在文件域名配置 CORS。');
      return;
    }

    if (failedFiles.length) {
      MessagePlugin.warning(`下载完成，${failedFiles.length} 个文件打包失败`);
      return;
    }
    MessagePlugin.success('批量下载成功');
  } finally {
    downloadLoading.value = false;
  }
};
</script>
<style lang="less" scoped>
.delivery-upload-detail-page {
  position: relative;
}

.delivery-upload-detail-mask {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 65%);
  backdrop-filter: blur(1px);
}

.delivery-upload-detail {
  padding: 0;
}

.delivery-upload-detail-header {
  margin-bottom: 20px;
  background: var(--td-bg-color-container);
  border-radius: var(--td-radius-large);
}

.delivery-upload-detail-header__title {
  margin-bottom: 10px;
  color: var(--td-text-color-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.delivery-upload-detail-header__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 36px;
}

.delivery-upload-detail-header__field {
  display: flex;
  flex: 1;
  gap: 8px;
  min-width: 240px;
}

.delivery-upload-detail-header__label {
  flex: 0 0 auto;
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
}

.delivery-upload-detail-header__value {
  min-width: 0;
  overflow: hidden;
  color: var(--td-text-color-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (width <= 1080px) {
  .delivery-upload-detail-header__row {
    gap: 10px 24px;
  }
}

@media (width <= 640px) {
  .delivery-upload-detail-header {
    padding: 12px 14px;
  }

  .delivery-upload-detail-header__row {
    gap: 8px;
  }

  .delivery-upload-detail-header__field {
    min-width: 100%;
  }
}
</style>
