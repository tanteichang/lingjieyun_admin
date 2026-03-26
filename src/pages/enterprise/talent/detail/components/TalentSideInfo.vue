<template>
  <div class="left-panel">
    <t-card class="left-card" :bordered="false">
      <div class="profile-card">
        <div class="profile-header">
          <t-avatar :image="basicInfo.avatar" size="64" />
          <div class="profile-info">
            <div class="profile-name">{{ basicInfo.name || '-' }}</div>
            <div class="profile-tags">
              <t-tag :theme="basicInfo.is_auth ? 'success' : 'warning'">
                {{ basicInfo.is_auth ? '已实名' : '待实名' }}
              </t-tag>
              <t-tag :theme="basicInfo.is_signed ? 'success' : 'warning'" variant="outline">
                {{ basicInfo.is_signed ? '已签约' : '待签约' }}
              </t-tag>
            </div>
          </div>
          <button class="profile-edit" type="button" @click="openEditDialog">
            <t-icon name="edit-2" size="20" />
          </button>
        </div>
        <div class="profile-metrics">
          <div class="metric-item">
            <div class="metric-value">{{ basicInfo.apply_count || 0 }}次</div>
            <div class="metric-label">报名次数</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ dictStore.getEducationLabel(basicInfo.education) }}</div>
            <div class="metric-label">学历</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ basicInfo.score ?? '-' }}</div>
            <div class="metric-label">评分</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">身份证号</div>
            <div class="info-value">{{ identityInfo.id_card_masked || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">{{ contactInfo.phone_masked || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">签约日期</div>
            <div class="info-value">{{ formatDateTime(signInfo.signed_at) }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">银行卡信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">持卡人</div>
            <div class="info-value">{{ displayBankInfo.holder_name || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">开户行名</div>
            <div class="info-value">{{ displayBankInfo.bank_name || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">银行卡号</div>
            <div class="info-value">{{ displayBankInfo.bank_card_masked || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">身份证信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">身份证人像面</div>
            <t-link
              v-if="displayIdentityInfo.card_front"
              theme="primary"
              hover="color"
              @click="openIdentityImage('front')"
            >
              查看图片
            </t-link>
            <div v-else class="info-value">-</div>
          </div>
          <div class="info-item">
            <div class="info-label">身份证国徽面</div>
            <t-link
              v-if="displayIdentityInfo.card_back"
              theme="primary"
              hover="color"
              @click="openIdentityImage('back')"
            >
              查看图片
            </t-link>
            <div v-else class="info-value">-</div>
          </div>
        </div>
      </div>
    </t-card>
    <t-image-viewer v-model:visible="previewVisible" v-model:index="previewIndex" :images="previewImages" />
    <t-dialog
      v-model:visible="editDialogVisible"
      header="编辑信息"
      width="760px"
      :close-on-overlay-click="false"
      :confirm-btn="{ content: '保存', loading: submitLoading }"
      @confirm="handleSave"
      @cancel="handleCloseDialog"
      @close="handleCloseDialog"
    >
      <t-form ref="formRef" :data="formData" :rules="effectiveRules" label-align="top">
        <t-row :gutter="[16, 12]">
          <template v-if="!hasExistingBankCard">
            <t-col :span="6">
              <t-form-item label="持卡人" name="holder_name">
                <t-input v-model="formData.holder_name" placeholder="请输入持卡人姓名" clearable />
              </t-form-item>
            </t-col>
            <t-col :span="6">
              <t-form-item label="开户行名" name="bank_name">
                <t-input v-model="formData.bank_name" placeholder="请输入开户行名称" clearable />
              </t-form-item>
            </t-col>
            <t-col :span="12">
              <t-form-item label="银行卡号" name="bank_card">
                <t-input v-model="formData.bank_card" placeholder="请输入银行卡号" clearable />
              </t-form-item>
            </t-col>
          </template>
          <t-col :span="6">
            <t-form-item label="身份证人像面" name="_card_front_files">
              <auto-upload
                v-model="formData._card_front_files"
                theme="image"
                accept=".png,.jpeg,.jpg"
                :max="1"
                :auto-upload="true"
                :size-limit="{ size: 5, unit: 'MB' }"
              />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="身份证国徽面" name="_card_back_files">
              <auto-upload
                v-model="formData._card_back_files"
                theme="image"
                accept=".png,.jpeg,.jpg"
                :max="1"
                :auto-upload="true"
                :size-limit="{ size: 5, unit: 'MB' }"
              />
            </t-form-item>
          </t-col>
        </t-row>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import type { FormInstanceFunctions, FormRules, UploadFile } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref, toRefs, watch } from 'vue';

import { addBank, updateIdCardImages } from '@/api/enterprise/talentpool';
import type {
  TalentPoolBankInfo,
  TalentPoolBasicInfo,
  TalentPoolContactInfo,
  TalentPoolIdentityInfo,
  TalentPoolSignInfo,
} from '@/api/model/enterprise/talentpool';
import AutoUpload from '@/components/auto-upload/index.vue';
import { useDictStore } from '@/store/modules/enterprise/dict';

defineOptions({
  name: 'TalentSideInfo',
});

const props = defineProps<{
  basicInfo: TalentPoolBasicInfo;
  contactInfo: TalentPoolContactInfo;
  bankInfo: TalentPoolBankInfo;
  identityInfo: TalentPoolIdentityInfo;
  signInfo: TalentPoolSignInfo;
}>();

const emit = defineEmits<{
  (e: 'updated'): void;
}>();

const dictStore = useDictStore();
const { basicInfo, contactInfo, bankInfo, identityInfo, signInfo } = toRefs(props);

const previewVisible = ref(false);
const previewIndex = ref(0);
const editDialogVisible = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstanceFunctions>();
const previewImages = computed(
  () => [displayIdentityInfo.value.card_front, displayIdentityInfo.value.card_back].filter(Boolean) as string[],
);
const displayBankInfo = ref<TalentPoolBankInfo>({ ...bankInfo.value });
const displayIdentityInfo = ref<TalentPoolIdentityInfo>({ ...identityInfo.value });
const hasExistingBankCard = computed(() => hasValue(displayBankInfo.value.bank_card));

interface EditFormData {
  holder_name: string;
  bank_name: string;
  bank_card: string;
  card_front: string;
  card_back: string;
  _card_front_files: UploadFile[];
  _card_back_files: UploadFile[];
}

const createUploadFiles = (url: string) => {
  if (!url) return [];
  const filename = decodeURIComponent(url.split('/').pop() || 'image');
  return [{ url, name: filename, status: 'success', percent: 100 }] as UploadFile[];
};

const createInitialForm = (): EditFormData => ({
  holder_name: displayBankInfo.value.holder_name || '',
  bank_name: displayBankInfo.value.bank_name || '',
  bank_card: displayBankInfo.value.bank_card || '',
  card_front: displayIdentityInfo.value.card_front || '',
  card_back: displayIdentityInfo.value.card_back || '',
  _card_front_files: createUploadFiles(displayIdentityInfo.value.card_front || ''),
  _card_back_files: createUploadFiles(displayIdentityInfo.value.card_back || ''),
});

const formData = reactive<EditFormData>(createInitialForm());

const rules: FormRules = {
  holder_name: [{ required: false, message: '请输入持卡人姓名', type: 'error' }],
  bank_name: [{ required: false, message: '请输入开户行名称', type: 'error' }],
  bank_card: [{ required: false, message: '请输入银行卡号', type: 'error' }],
  _card_front_files: [
    {
      validator: (value: UploadFile[]) => Array.isArray(value) && value.length > 0,
      message: '请上传身份证人像面',
      type: 'error',
    },
  ],
  _card_back_files: [
    {
      validator: (value: UploadFile[]) => Array.isArray(value) && value.length > 0,
      message: '请上传身份证国徽面',
      type: 'error',
    },
  ],
};
const effectiveRules = computed<FormRules>(() => {
  if (hasExistingBankCard.value) {
    return {
      _card_front_files: rules._card_front_files,
      _card_back_files: rules._card_back_files,
    };
  }

  return rules;
});

const resetForm = () => {
  Object.assign(formData, createInitialForm());
};

watch(
  bankInfo,
  (value) => {
    displayBankInfo.value = { ...value };
  },
  { deep: true, immediate: true },
);

watch(
  identityInfo,
  (value) => {
    displayIdentityInfo.value = { ...value };
  },
  { deep: true, immediate: true },
);

watch(
  () => formData._card_front_files,
  (files) => {
    formData.card_front = files?.[0]?.url || '';
  },
  { deep: true },
);

watch(
  () => formData._card_back_files,
  (files) => {
    formData.card_back = files?.[0]?.url || '';
  },
  { deep: true },
);

const openIdentityImage = (side: 'front' | 'back') => {
  const currentUrl = side === 'front' ? displayIdentityInfo.value.card_front : displayIdentityInfo.value.card_back;
  if (!currentUrl) return;
  const index = previewImages.value.findIndex((url) => url === currentUrl);
  previewIndex.value = index >= 0 ? index : 0;
  previewVisible.value = true;
};

const openEditDialog = () => {
  resetForm();
  formRef.value?.clearValidate?.();
  editDialogVisible.value = true;
};

const handleCloseDialog = () => {
  editDialogVisible.value = false;
  resetForm();
  formRef.value?.clearValidate?.();
};

const handleSave = async () => {
  const validateResult = await formRef.value?.validate?.();
  if (validateResult !== true) return;

  if (!basicInfo.value.id) {
    MessagePlugin.warning('人才ID无效');
    return;
  }

  const hadBankCardBeforeSave = hasExistingBankCard.value;

  submitLoading.value = true;
  try {
    if (!hadBankCardBeforeSave) {
      const bankRes = await addBank({
        talent_pool_id: basicInfo.value.id,
        talent_name: formData.holder_name.trim(),
        bank_name: formData.bank_name.trim(),
        card_no: formData.bank_card.replace(/\s/g, ''),
      });

      if (bankRes.code !== 200) return;

      displayBankInfo.value = {
        ...displayBankInfo.value,
        holder_name: formData.holder_name.trim(),
        bank_name: formData.bank_name.trim(),
        bank_card: formData.bank_card.replace(/\s/g, ''),
        bank_card_masked: maskBankCard(formData.bank_card),
      };
    }

    const idCardRes = await updateIdCardImages({
      talent_pool_id: basicInfo.value.id,
      card_front: formData.card_front,
      card_back: formData.card_back,
    });

    if (idCardRes.code !== 200) return;

    displayIdentityInfo.value = {
      ...displayIdentityInfo.value,
      card_front: formData.card_front,
      card_back: formData.card_back,
    };

    MessagePlugin.success(hadBankCardBeforeSave ? '身份证照片更新成功' : '银行卡和身份证照片更新成功');
    handleCloseDialog();
    emit('updated');
  } finally {
    submitLoading.value = false;
  }
};

const maskBankCard = (value: string) => {
  const normalized = String(value || '').replace(/\s/g, '');
  if (!normalized) return '';
  if (normalized.length <= 8) return normalized;
  return `${normalized.slice(0, 4)} **** **** ${normalized.slice(-4)}`;
};

const hasValue = (value: string) => {
  return !!String(value || '').trim();
};

const formatDateTime = (value: string | number | null) => {
  if (value === undefined || value === null || value === '') return '-';
  if (typeof value === 'number') {
    const timestamp = value > 1_000_000_000_000 ? value : value * 1000;
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss');
  }
  const date = dayjs(value);
  return date.isValid() ? date.format('YYYY-MM-DD HH:mm:ss') : value;
};
</script>
<style lang="less" scoped>
.left-panel {
  min-width: 0;
  padding: 16px;
  background: #fff;
}

.left-card {
  :deep(.t-card__body) {
    padding: 16px 16px 20px;
  }
}

.profile-card {
  background: #f3f5fb;
  border-radius: 6px;
  padding: 20px 20px 16px;
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.profile-name {
  font-size: 20px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  line-height: 1.2;
}

.profile-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-edit {
  border: 0;
  background: transparent;
  color: #959fb0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

.profile-edit:hover {
  color: var(--td-brand-color);
}

.profile-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 18px;
}

.metric-item {
  text-align: center;
}

.metric-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  line-height: 1.2;
}

.metric-label {
  margin-top: 4px;
  color: var(--td-text-color-secondary);
  font-size: 13px;
}

.info-section {
  margin-top: 18px;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin-bottom: 10px;
  border-left: 4px solid var(--td-brand-color);
  padding-left: 10px;
  line-height: 1.2;
}

.info-grid {
  display: grid;
  gap: 10px;
  padding-left: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 14px;
}

.info-label {
  color: var(--td-text-color-secondary);
  font-size: 13px;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: var(--td-text-color-primary);
  font-size: 14px;
  line-height: 1.4;
}

:deep(.profile-tags .t-tag) {
  border-radius: 2px;
  font-size: 14px;
  padding: 0 8px;
  line-height: 24px;
}

:deep(.info-item .t-link) {
  font-size: 14px;
}

@media (max-width: 1200px) {
  .profile-name {
    font-size: 20px;
  }

  .metric-value {
    font-size: 20px;
  }

  .metric-label {
    font-size: 14px;
  }

  .info-title {
    font-size: 18px;
  }

  .info-label {
    width: 76px;
    font-size: 14px;
  }

  .info-value {
    font-size: 14px;
  }

  :deep(.profile-tags .t-tag),
  :deep(.info-item .t-link) {
    font-size: 12px;
    line-height: 24px;
  }
}
</style>
