import Link from "next/link";
import type { CaseSession } from "@/domain/CaseSession";
import { ConsultingRubric } from "@/domain/rubrics/ConsultingRubric";
import { ScoreBar } from "./ScoreBar";
const rubric = new ConsultingRubric();
const shortLabels: Record<string, string> = { structure: "Structure", math: "Math", coaching: "Coach", businessAcumen: "Biz ac.", conclusion: "Concl.", creativity: "Creativ." };
export function CaseSessionCard({ session }: { session: CaseSession }) {
  const [year, month, day] = session.occurredOn.split("-").map(Number);
  const date = new Date(year, month - 1, day).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  const role = session.myRole === "casee" ? "Casee" : session.myRole === "caser" ? "Caser" : "Observer";
  return <article className="rounded-[16px] border border-hairline bg-surface p-4">
    <Link href={'/prep/casing/consulting/' + session.id + '/edit'} aria-label={'Edit ' + session.caseName} className="block min-h-tap rounded-sm">
      <div className="flex items-baseline justify-between gap-3"><h2 className="min-w-0 break-words text-base font-semibold leading-snug text-ink">{session.caseName}</h2><span className="shrink-0 text-sm tabular-nums text-secondary">{date}</span></div>
      <p className="mt-1 text-sm leading-relaxed text-secondary">{role}{session.partnerName ? ', with ' + session.partnerName : ''}{session.isScored ? (session.caseBook ? ' · ' + session.caseBook : '') : ' · not scored'}</p>
    </Link>
    {session.isScored && <div className="mt-4 grid grid-cols-3 gap-x-4 gap-y-3">{rubric.dimensions.map(d => <ScoreBar key={d.key} label={shortLabels[d.key] ?? d.label} value={session.scores?.[d.key] ?? null} />)}</div>}
    {session.notes && <div className="mt-4 border-t border-hairline pt-3"><p className="mb-1 text-xs font-medium text-secondary">Notes</p><p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-ink">{session.notes}</p></div>}
  </article>;
}
