// Builds CSV text that opens cleanly in Excel, Numbers and Google Sheets.

type Cell = string | number | boolean;

// Spreadsheet apps run a cell that starts with one of these as a formula, so
// a guest who typed "=HYPERLINK(...)" as their name could plant a live link or
// worse in the exported file. Such cells get a leading apostrophe, which
// spreadsheets treat as "this is text".
const FORMULA_START = /^[=+\-@\t\r]/;

// ...but a plain phone number like "+1 401 555 0100" cannot do anything, and
// prefixing it would just leave a stray apostrophe in the column.
const PLAIN_NUMBER = /^[+\-]?[\d\s().-]+$/;

export function csvCell(value: Cell): string {
  let text = String(value);
  if (FORMULA_START.test(text) && !PLAIN_NUMBER.test(text)) {
    text = `'${text}`;
  }
  if (/[",\r\n]/.test(text)) {
    text = `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

// The byte-order mark makes Excel read the file as UTF-8, so accented names
// survive instead of turning into mojibake.
export function toCsv(rows: Cell[][]): string {
  return "﻿" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, rows: Cell[][]): void {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
