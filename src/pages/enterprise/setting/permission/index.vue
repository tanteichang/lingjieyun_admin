<template>
  <t-card class="permission-page" :bordered="false">
    <t-tabs v-model="activeTab" class="permission-tabs">
      <t-tab-panel value="role" label="角色管理">
        <role />
      </t-tab-panel>
      <t-tab-panel value="admin" label="管理员列表">
        <admin />
      </t-tab-panel>
      <t-tab-panel value="apply" label="管理员申请"></t-tab-panel>
    </t-tabs>
  </t-card>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import Admin from './admin.vue';
import Role from './role.vue';

defineOptions({
  name: 'SettingPermission',
});

const activeTab = ref<'role' | 'admin'>('role');
</script>
<style lang="less" scoped>
.permission-page {
  min-height: calc(100vh - 150px);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.permission-tabs {
  padding: 0 22px;
}
</style>
