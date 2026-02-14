export interface SettleRow {
  id: number;
  name: string;
  phone: string;
  idCard: string;
  deliveryStatus: '待交付' | '已交付';
  submitTime: string;
}

export interface RecordRow {
  id: number;
  settleNo: string;
  uploadTime: string;
  totalCount: number;
  amount: string;
  status: string;
}

export const topInfo = {
  company: '广州新际网络科技有限公司',
  balance: '8,980.00',
  payChannel: '银联卡',
  accountNo: '785 8818 462 442',
  accountName: '灵捷云平台测试账户',
  details: [
    { label: '任务标题', value: '安卓开发' },
    { label: '结算方式', value: '月结' },
    { label: '任务类型', value: '软件开发' },
    { label: '佣金结算', value: '3000 元 /月' },
    { label: '所属项目', value: '灵捷云服务平台APP项目' },
    { label: '任务状态', value: '● 进行中', status: 'running' },
  ],
};

export const statusOptions = [
  { label: '待交付', value: '待交付' },
  { label: '已交付', value: '已交付' },
];

export const settleList: SettleRow[] = [
  {
    id: 1,
    name: '陈龙',
    phone: '178****6688',
    idCard: '4258****6688',
    deliveryStatus: '待交付',
    submitTime: '2026.01.09 10:39',
  },
  {
    id: 2,
    name: '肖萍',
    phone: '136****9897',
    idCard: '4258****6688',
    deliveryStatus: '已交付',
    submitTime: '2026.01.08 10:39',
  },
  {
    id: 3,
    name: '方丽',
    phone: '159****8778',
    idCard: '4258****6688',
    deliveryStatus: '已交付',
    submitTime: '2026.01.06 10:39',
  },
];

export const recordList: RecordRow[] = [
  {
    id: 1,
    settleNo: 'JS-20260109-001',
    uploadTime: '2026.01.09 10:39',
    totalCount: 3,
    amount: '9000.00',
    status: '已结算',
  },
  {
    id: 2,
    settleNo: 'JS-20260108-001',
    uploadTime: '2026.01.08 10:39',
    totalCount: 2,
    amount: '6000.00',
    status: '已结算',
  },
];
