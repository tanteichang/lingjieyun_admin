<template>
  <t-form ref="formRef" :data="formData" :rules="rules" class="cert-form" label-align="top" @submit="handleSubmit">
    <div class="section-title">企业资质信息</div>

    <t-form-item label="营业执照照片" name="_licenseImage">
      <div class="upload-block">
        <div class="form-tip">
          <t-icon name="info-circle-filled" />
          <span>请上传“营业执照”，需年检章齐全，当年注册除外</span>
        </div>
        <div class="upload-line">
          <div class="upload-box">
            <auto-upload
              v-model="formData._licenseImage"
              theme="image"
              accept=".png,.jpeg,.jpg"
              :auto-upload="true"
              :size-limit="{ size: 5, unit: 'MB' }"
            />
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

    <t-form-item label="企业注册名称" name="name">
      <t-input
        v-model="formData.name"
        placeholder="请填写营业执照上的全称，仅支持中国大陆工商局或市场监督管理局登记的企业"
      />
    </t-form-item>

    <t-form-item label="统一社会信用代码" name="credit_code">
      <t-input v-model="formData.credit_code" placeholder="请填写统一社会信用代码" />
    </t-form-item>

    <t-form-item label="企业所属行业" name="industry_id">
      <t-select v-model="formData.industry_id" placeholder="请选择所属行业" :options="industryOptions" />
    </t-form-item>

    <t-form-item label="营业执照注册地址" name="register_address">
      <t-input v-model="formData.register_address" placeholder="营业执照注册地址" />
    </t-form-item>

    <t-form-item label="企业地址" name="_provinceCityAreaValue">
      <province-city-area-picker v-model="formData._provinceCityAreaValue" :item-width="300" />
    </t-form-item>

    <t-form-item label="企业详细地址" name="address_detail">
      <t-input v-model="formData.address_detail" placeholder="请填写经营地址" />
    </t-form-item>

    <t-form-item label="企业联系电话" name="mobile">
      <t-input v-model="formData.mobile" placeholder="请填写电话号码" />
    </t-form-item>

    <t-form-item label="企业联系邮箱" name="email">
      <t-input v-model="formData.email" placeholder="请填写邮箱" />
    </t-form-item>

    <div class="section-title section-gap">法定代表人</div>

    <t-form-item :label="`当前用户 ${userSessionStore.phone} 是否为法人`" name="is_legal_admin">
      <t-radio-group v-model="formData.is_legal_admin">
        <t-radio :value="1">是</t-radio>
        <t-radio :value="0">否</t-radio>
      </t-radio-group>
    </t-form-item>

    <div class="form-tip">
      <t-icon name="info-circle-filled" />
      <span>请上传法人的身份证</span>
    </div>

    <div class="id-upload-line">
      <div class="id-upload-line__item">
        <t-form-item label="法人身份证人像面照片" name="legal_person_id_front">
          <div class="upload-box">
            <auto-upload
              v-model="formData._idCardFrontImage"
              theme="image"
              accept=".png,.jpeg,.jpg"
              :auto-upload="true"
              :size-limit="{ size: 5, unit: 'MB' }"
            />
            <span>身份证人像面照片</span>
          </div>
        </t-form-item>
      </div>
      <div class="id-upload-line__item">
        <t-form-item label="法人身份证国徽面照片" name="legal_person_id_back">
          <div class="upload-box">
            <auto-upload
              v-model="formData._idCardBackImage"
              theme="image"
              accept=".png,.jpeg,.jpg"
              :auto-upload="true"
              :size-limit="{ size: 5, unit: 'MB' }"
            />
            <span>身份证国徽面照片</span>
          </div>
        </t-form-item>
      </div>
    </div>

    <t-form-item label="法人姓名" name="legal_person_name">
      <t-input v-model="formData.legal_person_name" placeholder="请填写法人姓名" />
    </t-form-item>

    <t-form-item label="法人身份证号" name="legal_person_id_no">
      <t-input v-model="formData.legal_person_id_no" placeholder="请填写法人身份证号" />
    </t-form-item>

    <t-form-item label="法人联系电话" name="legal_person_phone">
      <t-input
        v-model="formData.legal_person_phone"
        :disabled="formData.is_legal_admin === 1"
        placeholder="请填写电话号码"
      />
    </t-form-item>

    <div v-if="formData.is_legal_admin === 0">
      <div class="section-title section-gap">
        超级管理员
        <span style="font-size: 18px">（当前用户：{{ userSessionStore.phone }}）</span>
      </div>
      <div class="form-tip">
        <t-icon name="info-circle-filled" />
        <span>请上传超级管理员的身份证</span>
      </div>

      <div class="id-upload-line">
        <div class="id-upload-line__item">
          <t-form-item label="超级管理员身份证人像面照片" name="super_admin_id_front">
            <div class="upload-box">
              <auto-upload
                v-model="formData._superAdminIdCardFrontImage"
                theme="image"
                accept=".png,.jpeg,.jpg"
                :auto-upload="true"
                :size-limit="{ size: 5, unit: 'MB' }"
              />
              <span>身份证人像面照片</span>
            </div>
          </t-form-item>
        </div>
        <div class="id-upload-line__item">
          <t-form-item label="超级管理员身份证国徽面照片" name="super_admin_id_back">
            <div class="upload-box">
              <auto-upload
                v-model="formData._superAdminIdCardBackImage"
                theme="image"
                accept=".png,.jpeg,.jpg"
                :auto-upload="true"
                :size-limit="{ size: 5, unit: 'MB' }"
              />
              <span>身份证国徽面照片</span>
            </div>
          </t-form-item>
        </div>
      </div>

      <t-form-item label="超级管理员姓名" name="super_admin_name">
        <t-input v-model="formData.super_admin_name" placeholder="请填写超级管理员姓名" />
      </t-form-item>

      <t-form-item label="超级管理员身份证号" name="super_admin_id_no">
        <t-input v-model="formData.super_admin_id_no" placeholder="请填写超级管理员身份证号" />
      </t-form-item>

      <t-form-item label="超级管理员联系电话" name="super_admin_phone">
        <t-input
          v-model="formData.super_admin_phone"
          :disabled="formData.is_legal_admin === 0"
          placeholder="请填写电话号码"
        />
      </t-form-item>
    </div>
  </t-form>
