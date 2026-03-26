<template>
  <div class="bank-card-page">
    <div class="section-head">
      <div class="section-title">银行卡信息</div>
      <t-button
        v-if="bankList.length"
        theme="primary"
        class="add-bank-btn"
        :disabled="!canOperate"
        @click="openAddDialog"
        >添加银行卡</t-button
      >
    </div>

    <t-loading :loading="loading">
      <div v-if="bankList.length" class="bank-card-grid">
        <div
          v-for="item in bankList"
          :key="item.id"
          class="bank-card-item"
          :class="{ 'bank-card-item--default': item.is_default === 1 }"
        >
          <div class="bank-card-item__top">
            <div class="bank-card-item__number">{{ item.card_no_masked || '-' }}</div>
            <t-link v-if="item.can_operate && canOperate" theme="primary" hover="color" @click="handleRemove(item)">
              解绑
            </t-link>
          </div>

          <div class="bank-card-item__meta">{{ item.bank_name || '-' }} ｜ {{ item.account_name || '-' }}</div>

          <div class="bank-card-item__footer">
            <div class="bank-card-item__label">默认提现账户</div>
            <t-switch
              :value="item.is_default === 1"
              :disabled="!item.can_operate || item.is_default === 1"
              @change="(value) => handleSetDefault(item, value)"
            />
          </div>
        </div>
      </div>
      <div v-else class="bank-card-empty">
        <div class="bank-card-empty__illustration">
          <div class="bank-card-empty__card bank-card-empty__card--back"></div>
          <div class="bank-card-empty__card bank-card-empty__card--front">
            <span class="bank-card-empty__plus">+</span>
          </div>
        </div>
        <div class="bank-card-empty__title">暂无对公银行账户</div>
        <div class="bank-card-empty__desc">您尚未绑定任何对公银行账户，绑定后即可进行余额提现、资金结算等操作。</div>
        <t-button theme="primary" class="bank-card-empty__action" :disabled="!canOperate" @click="openAddDialog">
          <template #icon>
            <t-icon name="add" />
          </template>
          立即添加银行卡
        </t-button>
      </div>
    </t-loading>

    <t-dialog
      v-model:visible="dialogVisible"
      class="bank-dialog"
      width="700px"
      :footer="false"
      @close="handleCloseDialog"
    >
      <div class="bind-bank-dialog">
        <div class="bind-bank-dialog__title">绑定对公账户</div>
        <div class="bind-bank-dialog__subtitle">请核对企业信息，确保提现资金安全到账</div>
        <div class="bind-bank-card">
          <t-form ref="formRef" :data="formData" :rules="rules" label-align="top" colon>
            <t-form-item label="公司名称" name="company_name">
              <t-input v-model="formData.company_name" class="bank-input" placeholder="请输入企业名称" clearable>
                <template #prefix-icon>
                  <t-icon name="town" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item label="对公银行账户" name="card_no">
              <t-input v-model="formData.card_no" class="bank-input" placeholder="请输入企业对公银行账号" clearable>
                <template #prefix-icon>
                  <t-icon name="creditcard" />
                </template>
              </t-input>
            </t-form-item>

            <t-form-item label="开户行名称" name="bank_name">
              <t-input
                v-model="formData.bank_name"
                class="bank-input"
                placeholder="例如：中国工商银行北京分行XX支行"
                clearable
              >
                <template #prefix-icon>
                  <t-icon name="location-1" />
                </template>
              </t-input>
            </t-form-item>

            <t-button theme="primary" class="bind-bank-submit" :loading="submitLoading" @click="handleSubmit">
              确认绑定
            </t-button>
          </t-form>

          <div class="bind-bank-dialog__safe-tip">SSL 加密传输，保障企业账户安全</div>
        </div>

        <div class="bind-bank-dialog__bottom-tip">
          如需更换公司名称，请联系
          <t-link theme="primary" hover="color">人工客服</t-link>
        </div>
      </div>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRules, SwitchValue } from 'tdesign-vue-next';
import { DialogPlugin, MessagePlugin } from 'tdesign-vue-next';
import { onMounted, reactive, ref } from 'vue';

import { addBank, getBankList, removeBank, setDefaultBank } from '@/api/enterprise/bank';
import type { BankItem } from '@/api/model/enterprise/bank';

defineOptions({
  name: 'ProfileBankCard',
});

const props = defineProps<{
  companyName?: string;
}>();

const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const bankList = ref<BankItem[]>([]);
const canOperate = ref(false);
const formRef = ref<FormInstanceFunctions>();

const createInitialForm = () => ({
  bank_name: '',
  card_no: '',
  company_name: props.companyName || '',
});

const formData = reactive(createInitialForm());

const rules: FormRules = {
  bank_name: [{ required: true, message: '请输入开户行', type: 'error' }],
  card_no: [
    { required: true, message: '请输入银行卡号', type: 'error' },
    {
      validator: (value) => /^\d{8,30}$/.test(String(value || '').replace(/\s/g, '')),
      message: '请输入正确的银行卡号',
      type: 'error',
    },
  ],
};

