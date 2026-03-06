<template>
  <t-dialog
    :visible="visible"
    :header="title"
    :confirm-btn="null"
    :cancel-btn="null"
    width="760"
    :close-on-overlay-click="false"
    @update:visible="handleVisibleChange"
  >
    <div class="batch-import-dialog">
      <div class="upload-panel">
        <div class="upload-container">
          <t-upload
            v-model="files"
            :accept="accept"
            :max="max"
            :request-method="effectiveRequestMethod"
            :disabled="confirmLoading"
          >
            <div class="upload-trigger">
              <div class="upload-trigger__left">
                <t-icon name="file-add" />
                <span>{{ uploadText }}</span>
              </div>
            </div>
          </t-upload>
          <t-button class="upload-template-btn" variant="base" theme="success" @click.stop="handleDownloadTemplate">
            {{ templateButtonText }}
          </t-button>
        </div>
        <div class="upload-tip">{{ tipText }}</div>
      </div>

      <div class="footer-actions">
        <t-button variant="base" theme="default" :disabled="confirmLoading" @click="handleCancel">
          {{ cancelText }}
        </t-button>
        <t-button theme="primary" :loading="confirmLoading" @click="handleConfirm">{{ confirmText }}</t-button>
      </div>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import type { TdUploadProps, UploadFile } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';

import { uploadFile } from '@/api/enterprise/upload';

export interface BatchImportConfirmPayload {
  file: UploadFile;
  sourceUrl: string;
  fileName: string;
}

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    uploadText?: string;
    templateButtonText?: string;
    tipText?: string;
    cancelText?: string;
    confirmText?: string;
    accept?: string;
    max?: number;
    confirmLoading?: boolean;
    requestMethod?: TdUploadProps['requestMethod'];
  }>(),
  {
    title: '批量导入',
    uploadText: '点击上传批量导入文件',
    templateButtonText: '下载模板',
    tipText: '* 请先下载模板录入后再导入',
    cancelText: '取消',
    confirmText: '确认导入',
    accept: '.xlsx,.xls',
    max: 1,
    confirmLoading: false,
    requestMethod: undefined,
  },
);

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
  (event: 'download-template'): void;
  (event: 'confirm', payload: BatchImportConfirmPayload): void;
}>();

const files = ref<UploadFile[]>([]);

watch(
  () => props.visible,
  (value) => {
    if (!value) {
      files.value = [];
    }
  },
);

const defaultRequestMethod: TdUploadProps['requestMethod'] = async (fileOrFiles) => {
  const list = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  const first = list[0];
  const rawFile = first?.raw as File | undefined;
  if (!rawFile) {
    return {
      status: 'fail',
      error: '未选择文件',
      response: {},
    };
  }

  try {
    const response = await uploadFile(rawFile);
    const url = response?.data?.url || response?.data?.path;
    return {
      status: 'success',
      response: { url },
    };
  } catch {
    return {
      status: 'fail',
      error: '上传失败',
      response: {},
    };
  }
};

const effectiveRequestMethod = computed<TdUploadProps['requestMethod']>(() => {
  return props.requestMethod || defaultRequestMethod;
});

const handleVisibleChange = (value: boolean) => {
  emit('update:visible', value);
};

const handleCancel = () => {
  emit('update:visible', false);
};

const handleDownloadTemplate = () => {
  emit('download-template');
};

const handleConfirm = () => {
  const file = files.value[0];
  const sourceUrl = file?.url || '';
  if (!file || !sourceUrl) {
    MessagePlugin.warning('请先上传导入文件');
    return;
  }
  emit('confirm', {
    file,
    sourceUrl,
    fileName: file.name || '',
  });
};
</script>
<style lang="less" scoped>
.batch-import-dialog {
  .upload-panel {
    background: blueviolet;
    padding: 12px;
    background: var(--td-bg-color-container-hover);
    border-radius: var(--td-radius-medium);
  }

  .upload-container {
    display: inline-flex;
    justify-content: space-around;
    align-items: center;
    width: 100%;
  }

  .upload-trigger {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    width: 100%;
    min-height: 86px;
    padding: 0 12px;
  }

  .upload-trigger__left {
    grid-column: 2;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    color: var(--td-text-color-link);
  }
  .upload-trigger__left:hover {
    cursor: pointer;
  }

  .upload-plus {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    color: #fff;
    font-size: 24px;
    line-height: 1;
    background: var(--td-brand-color);
    border-radius: 50%;
  }

  .upload-template-btn {
    grid-column: 3;
    justify-self: end;
  }

  .upload-tip {
    margin-top: 8px;
    color: var(--td-error-color);
    text-align: right;
  }

  .footer-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;
  }
}
</style>
