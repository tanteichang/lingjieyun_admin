<template>
  <t-card class="head-card" :bordered="false">
    <div class="head-wrap">
      <div class="head-left">
        <div class="logo-panel">
          <div class="logo-wrap">
            <div class="company-logo">
              <company-badge
                class="company-logo-badge"
                :logo="logo"
                :full-name="companyName"
                size="100%"
                text-size="30px"
              />
            </div>
            <button class="logo-camera" type="button" @click="handleOpenUploader">
              <t-icon name="camera" style="cursor: pointer" />
            </button>
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
      <t-button :loading="loading" variant="text" theme="primary" class="agreement-btn" @click="handleViewAgreement"
        >查看签约协议</t-button
      >
    </div>
  </t-card>

  <t-dialog
    v-model:visible="logoDialogVisible"
    width="520px"
    header="修改企业 LOGO"
    confirm-btn="保存"
    cancel-btn="取消"
    @confirm="handleSaveLogo"
    @cancel="handleCancelLogo"
    @close="handleCancelLogo"
  >
    <div class="logo-dialog">
      <div class="logo-dialog__upload">
        <div class="logo-dialog__title">上传新 LOGO</div>
        <auto-upload v-model="logoFiles" theme="image" accept=".png,.jpeg,.jpg" :max="1" :auto-upload="true" />
        <div class="logo-dialog__tip">支持 PNG、JPG、JPEG，建议上传清晰的正方形图片。</div>
      </div>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import type { UploadFile } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';

import { viewAgreement } from '@/api/enterprise/agreement';
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

const loading = ref(false);

const logoDialogVisible = ref(false);
const logoFiles = ref<UploadFile[]>([]);

const handleOpenUploader = () => {
  logoDialogVisible.value = true;
};

const handleSaveLogo = () => {
  const selected = logoFiles.value[0] || null;
  if (!selected?.url) return;
  emit('save-logo', selected.url);
  logoFiles.value = [];
  logoDialogVisible.value = false;
};

const handleCancelLogo = () => {
  logoFiles.value = [];
  logoDialogVisible.value = false;
};

const handleViewAgreement = () => {
  loading.value = true;
  viewAgreement()
    .then((res) => {
      if (res.code === 200) {
        if (res.data.ess_file_url) {
          window.open(res.data.ess_file_url);
        } else {
          MessagePlugin.error('签约协议不存在');
        }
      }
    })
    .finally(() => {
      loading.value = false;
    });
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
  position: relative;
  display: flex;
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
  font-size: 24px;
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
  position: absolute;
  right: 0;
  bottom: -10px;
  min-width: 120px;
}

.logo-dialog {
  display: grid;
  gap: 22px;
  padding-top: 8px;
}

.logo-dialog__title {
  margin-bottom: 12px;
  color: var(--td-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}

.logo-dialog__preview,
.logo-dialog__upload {
  padding: 18px;
}

.logo-dialog__badge {
  width: 120px;
  height: 120px;
  border: 1px solid #dce5f4;
  border-radius: 16px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-dialog__tip {
  margin-top: 12px;
  color: var(--td-text-color-secondary);
  font-size: 12px;
  line-height: 20px;
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
    min-width: 120px;
  }
}

@media (max-width: 1280px) {
  .head-wrap {
    flex-direction: column;
    align-items: flex-start;
  }

  .agreement-btn {
    position: static;
    margin-top: 20px;
    align-self: flex-end;
  }
}
</style>
