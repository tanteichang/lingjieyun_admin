<template>
  <t-card class="balance-card" :bordered="false">
    <div class="balance-card__main">
      <div class="balance-card__content">
        <div class="balance-card__label">
          账户余额（元）
          <browse-icon class="balance-card__eye" />
        </div>
        <div class="balance-card__amount">{{ formattedBalance }}</div>
      </div>

      <div class="balance-card__actions">
        <t-button theme="primary" class="balance-card__action" @click="handleRecharge">充值</t-button>
        <t-button variant="outline" class="balance-card__action">提现</t-button>
      </div>
    </div>

    <div class="balance-card__footer">
      <div class="balance-card__metric">
        <span class="balance-card__metric-label">服务费率</span>
        <span class="balance-card__metric-value">{{ serviceRate }}</span>
      </div>
      <div class="balance-card__divider"></div>
      <div class="balance-card__metric">
        <span class="balance-card__metric-label">发票（可开发票额度）</span>
        <span class="balance-card__metric-value">{{ formattedInvoiceAmount }}</span>
      </div>
    </div>
  </t-card>
</template>
<script setup lang="ts">
import { BrowseIcon } from 'tdesign-icons-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'ProfileBalanceCard',
});

const router = useRouter();

const props = withDefaults(
  defineProps<{
    balance?: number;
    serviceRate?: string;
    invoiceAmount?: number;
  }>(),
  {
    balance: 8980,
    serviceRate: '0.5%',
    invoiceAmount: 1000,
  },
);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

const formattedBalance = computed(() => formatCurrency(props.balance));
const formattedInvoiceAmount = computed(() => `¥ ${formatCurrency(props.invoiceAmount)}`);

const handleRecharge = () => {
  router.push({ name: 'SettingProfileRecharge' });
};
</script>
<style lang="less" scoped>
.balance-card {
  height: 100%;
  border-radius: 16px;
  background: linear-gradient(180deg, #edf4ff 0%, #e7f0ff 100%);
  border: 1px solid #cfe0ff;

  :deep(.t-card__body) {
    padding: 0;
  }
}

.balance-card__main {
  min-height: 160px;
  padding: 26px 28px 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.balance-card__content {
  min-width: 0;
  display: grid;
  gap: 18px;
}

.balance-card__label {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  line-height: 24px;
  color: #3d4d6a;
  font-weight: 600;
}

.balance-card__eye {
  color: #95a7c5;
  font-size: 18px;
}

.balance-card__amount {
  font-size: 28px;
  line-height: 1.2;
  font-weight: 700;
  color: #141a24;
  letter-spacing: 0.5px;
}

.balance-card__actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.balance-card__action {
  width: 120px;
  height: 40px;
  border-radius: 0;
  font-size: 16px;
  font-weight: 400;
}

.balance-card__footer {
  min-height: 54px;
  padding: 0 28px;
  border-top: 1px solid #cfe0ff;
  display: flex;
  align-items: center;
  gap: 24px;
}

.balance-card__metric {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.balance-card__metric-label {
  font-size: 14px;
  color: #5a6986;
}

.balance-card__metric-value {
  font-size: 16px;
  font-weight: 600;
  color: #212733;
}

.balance-card__divider {
  width: 1px;
  height: 24px;
  background: #cfe0ff;
  flex: 0 0 auto;
}

@media (max-width: 1200px) {
  .balance-card__main {
    padding: 22px;
    min-height: 148px;
  }

  .balance-card__action {
    width: 120px;
  }

  .balance-card__footer {
    padding: 14px 22px;
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }

  .balance-card__divider {
    display: none;
  }
}

@media (max-width: 768px) {
  .balance-card__main {
    flex-direction: column;
  }

  .balance-card__actions {
    width: 100%;
    grid-template-columns: repeat(2, 1fr);
  }

  .balance-card__action {
    width: 100%;
  }
}
</style>
