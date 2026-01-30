<template>
  <t-card :bordered="false" class="member-list-card">
    <common-table
      :data="tableData"
      :loading="dataLoading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #willingness="{ record }">
        <t-tag :theme="willingnessTag[(record as MemberRow).willingness].theme">
          {{ willingnessTag[(record as MemberRow).willingness].label }}
        </t-tag>
      </template>
      <template #contractStatus="{ record }">
        <t-tag :theme="contractStatusTag[(record as MemberRow).contractStatus].theme">
          {{ contractStatusTag[(record as MemberRow).contractStatus].label }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-row align="middle" justify="space-around">
            <t-col>
              <t-link theme="primary" hover="color" @click="handleViewContract(record)">查看合同</t-link>
            </t-col>
            <t-col>
              <t-link theme="danger" hover="color" @click="handleExitProject(record)">退出项目</t-link>
            </t-col>
          </t-row>
        </t-space>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import { computed, watch } from 'vue';

import type { TaskQuery } from '@/api/model/projectModel';
import { getMemberList } from '@/api/project';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'MemberList',
});

const emit = defineEmits<{
  (e: 'update:total', total: number): void;
}>();

const store = useSettingStore();

// Member相关类型定义
export type Willingness = 'willing' | 'unwilling' | 'undecided';

export type ContractStatus = 'signed' | 'pending' | 'rejected';

export interface MemberItem {
  id: number;
  name: string;
  phone: string;
  taskCode: string;
  taskName: string;
  taskType: string;
  willingness: Willingness;
  contractStatus: ContractStatus;
}

type MemberRow = MemberItem;

const defaultQuery: TaskQuery = {
  name: '',
  status: '',
  page: 1,
  limit: 20,
};

const formConfig = {
  formItem: [
    { label: '姓名', name: 'name', type: 'input', placeholder: '请输入姓名或名称', span: 6 },
    { label: '手机号码', name: 'phone', type: 'input', placeholder: '请输入手机号', span: 6 },
    {
      label: '任务状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择任务编号',
      span: 6,
      props: {
        options: [{ label: '111', value: 'XM487' }],
      },
    },
    { label: '所属任务', name: 'taskName', type: 'input', placeholder: '请选择任务类型', span: 6 },
  ],
  formData: {
    name: '',
    phone: '',
    status: '',
    taskName: '',
  },
};

const tableConfig: TableConfig<MemberRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 80, align: 'center' as const, fixed: 'left' },
    { title: '姓名', colKey: 'name', width: 120, align: 'center' as const },
    { title: '手机号码', colKey: 'phone', width: 150, align: 'center' as const },
    { title: '任务编号', colKey: 'taskCode', width: 120, align: 'center' as const },
    { title: '任务名称', colKey: 'taskName', minWidth: 200, ellipsis: true },
    { title: '任务类型', colKey: 'taskType', width: 120, align: 'center' as const },
    { title: '入驻意愿', colKey: 'willingness', width: 120, align: 'center' as const },
    { title: '签约状态', colKey: 'contractStatus', width: 120, align: 'center' as const },
    { title: '操作', colKey: 'op', width: 180, fixed: 'right', align: 'center' as const },
  ],
};

const willingnessTag: Record<
  Willingness,
  { label: string; theme: 'primary' | 'warning' | 'success' | 'danger'; variant?: 'light' | 'light-outline' }
> = {
  willing: { label: '定向意愿', theme: 'success', variant: 'light' },
  unwilling: { label: '自由报名', theme: 'primary', variant: 'light-outline' },
  undecided: { label: '自由报名', theme: 'warning', variant: 'light' },
};

const contractStatusTag: Record<
  ContractStatus,
  { label: string; theme: 'primary' | 'warning' | 'success' | 'danger'; variant?: 'light' | 'light-outline' }
> = {
  signed: { label: '已签约', theme: 'success', variant: 'light' },
  pending: { label: '已签约', theme: 'primary', variant: 'light' },
  rejected: { label: '未签约', theme: 'danger', variant: 'light' },
};

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<TaskQuery, MemberRow>({
  fetcher: async (params) => {
    const { list, total } = await getMemberList(params);
    return {
      list,
      total,
    };
  },
  defaultQuery,
  debounceWait: 400,
});

const {
  data: tableData,
  loading: dataLoading,
  pagination,
  search: handleSearch,
  reset: handleReset,
  handlePageChange,
} = tableHook;

// 监听总数变化，传递给父组件
watch(
  () => pagination.total,
  (newTotal) => {
    emit('update:total', newTotal);
  },
  { immediate: true },
);

const handleViewContract = (row: MemberRow) => {
  console.log('查看合同:', row);
  // 这里可以实现查看合同的逻辑
};

const handleExitProject = (row: MemberRow) => {
  console.log('退出项目:', row);
  // 这里可以实现退出项目的逻辑
};
</script>
<style lang="less" scoped>
.member-list-card {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
