import Link from "next/link";
import { Fragment } from "react";
import type { CaseSession } from "@/domain/CaseSession";
import { ConsultingRubric } from "@/domain/rubrics/ConsultingRubric";

const rubric = new ConsultingRubric();

const HEADERS = [
  "#",
  "Case",
  "Cased By",
  "Casee",
  "Observer",
  "Date",
  "Time",
  "Difficulty",
  "Case Book",
  "My Performance",
  "Industry/Niche",
  ...rubric.dimensions.map((d) => d.label),
  "Case Type",
];

export function CaseSessionTable({ sessions }: { sessions: CaseSession[] }) {
  return (
    <div className="hidden overflow-x-auto rounded-card border border-hairline bg-surface md:block">
      <table className="w-full min-w-[1100px] text-left text-sm">
        <thead>
          <tr className="border-b border-hairline text-secondary">
            {HEADERS.map((header) => (
              <th key={header} className="whitespace-nowrap px-3 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {sessions.map((session) => (
            <Fragment key={session.id}><tr className="border-b border-hairline last:border-0">
              <td className="px-3 py-2">{session.sessionNumber}</td>
              <td className="px-3 py-2"><Link className="flex min-h-tap items-center font-medium text-accent" href={"/prep/casing/consulting/" + session.id + "/edit"}>{session.caseName}</Link></td>
              <td className="px-3 py-2">{session.caserName ?? ""}</td>
              <td className="px-3 py-2">{session.caseeName ?? ""}</td>
              <td className="px-3 py-2">{session.observerName ?? ""}</td>
              <td className="px-3 py-2">{session.occurredOn}</td>
              <td className="px-3 py-2">{session.durationMin ?? ""}</td>
              <td className="px-3 py-2">{session.difficulty ?? ""}</td>
              <td className="px-3 py-2">{session.caseBook ?? ""}</td>
              <td className="px-3 py-2">{session.overall ?? ""}</td>
              <td className="px-3 py-2">{session.industry ?? ""}</td>
              {rubric.dimensions.map((dimension) => (
                <td key={dimension.key} className="px-3 py-2">
                  {session.scores?.[dimension.key] ?? ""}
                </td>
              ))}
              <td className="px-3 py-2">{session.caseType ?? ""}</td>
            </tr>
            {session.notes && <tr><td colSpan={18} className="border-b border-hairline px-3 py-2"><details><summary className="flex min-h-tap cursor-pointer items-center text-sm text-secondary">Notes</summary><p className="max-w-2xl whitespace-pre-wrap break-words pb-3 text-sm leading-relaxed">{session.notes}</p></details></td></tr>}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
