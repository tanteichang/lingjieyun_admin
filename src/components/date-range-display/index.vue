<template>
  <div class="date-range-display">
    <div class="date-range-display__item">
      <t-tag variant="light" :theme="startTheme">{{ startLabel }}</t-tag>
      <span>{{ startTime || '-' }}</span>
    </div>
    <div class="date-range-display__item">
      <t-tag variant="light" :theme="endTheme">{{ endLabel }}</t-tag>
      <span>{{ endTime || '-' }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TagProps } from 'tdesign-vue-next';

defineOptions({
  name: 'DateRangeDisplay',
});

withDefaults(
  defineProps<{
    startTime?: string;
    endTime?: string;
    startLabel?: string;
    endLabel?: string;
    startTheme?: TagProps['theme'];
    endTheme?: TagProps['theme'];
  }>(),
  {
    startTime: '',
    endTime: '',
    startLabel: '始',
    endLabel: '止',
    startTheme: 'primary',
    endTheme: 'warning',
  },
);
</script>
<style lang="less" scoped>
.date-range-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.date-range-display__item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
</style>
