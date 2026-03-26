<template>
  <div class="policy-page">
    <aside class="policy-nav">
      <button
        v-for="item in policyItems"
        :key="item.key"
        type="button"
        class="policy-nav__item"
        :class="{ 'policy-nav__item--active': item.key === activeKey }"
        @click="handleSelect(item.key)"
      >
        {{ item.label }}
      </button>
    </aside>

    <section class="policy-content">
      <header class="policy-header">
        <h1 class="policy-title">{{ activeItem.title }}</h1>
        <p class="policy-desc">{{ activeItem.description }}</p>
        <div v-if="activeItem.meta.length" class="policy-meta">
          <span v-for="meta in activeItem.meta" :key="meta" class="policy-meta__item">{{ meta }}</span>
        </div>
      </header>

      <div class="policy-frame-panel">
        <div v-if="frameLoading" class="policy-frame-panel__loading">正在加载文档内容...</div>
        <iframe
          :key="activeItem.key"
          class="policy-frame"
          :src="activeItem.src"
          :title="activeItem.title"
          @load="frameLoading = false"
        />
      </div>
    </section>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';

defineOptions({
  name: 'SettingPolicy',
});

type PolicyKey = 'privacy' | 'agreement';

interface PolicyItem {
  key: PolicyKey;
  label: string;
  title: string;
  description: string;
  meta: string[];
  src: string;
}

const policyItems: PolicyItem[] = [
  {
    key: 'agreement',
    label: '用户协议',
    title: '用户协议',
    description: '平台服务条款、使用规范、权利义务及违约处理等协议内容说明。',
    meta: [],
    src: '/agreement.html',
  },
  {
    key: 'privacy',
    label: '隐私政策',
    title: '隐私政策',
    description: '您在平台使用服务时产生的个人信息处理规则、保护方式与数据使用说明。',
    meta: [],
    src: '/privacy.html',
  },
];

const activeKey = ref<PolicyKey>('privacy');
const frameLoading = ref(true);

const activeItem = computed(() => policyItems.find((item) => item.key === activeKey.value) || policyItems[0]);

const handleSelect = (key: PolicyKey) => {
  activeKey.value = key;
  frameLoading.value = true;
};
</script>
<style lang="less" scoped>
.policy-page {
  min-height: calc(100vh - 148px);
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  background: linear-gradient(180deg, #fbfcff 0%, #f8faff 100%);
  border: 1px solid #e8edf5;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 12px 36px rgb(17 37 75 / 5%);
}

.policy-nav {
  padding: 28px 22px;
  border-right: 1px solid #e8edf5;
  background:
    linear-gradient(180deg, #fcfdff 0%, #f7f9fd 100%),
    linear-gradient(180deg, rgb(64 123 255 / 4%) 0%, transparent 100%);
}

.policy-nav__item {
  position: relative;
  width: 100%;
  height: 52px;
  padding: 0 18px 0 30px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #344054;
  font-size: 16px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.policy-nav__item + .policy-nav__item {
  margin-top: 10px;
}

.policy-nav__item:hover {
  background: rgb(47 110 255 / 6%);
  color: #2454de;
}

.policy-nav__item--active {
  background: linear-gradient(90deg, rgb(47 110 255 / 10%) 0%, rgb(47 110 255 / 4%) 100%);
  color: #2f6eff;
  font-weight: 600;
}

.policy-nav__item--active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(180deg, #3f7bff 0%, #2454de 100%);
}

.policy-content {
  padding: 42px 48px;
  background: #fff;
  overflow: auto;
}

.policy-header {
  padding-bottom: 24px;
  border-bottom: 1px solid #eef2f7;
}

.policy-title {
  margin: 0;
  color: #0f172a;
  font-size: 26px;
  line-height: 1.2;
  font-weight: 700;
}

.policy-desc {
  max-width: 760px;
  margin: 18px 0 0;
  color: #7a8599;
  font-size: 14px;
  line-height: 1.9;
}

.policy-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 20px;
}

.policy-meta__item {
  position: relative;
  padding-left: 12px;
  color: #98a2b3;
  font-size: 12px;
  line-height: 20px;
}

.policy-meta__item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 7px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #c5d0e0;
}

.policy-frame-panel {
  position: relative;
  min-height: 860px;
  margin-top: 28px;
  background: #f8fbff;
  overflow: scroll;
}

.policy-frame-panel__loading {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(255 255 255 / 88%);
  color: #7d8aa5;
  font-size: 14px;
}

.policy-frame {
  width: 100%;
  height: 860px;
  border: 0;
  display: block;
  background: #fff;
}

@media (width <= 1200px) {
  .policy-page {
    grid-template-columns: 220px minmax(0, 1fr);
  }

  .policy-content {
    padding: 32px 28px;
  }
}
</style>