</template>
<script setup lang="ts">
import type { FormRule, SubmitContext } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { onBeforeMount, reactive, ref, watch } from 'vue';

import AutoUpload from '@/components/auto-upload/index.vue';
import type { ProvinceCityAreaValue } from '@/components/provinceCityAreaPicker/index.vue';
import ProvinceCityAreaPicker from '@/components/provinceCityAreaPicker/index.vue';
import { useDictStore } from '@/store/modules/enterprise/dict';
import { useUserLoginAndRegister } from '@/store/modules/user';
import { CREDIT_CODE_PATTERN, EMAIL_PATTERN, MOBILE_PATTERN } from '@/utils/pattern';

defineOptions({
  name: 'EnterpriseCertForm',
});

export interface EnterpriseCertFormExpose {
  validateAndGetData: () => Promise<Record<string, any> | null>;
}

const dictStore = useDictStore();
const userSessionStore = useUserLoginAndRegister();
const formRef = ref<any>(null);

const formData = reactive({
  _licenseImage: [],
  _idCardFrontImage: [],
  _idCardBackImage: [],
  _superAdminIdCardFrontImage: [],
  _superAdminIdCardBackImage: [],
  _provinceCityAreaValue: {} as ProvinceCityAreaValue,
  admin_id: '',
  name: '',
  credit_code: '',
  business_license: '',
  register_address: '',
  province_id: '',
  city_id: '',
  district_id: '',
  address_detail: '',
  industry_id: '',
  industry: '',
  is_legal_admin: 1,
  legal_person_name: '',
  legal_person_id_no: '',
  legal_person_id_front: '',
  legal_person_id_back: '',
  legal_person_phone: userSessionStore.phone,
  mobile: '',
  email: '',
  super_admin_name: '',
  super_admin_id_front: '',
  super_admin_id_back: '',
  super_admin_phone: userSessionStore.phone,
  super_admin_id_no: '',
});

const industryOptions = dictStore.getProjectTypeOptions;

watch(
  [() => formData.is_legal_admin, () => userSessionStore.phone || ''],
  ([isLegalAdmin, phone]) => {
    if (!phone) return;
    if (isLegalAdmin === 1) {
      formData.legal_person_phone = phone;
    } else {
      formData.super_admin_phone = phone;
      if (formData.legal_person_phone === phone) {
        formData.legal_person_phone = '';
      }
    }
  },
  { immediate: true },
);

