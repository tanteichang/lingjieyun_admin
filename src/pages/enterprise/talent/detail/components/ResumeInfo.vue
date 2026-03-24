<template>
  <div>
    <div class="section">
      <div class="section-title">个人信息</div>
      <div class="section-grid">
        <div class="section-item">
          <div class="section-label">姓名</div>
          <div class="section-value">{{ basicInfo.name || '-' }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">学历</div>
          <div class="section-value">{{ basicInfo.education || '-' }}</div>
        </div>
      </div>
      <div class="section-item full">
        <div class="section-label">个人优势</div>
        <div class="section-value">{{ resume.personal_advantage || '-' }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">教育背景</div>
      <t-timeline class="education-timeline">
        <t-timeline-item
          v-for="(item, index) in resume.education_list || []"
          :key="item.school_name || item.school || index"
        >
          <div class="timeline-content">
            <div class="timeline-row">
              <div class="timeline-title">{{ item.school_name || item.school || '-' }}</div>
              <div class="timeline-time">{{ formatRange(item.start_time, item.end_time) }}</div>
            </div>
            <div class="timeline-row">
              <div class="timeline-text">{{ item.education || item.degree || '-' }}</div>
              <div class="timeline-text">{{ item.major || item.major_name || '-' }}</div>
            </div>
          </div>
        </t-timeline-item>
      </t-timeline>
    </div>

    <div class="section">
      <div class="section-title">项目意向</div>
      <div class="section-grid">
        <div class="section-item">
          <div class="section-label">期望岗位</div>
          <div class="section-value">{{ resume.job_intention?.expected_position || '-' }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">期望薪资</div>
          <div class="section-value">{{ resume.job_intention?.expected_salary || '-' }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">期望工作城市</div>
          <div class="section-value">{{ resume.job_intention?.expected_city || '-' }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">可到岗时间</div>
          <div class="section-value">{{ resume.job_intention?.available_time || '-' }}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">工作经历</div>
      <t-timeline class="experience-timeline">
        <t-timeline-item
          v-for="(item, index) in resume.work_experience_list || []"
          :key="item.company_name || item.company || index"
        >
          <div class="timeline-content">
            <div class="timeline-row">
              <div class="timeline-title">{{ item.company_name || item.company || '-' }}</div>
              <div class="timeline-time">{{ formatRange(item.start_time, item.end_time) }}</div>
            </div>
            <div class="timeline-row">
              <div class="timeline-text">{{ item.position || item.role || '-' }}</div>
            </div>
            <div class="timeline-list">
              <div
                v-for="(desc, descIndex) in normalizeDescriptions(item.description || item.desc)"
                :key="descIndex"
                class="timeline-desc"
              >
                {{ descIndex + 1 }}. {{ desc }}
              </div>
            </div>
          </div>
        </t-timeline-item>
      </t-timeline>
    </div>

    <div class="section">
      <div class="section-title">资质证书</div>
      <div class="cert-list">
        <div
          v-for="(item, index) in resume.certificate_list || []"
          :key="item.url || item.image_url || item.image || index"
          class="cert-item"
        >
          <img :src="item.url || item.image_url || item.image" alt="证书" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { TalentPoolBasicInfo, TalentPoolContactInfo, TalentPoolResume } from '@/api/model/enterprise/talentpool';

defineProps<{
  basicInfo: TalentPoolBasicInfo;
  contactInfo: TalentPoolContactInfo;
  resume: TalentPoolResume;
}>();

const formatRange = (start?: string, end?: string) => {
  if (start && end) return `${start} - ${end}`;
  return start || end || '-';
};

const normalizeDescriptions = (value?: string | string[]) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(/[\n；;]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
};
</script>
<style lang="less" scoped>
.section {
  padding: 12px 24px 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--td-text-color-primary);
  margin: 12px 0;
  border-left: 3px solid var(--td-brand-color);
  padding-left: 8px;
}

.section-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.section-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.section-item.full {
  grid-column: 1 / -1;
}

.section-label {
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.section-value {
  font-size: 13px;
  color: var(--td-text-color-primary);
}

.timeline-content {
  flex: 1;
}

.timeline-row {
  display: flex;
  justify-content: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.timeline-title {
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.timeline-time {
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.timeline-text {
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.timeline-list {
  margin-top: 8px;
  display: grid;
  gap: 4px;
}

.timeline-desc {
  color: var(--td-text-color-secondary);
  font-size: 12px;
}

.cert-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
  padding: 8px 0 16px;
}

.cert-item {
  border: 1px solid var(--td-component-stroke);
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cert-item img {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

@media (max-width: 1200px) {
  .section-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
