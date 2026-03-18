<template>
  <div class="publish-project-shell">
    <t-card class="publish-project-page" :bordered="false">
      <generic-form
        v-if="!publishSuccess"
        :key="`project-publish-${formResetVersion}`"
        title="发布项目"
        :form-data="formData"
        :form-groups="formGroups"
        @submit="onSubmit"
        @reset="onReset"
      />

      <div v-else class="finish-wrapper">
        <t-alert theme="success" title="项目发布完成" message="你可以继续创建新项目，或返回项目列表查看已发布项目。" />
        <div class="finish-actions">
          <t-button theme="primary" @click="handleCreateAnother">继续发布</t-button>
          <t-button variant="outline" @click="handleBackToList">返回项目列表</t-button>
        </div>
      </div>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getCustomerList } from '@/api/enterprise/customer';
import { getEnterpriseInfo } from '@/api/enterprise/enterprise';
import { createProject } from '@/api/enterprise/project';
import type { ProjectCreatePayload } from '@/api/model/enterprise/projectModel';
import { useDictStore } from '@/store/modules/enterprise/dict';

import { INITIAL_DATA } from './constants';

defineOptions({
  name: 'ProjectPublish',
});

import GenericForm from '@/components/generic-form/index.vue';

const dictStore = useDictStore();
const router = useRouter();

type FormData = ProjectCreatePayload & {
  time_range: string[];
};

const createInitialFormData = (): FormData => ({
  ...INITIAL_DATA,
});

// 表单数据
const formData = ref<FormData>(createInitialFormData());
const publishSuccess = ref(false);
const formResetVersion = ref(0);

// 计算项目类型选项
const projectTypeOptions = computed(() => {
  return dictStore.getProjectTypeOptions;
});

// 计算开票类型选项（返回树结构）
const invoiceTypeOptions = computed(() => {
  return dictStore.getInvoiceTypeOptions;
});

const enterpriseOptions = computed(() => {
  return dictStore.getCustomerTypeOptions;
});

// 表单提交处理
const onSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    createProject({
      name: formData.value.name,
      customer_id: formData.value.customer_id === 0 ? null : formData.value.customer_id,
      desc: formData.value.desc,
      invoice_type_id: formData.value.invoice_type_id,
      start_time: formData.value.time_range[0],
      end_time: formData.value.time_range[1],
      project_type_id: formData.value.project_type_id,
      required_personnel: formData.value.required_personnel,
    })
      .then(() => {
        MessagePlugin.success('发布成功');
        publishSuccess.value = true;
      })
      .finally(() => {});
  }
};

const onReset = () => {
  formData.value = createInitialFormData();
};

const handleCreateAnother = () => {
  publishSuccess.value = false;
  formData.value = createInitialFormData();
  formResetVersion.value += 1;
};

const handleBackToList = () => {
  router.push({ name: 'ProjectList' });
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

onMounted(() => {});
</script>
<style lang="less" scoped>
.publish-project-shell {
  padding: 16px;
}

.finish-wrapper {
  display: grid;
  gap: 16px;
  max-width: 720px;
  min-height: 320px;
  margin: 0 auto;
  place-content: center;
  justify-items: center;
  text-align: center;
}

.finish-actions {
  margin-top: 56px;
  display: flex;
  gap: 12px;
  justify-content: center;
}
</style>
