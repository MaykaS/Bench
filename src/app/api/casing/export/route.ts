import { NextResponse } from "next/server";
import { CaseSession, type CaseSessionData } from "@/domain/CaseSession";
import { CaseExportService } from "@/services/CaseExportService";

// exceljs needs the Node fs module, not the edge runtime.
export const runtime = "nodejs";

// Phase 1 has no server-side data store (case sessions live in the browser's
// localStorage), so the client sends its current sessions in the request
// body. In phase 2 this route reads getCaseSessionRepository().list(userId)
// directly instead and drops the request body entirely.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { sessions?: CaseSessionData[] };
    const rows = Array.isArray(body.sessions) ? body.sessions : [];
    const sessions = rows.map((row) => new CaseSession(row));

    const buffer = await new CaseExportService().buildWorkbookBuffer(sessions);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Case Tracker.xlsx"',
      },
    });
  } catch (error) {
    console.error("Case export failed:", error);
    return NextResponse.json(
      { error: "Could not generate the export. Try again." },
      { status: 500 },
    );
  }
}
