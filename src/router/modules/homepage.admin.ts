import Layout from '@/layouts/index.vue';

export default [
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/base',
    name: 'dashboard',
    meta: {
      title: {
        zh_CN: '工作台',
        en_US: 'Dashboard',
      },
      icon: 'dashboard',
      orderNo: 0,
    },
    children: [
      {
        path: 'base',
        name: 'DashboardBase',
        component: () => import('@/pages/admin/placeholder/index.vue'),
        meta: {
          title: {
            zh_CN: '管理端',
            en_US: 'Admin',
          },
          icon: 'dashboard',
        },
      },
    ],
  },
];
