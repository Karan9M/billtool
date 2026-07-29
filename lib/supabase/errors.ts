export function isMissingTableError(error: { code?: string; message?: string } | null | undefined) {
  if (!error) return false;
  if (error.code === "PGRST205") return true;
  const message = (error.message ?? "").toLowerCase();
  return (
    message.includes("could not find the table") ||
    message.includes("schema cache") ||
    message.includes("imported_ledger_entries")
  );
}
