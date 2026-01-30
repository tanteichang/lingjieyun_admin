import { AssignmentIcon, DashboardIcon } from 'tdesign-icons-vue-next';
import { h, shallowRef } from 'vue';

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
        path: 'detail',
        name: 'ProjectDetail',
        component: () => import('@/pages/project/projectList/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '项目详情',
            en_US: 'Project Detail',
          },
          hidden: true,
        },
      },
      {
        path: 'publish',
        name: 'ProjectPublish',
        component: () => import('@/pages/project/projectList/publish.vue'),
        meta: {
          title: {
            zh_CN: '发布项目',
            en_US: 'Publish Project',
          },
          hidden: true,
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
      {
        path: 'publishTask',
        name: 'ProjectPublishTask',
        component: () => import('@/pages/project/projectList/publishTask/index.vue'),
        meta: {
          title: {
            zh_CN: '发布任务',
            en_US: 'Publish Task',
          },
          hidden: true,
        },
      },
      {
        path: 'taskDetail',
        name: 'TaskDetail',
        component: () => import('@/pages/project/taskList/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '任务详情',
            en_US: 'Task Detail',
          },
          hidden: true,
        },
      },
    ],
  },
  {
    path: '/customer',
    component: Layout,
    redirect: '/customer/list',
    name: 'customer',
    meta: {
      title: {
        zh_CN: '企业管理',
        en_US: 'Customer',
      },
      icon: shallowRef(AssignmentIcon),
      orderNo: 2,
    },
    children: [
      {
        path: 'list',
        name: 'CustomerList',
        component: () => import('@/pages/customer/list/index.vue'),
        meta: {
          title: {
            zh_CN: '企业列表',
            en_US: 'Customer List',
          },
        },
      },
      {
        path: 'form',
        name: 'CustomerForm',
        component: () => import('@/pages/customer/form/index.vue'),
        meta: {
          title: {
            zh_CN: '企业表单',
            en_US: 'Customer Form',
          },
          hidden: true,
        },
      },
    ],
  },
];
