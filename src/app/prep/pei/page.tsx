"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { SubTabs } from "@/components/nav/SubTabs";
import { prepTabs } from "@/components/nav/destinations";
import { useSession } from "@/lib/session/SessionContext";
import { getPeiStoryRepository } from "@/repositories/factory";
import { GapDetectionService } from "@/services/GapDetectionService";
import type { PeiStory } from "@/domain/PeiStory";
const gaps = new GapDetectionService();
const buckets = ["connection", "drive", "leadership", "growth"] as const;
const labels = { connection: "Connection", drive: "Drive", leadership: "Leadership", growth: "Growth" };
export default function PeiPage() {
  const { userId } = useSession(); const [stories, setStories] = useState<PeiStory[] | null>(null); const [error, setError] = useState(false); const [attempt, setAttempt] = useState(0);
  useEffect(() => { getPeiStoryRepository().list(userId).then(setStories).catch(e => { console.error("PEI load failed:", e); setError(true); }); }, [userId, attempt]);
  return <div className="flex flex-col gap-4 pb-24"><SubTabs items={prepTabs} /><h1 className="text-2xl font-semibold tracking-tight text-ink">PEI</h1>{error ? <div role="alert" className="rounded-card border border-hairline bg-surface p-card"><p>Could not load your stories.</p><button className="mt-2 min-h-tap text-accent" onClick={() => { setError(false); setAttempt(n => n + 1); }}>Try again</button></div> : stories === null ? <p className="text-secondary">Loading stories…</p> : buckets.map(bucket => <section key={bucket} aria-labelledby={bucket + "-heading"}><h2 id={bucket + "-heading"} className="mb-2 text-lg font-semibold text-ink">{labels[bucket]}</h2><div className="flex flex-col gap-2">{stories.filter(s => s.dimension === bucket).sort((a,b) => a.slot === "main" ? -1 : b.slot === "main" ? 1 : 0).map(story => { const count = gaps.count(story); return <Link key={story.id} href={`/prep/pei/${story.id}`} className="min-h-tap rounded-card border border-hairline bg-surface p-card"><div className="flex items-start justify-between gap-3"><div><span className="text-xs font-medium uppercase tracking-wide text-accent">{story.slot}</span><h3 className="mt-1 font-semibold text-ink">{story.title}</h3></div><span className={`shrink-0 rounded-full px-2 py-1 text-xs ${count ? "bg-flag-bg text-flag-text" : "bg-page text-secondary"}`}>{count ? `${count} to confirm` : "No open confirmations"}</span></div></Link>})}</div></section>)}</div>;
}
