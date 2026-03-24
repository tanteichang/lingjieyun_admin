<template>
  <t-card :bordered="false" class="project-list-card">
    <common-table
      :data="tableData"
      :loading="dataLoading"
      row-key="id"
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
      <template #select-project_status-option="{ option }">
        <t-tag :theme="PROJECT_STATUS_TAG[option.value as ProjectStatus].theme">
          {{ option.label }}
        </t-tag>
      </template>
      <template #projectTime="{ record }">
        <div class="project-time">
          <div><t-tag variant="light" theme="primary">始</t-tag>{{ (record as ProjectItem).start_time || '-' }}</div>
          <div><t-tag variant="light" theme="warning">止</t-tag>{{ (record as ProjectItem).end_time || '-' }}</div>
        </div>
      </template>
      <template #customer_name="{ record }">
        {{ (record as ProjectItem).customer_name || (record as ProjectItem).enterprise_name }}
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
                :options="getDropdownOption(record as ProjectItem)"
                trigger="click"
                @click="(dropdownItem) => handleMoreActionClick(dropdownItem, record)"
              >
                <t-button variant="text" size="medium" :disabled="getDropdownOption(record as ProjectItem).length === 0"
                  >更多操作</t-button
                >
              </t-dropdown>
            </t-col>
          </t-row>
        </t-space>
      </template>
      <template #toolbar>
        <t-button v-permission="'enterprisetask/publish'" theme="primary" @click="handleCreate">发布项目</t-button>
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
        <span> {{ moreActionRecord.name || '-' }}</span>
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

import { getProjectList, pauseProject, resumeProject, terminateProject } from '@/api/enterprise/project';
import type { Row } from '@/api/model/common';
import type { ProjectItem, ProjectQuery } from '@/api/model/enterprise/projectModel';
import { PROJECT_STATUS_TAG, ProjectStatus } from '@/api/model/enterprise/projectModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { useDictStore } from '@/store/modules/enterprise/dict';
import { useProjectStore } from '@/store/modules/enterprise/project';

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
let moreActionRecord: ProjectRow = {} as ProjectRow;

const projectTypeOptions = computed(() => dictStore.getProjectTypeOptions);

const dropdownOptions: DropdownOption[] = [
  { content: '发布任务', value: 'publish' },
  { content: '暂停项目', value: 'pause' },
  { content: '恢复项目', value: 'resume' },
  { content: '终止项目', value: 'terminate' },
];

const projectStatusOptions = [
  { label: '未开始', value: ProjectStatus.NotStarted },
  { label: '进行中', value: ProjectStatus.InProgress },
  { label: '已暂停', value: ProjectStatus.Paused },
  { label: '已完成', value: ProjectStatus.Completed },
  { label: '已终止', value: ProjectStatus.Terminated },
];

/**
 * 1-待开始 发布任务 暂停项目 终止项目
 * 2-进行中 发布任务 暂停项目 终止项目
 * 3-已暂停 恢复项目 终止项目
 * 4-已终止
 * 5-已完成
 */
const getDropdownOption = (record: ProjectRow) => {
  switch (record.project_status) {
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

const handlePublishTask = (record: ProjectRow) => {
  router.push({ name: 'ProjectPublishTask', query: { projectID: record.id } });
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
        options: projectStatusOptions,
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
        options: dictStore.getCustomerTypeOptions,
      },
    },
  ],
  formData: defaultQuery,
}));
const tableConfig: TableConfig<ProjectRow, keyof ProjectRow> = {
  tableItem: [
    { title: '项目编号', colKey: 'pro_no', width: 160 },
    { title: '项目名称', colKey: 'name', minWidth: 240, ellipsis: true, fixed: 'left' },
    { title: '发票类型', colKey: 'invoice_type_name', width: 140, ellipsis: true },
    { title: '所属企业', colKey: 'customer_name', minWidth: 220, ellipsis: true },
    { title: '项目时间', colKey: 'projectTime', width: 220 },
    { title: '任务数量', colKey: 'task_count', width: 120, align: 'center' },
    { title: '项目状态', colKey: 'project_status', width: 120 },
    { title: '所需人员', colKey: 'required_personnel', width: 120, align: 'center' },
    { title: '成员数量', colKey: 'task_count', width: 120, align: 'center' },
    { title: '操作', colKey: 'op', width: 150, fixed: 'right' },
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

const handleMoreActionClick = (dropdownItem: DropdownOption, record: ProjectRow) => {
  moreActionRecord = record;
  if (dropdownItem.value === 'publish') {
    handlePublishTask(record);
  } else {
    moreActionClick(dropdownItem.value as string);
  }
};

const handleDialogCancel = () => {
  moreActionDialogVisible.value = false;
};
const handleDialogConfirm = (type: string) => {
  let request = null;
  if (type === 'pause') {
    request = pauseProject;
  } else if (type === 'resume') {
    request = resumeProject;
  } else if (type === 'terminate') {
    request = terminateProject;
  }
  if (!request) return;
  request({ id: moreActionRecord.id })
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

.project-time {
  display: flex;
  flex-direction: column;
}

.text-warning {
  font-weight: bold;
}
</style>
