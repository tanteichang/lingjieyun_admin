<template>
  <t-dialog
    :visible="visible"
    :footer="false"
    :header="false"
    :close-btn="false"
    :close-on-overlay-click="false"
    width="760px"
    class="confirm-issue-dialog"
    @close="handleClose"
    @update:visible="handleVisibleChange"
  >
    <div class="dialog-wrap">
      <div class="head">
        <div class="head-top">
          <t-space align="center">
            <div class="title">{{ record?.settleName || '-' }}</div>
            <t-tag theme="primary" variant="light">{{ record?.billStatus || '-' }}</t-tag>
          </t-space>
          <t-button variant="text" shape="square" class="close-btn" @click="handleClose">×</t-button>
        </div>
        <t-space direction="vertical" size="8px" class="meta-group">
          <div class="meta">创建时间：{{ record?.createTime || '-' }}</div>
          <div class="meta">所属任务：{{ record?.task || '-' }}</div>
        </t-space>
      </div>

      <div class="amount-card">
        <t-row align="middle" justify="space-between" class="amount-row">
          <t-col :span="17">
            <div class="label">实付总金额</div>
            <div class="amount">¥ {{ record?.issueAmount || '0.00' }}</div>
          </t-col>
          <t-col :span="1" class="divider-col">
            <div class="divider"></div>
          </t-col>
          <t-col :span="6">
            <div class="label">发放人数</div>
            <div class="count">{{ record?.settleCount || 0 }} 人</div>
          </t-col>
        </t-row>
      </div>

      <div class="form-area">
        <t-form :data="form" label-align="right" :label-width="90" class="pay-form">
          <t-form-item label="支付密码" class="password-form-item">
            <div>
              <pay-password-input
                v-model="form.passwordDigits"
                :disabled="!hasPayPassword"
                class="password-input-inline"
                :length="6"
              />
              <div v-if="!hasPayPassword">
                <span><t-icon name="info-circle" /> 暂无支付密码，请去设置</span>
                <t-link theme="primary" href="/setting/security"> 支付密码</t-link>
              </div>
            </div>
          </t-form-item>

          <t-form-item label="手机验证码">
            <div class="code-line">
              <t-input v-model="form.code" placeholder="验证码" />
              <t-button :disabled="!hasPayPassword" variant="outline" theme="primary" class="send-btn"
                >获取验证码</t-button
              >
            </div>
          </t-form-item>
          <div v-if="!hasSendSMS" class="mobile">验证码将会发送至绑定的超级管理员手机：138****5678</div>
          <div v-else class="mobile">验证码已发送至绑定的超级管理员手机：138****5678</div>
        </t-form>
      </div>

      <t-alert theme="warning" :close="false" class="warn">
        安全提示：请确认发放清单无误。大额支付涉及企业资产安全，支付确认后将进入银行处理流水，不可撤回。
      </t-alert>

      <t-button :disabled="!hasPayPassword" theme="primary" class="confirm-btn" block>确认授权并发放</t-button>
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import PayPasswordInput from '@/components/PayPasswordInput.vue';
import { useUserStore } from '@/store';

defineProps<{
  visible: boolean;
  record?: PaymentBillRow | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
}>();

const userStore = useUserStore();

import type { PaymentBillRow } from '../mock';

const form = reactive({
  passwordDigits: Array.from({ length: 6 }, () => ''),
  code: '',
});
const hasSendSMS = ref(false);

const hasPayPassword = computed(() => userStore.userInfo.has_pay_password);

const handleClose = () => {
  emit('update:visible', false);
};
const handleVisibleChange = (value: boolean) => {
  emit('update:visible', value);
};
</script>
<style scoped lang="less">
.dialog-wrap {
  padding: 4px 4px 0;
  overflow-x: hidden;
}

.close-btn {
  width: 30px;
  height: 30px;
  font-size: 32px;
  color: var(--td-text-color-primary);
}

.head {
  padding: 8px 0 14px;
}

.head-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.meta-group {
  margin-top: 6px;
}

.title {
  min-width: 0;
  font-size: 22px;
  font-weight: 600;
  line-height: 1.25;
  word-break: break-all;
}

.meta {
  color: var(--td-text-color-primary);
  font-size: 14px;
}

.amount-card {
  margin: 8px 0 0;
  padding: 22px 24px;
  background: #f6f8fb;
  border-radius: 8px;
}

.label {
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

.amount {
  margin-top: 12px;
  font-size: 34px;
  line-height: 1.1;
  color: #2c5dd8;
  font-weight: 700;
}

.divider {
  width: 1px;
  height: 62px;
  background: var(--td-component-stroke);
  margin: 0 auto;
}

.count {
  margin-top: 14px;
  font-size: 22px;
  line-height: 1;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.form-area {
  padding: 24px 0 10px;
}

.pay-form :deep(.t-form__item) {
  margin-bottom: 8px;
}
.pay-form :deep(.t-form__controls) {
  margin-left: 0 !important;
}

.pay-form :deep(.password-input-inline .digit-wrap) {
  margin-top: 0;
  justify-content: flex-start;
}

.pay-form :deep(.password-form-item) {
  display: flex;
  justify-content: flex-start;
  align-items: center;
}

.pay-form :deep(.password-form-item .t-form__label) {
  padding-top: 0;
}

.pay-form :deep(.password-form-item .t-form__content) {
  display: flex;
  align-items: center;
}

.code-line {
  display: flex;
  gap: 12px;
}

.send-btn {
  width: 136px;
}

.tips,
.mobile {
  margin-left: 90px;
  font-size: 13px;
  color: var(--td-text-color-secondary);
}

.warn {
  margin-top: 18px;

  :deep(.t-alert__message) {
    font-size: 13px;
    line-height: 1.6;
  }
}

.confirm-btn {
  margin-top: 20px;
  height: 54px;
  font-size: 14px;
  border-radius: 8px;
}
</style>
