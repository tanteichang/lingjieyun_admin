<template>
  <t-card class="head-card" :bordered="false">
    <div class="head-wrap">
      <div class="head-left">
        <div class="logo-wrap">
          <div class="company-logo">
            <span class="logo-line line-1" />
            <span class="logo-line line-2" />
            <span class="logo-line line-3" />
          </div>
          <button class="logo-camera" type="button">
            <t-icon name="camera" />
          </button>
        </div>

        <div class="company-meta">
          <div class="company-name">新际网络科技有限公司</div>
          <div class="company-code">统一社会信用代码: 91110108MA00</div>
          <div class="meta-tags">
            <span class="meta-tag">
              <t-icon name="location" />
              广州-番禺
            </span>
            <span class="meta-tag">
              <t-icon name="user" />
              郭先生（法人）
            </span>
          </div>
        </div>
      </div>

      <t-button variant="outline" theme="primary" class="agreement-btn">查看签约协议</t-button>
    </div>
  </t-card>
</template>
<script setup lang="ts">
defineOptions({
  name: 'ProfileHeadCard',
});
</script>
<style lang="less" scoped>
.head-card {
  border-radius: 16px;

  :deep(.t-card__body) {
    padding: 22px;
  }
}

.head-wrap {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.head-left {
  display: flex;
  gap: 18px;
  align-items: center;
}

.logo-wrap {
  width: 170px;
  height: 116px;
  border: 1px solid #dce5f4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.company-logo {
  width: 84px;
  height: 84px;
  border-radius: 12px;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.logo-line {
  width: 6px;
  border-radius: 3px;
  display: inline-block;
}

.line-1 {
  height: 28px;
  background: #00c8ff;
}

.line-2 {
  height: 36px;
  background: #ff9d00;
}

.line-3 {
  height: 42px;
  background: #0de0d2;
}

.logo-camera {
  width: 24px;
  height: 24px;
  border: 0;
  border-radius: 50%;
  position: absolute;
  right: -8px;
  bottom: -8px;
  background: var(--td-brand-color);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgb(0 82 217 / 24%);
}

.company-name {
  font-size: 34px;
  line-height: 1.2;
  font-weight: 600;
  color: var(--td-text-color-primary);
}

.company-code {
  margin-top: 10px;
  font-size: 12px;
  color: var(--td-text-color-secondary);
}

.meta-tags {
  margin-top: 14px;
  display: flex;
  gap: 8px;
}

.meta-tag {
  padding: 0 12px;
  border-radius: 999px;
  height: 28px;
  background: #f1f4f9;
  color: var(--td-text-color-secondary);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.agreement-btn {
  min-width: 130px;
}

@media (max-width: 1400px) {
  .head-wrap {
    flex-direction: column;
    align-items: flex-start;
  }

  .company-name {
    font-size: 22px;
  }
}
</style>
