<template>
  <div class="lng-lat-picker">
    <t-input
      :value="displayValue"
      :placeholder="placeholder"
      :readonly="true"
      :disabled="disabled"
      :clearable="clearable"
      @click="openDrawer"
      @clear="handleClear"
    />

    <t-drawer v-model:visible="drawerVisible" size="70%" :header="drawerTitle" :footer="false" :close-btn="true">
      <l-map v-model:keyword="keyword" :auto-search="mapAutoSearch" @select="handleSelect" />
    </t-drawer>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import LMap from '@/components/mapSearch/index.vue';

export interface LngLatValue {
  lng: string;
  lat: string;
  name?: string;
  address?: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: LngLatValue | null;
    placeholder?: string;
    drawerTitle?: string;
    drawerSize?: string | number;
    closeOnSelect?: boolean;
    mapKeyword?: string;
    mapAutoSearch?: boolean;
    disabled?: boolean;
    clearable?: boolean;
  }>(),
  {
    modelValue: null,
    placeholder: '请选择经纬度',
    drawerTitle: '选择经纬度',
    drawerSize: '80%',
    closeOnSelect: true,
    mapKeyword: '',
    mapAutoSearch: false,
    disabled: false,
    clearable: true,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: LngLatValue | null): void;
  (e: 'change', value: LngLatValue | null): void;
}>();

const drawerVisible = ref(false);
const keyword = ref(props.mapKeyword);

const displayValue = computed(() => {
  const value = props.modelValue;
  if (!value || !value.lng || !value.lat) return '';
  return `${value.lng}, ${value.lat}`;
});

const openDrawer = () => {
  if (props.disabled) return;
  drawerVisible.value = true;
};

const handleClear = () => {
  emit('update:modelValue', null);
  emit('change', null);
};

const handleSelect = (poi: { lng: string; lat: string; name?: string; address?: string }) => {
  const nextValue: LngLatValue = {
    lng: poi.lng,
    lat: poi.lat,
    name: poi.name,
    address: poi.address,
  };
  emit('update:modelValue', nextValue);
  emit('change', nextValue);
  if (props.closeOnSelect) {
    drawerVisible.value = false;
  }
};

watch(
  () => props.mapKeyword,
  (value) => {
    if (typeof value === 'string' && value !== keyword.value) {
      keyword.value = value;
    }
  },
);
</script>
<style scoped>
.lng-lat-picker {
  width: 100%;
}
</style>
