<template>
  <t-upload v-model="modelValue" v-bind="uploadProps">
    <slot v-if="$slots.default" />
  </t-upload>
</template>
<script setup lang="ts">
import type { TdUploadProps, UploadFile } from 'tdesign-vue-next';
import { computed, useAttrs } from 'vue';

import { uploadEnterprise, uploadFile, uploadImage } from '@/api/enterprise/upload';

defineOptions({
  inheritAttrs: false,
});

const attrs = useAttrs();
const modelValue = defineModel<UploadFile[]>({
  default: () => [],
});
type UploadType = 'Enterprise';

const passThroughAttrs = computed(() => {
  const normalized = Object.fromEntries(Object.entries(attrs).filter(([, value]) => value !== undefined));

  delete normalized.uploadType;
  delete normalized['upload-type'];
  delete normalized.requestMethod;
  delete normalized['request-method'];

  return normalized;
});

const uploadType = computed<UploadType | undefined>(() => {
  const value = attrs.uploadType ?? attrs['upload-type'];
  if (value === 'Enterprise') {
    return 'Enterprise';
  }
  return undefined;
});

const uploadProps = computed(() => {
  return {
    ...passThroughAttrs.value,
    requestMethod,
  };
});

const requestMethod: TdUploadProps['requestMethod'] = async (fileOrFiles) => {
  const list = Array.isArray(fileOrFiles) ? fileOrFiles : [fileOrFiles];
  if (!list.length) {
    return {
      status: 'fail',
      error: '没有可上传的文件',
      response: {},
    };
  }

  try {
    const uploadSingleFile = async (file: UploadFile) => {
      const raw = file.raw as File | undefined;
      if (!raw) return file;

      const isImageFile = !!raw.type && raw.type.startsWith('image/');
      const res = isImageFile ? await uploadImage(raw) : await uploadFile(raw);
      const url = res?.data?.url || res?.data?.path;
      return { ...file, url, status: 'success' as const, response: res?.data };
    };

    // 仅在显式传入 upload-type="Enterprise" 时使用企业上传接口（单文件/多文件都走）
    if (uploadType.value === 'Enterprise') {
      const rawFiles = list.map((file) => file.raw as File | undefined).filter((item): item is File => !!item);
      if (rawFiles.length !== list.length) {
        return {
          status: 'fail',
          error: '上传文件无效',
          response: {},
        };
      }

      const batchRes = await uploadEnterprise(rawFiles);
      const data = (batchRes as any)?.data;
      const batchFiles = Array.isArray(data) ? data : Array.isArray(data?.files) ? data.files : [];

      if (list.length === 1) {
        const first = (Array.isArray(batchFiles) && batchFiles[0]) || data || {};
        const url = first.url || first.path || '';
        if (!url) {
          return {
            status: 'fail',
            error: '企业上传返回格式错误',
            response: {},
          };
        }
        return {
          status: 'success',
          response: { url, raw: first },
        };
      }

      if (batchFiles.length !== list.length) {
        return {
          status: 'fail',
          error: '企业上传返回格式错误',
          response: {},
        };
      }

      const uploaded = list.map((file, index) => {
        const current = batchFiles[index] || {};
        const url = current.url || current.path || '';
        return { ...file, url, status: 'success' as const, response: current };
      });
      return {
        status: 'success',
        response: { files: uploaded },
      };
    }

    const uploaded = await Promise.all(
      list.map((file) => {
        return uploadSingleFile(file);
      }),
    );

    return {
      status: 'success',
      response: list.length === 1 ? { url: uploaded[0]?.url } : { files: uploaded },
    };
  } catch {
    return {
      status: 'fail',
      error: '上传失败',
      response: {},
    };
  }
};
</script>
