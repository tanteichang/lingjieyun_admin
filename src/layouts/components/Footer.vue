<template>
  <div :class="`${prefix}-footer`">
    Copyright © {{ footer.startYear }}-{{ currentYear }} {{ footer.companyName }}. {{ footer.rightsText }}
    <div>
      <span class="record-item">
        <a :href="footer.filing.icp.href" rel="noreferrer" target="_blank">{{ footer.filing.icp.text }}</a>
      </span>
      <span class="record-item">
        <img :src="beianIcon" alt="公网安备" style="width: 14px; height: 14px; margin: 0 4px" />
        <a :href="footer.filing.publicSecurity.href" rel="noreferrer" target="_blank">
          {{ footer.filing.publicSecurity.text }}
        </a>
      </span>
      <template v-for="item in footer.filing.customItems" :key="`${item.type}-${item.text}-${item.href}`">
        <span class="record-item">
          <a :href="item.href" rel="noreferrer" target="_blank">
            {{ item.text }}
          </a>
        </span>
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import beianIcon from '@/assets/beian.png';
import { prefix } from '@/config/global';
import { siteConfig } from '@/config/site';

const currentYear = new Date().getFullYear();
const footer = siteConfig.footer;
</script>
<style lang="less" scoped>
.@{starter-prefix}-footer {
  color: var(--td-text-color-placeholder);
  line-height: 20px;
  text-align: center;
}

.record-item {
  margin-right: 8px;
}
</style>
