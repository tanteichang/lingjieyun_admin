<template>
  <t-card :bordered="false" class="project-list-card">
    <project-table
      :data="tableData"
      :loading="dataLoading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :dropdown-options="dropdownOptions"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
      @view="handleView"
      @more="handleMoreAction"
      @create="handleCreate"
    />
  </t-card>
</template>
<script setup lang="ts">
import type { DropdownOption, PageInfo, PaginationProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref } from 'vue';

import type { ProjectQuery, ProjectStatus } from '@/api/model/projectModel';
import { getProjectList } from '@/api/project';
import ProjectTable, { type ProjectRow } from '@/components/project-table/index.vue';
import { prefix } from '@/config/global';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'ProjectList',
});

const store = useSettingStore();

const query = reactive<ProjectQuery>({
  name: '',
  type: '',
  status: '',
  company: '',
});

const tableData = ref<ProjectRow[]>([]);
const dataLoading = ref(false);
const pagination = reactive<PaginationProps>({
  current: 1,
  pageSize: 20,
  total: 0,
  pageSizeOptions: [20, 50, 100],
  showJumper: false,
  showPageSize: true,
  totalContent: true,
});

const dropdownOptions: DropdownOption[] = [
  { content: '发布任务', value: 'publish' },
  { content: '暂停项目', value: 'pause' },
  { content: '终止项目', value: 'terminate' },
];

const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const fetchData = async () => {
  dataLoading.value = true;
  try {
    const { list, total } = await getProjectList({
      ...query,
      page: pagination.current,
      pageSize: pagination.pageSize,
    });
    const start = ((pagination.current || 1) - 1) * (pagination.pageSize || 20);
    tableData.value = list.map((item, idx) => ({
      ...item,
      index: start + idx + 1,
    }));
    pagination.total = total;
  } catch (error) {
    console.error('获取项目列表失败', error);
  } finally {
    dataLoading.value = false;
  }
};

const handleSearch = (payload: Partial<ProjectQuery>) => {
  query.name = payload.name || '';
  query.type = payload.type || '';
  query.status = (payload.status as ProjectStatus) || '';
  query.company = payload.company || '';
  pagination.current = 1;
  fetchData();
};

const handleReset = () => {
  query.name = '';
  query.type = '';
  query.status = '' as ProjectStatus;
  query.company = '';
  pagination.current = 1;
  fetchData();
};

const handlePageChange = (pageInfo: PageInfo) => {
  pagination.current = pageInfo.current;
  pagination.pageSize = pageInfo.pageSize;
  fetchData();
};

const handleView = (row: ProjectRow) => {
  MessagePlugin.info(`查看项目：${row.name}`);
};

const handleMoreAction = (action: DropdownOption, row: ProjectRow) => {
  if (!action?.value) return;
  const actionText = typeof action.content === 'string' ? action.content : '';
  MessagePlugin.success(`${actionText} - ${row.name}`);
};

const handleCreate = () => {
  MessagePlugin.success('发布项目');
};

onMounted(() => {
  fetchData();
});
</script>
<style lang="less" scoped>
.project-list-card {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
