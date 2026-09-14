import type { ImportPreview } from "./ImportTypes";
import { APPLICATION_STATUSES } from "@/domain/Application";

type Row = Record<string, unknown>;
const object = (v: unknown): v is Row => !!v && typeof v === "object" && !Array.isArray(v);
const string = (v: unknown) => typeof v === "string";
const date = (v: unknown) => string(v) && /^\d{4}-\d{2}-\d{2}$/.test(v as string) && !isNaN(Date.parse(v as string));

export class JsonBackupService {
  static async parse<T>(file: File, format: string, userId: string): Promise<ImportPreview<T>> {
    const result: ImportPreview<T> = { format, version: 1, records: [], errors: [], warnings: [] };
    try {
      const data: unknown = JSON.parse(await file.text());
      if (!object(data) || data.format !== format || data.version !== 1 || !Array.isArray(data.records)) throw new Error("Choose a version 1 " + format + " JSON backup.");
      const ids = new Set<string>();
      data.records.forEach((row: unknown, i: number) => {
        const fail = (message: string) => result.errors.push({ record: `Record ${i + 1}`, message });
        if (!object(row)) { fail("Expected a record object."); return; }
        if (!string(row.id) || !row.id || ids.has(row.id as string)) fail("A unique ID is required.");
        ids.add(row.id as string);
        if (!string(row.createdAt) || !string(row.updatedAt)) fail("Creation and update timestamps are required.");
        const optional = format === "bench-applications" ? ["location", "link", "notes", "resumeVersion", "nextActionNote"] : ["company", "role", "email", "profileUrl", "notes"];
        if (optional.some(key => row[key] !== null && !string(row[key]))) fail("Optional text fields must contain text or null.");
        if (format === "bench-applications") {
          if (row.completedSteps === undefined) row.completedSteps = [];
          const stepIds = new Set<string>();
          if (!Array.isArray(row.completedSteps) || !row.completedSteps.every(step => {
            if (!object(step) || !string(step.id) || !step.id || stepIds.has(step.id as string) || !string(step.description) || !step.description.trim() || !date(step.dueOn) || !date(step.completedOn) || (step.notes !== null && !string(step.notes))) return false;
            stepIds.add(step.id as string); return true;
          })) fail("Invalid completed-step history.");
          if (!string(row.company) || !row.company.trim() || !string(row.role) || !row.role.trim() || !date(row.appliedOn)) fail("Company, role and a valid application date are required.");
          if (typeof row.referred !== "boolean" || !Array.isArray(row.contactIds) || !row.contactIds.every(string)) fail("Invalid referral or contact selection.");
          if (!APPLICATION_STATUSES.includes(row.status as never) || (row.nextActionOn !== null && !date(row.nextActionOn))) fail("Invalid status or next-action date.");
          if (!Array.isArray(row.timeline) || !row.timeline.every(e => object(e) && string(e.id) && date(e.date) && string(e.createdAt) && (e.note === null || string(e.note)) && APPLICATION_STATUSES.includes(e.label as never))) fail("Invalid timeline events.");
        } else if (!string(row.name) || !row.name.trim()) fail("Contact name is required.");
        result.records.push({ ...row, userId } as T);
      });
      if (format === "bench-applications") result.warnings.push({ message: "Contact links use Network IDs. Transfer your Network JSON too to display linked contact names on another device. Resume names are preserved in each application." });
    } catch (error) { result.errors.push({ message: error instanceof Error ? error.message : "Could not read this JSON backup." }); }
    return result;
  }
}
