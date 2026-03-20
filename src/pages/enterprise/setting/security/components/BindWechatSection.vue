<template>
  <security-action-card
    title="绑定微信"
    description="用于微信扫码登录账户"
    :status-text="wechatStatusText"
    :status-tone="wechatStatusTone"
    icon-tone="mint"
    :action-text="wechatActionText"
    @action="handleBindWechat"
  >
    <template #icon>
      <span class="card-icon-symbol">
        <t-icon name="logo-wechat-stroke" />
      </span>
    </template>

    <div v-if="wechatName" class="wechat-name">已绑定：{{ wechatName }}</div>
  </security-action-card>

  <t-dialog
    v-model:visible="unbindConfirmVisible"
    header="确认解除绑定微信"
    confirm-btn="确认解除"
    cancel-btn="取消"
    @confirm="handleConfirmUnbind"
  >
    解除后将无法继续使用微信扫码登录，确认继续吗？
  </t-dialog>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { bindWeChat, unbindWeChat } from '@/api/enterprise/auth';
import type { BindWeChatResponse } from '@/api/model/enterprise/auth';
import { useUserStore } from '@/store';
import { WeChat } from '@/utils/thirdAccount';

import SecurityActionCard from './SecurityActionCard.vue';

defineOptions({
  name: 'BindWechatSection',
});

const props = defineProps({
  isBound: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits<{
  'bind-result': [
    payload: {
      success: boolean;
      response?: BindWeChatResponse;
      error?: unknown;
    },
  ];
}>();

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();
const unbindConfirmVisible = ref(false);

const wechatName = computed(() => userStore.userInfo.wechat?.trim() || '');
const isWechatBound = computed(() => props.isBound);
const wechatStatusText = computed(() => (isWechatBound.value ? '已绑定' : '未绑定'));
const wechatStatusTone = computed(() => (isWechatBound.value ? 'success' : 'warning'));
const wechatActionText = computed(() => (isWechatBound.value ? '解除绑定微信' : '去绑定微信'));

const handleBindWechat = () => {
  if (props.isBound) {
    unbindConfirmVisible.value = true;
  } else {
    WeChat.goToBindPage();
  }
};

const handleConfirmUnbind = () => {
  unbindWeChat()
    .then((res) => {
      if (res.code === 200) {
        MessagePlugin.success('解除绑定成功');
        emit('bind-result', {
          success: true,
          response: res,
        });
      }
    })
    .catch((error) => {
      emit('bind-result', {
        success: false,
        error,
      });
      throw error;
    })
    .finally(() => {
      clearWechatQuery();
      unbindConfirmVisible.value = false;
    });
};

const clearWechatQuery = () => {
  const { code: _code, state: _state, ...query } = route.query;
  router.replace({
    path: route.path,
    query,
    hash: route.hash,
  });
};

onMounted(() => {
  if (props.isBound) {
    return;
  }
  const code = typeof route.query.code === 'string' ? route.query.code : '';
  const state = typeof route.query.state === 'string' ? route.query.state : '';

  if (!code || !state) return;

  if (props.isBound === false) {
    bindWeChat({
      code,
      state,
    })
      .then((res) => {
        if (res.code === 200) {
          MessagePlugin.success('绑定成功');
          emit('bind-result', {
            success: true,
            response: res,
          });
        }
      })
      .catch((error) => {
        emit('bind-result', {
          success: false,
          error,
        });
        throw error;
      })
      .finally(() => {
        clearWechatQuery();
      });
  }
});
</script>
<style lang="less" scoped>
.card-icon-symbol {
  color: #16b368;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.card-icon-symbol :deep(.t-icon) {
  font-size: 28px;
}

.wechat-name {
  font-size: 12px;
  line-height: 1.6;
  color: #97a6c2;
}

@media (max-width: 1200px) {
  .wechat-name {
    font-size: 11px;
  }
}
</style>
