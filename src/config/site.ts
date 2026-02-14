export interface FooterIcpRecord {
  /** ICP 备案展示文案 */
  text: string;
  /** ICP 备案跳转地址 */
  href: string;
}

export interface FooterPublicSecurityRecord {
  /** 公安备案展示文案 */
  text: string;
  /** 公安备案跳转地址 */
  href: string;
}

export interface FooterCustomItem {
  /** 自定义项展示文案 */
  text: string;
  /** 自定义项地址（文件 URL 或页面链接） */
  href: string;
}

export interface FooterFilingConfig {
  /** ICP 备案（固定第一项） */
  icp: FooterIcpRecord;
  /** 公安备案（固定第二项） */
  publicSecurity: FooterPublicSecurityRecord;
  /** 自定义扩展项（固定在备案后展示） */
  customItems: FooterCustomItem[];
}

export interface FooterConfig {
  /** 版权起始年份，会在页面中与当前年份组合展示 */
  startYear: number;
  /** 公司主体名称 */
  companyName: string;
  /** 版权补充文案，如：All Rights Reserved */
  rightsText: string;
  /** 备案配置：ICP -> 公安备案 -> 自定义项 */
  filing: FooterFilingConfig;
}

export interface SiteConfig {
  /** 页脚配置 */
  footer: FooterConfig;
}

export const siteConfig: SiteConfig = {
  footer: {
    // 版权开始年份（示例：2024）
    startYear: 2024,
    // 公司名称
    companyName: '广州灵捷云数字科技有限公司',
    // 版权补充文案
    rightsText: 'All Rights Reserved',
    filing: {
      // ICP 备案（固定第一项）
      icp: {
        text: '粤ICP备2026001112号-1',
        href: 'https://beian.miit.gov.cn/',
      },
      // 公安备案（固定第二项，图标在 Footer 组件内固定渲染）
      publicSecurity: {
        text: '粤公网安备44011202003557号',
        href: 'https://beian.mps.gov.cn/#/query/webSearch?code=44011202003557',
      },
      // 自定义扩展项（示例留空，后续 CMS 可动态下发）
      customItems: [],
    },
  },
};
