---
name: "formCreater"
description: "根据接口函数的payload类型自动生成完整的表单页，包含表单字段、验证规则、提交处理等功能。使用generic-form组件，支持表单分组和动态选项。"
---

# Form Creator

## 功能描述

该技能用于根据用户提供的配置信息自动生成完整的表单页代码，包括：

1. 页面模板结构（使用 generic-form 组件）
2. 表单数据定义和初始化
3. 表单分组和字段配置
4. 表单验证规则
5. 表单提交和重置处理
6. 动态选项加载和计算
7. 样式定义

## 使用场景

当用户需要：
- 快速创建标准化的表单页面
- 确保表单结构和代码风格的一致性
- 减少重复的表单页开发工作
- 实现复杂的表单逻辑，如动态选项、分组布局等

## 使用方法

1. 手动触发该技能
2. 提供以下信息：
   - 页面名称（如：ProjectPublish）
   - 模块路径（如：project/projectList）
   - 表单标题（如：发布项目）
   - API 接口信息（提交表单的接口，包含函数名和payload类型）
   - 表单分组配置（可选，用于复杂表单的分组显示）
   - 动态选项配置（可选，如下拉框选项的数据源）
   - 字段类型映射（可选，用于指定特定字段的表单类型）

## 生成文件结构

生成的代码会按照以下结构组织：

- `src/pages/{module}/{pageName}.vue` - 表单页主文件
- `src/pages/{module}/constants.ts` - 表单常量和初始数据（可选）

## 示例输入

```
页面名称: ProjectPublish
模块路径: project/projectList
表单标题: 发布项目
API 接口: { function: createProject, payload: ProjectCreatePayload }
动态选项配置:
- project_type: { type: 'select', options: 'projectTypeOptions' }
- customer_id: { type: 'select', options: 'enterpriseOptions' }
- invoice_type_id: { type: 'treeSelect', options: 'invoiceTypeOptions' }
字段类型映射:
- time_range: { type: 'dateRangePicker', span: 12, format: 'YYYY-MM-DD HH:mm:ss', enableTimePicker: true }
- desc: { type: 'textarea', span: 6, maxlength: 500 }
```

## 示例输出

### `src/pages/project/projectList/publish.vue`

