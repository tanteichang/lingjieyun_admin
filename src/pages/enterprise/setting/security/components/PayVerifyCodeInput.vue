<template>
  <div class="verify-row">
    <t-input-number
      :model-value="innerValue"
      theme="normal"
      :placeholder="`输入 ${userStore.register_admin_mobile_masked?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')} 接收的验证码`"
      @input="handleInput"
    />
    <t-button variant="base" theme="default" :disabled="countdown > 0" @click="handleGetCode">
      {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
    </t-button>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

import { useUserStore } from '@/store/modules/user';

defineOptions({
  name: 'PayVerifyCodeInput',
});
const props = defineProps<{
  modelValue: string;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'get-code'): void;
}>();
const userStore = useUserStore();
const countdown = ref(0);
const innerValue = ref(props.modelValue || '');
let countdownTimer: ReturnType<typeof setInterval> | null = null;

watch(
  () => props.modelValue,
  (value) => {
    const normalized = (value || '').replace(/\D/g, '').slice(0, 6);
    if (normalized !== innerValue.value) {
      innerValue.value = normalized;
    }
  },
);

const handleInput = (value: unknown) => {
  const normalized =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : String(
          (value as { target?: { value?: string }; e?: { target?: { value?: string } } })?.target?.value ??
            (value as { e?: { target?: { value?: string } } })?.e?.target?.value ??
            '',
        );
  const nextValue = normalized.replace(/\D/g, '').slice(0, 6);
  innerValue.value = nextValue;
  emit('update:modelValue', nextValue);
};

const clearCountdownTimer = () => {
  if (!countdownTimer) return;
  clearInterval(countdownTimer);
  countdownTimer = null;
};

const startCountdown = () => {
  countdown.value = 60;
  clearCountdownTimer();
  countdownTimer = setInterval(() => {
    if (countdown.value <= 1) {
      countdown.value = 0;
      clearCountdownTimer();
      return;
    }
    countdown.value -= 1;
  }, 1000);
};

const handleGetCode = () => {
  if (countdown.value > 0) return;
  emit('get-code');
  startCountdown();
};

onBeforeUnmount(() => {
  clearCountdownTimer();
});
</script>
<style lang="less" scoped>
.verify-row {
  margin-top: 22px;
  border: 1px solid #e5e9f2;
  border-radius: 8px;
  padding: 6px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;

  :deep(.t-input) {
    border: 0;
  }

  :deep(.t-input__inner) {
    font-size: 13px;
  }

  :deep(.t-button) {
    height: 34px;
    font-size: 12px;
  }
}
</style>
