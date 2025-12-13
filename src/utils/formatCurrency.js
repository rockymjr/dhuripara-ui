export const formatCurrency = (amount, language = 'en') => {
  if (amount === null || amount === undefined) return '₹0.00';
  const locale = language === 'bn' ? 'bn-IN' : 'en-IN';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};