import type { TdOptionProps } from 'tdesign-vue-next';

export type RowKey<Row> = keyof Row;

export interface SelectLeafOption extends TdOptionProps {
  [key: string]: any;
}

export interface FormConfig<T, K extends keyof T = keyof T> {
  /** 表单配置 */
  formItem: Array<{
    /** 表单项标签 */
    label: string;
    /** 表单项名称 */
    name: K;
    /** 表单项宽度 */
    span?: number;
    offset?: number;
    /** 表单项类型 */
    type: 'input' | 'select' | 'treeSelect' | 'date' | 'date-range';
    /** 表单项占位符 */
    placeholder?: string;
    /** 传递给渲染组件的额外属性 */
    props?: Record<string, any>;
    /** select 选项自定义渲染 */
    optionRender?: (
      option: SelectLeafOption,
      context: { index: number; item: FormConfig<T, K>['formItem'][number] },
    ) => any;
  }>;
  /** 表单数据 */
  formData: Partial<Pick<T, K>>;
}

export interface TableConfig<Row, FieldKey extends RowKey<Row> = RowKey<Row>> {
  /** 表格配置 */
  tableItem: Array<{
    /** 表格项标签 */
    title: string;
    /** 表格项名称 */
    colKey: FieldKey;
    /** 表格项类型（用于行选择等） */
    type?: 'single' | 'multiple';
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
