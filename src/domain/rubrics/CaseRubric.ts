import type { CaseTrack } from "../CaseSession";

export interface CaseRubricDimension {
  /** Matches a key in CaseSession.scores. */
  key: string;
  label: string;
}

export abstract class CaseRubric {
  abstract readonly track: CaseTrack;
  abstract readonly dimensions: CaseRubricDimension[];
}
