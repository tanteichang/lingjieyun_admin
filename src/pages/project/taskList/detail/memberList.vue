<template>
  <div class="member-list-card">
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
      <template #toolbar>
        <t-button theme="primary" type="submit">招募</t-button>
        <t-button theme="primary">批量招募</t-button>
        <t-button variant="outline">批量上传证件</t-button>
        <t-button variant="outline">导出</t-button>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color">
            {{ (record as MemberRow).contractStatus === 'signed' ? '查看平台合同' : '通知签约' }}
          </t-link>
          <t-link theme="danger" hover="color">移出任务</t-link>
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
  name: 'TaskMemberList',
});

type RealNameStatus = 'pending' | 'signed';
type ContractStatus = 'pending' | 'processing' | 'signed';

interface MemberRow {
  id: number;
  name: string;
  phone: string;
  channel: string;
  realNameStatus: RealNameStatus;
  contractStatus: ContractStatus;
  joinTime: string;
}

const filters = reactive({
  name: '',
  phone: '',
  contractStatus: '',
});

const contractOptions = [
  { label: '待签约', value: 'pending' },
  { label: '进行中', value: 'processing' },
  { label: '已签约', value: 'signed' },
];

const realNameTag: Record<RealNameStatus, { label: string; theme: DropdownOption['theme'] }> = {
  pending: { label: '未实名', theme: 'danger' },
  signed: { label: '已实名', theme: 'success' },
};

const contractTag: Record<ContractStatus, { label: string; theme: DropdownOption['theme'] }> = {
  pending: { label: '待签约', theme: 'primary' },
  processing: { label: '进行中', theme: 'warning' },
  signed: { label: '已签约', theme: 'success' },
};

const formConfig = {
  formItem: [
    { label: '姓名', name: 'name', type: 'input', placeholder: '请输入姓名或名称', span: 6 },
    { label: '手机号码', name: 'phone', type: 'input', placeholder: '请输入手机号', span: 6 },
    {
      label: '签约状态',
      name: 'contractStatus',
      type: 'select',
      placeholder: '请选择签约状态',
      options: contractOptions,
      span: 6,
    },
  ],
  formData: {
    name: '',
    phone: '',
    contractStatus: '',
    page: 1,
    limit: 10,
  },
};

const tableConfig: TableConfig<MemberRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '姓名', colKey: 'name', width: 120, align: 'center' },
    { title: '手机号码', colKey: 'phone', width: 150, align: 'center' },
    { title: '入驻渠道', colKey: 'channel', width: 120, align: 'center' },
    { title: '实名状态', colKey: 'realNameStatus', width: 120, align: 'center' },
    { title: '签约状态', colKey: 'contractStatus', width: 120, align: 'center' },
    { title: '加入时间', colKey: 'joinTime', width: 160, align: 'center' },
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

const tableHook = useCommonTable<TaskQuery, MemberRow>({
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
.member-list-card {
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

.actions {
  flex-shrink: 0;
}
</style>
