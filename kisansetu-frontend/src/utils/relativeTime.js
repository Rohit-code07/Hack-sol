/**
 * Localized Relative Time Formatter using Intl.RelativeTimeFormat.
 *
 * @param {string | Date | number} dateInput - Date or timestamp
 * @param {string} [locale='en'] - 'hi' or 'en'
 * @returns {string} - Formatted relative time string (e.g. "2 दिन पहले" / "2 days ago")
 */
export function formatRelativeTime(dateInput, locale = 'en') {
  if (!dateInput) return '';

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return String(dateInput);

  const now = new Date();
  const diffInSeconds = Math.round((date.getTime() - now.getTime()) / 1000);

  const targetLocale = locale === 'hi' ? 'hi-IN' : 'en-IN';
  const rtf = new Intl.RelativeTimeFormat(targetLocale, { numeric: 'auto' });

  const cutoffs = [
    { limit: 60, unit: 'second', divisor: 1 },
    { limit: 3600, unit: 'minute', divisor: 60 },
    { limit: 86400, unit: 'hour', divisor: 3600 },
    { limit: 86400 * 30, unit: 'day', divisor: 86400 },
    { limit: 86400 * 365, unit: 'month', divisor: 86400 * 30 },
    { limit: Infinity, unit: 'year', divisor: 86400 * 365 },
  ];

  const absDiff = Math.abs(diffInSeconds);
  const cutoff = cutoffs.find((c) => absDiff < c.limit);

  if (!cutoff) return date.toLocaleDateString(targetLocale);

  const value = Math.round(diffInSeconds / cutoff.divisor);
  return rtf.format(value, cutoff.unit);
}
