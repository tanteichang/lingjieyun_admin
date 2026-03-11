<template>
  <t-dialog
    :visible="visible"
    :footer="false"
    :header="false"
    :close-btn="false"
    :close-on-overlay-click="false"
    :destroy-on-close="true"
    width="760px"
    class="confirm-issue-dialog"
    @close="handleClose"
    @update:visible="handleVisibleChange"
  >
    <div class="dialog-wrap">
      <div class="head">
        <div class="head-top">
          <t-space align="center">
            <div class="title">{{ record?.settlement_name || '-' }}</div>
            <t-tag theme="primary" variant="light">{{ record?.payment_status_text || '-' }}</t-tag>
          </t-space>
          <t-button variant="text" shape="square" class="close-btn" @click="handleClose">×</t-button>
        </div>
        <t-space direction="vertical" size="8px" class="meta-group">
          <div class="meta">创建时间：{{ record?.created_at || '-' }}</div>
          <div class="meta">所属任务：{{ record?.task_name || '-' }}</div>
        </t-space>
      </div>

      <div class="amount-card">
        <t-row align="middle" justify="space-between" class="amount-row">
          <t-col :span="17">
            <div class="label">实付总金额</div>
            <div class="amount">¥ {{ record?.order_amount || '0.00' }}</div>
          </t-col>
          <t-col :span="1" class="divider-col">
            <div class="divider"></div>
          </t-col>
          <t-col :span="6">
            <div class="label">发放人数</div>
            <div class="count">{{ record?.settlement_count || 0 }} 人</div>
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
            <pay-verify-code-input v-model="form.code" @get-code="handleSendCode" />
          </t-form-item>
          <div v-if="!hasSendSMS" class="mobile">
            验证码将会发送至绑定的超级管理员手机：{{ userStore.register_admin_mobile_masked }}
          </div>
          <div v-else class="mobile">
            验证码已发送至绑定的超级管理员手机：{{ userStore.register_admin_mobile_masked }}
          </div>
        </t-form>
      </div>

      <t-alert theme="warning" :close="false" class="warn">
        安全提示：请确认发放清单无误。大额支付涉及企业资产安全，支付确认后将进入银行处理流水，不可撤回。
      </t-alert>

      <t-button :disabled="!hasPayPassword" theme="primary" class="confirm-btn" block @click="handleConfirm"
        >确认授权并发放</t-button
      >
    </div>
  </t-dialog>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref, watch } from 'vue';

import { confirmDisburse, createPayment, sendDisburseCode } from '@/api/enterprise/bill';
import type { BillListItem } from '@/api/model/enterprise/bill';
import PayPasswordInput from '@/components/PayPasswordInput.vue';
import PayVerifyCodeInput from '@/pages/enterprise/setting/security/components/PayVerifyCodeInput.vue';
import { useUserStore } from '@/store';

const props = defineProps<{
  visible: boolean;
  record?: BillListItem | null;
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close-success'): void;
  (e: 'close-fail'): void;
}>();

const userStore = useUserStore();
const createEmptyPasswordDigits = () => Array.from({ length: 6 }, () => '');

const form = reactive({
  passwordDigits: createEmptyPasswordDigits(),
  code: '',
});
const hasSendSMS = ref(false);

const hasPayPassword = computed(() => userStore.userInfo.has_pay_password);

const resetForm = () => {
  hasSendSMS.value = false;
  form.passwordDigits = createEmptyPasswordDigits();
  form.code = '';
};

const handleClose = () => {
  resetForm();
  emit('update:visible', false);
};
const handleVisibleChange = (value: boolean) => {
  emit('update:visible', value);
};

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      resetForm();
    }
  },
);

const handleSendCode = () => {
  if (!hasPayPassword.value) {
    MessagePlugin.error('请先设置支付密码');
    return;
  }
  if (!props.record) {
    MessagePlugin.error('请先选择要发放的清单');
    return;
  }
  sendDisburseCode({ upload_id: props.record.upload_id }).then((res) => {
    if (res.code === 200) {
      hasSendSMS.value = true;
      MessagePlugin.success(res.msg);
    } else {
      MessagePlugin.error(res.msg);
    }
  });
};
const handleConfirm = () => {
  if (!props.record) {
    MessagePlugin.error('请先选择要发放的清单');
    return;
  }
  if (!form.passwordDigits.join('')) {
    MessagePlugin.error('请输入支付密码');
    return;
  }
  if (!form.code) {
    MessagePlugin.error('请输入验证码');
    return;
  }
  confirmDisburse({
    upload_id: props.record.upload_id,
    pay_password: form.passwordDigits.join(''),
    sms_code: form.code,
  }).then((res) => {
    if (res.code === 200) {
      MessagePlugin.success(res.msg);
      createPayment({
        disburse_token: res.data.disburse_token,
      }).then((res) => {
        if (res.code === 200) {
          MessagePlugin.success(res.msg);
          emit('close-success');
        } else {
          MessagePlugin.error(res.msg);
          emit('close-fail');
        }
      });

      handleClose();
    } else {
      MessagePlugin.error(res.msg);
    }
  });
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
