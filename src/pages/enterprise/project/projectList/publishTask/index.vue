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

      <keep-alive>
        <generic-form
          v-if="currentStep === 0"
          :key="`publish-task-step-1-${formResetVersion}`"
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
          :key="`publish-task-step-2-${formResetVersion}`"
          :form-data="formData"
          :form-groups="formGroupsStep2"
          label-align="left"
          :label-width="96"
          :container-width="940"
          @submit="onSubmitStep2"
        >
          <template #actions>
            <t-button theme="primary" type="submit">提交</t-button>
            <t-button variant="base" theme="default" @click="handlePrev">上一步</t-button>
          </template>
        </generic-form>

        <div v-else class="finish-wrapper">
          <t-alert theme="success" title="任务发布完成" message="平台审核预计需要1~2个工作日，请耐心等待" />
          <div class="finish-actions">
            <t-button theme="primary" @click="handleBack">返回项目详情</t-button>
            <t-button variant="outline" @click="handleCreateAnother">继续发布</t-button>
          </div>
        </div>
      </keep-alive>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import type { SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { publishTask } from '@/api/enterprise/task';
import { DeliveryMode } from '@/api/model/enterprise/delivery';
import type { TaskPublishPayload } from '@/api/model/enterprise/taskModel';
import { AcceptanceType, RecruitmentType } from '@/api/model/enterprise/taskModel';
import GenericForm from '@/components/generic-form/index.vue';
import type { LngLatValue } from '@/components/lngLatPicker/index.vue';
import type { ProvinceCityAreaValue } from '@/components/provinceCityAreaPicker/index.vue';
import { useDictStore } from '@/store/modules/enterprise/dict';
import { useProjectStore } from '@/store/modules/enterprise/project';

import {
  acceptanceOptions,
  acceptancePeriodOptions,
  deliveryOptions,
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
const jobTypeOptions = computed(() => dictStore.getJobOptions);

type FormData = TaskPublishPayload & {
  _dateRange: string[];
  _recruitment_type: number[];
  _delivery_mode: number[];
  _provinceCityArea: ProvinceCityAreaValue;
  _lngLat: LngLatValue;
  _label: string[];
};

const createInitialFormData = (): FormData => ({
  project_id: Number(route.query.projectID),
  name: '',
  settlement_type: null,
  commission: '',
  start_time: '',
  end_time: '',
  detail_address: '',
  commission_min: '',
  commission_max: '',
  required_personnel: null,
  education_id: null,
  experience_id: null,
  job_id: null,
  desc: '',
  accept: '',
  delivery_standard: '',
  acceptance_type: null,
  acceptance_period_type: null,
  acceptance_start_date: '',
  acceptance_end_date: '',
  _dateRange: [],
  _recruitment_type: [],
  _delivery_mode: [],
  _provinceCityArea: {
    province: '',
    city: '',
    district: '',
  },
  _lngLat: {
    lng: '',
    lat: '',
  },
  _label: [],
});

const formData = ref<FormData>(createInitialFormData());
const formResetVersion = ref(0);

const formGroupsStep1 = computed(() => [
  {
    title: '',
    items: [
      {
        name: '_company',
        label: '企业',
        type: 'input',
        span: 6,
        props: { disabled: true, placeholder: projectInfo?.value.customer_name || projectInfo?.value.enterprise_name },
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
        name: 'job_id',
        label: '职位要求',
        type: 'treeSelect',
        span: 6,
        rules: [{ required: true, message: '请选择职位要求' }],
        props: {
          data: jobTypeOptions.value,
          clearable: true,
          filterable: true,
          placeholder: '请选择职位要求，可搜索职位名称',
        },
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
        name: '_provinceCityArea',
        label: '任务地址',
        type: 'provinceCityAreaPicker',
        span: 8,
        rules: [{ required: true, message: '请选择省份' }],
      },
      {
        name: 'detail_address',
        label: '具体地址',
        type: 'input',
        span: 8,
        rules: [{ required: true, message: '请填写具体地址' }],
        props: { placeholder: '请填写具体地址' },
      },
      {
        name: '_lngLat',
        label: '经纬度',
        type: 'lngLatPicker',
        span: 8,
        rules: [{ required: true, message: '请选择经纬度' }],
        props: {
          disabled: !formData.value.detail_address,
          mapKeyword: `${formData.value._provinceCityArea.province}${formData.value._provinceCityArea.city}${formData.value._provinceCityArea.district}${formData.value.detail_address}`,
        },
      },
      {
        name: 'settlement_type',
        label: '佣金结算',
        type: 'select',
        span: 6,
        rules: [{ required: true, message: '请选择结算方式' }],
        props: { options: settlementOptions, placeholder: '请选择' },
      },
      {
        name: 'commission',
        label: '佣金',
        type: 'input',
        span: 6,
        rules: [{ required: true, message: '请输入结算金额' }],
        props: { placeholder: '请输入金额', suffix: '元', type: 'number' },
      },
      {
        name: 'commission_min',
        label: '最小佣金',
        type: 'input',
        span: 6,
        rules: [{ required: false, message: '请输入结算金额' }],
        props: { placeholder: '请输入金额', suffix: '元', type: 'number' },
      },
      {
        name: 'commission_max',
        label: '最大佣金',
        type: 'input',
        span: 6,
        rules: [{ required: false, message: '请输入结算金额' }],
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
        span: 7,
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
        props: {
          format: 'YYYY-MM-DD',
          placeholder: '请选择验收开始时间',
          disableDate: { before: formData.value._dateRange[0], after: formData.value._dateRange[1] },
        },
      },
      {
        name: 'acceptance_end_date',
        label: '验收结束时间',
        type: 'datePicker',
        show: formData.value.acceptance_type === AcceptanceType.FINAL,
        span: 6,
        rules: [{ required: true, message: '请选择验收结束时间' }],
        props: {
          format: 'YYYY-MM-DD',
          placeholder: '请选择验收结束时间',
          disableDate: { before: formData.value.acceptance_start_date, after: formData.value._dateRange[1] },
        },
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
        span: 7,
        rules: [{ required: true, message: '请输入所需人数' }],
        props: { placeholder: '请输入人数', type: 'number', min: 1 },
      },
      {
        name: 'education_id',
        label: '学历要求',
        type: 'select',
        span: 7,
        rules: [{ required: false, message: '请选择学历要求' }],
        props: { options: dictStore.getEducationOptions, placeholder: '请选择学历' },
      },
      {
        name: 'experience_id',
        label: '经验要求',
        type: 'select',
        span: 7,
        rules: [{ required: false, message: '请选择经验要求' }],
        props: { options: dictStore.getExperienceOptions, placeholder: '请选择经验要求' },
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
        name: '_label',
        label: '任务标签',
        type: 'tagInput',
        span: 7,
        rules: [{ required: false, message: '请输入任务标签' }],
        props: { max: 5, placeholder: '输入完成后回车，最多输入5个标签' },
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
  router.push({ name: 'ProjectDetail', query: route.query });
};

const onSubmitStep1 = (ctx: SubmitContext) => {
  console.log(formData.value._provinceCityArea);
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
      province_id: formData.value._provinceCityArea.provinceId,
      city_id: formData.value._provinceCityArea.cityId,
      district_id: formData.value._provinceCityArea.districtId,
      longitude: formData.value._lngLat.lng,
      latitude: formData.value._lngLat.lat,
      label: formData.value._label.join(','),
      acceptance_period_type:
        formData.value.acceptance_type === AcceptanceType.REGULAR ? formData.value.acceptance_period_type : null,
    };
    publishTask(payload).then((res) => {
      if (res.code === 200) {
        MessagePlugin.success('任务发布成功');
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
  formData.value = createInitialFormData();
  formResetVersion.value += 1;
  currentStep.value = 0;
};
watch(
  () => formData.value.city,
  () => {
    formData.value.district = null;
  },
);
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
