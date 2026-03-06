import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  SendSmsCodePayload,
  SendSmsCodeResponse,
} from '@/api/model/enterprise/auth';
import { request } from '@/utils/request';

const Api = {
  Login: '/admin/enterprise/login',
  Register: '/admin/enterprise/registerAdmin',
  SendSmsCode: '/admin/enterprise/sendSmsCode',
};

export function login(params: LoginPayload) {
  return request.post<LoginResponse>({
    url: Api.Login,
    params,
  });
}

export function sendSmsCode(params: SendSmsCodePayload) {
  return request.post<SendSmsCodeResponse>({
    url: Api.SendSmsCode,
    params,
  });
}

export function register(params: RegisterPayload) {
  return request.post<RegisterResponse>({
    url: Api.Register,
    params,
  });
}
