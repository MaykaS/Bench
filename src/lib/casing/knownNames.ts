import type { CaseSession } from "@/domain/CaseSession";

export function getKnownPartnerNames(sessions: CaseSession[]): string[] {
  const names = new Set<string>();
  for (const session of sessions) {
    if (session.caserName) names.add(session.caserName);
    if (session.caseeName) names.add(session.caseeName);
    if (session.observerName) names.add(session.observerName);
  }
  return [...names].sort((a, b) => a.localeCompare(b));
}
