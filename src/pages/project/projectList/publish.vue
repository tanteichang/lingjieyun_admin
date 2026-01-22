<template>
  <generic-form title="发布项目" :form-data="formData" :form-groups="formGroups" @submit="onSubmit" @reset="onReset">
  </generic-form>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'ProjectPublish',
});

const router = useRouter();

import GenericForm from '@/components/generic-form/index.vue';

import { COMPANY_OPTIONS, INITIAL_DATA, TYPE_OPTIONS } from './constants';

// 表单数据
const formData = ref({ ...INITIAL_DATA });

// 表单重置处理
const onReset = () => {
  MessagePlugin.warning('取消新建');
  router.back();
};

// 表单提交处理
const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    MessagePlugin.success('新建成功');
    console.log('表单数据:', formData.value);
  }
};

// 表单分组配置（用于通用表单组件的自动生成功能）
const formGroups = [
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
        name: 'type',
        label: '项目类型',
        type: 'select',
        span: 6,
        props: {
          clearable: true,
          options: TYPE_OPTIONS,
        },
      },
      {
        name: 'company',
        label: '所属企业',
        type: 'select',
        span: 6,
        props: {
          clearable: true,
          options: COMPANY_OPTIONS,
        },
      },
      {
        name: 'desc',
        label: '项目描述',
        type: 'textarea',
        span: 6,
        props: {
          placeholder: '请输入项目描述',
        },
      },
    ],
  },
];
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
