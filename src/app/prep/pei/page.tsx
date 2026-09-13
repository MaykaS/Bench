import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { prepTabs } from "@/components/nav/destinations";

export default function PeiPage() {
  return (
    <>
      <SubTabs items={prepTabs} />
      <Placeholder
        name="PEI"
        description="Four dimensions, main and backup stories each, with gap counts for what's still unconfirmed."
      />
    </>
  );
}
