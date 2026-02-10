<template>
  <div class="file-viewer">
    <div v-if="!normalizedFiles.length" class="file-viewer-empty">-</div>
    <div v-else class="file-viewer-content">
      <div v-if="mediaFiles.length" class="file-viewer-grid">
        <div v-for="file in mediaFiles" :key="file.key" class="file-viewer-item">
          <template v-if="file.kind === 'image'">
            <button type="button" class="file-viewer-thumb" @click="openImage(file.imageIndex)">
              <img :src="file.url" :alt="file.name" loading="lazy" />
            </button>
            <div class="file-viewer-meta">
              <div class="file-viewer-name" :title="file.name">{{ file.name }}</div>
              <t-link
                class="file-viewer-download"
                theme="primary"
                :href="file.url"
                target="_blank"
                :download="file.downloadName"
                hover="color"
              >
                下载
              </t-link>
            </div>
          </template>
          <template v-else>
            <video class="file-viewer-video" :src="file.url" controls preload="metadata"></video>
            <div class="file-viewer-meta">
              <div class="file-viewer-name" :title="file.name">{{ file.name }}</div>
              <t-link
                class="file-viewer-download"
                :href="file.url"
                theme="primary"
                target="_blank"
                :download="file.downloadName"
                hover="color"
              >
                下载
              </t-link>
            </div>
          </template>
        </div>
      </div>
      <div v-if="fileOnly.length" class="file-viewer-waterfall">
        <div v-for="file in fileOnly" :key="file.key" class="file-viewer-item file-viewer-item--file">
          <div class="file-viewer-file">
            <div class="file-viewer-file-thumb">
              <t-icon :name="file.iconName" color="#0052D9" />
            </div>
            <div class="file-viewer-file-info">
              <div class="file-viewer-name" :title="file.name">{{ file.name }}</div>
              <div class="file-viewer-type">{{ file.displayType }}</div>
            </div>
            <t-link
              class="file-viewer-download"
              :href="file.url"
              theme="primary"
              target="_blank"
              :download="file.downloadName"
              hover="color"
            >
              下载
            </t-link>
          </div>
        </div>
      </div>
    </div>
    <t-image-viewer v-model:visible="previewVisible" :images="imageUrls" :index="previewIndex"></t-image-viewer>
  </div>
</template>
<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, ref } from 'vue';

import { getExt, getFileIconName, getNameFromUrl, resolveKind } from './util';

export interface FileViewerItem {
  name?: string;
  url: string;
}

defineOptions({
  name: 'FileViewer',
});

const props = defineProps({
  files: {
    type: Array as PropType<FileViewerItem[]>,
    default: () => [],
  },
});

const previewVisible = ref(false);
const previewIndex = ref(0);

const resolveFileKind = (file: FileViewerItem) => resolveKind(file.name || file.url);

const normalizedFiles = computed(() => {
  let imageIndex = 0;
  return props.files.map((file, idx) => {
    const kind = resolveFileKind(file);
    const name = file.name || getNameFromUrl(file.url) || '文件';
    const ext = getExt(file.name || file.url);
    const displayType = ext ? ext.toUpperCase() : 'FILE';
    const item = {
      key: `${file.url}-${idx}`,
      url: file.url,
      name,
      kind,
      displayType,
      downloadName: name,
      iconName: getFileIconName(ext),
      imageIndex: -1,
    };
    if (kind === 'image') {
      item.imageIndex = imageIndex;
      imageIndex += 1;
    }
    return item;
  });
});

const mediaFiles = computed(() => normalizedFiles.value.filter((file) => file.kind !== 'file'));
const fileOnly = computed(() => normalizedFiles.value.filter((file) => file.kind === 'file'));

const imageUrls = computed(() => mediaFiles.value.filter((item) => item.kind === 'image').map((item) => item.url));

const openImage = (index: number) => {
  if (index < 0) {
    return;
  }
  previewIndex.value = index;
  previewVisible.value = true;
};
</script>
<style lang="less" scoped>
@import '@/style/index.less';

.file-viewer {
  &-empty {
    color: var(--td-text-color-placeholder);
  }

  &-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 16px;
  }

  &-waterfall {
    column-gap: 16px;
    column-count: 3;
    column-width: 240px;
  }

  @media (max-width: 1200px) {
    &-waterfall {
      column-count: 2;
    }
  }

  @media (max-width: 768px) {
    &-waterfall {
      column-count: 1;
    }
  }

  &-item {
    border: 1px solid var(--td-border-level-1-color);
    border-radius: 12px;
    padding: 12px;
    background: var(--td-bg-color-container);
    box-shadow: var(--td-shadow-1);
    transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
    display: inline-block;
    width: 100%;
    margin: 0 0 16px;
    break-inside: avoid;
    page-break-inside: avoid;

    &:hover {
      border-color: var(--td-brand-color);
      box-shadow: var(--td-shadow-2);
      transform: translateY(-2px);
    }
  }

  &-item--file {
    padding: 10px 12px;
  }

  &-thumb {
    width: 100%;
    border: none;
    padding: 0;
    background: transparent;
    cursor: pointer;

    img {
      width: 100%;
      height: 160px;
      object-fit: cover;
      border-radius: 10px;
      display: block;
      background: var(--td-bg-color-secondarycontainer);
    }
  }

  &-video {
    width: 100%;
    height: 180px;
    border-radius: 10px;
    background: var(--td-bg-color-secondarycontainer);
  }

  &-meta {
    margin-top: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  &-name {
    font-size: 14px;
    color: var(--td-text-color-primary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  &-download {
    flex-shrink: 0;
  }

  &-file {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  &-file-thumb {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--td-bg-color-secondarycontainer);
    color: var(--td-brand-color);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }

  &-file-info {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &-type {
    font-size: 12px;
    color: var(--td-text-color-placeholder);
    background: var(--td-bg-color-secondarycontainer);
    padding: 2px 8px;
    border-radius: 999px;
    width: fit-content;
  }
}
</style>
