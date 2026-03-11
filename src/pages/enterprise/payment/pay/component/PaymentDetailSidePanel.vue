<template>
  <aside class="side-panel">
    <t-card class="side-card" :bordered="false">
      <template #header>
        <div class="side-card-title">
          <file-icon />
          <span>账单支付明细</span>
        </div>
      </template>

      <div class="detail-section">
        <div class="channel-row">
          <div class="channel-label">
            <tag-icon />
            <span>支付渠道</span>
          </div>
          <div class="channel-value">{{ summary.channel }}</div>
        </div>
        <div class="service-rate">
          <span>服务费率</span>
          <span class="rate-value">{{ detailData?.payment_info.service_fee_rate || '-' }}</span>
        </div>
      </div>

      <div class="bill-list">
        <div class="bill-row">
          <span>发放总金额</span>
          <strong>{{ detailData?.distribution_amount || '0.00' }}</strong>
        </div>
        <div class="bill-row">
          <span>总服务费</span>
          <strong>{{ detailData?.service_fee || '0.00' }}</strong>
        </div>
        <div class="bill-row">
          <span>代缴个税</span>
          <strong>{{ detailData?.payment_info?.personal_tax || '0.00' }}</strong>
        </div>
      </div>

      <div class="total-panel">
        <div class="total-panel-top">
          <span>支付总计</span>
          <span>已包含所有税费</span>
        </div>
        <div class="total-panel-bottom">
          <span class="currency">CNY</span>
          <span class="total-number">¥{{ summary.totalAmount }}</span>
        </div>
      </div>

      <div class="finish-time">
        <time-icon />
        <span>结算时间: {{ summary.finishTime }}</span>
      </div>
    </t-card>

    <t-card class="side-card" :bordered="false">
      <div class="section-caption">项目归属</div>
      <div class="ownership-card">
        <div class="ownership-icon task">
          <user-1-icon />
        </div>
        <div>
          <div class="ownership-label">所属任务</div>
          <div class="ownership-value">{{ detailData?.task_name || '-' }}</div>
        </div>
      </div>
      <div class="ownership-card">
        <div class="ownership-icon project">
          <app-icon />
        </div>
        <div>
          <div class="ownership-label">所属项目</div>
          <div class="ownership-value">{{ detailData?.project_name || '-' }}</div>
        </div>
      </div>
      <div class="company-card">
        <div class="ownership-label">所属企业</div>
        <div class="ownership-value">{{ detailData?.customer_name || '-' }}</div>
      </div>
    </t-card>
  </aside>
</template>
<script setup lang="ts">
import { AppIcon, FileIcon, TagIcon, TimeIcon, User1Icon } from 'tdesign-icons-vue-next';

import type { BillDetailData } from '@/api/model/enterprise/bill';

defineOptions({
  name: 'PaymentDetailSidePanel',
});

defineProps<{
  detailData: BillDetailData | null;
  summary: SideSummary;
}>();

interface SideSummary {
  channel: string;
  totalAmount: string;
  finishTime: string;
}
</script>
<style scoped lang="less">
.side-panel {
  display: grid;
  gap: 24px;
  margin-top: -22px;
}

.side-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(15, 23, 47, 0.06);

  :deep(.t-card__header) {
    padding: 18px 22px;
    border-bottom: 1px solid #edf1f6;
  }

  :deep(.t-card__body) {
    padding: 22px;
  }
}

.side-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: #18233d;
}

.detail-section {
  padding-bottom: 18px;
  border-bottom: 1px dashed #dde4ef;
}

.channel-row,
.service-rate,
.bill-row,
.total-panel-top,
.total-panel-bottom,
.finish-time {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.channel-row {
  gap: 12px;
}

.channel-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #7a869d;
}

.channel-value {
  font-size: 15px;
  font-weight: 700;
  color: #18233d;
}

.service-rate {
  margin-top: 18px;
  color: #6f7e98;
  font-size: 14px;
}

.rate-value {
  color: #2f6ce5;
  font-weight: 700;
  font-size: 15px;
}

.bill-list {
  display: grid;
  gap: 18px;
  padding: 20px 0 22px;
}

.bill-row {
  font-size: 14px;
  color: #6f7c95;

  strong {
    font-size: 15px;
    color: #2d3952;
  }
}

.total-panel {
  padding: 16px 18px;
  border-radius: 14px;
  background: linear-gradient(135deg, #132247 0%, #0a1532 100%);
  color: #fff;
}

.total-panel-top {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.72);
}

.total-panel-bottom {
  margin-top: 10px;
  justify-content: flex-start;
  gap: 6px;
}

.currency {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.72);
  font-style: italic;
}

.total-number {
  font-size: 24px;
  font-weight: 700;
}

.finish-time {
  margin-top: 16px;
  justify-content: center;
  gap: 8px;
  color: #93a0b6;
  font-size: 13px;
}

.section-caption {
  margin-bottom: 22px;
  font-size: 14px;
  color: #8895ab;
  font-weight: 700;
}

.ownership-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 0 0 18px;
  margin-bottom: 18px;
  border-bottom: 1px dashed #e2e8f0;
}

.ownership-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  font-size: 18px;

  &.task {
    background: #edf4ff;
    color: #4b84ff;
  }

  &.project {
    background: #f3ebff;
    color: #9a5ef6;
  }
}

.ownership-label {
  font-size: 13px;
  color: #8a97ad;
}

.ownership-value {
  margin-top: 4px;
  font-size: 15px;
  font-weight: 700;
  color: #18233d;
}

.company-card {
  padding: 14px 16px;
  border-radius: 14px;
  background: #f6f8fb;
}

@media (max-width: 1360px) {
  .side-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 0;
  }
}

@media (max-width: 960px) {
  .side-panel {
    grid-template-columns: 1fr;
  }
}
</style>
