<template>
  <div class="bind-email-page">
    <button class="back-link" type="button" @click="handleBack">
      <t-icon name="chevron-left" size="18" />
      <span>返回安全设置</span>
    </button>

    <div class="bind-email-shell">
      <div class="bind-email-card">
        <div class="bind-email-card__title">绑定邮箱</div>

        <div class="bind-steps">
          <div v-for="item in steps" :key="item.value" class="bind-steps__item">
            <div
              class="bind-steps__circle"
              :class="{
                'is-active': currentStep === item.value,
                'is-done': currentStep > item.value,
              }"
            >
              <t-icon v-if="currentStep > item.value" name="check" size="14" />
              <span v-else>{{ item.value }}</span>
            </div>
            <div class="bind-steps__label" :class="{ 'is-active': currentStep === item.value }">
              {{ item.label }}
            </div>
            <div
              v-if="item.value !== steps.length"
              class="bind-steps__line"
              :class="{ 'is-done': currentStep > item.value }"
            ></div>
          </div>
        </div>

        <div v-if="currentStep === 1" class="step-panel">
          <div class="step-tip">
            <t-icon name="info-circle-filled" size="16" />
            <span>为确保账户安全，请先通过手机 {{ maskedPhone }} 获取动态验证码进行身份验证。</span>
          </div>

          <div class="field-block">
            <label class="field-label">短信验证码</label>
            <div class="verify-row">
              <t-input v-model="smsCode" class="verify-row__input" placeholder="请输入6位验证码" :maxlength="6" />
              <t-button
                variant="outline"
                theme="primary"
                class="verify-row__btn"
                :disabled="smsCountdown > 0"
                @click="handleSendSmsCode"
              >
                {{ smsCountdown > 0 ? `${smsCountdown}s` : '获取验证码' }}
              </t-button>
            </div>
          </div>

          <t-button theme="primary" block class="submit-btn" :disabled="!isSmsCodeValid" @click="handleVerifyIdentity">
            下一步
          </t-button>
        </div>

        <div v-else-if="currentStep === 2" class="step-panel">
          <div class="step-tip">
            <t-icon name="info-circle-filled" size="16" />
            <span>请输入常用邮箱，验证码将发送至该邮箱，用于完成绑定验证。</span>
          </div>

          <div class="field-block">
            <label class="field-label">邮箱地址</label>
            <t-input v-model="emailForm.email" placeholder="请输入邮箱地址" clearable />
          </div>

          <div class="field-block">
            <label class="field-label">邮箱验证码</label>
            <div class="verify-row">
              <t-input
                v-model="emailForm.code"
                class="verify-row__input"
                placeholder="请输入邮箱验证码"
                :maxlength="6"
              />
              <t-button
                variant="outline"
                theme="primary"
                class="verify-row__btn"
                :disabled="emailCountdown > 0"
                @click="handleSendEmailCode"
              >
                {{ emailCountdown > 0 ? `${emailCountdown}s` : '获取验证码' }}
              </t-button>
            </div>
          </div>

          <t-button theme="primary" block class="submit-btn" :disabled="!canSubmitEmailBind" @click="handleBindEmail">
            完成绑定
          </t-button>
        </div>

        <div v-else class="step-panel step-panel--success">
          <div class="success-icon">
            <t-icon name="check-circle-filled" size="68" />
          </div>
          <div class="success-title">邮箱绑定成功</div>
          <div class="success-desc">
            您的安全邮箱已更新为 {{ userStore.userInfo.email }}，后续安全提醒将发送到该邮箱。
          </div>

          <t-button theme="primary" block class="submit-btn" @click="handleBack">返回安全设置</t-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import { sendEmailCode, sendSmsCode, verifyEmailCode, verifyEmailSmsCode } from '@/api/enterprise/auth';
import { useCounter } from '@/hooks';
import { useUserStore } from '@/store';

defineOptions({
  name: 'SettingSecurityBindEmail',
});

type StepValue = 1 | 2 | 3;

const router = useRouter();
const userStore = useUserStore();

const steps = [
  { value: 1 as const, label: '验证身份' },
  { value: 2 as const, label: '输入邮箱' },
  { value: 3 as const, label: '完成绑定' },
];

const [smsCountdown, startSmsCountdown] = useCounter(60);
const [emailCountdown, startEmailCountdown] = useCounter(60);
const currentStep = ref<StepValue>(1);
const smsCode = ref('');
const emailForm = reactive({
  email: userStore.userInfo.email || '',
  code: '',
});

const maskedPhone = computed(() => userStore.userInfo.phone);
const isSmsCodeValid = computed(() => /^\d{6}$/.test(smsCode.value.trim()));
const isEmailValid = computed(() => {
  const value = emailForm.email.trim();
  if (!value || /\s/.test(value)) return false;

  const parts = value.split('@');
  if (parts.length !== 2) return false;

  const [local, domain] = parts;
  return !!local && !!domain && domain.includes('.') && !domain.startsWith('.') && !domain.endsWith('.');
});
const isEmailCodeValid = computed(() => /^\d{4,6}$/.test(emailForm.code.trim()));
const canSubmitEmailBind = computed(() => isEmailValid.value && isEmailCodeValid.value);

