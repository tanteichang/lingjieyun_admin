import type { UserResumePayload, UserResumeResponse } from '@/api/model/enterprise/member';
import { getRequest } from '@/utils/request';

const API = {
  UserResume: '/admin/enterprise/member/userResume',
};

export const userResume = (params: UserResumePayload) => {
  return getRequest<UserResumeResponse>({
    url: API.UserResume,
    params,
    showError: true,
  });
};
