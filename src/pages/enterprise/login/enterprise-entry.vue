<template>
  <div class="enterprise-entry-page">
    <div class="page-content">
      <h1 class="title">请选择企业认证方式</h1>
      <p class="desc">已有企业邀请码可选择加入企业；如您是企业管理员，可直接注册企业并提交认证资料。</p>

      <div class="option-grid">
        <section class="option-card">
          <div class="card-header">
            <t-icon name="usergroup" />
            <h2>加入企业</h2>
          </div>
          <p>适用于已被企业管理员邀请的成员，使用已有账号登录后加入企业。</p>
          <t-button block variant="outline" @click="handleJoinEnterprise">去加入企业</t-button>
        </section>

        <section class="option-card">
          <div class="card-header">
            <t-icon name="city-1" />
            <h2>注册企业</h2>
          </div>
          <p>适用于企业管理员，完成企业信息填写并提交资质审核，审批通过后即可启用。</p>
          <t-button block theme="primary" @click="handleRegisterEnterprise">去注册企业</t-button>
        </section>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { MessagePlugin } from 'tdesign-vue-next';
import { useRouter } from 'vue-router';

defineOptions({
  name: 'EnterpriseRegisterEntry',
});

const router = useRouter();

const handleJoinEnterprise = () => {
  MessagePlugin.info('请使用企业管理员分配的账号登录后加入企业');
  router.push({ name: 'login' });
};

const handleRegisterEnterprise = () => {
  router.push({ name: 'enterpriseRegister' });
};
</script>
<style lang="less" scoped>
.enterprise-entry-page {
  min-height: 100vh;
  background: #fff;
}

.page-content {
  width: 980px;
  margin: 0 auto;
  padding: 72px 0 64px;
}

.title {
  margin: 0;
  font-size: 32px;
  line-height: 40px;
  color: #1f2738;
}

.desc {
  margin: 16px 0 40px;
  font-size: 14px;
  line-height: 22px;
  color: #5f6675;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.option-card {
  border: 1px solid #e7ebf3;
  border-radius: 12px;
  padding: 28px 24px;

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;

    .t-icon {
      color: #0052d9;
      font-size: 20px;
    }

    h2 {
      margin: 0;
      font-size: 20px;
      line-height: 28px;
      color: #1f2738;
    }
  }

  p {
    min-height: 44px;
    margin: 0 0 24px;
    font-size: 14px;
    line-height: 22px;
    color: #5f6675;
  }
}

@media (max-width: 980px) {
  .page-content {
    width: auto;
    padding: 36px 16px 40px;
  }

  .title {
    font-size: 24px;
    line-height: 32px;
  }

  .option-grid {
    grid-template-columns: 1fr;
  }
}
</style>
