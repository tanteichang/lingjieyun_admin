<template>
  <t-card :bordered="false" class="page">
    <t-tabs :value="currentStatus" @change="handleTabChange">
      <t-tab-panel v-for="tab in statusTabs" :key="tab.value" :value="tab.value">
        <template #label>
          {{ tab.label }}
          <span :style="{ marginLeft: '5px', color: tab.color }"> ({{ tabCounts[tab.value] ?? 0 }}) </span>
        </template>
      </t-tab-panel>
    </t-tabs>
    <div style="height: 20px"></div>
    <common-table
      row-key="id"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :header-affixed-top="headerAffixedTop"
      :form-config="formConfig"
      :table-config="tableConfig"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #apply_status="{ record }">
        <t-tag :theme="TASK_APPLY_STATUS_TAG[record.apply_status as TaskApplyStatus].theme">{{
          TASK_APPLY_STATUS_TAG[record.apply_status as TaskApplyStatus].label
        }}</t-tag>
      </template>
      <template #op="{ record }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleViewResume(record)">详情</t-link>
          <t-link
            :disabled="record.apply_status !== TaskApplyStatus.pending"
            theme="primary"
            hover="color"
            @click="openConfirm('pass', record)"
            >同意</t-link
          >
          <t-link
            :disabled="record.apply_status !== TaskApplyStatus.pending"
            theme="danger"
            hover="color"
            @click="openConfirm('reject', record)"
            >拒绝</t-link
          >
        </t-space>
      </template>
    </common-table>
    <t-dialog
      v-model:visible="confirmVisible"
      :header="confirmHeader"
      :body="confirmBody"
      :on-cancel="handleConfirmCancel"
      @confirm="handleConfirmSubmit"
    />
    <t-dialog
      v-model:visible="resumeVisible"
      :header="resumeDialogTitle"
      width="960px"
      :footer="false"
      destroy-on-close
    >
      <template #body>
        <t-loading :loading="resumeLoading">
          <div v-if="resumeDetail?.has_resume && resumeDetail.jianli" class="resume-dialog">
            <div class="resume-section">
              <div class="resume-section__title">个人信息</div>
              <div class="resume-grid">
                <div class="resume-item">
                  <div class="resume-item__label">姓名</div>
                  <div class="resume-item__value">{{ resumeDetail.jianli.realname || '-' }}</div>
                </div>
                <div class="resume-item">
                  <div class="resume-item__label">年龄</div>
                  <div class="resume-item__value">{{ resumeDetail.jianli.age || '-' }}</div>
                </div>
                <div class="resume-item">
                  <div class="resume-item__label">手机号</div>
                  <div class="resume-item__value">
                    {{ resumeDetail.jianli.mobile_masked || resumeDetail.jianli.mobile || '-' }}
                  </div>
                </div>
                <div class="resume-item">
                  <div class="resume-item__label">性别</div>
                  <div class="resume-item__value">{{ resumeDetail.jianli.gender_text || '-' }}</div>
                </div>
                <div class="resume-item">
                  <div class="resume-item__label">期望城市</div>
                  <div class="resume-item__value">{{ resumeDetail.jianli.city_name || '-' }}</div>
                </div>
                <div class="resume-item">
                  <div class="resume-item__label">意向岗位</div>
                  <div class="resume-item__value">{{ resumeDetail.jianli.job_name || '-' }}</div>
                </div>
                <div class="resume-item">
                  <div class="resume-item__label">期望报酬</div>
                  <div class="resume-item__value">
                    {{ resumeDetail.jianli.min_value }}-{{ resumeDetail.jianli.max_value }} 元/月
                  </div>
                </div>
                <div class="resume-item resume-item--full">
                  <div class="resume-item__label">个人优势</div>
                  <div class="resume-item__value">{{ resumeDetail.jianli.advantage || '-' }}</div>
                </div>
              </div>
            </div>

            <div class="resume-section">
              <div class="resume-section__title">教育背景</div>
              <t-timeline v-if="resumeDetail.education.length">
                <t-timeline-item v-for="item in resumeDetail.education" :key="item.id">
                  <div class="resume-timeline">
                    <div class="resume-timeline__header">
                      <div class="resume-timeline__title">{{ item.name || '-' }}</div>
                      <div class="resume-timeline__time">
                        {{ formatResumeRange(item.start_time, item.end_time) }}
                      </div>
                    </div>
                    <div class="resume-timeline__meta">学历：{{ dictStore.getEducationLabel(item.education_id) }}</div>
                    <div class="resume-timeline__desc">在校经历：{{ item.desc || '-' }}</div>
                  </div>
                </t-timeline-item>
              </t-timeline>
              <t-empty v-else description="暂无教育背景" />
            </div>

            <div class="resume-section">
              <div class="resume-section__title">工作经历</div>
              <t-timeline v-if="resumeDetail.work_experience.length">
                <t-timeline-item v-for="item in resumeDetail.work_experience" :key="item.id">
                  <div class="resume-timeline">
                    <div class="resume-timeline__header">
                      <div class="resume-timeline__title">{{ item.name || '-' }}</div>
                      <div class="resume-timeline__time">
                        {{ formatResumeRange(item.start_time, item.end_time, item.is_line === 1) }}
                      </div>
                    </div>
                    <div class="resume-timeline__meta">
                      所属部门： {{ [item.department, item.job].filter(Boolean).join(' / ') || '-' }}
                    </div>
                    <div class="resume-timeline__desc">工作内容：{{ item.job_content || '-' }}</div>
                    <div v-if="item.performance" class="resume-timeline__desc">业绩：{{ item.performance }}</div>
                  </div>
                </t-timeline-item>
              </t-timeline>
              <t-empty v-else description="暂无工作经历" />
            </div>

            <div class="resume-section">
              <div class="resume-section__title">项目经历</div>
              <t-timeline v-if="resumeDetail.project_history.length">
                <t-timeline-item v-for="item in resumeDetail.project_history" :key="item.id">
                  <div class="resume-timeline">
                    <div class="resume-timeline__header">
                      <div class="resume-timeline__title">{{ item.name || '-' }}</div>
                      <div class="resume-timeline__time">
                        {{ formatResumeRange(item.start_time, item.end_time) }}
                      </div>
                    </div>
                    <div class="resume-timeline__desc">{{ item.desc || '-' }}</div>
                    <div v-if="item.other" class="resume-timeline__desc">{{ item.other }}</div>
                  </div>
                </t-timeline-item>
              </t-timeline>
              <t-empty v-else description="暂无项目经历" />
            </div>

            <div class="resume-section">
              <div class="resume-section__title">证书信息</div>
              <div v-if="resumeDetail.certificate.length" class="resume-cert-list">
                <button
                  v-for="(item, index) in resumeDetail.certificate"
                  :key="`${item}-${index}`"
                  type="button"
                  class="resume-cert-item"
                  @click="openResumeCertPreview(index)"
                >
                  <img :src="item" alt="证书图片" class="resume-cert-item__image" />
                </button>
              </div>
              <t-empty v-else description="暂无证书信息" />
            </div>
          </div>
          <t-empty v-else description="暂无简历信息" />
        </t-loading>
      </template>
    </t-dialog>
    <t-image-viewer
      v-model:visible="resumeCertPreviewVisible"
      v-model:index="resumeCertPreviewIndex"
      :images="resumeDetail?.certificate || []"
    />
  </t-card>
