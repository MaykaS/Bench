import type { NetworkContactData } from "@/domain/NetworkContact";

export function validDate(value: unknown): boolean {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value + "T00:00:00Z");
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0,10) === value;
}
export function networkValidation(row: NetworkContactData & { applicationIds?: string[] }): string[] {
  const errors: string[] = [];
  for (const key of ["source", "howKnown", "location", "nextFollowUpNote", "referralStatus", "actionItems", "sourceInfo"] as const) if (row[key] != null && typeof row[key] !== "string") errors.push(`${key} must be text.`);
  for (const key of ["lastContactOn", "nextFollowUpOn"] as const) if (row[key] != null && !validDate(row[key])) errors.push(`${key} must be a valid date.`);
  for (const key of ["tags", "sourceIds", "linkedApplicationHints", "applicationIds"] as const) if (row[key] !== undefined && (!Array.isArray(row[key]) || !row[key]!.every(v => typeof v === "string"))) errors.push(`${key} must be a list of text values.`);
  if (row.relationshipStrength != null && (!Number.isInteger(row.relationshipStrength) || row.relationshipStrength < 1 || row.relationshipStrength > 5)) errors.push("Relationship strength must be 1–5.");
  if (row.canRefer != null && !["Yes", "No", "Maybe"].includes(row.canRefer)) errors.push("Referral availability must be Yes, No or Maybe.");
  if (row.priority != null && !["Low", "Medium", "High", "Critical"].includes(row.priority)) errors.push("Invalid priority.");
  if (row.profileUrl && !/^https?:\/\//i.test(row.profileUrl)) errors.push("Profile URL must use http or https.");
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) errors.push("Email needs correction before import.");
  const ids = new Set<string>();
  if (row.completedFollowUps !== undefined && (!Array.isArray(row.completedFollowUps) || !row.completedFollowUps.every(s => {
    if (!s || typeof s.id !== "string" || ids.has(s.id) || typeof s.description !== "string" || !validDate(s.dueOn) || !validDate(s.completedOn) || (s.notes !== null && typeof s.notes !== "string")) return false;
    ids.add(s.id); return true;
  }))) errors.push("Invalid follow-up history.");
  return errors;
}
