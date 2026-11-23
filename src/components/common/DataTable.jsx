import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import EmptyState from './EmptyState';
import Skeleton from './Skeleton';
import useReducedMotion from '../../hooks/useReducedMotion';

/**
 * Editorial Responsive DataTable Component with staggered row entrances and shimmer loading.
 * Automatically renders a clean ledger table on desktop (>=768px)
 * and stacked touch-friendly cards on mobile (<768px).
 *
 * @param {{
 *   columns: Array<{
 *     key: string,
 *     header: React.ReactNode,
 *     render?: (row: any, index: number) => React.ReactNode,
 *     sortable?: boolean,
 *     align?: 'left' | 'center' | 'right',
 *     hideOnMobile?: boolean,
 *     mobileLabel?: React.ReactNode
 *   }>,
 *   data: Array<any>,
 *   keyField?: string,
 *   loading?: boolean,
 *   emptyTitle?: React.ReactNode,
 *   emptyDescription?: React.ReactNode,
 *   sortColumn?: string,
 *   sortDirection?: 'asc' | 'desc',
 *   onSort?: (columnKey: string) => void,
 *   onRowClick?: (row: any) => void,
 *   getRowClassName?: (row: any, index: number) => string,
 *   mobileCardRender?: (row: any, index: number) => React.ReactNode,
 *   className?: string
 * }} props
 */
export default function DataTable({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyTitle,
  emptyDescription,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  onRowClick,
  getRowClassName,
  mobileCardRender,
  className = '',
}) {
  const prefersReducedMotion = useReducedMotion();

  if (loading) {
    return (
      <div className={`bg-paper-50 border border-indigo-900 rounded-sm shadow-hard-sm p-4 ${className}`}>
        <Skeleton variant="table-row" rows={5} />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  const handleHeaderClick = (col) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {/* ========================================================
          DESKTOP LEDGER TABLE (>= 768px)
          ======================================================== */}
      <div className="hidden md:block overflow-x-auto bg-paper-50 border border-indigo-900 rounded-sm shadow-hard-sm">
        <table className="w-full text-left border-collapse" role="table">
          <thead>
            <tr className="bg-paper-100 border-b border-indigo-900 text-xs font-bold uppercase tracking-wider text-indigo-900">
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                const ariaSort = isSorted
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : col.sortable
                  ? 'none'
                  : undefined;

                return (
                  <th
                    key={col.key}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`py-3.5 px-4 font-semibold select-none ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    } ${col.sortable ? 'cursor-pointer hover:bg-paper-200/50' : ''}`}
                    onClick={() => handleHeaderClick(col)}
                  >
                    <div
                      className={`inline-flex items-center gap-1.5 ${
                        col.align === 'right' ? 'justify-end' : ''
                      }`}
                    >
                      <span>{col.header}</span>
                      {col.sortable ? (
                        <span className="shrink-0 text-ink-muted">
                          {isSorted ? (
                            sortDirection === 'asc' ? (
                              <ArrowUp className="w-3.5 h-3.5 text-clay-500 stroke-[2.5]" />
                            ) : (
                              <ArrowDown className="w-3.5 h-3.5 text-clay-500 stroke-[2.5]" />
                            )
                          ) : (
                            <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                          )}
                        </span>
                      ) : null}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-paper-200 text-sm text-indigo-900">
            {data.map((row, idx) => {
              const rowKey = row[keyField] || idx;
              const isClickable = typeof onRowClick === 'function';
              const staggerDelay = prefersReducedMotion ? 0 : Math.min(idx, 7) * 45;
              const customClass = getRowClassName ? getRowClassName(row, idx) : '';

              return (
                <tr
                  key={rowKey}
                  onClick={isClickable ? () => onRowClick(row) : undefined}
                  style={{
                    animationDelay: `${staggerDelay}ms`,
                  }}
                  className={`transition-colors duration-100 ${
                    prefersReducedMotion ? '' : 'animate-fade-up'
                  } ${
                    idx % 2 === 1 ? 'bg-paper-100/40' : 'bg-paper-50'
                  } ${
                    isClickable
                      ? 'cursor-pointer hover:bg-paper-100 active:bg-paper-200/50'
                      : 'hover:bg-paper-100/60'
                  } ${customClass}`}
                >
                  {columns.map((col) => {
                    const content = col.render
                      ? col.render(row, idx)
                      : row[col.key];

                    return (
                      <td
                        key={col.key}
                        className={`py-3.5 px-4 align-middle ${
                          col.align === 'right'
                            ? 'text-right tabular-nums'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        }`}
                      >
                        {content}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ========================================================
          MOBILE STACKED CARDS (< 768px)
          ======================================================== */}
      <div className="md:hidden space-y-3">
        {data.map((row, idx) => {
          const rowKey = row[keyField] || idx;
          const staggerDelay = prefersReducedMotion ? 0 : Math.min(idx, 7) * 45;
          const customClass = getRowClassName ? getRowClassName(row, idx) : '';

          if (mobileCardRender) {
            return (
              <div
                key={rowKey}
                style={{ animationDelay: `${staggerDelay}ms` }}
                className={prefersReducedMotion ? '' : 'animate-fade-up'}
              >
                {mobileCardRender(row, idx)}
              </div>
            );
          }

          const isClickable = typeof onRowClick === 'function';

          return (
            <div
              key={rowKey}
              onClick={isClickable ? () => onRowClick(row) : undefined}
              style={{ animationDelay: `${staggerDelay}ms` }}
              className={`bg-paper-50 border border-indigo-900 rounded-sm p-4 shadow-hard-sm space-y-2.5 transition-all ${
                prefersReducedMotion ? '' : 'animate-fade-up'
              } ${
                isClickable
                  ? 'active:scale-[0.98] cursor-pointer hover:bg-paper-100/60'
                  : ''
              } ${customClass}`}
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col) => {
                  const content = col.render
                    ? col.render(row, idx)
                    : row[col.key];

                  return (
                    <div
                      key={col.key}
                      className="flex items-center justify-between gap-2 text-sm border-b border-paper-200/60 pb-1.5 last:border-b-0 last:pb-0"
                    >
                      <span className="text-xs font-bold text-ink-muted uppercase tracking-wider">
                        {col.mobileLabel || col.header}
                      </span>
                      <div className="text-right font-medium text-indigo-900">
                        {content}
                      </div>
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
