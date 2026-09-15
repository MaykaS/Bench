"use client";
import { useState, type FormEvent } from "react";
import { IconButton } from "@/components/ActionIcon";
import { CompletedHistory } from "./CompletedHistory";
import { DeleteRecord } from "@/components/DeleteRecord";
import type { CompletedStep, Application } from "@/domain/Application";

export function NextStepPanel({ app, today, complete, schedule, saveHistory, clear, title = "Next step", historyTitle = "Completed steps" }: {
  saveHistory?: (steps: CompletedStep[]) => Promise<void>; clear?: () => Promise<void>;
  title?: string; historyTitle?: string;
  app: Pick<Application, "nextStepState" | "nextActionOn" | "nextActionNote" | "completedSteps">; today: string;
  complete: (input: { expectedOn: string; expectedNote: string | null; completedOn: string; notes: string | null; nextOn: string | null; nextNote: string | null }) => Promise<void>;
  schedule: (date: string, description: string) => Promise<void>;
}) {
  const [mode, setMode] = useState<"done" | "schedule" | null>(null);
  const [date, setDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [nextOn, setNextOn] = useState("");
  const [nextNote, setNextNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const state = app.nextStepState(today);
  const field = "min-h-tap w-full min-w-0 rounded-card border border-hairline bg-surface p-3 text-base";
  function open(value: "done" | "schedule") {
    setMode(value); setError(""); setDate(today); setNotes("");
    setNextOn(value === "schedule" ? app.nextActionOn ?? "" : "");
    setNextNote(value === "schedule" ? app.nextActionNote ?? "" : "");
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (busy) return;
    if (!!nextOn !== !!nextNote.trim()) { setError("Provide both a next-step description and date."); return; }
    setBusy(true); setError("");
    try {
      if (mode === "done" && app.nextActionOn) await complete({ expectedOn: app.nextActionOn, expectedNote: app.nextActionNote, completedOn: date, notes: notes.trim() || null, nextOn: nextOn || null, nextNote: nextNote.trim() || null });
      else await schedule(nextOn, nextNote.trim());
      setMode(null);
    } catch { setError("Could not save. Your changes are still here—please try again."); }
    finally { setBusy(false); }
  }
  return <>
    <section className={`rounded-card border p-card ${state === "due" || state === "overdue" ? "border-flag-text bg-flag-bg" : "border-hairline bg-surface"}`}>
      <h2 className="font-semibold">{title}</h2>
      {state !== "none" ? <><p className="mt-2 font-medium">{app.nextActionNote || "Next action"}</p><p className="mt-1 text-sm">{state === "pending" ? "Pending" : state === "due" ? "Due today — Has this happened?" : "Overdue — Has this happened?"} · {app.nextActionOn}</p></> : <p className="mt-2 text-sm text-secondary">No next step scheduled.</p>}
      {!mode && <div className="mt-3 flex flex-wrap gap-2">{app.nextActionOn && <button onClick={() => open("done")} className="min-h-tap rounded-card bg-accent px-3 text-surface">Mark done</button>}<>{app.nextActionOn?<IconButton icon="edit" label={`Edit ${app.nextActionNote||"next step"}`} onClick={()=>open("schedule")}/>:<button onClick={()=>open("schedule")} className="btn">Schedule next step</button>}</>{app.nextActionOn&&clear&&<DeleteRecord label={app.nextActionNote||"next step"} description="Remove the active next step? Completed history stays." onDelete={clear}/>}</div>}
      {mode && <form onSubmit={save} className="mt-4 grid gap-3">
        {mode === "done" && <><label>Completion date<input required type="date" max={today} value={date} onChange={e => setDate(e.target.value)} className={field} /></label><label>How did it go? <span className="text-sm text-secondary">(optional)</span><textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className={field} /></label></>}
        <div className="grid gap-3 sm:grid-cols-2"><label>{mode === "done" ? "Next step (optional)" : "Next step"}<input required={mode === "schedule" || !!nextOn} value={nextNote} onChange={e => setNextNote(e.target.value)} className={field} /></label><label>Next step date<input required={mode === "schedule" || !!nextNote.trim()} type="date" value={nextOn} onChange={e => setNextOn(e.target.value)} className={field} /></label></div>
        {error && <p role="alert" className="text-sm text-flag-text">{error}</p>}<div className="flex gap-2"><button disabled={busy} className="min-h-tap rounded-card bg-accent px-4 text-surface disabled:opacity-50">{busy ? "Saving…" : "Save"}</button><button type="button" disabled={busy} onClick={() => setMode(null)} className="min-h-tap px-4 text-secondary">Cancel</button></div>
      </form>}
    </section>
    {!!app.completedSteps.length && <CompletedHistory steps={app.completedSteps} title={historyTitle} save={saveHistory}/>}
  </>;
}
