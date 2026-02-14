<template>
  <div class="enterprise-page">
    <div class="page-content">
      <div class="stepper">
        <div class="step-item active">
          <span class="dot"></span>
          <span class="label">填写企业认证信息</span>
        </div>
        <div class="step-item">
          <span class="dot"></span>
          <span class="label">等待审批</span>
        </div>
        <div class="step-item">
          <span class="dot"></span>
          <span class="label">完成认证</span>
        </div>
      </div>

      <enterprise-cert-form />
    </div>
  </div>
</template>
<script setup lang="ts">
import EnterpriseCertForm from './components/EnterpriseCertForm.vue';

defineOptions({
  name: 'EnterpriseRegister',
});
</script>
<style lang="less" scoped>
.enterprise-page {
  min-height: 100vh;
  background: #fff;
}

.page-content {
  width: 1080px;
  margin: 0 auto;
  padding: 38px 0 64px;
}

.stepper {
  width: 980px;
  margin: 0 auto 50px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

.step-item {
  text-align: center;
  position: relative;
  color: #98a0ae;
}

.step-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 7px;
  left: calc(50% + 12px);
  width: calc(100% - 24px);
  height: 1px;
  background: #d8dde7;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #98a0ae;
  display: inline-block;
  position: relative;
  z-index: 2;
}

.label {
  display: block;
  margin-top: 12px;
  font-size: 13px;
}

.step-item.active {
  color: #0052d9;

  .dot {
    background: #0052d9;
  }
}

@media (max-width: 980px) {
  .page-content {
    width: auto;
    padding: 24px 16px 40px;
  }
}
</style>