const resetForm = () => {
  Object.assign(formData, createInitialForm());
};

const fetchBankList = async () => {
  loading.value = true;
  try {
    const res = await getBankList();
    if (res.code === 200) {
      bankList.value = res.data?.list || [];
      canOperate.value = !!res.data?.can_operate;
    }
  } finally {
    loading.value = false;
  }
};

const openAddDialog = () => {
  if (!props.companyName) {
    MessagePlugin.warning('企业简称缺失，暂无法添加银行卡');
    return;
  }
  dialogVisible.value = true;
};

const handleCloseDialog = () => {
  dialogVisible.value = false;
  resetForm();
  formRef.value?.clearValidate?.();
};

const handleSubmit = async () => {
  const result = await formRef.value?.validate?.();
  if (result !== true) {
    return;
  }

  if (!props.companyName) {
    MessagePlugin.warning('企业简称缺失，暂无法添加银行卡');
    return;
  }

  submitLoading.value = true;
  try {
    const res = await addBank({
      company_name: props.companyName,
      account_name: props.companyName.trim(),
      bank_name: formData.bank_name.trim(),
      card_no: formData.card_no.replace(/\s/g, ''),
    });
    if (res.code === 200) {
      MessagePlugin.success('添加成功');
      handleCloseDialog();
      fetchBankList();
    }
  } finally {
    submitLoading.value = false;
  }
};

const handleSetDefault = async (item: BankItem, value: SwitchValue) => {
  if (!value) {
    return;
  }
  const res = await setDefaultBank({ bank_id: item.id });
  if (res.code === 200) {
    MessagePlugin.success('已设为默认银行卡');
    fetchBankList();
  }
};

const handleRemove = (item: BankItem) => {
  const dialog = DialogPlugin.confirm({
    header: '确认解绑银行卡？',
    body: `确认解绑尾号 ${item.card_no_masked?.slice(-4) || ''} 的银行卡吗？`,
    confirmBtn: '确认解绑',
    cancelBtn: '取消',
    onConfirm: async ({ e: _e }) => {
      const res = await removeBank({ bank_id: item.id });
      if (res.code === 200) {
        MessagePlugin.success('解绑成功');
        dialog.hide();
        fetchBankList();
      }
    },
  });
};

onMounted(() => {
  fetchBankList();
});
</script>
<style lang="less" scoped>
@import './profile-shared.less';

.bank-card-page {
  padding: 32px 32px 24px;
}

.section-head {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 22px;
  margin-bottom: 28px;
}

.section-title {
  .profile-section-title(18px; 14px; 0);
}

.add-bank-btn {
  min-width: 110px;
  height: 36px;
  padding: 0 18px;
  border-radius: 6px;
  font-size: 14px;
}

