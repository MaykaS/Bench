import type { CaseRole, CaseScores, CaseSession, CaseTrack, CaseSessionData } from "@/domain/CaseSession";

export interface NewCaseSessionInput {
  caseName: string;
  occurredOn: string;
  myRole: CaseRole;
  track: CaseTrack;
  caserName?: string | null;
  caseeName?: string | null;
  observerName?: string | null;
  durationMin?: number | null;
  difficulty?: number | null;
  caseBook?: string | null;
  overall?: number | null;
  industry?: string | null;
  scores?: CaseScores | null;
  caseType?: string | null;
  notes?: string | null;
}

export interface CaseSessionRepository {
  list(userId: string): Promise<CaseSession[]>;
  get(id: string, userId: string): Promise<CaseSession | null>;
  create(userId: string, input: NewCaseSessionInput): Promise<CaseSession>;
  update(
    id: string,
    userId: string,
    input: Partial<NewCaseSessionInput>,
  ): Promise<CaseSession>;
  delete(id: string, userId: string): Promise<void>;
  replaceAll(userId: string, records: CaseSessionData[]): Promise<void>;
}
