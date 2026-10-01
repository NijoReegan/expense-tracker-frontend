const SYMBOLS = { INR: '₹', EUR: '€', GBP: '£', USD: '$', AUD: 'A$', CAD: 'C$', JPY: '¥', CNY: '¥' };

export function currencySymbol(currency) {
  return SYMBOLS[currency] || currency || '$';
}

export function money(amount, currency) {
  const num = Number(amount) || 0;
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
  return `${currencySymbol(currency)}${formatted}`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function toDateInputValue(iso) {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}