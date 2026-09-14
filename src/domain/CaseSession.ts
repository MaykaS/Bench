export type CaseRole = "casee" | "caser" | "observer";
export type CaseTrack = "consulting" | "tech";
export type CaseScores = Record<string, number>;

export interface CaseSessionData {
  id: string;
  userId: string;
  sessionNumber: number;
  caseName: string;
  caserName: string | null;
  caseeName: string | null;
  observerName: string | null;
  occurredOn: string;
  durationMin: number | null;
  difficulty: number | null;
  caseBook: string | null;
  overall: number | null;
  industry: string | null;
  scores: CaseScores | null;
  caseType: string | null;
  track: CaseTrack;
  myRole: CaseRole;
  notes: string | null;
  createdAt: string;
}

export class CaseSession {
  readonly id: string;
  readonly userId: string;
  readonly sessionNumber: number;
  readonly caseName: string;
  readonly caserName: string | null;
  readonly caseeName: string | null;
  readonly observerName: string | null;
  readonly occurredOn: string;
  readonly durationMin: number | null;
  readonly difficulty: number | null;
  readonly caseBook: string | null;
  readonly overall: number | null;
  readonly industry: string | null;
  readonly scores: CaseScores | null;
  readonly caseType: string | null;
  readonly track: CaseTrack;
  readonly myRole: CaseRole;
  readonly notes: string | null;
  readonly createdAt: string;

  constructor(data: CaseSessionData) {
    if (data.myRole !== "casee" && (data.scores !== null || data.overall !== null)) {
      throw new Error("Scores and overall performance only apply when myRole is 'casee'.");
    }
    this.id = data.id;
    this.userId = data.userId;
    this.sessionNumber = data.sessionNumber;
    this.caseName = data.caseName;
    this.caserName = data.caserName;
    this.caseeName = data.caseeName;
    this.observerName = data.observerName;
    this.occurredOn = data.occurredOn;
    this.durationMin = data.durationMin;
    this.difficulty = data.difficulty;
    this.caseBook = data.caseBook;
    this.overall = data.overall;
    this.industry = data.industry;
    this.scores = data.scores;
    this.caseType = data.caseType;
    this.track = data.track;
    this.myRole = data.myRole;
    this.notes = data.notes;
    this.createdAt = data.createdAt;
  }

  get isScored(): boolean {
    return this.myRole === "casee";
  }

  /** The other named participant, from my_role's point of view. */
  get partnerName(): string | null {
    if (this.myRole === "casee") return this.caserName;
    if (this.myRole === "caser") return this.caseeName;
    return this.caseeName ?? this.caserName;
  }

  /** One-line "role + partner" summary for list rows. */
  get roleSummary(): string {
    const partner = this.partnerName;
    switch (this.myRole) {
      case "casee":
        return partner ? `Cased by ${partner}` : "Cased by —";
      case "caser":
        return partner ? `Cased ${partner}` : "Cased —";
      case "observer":
        return partner ? `Observed ${partner}` : "Observed";
    }
  }
}
