<template>
  <div class="publish-task-shell">
    <t-card class="publish-task-page" :bordered="false">
      <div class="publish-task-header">
        <div>
          <h3 class="title">发布任务</h3>
          <p v-if="projectSubtitle" class="subtitle">{{ projectSubtitle }}</p>
        </div>
        <t-button variant="text" theme="primary" @click="handleBack">返回项目详情</t-button>
      </div>

      <t-steps class="publish-task-steps" :current="currentStep" status="process">
        <t-step-item title="填写任务信息" />
        <t-step-item title="任务要求" />
        <t-step-item title="完成发布" />
      </t-steps>

      <generic-form
        v-if="currentStep === 0"
        :form-data="formData"
        :form-groups="formGroupsStep1"
        label-align="left"
        :label-width="96"
        :container-width="940"
        @submit="onSubmitStep1"
        @reset="onReset"
      >
        <template #actions>
          <t-button theme="primary" type="submit">下一步</t-button>
          <t-button variant="base" theme="default" type="reset">取消</t-button>
        </template>
      </generic-form>

      <generic-form
        v-else-if="currentStep === 1"
        :form-data="formData"
        :form-groups="formGroupsStep2"
        label-align="left"
        :label-width="96"
        :container-width="940"
        @submit="onSubmitStep2"
        @reset="handlePrev"
      >
        <template #actions>
          <t-button theme="primary" type="submit">提交</t-button>
          <t-button variant="base" theme="default" type="reset">上一步</t-button>
        </template>
      </generic-form>

      <div v-else class="finish-wrapper">
        <t-alert theme="success" title="任务发布完成" message="平台审核预计需要1~2个工作日，请耐心等待" />
        <div class="finish-actions">
          <t-button theme="primary" @click="handleBack">返回项目详情</t-button>
          <t-button variant="outline" @click="handleCreateAnother">继续发布</t-button>
        </div>
      </div>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { TaskPublishPayload } from '@/api/model/taskModel';
import { AcceptanceType, DeliveryMode, RecruitmentType } from '@/api/model/taskModel';
import { publishTask } from '@/api/task';
import GenericForm from '@/components/generic-form/index.vue';
import { useDictStore } from '@/store/modules/dict';
import { useProjectStore } from '@/store/modules/project';

import {
  acceptanceOptions,
  acceptancePeriodOptions,
  cityOptions,
  deliveryOptions,
  districtOptions,
  provinceOptions,
  recruitModeOptions,
  settlementOptions,
} from './constants';

defineOptions({
  name: 'ProjectPublishTask',
});

const projectStore = useProjectStore();
const dictStore = useDictStore();

const router = useRouter();
const route = useRoute();

const currentStep = ref(0);

const projectInfo = computed(() => projectStore.getProject(route.query.projectID as string));
const projectTypeOptions = computed(() => dictStore.getProjectTypeOptions);

type FormData = TaskPublishPayload & {
  _dateRange: string[];
  _recruitment_type: number[];
  _delivery_mode: number[];
};

const formData = ref<FormData>({
  project_id: Number(route.query.projectID),
  name: '',
  settlement_type: null,
  commission: '',
  start_time: '',
  end_time: '',
  _dateRange: [],
  _recruitment_type: [],
  _delivery_mode: [],
});

