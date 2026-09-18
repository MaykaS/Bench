import ExcelJS from "exceljs";
import type { CaseRole, CaseSessionData, CaseTrack } from "@/domain/CaseSession";
import type { ImportPreview, ImportIssue } from "./ImportTypes";
import { CASE_HEADERS, CASE_EXTRA_HEADERS, caseTrackLabel } from "./CaseWorkbook";
import { validateCaseRecords } from "./CaseValidation";
const USER_ID = "00000000-0000-0000-0000-000000000001";
const SCORE_KEYS = ["structure", "math", "coaching", "businessAcumen", "conclusion", "creativity"];
export class CaseImportService {
  async parseFile(file: File, track?: CaseTrack): Promise<ImportPreview<CaseSessionData>> {
    // Retain JSON for cloud validation and older full-workspace backups.
    if (!track && file.name.toLowerCase().endsWith(".json")) return this.parseJson(await file.text());
    if (!file.name.toLowerCase().endsWith(".xlsx")) return this.failure("Choose an Excel .xlsx case tracker.");
    return this.parseWorkbook(await file.arrayBuffer(), track ?? "consulting");
  }
  private parseJson(text: string): ImportPreview<CaseSessionData> {
    try {
      const source = JSON.parse(text);
      if (!Array.isArray(source) && (!source || source.format !== "bench-cases" || source.version !== 1)) return this.failure("Choose a version 1 Bench cases JSON backup.");
      const rows = Array.isArray(source) ? source : source.records;
      if (!Array.isArray(rows)) return this.failure("JSON backup must contain a records array.");
      return this.validate(rows.map((row: Partial<CaseSessionData>, i: number) => this.normalize(row, i)), "Bench cases JSON");
    } catch { return this.failure("The JSON file could not be read."); }
  }
  private async parseWorkbook(data: ArrayBuffer, track: CaseTrack): Promise<ImportPreview<CaseSessionData>> {
    try {
      const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(data);
      const sheet = workbook.worksheets[0];
      if (!sheet) return this.failure("The workbook has no worksheet.");
      const errors: ImportIssue[] = CASE_HEADERS.flatMap((header, i) => String(sheet.getRow(1).getCell(i + 1).value ?? "").trim() !== header ? [{ message: `Missing or moved column: ${header}` }] : []);
      const extras = new Map<string, number>();
      sheet.getRow(1).eachCell((cell, column) => { if (column > 18) extras.set(String(cell.value).trim(), column); });
      const isBench = CASE_EXTRA_HEADERS.every(header => extras.has(header));
      if (isBench && ["Tech", "Consulting"].includes(sheet.name) && sheet.name !== caseTrackLabel(track)) errors.push({ message: `This is a ${sheet.name} workbook. Open that track to import it.` });
      if (errors.length) return { format: "Case tracker Excel", version: 1, records: [], errors, warnings: [] };
      const records: CaseSessionData[] = [], sourceRows: number[] = [];
      let inferredRoles = false;
      sheet.eachRow((row, number) => {
        if (number < 3) return;
        // Template rows containing only a prefilled number are not records.
        if (!Array.from({ length: Math.max(23, row.cellCount) - 1 }, (_, i) => row.getCell(i + 2).value).some(value => value != null && value !== "")) return;
        const extra = (header: string) => extras.has(header) ? row.getCell(extras.get(header)!).value : null;
        const roleValue = this.string(extra("Role"));
        if (!roleValue) inferredRoles = true;
        const overall = this.number(row.getCell(10).value);
        const role = (roleValue ?? (overall != null ? "casee" : "caser")) as CaseRole;
        const explicitTrack = this.string(extra("Track"));
        if (explicitTrack && explicitTrack !== track) errors.push({ record: `Excel row ${number}`, message: `Track is ${explicitTrack}; expected ${track}.` });
        const scores = Object.fromEntries(SCORE_KEYS.flatMap((key, index) => { const value = this.number(row.getCell(12 + index).value); return value == null ? [] : [[key, value]]; }));
        const createdAt = extra("Created At");
        records.push(this.normalize({
          sessionNumber: this.number(row.getCell(1).value) ?? NaN, caseName: this.string(row.getCell(2).value) ?? "",
          caserName: this.string(row.getCell(3).value), caseeName: this.string(row.getCell(4).value), observerName: this.string(row.getCell(5).value),
          occurredOn: this.date(row.getCell(6).value), durationMin: this.duration(row.getCell(7).value), difficulty: this.number(row.getCell(8).value),
          caseBook: this.string(row.getCell(9).value), overall, industry: this.string(row.getCell(11).value),
          scores: Object.keys(scores).length ? scores : null, caseType: this.string(row.getCell(18).value), myRole: role, track,
          notes: extra("Notes") == null ? null : String(extra("Notes")), id: this.string(extra("Record ID")) ?? undefined,
          createdAt: createdAt instanceof Date ? createdAt.toISOString() : this.string(createdAt) ?? undefined,
        }, records.length));
        sourceRows.push(number);
      });
      if (!records.length && !isBench) return this.failure("The workbook contains no case records.");
      const result = this.validate(records, "Case tracker Excel", inferredRoles ? [{ message: "Missing roles were inferred from My Performance: scored rows are casee, otherwise caser. Check roles before importing." }] : []);
      result.errors = [...errors, ...result.errors.map(issue => ({ ...issue, record: `Excel row ${sourceRows[Number(issue.record?.split(" ")[1]) - 1]}` }))];
      return result;
    } catch { return this.failure("The workbook could not be read."); }
  }
  private normalize(row: Partial<CaseSessionData>, index: number): CaseSessionData {
    return { id: row.id ?? `imported-${row.track ?? "consulting"}-case-${row.sessionNumber ?? index + 1}`, userId: USER_ID, sessionNumber: row.sessionNumber ?? index + 1, caseName: String(row.caseName ?? ""), caserName: row.caserName ?? null, caseeName: row.caseeName ?? null, observerName: row.observerName ?? null, occurredOn: String(row.occurredOn ?? ""), durationMin: row.durationMin ?? null, difficulty: row.difficulty ?? null, caseBook: row.caseBook ?? null, overall: row.overall ?? null, industry: row.industry ?? null, scores: row.scores ?? null, caseType: row.caseType ?? null, track: (row.track ?? "consulting") as CaseTrack, myRole: (row.myRole ?? (row.overall != null ? "casee" : "caser")) as CaseRole, notes: row.notes ?? null, createdAt: row.createdAt ?? new Date().toISOString() };
  }
  private validate(records: CaseSessionData[], format: string, warnings: ImportIssue[] = []): ImportPreview<CaseSessionData> { return { format, version: 1, records, errors: validateCaseRecords(records), warnings }; }
  private failure(message: string): ImportPreview<CaseSessionData> { return { format: "Unknown", version: 1, records: [], errors: [{ message }], warnings: [] }; }
  private string(value: unknown): string | null { return value == null || String(value).trim() === "" ? null : String(value).trim(); }
  private number(value: unknown): number | null { return value == null || value === "" ? null : typeof value === "number" ? value : Number(value); }
  private duration(value: unknown): number | null {
    // ExcelJS decodes cells using the legacy hh:mm format as dates from Excel's epoch.
    if (value instanceof Date) return Math.round((value.getTime() - Date.UTC(1899, 11, 30)) / 60000 * 1000000) / 1000000;
    const n = this.number(value);
    return n == null ? null : n < 1 && n > 0 ? Math.round(n * 1440 * 1000000) / 1000000 : n;
  }
  private date(value: unknown): string { if (value instanceof Date) return value.toISOString().slice(0, 10); return String(value ?? ""); }
}
