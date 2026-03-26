<template>
  <div class="project-detail-page">
    <!-- 页面头部 -->
    <t-card v-if="projectInfo" :bordered="false" class="project-detail-header">
      <!-- 基本信息 -->
      <div class="basic-info-section">
        <h3 class="section-title">基本信息</h3>
        <div class="basic-info-grid">
          <div class="info-item">
            <span class="info-label">项目编号：</span>
            <span class="info-value">{{ projectInfo.pro_no }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目名称：</span>
            <span class="info-value">{{ projectInfo.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目状态：</span>
            <t-tag
              :theme="PROJECT_STATUS_TAG[projectInfo.project_status].theme"
              :color="PROJECT_STATUS_TAG[projectInfo.project_status].color"
              variant="light-outline"
              >{{ PROJECT_STATUS_TAG[projectInfo.project_status].label || '--' }}</t-tag
            >
          </div>
          <div class="info-item">
            <span class="info-label">项目时间：</span>
            <span class="info-value">
              <div><t-tag variant="light" theme="primary">始</t-tag>{{ projectInfo.start_time || '-' }}</div>
              <div><t-tag variant="light" theme="warning">止</t-tag>{{ projectInfo.end_time || '-' }}</div>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">项目类型：</span>
            <span class="info-value">{{ projectInfo.project_type_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">发票类型：</span>
            <span class="info-value">{{ projectInfo.invoice_type_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属公司：</span>
            <span class="info-value">{{ projectInfo.customer_name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">招募人数：</span>
            <span class="info-value">
              <span>需要人数：{{ projectInfo.required_personnel }}</span>
              <span
                >已招募 自由：{{ projectInfo.free_recruitment_count }} 定向：{{ projectInfo.direct_recruitment_count }}
              </span>
            </span>
          </div>

          <div class="info-item">
            <span class="info-label">自由报名人数：</span>
            <span class="info-value">{{ projectInfo.free_recruitment_count }}</span>
          </div>
        </div>
      </div>
    </t-card>
    <t-card :bordered="false" class="project-detail-header">
      <!-- 项目描述 -->
      <div class="project-description">
        <span class="info-label">项目描述：</span>
        <span class="info-value">{{ projectInfo.desc }}</span>
      </div>
    </t-card>

    <!-- 内容区域 -->
    <t-card :bordered="false" class="project-detail-content">
      <!-- 标签页 -->
      <t-tabs v-model="currentTab" @change="handleTabChange">
        <t-tab-panel key="tasks" :label="`任务列表 (${taskTotal || 0})`" value="tasks" :destroy-on-hide="false">
          <task-list @update:total="updateTaskTotal" />
        </t-tab-panel>
        <!-- <t-tab-panel
          key="members"
          :label="`项目成员 (${memberTotal || '-'}人)`"
          value="members"
          :destroy-on-hide="false"
        >
          <member-list @update:total="updateMemberTotal" />
        </t-tab-panel> -->

        <t-tab-panel key="logs" :label="`操作日志 ${logTotalText}`" value="logs" :destroy-on-hide="false" :lazy="true">
          <!-- 日志列表 -->
          <log-list @update:total="updateLogTotal" />
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import type { ProjectItem } from '@/api/model/enterprise/projectModel';
import { PROJECT_STATUS_TAG, ProjectStatus } from '@/api/model/enterprise/projectModel';
import { useProjectStore } from '@/store/modules/enterprise/project';

const projectStore = useProjectStore();

import LogList from './logList.vue';
// import MemberList from './memberList.vue';
import TaskList from './taskList.vue';

// 响应式数据
const route = useRoute();
const currentTab = ref('tasks');
const taskTotal = ref(0);
const memberTotal = ref(0);
const logTotal = ref(0);

const logTotalText = computed(() => {
  return logTotal.value > 0 ? `(${logTotal.value})` : '';
});

// 更新任务总数
const updateTaskTotal = (total: number) => {
  taskTotal.value = total;
};

// 更新成员总数
const updateMemberTotal = (total: number) => {
  memberTotal.value = total;
};

// 更新日志总数
const updateLogTotal = (total: number) => {
  logTotal.value = total;
};

// 项目基本信息
const projectInfo = ref<ProjectItem>({
  id: '', // 唯一标识
  pro_no: '', // 项目编号
  name: '', // 项目名称
  desc: '', // 项目描述
  invoice_type_name: '', // 发票类型
  enterprise_name: '', // 所属企业
  projectTime: '', // 项目时间
  start_time: '', // 项目开始时间
  end_time: '', // 项目结束时间
  task_count: 0, // 任务数量
  project_status: ProjectStatus.NotStarted, // 项目状态（枚举值）
  required_personnel: 0, // 所需人员数量表
  direct_recruitment_count: 0, // 定向招募人数
  free_recruitment_count: 0, // 自由招募人数
  customer_name: '', // 所属客户
});

// 处理标签页切换
const handleTabChange = (value: string | number) => {
  currentTab.value = String(value);
};

// 页面加载时获取数据
onMounted(() => {
  // 这里可以实现实际的数据获取逻辑
  console.log('路由参数:', route);
  const projectId = route.query.projectID as string;
  const project = projectStore.getProject(projectId);
  console.log('项目详情:', project);
  if (project) {
    projectInfo.value = project;
  }
});
</script>
<style lang="less" scoped>
.project-detail-page {
  // padding: 20px;
  // min-height: 100vh;
}

/* 头部区域 */
.project-detail-header {
  margin-bottom: 20px;

  .project-detail-title {
    margin-bottom: 20px;

    .page-title {
      font-size: 20px;
      font-weight: 600;
      color: #181818;
      margin: 0;
    }
  }
}

/* 基本信息区域 */
.basic-info-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #181818;
    margin-bottom: 16px;
    padding-bottom: 8px;
  }

  .basic-info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  .info-item {
    display: flex;
    align-items: flex-start;

    .info-label {
      font-size: 14px;
      color: #666;
      min-width: 100px;
      margin-right: 12px;
    }

    .info-value {
      font-size: 14px;
      color: #181818;
      flex: 1;
      word-break: break-word;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  }

  .project-description {
    display: flex;
    align-items: flex-start;
    margin-top: 16px;

    .info-label {
      font-size: 14px;
      color: #666;
      min-width: 100px;
      margin-right: 12px;
    }

    .info-value {
      font-size: 14px;
      color: #181818;
      flex: 1;
      line-height: 1.5;
      word-break: break-word;
    }
  }
}

/* 内容区域 */
.project-detail-content {
  /* 标签页样式 */
  :deep(.t-tabs__nav) {
    margin-bottom: 20px;
  }

  /* 任务搜索区域 */
  .task-search-section {
    margin-bottom: 20px;

    .search-form {
      display: flex;
      align-items: center;
      gap: 12px;

      .search-input {
        width: 240px;
      }

      .search-select {
        width: 180px;
      }
    }
  }

  /* 列表区域 */
  .task-list-section,
  .members-list-section,
  .logs-list-section {
    :deep(.t-table) {
      /* 表格头部 */
      .t-table__header {
        background-color: #fafafa;
      }

      /* 表格行 */
      .t-table__row {
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
}

/* 状态标签样式 */
.status-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;

  &.processing {
    background-color: #fff1f0;
    color: #ff4d4f;
  }

  &.completed {
    background-color: #f6ffed;
    color: #52c41a;
  }

  &.paused {
    background-color: #e6f7ff;
    color: #1890ff;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .project-detail-page {
    padding: 12px;
  }

  .basic-info-grid {
    grid-template-columns: 1fr;
  }

  .search-form {
    flex-direction: column;
    align-items: stretch;

    .search-input,
    .search-select {
      width: 100% !important;
    }
  }

  :deep(.t-table) {
    table-layout: auto !important;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .basic-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-form {
    flex-wrap: wrap;
  }
}
</style>
