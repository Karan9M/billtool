import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { parseCalculationXls } from "@/lib/imports/calculation-xls";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json(
      { error: "No files uploaded. Select a .xls or .xlsx file." },
      { status: 400 }
    );
  }

  const allParsedRows: Awaited<ReturnType<typeof parseCalculationXls>>[number][] = [];
  const skippedFiles: string[] = [];

  for (const file of files) {
    const name = file.name.toLowerCase();
    if (!name.endsWith(".xls") && !name.endsWith(".xlsx")) {
      skippedFiles.push(file.name);
      continue;
    }
    const buffer = await file.arrayBuffer();
    try {
      const parsed = parseCalculationXls(buffer);
      if (parsed.length === 0) {
        skippedFiles.push(file.name);
        continue;
      }
      allParsedRows.push(...parsed);
    } catch {
      skippedFiles.push(file.name);
    }
  }

  if (allParsedRows.length === 0) {
    return NextResponse.json(
      {
        error: "No entries could be extracted from uploaded files.",
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
