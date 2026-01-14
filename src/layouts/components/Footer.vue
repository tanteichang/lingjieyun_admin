<template>
  <div :class="`${prefix}-footer`">
    Copyright © 2024-{{ new Date().getFullYear() }} 广州灵捷云数字科技有限公司. All Rights Reserved
    <div>
      <span>ICP备案/许可证号：</span>
      <a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备2026001112号-1</a>
    </div>
  </div>
</template>
<script setup lang="ts">
import { prefix } from '@/config/global';
</script>
<style lang="less" scoped>
.@{starter-prefix}-footer {
  color: var(--td-text-color-placeholder);
  line-height: 20px;
  text-align: center;
}
</style>
