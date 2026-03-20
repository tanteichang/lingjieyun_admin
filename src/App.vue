<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view :key="locale" :class="[mode]" />
  </t-config-provider>
</template>
<script setup lang="ts">
import { computed, onMounted } from 'vue';

import { useLocale } from '@/locales/useLocale';
import { useSettingStore } from '@/store';
import { useDictStore } from '@/store/modules/enterprise/dict';

const store = useSettingStore();
const dictStore = useDictStore();

const mode = computed(() => {
  return store.displayMode;
});

const { getComponentsLocale, locale } = useLocale();

onMounted(() => {
  // 初始化字典数据
  dictStore.customerType.length === 0 && dictStore.fetchCustomerType();
  dictStore.projectType.length === 0 && dictStore.fetchProjectType();
  dictStore.invoiceType.length === 0 && dictStore.fetchInvoiceType();
  dictStore.experience.length === 0 && dictStore.fetchExperience();
  dictStore.salary.length === 0 && dictStore.fetchSalary();
  dictStore.education.length === 0 && dictStore.fetchEducation();
  dictStore.job.length === 0 && dictStore.fetchJob();
  dictStore.cityTree.length === 0 && dictStore.fetchCityTree();
});
</script>
<style lang="less" scoped>
#nprogress .bar {
  background: var(--td-brand-color) !important;
}
</style>
