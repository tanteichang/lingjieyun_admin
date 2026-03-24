<template>
  <div class="permission-content">
    <t-button theme="primary" @click="handleCreate">添加普通管理员</t-button>
    <t-table
      class="permission-table"
      row-key="id"
      :data="adminList"
      :columns="adminColumns"
      :pagination="null"
      :hover="false"
      :loading="loading"
    >
      <template #admin_type="{ row }">
        {{ adminTypeLabel[row.admin_type as AdminType] }}
      </template>
      <template #role_name="{ row }">
        {{ row.admin_type === AdminType.Super ? '超级管理员' : row.role_name }}
      </template>

      <template #status="{ row }">
        <t-tag :theme="adminStatusTag[row.status as AdminStatus].theme">{{
          adminStatusTag[row.status as AdminStatus].label
        }}</t-tag>
      </template>
      <template #op="{ row }">
        <t-space>
          <t-link v-if="row.admin_type === AdminType.Normal" theme="primary" hover="color" @click="handleEditAdmin(row)"
            >编辑</t-link
          >
          <t-link
            v-if="row.admin_type === AdminType.Normal"
            theme="primary"
            hover="color"
            @click="handleToggleAdmin(row)"
          >
            {{ row.status === 1 ? '禁用' : '启用' }}
          </t-link>
          <t-popconfirm
            v-if="row.admin_type === AdminType.Normal"
            theme="danger"
            content="确认删除该管理员吗？"
            @confirm="handleDeleteAdmin(row)"
          >
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <t-dialog
      v-model:visible="createVisible"
      :header="formEdit ? '编辑管理员' : '添加管理员'"
      confirm-btn="确认"
      cancel-btn="取消"
      :confirm-loading="createLoading"
      :close-on-overlay-click="false"
      @confirm="handleConfirmCreate"
    >
      <t-form ref="formRef" :data="createForm" :rules="formRules" label-align="top">
        <t-form-item label="真实姓名" name="name">
          <t-input v-model="createForm.name" :disabled="formEdit" placeholder="请输入真实姓名" clearable />
        </t-form-item>
        <t-form-item label="手机号" name="mobile">
          <t-input v-model="createForm.mobile" :disabled="formEdit" placeholder="请输入手机号" clearable />
        </t-form-item>
        <t-form-item v-if="!formEdit" label="短信验证码" name="sms_code">
          <sms-code-input
            v-model="createForm.sms_code"
            :disabled="!createForm.mobile"
            size="medium"
            placeholder="请输入短信验证码"
            :send-handler="handleSendSmsCode"
          />
        </t-form-item>
        <t-form-item v-if="!formEdit" label="密码" name="password">
          <t-input v-model="createForm.password" placeholder="请输入密码" clearable />
        </t-form-item>
        <t-form-item label="所属角色" name="role_id">
          <t-select v-model="createForm.role_id" placeholder="请选择所属角色" :options="roleOptions" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { FormInstanceFunctions, FormRules, PrimaryTableCol, TdTagProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, nextTick, onMounted, ref, watch } from 'vue';

import { addAdmin, getAdminList, removeAdmin, toggleAdmin, updateAdmin } from '@/api/enterprise/admin';
import { sendSmsCode } from '@/api/enterprise/auth';
import type { Admin } from '@/api/model/enterprise/admin';
import { AdminStatus, AdminType } from '@/api/model/enterprise/admin';
import SmsCodeInput from '@/components/sms-code-input/index.vue';
import { useAdminStore } from '@/store/modules/enterprise/admin';
import { usePermissionStore } from '@/store/modules/enterprise/permission';
import { validator } from '@/utils/validator';

const permissionStore = usePermissionStore();
const adminStore = useAdminStore();

const loading = ref(false);
const createVisible = ref(false);
const formEdit = ref(false);
const createLoading = ref(false);
const adminList = ref<Admin[]>([]);

interface CreateAdminForm {
  admin_id: number | null;
  mobile: string;
  role_id: number | null;
  password: string;
  name: string;
  sms_code: string;
}

const createForm = ref<CreateAdminForm>({
  admin_id: null,
  mobile: '',
  role_id: null,
  password: '',
  name: '',
  sms_code: '',
});
const formRef = ref<FormInstanceFunctions<CreateAdminForm>>();

const initialCreateForm = (): CreateAdminForm => ({
  admin_id: null,
  mobile: '',
  role_id: null,
  password: '',
  name: '',
  sms_code: '',
});

const formRules = computed<FormRules<CreateAdminForm>>(() => ({
  name: formEdit.value
    ? []
    : [
        { required: true, message: '请输入真实姓名', type: 'error', trigger: 'submit' },
        { min: 2, message: '真实姓名至少2个字符', type: 'error', trigger: 'change' },
      ],
  mobile: formEdit.value
    ? []
    : [
        { required: true, message: '请输入手机号', type: 'error', trigger: 'submit' },
        {
          message: validator.mobile.message,
          type: 'error',
          trigger: 'change',
          validator: validator.mobile.validator,
        },
      ],
  sms_code: formEdit.value ? [] : [{ required: true, message: '请输入短信验证码', type: 'error', trigger: 'submit' }],
  password: formEdit.value
    ? []
    : [
        { required: true, message: '请输入密码', type: 'error', trigger: 'submit' },
        {
          message: validator.password.message,
          type: 'error',
          trigger: 'change',
          validator: validator.password.validator,
        },
      ],
  role_id: [{ required: true, message: '请选择所属角色', type: 'error', trigger: 'submit' }],
}));

