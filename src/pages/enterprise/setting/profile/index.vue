<template>
  <div class="profile-page">
    <profile-head-card />

    <t-card class="content-card" :bordered="false">
      <t-tabs v-model="activeTab" class="profile-tabs">
        <t-tab-panel value="base" label="基础资料">
          <profile-base-info />
        </t-tab-panel>
        <t-tab-panel value="verify" label="认证信息">
          <profile-verify-info />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import ProfileBaseInfo from './components/ProfileBaseInfo.vue';
import ProfileHeadCard from './components/ProfileHeadCard.vue';
import ProfileVerifyInfo from './components/ProfileVerifyInfo.vue';

defineOptions({
  name: 'SettingProfile',
});

const activeTab = ref<'base' | 'verify'>('base');
</script>
<style lang="less" scoped>
.profile-page {
  display: grid;
  gap: 12px;
}

.content-card {
  border-radius: 16px;

  :deep(.t-card__body) {
    padding: 22px;
  }
}

.profile-tabs {
  border-bottom: 1px solid var(--td-component-stroke);
}
</style>
