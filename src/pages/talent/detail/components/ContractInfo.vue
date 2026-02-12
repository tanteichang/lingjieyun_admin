<template>
  <div class="panel">
    <t-empty v-if="!contractList.length" description="暂无签约合同" />
    <div v-else class="contract-grid">
      <div v-for="item in contractList" :key="item.id" class="contract-card">
        <div class="card-status" :class="`status-${item.status}`">{{ item.statusText }}</div>
        <div class="card-main">
          <div class="contract-logo">
            <span class="logo-line line-1" />
            <span class="logo-line line-2" />
            <span class="logo-line line-3" />
          </div>
          <div class="contract-info">
            <div class="contract-name">{{ item.name }}</div>
            <div class="contract-no">NO.{{ item.contractNo }}</div>
            <t-button variant="outline" theme="default" size="small" disabled>电子签署</t-button>
          </div>
        </div>
        <div class="card-foot">
          <div class="sign-time">签约时间: {{ item.signTime }}</div>
          <t-button theme="primary">查看PDF</t-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'TalentContractInfo',
});

interface ContractItem {
  id: string;
  name: string;
  contractNo: string;
  signTime: string;
  status: 'active' | 'ended';
  statusText: string;
}

const contractList: ContractItem[] = [
  {
    id: '1',
    name: '安卓开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'active',
    statusText: '履约中',
  },
  {
    id: '2',
    name: '小程序开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'ended',
    statusText: '已结束',
  },
  {
    id: '1',
    name: '安卓开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'active',
    statusText: '履约中',
  },
  {
    id: '2',
    name: '小程序开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'ended',
    statusText: '已结束',
  },
  {
    id: '1',
    name: '安卓开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'active',
    statusText: '履约中',
  },
  {
    id: '2',
    name: '小程序开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'ended',
    statusText: '已结束',
  },
  {
    id: '1',
    name: '安卓开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'active',
    statusText: '履约中',
  },
  {
    id: '2',
    name: '小程序开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'ended',
    statusText: '已结束',
  },
  {
    id: '1',
    name: '安卓开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'active',
    statusText: '履约中',
  },
  {
    id: '2',
    name: '小程序开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'ended',
    statusText: '已结束',
  },
  {
    id: '1',
    name: '安卓开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'active',
    statusText: '履约中',
  },
  {
    id: '2',
    name: '小程序开发项目确认函',
    contractNo: '54545151474',
    signTime: '2025-12-26 09:15',
    status: 'ended',
    statusText: '已结束',
  },
];
</script>
<style lang="less" scoped>
.panel {
  padding: 24px;
}

.contract-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.contract-card {
  border: 1px solid var(--td-component-stroke);
  background: var(--td-bg-color-container);
  position: relative;
  overflow: hidden;
}

.card-status {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 78px;
  height: 42px;
  border-bottom-left-radius: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.status-active {
  color: var(--td-brand-color);
  background: #edf4ff;
}

.status-ended {
  color: var(--td-text-color-primary);
  background: #f2f3f5;
}

.card-main {
  display: flex;
  gap: 16px;
  padding: 20px 20px 18px;
  min-height: 152px;
}

.contract-logo {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  flex-shrink: 0;
}

.logo-line {
  width: 4px;
  border-radius: 2px;
  display: inline-block;
}

.line-1 {
  height: 16px;
  background: #00d0ff;
}

.line-2 {
  height: 22px;
  background: #ff9c35;
}

.line-3 {
  height: 14px;
  background: #14d59f;
}

.contract-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 2px;
}

.contract-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  line-height: 1.25;
}

.contract-no {
  color: var(--td-text-color-secondary);
  font-size: 14px;
  margin-bottom: 8px;
}

.card-foot {
  border-top: 1px dashed var(--td-component-stroke);
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sign-time {
  color: var(--td-text-color-secondary);
  font-size: 14px;
}

@media (max-width: 1400px) {
  .contract-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 1200px) {
  .card-status {
    font-size: 13px;
    min-width: 64px;
    height: 36px;
  }

  .contract-name {
    font-size: 18px;
  }

  .contract-no {
    font-size: 14px;
  }

  .sign-time {
    font-size: 14px;
  }
}
</style>
