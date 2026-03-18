<template>
  <t-dialog
    v-model:visible="dialogVisible"
    :header="dialogTitle"
    width="560px"
    :close-on-overlay-click="false"
    :confirm-btn="{ content: '确认导入', loading: importSubmitting }"
    @confirm="handleConfirmImport"
    @cancel="handleClose"
    @close="handleClose"
  >
    <t-space direction="vertical" style="width: 100%">
      <t-alert theme="info" title="请上传结算单文件（.xlsx/.xls），上传后将自动执行文件传输。" />
      <auto-upload v-model="uploadFiles" :max="1" accept=".xlsx,.xls">
        <t-button theme="default">
          选择文件
          <template #icon>
            <t-icon name="file-excel" />
          </template>
        </t-button>
      </auto-upload>
    </t-space>
  </t-dialog>
</template>

<script setup lang="ts">
import type { UploadFile } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';

import { importSettlement } from '@/api/enterprise/settlement';
import AutoUpload from '@/components/auto-upload/index.vue';

const props = defineProps<{
  modelValue: boolean;
  planDate: string | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  success: [];
}>();

const uploadFiles = ref<UploadFile[]>([]);
const importSubmitting = ref(false);

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value);
  },
});

const dialogTitle = computed(() => {
  return props.planDate ? `上传结算单（${props.planDate}）` : '上传结算单';
});

const resetState = () => {
  uploadFiles.value = [];
  importSubmitting.value = false;
};

const handleClose = () => {
  dialogVisible.value = false;
  resetState();
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
      MessagePlugin.success(msg || '上传成功');
    } else {
      MessagePlugin.error(msg || '上传失败', 0);
    }

    (data?.errors || []).forEach((item) => {
      MessagePlugin.warning(item.error || '');
    });

    emit('success');
    handleClose();
  } finally {
    importSubmitting.value = false;
  }
};
</script>
