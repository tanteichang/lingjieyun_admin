<template>
  <t-drawer :visible="visible" size="80%" title="批量上传身份证件" @update:visible="handleVisibleChange">
    <div class="id-card-upload-content">
      <auto-upload
        v-model="idCardList"
        tips="支持jpg/jpeg/png，一次最多上传200张照片"
        theme="image-flow"
        :upload-all-files-in-one-request="true"
        upload-type="Enterprise"
        :multiple="true"
        :draggable="true"
        accept=".png,.jpeg,.jpg"
        :max="200"
        :auto-upload="false"
        :size-limit="{ size: 5, unit: 'MB' }"
        :before-upload="beforeUploadIdCard"
        :file-list-display="fileListDisplay"
        :on-success="handleUploadSuccess"
      />

      <div class="naming-rule">
        <div class="naming-rule__header">命名规则</div>
        <div class="naming-rule__example">示例：610629198602052135-1.png</div>
        <div class="naming-rule__content">
          <div class="rule-item">
            <div class="rule-title">身份证照·命名规则：</div>
            <div class="rule-row">
              <img :src="idExample3" alt="身份证示例图" class="rule-image" />
              <div class="rule-name">610629198602052135-1.png</div>
            </div>
            <div class="rule-row">
              <img :src="idExample4" alt="身份证示例图" class="rule-image" />
              <div class="rule-name">610629198602052135-2.png</div>
            </div>
          </div>
        </div>
        <div class="naming-rule__tip">* 同一证件人像面和国徽面必须在一次同时上传</div>
      </div>
    </div>
  </t-drawer>
  <t-image-viewer v-model:visible="previewVisible" v-model:index="previewIndex" :images="previewImages" />
</template>
<script setup lang="ts">
import type { UploadFile } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { h, onBeforeUnmount, ref, resolveComponent, watch } from 'vue';

import { batchRealname } from '@/api/enterprise/talentpool';
import idExample3 from '@/assets/project/id_example_3.png';
import idExample4 from '@/assets/project/id_example_4.png';
import AutoUpload from '@/components/auto-upload/index.vue';

defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
}>();

const idCardList = ref<UploadFile[]>([]);
const TLink = resolveComponent('t-link');
const previewVisible = ref(false);
const previewImages = ref<string[]>([]);
const previewIndex = ref(0);
const tempObjectUrls = ref<string[]>([]);

const fileListDisplay = (_h: typeof h, { files }: { files: UploadFile[] }) => {
  return h(
    'div',
    { class: 'upload-file-list' },
    files.map((file) =>
      h('div', { class: 'upload-file-item', key: file.name || file.url || '' }, [
        h('div', { class: 'upload-file-main' }, [
          h(
            TLink,
            {
              theme: 'primary',
              hover: 'color',
              onClick: () => handlePreviewFile(file, files),
            },
            () => file.name || '-',
          ),
          h(
            TLink,
            {
              class: 'upload-file-remove',
              theme: 'danger',
              hover: 'color',
              onClick: () => handleRemoveFile(file),
            },
            () => '删除',
          ),
        ]),
      ]),
    ),
  );
};

const handleRemoveFile = (target: UploadFile) => {
  idCardList.value = idCardList.value.filter((file) => file !== target);
};

const clearTempObjectUrls = () => {
  tempObjectUrls.value.forEach((url) => URL.revokeObjectURL(url));
  tempObjectUrls.value = [];
};

const handlePreviewFile = (file: UploadFile, files: UploadFile[]) => {
  clearTempObjectUrls();

  const entries = files
    .map((item) => {
      if (item.url) return item.url;
      const rawFile = item.raw as File | undefined;
      if (!rawFile) return '';
      const objectUrl = URL.createObjectURL(rawFile);
      tempObjectUrls.value.push(objectUrl);
      return objectUrl;
    })
    .map((url, originIndex) => ({ url, originIndex }))
    .filter((entry) => !!entry.url);

  if (!entries.length) {
    MessagePlugin.warning('当前文件暂不支持预览');
    return;
  }

  const current = files.findIndex((item) => item === file);
  previewImages.value = entries.map((entry) => entry.url);
  const previewCurrent = entries.findIndex((entry) => entry.originIndex === current);
  previewIndex.value = previewCurrent >= 0 ? previewCurrent : 0;
  previewVisible.value = true;
};

const handleVisibleChange = (value: boolean) => {
  emit('update:visible', value);
};

const handleUploadSuccess = () => {
  batchRealname({
    images: idCardList.value.map((item) => ({
      url: item.url || '',
      filename: item.name || '',
    })),
  })
    .then((res) => {
      if (res?.code === 200) {
        MessagePlugin.success(res.msg);
        if (res.data.errors?.length) {
          for (const error of res.data.errors) {
            MessagePlugin.error(`${error.id_card} : ${error.message}`);
          }
        }
      }
    })
    .finally(() => {
      idCardList.value = [];
    });
};

const beforeUploadIdCard = (file: UploadFile) => {
  const fileName = file.name || '';
  const baseName = fileName.replace(/\.[^.]+$/, '');
  const isValid = /^\d{17}[\dX]-(1|2)$/i.test(baseName);
  if (!isValid) {
    MessagePlugin.warning('文件名需为“证件号-1/2”，例如：610629198602052135-1');
    return false;
  }
  return true;
};

watch(previewVisible, (value) => {
  if (!value) {
    clearTempObjectUrls();
  }
});

onBeforeUnmount(() => {
  clearTempObjectUrls();
});
</script>
<style lang="less" scoped>
.id-card-upload-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.naming-rule {
  border-radius: var(--td-radius-large);
  background: var(--td-bg-color-secondarycontainer);
  overflow: hidden;
}

.naming-rule__header {
  display: inline-block;
  margin: 16px 0 0 16px;
  padding: 6px 14px;
  color: #fff;
  background: var(--td-warning-color);
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.naming-rule__example {
  padding: 16px;
  color: var(--td-text-color-primary);
  font-size: 11px;
}

.naming-rule__content {
  padding: 0 16px 16px;
}

.rule-item {
  padding: 14px 0;
}

.rule-title {
  margin-bottom: 10px;
  color: var(--td-warning-color);
  font-size: 12px;
  font-weight: 600;
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 88px;
}

.rule-row + .rule-row {
  margin-top: 12px;
}

.rule-image {
  width: 156px;
  height: 88px;
  object-fit: cover;
  border-radius: var(--td-radius-medium);
  border: 1px solid var(--td-component-border);
}

.rule-name {
  line-height: 1.6;
  color: var(--td-text-color-primary);
  font-size: 12px;
}

.naming-rule__tip {
  padding: 0 16px 16px;
  color: var(--td-error-color);
  font-size: 11px;
}

:deep(.upload-file-list) {
  margin-top: 12px;
  background: transparent;
}

:deep(.upload-file-item) {
  display: flex;
  align-items: center;
  padding: 8px 12px;
}

:deep(.upload-file-main) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  width: 100%;
}

:deep(.upload-file-name) {
  font-size: 12px;
  color: var(--td-text-color-primary);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

:deep(.upload-file-name.t-link) {
  color: var(--td-text-color-primary);
}

:deep(.upload-file-name.t-link:hover) {
  color: var(--td-text-color-primary);
}

:deep(.upload-file-remove) {
  font-size: 12px;
  justify-self: end;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>
