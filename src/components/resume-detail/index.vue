<template>
  <div v-if="normalized.hasResume" class="resume-detail">
    <div class="resume-section">
      <div class="resume-section__title">个人信息</div>
      <div class="resume-grid">
        <div
          v-for="item in normalized.personalItems"
          :key="item.label"
          class="resume-item"
          :class="{ 'resume-item--full': item.full }"
        >
          <div class="resume-item__label">{{ item.label }}</div>
          <div class="resume-item__value">{{ item.value || '-' }}</div>
        </div>
      </div>
    </div>

    <div class="resume-section">
      <div class="resume-section__title">教育背景</div>
      <t-timeline v-if="normalized.education.length">
        <t-timeline-item v-for="item in normalized.education" :key="item.key">
          <div class="resume-timeline">
            <div class="resume-timeline__header">
              <div class="resume-timeline__title">{{ item.title }}</div>
              <div class="resume-timeline__time">{{ item.time }}</div>
            </div>
            <div v-if="item.meta" class="resume-timeline__meta">{{ item.meta }}</div>
            <div v-for="(desc, index) in item.descList" :key="`${item.key}-${index}`" class="resume-timeline__desc">
              {{ desc }}
            </div>
          </div>
        </t-timeline-item>
      </t-timeline>
      <t-empty v-else />
    </div>

    <div class="resume-section">
      <div class="resume-section__title">工作经历</div>
      <t-timeline v-if="normalized.workExperience.length">
        <t-timeline-item v-for="item in normalized.workExperience" :key="item.key">
          <div class="resume-timeline">
            <div class="resume-timeline__header">
              <div class="resume-timeline__title">{{ item.title }}</div>
              <div class="resume-timeline__time">{{ item.time }}</div>
            </div>
            <div v-if="item.meta" class="resume-timeline__meta">{{ item.meta }}</div>
            <div v-for="(desc, index) in item.descList" :key="`${item.key}-${index}`" class="resume-timeline__desc">
              {{ desc }}
            </div>
          </div>
        </t-timeline-item>
      </t-timeline>
      <t-empty v-else />
    </div>

    <div v-if="normalized.showProjectHistory" class="resume-section">
      <div class="resume-section__title">项目经历</div>
      <t-timeline v-if="normalized.projectHistory.length">
        <t-timeline-item v-for="item in normalized.projectHistory" :key="item.key">
          <div class="resume-timeline">
            <div class="resume-timeline__header">
              <div class="resume-timeline__title">{{ item.title }}</div>
              <div class="resume-timeline__time">{{ item.time }}</div>
            </div>
            <div v-for="(desc, index) in item.descList" :key="`${item.key}-${index}`" class="resume-timeline__desc">
              {{ desc }}
            </div>
          </div>
        </t-timeline-item>
      </t-timeline>
      <t-empty v-else />
    </div>

    <div class="resume-section">
      <div class="resume-section__title">证书信息</div>
      <div v-if="normalized.certificates.length" class="resume-cert-list">
        <button
          v-for="(item, index) in normalized.certificates"
          :key="`${item}-${index}`"
          type="button"
          class="resume-cert-item"
          @click="openPreview(index)"
        >
          <img :src="item" alt="证书图片" class="resume-cert-item__image" />
        </button>
      </div>
      <t-empty v-else />
    </div>

    <t-image-viewer v-model:visible="previewVisible" v-model:index="previewIndex" :images="normalized.certificates" />
  </div>
  <t-empty v-else />
</template>
<script setup lang="ts">
import dayjs from 'dayjs';
import { computed, ref } from 'vue';

import type { UserResumeResult } from '@/api/model/enterprise/member';
import type {
  TalentPoolBasicInfo,
  TalentPoolContactInfo,
  TalentPoolJianli,
  TalentPoolResume,
} from '@/api/model/enterprise/talentpool';
import { useDictStore } from '@/store/modules/enterprise/dict';

interface ResumeItem {
  label: string;
  value: string;
  full?: boolean;
}

interface TimelineItem {
  key: string | number;
  title: string;
  time: string;
  meta?: string;
  descList: string[];
}

type SharedUserResume = Pick<
  UserResumeResult,
  'jianli' | 'certificate' | 'education' | 'work_experience' | 'project_history'
> & {
  has_resume?: boolean;
};

const props = withDefaults(
  defineProps<{
    userResume?: SharedUserResume | TalentPoolJianli | null;
    talentResume?: TalentPoolResume | null;
    basicInfo?: TalentPoolBasicInfo | null;
    contactInfo?: TalentPoolContactInfo | null;
    hasResume?: boolean;
  }>(),
  {
    userResume: null,
    talentResume: null,
    basicInfo: null,
    contactInfo: null,
    hasResume: undefined,
  },
);

const dictStore = useDictStore();

