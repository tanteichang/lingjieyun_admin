<template>
  <div class="panel">
    <t-empty v-if="!taskList.length" description="暂无任务信息" />
    <t-timeline v-else class="task-timeline">
      <t-timeline-item v-for="item in taskList" :key="item.id">
        <div class="task-item">
          <div class="task-head">
            <div class="task-title-wrap">
              <div class="task-title">{{ item.name }}</div>
              <t-tag theme="warning" variant="light">进行中</t-tag>
            </div>
            <div class="task-action">
              <t-button variant="outline" @click="handleDetailClick(item)">
                <t-icon name="arrow-right" />
              </t-button>
            </div>
          </div>
          <div class="task-card">
            <div class="task-grid">
              <div class="task-field">
                <span class="task-label">任务编号</span>
                <span class="task-value">{{ item.code }}</span>
              </div>
              <div class="task-field">
                <span class="task-label">任务类型</span>
                <span class="task-value">{{ item.type }}</span>
              </div>
              <div class="task-field">
                <span class="task-label">所属项目</span>
                <span class="task-value">{{ item.project }}</span>
              </div>
              <div class="task-field">
                <span class="task-label">接单时间</span>
                <span class="task-value">{{ item.acceptTime }}</span>
              </div>
            </div>
            <div class="task-stats">
              <div class="task-field">
                <span class="task-label">累计发放次数</span>
                <span class="task-value accent">{{ item.totalIssueCount }}</span>
              </div>
              <div class="task-field">
                <span class="task-label">累计发放金额</span>
                <span class="task-value accent">{{ item.totalIssueAmount }}</span>
              </div>
            </div>
          </div>
        </div>
      </t-timeline-item>
    </t-timeline>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'TalentTaskInfo',
});

interface TaskItem {
  id: string;
  name: string;
  code: string;
  type: string;
  project: string;
  acceptTime: string;
  totalIssueCount: string;
  totalIssueAmount: string;
}

const taskList: TaskItem[] = [
  {
    id: '1',
    name: '安卓开发',
    code: 'X0487',
    type: '软件开发工程',
    project: '灵捷云服务平台APP项目',
    acceptTime: '2025.12.28',
    totalIssueCount: '10',
    totalIssueAmount: '3686.56',
  },
  {
    id: '2',
    name: '安卓开发',
    code: 'X0487',
    type: '软件开发工程',
    project: '灵捷云服务平台APP项目',
    acceptTime: '2025.12.27',
    totalIssueCount: '10',
    totalIssueAmount: '3686.56',
  },
];

const handleDetailClick = (item: TaskItem) => {
  console.log(item);
};
</script>
<style lang="less" scoped>
.panel {
  padding: 24px;
}

.task-timeline {
  :deep(.t-timeline-item__wrapper) {
    padding-bottom: 28px;
  }

  :deep(.t-timeline-item__dot) {
    background-color: var(--td-brand-color);
    border-color: var(--td-brand-color);
  }

  :deep(.t-timeline-item__tail) {
    border-left-color: var(--td-component-stroke);
  }
}

.task-item {
  width: 100%;
}

.task-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.task-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.task-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  line-height: 22px;
}

.task-action {
  width: 28px;
  height: 28px;
  border: 1px solid var(--td-component-stroke);
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--td-text-color-secondary);
  font-size: 16px;
}

.task-card {
  border: 1px solid var(--td-component-stroke);
  background: #f8f9fc;
  padding: 18px 24px;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 20px 24px;
}

.task-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.task-label {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  white-space: nowrap;
}

.task-value {
  color: var(--td-text-color-primary);
  font-size: 16px;
  word-break: break-all;
}

.task-stats {
  margin-top: 18px;
  border-top: 1px dashed var(--td-component-stroke);
  padding-top: 16px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.task-value.accent {
  color: var(--td-brand-color);
}

@media (max-width: 1200px) {
  .task-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .task-stats {
    grid-template-columns: 1fr;
  }
}
</style>
