<template>
  <div class="license-page">
    <section class="license-hero">
      <div class="license-hero__main">
        <div class="license-hero__info">
          <h1 class="license-hero__title">{{ currentPlan.title }}</h1>
          <p class="license-hero__desc">
            您的授权将于 {{ currentPlan.expireDate }} 到期
            <span class="license-hero__desc-highlight">（剩余 {{ currentPlan.remainingDays }} 天）</span>
            ，升级版本让您可解锁更多核心功能与专属权益。
          </p>

          <div class="license-hero__badge">
            <span class="license-hero__badge-icon">✓</span>
            <span>已激活授权</span>
          </div>
        </div>

        <div class="license-hero__actions">
          <t-button theme="default" variant="outline">续费当前方案</t-button>
          <t-button theme="primary">立即升级方案</t-button>
        </div>
      </div>

      <div class="license-hero__seal" aria-hidden="true">
        <div class="license-hero__seal-center"></div>
      </div>

      <div class="license-hero__footer">
        <div class="license-hero__status">
          <span class="license-hero__status-dot"></span>
          <span>授权状态：正常运行中</span>
        </div>
        <div class="license-hero__id">ID:{{ currentPlan.licenseId }}</div>
      </div>
    </section>

    <section class="license-plans">
      <header class="license-plans__header">
        <h2 class="license-plans__title">选择适合您的商业方案</h2>
        <p class="license-plans__subtitle">所有付费版本均提供年度授权支持与优先升级权限</p>
      </header>

      <div class="license-plans__grid">
        <article
          v-for="plan in plans"
          :key="plan.key"
          class="plan-card"
          :class="{
            'plan-card--highlight': plan.key === 'basic',
            'plan-card--dark': plan.key === 'pro',
            'plan-card--disabled': !!plan.disabled,
          }"
        >
          <div v-if="plan.recommendLabel" class="plan-card__badge">{{ plan.recommendLabel }}</div>

          <div class="plan-card__icon" :class="`plan-card__icon--${plan.key}`">
            <span>{{ plan.icon }}</span>
          </div>

          <div class="plan-card__name">{{ plan.name }}</div>
          <div class="plan-card__desc">{{ plan.desc }}</div>

          <div class="plan-card__price">
            <span class="plan-card__price-symbol">¥</span>
            <span class="plan-card__price-value">{{ plan.price }}</span>
            <span class="plan-card__price-unit">/ {{ plan.unit }}</span>
          </div>

          <ul class="plan-card__features">
            <li v-for="feature in plan.features" :key="feature" class="plan-card__feature">
              <span class="plan-card__feature-icon">✓</span>
              <span>{{ feature }}</span>
            </li>
          </ul>

          <button type="button" class="plan-card__action" :disabled="!!plan.disabled">
            {{ plan.actionText }}
          </button>
        </article>
      </div>
    </section>

    <section class="license-contact">
      <div class="license-contact__avatar">
        <div class="license-contact__avatar-head"></div>
        <div class="license-contact__avatar-body"></div>
      </div>
      <div>
        <div class="license-contact__title">联系客服购买商业授权</div>
        <div class="license-contact__phone">020-888-8888</div>
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'SettingCommercialLicense',
});

interface LicensePlan {
  key: 'trial' | 'basic' | 'pro';
  icon: string;
  name: string;
  desc: string;
  price: string;
  unit: string;
  features: string[];
  actionText: string;
  disabled?: boolean;
  recommendLabel?: string;
  title?: string;
  expireDate?: string;
  remainingDays?: number;
  licenseId?: string;
}

const getRemainingDays = (expireDate: string) => {
  const match = expireDate.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) return 0;

  const [, year, month, day] = match;
  const targetDate = new Date(Number(year), Number(month) - 1, Number(day));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diff = targetDate.getTime() - today.getTime();
  return Math.max(Math.ceil(diff / (24 * 60 * 60 * 1000)), 0);
};

const currentPlan: Required<Pick<LicensePlan, 'title' | 'expireDate' | 'remainingDays' | 'licenseId'>> = {
  title: '商业授权基础版',
  expireDate: '2026年12月31日',
  remainingDays: getRemainingDays('2026年12月31日'),
  licenseId: '4545451524',
};

