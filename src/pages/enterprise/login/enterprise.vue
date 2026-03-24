<template>
  <div class="enterprise-page">
    <div class="page-content">
      <div class="top-actions">
        <t-button variant="text" theme="primary" @click="handleBack">
          <template #icon>
            <t-icon name="arrow-left" />
          </template>
          返回登录
        </t-button>
        <!-- <t-button variant="outline" theme="primary" @click="handleGoToJoin">去加入企业</t-button> -->
      </div>
      <t-steps class="stepper" :current="currentStep" readonly>
        <t-step-item title="确认账号信息" />
        <t-step-item title="填写企业认证信息" />
        <t-step-item title="等待审核" />
        <t-step-item title="协议签署" />
        <!-- <t-step-item title="完成认证" /> -->
      </t-steps>

      <div class="step-content">
        <div v-if="currentStep === 0" class="step-panel">
          <t-alert theme="info" title="请先确认账号信息">
            <template #message>
              <span>当前电话：</span>
              <b>{{ phone }}</b>
              <span> 会被注册为超级管理员。</span>
              <span>如果不使用此号码，请点击</span>
            </template>
            <template #operation>
              <span @click="handleOperation">更改号码</span>
            </template>
          </t-alert>
          <div class="step-panel__actions">
            <t-button theme="primary" @click="handleNextStep">下一步</t-button>
          </div>
        </div>

        <div v-else-if="currentStep === 1" class="step-panel">
          <enterprise-cert-form ref="enterpriseCertFormRef" />
          <div class="step-panel__actions">
            <t-button variant="outline" @click="handlePrevStep">上一步</t-button>
            <t-button theme="primary" @click="handleNextStep">提交并进入下一步</t-button>
          </div>
        </div>

        <div v-else-if="currentStep === 2" class="step-panel">
          <t-result
            :theme="isCreateRejected ? 'error' : 'success'"
            :title="isCreateRejected ? '企业审核未通过' : '企业认证信息已提交'"
            :description="isCreateRejected ? '请核对企业资料后重新提交。' : '审核预计 1-3 个工作日，请耐心等待。'"
          />
          <t-card :bordered="false" class="audit-card">
            <div class="audit-icon-wrap">
              <t-icon
                :name="isCreateRejected ? 'close-circle-filled' : 'time-filled'"
                :class="isCreateRejected ? 'error-icon' : 'audit-icon'"
              />
            </div>
            <div class="audit-title">{{ isCreateRejected ? '企业审核未通过' : '企业审核中' }}</div>
            <div class="audit-text">
              {{ isCreateRejected ? '企业注册申请审核未通过，请重新填写企业认证信息。' : '企业注册申请已提交' }}
            </div>
            <div class="audit-text">
              {{
                isCreateRejected
                  ? '点击下方按钮可返回第一步，重新发起企业注册。'
                  : '预计 5 个工作日内完成审核，请耐心等待。'
              }}
            </div>
            <div v-if="isCreateRejected" class="audit-actions">
              <t-button theme="primary" @click="handleRestartRegister">重新注册企业</t-button>
              <t-button variant="outline" theme="primary" @click="handleGoToJoin">去加入企业</t-button>
            </div>
          </t-card>
        </div>

        <div v-else-if="currentStep === 3" class="step-panel">
          <t-card :bordered="false" class="audit-card">
            <div class="audit-icon-wrap">
              <t-icon name="check-circle" class="ok-icon" />
            </div>
            <div class="audit-title">恭喜您，完成认证</div>
            <div v-if="!essSignUrl" class="audit-text">
              你的账号已通过审核了，请与平台签约，签约完成即可使用发布任务等功能
            </div>
            <div v-if="essSignUrl" class="audit-text">请扫描下方二维码，与平台签约</div>
            <t-space direction="vertical">
              <qrcode-vue v-if="essSignUrl" :value="essSignUrl" />
              <text v-if="essSignUrl">
                签署成果后请手动
                <t-link theme="primary" @click="handleBack">重新登陆</t-link>
              </text>
            </t-space>
          </t-card>
          <div class="step-panel__actions">
            <t-button v-if="!essSignUrl" :loading="loading" theme="primary" @click="handleNextStep">{{
              loading ? '加载中' : '去签约'
            }}</t-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import QrcodeVue from 'qrcode.vue';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { getSign } from '@/api/enterprise/agreement';
import { createEnterprise } from '@/api/enterprise/enterprise';
import { UserStatus, useUserLoginAndRegister } from '@/store/modules/user';

