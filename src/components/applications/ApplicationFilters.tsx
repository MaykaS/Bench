import { APPLICATION_STATUSES, type ApplicationStatus } from "@/domain/Application";
import { ApplicationStatusBadge } from "./ApplicationStatusBadge";

export function ApplicationFilters({ selected, onChange, visible, total }: {
  selected: ApplicationStatus[];
  onChange: (statuses: ApplicationStatus[]) => void;
  visible: number;
  total: number;
}) {
  const presets = [
    { label: "Show all", values: [...APPLICATION_STATUSES] },
    { label: "Hide rejected", values: APPLICATION_STATUSES.filter(s => s !== "rejected") },
    { label: "Active only", values: APPLICATION_STATUSES.filter(s => s !== "rejected" && s !== "withdrawn") },
  ];
  return <section aria-label="Application filters" className="rounded-card border border-hairline bg-surface p-card">
    <div className="flex flex-wrap items-center gap-2">
      {presets.map(preset => {
        const active = selected.length === preset.values.length && preset.values.every(s => selected.includes(s));
        return <button key={preset.label} type="button" aria-pressed={active} onClick={() => onChange(preset.values)} className={`min-h-tap rounded-card border px-3 text-sm font-medium ${active ? "border-accent bg-accent text-surface" : "border-hairline text-secondary"}`}>{preset.label}</button>;
      })}
    </div>
    <details className="mt-2">
      <summary className="flex min-h-tap cursor-pointer items-center text-sm text-accent">Choose statuses · {selected.length} of {APPLICATION_STATUSES.length} shown</summary>
      <fieldset className="grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3 lg:grid-cols-4">
        <legend className="sr-only">Statuses to include</legend>
        {APPLICATION_STATUSES.map(status => <label key={status} className="flex min-h-tap cursor-pointer items-center gap-2 rounded-card border border-hairline px-2">
          <input type="checkbox" checked={selected.includes(status)} onChange={e => onChange(e.target.checked ? [...selected, status] : selected.filter(s => s !== status))} className="h-4 w-4 accent-[var(--color-accent)]" />
          <ApplicationStatusBadge status={status} />
        </label>)}
      </fieldset>
    </details>
    <p role="status" className="mt-1 text-xs text-secondary">Showing {visible} of {total} applications</p>
  </section>;
}
