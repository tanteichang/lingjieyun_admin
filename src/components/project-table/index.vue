<template>
  <div class="list-common-table">
    <t-form
      :data="formData"
      layout="inline"
      :label-width="80"
      colon
      @submit.prevent="handleSubmit"
      @reset.prevent="handleReset"
    >
      <t-row>
        <t-col :span="10">
          <t-row :gutter="[24, 24]">
            <t-col :span="4">
              <t-form-item label="项目名称" name="name">
                <t-input
                  v-model="formData.name"
                  class="form-item-content"
                  type="search"
                  placeholder="请输入合同名称"
                  clearable
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="项目状态" name="status">
                <t-select
                  v-model="formData.status"
                  class="form-item-content"
                  :options="statusOptions"
                  placeholder="请输入合同状态"
                  clearable
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="项目类型" name="type">
                <t-select
                  v-model="formData.type"
                  class="form-item-content"
                  :options="typeOptions"
                  placeholder="请选择合同类型"
                  clearable
                />
              </t-form-item>
            </t-col>
            <t-col :span="4">
              <t-form-item label="所属企业" name="company">
                <t-input v-model="formData.company" class="form-item-content" placeholder="请输入合同编号" clearable />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>
        <t-col :span="2" class="operation-container">
          <t-space size="small">
            <t-button theme="primary" type="submit">查询</t-button>
            <t-button variant="base" theme="default" type="reset">重置</t-button>
          </t-space>
        </t-col>
      </t-row>
    </t-form>

    <div class="project-toolbar">
      <t-button theme="primary" @click="$emit('create')">发布项目</t-button>
    </div>

    <div class="table-container">
      <t-table
        :data="data"
        :columns="columns"
        :row-key="rowKey"
        vertical-align="middle"
        :hover="true"
        :loading="loading"
        :pagination="pagination"
        :header-affixed-top="headerAffixedTop"
        table-layout="fixed"
        @page-change="(pageInfo) => $emit('page-change', pageInfo)"
      >
        <template #status="{ row }">
          <t-tag
            v-if="statusTag[row.status]"
            :theme="statusTag[row.status].theme"
            :variant="statusTag[row.status].variant"
          >
            {{ statusTag[row.status].label }}
          </t-tag>
        </template>
        <template #op="{ row }">
          <t-space size="small">
            <t-link theme="primary" hover="color" @click="$emit('view', row)">详情</t-link>
            <t-dropdown :options="dropdownOptions" trigger="click" @click="(data) => $emit('more', data, row)">
              <t-button variant="text" size="medium"> 更多操作 </t-button>
            </t-dropdown>
          </t-space>
        </template>
        <template #index="{ rowIndex }">
          {{ (pagination.current - 1) * pagination.pageSize + rowIndex + 1 }}
        </template>
      </t-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { DropdownOption, PageInfo, PaginationProps, PrimaryTableCol } from 'tdesign-vue-next';
import { reactive, toRefs } from 'vue';

import type { ProjectItem, ProjectStatus } from '@/api/model/projectModel';

interface SearchForm {
  name?: string;
  status?: ProjectStatus | '';
  type?: string;
  company?: string;
}

interface FormConfig {
  formItem: Array<{
    label: string;
    name: string;
    type: 'input' | 'select';
    options?: DropdownOption[];
  }>;
}


export interface ProjectRow extends ProjectItem {
  index: number;
}


const props = defineProps<{
  data: ProjectRow[];
  loading: boolean;
  pagination: PaginationProps;
  headerAffixedTop?: any;
  dropdownOptions: DropdownOption[];
}>();

const emit = defineEmits<{
  search: [SearchForm];
  reset: [];
  'page-change': [PageInfo];
  view: [ProjectRow];
  more: [DropdownOption, ProjectRow];
  create: [];
}>();

const { data, loading, pagination, headerAffixedTop, dropdownOptions } = toRefs(props);

const defaultForm: SearchForm = {
  name: '',
  status: '',
  type: '',
  company: '',
};

const formData = reactive<SearchForm>({ ...defaultForm });

const typeOptions = [
  { label: '资讯服务费', value: '资讯服务费' },
  { label: '移动端项目', value: '移动端项目' },
  { label: '企业服务', value: '企业服务' },
];

const statusOptions = [
  { label: '进行中', value: 'processing' },
  { label: '已暂停', value: 'paused' },
  { label: '已完成', value: 'completed' },
  { label: '终止', value: 'terminated' },
];

const statusTag: Record<
  ProjectStatus,
  { label: string; theme: 'primary' | 'warning' | 'success' | 'danger'; variant?: 'light' | 'light-outline' }
> = {
  processing: { label: '进行中', theme: 'warning', variant: 'light' },
  paused: { label: '已暂停', theme: 'primary', variant: 'light-outline' },
  completed: { label: '已完成', theme: 'success', variant: 'light' },
  terminated: { label: '终止', theme: 'danger', variant: 'light' },
};

const columns: PrimaryTableCol<ProjectRow>[] = [
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
];

const rowKey = 'id';

const handleSubmit = () => {
  const payload = { ...formData } as SearchForm;
  Object.keys(payload).forEach((key) => {
    const k = key as keyof SearchForm;
    if (payload[k] === '') payload[k] = undefined;
  });
  emit('search', payload);
};

const handleReset = () => {
  Object.assign(formData, defaultForm);
  emit('reset');
};
</script>
<style lang="less" scoped>
.list-common-table {
  .table-container {
    margin-top: var(--td-comp-margin-xxl);
  }

  .project-toolbar {
    margin: var(--td-comp-margin-xxl) 0 var(--td-comp-margin-l);
  }
}

.form-item-content {
  width: 100%;
}

.operation-container {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 4px;
}
</style>
