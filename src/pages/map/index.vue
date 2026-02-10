<template>
  <l-map v-model:keyword="keyword" @select="handleSelect" />
</template>
<script setup lang="ts">
import { ref } from 'vue';

import LMap from '@/components/mapSearch/index.vue';

const keyword = ref('故宫');

const handleSelect = (poi) => {
  console.log('选中POI:', poi);
};
</script>
