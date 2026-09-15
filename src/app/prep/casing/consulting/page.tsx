"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseSession } from "@/domain/CaseSession";
import { ConsultingRubric } from "@/domain/rubrics/ConsultingRubric";
import { CaseSessionCard } from "@/components/casing/CaseSessionCard";
import { SubTabs } from "@/components/nav/SubTabs";
import { casingTabs, prepTabs } from "@/components/nav/destinations";
import { useSession } from "@/lib/session/SessionContext";
import { getCaseSessionRepository } from "@/repositories/factory";
import { CaseStatsService } from "@/services/CaseStatsService";
import { CaseImportService } from "@/services/CaseImportService";
import { DataTransferPanel } from "@/components/DataTransferPanel";

const rubric = new ConsultingRubric();
const statsService = new CaseStatsService();
const importService = new CaseImportService();

export default function CasingConsultingPage() {
  const { userId } = useSession();
  const [sessions, setSessions] = useState<CaseSession[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    getCaseSessionRepository()
      .list(userId)
      .then(rows => setSessions(rows.filter(row => row.track === "consulting")))
      .catch(error => { console.error("Case list failed:", error); setLoadError(true); });
  }, [userId, attempt]);

  const summary = sessions ? statsService.summarize(sessions, rubric) : null;

  return (
    <div className="flex flex-col gap-3 pb-24">
      <div className="hidden md:block"><SubTabs items={prepTabs} /></div>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Casing</h1>
      <nav aria-label="Casing track" className="flex rounded-card bg-hairline/40 p-1">
        {casingTabs.map(tab => <Link key={tab.href} href={tab.href} aria-current={tab.href.endsWith("consulting") ? "page" : undefined}
          className={"flex min-h-tap flex-1 items-center justify-center rounded-[9px] text-sm font-medium " + (tab.href.endsWith("consulting") ? "bg-surface text-accent shadow-sm" : "text-secondary")}>{tab.label}</Link>)}
      </nav>
      <div className="grid grid-cols-3 gap-2.5" aria-label="Case statistics">
        <div className="rounded-card bg-surface p-3"><p className="text-sm text-secondary">Sessions</p><p className="mt-0.5 text-2xl font-semibold tabular-nums">{summary?.sessionCount ?? "—"}</p></div>
        <div className="rounded-card bg-surface p-3"><p className="text-sm text-secondary">Average</p><p className="mt-0.5 text-2xl font-semibold tabular-nums">{summary?.averageOverall?.toFixed(1) ?? "—"}</p></div>
        <div className="rounded-card bg-flag-bg p-3 text-flag-text"><p className="text-sm">Weakest</p><p className="mt-1 break-words text-lg font-semibold leading-tight">{summary?.weakestDimension?.label ?? "—"}</p></div>
      </div>
      <div className="relative flex gap-2.5 py-1">
        <Link href="/prep/casing/consulting/new" className="flex min-h-tap flex-1 md:flex-none md:px-5 items-center justify-center gap-2 rounded-card bg-accent text-sm font-medium text-surface"><span aria-hidden="true" className="text-xl">+</span> Log a case</Link>
        <DataTransferPanel label="cases" format="bench-cases" exportRecords={() => getCaseSessionRepository().list(userId)} accept=".xlsx,.json" parseFile={(file) => importService.parseFile(file)} replaceAll={(records) => getCaseSessionRepository().replaceAll(userId, records)} onImported={() => { setSessions(null); setAttempt(n => n + 1); }} />
      </div>

      {loadError ? (
        <div role="alert"><p>Could not load your cases.</p><button className="min-h-tap text-accent" onClick={() => { setLoadError(false); setAttempt(n => n + 1); }}>Try again</button></div>
      ) : sessions === null ? (
        <p className="text-secondary">Loading&hellip;</p>
      ) : sessions.length === 0 ? (
        <p className="text-secondary">No sessions yet. Log your first case.</p>
      ) : (
        <>
          <div className="flex min-w-0 flex-col gap-4">
            {sessions.map((session) => (
              <CaseSessionCard key={session.id} session={session} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
