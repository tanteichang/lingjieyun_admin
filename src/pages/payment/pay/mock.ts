export type BillStatus = '待支付' | '支付中' | '支付成功' | '部分成功' | '支付失败' | '已关闭';

export interface PaymentPayQuery {
  dateRange: string;
  status: '' | BillStatus;
  enterprise: string;
  project: string;
  task: string;
  billNo: string;
}

export interface PaymentBillRow {
  id: number;
  createTime: string;
  settleName: string;
  billStatus: BillStatus;
  enterprise: string;
  project: string;
  task: string;
  invoiceType: string;
  settleCount: number;
  importAmount: string;
  issueAmount: string;
  serviceFee: string;
  subsidyServiceFee: string;
  personalTax: string;
  vatAndAdditional: string;
  totalCost: string;
  paymentInfo: string;
  billNo: string;
  successCount: number;
  successAmount: string;
  paidServiceFee: string;
  failCount: number;
  failAmount: string;
}

export const defaultQuery: PaymentPayQuery = {
  dateRange: '2026-01-19 - 2026-02-16',
  status: '',
  enterprise: '',
  project: '',
  task: '',
  billNo: '',
};

export const statusOptions = [
  { label: '待支付', value: '待支付' },
  { label: '支付中', value: '支付中' },
  { label: '支付成功', value: '支付成功' },
  { label: '部分成功', value: '部分成功' },
  { label: '支付失败', value: '支付失败' },
  { label: '已关闭', value: '已关闭' },
];

export const enterpriseOptions = [{ label: '新际网络科技', value: '新际网络科技' }];
export const projectOptions = [{ label: '灵捷云服务平台APP项目', value: '灵捷云服务平台APP项目' }];
export const taskOptions = [{ label: '安卓开发', value: '安卓开发' }];

export const fullList: PaymentBillRow[] = [
  {
    id: 1,
    createTime: '2026-02-15 10:39',
    settleName: '结算单模板',
    billStatus: '待支付',
    enterprise: '新际网络科技',
    project: '灵捷云服务平台APP项目',
    task: '安卓开发',
    invoiceType: '现代服务',
    settleCount: 3,
    importAmount: '14,607.00',
    issueAmount: '14,607.00',
    serviceFee: '1,168.56',
    subsidyServiceFee: '0',
    personalTax: '--',
    vatAndAdditional: '--',
    totalCost: '15,775.56',
    paymentInfo: '--',
    billNo: '--',
    successCount: 0,
    successAmount: '0',
    paidServiceFee: '0',
    failCount: 0,
    failAmount: '0',
  },
  {
    id: 2,
    createTime: '2026-01-15 10:39',
    settleName: '12月份工资',
    billStatus: '支付成功',
    enterprise: '新际网络科技',
    project: '灵捷云服务平台APP项目',
    task: '安卓开发',
    invoiceType: '现代服务',
    settleCount: 3,
    importAmount: '14,607.00',
    issueAmount: '14,607.00',
    serviceFee: '1,168.56',
    subsidyServiceFee: '0',
    personalTax: '--',
    vatAndAdditional: '--',
    totalCost: '15,775.56',
    paymentInfo: '--',
    billNo: '1355845...',
    successCount: 3,
    successAmount: '15,775.56',
    paidServiceFee: '1,168.56',
    failCount: 0,
    failAmount: '0',
  },
  {
    id: 3,
    createTime: '2026-01-15 10:39',
    settleName: '12月份工资',
    billStatus: '支付失败',
    enterprise: '新际网络科技',
    project: '灵捷云服务平台APP项目',
    task: '安卓开发',
    invoiceType: '现代服务',
    settleCount: 3,
    importAmount: '14,607.00',
    issueAmount: '14,607.00',
    serviceFee: '1,168.56',
    subsidyServiceFee: '0',
    personalTax: '--',
    vatAndAdditional: '--',
    totalCost: '15,775.56',
    paymentInfo: '--',
    billNo: '1355845...',
    successCount: 3,
    successAmount: '15,775.56',
    paidServiceFee: '1,168.56',
    failCount: 0,
    failAmount: '0',
  },
  {
    id: 4,
    createTime: '2026-01-15 10:39',
    settleName: '12月份工资',
    billStatus: '已关闭',
    enterprise: '新际网络科技',
    project: '灵捷云服务平台APP项目',
    task: '安卓开发',
    invoiceType: '现代服务',
    settleCount: 3,
    importAmount: '14,607.00',
    issueAmount: '14,607.00',
    serviceFee: '1,168.56',
    subsidyServiceFee: '0',
    personalTax: '--',
    vatAndAdditional: '--',
    totalCost: '15,775.56',
    paymentInfo: '--',
    billNo: '1355845...',
    successCount: 3,
    successAmount: '15,775.56',
    paidServiceFee: '1,168.56',
    failCount: 0,
    failAmount: '0',
  },
  {
    id: 5,
    createTime: '2026-01-14 10:39',
    settleName: '12月份工资',
    billStatus: '支付中',
    enterprise: '新际网络科技',
    project: '灵捷云服务平台APP项目',
    task: '安卓开发',
    invoiceType: '现代服务',
    settleCount: 3,
    importAmount: '14,607.00',
    issueAmount: '14,607.00',
    serviceFee: '1,168.56',
    subsidyServiceFee: '0',
    personalTax: '--',
    vatAndAdditional: '--',
    totalCost: '15,775.56',
    paymentInfo: '--',
    billNo: '1355845...',
    successCount: 0,
    successAmount: '0',
    paidServiceFee: '0',
    failCount: 0,
    failAmount: '0',
  },
  {
    id: 6,
    createTime: '2026-01-13 10:39',
    settleName: '12月份工资',
    billStatus: '部分成功',
    enterprise: '新际网络科技',
    project: '灵捷云服务平台APP项目',
    task: '安卓开发',
    invoiceType: '现代服务',
    settleCount: 3,
    importAmount: '14,607.00',
    issueAmount: '14,607.00',
    serviceFee: '1,168.56',
    subsidyServiceFee: '0',
    personalTax: '--',
    vatAndAdditional: '--',
    totalCost: '15,775.56',
    paymentInfo: '--',
    billNo: '1355845...',
    successCount: 2,
    successAmount: '10,517.04',
    paidServiceFee: '778.90',
    failCount: 1,
    failAmount: '5,258.52',
  },
];