const handleBack = () => {
  router.push({ name: 'SettingSecurity' });
};

const handleSendSmsCode = async () => {
  if (smsCountdown.value > 0) return;

  const res = await sendSmsCode({
    type: 'email_verify',
  });

  if (res.code === 200) {
    MessagePlugin.success(`验证码已发送至${maskedPhone.value}`);
    startSmsCountdown();
  }
};

const handleVerifyIdentity = () => {
  verifyEmailSmsCode({
    code: smsCode.value.trim(),
  }).then((res) => {
    if (res.code === 200 && res.data?.valid) {
      MessagePlugin.success('身份验证通过');
      currentStep.value = 2;
    }
  });
};

const handleSendEmailCode = async () => {
  if (emailCountdown.value > 0) return;
  if (!isEmailValid.value) {
    MessagePlugin.warning('请输入正确的邮箱地址');
    return;
  }

  const res = await sendEmailCode({
    email: emailForm.email.trim(),
  });

  if (res.code === 200) {
    MessagePlugin.success(`验证码已发送至${emailForm.email.trim()}`);
    startEmailCountdown();
  }
};

const handleBindEmail = async () => {
  if (!canSubmitEmailBind.value) return;

  const res = await verifyEmailCode({
    email: emailForm.email.trim(),
    code: emailForm.code.trim(),
  });

  if (res.code === 200) {
    userStore.updateUserInfo({
      email: emailForm.email.trim(),
    });
    MessagePlugin.success('邮箱绑定成功');
    currentStep.value = 3;
  }
};
</script>
<style lang="less" scoped>
.bind-email-page {
  min-height: calc(100vh - 148px);
  padding-top: 20px;
}

.back-link {
  border: 0;
  background: transparent;
  color: #6f7f95;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.bind-email-shell {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

.bind-email-card {
  width: 520px;
  min-height: 408px;
  padding: 28px 30px 30px;
  border-radius: 24px;
  background: linear-gradient(180deg, #fff 0%, #fcfdff 100%);
  border: 1px solid #eef3fb;
  box-shadow: 0 18px 36px rgb(36 65 109 / 8%);
}

.bind-email-card__title {
  color: #17233a;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
}

.bind-steps {
  position: relative;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin-top: 28px;
}

.bind-steps__item {
  position: relative;
  text-align: center;
}

.bind-steps__circle {
  position: relative;
  z-index: 1;
  width: 28px;
  height: 28px;
  margin: 0 auto;
  border-radius: 50%;
  background: #eff3fa;
  color: #9aa8bb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.bind-steps__circle.is-active,
.bind-steps__circle.is-done {
  background: linear-gradient(180deg, #3a7cff 0%, #2a67eb 100%);
  color: #fff;
  box-shadow: 0 8px 18px rgb(47 110 255 / 20%);
}

.bind-steps__label {
  margin-top: 8px;
  color: #c0c9d6;
  font-size: 12px;
  font-weight: 600;
}

.bind-steps__label.is-active {
  color: #316df1;
}

.bind-steps__line {
  position: absolute;
  top: 14px;
  left: calc(50% + 24px);
  width: calc(100% - 48px);
  height: 1px;
  background: #e8edf5;
}

.bind-steps__line.is-done {
  background: #b9d0ff;
}

.step-panel {
  margin-top: 38px;
}

.step-tip {
  min-height: 42px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f3f7ff;
  color: #4a74c9;
  font-size: 12px;
  line-height: 1.5;
  display: flex;
  gap: 8px;
  align-items: flex-start;
}

.field-block {
  margin-top: 18px;
}

.field-label {
  display: block;
  margin-bottom: 10px;
  color: #8d9aae;
  font-size: 13px;
  font-weight: 600;
}

.verify-row {
  display: grid;
  grid-template-columns: 1fr 94px;
  gap: 10px;
}

.verify-row__input {
  :deep(.t-input) {
    height: 40px;
    border-radius: 10px;
  }
}

.verify-row__btn {
  height: 40px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.submit-btn {
  margin-top: 14px;
  height: 44px;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  box-shadow: 0 14px 28px rgb(47 110 255 / 18%);
}

.step-panel--success {
  padding-top: 18px;
  text-align: center;
}

.success-icon {
  color: #2f6eff;
}

.success-title {
  margin-top: 18px;
  color: #1f2a44;
  font-size: 20px;
  font-weight: 700;
}

.success-desc {
  margin-top: 12px;
  color: #8f9aaa;
  font-size: 13px;
  line-height: 1.8;
}

@media (width <= 1200px) {
  .bind-email-page {
    padding-top: 42px;
  }

  .back-link {
    margin-left: 0;
  }

  .bind-email-card {
    width: 100%;
    padding: 22px 18px 24px;
  }

  .bind-steps__line {
    left: calc(50% + 18px);
    width: calc(100% - 36px);
  }
}
</style>
