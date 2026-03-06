<template>
  <t-dialog
    :visible="visible"
    header="客户详情"
    :confirm-btn="null"
    cancel-btn="关闭"
    width="720"
    :close-on-overlay-click="false"
    @update:visible="handleVisibleChange"
  >
    <t-loading :loading="loading">
      <t-descriptions v-if="detail" :column="2" class="detail-descriptions">
        <t-descriptions-item label="客户ID">{{ detail.id ?? '-' }}</t-descriptions-item>
        <t-descriptions-item label="客户编码">{{ detail.customer_no || '-' }}</t-descriptions-item>
        <t-descriptions-item label="企业ID">{{ detail.enterprise_id ?? '-' }}</t-descriptions-item>
        <t-descriptions-item label="状态">{{ statusTag[detail.status]?.label || '-' }}</t-descriptions-item>
        <t-descriptions-item label="客户名称">{{ detail.name || '-' }}</t-descriptions-item>
        <t-descriptions-item label="客户全称">{{ detail.full_name || '-' }}</t-descriptions-item>
        <t-descriptions-item label="统一社会信用码">{{ detail.credit_code || '-' }}</t-descriptions-item>
        <t-descriptions-item label="负责人ID">{{ detail.manager_id ?? '-' }}</t-descriptions-item>
        <t-descriptions-item label="联系人">{{ detail.contact_person || '-' }}</t-descriptions-item>
        <t-descriptions-item label="联系电话">{{ detail.contact_phone || '-' }}</t-descriptions-item>
        <t-descriptions-item label="创建时间">{{ detail.created_at || '-' }}</t-descriptions-item>
        <t-descriptions-item label="更新时间">{{ detail.updated_at || '-' }}</t-descriptions-item>
        <t-descriptions-item label="地址" :span="2">{{ detail.address || '-' }}</t-descriptions-item>
      </t-descriptions>
    </t-loading>
  </t-dialog>
</template>
<script setup lang="ts">
import type { CustomerDetail } from '@/api/model/enterprise/customer';

defineProps<{
  visible: boolean;
  loading: boolean;
  detail: CustomerDetail | null;
  statusTag: Record<number, { label: string }>;
}>();

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
}>();

const handleVisibleChange = (value: boolean) => {
  emit('update:visible', value);
};
</script>
<style lang="less" scoped>
.detail-descriptions {
  margin-top: 8px;
}
</style>
