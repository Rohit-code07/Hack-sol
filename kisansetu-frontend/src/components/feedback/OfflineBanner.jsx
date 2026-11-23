import React from 'react';
import { useTranslation } from 'react-i18next';
import { WifiOff } from 'lucide-react';
import useOnlineStatus from '../../hooks/useOnlineStatus';

/**
 * Offline banner alerting users when network connectivity is lost.
 */
export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div
      role="alert"
      className="bg-rust-600 text-white text-xs sm:text-sm font-medium py-2 px-4 text-center sticky top-0 z-50 flex items-center justify-center gap-2 border-b border-indigo-900"
    >
      <WifiOff className="w-4 h-4 shrink-0" aria-hidden="true" />
      <span>
        {t(
          'errors.offline',
          'इंटरनेट कनेक्शन नहीं है। आप सहेजा गया डेटा देख रहे हैं। (You are currently offline. Viewing cached data.)'
        )}
      </span>
    </div>
  );
}
