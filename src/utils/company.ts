const COMPANY_SUFFIXES = [
  '集团股份有限公司',
  '股份有限公司',
  '集团有限公司',
  '有限责任公司',
  '有限公司',
  '有限合伙',
  '合伙企业',
  '工作室',
  '事务所',
  '公司',
];

const GENERIC_SUFFIXES = [
  '数字科技',
  '信息技术',
  '网络科技',
  '科技发展',
  '人力资源',
  '管理咨询',
  '电子商务',
  '供应链',
  '互联网',
  '计算机',
  '传媒',
  '科技',
  '网络',
  '信息',
  '技术',
  '商贸',
  '贸易',
  '实业',
  '服务',
  '系统',
];

const normalizeText = (value: string) =>
  value
    .trim()
    .replace(/[()（）[\]【】<>《》]/g, ' ')
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const stripSuffixes = (value: string, suffixes: string[]) => {
  let current = value.trim();
  let changed = true;

  while (changed && current) {
    changed = false;
    for (const suffix of suffixes) {
      if (current.endsWith(suffix)) {
        current = current.slice(0, -suffix.length).trim();
        changed = true;
        break;
      }
    }
  }

  return current;
};

const getEnglishAbbr = (value: string, maxLength: number) => {
  const words = value.match(/[A-Za-z0-9]+/g) || [];
  if (!words.length) return '';
  if (words.length === 1) return words[0].slice(0, maxLength).toUpperCase();
  return words
    .slice(0, maxLength)
    .map((item) => item.charAt(0))
    .join('')
    .toUpperCase();
};

export const getCompanyAbbr = (fullName: string, maxLength = 4) => {
  const normalized = normalizeText(fullName || '');
  if (!normalized) return '企业';

  if (/^[A-Za-z0-9][A-Za-z0-9\s&._-]*$/.test(normalized)) {
    return getEnglishAbbr(normalized, Math.min(maxLength, 4)) || 'CO';
  }

  let core = stripSuffixes(normalized, COMPANY_SUFFIXES)
    .replace(/^(中国|中华人民共和国)/, '')
    .replace(/^[\u4e00-\u9fa5]{2,3}(?:省|市|区|县|州|盟)/, '')
    .trim();

  core = stripSuffixes(core, GENERIC_SUFFIXES).replace(/\s+/g, '');

  if (!core) {
    core = normalized.replace(/\s+/g, '');
  }

  if (core.length <= maxLength) return core;
  return core.slice(-maxLength);
};
