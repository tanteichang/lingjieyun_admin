<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view :key="locale" :class="[mode]" />
  </t-config-provider>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useLocale } from '@/locales/useLocale';
import { useSettingStore } from '@/store';
import { useDictStore } from '@/store/modules/dict';

const store = useSettingStore();
const dictStore = useDictStore();

const mode = computed(() => {
  return store.displayMode;
});

const { getComponentsLocale, locale } = useLocale();

onMounted(() => {
  // 初始化字典数据
  dictStore.fetchProjectType();
  dictStore.fetchInvoiceType();
  dictStore.fetchExperience();
  dictStore.fetchSalary();
  dictStore.fetchEducation();
  dictStore.fetchJob();
});
</script>
<style lang="less" scoped>
#nprogress .bar {
  background: var(--td-brand-color) !important;
}
</style>
