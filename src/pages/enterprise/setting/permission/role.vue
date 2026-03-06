<template>
  <div class="permission-content">
    <t-button theme="primary" @click="handleCreate">添加角色</t-button>
    <t-table
      class="permission-table"
      row-key="id"
      :data="rawRoleList"
      :columns="roleColumns"
      :pagination="null"
      :hover="false"
      :loading="loading"
    >
      <template #op="{ row }">
        <t-space>
          <t-link theme="primary" hover="color" @click="handleEditRole(row)">编辑</t-link>
          <t-popconfirm theme="danger" content="确认删除该角色吗？" @confirm="handleDeleteRole(row)">
            <t-link theme="danger">删除</t-link>
          </t-popconfirm>
        </t-space>
      </template>
    </t-table>
    <t-drawer
      v-model:visible="createVisible"
      :header="isEditMode ? '编辑角色' : '添加角色'"
      size="80%"
      :close-on-overlay-click="false"
    >
      <t-form label-align="top" class="create-role-form">
        <t-form-item label="角色名称">
          <t-input v-model="createForm.role_name" placeholder="请输入角色名称" clearable />
        </t-form-item>
        <t-form-item label="角色描述">
          <t-input v-model="createForm.desc" placeholder="请输入角色描述" clearable />
        </t-form-item>
        <t-form-item label="角色权限">
          <div v-if="permissionGroups.length" class="permission-groups">
            <t-checkbox-group v-model="createForm.rules">
              <div v-for="group in permissionGroups" :key="group.key" class="permission-group">
                <div class="permission-group__title">{{ group.name }}：</div>
                <div class="permission-group__checks">
                  <div class="permission-group__list">
                    <t-checkbox v-for="item in group.options" :key="item.value" :value="item.value">
                      {{ item.label }}
                    </t-checkbox>
                  </div>
                </div>
              </div>
            </t-checkbox-group>
          </div>
          <t-empty v-else description="暂无权限节点" />
        </t-form-item>
      </t-form>
      <template #footer>
        <t-space>
          <t-button theme="default" variant="outline" :disabled="createLoading" @click="createVisible = false">
            取消
          </t-button>
          <t-button theme="primary" :loading="createLoading" @click="handleConfirmSubmit">确认</t-button>
        </t-space>
      </template>
    </t-drawer>
  </div>
</template>
<script setup lang="ts">
import type { PrimaryTableCol, TableRowData } from 'tdesign-vue-next';
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';

import { createRole, deleteRole, getRoleList, getRoleNodes, updateRole } from '@/api/enterprise/role';
import type { Role, RoleNode } from '@/api/model/enterprise/role';
import { useUserStore } from '@/store';
import { usePermissionStore } from '@/store/modules/enterprise/permission';

type RoleRow = Role & {
  index: number;
};

const userStore = useUserStore();
const permissionStore = usePermissionStore();

const loading = ref(false);
const createVisible = ref(false);
const createLoading = ref(false);
const roleNodes = ref<RoleNode[]>([]);
const rawRoleList = ref<Role[]>([]);
const editingRoleId = ref<number | null>(null);
const createForm = ref<{
  role_name: string;
  desc?: string;
  rules: string[];
}>({
  role_name: '',
  desc: '',
  rules: [],
});
const isEditMode = computed(() => editingRoleId.value !== null);

interface PermissionGroup {
  key: string;
  name: string;
  options: Array<{
    label: string;
    value: string;
  }>;
}

const roleColumns: PrimaryTableCol<TableRowData>[] = [
  { title: '角色组名称', colKey: 'role_name' },
  { title: '角色描述', colKey: 'desc', width: 200 },
  { title: '操作', colKey: 'op', width: 140, align: 'right' },
];

