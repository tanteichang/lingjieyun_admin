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
      @confirm="handleConfirmCreate"
    >
      <t-form label-align="top">
        <t-form-item label="手机号">
          <t-input v-model="createForm.mobile" :disabled="formEdit" placeholder="请输入手机号" clearable />
        </t-form-item>
        <t-form-item label="所属角色">
          <t-select v-model="createForm.role_id" placeholder="请选择所属角色" :options="roleOptions" />
        </t-form-item>
      </t-form>
    </t-dialog>
  </div>
</template>
<script setup lang="ts">
import type { PrimaryTableCol, TdTagProps } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { addAdmin, getAdminList, removeAdmin, toggleAdmin, updateAdmin } from '@/api/enterprise/admin';
import type { Admin } from '@/api/model/enterprise/admin';
import { AdminStatus, AdminType } from '@/api/model/enterprise/admin';
import { usePermissionStore } from '@/store/modules/enterprise/permission';

const permissionStore = usePermissionStore();

const loading = ref(false);
const createVisible = ref(false);
const formEdit = ref(false);
const createLoading = ref(false);
const adminList = ref<Admin[]>([]);
const createForm = ref({
  admin_id: null,
  mobile: '',
  role_id: null,
});

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
  } catch {
    MessagePlugin.error('获取管理员列表失败');
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  formEdit.value = false;
  createForm.value.mobile = '';
  createVisible.value = true;
};

const handleConfirmCreate = async () => {
  const mobile = createForm.value.mobile.trim();
  if (!/^1\d{10}$/.test(mobile)) {
    MessagePlugin.warning('请输入正确的手机号');
    return;
  }
  if (formEdit.value) {
    console.log('end');
    updateAdmin({ admin_id: createForm.value.admin_id, role_id: createForm.value.role_id }).then(() => {
      MessagePlugin.success('编辑管理员成功');
      createVisible.value = false;
      fetchAdminList();
    });
  } else {
    try {
      createLoading.value = true;
      await addAdmin({ mobile, role_id: createForm.value.role_id as number });
      MessagePlugin.success('添加管理员成功');
      createVisible.value = false;
      fetchAdminList();
    } finally {
      createLoading.value = false;
    }
  }
};

const handleEditAdmin = (row: Admin) => {
  formEdit.value = true;
  createForm.value.mobile = row.mobile;
  createForm.value.role_id = row.role_id;
  createForm.value.admin_id = row.id;
  createVisible.value = true;
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
