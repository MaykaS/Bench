import type { PeiStory, PeiSection } from "@/domain/PeiStory";
import { GapDetectionService } from "@/services/GapDetectionService";
const gaps = new GapDetectionService();
export function StoryText({ text }: { text: string }) { return <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-ink">{gaps.segments(text).map((part, i) => part.isGap ? <mark key={i} className="rounded bg-flag-bg px-1 text-flag-text">{part.text}</mark> : <span key={i}>{part.text}</span>)}</p>; }
export function StorySection({ story, name, label, timing }: { story: PeiStory; name: PeiSection; label: string; timing: string }) { return <section id={name} className="scroll-mt-4"><div className="mb-2 flex items-baseline justify-between gap-3"><h2 className="text-lg font-semibold text-ink">{label}</h2><span className="shrink-0 text-xs text-secondary">{timing}</span></div><StoryText text={story.sections[name]} /></section>; }
