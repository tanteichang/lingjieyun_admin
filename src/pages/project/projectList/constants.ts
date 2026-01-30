import type { FormRule, UploadFile } from 'tdesign-vue-next';

export const FORM_RULES: Record<string, FormRule[]> = {
  name: [{ required: true, message: '请输入合同名称', type: 'error' }],
  type: [{ required: true, message: '请选择合同类型', type: 'error' }],
  payment: [{ required: true, message: '请选择合同收付类型', type: 'error' }],
  amount: [{ required: true, message: '请输入合同金额', type: 'error' }],
  partyA: [{ required: true, message: '请选择甲方', type: 'error' }],
  partyB: [{ required: true, message: '请选择乙方', type: 'error' }],
  signDate: [{ required: true, message: '请选择日期', type: 'error' }],
  startDate: [{ required: true, message: '请选择日期', type: 'error' }],
  endDate: [{ required: true, message: '请选择日期', type: 'error' }],
  company: [{ required: true, message: '请选择所属企业', type: 'error' }],
};

export const INITIAL_DATA = {
  name: '',
  customer_id: '',
  desc: '',
  invoice_type_id: null,
  start_time: '',
  end_time: '',
  project_type: null,
  time_range: [],
};

export const TYPE_OPTIONS = [
  { label: 'Type A', value: '1' },
  { label: 'Type B', value: '2' },
  { label: 'Type C', value: '3' },
];

export const PARTY_A_OPTIONS = [
  { label: 'Company A', value: '1' },
  { label: 'Company B', value: '2' },
  { label: 'Company C', value: '3' },
];

export const PARTY_B_OPTIONS = [
  { label: 'Company A', value: '1' },
  { label: 'Company B', value: '2' },
  { label: 'Company C', value: '3' },
];

export const COMPANY_OPTIONS = [
  { label: 'Company A', value: '1' },
  { label: 'Company B', value: '2' },
  { label: 'Company C', value: '3' },
];
