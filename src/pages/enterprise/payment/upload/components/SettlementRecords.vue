<template>
  <div class="settlement-records">
    <common-table
      row-key="id"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :auto-add-index="false"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #action="{ record }">
        <t-space :size="16">
          <t-link theme="primary" hover="color" @click="handleViewDetail(record as SettlementRecordRow)">详情</t-link>
          <t-link
            theme="primary"
            hover="color"
            :disabled="!(record as SettlementRecordRow).source_url"
            @click="handleDownloadSettlement(record as SettlementRecordRow)"
          >
            下载结算单
          </t-link>
        </t-space>
      </template>
    </common-table>
  </div>
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { MessagePlugin } from 'tdesign-vue-next';
import { useRouter } from 'vue-router';

import { getImportSettlementList } from '@/api/enterprise/settlement';
import type { Row } from '@/api/model/common';
import type { ImportSettlementListLogPayload, ImportSettlementLog } from '@/api/model/enterprise/settlement';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';
import { parseDateRange } from '@/utils/date';

defineOptions({
  name: 'PaymentUploadSettlementRecords',
});

interface SettlementRecordQuery extends ImportSettlementListLogPayload {
  date_range?: string | [string, string];
  batch_no?: string;
}

interface SettlementRecordRow extends Row {
  id: number;
  upload_id: number;
  index: number;
  batch_no: string;
  settlement_time: string;
  settlement_name: string;
  import_record_count: number;
  import_fail_count: number;
  total_amount: string;
  import_amount: string;
  source_url: string;
  action?: string;
}

const router = useRouter();

const defaultQuery: SettlementRecordQuery = {
  page: 1,
  limit: 20,
  date_range: '',
  batch_no: '',
};

const formConfig: FormConfig<SettlementRecordQuery, keyof SettlementRecordQuery> = {
  formItem: [
    {
      label: '上传时间',
      name: 'date_range',
      type: 'date-range',
      span: 6,
      placeholder: ['开始时间', '结束时间'],
      props: {
        clearable: true,
      },
    },
    {
      label: '批次号',
      name: 'batch_no',
      type: 'input',
      span: 6,
      placeholder: '请输入结算单批次号',
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<SettlementRecordRow, keyof SettlementRecordRow> = {
  tableItem: [
    { title: '结算单批次号', colKey: 'batch_no', minWidth: 220, align: 'center' },
    { title: '结算时间', colKey: 'settlement_time', minWidth: 180, align: 'center' },
    { title: '结算单名称', colKey: 'settlement_name', minWidth: 180, align: 'center' },
    { title: '导入记录数量', colKey: 'import_record_count', minWidth: 140, align: 'center' },
    { title: '导入失败数量', colKey: 'import_fail_count', minWidth: 140, align: 'center' },
    { title: '合计金额（仅导入成功）', colKey: 'total_amount', minWidth: 180, align: 'center' },
    { title: '导入金额', colKey: 'import_amount', minWidth: 120, align: 'center' },
    { title: '操作', colKey: 'action', width: 200, align: 'center', fixed: 'right' },
  ],
};

const formatAmount = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return '0.00';
  return String(value);
};

const tableHook = useCommonTable<SettlementRecordQuery, SettlementRecordRow>({
  fetcher: async (params) => {
    const { data } = await getImportSettlementList({
      page: 1,
      limit: 1000,
    });

    const { start, end } = parseDateRange(params.date_range);
    const batchNo = params.batch_no?.trim() || '';
    const startDate = start ? dayjs(start).startOf('day') : null;
    const endDate = end ? dayjs(end).endOf('day') : null;

    const source = data.list || [];
    const filtered = source.filter((item: ImportSettlementLog) => {
      const matchBatchNo = !batchNo || item.batch_no?.includes(batchNo);
      const currentTime = dayjs((item.start_time || 0) * 1000);
      const matchStart = !startDate || currentTime.isAfter(startDate) || currentTime.isSame(startDate);
      const matchEnd = !endDate || currentTime.isBefore(endDate) || currentTime.isSame(endDate);
      return matchBatchNo && matchStart && matchEnd;
    });

    const current = params.page || 1;
    const pageSize = params.limit || 20;
    const startIndex = (current - 1) * pageSize;
    const pagedList = filtered.slice(startIndex, startIndex + pageSize).map((item, index) => ({
      id: item.id,
      upload_id: item.id,
      index: startIndex + index + 1,
      batch_no: item.batch_no,
      settlement_time: item.start_time_text || '-',
      settlement_name: item.remark || '结算单名称',
      import_record_count: item.stats?.settlement_count || item.total_count || 0,
      import_fail_count: item.fail_count || 0,
      total_amount: formatAmount(item.total_amount || item.stats?.payment_success_amount),
      import_amount: formatAmount(item.stats?.import_amount),
      source_url: item.source_url || '',
    }));

    return {
      list: pagedList,
      total: filtered.length,
    };
  },
  defaultQuery,
  autoSearch: true,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search, reset, handlePageChange } = tableHook;

const handleSearch = (payload?: Partial<SettlementRecordQuery>) => {
  search(payload || {});
};

const handleReset = () => {
  reset();
};

const handleViewDetail = (record: SettlementRecordRow) => {
  router.push({
    name: 'PaymentPayDetail',
    query: {
      id: record.upload_id,
    },
  });
};

const handleDownloadSettlement = (record: SettlementRecordRow) => {
  if (!record.source_url) {
    MessagePlugin.warning('当前记录暂无可下载结算单');
    return;
  }
  window.open(record.source_url, '_blank', 'noopener,noreferrer');
};
</script>
<style lang="less" scoped>
.settlement-records {
  padding: 16px;
}
</style>
