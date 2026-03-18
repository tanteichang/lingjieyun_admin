<template>
  <div class="security-action-card" :class="{ 'is-disabled': actionDisabled }">
    <div class="card-top">
      <div class="card-icon" :class="`icon-tone-${iconTone}`">
        <slot name="icon" />
      </div>
      <div class="card-status" :class="`status-tone-${statusTone}`">{{ statusText }}</div>
    </div>

    <div class="card-content">
      <div class="card-title">{{ title }}</div>
      <div class="card-description">{{ description }}</div>
      <div v-if="$slots.default" class="card-extra">
        <slot />
      </div>
    </div>

    <button class="card-action" type="button" :disabled="actionDisabled" @click="$emit('action')">
      {{ actionText }}
    </button>

    <slot name="append" />
  </div>
</template>
<script setup lang="ts">
defineOptions({
  name: 'SecurityActionCard',
});

withDefaults(
  defineProps<{
    title: string;
    description: string;
    statusText: string;
    actionText: string;
    statusTone?: 'success' | 'warning' | 'info' | 'default';
    iconTone?: 'mint' | 'blue' | 'lilac' | 'rose' | 'default';
    actionDisabled?: boolean;
  }>(),
  {
    statusTone: 'default',
    iconTone: 'default',
    actionDisabled: false,
  },
);

defineEmits<{
  action: [];
}>();
</script>
<style lang="less" scoped>
.security-action-card {
  min-height: 236px;
  padding: 24px 28px;
  border-radius: 22px;
  background: #fff;
  border: 1px solid #edf2fb;
  box-shadow:
    0 2px 10px rgb(31 73 125 / 0.06),
    0 12px 28px rgb(76 106 155 / 0.08);
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.security-action-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 6px 18px rgb(31 73 125 / 0.08),
    0 18px 36px rgb(76 106 155 / 0.1);
}

.security-action-card.is-disabled:hover {
  transform: none;
}

.card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.card-icon {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #1f2a44;
  flex-shrink: 0;
}

.icon-tone-default {
  background: linear-gradient(180deg, #eef4ff 0%, #e4edff 100%);
}

.icon-tone-mint {
  background: linear-gradient(180deg, #e4f9f8 0%, #d7f3f5 100%);
}

.icon-tone-blue {
  background: linear-gradient(180deg, #ebf1ff 0%, #e0e9ff 100%);
}

.icon-tone-lilac {
  background: linear-gradient(180deg, #f3edff 0%, #ece5ff 100%);
}

.icon-tone-rose {
  background: linear-gradient(180deg, #ffefee 0%, #fde7e5 100%);
}

.card-icon :deep(.t-icon) {
  font-size: 28px;
}

.card-status {
  min-height: 34px;
  padding: 0 14px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.status-tone-default {
  color: #5d6b88;
  background: #f2f5fb;
}

.status-tone-success {
  color: #19b85d;
  background: #ebfaef;
}

.status-tone-warning {
  color: #ff9800;
  background: #fff6e2;
}

.status-tone-info {
  color: #3a7bff;
  background: #edf3ff;
}

.card-content {
  flex: 1;
}

.card-title {
  font-size: 18px;
  line-height: 1.3;
  font-weight: 700;
  color: #1f2a44;
}

.card-description {
  margin-top: 10px;
  font-size: 12px;
  line-height: 1.65;
  color: #97a6c2;
}

.card-extra {
  margin-top: 18px;
}

.card-action {
  align-self: flex-start;
  border: 0;
  padding: 0;
  background: transparent;
  color: #2f6eff;
  font-size: 14px;
  line-height: 1.4;
  font-weight: 700;
  cursor: pointer;
}

.card-action:disabled {
  color: #a3aec2;
  cursor: not-allowed;
}

@media (max-width: 1200px) {
  .security-action-card {
    min-height: 220px;
    padding: 20px;
    border-radius: 18px;
  }

  .card-icon {
    width: 56px;
    height: 56px;
    border-radius: 16px;
  }

  .card-status {
    min-height: 30px;
    padding: 0 12px;
    font-size: 12px;
  }

  .card-title {
    font-size: 16px;
  }

  .card-description {
    font-size: 11px;
  }

  .card-action {
    font-size: 13px;
  }
}
</style>
