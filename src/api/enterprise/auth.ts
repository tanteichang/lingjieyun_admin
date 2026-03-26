import type {
  BindListResponse,
  BindWeChatPayload,
  BindWeChatResponse,
  CaptchaResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  ForgetPasswordPayload,
  ForgetPasswordResponse,
  LoginByWeChatPayload,
  LoginByWeChatResponse,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  SendEmailCodePayload,
  SendEmailCodeResponse,
  SendSmsCodePayload,
  SendSmsCodeResponse,
  UnbindWeChatResponse,
  VerifyCaptchaPayload,
  VerifyCaptchaResponse,
  VerifyEmailCodePayload,
  VerifyEmailCodeResponse,
  VerifyEmailSmsCodePayload,
  VerifyEmailSmsCodeResponse,
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
  BindList: '/admin/enterprise/bindList',
  UnbindWeChat: '/admin/enterprise/unbindWeChat',
  SendEmailCode: '/admin/enterprise/sendEmailCode',
  VerifyEmailCode: '/admin/enterprise/verifyEmailCode',
  VerifyEmailSmsCode: '/admin/enterprise/verifyEmailSmsCode',
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
  return getRequest<BindWeChatResponse>({
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

export function bindList() {
  return getRequest<BindListResponse>({
    url: Api.BindList,
  });
}

export function unbindWeChat() {
  return postRequest<UnbindWeChatResponse>({
    url: Api.UnbindWeChat,
    showError: true,
  });
}

export function sendEmailCode(params: SendEmailCodePayload) {
  return postRequest<SendEmailCodeResponse>({
    url: Api.SendEmailCode,
    params,
    showError: true,
  });
}

export function verifyEmailCode(params: VerifyEmailCodePayload) {
  return postRequest<VerifyEmailCodeResponse>({
    url: Api.VerifyEmailCode,
    params,
    showError: true,
  });
}

export function verifyEmailSmsCode(params: VerifyEmailSmsCodePayload) {
  return postRequest<VerifyEmailSmsCodeResponse>({
    url: Api.VerifyEmailSmsCode,
    params,
    showError: true,
  });
}
