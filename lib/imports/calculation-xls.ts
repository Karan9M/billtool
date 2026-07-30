import * as XLSX from "xlsx";
import { randomUUID } from "crypto";
import { getFinancialYear } from "@/lib/invoice-utils";
import type { BillType } from "@/types/invoice";
import type { ParsedLedgerEntry } from "@/lib/imports/gst-xlsx";

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

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = normalizeCell(value);
  if (!text) return null;
  const cleaned = text.replace(/,/g, "").replace(/[^\d.-]/g, "");
  if (!cleaned) return null;
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

function dateToString(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, "0");
    const d = String(value.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const text = normalizeCell(value);
  if (!text) return null;
  const parts = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if (parts) {
    let day = Number(parts[1]);
    let month = Number(parts[2]);
    let year = Number(parts[3]);
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
  }
  return null;
}

function lookupYearFromSection(sectionHeader: string): string | null {
  const match = sectionHeader.match(/(\d{4})[/-](\d{4})/);
  if (match) return `${match[1]}-${match[2]}`;
  return null;
}

export function parseCalculationXls(buffer: ArrayBuffer): ParsedLedgerEntry[] {
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellDates: true,
    dense: true,
  });

  const entries: ParsedLedgerEntry[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    const rows = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
      raw: true,
    }) as Matrix;

    if (rows.length === 0) continue;

    let currentBillType: BillType | null = null;
    let sectionYear: string | null = null;

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      if (!row || row.length === 0) continue;

      const c0 = normalizeCell(row[0] ?? "");
      const c1 = normalizeCell(row[1] ?? "");
      const c2 = normalizeCell(row[2] ?? "");
      const c3 = normalizeCell(row[3] ?? "");

      const c0l = c0.toLowerCase();
      const c1l = c1.toLowerCase();
      const c2l = c2.toLowerCase();

      const isHeaderRow = c1l === "date" || c1l === "sr no" || c1l === "sr. no";
      if (isHeaderRow) continue;

      const hasPurch = c0l.includes("purch") || c2l.includes("purch");
      const hasSale = c0l.includes("sale") || c2l.includes("sale");
      const isSectionRow = !c1 && !c3 && (hasPurch || hasSale);

      if (isSectionRow) {
        const rowText = `${c0} ${c1} ${c2} ${c3}`.toLowerCase();
        currentBillType = rowText.includes("purch") ? "purchase" : "sale";
        sectionYear = lookupYearFromSection(rowText);
        continue;
      }

      const isTotalRow = c2l === "total" && (!c0 || c0l === "total") && !c1;
      if (isTotalRow) {
        currentBillType = null;
        continue;
      }

      if (!currentBillType) continue;
      if (!c1) continue;

      const dateStr = dateToString(row[1] ?? "");
      if (!dateStr) continue;

      const partyName = c2;
      if (!partyName) continue;

      const gstNo = c3;
      const grossValue = parseNumber(row[4] ?? 0) ?? 0;
      const sgst = parseNumber(row[6] ?? 0) ?? 0;
      const cgst = parseNumber(row[7] ?? 0) ?? 0;
      const total = parseNumber(row[8] ?? 0) ?? 0;
      const roundOff = parseNumber(row[9] ?? 0) ?? 0;

      const date = new Date(dateStr);
      const financialYear = sectionYear || getFinancialYear(date);

      const itemId = `${sheetName}-${randomUUID()}`;

      entries.push({
        source_file: "CALCULATION.xls",
        sheet_name: sheetName,
        bill_type: currentBillType,
        financial_year: financialYear,
        invoice_no: c0,
        invoice_date: dateStr,
        party_name: partyName,
        party_address: gstNo || "",
        items: [
          {
            id: itemId,
            description: currentBillType === "purchase" ? "Purchase" : "Sale",
            hsn_code: "",
            quantity: 1,
            unit: "NOS",
            rate: grossValue,
            amount: grossValue,
          },
        ],
        subtotal: grossValue,
        cgst_amount: cgst,
        sgst_amount: sgst,
        igst_amount: 0,
        round_off: roundOff,
        total,
        amount_in_words: "",
        raw_payload: {
          parsed_from: "calculation_xls",
          section_year: sectionYear,
          gst_number: gstNo,
        },
      });
    }
  }

  return entries;
}
