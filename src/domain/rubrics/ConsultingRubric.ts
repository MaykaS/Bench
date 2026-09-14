import { CaseRubric, type CaseRubricDimension } from "./CaseRubric";

// Fixed — maps to the xlsx export contract (spec §4/§5). Column order here
// must match the template's Struc..Creativ. columns left to right.
export class ConsultingRubric extends CaseRubric {
  readonly track = "consulting" as const;
  readonly dimensions: CaseRubricDimension[] = [
    { key: "structure", label: "Structure" },
    { key: "math", label: "Math" },
    { key: "coaching", label: "Coaching" },
    { key: "businessAcumen", label: "Business acumen" },
    { key: "conclusion", label: "Conclusion" },
    { key: "creativity", label: "Creativity" },
  ];
}
