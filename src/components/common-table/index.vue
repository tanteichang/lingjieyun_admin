<template>
  <div class="list-common-table">
    <t-form :data="form" layout="inline" :label-width="80" colon @submit="handleSubmit" @reset="handleReset">
      <div class="form-container">
        <t-row :gutter="[16, 16]">
          <t-col v-for="item in formConfig.formItem" :key="item.name" :span="item.span || 5" :offset="item.offset || 0">
            <t-form-item :label="item.label" :name="item.name" class="full-form-item">
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
                :options="getSelectOptions(item)"
                clearable
                class="form-item-content"
                v-bind="getFormItemProps(item)"
              />
              <t-tree-select
                v-else-if="item.type === 'treeSelect'"
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
                :value="getRangeValue(item.name)"
                type="daterange"
                :placeholder="item.placeholder"
                class="form-item-content"
                v-bind="item.props"
                @change="(value) => handleRangeChange(item.name, value)"
              />
            </t-form-item>
          </t-col>
        </t-row>

        <t-space size="small" class="action-buttons">
          <t-button theme="primary" type="submit">{{
            props.formConfig.formItem.length > 0 ? '查询' : '刷新'
          }}</t-button>
          <t-button v-if="props.formConfig.formItem.length" variant="base" theme="default" type="reset">重置</t-button>
        </t-space>
      </div>
    </t-form>

    <div class="project-toolbar">
      <slot name="toolbar"></slot>
    </div>

    <div class="table-container">
      <t-table
        :data="data"
        :columns="columnsWithIndex"
        :row-key="rowKey"
        :row-class-name="rowClassName"
        vertical-align="middle"
        :hover="true"
        :expand-icon="false"
        :loading="loading"
        :pagination="pagination"
        :header-affixed-top="headerAffixedTop"
        :selected-row-keys="innerSelectedRowKeys"
        :expanded-row-keys="innerExpandedRowKeys"
        :expand-on-row-click="expandOnRowClick"
        table-layout="fixed"
        @select-change="handleSelectChange"
        @expand-change="handleExpandChange"
        @page-change="(pageInfo) => $emit('page-change', pageInfo)"
      >
        <template v-for="slot in columnSlots" :key="slot.colKey" #[slot.colKey]="{ row }">
          <slot :name="slot.colKey" :record="row" />
        </template>
        <template v-if="$slots.expandedRow" #expandedRow="{ row }">
          <slot name="expandedRow" :record="row" />
        </template>
      </t-table>
    </div>
  </div>
</template>
<script lang="ts">
export type { FormConfig, RowKey, TableConfig } from './types';
</script>
<script
  setup
  lang="ts"
  generic="
    RowType extends Record<string, any> = Record<string, any>,
    FormType extends Record<string, any> = Record<string, any>,
    NameType extends Extract<keyof FormType, string> = Extract<keyof FormType, string>
  "
>
import type { DropdownOption, PaginationProps, SelectOption } from 'tdesign-vue-next';
import { computed, onMounted, reactive, ref, toRefs, watch, withDefaults } from 'vue';

import type { FormConfig, RowKey, SelectLeafOption, TableConfig } from './types';

type SelectionType = 'single' | 'multiple';
type FormItemConfig = FormConfig<FormType, NameType>['formItem'][number];
type RangeValue = string[];
interface RecordSlotProps {
  record: RowType;
}
interface SelectOptionSlotProps {
  option: SelectLeafOption;
  index: number;
  item: FormItemConfig;
}
type CommonTableSlots = {
  toolbar?: () => any;
  expandedRow?: (props: RecordSlotProps) => any;
} & {
  [K in Extract<keyof RowType, string>]?: (props: RecordSlotProps) => any;
} & {
  [K in `select-${NameType}-option`]?: (props: SelectOptionSlotProps) => any;
};

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
    /** 是否自动增加序号列（#__index） */
    autoAddIndex?: boolean;
    /** 表格选择类型：single | multiple */
    selectionType?: SelectionType;
    /** 行 key */
    rowKey?: RowKey<RowType> | ((row: RowType) => number);
    /** 选中的行 key */
    selectedRowKeys?: Array<string | number>;
    /** 展开的行 key */
    expandedRowKeys?: Array<string | number>;
    /** 点击整行展开 */
    expandOnRowClick?: boolean;
    /** 行 className */
    rowClassName?: string | ((params: { row: RowType; rowIndex: number }) => string);
    selectionDisabled?: (param: { row: RowType; rowIndex: number }) => boolean;
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
    autoAddIndex: true,
    rowKey: () => 'id',
    selectedRowKeys: () => [],
    expandedRowKeys: () => [],
    expandOnRowClick: false,
  },
);

