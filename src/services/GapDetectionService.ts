import type { PeiSection, PeiStory } from "@/domain/PeiStory";
export interface StoryTextSegment { text: string; isGap: boolean; }
const marker = /\[confirm(?:\s*:[^\]]*)?\]/gi;
export class GapDetectionService {
  count(story: PeiStory): number { return Object.values(story.sections).reduce((n, text) => n + (text.match(marker)?.length ?? 0), 0); }
  segments(text: string): StoryTextSegment[] { const result: StoryTextSegment[] = []; let last = 0; text.replace(marker, (match, offset: number) => { if (offset > last) result.push({ text: text.slice(last, offset), isGap: false }); result.push({ text: match, isGap: true }); last = offset + match.length; return match; }); if (last < text.length) result.push({ text: text.slice(last), isGap: false }); return result.length ? result : [{ text, isGap: false }]; }
}
