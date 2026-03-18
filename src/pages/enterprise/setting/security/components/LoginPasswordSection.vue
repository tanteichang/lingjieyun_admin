<template>
  <security-action-card
    title="登录密码"
    description="用于登录账户。建议定期更改以提高账户安全性，避免使用弱口令。"
    status-text="已设置"
    status-tone="success"
    icon-tone="mint"
    action-text="修改登录密码"
    @action="passwordDialogVisible = true"
  >
    <template #icon>
      <span class="card-icon-symbol">
        <t-icon name="lock-on" />
      </span>
    </template>

    <template #append> </template>
  </security-action-card>
  <t-dialog
    v-model:visible="passwordDialogVisible"
    :footer="false"
    :close-on-overlay-click="false"
    :close-btn="true"
    header="修改登录密码"
    width="600px"
  >
    <template #body>
      <div class="password-modal">
        <t-form ref="passwordFormRef" class="modal-form" :data="passwordForm" :rules="passwordRules" label-width="0">
          <t-form-item label="当前密码" name="oldPassword">
            <t-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" />
          </t-form-item>
          <t-form-item label="新密码" name="newPassword">
            <t-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
          </t-form-item>
          <t-form-item label="确认新密码" name="confirmPassword">
            <t-input v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" />
          </t-form-item>
        </t-form>

        <t-button theme="primary" block class="save-btn" @click="handleSavePassword">保存新密码</t-button>
      </div>
    </template>
  </t-dialog>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRule } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { reactive, ref } from 'vue';

import { changePassword } from '@/api/enterprise/auth';
import { validator } from '@/utils/validator';

import SecurityActionCard from './SecurityActionCard.vue';

defineOptions({
  name: 'LoginPasswordSection',
});

const passwordDialogVisible = ref(false);
const passwordFormRef = ref<FormInstanceFunctions>();

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const validateConfirmPassword = (val: string) => val === passwordForm.newPassword;

const passwordRules: Record<string, FormRule[]> = {
  oldPassword: [{ required: true, message: '请输入旧密码', type: 'error', trigger: 'change' }],
  newPassword: [
    { required: true, message: '请输入新密码', type: 'error', trigger: 'change' },
    {
      message: validator.password.message,
      type: 'error',
      trigger: 'change',
      validator: validator.password.validator,
    },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', type: 'error', trigger: 'blur' },
    {
      message: '两次输入的新密码不一致',
      type: 'error',
      trigger: 'change',
      validator: validateConfirmPassword,
    },
  ],
};

const resetPasswordForm = () => {
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
};

const handleSavePassword = async () => {
  const validateResult = await passwordFormRef.value?.validate();
  if (validateResult !== true) return;
  changePassword({
    confirm_password: passwordForm.confirmPassword,
    old_password: passwordForm.oldPassword,
    new_password: passwordForm.newPassword,
  }).then((res) => {
    if (res.code === 200) {
      MessagePlugin.success('登录密码修改成功');
      passwordDialogVisible.value = false;
      resetPasswordForm();
    }
  });
};
</script>
<style lang="less" scoped>
.card-icon-symbol {
  color: #30c7c9;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-icon-symbol :deep(.t-icon) {
  font-size: 34px;
}

.password-dialog {
  :deep(.t-dialog) {
    border-radius: 14px;
    overflow: hidden;
  }

  :deep(.t-dialog__header),
  :deep(.t-dialog__footer) {
    display: none;
  }

  :deep(.t-dialog__body) {
    padding: 0;
  }
}

.password-modal {
  background: #fff;
}

.modal-head {
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 0 24px;
}

.modal-title {
  font-size: 16px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.modal-close {
  border: 0;
  background: transparent;
  color: #2f2f2f;
  cursor: pointer;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.save-btn {
  margin-top: 30px;

  height: 40px;
  font-size: 13px;
}

@media (max-width: 1200px) {
  .modal-title {
    font-size: 13px;
  }

  .modal-form {
    :deep(.t-form__label) {
      font-size: 10px;
    }
  }
}
</style>
