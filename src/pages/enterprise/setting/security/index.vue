<template>
  <div class="security-page">
    <t-card class="section-title-card" :bordered="false">
      <div class="section-title">账户安全</div>
    </t-card>

    <t-card class="security-overview" :bordered="false">
      <div class="overview-wrap">
        <div class="shield-wrap">
          <div class="shield-outer">
            <div class="shield-inner">
              <img src="@/assets/setting/lock.png" alt="账户安全盾牌" />
            </div>
          </div>
        </div>

        <div class="overview-content">
          <div class="level-row">
            <span>您的账户安全级别：</span>
            <span class="level-value">{{ securityLevelText }}</span>
          </div>
          <div class="desc">我们全天候守护您的账户资产与个人信息。定期更新密码是保障安全的最佳实践。</div>
          <div class="score-row">安全评分： {{ securityScore }}/100</div>
          <t-progress :percentage="securityScore" :label="false" theme="line" />
        </div>
      </div>
    </t-card>

    <t-card class="security-actions" :bordered="false">
      <div class="actions-grid">
        <login-password-section />
        <pay-password-section />
        <bind-email-section :is-bound="bindListResult?.platforms?.email?.is_bound" />
        <bind-wechat-section :is-bound="bindListResult?.platforms?.wechat?.is_bound" @bind-result="handleBindResult" />
      </div>
    </t-card>
  </div>
</template>
<script setup lang="ts">
import { computed, onBeforeMount, ref } from 'vue';

import { bindList } from '@/api/enterprise/auth';
import type { BindListResult } from '@/api/model/enterprise/auth';
import { useUserStore } from '@/store';

import BindEmailSection from './components/BindEmailSection.vue';
import BindWechatSection from './components/BindWechatSection.vue';
import LoginPasswordSection from './components/LoginPasswordSection.vue';
import PayPasswordSection from './components/PayPasswordSection.vue';

defineOptions({
  name: 'SettingSecurity',
});

const userStore = useUserStore();

const bindListResult = ref<BindListResult>(null);

const securityLevelMap: Record<number, string> = {
  1: '很弱',
  2: '比较弱',
  3: '弱',
  4: '一般',
  5: '很好',
  6: '较高',
  7: '很高',
  8: '非常高',
};

const securityLevel = computed(() => {
  const level = Number(userStore.userInfo.security_level || 1);
  return Math.min(Math.max(level, 1), 8);
});

const securityLevelText = computed(
  () => userStore.userInfo.security_level_text || securityLevelMap[securityLevel.value],
);

const securityScore = computed(() => Math.round((securityLevel.value / 8) * 100));

const loadBindList = () => {
  return bindList().then((res) => {
    if (res.code === 200) {
      console.log(res.data);
      bindListResult.value = res.data;
    }
  });
};

const handleBindResult = (payload: { success: boolean }) => {
  if (!payload.success) return;
  void loadBindList();
};

onBeforeMount(() => {
  void loadBindList();
});
</script>
<style lang="less" scoped>
.security-page {
  display: grid;
  gap: 14px;
}

.section-title-card,
.security-overview {
  :deep(.t-card__body) {
    padding: 24px;
  }
}

.security-actions {
  background: #f5f7fb;
  border-radius: 20px;

  :deep(.t-card__body) {
    padding: 14px;
  }
}

.section-title {
  font-size: 14px;
  color: var(--td-brand-color);
  font-weight: 600;
}

.overview-wrap {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 22px;
  align-items: center;
}

.shield-wrap {
  display: flex;
  justify-content: center;
}

.shield-outer {
  width: 112px;
  height: 126px;
  border-radius: 28px;
  background: linear-gradient(180deg, #f7fbff 0%, #e8f2ff 100%);
  border: 1px solid #d5e7ff;
  padding: 10px;
  clip-path: polygon(50% 0, 92% 15%, 92% 58%, 50% 100%, 8% 58%, 8% 15%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.shield-inner {
  width: 80px;
  height: 94px;
  clip-path: polygon(50% 0, 92% 15%, 92% 58%, 50% 100%, 8% 58%, 8% 15%);
  background: linear-gradient(180deg, #75adff 0%, #2f6eff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e8f0ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #2f6eff;
}

.level-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.level-value {
  color: var(--td-brand-color);
}

.desc {
  margin-top: 10px;
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.score-row {
  margin-top: 24px;
  margin-bottom: 10px;
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.security-overview {
  :deep(.t-progress--plump .t-progress__bar) {
    height: 12px;
  }
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

@media (width <= 1320px) {
  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 1200px) {
  .overview-wrap,
  .actions-grid {
    grid-template-columns: 1fr;
  }

  .security-actions {
    :deep(.t-card__body) {
      padding: 12px;
    }
  }

  .section-title,
  .level-row {
    font-size: 14px;
  }

  .score-row,
  .desc {
    font-size: 12px;
  }
}
</style>
