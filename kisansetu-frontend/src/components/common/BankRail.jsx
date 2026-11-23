import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Search,
  CheckCircle,
  FileCheck2,
  Landmark,
  X,
  Pin,
  PinOff,
} from 'lucide-react';
import Tooltip from './Tooltip';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Accessible Collapsible Navigation Rail for Bank Console.
 * 72px wide default, can be pinned to 240px (`w-60`).
 * Supports tooltips, keyboard focus, screen-reader labels, and mobile drawer.
 *
 * @param {{
 *   mobileOpen: boolean,
 *   onCloseMobile: () => void,
 *   isPinned: boolean,
 *   onTogglePin: () => void
 * }} props
 */
export default function BankRail({
  mobileOpen,
  onCloseMobile,
  isPinned = false,
  onTogglePin,
}) {
  const { t } = useTranslation();
  const [isHovered, setIsHovered] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const isExpanded = isPinned || isHovered;

  const navItems = [
    { to: '/bank', label: t('nav.bankDashboard', 'Dashboard'), icon: LayoutDashboard, end: true },
    { to: '/bank/farmers', label: t('nav.farmerSearch', 'Farmer Search'), icon: Search },
    { to: '/bank/land-verification', label: t('nav.landVerification', 'Land Verification'), icon: CheckCircle },
    { to: '/bank/applications', label: t('nav.applications', 'Application Audit'), icon: FileCheck2 },
  ];

  const renderNavLinks = (isDrawer = false) => (
    <ul className="flex flex-col space-y-2 p-3">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const linkContent = (
          <NavLink
            to={item.to}
            end={item.end}
            onClick={() => isDrawer && onCloseMobile?.()}
            aria-label={item.label}
            className={({ isActive }) =>
              `min-h-[44px] flex items-center gap-3.5 px-3 py-2.5 rounded-sm transition-all group font-medium text-sm whitespace-nowrap overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 ${
                isActive
                  ? 'bg-clay-500 text-white shadow-hard-sm'
                  : 'text-indigo-900 hover:bg-paper-100 hover:text-clay-500'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0 stroke-[1.8]" aria-hidden="true" />
            <span
              className={`transform transition-all duration-200 ease-out-expo ${
                isDrawer || isExpanded
                  ? 'opacity-100 translate-x-0 inline-block'
                  : 'lg:opacity-0 lg:-translate-x-1.5 lg:hidden'
              } ${prefersReducedMotion ? 'transition-none transform-none' : ''}`}
              style={{
                transitionDelay: isExpanded && !prefersReducedMotion ? `${idx * 30}ms` : '0ms',
              }}
            >
              {item.label}
            </span>
          </NavLink>
        );

        if (!isDrawer && !isExpanded) {
          return (
            <li key={item.to}>
              <Tooltip content={item.label} position="right">
                {linkContent}
              </Tooltip>
            </li>
          );
        }

        return <li key={item.to}>{linkContent}</li>;
      })}
    </ul>
  );

  return (
    <>
      {/* Desktop Rail (>=1024px) (M1.6) */}
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsHovered(false);
          }
        }}
        aria-label="Bank Officer Navigation Rail"
        className={`hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-40 bg-paper-50 border-r border-indigo-900 transition-all duration-200 ease-out-expo ${
          isExpanded ? 'w-60 shadow-hard' : 'w-[72px]'
        }`}
      >
        {/* Rail Header Branding */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-900 gap-3 overflow-hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-indigo-900 text-paper-50 flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5 text-saffron-400" />
            </div>
            <div
              className={`transition-all duration-200 ease-out-expo ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2 hidden'
              }`}
            >
              <span className="font-serif font-bold text-base text-indigo-900 block leading-tight">
                BankSetu
              </span>
              <span className="text-[10px] uppercase font-bold text-clay-500 tracking-wider block">
                {t('bank.officerConsole', 'Officer Console')}
              </span>
            </div>
          </div>

          {/* Pin / Unpin button (visible when expanded) */}
          {isExpanded && onTogglePin && (
            <button
              type="button"
              onClick={onTogglePin}
              title={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              aria-label={isPinned ? 'Unpin sidebar' : 'Pin sidebar'}
              className="min-h-[44px] min-w-[44px] -mr-2 p-2 text-ink-muted hover:text-indigo-900 rounded-sm inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
            >
              {isPinned ? <PinOff className="w-4 h-4 text-clay-500" /> : <Pin className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Links List */}
        <nav className="flex-1 py-4 overflow-y-auto" aria-label="Officer console links">
          {renderNavLinks(false)}
        </nav>
      </aside>

      {/* Mobile Drawer (<1024px) */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 flex bg-indigo-900/60 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 bg-paper-50 h-full border-r border-indigo-900 flex flex-col shadow-hard-lg animate-slide-in-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center justify-between px-5 border-b border-indigo-900 bg-paper-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-indigo-900 text-paper-50 flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-saffron-400" />
                </div>
                <span className="font-serif font-bold text-indigo-900">
                  BankSetu Console
                </span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="min-h-[44px] min-w-[44px] -mr-2 p-2 rounded-sm text-ink-muted hover:text-indigo-900 inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 py-4 overflow-y-auto" aria-label="Mobile navigation">
              {renderNavLinks(true)}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
