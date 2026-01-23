<template>
  <t-card :bordered="false" class="project-list-card">
    <common-table
      :data="tableData"
      :loading="dataLoading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :dropdown-options="dropdownOptions"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @more="handleMoreAction"
    >
      <template #status="{ record }">
        <t-tag :theme="statusTag[(record as ProjectRow).status].theme">{{
          statusTag[(record as ProjectRow).status].label
        }}</t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-row align="middle" justify="space-around">
            <t-col>
              <t-link theme="primary" hover="color" @click="handleView(record)">详情</t-link>
            </t-col>
            <t-col>
              <t-dropdown
                :options="getDropdownOption((record as ProjectRow).status)"
                trigger="click"
                @click="() => handleMoreActionClick(record)"
              >
                <t-button variant="text" size="medium">更多操作</t-button>
              </t-dropdown>
            </t-col>
          </t-row>
        </t-space>
      </template>
      <template #toolbar>
        <t-button theme="primary" @click="handleCreate">发布项目</t-button>
      </template>
    </common-table>
    <t-dialog
      v-model:visible="moreActionDialogVisible"
      theme="warning"
      @cancel="handleDialogCancel"
      @confirm="() => handleDialogConfirm(moreActionType)"
    >
      <p>
        确认执行
        <span class="text-warning">{{ dropdownOptions.find((item) => item.value === moreActionType)?.content }}</span>
        操作吗?
      </p>
    </t-dialog>
  </t-card>
</template>
<script setup lang="ts">
import type { DropdownOption } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { ProjectItem, ProjectQuery, ProjectStatus } from '@/api/model/projectModel';
import { getProjectList } from '@/api/project';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'ProjectList',
});

const store = useSettingStore();
const router = useRouter();

type ProjectRow = ProjectItem;

const moreActionDialogVisible = ref(false);
const moreActionType = ref('');
const moreActionRecord = ref<ProjectRow>({} as ProjectRow);

const dropdownOptions: DropdownOption[] = [
  { content: '发布任务', value: 'publish', onClick: () => moreActionClick('publish') },
  { content: '暂停项目', value: 'pause', onClick: () => moreActionClick('pause') },
  { content: '继续项目', value: 'resume', onClick: () => moreActionClick('resume') },
  { content: '终止项目', value: 'terminate', onClick: () => moreActionClick('terminate') },
];

const getDropdownOption = (status: ProjectStatus) => {
  switch (status) {
    case 'processing':
      return dropdownOptions.filter((item) => item.value !== 'resume');
    case 'paused':
      return dropdownOptions.filter((item) => item.value !== 'pause');
    case 'completed':
      return [dropdownOptions[0]];
    case 'terminated':
      return [dropdownOptions[0]];
    default:
      return dropdownOptions;
  }
};

const moreActionClick = (type: string) => {
  console.log(type);
  moreActionType.value = type;
  moreActionDialogVisible.value = true;
};

const defaultQuery: ProjectQuery = {
  name: '',
  type: '',
  status: 'processing',
  company: '',
  page: 1,
  limit: 20,
};

const formConfig: FormConfig<ProjectRow, keyof ProjectRow> = {
  formItem: [
    { label: '项目名称', name: 'name', type: 'input', placeholder: '请输入项目名称' },
    {
      label: '项目类型',
      name: 'type',
      type: 'select',
      placeholder: '请选择项目类型',
      options: [
        { label: '资讯服务费', value: '12' },
        { label: '移动端项目', value: '23' },
        { label: '企业服务', value: '43' },
      ],
    },
    {
      label: '项目状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择项目状态',
      options: [
        { label: '进行中', value: 'processing' },
        { label: '已暂停', value: 'paused' },
        { label: '已完成', value: 'completed' },
        { label: '终止', value: 'terminated' },
      ],
    },
    { label: '所属企业', name: 'company', type: 'input', placeholder: '请输入所属企业' },
  ],
  formData: defaultQuery,
};
const tableConfig: TableConfig<ProjectRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 80, align: 'center', fixed: 'left' },
    { title: '项目编号', colKey: 'code', width: 120, align: 'center' },
    { title: '项目名称', colKey: 'name', minWidth: 240, ellipsis: true },
    { title: '发票类型', colKey: 'invoiceType', width: 140, align: 'center' },
    { title: '所属企业', colKey: 'company', minWidth: 220, ellipsis: true },
    { title: '项目时间', colKey: 'projectPeriod', width: 200 },
    { title: '任务数量', colKey: 'taskCount', width: 120, align: 'center' },
    { title: '项目状态', colKey: 'status', width: 120, align: 'center' },
    { title: '所需人员', colKey: 'requiredStaff', width: 120, align: 'center' },
    { title: '成员数量', colKey: 'memberCount', width: 120, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, fixed: 'right', align: 'center' },
  ],
};

const statusTag: Record<
  ProjectStatus,
  { label: string; theme: 'primary' | 'warning' | 'success' | 'danger'; variant?: 'light' | 'light-outline' }
> = {
  processing: { label: '进行中', theme: 'success', variant: 'light' },
  paused: { label: '已暂停', theme: 'primary', variant: 'light-outline' },
  completed: { label: '已完成', theme: 'primary', variant: 'light' },
  terminated: { label: '已终止', theme: 'danger', variant: 'light' },
};

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<ProjectQuery, ProjectRow>({
  fetcher: async (params) => {
    const { list, total } = await getProjectList(params);
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

const handleView = (row: ProjectRow) => {
  router.push({ name: 'ProjectDetail', query: { id: row.id } });
};

const handleMoreAction = (action: DropdownOption, row: ProjectRow) => {
  if (!action?.value) return;
  const actionText = typeof action.content === 'string' ? action.content : '';
  MessagePlugin.success(`${actionText} - ${row.name}`);
};

const handleCreate = () => {
  router.push({ name: 'ProjectPublish' });
};

const handleMoreActionClick = (record: ProjectRow) => {
  console.log(record);
  moreActionRecord.value = record;
};

const handleDialogCancel = () => {
  moreActionDialogVisible.value = false;
};
const handleDialogConfirm = (type: string) => {
  console.log(type);
};
</script>
<style lang="less" scoped>
.project-list-card {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}

.text-warning {
  font-weight: bold;
}
</style>
