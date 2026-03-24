<template>
  <t-config-provider :global-config="getComponentsLocale">
    <router-view :key="locale" :class="[mode]" />
  </t-config-provider>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { useLocale } from '@/locales/useLocale';
import { useSettingStore, useUserStore } from '@/store';
import { useDictStore } from '@/store/modules/enterprise/dict';
import { onLoginSuccessEvent } from '@/utils/authEvent';

const store = useSettingStore();
const userStore = useUserStore();
const dictStore = useDictStore();

const mode = computed(() => {
  return store.displayMode;
});

const { getComponentsLocale, locale } = useLocale();

const initDictData = () => {
  if (!userStore.token) {
    return;
  }

  dictStore.customerType.length === 0 && dictStore.fetchCustomerType();
  dictStore.projectType.length === 0 && dictStore.fetchProjectType();
  dictStore.invoiceType.length === 0 && dictStore.fetchInvoiceType();
  dictStore.experience.length === 0 && dictStore.fetchExperience();
  dictStore.salary.length === 0 && dictStore.fetchSalary();
  dictStore.education.length === 0 && dictStore.fetchEducation();
  dictStore.job.length === 0 && dictStore.fetchJob();
  dictStore.cityTree.length === 0 && dictStore.fetchCityTree();
};

let removeLoginSuccessListener = () => {};

onMounted(() => {
  removeLoginSuccessListener = onLoginSuccessEvent(() => {
    initDictData();
  });
  initDictData();
});

onBeforeUnmount(() => {
  removeLoginSuccessListener();
});
</script>
<style lang="less" scoped>
#nprogress .bar {
  background: var(--td-brand-color) !important;
}
</style>
