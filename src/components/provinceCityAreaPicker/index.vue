<template>
  <t-space size="small" class="province-city-area-picker">
    <t-select
      v-model="province"
      :options="provinceOptions"
      :placeholder="provincePlaceholder"
      :disabled="disabled"
      :clearable="clearable"
      filterable
      :size="size"
      :style="{ width: `${itemWidth}px` }"
      @change="handleProvinceChange"
    />
    <t-select
      v-model="city"
      filterable
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
      filterable
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
import { computed, onMounted, ref, watch } from 'vue';

import type { CityTree } from '@/api/model/enterprise/dict';
import { useDictStore } from '@/store/modules/enterprise/dict';

export interface ProvinceCityAreaValue {
  province?: string;
  provinceId?: number | null;
  city?: string;
  cityId?: number | null;
  district?: string;
  districtId?: number | null;
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
    modelValue: () => ({
      province: '',
      provinceId: null,
      city: '',
      cityId: null,
      district: '',
      districtId: null,
    }),
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

const dictStore = useDictStore();
const province = ref('');
const city = ref('');
const area = ref('');

const provinceList = computed(() => dictStore.cityTree);
const currentProvince = computed(() => provinceList.value.find((item) => item.name === province.value));
const isDirectProvince = computed(() => currentProvince.value?.is_direct === 1);
const currentCity = computed(() => {
  if (!currentProvince.value || !city.value) return null;
  if (isDirectProvince.value) return currentProvince.value;
  return currentProvince.value.children.find((item) => item.name === city.value) ?? null;
});
const currentArea = computed(() => {
  if (!area.value || !currentProvince.value) return null;

  if (isDirectProvince.value) {
    return currentProvince.value.children.find((item) => item.name === area.value) ?? null;
  }

  return currentCity.value?.children.find((item) => item.name === area.value) ?? null;
});

const provinceOptions = computed(() => provinceList.value.map((item) => ({ label: item.name, value: item.name })));

const cityOptions = computed(() => {
  if (!currentProvince.value) return [];

  if (isDirectProvince.value) {
    return [{ label: currentProvince.value.name, value: currentProvince.value.name }];
  }

  return currentProvince.value.children.map((item) => ({ label: item.name, value: item.name }));
});

const areaOptions = computed(() => {
  if (!currentProvince.value) return [];

  if (isDirectProvince.value) {
    if (city.value !== currentProvince.value.name) return [];
    return currentProvince.value.children.map((item) => ({ label: item.name, value: item.name }));
  }

  const currentCity = currentProvince.value.children.find((item) => item.name === city.value);
  if (!currentCity) return [];
  return currentCity.children.map((item) => ({ label: item.name, value: item.name }));
});

const isNodeIdMatched = (node: CityTree, id?: number | null) => id != null && node.id === Number(id);

const findProvince = (value?: ProvinceCityAreaValue) => {
  if (!value) return null;

  if (value.provinceId != null) {
    return provinceList.value.find((item) => isNodeIdMatched(item, value.provinceId)) ?? null;
  }

  if (value.province) {
    return provinceList.value.find((item) => item.name === value.province) ?? null;
  }

  return null;
};

const findCity = (provinceNode: CityTree | null, value?: ProvinceCityAreaValue) => {
  if (!provinceNode || !value) return null;

  if (provinceNode.is_direct === 1) {
    return provinceNode;
  }

  if (value.cityId != null) {
    return provinceNode.children.find((item) => isNodeIdMatched(item, value.cityId)) ?? null;
  }

  if (value.city) {
    return provinceNode.children.find((item) => item.name === value.city) ?? null;
  }

  return null;
};

const findDistrict = (provinceNode: CityTree | null, cityNode: CityTree | null, value?: ProvinceCityAreaValue) => {
  if (!provinceNode || !value) return null;

  const districtList = provinceNode.is_direct === 1 ? provinceNode.children : (cityNode?.children ?? []);

  if (value.districtId != null) {
    return districtList.find((item) => isNodeIdMatched(item, value.districtId)) ?? null;
  }

  if (value.district) {
    return districtList.find((item) => item.name === value.district) ?? null;
  }

  return null;
};

const syncFromModelValue = (value?: ProvinceCityAreaValue) => {
  const provinceNode = findProvince(value);
  const cityNode = findCity(provinceNode, value);
  const districtNode = findDistrict(provinceNode, cityNode, value);

  province.value = provinceNode?.name ?? '';
  city.value = cityNode?.name ?? '';
  area.value = districtNode?.name ?? '';
};

const emitValue = () => {
  const value = {
    province: province.value,
    provinceId: currentProvince.value?.id ?? null,
    city: city.value,
    cityId: currentCity.value?.id ?? null,
    district: area.value,
    districtId: currentArea.value?.id ?? null,
  };
  emit('update:modelValue', value);
  emit('change', value);
};

const handleProvinceChange = () => {
  city.value = isDirectProvince.value && currentProvince.value ? currentProvince.value.name : '';
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

watch([() => props.modelValue, provinceList], ([value]) => syncFromModelValue(value), {
  immediate: true,
  deep: true,
});

watch(currentProvince, (value) => {
  if (!value || value.is_direct !== 1 || !province.value || city.value) return;
  city.value = value.name;
});

onMounted(() => {
  if (dictStore.cityTree.length === 0) {
    dictStore.fetchCityTree();
  }
});
</script>
<style lang="less" scoped>
.province-city-area-picker {
  width: 100%;
}
</style>
