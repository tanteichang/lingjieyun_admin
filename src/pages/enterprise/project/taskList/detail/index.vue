<template>
  <div class="task-detail-page">
    <t-card v-if="taskInfo" :bordered="false" class="basic-card">
      <h3 class="section-title">基本信息</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">任务编号</span><span class="value">{{ taskInfo.task_no }}</span>
        </div>
        <div class="info-item">
          <span class="label">任务名称</span><span class="value">{{ taskInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">任务状态</span>
          <t-tag>{{ TASK_STATUS_TAG[taskInfo.task_status].label }}</t-tag>
        </div>
        <div class="info-item">
          <span class="label">任务时间</span
          ><span class="value">{{ taskInfo.start_time }} - {{ taskInfo.end_time }}</span>
        </div>
        <div class="info-item">
          <span class="label">任务类型</span><span class="value">{{ taskInfo.job_name }}</span>
        </div>
        <div class="info-item">
          <span class="label">所属项目</span><span class="value">{{ taskInfo.project.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">招募方式</span><span class="value">{{ taskInfo.recruitment_type_text }}</span>
        </div>
        <div class="info-item">
          <span class="label">佣金结算方式</span
          ><span class="value">
            {{ commissionSettlementTypeText }}
          </span>
        </div>

        <div class="info-item">
          <span class="label">招募人数</span><span class="value">{{ taskInfo.required_personnel }}</span>
        </div>
      </div>
    </t-card>

    <t-collapse :expand-icon="true" :borderless="true" class="detail-collapse">
      <t-collapse-panel value="0" header="任务描述">
        <div class="desc-text" v-html="taskInfo?.desc"></div>
      </t-collapse-panel>
      <t-collapse-panel value="1" header="验收标准">
        <div class="desc-text" v-html="taskInfo?.accept"></div>
      </t-collapse-panel>
      <t-collapse-panel value="2" header="交付物要求">
        <div class="desc-text" v-html="taskInfo?.delivery_standard"></div>
      </t-collapse-panel>
    </t-collapse>

    <t-card :bordered="false" class="tabs-card">
      <t-tabs v-model="currentTab">
        <t-tab-panel :label="`任务成员 (${memberTotal})`" value="members">
          <memberList :task-name="taskInfo?.name" @update:total="handleUpdateMemberTotal" />
        </t-tab-panel>
        <t-tab-panel value="apply" :destroy-on-hide="false">
          <template #label>
            <t-badge :count="applyPending" :offset="[0, 0]">
              <span>报名审批&nbsp;&nbsp;</span>
            </t-badge>
          </template>
          <registrationList @update:pending="handleUpdatePending" />
        </t-tab-panel>
        <t-tab-panel value="delivery" :destroy-on-hide="false">
          <template #label>
            <t-badge :count="deliveryPending" :offset="[0, 0]">
              <span>交付物审核&nbsp;&nbsp;</span>
            </t-badge>
          </template>
          <deliveryList @update:pending="handleUpdateDelivery" />
        </t-tab-panel>
        <t-tab-panel label="交付物上传" value="upload">
          <deliverUpload :show-basic-info="false" mode="switch" />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { SETTLEMENT_TYPE_MAP, TASK_STATUS_TAG } from '@/api/model/enterprise/taskModel';

defineOptions({
  name: 'TaskDetail',
});

const route = useRoute();

import type { TaskItem } from '@/api/model/enterprise/taskModel';
import deliverUpload from '@/pages/enterprise/project/deliveryUpload/uploadDetail.vue';
import { useTaskStore } from '@/store/modules/enterprise/task';

import deliveryList from './deliveryList.vue';
import memberList from './memberList.vue';
import registrationList from './registrationList.vue';

const taskInfo = ref<TaskItem>(null);

const taskStore = useTaskStore();

const currentTab = ref('members');

const memberTotal = ref(0);
const applyPending = ref(0);
const deliveryPending = ref(0);

const commissionSettlementTypeText = computed(() => {
  if (taskInfo.value?.commission_max && taskInfo.value?.commission_min) {
    return `${SETTLEMENT_TYPE_MAP[taskInfo.value.settlement_type]} / ${taskInfo.value.commission_min} - ${taskInfo.value.commission_max} 元/人`;
  }
  return `${SETTLEMENT_TYPE_MAP[taskInfo.value.settlement_type]} / ${taskInfo.value.commission} 元/人`;
});

onMounted(() => {
  const taskID = route.query.id as string;
  const task = taskStore.getTask(taskID);
  if (task) {
    taskInfo.value = task;
  }
});

const handleUpdateMemberTotal = (total: number) => {
  memberTotal.value = total;
};
const handleUpdatePending = (pending: number) => {
  applyPending.value = pending;
};
const handleUpdateDelivery = (pending: number) => {
  deliveryPending.value = pending;
};
</script>
<style lang="less" scoped>
.task-detail-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  margin: 0 0 12px;
  font-size: 16px;
  font-weight: 600;
  color: #181818;
}

.tabs-card {
  :deep(.t-tabs__nav) {
    margin-bottom: 20px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px 16px;
}

.info-item {
  display: flex;
  gap: 8px;
  font-size: 14px;

  .label {
    color: #666;
    min-width: 96px;
  }

  .value {
    color: #181818;
    flex: 1;
  }
}

.desc-text {
  margin: 0 0 12px;
  color: #333;
  line-height: 1.6;
}

.detail-collapse {
  border-radius: 6px;
  overflow: hidden;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 16px;
  gap: 12px;

  :deep(.t-form) {
    flex: 1;
  }
}

.actions {
  flex-shrink: 0;
}
</style>
