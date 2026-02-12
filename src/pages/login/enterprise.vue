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

      <t-form :data="formData" :rules="rules" class="cert-form" label-align="top" @submit="handleSubmit">
        <div class="section-title">企业资质信息</div>

        <t-form-item label="营业执照照片" name="licenseImage">
          <div class="upload-block">
            <div class="form-tip">
              <t-icon name="info-circle-filled" />
              <span>请上传“营业执照”，需年检章齐全，当年注册除外</span>
            </div>
            <div class="upload-line">
              <div class="upload-box">
                <t-upload theme="image" accept=".png,.jpeg,.jpg" :size-limit="5 * 1024"></t-upload>
              </div>
              <div class="preview-box">
                <img class="preview-license" src="@/assets/login/BusinessLicense.png" alt="营业执照示例" />
              </div>
              <div class="upload-note">
                <p>支持JPG/PNG/JPEG格式的图片</p>
                <p>大小&lt;5M</p>
                <p>营业执照原件的彩色扫描件或复印件，<b>必须加盖公章</b></p>
              </div>
            </div>
          </div>
        </t-form-item>

        <t-form-item label="企业注册名称" name="companyName">
          <t-input
            v-model="formData.companyName"
            placeholder="请填写营业执照上的全称，仅支持中国大陆工商局或市场监督管理局登记的企业"
          />
        </t-form-item>

        <t-form-item label="企业所属行业" name="industry">
          <t-select v-model="formData.industry" placeholder="请选择所属行业" :options="industryOptions" />
        </t-form-item>

        <div class="section-title section-gap">法定代表人</div>
        <div class="form-tip">
          <t-icon name="info-circle-filled" />
          <span>请上传法人的身份证</span>
        </div>

        <div class="id-upload-line">
          <div class="upload-box">
            <t-icon name="add" />
            <span>身份证人像面照片</span>
          </div>
          <div class="upload-box">
            <t-icon name="add" />
            <span>身份证国徽面照片</span>
          </div>
        </div>

        <t-form-item label="法人姓名" name="legalName">
          <t-input v-model="formData.legalName" placeholder="请填写法人姓名" />
        </t-form-item>

        <t-form-item label="联系电话" name="phone">
          <t-input v-model="formData.phone" placeholder="请填写电话号码" />
        </t-form-item>

        <t-form-item label="是否为管理员" name="isAdmin">
          <t-radio-group v-model="formData.isAdmin">
            <t-radio :value="true">是</t-radio>
            <t-radio :value="false">否</t-radio>
          </t-radio-group>
        </t-form-item>

        <div class="submit-wrap">
          <t-button theme="primary" type="submit" class="submit-btn">提交</t-button>
        </div>
      </t-form>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive } from 'vue';

import LogoFullIcon from '@/assets/assets-logo-full.svg?component';
import Layout from '@/layouts/index.vue';

defineOptions({
  name: 'EnterpriseRegister',
});

const formData = reactive({
  licenseImage: 'mock-license',
  companyName: '',
  industry: '',
  legalName: '',
  phone: '',
  isAdmin: true,
});

const industryOptions = [
  { label: '软件开发', value: 'software' },
  { label: '互联网服务', value: 'internet' },
  { label: '人工智能', value: 'ai' },
];

const rules: Record<string, FormRule[]> = {
  licenseImage: [{ required: true, message: '请上传营业执照照片', type: 'error' }],
  companyName: [{ required: true, message: '请输入企业注册名称', type: 'error' }],
  industry: [{ required: true, message: '请选择企业所属行业', type: 'error' }],
  legalName: [{ required: true, message: '请输入法人姓名', type: 'error' }],
  phone: [
    { required: true, message: '请输入联系电话', type: 'error' },
    { pattern: /^1\d{10}$/, message: '请输入正确的手机号', type: 'error' },
  ],
};

const handleSubmit = (ctx: SubmitContext) => {
  if (ctx.validateResult !== true) return;
  MessagePlugin.success('提交成功，等待审批');
};
</script>
<style lang="less" scoped>
.enterprise-page {
  min-height: 100vh;
  background: #fff;
}

.top-header {
  height: 72px;
  padding: 0 28px 0 20px;
  border-bottom: 1px solid #e8ecf3;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.logo {
  width: 170px;
  height: 24px;
}

.search-wrap {
  width: 220px;
  height: 34px;
  border-radius: 18px;
  color: #a7afbd;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-icon {
  font-size: 16px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 18px;
  color: #2f3441;
  font-size: 16px;
}

.user-wrap {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
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

.cert-form {
  :deep(.t-form__item) {
    margin-bottom: 20px;
  }

  :deep(.t-form__label) {
    font-size: 14px;
    color: #212734;
    font-weight: 600;
  }

  :deep(.t-input__wrap),
  :deep(.t-select__wrap) {
    height: 44px;
  }

  :deep(.t-input__inner),
  :deep(.t-select__input-text) {
    font-size: 14px;
  }
}

.section-title {
  font-size: 32px;
  font-weight: 600;
  color: #101828;
  line-height: 1;
  margin-bottom: 26px;
}

.section-gap {
  margin-top: 34px;
  margin-bottom: 14px;
}

.form-tip {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f4cbf;
  font-size: 12px;
  line-height: 1.8;
  margin-bottom: 16px;
}

.upload-line {
  display: flex;
  gap: 22px;
  align-items: center;
}

.upload-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.upload-box {
  width: 236px;
  height: 236px;
  border: 1px dashed #7ea9ff;
  background: #f8fbff;
  border-radius: 8px;
  color: #0052d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  font-size: 24px;

  span {
    font-size: 16px;
    font-weight: 500;
  }
}

.preview-box {
  width: 236px;
  height: 236px;
  border-radius: 8px;
  background: #eff1f6;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-license {
  width: 186px;
  height: 116px;
  border: 1px solid #d8dce6;
  border-radius: 4px;
  background: linear-gradient(135deg, #faf8ef 0%, #fffef9 100%);
  color: #7b8391;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-note {
  color: #a5acb8;
  font-size: 12px;
  line-height: 1.8;
}

.id-upload-line {
  display: flex;
  gap: 40px;
  margin-bottom: 20px;
}

.submit-wrap {
  margin-top: 8px;
}

.submit-btn {
  width: 160px;

  border-radius: 26px;
  font-size: 14px;
}

@media (max-width: 980px) {
  .page-content {
    width: auto;
    padding: 24px 16px 40px;
  }

  .upload-line,
  .id-upload-line {
    flex-wrap: wrap;
    gap: 12px;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>
