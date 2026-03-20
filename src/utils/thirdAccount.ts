interface WeChatQRCodeOptions {
  id: string;
  redirectUri: string;
  state?: string;
  style?: string;
  href?: string;
  selfRedirect?: boolean;
  onReady?: (isReady: boolean) => void;
  onQRcodeReady?: () => void;
}

type WeChatQRCodeInstance = {
  onCleanup?: () => void;
} | null;

export class WeChat {
  static readonly APP_ID = 'wx377743ca48ff6c19';
  static readonly SCOPE = 'snsapi_login';
  static readonly LOGIN_REDIRECT_URI = 'https://enterprise.lingjieyun.com/loginByWeChat';
  static readonly BIND_REDIRECT_URI = 'https://enterprise.lingjieyun.com/setting/security';

  static generateState() {
    return crypto.randomUUID().split('-')[0];
  }

  static goToBindPage() {
    const state = this.generateState();
    const REDIRECT_URI = encodeURIComponent(this.BIND_REDIRECT_URI);
    const url = `https://open.weixin.qq.com/connect/qrconnect?appid=${this.APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${this.SCOPE}&state=${state}#wechat_redirect`;
    window.open(url, '_blank');
  }

  static async getQRCode({
    id,
    redirectUri,
    state,
    style = '',
    href = '',
    selfRedirect = false,
    onReady,
    onQRcodeReady,
  }: WeChatQRCodeOptions): Promise<WeChatQRCodeInstance> {
    await import('@/lib/wxLogin');

    const container = document.getElementById(id);
    if (!container || typeof WxLogin !== 'function') {
      return null;
    }

    return new WxLogin({
      self_redirect: selfRedirect,
      id,
      appid: this.APP_ID,
      scope: this.SCOPE,
      state: state || this.generateState(),
      redirect_uri: encodeURI(redirectUri),
      style,
      href,
      onReady,
      stylelite: 1,
      onQRcodeReady,
    }) as WeChatQRCodeInstance;
  }

  static getLoginQRCode(options: Omit<WeChatQRCodeOptions, 'redirectUri'>) {
    return this.getQRCode({
      ...options,
      redirectUri: this.LOGIN_REDIRECT_URI,
    });
  }

  static getBindQRCode(options: Omit<WeChatQRCodeOptions, 'redirectUri'>) {
    return this.getQRCode({
      ...options,
      redirectUri: this.BIND_REDIRECT_URI,
    });
  }
}

declare global {
  const WxLogin:
    | (new (options: {
        self_redirect?: boolean;
        id: string;
        appid: string;
        scope: string;
        redirect_uri: string;
        state?: string;
        style?: string;
        href?: string;
        stylelite?: number;
        onReady?: (isReady: boolean) => void;
        onQRcodeReady?: () => void;
      }) => WeChatQRCodeInstance)
    | undefined;
}

export {};
