import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { networkTabs } from "@/components/nav/destinations";

export default function CoffeeChatsPage() {
  return (
    <>
      <SubTabs items={networkTabs} />
      <Placeholder
        name="Coffee chats"
        description="The same contacts and touchpoints, filtered to coffee chats."
      />
    </>
  );
}
