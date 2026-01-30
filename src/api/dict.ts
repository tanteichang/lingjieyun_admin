import { request } from '@/utils/request';

import type {
  EducationResponse,
  ExperienceResponse,
  InvoiceTypeResponse,
  JobResponse,
  ProjectTypeResponse,
  SalaryResponse,
} from './model/dict';

const Api = {
  ProjectType: '/api/dict/projectType',
  InvoiceType: '/api/dict/invoiceTypeTree',
  Experience: '/api/dict/experience',
  Salary: '/api/dict/salary',
  Education: '/api/dict/education',
  Job: '/api/dict/job',
};

export function getProjectType() {
  return request.get<ProjectTypeResponse>({
    url: Api.ProjectType,
  });
}

export function getInvoiceType() {
  return request.get<InvoiceTypeResponse>({
    url: Api.InvoiceType,
  });
}
export function getExperience() {
  return request.get<ExperienceResponse>({
    url: Api.Experience,
  });
}
export function getSalary() {
  return request.get<SalaryResponse>({
    url: Api.Salary,
  });
}
export function getEducation() {
  return request.get<EducationResponse>({
    url: Api.Education,
  });
}
export function getJob() {
  return request.get<JobResponse>({
    url: Api.Job,
  });
}
