"use client";
import { useEffect, useRef, type ReactNode } from "react";

export function ContactDialog({ children, close }: { children: ReactNode; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} onCancel={close} aria-label="Add a Network contact" className="m-auto max-h-[90dvh] w-[calc(100%-24px)] max-w-3xl overflow-y-auto rounded-card bg-page p-4 text-ink backdrop:bg-black/30 sm:p-6">{children}</dialog>;
}
