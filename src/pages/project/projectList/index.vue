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
      <template #projectTime="{ record }">
        <span>{{ (record as ProjectItem).start_time || '-' }}至{{ (record as ProjectItem).end_time || '-' }}</span>
      </template>
      <template #project_status="{ record }">
        <t-tag
          :variant="PROJECT_STATUS_TAG[(record as ProjectItem).project_status].variant"
          :theme="PROJECT_STATUS_TAG[(record as ProjectItem).project_status].theme"
        >
          {{ PROJECT_STATUS_TAG[(record as ProjectItem).project_status].label }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-row align="middle" justify="space-around">
            <t-col>
              <t-link theme="primary" hover="color" @click="handleView(record)">详情</t-link>
            </t-col>
            <t-col>
              <t-dropdown
                :options="getDropdownOption((record as ProjectItem).project_status)"
                trigger="click"
                @click="() => handleMoreActionClick(record)"
              >
                <t-button
                  variant="text"
                  size="medium"
                  :disabled="getDropdownOption((record as ProjectItem).project_status).length === 0"
                  >更多操作</t-button
                >
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

import type { Row } from '@/api/model/common';
import type { ProjectItem, ProjectQuery } from '@/api/model/projectModel';
import { PROJECT_STATUS_TAG, ProjectStatus } from '@/api/model/projectModel';
import { getProjectList, pauseProject, resumeProject, terminateProject } from '@/api/project';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { useDictStore } from '@/store/modules/dict';
import { useProjectStore } from '@/store/modules/project';

defineOptions({
  name: 'ProjectList',
});

const store = useSettingStore();
const router = useRouter();
const dictStore = useDictStore();

const projectStore = useProjectStore();

type ProjectRow = ProjectItem & Row;

const moreActionDialogVisible = ref(false);
const moreActionType = ref('');
const moreActionRecord = ref<ProjectRow>({} as ProjectRow);

const projectTypeOptions = computed(() => dictStore.getProjectTypeOptions);

const dropdownOptions: DropdownOption[] = [
  { content: '发布任务', value: 'publish', onClick: () => moreActionClick('publish') },
  { content: '暂停项目', value: 'pause', onClick: () => moreActionClick('pause') },
  { content: '恢复项目', value: 'resume', onClick: () => moreActionClick('resume') },
  { content: '终止项目', value: 'terminate', onClick: () => moreActionClick('terminate') },
];

/**
 * 1-待开始 发布任务 暂停项目 终止项目
 * 2-进行中 发布任务 暂停项目 终止项目
 * 3-已暂停 恢复项目 终止项目
 * 4-已终止
 * 5-已完成
 */
const getDropdownOption = (status: ProjectStatus) => {
  switch (status) {
    case ProjectStatus.NotStarted:
      return dropdownOptions.filter((item) => item.value !== 'resume');
    case ProjectStatus.InProgress:
      return dropdownOptions.filter((item) => item.value !== 'resume');
    case ProjectStatus.Paused:
      return dropdownOptions.filter((item) => item.value !== 'pause' && item.value !== 'publish');
    case ProjectStatus.Completed:
      return [];
    case ProjectStatus.Terminated:
      return [];
    default:
      return dropdownOptions;
  }
};

const moreActionClick = (type: string) => {
  moreActionType.value = type;
  moreActionDialogVisible.value = true;
};

const defaultQuery: ProjectQuery = {
  page: 1,
  limit: 20,
};

const formConfig = computed<FormConfig<ProjectQuery, keyof ProjectQuery>>(() => ({
  formItem: [
    { label: '项目名称', name: 'name', type: 'input', placeholder: '请输入项目名称' },
    {
      label: '项目状态',
      name: 'project_status',
      type: 'select',
      placeholder: '请选择项目状态',
      props: {
        options: [
          { label: '未开始', value: ProjectStatus.NotStarted },
          { label: '进行中', value: ProjectStatus.InProgress },
          { label: '已暂停', value: ProjectStatus.Paused },
          { label: '已完成', value: ProjectStatus.Completed },
          { label: '已终止', value: ProjectStatus.Terminated },
        ],
      },
    },
    {
      label: '项目类型',
      name: 'project_type_id',
      type: 'select',
      placeholder: '请选择项目类型',
      props: {
        clearable: true,
        options: projectTypeOptions.value,
      },
    },
    {
      label: '所属企业',
      name: 'customer_id',
      type: 'select',
      placeholder: '请选择所属企业',
      props: {
        clearable: true,
        // options: projectStore.enterpriseOptions.value,
      },
    },
  ],
  formData: defaultQuery,
}));
const tableConfig: TableConfig<ProjectRow, keyof ProjectRow> = {
  tableItem: [
    { title: '#', colKey: 'id', width: 80, fixed: 'left' },
    { title: '项目编号', colKey: 'task_no', width: 140 },
    { title: '项目名称', colKey: 'name', minWidth: 240, ellipsis: true },
    { title: '发票类型', colKey: 'invoice_type_name', width: 140 },
    { title: '所属企业', colKey: 'enterprise_name', minWidth: 220, ellipsis: true },
    { title: '项目时间', colKey: 'projectTime', width: 200 },
    { title: '任务数量', colKey: 'task_count', width: 120, align: 'center' },
    { title: '项目状态', colKey: 'project_status', width: 120, align: 'center' },
    { title: '所需人员', colKey: 'required_personnel', width: 120, align: 'center' },
    { title: '成员数量', colKey: 'task_count', width: 120, align: 'center' },
    { title: '操作', colKey: 'op', width: 150, align: 'center', fixed: 'right' },
  ],
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
    const { data } = await getProjectList(params);
    projectStore.setProjects(data?.list || []);
    return {
      list: data?.list || [],
      total: data?.total || 0,
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
  router.push({ name: 'ProjectDetail', query: { projectID: row.id } });
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
  moreActionRecord.value = record;
};

const handleDialogCancel = () => {
  moreActionDialogVisible.value = false;
};
const handleDialogConfirm = (type: string) => {
  console.log('handleDialogConfirm');
  console.log(type);
  console.log(moreActionRecord.value);
  let request = null;
  if (type === 'pause') {
    request = pauseProject;
  } else if (type === 'resume') {
    request = resumeProject;
  } else if (type === 'terminate') {
    request = terminateProject;
  }
  if (!request) return;
  request({ id: moreActionRecord.value.id })
    .then(() => {
      MessagePlugin.success('操作成功');
      tableHook.search();
    })
    .finally(() => {
      handleDialogCancel();
    });
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
