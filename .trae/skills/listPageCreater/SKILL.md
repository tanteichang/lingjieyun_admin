---
name: "listPageCreater"
description: "根据提供的配置生成完整的列表页，包含表格、搜索表单、分页等功能。使用common-table组件，支持标签页切换和状态管理。"
---

# List Page Creator

## 功能描述

该技能用于根据用户提供的配置信息自动生成完整的列表页代码，包括：

1. 页面模板结构（使用 t-card、t-tabs、common-table 等组件）
2. 搜索表单配置
3. 表格列配置
4. 数据加载和分页逻辑
5. 状态管理和事件处理
6. 样式定义

## 使用场景

当用户需要：
- 快速创建标准化的列表页面
- 确保页面结构和代码风格的一致性
- 减少重复的列表页开发工作

## 使用方法

1. 手动触发该技能
2. 提供以下信息：
   - 页面名称（如：TaskList）
   - 模块路径（如：project/taskList）
   - API 接口信息（获取列表数据的接口）
   - 表格列配置（字段名、标题、宽度等）
   - 搜索表单配置（字段名、类型、占位符等）
   - 状态标签配置（可选，用于标签页切换）

## 生成文件结构

生成的代码会按照以下结构组织：

- `src/pages/{module}/index.vue` - 列表页主文件

## 示例输入

```
页面名称: TaskList
模块路径: project/taskList
API 接口: /api/task/list
表格列配置:
- { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' }
- { title: '任务名称', colKey: 'name', minWidth: 180, ellipsis: true }
- { title: '任务类型', colKey: 'type', width: 140 }
- { title: '所属项目', colKey: 'project', minWidth: 200, ellipsis: true }
- { title: '任务状态', colKey: 'status', width: 110, align: 'center' }
- { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' }
搜索表单配置:
- { label: '任务名称', name: 'name', type: 'input', placeholder: '请输入任务名称', span: 6 }
- { label: '任务类型', name: 'type', type: 'select', placeholder: '请选择任务类型', span: 6 }
- { label: '任务状态', name: 'status', type: 'select', placeholder: '请选择任务状态', span: 6 }
- { label: '所属项目', name: 'project', type: 'input', placeholder: '请输入项目名称', span: 6 }
状态标签配置:
- { label: '全部', value: '' }
- { label: '未发布', value: 'draft' }
- { label: '进行中', value: 'processing' }
- { label: '已完成', value: 'completed' }
- { label: '已暂停', value: 'paused' }
- { label: '已终止', value: 'terminated' }
```

## 示例输出

### `src/pages/project/taskList/index.vue`

