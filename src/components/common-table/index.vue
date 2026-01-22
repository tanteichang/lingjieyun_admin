<template>
  <div class="list-common-table">
    <t-form :data="form" layout="inline" :label-width="80" colon @submit="handleSubmit" @reset="handleReset">
      <t-row>
        <t-col :span="10">
          <t-row :gutter="[24, 24]">
            <t-col v-for="item in formConfig.formItem" :key="item.name" :span="item.span || 4">
              <t-form-item :label="item.label" :name="item.name">
                <t-input
                  v-if="item.type === 'input'"
                  v-model="form[item.name]"
                  type="search"
                  :placeholder="item.placeholder"
                  class="form-item-content"
                />
                <t-select
                  v-else-if="item.type === 'select'"
                  v-model="form[item.name]"
                  :placeholder="item.placeholder"
                  :options="item.options"
                  clearable
                  class="form-item-content"
                />
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
      <slot name="toolbar"></slot>
    </div>

    <div class="table-container">
      <t-table
        :data="data"
        :columns="tableConfig.tableItem"
        :row-key="rowKey"
        vertical-align="middle"
        :hover="true"
        :loading="loading"
        :pagination="pagination"
        :header-affixed-top="headerAffixedTop"
        table-layout="fixed"
        @page-change="(pageInfo) => $emit('page-change', pageInfo)">
        <template v-for="slot in columnSlots" :key="slot.colKey" #[slot.colKey]="{ row }">
          <slot :name="slot.colKey" :record="row" />
        </template>
      </t-table>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { DropdownOption, PaginationProps } from 'tdesign-vue-next';
import { computed, reactive, toRefs, useSlots } from 'vue';

import type { ProjectItem } from '@/api/model/projectModel';

export interface FormConfig<NameType extends string> {
  /** 表单配置 */
  formItem: Array<{
    /** 表单项标签 */
    label: string;
    /** 表单项名称 */
    name: NameType;
    /** 表单项宽度 */
    span?: number;
    /** 表单项类型 */
    type: 'input' | 'select';
    /** 表单项占位符 */
    placeholder?: string;
    /** select 表单项选项 */
    options?: DropdownOption[];
  }>;
  /** 表单数据 */
  formData: Partial<Record<NameType, string | number>>;
}

export interface TableConfig {
  /** 表格配置 */
  tableItem: Array<{
    /** 表格项标签 */
    title: string;
    /** 表格项名称 */
    colKey: string;
    /** 表格项宽度 */
    width?: number;
    /** 表格项最小宽度 */
    minWidth?: number;
    /** 表格项是否超出部分省略号显示 */
    ellipsis?: boolean;
    /** 表格项对齐方式 */
    align?: 'left' | 'center' | 'right';
    /** 表格项是否固定在左侧 */
    fixed?: 'left' | 'right';
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
  formConfig: FormConfig<string>;
  tableConfig: TableConfig;
}>();

const emit = defineEmits(['search', 'reset', 'page-change', 'more', 'create']);

const form = reactive(props.formConfig.formData);

const { data, loading, pagination, headerAffixedTop } = toRefs(props);

const slots = useSlots();
const curSlotName: string[] = ['toolbar'];
const columnSlots = computed(() => {
  if (slots) {
    return Object.keys(slots)
      .filter((key) => !curSlotName.includes(key))
      .map((t) => {
        return { colKey: t, slot: slots[t] };
      });
  } else {
    return [];
  }
});

const rowKey = 'id';

const handleSubmit = () => {
  console.log('form', form);
  emit('search', form);
};

const handleReset = () => {
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
