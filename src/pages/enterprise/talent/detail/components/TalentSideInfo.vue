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
          <!-- <button class="profile-edit" type="button">
            <edit1-icon size="20" />
          </button> -->
        </div>
        <div class="profile-metrics">
          <div class="metric-item">
            <div class="metric-value">{{ basicInfo.apply_count || 0 }}次</div>
            <div class="metric-label">报名次数</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ basicInfo.education || '-' }}</div>
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
            <div class="info-value">{{ bankInfo.holder_name || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">开户行名</div>
            <div class="info-value">{{ bankInfo.bank_name || '-' }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">银行卡号</div>
            <div class="info-value">{{ bankInfo.bank_card_masked || '-' }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">身份证信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">身份证人像面</div>
            <t-link v-if="identityInfo.card_front" theme="primary" hover="color" @click="openIdentityImage('front')">
              查看图片
            </t-link>
            <div v-else class="info-value">-</div>
          </div>
          <div class="info-item">
            <div class="info-label">身份证国徽面</div>
            <t-link v-if="identityInfo.card_back" theme="primary" hover="color" @click="openIdentityImage('back')">
              查看图片
            </t-link>
            <div v-else class="info-value">-</div>
          </div>
        </div>
      </div>
    </t-card>
    <t-image-viewer v-model:visible="previewVisible" v-model:index="previewIndex" :images="previewImages" />
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref, toRefs } from 'vue';

import type {
  TalentPoolBankInfo,
  TalentPoolBasicInfo,
  TalentPoolContactInfo,
  TalentPoolIdentityInfo,
  TalentPoolSignInfo,
} from '@/api/model/enterprise/talentpool';

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

const { basicInfo, contactInfo, bankInfo, identityInfo, signInfo } = toRefs(props);

const previewVisible = ref(false);
const previewIndex = ref(0);
const previewImages = computed(() => [identityInfo.value.card_front, identityInfo.value.card_back].filter(Boolean) as string[]);

const openIdentityImage = (side: 'front' | 'back') => {
  const currentUrl = side === 'front' ? identityInfo.value.card_front : identityInfo.value.card_back;
  if (!currentUrl) return;
  const index = previewImages.value.findIndex((url) => url === currentUrl);
  previewIndex.value = index >= 0 ? index : 0;
  previewVisible.value = true;
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
