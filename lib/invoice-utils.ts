import type { InvoiceItem, InvoiceTotals, TaxType } from "@/types/invoice";

const ONES = [
  "",
  "ONE",
  "TWO",
  "THREE",
  "FOUR",
  "FIVE",
  "SIX",
  "SEVEN",
  "EIGHT",
  "NINE",
  "TEN",
  "ELEVEN",
  "TWELVE",
  "THIRTEEN",
  "FOURTEEN",
  "FIFTEEN",
  "SIXTEEN",
  "SEVENTEEN",
  "EIGHTEEN",
  "NINETEEN",
];

const TENS = [
  "",
  "",
  "TWENTY",
  "THIRTY",
  "FORTY",
  "FIFTY",
  "SIXTY",
  "SEVENTY",
  "EIGHTY",
  "NINETY",
];

function twoDigits(n: number): string {
  if (n < 20) return ONES[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return o === 0 ? TENS[t] : `${TENS[t]} ${ONES[o]}`;
}

function threeDigits(n: number): string {
  if (n === 0) return "";
  if (n < 100) return twoDigits(n);
  const h = Math.floor(n / 100);
  const rest = n % 100;
  const hundred = `${ONES[h]} HUNDRED`;
  return rest === 0 ? hundred : `${hundred} ${twoDigits(rest)}`;
}

/**
 * Indian-system number-to-words. Handles up to 99,99,99,99,999 (lakhs / crores).
 * 1770 → "ONE THOUSAND SEVEN HUNDRED SEVENTY RUPEES ONLY"
 * 1500.50 → "ONE THOUSAND FIVE HUNDRED RUPEES AND FIFTY PAISE ONLY"
 */
export function numberToWords(amount: number): string {
  if (!isFinite(amount)) return "";
  const negative = amount < 0;
  const abs = Math.abs(amount);
  const rupees = Math.floor(abs);
  const paise = Math.round((abs - rupees) * 100);

  let words = "";

  if (rupees === 0) {
    words = "ZERO";
  } else {
    const crore = Math.floor(rupees / 10000000);
    const lakh = Math.floor((rupees % 10000000) / 100000);
    const thousand = Math.floor((rupees % 100000) / 1000);
    const hundred = rupees % 1000;

    const parts: string[] = [];
    if (crore > 0) parts.push(`${twoDigits(crore)} CRORE`);
    if (lakh > 0) parts.push(`${twoDigits(lakh)} LAKH`);
    if (thousand > 0) parts.push(`${twoDigits(thousand)} THOUSAND`);
    if (hundred > 0) parts.push(threeDigits(hundred));
    words = parts.join(" ").trim();
  }

  let result = `${words} RUPEES`;
  if (paise > 0) {
    result += ` AND ${twoDigits(paise)} PAISE`;
  }
  result += " ONLY";

  return (negative ? "MINUS " : "") + result;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrencyPlain(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computeItemAmount(item: Pick<InvoiceItem, "quantity" | "rate">): number {
  return round2((item.quantity || 0) * (item.rate || 0));
}

export function calculateTotals(
  items: Array<Pick<InvoiceItem, "quantity" | "rate">>,
  taxType: TaxType,
  taxRate: number
): InvoiceTotals {
  const subtotal = round2(
    items.reduce((sum, it) => sum + (it.quantity || 0) * (it.rate || 0), 0)
  );

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (taxType === "CGST_SGST") {
    const half = taxRate / 2;
    cgst = round2((subtotal * half) / 100);
    sgst = round2((subtotal * half) / 100);
  } else {
    igst = round2((subtotal * taxRate) / 100);
  }

  const preRound = round2(subtotal + cgst + sgst + igst);
  const total = Math.round(preRound);
  const roundOff = round2(total - preRound);

  return { subtotal, cgst, sgst, igst, roundOff, total };
}

export function getFinancialYear(date: Date = new Date()): string {
  const m = date.getMonth(); // 0-indexed, April = 3
  const y = date.getFullYear();
  if (m >= 3) return `${y}-${y + 1}`;
  return `${y - 1}-${y}`;
}

export function generateInvoiceNumber(
  prefix: string,
  num: number,
  fy: string = getFinancialYear()
): string {
  return `${prefix}-${String(num).padStart(3, "0")}-${fy}`;
}
