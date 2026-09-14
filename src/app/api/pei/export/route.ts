import { NextResponse } from "next/server";
import { PeiStory, type PeiStoryData } from "@/domain/PeiStory";
import { PeiExportService } from "@/services/PeiExportService";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json() as { stories?: PeiStoryData[] };
    const stories = Array.isArray(body.stories) ? body.stories.map(row => new PeiStory(row)) : [];
    const buffer = await new PeiExportService().buildDocumentBuffer(stories);
    return new NextResponse(new Uint8Array(buffer), { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "Content-Disposition": 'attachment; filename="PEI stories.docx"' } });
  } catch (error) {
    console.error("PEI export failed:", error);
    return NextResponse.json({ error: "Could not generate the PEI export. Try again." }, { status: 500 });
  }
}
