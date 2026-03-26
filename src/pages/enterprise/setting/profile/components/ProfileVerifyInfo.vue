<template>
  <div class="verify-info">
    <div class="section-title">工商注册信息</div>
    <div class="verify-grid">
      <div class="doc-card">
        <div class="doc-title">营业执照</div>
        <div
          class="license-image previewable-image"
          :class="{ 'previewable-image--disabled': !props.industryRegistration.business_license }"
          @click="openPreview([props.industryRegistration.business_license], 0)"
        >
          <img :src="props.industryRegistration.business_license" mode="scaleToFill" />
        </div>
      </div>
    </div>

    <div class="section-title section-gap">法人信息</div>
    <div class="verify-grid verify-grid--stack">
      <div class="left-fields">
        <div class="field-item">
          <div class="field-label">姓名</div>
          <div class="field-value">{{ props.legalPersonInfo.name }}</div>
        </div>
        <div class="field-item">
          <div class="field-label">联系电话</div>
          <div class="field-value">{{ props.legalPersonInfo.phone }}</div>
        </div>
      </div>
      <div class="doc-card doc-card--id">
        <div class="doc-title">身份证</div>
        <div class="id-images">
          <div
            class="id-image previewable-image"
            :class="{ 'previewable-image--disabled': !props.legalPersonInfo.id_card_front }"
            @click="openPreview([props.legalPersonInfo.id_card_front, props.legalPersonInfo.id_card_back], 0)"
          >
            <img :src="props.legalPersonInfo.id_card_front" mode="scaleToFill" />
          </div>
          <div
            class="id-image previewable-image"
            :class="{ 'previewable-image--disabled': !props.legalPersonInfo.id_card_back }"
            @click="openPreview([props.legalPersonInfo.id_card_front, props.legalPersonInfo.id_card_back], 1)"
          >
            <img :src="props.legalPersonInfo.id_card_back" mode="scaleToFill" />
          </div>
        </div>
      </div>
    </div>
    <t-image-viewer v-model:visible="previewVisible" v-model:index="previewIndex" :images="previewImages" />
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import type { EnterpriseIndustryRegistration, EnterpriseLegalPersonInfo } from '@/api/model/enterprise/profile';

defineOptions({
  name: 'ProfileVerifyInfo',
});

const props = defineProps({
  legalPersonInfo: {
    type: Object as () => EnterpriseLegalPersonInfo,
    default: () => ({}),
  },
  industryRegistration: {
    type: Object as () => EnterpriseIndustryRegistration,
    default: () => ({}),
  },
});

const previewVisible = ref(false);
const previewIndex = ref(0);
const previewImages = ref<string[]>([]);

const openPreview = (images: Array<string | undefined>, index: number) => {
  const current = images[index];
  const normalized = images.filter((item): item is string => !!item);
  if (!normalized.length || !current) {
    return;
  }

  previewImages.value = normalized;
  previewIndex.value = Math.max(
    0,
    normalized.findIndex((item) => item === current),
  );
  previewVisible.value = true;
};
</script>
<style lang="less" scoped>
@import './profile-shared.less';

.verify-info {
  padding: 32px;
  background: #fff;
  border-radius: 8px;
}

.section-title {
  .profile-section-title();
}

.section-gap {
  margin-top: 34px;
}

.verify-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 500px;
  gap: 22px;
  align-items: start;
}

.verify-grid--stack {
  grid-template-columns: minmax(0, 1fr);
}

.left-fields {
  display: grid;
  width: 320px;
  max-width: 100%;
  gap: 14px;
}

.field-label {
  margin-bottom: 6px;
  font-size: 11px;
  color: var(--td-text-color-placeholder);
}

.field-value {
  min-height: 42px;
  border: 1px solid #dfe5ef;
  background: #f7f9fc;
  border-radius: 4px;
  color: #5f6470;
  font-size: 13px;
  padding: 10px;
  line-height: 1.5;
}

.field-value-area {
  min-height: 130px;
}

.doc-card {
  background: #f5f7fc;
  border-radius: 8px;
  padding: 20px 22px;
  min-height: 320px;
}
.doc-card--id {
  width: 50%;
  max-width: 100%;
}

.doc-title {
  font-size: 16px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.license-image {
  width: 310px;
  height: 190px;
  margin: 34px auto 0;
  border-radius: 6px;
  border: 1px solid #d4dbea;
  background: linear-gradient(135deg, #f9f7ef 0%, #fefdf8 100%);
  color: #8f95a4;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.license-image img {
  width: 100%;
  height: 100%;
}

.previewable-image {
  position: relative;
  cursor: zoom-in;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.previewable-image:hover {
  border-color: #b8c8eb;
  box-shadow: 0 10px 24px rgb(54 94 182 / 10%);
  transform: translateY(-1px);
}

.previewable-image--disabled {
  cursor: default;
}

.previewable-image--disabled:hover {
  box-shadow: none;
  transform: none;
}

.id-images {
  margin-top: 64px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 44px;
}

.id-image {
  width: 220px;
  max-width: 100%;
  aspect-ratio: 441 / 358;
  border-radius: 6px;
  border: 1px solid #cfd8eb;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.id-image img {
  width: 100%;
  height: 100%;
}
</style>
