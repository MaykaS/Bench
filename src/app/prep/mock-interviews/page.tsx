import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { prepTabs } from "@/components/nav/destinations";

export default function MockInterviewsPage() {
  return (
    <>
      <SubTabs items={prepTabs} />
      <Placeholder
        name="Mock interviews"
        description="Full mock rounds, once it's decided whether these are just case sessions with higher stakes."
      />
    </>
  );
}
