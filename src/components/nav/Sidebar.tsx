"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, sidebarItems } from "./destinations";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden w-56 shrink-0 flex-col gap-1 border-r border-hairline bg-surface p-card md:flex"
      aria-label="Primary"
    >
      {sidebarItems.map((item, index) => {
        const active = isActive(pathname, item.href);
        return (
          <div key={item.href}>
            <Link
              href={item.href}
              className={`block rounded-card px-3 py-2 text-sm ${
                active ? "bg-page text-accent" : "text-ink hover:bg-page"
              }`}
            >
              {item.label}
            </Link>
            {index === 0 && <div className="my-2 border-t border-hairline" />}
          </div>
        );
      })}
    </nav>
  );
}
