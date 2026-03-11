<template>
  <div class="page-content">
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #op="{ record }">
        <t-button theme="primary" variant="outline" @click="handleDetail(record)">详情</t-button>
      </template>
    </common-table>
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

import { getSettlementDetail } from '@/api/enterprise/settlement';
import type { Row } from '@/api/model/common';
import type { SettlementDetailPayload, SettlementPlanDateItem } from '@/api/model/enterprise/settlement';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

defineOptions({
  name: 'SettlementDetailPage',
});

type PlanDateRow = SettlementPlanDateItem & Row;

const route = useRoute();
const router = useRouter();

const formConfig: FormConfig<SettlementDetailPayload, keyof SettlementDetailPayload> = {
  formItem: [],
  formData: {
    product_id: Number(route.query.id) || 0,
    plan_date: '',
    name: '',
    mobile: '',
    page: 1,
    limit: 20,
  },
};

const tableConfig: TableConfig<PlanDateRow, keyof PlanDateRow> = {
  tableItem: [
    { title: '计划交付日期', colKey: 'plan_date', minWidth: 180, align: 'center' },
    { title: '交付人数', colKey: 'delivery_count', minWidth: 120, align: 'center' },
    { title: '操作', colKey: 'op', minWidth: 120, align: 'center' },
  ],
};

const tableHook = useCommonTable<SettlementDetailPayload, PlanDateRow>({
  fetcher: async (params) => {
    const { data } = await getSettlementDetail(params);
    const list = (data.plan_date_list || []).map((item, index) => ({
      id: index + 1,
      ...item,
    }));
    return {
      list,
      total: list.length,
    };
  },
  defaultQuery: formConfig.formData as SettlementDetailPayload,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;

const handleSearch = (payload?: Partial<SettlementDetailPayload>) => {
  search(payload || {});
};

const handleReset = () => {
  reset();
};

const handleDetail = (row: PlanDateRow) => {
  console.log(row);
  router.push({
    name: 'PaymentDetail',
    query: {
      id: route.query.id,
      date: row.plan_date,
    },
  });
};
</script>
<style scoped lang="less">
.page-content {
  padding: 16px;
  background: #fff;
}
</style>
