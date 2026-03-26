<template>
  <div class="lng-lat-picker">
    <t-space>
      <t-input
        v-if="!selfInput"
        :value="displayValue"
        :placeholder="placeholder"
        :readonly="true"
        :disabled="disabled"
        :clearable="clearable"
        @click="openDrawer"
        @clear="handleClear"
      />

      <t-input-adornment v-if="selfInput" prepend="经度">
        <t-input v-model="longitude" :disabled="disabled" class="input"></t-input>
      </t-input-adornment>
      <t-input-adornment v-if="selfInput" prepend="纬度">
        <t-input v-model="latitude" :disabled="disabled" class="input"></t-input>
      </t-input-adornment>
      <t-button :disabled="disabled" theme="default" type="button" @click="selfInput = !selfInput">{{
        selfInput ? '选择经纬度' : '手动填写'
      }}</t-button>
    </t-space>
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

const longitude = ref('');
const latitude = ref('');
const selfInput = ref(false);

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

const handleSelect = (poi: {
  lng: string;
  lat: string;
  name?: string;
  address?: string;
  gcj02lonlat?: [string, string];
}) => {
  const nextValue: LngLatValue = {
    lng: poi.gcj02lonlat?.[0] || poi.lng,
    lat: poi.gcj02lonlat?.[1] || poi.lat,
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
watch(longitude, (value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    lng: value,
  });
});
watch(latitude, (value) => {
  emit('update:modelValue', {
    ...props.modelValue,
    lat: value,
  });
});
</script>
<style scoped>
.lng-lat-picker {
  width: 100%;
}
.input {
  width: 120px;
}
</style>
