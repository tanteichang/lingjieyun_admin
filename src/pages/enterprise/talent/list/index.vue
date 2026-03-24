<template>
  <t-card :bordered="false" class="talent-list-page">
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
      <template #select-auth_status-option="{ option }">
        <t-tag :theme="TalentAuthStatusTag[option.value as TalentAuthStatus].theme">
          {{ TalentAuthStatusTag[option.value as TalentAuthStatus].label }}
        </t-tag>
      </template>
      <template #select-sign_status-option="{ option }">
        <t-tag :theme="TalentSignStatusTag[option.value as TalentSignStatus].theme">
          {{ TalentSignStatusTag[option.value as TalentSignStatus].label }}
        </t-tag>
      </template>
      <template #auth_status_text="{ record }">
        <t-tag :theme="TalentAuthStatusTag[record.auth_status as TalentAuthStatus].theme">
          {{ TalentAuthStatusTag[record.auth_status as TalentAuthStatus].label }}
        </t-tag>
      </template>
      <template #sign_status_text="{ record }">
        <t-tag
          :theme="TalentSignStatusTag[record.sign_status as TalentSignStatus].theme"
          :variant="TalentSignStatusTag[record.sign_status as TalentSignStatus].variant"
        >
          {{ TalentSignStatusTag[record.sign_status as TalentSignStatus].label }}
        </t-tag>
      </template>
      <template #is_face_verified="{ record }">
        {{ record.is_face_verified }}
        <t-tooltip v-if="!record.face_photo_url" content="刷脸认证已过期" theme="danger">
          <t-icon name="info-circle" color="red" />
        </t-tooltip>
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
import { computed } from 'vue';
import { useRouter } from 'vue-router';

import { getList } from '@/api/enterprise/talentpool';
import type { Row } from '@/api/model/common';
import type { TalentPoolItem, TalentPoolListQuery } from '@/api/model/enterprise/talentpool';
import {
  TalentAuthStatus,
  TalentAuthStatusTag,
  TalentChannel,
  TalentSignStatus,
  TalentSignStatusTag,
} from '@/api/model/enterprise/talentpool';
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

const authStatusOptions = [
  { label: '待认证', value: TalentAuthStatus.Pending },
  { label: '已认证', value: TalentAuthStatus.Verified },
];

const signStatusOptions = [
  { label: '待签约', value: TalentSignStatus.Pending },
  { label: '已签约', value: TalentSignStatus.Signed },
];

const formatSeconds = (value: number | string | null | undefined) => {
  if (!value) return '-';
  const seconds = typeof value === 'string' ? Number(value) : value;
  if (!seconds || Number.isNaN(seconds)) return '-';
  return dayjs(seconds * 1000).format('YYYY-MM-DD HH:mm:ss');
};

const defaultQuery: TalentPoolListQuery = {
  page: 1,
  limit: 10,
  name: '',
  phone: '',
  sign_status: undefined,
  auth_status: undefined,
  channel: undefined,
};

const formConfig: FormConfig<TalentPoolListQuery, keyof TalentPoolListQuery> = {
  formItem: [
    { label: '姓名', name: 'name', type: 'input', placeholder: '请输入姓名', span: 4 },
    { label: '手机号', name: 'phone', type: 'input', placeholder: '请输入手机号', span: 4 },
    {
      label: '入驻渠道',
      name: 'channel',
      type: 'select',
      placeholder: '请选择渠道',
      span: 4,
      props: { options: channelOptions },
    },
    {
      label: '认证状态',
      name: 'auth_status',
      type: 'select',
      placeholder: '请选择认证状态',
      span: 4,
      props: { options: authStatusOptions },
    },
    {
      label: '签约状态',
      name: 'sign_status',
      type: 'select',
      placeholder: '请选择签约状态',
      span: 4,
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
    { title: '认证状态', colKey: 'auth_status_text', width: 120, align: 'center' },
    { title: '签约状态', colKey: 'sign_status_text', width: 120, align: 'center' },
    { title: '人脸验证', colKey: 'is_face_verified', width: 120, align: 'center' },
    { title: '入驻渠道', colKey: 'channel', width: 120, align: 'center' },
    { title: '评分等级', colKey: 'score_level', width: 120, align: 'center' },
    { title: '签约日期', colKey: 'sign_date', width: 160, align: 'center' },
    { title: '操作', colKey: 'op', width: 120, align: 'left', fixed: 'right' },
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
