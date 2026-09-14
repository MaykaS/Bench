"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseSession } from "@/domain/CaseSession";
import { ConsultingRubric } from "@/domain/rubrics/ConsultingRubric";
import { CaseSessionCard } from "@/components/casing/CaseSessionCard";
import { CaseSessionTable } from "@/components/casing/CaseSessionTable";
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
  const [exportError, setExportError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getCaseSessionRepository()
      .list(userId)
      .then(rows => setSessions(rows.filter(row => row.track === "consulting")))
      .catch(error => { console.error("Case list failed:", error); setLoadError(true); });
  }, [userId, attempt]);

  async function handleExport() {
    setExportError(null);
    setExporting(true);
    try {
      const response = await fetch("/api/casing/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions: sessions ?? [] }),
      });
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Case Tracker.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("Could not export. Try again.");
    } finally {
      setExporting(false);
    }
  }

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
      <div className="flex gap-2.5 py-1">
        <Link href="/prep/casing/consulting/new" className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-card bg-accent text-base font-medium text-surface"><span aria-hidden="true" className="text-xl">+</span> Log a case</Link>
        <button type="button" onClick={handleExport} disabled={exporting || !sessions}
          aria-label={exporting ? "Exporting cases" : "Export cases to Excel"} title="Export cases to Excel"
          className="flex min-h-12 w-12 shrink-0 items-center justify-center gap-2 rounded-card border border-hairline bg-surface px-3 text-accent disabled:opacity-50 md:w-auto">
          <svg aria-hidden="true" className={"h-5 w-5 " + (exporting ? "animate-pulse" : "")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3m5 5-5-5-5 5M5 13v6h14v-6" /></svg><span className="hidden text-sm font-medium md:inline">{exporting ? "Exporting…" : "Export Excel"}</span>
        </button>
      </div>
      <div className="-mx-card my-1 border-t border-hairline md:mx-0" />
      {exportError && <p className="text-sm text-flag-text">{exportError}</p>}
      <DataTransferPanel label="cases" accept=".xlsx,.json" records={sessions} jsonFormat="bench-cases" jsonName="bench-cases.json" parseFile={(file) => importService.parseFile(file)} replaceAll={(records) => getCaseSessionRepository().replaceAll(userId, records)} onImported={() => { setSessions(null); setAttempt(n => n + 1); }} />

      {loadError ? (
        <div role="alert"><p>Could not load your cases.</p><button className="min-h-tap text-accent" onClick={() => { setLoadError(false); setAttempt(n => n + 1); }}>Try again</button></div>
      ) : sessions === null ? (
        <p className="text-secondary">Loading&hellip;</p>
      ) : sessions.length === 0 ? (
        <p className="text-secondary">No sessions yet. Log your first case.</p>
      ) : (
        <>
          <div className="flex flex-col gap-3 md:hidden">
            {sessions.map((session) => (
              <CaseSessionCard key={session.id} session={session} />
            ))}
          </div>
          <CaseSessionTable sessions={sessions} />
        </>
      )}
    </div>
  );
}
