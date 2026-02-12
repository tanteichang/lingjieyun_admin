<template>
  <div class="base-info-wrap">
    <generic-form
      :form-data="formData"
      :form-groups="formGroups"
      :container-width="1160"
      label-align="top"
      @submit="handleSubmit"
      @reset="handleCancel"
    >
      <template #content>
        <div class="section-title">企业基础信息</div>
        <div v-for="(group, groupIndex) in formGroups" :key="groupIndex" class="form-group">
          <t-row :gutter="[22, 16]">
            <t-col v-for="(item, itemIndex) in group.items" :key="itemIndex" :span="item.span || 6">
              <t-form-item :label="item.label" :name="item.name">
                <component :is="getFormComponent(item.type)" v-model="formData[item.name]" v-bind="item.props" />
              </t-form-item>
            </t-col>
          </t-row>
        </div>
      </template>

      <template #actions>
        <t-button v-if="!isEditing" theme="primary" class="save-btn" @click="handleEdit">编辑</t-button>
        <template v-else>
          <t-button theme="primary" class="save-btn" type="submit">保存</t-button>
          <t-button theme="default" variant="base" type="reset">取消</t-button>
        </template>
      </template>
    </generic-form>
  </div>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { Input, MessagePlugin, Textarea } from 'tdesign-vue-next';
import { computed, ref } from 'vue';

import GenericForm from '@/components/generic-form/index.vue';

defineOptions({
  name: 'ProfileBaseInfo',
});

const formComponents = {
  input: Input,
  textarea: Textarea,
};

const getFormComponent = (type: string) => formComponents[type as keyof typeof formComponents] || Input;

const isEditing = ref(false);

const INITIAL_FORM_DATA = {
  shortName: '新际网络',
  phone: '010-8888-6666',
  workTime: '周一至周五 09:00 - 18:00',
  email: 'contact@newedge.com',
  industry: '软件开发',
  region: '广东省 -- 广州市 -- 番禺区',
  summary:
    '我们是一家专注于自动驾驶核心技术研发的国家高新技术企业，致力于通过人工智能改变未来的交通方式。公司团队来自硅谷及国内顶尖高校的专家组成，拥有百余项核心专利。',
  detailAddress: '中关村大街1号智行大厦22层',
  benefits: '五险一金, 定期体检, 带薪年假, 免费三餐, 健身房, 住房补贴, 补充医疗保险',
};

const formData = ref({ ...INITIAL_FORM_DATA });
const savedFormData = ref({ ...INITIAL_FORM_DATA });

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancel = () => {
  formData.value = { ...savedFormData.value };
  isEditing.value = false;
};

const handleSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;
  savedFormData.value = { ...formData.value };
  isEditing.value = false;
  MessagePlugin.success('保存成功');
};

const formGroups = computed(() => [
  {
    items: [
      {
        name: 'shortName',
        label: '企业简称',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入企业简称' }],
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          placeholder: '请输入企业简称',
        },
      },
      {
        name: 'phone',
        label: '联系电话',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入联系电话' }],
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          placeholder: '请输入联系电话',
        },
      },
      {
        name: 'workTime',
        label: '工作时间',
        type: 'input',
        span: 6,
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          placeholder: '请输入工作时间',
        },
      },
      {
        name: 'email',
        label: '邮箱地址',
        type: 'input',
        span: 6,
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          placeholder: '请输入邮箱地址',
        },
      },
      {
        name: 'industry',
        label: '所属行业',
        type: 'input',
        span: 6,
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          placeholder: '请输入所属行业',
        },
      },
      {
        name: 'region',
        label: '企业地址',
        type: 'input',
        span: 6,
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          placeholder: '请输入企业地址',
        },
      },
      {
        name: 'summary',
        label: '企业简介',
        type: 'textarea',
        span: 6,
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          maxlength: 400,
          autosize: { minRows: 5, maxRows: 7 },
          placeholder: '请输入企业简介',
        },
      },
      {
        name: 'detailAddress',
        label: '企业详细地址',
        type: 'input',
        span: 6,
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          placeholder: '请输入企业详细地址',
        },
      },
      {
        name: 'benefits',
        label: '员工福利（用逗号分隔）',
        type: 'textarea',
        span: 6,
        props: {
          disabled: !isEditing.value,
          readonly: !isEditing.value,
          maxlength: 400,
          autosize: { minRows: 5, maxRows: 7 },
          placeholder: '请输入员工福利',
        },
      },
    ],
  },
]);
</script>
<style lang="less" scoped>
.section-title {
  font-size: 30px;
  color: var(--td-text-color-primary);
  font-weight: 600;
  line-height: 1;
  position: relative;
  padding-left: 12px;
  margin-bottom: 22px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  border-radius: 2px;
  background: var(--td-brand-color);
}

.save-btn {
  min-width: 92px;
  margin-right: 12px;
}
</style>
