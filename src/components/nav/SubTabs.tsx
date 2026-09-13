"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive } from "./destinations";

export function SubTabs({
  items,
}: {
  items: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="mb-card flex gap-1 rounded-card border border-hairline bg-surface p-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 rounded-card px-3 py-2 text-center text-sm ${
              active ? "bg-accent text-surface" : "text-secondary"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
