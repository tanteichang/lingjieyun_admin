<template>
  <t-space :size="12" class="province-city-area-picker">
    <t-select
      v-model="province"
      :options="provinceOptions"
      :placeholder="provincePlaceholder"
      :disabled="disabled"
      :clearable="clearable"
      :size="size"
      :style="{ width: `${itemWidth}px` }"
      @change="handleProvinceChange"
    />
    <t-select
      v-model="city"
      :options="cityOptions"
      :placeholder="cityPlaceholder"
      :disabled="disabled || !province || cityOptions.length === 0"
      :clearable="clearable"
      :size="size"
      :style="{ width: `${itemWidth}px` }"
      @change="handleCityChange"
    />
    <t-select
      v-model="area"
      :options="areaOptions"
      :placeholder="areaPlaceholder"
      :disabled="disabled || !city || areaOptions.length === 0"
      :clearable="clearable"
      :size="size"
      :style="{ width: `${itemWidth}px` }"
      @change="handleAreaChange"
    />
  </t-space>
</template>
<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import { data } from './data';

export interface ProvinceCityAreaValue {
  province: string;
  city: string;
  district: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: ProvinceCityAreaValue;
    disabled?: boolean;
    clearable?: boolean;
    size?: 'small' | 'medium' | 'large';
    itemWidth?: number;
    provincePlaceholder?: string;
    cityPlaceholder?: string;
    areaPlaceholder?: string;
  }>(),
  {
    modelValue: () => ({ province: '', city: '', district: '' }),
    disabled: false,
    clearable: true,
    size: 'medium',
    itemWidth: 160,
    provincePlaceholder: '请选择省',
    cityPlaceholder: '请选择城市',
    areaPlaceholder: '请选择区/县',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: ProvinceCityAreaValue): void;
  (e: 'change', value: ProvinceCityAreaValue): void;
}>();

const province = ref('');
const city = ref('');
const area = ref('');

const provinceOptions = computed(() => data.map((item) => ({ label: item.name, value: item.name })));

const cityOptions = computed(() => {
  const current = data.find((item) => item.name === province.value);
  if (!current) return [];
  return current.cities.map((item) => ({ label: item.name, value: item.name }));
});

const areaOptions = computed(() => {
  const currentProvince = data.find((item) => item.name === province.value);
  const currentCity = currentProvince?.cities.find((item) => item.name === city.value);
  if (!currentCity) return [];
  return currentCity.districts.map((item) => ({ label: item.name, value: item.name }));
});

const emitValue = () => {
  const value = { province: province.value, city: city.value, district: area.value };
  emit('update:modelValue', value);
  emit('change', value);
};

const handleProvinceChange = () => {
  city.value = '';
  area.value = '';
  emitValue();
};

const handleCityChange = () => {
  area.value = '';
  emitValue();
};

const handleAreaChange = () => {
  emitValue();
};

watch(
  () => props.modelValue,
  (value) => {
    province.value = value?.province || '';
    city.value = value?.city || '';
    area.value = value?.district || '';
  },
  { immediate: true, deep: true },
);
</script>
<style lang="less" scoped>
.province-city-area-picker {
  width: 100%;
}
</style>