```vue
<template>
  <t-card :bordered="false" class="task-list-page">
    <t-tabs :value="currentStatus" @change="handleTabChange">
      <t-tab-panel
        v-for="tab in statusTabs"
        :key="tab.value"
        :value="tab.value"
        :label="`${tab.label} (${tabCounts[tab.value] ?? 0})`"
      />
    </t-tabs>
    <div style="height: 20px"></div>
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #status="{ record }">
        <t-tag :theme="statusTag[(record as TaskRow).status]?.theme" variant="light">
          {{ statusTag[(record as TaskRow).status]?.label || '-' }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleDetail(record as TaskRow)">详情</t-link>
          <t-link
            v-if="(record as TaskRow).status === 'processing'"
            theme="danger"
            hover="color"
            @click="handlePause(record as TaskRow)"
          >
            暂停
          </t-link>
          <t-link
            v-else-if="(record as TaskRow).status === 'paused'"
            theme="primary"
            hover="color"
            @click="handleResume(record as TaskRow)"
          >
            恢复
          </t-link>
          <t-link theme="danger" hover="color" @click="handleTerminate(record as TaskRow)">终止</t-link>
        </t-space>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import type { DropdownOption } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import type { Row } from '@/api/model/common';
import type { TaskItem, TaskQuery } from '@/api/model/taskModel';
import { getTaskList } from '@/api/task';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'TaskList',
});

const router = useRouter();

type TaskStatus = 'processing' | 'paused' | 'completed' | 'terminated' | 'draft';

type TaskRow = TaskItem & Row;

const statusTabs: Array<{ label: string; value: TaskStatus | '' }> = [
  { label: '全部', value: '' },
  { label: '未发布', value: 'draft' },
  { label: '进行中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
  { label: '已终止', value: 'terminated' },
];

const statusTag: Record<TaskStatus, { label: string; theme: DropdownOption['theme'] }> = {
  processing: { label: '进行中', theme: 'warning' },
  paused: { label: '已暂停', theme: 'primary' },
  completed: { label: '已完成', theme: 'success' },
  terminated: { label: '已终止', theme: 'danger' },
  draft: { label: '未发布', theme: 'primary' },
};

const taskTypeOptions = [
  { label: '软件开发', value: 'dev' },
  { label: '测试验证', value: 'qa' },
  { label: '设计/UI', value: 'design' },
];

const taskStatusOptions = statusTabs.slice(1);

const defaultQuery: TaskQuery = {
  page: 1,
  limit: 10,
};

const formConfig: FormConfig<TaskRow, keyof TaskRow> = {
  formItem: [
    { label: '任务名称', name: 'name', type: 'input', placeholder: '请输入任务名称', span: 6 },
    {
      label: '任务类型',
      name: 'type',
      type: 'select',
      placeholder: '请选择任务类型',
      options: taskTypeOptions,
      span: 6,
    },
    {
      label: '任务状态',
      name: 'status',
      type: 'select',
      placeholder: '请选择任务状态',
      options: taskStatusOptions,
      span: 6,
    },
    { label: '所属项目', name: 'project', type: 'input', placeholder: '请输入项目名称', span: 6 },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<TaskRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '任务编号', colKey: 'code', width: 120, align: 'center' },
    { title: '任务名称', colKey: 'name', minWidth: 180, ellipsis: true },
    { title: '任务类型', colKey: 'type', width: 140 },
    { title: '所属项目', colKey: 'project', minWidth: 200, ellipsis: true },
    { title: '招募方式', colKey: 'recruitType', width: 120 },
    { title: '任务时间', colKey: 'taskPeriod', width: 180 },
    { title: '任务状态', colKey: 'status', width: 110, align: 'center' },
    { title: '所需人员', colKey: 'requiredPeople', width: 100, align: 'center' },
    { title: '成员数量', colKey: 'memberCount', width: 100, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' },
  ],
};

const currentStatus = ref<string>('');
const tabCounts = reactive<Record<string, number>>({
  '': 0,
  draft: 0,
  processing: 0,
  completed: 0,
  paused: 0,
  terminated: 0,
});

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<TaskQuery, TaskRow>({
  fetcher: async (params) => {
    const { data } = await getTaskList(params);
    tabCounts[''] = data.total || 0;
    return { list: data.list, total: data.total, status_counts: data.status_counts || {} };
  },
  defaultQuery,
  debounceWait: 300,
});

const {
  data: tableData,
  loading,
  pagination,
  search: handleSearch,
  reset: handleReset,
  handlePageChange,
  query,
} = tableHook;

const handleTabChange = (value: string | number) => {
  currentStatus.value = String(value);
  query.status = currentStatus.value;
  pagination.current = 1;
  handleSearch();
};

const handleDetail = (row: TaskRow) => {
  MessagePlugin.info(`查看任务 ${row.name}`);
  router.push({ name: 'TaskDetail', query: { id: row.id } });
};
const handlePause = (row: TaskRow) => {
  MessagePlugin.warning(`暂停任务 ${row.name}`);
};
const handleResume = (row: TaskRow) => {
  MessagePlugin.success(`恢复任务 ${row.name}`);
};
const handleTerminate = (row: TaskRow) => {
  MessagePlugin.error(`终止任务 ${row.name}`);
};
</script>
<style lang="less" scoped>
.task-list-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>

## 生成的文件结构

```
src/pages/{module}/index.vue  # 列表页主文件
```

## 示例输入

```
页面名称: CustomerList
模块路径: customer/customerList
API 接口: /api/customer/list
表格列配置:
- { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' }
- { title: '客户编号', colKey: 'customer_no', width: 140, align: 'center' }
- { title: '客户名称', colKey: 'name', minWidth: 200, ellipsis: true }
- { title: '联系人', colKey: 'contact_person', width: 120 }
- { title: '联系电话', colKey: 'contact_phone', width: 140 }
- { title: '地址', colKey: 'address', minWidth: 240, ellipsis: true }
- { title: '状态', colKey: 'status', width: 100, align: 'center' }
- { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' }
搜索表单配置:
- { label: '客户名称', name: 'name', type: 'input', placeholder: '请输入客户名称', span: 6 }
- { label: '联系人', name: 'contact_person', type: 'input', placeholder: '请输入联系人', span: 6 }
- { label: '联系电话', name: 'contact_phone', type: 'input', placeholder: '请输入联系电话', span: 6 }
- { label: '状态', name: 'status', type: 'select', placeholder: '请选择状态', span: 6 }
状态标签配置:
- { label: '全部', value: '' }
- { label: '正常', value: 'active' }
- { label: '禁用', value: 'inactive' }
```

## 示例输出

### `src/pages/customer/customerList/index.vue`

```vue
<template>
  <t-card :bordered="false" class="customer-list-page">
    <t-tabs :value="currentStatus" @change="handleTabChange">
      <t-tab-panel
        v-for="tab in statusTabs"
        :key="tab.value"
        :value="tab.value"
        :label="`${tab.label} (${tabCounts[tab.value] ?? 0})`"
      />
    </t-tabs>
    <div style="height: 20px"></div>
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #status="{ record }">
        <t-tag :theme="statusTag[(record as CustomerRow).status]?.theme" variant="light">
          {{ statusTag[(record as CustomerRow).status]?.label || '-' }}
        </t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleDetail(record as CustomerRow)">详情</t-link>
          <t-link theme="danger" hover="color" @click="handleDelete(record as CustomerRow)">删除</t-link>
        </t-space>
      </template>
    </common-table>
  </t-card>
</template>
<script setup lang="ts">
import type { DropdownOption } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import type { Row } from '@/api/model/common';
import type { Customer, CustomerQuery } from '@/api/model/customer';
import { getCustomerList } from '@/api/customer';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

defineOptions({
  name: 'CustomerList',
});

const router = useRouter();

type CustomerStatus = 'active' | 'inactive';

type CustomerRow = Customer & Row;

const statusTabs: Array<{ label: string; value: CustomerStatus | '' }> = [
  { label: '全部', value: '' },
  { label: '正常', value: 'active' },
  { label: '禁用', value: 'inactive' },
];

const statusTag: Record<CustomerStatus, { label: string; theme: DropdownOption['theme'] }> = {
  active: { label: '正常', theme: 'success' },
  inactive: { label: '禁用', theme: 'danger' },
};

const customerStatusOptions = statusTabs.slice(1);

const defaultQuery: CustomerQuery = {
  page: 1,
  limit: 10,
};

const formConfig: FormConfig<CustomerRow, keyof CustomerRow> = {
  formItem: [
    { label: '客户名称', name: 'name', type: 'input', placeholder: '请输入客户名称', span: 6 },
    { label: '联系人', name: 'contact_person', type: 'input', placeholder: '请输入联系人', span: 6 },
    { label: '联系电话', name: 'contact_phone', type: 'input', placeholder: '请输入联系电话', span: 6 },
    { 
      label: '状态', 
      name: 'status', 
      type: 'select', 
      placeholder: '请选择状态', 
      options: customerStatusOptions,
      span: 6 
    },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<CustomerRow> = {
  tableItem: [
    { title: '#', colKey: 'index', width: 70, align: 'center', fixed: 'left' },
    { title: '客户编号', colKey: 'customer_no', width: 140, align: 'center' },
    { title: '客户名称', colKey: 'name', minWidth: 200, ellipsis: true },
    { title: '联系人', colKey: 'contact_person', width: 120 },
    { title: '联系电话', colKey: 'contact_phone', width: 140 },
    { title: '地址', colKey: 'address', minWidth: 240, ellipsis: true },
    { title: '状态', colKey: 'status', width: 100, align: 'center' },
    { title: '操作', colKey: 'op', width: 180, align: 'center', fixed: 'right' },
  ],
};

const currentStatus = ref<string>('');
const tabCounts = reactive<Record<string, number>>({
  '': 0,
  active: 0,
  inactive: 0,
});

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<CustomerQuery, CustomerRow>({
  fetcher: async (params) => {
    const { data } = await getCustomerList(params);
    tabCounts[''] = data.total || 0;
    return { list: data.list, total: data.total, status_counts: data.status_counts || {} };
  },
  defaultQuery,
  debounceWait: 300,
});

const {
  data: tableData,
  loading,
  pagination,
  search: handleSearch,
  reset: handleReset,
  handlePageChange,
  query,
} = tableHook;

const handleTabChange = (value: string | number) => {
  currentStatus.value = String(value);
  query.status = currentStatus.value;
  pagination.current = 1;
  handleSearch();
};

const handleDetail = (row: CustomerRow) => {
  MessagePlugin.info(`查看客户 ${row.name}`);
  router.push({ name: 'CustomerDetail', query: { id: row.id } });
};

const handleDelete = (row: CustomerRow) => {
  MessagePlugin.warning(`删除客户 ${row.name}`);
};
</script>
<style lang="less" scoped>
.customer-list-page {
  padding: var(--td-comp-paddingLR-xxl);

  :deep(.t-card__body) {
    padding: 0;
  }
}
</style>
```

## 注意事项

1. **API 接口**：需要确保提供的 API 接口符合标准格式，返回包含 `list`、`total` 等字段的数据结构
2. **数据模型**：需要提前创建对应的 TypeScript 接口定义，如 `Customer`、`CustomerQuery` 等
3. **组件依赖**：需要确保项目中已经安装并注册了 `tdesign-vue-next` 和 `common-table` 组件
4. **路由配置**：需要在路由文件中添加生成的列表页路由
5. **权限控制**：如果需要权限控制，可以在生成的代码中添加相应的权限判断逻辑

## 扩展功能

该技能支持以下扩展功能：

1. **自定义操作按钮**：可以在 `op` 插槽中添加自定义的操作按钮
2. **自定义列模板**：可以为特定列添加自定义的模板渲染逻辑
3. **状态标签定制**：可以根据业务需求定制不同状态的标签样式
4. **数据筛选**：支持通过标签页切换和搜索表单进行数据筛选
5. **分页配置**：支持自定义分页参数和分页大小

通过使用该技能，您可以快速创建标准化的列表页面，提高开发效率，确保代码风格的一致性。
