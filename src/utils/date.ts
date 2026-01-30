// 获取常用时间
import dayjs from 'dayjs';

export const LAST_7_DAYS = [
  dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
  dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
];

export const LAST_30_DAYS = [
  dayjs().subtract(30, 'day').format('YYYY-MM-DD'),
  dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
];

// utils/date.js
/**
 * 将 Date/毫秒戳 转换为十位秒级时间戳
 * @param {Date|number|null} value - 原始值
 * @returns {string} 十位时间戳（空值返回空字符串）
 */
export const convertToTenDigitTimestamp = (value: Date | number | null) => {
  if (!value) return '';

  let msTimestamp;
  if (value instanceof Date) {
    msTimestamp = value.getTime();
  } else if (typeof value === 'number') {
    msTimestamp = value;
  } else {
    msTimestamp = new Date(value).getTime();
  }

  // 处理无效日期（如传入非法字符串）
  if (Number.isNaN(msTimestamp)) return '';

  return Math.floor(msTimestamp / 1000).toString();
};
