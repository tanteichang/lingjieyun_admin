<template>
  <generic-form title="发布项目" :form-data="formData" :form-groups="formGroups" @submit="onSubmit" @reset="onReset">
  </generic-form>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { getCustomerList } from '@/api/customer';
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
      project_type_id: formData.value.project_type_id,
      required_personnel: formData.value.required_personnel,
    })
      .then(() => {
        MessagePlugin.success('发布成功');
        formData.value = { ...INITIAL_DATA };
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
        name: 'project_type_id',
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
        span: 6,
        rules: [{ required: true, message: '请选择项目时间范围' }],
        props: {
          format: 'YYYY-MM-DD',
        },
      },
      {
        name: 'required_personnel',
        label: '所需人员数量',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入必填人员数量' }],
        props: {
          type: 'number',
          placeholder: '请输入必填人员数量',
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
  Promise.all([getEnterpriseInfo(), getCustomerList()])
    .then(([enterpriseRes, customerRes]) => {
      enterpriseList.value = [
        { id: 'self', name: enterpriseRes.data?.enterprise.name },
        ...customerRes.data.map((item) => ({ id: item.id, name: item.full_name })),
      ];
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
