<template>
  <t-layout>
    <t-content>
      <t-card class="delivery-upload-detail" :bordered="false">
        <common-table
          :data="tableData"
          :loading="loading"
          :pagination="pagination"
          :form-config="formConfig"
          :table-config="tableConfig"
          :header-affixed-top="headerAffixedTop"
          selection-type="multiple"
          :selection-disabled="selectionDisabled"
          row-key="member_id"
          @search="handleSearch"
          @reset="handleReset"
          @page-change="handlePageChange"
          @update:selected-row-keys="handleSelectedRowKeys"
        >
          <template #submit_status="{ record }">
            <t-tag :theme="statusTag[record.submit_status as DeliverySubmitStatus].theme">
              {{ statusTag[record.submit_status as DeliverySubmitStatus].label }}
            </t-tag>
          </template>
        </common-table>
      </t-card>
    </t-content>
    <t-footer>
      <t-button :disabled="selectedRowKeys.length === 0" theme="primary" @click="drawerVisible = true"
        >{{ `已选 ${selectedRowKeys.length} 人，共计 ${pagination.total} 人`
        }}{{ selectedRowKeys.length > 0 ? '  立即上传' : '' }}</t-button
      >
    </t-footer>
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
          message="根据任务验收要求，提供完整的服务过程佐证材料，包括但不限于技术服务过程中的影音资 料、关键节点沟通记录、服务确认单、客户反馈意"
        />
        <t-upload v-model="uploadFiles" :max="5" :request-method="uploadRequest" multiple>
          <t-button theme="primary" :disabled="requestLading">上传</t-button>
        </t-upload>
      </t-space>

      <template #footer>
        <t-button variant="base" theme="default" type="reset" :disabled="requestLading" @click="handleCancelUpload"
          >取消</t-button
        >
        <t-button theme="primary" :disabled="requestLading" @click="handleUpload">上传</t-button>
      </template>
    </t-dialog>
  </t-layout>
</template>
<script setup lang="ts">
import type { TagProps, TdUploadProps, UploadFile } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getDeliveryCompletion, uploadDelivery } from '@/api/delivery';
import type { Row } from '@/api/model/common';
import type {
  DeliveryCompletionItem,
  DeliveryCompletionPayload,
  DeliveryListPayload,
  DeliveryUploadPayload,
} from '@/api/model/delivery';
import { DeliverySubmitStatus } from '@/api/model/delivery';
import { uploadFile, uploadImage } from '@/api/upload';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { isImage } from '@/components/file-viewer/util';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'DeliveryUploadDetail',
});

const route = useRoute();

const taskId = route.query.task_id as string | undefined;

const selectedRowKeys = ref<Array<number>>([]);
const drawerVisible = ref(false);
const uploadFiles = ref<UploadFile[]>([]);
const requestLading = ref(false);

type DeliveryListQuery = DeliveryListPayload;

type DeliveryRow = DeliveryCompletionItem & Row;

const formConfig = {
  formItem: [
    { label: '姓名', name: 'keyword_name', width: 200, align: 'left', type: 'input' },
    { label: '手机号', name: 'keyword_mobile', width: 200, align: 'left', type: 'input', props: { type: 'number' } },
    { label: '交付状态', name: 'submit_status', width: 140, align: 'center', type: 'select' },
  ],
  formData: {
    product_id: taskId,
    keyword_name: '',
    keyword_mobile: '',
    submit_status: null,
  },
};

const tableConfig: TableConfig<DeliveryRow, keyof DeliveryRow> = {
  tableItem: [
    { title: '姓名', colKey: 'real_name', width: 200, align: 'left' },
    { title: '手机号', colKey: 'mobile', width: 200, align: 'left' },
    { title: '身份证号', colKey: 'card_no', width: 140, align: 'center' },
    { title: '交付状态', colKey: 'delivery_status_text', width: 200, align: 'center' },
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

const tableHook = useCommonTable<DeliveryCompletionPayload, DeliveryRow>({
  fetcher: async (params) => {
    const { data } = await getDeliveryCompletion(params);
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

const uploadRequest: TdUploadProps['requestMethod'] = async (files) => {
  const list = Array.isArray(files) ? files : [files];
  console.log(list);
  if (!list.length) {
    return {
      status: 'fail',
      error: '没有可上传的文件',
      response: {},
    };
  }

  try {
    requestLading.value = true;
    const uploaded = await Promise.all(
      list.map(async (file) => {
        const raw = file.raw as File | undefined;
        if (!raw) return file;

        const isImage = !!raw.type && raw.type.startsWith('image/');
        const res = isImage ? await uploadImage(raw) : await uploadFile(raw);
        const url = res?.data?.url || res?.data?.path;

        return { ...file, url, status: 'success' as const };
      }),
    );

    return {
      status: 'success',
      response: list.length === 1 ? { url: uploaded[0]?.url } : { files: uploaded },
    };
  } catch (err) {
    return {
      status: 'fail',
      error: '上传失败',
      response: {},
    };
  } finally {
    requestLading.value = false;
  }
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
const selectionDisabled = ({ row }: { row: DeliveryRow }) => {
  return row.submit_status === DeliverySubmitStatus.Accepted;
};
</script>
<style lang="less" scoped>
.delivery-upload-detail {
  padding: 0;
}
</style>
