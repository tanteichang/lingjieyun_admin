<template>
  <div class="task-detail-page">
    <task-detail-overview :task-info="taskInfo" />

    <t-card :bordered="false" class="tabs-card">
      <t-tabs v-model="currentTab">
        <t-tab-panel :label="`任务成员 (${memberTotal})`" value="members">
          <memberList
            :task-name="taskInfo?.task_name || taskInfo?.name"
            @update:total="handleUpdateMemberTotal"
            @refresh-task-detail="fetchTaskDetail"
          />
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
import { onActivated, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import { getTaskDetail } from '@/api/enterprise/task';
import type { TaskDetailResult } from '@/api/model/enterprise/taskModel';
import deliverUpload from '@/pages/enterprise/project/deliveryUpload/uploadDetail.vue';
import { useTaskStore } from '@/store/modules/enterprise/task';

defineOptions({
  name: 'TaskDetail',
});

const route = useRoute();
const taskStore = useTaskStore();

import TaskDetailOverview from './components/TaskDetailOverview.vue';
import deliveryList from './deliveryList.vue';
import memberList from './memberList.vue';
import registrationList from './registrationList.vue';

const taskInfo = ref<TaskDetailResult | null>(null);

const currentTab = ref('members');

const memberTotal = ref(0);
const applyPending = ref(0);
const deliveryPending = ref(0);

const fetchTaskDetail = () => {
  const taskId = Number(route.query.id);
  if (!taskId) {
    return;
  }
  getTaskDetail({ task_id: taskId }).then((res) => {
    if (res.code === 200) {
      taskInfo.value = res.data;
    }
  });
};

onMounted(() => {
  fetchTaskDetail();
});

onActivated(() => {
  const taskId = String(route.query.id || '');
  if (!taskId || !taskStore.shouldRefreshTaskDetail(taskId)) {
    return;
  }
  taskStore.clearTaskDetailRefreshMark(taskId);
  fetchTaskDetail();
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

.tabs-card {
  :deep(.t-tabs__nav) {
    margin-bottom: 20px;
  }
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