const emit = defineEmits([
  'search',
  'reset',
  'page-change',
  'more',
  'create',
  'selection-change',
  'update:selectedRowKeys',
  'expand-change',
  'update:expandedRowKeys',
]);

const slots = defineSlots<CommonTableSlots>();
const runtimeSlots = slots as Record<string, ((props?: any) => any) | undefined>;

const createInitialForm = () =>
  JSON.parse(JSON.stringify(props.formConfig.formData || {})) as Partial<Pick<FormType, NameType>>;
const form = reactive<Partial<Pick<FormType, NameType>>>(createInitialForm());
const rangeValueMap = reactive<Record<string, RangeValue>>({});

const syncRangeValueMap = (source: Partial<Pick<FormType, NameType>>) => {
  props.formConfig.formItem.forEach((item) => {
    if (item.type !== 'date-range') return;
    const value = (source as Record<string, any>)[item.name];
    if (Array.isArray(value)) {
      rangeValueMap[String(item.name)] = [...value];
      return;
    }
    if (typeof value === 'string' && value) {
      const parsedValue = parseDateRangeString(value);
      rangeValueMap[String(item.name)] = Array.isArray(parsedValue) ? parsedValue : [];
      return;
    }
    rangeValueMap[String(item.name)] = [];
  });
};

syncRangeValueMap(form);

watch(
  () => props.formConfig.formData,
  () => {
    const initialForm = createInitialForm();
    Object.assign(form, initialForm);
    syncRangeValueMap(initialForm);
  },
  { deep: true },
);

const { data, loading, pagination, headerAffixedTop } = toRefs(props);
const getSelectOptionSlotName = (name: NameType) => `select-${String(name)}-option`;
const selectOptionSlotNames = computed(() =>
  props.formConfig.formItem.map((item) => getSelectOptionSlotName(item.name)),
);
const curSlotName = computed(() => ['toolbar', ...selectOptionSlotNames.value]);
const columnSlots = computed(() => {
  if (runtimeSlots) {
    return Object.keys(runtimeSlots)
      .filter((key) => !curSlotName.value.includes(key))
      .map((t) => {
        return { colKey: t, slot: runtimeSlots[t] };
      });
  } else {
    return [];
  }
});

const rowKey = computed(() => props.rowKey ?? 'id');
const expandOnRowClick = computed(() => props.expandOnRowClick ?? false);
const rowClassName = computed(() => props.rowClassName);

const getFormItemProps = (item: FormItemConfig) => {
  if (item.type !== 'select') return item.props;
  const { options: _options, ...restProps } = item.props || {};
  return restProps;
};

const mapSelectOptions = (options: SelectOption[], item: FormItemConfig): SelectOption[] => {
  const optionSlot = runtimeSlots[getSelectOptionSlotName(item.name)] as
    | ((props: SelectOptionSlotProps) => any)
    | undefined;

  return options.map((option, index) => {
    const currentOption = option as SelectLeafOption & {
      children?: SelectOption[];
      slots?: Record<string, () => any>;
    };

    if (Array.isArray(currentOption.children)) {
      return {
        ...currentOption,
        children: mapSelectOptions(currentOption.children, item),
      };
    }

    if (!item.optionRender && !optionSlot) {
      return currentOption;
    }

    return {
      ...currentOption,
      slots: {
        ...(currentOption.slots || {}),
        default: () => {
          if (item.optionRender) {
            return item.optionRender(currentOption, { index, item });
          }
          return optionSlot?.({ option: currentOption, index, item });
        },
      },
    };
  });
};

const getSelectOptions = (item: FormItemConfig) => {
  const options = item.props?.options as SelectOption[] | undefined;
  if (!Array.isArray(options)) return options;
  return mapSelectOptions(options, item);
};

