"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomBarItems, isActive } from "./destinations";
import { AddIcon, ApplicationsIcon, HomeIcon, NetworkIcon, PrepIcon } from "./icons";

const icons = {
  Home: HomeIcon,
  Network: NetworkIcon,
  Prep: PrepIcon,
  Applications: ApplicationsIcon,
  Add: AddIcon,
} as const;

export function BottomBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-10 flex border-t border-hairline bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {bottomBarItems.map((item) => {
        const Icon = icons[item.label as keyof typeof icons];
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-tap flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs"
          >
            <Icon className={`h-6 w-6 ${active ? "text-accent" : "text-secondary"}`} />
            <span className={active ? "text-accent" : "text-secondary"}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