</template>
<script lang="ts" setup>
import dayjs from 'dayjs';
import { computed, reactive, ref } from 'vue';

import { userResume } from '@/api/enterprise/member';
import { getTaskApplyList, reviewTaskApply } from '@/api/enterprise/task';
import type { Row } from '@/api/model/common';
import type { UserResumeResult } from '@/api/model/enterprise/member';
import type { TaskApplyItem, TaskApplyQuery } from '@/api/model/enterprise/taskModel';
import { TASK_APPLY_STATUS_TAG, TaskApplyStatus } from '@/api/model/enterprise/taskModel';
import type { FormConfig, TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';
import { useDictStore } from '@/store/modules/enterprise/dict';

defineOptions({
  name: 'RegistrationApproval',
});

const dictStore = useDictStore();

type RegistrationRow = TaskApplyItem & Row;

interface ApplyStatusCounts {
  total: number;
  pending: number;
  passed: number;
  rejected: number;
}

const statusTabs: Array<{ label: string; value: keyof ApplyStatusCounts; color: string }> = [
  { label: '全部', value: 'total', color: 'gray' },
  { label: '待审核', value: 'pending', color: 'red' },
  { label: '已通过', value: 'passed', color: 'gray' },
  { label: '已拒绝', value: 'rejected', color: 'gray' },
];

const defaultQuery: TaskApplyQuery & {
  date_range?: string | [string, string];
  keyword_name?: string;
  keyword_mobile?: string;
  keyword_task?: string;
  apply_status?: TaskApplyStatus;
} = {
  page: 1,
  limit: 10,
  date_range: '',
  keyword_name: '',
  keyword_mobile: '',
  keyword_task: '',
  apply_status: undefined,
};

const formConfig: FormConfig<RegistrationRow, keyof RegistrationRow | keyof typeof defaultQuery> = {
  formItem: [
    {
      label: '申请日期',
      name: 'date_range',
      type: 'date-range',
      span: 4,
      placeholder: '请选择申请日期',
      props: {
        clearable: true,
        disableDate: (date: Date) => {
          return date.getTime() > Date.now();
        },
      },
    },
    { label: '姓名', name: 'keyword_name', type: 'input', span: 4, placeholder: '请输入姓名' },
    { label: '电话', name: 'keyword_mobile', type: 'input', span: 4, placeholder: '请输入电话' },
    { label: '任务标题', name: 'keyword_task', type: 'input', span: 5, placeholder: '请输入任务标题' },
  ],
  formData: { ...defaultQuery },
};

const tableConfig: TableConfig<RegistrationRow, keyof RegistrationRow> = {
  tableItem: [
    { title: '姓名', colKey: 'user_info_real_name', width: 100, align: 'center' },
    { title: '手机号码', colKey: 'user_info_mobile', width: 150, align: 'center' },
    { title: '任务标题', colKey: 'task_title', minWidth: 200, ellipsis: true },
    { title: '所属项目', colKey: 'project_name', minWidth: 200, ellipsis: true },
    { title: '所属企业', colKey: 'customer_name', minWidth: 200, ellipsis: true },
    { title: '报名时间', colKey: 'apply_time_text', width: 180, align: 'center' },
    { title: '审核状态', colKey: 'apply_status', width: 120, align: 'center' },
    { title: '操作', colKey: 'op', width: 160, align: 'center', fixed: 'right' },
  ],
};

const currentStatus = ref<keyof ApplyStatusCounts>('total');
const tabCounts = reactive<Record<keyof ApplyStatusCounts, number>>({
  total: 0,
  pending: 0,
  passed: 0,
  rejected: 0,
});
const currentApplyStatus = computed<TaskApplyStatus | undefined>(() => {
  if (currentStatus.value === 'total') {
    return undefined;
  }
  return TaskApplyStatus[currentStatus.value];
});

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<typeof defaultQuery, RegistrationRow>({
  fetcher: async (params) => {
    const { data } = await getTaskApplyList(params as TaskApplyQuery);
    tabCounts.total = data.stats?.total ?? data.total ?? 0;
    tabCounts.pending = data.stats?.pending ?? 0;
    tabCounts.passed = data.stats?.passed ?? 0;
    tabCounts.rejected = data.stats?.rejected ?? 0;
    return {
      list: data.list.map((item, index) => ({
        ...item,
        index: index + 1,
        user_info_real_name: item.user_info?.real_name ?? item.user_info_real_name,
        user_info_mobile: item.user_info?.mobile ?? item.user_info_mobile,
      })),
      total: data.total,
    };
  },
  defaultQuery,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search, handlePageChange } = tableHook;

const handleSearch = (payload?: Partial<typeof defaultQuery>) => {
  search({
    ...payload,
    apply_status: currentApplyStatus.value,
  });
};

const handleReset = () => {
  search({
    ...defaultQuery,
    apply_status: currentApplyStatus.value,
  });
};

const handleTabChange = (value: keyof ApplyStatusCounts) => {
  currentStatus.value = value;
  pagination.current = 1;
  handleSearch();
};

const resumeVisible = ref(false);
const resumeLoading = ref(false);
const resumeRecord = ref<RegistrationRow | null>(null);
const resumeDetail = ref<UserResumeResult | null>(null);
const resumeCertPreviewVisible = ref(false);
const resumeCertPreviewIndex = ref(0);

const resumeDialogTitle = computed(() => {
  const name = resumeRecord.value?.user_info_real_name || resumeRecord.value?.user_info?.real_name || '用户';
  return `${name}的简历信息`;
});

const formatResumeTime = (value?: string | number | null) => {
  if (value === undefined || value === null || value === '') return '';
  if (typeof value === 'number') {
    if (value > 999 && value < 10000) {
      return String(value);
    }
    const timestamp = value > 1_000_000_000_000 ? value : value * 1000;
    return dayjs(timestamp).format('YYYY-MM-DD');
  }
  return value;
};

const formatResumeRange = (start?: string | number | null, end?: string | number | null, current?: boolean) => {
  const startText = formatResumeTime(start);
  const endText = current ? '至今' : formatResumeTime(end);
  if (startText && endText) return `${startText} - ${endText}`;
  return startText || endText || '-';
};

const openResumeCertPreview = (index: number) => {
  resumeCertPreviewIndex.value = index;
  resumeCertPreviewVisible.value = true;
};

const handleViewResume = async (record: RegistrationRow) => {
  resumeRecord.value = record;
  resumeVisible.value = true;
  resumeLoading.value = true;
  resumeDetail.value = null;

  try {
    const res = await userResume({
      user_id: record.user_id,
    });
    if (res.code === 200) {
      resumeDetail.value = res.data;
    }
  } finally {
    resumeLoading.value = false;
  }
};

type ConfirmAction = 'pass' | 'reject';

const confirmVisible = ref(false);
const confirmAction = ref<ConfirmAction>('pass');
const confirmRecord = ref<RegistrationRow | null>(null);

const confirmHeader = computed(() => (confirmAction.value === 'pass' ? '确认同意报名？' : '确认拒绝报名？'));
const confirmBody = computed(() => {
  const record = confirmRecord.value as RegistrationRow | null;
  const name = (record as any)?.user_info_username || record?.user_info?.username || '该用户';
  return confirmAction.value === 'pass' ? `确认同意 ${name} 的报名申请？` : `确认拒绝 ${name} 的报名申请？`;
});

const openConfirm = (action: ConfirmAction, record: RegistrationRow) => {
  confirmAction.value = action;
  confirmRecord.value = record;
  confirmVisible.value = true;
};

const handleConfirmCancel = () => {
  confirmVisible.value = false;
};

const handleConfirmSubmit = () => {
  confirmVisible.value = false;
  if (!confirmRecord.value) {
    return;
  }
  reviewTaskApply({
    apply_id: confirmRecord.value.id,
    apply_status: confirmAction.value === 'pass' ? TaskApplyStatus.passed : TaskApplyStatus.rejected,
    review_remark: '',
  }).then(() => {
    handleSearch();
  });
};
</script>
<style lang="less" scoped>
.page {
  height: 100%;
}

.resume-dialog {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
}

.resume-section {
  padding: 8px 0 16px;
}

.resume-section__title {
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid var(--td-brand-color);
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.resume-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.resume-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resume-item--full {
  grid-column: 1 / -1;
}

.resume-item__label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.resume-item__value {
  font-size: 13px;
  color: var(--td-text-color-primary);
  word-break: break-word;
}

.resume-timeline {
  display: grid;
  gap: 6px;
}

.resume-timeline__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.resume-timeline__title {
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.resume-timeline__time,
.resume-timeline__meta,
.resume-timeline__desc {
  font-size: 12px;
  color: var(--td-text-color-secondary);
  word-break: break-word;
}

.resume-cert-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}

.resume-cert-item {
  border: 1px solid var(--td-component-stroke);
  border-radius: 8px;
  background: #fff;
  padding: 8px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.resume-cert-item:hover {
  border-color: var(--td-brand-color);
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
}

.resume-cert-item__image {
  display: block;
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 4px;
}

@media (max-width: 900px) {
  .resume-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
