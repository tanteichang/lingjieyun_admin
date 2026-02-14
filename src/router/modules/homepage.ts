import {
  AddCircleIcon,
  AddRectangleIcon,
  BuildingIcon,
  ChartBarIcon,
  ChartIcon,
  CheckCircleIcon,
  CreditcardIcon,
  DashboardIcon,
  FileIcon,
  FormIcon,
  HistoryIcon,
  LockOnIcon,
  SearchIcon,
  SettingIcon,
  TaskIcon,
  Upload1Icon,
  UploadIcon,
  UserCircleIcon,
  UsergroupIcon,
  VerifiedIcon,
  ViewListIcon,
  WalletIcon,
} from 'tdesign-icons-vue-next';
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
          icon: shallowRef(ChartBarIcon),
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
          icon: shallowRef(ChartIcon),
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
      icon: shallowRef(TaskIcon),
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
          icon: shallowRef(ViewListIcon),
          keepAlive: false,
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
          icon: shallowRef(FileIcon),
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
          icon: shallowRef(AddRectangleIcon),
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
          icon: shallowRef(TaskIcon),
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
          icon: shallowRef(AddCircleIcon),
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
          icon: shallowRef(SearchIcon),
          hidden: true,
        },
      },
      {
        path: 'registrationApproval',
        name: 'RegistrationApproval',
        component: () => import('@/pages/project/registrationApproval/index.vue'),
        meta: {
          title: {
            zh_CN: '报名审核',
            en_US: 'Registration Approval',
          },
          icon: shallowRef(VerifiedIcon),
        },
      },
      {
        path: 'deliveryUpload',
        name: 'DeliveryUpload',
        component: () => import('@/pages/project/deliveryUpload/index.vue'),
        meta: {
          title: {
            zh_CN: '交付上传',
            en_US: 'Delivery Upload',
          },
          icon: shallowRef(UploadIcon),
        },
      },
      {
        path: 'deliveryUploadDetail',
        name: 'DeliveryUploadDetail',
        component: () => import('@/pages/project/deliveryUpload/uploadDetail.vue'),
        meta: {
          title: {
            zh_CN: '上传交付物',
            en_US: 'Delivery Upload Detail',
          },
          icon: shallowRef(Upload1Icon),
          hidden: true,
          keepAlive: false,
        },
      },
      {
        path: 'deliveryApproval',
        name: 'DeliveryApproval',
        component: () => import('@/pages/project/deliveryApproval/index.vue'),
        meta: {
          title: {
            zh_CN: '交付物审批',
            en_US: 'Delivery Approval',
          },
          icon: shallowRef(CheckCircleIcon),
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
      icon: shallowRef(BuildingIcon),
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
          icon: shallowRef(ViewListIcon),
          keepAlive: false,
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
          icon: shallowRef(FormIcon),
          hidden: true,
        },
      },
    ],
  },
  {
    path: '/talent',
    component: Layout,
    redirect: '/talent/list',
    name: 'talent',
    meta: {
      title: {
        zh_CN: '人员管理',
        en_US: 'Talent',
      },
      icon: shallowRef(UsergroupIcon),
      orderNo: 3,
    },
    children: [
      {
        path: 'list',
        name: 'TalentList',
        component: () => import('@/pages/talent/list/index.vue'),
        meta: {
          title: {
            zh_CN: '人员列表',
            en_US: 'Talent List',
          },
          icon: shallowRef(UsergroupIcon),
          keepAlive: false,
        },
      },
      {
        path: 'detail',
        name: 'TalentDetail',
        component: () => import('@/pages/talent/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '人员详情',
            en_US: 'Talent Detail',
          },
          icon: shallowRef(UserCircleIcon),
          hidden: true,
        },
      },
    ],
  },
  {
    path: '/payment',
    component: Layout,
    redirect: '/payment/list',
    name: 'payment',
    meta: {
      title: {
        zh_CN: '结算管理',
        en_US: 'Payment',
      },
      icon: shallowRef(WalletIcon),
      orderNo: 4,
    },
    children: [
      {
        path: 'upload',
        name: 'PaymentUpload',
        component: () => import('@/pages/payment/upload/index.vue'),
        meta: {
          title: {
            zh_CN: '结算单上传',
            en_US: 'Payment Upload',
          },
          icon: shallowRef(UploadIcon),
          keepAlive: false,
        },
      },
      {
        path: 'pay',
        name: 'PaymentPay',
        component: () => import('@/pages/payment/pay/index.vue'),
        meta: {
          title: {
            zh_CN: '账单支付',
            en_US: 'Payment Pay',
          },
          icon: shallowRef(CreditcardIcon),
          keepAlive: false,
        },
      },
      {
        path: 'record',
        name: 'PaymentRecord',
        component: () => import('@/pages/payment/record/index.vue'),
        meta: {
          title: {
            zh_CN: '支付记录',
            en_US: 'Payment Record',
          },
          icon: shallowRef(HistoryIcon),
          keepAlive: false,
        },
      },
    ],
  },
  {
    path: '/setting',
    component: Layout,
    redirect: '/setting/account',
    name: 'setting',
    meta: {
      title: {
        zh_CN: '系统设置',
        en_US: 'Setting',
      },
      icon: shallowRef(SettingIcon),
      orderNo: 5,
    },
    children: [
      {
        path: 'security',
        name: 'SettingSecurity',
        component: () => import('@/pages/setting/security/index.vue'),
        meta: {
          title: {
            zh_CN: '安全设置',
            en_US: 'Security Setting',
          },
          icon: shallowRef(LockOnIcon),
          keepAlive: false,
        },
      },
      {
        path: 'profile',
        name: 'SettingProfile',
        component: () => import('@/pages/setting/profile/index.vue'),
        meta: {
          title: {
            zh_CN: '个人信息',
            en_US: 'Profile',
          },
          icon: shallowRef(UserCircleIcon),
          keepAlive: false,
        },
      },
    ],
  },
];
