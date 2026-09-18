import type { CaseSessionData, CaseTrack } from "@/domain/CaseSession";
import type { ImportIssue } from "./ImportTypes";

export function validateCaseRecords(records: CaseSessionData[]): ImportIssue[] {
  const errors: ImportIssue[] = [], ids = new Set<string>(), numbers = new Set<number>();
  records.forEach((row, index) => {
    const record = `Record ${index + 1}`;
    const fail = (message: string) => errors.push({ record, message });
    if (!row.caseName?.trim()) fail("Case name is required.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(row.occurredOn) || !Number.isFinite(Date.parse(row.occurredOn)) || new Date(row.occurredOn).toISOString().slice(0,10) !== row.occurredOn) fail("Date must be a valid YYYY-MM-DD date.");
    if (!row.id?.trim() || ids.has(row.id)) fail("Record ID must be nonempty and unique.");
    ids.add(row.id);
    if (!Number.isSafeInteger(row.sessionNumber) || row.sessionNumber < 1 || numbers.has(row.sessionNumber)) fail("Session number must be a unique positive integer.");
    numbers.add(row.sessionNumber);
    if (!["casee", "caser", "observer"].includes(row.myRole)) fail("Role must be casee, caser, or observer.");
    if (!["consulting", "tech"].includes(row.track)) fail("Track must be consulting or tech.");
    if (row.durationMin != null && (!Number.isFinite(row.durationMin) || row.durationMin < 0)) fail("Duration must be a nonnegative number of minutes.");
    for (const [key, value] of Object.entries({ ...row.scores, overall: row.overall, difficulty: row.difficulty })) {
      if (value != null && (!Number.isInteger(value) || value < 1 || value > 5)) fail(`${key} must be 1–5.`);
    }
    if (row.myRole !== "casee" && (row.overall != null || Object.values(row.scores ?? {}).some(value => value != null))) fail("Performance scores only apply when Role is casee.");
    if (!Number.isFinite(Date.parse(row.createdAt))) fail("Created At must be a valid timestamp.");
  });
  return errors;
}

export function caseTrackConflicts(records: CaseSessionData[], existing: CaseSessionData[], track: CaseTrack): ImportIssue[] {
  const other = existing.filter(row => row.track !== track);
  return records.flatMap((row, index) => {
    const issues: ImportIssue[] = [];
    if (row.track !== track) issues.push({ record: `Record ${index + 1}`, message: `This file contains ${row.track} cases; choose the matching tab.` });
    if (other.some(saved => saved.id === row.id || saved.sessionNumber === row.sessionNumber)) issues.push({ record: `Record ${index + 1}`, message: `Record ID or session number ${row.sessionNumber} conflicts with the other track. Correct the workbook before importing.` });
    return issues;
  });
}
