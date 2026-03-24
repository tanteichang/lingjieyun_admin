<template>
  <t-card class="head-card" :bordered="false">
    <div class="head-wrap">
      <div class="head-left">
        <div class="logo-panel">
          <div class="logo-wrap">
            <div v-if="!showLogoUploader" class="company-logo">
              <company-badge
                class="company-logo-badge"
                :logo="logo"
                :full-name="companyName"
                size="100%"
                text-size="30px"
              />
            </div>
            <auto-upload
              v-else
              v-model="logoFiles"
              class="logo-upload"
              theme="image"
              accept=".png,.jpeg,.jpg"
              :max="1"
              :auto-upload="true"
            />
            <button v-if="!showLogoUploader" class="logo-camera" type="button" @click="handleOpenUploader">
              <t-icon name="camera" style="cursor: pointer" />
            </button>
          </div>
          <div v-if="showLogoUploader" class="logo-actions">
            <t-button size="small" theme="primary" @click="handleSaveLogo">保存</t-button>
            <t-button size="small" variant="outline" @click="handleCancelLogo">取消</t-button>
          </div>
        </div>

        <div class="company-meta">
          <div class="company-name">{{ companyName }}</div>
          <div class="company-code">统一社会信用代码: {{ creditCode }}</div>
          <div class="meta-tags">
            <span class="meta-tag meta-tag--location">
              <t-icon name="location" />
              <span class="meta-tag__text">
                {{ address?.province || '-' }}-{{ address?.city || '-' }}-{{ address?.district || '-' }}
              </span>
            </span>
            <span class="meta-tag meta-tag--person">
              <t-icon name="user" />
              <span class="meta-tag__text">{{ legalPersonInfo.name }}（法人）</span>
            </span>
          </div>
        </div>
      </div>

      <t-button variant="outline" theme="primary" class="agreement-btn">查看签约协议</t-button>
    </div>
  </t-card>
</template>
<script setup lang="ts">
import type { UploadFile } from 'tdesign-vue-next';
import { ref } from 'vue';

import type { EnterpriseLegalPersonInfo, EnterpriseProfileAddress } from '@/api/model/enterprise/profile';
import AutoUpload from '@/components/auto-upload/index.vue';
import CompanyBadge from '@/components/company-badge/index.vue';

defineOptions({
  name: 'ProfileHeadCard',
});

const props = defineProps<{
  logo: string | null;
  legalPersonInfo: EnterpriseLegalPersonInfo;
  companyName: string;
  creditCode: string;
  address: EnterpriseProfileAddress;
}>();

const emit = defineEmits<{
  'save-logo': [url: string];
}>();
const showLogoUploader = ref(false);
const logoFiles = ref<UploadFile[]>([]);

const handleOpenUploader = () => {
  showLogoUploader.value = true;
};

const handleSaveLogo = () => {
  const selected = logoFiles.value[0] || null;
  if (!selected?.url) return;
  emit('save-logo', selected.url);
  showLogoUploader.value = false;
};

const handleCancelLogo = () => {
  logoFiles.value = [];
  showLogoUploader.value = false;
};
</script>
<style lang="less" scoped>
.head-card {
  border-radius: 16px;

  :deep(.t-card__body) {
    padding: 22px;
  }
}

.head-wrap {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
}

.head-left {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  flex: 1;
  min-width: 0;
}

.logo-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.logo-wrap {
  width: 144px;
  height: 144px;
  border: 1px solid #dce5f4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.company-logo {
  width: 112px;
  height: 112px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.company-logo-badge {
  width: 100%;
  height: 100%;
}

.company-logo-img {
  width: 112px;
  height: 112px;
  object-fit: cover;
}

.logo-upload {
  width: 112px;
  height: 112px;

  :deep(.t-upload) {
    width: 112px;
    height: 112px;
  }

  :deep(.t-upload__flow-op) {
    width: 112px;
    height: 112px;
  }

  :deep(.t-upload__card) {
    width: 112px;
    height: 112px;
    margin: 0;
  }

  :deep(.t-upload__single-display) {
    width: 112px;
    height: 112px;
  }
}

.logo-actions {
  display: flex;
  gap: 8px;
}

.logo-line {
  width: 6px;
  border-radius: 3px;
  display: inline-block;
}

.line-1 {
  height: 28px;
  background: #00c8ff;
}

.line-2 {
  height: 36px;
  background: #ff9d00;
}

.line-3 {
  height: 42px;
  background: #0de0d2;
}

.logo-camera {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  position: absolute;
  right: -8px;
  bottom: -8px;
  background: var(--td-brand-color);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgb(0 82 217 / 24%);
}

.company-name {
  font-size: clamp(28px, 2.15vw, 34px);
  line-height: 1.12;
  font-weight: 600;
  color: var(--td-text-color-primary);
  word-break: break-all;
}

.company-meta {
  flex: 1;
  min-width: 0;
}

.company-code {
  margin-top: 10px;
  font-size: 12px;
  color: var(--td-text-color-secondary);
  line-height: 20px;
}

.meta-tags {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}

.meta-tag {
  padding: 0 12px;
  border-radius: 999px;
  min-height: 28px;
  background: #f1f4f9;
  color: var(--td-text-color-secondary);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  white-space: nowrap;
}

.meta-tag__text {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta-tag--location {
  max-width: min(100%, 320px);
}

.meta-tag--person {
  flex: 0 0 auto;
}

.agreement-btn {
  min-width: 130px;
  flex: 0 0 auto;
  align-self: flex-start;
}

@media (max-width: 1680px) {
  .logo-wrap {
    width: 132px;
    height: 132px;
  }

  .company-logo,
  .company-logo-img,
  .logo-upload,
  .logo-upload :deep(.t-upload),
  .logo-upload :deep(.t-upload__flow-op),
  .logo-upload :deep(.t-upload__card),
  .logo-upload :deep(.t-upload__single-display) {
    width: 102px;
    height: 102px;
  }

  .agreement-btn {
    min-width: 120px;
  }
}

@media (max-width: 1460px) {
  .head-wrap {
    align-items: flex-start;
  }

  .head-left {
    gap: 14px;
  }

  .company-name {
    font-size: 26px;
  }

  .meta-tag--location {
    max-width: 260px;
  }

  .agreement-btn {
    align-self: flex-start;
  }
}

@media (max-width: 1280px) {
  .head-wrap {
    flex-direction: column;
  }

  .agreement-btn {
    align-self: flex-start;
  }
}
</style>
