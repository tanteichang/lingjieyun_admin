export type PayResult = '支付中' | '支付成功' | '支付失败';

export interface PaymentRecordQuery {
  dateRange: string;
  payResult: '' | PayResult;
  name: string;
  enterprise: string;
  project: string;
  task: string;
  billNo: string;
  orderNo: string;
}

export interface PaymentRecordRow {
  id: number;
  name: string;
  payTime: string;
  payResult: PayResult;
  importAmount: string;
  issueAmount: string;
  phone: string;
  idCard: string;
  bankCard: string;
  personalTax: string;
  project: string;
  task: string;
  enterprise: string;
  billNo: string;
  orderNo: string;
  channel: string;
  remark: string;
}

export const defaultQuery: PaymentRecordQuery = {
  dateRange: '2026-01-19 - 2026-02-16',
  payResult: '',
  name: '',
  enterprise: '',
  project: '',
  task: '',
  billNo: '',
  orderNo: '',
};

export const payResultOptions = [
  { label: '支付中', value: '支付中' },
  { label: '支付成功', value: '支付成功' },
  { label: '支付失败', value: '支付失败' },
];

export const nameOptions = [
  { label: '陈耀', value: '陈耀' },
  { label: '方中振', value: '方中振' },
  { label: '李权', value: '李权' },
];

export const enterpriseOptions = [{ label: '新际网络科技有限公司', value: '新际网络科技有限公司' }];
export const projectOptions = [{ label: '灵捷云小程序', value: '灵捷云小程序' }];
export const taskOptions = [{ label: '安卓开发', value: '安卓开发' }];

export const fullList: PaymentRecordRow[] = [
  {
    id: 1,
    name: '陈耀',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付中',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '--',
    orderNo: '--',
    channel: '--',
    remark: '',
  },
  {
    id: 2,
    name: '方中振',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付成功',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '289958674415',
    orderNo: '289958674415',
    channel: '灵捷云平台',
    remark: '',
  },
  {
    id: 3,
    name: '李权',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付失败',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '289958674415',
    orderNo: '289958674415',
    channel: '灵捷云平台',
    remark: '',
  },
  {
    id: 4,
    name: '方中振',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付成功',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '289958674415',
    orderNo: '289958674415',
    channel: '灵捷云平台',
    remark: '',
  },
  {
    id: 5,
    name: '李权',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付失败',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '289958674415',
    orderNo: '289958674415',
    channel: '灵捷云平台',
    remark: '',
  },
  {
    id: 6,
    name: '方中振',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付成功',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '289958674415',
    orderNo: '289958674415',
    channel: '灵捷云平台',
    remark: '',
  },
  {
    id: 7,
    name: '李权',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付失败',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '289958674415',
    orderNo: '289958674415',
    channel: '灵捷云平台',
    remark: '',
  },
  {
    id: 8,
    name: '方中振',
    payTime: '2026-02-15 15:20:22',
    payResult: '支付成功',
    importAmount: '18000.00',
    issueAmount: '18000.00',
    phone: '176****369',
    idCard: '4254******554',
    bankCard: '6825******2689',
    personalTax: '180.00',
    project: '灵捷云小程序',
    task: '安卓开发',
    enterprise: '新际网络科技有限公司',
    billNo: '289958674415',
    orderNo: '289958674415',
    channel: '灵捷云平台',
    remark: '',
  },
];
