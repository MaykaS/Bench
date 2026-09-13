import { Placeholder } from "@/components/Placeholder";
import { SubTabs } from "@/components/nav/SubTabs";
import { casingTabs, prepTabs } from "@/components/nav/destinations";

export default function CasingConsultingPage() {
  return (
    <>
      <SubTabs items={prepTabs} />
      <SubTabs items={casingTabs} />
      <Placeholder
        name="Casing — consulting"
        description="Structure, math, coaching, business acumen, conclusion, creativity — scored per session."
      />
    </>
  );
}