const formGroupsStep1 = computed(() => [
  {
    title: '',
    items: [
      {
        name: '_company',
        label: '企业',
        type: 'input',
        span: 6,
        props: { disabled: true, placeholder: projectInfo?.value.enterprise_name },
      },
      {
        name: '_project',
        label: '项目',
        type: 'input',
        span: 6,
        props: { placeholder: projectInfo?.value.name, disabled: true },
      },
      {
        name: 'name',
        label: '任务标题',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入任务标题' }],
        props: { placeholder: '请输入任务标题' },
      },
      {
        name: 'type',
        label: '任务类型',
        type: 'select',
        span: 6,
        rules: [{ required: true, message: '请选择任务类型' }],
        props: { options: projectTypeOptions.value, clearable: true, placeholder: '请选择任务类型' },
      },
      {
        name: '_dateRange',
        label: '任务时间',
        type: 'dateRangePicker',
        span: 12,
        rules: [{ required: true, message: '请选择项目时间范围' }],
        props: {
          format: 'YYYY-MM-DD HH:mm:ss',
          enableTimePicker: true,
        },
      },
      {
        name: 'province',
        label: '任务地址',
        type: 'select',
        span: 4,
        rules: [{ required: true, message: '请选择省份' }],
        props: { options: provinceOptions, placeholder: '省' },
      },
      {
        name: 'city',
        label: '',
        type: 'select',
        span: 4,
        rules: [{ required: true, message: '请选择城市' }],
        props: { options: cityOptions, placeholder: '市' },
      },
      {
        name: 'district',
        label: '',
        type: 'select',
        span: 4,
        rules: [{ required: true, message: '请选择区县' }],
        props: { options: districtOptions, placeholder: '区' },
      },
      {
        name: 'address',
        label: '具体地址',
        type: 'input',
        span: 12,
        rules: [{ required: true, message: '请填写具体地址' }],
        props: { placeholder: '请填写具体地址' },
      },
      {
        name: 'settlement_type',
        label: '佣金结算',
        type: 'select',
        span: 4,
        rules: [{ required: true, message: '请选择结算方式' }],
        props: { options: settlementOptions, placeholder: '请选择' },
      },
      {
        name: 'commission',
        label: '佣金',
        type: 'input',
        span: 4,
        rules: [{ required: true, message: '请输入结算金额' }],
        props: { placeholder: '请输入金额', suffix: '元', type: 'number' },
      },
      {
        name: '_recruitment_type',
        label: '招募模式',
        type: 'select',
        span: 12,
        rules: [{ required: true, message: '请选择招募模式' }],
        props: { options: recruitModeOptions, multiple: true, minCollapsedNum: 3, placeholder: '请选择招募模式' },
      },
      {
        name: 'acceptance_type',
        label: '验收要求',
        type: 'select',
        span: 12,
        rules: [{ required: true, message: '请选择验收要求' }],
        props: { options: acceptanceOptions, clearable: true, placeholder: '请选择验收要求' },
      },
      {
        name: 'acceptance_period_type',
        label: '验收周期',
        type: 'select',
        show: formData.value.acceptance_type === AcceptanceType.REGULAR,
        span: 6,
        rules: [{ required: true, message: '请选择验收周期' }],
        props: { options: acceptancePeriodOptions, clearable: true, placeholder: '请选择验收周期' },
      },
      {
        name: 'acceptance_start_date',
        label: '验收开始时间',
        type: 'datePicker',
        show: formData.value.acceptance_type === AcceptanceType.FINAL,
        span: 6,
        rules: [{ required: true, message: '请选择验收开始时间' }],
        props: { format: 'YYYY-MM-DD', placeholder: '请选择验收开始时间' },
      },
      {
        name: 'acceptance_end_date',
        label: '验收结束时间',
        type: 'datePicker',
        show: formData.value.acceptance_type === AcceptanceType.FINAL,
        span: 6,
        rules: [{ required: true, message: '请选择验收结束时间' }],
        props: { format: 'YYYY-MM-DD', placeholder: '请选择验收结束时间' },
      },
      {
        name: '_delivery_mode',
        label: '交付模式',
        type: 'select',
        span: 12,
        rules: [{ required: true, message: '请选择交付模式' }],
        props: { options: deliveryOptions, multiple: true, minCollapsedNum: 3, placeholder: '请选择交付模式' },
      },
    ],
  },
]);

