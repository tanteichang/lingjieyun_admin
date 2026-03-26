export const formatAmountDisplay = (value?: string | number | null) => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  const text = String(value).trim();
  if (!text) {
    return '';
  }

  if (!/^[-+]?\d+(\.\d+)?$/.test(text)) {
    return text;
  }

  return text.replace(/(\.\d*?[1-9])0+$/, '$1').replace(/\.0+$/, '');
};
