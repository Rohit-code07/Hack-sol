import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Sets document.title dynamically with localized strings.
 *
 * @param {string} titleKey - i18n translation key (e.g. 'nav.farmerDashboard')
 * @param {string} [fallback] - Fallback title in English
 */
export default function useDocumentTitle(titleKey, fallback = '') {
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const appName = t('common.appName', 'KisanSetu');
    const pageTitle = titleKey ? t(titleKey, { defaultValue: fallback }) : '';
    document.title = pageTitle ? `${pageTitle} • ${appName}` : appName;
  }, [titleKey, fallback, t, i18n.language]);
}
