<template>
  <div class="project-detail-page">
    <!-- 页面头部 -->
    <t-card :bordered="false" class="project-detail-header">
      <!-- 基本信息 -->
      <div class="basic-info-section">
        <h3 class="section-title">基本信息</h3>
        <div class="basic-info-grid">
          <div class="info-item">
            <span class="info-label">项目编号：</span>
            <span class="info-value">{{ projectInfo.projectCode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目名称：</span>
            <span class="info-value">{{ projectInfo.projectName }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目状态：</span>
            <span :class="['status-tag', projectInfo.status]">{{ projectInfo.statusText }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目时间：</span>
            <span class="info-value">{{ projectInfo.projectTime }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">项目类型：</span>
            <span class="info-value">{{ projectInfo.projectType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">完成所需人数：</span>
            <span class="info-value">{{ projectInfo.requiredPeople }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">发票类型：</span>
            <span class="info-value">{{ projectInfo.invoiceType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所属公司：</span>
            <span class="info-value">{{ projectInfo.company }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">自由报名人数：</span>
            <span class="info-value">{{ projectInfo.registeredPeople }}</span>
          </div>
        </div>
      </div>
    </t-card>
    <t-card :bordered="false" class="project-detail-header">
      <!-- 项目描述 -->
      <div class="project-description">
        <span class="info-label">项目描述：</span>
        <span class="info-value">{{ projectInfo.description }}</span>
      </div>
    </t-card>

    <!-- 内容区域 -->
    <t-card :bordered="false" class="project-detail-content">
      <!-- 标签页 -->
      <t-tabs theme="card" v-model="currentTab" @change="handleTabChange">
        <t-tab-panel label="任务列表" value="tasks">
          <task-list />
        </t-tab-panel>

        <t-tab-panel label="项目成员" value="members">
          <!-- 成员列表 -->
          <div class="members-list-section">
            <t-table :data="memberList" :columns="memberColumns" :row-key="'id'" table-layout="fixed">
              <template #avatar="{ row }">
                <t-avatar size="32">{{ row.name.charAt(0) }}</t-avatar>
              </template>
            </t-table>
          </div>
        </t-tab-panel>

        <t-tab-panel label="操作日志" value="logs">
          <!-- 日志列表 -->
          <div class="logs-list-section">
            <t-table :data="operationLogs" :columns="logColumns" :row-key="'id'" table-layout="fixed">
              <template #action="{ row }">
                <span class="log-action">{{ row.action }}</span>
              </template>
            </t-table>
          </div>
        </t-tab-panel>
      </t-tabs>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

import TaskList from './taskList.vue';

// 响应式数据
const route = useRoute();
const currentTab = ref('tasks');

// 项目基本信息
const projectInfo = ref({
  projectCode: 'XM487',
  projectName: '贵港市政务平台APP项目',
  status: 'processing',
  statusText: '进行中',
  projectTime: '2025-12-28至2026-02-15',
  projectType: '重要类',
  requiredPeople: 3,
  invoiceType: '资讯服务',
  company: '新新网络科技有限公司',
  registeredPeople: 5,
  description:
    '我公司需开展服务类项目，项目不分期完成，预计完成时间为2025-12-28至2026-02-14，需要由包括山客等其他服务商提供服务',
});

// 任务搜索条件
const taskSearch = ref({
  taskName: '',
  taskStatus: '',
});

// 任务状态选项
const taskStatusOptions = [
  { label: '全部', value: '' },
  { label: '进行中', value: 'processing' },
  { label: '已完成', value: 'completed' },
  { label: '已暂停', value: 'paused' },
];

// 任务列表数据
const taskList = ref([
  {
    id: 1,
    taskCode: 'XM487',
    taskName: '贵港市政务平台APP项目',
    taskType: '软件研发',
    settlementMethod: '自由结算',
    status: 'processing',
    statusText: '进行中',
    memberCount: 2,
  },
  {
    id: 2,
    taskCode: 'XM487',
    taskName: '贵港市政务平台APP项目',
    taskType: '软件研发',
    settlementMethod: '自由结算',
    status: 'processing',
    statusText: '进行中',
    memberCount: 2,
  },
  {
    id: 3,
    taskCode: 'XM487',
    taskName: '贵港市政务平台APP项目',
    taskType: '软件研发',
    settlementMethod: '自由结算',
    status: 'processing',
    statusText: '进行中',
    memberCount: 2,
  },
]);

// 项目成员列表
const memberList = ref([
  {
    id: 1,
    name: '张三',
    role: '项目经理',
    joinDate: '2025-12-28',
    status: 'active',
  },
  {
    id: 2,
    name: '李四',
    role: '前端开发',
    joinDate: '2025-12-28',
    status: 'active',
  },
  {
    id: 3,
    name: '王五',
    role: '后端开发',
    joinDate: '2025-12-29',
    status: 'active',
  },
  {
    id: 4,
    name: '赵六',
    role: '测试工程师',
    joinDate: '2025-12-30',
    status: 'active',
  },
  {
    id: 5,
    name: '钱七',
    role: 'UI设计师',
    joinDate: '2026-01-01',
    status: 'active',
  },
]);

// 操作日志
const operationLogs = ref([
  {
    id: 1,
    operator: '管理员',
    action: '创建项目',
    time: '2025-12-28 10:00:00',
    description: '创建了贵港市政务平台APP项目',
  },
  {
    id: 2,
    operator: '张三',
    action: '更新项目信息',
    time: '2025-12-28 14:30:00',
    description: '更新了项目描述和时间安排',
  },
  {
    id: 3,
    operator: '李四',
    action: '添加成员',
    time: '2025-12-29 09:15:00',
    description: '添加了王五为后端开发工程师',
  },
]);

// 任务列表列配置
const taskColumns = [
  {
    title: '序号',
    colKey: 'index',
    width: 60,
    align: 'center' as const,
    render: (h: any, params: any) => h('span', params.index + 1),
  },
  {
    title: '任务编号',
    colKey: 'taskCode',
    width: 100,
  },
  {
    title: '任务名称',
    colKey: 'taskName',
    minWidth: 200,
  },
  {
    title: '任务类型',
    colKey: 'taskType',
    width: 120,
  },
  {
    title: '结算方式',
    colKey: 'settlementMethod',
    width: 120,
  },
  {
    title: '任务状态',
    colKey: 'status',
    width: 100,
    align: 'center' as const,
  },
  {
    title: '成员数量',
    colKey: 'memberCount',
    width: 100,
    align: 'center' as const,
  },
  {
    title: '操作',
    colKey: 'operation',
    width: 80,
    align: 'center' as const,
  },
];

// 成员列表列配置
const memberColumns = [
  {
    title: '头像',
    colKey: 'avatar',
    width: 80,
    align: 'center' as const,
  },
  {
    title: '姓名',
    colKey: 'name',
    width: 120,
  },
  {
    title: '角色',
    colKey: 'role',
    width: 150,
  },
  {
    title: '加入时间',
    colKey: 'joinDate',
    width: 150,
  },
  {
    title: '状态',
    colKey: 'status',
    width: 100,
    align: 'center' as const,
    render: (h: any, params: any) => {
      return h('span', params.row.status === 'active' ? '活跃' : '已退出');
    },
  },
];

// 日志列表列配置
const logColumns = [
  {
    title: '操作人',
    colKey: 'operator',
    width: 120,
  },
  {
    title: '操作类型',
    colKey: 'action',
    width: 120,
  },
  {
    title: '操作时间',
    colKey: 'time',
    width: 180,
  },
  {
    title: '操作描述',
    colKey: 'description',
    minWidth: 300,
  },
];

// 处理标签页切换
const handleTabChange = (value: string | number) => {
  currentTab.value = String(value);
};

// 处理任务搜索
const handleTaskSearch = () => {
  console.log('搜索任务:', taskSearch.value);
  // 这里可以实现实际的搜索逻辑
};

// 重置任务搜索
const resetTaskSearch = () => {
  taskSearch.value = {
    taskName: '',
    taskStatus: '',
  };
};

// 发布任务
const publishTask = () => {
  MessagePlugin.info('发布任务功能开发中');
};

// 查看任务详情
const viewTaskDetail = (taskId: number) => {
  console.log('查看任务详情:', taskId);
  MessagePlugin.info('查看任务详情功能开发中');
};

// 页面加载时获取数据
onMounted(() => {
  // 这里可以实现实际的数据获取逻辑
  console.log('项目详情页面加载');
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
