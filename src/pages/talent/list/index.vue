<template>
  <t-card :bordered="false" class="talent-list-page">
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
      <template #auth_status_text="{ record }">
        <t-tag :theme="authStatusTag[record.auth_status].theme">
          {{ authStatusTag[record.auth_status].label }}
        </t-tag>
      </template>
      <template #sign_status_text="{ record }">
        <t-tag :theme="signStatusTag[record.sign_status].theme">
          {{ signStatusTag[record.sign_status].label }}
        </t-tag>
      </template>
      <template #channel="{ record }">
        {{ channelLabelMap[record.channel] || '-' }}
      </template>
      <template #join_time="{ record }">
        {{ formatSeconds(record.join_time) }}
      </template>
      <template #op="{ record }">
        <t-button variant="text" theme="primary" @click="handleDetail(record)">详情</t-button>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import type { TdTagProps } from 'tdesign-vue-next';
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import type { Row } from '@/api/model/common';
import type { TalentPoolItem, TalentPoolListQuery } from '@/api/model/talentpool';
import { TalentAuthStatus, TalentChannel, TalentSignStatus } from '@/api/model/talentpool';
import { getList } from '@/api/talentpool';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'TalentList',
});

const router = useRouter();

type TalentRow = TalentPoolItem & Row;

const channelOptions = [
  { label: '微信小程序', value: TalentChannel.WechatMiniProgram },
  { label: '后台导入', value: TalentChannel.AdminImport },
  { label: 'H5', value: TalentChannel.H5 },
];

const channelLabelMap: Record<TalentChannel, string> = {
  [TalentChannel.WechatMiniProgram]: '微信小程序',
  [TalentChannel.AdminImport]: '后台导入',
  [TalentChannel.H5]: 'H5',
};

const authStatusOptions = [
  { label: '待认证', value: TalentAuthStatus.Pending },
  { label: '已认证', value: TalentAuthStatus.Verified },
];

const signStatusOptions = [
  { label: '待签约', value: TalentSignStatus.Pending },
  { label: '已签约', value: TalentSignStatus.Signed },
];

const authStatusTag: Record<TalentAuthStatus, { label: string; theme: TdTagProps['theme'] }> = {
  [TalentAuthStatus.Pending]: { label: '待认证', theme: 'warning' },
  [TalentAuthStatus.Verified]: { label: '已认证', theme: 'success' },
};

const signStatusTag: Record<TalentSignStatus, { label: string; theme: TdTagProps['theme'] }> = {
  [TalentSignStatus.Pending]: { label: '待签约', theme: 'warning' },
  [TalentSignStatus.Signed]: { label: '已签约', theme: 'success' },
};

const formatSeconds = (value: number | string | null | undefined) => {
  if (!value) return '-';
  const seconds = typeof value === 'string' ? Number(value) : value;
  if (!seconds || Number.isNaN(seconds)) return '-';
  return dayjs(seconds * 1000).format('YYYY-MM-DD HH:mm:ss');
};

const defaultQuery: TalentPoolListQuery = {
  page: 1,
  limit: 10,
  keyword: '',
  name: '',
  phone: '',
  sign_status: undefined,
  auth_status: undefined,
  channel: undefined,
};

const formConfig: FormConfig<TalentPoolListQuery, keyof TalentPoolListQuery> = {
  formItem: [
    { label: '关键词', name: 'keyword', type: 'input', placeholder: '请输入关键词', span: 6 },
    { label: '姓名', name: 'name', type: 'input', placeholder: '请输入姓名', span: 6 },
    { label: '手机号', name: 'phone', type: 'input', placeholder: '请输入手机号', span: 6 },
    {
      label: '入驻渠道',
      name: 'channel',
      type: 'select',
      placeholder: '请选择渠道',
      span: 6,
      props: { options: channelOptions },
    },
    {
      label: '认证状态',
      name: 'auth_status',
      type: 'select',
      placeholder: '请选择认证状态',
      span: 6,
      props: { options: authStatusOptions },
    },
    {
      label: '签约状态',
      name: 'sign_status',
      type: 'select',
      placeholder: '请选择签约状态',
      span: 6,
      props: { options: signStatusOptions },
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<TalentRow, keyof TalentRow> = {
  tableItem: [
    { title: '姓名', colKey: 'name', width: 120, align: 'center' },
    { title: '手机号', colKey: 'phone_masked', width: 140, align: 'center' },
    { title: '身份证号', colKey: 'id_card_masked', width: 160, align: 'center' },
    { title: '银行卡号', colKey: 'bank_card_masked', width: 140, align: 'center' },
    { title: '入驻渠道', colKey: 'channel', width: 120, align: 'center' },
    { title: '认证状态', colKey: 'auth_status_text', width: 120, align: 'center' },
    { title: '签约状态', colKey: 'sign_status_text', width: 120, align: 'center' },
    { title: '加入时间', colKey: 'join_time', width: 160, align: 'center' },
    { title: '签约日期', colKey: 'sign_date', width: 160, align: 'center' },
    { title: '操作', colKey: 'op', width: 120, align: 'center' },
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

const tableHook = useCommonTable<TalentPoolListQuery, TalentRow>({
  fetcher: async (params) => {
    const res = await getList(params);
    const payload = (res as any).data ?? res;
    const list = payload.list || [];
    return {
      list,
      total: payload.total ?? list.length,
    };
  },
  defaultQuery,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search: handleSearch, reset: handleReset, handlePageChange } = tableHook;

const handleDetail = (record: TalentRow) => {
  console.log(record);
  router.push({
    name: 'TalentDetail',
    query: {
      id: record.id,
    },
  });
};
</script>
<style lang="less" scoped>
.talent-list-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
