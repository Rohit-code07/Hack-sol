import React from 'react';
import { useTranslation } from 'react-i18next';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * Editorial EmptyState Component with staggered fade-up.
 *
 * @param {{
 *   title?: React.ReactNode,
 *   description?: React.ReactNode,
 *   icon?: React.ReactNode,
 *   action?: { label: string, onClick: () => void, icon?: React.ReactNode },
 *   className?: string
 * }} props
 */
export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}) {
  const { t } = useTranslation();

  return (
    <div
      className={`text-center py-10 sm:py-14 px-4 bg-paper-50 border border-dashed border-indigo-900/30 rounded-sm flex flex-col items-center justify-center ${className}`}
      role="region"
      aria-label="Empty state"
    >
      {/* Icon with gentle fade-up (M5.5) */}
      <div
        className="w-12 h-12 rounded-sm bg-paper-100 border border-paper-200 flex items-center justify-center text-ink-muted mb-3 animate-fade-up"
        aria-hidden="true"
      >
        {icon || <Inbox className="w-6 h-6 stroke-[1.5]" />}
      </div>

      <h3 className="text-base sm:text-lg font-bold font-serif text-indigo-900 mb-1 animate-fade-up [animation-delay:60ms]">
        {title || t('common.empty', 'No data found')}
      </h3>

      {description ? (
        <p className="text-xs sm:text-sm text-ink-muted max-w-sm mb-4 leading-relaxed animate-fade-up [animation-delay:80ms]">
          {description}
        </p>
      ) : null}

      {action ? (
        <div className="animate-fade-up [animation-delay:120ms]">
          <Button
            variant="secondary"
            size="sm"
            onClick={action.onClick}
            icon={action.icon}
          >
            {action.label}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
