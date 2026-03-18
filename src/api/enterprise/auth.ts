import type {
  CaptchaResponse,
  LoginByWeChatPayload,
  LoginByWeChatResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  SendSmsCodePayload,
  SendSmsCodeResponse,
  VerifyCaptchaPayload,
  VerifyCaptchaResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  BindWeChatPayload,
  BindWeChatResponse,
  ForgetPasswordPayload,
  ForgetPasswordResponse,
} from '@/api/model/enterprise/auth';
import { getRequest, postRequest } from '@/utils/request';

const Api = {
  Login: '/admin/enterprise/login',
  Register: '/admin/enterprise/registerAdmin',
  SendSmsCode: '/admin/enterprise/sendSmsCode',
  LoginByWeChat: '/admin/enterprise/loginByWeChat',
  Captcha: '/admin/enterprise/captcha',
  VerifyCaptcha: '/admin/enterprise/verifyCaptcha',
  ChangePassword: '/admin/enterprise/password/change',
  BindWeChat: '/admin/enterprise/bindWeChat',
  ForgetPassword: '/admin/enterprise/forgetPassword',
};

export function login(params: LoginPayload) {
  return postRequest<LoginResponse>({
    url: Api.Login,
    params,
    showError: true,
  });
}

export function sendSmsCode(params: SendSmsCodePayload) {
  return postRequest<SendSmsCodeResponse>({
    url: Api.SendSmsCode,
    params,
    showError: true,
  });
}

export function register(params: RegisterPayload) {
  return postRequest<RegisterResponse>({
    url: Api.Register,
    params,
    showError: true,
  });
}

export function loginByWeChat(params: LoginByWeChatPayload) {
  return postRequest<LoginByWeChatResponse>({
    url: Api.LoginByWeChat,
    params,
    showError: true,
  });
}

export function captcha() {
  return getRequest<CaptchaResponse>({
    url: Api.Captcha,
  });
}

export function verifyCaptcha(params: VerifyCaptchaPayload) {
  return postRequest<VerifyCaptchaResponse>({
    url: Api.VerifyCaptcha,
    params,
    showError: true,
  });
}
export function changePassword(params: ChangePasswordPayload) {
  return postRequest<ChangePasswordResponse>({
    url: Api.ChangePassword,
    params,
    showError: true,
  });
}

export function bindWeChat(params: BindWeChatPayload) {
  return postRequest<BindWeChatResponse>({
    url: Api.BindWeChat,
    params,
    showError: true,
  });
}

export function forgetPassword(params: ForgetPasswordPayload) {
  return postRequest<ForgetPasswordResponse>({
    url: Api.ForgetPassword,
    params,
    showError: true,
  });
}
