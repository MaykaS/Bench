import ExcelJS from "exceljs";
import type { CaseRole, CaseSessionData, CaseTrack } from "@/domain/CaseSession";
import type { ImportPreview } from "./ImportTypes";

const HEADERS = ["#", "Case", "Cased By", "Casee", "Observer", "Date", "Time", "Difficulty", "Case Book", "My Performance", "Industry/Niche", "Struc", "Math", "Coach", "Biz Ac.", "Concl", "Creativ.", "Case Type"];
const USER_ID = "00000000-0000-0000-0000-000000000001";

export class CaseImportService {
  async parseFile(file: File): Promise<ImportPreview<CaseSessionData>> {
    return file.name.toLowerCase().endsWith(".json") ? this.parseJson(await file.text()) : this.parseWorkbook(await file.arrayBuffer());
  }
  private parseJson(text: string): ImportPreview<CaseSessionData> {
    try {
      const source = JSON.parse(text) as { records?: Partial<CaseSessionData>[] } | Partial<CaseSessionData>[];
      if (!Array.isArray(source) && (!source || (source as {format?: string}).format !== "bench-cases" || (source as {version?: number}).version !== 1)) return this.failure("Choose a version 1 Bench cases JSON backup.");
      const rows = Array.isArray(source) ? source : source.records;
      if (!Array.isArray(rows)) return this.failure("JSON backup must contain a records array.");
      return this.validate(rows.map((row, i) => this.normalize(row, i)), "Bench cases JSON");
    } catch { return this.failure("The JSON file could not be read."); }
  }
  private async parseWorkbook(data: ArrayBuffer): Promise<ImportPreview<CaseSessionData>> {
    try {
      const workbook = new ExcelJS.Workbook(); await workbook.xlsx.load(data); const sheet = workbook.worksheets[0];
      if (!sheet) return this.failure("The workbook has no worksheet.");
      const actual = HEADERS.map((_, i) => String(sheet.getRow(1).getCell(i + 1).value ?? "").trim());
      const errors = HEADERS.filter((header, i) => actual[i] !== header).map(header => ({ message: `Missing or moved column: ${header}` }));
      if (errors.length) return { format: "Case tracker Excel", version: 1, records: [], errors, warnings: [] };
      const records: CaseSessionData[] = [];
      sheet.eachRow((row, number) => {
        if (number < 3) return;
        const sessionNumber = this.number(row.getCell(1).value); const caseName = String(row.getCell(2).value ?? "").trim();
        if (sessionNumber == null || !caseName) return;
        records.push(this.normalize({ sessionNumber, caseName, caserName: this.string(row.getCell(3).value), caseeName: this.string(row.getCell(4).value), observerName: this.string(row.getCell(5).value), occurredOn: this.date(row.getCell(6).value), durationMin: this.duration(row.getCell(7).value), difficulty: this.number(row.getCell(8).value), caseBook: this.string(row.getCell(9).value), overall: this.number(row.getCell(10).value), industry: this.string(row.getCell(11).value), scores: { structure: this.number(row.getCell(12).value), math: this.number(row.getCell(13).value), coaching: this.number(row.getCell(14).value), businessAcumen: this.number(row.getCell(15).value), conclusion: this.number(row.getCell(16).value), creativity: this.number(row.getCell(17).value) } as Record<string, number>, caseType: this.string(row.getCell(18).value), myRole: this.number(row.getCell(10).value) != null ? "casee" : "caser", track: "consulting" }, records.length));
      });
      if (records.length === 0) return this.failure("The workbook contains no case records.");
      return this.validate(records, "Case tracker Excel", [{ message: "Role was inferred from My Performance because the fixed workbook does not contain a role column." }]);
    } catch { return this.failure("The workbook could not be read."); }
  }
  private normalize(row: Partial<CaseSessionData>, index: number): CaseSessionData {
    const isCasee = row.myRole === "casee" || (row.myRole == null && row.overall != null);
    return { id: row.id ?? `imported-case-${row.sessionNumber ?? index + 1}`, userId: USER_ID, sessionNumber: row.sessionNumber ?? index + 1, caseName: String(row.caseName ?? ""), caserName: row.caserName ?? null, caseeName: row.caseeName ?? null, observerName: row.observerName ?? null, occurredOn: String(row.occurredOn ?? ""), durationMin: row.durationMin ?? null, difficulty: row.difficulty ?? null, caseBook: row.caseBook ?? null, overall: isCasee ? row.overall ?? null : null, industry: row.industry ?? null, scores: isCasee ? row.scores ?? null : null, caseType: row.caseType ?? null, track: (row.track ?? "consulting") as CaseTrack, myRole: (row.myRole ?? (isCasee ? "casee" : "caser")) as CaseRole, notes: row.notes ?? null, createdAt: row.createdAt ?? new Date().toISOString() };
  }
  private validate(records: CaseSessionData[], format: string, warnings: { message: string }[] = []): ImportPreview<CaseSessionData> {
    const errors: { message: string; record?: string }[] = []; const seen = new Set<number>();
    records.forEach((r, i) => { const record = `Row ${i + 1}`; if (!r.caseName.trim()) errors.push({ record, message: "Case name is required." }); if (!/^\d{4}-\d{2}-\d{2}$/.test(r.occurredOn)) errors.push({ record, message: "Date must be YYYY-MM-DD." }); if (!Number.isInteger(r.sessionNumber) || r.sessionNumber < 1 || seen.has(r.sessionNumber)) errors.push({ record, message: "Session number must be a unique positive integer." }); seen.add(r.sessionNumber); if (!["casee", "caser", "observer"].includes(r.myRole)) errors.push({ record, message: "Role must be casee, caser, or observer." }); if (!["consulting", "tech"].includes(r.track)) errors.push({ record, message: "Track must be consulting or tech." }); for (const [key, value] of Object.entries(r.scores ?? {})) if (value != null && (!Number.isInteger(value) || value < 1 || value > 5)) errors.push({ record, message: `Score ${key} must be 1–5.` }); if (r.overall != null && (!Number.isInteger(r.overall) || r.overall < 1 || r.overall > 5)) errors.push({ record, message: "Overall score must be 1–5." }); });
    return { format, version: 1, records, errors, warnings };
  }
  private failure(message: string): ImportPreview<CaseSessionData> { return { format: "Unknown", version: 1, records: [], errors: [{ message }], warnings: [] }; }
  private string(value: unknown): string | null { return value == null || String(value).trim() === "" ? null : String(value).trim(); }
  private number(value: unknown): number | null { const n = typeof value === "number" ? value : Number(value); return value == null || value === "" || Number.isNaN(n) ? null : n; }
  private duration(value: unknown): number | null { const n = this.number(value); return n == null ? null : n < 1 ? Math.round(n * 1440) : Math.round(n); }
  private date(value: unknown): string { if (value instanceof Date) return value.toISOString().slice(0, 10); const text = String(value ?? ""); return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : ""; }
}
