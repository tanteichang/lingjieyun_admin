import {
  AcceptancePeriodType,
  AcceptanceType,
  DeliveryMode,
  RecruitmentType,
  SettlementType,
} from '@/api/model/taskModel';

export const provinceOptions = [{ label: '广东省', value: '广东省' }];
export const cityOptions = [{ label: '广州市', value: '广州市' }];
export const districtOptions = [
  { label: '天河区', value: '天河区' },
  { label: '越秀区', value: '越秀区' },
  { label: '海珠区', value: '海珠区' },
];
export const settlementOptions: { label: string; value: SettlementType }[] = [
  { label: '按次', value: SettlementType.PER_TIME },
  { label: '按单', value: SettlementType.PER_ORDER },
  { label: '按日', value: SettlementType.DAILY },
  { label: '按周', value: SettlementType.WEEKLY },
  { label: '按月', value: SettlementType.MONTHLY },
];
export const recruitModeOptions: { label: string; value: RecruitmentType }[] = [
  { label: '自由招募', value: RecruitmentType.FREE },
  { label: '定向招募', value: RecruitmentType.DIRECTED },
];
export const acceptanceOptions: { label: string; value: AcceptanceType }[] = [
  { label: '完结验收', value: AcceptanceType.FINAL },
  { label: '定期验收', value: AcceptanceType.REGULAR },
];
export const acceptancePeriodOptions: { label: string; value: AcceptancePeriodType }[] = [
  { label: '按日', value: AcceptancePeriodType.BY_DAY },
  { label: '按周', value: AcceptancePeriodType.BY_WEEK },
  { label: '按月', value: AcceptancePeriodType.BY_MONTH },
];
export const deliveryOptions: { label: string; value: DeliveryMode }[] = [
  { label: '小程序上传', value: DeliveryMode.MINI_APP },
  { label: '系统批量上传', value: DeliveryMode.SYSTEM_BATCH },
];
