<template>
  <delivery-upload-panel :show-basic-info="showBasicInfo" :mode="mode" />
</template>
<script setup lang="ts">
import DeliveryUploadPanel from './components/DeliveryUploadPanel.vue';

defineOptions({
  name: 'DeliveryUploadDetailPanel',
});

withDefaults(
  defineProps<{
    showBasicInfo?: boolean;
    mode?: 'upload' | 'download' | 'switch';
  }>(),
  {
    showBasicInfo: false,
    mode: 'upload',
  },
);
</script>
