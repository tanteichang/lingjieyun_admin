<template>
  <div class="page-content">
    <settlement-task-info-card :task-info="taskInfo" :plan-date="currentPlanDate" />

    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :expanded-row-keys="expandedRowKeys"
      :row-class-name="getRowClassName"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @expand-change="handleExpandChange"
    >
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" variant="outline" @click="handleDetail(record)">
            {{ expandedRowKeys.includes(record.id) ? '收起' : '详情' }}
          </t-link>
          <t-link theme="primary" variant="outline" @click="handleDownloadTemplate(record)"> 模版下载 </t-link>
          <t-link theme="primary" variant="outline" @click="handleUpload(record)"> 上传结算单 </t-link>
        </t-space>
      </template>
      <template #expandedRow="{ record }">
        <transition name="settlement-expand" appear>
          <div class="detail-panel">
            <t-loading :loading="getDetailLoading(record)">
              <t-list v-if="getDetailList(record).length" split>
                <settlement-delivery-list-item
                  v-for="item in getDetailList(record)"
                  :key="item.id"
                  :item="item"
                  @record-click="handleDetail(item)"
                />
              </t-list>
              <t-empty v-else description="暂无交付明细" />
            </t-loading>
          </div>
        </transition>
      </template>
    </common-table>

    <settlement-upload-dialog
      v-model="uploadDialogVisible"
      :plan-date="currentUploadRow?.plan_date || null"
      @success="handleUploadSuccess"
    />
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { useRoute } from 'vue-router';

import { downloadSettlementTemplate, getSettlementDetail } from '@/api/enterprise/settlement';
import type { Row } from '@/api/model/common';
import type {
  SettlementDetailPayload,
  SettlementDeliveryItem,
  SettlementPlanDateItem,
  SettlementTaskInfo,
} from '@/api/model/enterprise/settlement';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { useCommonTable } from '@/hooks/useCommonTable';

import SettlementDeliveryListItem from './components/SettlementDeliveryListItem.vue';
import SettlementTaskInfoCard from './components/SettlementTaskInfoCard.vue';
import SettlementUploadDialog from './components/SettlementUploadDialog.vue';

defineOptions({
  name: 'SettlementDetailPage',
});

type PlanDateRow = SettlementPlanDateItem & Row;

const route = useRoute();
const productId = Number(route.query.id) || 0;
const expandedRowKeys = ref<Array<string | number>>([]);
const rowDetailMap = reactive<Record<string, SettlementDeliveryItem[]>>({});
const rowLoadingMap = reactive<Record<string, boolean>>({});
const taskInfo = ref<SettlementTaskInfo | null>(null);
const uploadDialogVisible = ref(false);
const currentUploadRow = ref<PlanDateRow | null>(null);

const formConfig: FormConfig<SettlementDetailPayload, keyof SettlementDetailPayload> = {
  formItem: [],
  formData: {
    product_id: productId,
    plan_date: '',
    name: '',
    mobile: '',
    page: 1,
    limit: 20,
  },
};

const tableConfig: TableConfig<PlanDateRow, keyof PlanDateRow> = {
  tableItem: [
    { title: '结算时间', colKey: 'plan_date', minWidth: 180, align: 'center' },
    { title: '任务总人数', colKey: 'delivery_count', minWidth: 120, align: 'center' },
    { title: '操作', colKey: 'op', minWidth: 120, align: 'center' },
  ],
};

