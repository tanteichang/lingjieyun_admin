<template>
  <div class="talent-detail-page">
    <t-loading :loading="loading">
      <div class="page-wrap">
        <talent-side-info
          :basic-info="detail?.basic_info || defaultBasicInfo"
          :contact-info="detail?.contact_info || defaultContactInfo"
          :bank-info="detail?.bank_info || defaultBankInfo"
          :identity-info="detail?.identity_info || defaultIdentityInfo"
          :sign-info="detail?.sign_info || defaultSignInfo"
        />

        <div class="right-panel">
          <t-card class="detail-card" :bordered="false">
            <t-tabs v-model="activeTab" class="detail-tabs">
              <t-tab-panel value="profile" label="简历信息" />
              <t-tab-panel value="task" label="任务信息" />
              <t-tab-panel value="publish" label="发放记录" />
              <t-tab-panel value="contract" label="签约合同" />
            </t-tabs>
            <resume-info
              v-if="activeTab === 'profile'"
              :basic-info="detail?.basic_info || defaultBasicInfo"
              :contact-info="detail?.contact_info || defaultContactInfo"
              :resume="detail?.resume || defaultResume"
            />
            <task-info v-else-if="activeTab === 'task'" />
            <payment-records v-else-if="activeTab === 'publish'" />
            <contract-info v-else />
          </t-card>
        </div>
      </div>
    </t-loading>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getDetail } from '@/api/enterprise/talentpool';
import type {
  TalentPoolBankInfo,
  TalentPoolBasicInfo,
  TalentPoolContactInfo,
  TalentPoolDetail,
  TalentPoolIdentityInfo,
  TalentPoolResume,
  TalentPoolSignInfo,
} from '@/api/model/enterprise/talentpool';

import ContractInfo from './components/ContractInfo.vue';
import PaymentRecords from './components/PaymentRecords.vue';
import ResumeInfo from './components/ResumeInfo.vue';
import TalentSideInfo from './components/TalentSideInfo.vue';
import TaskInfo from './components/TaskInfo.vue';

defineOptions({
  name: 'TalentDetail',
});

const route = useRoute();

const activeTab = ref('profile');
const loading = ref(false);
const detail = ref<TalentPoolDetail | null>(null);

const defaultBasicInfo: TalentPoolBasicInfo = {
  id: 0,
  name: '',
  avatar: '',
  is_auth: false,
  is_signed: false,
  apply_count: 0,
  education: '',
  score: 0,
};

const defaultContactInfo: TalentPoolContactInfo = {
  phone: '',
  phone_masked: '',
};

const defaultBankInfo: TalentPoolBankInfo = {
  holder_name: '',
  bank_name: '',
  bank_card: '',
  bank_card_masked: '',
};

const defaultIdentityInfo: TalentPoolIdentityInfo = {
  id_card: '',
  id_card_masked: '',
  card_front: '',
  card_back: '',
};

const defaultSignInfo: TalentPoolSignInfo = {
  signed_at: null,
  agreement_no: '',
};

const defaultResume: TalentPoolResume = {
  personal_advantage: '',
  education_list: [],
  job_intention: {},
  work_experience_list: [],
  certificate_list: [],
};

const fetchDetail = async () => {
  const rawId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;
  const talentPoolId = Number(rawId);

  if (!talentPoolId) {
    MessagePlugin.warning('人才ID无效');
    return;
  }

  loading.value = true;
  try {
    const res = await getDetail({ talent_pool_id: talentPoolId });
    if (res.code === 200) {
      detail.value = res.data;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetail();
});
</script>
<style lang="less" scoped>
.talent-detail-page {
  :deep(.t-card__body) {
    padding: 0;
  }
}

.page-wrap {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: var(--td-comp-margin-xxl);
}

.right-panel {
  min-width: 0;
}

.detail-card {
  padding: 12px 0 8px;
}

.detail-tabs {
  padding: 0 24px;
}

@media (max-width: 1200px) {
  .page-wrap {
    grid-template-columns: 1fr;
  }
}
</style>
