import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { invoiceFormSchema } from "@/lib/validators";
import {
  calculateTotals,
  generateInvoiceNumber,
  getFinancialYear,
  numberToWords,
} from "@/lib/invoice-utils";
import type { CompanySettings } from "@/types/invoice";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = invoiceFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const supabase = await getSupabaseServer();

  // Fetch company for current_number/prefix.
  const { data: settingsRow, error: settingsErr } = await supabase
    .from("company_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (settingsErr || !settingsRow) {
    return NextResponse.json(
      { error: "Company settings missing. Run schema.sql first." },
      { status: 500 }
    );
  }
  const company = settingsRow as CompanySettings;

  // Atomically allocate the next number via the Postgres function.
  const { data: nextNumRaw, error: rpcErr } = await supabase.rpc(
    "increment_invoice_number"
  );
  if (rpcErr || nextNumRaw == null) {
    return NextResponse.json(
      { error: rpcErr?.message ?? "Could not allocate invoice number" },
      { status: 500 }
    );
  }
  const nextNum = Number(nextNumRaw);
  const invoiceNo = generateInvoiceNumber(
    company.invoice_prefix,
    nextNum,
    getFinancialYear(new Date(input.date))
  );

  // Server-side totals — never trust client math.
  const items = input.items.map((it) => {
    const amount = Math.round(it.quantity * it.rate * 100) / 100;
    return { ...it, amount };
  });
  const totals = calculateTotals(items, input.tax_type, input.tax_rate);
  const half = input.tax_rate / 2;
  const cgstRate = input.tax_type === "CGST_SGST" ? half : 0;
  const sgstRate = input.tax_type === "CGST_SGST" ? half : 0;
  const igstRate = input.tax_type === "IGST" ? input.tax_rate : 0;
  const amountInWords = numberToWords(totals.total);

  const insertRow = {
    invoice_no: invoiceNo,
    date: input.date,
    due_date: input.due_date || null,

    buyer_name: input.buyer_name,
    buyer_address: input.buyer_address,
    buyer_city: input.buyer_city,
    buyer_state: input.buyer_state,
    buyer_pincode: input.buyer_pincode,
    buyer_gst: input.buyer_gst,
    buyer_phone: input.buyer_phone,
    buyer_email: input.buyer_email,

    items,

    tax_type: input.tax_type,
    cgst_rate: cgstRate,
    sgst_rate: sgstRate,
    igst_rate: igstRate,

    subtotal: totals.subtotal,
    cgst_amount: totals.cgst,
    sgst_amount: totals.sgst,
    igst_amount: totals.igst,
    round_off: totals.roundOff,
    total: totals.total,

    amount_in_words: amountInWords,
    notes: input.notes,
    delivery_note: input.delivery_note,

    status: "draft",
  };

  const { data: inserted, error: insErr } = await supabase
    .from("invoices")
    .insert(insertRow)
    .select("id, invoice_no")
    .single();
  if (insErr || !inserted) {
    return NextResponse.json(
      { error: insErr?.message ?? "Insert failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: inserted.id,
    invoice_no: inserted.invoice_no,
  });
}
