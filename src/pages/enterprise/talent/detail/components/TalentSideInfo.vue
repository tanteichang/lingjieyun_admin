<template>
  <div class="left-panel">
    <t-card class="left-card" :bordered="false">
      <div class="profile-card">
        <div class="profile-header">
          <t-avatar :image="profile.avatar" size="64" />
          <div class="profile-info">
            <div class="profile-name">{{ profile.name }}</div>
            <div class="profile-tags">
              <t-tag theme="primary">已实名</t-tag>
              <t-tag theme="primary" variant="outline">已签约</t-tag>
            </div>
          </div>
          <button class="profile-edit" type="button">
            <edit1-icon size="20" />
          </button>
        </div>
        <div class="profile-metrics">
          <div class="metric-item">
            <div class="metric-value">{{ profile.applyCount }}次</div>
            <div class="metric-label">报名次数</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ profile.education }}</div>
            <div class="metric-label">学历</div>
          </div>
          <div class="metric-item">
            <div class="metric-value">{{ profile.score }}</div>
            <div class="metric-label">评分</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">基本信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">身份证号</div>
            <div class="info-value">{{ profile.idCard }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">手机号</div>
            <div class="info-value">{{ profile.phone }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">签约日期</div>
            <div class="info-value">{{ profile.signTime }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">银行卡信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">持卡人</div>
            <div class="info-value">{{ bankInfo.owner }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">开户行名</div>
            <div class="info-value">{{ bankInfo.bank }}</div>
          </div>
          <div class="info-item">
            <div class="info-label">银行卡号</div>
            <div class="info-value">{{ bankInfo.cardNo }}</div>
          </div>
        </div>
      </div>

      <div class="info-section">
        <div class="info-title">身份证信息</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">身份证人像面</div>
            <t-link theme="primary" hover="color">查看图片</t-link>
          </div>
          <div class="info-item">
            <div class="info-label">身份证国徽面</div>
            <t-link theme="primary" hover="color">查看图片</t-link>
          </div>
        </div>
      </div>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { Edit1Icon } from 'tdesign-icons-vue-next';

defineOptions({
  name: 'TalentSideInfo',
});

defineProps<{
  profile: ProfileInfo;
  bankInfo: BankInfo;
}>();

interface ProfileInfo {
  name: string;
  avatar: string;
  applyCount: number;
  education: string;
  score: number;
  idCard: string;
  phone: string;
  signTime: string;
}

interface BankInfo {
  owner: string;
  bank: string;
  cardNo: string;
}
</script>
<style lang="less" scoped>
.left-panel {
  min-width: 0;
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
