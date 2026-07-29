import * as XLSX from "xlsx";
import { randomUUID } from "crypto";
import { getFinancialYear } from "@/lib/invoice-utils";
import type { BillType } from "@/types/invoice";

interface ParsedLedgerItem {
  id: string;
  description: string;
  hsn_code: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
}

export interface ParsedLedgerEntry {
  source_file: string;
  sheet_name: string;
  bill_type: BillType;
  financial_year: string;
  invoice_no: string;
  invoice_date: string | null;
  party_name: string;
  party_address: string;
  items: ParsedLedgerItem[];
  subtotal: number;
  cgst_amount: number;
  sgst_amount: number;
  igst_amount: number;
  round_off: number;
  total: number;
  amount_in_words: string;
  raw_payload: Record<string, unknown>;
}

type Matrix = Array<Array<unknown>>;

function normalizeCell(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${value.getDate().toString().padStart(2, "0")}/${(value.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${value.getFullYear()}`;
  }
  return "";
}

function rowHasText(row: unknown[], text: string): boolean {
  const needle = text.toLowerCase();
  return row.some((cell) => normalizeCell(cell).toLowerCase().includes(needle));
}

function findRightmostNumber(row: unknown[]): number | null {
  for (let i = row.length - 1; i >= 0; i -= 1) {
    const parsed = parseNumber(row[i]);
    if (parsed !== null) return parsed;
  }
  return null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = normalizeCell(value);
  if (!text) return null;
  const cleaned = text.replace(/,/g, "").replace(/[^\d.-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function parseQuantityAndUnit(value: unknown): { quantity: number; unit: string } {
  const text = normalizeCell(value).toUpperCase();
  if (!text) return { quantity: 0, unit: "NOS" };
  const quantityMatch = text.match(/-?\d+(\.\d+)?/);
  const quantity = quantityMatch ? Number(quantityMatch[0]) : 0;
  const unit = text.replace(/-?\d+(\.\d+)?/g, "").trim() || "NOS";
  return { quantity, unit };
}

function parseDateCell(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const text = normalizeCell(value);
  if (!text) return null;

  const ddmmyyyy = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const day = Number(ddmmyyyy[1]);
    const month = Number(ddmmyyyy[2]);
    const year = Number(ddmmyyyy[3]);
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }

  const asDate = new Date(text);
  if (!Number.isNaN(asDate.getTime())) {
    return asDate.toISOString().slice(0, 10);
  }
  return null;
}

function findValueNearLabel(rows: Matrix, label: string): unknown {
  const needle = label.toLowerCase();
  for (let r = 0; r < rows.length; r += 1) {
    const row = rows[r] ?? [];
    for (let c = 0; c < row.length; c += 1) {
      const cellText = normalizeCell(row[c]).toLowerCase();
      if (!cellText.includes(needle)) continue;

      for (let c2 = c + 1; c2 < row.length; c2 += 1) {
        const candidate = row[c2];
        const text = normalizeCell(candidate);
        if (text && !text.toLowerCase().includes(needle)) return candidate;
      }

      const nextRow = rows[r + 1] ?? [];
      for (let c2 = c; c2 <= c + 2; c2 += 1) {
        const candidate = nextRow[c2];
        const text = normalizeCell(candidate);
        if (text) return candidate;
      }
    }
  }
  return "";
}

function extractBuyerInfo(rows: Matrix): { partyName: string; partyAddress: string } {
  const buyerRow = rows.findIndex((row) => rowHasText(row, "buyer"));
  if (buyerRow === -1) return { partyName: "Unknown Party", partyAddress: "" };

  const stopWords = [
    "order no",
    "despatch",
    "destination",
    "sr. no",
    "description of goods",
  ];
  const lines: string[] = [];

  for (let r = buyerRow + 1; r < rows.length; r += 1) {
    const row = rows[r] ?? [];
    const rowText = row.map((cell) => normalizeCell(cell)).join(" ").toLowerCase();
    if (stopWords.some((word) => rowText.includes(word))) break;

    const firstCell = normalizeCell(row[0]);
    if (firstCell) lines.push(firstCell);
    if (lines.length >= 4) break;
  }

  if (lines.length === 0) return { partyName: "Unknown Party", partyAddress: "" };
  return {
    partyName: lines[0],
    partyAddress: lines.slice(1).join(", "),
  };
}

function extractItems(rows: Matrix, sheetName: string): ParsedLedgerItem[] {
  const headerIndex = rows.findIndex(
    (row) => rowHasText(row, "sr. no") && rowHasText(row, "description")
  );
  if (headerIndex === -1) return [];

  const header = rows[headerIndex] ?? [];
  const findColumn = (needle: string) =>
    header.findIndex((cell) => normalizeCell(cell).toLowerCase().includes(needle));

  const srCol = findColumn("sr");
  const descCol = findColumn("description");
  const hsnCol = findColumn("hsn");
  const qtyCol = findColumn("quantity");
  const rateCol = findColumn("rate");
  const amountCol = findColumn("amount");

  const items: ParsedLedgerItem[] = [];
  for (let r = headerIndex + 1; r < rows.length; r += 1) {
    const row = rows[r] ?? [];
    if (rowHasText(row, "gross amount")) break;

    const srValue = srCol >= 0 ? parseNumber(row[srCol]) : parseNumber(row[0]);
    if (srValue === null || srValue <= 0) continue;

    const description = normalizeCell(row[descCol >= 0 ? descCol : 1]);
    if (!description) continue;

    const hsn = normalizeCell(row[hsnCol >= 0 ? hsnCol : 7]);
    const qtyCell = row[qtyCol >= 0 ? qtyCol : 8];
    const rate = parseNumber(row[rateCol >= 0 ? rateCol : 9]) ?? 0;
    const amountRaw = parseNumber(row[amountCol >= 0 ? amountCol : 10]);

    const { quantity, unit } = parseQuantityAndUnit(qtyCell);
    const amount = amountRaw ?? Math.round(quantity * rate * 100) / 100;

    items.push({
      id: `${sheetName}-${randomUUID()}`,
      description,
      hsn_code: hsn,
      quantity,
      unit,
      rate,
      amount,
    });
  }

  return items;
}

function extractTotals(rows: Matrix): {
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  roundOff: number;
  total: number;
  amountInWords: string;
} {
  let subtotal = 0;
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  let roundOff = 0;
  let total = 0;
  let amountInWords = "";

  for (let r = 0; r < rows.length; r += 1) {
    const row = rows[r] ?? [];
    const text = row.map((cell) => normalizeCell(cell)).join(" ").toLowerCase();
    const value = findRightmostNumber(row);

    if (text.includes("gross amount") && value !== null) subtotal = value;
    if (text.includes("sgst") && value !== null) sgst = value;
    if (text.includes("cgst") && value !== null) cgst = value;
    if (text.includes("igst") && value !== null) igst = value;
    if (text.includes("round off") && value !== null) roundOff = value;
    if (text.match(/\btotal\b/) && !text.includes("amount in words") && value !== null) {
      total = value;
    }
    if (text.includes("amount in words")) {
      const nextRow = rows[r + 1] ?? [];
      amountInWords =
        nextRow.map((cell) => normalizeCell(cell)).find((v) => v.length > 0) ?? "";
    }
  }

  if (!subtotal || !total) {
    const fallbackSubtotal = rows.find((row) => rowHasText(row, "gross amount"));
    const fallbackTotal = rows.find((row) => rowHasText(row, "total"));
    subtotal = subtotal || (fallbackSubtotal ? findRightmostNumber(fallbackSubtotal) ?? 0 : 0);
    total = total || (fallbackTotal ? findRightmostNumber(fallbackTotal) ?? 0 : 0);
  }

  return { subtotal, cgst, sgst, igst, roundOff, total, amountInWords };
}

function parseSheet(
  rows: Matrix,
  sheetName: string,
  sourceFile: string,
  billType: BillType
): ParsedLedgerEntry | null {
  if (!rows.length) return null;
  if (!rows.some((row) => rowHasText(row, "invoice"))) return null;

  const invoiceNo = normalizeCell(findValueNearLabel(rows, "invoice no"));
  const invoiceDate = parseDateCell(findValueNearLabel(rows, "date"));
  if (!invoiceNo) return null;

  const { partyName, partyAddress } = extractBuyerInfo(rows);
  const items = extractItems(rows, sheetName);
  const totals = extractTotals(rows);

  const financialYearFromInvoice = invoiceNo.match(/(\d{4}-\d{4})/)?.[1] ?? "";
  const financialYear =
    financialYearFromInvoice ||
    (invoiceDate ? getFinancialYear(new Date(invoiceDate)) : getFinancialYear());

  return {
    source_file: sourceFile,
    sheet_name: sheetName,
    bill_type: billType,
    financial_year: financialYear,
    invoice_no: invoiceNo,
    invoice_date: invoiceDate,
    party_name: partyName,
    party_address: partyAddress,
    items,
    subtotal: totals.subtotal,
    cgst_amount: totals.cgst,
    sgst_amount: totals.sgst,
    igst_amount: totals.igst,
    round_off: totals.roundOff,
    total: totals.total,
    amount_in_words: totals.amountInWords,
    raw_payload: {
      parsed_from: "gst_xlsx",
      source_file: sourceFile,
      sheet_name: sheetName,
      line_items: items.length,
    },
  };
}

export function parseGstXlsxBuffer(
  fileBuffer: ArrayBuffer,
  sourceFile: string,
  billType: BillType
): ParsedLedgerEntry[] {
  const workbook = XLSX.read(fileBuffer, {
    type: "array",
    cellDates: true,
    dense: true,
  });

  const parsedEntries: ParsedLedgerEntry[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
      raw: true,
    }) as Matrix;

    const parsed = parseSheet(rows, sheetName, sourceFile, billType);
    if (parsed) parsedEntries.push(parsed);
  }

  return parsedEntries;
}
