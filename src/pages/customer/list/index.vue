<template>
  <t-card :bordered="false" class="customer-list-page">
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #toolbar>
        <t-button theme="primary" @click="handleCreate">新增企业</t-button>
      </template>
      <template #status="{ record }">
        <t-tag :theme="statusTag[(record as CustomerRow).status]?.theme" variant="light">
          {{ statusTag[(record as CustomerRow).status]?.label || '-' }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleEdit(record as CustomerRow)">编辑</t-link>
          <t-popconfirm theme="danger" content="确认删除该企业吗" @confirm="handleDelete(record as CustomerRow)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import type { DropdownOption } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { deleteCustomer, getCustomerList } from '@/api/customer';
import type { Row } from '@/api/model/common';
import type { Customer } from '@/api/model/customer';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { useCustomerStore } from '@/store/modules/customer';

defineOptions({
  name: 'CustomerList',
});

const router = useRouter();

type CustomerStatus = number;

type CustomerRow = Customer & Row;
interface CustomerQuery {
  page: number;
  limit: number;
  name?: string;
  contact_person?: string;
  contact_phone?: string;
  status?: CustomerStatus | '';
}

const statusTabs: Array<{ label: string; value: CustomerStatus | '' }> = [
  { label: '全部', value: '' },
  { label: '正常', value: 1 },
  { label: '禁用', value: 0 },
];

const statusTag: Record<CustomerStatus, { label: string; theme: DropdownOption['theme'] }> = {
  1: { label: '正常', theme: 'success' },
  0: { label: '禁用', theme: 'warning' },
};

const customerStatusOptions = statusTabs.slice(1);

const defaultQuery: CustomerQuery = {
  page: 1,
  limit: 10,
};

const formConfig: FormConfig<CustomerRow, keyof CustomerRow> = {
  formItem: [
    { label: '客户名称', name: 'name', type: 'input', placeholder: '请输入客户名称', span: 6 },
    { label: '联系人', name: 'contact_person', type: 'input', placeholder: '请输入联系人', span: 6 },
    { label: '联系电话', name: 'contact_phone', type: 'input', placeholder: '请输入联系电话', span: 6 },
    {
      label: '状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择状态',
      span: 6,
      props: { options: customerStatusOptions },
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<CustomerRow, keyof CustomerRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '客户编号', colKey: 'customer_no', width: 140, align: 'center' },
    { title: '客户名称', colKey: 'name', minWidth: 200, ellipsis: true },
    { title: '客户全称', colKey: 'full_name', minWidth: 240, ellipsis: true },
    { title: '联系人', colKey: 'contact_person', width: 120 },
    { title: '联系电话', colKey: 'contact_phone', width: 140 },
    { title: '地址', colKey: 'address', minWidth: 240, ellipsis: true },
    { title: '状态', colKey: 'status', width: 100, align: 'center' },
    { title: '创建时间', colKey: 'created_at', width: 180, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' },
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

const tableHook = useCommonTable<CustomerQuery, CustomerRow>({
  fetcher: async (params) => {
    const response = await getCustomerList(params);
    const data = response.data;
    useCustomerStore().setCustomers(data);
    return { list: data, total: data.length };
  },
  defaultQuery,
  debounceWait: 300,
  autoSearch: true,
});

const {
  data: tableData,
  loading,
  pagination,
  search: handleSearch,
  reset: handleReset,
  handlePageChange,
  query,
} = tableHook;

const handleEdit = (row: CustomerRow) => {
  router.push({ name: 'CustomerForm', query: { id: row.id } });
};

const handleDelete = (row: CustomerRow) => {
  deleteCustomer({ id: row.id }).then(() => {
    MessagePlugin.success(`删除客户 ${row.name} 成功`);
    handleSearch();
  });
};

const handleCreate = () => {
  router.push({ name: 'CustomerForm' });
};
</script>
<style lang="less" scoped>
.customer-list-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
