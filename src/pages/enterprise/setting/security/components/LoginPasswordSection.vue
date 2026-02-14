<template>
  <div class="action-item">
    <div class="action-head">
      <span class="icon-circle icon-login">
        <t-icon name="lock-on" />
      </span>
      <div>
        <div class="action-title">登录密码</div>
        <div class="action-desc">用于登录账户，建议定期更改以提高安全性</div>
      </div>
    </div>
    <t-link theme="primary" class="action-link" hover="color" @click="passwordDialogVisible = true"
      >修改登录密码</t-link
    >

    <t-dialog
      v-model:visible="passwordDialogVisible"
      :footer="false"
      :close-on-overlay-click="false"
      :close-btn="false"
      width="470px"
      class="password-dialog"
    >
      <template #body>
        <div class="password-modal">
          <div class="modal-head">
            <div class="modal-title">修改登录密码</div>
            <button class="modal-close" type="button" @click="passwordDialogVisible = false">
              <t-icon name="close" size="22" />
            </button>
          </div>

          <div class="modal-form">
            <div class="form-item">
              <div class="form-label">当前密码</div>
              <t-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入旧密码" />
            </div>
            <div class="form-item">
              <div class="form-label">新密码</div>
              <t-input v-model="passwordForm.newPassword" type="password" placeholder="请输入新密码" />
            </div>
            <div class="form-item">
              <div class="form-label">确认新密码</div>
              <t-input v-model="passwordForm.confirmPassword" type="password" placeholder="再次输入新密码" />
            </div>
          </div>

          <t-button theme="primary" block class="save-btn" @click="handleSavePassword">保存新密码</t-button>
        </div>
      </template>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref } from 'vue';

defineOptions({
  name: 'LoginPasswordSection',
});

const passwordDialogVisible = ref(false);

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const handleSavePassword = () => {
  passwordDialogVisible.value = false;
  passwordForm.oldPassword = '';
  passwordForm.newPassword = '';
  passwordForm.confirmPassword = '';
};
</script>
<style lang="less" scoped>
.action-item {
  background: #f8faff;
  border-radius: 10px;
  padding: 22px;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.action-head {
  display: flex;
  gap: 14px;
}

.icon-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  flex-shrink: 0;
}

.icon-login {
  background: #2ec7c9;
}

.action-title {
  font-size: 15px;
  color: var(--td-text-color-primary);
  font-weight: 600;
}

.action-desc {
  margin-top: 10px;
  font-size: 11px;
  color: var(--td-text-color-secondary);
  line-height: 1.6;
}

.action-link {
  font-size: 14px;
  font-weight: 600;
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
  font-size: 18px;
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

.modal-form {
  padding: 22px 24px 10px;
  display: grid;
  gap: 14px;
}

.form-label {
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--td-text-color-primary);
}

.modal-form :deep(.t-input) {
  height: 40px;
}

.modal-form :deep(.t-input__inner) {
  font-size: 13px;
}

.save-btn {
  margin: 10px 24px 24px;
  width: calc(100% - 48px);
  height: 40px;
  font-size: 14px;
}

@media (max-width: 1200px) {
  .action-title,
  .action-link,
  .modal-title {
    font-size: 14px;
  }

  .action-desc,
  .form-label {
    font-size: 11px;
  }
}
</style>
