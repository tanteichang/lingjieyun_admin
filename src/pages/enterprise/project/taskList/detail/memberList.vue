<template>
  <div class="member-list-card">
    <common-table
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :form-config="formConfig"
      :table-config="tableConfig"
      :header-affixed-top="headerAffixedTop"
      @search="handleSearch"
      @reset="handleReset"
      @page-change="handlePageChange"
    >
      <template #toolbar>
        <t-button theme="primary" @click="openRecruitDrawer">招募</t-button>
        <t-button theme="primary" @click="goRecruit">批量招募</t-button>
        <t-button variant="outline" @click="handleExportFreelancerList">导出人员名单</t-button>
      </template>
      <template #op="{ record }">
        <t-space>
          <!-- <t-link theme="primary" hover="color">
            {{ (record as MemberRow).sign_status === SignStatus.Pending ? '通知签约' : null }}
          </t-link> -->
          <t-link theme="danger" hover="color" @click="handleRemoveMember(record)">移出任务</t-link>
        </t-space>
      </template>
    </common-table>
    <t-drawer v-model:visible="recruitDrawerVisible" header="新增招募成员" size="80%" :footer="false">
      <template #body>
        <recruit-form @submit="handleRecruitSubmit" @cancel="handleCloseRecruitDrawer" />
      </template>
    </t-drawer>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { exportFreelancerList } from '@/api/enterprise/settlement';
import { getTaskMemberList, recruit, removeMember } from '@/api/enterprise/task';
import type { Row } from '@/api/model/common';
import type { TaskMemberItem, TaskMemberListQuery } from '@/api/model/enterprise/taskModel';
import { SignStatus } from '@/api/model/enterprise/taskModel';
import type { TableConfig } from '@/components/common-table/index.vue';
import CommonTable from '@/components/common-table/index.vue';
import { prefix } from '@/config/global';
import { useCommonTable } from '@/hooks/useCommonTable';
import { useSettingStore } from '@/store';

import type { RecruitFormSubmitPayload } from './recruitForm.vue';
import RecruitForm from './recruitForm.vue';

defineOptions({
  name: 'TaskMemberList',
});

const props = defineProps<{
  taskName?: string;
}>();

const emit = defineEmits<{
  (e: 'update:total', total: number): void;
}>();

const route = useRoute();
const router = useRouter();
const recruitDrawerVisible = ref(false);

const total = ref(0);

watch(
  () => total.value,
  (total) => {
    emit('update:total', total);
  },
  { immediate: true },
);

type MemberRow = TaskMemberItem & Row;

const signStatusOptions = [
  { label: '待签约', value: SignStatus.Pending },
  { label: '进行中', value: SignStatus.Processing },
  { label: '已签约', value: SignStatus.Signed },
];

const formConfig = {
  formItem: [
    { label: '姓名', name: 'name', type: 'input', placeholder: '请输入姓名或名称', span: 6 },
    { label: '手机号码', name: 'phone', type: 'input', placeholder: '请输入手机号', span: 6 },
    // {
    //   label: '签约状态',
    //   name: 'sign_status',
    //   type: 'select',
    //   placeholder: '请选择签约状态',
    //   props: {
    //     options: signStatusOptions,
    //   },
    //   span: 6,
    // },
  ],
  formData: {
    task_id: Number(route.query.id),
    sign_status: '',
    name: '',
    phone: '',
    page: 1,
    limit: 10,
  },
};

const tableConfig: TableConfig<MemberRow, keyof MemberRow> = {
  tableItem: [
    { title: 'ID', colKey: 'id', width: 70, align: 'center', fixed: 'left' },
    { title: '姓名', colKey: 'talent_info_name', width: 120, align: 'center' },
    { title: '手机号码', colKey: 'talent_info_phone', width: 150, align: 'center' },
    { title: '入驻渠道', colKey: 'entry_channel', width: 120, align: 'center' },
    { title: '实名状态', colKey: 'realname_status_text', width: 120, align: 'center' },
    // { title: '签约状态', colKey: 'sign_status_text', width: 120, align: 'center' },
    { title: '加入时间', colKey: 'join_time', width: 160, align: 'center' },
    { title: '操作', colKey: 'op', width: 200, align: 'center', fixed: 'right' },
  ],
};

const store = useSettingStore();
const headerAffixedTop = computed(
  () =>
    ({
      offsetTop: store.isUseTabsRouter ? 48 : 0,
      container: `.${prefix}-layout`,
    }) as any,
);

const tableHook = useCommonTable<TaskMemberListQuery, MemberRow>({
  fetcher: async (params) => {
    const { data } = await getTaskMemberList(params);
    total.value = data.total;
    return {
      list:
        data.list.map((item, index) => ({
          ...item,
          index: index + 1,
          talent_info_name: item.talent_info.name,
          talent_info_phone: item.talent_info.phone,
        })) || [],
      total: data.total || 0,
    };
  },
  defaultQuery: formConfig.formData,
  debounceWait: 300,
});

const { data: tableData, loading, pagination, search: handleSearch, reset: handleReset, handlePageChange } = tableHook;

const openRecruitDrawer = () => {
  recruitDrawerVisible.value = true;
};

const goRecruit = () => {
  router.push({ name: 'Recruit', query: { id: route.query.id } });
};

const handleCloseRecruitDrawer = () => {
  recruitDrawerVisible.value = false;
};

const handleExportFreelancerList = () => {
  console.log('export freelancer list');
  exportFreelancerList({ product_id: Number(route.query.id) })
    .then((res) => {
      const url = window.URL.createObjectURL(new Blob([res]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${props.taskName}_${route.query.id}_人员名单.xlsx`);
      document.body.appendChild(link);
      link.click();
    })
    .catch((err) => {
      MessagePlugin.error(err || '导出失败');
    });
};

const handleRemoveMember = (record: MemberRow) => {
  removeMember({
    task_id: Number(route.query.id),
    member_id: record.id,
  })
    .then((res) => {
      console.log('remove member response', res);
      if (res.code === 200) {
        MessagePlugin.success(res.msg);
        handleSearch();
      } else {
        MessagePlugin.error(res.msg);
      }
    })
    .catch((err) => {
      MessagePlugin.error(err || '提交失败');
    });
};

const handleRecruitSubmit = (payload: RecruitFormSubmitPayload) => {
  recruit({
    task_id: Number(route.query.id),
    name: payload.name,
    phone: payload.mobile,
    id_card: payload.id_card,
    id_card_front: payload.id_card_front,
    id_card_back: payload.id_card_back,
    sign_method: payload.sign_method,
  })
    .then((res) => {
      console.log('recruit response', res);
      if (res.code === 200) {
        MessagePlugin.success(res.msg);
      } else {
        MessagePlugin.error(res.msg);
      }
      handleCloseRecruitDrawer();
    })
    .catch((err) => {
      MessagePlugin.error(err || '提交失败');
    });
};
</script>
<style lang="less" scoped>
.member-list-card {
  padding: 0;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px 0 16px;
  gap: 12px;

  :deep(.t-form) {
    flex: 1;
  }
}

.actions {
  flex-shrink: 0;
}
</style>
