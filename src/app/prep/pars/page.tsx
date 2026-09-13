import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { prepTabs } from "@/components/nav/destinations";

export default function ParsPage() {
  return (
    <>
      <SubTabs items={prepTabs} />
      <Placeholder
        name="PARS"
        description="Problem, action, result, significance — the same gap-tracking as PEI, separate stories."
      />
    </>
  );
}
