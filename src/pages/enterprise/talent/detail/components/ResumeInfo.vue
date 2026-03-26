<template>
  <div class="panel">
    <shared-resume-detail :user-resume="resume" :has-resume="hasResume" />
  </div>
</template>
<script setup lang="ts">
import type { TalentPoolJianli } from '@/api/model/enterprise/talentpool';
import SharedResumeDetail from '@/components/resume-detail/index.vue';

defineProps<{
  resume: TalentPoolJianli | null;
  hasResume?: boolean;
}>();
</script>
<style lang="less" scoped>
.panel {
  padding: 34px 34px 28px;
}
</style>
