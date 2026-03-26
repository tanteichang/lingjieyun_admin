<template>
  <div class="panel">
    <t-empty v-if="!loading && !taskList.length" description="暂无任务信息" />

    <div v-else class="task-panel">
      <div class="task-list-wrap">
        <div class="task-list">
          <div v-for="(item, index) in taskList" :key="item.task_id" class="task-list-item">
            <div class="task-list-item__rail">
              <span class="task-list-item__dot" />
              <span v-if="index !== taskList.length - 1" class="task-list-item__line" />
            </div>

            <div class="task-list-item__content">
              <div class="task-head">
                <div class="task-head__main">
                  <t-link class="task-title" @click="handleDetailClick(item)">
                    {{ item.task_name || item.task_info?.name || '--' }}
                  </t-link>
                  <t-tag
                    class="task-status"
                    :theme="getTaskStatusMeta(item).theme"
                    :color="getTaskStatusMeta(item).color"
                    variant="light"
                  >
                    {{ item.task_status_text || item.member_status_text || '--' }}
                  </t-tag>
                </div>

                <t-button size="large" variant="text" @click="handleDetailClick(item)">
                  <template #icon>
                    <t-icon size="large" name="arrow-right" />
                  </template>
                </t-button>
              </div>

              <div class="task-card">
                <div class="task-info-grid">
                  <div class="task-field">
                    <span class="task-label">任务编号</span>
                    <span class="task-value">{{ item.task_no || item.task_info?.task_no || '--' }}</span>
                  </div>
                  <div class="task-field">
                    <span class="task-label">任务类型</span>
                    <span class="task-value">{{ item.job_name }}</span>
                  </div>
                  <div class="task-field task-field--project">
                    <span class="task-label">所属项目</span>
                    <span class="task-value">{{ item.project_name || item.task_info?.project_name || '--' }}</span>
                  </div>
                  <div class="task-field">
                    <span class="task-label">接单时间</span>
                    <span class="task-value">{{ item.join_time || item.apply_time || '--' }}</span>
                  </div>
                </div>

                <div class="task-summary">
                  <div class="task-field">
                    <span class="task-label">累计发放次数</span>
                    <span class="task-value task-value--accent">{{ item.settlement_count }}</span>
                  </div>
                  <div class="task-field">
                    <span class="task-label">累计发放金额</span>
                    <span class="task-value task-value--accent">{{ item.settlement_amount_total }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <t-pagination
        v-if="total > 0"
        v-model:current="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-size-options="pageSizeOptions"
        show-page-size
        :show-jumper="false"
        class="task-pagination"
        @page-size-change="handlePageSizeChange"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { getTaskList } from '@/api/enterprise/talentpool';
import type { TaskListItem } from '@/api/model/enterprise/talentpool';
import { TASK_STATUS_TAG } from '@/api/model/enterprise/taskModel';

defineOptions({
  name: 'TalentTaskInfo',
});
const route = useRoute();
const router = useRouter();

const loading = ref(false);
const total = ref(0);
const taskList = ref<TaskListItem[]>([]);

const pageSizeOptions = [5, 10, 20];
const pageSize = ref(5);
const currentPage = ref(1);

const fetchTaskList = async () => {
  const rawId = Array.isArray(route.query.id) ? route.query.id[0] : route.query.id;
  const talentPoolId = Number(rawId);
  if (!talentPoolId) {
    MessagePlugin.warning('人才ID无效');
    taskList.value = [];
    total.value = 0;
    return;
  }

  loading.value = true;
  try {
    const res = await getTaskList({
      talent_pool_id: talentPoolId,
      page: currentPage.value,
      limit: pageSize.value,
    });
    if (res.code === 200) {
      taskList.value = res.data?.list || [];
      total.value = res.data?.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

const handleDetailClick = (item: TaskListItem) => {
  router.push({ name: 'TaskDetail', query: { id: item.task_id } });
};

const getTaskStatusMeta = (item: TaskListItem) => {
  return TASK_STATUS_TAG[item.task_status as keyof typeof TASK_STATUS_TAG] || {};
};

const handlePageSizeChange = () => {
  currentPage.value = 1;
};

watch(
  [currentPage, pageSize],
  () => {
    fetchTaskList();
  },
  { immediate: true },
);
</script>
<style lang="less" scoped>
.panel {
  padding: 34px 34px 28px;
}

.task-panel {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.task-list-wrap {
  max-height: 620px;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8px;
}

.task-list {
  display: grid;
  gap: 36px;
}

.task-list-item {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  gap: 0;
}

.task-list-item__rail {
  position: relative;
  display: flex;
  justify-content: center;
}

.task-list-item__dot {
  position: relative;
  z-index: 1;
  width: 10px;
  height: 10px;
  margin-top: 10px;
  border-radius: 50%;
  background: #2f6eff;
  box-shadow: 0 0 0 4px rgb(47 110 255 / 10%);
}

.task-list-item__line {
  position: absolute;
  top: 24px;
  bottom: -36px;
  left: 50%;
  width: 1px;
  background: linear-gradient(180deg, #d5e3ff 0%, #eef3fb 100%);
  transform: translateX(-50%);
}

.task-list-item__content {
  min-width: 0;
  padding-left: 10px;
}

.task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
}

.task-head__main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 14px;
}

.task-title {
  color: #1f2937;
  font-size: 18px;
  line-height: 1.25;
  font-weight: 600;
}

.task-status {
  flex: 0 0 auto;
  white-space: nowrap;
}

.task-action {
  // width: 34px;
  // height: 34px;
  // border: 1px solid #dfe6f2;
  // border-radius: 50%;
  // background: #fff;
  // color: #9aa5bb;
  // display: inline-flex;
  // align-items: center;
  // justify-content: center;
  // flex: 0 0 auto;
  // cursor: pointer;
  // transition:
  //   border-color 0.2s ease,
  //   color 0.2s ease,
  //   box-shadow 0.2s ease;
}

.task-action:hover {
  border-color: #bfcbe0;
  color: #5f6f89;
  box-shadow: 0 4px 14px rgb(19 42 89 / 8%);
}

.task-card {
  border: 1px solid #edf1f7;
  background: #fbfcff;
  padding: 28px 30px 22px;
}

.task-info-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(260px, 1.6fr);
  gap: 20px 42px;
}

.task-field {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.task-field--project {
  align-items: flex-start;
}

.task-label {
  flex: 0 0 auto;
  color: #98a2b3;
  font-size: 14px;
  line-height: 22px;
  white-space: nowrap;
}

.task-value {
  min-width: 0;
  color: #344054;
  font-size: 14px;
  line-height: 22px;
  word-break: break-word;
}

.task-summary {
  display: flex;
  align-items: center;
  gap: 82px;
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px dashed #dfe6f2;
}

.task-value--accent {
  color: #2f6eff;
  font-weight: 500;
}

.task-pagination {
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1500px) {
  .panel {
    padding: 28px 24px 24px;
  }

  .task-list-wrap {
    max-height: 560px;
  }

  .task-card {
    padding: 24px 22px 20px;
  }

  .task-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 24px;
  }

  .task-field--project {
    grid-column: 1 / -1;
  }

  .task-summary {
    gap: 28px;
    flex-wrap: wrap;
  }
}

@media (max-width: 1200px) {
  .panel {
    padding: 24px 20px;
  }

  .task-list-wrap {
    max-height: 520px;
  }

  .task-head {
    align-items: flex-start;
  }

  .task-head__main {
    flex-wrap: wrap;
    gap: 10px;
  }

  .task-info-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 18px 24px;
  }

  .task-summary {
    gap: 28px;
    flex-wrap: wrap;
  }
}

@media (max-width: 900px) {
  .task-panel {
    gap: 18px;
  }

  .task-list-wrap {
    max-height: 460px;
    padding-right: 0;
  }

  .task-list-item {
    grid-template-columns: 18px minmax(0, 1fr);
  }

  .task-list-item__content {
    padding-left: 12px;
  }

  .task-head {
    flex-wrap: wrap;
  }

  .task-head__main {
    flex-wrap: wrap;
    gap: 10px;
  }

  .task-action {
    margin-left: auto;
  }

  .task-card {
    padding: 20px 18px 18px;
  }

  .task-info-grid {
    grid-template-columns: 1fr;
  }

  .task-field {
    flex-wrap: wrap;
    gap: 6px 12px;
  }

  .task-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
