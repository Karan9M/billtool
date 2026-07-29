import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { parseGstXlsxBuffer } from "@/lib/imports/gst-xlsx";
import type { BillType } from "@/types/invoice";
import type { ParsedLedgerEntry } from "@/lib/imports/gst-xlsx";

export const runtime = "nodejs";

function isBillType(value: string): value is BillType {
  return value === "sale" || value === "purchase";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const billTypeValue = String(formData.get("billType") ?? "").toLowerCase();
  const billType: BillType = isBillType(billTypeValue) ? billTypeValue : "sale";
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "No files were uploaded. Select one or more .xlsx files." },
      { status: 400 }
    );
  }

  const allParsedRows: ParsedLedgerEntry[] = [];
  const skippedFiles: string[] = [];

  for (const file of files) {
    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      skippedFiles.push(file.name);
      continue;
    }

    const buffer = await file.arrayBuffer();
    const parsedRows = parseGstXlsxBuffer(buffer, file.name, billType);

    if (parsedRows.length === 0) {
      skippedFiles.push(file.name);
      continue;
    }

    allParsedRows.push(...parsedRows);
  }

  if (allParsedRows.length === 0) {
    return NextResponse.json(
      {
        error: "No bill data could be extracted from uploaded files.",
        skippedFiles,
      },
      { status: 400 }
    );
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.from("imported_ledger_entries").insert(allParsedRows);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const years = Array.from(new Set(allParsedRows.map((row) => row.financial_year))).sort();

  return NextResponse.json({
    inserted: allParsedRows.length,
    filesProcessed: files.length,
    skippedFiles,
    years,
  });
}
