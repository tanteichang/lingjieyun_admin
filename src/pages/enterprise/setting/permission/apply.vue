<template>
  <div class="permission-content">
    <common-table
      row-key="id"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      :header-affixed-top="headerAffixedTop"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #user_info="{ record }">
        <div class="user-cell">
          <span class="user-cell__name">{{ record.user_info?.username || '-' }}</span>
          <span class="user-cell__mobile">{{ record.user_info?.mobile || '-' }}</span>
        </div>
      </template>
      <template #apply_status="{ record }">
        <t-tag :theme="applyStatusTag[record.apply_status as AdminApplyStatus]?.theme">
          {{ applyStatusTag[record.apply_status as AdminApplyStatus]?.label || record.apply_status_text || '-' }}
        </t-tag>
      </template>
      <template #audit_time="{ record }">
        {{ record.audit_time || '-' }}
      </template>
      <template #audit_remark="{ record }">
        {{ record.audit_remark || '-' }}
      </template>
      <template #op="{ record }">
        <t-link v-if="record.apply_status === AdminApplyStatus.Pending" theme="primary" @click="openAuditDialog(record)"
          >审核</t-link
        >
      </template>
    </common-table>
    <t-dialog
      v-model:visible="auditVisible"
      header="审核管理员申请"
      :confirm-loading="auditLoading"
      :on-cancel="handleAuditCancel"
      @confirm="handleAuditSubmit"
    >
      <template #body>
        <t-space direction="vertical" size="large" style="width: 100%">
          <div class="audit-user">
            {{ auditRecord?.user_info?.username || '-' }}
            <span v-if="auditRecord?.user_info?.mobile">（{{ auditRecord?.user_info?.mobile }}）</span>
          </div>
          <t-radio-group v-model="auditForm.audit_status">
            <t-radio :value="AdminApplyStatus.Passed">审核通过</t-radio>
            <t-radio :value="AdminApplyStatus.Rejected">审核拒绝</t-radio>
          </t-radio-group>
          <t-textarea
            v-model="auditForm.audit_remark"
            :maxlength="200"
            placeholder="请输入审核备注"
            :autosize="{ minRows: 4, maxRows: 6 }"
          />
        </t-space>
      </template>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { TdTagProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';

import { auditAdminApply, getAdminApplyList } from '@/api/enterprise/admin';
import type { Row } from '@/api/model/common';
import type { AdminApply, AdminApplyListPayload } from '@/api/model/enterprise/admin';
import { AdminApplyStatus } from '@/api/model/enterprise/admin';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'PermissionApply',
});

type AdminApplyRow = AdminApply & Row;

const defaultQuery: AdminApplyListPayload = {
  page: 1,
  limit: 10,
};

const formConfig: FormConfig<AdminApplyListPayload, keyof AdminApplyListPayload> = {
  formItem: [],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<AdminApplyRow, keyof AdminApplyRow> = {
  tableItem: [
    { title: '申请人', colKey: 'user_info', minWidth: 180 },
    { title: '申请备注', colKey: 'apply_remark', minWidth: 200, ellipsis: true },
    { title: '审核状态', colKey: 'apply_status', width: 120, align: 'center' },
    { title: '申请时间', colKey: 'created_at', width: 180, align: 'center' },
    { title: '审核时间', colKey: 'audit_time', width: 180, align: 'center' },
    { title: '审核备注', colKey: 'audit_remark', minWidth: 180, ellipsis: true },
    { title: '操作', colKey: 'op', width: 120, align: 'center', fixed: 'right' },
  ],
};

const applyStatusTag: Record<AdminApplyStatus, { label: string; theme: TdTagProps['theme'] }> = {
  [AdminApplyStatus.Pending]: { label: '待审核', theme: 'warning' },
  [AdminApplyStatus.Passed]: { label: '审核通过', theme: 'success' },
  [AdminApplyStatus.Rejected]: { label: '审核拒绝', theme: 'danger' },
};

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<AdminApplyListPayload, AdminApplyRow>({
  fetcher: async (params) => {
    try {
      const { data } = await getAdminApplyList(params);
      return {
        list: data?.list || [],
        total: data?.total || 0,
      };
    } catch (error) {
      MessagePlugin.error('获取管理员申请列表失败');
      throw error;
    }
  },
  defaultQuery,
});

const {
  data: tableData,
  loading,
  pagination,
  search: handleSearch,
  reset: handleReset,
  refresh,
  handlePageChange,
} = tableHook;

const auditVisible = ref(false);
const auditLoading = ref(false);
const auditRecord = ref<AdminApplyRow | null>(null);
const auditForm = ref<{
  audit_status: AdminApplyStatus;
  audit_remark: string;
}>({
  audit_status: AdminApplyStatus.Passed,
  audit_remark: '',
});

const openAuditDialog = (record: AdminApplyRow) => {
  auditRecord.value = record;
  auditForm.value = {
    audit_status: AdminApplyStatus.Passed,
    audit_remark: record.audit_remark || '',
  };
  auditVisible.value = true;
};

const handleAuditCancel = () => {
  auditVisible.value = false;
};

const handleAuditSubmit = async () => {
  if (!auditRecord.value) {
    return;
  }
  if (
    auditForm.value.audit_status !== AdminApplyStatus.Passed &&
    auditForm.value.audit_status !== AdminApplyStatus.Rejected
  ) {
    MessagePlugin.warning('请选择审核结果');
    return;
  }
  try {
    auditLoading.value = true;
    await auditAdminApply({
      apply_id: auditRecord.value.id,
      audit_status: auditForm.value.audit_status,
      audit_remark: auditForm.value.audit_remark.trim(),
    });
    MessagePlugin.success('管理员申请审核成功');
    auditVisible.value = false;
    refresh();
  } finally {
    auditLoading.value = false;
  }
};
</script>
<style lang="less" scoped>
.permission-content {
  padding: 20px 22px 28px;
}

.user-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-cell__name {
  color: var(--td-text-color-primary);
  font-weight: 500;
}

.user-cell__mobile {
  color: var(--td-text-color-secondary);
}

.audit-user {
  color: var(--td-text-color-primary);
  font-weight: 500;
}
</style>
