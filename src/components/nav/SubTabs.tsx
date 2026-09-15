"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeDestination } from "./destinations";

export function SubTabs({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="mb-card flex gap-1 rounded-card border border-hairline bg-surface p-1">
      {items.map((item) => {
        const active = activeDestination(pathname, items) === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-tap min-w-0 flex-1 items-center justify-center rounded-lg px-2 py-2 text-center text-sm ${
              active ? "bg-blue-50 font-medium text-accent" : "text-secondary hover:bg-page"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
