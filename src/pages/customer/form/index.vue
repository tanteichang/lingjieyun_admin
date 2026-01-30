<template>
  <generic-form
    :title="isEdit ? '编辑企业' : '新增企业'"
    :form-data="formData"
    :form-groups="formGroups"
    @submit="onSubmit"
    @reset="onReset"
  >
  </generic-form>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { ref } from 'vue';
import { useRoute } from 'vue-router';

import { createCustomer } from '@/api/customer';
import type { CreateCustomerPayload } from '@/api/model/customer';
import { useCustomerStore } from '@/store/modules/customer';

import { INITIAL_DATA } from './constants';

const route = useRoute();

const isEdit = ref(Boolean(route.query.id));

defineOptions({
  name: 'CustomerCreate',
});

import GenericForm from '@/components/generic-form/index.vue';

const data = useCustomerStore().getCustomer(route.query.id as string);
const initData: CreateCustomerPayload = {
  name: data?.name || '',
  full_name: data?.full_name || '',
  contact_person: data?.contact_person || '',
  contact_phone: data?.contact_phone || '',
  address: data?.address || '',
  remark: data?.remark || '',
};

// 表单数据
const formData = ref<CreateCustomerPayload>({
  ...INITIAL_DATA,
});

const loading = ref(false);

// 表单提交处理
const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    loading.value = true;
    createCustomer(formData.value)
      .then((res) => {
        console.log('创建客户成功', res);
        MessagePlugin.success('创建客户成功');
        onReset();
      })
      .catch((err) => {
        console.error('创建客户失败', err);
        MessagePlugin.error(err);
      })
      .finally(() => {
        loading.value = false;
      });
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
        name: 'contact_phone',
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
