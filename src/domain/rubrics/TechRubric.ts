import { CaseRubric, type CaseRubricDimension } from "./CaseRubric";
import { ConsultingRubric } from "./ConsultingRubric";

export class TechRubric extends CaseRubric {
  readonly track = "tech" as const;
  readonly dimensions: CaseRubricDimension[] = new ConsultingRubric().dimensions.map(dimension => ({ ...dimension }));
}