const formGroupsStep2 = computed(() => [
  {
    title: '',
    items: [
      {
        name: 'required_personnel',
        label: '所需人数',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入所需人数' }],
        props: { placeholder: '请输入人数', type: 'number', min: 1 },
      },
      {
        name: 'education_id',
        label: '学历要求',
        type: 'select',
        span: 6,
        rules: [{ required: false, message: '请选择学历要求' }],
        props: { options: dictStore.getEducationOptions, placeholder: '请选择学历' },
      },
      {
        name: 'experience_id',
        label: '经验要求',
        type: 'select',
        span: 6,
        rules: [{ required: false, message: '请选择经验要求' }],
        props: { options: dictStore.getExperienceOptions, placeholder: '请选择经验要求' },
      },
      {
        name: 'job_id',
        label: '岗位要求',
        type: 'select',
        span: 6,
        rules: [{ required: false, message: '请选择岗位要求' }],
        props: { options: dictStore.getJobOptions, placeholder: '请选择岗位要求', clearable: true },
      },
      {
        name: 'desc',
        label: '任务描述',
        type: 'richTextEditor',
        span: 12,
        rules: [{ required: true, message: '请填写任务描述' }],
        props: { placeholder: '请填写任务描述', autosize: { minRows: 3, maxRows: 5 } },
      },
      {
        name: 'accept',
        label: '验收标准',
        type: 'richTextEditor',
        span: 12,
        rules: [{ required: true, message: '请填写验收标准' }],
        props: { placeholder: '请填写验收标准', autosize: { minRows: 3, maxRows: 5 } },
      },
      {
        name: 'delivery_standard',
        label: '交付物要求',
        type: 'richTextEditor',
        span: 12,
        rules: [{ required: true, message: '请填写交付物要求' }],
        props: { placeholder: '请填写交付物要求', autosize: { minRows: 3, maxRows: 5 } },
      },
    ],
  },
]);

const projectSubtitle = computed(() => {
  const id = route.query.id as string;
  return id ? `关联项目编号：${id}` : '';
});

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: 'ProjectDetail', query: route.query });
  }
};

const onSubmitStep1 = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    currentStep.value = 1;
    MessagePlugin.success('已保存任务信息，继续填写任务要求');
  }
};

const onSubmitStep2 = (ctx: SubmitContext) => {
  if (ctx.validateResult === true) {
    const payload: TaskPublishPayload = {
      ...formData.value,
      start_time: formData.value._dateRange[0],
      end_time: formData.value._dateRange[1],
      recruitment_type:
        formData.value._recruitment_type.length > 1 ? RecruitmentType.BOTH : formData.value._recruitment_type[0],
      delivery_mode: formData.value._delivery_mode.length > 1 ? DeliveryMode.BOTH : formData.value._delivery_mode[0],
    };
    console.log(payload);
    publishTask(payload).then((res) => {
      if (res.code === 200) {
        MessagePlugin.success('任务发布成功');
        // handleBack();
        currentStep.value = 2;
      } else {
        MessagePlugin.error(res.msg || '任务发布失败');
      }
    });
  }
};

const onReset = () => {
  MessagePlugin.warning('已取消发布');
  handleBack();
};

const handlePrev = () => {
  currentStep.value = Math.max(0, currentStep.value - 1);
};

const handleCreateAnother = () => {
  currentStep.value = 0;
  formData.value = {
    company: 'company-1',
    project: '灵捷云平台开发',
    title: '',
    type: 'dev',
    startDate: '',
    endDate: '',
    province: 'gd',
    city: 'gz',
    district: 'tianhe',
    address: '',
    settlementType: 'monthly',
    settlementAmount: '',
    recruitMode: ['free'],
    acceptance: 'history',
    deliveryMode: ['miniProgram'],
    tags: ['veteran'],
    requiredPeople: '',
    education: 'none',
    experience: 'none',
    taskDescription: '',
    acceptanceStandard: '',
    deliveryRequirement: '',
  };
};

// 页面加载时获取数据
onMounted(() => {});
</script>
<style lang="less" scoped>
.publish-task-shell {
  display: flex;
  justify-content: center;
  padding: 0 24px;
}

.publish-task-page {
  width: 1100px;
  margin: 0 auto;
  padding: 24px 48px 40px;
  box-shadow: none;
}

.publish-task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  .subtitle {
    margin: 6px 0 0;
    color: var(--td-text-color-secondary);
    font-size: 13px;
  }
}

.publish-task-steps {
  margin: 12px 0 28px;
}

.finish-wrapper {
  padding: 32px 0;
  text-align: center;
}

.finish-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
