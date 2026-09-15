"use client";
import { IconButton } from "@/components/ActionIcon";
import { DeleteRecord } from "@/components/DeleteRecord";
import { ApplicationStatusBadge, applicationStatusStyles } from "./ApplicationStatusBadge";
import { useState, type FormEvent } from "react";
import { APPLICATION_STATUSES, type ApplicationTimelineEvent, type ApplicationStatus } from "@/domain/Application";
import { todayIsoDate } from "@/lib/date";


export function ApplicationTimeline({ events, save }: {
  events: ApplicationTimelineEvent[];
  save: (events: ApplicationTimelineEvent[], addedStatus?: ApplicationStatus) => Promise<void>;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [label, setLabel] = useState<ApplicationStatus>("outreach");
  const [date, setDate] = useState(todayIsoDate);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  function reset() { setEditing(null); setLabel("outreach"); setDate(todayIsoDate()); setNote(""); setError(""); }
  function edit(event: ApplicationTimelineEvent) {
    setEditing(event.id); setLabel(event.label); setDate(event.date); setNote(event.note ?? ""); setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError("");
    try {
      if (editing) {
        await save(events.map(e => e.id === editing ? { ...e, label, date, note: note.trim() || null } : e));
      } else {
        await save([...events, { id: crypto.randomUUID(), label, date, note: note.trim() || null, createdAt: new Date().toISOString() }], label);
      }
      reset();
    } catch { setError("Could not save the timeline. Your changes are still here. Try again."); }
    finally { setBusy(false); }
  }
  async function remove(id: string) { await save(events.filter(e=>e.id!==id)); if(editing===id)reset(); }
  return <section className="min-w-0 rounded-card border border-hairline bg-surface p-card">
    <div className="flex items-center justify-between gap-2"><h2 className="font-semibold">Process timeline</h2><span className="text-xs text-secondary">{events.length} steps</span></div>
    {!events.length && <p className="mt-4 text-sm text-secondary">No timeline steps yet.</p>}
    <ol className="mt-5 flex flex-col gap-4 md:flex-row md:overflow-x-auto md:pb-2">
      {[...events].sort((a,b) => a.date.localeCompare(b.date)).map(event => <li key={event.id} className="min-w-0 border-l-2 border-flag-bg pl-3 md:w-48 md:shrink-0 md:border-l-0 md:border-t-2 md:pl-0 md:pt-3">
        <p className="text-xs text-secondary">{event.date}</p><div className="mt-1"><ApplicationStatusBadge status={event.label} /></div>
        {event.note && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-secondary">{event.note}</p>}
        <div className="mt-1 flex"><IconButton icon="edit" label={`Edit ${applicationStatusStyles[event.label].label} step on ${event.date}`} disabled={busy} onClick={()=>edit(event)}/><DeleteRecord label={`${applicationStatusStyles[event.label].label} step on ${event.date}`} disabled={busy} description="Delete this timeline event? The application's current status will stay the same." onDelete={()=>remove(event.id)}/></div>
      </li>)}
    </ol>
    <form onSubmit={submit} className="mt-5 border-t border-hairline pt-4">
      <h3 className="mb-3 text-sm font-medium">{editing ? "Edit timeline step" : "Log a step"}</h3>
      <fieldset disabled={busy} className="grid min-w-0 gap-3 md:grid-cols-2">
        <label className="text-sm">Stage<select value={label} onChange={e => setLabel(e.target.value as ApplicationStatus)} className="mt-1 min-h-tap w-full rounded-card border border-hairline bg-surface px-3 text-base">{APPLICATION_STATUSES.map(s => <option key={s} value={s}>{applicationStatusStyles[s].label}</option>)}</select></label>
        <label className="text-sm">Date<input required type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1 min-h-tap w-full min-w-0 rounded-card border border-hairline px-3 text-base" /></label>
        <label className="text-sm md:col-span-2">What happened?<textarea rows={3} value={note} onChange={e => setNote(e.target.value)} className="mt-1 w-full rounded-card border border-hairline p-3 text-base" /></label>
        <div className="flex gap-2 md:col-span-2"><button className="min-h-tap rounded-card bg-accent px-4 text-sm font-medium text-surface">{busy ? "Saving…" : editing ? "Save changes" : "Log step"}</button>{editing && <button type="button" onClick={reset} className="min-h-tap px-4 text-sm text-secondary">Cancel edit</button>}</div>
      </fieldset>
    </form>
    {error && <p role="alert" className="mt-3 text-sm text-flag-text">{error}</p>}
  </section>;
}
