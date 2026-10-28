"use client";
import { BulkSelection } from "@/components/BulkSelection";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseSession, CaseTrack } from "@/domain/CaseSession";
import { getCaseRubric } from "@/domain/rubrics";
import { caseTrackConflicts } from "@/services/CaseValidation";
import { caseTrackLabel } from "@/services/CaseWorkbook";
import { CaseSessionCard } from "@/components/casing/CaseSessionCard";
import { SubTabs } from "@/components/nav/SubTabs";
import { casingTabs, prepTabs } from "@/components/nav/destinations";
import { useSession } from "@/lib/session/SessionContext";
import { getCaseSessionRepository } from "@/repositories/factory";
import { CaseStatsService } from "@/services/CaseStatsService";
import { CaseImportService } from "@/services/CaseImportService";
import { DataTransferPanel } from "@/components/DataTransferPanel";


const statsService = new CaseStatsService();
const importService = new CaseImportService();

export function CasingPage({ track }: { track: CaseTrack }) {
  const rubric = getCaseRubric(track);
  const label = caseTrackLabel(track);
  const { userId } = useSession();
  const [sessions, setSessions] = useState<CaseSession[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    getCaseSessionRepository()
      .list(userId)
      .then(rows => setSessions(rows.filter(row => row.track === track)))
      .catch(error => { console.error("Case list failed:", error); setLoadError(true); });
  }, [userId, attempt, track]);

  const summary = sessions ? statsService.summarize(sessions, rubric) : null;

  return (
    <div className="flex flex-col gap-3 pb-24">
      <div className="hidden md:block"><SubTabs items={prepTabs} /></div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Casing</h1>
      <nav aria-label="Casing track" className="flex rounded-card bg-hairline/40 p-1">
        {casingTabs.map(tab => <Link key={tab.href} href={tab.href} aria-current={tab.href.endsWith(track) ? "page" : undefined}
          className={"flex min-h-tap flex-1 items-center justify-center rounded-[9px] text-sm font-medium " + (tab.href.endsWith(track) ? "bg-surface text-accent shadow-sm" : "text-secondary")}>{tab.label}</Link>)}
      </nav>
      <div className="grid grid-cols-3 gap-2.5" aria-label="Case statistics">
        <div className="rounded-card bg-surface p-3"><p className="text-sm text-secondary">Sessions</p><p className="mt-0.5 text-2xl font-semibold tabular-nums">{summary?.sessionCount ?? "—"}</p></div>
        <div className="rounded-card bg-surface p-3"><p className="text-sm text-secondary">Average</p><p className="mt-0.5 text-2xl font-semibold tabular-nums">{summary?.averageOverall?.toFixed(1) ?? "—"}</p></div>
        <div className="rounded-card bg-flag-bg p-3 text-flag-text"><p className="text-sm">Weakest</p><p className="mt-1 break-words text-lg font-semibold leading-tight">{summary?.weakestDimension?.label ?? "—"}</p></div>
      </div>
      <div className="relative flex gap-2.5 py-1">
        <Link href={`/prep/casing/${track}/new`} className="flex min-h-tap flex-1 md:flex-none md:px-5 items-center justify-center gap-2 rounded-card bg-accent text-sm font-medium text-surface"><span aria-hidden="true" className="text-xl">+</span> Log a case</Link>
        <DataTransferPanel label={label + " cases"} format="bench-cases" exportType="Excel" exportRecords={() => getCaseSessionRepository().list(userId)} accept=".xlsx" parseFile={async file => {
          const result = await importService.parseFile(file, track);
          if (!result.errors.length) result.errors.push(...caseTrackConflicts(result.records, await getCaseSessionRepository().list(userId), track));
          return result;
        }} replaceAll={records => getCaseSessionRepository().replaceTrack(userId, track, records)} onImported={() => { setLoadError(false); setSessions(null); setAttempt(n => n + 1); }} exportFile={async () => {
          const sessions = (await getCaseSessionRepository().list(userId)).filter(row => row.track === track);
          const response = await fetch("/api/casing/export", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessions, track }) });
          if (!response.ok) throw new Error("Excel export failed.");
          const url = URL.createObjectURL(await response.blob());
          const anchor = document.createElement("a"); anchor.href = url; anchor.download = "Bench-" + track + "-cases.xlsx";
          document.body.appendChild(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
        }} />
      </div>

      {loadError ? (
        <div role="alert"><p>Could not load your cases.</p><button className="min-h-tap text-accent" onClick={() => { setLoadError(false); setAttempt(n => n + 1); }}>Try again</button></div>
      ) : sessions === null ? (
        <p className="text-secondary">Loading&hellip;</p>
      ) : sessions.length === 0 ? (
        <p className="text-secondary">No {label.toLowerCase()} sessions yet. Log your first case.</p>
      ) : (
        <BulkSelection items={sessions.map(s=>({id:s.id,label:s.caseName}))} noun="case sessions" description="These sessions and their notes will be permanently removed. Case goals and statistics will recalculate." onDelete={async ids=>{await getCaseSessionRepository().deleteMany(userId,ids);setSessions(rows=>rows?.filter(row=>!ids.includes(row.id))??null);}}>{checkbox=>(
          <div className="flex min-w-0 flex-col gap-4">
            {sessions.map((session) => (
              <div key={session.id} className="relative"><div className="absolute left-1 top-1 z-10">{checkbox(session.id)}</div><div className="pl-11"><CaseSessionCard session={session} onDelete={async()=>{await getCaseSessionRepository().delete(session.id,userId);setSessions(rows=>rows?.filter(s=>s.id!==session.id)??null);}}/></div></div>
            ))}
          </div>
        )}</BulkSelection>
      )}
    </div>
  );
}