.bank-card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.bank-card-empty {
  min-height: 440px;
  padding: 52px 20px 36px;
  border-radius: 12px;
  background:
    radial-gradient(circle at top, rgb(49 104 255 / 4%), transparent 40%),
    linear-gradient(180deg, #fff 0%, #fcfdff 100%);
  border: 1px solid #edf1f7;
  box-shadow: 0 8px 30px rgb(15 37 77 / 4%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.bank-card-empty__illustration {
  position: relative;
  width: 120px;
  height: 92px;
}

.bank-card-empty__card {
  position: absolute;
  border-radius: 14px;
}

.bank-card-empty__card--back {
  top: 4px;
  left: 22px;
  width: 72px;
  height: 60px;
  background: linear-gradient(180deg, #e7edf9 0%, #dbe3f4 100%);
  transform: rotate(-8deg);
}

.bank-card-empty__card--front {
  left: 38px;
  top: 14px;
  width: 96px;
  height: 60px;
  border: 2px dashed #cfd8e6;
  background: linear-gradient(180deg, #fbfcff 0%, #f3f6fb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.bank-card-empty__plus {
  color: #c1cad8;
  font-size: 34px;
  line-height: 1;
  font-weight: 300;
}

.bank-card-empty__badge {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(180deg, #6fa0ff 0%, #4d7ef0 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 600;
  box-shadow: 0 10px 18px rgb(77 126 240 / 24%);
}

.bank-card-empty__title {
  margin-top: 18px;
  color: #0f254d;
  font-size: 15px;
  line-height: 22px;
  font-weight: 700;
}

.bank-card-empty__desc {
  width: 100%;
  max-width: 340px;
  margin-top: 6px;
  color: #98a3b7;
  font-size: 13px;
  line-height: 24px;
}

.bank-card-empty__action {
  min-width: 196px;
  height: 42px;
  margin-top: 22px;
  padding: 0 20px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(135deg, #3e70ff 0%, #2454de 100%);
  box-shadow: 0 12px 28px rgb(36 84 222 / 20%);
  font-size: 14px;
  font-weight: 600;
}

.bank-card-empty__safe {
  margin-top: 22px;
  padding: 7px 14px;
  border-radius: 999px;
  background: #f7f9fc;
  color: #8f9aaf;
  font-size: 12px;
  line-height: 18px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.bank-card-empty__safe-icon {
  position: relative;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(180deg, #38d370 0%, #24b85d 100%);
  flex: 0 0 auto;
}

.bank-card-empty__safe-icon::before {
  content: '';
  position: absolute;
  left: 4px;
  top: 2px;
  width: 4px;
  height: 7px;
  border-right: 2px solid #fff;
  border-bottom: 2px solid #fff;
  transform: rotate(40deg);
}

.bank-card-item {
  width: 360px;
  min-height: 178px;
  padding: 18px 22px 18px;
  border: 1px solid #d9e1eb;
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
  display: flex;
  flex-direction: column;
}

.bank-card-item--default {
  border-color: #d9e1eb;
}

.bank-card-item__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.bank-card-item__number {
  margin-top: 8px;
  font-size: 15px;
  line-height: 1.3;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: var(--td-text-color-primary);
}

.bank-card-item__meta {
  margin-top: 34px;
  font-size: 13px;
  line-height: 20px;
  color: #2d3340;
}

.bank-card-item__footer {
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid #e9eef4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.bank-card-item__label {
  font-size: 13px;
  color: #8f97a8;
}

:deep(.bank-card-item .t-link) {
  font-size: 13px;
  line-height: 20px;
}

:deep(.bank-card-item .t-switch) {
  transform: scale(0.92);
}

:deep(.bank-dialog .t-dialog__header) {
  display: none;
}

:deep(.bank-dialog .t-dialog__body) {
  padding: 0;
}

.bind-bank-dialog {
  padding: 20px 0 8px;
  text-align: center;
}

.bind-bank-dialog__title {
  font-size: 22px;
  line-height: 1.3;
  font-weight: 700;
  color: #0f254d;
}

.bind-bank-dialog__subtitle {
  margin-top: 10px;
  font-size: 14px;
  line-height: 22px;
  color: #7d8aa5;
}

.bind-bank-card {
  width: 448px;
  margin: 26px auto 0;
  padding: 28px 32px 30px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 18px 48px rgb(19 38 74 / 8%);
  text-align: left;
}

.bind-bank-card :deep(.t-form__item) {
  margin-bottom: 20px;
}

.bind-bank-card :deep(.t-form__label) {
  margin-bottom: 10px;
  color: #72809a;
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.bank-field {
  height: 52px;
  border: 1px solid #d9e1eb;
  border-radius: 14px;
  background: #f4f6fb;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.bank-field--readonly {
  color: #58698a;
}

.bank-field__content {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.bank-field__icon {
  color: #96a3ba;
  font-size: 18px;
  flex: 0 0 auto;
}

.bank-field__text {
  min-width: 0;
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  color: #58698a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bank-field__tip {
  margin-top: 8px;
  font-size: 12px;
  line-height: 20px;
  color: #a0aac0;
}

.bank-input {
  :deep(.t-input) {
    height: 52px;
    border-radius: 14px;
    background: #f4f6fb;
    border-color: #d9e1eb;
    box-shadow: none;
  }

  :deep(.t-input__prefix) {
    color: #96a3ba;
  }

  :deep(.t-input__inner) {
    color: #47556f;
  }
}

.bind-bank-submit {
  width: 100%;
  height: 46px;
  margin-top: 20px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #3e70ff 0%, #2454de 100%);
  box-shadow: 0 12px 24px rgb(36 84 222 / 24%);
  font-size: 16px;
  font-weight: 700;
}

.bind-bank-dialog__safe-tip {
  margin-top: 18px;
  text-align: center;
  font-size: 12px;
  line-height: 20px;
  color: #a0aac0;
}

.bind-bank-dialog__bottom-tip {
  margin-top: 22px;
  font-size: 13px;
  line-height: 22px;
  color: #9aa5bb;
}

@media (max-width: 900px) {
  .bank-card-page {
    padding: 20px 0 0;
  }

  .section-head {
    gap: 16px;
  }

  .bank-card-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  .bank-card-empty {
    min-height: 380px;
    padding: 44px 16px 28px;
  }

  .bank-card-empty__desc {
    max-width: 280px;
    font-size: 13px;
    line-height: 22px;
  }

  .bank-card-empty__action {
    min-width: 184px;
    height: 40px;
    margin-top: 20px;
  }

  .bank-card-empty__safe {
    margin-top: 20px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .bank-card-item {
    width: 100%;
    padding: 18px;
  }

  .bank-card-item__number {
    margin-top: 6px;
    font-size: 14px;
  }

  .bind-bank-card {
    width: auto;
    margin: 20px 16px 0;
    padding: 22px 18px 24px;
  }
}
</style>
