import * as XLSX from "xlsx";

export type ExportRow = Record<string, string | number>;

/**
 * Spreadsheet software treats a leading =, +, - or @ as the start of a formula,
 * so a free-text answer beginning with one becomes executable on open. Prefixing
 * an apostrophe keeps the text intact while disarming it.
 */
function defuseFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function csvCell(value: string | number): string {
  const text = defuseFormula(String(value ?? ""));
  // Double the quotes and wrap. Essays contain commas, quotes and newlines, all
  // of which are legal inside a quoted CSV field.
  return `"${text.replace(/"/g, '""')}"`;
}

export function toCsv(rows: ExportRow[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((h) => csvCell(row[h])).join(",")),
  ].join("\r\n");
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function downloadCsv(rows: ExportRow[], filename: string): void {
  // The BOM makes Excel read it as UTF-8; without it, accented names mangle.
  const blob = new Blob(["﻿" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

export function downloadXlsx(rows: ExportRow[], sheetName: string, filename: string): void {
  const sanitised = rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([k, v]) => [k, typeof v === "string" ? defuseFormula(v) : v])
    )
  );
  const worksheet = XLSX.utils.json_to_sheet(sanitised);
  const workbook = XLSX.utils.book_new();
  // Excel rejects sheet names over 31 chars or containing []:*?/\
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  XLSX.writeFile(workbook, filename);
}
