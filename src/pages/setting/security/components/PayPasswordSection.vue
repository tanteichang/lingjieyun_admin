<template>
  <div class="action-item">
    <div class="action-head">
      <span class="icon-circle icon-pay">
        <t-icon name="creditcard" />
      </span>
      <div>
        <div class="action-title">支付密码</div>
        <div class="action-desc">涉及资金变动、提现等敏感操作时需要验证。</div>
      </div>
    </div>
    <t-link theme="primary" class="action-link" hover="color" @click="handleOpenPayDialog">管理支付密码</t-link>

    <t-dialog
      v-model:visible="payDialogVisible"
      :footer="false"
      :close-on-overlay-click="false"
      :close-btn="false"
      width="470px"
      class="password-dialog"
    >
      <template #body>
        <div class="password-modal pay-modal">
          <div class="modal-head">
            <div class="modal-title">支付密码管理</div>
            <button class="modal-close" type="button" @click="handleClosePayDialog">
              <t-icon name="close" size="22" />
            </button>
          </div>

          <template v-if="payDialogStep === 1">
            <div class="pay-step-wrap">
              <div class="verify-icon">
                <t-icon name="lock-on" size="28" />
              </div>
              <div class="pay-step-title">身份验证</div>
              <div class="pay-step-desc">为了您的资金安全，请先验证手机号</div>

              <pay-verify-code-input v-model="payVerifyCode" @get-code="handleGetVerifyCode" />
            </div>
            <t-button theme="primary" block class="save-btn" :disabled="!isVerifyCodeValid" @click="handleNextStep"
              >下一步</t-button
            >
          </template>

          <template v-else>
            <div class="pay-step-wrap step-2">
              <div class="pay-step-title">设置 6 位支付密码</div>
              <div class="pay-step-desc">仅支持数字，建议不要使用连续或重复数字</div>
              <pay-password-input ref="payPasswordInputRef" v-model="payPasswordDigits" :length="PASSWORD_LENGTH" />
              <div v-if="shouldShowPasswordError" class="password-error">{{ payPasswordError }}</div>
            </div>
            <t-button
              theme="primary"
              block
              class="save-btn"
              :disabled="!canSubmitPayPassword"
              @click="handleSubmitPayPassword"
              >确认修改</t-button
            >
          </template>
        </div>
      </template>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';

import PayPasswordInput from './PayPasswordInput.vue';
import PayVerifyCodeInput from './PayVerifyCodeInput.vue';

defineOptions({
  name: 'PayPasswordSection',
});

const PASSWORD_LENGTH = 6;

const payDialogVisible = ref(false);
const payDialogStep = ref<1 | 2>(1);
const payVerifyCode = ref('');
const payPasswordDigits = ref(Array.from({ length: PASSWORD_LENGTH }, () => ''));
const triedSubmit = ref(false);
const payPasswordInputRef = ref<{ focusIndex: (index: number) => void } | null>(null);

const payPasswordValue = computed(() => payPasswordDigits.value.join(''));
const isVerifyCodeValid = computed(() => /^\d{6}$/.test(payVerifyCode.value.trim()));
const isPasswordComplete = computed(() => /^\d{6}$/.test(payPasswordValue.value));

const isSequentialPassword = (password: string) => {
  const asc = '01234567890123456789';
  const desc = '98765432109876543210';
  return asc.includes(password) || desc.includes(password);
};

const isRepeatPassword = (password: string) => /^(\d)\1{5}$/.test(password);

const payPasswordError = computed(() => {
  if (!isPasswordComplete.value) return '请输入 6 位数字支付密码';
  if (isSequentialPassword(payPasswordValue.value)) return '支付密码不能为连续数字';
  if (isRepeatPassword(payPasswordValue.value)) return '支付密码不能为重复数字';
  return '';
});

const shouldShowPasswordError = computed(() => triedSubmit.value && !!payPasswordError.value);
const canSubmitPayPassword = computed(() => !payPasswordError.value);

const resetPayPasswordState = () => {
  payPasswordDigits.value = Array.from({ length: PASSWORD_LENGTH }, () => '');
  triedSubmit.value = false;
};

const handleGetVerifyCode = () => {};

const handleOpenPayDialog = () => {
  payDialogVisible.value = true;
  payDialogStep.value = 1;
  payVerifyCode.value = '';
  resetPayPasswordState();
};

const handleClosePayDialog = () => {
  payDialogVisible.value = false;
  payDialogStep.value = 1;
  payVerifyCode.value = '';
  resetPayPasswordState();
};

const handleNextStep = () => {
  if (!isVerifyCodeValid.value) return;
  payDialogStep.value = 2;
  nextTick(() => payPasswordInputRef.value?.focusIndex(0));
};

const handleSubmitPayPassword = () => {
  triedSubmit.value = true;
  if (!canSubmitPayPassword.value) return;
  handleClosePayDialog();
};
</script>
<style lang="less" scoped>
.action-item {
  background: #f8faff;
  border-radius: 10px;
  padding: 22px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.action-head {
  display: flex;
  gap: 14px;
}

.icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
}

.icon-pay {
  background: #2f6eff;
}

.action-title {
  font-size: 15px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.action-desc {
  margin-top: 10px;
  font-size: 11px;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
}

.action-link {
  font-size: 14px;
  font-weight: 600;
}

.password-dialog {
  :deep(.t-dialog) {
    border-radius: 14px;
    overflow: hidden;
  }

  :deep(.t-dialog__header),
  :deep(.t-dialog__footer) {
    display: none;
  }

  :deep(.t-dialog__body) {
    padding: 0;
  }
}

.password-modal {
  background: #fff;
}

.modal-head {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 24px;
  background: linear-gradient(180deg, #d9e7ff 0%, #f3f7ff 100%);
}

.modal-title {
  font-size: 18px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.modal-close {
  border: 0;
  background: transparent;
  color: #2f2f2f;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pay-modal {
  .save-btn {
    margin-top: 8px;
  }
}

.pay-step-wrap {
  padding: 30px 24px 0;
  text-align: center;
}

.verify-icon {
  width: 62px;
  height: 62px;
  border-radius: 50%;
  margin: 0 auto 12px;
  background: #fff3dc;
  color: #f29900;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.pay-step-title {
  font-size: 16px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.pay-step-desc {
  margin-top: 8px;
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.step-2 {
  padding-top: 34px;
}

.password-error {
  margin-top: 10px;
  min-height: 20px;
  font-size: 12px;
  color: var(--td-error-color);
}

.save-btn {
  margin: 10px 24px 24px;
  width: calc(100% - 48px);
  height: 40px;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .action-title,
  .action-link,
  .modal-title,
  .pay-step-title {
    font-size: 14px;
  }

  .action-desc,
  .pay-step-desc {
    font-size: 11px;
  }
}
</style>
