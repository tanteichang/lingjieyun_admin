<template>
  <div>
    <div class="section">
      <div class="section-title">个人信息</div>
      <div class="section-grid">
        <div class="section-item">
          <div class="section-label">姓名</div>
          <div class="section-value">{{ profile.name }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">手机号</div>
          <div class="section-value">{{ profile.phone }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">学历</div>
          <div class="section-value">{{ profile.education }}</div>
        </div>
      </div>
      <div class="section-item full">
        <div class="section-label">个人优势</div>
        <div class="section-value">{{ profile.advantage }}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">教育背景</div>
      <t-timeline class="education-timeline">
        <t-timeline-item v-for="item in educationList" :key="item.school">
          <div class="timeline-content">
            <div class="timeline-row">
              <div class="timeline-title">{{ item.school }}</div>
              <div class="timeline-time">{{ item.time }}</div>
            </div>
            <div class="timeline-row">
              <div class="timeline-text">{{ item.level }}</div>
              <div class="timeline-text">{{ item.major }}</div>
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
          <div class="section-value">{{ intention.role }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">期望薪资</div>
          <div class="section-value">{{ intention.salary }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">期望工作城市</div>
          <div class="section-value">{{ intention.city }}</div>
        </div>
        <div class="section-item">
          <div class="section-label">可到岗时间</div>
          <div class="section-value">{{ intention.onboard }}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">工作经历</div>
      <t-timeline class="experience-timeline">
        <t-timeline-item v-for="item in experienceList" :key="item.company">
          <div class="timeline-content">
            <div class="timeline-row">
              <div class="timeline-title">{{ item.company }}</div>
              <div class="timeline-time">{{ item.time }}</div>
            </div>
            <div class="timeline-row">
              <div class="timeline-text">{{ item.role }}</div>
            </div>
            <div class="timeline-list">
              <div v-for="(desc, index) in item.desc" :key="index" class="timeline-desc">
                {{ index + 1 }}. {{ desc }}
              </div>
            </div>
          </div>
        </t-timeline-item>
      </t-timeline>
    </div>

    <div class="section">
      <div class="section-title">资质证书</div>
      <div class="cert-list">
        <div v-for="(img, index) in certificates" :key="index" class="cert-item">
          <img :src="img" alt="证书" />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
interface ProfileInfo {
  name: string;
  phone: string;
  education: string;
  advantage: string;
}

interface EducationItem {
  school: string;
  time: string;
  level: string;
  major: string;
}

interface IntentionInfo {
  role: string;
  salary: string;
  city: string;
  onboard: string;
}

interface ExperienceItem {
  company: string;
  time: string;
  role: string;
  desc: string[];
}

defineProps<{
  profile: ProfileInfo;
  educationList: EducationItem[];
  intention: IntentionInfo;
  experienceList: ExperienceItem[];
  certificates: string[];
}>();
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
