<template>
  <div class="profile-recharge-page">
    <t-card class="recharge-card" :bordered="false">
      <template #header>
        <div class="recharge-card__header">充值</div>
      </template>

      <div class="recharge-card__body">
        <div class="recharge-balance">
          <span class="recharge-balance__label">可用余额：</span>
          <span class="recharge-balance__value">¥ {{ availableBalance }}</span>
        </div>

        <div class="recharge-method">
          <div class="recharge-section-label">充值方式：</div>
          <div class="recharge-method__options">
            <button type="button" class="method-option" :class="{ 'method-option--active': activeMethod === 'ebank' }" @click="activeMethod = 'ebank'">
              网商银行
            </button>
            <button
              type="button"
              class="method-option"
              :class="{ 'method-option--active': activeMethod === 'bank' }"
              @click="activeMethod = 'bank'"
            >
              银行转账
              <span v-if="activeMethod === 'bank'" class="method-option__check"></span>
            </button>
          </div>
        </div>

        <div class="recharge-steps">
          <div v-for="(item, index) in steps" :key="item" class="recharge-step">
            <div class="recharge-step__node" :class="{ 'recharge-step__node--active': index === 0 }">{{ index + 1 }}</div>
            <div class="recharge-step__text" :class="{ 'recharge-step__text--active': index === 0 }">{{ item }}</div>
            <div v-if="index < steps.length - 1" class="recharge-step__line"></div>
          </div>
        </div>

        <div class="recharge-account">
          <div class="recharge-section-label">平台收款账号：</div>
          <div class="recharge-account__card">
            <div class="recharge-account__warning">
              <span class="recharge-account__warning-icon">!</span>
              重要提示：付款方的银行开户名必须与灵捷云平台实名认证信息同名，同时本名称将是您后期开增值税专用发票的名称。
            </div>
            <div class="recharge-account__row">
              <span class="recharge-account__row-label">收款户名：</span>
              <span class="recharge-account__row-value">{{ payeeInfo.accountName }}</span>
            </div>
            <div class="recharge-account__row">
              <span class="recharge-account__row-label">收款银行：</span>
              <span class="recharge-account__row-value">{{ payeeInfo.bankName }}</span>
            </div>
            <div class="recharge-account__row">
              <span class="recharge-account__row-label">收款账号：</span>
              <span class="recharge-account__row-value">{{ payeeInfo.accountNo }}</span>
            </div>
          </div>
        </div>

        <div class="recharge-notes">
          <div class="recharge-section-label">汇款说明：</div>
          <ol class="recharge-notes__list">
            <li v-for="item in notes" :key="item">{{ item }}</li>
          </ol>
        </div>
      </div>
    </t-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineOptions({
  name: 'SettingProfileRecharge',
});

const availableBalance = '0.00';
const activeMethod = ref<'ebank' | 'bank'>('bank');

const steps = ['确认转账方式', '进行银行转账', '等待充值到账'];

const payeeInfo = {
  accountName: '灵捷云（广州）科技股份有限公司',
  bankName: '招商银行北京上地支行（联行号：308100005416）',
  accountNo: '1055 1101 0400 1434 1000 1136 731',
};

const notes = [
  '受银行处理时间影响，采用线下汇款方式到账会有延迟。',
  '线下汇款直接向聚合的专属账户汇款，系统会将款项直接匹配到您的聚合账户（具体到账时间以银行的实际到账时间为准）。',
  '专属账户暂不支持支付宝、财付通等平台转账汇款。',
  '付款方的银行开户名必须与聚合实名认证信息同名，同时本名称将是您后期开增值税专用发票的名称。企业用户必须公对公转账，否则不给予入账。',
  '根据税法合规要求，增值税专用发票抬头需与账户实名认证信息严格保持一致，不支持任何场景的变更专票抬头诉求。',
];
</script>

<style lang="less" scoped>
.profile-recharge-page {
  padding: 12px;
}

.recharge-card {
  border-radius: 16px;

  :deep(.t-card__header) {
    padding: 22px 28px 18px;
    border-bottom: 1px solid var(--td-component-stroke);
  }

  :deep(.t-card__body) {
    padding: 30px 36px 42px;
  }
}

.recharge-card__header {
  font-size: 22px;
  font-weight: 600;
  color: #1f2430;
}

.recharge-card__body {
  max-width: 980px;
}

.recharge-balance {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recharge-balance__label {
  font-size: 16px;
  color: #2f3542;
  font-weight: 600;
}

.recharge-balance__value {
  font-size: 22px;
  font-weight: 700;
  color: #2b2f36;
}

.recharge-method,
.recharge-account,
.recharge-notes {
  margin-top: 38px;
}

.recharge-section-label {
  margin-bottom: 18px;
  font-size: 16px;
  font-weight: 600;
  color: #2f3542;
}

.recharge-method__options {
  display: flex;
  gap: 14px;
}

.method-option {
  width: 200px;
  height: 44px;
  border: 1px solid #d7deea;
  background: #fff;
  color: #3c4453;
  font-size: 16px;
  position: relative;
}

.method-option--active {
  color: #1457f5;
  border-color: #1457f5;
  box-shadow: inset 0 0 0 1px #1457f5;
}

.method-option__check {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 20px;
  height: 20px;
  background: linear-gradient(135deg, transparent 50%, #1457f5 50%);
}

.method-option__check::after {
  content: '';
  position: absolute;
  right: 3px;
  bottom: 6px;
  width: 9px;
  height: 5px;
  border-left: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(-45deg);
}

.recharge-steps {
  margin-top: 42px;
  display: flex;
  align-items: center;
}

.recharge-step {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
}

.recharge-step__node {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #c9ccd3;
  color: #fff;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.recharge-step__node--active {
  background: #1457f5;
}

.recharge-step__text {
  margin-left: 8px;
  font-size: 14px;
  color: #7e8695;
  white-space: nowrap;
}

.recharge-step__text--active {
  color: #1457f5;
}

.recharge-step__line {
  flex: 1;
  min-width: 60px;
  height: 1px;
  margin: 0 14px;
  background: #d7deea;
}

.recharge-account__card {
  width: 100%;
  max-width: 860px;
  border: 1px solid #d7deea;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
}

.recharge-account__warning {
  min-height: 48px;
  padding: 12px 14px;
  background: #fff7ea;
  color: #d67d00;
  font-size: 14px;
  line-height: 24px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.recharge-account__warning-icon {
  width: 18px;
  height: 18px;
  margin-top: 3px;
  border-radius: 50%;
  background: #ff9c00;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.recharge-account__row {
  padding: 16px 24px 0;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  line-height: 26px;
}

.recharge-account__row:last-child {
  padding-bottom: 22px;
}

.recharge-account__row-label {
  color: #5e6573;
  flex: 0 0 auto;
}

.recharge-account__row-value {
  color: #2a303a;
  font-weight: 600;
}

.recharge-notes__list {
  margin: 0;
  padding-left: 24px;
  display: grid;
  gap: 10px;
  color: #5c6372;
  font-size: 14px;
  line-height: 1.9;
}

@media (max-width: 900px) {
  .recharge-card {
    :deep(.t-card__body) {
      padding: 22px 18px 32px;
    }
  }

  .recharge-method__options {
    flex-direction: column;
  }

  .method-option {
    width: 100%;
  }

  .recharge-steps {
    display: grid;
    gap: 14px;
  }

  .recharge-step__line {
    display: none;
  }

  .recharge-account__row {
    padding-right: 16px;
    padding-left: 16px;
    flex-direction: column;
    gap: 4px;
  }
}
</style>