const roleOptions = computed(() =>
  permissionStore.roleList.map((item) => ({
    label: item.role_name,
    value: item.id,
  })),
);

const adminColumns: PrimaryTableCol<Admin>[] = [
  { title: '管理员名称', colKey: 'name', minWidth: 140 },
  { title: '手机号', colKey: 'mobile', minWidth: 120 },
  { title: '管理员类型', colKey: 'admin_type', minWidth: 110 },
  { title: '所属角色', colKey: 'role_name', minWidth: 100 },
  { title: '状态', colKey: 'status', width: 100 },
  { title: '操作', colKey: 'op', width: 160, align: 'left', fixed: 'right' },
];

const adminStatusTag: Record<AdminStatus, { label: string; theme: TdTagProps['theme'] }> = {
  [AdminStatus.disabled]: { label: '禁用', theme: 'danger' },
  [AdminStatus.enabled]: { label: '启用', theme: 'success' },
  [AdminStatus.inactive]: { label: '待激活', theme: 'warning' },
};
const adminTypeLabel: Record<AdminType, string> = {
  [AdminType.Normal]: '普通管理员',
  [AdminType.Super]: '超级管理员',
};

const fetchAdminList = async () => {
  try {
    loading.value = true;
    const { data } = await getAdminList();
    const list = data?.list || [];
    adminList.value = list;
    adminStore.setAdmins(list);
  } catch {
    MessagePlugin.error('获取管理员列表失败');
  } finally {
    loading.value = false;
  }
};

const resetCreateForm = () => {
  createForm.value = initialCreateForm();
};

const handleCreate = () => {
  formEdit.value = false;
  resetCreateForm();
  createVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};

const handleConfirmCreate = async () => {
  const result = await formRef.value?.validate();
  if (result !== true) {
    return;
  }

  try {
    createLoading.value = true;
    if (formEdit.value) {
      const res = await updateAdmin({
        admin_id: createForm.value.admin_id as number,
        role_id: createForm.value.role_id as number,
      });
      if (res.code === 200) {
        MessagePlugin.success('编辑管理员成功');
      }
      createVisible.value = false;
      await fetchAdminList();
      return;
    }

    const { code } = await addAdmin({
      mobile: createForm.value.mobile.trim(),
      role_id: createForm.value.role_id as number,
      password: createForm.value.password,
      name: createForm.value.name.trim(),
      sms_code: createForm.value.sms_code.trim(),
    });
    if (code === 200) {
      MessagePlugin.success('添加管理员成功');
    }
    createVisible.value = false;
    await fetchAdminList();
  } finally {
    createLoading.value = false;
  }
};

const handleEditAdmin = (row: Admin) => {
  formEdit.value = true;
  createForm.value.name = row.name;
  createForm.value.mobile = row.mobile;
  createForm.value.role_id = (row as Admin & { role_id?: number }).role_id ?? null;
  createForm.value.admin_id = row.id;
  createForm.value.password = '';
  createForm.value.sms_code = '';
  createVisible.value = true;
  nextTick(() => formRef.value?.clearValidate());
};

const handleToggleAdmin = (row: Admin) => {
  toggleAdmin({ admin_id: row.id }).then(() => {
    MessagePlugin.success(`管理员${row.status === 1 ? '禁用' : '启用'}成功：${row.name}`);
    fetchAdminList();
  });
};

const handleDeleteAdmin = (row: Admin) => {
  removeAdmin({ admin_id: row.id }).then(() => {
    MessagePlugin.success(`删除管理员：${row.name}`);
    fetchAdminList();
  });
};

const handleSendSmsCode = () => {
  const mobile = createForm.value.mobile.trim();
  if (!validator.mobile.validator(mobile)) {
    MessagePlugin.warning(validator.mobile.message);
    return false;
  }
  sendSmsCode({ mobile, type: 'admin_add' }).then((res) => {
    if (res.code === 200) {
      MessagePlugin.success(`短信验证码已发送至${mobile}`);
    }
  });
};

watch(createVisible, (visible) => {
  if (visible) return;
  formEdit.value = false;
  resetCreateForm();
  nextTick(() => formRef.value?.clearValidate());
});

onMounted(() => {
  fetchAdminList();
});
</script>
<style lang="less" scoped>
.permission-content {
  padding: 20px 22px 28px;
}

.permission-table {
  margin-top: 18px;
}

.permission-table :deep(.t-table__header th) {
  background: var(--td-bg-color-container-hover);
  color: var(--td-text-color-placeholder);
}

.permission-table :deep(.t-table__content td) {
  color: var(--td-text-color-primary);
}
</style>
