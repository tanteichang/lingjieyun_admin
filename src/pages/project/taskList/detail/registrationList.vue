<template>
  <div class="registration-list-card">
    <common-table
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
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color">同意</t-link>
          <t-link theme="danger" hover="color">拒绝</t-link>
          <t-link hover="color">详情</t-link>
        </t-space>
      </template>
    </common-table>
  </div>
</template>
<script setup lang="ts">
import type { DropdownOption } from 'tdesign-vue-next';
import { computed, reactive } from 'vue';

import type { TaskQuery } from '@/api/model/projectModel';
import { getMemberList } from '@/api/project';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'RegistrationList',
});

type AuditStatus = 'pending' | 'approved' | 'rejected';

interface RegistrationRow {
  id: number;
  name: string;
  phone: string;
  status: AuditStatus;
  applyTime: string;
}

const filters = reactive({
  name: '',
  phone: '',
  status: '',
});

const statusOptions = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
];

const statusTag: Record<AuditStatus, { label: string; theme: DropdownOption['theme'] }> = {
  pending: { label: '待审核', theme: 'warning' },
  approved: { label: '已通过', theme: 'success' },
  rejected: { label: '已拒绝', theme: 'danger' },
};

const formConfig = {
  formItem: [
    { label: '姓名', name: 'name', type: 'input', placeholder: '请输入姓名或名称', span: 6 },
    { label: '手机号码', name: 'phone', type: 'input', placeholder: '请输入手机号', span: 6 },
    {
      label: '审核状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择审核状态',
      options: statusOptions,
      span: 6,
    },
  ],
  formData: {
    name: '',
    phone: '',
    status: '',
    page: 1,
    limit: 10,
  },
};

const tableConfig: TableConfig<RegistrationRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '姓名', colKey: 'name', width: 120, align: 'center' },
    { title: '手机号码', colKey: 'phone', width: 150, align: 'center' },
    { title: '审核状态', colKey: 'status', width: 120, align: 'center' },
    { title: '报名时间', colKey: 'applyTime', width: 180, align: 'center' },
    { title: '操作', colKey: 'op', width: 200, align: 'center', fixed: 'right' },
  ],
};

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<TaskQuery, RegistrationRow>({
  fetcher: async (params) => {
    const { list, total } = await getMemberList(params);
    return { list, total };
  },
  defaultQuery: formConfig.formData,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search: handleSearch, reset: handleReset, handlePageChange } = tableHook;
</script>
<style lang="less" scoped>
.registration-list-card {
  padding: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 16px;
  gap: 12px;

  :deep(.t-form) {
    flex: 1;
  }
}
</style>
