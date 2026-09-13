import Link from "next/link";
import { prepTabs } from "@/components/nav/destinations";

export default function PrepPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-lg font-medium text-ink">Prep</h1>
      <p className="text-secondary">Choose what you&apos;re prepping.</p>
      {prepTabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="min-h-tap rounded-card border border-hairline bg-surface p-card text-ink"
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
