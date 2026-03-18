<template>
  <t-input v-model="modelValue" :size="size" :placeholder="placeholder">
    <template #prefix-icon>
      <t-icon name="chat-message" />
    </template>
  </t-input>
  <t-button :size="size" :variant="buttonVariant" :disabled="buttonDisabled" @click="handleSend">
    {{ buttonLabel }}
  </t-button>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';

defineOptions({
  name: 'SmsCodeInput',
});

const props = withDefaults(
  defineProps<{
    placeholder?: string;
    size?: 'small' | 'medium' | 'large';
    sendText?: string;
    buttonVariant?: 'base' | 'outline' | 'dashed' | 'text';
    disabled?: boolean;
    duration?: number;
    sendHandler?: () => boolean | void | Promise<boolean | void>;
  }>(),
  {
    placeholder: '请输入短信验证码',
    size: 'large',
    sendText: '发送验证码',
    buttonVariant: 'outline',
    disabled: false,
    duration: 60,
  },
);

const emit = defineEmits<{
  send: [];
}>();

const modelValue = defineModel<string>({
  default: '',
});

const countDown = ref(0);
const sending = ref(false);
let countDownTimer: ReturnType<typeof setInterval> | null = null;

const buttonDisabled = computed(() => !!props.disabled || countDown.value > 0 || sending.value);
const buttonLabel = computed(() => {
  if (countDown.value > 0) return `${countDown.value}秒后可重发`;
  return props.sendText || '发送验证码';
});

const clearCountDownTimer = () => {
  if (!countDownTimer) return;
  clearInterval(countDownTimer);
  countDownTimer = null;
};

const startCountDown = () => {
  countDown.value = Math.max(0, props.duration || 60);
  clearCountDownTimer();
  countDownTimer = setInterval(() => {
    if (countDown.value <= 1) {
      countDown.value = 0;
      clearCountDownTimer();
      return;
    }
    countDown.value -= 1;
  }, 1000);
};

const handleSend = async () => {
  if (buttonDisabled.value) return;

  let shouldStartCountDown = true;

  try {
    sending.value = true;
    if (props.sendHandler) {
      shouldStartCountDown = (await props.sendHandler()) !== false;
    } else {
      emit('send');
    }
  } catch {
    shouldStartCountDown = false;
  } finally {
    sending.value = false;
  }

  if (shouldStartCountDown) {
    startCountDown();
  }
};

onBeforeUnmount(() => {
  clearCountDownTimer();
});
</script>