const parseDateRangeString = (value: string) => {
  const match = value.match(/^\s*(\d{4}-\d{2}-\d{2})\s*-\s*(\d{4}-\d{2}-\d{2})\s*$/);
  if (!match) {
    return value;
  }
  return [match[1], match[2]];
};

const getRangeValue = (name: NameType) => {
  return rangeValueMap[String(name)] || [];
};

const handleRangeChange = (name: NameType, value: any) => {
  if (Array.isArray(value)) {
    rangeValueMap[String(name)] = [...value];
    const [start, end] = value;
    (form as Record<string, any>)[name] = start && end ? `${start} - ${end}` : '';
    return;
  }
  if (typeof value === 'string') {
    const parsedValue = parseDateRangeString(value);
    rangeValueMap[String(name)] = Array.isArray(parsedValue) ? parsedValue : [];
    (form as Record<string, any>)[name] = value;
    return;
  }
  rangeValueMap[String(name)] = [];
  (form as Record<string, any>)[name] = '';
};

const innerSelectedRowKeys = ref<Array<string | number>>([...props.selectedRowKeys]);
const innerExpandedRowKeys = ref<Array<string | number>>([...props.expandedRowKeys]);

watch(
  () => props.selectedRowKeys,
  (next) => {
    if (next) {
      innerSelectedRowKeys.value = [...next];
    }
  },
  { deep: true },
);

watch(
  () => props.expandedRowKeys,
  (next) => {
    if (next) {
      innerExpandedRowKeys.value = [...next];
    }
  },
  { deep: true },
);

const handleSelectChange = (
  selectedRowKeys: Array<number>,
  context: { selectedRowData?: RowType[]; currentRowKey?: string | number; type?: string },
) => {
  innerSelectedRowKeys.value = [...selectedRowKeys];
  emit('update:selectedRowKeys', [...selectedRowKeys]);
  emit('selection-change', {
    selectedRowKeys: [...selectedRowKeys],
    selectedRowData: context?.selectedRowData || [],
    currentRowKey: context?.currentRowKey,
    type: context?.type,
  });
};

const handleExpandChange = (
  expandedRowKeys: Array<string | number>,
  context: { expandedRowData?: RowType[]; currentRowData?: RowType },
) => {
  innerExpandedRowKeys.value = [...expandedRowKeys];
  emit('update:expandedRowKeys', [...expandedRowKeys]);
  emit('expand-change', {
    expandedRowKeys: [...expandedRowKeys],
    expandedRowData: context?.expandedRowData || [],
    currentRowData: context?.currentRowData,
  });
};

const columnsWithIndex = computed(() => {
  const baseColumns = props.tableConfig.tableItem || [];
  const hasRowSelect = baseColumns.some((col) => col.colKey === 'row-select');
  const hasIndex = baseColumns.some((col) => col.colKey === '__index');
  const pageSize = pagination.value?.pageSize || 20;
  const current = pagination.value?.current || 1;
  const indexColumn = {
    title: '#',
    colKey: '__index',
    width: 50,
    align: 'center',
    cell: (_h: any, { rowIndex }: { rowIndex: number }) => (current - 1) * pageSize + rowIndex + 1,
  };
  const prefixColumns: Array<Record<string, any>> = [];
  if (props.selectionType && !hasRowSelect) {
    prefixColumns.push({
      colKey: 'row-select',
      type: props.selectionType,
      disabled: props.selectionDisabled,
      width: 64,
      fixed: 'left',
    });
  }
  if (props.autoAddIndex && !hasIndex) {
    prefixColumns.push(indexColumn);
  }
  return [...prefixColumns, ...baseColumns];
});

const handleSubmit = () => {
  emit('search', { ...form });
};

const handleReset = () => {
  const initialForm = createInitialForm();
  Object.assign(form, initialForm);
  syncRangeValueMap(initialForm);
  emit('reset', { ...form });
};

onMounted(() => {
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
.form-container {
  display: flex;
  flex-direction: row;
  align-items: flex-end;
}
.action-buttons {
  margin-left: 12px;
}
:deep(.full-form-item) {
  width: 100%;
}
.form-item-content {
  width: 100%;
}
</style>