const normalizePermissionKey = (key: string) => key.replace(/\\\//g, '/').replace(/^\/+/, '').trim();

const parseRoleRules = (rules: unknown): string[] => {
  const normalizeRuleList = (list: unknown[]): string[] =>
    list
      .filter((item): item is string => typeof item === 'string')
      .map((item) => normalizePermissionKey(item))
      .filter(Boolean);

  const parseJsonRules = (input: unknown, depth = 0): string[] => {
    if (Array.isArray(input)) return normalizeRuleList(input);
    if (typeof input !== 'string') return [];
    const trimmed = input.trim();
    if (depth > 2 || !trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return normalizeRuleList(parsed);
      if (typeof parsed === 'string') return parseJsonRules(parsed, depth + 1);
      return [];
    } catch {
      if (trimmed.startsWith('[') && trimmed.endsWith(']') && trimmed.includes("'")) {
        try {
          const parsed = JSON.parse(trimmed.replace(/'/g, '"'));
          if (Array.isArray(parsed)) return normalizeRuleList(parsed);
        } catch {
          return [];
        }
      }
      return [];
    }
  };

  if (Array.isArray(rules)) {
    return normalizeRuleList(rules);
  }
  if (typeof rules !== 'string' || !rules.trim()) {
    return [];
  }
  const parsedRules = parseJsonRules(rules);
  if (parsedRules.length) {
    return parsedRules;
  }
  return rules
    .split(',')
    .map((item) => item.replace(/^\[|\]$/g, '').replace(/^['"]+|['"]+$/g, ''))
    .map((item) => normalizePermissionKey(item))
    .filter(Boolean);
};

const collectLeafNodes = (nodes: RoleNode[]): Array<{ label: string; value: string }> => {
  return nodes.flatMap((node) => {
    const children = Array.isArray(node.children) ? node.children : [];
    if (!children.length) {
      return [{ label: node.name, value: normalizePermissionKey(node.path || node.key) }];
    }
    return collectLeafNodes(children);
  });
};

const permissionGroups = computed<PermissionGroup[]>(() =>
  roleNodes.value
    .map((node) => {
      const children = Array.isArray(node.children) ? node.children : [];
      const options = children.length
        ? collectLeafNodes(children)
        : [{ label: node.name, value: normalizePermissionKey(node.path || node.key) }];
      return {
        key: node.path,
        name: node.name,
        options,
      };
    })
    .filter((item) => item.options.length > 0),
);

const fetchRoleNodes = async () => {
  if (permissionStore.nodeList.length) {
    roleNodes.value = permissionStore.nodeList;
    return;
  }
  try {
    const { data } = await getRoleNodes();
    roleNodes.value = data?.list || [];
    permissionStore.setNodeList(roleNodes.value);
  } catch {
    MessagePlugin.error('获取角色权限失败');
  }
};

const fetchRoleList = async () => {
  const enterpriseId = userStore.userInfo?.enterprise_id;
  if (!enterpriseId) return;
  try {
    loading.value = true;
    const { data } = await getRoleList({ enterprise_id: enterpriseId });
    permissionStore.setRoleList(data?.list || []);
    rawRoleList.value = (data?.list || []).map((item) => ({
      ...item,
      rules: parseRoleRules(item.rules),
    }));
  } catch {
    MessagePlugin.error('获取角色列表失败');
  } finally {
    loading.value = false;
  }
};

const handleCreate = () => {
  editingRoleId.value = null;
  createForm.value = {
    role_name: '',
    desc: '',
    rules: [],
  };
  createVisible.value = true;
};

const handleConfirmCreate = async () => {
  const enterpriseId = userStore.userInfo?.enterprise_id;
  if (!enterpriseId) {
    MessagePlugin.warning('未获取到企业信息，请重新登录后重试');
    return;
  }
  const roleName = createForm.value.role_name.trim();
  if (!roleName) {
    MessagePlugin.warning('请输入角色名称');
    return;
  }
  if (!createForm.value.rules.length) {
    MessagePlugin.warning('请至少选择一项角色权限');
    return;
  }
  try {
    createLoading.value = true;
    const normalizedRules = createForm.value.rules.map((item) => normalizePermissionKey(item));
    await createRole({
      enterprise_id: enterpriseId,
      role_name: roleName,
      desc: createForm.value.desc,
      rules: normalizedRules,
    });
    MessagePlugin.success('添加角色成功');
    createVisible.value = false;
    fetchRoleList();
  } catch {
    MessagePlugin.error('添加角色失败');
  } finally {
    createLoading.value = false;
  }
};

const handleConfirmEdit = async () => {
  if (editingRoleId.value === null) return;
  const roleName = createForm.value.role_name.trim();
  if (!roleName) {
    MessagePlugin.warning('请输入角色名称');
    return;
  }
  if (!createForm.value.rules.length) {
    MessagePlugin.warning('请至少选择一项角色权限');
    return;
  }
  try {
    createLoading.value = true;
    const normalizedRules = createForm.value.rules.map((item) => normalizePermissionKey(item));
    await updateRole({
      role_id: editingRoleId.value,
      role_name: roleName,
      desc: createForm.value.desc,
      rules: normalizedRules,
    });
    MessagePlugin.success('编辑角色成功');
    createVisible.value = false;
    fetchRoleList();
  } catch {
    MessagePlugin.error('编辑角色失败');
  } finally {
    createLoading.value = false;
  }
};

const handleConfirmSubmit = async () => {
  if (isEditMode.value) {
    await handleConfirmEdit();
    return;
  }
  await handleConfirmCreate();
};

const handleEditRole = (row: RoleRow) => {
  const target = rawRoleList.value.find((item) => String(item.id) === String(row.id));
  const targetRuleSource = [target, row].find(Boolean) as Record<string, unknown> | undefined;
  const targetRules =
    targetRuleSource?.rules ??
    targetRuleSource?.rule ??
    targetRuleSource?.auth_rules ??
    targetRuleSource?.permission_rules ??
    targetRuleSource?.permissions;
  const parsedRules = parseRoleRules(targetRules);
  const permissionValues = new Set(
    permissionGroups.value.flatMap((group) => group.options.map((item) => normalizePermissionKey(item.value))),
  );
  const matchedRules = parsedRules.filter((item) => permissionValues.has(normalizePermissionKey(item)));
  if (parsedRules.length && !matchedRules.length) {
    MessagePlugin.warning('当前角色权限与权限节点未匹配，请检查权限 key 格式');
    console.warn('[role-permission-mismatch]', {
      roleId: row.id,
      parsedRules,
      permissionValues: Array.from(permissionValues),
    });
  }
  editingRoleId.value = Number(row.id);
  createForm.value = {
    role_name: target?.role_name || row.role_name,
    desc: target?.desc || row.desc || '',
    rules: matchedRules,
  };
  createVisible.value = true;
};

const handleDeleteRole = async (row: RoleRow) => {
  try {
    await deleteRole({ role_id: row.id });
    MessagePlugin.success(`删除角色成功：${row.role_name}`);
    fetchRoleList();
  } catch {
    MessagePlugin.error(`删除角色失败：${row.role_name}`);
  }
};

onMounted(() => {
  fetchRoleNodes();
  fetchRoleList();
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

.create-role-form {
  width: 100%;
}

.permission-groups {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
}

.permission-group {
  display: grid;
  grid-template-columns: 88px minmax(0, 1fr);
  align-items: start;
  column-gap: 8px;
  width: 100%;
}

.permission-group__title {
  min-width: 88px;
  color: var(--td-text-color-secondary);
  line-height: 24px;
  white-space: nowrap;
}

.permission-group__checks {
  flex: 1;
  display: block;
  width: 100%;
  min-width: 0;
}

.permission-group__checks :deep(.t-checkbox) {
  white-space: nowrap;
}

.permission-group__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  width: 100%;
}
</style>
