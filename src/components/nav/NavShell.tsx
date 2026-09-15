import type { ReactNode } from "react";
import { BottomBar } from "./BottomBar";
import { Sidebar } from "./Sidebar";

export function NavShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh md:flex">
      <Sidebar />
      <main className="mx-auto min-w-0 w-full max-w-[1440px] flex-1 p-card pb-[calc(var(--spacing-tap)+env(safe-area-inset-bottom)+var(--spacing-card))] md:px-10 md:py-8 lg:px-12">
        {children}
      </main>
      <BottomBar />
    </div>
  );
}
