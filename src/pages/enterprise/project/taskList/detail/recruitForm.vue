<template>
  <generic-form
    :form-data="formData"
    :form-groups="formGroups"
    :container-width="760"
    confirm-text="确认提交"
    cancel-text="取消"
    @submit="handleSubmit"
    @reset="handleCancel"
  >
    <template #content>
      <div class="recruit-form-content">
        <t-row :gutter="[24, 20]">
          <t-col :span="6">
            <t-form-item label="姓名" name="name">
              <t-input v-model="formData.name" placeholder="请输入姓名" />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="手机号" name="mobile">
              <t-input v-model="formData.mobile" placeholder="请输入手机号" />
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="身份证号" name="id_card">
              <t-input v-model="formData.id_card" placeholder="请输入身份证号" />
            </t-form-item>
          </t-col>
        </t-row>

        <div class="upload-group-title">身份证信息</div>
        <t-row :gutter="[24, 20]">
          <t-col :span="6">
            <t-form-item label="身份证人像面" name="_id_card_front_files">
              <div class="id-upload-line">
                <auto-upload
                  v-model="formData._id_card_front_files"
                  theme="image"
                  accept=".png,.jpeg,.jpg"
                  :max="1"
                  :auto-upload="true"
                  :size-limit="{ size: 5, unit: 'MB' }"
                />
                <div class="id-sample-card">
                  <img src="@/assets/project/id_example_1.png" alt="身份证人像面示例" />
                </div>
              </div>
            </t-form-item>
          </t-col>
          <t-col :span="6">
            <t-form-item label="身份证国徽面" name="_id_card_back_files">
              <div class="id-upload-line">
                <auto-upload
                  v-model="formData._id_card_back_files"
                  theme="image"
                  accept=".png,.jpeg,.jpg"
                  :max="1"
                  :auto-upload="true"
                  :size-limit="{ size: 5, unit: 'MB' }"
                />
                <div class="id-sample-card">
                  <img src="@/assets/project/id_example_2.png" alt="身份证国徽面示例" />
                </div>
              </div>
            </t-form-item>
          </t-col>
        </t-row>

        <t-row :gutter="[24, 20]">
          <t-col :span="6">
            <t-form-item label="签约方式" name="sign_type">
              <t-select v-model="formData.sign_type" :options="signTypeOptions" placeholder="请选择签约方式" />
            </t-form-item>
          </t-col>
        </t-row>
      </div>
    </template>
  </generic-form>
</template>
<script setup lang="ts">
import type { SubmitContext, UploadFile } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';

import { SignMethod } from '@/api/model/enterprise/taskModel';
import AutoUpload from '@/components/auto-upload/index.vue';
import GenericForm from '@/components/generic-form/index.vue';
import { MOBILE_PATTERN } from '@/utils/pattern';

defineOptions({
  name: 'RecruitForm',
});

const emit = defineEmits<{
  (e: 'submit', payload: RecruitFormSubmitPayload): void;
  (e: 'cancel'): void;
}>();

export interface RecruitFormSubmitPayload {
  name: string;
  mobile: string;
  id_card: string;
  id_card_front: string;
  id_card_back: string;
  sign_method: SignMethod;
}

interface RecruitFormData extends RecruitFormSubmitPayload {
  _id_card_front_files: UploadFile[];
  _id_card_back_files: UploadFile[];
}

const ID_CARD_PATTERN = /^(?:\d{15}|\d{17}[\dx])$/i;

const signTypeOptions = [
  { label: '发送签约短信', value: SignMethod.SMS },
  { label: '暂不签约', value: SignMethod.NotNow },
];

const formData = ref<RecruitFormData>({
  name: '',
  mobile: '',
  id_card: '',
  id_card_front: '',
  id_card_back: '',
  sign_method: SignMethod.NotNow,
  _id_card_front_files: [],
  _id_card_back_files: [],
});

watch(
  () => formData.value._id_card_front_files,
  (files) => {
    formData.value.id_card_front = files?.[0]?.url || '';
  },
  { deep: true },
);

watch(
  () => formData.value._id_card_back_files,
  (files) => {
    formData.value.id_card_back = files?.[0]?.url || '';
  },
  { deep: true },
);

const formGroups = computed(() => [
  {
    items: [
      {
        name: 'name',
        label: '姓名',
        type: 'input',
        rules: [{ required: true, message: '请输入姓名' }],
      },
      {
        name: 'mobile',
        label: '手机号',
        type: 'input',
        rules: [
          { required: true, message: '请输入手机号' },
          { pattern: MOBILE_PATTERN, message: '请输入正确的手机号' },
        ],
      },
      {
        name: 'id_card',
        label: '身份证号',
        type: 'input',
        rules: [
          { required: true, message: '请输入身份证号' },
          { pattern: ID_CARD_PATTERN, message: '请输入正确的身份证号' },
        ],
      },
      {
        name: '_id_card_front_files',
        label: '身份证人像面',
        type: 'upload',
        rules: [
          {
            validator: (value: UploadFile[]) => Array.isArray(value) && value.length > 0,
            message: '请上传身份证人像面',
          },
        ],
      },
      {
        name: '_id_card_back_files',
        label: '身份证国徽面',
        type: 'upload',
        rules: [
          {
            validator: (value: UploadFile[]) => Array.isArray(value) && value.length > 0,
            message: '请上传身份证国徽面',
          },
        ],
      },
      {
        name: 'sign_method',
        label: '签约方式',
        type: 'select',
        rules: [{ required: true, message: '请选择签约方式' }],
      },
    ],
  },
]);

const handleSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;
  emit('submit', {
    name: formData.value.name,
    mobile: formData.value.mobile,
    id_card: formData.value.id_card,
    id_card_front: formData.value.id_card_front,
    id_card_back: formData.value.id_card_back,
    sign_method: formData.value.sign_method,
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>
<style lang="less" scoped>
.recruit-form-content {
  padding-top: 8px;
}

.upload-group-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 8px 0 12px;
}

.id-upload-line {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.id-sample-card {
  width: 160px;
  height: 120px;

  border-radius: var(--td-radius-default);
  color: var(--td-text-color-placeholder);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  padding: 0 8px;
  text-align: center;
}

.sign-tip {
  color: var(--td-text-color-placeholder);
  font-size: 12px;
  margin-top: -8px;
}

:deep(.t-upload__card) {
  width: 120px;
  height: 120px;
}
</style>
