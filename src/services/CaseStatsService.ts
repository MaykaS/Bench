import type { CaseSession } from "@/domain/CaseSession";
import type { CaseRubric } from "@/domain/rubrics/CaseRubric";

export interface CaseStatsSummary {
  sessionCount: number;
  averageOverall: number | null;
  weakestDimension: { key: string; label: string; average: number } | null;
}

export class CaseStatsService {
  summarize(sessions: CaseSession[], rubric: CaseRubric): CaseStatsSummary {
    const scored = sessions.filter((s) => s.overall != null);
    const averageOverall =
      scored.length === 0
        ? null
        : scored.reduce((sum, s) => sum + (s.overall ?? 0), 0) / scored.length;

    let weakestDimension: CaseStatsSummary["weakestDimension"] = null;
    for (const dimension of rubric.dimensions) {
      const values = sessions
        .map((s) => s.scores?.[dimension.key])
        .filter((v): v is number => typeof v === "number");
      if (values.length === 0) continue;
      const average = values.reduce((a, b) => a + b, 0) / values.length;
      if (!weakestDimension || average < weakestDimension.average) {
        weakestDimension = { key: dimension.key, label: dimension.label, average };
      }
    }

    return { sessionCount: sessions.length, averageOverall, weakestDimension };
  }
}
