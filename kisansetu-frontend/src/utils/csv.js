/**
 * Client-side CSV generation and download utility.
 *
 * @param {Array<object>} rows - Array of data objects
 * @param {Array<{ key: string, label: string }>} columns - Column definitions with headers
 * @param {string} filename - Filename to save as (e.g. 'applications-audit.csv')
 */
export function exportToCsv(rows = [], columns = [], filename = 'export.csv') {
  if (!rows || rows.length === 0) return;

  const headers = columns.map((col) => `"${(col.label || col.key).replace(/"/g, '""')}"`);
  const lines = [headers.join(',')];

  for (const row of rows) {
    const values = columns.map((col) => {
      let val = row[col.key];
      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    lines.push(values.join(','));
  }

  const csvContent = '\uFEFF' + lines.join('\r\n'); // Add UTF-8 BOM for Excel Hindi/Devanagari support
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
