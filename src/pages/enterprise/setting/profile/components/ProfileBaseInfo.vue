<template>
  <div class="base-info-wrap">
    <generic-form
      :form-data="data"
      :form-groups="formGroups"
      label-align="top"
      @submit="handleSubmit"
      @reset="handleCancel"
    >
      <template #actions>
        <t-button
          v-if="!isEditing"
          :disabled="!permissionStore.isSuperAdmin"
          theme="primary"
          class="save-btn"
          @click="handleEdit"
          >编辑</t-button
        >
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
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';

import type { EnterpriseProfileSavePayload } from '@/api/model/enterprise/profile';
import { useDictStore } from '@/store/modules/enterprise/dict';
import { usePermissionStore } from '@/store/modules/permission';

defineOptions({
  name: 'ProfileBaseInfo',
});

const props = defineProps<{
  formData?: EnterpriseProfileSavePayload;
}>();

const emit = defineEmits<{
  save: [payload: EnterpriseProfileSavePayload];
}>();

const permissionStore = usePermissionStore();

const dictStore = useDictStore();

import GenericForm from '@/components/generic-form/index.vue';

const isEditing = ref(false);

const data = ref({});

watch(
  () => props.formData,
  (formData) => {
    data.value = {
      ...formData,
      address_detail: formData.address?.address_detail || '',
    };
    console.log(data.value);
  },
  { immediate: true, deep: true },
);

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancel = () => {
  isEditing.value = false;
};

const handleSubmit = (ctx: SubmitContext) => {
  console.log(data.value);
  return;
  if (ctx.validateResult !== true) return;
  emit('save', {
    ...data.value,
    province: data.value.address.province || '',
    city: data.value.address.city || '',
    district: data.value.address.district || '',
  });
  isEditing.value = false;
  MessagePlugin.success('保存成功');
};

const formGroups = computed(() => [
  {
    items: [
      {
        name: 'short_name',
        label: '企业简称',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入企业简称' }],
        props: {
          disabled: !isEditing.value,
          placeholder: '请输入企业简称',
        },
      },
      {
        name: 'mobile',
        label: '联系电话',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入联系电话' }],
        props: {
          disabled: !isEditing.value,
          placeholder: '请输入联系电话',
        },
      },
      {
        name: 'work_time',
        label: '工作时间',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请填写工作时间' }],
        props: {
          disabled: !isEditing.value,
          placeholder: '示例：周一至周五 09:00 - 18:00',
        },
      },
      {
        name: 'email',
        label: '邮箱地址',
        type: 'input',
        rules: [{ required: true, message: '请输入邮箱地址' }],
        span: 6,
        props: {
          disabled: !isEditing.value,
          placeholder: '示例：contact@example.com',
        },
      },
      {
        name: 'industry_id',
        label: '所属行业',
        rules: [{ required: true, message: '请选择所属行业' }],
        type: 'select',
        span: 6,
        props: {
          disabled: !isEditing.value,
          placeholder: '请输入所属行业',
          options: dictStore.getProjectTypeOptions,
        },
      },

      {
        name: 'address',
        label: '企业地址',
        rules: [{ required: true, message: '请选择企业地址' }],
        type: 'provinceCityAreaPicker',
        span: 7,
        props: {
          disabled: !isEditing.value,
        },
      },
      {
        name: 'address_detail',
        label: '企业详细地址',
        rules: [{ required: true, message: '请输入企业详细地址' }],
        type: 'input',
        span: 6,
        props: {
          disabled: !isEditing.value,
          placeholder: '请输入企业详细地址',
        },
      },
      {
        name: '_lngLat',
        label: '经纬度',
        type: 'lngLatPicker',
        span: 6,
        rules: [{ required: true, message: '请选择经纬度' }],
        props: {
          disabled: !isEditing.value || !data.value.address_detail,
          mapKeyword: `${data.value.address?.province || ''}${data.value.address?.city || ''}${data.value.address?.district || ''}${data.value.address_detail || ''}`,
        },
      },
      {
        name: 'desc',
        label: '企业简介',
        rules: [{ required: true, message: '请输入企业简介' }],
        type: 'textarea',
        span: 6,
        props: {
          disabled: !isEditing.value,
          maxlength: 400,
          autosize: { minRows: 5, maxRows: 7 },
          placeholder: '请输入企业简介',
        },
      },
      {
        name: 'employee_benefits',
        label: '员工福利（用逗号分隔）',
        rules: [{ required: true, message: '请输入员工福利' }],
        type: 'textarea',
        span: 6,
        props: {
          disabled: !isEditing.value,
          maxlength: 400,
          autosize: { minRows: 5, maxRows: 7 },
          placeholder: '示例：五险一金, 定期体检, 带薪年假, 免费三餐, 健身房, 住房补贴, 补充医疗保险',
        },
      },
    ],
  },
]);
</script>
<style lang="less" scoped>
:deep(.form-container) {
  justify-content: flex-start;
}

:deep(.form-submit-container) {
  justify-content: flex-start;
  background-color: var(--td-bg-color-container);
}

:deep(.form-submit-container .form-submit-sub) {
  margin-left: 30px;
  width: 100%;
  justify-content: flex-start;
}

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
