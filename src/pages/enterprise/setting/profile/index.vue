<template>
  <div class="profile-page">
    <profile-head-card
      :logo="basicInfo?.logo"
      :legal-person-info="legalPersonInfo"
      :credit-code="basicInfo?.credit_code"
      :company-name="basicInfo?.short_name"
      :address="basicInfo?.address"
      @save-logo="handelSaveLogo"
    />
    <t-card class="content-card" :bordered="false">
      <t-tabs v-model="activeTab" class="profile-tabs">
        <t-tab-panel value="base" label="基础资料">
          <profile-base-info :form-data="basicInfo" @save="handelSaveInfo" />
        </t-tab-panel>
        <t-tab-panel value="verify" label="认证信息">
          <profile-verify-info :legal-person-info="legalPersonInfo" :industry-registration="industryRegistration" />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { getProfileDetail, saveProfile } from '@/api/enterprise/profile';
import type {
  EnterpriseIndustryRegistration,
  EnterpriseLegalPersonInfo,
  EnterpriseProfileBasicInfo,
  EnterpriseProfileSavePayload,
} from '@/api/model/enterprise/profile';

import ProfileBaseInfo from './components/ProfileBaseInfo.vue';
import ProfileHeadCard from './components/ProfileHeadCard.vue';
import ProfileVerifyInfo from './components/ProfileVerifyInfo.vue';

defineOptions({
  name: 'SettingProfile',
});

const basicInfo = ref<EnterpriseProfileBasicInfo>({} as EnterpriseProfileBasicInfo);
const legalPersonInfo = ref<EnterpriseLegalPersonInfo>({} as EnterpriseLegalPersonInfo);
const industryRegistration = ref<EnterpriseIndustryRegistration>({} as EnterpriseIndustryRegistration);
const enterprise_id = ref(-1);

const activeTab = ref<'base' | 'verify'>('base');

onMounted(() => {
  getProfileDetail().then((res) => {
    if (res.code === 200) {
      console.log(res);
      basicInfo.value = res.data.basic_info;
      legalPersonInfo.value = res.data.certification_info.legal_person_info;
      industryRegistration.value = res.data.certification_info.industry_registration;
      enterprise_id.value = res.data.enterprise_id;
    }
  });
});

const handelSaveInfo = (payload: EnterpriseProfileSavePayload) => {
  console.log(payload);
  saveProfile({
    ...payload,
    enterprise_id: enterprise_id.value,
  }).then(() => {});
};
const handelSaveLogo = (logoUrl: string) => {
  saveProfile({
    logo: logoUrl,
    enterprise_id: enterprise_id.value,
  });
};
</script>
<style lang="less" scoped>
.profile-page {
  display: grid;
  gap: 12px;
}

.content-card {
  border-radius: 16px;

  :deep(.t-card__body) {
    padding: 22px;
  }
}

.profile-tabs {
  border-bottom: 1px solid var(--td-component-stroke);
}
</style>
