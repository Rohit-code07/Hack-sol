// SYNTHETIC DEMO DATA. Illustrative only. Not official records or rates.

/**
 * Format a number into Indian Rupee currency format (e.g. ₹1,20,000)
 * @param {number|string} amount
 * @param {string} [locale='en-IN']
 * @returns {string}
 */
export function formatCurrency(amount, locale = 'en-IN') {
  const numeric = Number(amount) || 0;
  return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Format a standard ISO date or date string according to locale
 * @param {string|Date} dateStr
 * @param {string} [locale='en-IN']
 * @returns {string}
 */
export function formatDate(dateStr, locale = 'en-IN') {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Mask a 10-digit mobile number: e.g. "9876541234" -> "XXXXXX1234"
 * @param {string} mobile
 * @returns {string}
 */
export function maskMobile(mobile) {
  if (!mobile) return 'XXXXXXXXXX';
  const clean = String(mobile).replace(/\D/g, '');
  if (clean.length < 4) return 'XXXXXX' + clean;
  return 'XXXXXX' + clean.slice(-4);
}

/**
 * Mask a bank account number: e.g. "123456789012" -> "XXXX XXXX 9012"
 * @param {string} account
 * @returns {string}
 */
export function maskBankAccount(account) {
  if (!account) return 'XXXX XXXX XXXX';
  const clean = String(account).replace(/\s/g, '');
  const last4 = clean.slice(-4);
  return `XXXX XXXX ${last4}`;
}

/**
 * Format general numbers with localized grouping
 * @param {number|string} num
 * @param {string} [locale='en-IN']
 * @returns {string}
 */
export function formatNumber(num, locale = 'en-IN') {
  const numeric = Number(num) || 0;
  return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN').format(numeric);
}
