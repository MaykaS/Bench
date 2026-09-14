import fs from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import type { PeiSection } from "@/domain/PeiStory";
import { PeiStory } from "@/domain/PeiStory";
import seedData from "../../seed/pei-stories.json";

const TEMPLATE = path.join(process.cwd(), "docs", "source", "PEI_stories_template.docx");
const SECTION_LABELS: Record<string, PeiSection> = {
  "Summary   10–15 sec": "summary", "Problem   30–45 sec": "problem",
  "Action   2–3 min": "action", "Result   30–45 sec": "result", "Reflection   20–30 sec": "reflection",
};

export class PeiExportService {
  async buildDocumentBuffer(stories: PeiStory[]): Promise<Buffer> {
    const template = await fs.readFile(TEMPLATE);
    const zip = await JSZip.loadAsync(template);
    const document = await zip.file("word/document.xml")?.async("string");
    if (!document) throw new Error("PEI template is missing its document body.");
    const ordered = [...stories].sort((a, b) => this.storyOrder(a) - this.storyOrder(b));
    const originalTitles = (seedData as { title: string }[]).map(story => story.title);
    let storyIndex = -1;
    let section: PeiSection | null = null;
    let sectionWritten = false;
    const replacements = new Map<number, string>();
    const paragraphs = [...document.matchAll(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g)];
    paragraphs.forEach((match, paragraphIndex) => {
      const text = this.paragraphText(match[0]);
      const titleIndex = originalTitles.indexOf(text);
      if (titleIndex >= 0) { storyIndex = titleIndex; section = null; sectionWritten = false; replacements.set(paragraphIndex, ordered[storyIndex].title); return; }
      if (text === "Main story" || text === "Backup story") { section = null; sectionWritten = false; return; }
      if (SECTION_LABELS[text]) { section = SECTION_LABELS[text]; sectionWritten = false; return; }
      if (storyIndex >= 0 && section && text) {
        const story = ordered[storyIndex];
        replacements.set(paragraphIndex, sectionWritten ? "" : story.sections[section]);
        sectionWritten = true;
      }
    });
    let paragraphIndex = 0;
    const rewritten = document.replace(/<w:p\b[^>]*>[\s\S]*?<\/w:p>/g, paragraph => {
      const replacement = replacements.get(paragraphIndex++);
      return replacement === undefined ? paragraph : this.replaceParagraphText(paragraph, replacement);
    });
    zip.file("word/document.xml", rewritten);
    return zip.generateAsync({ type: "nodebuffer" });
  }

  private storyOrder(story: PeiStory): number { const buckets = ["connection", "drive", "leadership", "growth"]; return buckets.indexOf(story.dimension) * 2 + (story.slot === "main" ? 0 : 1); }
  private paragraphText(xml: string): string { return [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(m => this.unescape(m[1])).join(""); }
  private replaceParagraphText(xml: string, text: string): string {
    const firstRun = xml.match(/<w:r\b[^>]*>([\s\S]*?)<\/w:r>/)?.[1] ?? "";
    const runProps = firstRun.match(/<w:rPr>[\s\S]*?<\/w:rPr>/)?.[0] ?? "";
    const body = text.split("\n").map(line => `<w:t xml:space="preserve">${this.escape(line)}</w:t>`).join("<w:br/>");
    const run = `<w:r>${runProps}${body}</w:r>`;
    return xml.replace(/(<w:p\b[^>]*>)[\s\S]*?(<\/w:p>)/, (_, start: string, end: string) => start + run + end);
  }
  private escape(value: string): string { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  private unescape(value: string): string { return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'"); }
}
