<template>
  <div class="verify-row">
    <t-input
      :model-value="modelValue"
      placeholder="输入 138****8888 收验证码"
      inputmode="numeric"
      @input="handleInput"
    />
    <t-button variant="base" theme="default" :disabled="countdown > 0" @click="handleGetCode">
      {{ countdown > 0 ? `${countdown}s后重试` : '获取验证码' }}
    </t-button>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue';

defineOptions({
  name: 'PayVerifyCodeInput',
});

defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'get-code'): void;
}>();

const countdown = ref(0);
let countdownTimer: ReturnType<typeof setInterval> | null = null;

const handleInput = (value: unknown) => {
  const normalized =
    typeof value === 'string' || typeof value === 'number'
      ? String(value)
      : String(
          (value as { target?: { value?: string }; e?: { target?: { value?: string } } })?.target?.value ??
            (value as { e?: { target?: { value?: string } } })?.e?.target?.value ??
            '',
        );
  emit('update:modelValue', normalized.replace(/\D/g, '').slice(0, 6));
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
