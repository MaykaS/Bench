import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { casingTabs, prepTabs } from "@/components/nav/destinations";

export default function CasingTechPage() {
  return (
    <>
      <SubTabs items={prepTabs} />
      <SubTabs items={casingTabs} />
      <Placeholder
        name="Casing — tech"
        description="Tech-track case scoring, once the rubric dimensions are decided."
      />
    </>
  );
}
