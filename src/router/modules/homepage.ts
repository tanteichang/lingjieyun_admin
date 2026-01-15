import { DashboardIcon, AssignmentIcon } from 'tdesign-icons-vue-next';
import { shallowRef } from 'vue';

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
      icon: shallowRef(DashboardIcon),
      orderNo: 0,
    },
    children: [
      {
        path: 'base',
        name: 'DashboardBase',
        component: () => import('@/pages/dashboard/base/index.vue'),
        meta: {
          title: {
            zh_CN: '概览仪表盘',
            en_US: 'Overview',
          },
        },
      },
      {
        path: 'detail',
        name: 'DashboardDetail',
        component: () => import('@/pages/dashboard/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '统计报表',
            en_US: 'Dashboard Detail',
          },
        },
      },
    ],
  },
  {
    path: '/project',
    component: Layout,
    redirect: '/project/list',
    name: 'project',
    meta: {
      title: {
        zh_CN: '项目管理',
        en_US: 'Project',
      },
      icon: shallowRef(AssignmentIcon),
      orderNo: 1,
    },
    children: [
      {
        path: 'list',
        name: 'ProjectList',
        component: () => import('@/pages/project/projectList/index.vue'),
        meta: {
          title: {
            zh_CN: '项目列表',
            en_US: 'Project List',
          },
        },
      },
      {
        path: 'task',
        name: 'TaskList',
        component: () => import('@/pages/project/taskList/index.vue'),
        meta: {
          title: {
            zh_CN: '任务列表',
            en_US: 'Task List',
          },
        },
      },
    ],
  },
];