const plans: LicensePlan[] = [
  {
    key: 'trial',
    icon: '△',
    name: '测试版',
    desc: '适合项目初期演示与功能验证',
    price: '免费',
    unit: '7天试用',
    features: ['完整核心功能访问', '1个项目数量', '3个任务数量'],
    actionText: '已申请过试用',
    disabled: true,
  },
  {
    key: 'basic',
    icon: '⌂',
    name: '基础版',
    desc: '适合个人开发者与初创工作室',
    price: '599',
    unit: '年',
    features: ['商业运营授权许可证', '20个项目数量', '50个任务数量'],
    actionText: '续费基础版',
    recommendLabel: '推荐方案',
  },
  {
    key: 'pro',
    icon: '↗',
    name: '专业版',
    desc: '面向大型企业与高并发核心业务',
    price: '1,999',
    unit: '年',
    features: ['1对1 专家IM即时技术支持', '无限项目/任务发布', '源码访问及二次开发权限'],
    actionText: '升级到专业版',
  },
];
</script>
<style lang="less" scoped>
.license-page {
  min-height: calc(100vh - 148px);
  padding: 14px 16px 18px;
  background: linear-gradient(180deg, #f4f7fb 0%, #eef3f9 100%);
}

.license-hero {
  position: relative;
  padding: 32px 36px 22px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #fcfdff 100%);
  box-shadow: 0 10px 28px rgb(31 63 116 / 6%);
  overflow: hidden;
}

.license-hero__main {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  gap: 24px;
}

.license-hero__title {
  margin: 0;
  color: #1f2d3d;
  font-size: 28px;
  line-height: 1.15;
  font-weight: 700;
}

.license-hero__desc {
  margin: 14px 0 0;
  color: #7b8798;
  font-size: 14px;
  line-height: 1.8;
}

.license-hero__desc-highlight {
  color: #2d72ff;
  font-weight: 600;
}

.license-hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 138px;
  height: 38px;
  padding: 0 16px 0 12px;
  margin-top: 30px;
  border-radius: 999px;
  background: linear-gradient(90deg, #1eb8ff 0%, #216cff 100%);
  box-shadow: 0 8px 20px rgb(33 108 255 / 22%);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.license-hero__badge-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgb(255 255 255 / 18%);
  font-size: 12px;
}

.license-hero__actions {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 46px;
}

.license-hero__actions :deep(.t-button) {
  min-width: 132px;
  height: 42px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
}

.license-hero__seal {
  position: absolute;
  top: 18px;
  right: 164px;
  width: 134px;
  height: 134px;
  opacity: 0.12;
}

.license-hero__seal::before,
.license-hero__seal::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 14px solid #8a95a6;
}

.license-hero__seal::after {
  inset: 18px;
  border-width: 8px;
}

.license-hero__seal-center {
  position: absolute;
  inset: 34px;
  border-radius: 50%;
  background: #8a95a6;
}

.license-hero__seal-center::before,
.license-hero__seal-center::after {
  content: '';
  position: absolute;
  top: 54px;
  width: 22px;
  height: 42px;
  background: #8a95a6;
  clip-path: polygon(50% 100%, 0 0, 100% 0);
}

.license-hero__seal-center::before {
  left: 6px;
  transform: rotate(8deg);
}

.license-hero__seal-center::after {
  right: 6px;
  transform: rotate(-8deg);
}

.license-hero__footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 18px;
  border-top: 1px solid #eef3f8;
}

.license-hero__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #7f8b9d;
  font-size: 13px;
}

.license-hero__status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ac26a;
  box-shadow: 0 0 0 4px rgb(42 194 106 / 12%);
}

.license-hero__id {
  color: #9ca7b7;
  font-size: 12px;
}

.license-plans {
  padding-top: 42px;
}

.license-plans__header {
  text-align: center;
}

.license-plans__title {
  margin: 0;
  color: #202a3b;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
}

.license-plans__subtitle {
  margin: 12px 0 0;
  color: #8b95a5;
  font-size: 14px;
}

.license-plans__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 34px;
  max-width: 1160px;
  margin: 38px auto 0;
}

.plan-card {
  position: relative;
  min-height: 486px;
  padding: 34px 28px 28px;
  border-radius: 22px;
  border: 1px solid #e6edf6;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  box-shadow: 0 14px 34px rgb(31 63 116 / 6%);
}

.plan-card--highlight {
  border: 2px solid #2e74ff;
  box-shadow: 0 18px 36px rgb(46 116 255 / 12%);
}

