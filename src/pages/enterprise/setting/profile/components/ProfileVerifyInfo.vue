<template>
  <div class="verify-info">
    <div class="section-title">工商注册信息</div>
    <div class="verify-grid">
      <div class="left-fields">
        <div class="field-item">
          <div class="field-label">成立日期</div>
          <div class="field-value">2026-08-18</div>
        </div>
        <div class="field-item">
          <div class="field-label">注册地址</div>
          <div class="field-value">北京市海淀区中关村大街1号院</div>
        </div>
        <div class="field-item">
          <div class="field-label">经营范围</div>
          <div class="field-value field-value-area">
            技术开发、技术推广、技术服务；销售自行开发的产品；软件开发；人工智能基础软件开发。
          </div>
        </div>
      </div>
      <div class="doc-card">
        <div class="doc-title">营业执照</div>
        <div class="license-image">营业执照示例</div>
      </div>
    </div>

    <div class="section-title section-gap">法人信息</div>
    <div class="verify-grid">
      <div class="left-fields">
        <div class="field-item">
          <div class="field-label">姓名</div>
          <div class="field-value">张三</div>
        </div>
        <div class="field-item">
          <div class="field-label">联系电话</div>
          <div class="field-value">189685745477</div>
        </div>
      </div>
      <div class="doc-card">
        <div class="doc-title">身份证</div>
        <div class="id-images">
          <div class="id-image">身份证正面</div>
          <div class="id-image">身份证反面</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'ProfileVerifyInfo',
});
</script>
<style lang="less" scoped>
.verify-info {
  padding: 32px;
  background: #fff;
  border-radius: 8px;
}

.section-title {
  font-size: 30px;
  color: var(--td-text-color-primary);
  font-weight: 600;
  line-height: 1;
  position: relative;
  padding-left: 12px;
  margin-bottom: 22px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 4px;
  height: 100%;
  border-radius: 2px;
  background: var(--td-brand-color);
}

.section-gap {
  margin-top: 34px;
}

.verify-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 500px;
  gap: 22px;
  align-items: start;
}

.left-fields {
  display: grid;
  gap: 16px;
}

.field-label {
  margin-bottom: 8px;
  font-size: 12px;
  color: var(--td-text-color-placeholder);
}

.field-value {
  min-height: 46px;
  border: 1px solid #dfe5ef;
  background: #f7f9fc;
  border-radius: 4px;
  color: #5f6470;
  font-size: 14px;
  padding: 12px 10px;
  line-height: 1.5;
}

.field-value-area {
  min-height: 130px;
}

.doc-card {
  background: #f5f7fc;
  border-radius: 8px;
  padding: 20px 22px;
  min-height: 320px;
}

.doc-title {
  font-size: 13px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.license-image {
  width: 310px;
  height: 190px;
  margin: 34px auto 0;
  border-radius: 6px;
  border: 1px solid #d4dbea;
  background: linear-gradient(135deg, #f9f7ef 0%, #fefdf8 100%);
  color: #8f95a4;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.id-images {
  margin-top: 64px;
  display: flex;
  justify-content: center;
  gap: 44px;
}

.id-image {
  width: 190px;
  height: 114px;
  border-radius: 6px;
  border: 1px solid #cfd8eb;
  background: linear-gradient(135deg, #dff0ff 0%, #f7fbff 100%);
  color: #8f95a4;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