```vue
<template>
  <generic-form title="发布项目" :form-data="formData" :form-groups="formGroups" @submit="onSubmit" @reset="onReset">
  </generic-form>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { getEnterpriseInfo } from '@/api/enterprise';
import type { ProjectCreatePayload } from '@/api/model/projectModel';
import { createProject } from '@/api/project';
import { useDictStore } from '@/store/modules/dict';

import { INITIAL_DATA } from './constants';

defineOptions({
  name: 'ProjectPublish',
});

import GenericForm from '@/components/generic-form/index.vue';

const dictStore = useDictStore();

type FormData = ProjectCreatePayload & {
  time_range: string[];
};

// 表单数据
const formData = ref<FormData>({
  ...INITIAL_DATA,
});

const enterpriseList = ref([]);

// 计算项目类型选项
const projectTypeOptions = computed(() => {
  return dictStore.getProjectTypeOptions;
});

// 计算开票类型选项（返回树结构）
const invoiceTypeOptions = computed(() => {
  return dictStore.getInvoiceTypeOptions;
});

const enterpriseOptions = computed(() => {
  return enterpriseList.value.map((item) => ({
    label: item.name,
    value: item.id,
  }));
});

// 表单提交处理
const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    createProject({
      name: formData.value.name,
      customer_id: formData.value.customer_id === 'self' ? null : formData.value.customer_id,
      desc: formData.value.desc,
      invoice_type_id: formData.value.invoice_type_id,
      start_time: formData.value.time_range[0],
      end_time: formData.value.time_range[1],
      project_type: formData.value.project_type,
    })
      .then((res) => {
        if (res.code === 200) {
          MessagePlugin.success('发布成功');
          formData.value = { ...INITIAL_DATA };
        } else {
          MessagePlugin.error(res.msg || '发布失败');
        }
      })
      .finally(() => {});
  }
};

const onReset = () => {
  formData.value = { ...INITIAL_DATA };
};

// 表单分组配置
const formGroups = computed(() => [
  {
    title: '',
    items: [
      {
        name: 'name',
        label: '项目名称',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入项目名称' }],
        props: {
          placeholder: '请输入项目名称',
        },
      },
      {
        name: 'project_type',
        label: '项目类型',
        type: 'select',
        span: 6,
        rules: [{ required: true, message: '请选择项目类型' }],
        props: {
          clearable: true,
          options: projectTypeOptions.value,
        },
      },
      {
        name: 'customer_id',
        label: '所属企业',
        type: 'select',
        span: 6,
        rules: [{ required: true, message: '请选择所属企业' }],
        props: {
          clearable: true,
          options: enterpriseOptions.value,
        },
      },
      {
        name: 'invoice_type_id',
        label: '开票类型',
        type: 'treeSelect',
        span: 6,
        rules: [{ required: true, message: '请选择开票类型' }],
        props: {
          clearable: true,
          data: invoiceTypeOptions.value,
        },
      },
      {
        name: 'time_range',
        label: '项目时间',
        type: 'dateRangePicker',
        span: 12,
        rules: [{ required: true, message: '请选择项目时间范围' }],
        props: {
          format: 'YYYY-MM-DD HH:mm:ss',
          enableTimePicker: true,
        },
      },
      {
        name: 'desc',
        label: '项目描述',
        type: 'textarea',
        span: 6,
        rules: [{ required: true, message: '请输入项目描述' }],
        props: {
          placeholder: '请输入项目描述',
          maxlength: 500,
        },
      },
    ],
  },
]);

onMounted(() => {
  // 并行获取项目类型和开票类型
  Promise.all([getEnterpriseInfo()])
    .then(([enterpriseRes]) => {
      enterpriseList.value = [{ id: 'self', name: enterpriseRes.data?.enterprise.name }];
    })
    .catch((error) => {
      console.error('获取数据失败:', error);
      MessagePlugin.error('获取数据失败，请稍后重试');
    });
});
</script>
<style lang="less" scoped>
// 通用表单组件已经包含了基本样式，这里可以添加项目特定的样式
.form-group {
  margin-bottom: var(--td-comp-margin-xxl);

  .form-group-title {
    font: var(--td-font-title-medium);
    font-weight: 400;
    color: var(--td-text-color-primary);
    margin: var(--td-comp-margin-xl) 0 var(--td-comp-margin-lg) 0;
  }
}
</style>

## 生成的文件结构

```
src/pages/{module}/{pageName}.vue  # 表单页主文件
src/pages/{module}/constants.ts    # 表单常量和初始数据（可选）
```

## 示例输入

```
页面名称: CustomerCreate
模块路径: customer
表单标题: 创建客户
API 接口: { function: createCustomer, payload: CreateCustomerPayload }
字段类型映射:
- address: { type: 'input', span: 12 }
- remark: { type: 'textarea', span: 12, maxlength: 200 }
```

## 示例输出

### `src/pages/customer/customerCreate.vue`

```vue
<template>
  <generic-form title="创建客户" :form-data="formData" :form-groups="formGroups" @submit="onSubmit" @reset="onReset">
  </generic-form>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

import type { CreateCustomerPayload } from '@/api/model/customer';
import { createCustomer } from '@/api/customer';

import { INITIAL_DATA } from './constants';

defineOptions({
  name: 'CustomerCreate',
});

import GenericForm from '@/components/generic-form/index.vue';

const router = useRouter();

// 表单数据
const formData = ref<CreateCustomerPayload>({
  ...INITIAL_DATA,
});

// 表单提交处理
const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    createCustomer(formData.value)
      .then((res) => {
        if (res.code === 200) {
          MessagePlugin.success('创建客户成功');
          formData.value = { ...INITIAL_DATA };
          // 可以选择跳转到列表页
          // router.push({ name: 'CustomerList' });
        } else {
          MessagePlugin.error(res.msg || '创建客户失败');
        }
      })
      .finally(() => {});
  }
};

const onReset = () => {
  formData.value = { ...INITIAL_DATA };
};

// 表单分组配置
const formGroups = ref([
  {
    title: '',
    items: [
      {
        name: 'name',
        label: '客户名称',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入客户名称' }],
        props: {
          placeholder: '请输入客户名称',
        },
      },
      {
        name: 'full_name',
        label: '客户全称',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入客户全称' }],
        props: {
          placeholder: '请输入客户全称',
        },
      },
      {
        name: 'contact_person',
        label: '联系人',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入联系人' }],
        props: {
          placeholder: '请输入联系人',
        },
      },
      {
        name: 'contact_mobile',
        label: '联系电话',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入联系电话' }],
        props: {
          placeholder: '请输入联系电话',
        },
      },
      {
        name: 'address',
        label: '客户地址',
        type: 'input',
        span: 12,
        rules: [{ required: true, message: '请输入客户地址' }],
        props: {
          placeholder: '请输入客户地址',
        },
      },
      {
        name: 'remark',
        label: '备注',
        type: 'textarea',
        span: 12,
        props: {
          placeholder: '请输入备注',
          maxlength: 200,
        },
      },
    ],
  },
]);
</script>
<style lang="less" scoped>
// 通用表单组件已经包含了基本样式，这里可以添加项目特定的样式
.form-group {
  margin-bottom: var(--td-comp-margin-xxl);

  .form-group-title {
    font: var(--td-font-title-medium);
    font-weight: 400;
    color: var(--td-text-color-primary);
    margin: var(--td-comp-margin-xl) 0 var(--td-comp-margin-lg) 0;
  }
}
</style>

