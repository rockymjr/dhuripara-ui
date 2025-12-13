export const formatNumber = (n, language = 'en') => {
  if (n === null || n === undefined) return '0';
  try {
    const locale = language === 'bn' ? 'bn-IN' : 'en-IN';
    return new Intl.NumberFormat(locale).format(n);
  } catch (e) {
    return String(n);
  }
};
