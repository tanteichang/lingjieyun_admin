import type { ApiResponse } from '../common';

export interface UserResumePayload {
  user_id: number;
}

export interface UserResumeBaseInfo {
  id: number;
  user_id: number;
  progress: number;
  realname: string;
  gender: number;
  mobile: string;
  avatar: string;
  city: number;
  city_name: string;
  advantage: string;
  job_id: number;
  salary_id: number;
  start_job: string | number | null;
  education: number;
  certificate: string;
  min_value: number;
  max_value: number;
  birthday: string | number | null;
  age: number;
  status: number;
  created_at: string | null;
  gender_text: string;
  mobile_masked: string;
  job_name: string;
}

export interface UserResumeEducationItem {
  id: number;
  user_id: number;
  name: string;
  start_time: string | number | null;
  end_time: string | number | null;
  education_id: number;
  major: string;
  desc: string;
  status: number;
  created_at: string | null;
}

export interface UserResumeWorkExperienceItem {
  id: number;
  user_id: number;
  name: string;
  start_time: string | number | null;
  end_time: string | number | null;
  is_line: number;
  job: string;
  job_content: string;
  performance: string;
  department: string;
  status: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface UserResumeProjectHistoryItem {
  id: number;
  user_id: number;
  name: string;
  start_time: string | number | null;
  end_time: string | number | null;
  job_id: number;
  desc: string;
  other: string;
  status: number;
  created_at: string | null;
}

export interface UserResumeUserInfo {
  id: number;
  username: string;
  mobile: string;
  avatar: string;
}

export interface UserResumeResult {
  jianli: UserResumeBaseInfo | null;
  certificate: string[];
  education: UserResumeEducationItem[];
  work_experience: UserResumeWorkExperienceItem[];
  project_history: UserResumeProjectHistoryItem[];
  user_info: UserResumeUserInfo | null;
  has_resume: boolean;
}

export type UserResumeResponse = ApiResponse<UserResumeResult>;