## 示例常量文件

### `src/pages/customer/constants.ts`

```typescript
import type { CreateCustomerPayload } from '@/api/model/customer';

export const INITIAL_DATA: CreateCustomerPayload = {
  name: '',
  full_name: '',
  contact_person: '',
  contact_mobile: '',
  address: '',
  remark: '',
};
```

## 注意事项

1. **API 接口**：需要确保提供的 API 函数已经存在，并且对应的 payload 类型已经定义
2. **数据模型**：需要提前创建对应的 TypeScript 接口定义，如 `CreateCustomerPayload` 等
3. **组件依赖**：需要确保项目中已经安装并注册了 `tdesign-vue-next` 和 `generic-form` 组件
4. **路由配置**：需要在路由文件中添加生成的表单页路由
5. **权限控制**：如果需要权限控制，可以在生成的代码中添加相应的权限判断逻辑
6. **初始数据**：建议创建对应的 `constants.ts` 文件来管理表单的初始数据
7. **字段映射**：对于特殊字段类型（如日期范围、文本域等），需要在字段类型映射中明确指定

## 扩展功能

该技能支持以下扩展功能：

1. **自动字段生成**：根据 payload 类型自动生成表单字段，包括标签、类型、验证规则等
2. **表单分组**：支持将表单字段分组显示，提高复杂表单的可读性
3. **动态选项**：支持通过计算属性或 API 请求获取动态选项数据
4. **自定义验证**：支持添加自定义的表单验证规则
5. **表单联动**：支持实现表单字段之间的联动逻辑
6. **文件上传**：支持添加文件上传字段
7. **富文本编辑器**：支持添加富文本编辑字段
8. **日期时间选择**：支持添加日期、时间、日期范围等选择器
9. **复杂数据结构**：支持处理嵌套对象、数组等复杂数据结构
10. **智能类型推断**：根据 payload 字段类型自动推断合适的表单控件类型

通过使用该技能，您可以快速创建标准化的表单页面，提高开发效率，确保代码风格的一致性。

## 支持的表单字段类型

该技能支持以下常见的表单字段类型：

| 类型 | 描述 | 适用场景 |
|------|------|----------|
| input | 文本输入框 | 单行文本输入，如名称、电话等 |
| textarea | 文本域 | 多行文本输入，如备注、描述等 |
| select | 下拉选择器 | 从固定选项中选择，如类型、状态等 |
| treeSelect | 树形选择器 | 从树形结构中选择，如分类、部门等 |
| datePicker | 日期选择器 | 选择单个日期 |
| dateRangePicker | 日期范围选择器 | 选择开始和结束日期 |
| timePicker | 时间选择器 | 选择具体时间 |
| switch | 开关 | 二进制选择，如启用/禁用 |
| radio | 单选框 | 从多个选项中选择一个 |
| checkbox | 复选框 | 从多个选项中选择多个 |
| upload | 文件上传 | 上传图片、文档等文件 |
| cascader | 级联选择器 | 联动选择，如省市区选择 |

## 表单配置选项

每个表单字段支持以下配置选项：

| 选项 | 类型 | 描述 | 是否必填 |
|------|------|------|----------|
| name | string | 字段名，对应表单数据的属性名 | 是 |
| label | string | 字段标签，显示在表单中的标题 | 是 |
| type | string | 字段类型，如 input、select 等 | 是 |
| span | number | 字段占用的网格列数，基于 24 格网格系统 | 是 |
| required | boolean | 是否必填字段 | 否 |
| placeholder | string | 输入框占位符 | 否 |
| rules | array | 验证规则数组 | 否 |
| props | object | 传递给底层组件的属性 | 否 |
| options | array/string | 选择器的选项数据，或计算属性名称 | 否 |
| defaultValue | any | 字段默认值 | 否 |

通过灵活配置这些选项，您可以创建各种复杂的表单页面，满足不同的业务需求。