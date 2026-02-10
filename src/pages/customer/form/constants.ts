import type { CreateCustomerPayload } from '@/api/model/customer';

export const INITIAL_DATA: CreateCustomerPayload = {
  name: '',
  full_name: '',
  contact_person: '',
  contact_phone: '',
  address: '',
  manager_id: null,
  credit_code: '',
};