.plan-card--dark {
  border: 0;
  background: linear-gradient(180deg, #1f2a40 0%, #1c2537 100%);
  box-shadow: 0 22px 36px rgb(22 35 57 / 22%);
}

.plan-card__badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 96px;
  height: 28px;
  padding: 0 16px;
  border-radius: 999px;
  background: linear-gradient(90deg, #2d78ff 0%, #195dff 100%);
  color: #fff;
  font-size: 12px;
  line-height: 28px;
  font-weight: 700;
  text-align: center;
  box-shadow: 0 10px 18px rgb(33 108 255 / 24%);
}

.plan-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  background: #eef5ff;
  color: #8ca1b8;
  font-size: 18px;
  font-weight: 700;
}

.plan-card__icon--basic {
  background: #edf4ff;
  color: #2a71ff;
}

.plan-card__icon--pro {
  background: rgb(255 255 255 / 10%);
  color: #86a9ff;
}

.plan-card__name {
  margin-top: 20px;
  color: #202a3b;
  font-size: 20px;
  line-height: 1.2;
  font-weight: 700;
}

.plan-card__desc {
  margin-top: 12px;
  min-height: 40px;
  color: #7f8c9d;
  font-size: 13px;
  line-height: 1.6;
}

.plan-card__price {
  display: flex;
  align-items: flex-end;
  gap: 4px;
  margin-top: 34px;
  color: #202a3b;
}

.plan-card__price-symbol {
  padding-bottom: 7px;
  font-size: 12px;
  font-weight: 700;
}

.plan-card__price-value {
  font-size: 22px;
  line-height: 1;
  font-weight: 800;
}

.plan-card__price-unit {
  padding-bottom: 3px;
  color: #8f9aaa;
  font-size: 14px;
}

.plan-card__features {
  display: grid;
  gap: 16px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.plan-card__feature {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #7d8999;
  font-size: 14px;
  line-height: 1.5;
}

.plan-card__feature-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #5cce7f;
  color: #21b35c;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.plan-card__action {
  position: absolute;
  left: 28px;
  right: 28px;
  bottom: 28px;
  height: 48px;
  border: 0;
  border-radius: 10px;
  background: linear-gradient(90deg, #2877ff 0%, #155ff1 100%);
  box-shadow: 0 10px 18px rgb(33 108 255 / 20%);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
}

.plan-card__action:disabled {
  background: #fff;
  border: 1px solid #e5ebf3;
  box-shadow: none;
  color: #6f7c8e;
  cursor: not-allowed;
}

.plan-card--dark .plan-card__name,
.plan-card--dark .plan-card__price {
  color: #fff;
}

.plan-card--dark .plan-card__desc,
.plan-card--dark .plan-card__price-unit,
.plan-card--dark .plan-card__feature {
  color: rgb(255 255 255 / 72%);
}

.plan-card--dark .plan-card__feature-icon {
  border-color: #2dcc70;
  color: #2dcc70;
}

.plan-card--dark .plan-card__action {
  background: #fff;
  box-shadow: none;
  color: #24324a;
}

.license-contact {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 1160px;
  margin: 34px auto 0;
  padding: 18px 24px;
  border-radius: 18px;
  background: linear-gradient(180deg, #fff 0%, #fbfdff 100%);
  box-shadow: 0 10px 28px rgb(31 63 116 / 6%);
}

.license-contact__avatar {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(180deg, #eff5ff 0%, #d9e8ff 100%);
  overflow: hidden;
  flex-shrink: 0;
}

.license-contact__avatar-head {
  position: absolute;
  top: 8px;
  left: 14px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f7c29b;
}

.license-contact__avatar-body {
  position: absolute;
  left: 9px;
  bottom: 5px;
  width: 26px;
  height: 18px;
  border-radius: 14px 14px 8px 8px;
  background: linear-gradient(180deg, #4e8cff 0%, #2c69ef 100%);
}

.license-contact__title {
  color: #2a3445;
  font-size: 16px;
  font-weight: 700;
}

.license-contact__phone {
  margin-top: 6px;
  color: #97a2b2;
  font-size: 13px;
}

@media (width <= 1320px) {
  .license-plans__grid {
    gap: 20px;
  }
}

@media (width <= 1200px) {
  .license-page {
    padding: 0;
    background: transparent;
  }

  .license-hero {
    padding: 24px 20px 18px;
  }

  .license-hero__main,
  .license-hero__footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .license-hero__actions {
    padding-top: 12px;
    flex-wrap: wrap;
  }

  .license-hero__seal {
    right: -6px;
    top: 8px;
    transform: scale(0.82);
  }

  .license-plans__grid {
    grid-template-columns: 1fr;
  }

  .plan-card {
    min-height: auto;
    padding-bottom: 96px;
  }
}
</style>
