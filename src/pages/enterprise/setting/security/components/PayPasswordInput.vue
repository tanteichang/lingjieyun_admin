<template>
  <div class="digit-wrap">
    <input
      v-for="(_, index) in digits"
      :key="index"
      :ref="(el) => setDigitInputRef(el, index)"
      class="digit-input"
      placeholder=""
      maxlength="1"
      inputmode="numeric"
      :value="digits[index]"
      @input="(event) => handleDigitInput(event, index)"
      @keydown="(event) => handleDigitKeydown(event, index)"
      @paste="(event) => handleDigitPaste(event, index)"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({
  name: 'PayPasswordInput',
});

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    length?: number;
  }>(),
  {
    length: 6,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void;
}>();

const inputRefs = ref<(HTMLInputElement | null)[]>([]);
const digits = computed(() => props.modelValue);

const sanitizeDigit = (value: string) => value.replace(/\D/g, '').slice(-1);

const setDigitInputRef = (el: unknown, index: number) => {
  inputRefs.value[index] = el as HTMLInputElement | null;
};

const focusIndex = (index: number) => {
  const input = inputRefs.value[index];
  if (input) input.focus();
};

const updateDigitAt = (index: number, value: string) => {
  const next = [...digits.value];
  next[index] = value;
  emit('update:modelValue', next);
};

const handleDigitInput = (event: Event, index: number) => {
  const target = event.target as HTMLInputElement | null;
  const digit = sanitizeDigit(target?.value ?? '');
  updateDigitAt(index, digit);
  if (target && target.value !== digit) target.value = digit;
  if (digit && index < props.length - 1) focusIndex(index + 1);
};

const handleDigitKeydown = (event: KeyboardEvent, index: number) => {
  const key = event.key;
  const controlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'];
  if (controlKeys.includes(key)) {
    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    }
    if (key === 'ArrowRight' && index < props.length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    }
    if (key === 'Delete') updateDigitAt(index, '');
  }

  if (key.length === 1 && /\D/.test(key)) {
    event.preventDefault();
    return;
  }

  if (key !== 'Backspace' || digits.value[index] || index === 0) return;
  updateDigitAt(index - 1, '');
  focusIndex(index - 1);
};

const handleDigitPaste = (event: ClipboardEvent, index: number) => {
  event.preventDefault();
  const content = event.clipboardData?.getData('text') ?? '';
  const pasted = content
    .replace(/\D/g, '')
    .slice(0, props.length - index)
    .split('');
  if (!pasted.length) return;

  const next = [...digits.value];
  pasted.forEach((digit, offset) => {
    next[index + offset] = digit;
  });
  emit('update:modelValue', next);
  const targetIndex = Math.min(index + pasted.length, props.length - 1);
  focusIndex(targetIndex);
};

defineExpose({
  focusIndex,
});
</script>
<style lang="less" scoped>
.digit-wrap {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(6, 52px);
  gap: 10px;
  justify-content: center;
}

.digit-input {
  width: 52px;
  min-width: 52px;
  max-width: 52px;
  height: 48px;
  box-sizing: border-box;
  border: 1px solid var(--td-component-border);
  border-radius: var(--td-radius-default);
  text-align: center;
  font-size: 16px;
  line-height: 48px;
  color: var(--td-text-color-primary);
  outline: 0;
}

.digit-input:focus {
  border-color: var(--td-brand-color);
  box-shadow: 0 0 0 2px rgb(0 82 217 / 14%);
}

.digit-input::placeholder {
  color: transparent;
}
</style>
