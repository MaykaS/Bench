import type { ApplicationStatus } from "@/domain/Application";

export const applicationStatusStyles: Record<ApplicationStatus, { label: string; colors: string }> = {
  applied: { label: "Applied", colors: "bg-blue-50 text-blue-800 ring-blue-200" },
  outreach: { label: "Outreach", colors: "bg-teal-50 text-teal-800 ring-teal-200" },
  interview: { label: "Interview", colors: "bg-violet-50 text-violet-800 ring-violet-200" },
  final_round: { label: "Final Round", colors: "bg-amber-50 text-amber-800 ring-amber-200" },
  offer: { label: "Offer", colors: "bg-green-50 text-green-800 ring-green-200" },
  rejected: { label: "Rejected", colors: "bg-red-50 text-red-800 ring-red-200" },
  withdrawn: { label: "Withdrawn", colors: "bg-slate-100 text-slate-700 ring-slate-200" },
};

export function ApplicationStatusBadge({ status }: { status: ApplicationStatus }) {
  const style = applicationStatusStyles[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${style.colors}`}>
    <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
    {style.label}
  </span>;
}
