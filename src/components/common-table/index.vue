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
                  v-bind="item.props"
                />
                <t-select
                  v-else-if="item.type === 'select'"
                  v-model="form[item.name]"
                  :placeholder="item.placeholder"
                  clearable
                  class="form-item-content"
                  v-bind="item.props"
                />
                <t-date-picker
                  v-else-if="item.type === 'date'"
                  v-model="form[item.name]"
                  type="date"
                  :placeholder="item.placeholder"
                  class="form-item-content"
                  v-bind="item.props"
                />
                <t-date-range-picker
                  v-else-if="item.type === 'date-range'"
                  v-model="form[item.name]"
                  type="daterange"
                  :placeholder="item.placeholder"
                  class="form-item-content"
                  v-bind="item.props"
                />
              </t-form-item>
            </t-col>
          </t-row>
        </t-col>
        <t-col :span="2">
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
        @page-change="(pageInfo) => $emit('page-change', pageInfo)"
      >
        <template v-for="slot in columnSlots" :key="slot.colKey" #[slot.colKey]="{ row }">
          <slot :name="slot.colKey" :record="row" />
        </template>
      </t-table>
    </div>
  </div>
</template>
<script
  setup
  lang="ts"
  generic="
    RowType extends Record<string, any> = Record<string, any>,
    FormType extends Record<string, any> = Record<string, any>,
    NameType extends Extract<keyof FormType, string> = Extract<keyof FormType, string>
  "
>
import type { DropdownOption, PaginationProps } from 'tdesign-vue-next';
import { computed, onMounted, reactive, toRefs, useSlots, watch, withDefaults } from 'vue';

// export type RowKey<Row> = Extract<keyof Row, string>;
export type RowKey<Row> = keyof Row;

export interface FormConfig<T, K extends keyof T = keyof T> {
  /** 表单配置 */
  formItem: Array<{
    /** 表单项标签 */
    label: string;
    /** 表单项名称 */
    name: K;
    /** 表单项宽度 */
    span?: number;
    /** 表单项类型 */
    type: 'input' | 'select' | 'date' | 'date-range';
    /** 表单项占位符 */
    placeholder?: string;
    /** 传递给渲染组件的额外属性 */
    props?: Record<string, any>;
  }>;
  /** 表单数据 */
  formData: Partial<Pick<T, K>>;
}

export interface TableConfig<Row, FieldKey extends RowKey<Row>> {
  /** 表格配置 */
  tableItem: Array<{
    /** 表格项标签 */
    title: string;
    /** 表格项名称 */
    colKey: FieldKey;
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

const props = withDefaults(
  defineProps<{
    data?: RowType[];
    loading?: boolean;
    pagination?: PaginationProps;
    headerAffixedTop?: any;
    dropdownOptions?: DropdownOption[];
    formConfig: FormConfig<FormType, NameType>;
    tableConfig: TableConfig<RowType>;
    /** 是否在挂载时自动触发查询 */
    autoSearch?: boolean;
  }>(),
  {
    data: () => [],
    loading: false,
    pagination: () =>
      ({
        current: 1,
        pageSize: 20,
        total: 0,
        pageSizeOptions: [20, 50, 100],
        showJumper: false,
        showPageSize: true,
        totalContent: true,
      }) as PaginationProps,
    dropdownOptions: () => [],
    autoSearch: true,
  },
);

const emit = defineEmits(['search', 'reset', 'page-change', 'more', 'create']);

const createInitialForm = () =>
  JSON.parse(JSON.stringify(props.formConfig.formData || {})) as Partial<Pick<FormType, NameType>>;
const form = reactive<Partial<Pick<FormType, NameType>>>(createInitialForm());

watch(
  () => props.formConfig.formData,
  () => {
    Object.assign(form, createInitialForm());
  },
  { deep: true },
);

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
  emit('search', { ...form });
};

const handleReset = () => {
  Object.assign(form, createInitialForm());
  emit('reset', { ...form });
};

onMounted(() => {
  console.log(props.formConfig);
  if (props.autoSearch) {
    handleSubmit();
  }
});
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
</style>