import type { EnterpriseCertFormExpose } from './components/EnterpriseCertForm.vue';
import EnterpriseCertForm from './components/EnterpriseCertForm.vue';

defineOptions({
  name: 'EnterpriseRegister',
});

const userSessionStore = useUserLoginAndRegister();

const router = useRouter();
const currentStep = ref(
  userSessionStore.status === UserStatus.CreatePending || userSessionStore.status === UserStatus.CreateRejected
    ? 2
    : userSessionStore.status === UserStatus.CreateSignPending
      ? 3
      : 0,
);
const phone = ref(userSessionStore.phone);
const enterpriseCertFormRef = ref<EnterpriseCertFormExpose | null>(null);
const essSignUrl = ref('');
const loading = ref(false);
const isCreateRejected = computed(() => userSessionStore.status === UserStatus.CreateRejected);

const handleBack = () => {
  router.back();
};

const handleGoToJoin = () => {
  router.push({ name: 'enterpriseJoin' });
};

const handleNextStep = async () => {
  if (currentStep.value === 0) {
    currentStep.value = 1;
  } else if (currentStep.value === 1) {
    const certFormData = await enterpriseCertFormRef.value?.validateAndGetData();
    if (!certFormData) {
      MessagePlugin.warning('请先完善并通过企业认证信息校验');
      return;
    }

    const res = await createEnterprise({
      // admin_id: Number(userSessionStore.admin_id),
      name: certFormData.name,
      credit_code: certFormData.credit_code,
      business_license: certFormData.business_license,
      industry_id: Number(certFormData.industry_id),
      is_legal_admin: certFormData.is_legal_admin,
      legal_person_name: certFormData.legal_person_name,
      legal_person_id_no: certFormData.legal_person_id_no,
      legal_person_id_front: certFormData.legal_person_id_front,
      legal_person_id_back: certFormData.legal_person_id_back,
      legal_person_phone: certFormData.legal_person_phone,
      mobile: certFormData.mobile,
      email: certFormData.email,
      address: certFormData.address,
      super_admin_name: certFormData.super_admin_name,
      super_admin_id_no: certFormData.super_admin_id_no,
      super_admin_phone: certFormData.super_admin_phone,
      super_admin_id_front: certFormData.super_admin_id_front,
      super_admin_id_back: certFormData.super_admin_id_back,
      register_address: certFormData.register_address,
      province_id: Number(certFormData.province_id),
      city_id: Number(certFormData.city_id),
      district_id: Number(certFormData.district_id),
      address_detail: certFormData.address_detail,
    });
    if (res.code === 200) {
      MessagePlugin.success('企业认证信息已提交');
      userSessionStore.setStatus(UserStatus.CreatePending);
      currentStep.value = 2;
    }
  } else if (currentStep.value === 3) {
    loading.value = true;
    getSign({ agreement_type: 1 })
      .then((res) => {
        if (res.code === 200) {
          essSignUrl.value = res.data.ess_sign_url;
        }
      })
      .finally(() => {
        loading.value = false;
      });
  }
};

const handlePrevStep = () => {
  currentStep.value = Math.max(currentStep.value - 1, 0);
};

const handleRestartRegister = () => {
  userSessionStore.setStatus(UserStatus.NotDo);
  currentStep.value = 0;
};

const handleOperation = () => {
  router.push({ name: 'login', query: { type: 'register' } });
};
</script>
<style lang="less" scoped>
.enterprise-page {
  min-height: 100vh;
  background: #fff;
}

.page-content {
  width: 1080px;
  margin: 0 auto;
  padding: 38px 0 64px;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.stepper {
  margin-bottom: 40px;
}

.step-content {
  width: 100%;
}

.step-panel {
  width: 100%;
}

.step-panel__actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.audit-card {
  border-radius: var(--td-radius-large);
  text-align: center;

  :deep(.t-card__body) {
    padding: 48px 24px 40px;
  }
}

.audit-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  border-radius: 50%;
}

.audit-icon {
  font-size: 100px;
  color: var(--td-warning-color);
}

.error-icon {
  font-size: 100px;
  color: var(--td-error-color);
}

.ok-icon {
  font-size: 100px;
  color: var(--td-success-color);
}

.audit-title {
  margin-top: 16px;
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.audit-text {
  margin-top: 8px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 22px;
  margin-bottom: 8px;
}

.audit-actions {
  margin-top: 24px;
}
</style>
