"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { CaseSession } from "@/domain/CaseSession";
import { CaseSessionForm } from "@/components/casing/CaseSessionForm";
import { getKnownPartnerNames } from "@/lib/casing/knownNames";
import { useSession } from "@/lib/session/SessionContext";
import { getCaseSessionRepository } from "@/repositories/factory";
export function CaseSessionEditor({ id }: { id?: string }) {
 const { userId } = useSession();
 const [data, setData] = useState<{ initial?: CaseSession; names: string[] } | null>(null);
 const [error, setError] = useState<string | null>(null);
 const [attempt, setAttempt] = useState(0);
 useEffect(() => {
   let active = true;
   const repo = getCaseSessionRepository();
   Promise.all([repo.list(userId), id ? repo.get(id, userId) : Promise.resolve(undefined)])
     .then(([sessions, initial]) => {
       if (!active) return;
       if (id && (!initial || initial.track !== "consulting")) { setError("This case could not be found."); return; }
       setData({initial: initial ?? undefined, names: getKnownPartnerNames(sessions)});
     }).catch(error => { console.error("Case load failed:", error); if (active) setError("Could not load your cases. Try again."); });
   return () => { active = false; };
 }, [id, userId, attempt]);
 if (error) return <div className="space-y-3"><p role="alert">{error}</p><button className="min-h-tap rounded-card border border-hairline px-4" onClick={() => {setError(null); setAttempt(n => n + 1);}}>Retry</button><Link className="flex min-h-tap items-center text-accent" href="/prep/casing/consulting">Back to cases</Link></div>;
 if (!data) return <p className="text-secondary">Loading case…</p>;
 return <CaseSessionForm initial={data.initial} knownNames={data.names} />;
}
