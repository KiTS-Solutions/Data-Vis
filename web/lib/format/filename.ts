/**
 * Strips download-duplicate suffixes like " (1)" before the extension from a
 * displayed file name (e.g. "Report (1).xlsx" -> "Report.xlsx"). Repeated
 * re-downloads stack these ("Report (1) (2) (1).xlsx"), so this strips them
 * one at a time until none remain. Purely a display concern — the underlying
 * meta.generated_from value (used for provenance/audit) is left untouched;
 * this only affects what a reader sees.
 */
export function cleanDisplayFileName(fileName: string): string {
  let cleaned = fileName;
  let previous;
  do {
    previous = cleaned;
    cleaned = cleaned.replace(/\s\(\d+\)(\.\w+)$/, "$1");
  } while (cleaned !== previous);
  return cleaned;
}
