import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * Editorial PageHeader component for consistent page titles across the portal.
 * Adheres to M7.1, M7.4 typography rules (28px mobile title, 36px desktop title-lg).
 *
 * @param {{
 *   eyebrow?: string,
 *   title: React.ReactNode,
 *   subtitle?: React.ReactNode,
 *   actions?: React.ReactNode,
 *   breadcrumbs?: Array<{ label: string, href?: string }>,
 *   className?: string
 * }} props
 */
export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  breadcrumbs,
  className = '',
}) {
  return (
    <header className={`mb-6 sm:mb-8 ${className}`} data-reveal>
      {/* Optional Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-2 hidden sm:flex items-center gap-1.5 text-xs text-ink-muted">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {crumb.href && !isLast ? (
                  <Link
                    to={crumb.href}
                    className="hover:text-indigo-900 hover:underline underline-offset-2"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={isLast ? 'text-indigo-900 font-semibold' : ''} aria-current={isLast ? 'page' : undefined}>
                    {crumb.label}
                  </span>
                )}
                {!isLast && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden="true" />}
              </React.Fragment>
            );
          })}
        </nav>
      ) : null}

      {/* Main Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          {eyebrow ? (
            <p className="text-xs uppercase font-bold tracking-wider text-clay-500 mb-1">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-title sm:text-title-lg font-bold font-serif text-indigo-900 leading-tight">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-sm sm:text-base text-ink-muted max-w-2xl leading-relaxed">
              {subtitle}
            </p>
          ) : null}
        </div>

        {/* Right-side Action Buttons */}
        {actions ? (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-1">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
