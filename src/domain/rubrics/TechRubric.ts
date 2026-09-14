import { CaseRubric, type CaseRubricDimension } from "./CaseRubric";

export class TechRubric extends CaseRubric {
  readonly track = "tech" as const;
  readonly dimensions: CaseRubricDimension[] = [];

  constructor() {
    super();
    throw new Error("TechRubric is not defined yet.");
  }
}
