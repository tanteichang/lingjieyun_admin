<template>
  <div class="enterprise-join-page">
    <div class="page-content">
      <h1 class="title">加入企业</h1>
      <p class="desc">
        {{
          auditPending
            ? '您的加入申请已提交，企业管理员审核通过后即可加入企业。'
            : '请输入企业名称进行搜索，选择目标企业后提交加入申请。'
        }}
      </p>
      <div v-if="!auditPending" class="meta-row">
        <t-tag theme="primary" variant="light">检索结果 {{ filteredEnterprises.length }} 家</t-tag>
        <span v-if="selectedEnterpriseNamePreview" class="selected-pill">
          已选择：{{ selectedEnterpriseNamePreview }}
        </span>
      </div>

      <t-card v-if="!auditPending" :bordered="false" class="join-card">
        <div class="selector-panel">
          <div class="search-row">
            <t-input v-model="keyword" clearable placeholder="请输入企业名称" @enter="handleSearch"> </t-input>
            <t-button theme="primary" @click="handleSearch">搜索</t-button>
            <t-button variant="outline" @click="handleReset">重置</t-button>
          </div>

          <div class="enterprise-result">
            <t-loading :loading="searching" text="搜索中...">
              <div v-if="filteredEnterprises.length" class="enterprise-list">
                <div
                  v-for="item in filteredEnterprises"
                  :key="item.id"
                  class="enterprise-item"
                  :class="{ active: selectedEnterpriseId === item.id }"
                  @click="handleSelect(item.id)"
                >
                  <div class="enterprise-main">
                    <div class="enterprise-name">
                      <span
                        v-for="(segment, idx) in getNameSegments(item.name)"
                        :key="`${item.id}-${idx}`"
                        :class="{ 'keyword-hit': segment.hit }"
                      >
                        {{ segment.text }}
                      </span>
                    </div>
                    <div class="enterprise-extra">
                      <span>统一社会信用代码：{{ item.credit_code || '-' }}</span>
                      <span>地址：{{ item.address || '-' }}</span>
                    </div>
                  </div>
                  <t-radio :checked="selectedEnterpriseId === item.id" @change="() => handleSelect(item.id)" />
                </div>
              </div>
              <t-empty v-else-if="hasSearched" description="暂无匹配企业" />
            </t-loading>
          </div>
        </div>

        <div class="footer-actions">
          <t-button variant="base" theme="default" @click="handleBack">返回</t-button>
          <t-button theme="primary" :disabled="!selectedEnterpriseId" @click="handleJoin">申请加入</t-button>
        </div>
      </t-card>

      <t-card v-else :bordered="false" class="audit-card">
        <div class="audit-icon-wrap">
          <t-icon name="time-filled" class="audit-icon" />
        </div>
        <div class="audit-title">企业审核中</div>
        <div class="audit-text">已提交加入申请：{{ selectedEnterpriseName }}</div>
        <div class="audit-text">预计 1-3 个工作日内完成审核，请耐心等待。</div>
        <div class="footer-actions">
          <t-button theme="primary" @click="handleBack">返回</t-button>
        </div>
      </t-card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { joinEnterprise, searchEnterprise } from '@/api/enterprise/enterprise';
import { useUserLoginAndRegister } from '@/store';

defineOptions({
  name: 'EnterpriseJoin',
});

interface EnterpriseItem {
  id: number;
  name: string;
  credit_code: string;
  address: string;
}

const userSessionStore = useUserLoginAndRegister();

const router = useRouter();
const keyword = ref('');
const searchKeyword = ref('');
const hasSearched = ref(false);
const selectedEnterpriseId = ref<number | null>(null);
const selectedEnterpriseName = ref('');
const auditPending = ref(userSessionStore.pending_join_apply);
const searching = ref(false);

const enterpriseList = ref<EnterpriseItem[]>([]);

const filteredEnterprises = computed(() => {
  const value = searchKeyword.value.trim();
  if (!value) return enterpriseList.value;
  return enterpriseList.value.filter((item) => item.name.includes(value));
});

const selectedEnterpriseNamePreview = computed(() => {
  const selected = filteredEnterprises.value.find((item) => item.id === selectedEnterpriseId.value);
  return selected?.name || '';
});

const handleSearch = async () => {
  searchKeyword.value = keyword.value.trim();
  hasSearched.value = false;
  if (!searchKeyword.value) {
    MessagePlugin.warning('请输入企业名称');
    enterpriseList.value = [];
    return;
  }
  try {
    searching.value = true;
    const { data } = await searchEnterprise({ keyword: searchKeyword.value, limit: 10 });
    enterpriseList.value = data?.list || [];
    hasSearched.value = true;
    selectedEnterpriseId.value = null;
  } catch {
    enterpriseList.value = [];
    hasSearched.value = true;
    MessagePlugin.error('搜索企业失败');
  } finally {
    searching.value = false;
  }
};

