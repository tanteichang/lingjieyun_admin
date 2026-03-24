<template>
  <div
    class="company-badge"
    :class="{
      [`shape-${shape}`]: true,
      'has-logo': !!logo,
    }"
    :style="badgeStyle"
  >
    <img v-if="logo" :src="logo" :alt="altText" class="company-badge__image" />
    <span
      v-else
      class="company-badge__text"
      :class="{
        'is-grid-2x2': companyAbbr.length === 4,
        'is-grid-2x1': companyAbbr.length === 3,
      }"
    >
      <template v-if="companyAbbr.length === 4">
        <span class="company-badge__line">{{ companyAbbr.slice(0, 2) }}</span>
        <span class="company-badge__line">{{ companyAbbr.slice(2, 4) }}</span>
      </template>
      <template v-else-if="companyAbbr.length === 3">
        <span class="company-badge__line">{{ companyAbbr.slice(0, 2) }}</span>
        <span class="company-badge__line company-badge__line--single">{{ companyAbbr.slice(2, 3) }}</span>
      </template>
      <template v-else>
        {{ companyAbbr }}
      </template>
    </span>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { getCompanyAbbr } from '@/utils/company';

defineOptions({
  name: 'CompanyBadge',
});

const props = withDefaults(
  defineProps<{
    fullName: string;
    logo?: string | null;
    size?: number | string;
    textSize?: number | string;
    shape?: 'square' | 'circle';
  }>(),
  {
    logo: '',
    size: 48,
    textSize: '',
    shape: 'square',
  },
);

const toCssSize = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

const badgeStyle = computed(() => {
  const style: Record<string, string> = {
    '--company-badge-size': toCssSize(props.size),
  };

  if (props.textSize) {
    style['--company-badge-font-size'] = toCssSize(props.textSize);
  }

  return style;
});

const companyAbbr = computed(() => getCompanyAbbr(props.fullName));
const altText = computed(() => `${props.fullName || '企业'} logo`);
</script>
<style lang="less" scoped>
.company-badge {
  width: var(--company-badge-size);
  height: var(--company-badge-size);
  border-radius: 0;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #2f6eff;
  color: #fff;
  user-select: none;
}

.company-badge.has-logo {
  background: transparent;
}

.shape-circle {
  border-radius: 50%;
}

.company-badge__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.company-badge__text {
  padding: 0 8px;
  font-size: var(--company-badge-font-size, 16px);
  line-height: 1;
  font-weight: 700;
  letter-spacing: 1px;
  text-align: center;
  white-space: nowrap;
}

.company-badge__text.is-grid-2x2 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0;
  gap: 4px;
  line-height: 1.05;
  letter-spacing: 0;
  white-space: normal;
}

.company-badge__text.is-grid-2x1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0;
  gap: 4px;
  line-height: 1.05;
  letter-spacing: 0;
  white-space: normal;
}

.company-badge__line {
  display: block;
  white-space: nowrap;
}

.company-badge__line--single {
  padding-left: 1px;
}
</style>