const tableHook = useCommonTable<SettlementDetailPayload, PlanDateRow>({
  fetcher: async (params) => {
    const { data } = await getSettlementDetail(params);
    taskInfo.value = data.task_info || null;
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

const clearExpandedState = () => {
  expandedRowKeys.value = [];
  Object.keys(rowDetailMap).forEach((key) => {
    delete rowDetailMap[key];
  });
  Object.keys(rowLoadingMap).forEach((key) => {
    delete rowLoadingMap[key];
  });
};

const handleSearch = (payload?: Partial<SettlementDetailPayload>) => {
  clearExpandedState();
  search(payload || {});
};

const handleReset = () => {
  clearExpandedState();
  reset();
};

const getDetailCacheKey = (row: Pick<PlanDateRow, 'plan_date'>) => row.plan_date || '';

const expandFirstRow = async (rows: PlanDateRow[]) => {
  const [firstRow] = rows;
  if (!firstRow) {
    expandedRowKeys.value = [];
    return;
  }

  expandedRowKeys.value = [firstRow.id];
  await loadDetailList(firstRow);
};

const loadDetailList = async (row: PlanDateRow) => {
  const cacheKey = getDetailCacheKey(row);
  if (!cacheKey || rowLoadingMap[cacheKey]) return;
  if (rowDetailMap[cacheKey]) return;

  rowLoadingMap[cacheKey] = true;
  try {
    const { data } = await getSettlementDetail({
      product_id: productId,
      plan_date: row.plan_date,
      name: '',
      mobile: '',
      page: 1,
      limit: row.delivery_count || 20,
    });
    rowDetailMap[cacheKey] = data.delivery_list || [];
  } finally {
    rowLoadingMap[cacheKey] = false;
  }
};

const handleDetail = async (row: PlanDateRow) => {
  if (expandedRowKeys.value.includes(row.id)) {
    expandedRowKeys.value = [];
    return;
  }
  expandedRowKeys.value = [row.id];
  await loadDetailList(row);
};

const handleExpandChange = async (payload: {
  expandedRowKeys: Array<string | number>;
  currentRowData?: PlanDateRow;
}) => {
  expandedRowKeys.value = payload.currentRowData ? [payload.currentRowData.id] : payload.expandedRowKeys.slice(0, 1);
  if (payload.currentRowData && expandedRowKeys.value.length > 0) {
    await loadDetailList(payload.currentRowData);
  }
};

const getDetailList = (row: PlanDateRow) => {
  return rowDetailMap[getDetailCacheKey(row)] || [];
};

const getDetailLoading = (row: PlanDateRow) => {
  return !!rowLoadingMap[getDetailCacheKey(row)];
};

const getRowClassName = ({ row }: { row: PlanDateRow }) => {
  return expandedRowKeys.value.includes(row.id) ? 'settlement-row--expanded' : '';
};

const currentPlanDate = computed(() => {
  const currentId = expandedRowKeys.value[0];
  return tableData.value.find((item) => item.id === currentId)?.plan_date || null;
});

const handleDownloadTemplate = async (row: PlanDateRow) => {
  try {
    const blob = await downloadSettlementTemplate({
      type: 'with_members',
      product_id: productId,
      plan_date: row.plan_date,
    });

    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement('a');
    const taskTitle = taskInfo.value?.task_title || '结算单';
    link.href = url;
    link.setAttribute('download', `${taskTitle}-${row.plan_date}-结算单.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    MessagePlugin.error(error instanceof Error ? error.message : '模板下载失败');
  }
};

const handleUpload = (row: PlanDateRow) => {
  currentUploadRow.value = row;
  uploadDialogVisible.value = true;
};

const handleUploadSuccess = async () => {
  const currentRow = currentUploadRow.value;

  if (!currentRow) {
    return;
  }

  delete rowDetailMap[getDetailCacheKey(currentRow)];
  expandedRowKeys.value = [currentRow.id];
  await loadDetailList(currentRow);
};

watch(
  tableData,
  async (rows) => {
    await expandFirstRow(rows);
  },
  {
    immediate: true,
  },
);

watch(uploadDialogVisible, (visible) => {
  if (!visible) {
    currentUploadRow.value = null;
  }
});
</script>
<style scoped lang="less">
.page-content {
  display: grid;
  gap: 12px;
  padding: 16px;
  background: #fff;
}

.detail-panel {
  padding: 12px 22px;
  border-radius: 8px;
  max-height: 800px;
  overflow-y: auto;
}

.settlement-expand-enter-active,
.settlement-expand-leave-active {
  overflow: hidden;
  transition:
    max-height 0.5s ease,
    opacity 0.5s ease,
    transform 0.5s ease;
}

.settlement-expand-enter-from,
.settlement-expand-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-8px);
}

.settlement-expand-enter-to,
.settlement-expand-leave-from {
  max-height: 800px;
  opacity: 1;
  transform: translateY(0);
}
.detail-panel :deep(.t-list__inner) {
  border-left: 2px solid #0052d9;
}

.detail-panel__title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
  color: #1f2738;
}

:deep(.settlement-row--expanded > td) {
  background: #eef6ff;
}
:deep(.t-table--hoverable tbody tr:hover) {
  background: #fff;
}

:deep(.settlement-row--expanded:hover > td) {
  background: #e3f0ff;
}
</style>
