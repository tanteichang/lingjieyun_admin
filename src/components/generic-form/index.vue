<template>
  <t-form
    class="generic-form"
    :data="formData"
    :rules="rules"
    :label-align="labelAlign"
    :label-width="labelWidth"
    @reset="onReset"
    @submit="onSubmit"
  >
    <div class="form-container">
      <div class="form-item" :style="{ width: props.containerWidth + 'px' }">
        <div v-if="title" class="form-container-title">{{ title }}</div>

        <!-- 自定义内容插槽 -->
        <slot name="content">
          <!-- 表单字段自动生成 -->
          <div v-for="(group, groupIndex) in formGroups" :key="groupIndex" class="form-group">
            <div v-if="group.title" class="form-group-title">{{ group.title }}</div>

            <t-row :gutter="group.gutter || [32, 24]">
              <t-col v-for="(item, itemIndex) in group.items" :key="itemIndex" :span="item.span || 6">
                <t-form-item :label="item.label" :name="item.name">
                  <!-- 根据字段类型渲染不同的表单控件 -->
                  <component
                    :is="getFormComponent(item.type)"
                    v-model="formData[item.name]"
                    v-bind="item.props || {}"
                  ></component>
                </t-form-item>
              </t-col>
            </t-row>
          </div>
        </slot>
      </div>
    </div>

    <!-- 提交按钮区域 -->
    <div class="form-submit-container">
      <div class="form-submit-sub">
        <div class="form-submit-left">
          <!-- 自定义操作按钮插槽 -->
          <slot name="actions">
            <t-button theme="primary" class="form-submit-confirm" type="submit">
              {{ confirmText }}
            </t-button>
            <t-button type="reset" class="form-submit-cancel" theme="default" variant="base">
              {{ cancelText }}
            </t-button>
          </slot>
        </div>
      </div>
    </div>
  </t-form>
</template>
<script setup lang="ts">
import type { SubmitContext, FormRule } from 'tdesign-vue-next';
import { t } from '@/locales';
import { computed } from 'vue';
// 导入TDesign表单组件
import { Input, Select, RadioGroup, Radio, DatePicker, Upload, Textarea } from 'tdesign-vue-next';

// 表单控件映射
const formComponents = {
  input: Input,
  select: Select,
  radioGroup: RadioGroup,
  datePicker: DatePicker,
  upload: Upload,
  textarea: Textarea,
};

// 组件Props
interface FormItem {
  name: string;
  label: string;
  type: keyof typeof formComponents | string;
  span?: number;
  rules?: FormRule[];
  props?: Record<string, any>;
}

interface FormGroup {
  title?: string;
  gutter?: [number, number];
  items: FormItem[];
}

interface GenericFormProps {
  title?: string;
  formData: Record<string, any>;
  formGroups: FormGroup[];
  labelAlign?: 'left' | 'top';
  labelWidth?: number | string;
  confirmText?: string;
  cancelText?: string;
  containerWidth?: number;
}

const props = withDefaults(defineProps<GenericFormProps>(), {
  labelAlign: 'top',
  labelWidth: 100,
  confirmText: () => t('pages.formBase.confirm'),
  cancelText: () => t('pages.formBase.cancel'),
  containerWidth: 800,
});

const rules = computed(() => {
  const rules: Record<string, FormRule[]> = {};
  props.formGroups.forEach((group) => {
    group.items.forEach((item) => {
      if (item.rules) {
        rules[item.name] = item.rules;
      }
    });
  });
  return rules;
});

// 组件事件
const emit = defineEmits<{
  (e: 'submit', ctx: SubmitContext): void;
  (e: 'reset'): void;
}>();

// 获取表单组件
const getFormComponent = (type: string) => {
  return formComponents[type as keyof typeof formComponents] || TInput;
};

// 表单提交处理
const onSubmit = (ctx: SubmitContext) => {
  emit('submit', ctx);
};

// 表单重置处理
const onReset = () => {
  emit('reset');
};
</script>

<style lang="less" scoped>
.generic-form {
  width: 100%;
}

.form-container {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--td-bg-color-container);
  border-radius: var(--td-radius-medium) var(--td-radius-medium) 0 0;
  padding: var(--td-comp-paddingTB-xxl) var(--td-comp-paddingLR-xxl) 80px var(--td-comp-paddingLR-xxl);

  .form-item {
    width:100%;

    .form-container-title {
      font: var(--td-font-title-large);
      font-weight: bold;
      color: var(--td-text-color-primary);
      margin: var(--td-comp-margin-xxl) 0 var(--td-comp-margin-xl) 0;
    }

    .form-group {
      margin-bottom: var(--td-comp-margin-xxl);

      .form-group-title {
        font: var(--td-font-title-medium);
        font-weight: 400;
        color: var(--td-text-color-primary);
        margin: var(--td-comp-margin-xl) 0 var(--td-comp-margin-lg) 0;
      }
    }
  }
}

.form-submit-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: var(--td-comp-paddingLR-xl);
  padding-bottom: var(--td-comp-paddingLR-xl);
  background-color: var(--td-bg-color-secondarycontainer);
  border-bottom-left-radius: var(--td-radius-medium);
  border-bottom-right-radius: var(--td-radius-medium);
  border-top: 1px solid var(--td-component-stroke);

  .form-submit-sub {
    width: 676px;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .form-submit-left {
      .form-submit-confirm {
        margin-right: var(--td-comp-margin-lg);
      }
    }
  }
}
</style>
