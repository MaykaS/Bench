import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { casingTabs, prepTabs } from "@/components/nav/destinations";

export default function CasingPage() {
  return (
    <>
      <SubTabs items={prepTabs} />
      <SubTabs items={casingTabs} />
      <Placeholder
        name="Casing"
        description="Logged case sessions with scores, plus an export that matches the sheet you already send."
      />
    </>
  );
}
