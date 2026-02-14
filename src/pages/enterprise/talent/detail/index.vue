<template>
  <div class="talent-detail-page">
    <div class="page-wrap">
      <talent-side-info :profile="profile" :bank-info="bankInfo" />

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
            :profile="profile"
            :education-list="educationList"
            :intention="intention"
            :experience-list="experienceList"
            :certificates="certificates"
          />
          <task-info v-else-if="activeTab === 'task'" />
          <payment-records v-else-if="activeTab === 'publish'" />
          <contract-info v-else />
        </t-card>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';

import ContractInfo from './components/ContractInfo.vue';
import PaymentRecords from './components/PaymentRecords.vue';
import ResumeInfo from './components/ResumeInfo.vue';
import TalentSideInfo from './components/TalentSideInfo.vue';
import TaskInfo from './components/TaskInfo.vue';

defineOptions({
  name: 'TalentDetail',
});

const activeTab = ref('profile');

const profile = {
  name: '陈龙',
  avatar: 'https://tdesign.gtimg.com/site/avatar.jpg',
  applyCount: 10,
  education: '硕士',
  score: 8,
  idCard: '421243125478749874',
  phone: '17868596688',
  signTime: '2026.01.09 10:39',
  advantage: '擅长拆解复杂目标，制定优先级明确的执行计划（曾用2周完成XX紧急任务，协调3个部门资源，最终提前3天交付）。',
};

const bankInfo = {
  owner: '陈龙',
  bank: '广州招商银行支行',
  cardNo: '685 4575 4857 1477',
};

const educationList = [
  {
    school: '华南理工大学',
    time: '2014.09 - 2017.07',
    level: '硕士',
    major: '管理学学士 | 工商管理',
  },
  {
    school: '北京交通大学',
    time: '2010.09 - 2014.07',
    level: '本科',
    major: '工学学士 | 计算机应用与技术',
  },
];

const intention = {
  role: '开发工程师',
  salary: '10-12K',
  city: '深圳',
  onboard: '一周之内',
};

const experienceList = [
  {
    company: '广州同鑫科技有限公司',
    time: '2020.11 - 至今',
    role: '开发工程师',
    desc: [
      '参与软件的需求分析、详细设计、测试环节',
      '独立完成公司产品（Java Web）模块/服务的功能编码实现',
      '独立完成数据库的设计和实现',
      '带领、协助其他团队成员完成日常版本研发和项目交付',
    ],
  },
  {
    company: '广州新际网络科技有限公司',
    time: '2020.01 - 2020.11',
    role: '开发工程师',
    desc: [
      '参与软件的需求分析、详细设计、测试环节',
      '独立完成公司产品（Java Web）模块/服务的功能编码实现',
      '独立完成数据库的设计和实现',
      '带领、协助其他团队成员完成日常版本研发和项目交付',
    ],
  },
];

const certificates = [
  'https://tdesign.gtimg.com/site/asset/empty.png',
  'https://tdesign.gtimg.com/site/asset/empty.png',
];
</script>
<style lang="less" scoped>
.talent-detail-page {
  padding: var(--td-comp-paddingLR-xxl);

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
