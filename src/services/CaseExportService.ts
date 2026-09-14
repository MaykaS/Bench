import ExcelJS from "exceljs";
import path from "node:path";
import type { CaseSession } from "@/domain/CaseSession";
import { ConsultingRubric } from "@/domain/rubrics/ConsultingRubric";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "docs",
  "source",
  "Case_Tracker_Copy.xlsx",
);

// Row 1 is the header, row 2 is a blank spacer, row 3 is where the template's
// pre-filled "#" sequence (1..38) starts.
const DATA_START_ROW = 3;
const TEMPLATE_LAST_ROW = 40;
const MINUTES_PER_DAY = 1440;

export class CaseExportService {
  async buildWorkbookBuffer(sessions: CaseSession[]): Promise<ExcelJS.Buffer> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(TEMPLATE_PATH);
    const worksheet = workbook.worksheets[0];
    const rubric = new ConsultingRubric();

    const ordered = [...sessions].sort(
      (a, b) => a.sessionNumber - b.sessionNumber,
    );

    for (const session of ordered) {
      const rowNumber = session.sessionNumber + (DATA_START_ROW - 1);
      const row = worksheet.getRow(rowNumber);

      // Rows 3-40 already carry the template's pre-filled "#" and formatting.
      // Past that, the template has nothing to reuse, so clone row 40's style
      // and write "#" ourselves, continuing the sequence.
      if (rowNumber > TEMPLATE_LAST_ROW) {
        this.cloneRowStyle(worksheet.getRow(TEMPLATE_LAST_ROW), row);
        row.getCell(1).value = session.sessionNumber;
      }

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
