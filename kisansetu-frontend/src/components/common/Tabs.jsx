import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import useReducedMotion from '../../hooks/useReducedMotion';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Accessible Editorial Tab Navigation with animated sliding active indicator.
 * WAI-ARIA compliant: role="tablist", keyboard arrow navigation, Home/End support.
 *
 * @param {{
 *   tabs: Array<{ id: string, label: React.ReactNode, count?: number | string, icon?: React.ReactNode }>,
 *   activeTab: string,
 *   onChange: (id: string) => void,
 *   className?: string
 * }} props
 */
export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  const tabListRef = useRef(null);
  const tabRefs = useRef({});
  const prefersReducedMotion = useReducedMotion();
  const [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });

  useIsomorphicLayoutEffect(() => {
    const activeEl = tabRefs.current[activeTab];
    if (activeEl) {
      setIndicator({
        left: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        ready: true,
      });
    }
  }, [activeTab, tabs]);

  const handleKeyDown = (e, index) => {
    let nextIndex = null;
    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      const buttons = tabListRef.current?.querySelectorAll('button[role="tab"]');
      if (buttons && buttons[nextIndex]) {
        buttons[nextIndex].focus();
        onChange(tabs[nextIndex].id);
      }
    }
  };

  return (
    <div className={`border-b-2 border-paper-200 overflow-x-auto ${className}`}>
      <div
        ref={tabListRef}
        role="tablist"
        className="flex items-center gap-1 sm:gap-2 min-w-max pb-px relative"
      >
        {/* Sliding active indicator (M1.3, M3.3, M3.6) */}
        <div
          className={`absolute bottom-0 h-0.5 bg-clay-500 pointer-events-none ${
            prefersReducedMotion ? 'transition-none' : 'transition-all duration-250 ease-out-expo'
          } ${indicator.ready ? 'opacity-100' : 'opacity-0'}`}
          style={{
            transform: `translateX(${indicator.left}px)`,
            width: `${indicator.width}px`,
          }}
          aria-hidden="true"
        />

        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                if (el) tabRefs.current[tab.id] = el;
              }}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`min-h-[44px] px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold tracking-wide inline-flex items-center gap-2 border-b-2 border-transparent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400 rounded-t-sm relative ${
                isActive
                  ? 'text-clay-500 bg-paper-100/60 font-bold'
                  : 'text-ink-muted hover:text-indigo-900 hover:bg-paper-100/30'
              }`}
            >
              {tab.icon ? (
                <span className="shrink-0" aria-hidden="true">{tab.icon}</span>
              ) : null}
              <span>{tab.label}</span>
              {tab.count !== undefined ? (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold tabular-nums transition-colors duration-150 ${
                    isActive
                      ? 'bg-clay-500 text-white'
                      : 'bg-paper-200 text-indigo-900'
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
