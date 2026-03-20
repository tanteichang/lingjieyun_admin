<template>
  <div class="switch-container">
    <span v-if="currentMode !== 'password'" class="tip" @click="$emit('switch-mode', 'password')">使用账号登录</span>
    <span v-if="currentMode !== 'qrcode'" class="tip" @click="$emit('switch-mode', 'qrcode')">使用微信扫一扫登录</span>
    <span v-if="currentMode !== 'phone'" class="tip" @click="$emit('switch-mode', 'phone')">使用手机号登录</span>
  </div>
</template>
<script setup lang="ts">
import type { LoginMode } from './types';

defineOptions({
  name: 'LoginModeSwitch',
});

defineProps<{
  currentMode: LoginMode;
}>();

defineEmits<{
  'switch-mode': [mode: LoginMode];
}>();
</script>
<style lang="less" scoped>
@import '../index.less';
</style>
