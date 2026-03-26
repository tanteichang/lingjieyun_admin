<template>
  <t-list-item>
    <t-space>
      <span class="detail-item__name">{{ item.name || '-' }}</span>
      <span class="detail-item__meta">{{ item.mobile || '-' }}</span>
      <span class="detail-item__meta">{{ item.id_card || '-' }}</span>
      <div class="detail-item__side">
        <span>交付物状态：</span>
        <t-tag :theme="statusTag.theme" :variant="statusTag.variant" :color="statusTag.color">
          {{ item.delivery_status_text || statusTag.label }}
        </t-tag>
      </div>
    </t-space>
    <!-- <template #action>
      <t-link theme="primary" variant="outline" @click="emit('record-click', item)"> 记录 </t-link>
    </template> -->
  </t-list-item>
</template>
<script setup lang="ts">
import { computed } from 'vue';

import { DELIVERY_STATUS_TAG } from '@/api/model/enterprise/delivery';
import type { SettlementDeliveryItem } from '@/api/model/enterprise/settlement';

const props = defineProps<{
  item: SettlementDeliveryItem;
}>();

const emit = defineEmits<{
  'record-click': [item: SettlementDeliveryItem];
}>();

const statusTag = computed(() => DELIVERY_STATUS_TAG[props.item.delivery_status]);
</script>
<style scoped lang="less">
.detail-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.detail-item__content {
  min-width: 0;
}

.detail-item__name {
  display: inline-block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2738;
  width: 100px;
}

.detail-item__meta {
  font-size: 12px;
  color: #5f6675;
  display: inline-block;
  width: 120px;
}

.detail-item__side {
  display: flex;
  align-items: center;

  color: #5f6675;
  flex-shrink: 0;
  width: 200px;
}

.detail-item__date {
  font-size: 12px;
  color: #5f6675;
}
</style>