const previewVisible = ref(false);
const previewIndex = ref(0);

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

const normalizeDescriptions = (value?: string | string[] | null) => {
  if (Array.isArray(value)) {
    return value.map((item) => item?.trim()).filter(Boolean) as string[];
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n；;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const openPreview = (index: number) => {
  previewIndex.value = index;
  previewVisible.value = true;
};

const normalized = computed(() => {
  if (props.userResume) {
    const { userResume } = props;
    const base = userResume.jianli;
    const hasResume =
      props.hasResume ??
      Boolean(
        userResume.has_resume !== undefined ? userResume.has_resume && base : base || userResume.education.length,
      );

    return {
      hasResume,
      showProjectHistory: true,
      personalItems: [
        { label: '姓名', value: base?.realname || '-' },
        { label: '年龄', value: String(base?.age ?? '-') },
        { label: '性别', value: base?.gender_text || '-' },
        { label: '期望城市', value: base?.city_name || '-' },
        { label: '意向岗位', value: base?.job_name || '-' },
        {
          label: '期望报酬',
          value:
            base && (base.min_value !== undefined || base.max_value !== undefined)
              ? `${base.min_value ?? '-'}-${base.max_value ?? '-'} 元/月`
              : '-',
        },
        { label: '个人优势', value: base?.advantage || '-', full: true },
      ] as ResumeItem[],
      education: userResume.education.map((item) => ({
        key: item.id,
        title: item.name || '-',
        time: formatResumeRange(item.start_time, item.end_time),
        meta: `学历：${dictStore.getEducationLabel(item.education_id) || '-'}`,
        descList: [`在校经历：${item.desc || '-'}`],
      })) as TimelineItem[],
      workExperience: userResume.work_experience.map((item) => ({
        key: item.id,
        title: item.name || '-',
        time: formatResumeRange(item.start_time, item.end_time, item.is_line === 1),
        meta: `所属部门：${[item.department, item.job].filter(Boolean).join(' / ') || '-'}`,
        descList: [`工作内容：${item.job_content || '-'}`, ...(item.performance ? [`业绩：${item.performance}`] : [])],
      })) as TimelineItem[],
      projectHistory: userResume.project_history.map((item) => ({
        key: item.id,
        title: item.name || '-',
        time: formatResumeRange(item.start_time, item.end_time),
        descList: [
          `项目描述：${item.desc || '-'}`,
          `项目角色：${item.role || '-'}`,
          ...(item.other ? [item.other] : []),
        ],
      })) as TimelineItem[],
      certificates: userResume.certificate || [],
    };
  }

  const resume = props.talentResume;
  const hasResume =
    props.hasResume ??
    Boolean(
      resume &&
        (resume.personal_advantage ||
          resume.education_list?.length ||
          resume.work_experience_list?.length ||
          resume.certificate_list?.length ||
          Object.keys(resume.job_intention || {}).length),
    );

  return {
    hasResume,
    showProjectHistory: false,
    personalItems: [
      { label: '姓名', value: props.basicInfo?.name || '-' },
      { label: '学历', value: props.basicInfo?.education || '-' },
      { label: '手机号', value: props.contactInfo?.phone_masked || props.contactInfo?.phone || '-' },
      { label: '意向岗位', value: resume?.job_intention?.expected_position || '-' },
      { label: '期望报酬', value: resume?.job_intention?.expected_salary || '-' },
      { label: '期望城市', value: resume?.job_intention?.expected_city || '-' },
      { label: '可到岗时间', value: resume?.job_intention?.available_time || '-' },
      { label: '个人优势', value: resume?.personal_advantage || '-', full: true },
    ] as ResumeItem[],
    education: (resume?.education_list || []).map((item, index) => ({
      key: item.school_name || item.school || index,
      title: item.school_name || item.school || '-',
      time: formatResumeRange(item.start_time, item.end_time),
      meta: [item.education || item.degree, item.major || item.major_name].filter(Boolean).join(' / ') || undefined,
      descList: [],
    })) as TimelineItem[],
    workExperience: (resume?.work_experience_list || []).map((item, index) => ({
      key: item.company_name || item.company || index,
      title: item.company_name || item.company || '-',
      time: formatResumeRange(item.start_time, item.end_time),
      meta: item.position || item.role ? `岗位：${item.position || item.role}` : undefined,
      descList: normalizeDescriptions(item.description || item.desc),
    })) as TimelineItem[],
    projectHistory: [] as TimelineItem[],
    certificates: (resume?.certificate_list || [])
      .map((item) => item.url || item.image_url || item.image)
      .filter(Boolean) as string[],
  };
});
</script>
<style lang="less" scoped>
.resume-detail {
  display: grid;
  gap: 8px;
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

@media (max-width: 1200px) {
  .resume-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
