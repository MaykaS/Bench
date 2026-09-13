import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { networkTabs } from "@/components/nav/destinations";

export default function NetworkPage() {
  return (
    <>
      <SubTabs items={networkTabs} />
      <Placeholder
        name="Network"
        description="Contacts and touchpoints — alums, classmates, and cold outreach, with next actions."
      />
    </>
  );
}
