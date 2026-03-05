/**
 * Generate a CSV string from headers and row data.
 *
 * @param {string[]} headers — column header labels
 * @param {string[][]} rows — array of row arrays (each cell is a string)
 * @returns {string} CSV-formatted string
 */
export function generateCSV(headers, rows) {
  const escape = (cell) => {
    const str = String(cell ?? '');
    // Wrap in quotes if the cell contains a comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = headers.map(escape).join(',');
  const bodyLines = rows.map((row) => row.map(escape).join(','));

  return [headerLine, ...bodyLines].join('\n');
}

/**
 * Trigger a browser download of a CSV string.
 *
 * @param {string} csvString — full CSV content
 * @param {string} filename — e.g. "revenue-2026.csv"
 */
export function downloadCSV(csvString, filename) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
