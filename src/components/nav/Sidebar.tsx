"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { activeDestination, sidebarItems } from "./destinations";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="hidden w-56 shrink-0 flex-col gap-1 border-r border-hairline bg-surface p-card md:flex"
      aria-label="Primary"
    >
      {sidebarItems.map((item, index) => {
        const active = activeDestination(pathname, sidebarItems) === item.href;
        return (
          <div key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-tap items-center rounded-lg px-3 py-2 text-sm ${
                active ? "bg-blue-50 font-medium text-accent" : "text-ink hover:bg-page"
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