const handleReset = () => {
  keyword.value = '';
  searchKeyword.value = '';
  hasSearched.value = false;
  selectedEnterpriseId.value = null;
  enterpriseList.value = [];
};

const handleSelect = (id: number) => {
  selectedEnterpriseId.value = id;
};

const getNameSegments = (name: string) => {
  const query = searchKeyword.value.trim();
  if (!query) return [{ text: name, hit: false }];

  const segments: Array<{ text: string; hit: boolean }> = [];
  let start = 0;
  let matchIndex = name.indexOf(query, start);
  while (matchIndex !== -1) {
    if (matchIndex > start) {
      segments.push({ text: name.slice(start, matchIndex), hit: false });
    }
    segments.push({ text: name.slice(matchIndex, matchIndex + query.length), hit: true });
    start = matchIndex + query.length;
    matchIndex = name.indexOf(query, start);
  }
  if (start < name.length) {
    segments.push({ text: name.slice(start), hit: false });
  }
  return segments.length ? segments : [{ text: name, hit: false }];
};

const handleJoin = () => {
  const selected = filteredEnterprises.value.find((item) => item.id === selectedEnterpriseId.value);
  if (!selected) {
    MessagePlugin.warning('请先选择企业');
    return;
  }

  selectedEnterpriseName.value = selected.name;

  const payload = {
    enterprise_id: selected.id,
  };
  console.log(payload);
  // auditPending.value = true;
  joinEnterprise(payload).then((res) => {
    if (res.code === 200) {
      MessagePlugin.success('加入申请已提交');
      auditPending.value = true;
    } else {
      MessagePlugin.error(res.msg || '加入申请提交失败');
    }
  });
};

const handleBack = () => {
  router.push({ name: 'login' });
};
</script>
<style lang="less" scoped>
.enterprise-join-page {
  min-height: 100vh;
  background: #fff;
}

.page-content {
  width: 1080px;
  margin: 0 auto;
  padding: 40px 0 56px;
}

.title {
  margin: 0;
  font-size: 30px;
  line-height: 38px;
  color: var(--td-text-color-primary);
}

.desc {
  margin: 12px 0 0;
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 22px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 14px 0 16px;
}

.selected-pill {
  padding: 5px 12px;
  border-radius: 999px;
  color: var(--td-text-color-primary);
  font-size: 12px;
  background: var(--td-bg-color-container);
  border: 1px solid var(--td-component-border);
}

.join-card {
  border-radius: var(--td-radius-large);

  :deep(.t-card__body) {
    padding: 24px 24px 20px;
  }
}

.audit-card {
  border-radius: var(--td-radius-large);
  text-align: center;

  :deep(.t-card__body) {
    padding: 48px 24px 40px;
  }
}

.audit-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.audit-icon {
  font-size: 38px;
  color: var(--td-warning-color);
}

.audit-title {
  margin-top: 16px;
  font-size: 24px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.audit-text {
  margin-top: 8px;
  color: var(--td-text-color-secondary);
  font-size: 14px;
  line-height: 22px;
}

.selector-panel {
  max-width: 760px;
  margin: 0 auto;
}

.search-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 10px;
  padding: 0;
  border-radius: 10px;
}

.search-row :deep(.t-input__wrap) {
  border-radius: 10px;
  height: 42px;
}

.enterprise-result {
  margin-top: 8px;
}

.enterprise-list {
  border-radius: 10px;
  border: 1px solid #e7ecf3;
  background: #f7f9fc;
  overflow: hidden;
  max-height: 300px;
  overflow-y: auto;
}

.enterprise-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  cursor: pointer;
  border-bottom: 1px solid #edf1f6;
  transition: background-color 0.2s ease;
}

.enterprise-item:last-child {
  border-bottom: none;
}

.enterprise-item:hover,
.enterprise-item.active {
  background: #eef4ff;
}

.enterprise-main {
  min-width: 0;
}

.enterprise-name {
  color: var(--td-text-color-primary);
  font-size: 13px;
  line-height: 20px;
  font-weight: 500;
}

.keyword-hit {
  color: #1f64ff;
  font-weight: 600;
}

.enterprise-extra {
  margin-top: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  color: var(--td-text-color-secondary);
  font-size: 11px;
  line-height: 18px;
}

.footer-actions {
  display: flex;
  justify-content: center;
  gap: 14px;
  margin-top: 22px;
}

@media (max-width: 1120px) {
  .page-content {
    width: auto;
    padding: 32px 16px 40px;
  }

  .search-row {
    grid-template-columns: 1fr;
  }
}
</style>
