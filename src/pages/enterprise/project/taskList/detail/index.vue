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
        <div class="info-item"><span class="label">任务类型</span><span class="value">服务类</span></div>
        <div class="info-item">
          <span class="label">所属项目</span><span class="value">{{ taskInfo.project.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">佣金结算方式</span
          ><span class="value">
            {{ taskInfo.commission }}
            {{ taskInfo.commission_settlement_type_text }}
          </span>
        </div>
        <div class="info-item"><span class="label">发放时间要求</span><span class="value">按日</span></div>
        <div class="info-item"><span class="label">自由招募人数</span><span class="value">0</span></div>
        <div class="info-item"><span class="label">定向招募人数</span><span class="value">5</span></div>
      </div>
    </t-card>

    <t-collapse :expand-icon="true" :borderless="true">
      <t-collapse-panel value="0" header="任务描述">
        <div class="desc-text" v-html="taskInfo?.desc"></div>
      </t-collapse-panel>
      <t-collapse-panel value="1" header="验收标准">
        <div class="desc-text" v-html="taskInfo?.accept"></div>
      </t-collapse-panel>
    </t-collapse>

    <t-card :bordered="false" class="tabs-card">
      <t-tabs v-model="currentTab">
        <t-tab-panel :label="`任务成员 (${memberTotal})`" value="members">
          <memberList @update:total="handleUpdateMemberTotal" />
        </t-tab-panel>
        <t-tab-panel value="apply">
          <template #label>
            <t-badge :count="applyPending" :offset="[0, 0]">
              <span>报名审批&nbsp;&nbsp;</span>
            </t-badge>
          </template>
          <registrationList @update:pending="handleUpdatePending" />
        </t-tab-panel>
        <t-tab-panel value="delivery">
          <template #label>
            <t-badge :count="deliveryPending" :offset="[0, 0]">
              <span>交付物审核&nbsp;&nbsp;</span>
            </t-badge>
          </template>
          <deliveryList @update:pending="handleUpdateDelivery" />
        </t-tab-panel>
        <t-tab-panel label="交付物上传" value="upload">
          <div>sdf</div>
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { TASK_STATUS_TAG } from '@/api/model/taskModel';

defineOptions({
  name: 'TaskDetail',
});

const route = useRoute();

import type { TaskItem } from '@/api/model/taskModel';
import { useTaskStore } from '@/store';

import deliveryList from './deliveryList.vue';
import memberList from './memberList.vue';
import registrationList from './registrationList.vue';

const taskInfo = ref<TaskItem>(null);

const taskStore = useTaskStore();

const currentTab = ref('members');

const memberTotal = ref(0);
const applyPending = ref(0);
const deliveryPending = ref(0);

onMounted(() => {
  const taskID = route.query.taskID as string;
  const task = taskStore.getTask(taskID);
  if (task) {
    taskInfo.value = task;
    console.log(taskInfo.value);
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
  padding: var(--td-comp-paddingLR-xxl);
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
