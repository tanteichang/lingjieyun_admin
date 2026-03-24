<template>
  <div class="profile-page">
    <div class="profile-top">
      <profile-head-card
        :logo="basicInfo?.logo"
        :legal-person-info="legalPersonInfo"
        :credit-code="basicInfo?.credit_code"
        :company-name="basicInfo?.name"
        :address="basicInfo?.address"
        @save-logo="handelSaveLogo"
      />
      <profile-balance-card
        :balance="mockBalance.balance"
        :service-rate="mockBalance.serviceRate"
        :invoice-amount="mockBalance.invoiceAmount"
      />
    </div>
    <t-card class="content-card" :bordered="false">
      <t-tabs v-model="activeTab" class="profile-tabs">
        <t-tab-panel value="base" label="基础资料">
          <profile-base-info :form-data="basicInfo" @save="handelSaveInfo" />
        </t-tab-panel>
        <t-tab-panel value="verify" label="认证信息">
          <profile-verify-info :legal-person-info="legalPersonInfo" :industry-registration="industryRegistration" />
        </t-tab-panel>
        <t-tab-panel value="bank" label="银行卡">
          <profile-bank-card :company-name="basicInfo?.short_name" />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getProfileDetail, saveProfile } from '@/api/enterprise/profile';
import type {
  EnterpriseIndustryRegistration,
  EnterpriseLegalPersonInfo,
  EnterpriseProfileBasicInfo,
  EnterpriseProfileSavePayload,
} from '@/api/model/enterprise/profile';

import ProfileBalanceCard from './components/ProfileBalanceCard.vue';
import ProfileBankCard from './components/ProfileBankCard.vue';
import ProfileBaseInfo from './components/ProfileBaseInfo.vue';
import ProfileHeadCard from './components/ProfileHeadCard.vue';
import ProfileVerifyInfo from './components/ProfileVerifyInfo.vue';

defineOptions({
  name: 'SettingProfile',
});
const route = useRoute();

const basicInfo = ref<EnterpriseProfileBasicInfo>({} as EnterpriseProfileBasicInfo);
const legalPersonInfo = ref<EnterpriseLegalPersonInfo>({} as EnterpriseLegalPersonInfo);
const industryRegistration = ref<EnterpriseIndustryRegistration>({} as EnterpriseIndustryRegistration);
const enterprise_id = ref(-1);
const mockBalance = {
  balance: 8980,
  serviceRate: '0.5%',
  invoiceAmount: 1000,
};

const activeTab = ref<'base' | 'verify' | 'bank'>((route.query.tab as 'base' | 'verify' | 'bank') || 'base');

onMounted(() => {
  getProfileDetail().then((res) => {
    if (res.code === 200) {
      basicInfo.value = res.data.basic_info;
      legalPersonInfo.value = res.data.certification_info.legal_person_info;
      industryRegistration.value = res.data.certification_info.industry_registration;
      enterprise_id.value = res.data.enterprise_id;
    }
  });
});

const handelSaveInfo = (payload: EnterpriseProfileSavePayload) => {
  saveProfile({
    ...payload,
  }).then(() => {});
};
const handelSaveLogo = (logoUrl: string) => {
  saveProfile({
    logo: logoUrl,
  }).then((res) => {
    if (res.code === 200) {
      basicInfo.value.logo = logoUrl;
    }
  });
};
</script>
<style lang="less" scoped>
.profile-page {
  display: grid;
  gap: 12px;
}

.profile-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 50%;
  gap: 18px;
  align-items: stretch;
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

@media (max-width: 1200px) {
  .profile-top {
    grid-template-columns: 1fr;
  }
}
</style>
