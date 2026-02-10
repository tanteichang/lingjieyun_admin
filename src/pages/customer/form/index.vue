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
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { createCustomer, updateCustomer } from '@/api/customer';
import type { CreateCustomerPayload } from '@/api/model/customer';
import { useCustomerStore } from '@/store/modules/customer';

import { INITIAL_DATA } from './constants';

defineOptions({
  name: 'CustomerForm',
});

const route = useRoute();
const router = useRouter();

const isEdit = ref(Boolean(route.query.id));

import GenericForm from '@/components/generic-form/index.vue';

// 表单数据
const formData = ref<CreateCustomerPayload>({
  name: '',
  full_name: '',
  contact_person: '',
  contact_phone: '',
  address: '',
  credit_code: '',
  manager_id: null,
});

const loading = ref(false);

console.log('isEdit', isEdit.value);

onMounted(() => {
  console.log('isEdit', isEdit.value);
  if (isEdit.value) {
    const data = useCustomerStore().getCustomer(route.query.id as string);
    formData.value = { ...data };
  }
});

// 表单提交处理
const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    loading.value = true;

    const Promise = isEdit.value ? updateCustomer : createCustomer;
    const payload = isEdit.value ? { id: Number(route.query.id), ...formData.value } : formData.value;

    Promise(payload)
      .then(() => {
        MessagePlugin.success(isEdit.value ? '更新客户成功' : '创建客户成功');
        onReset();
      })
      .catch((err) => {
        console.error(isEdit.value ? '更新客户失败' : '创建客户失败', err);
        MessagePlugin.error(err);
      })
      .finally(() => {
        loading.value = false;
      });
  }
};

const onReset = () => {
  router.back();
};

// 表单分组配置
const formGroups = ref([
  {
    title: '',
    items: [
      {
        name: 'name',
        label: '企业简称',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入企业简称' }],
        props: {
          placeholder: '请输入企业简称',
        },
      },
      {
        name: 'full_name',
        label: '企业全称',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入企业全称' }],
        props: {
          placeholder: '请输入企业全称',
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
        name: 'credit_code',
        label: '企业信用代码',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入企业信用代码' }],
        props: {
          placeholder: '请输入企业信用代码',
        },
      },
      {
        name: 'address',
        label: '企业地址',
        type: 'input',
        span: 12,
        rules: [{ required: true, message: '请输入企业地址' }],
        props: {
          placeholder: '请输入企业地址',
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
