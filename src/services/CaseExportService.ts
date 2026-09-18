import ExcelJS from "exceljs";
import path from "node:path";
import type { CaseSession, CaseTrack } from "@/domain/CaseSession";
import { getCaseRubric } from "@/domain/rubrics";
import { CASE_EXTRA_HEADERS, caseTrackLabel } from "./CaseWorkbook";
import { validateCaseRecords } from "./CaseValidation";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "docs",
  "source",
  "Case_Tracker_Copy.xlsx",
);

// Preserve the original header and spacer rows; write compact data rows from row 3.
const DATA_START_ROW = 3;
const TEMPLATE_LAST_ROW = 40;
const MINUTES_PER_DAY = 1440;

export class CaseExportService {
  async buildWorkbookBuffer(sessions: CaseSession[], track: CaseTrack = "consulting"): Promise<ExcelJS.Buffer> {
    const errors = validateCaseRecords(sessions);
    if (errors.length || sessions.some(session => session.track !== track)) throw new Error("Invalid case export records.");
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);
    const worksheet = workbook.worksheets[0];
    const rubric = getCaseRubric(track);
    worksheet.name = caseTrackLabel(track);
    // Remove sample values and numbered placeholders while retaining the template styles.
    worksheet.eachRow(row => { if (row.number >= DATA_START_ROW) row.eachCell(cell => { cell.value = null; }); });
    CASE_EXTRA_HEADERS.forEach((header, index) => {
      const column = index + 19;
      worksheet.getCell(1, column).value = header;
      worksheet.getCell(1, column).style = { ...worksheet.getCell(1, 18).style };
      worksheet.getColumn(column).width = index === 0 ? 60 : 28;
    });

    const ordered = [...sessions].sort(
      (a, b) => a.sessionNumber - b.sessionNumber,
    );

    for (const [index, session] of ordered.entries()) {
      const rowNumber = index + DATA_START_ROW;
      const row = worksheet.getRow(rowNumber);

      // Reuse the original template styling for sessions beyond its formatted block.
      if (rowNumber > TEMPLATE_LAST_ROW) {
        this.cloneRowStyle(worksheet.getRow(TEMPLATE_LAST_ROW), row);
        row.getCell(1).value = session.sessionNumber;
      }
      row.getCell(1).value = session.sessionNumber;

      row.getCell(2).value = session.caseName;
      row.getCell(3).value = session.caserName;
      row.getCell(4).value = session.caseeName;
      row.getCell(5).value = session.observerName;
      row.getCell(6).value = new Date(session.occurredOn);
      row.getCell(7).value =
        session.durationMin != null
          ? session.durationMin / MINUTES_PER_DAY
          : null;
      row.getCell(8).value = session.difficulty;
      row.getCell(9).value = session.caseBook;
      row.getCell(10).value = session.overall;
      row.getCell(11).value = session.industry;

      if (session.isScored && session.scores) {
        rubric.dimensions.forEach((dimension, index) => {
          row.getCell(12 + index).value = session.scores?.[dimension.key] ?? null;
        });
      }

      row.getCell(18).value = session.caseType;
      row.getCell(19).value = session.notes;
      row.getCell(19).alignment = { wrapText: true, vertical: "top" };
      row.getCell(20).value = session.myRole;
      row.getCell(21).value = session.track;
      row.getCell(22).value = session.id;
      row.getCell(23).value = session.createdAt;
    }

    return workbook.xlsx.writeBuffer();
  }

  private cloneRowStyle(source: ExcelJS.Row, target: ExcelJS.Row): void {
    source.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      target.getCell(colNumber).style = { ...cell.style };
    });
    if (source.height) target.height = source.height;
  }
}
