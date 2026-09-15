import { IconLink } from "@/components/ActionIcon";
import { DeleteRecord } from "@/components/DeleteRecord";
import type { CaseSession } from "@/domain/CaseSession";
import { ConsultingRubric } from "@/domain/rubrics/ConsultingRubric";
import { ScoreBar } from "./ScoreBar";
const rubric = new ConsultingRubric();
const shortLabels: Record<string, string> = { structure: "Structure", math: "Math", coaching: "Coach", businessAcumen: "Biz ac.", conclusion: "Concl.", creativity: "Creativ." };
export function CaseSessionCard({ session, onDelete }: { session: CaseSession; onDelete: () => Promise<void> }) {
  const [year, month, day] = session.occurredOn.split("-").map(Number);
  const date = new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const role = session.myRole === "casee" ? "Casee" : session.myRole === "caser" ? "Caser" : "Observer";
  return <article className="min-w-0 rounded-[16px] border border-hairline bg-surface p-4 lg:p-6">
    <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
    <div className="min-w-0">
    <div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="break-words text-base font-semibold text-ink">{session.caseName}</h2><p className="mt-1 text-xs text-secondary">{date} · {role}{session.partnerName ? ', with ' + session.partnerName : ''}</p></div><div className="flex shrink-0"><IconLink icon="edit" label={`Edit ${session.caseName}`} href={'/prep/casing/consulting/'+session.id+'/edit'}/><DeleteRecord label={session.caseName} description="Delete this case session? Your solved-case goals will recalculate." onDelete={onDelete}/></div></div>
    <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
      {[["Session", `#${session.sessionNumber}`], ["Duration", session.durationMin != null ? `${session.durationMin} min` : null], ["Difficulty", session.difficulty != null ? `${session.difficulty}/5` : null], ["Case book", session.caseBook], ["Industry", session.industry], ["Case type", session.caseType], ["Cased by", session.caserName], ["Casee", session.caseeName], ["Observer", session.observerName]].map(([label,value]) => value && <div key={label} className="min-w-0"><dt className="text-xs text-secondary">{label}</dt><dd className="break-words">{value}</dd></div>)}
    </dl>
    </div>
    <div className="min-w-0"><p className="text-sm font-medium text-secondary">Performance <span className="ml-2 text-lg font-semibold text-accent">{session.isScored ? session.overall != null ? `${session.overall}/5` : "Not scored yet" : "Not scored"}</span></p>
    {session.isScored && <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-4">{rubric.dimensions.map(d => <ScoreBar key={d.key} label={shortLabels[d.key] ?? d.label} value={session.scores?.[d.key] ?? null} />)}</div>}
    </div></div>
    {session.notes && <div className="mt-4 border-t border-hairline pt-3"><p className="mb-1 text-xs font-medium text-secondary">Notes</p><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{session.notes}</p></div>}
  </article>;
}
