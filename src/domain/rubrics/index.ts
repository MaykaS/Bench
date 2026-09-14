import type { CaseTrack } from "../CaseSession";
import { CaseRubric } from "./CaseRubric";
import { ConsultingRubric } from "./ConsultingRubric";
import { TechRubric } from "./TechRubric";

export { CaseRubric, type CaseRubricDimension } from "./CaseRubric";
export { ConsultingRubric } from "./ConsultingRubric";
export { TechRubric } from "./TechRubric";

export function getCaseRubric(track: CaseTrack): CaseRubric {
  switch (track) {
    case "consulting":
      return new ConsultingRubric();
    case "tech":
      return new TechRubric();
  }
}
