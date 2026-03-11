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
        component: () => import('@/pages/enterprise/dashboard/base/index.vue'),
        meta: {
          title: {
            zh_CN: '概览仪表盘',
            en_US: 'Overview',
          },
          icon: 'chart-bar',
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
      icon: 'task',
      orderNo: 1,
    },
    children: [
      {
        path: 'list',
        name: 'ProjectList',
        component: () => import('@/pages/enterprise/project/projectList/index.vue'),
        meta: {
          title: {
            zh_CN: '项目列表',
            en_US: 'Project List',
          },
          icon: 'view-list',
          keepAlive: false,
          permission: 'enterpriseproject/list',
        },
      },
      {
        path: 'detail',
        name: 'ProjectDetail',
        component: () => import('@/pages/enterprise/project/projectList/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '项目详情',
            en_US: 'Project Detail',
          },
          icon: 'file',
          hidden: true,
          permission: 'enterpriseproject/detail',
        },
      },
      {
        path: 'publish',
        name: 'ProjectPublish',
        component: () => import('@/pages/enterprise/project/projectList/publish.vue'),
        meta: {
          title: {
            zh_CN: '发布项目',
            en_US: 'Publish Project',
          },
          icon: 'add-rectangle',
          hidden: true,
          permission: 'enterpriseproject/create',
        },
      },
      {
        path: 'task',
        name: 'TaskList',
        component: () => import('@/pages/enterprise/project/taskList/index.vue'),
        meta: {
          title: {
            zh_CN: '任务列表',
            en_US: 'Task List',
          },
          icon: 'task',
          permission: 'enterprisetask/list',
        },
      },
      {
        path: 'publishTask',
        name: 'ProjectPublishTask',
        component: () => import('@/pages/enterprise/project/projectList/publishTask/index.vue'),
        meta: {
          title: {
            zh_CN: '发布任务',
            en_US: 'Publish Task',
          },
          icon: 'add-circle',
          hidden: true,
          permission: 'enterprisetask/publish',
        },
      },
      {
        path: 'taskDetail',
        name: 'TaskDetail',
        component: () => import('@/pages/enterprise/project/taskList/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '任务详情',
            en_US: 'Task Detail',
          },
          icon: 'search',
          hidden: true,
        },
      },
      {
        path: 'recruit',
        name: 'Recruit',
        component: () => import('@/pages/enterprise/project/taskList/detail/recruit.vue'),
        meta: {
          title: {
            zh_CN: '招募任务成员',
            en_US: 'Recruit Task Members',
          },
          icon: 'user',
          hidden: true,
        },
      },
      {
        path: 'registrationApproval',
        name: 'RegistrationApproval',
        component: () => import('@/pages/enterprise/project/registrationApproval/index.vue'),
        meta: {
          title: {
            zh_CN: '报名审核',
            en_US: 'Registration Approval',
          },
          icon: 'verified',
        },
      },
      {
        path: 'deliveryUpload',
        name: 'DeliveryUpload',
        component: () => import('@/pages/enterprise/project/deliveryUpload/index.vue'),
        meta: {
          title: {
            zh_CN: '交付物上传',
            en_US: 'Delivery Upload',
          },
          icon: 'upload',
        },
      },
      {
        path: 'deliveryUploadDetail',
        name: 'DeliveryUploadDetail',
        component: () => import('@/pages/enterprise/project/deliveryUpload/upload.vue'),
        meta: {
          title: {
            zh_CN: '上传交付物',
            en_US: 'Delivery Upload Detail',
          },
          icon: 'upload-1',
          hidden: true,
          keepAlive: false,
        },
      },
      {
        path: 'deliveryDetail',
        name: 'DeliveryDetail',
        component: () => import('@/pages/enterprise/project/deliveryUpload/detail.vue'),
        meta: {
          title: {
            zh_CN: '交付物详情',
            en_US: 'Delivery Detail',
          },
          icon: 'upload-1',
          hidden: true,
          keepAlive: false,
        },
      },
      {
        path: 'deliveryApproval',
        name: 'DeliveryApproval',
        component: () => import('@/pages/enterprise/project/deliveryApproval/index.vue'),
        meta: {
          title: {
            zh_CN: '交付物审批',
            en_US: 'Delivery Approval',
          },
          icon: 'check-circle',
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
      icon: 'building',
      orderNo: 2,
    },
    children: [
      {
        path: 'list',
        name: 'CustomerList',
        component: () => import('@/pages/enterprise/customer/list/index.vue'),
        meta: {
          title: {
            zh_CN: '企业列表',
            en_US: 'Customer List',
          },
          icon: 'view-list',
          keepAlive: false,
        },
      },
      {
        path: 'form',
        name: 'CustomerForm',
        component: () => import('@/pages/enterprise/customer/form/index.vue'),
        meta: {
          title: {
            zh_CN: '企业表单',
            en_US: 'Customer Form',
          },
          icon: 'form',
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
      icon: 'usergroup',
      orderNo: 3,
    },
    children: [
      {
        path: 'list',
        name: 'TalentList',
        component: () => import('@/pages/enterprise/talent/list/index.vue'),
        meta: {
          title: {
            zh_CN: '人员列表',
            en_US: 'Talent List',
          },
          icon: 'usergroup',
          keepAlive: true,
        },
      },
      {
        path: 'detail',
        name: 'TalentDetail',
        component: () => import('@/pages/enterprise/talent/detail/index.vue'),
        meta: {
          title: {
            zh_CN: '人员详情',
            en_US: 'Talent Detail',
          },
          icon: 'user-circle',
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
      icon: 'wallet',
      orderNo: 4,
    },
    children: [
      {
        path: 'upload',
        name: 'PaymentUpload',
        component: () => import('@/pages/enterprise/payment/upload/index.vue'),
        meta: {
          title: {
            zh_CN: '结算单上传',
            en_US: 'Payment Upload',
          },
          icon: 'upload',
          keepAlive: false,
        },
      },
      {
        path: 'date',
        name: 'PaymentDate',
        component: () => import('@/pages/enterprise/payment/upload/date.vue'),
        meta: {
          title: {
            zh_CN: '结算单日期',
            en_US: 'Payment Upload Date',
          },
          icon: 'upload-1',
          hidden: true,
          keepAlive: false,
        },
      },
      {
        path: 'detail',
        name: 'PaymentDetail',
        component: () => import('@/pages/enterprise/payment/upload/detail.vue'),
        meta: {
          title: {
            zh_CN: '结算单详情',
            en_US: 'Payment Upload Detail',
          },
          icon: 'upload-1',
          hidden: true,
          keepAlive: false,
        },
      },
      {
        path: 'pay',
        name: 'PaymentPay',
        component: () => import('@/pages/enterprise/payment/pay/index.vue'),
        meta: {
          title: {
            zh_CN: '账单支付',
            en_US: 'Payment Pay',
          },
          icon: 'creditcard',
          keepAlive: false,
        },
      },
      {
        path: 'payDetail',
        name: 'PaymentPayDetail',
        component: () => import('@/pages/enterprise/payment/pay/detail.vue'),
        meta: {
          title: {
            zh_CN: '账单支付详情',
            en_US: 'Payment Pay Detail',
          },
          icon: 'creditcard',
          hidden: true,
          keepAlive: false,
        },
      },
      {
        path: 'record',
        name: 'PaymentRecord',
        component: () => import('@/pages/enterprise/payment/record/index.vue'),
        meta: {
          title: {
            zh_CN: '支付记录',
            en_US: 'Payment Record',
          },
          icon: 'history',
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
      icon: 'setting',
      orderNo: 5,
    },
    children: [
      {
        path: 'permission',
        name: 'SettingPermission',
        component: () => import('@/pages/enterprise/setting/permission/index.vue'),
        meta: {
          title: {
            zh_CN: '权限设置',
            en_US: 'Permission Setting',
          },
          permission: '__super_admin_only__',
          icon: 'key',
          keepAlive: true,
        },
      },
      {
        path: 'security',
        name: 'SettingSecurity',
        component: () => import('@/pages/enterprise/setting/security/index.vue'),
        meta: {
          title: {
            zh_CN: '安全设置',
            en_US: 'Security Setting',
          },
          icon: 'lock-on',
          keepAlive: false,
        },
      },
      {
        path: 'profile',
        name: 'SettingProfile',
        component: () => import('@/pages/enterprise/setting/profile/index.vue'),
        meta: {
          title: {
            zh_CN: '个人信息',
            en_US: 'Profile',
          },
          icon: 'user-circle',
          keepAlive: false,
        },
      },
    ],
  },
];