const rules: Record<string, FormRule[]> = {
  _licenseImage: [
    {
      required: true,
      message: '请上传营业执照照片',
      type: 'error',
      validator: (val) => Array.isArray(val) && val.length > 0,
    },
  ],
  name: [{ required: true, message: '请输入企业注册名称', type: 'error' }],
  credit_code: [
    { required: true, message: '请输入统一社会信用代码', type: 'error' },
    { pattern: CREDIT_CODE_PATTERN, message: '请输入正确的统一社会信用代码', type: 'error' },
  ],
  industry_id: [{ required: true, message: '请选择企业所属行业', type: 'error' }],
  mobile: [{ required: true, message: '请输入联系电话', type: 'error' }],
  email: [
    { required: true, message: '请输入联系邮箱', type: 'error' },
    { pattern: EMAIL_PATTERN, message: '请输入正确的邮箱格式', type: 'error' },
  ],
  // legal_person_id_front: [{ required: true, message: '请上传法人身份证人像面照片', type: 'error' }],
  // legal_person_id_back: [{ required: true, message: '请上传法人身份证国徽面照片', type: 'error' }],
  legal_person_name: [{ required: true, message: '请输入法人姓名', type: 'error' }],
  legal_person_id_no: [{ required: true, message: '请输入法人身份证号', type: 'error' }],
  legal_person_phone: [
    { required: true, message: '请输入联系电话', type: 'error' },
    { pattern: MOBILE_PATTERN, message: '请输入正确的手机号', type: 'error' },
  ],
  is_legal_admin: [{ required: true, message: '请选择法人是否为管理员', type: 'error' }],
  // super_admin_id_front: [{ required: true, message: '请上传超级管理员身份证人像面照片', type: 'error' }],
  // super_admin_id_back: [{ required: true, message: '请上传超级管理员身份证国徽面照片', type: 'error' }],
  super_admin_name: [{ required: true, message: '请输入超级管理员姓名', type: 'error' }],
  super_admin_id_no: [{ required: true, message: '请输入超级管理员身份证号', type: 'error' }],
  super_admin_phone: [
    { required: true, message: '请输入联系电话', type: 'error' },
    { pattern: MOBILE_PATTERN, message: '请输入正确的手机号', type: 'error' },
  ],
  register_address: [{ required: true, message: '请输入营业执照注册地址', type: 'error' }],
  _provinceCityAreaValue: [{ required: true, message: '请选择企业经营地址', type: 'error' }],
  address_detail: [{ required: true, message: '请输入企业详细地址', type: 'error' }],
};

const handleSubmit = (ctx: SubmitContext) => {
  // formData.business_license = formData._licenseImage[0].url;
  console.log(formData);
  if (ctx.validateResult !== true) return;
  MessagePlugin.success('提交成功，等待审批');
};

const validateAndGetData = async () => {
  const result = await formRef.value?.validate?.();
  if (result !== true) {
    return null;
  }
  return {
    ...formData,
    business_license: formData._licenseImage[0].url,
    legal_person_id_front: formData._idCardFrontImage[0].url,
    legal_person_id_back: formData._idCardBackImage[0].url,
    super_admin_id_front: formData?._superAdminIdCardFrontImage[0]?.url || '',
    super_admin_id_back: formData?._superAdminIdCardBackImage[0]?.url || '',
    province_id: formData._provinceCityAreaValue.provinceId,
    city_id: formData._provinceCityAreaValue.cityId,
    district_id: formData._provinceCityAreaValue.districtId,
  };
};

defineExpose<EnterpriseCertFormExpose>({
  validateAndGetData,
});

onBeforeMount(() => {
  dictStore.fetchProjectType();
});
</script>
<style lang="less" scoped>
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
  gap: 24px;
  margin-bottom: 20px;
}

.id-upload-line__item {
  flex: 1;
  min-width: 0;
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
  .upload-line {
    flex-wrap: wrap;
    gap: 12px;
  }

  .id-upload-line {
    flex-wrap: wrap;
    gap: 12px;
  }

  .id-upload-line__item {
    flex: 1 1 100%;
  }

  .section-title {
    font-size: 24px;
  }
}
</style>
