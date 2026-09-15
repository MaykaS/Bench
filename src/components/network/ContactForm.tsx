"use client";
import { useState, type FormEvent } from "react";
import type { NetworkContact } from "@/domain/NetworkContact";
import type { NewNetworkContactInput } from "@/repositories/NetworkContactRepository";
import type { Application } from "@/domain/Application";

export function ContactForm({ initial, applications, initialLinks = [], save, cancel, company = "" }: {
  initial?: NetworkContact; applications: Application[]; initialLinks?: string[];
  save: (input: NewNetworkContactInput, links: string[]) => Promise<void>; cancel: () => void; company?: string;
}) {
  const [draft, setDraft] = useState<NewNetworkContactInput>(() => ({
    ...initial, name: initial?.name ?? "", company: initial?.company ?? company, role: initial?.role ?? "",
    email: initial?.email ?? "", profileUrl: initial?.profileUrl ?? "", notes: initial?.notes ?? "",
  }));
  const [tags, setTags] = useState(initial?.tags.join("; ") ?? "");
  const [links, setLinks] = useState(initialLinks);
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const field = "mt-1 min-h-tap w-full min-w-0 rounded-card border border-hairline bg-surface p-3 text-base";
  function text(key: keyof NewNetworkContactInput, label: string, type = "text", required = false) {
    return <label key={key} className="min-w-0 text-sm text-secondary">{label}<input required={required} type={type} value={String(draft[key] ?? "")} onChange={e => setDraft(d => ({...d, [key]: e.target.value}))} className={field} /></label>;
  }
  async function submit(e: FormEvent) {
    e.preventDefault(); if (busy) return; setError("");
    if (!!draft.nextFollowUpOn !== !!draft.nextFollowUpNote?.trim()) { setError("Provide both a follow-up date and description."); return; }
    setBusy(true);
    try {
      const normalized = {...draft, name: draft.name.trim(), tags: [...new Set(tags.split(";").map(t => t.trim()).filter(Boolean))]};
      for (const [key,value] of Object.entries(normalized)) if (typeof value === "string" && !value.trim()) Object.assign(normalized, {[key]: null});
      await save(normalized, links);
    } catch { setError("Could not save this contact. Your changes are still here. Try again."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="space-y-5">
    <fieldset disabled={busy} className="grid min-w-0 gap-4 md:grid-cols-2">
      <legend className="mb-3 text-lg font-semibold text-ink">Contact details</legend>
      {text("name", "Name", "text", true)}{text("company", "Company")}{text("role", "Role")}{text("location", "Location")}{text("email", "Email", "email")}{text("profileUrl", "LinkedIn / profile URL", "url")}{text("source", "Source")}{text("howKnown", "How I know them")}
      <label className="text-sm text-secondary">Tags (separate with semicolons)<input value={tags} onChange={e => setTags(e.target.value)} className={field} /></label>
      <label className="text-sm text-secondary">Relationship strength<select value={draft.relationshipStrength ?? ""} onChange={e => setDraft(d => ({...d, relationshipStrength: e.target.value ? Number(e.target.value) : null}))} className={field}><option value="">Not recorded</option>{[1,2,3,4,5].map(n => <option key={n} value={n}>{n} / 5</option>)}</select></label>
      <label className="text-sm text-secondary">Can refer<select value={draft.canRefer ?? ""} onChange={e => setDraft(d => ({...d, canRefer: e.target.value as NewNetworkContactInput["canRefer"] || null}))} className={field}><option value="">Not recorded</option>{["Yes","No","Maybe"].map(v => <option key={v}>{v}</option>)}</select></label>
      {text("referralStatus", "Referral status")}
      <label className="text-sm text-secondary">Priority<select value={draft.priority ?? ""} onChange={e => setDraft(d => ({...d, priority: e.target.value as NewNetworkContactInput["priority"] || null}))} className={field}><option value="">Not recorded</option>{["Low","Medium","High","Critical"].map(v => <option key={v}>{v}</option>)}</select></label>
      {text("lastContactOn", "Last contact date", "date")}{text("nextFollowUpOn", "Next follow-up date", "date")}{text("nextFollowUpNote", "Next follow-up")}
      {([['notes','Conversation notes'],['actionItems','Linked action items'],['sourceInfo','Source information / corrections']] as const).map(([key,label]) => <label key={key} className="text-sm text-secondary md:col-span-2">{label}<textarea rows={key === 'notes' ? 5 : 3} value={draft[key] ?? ""} onChange={e => setDraft(d => ({...d, [key]:e.target.value}))} className={field} /></label>)}
    </fieldset>
    <fieldset disabled={busy} className="space-y-2"><legend className="mb-2 font-medium">Linked applications</legend>
      {!applications.length && <p className="text-sm text-secondary">No applications yet. You can link this contact later.</p>}
      {applications.map(a => <label key={a.id} className="flex min-h-tap items-center gap-3 rounded-card border border-hairline bg-surface p-3 text-sm"><input type="checkbox" checked={links.includes(a.id)} onChange={e => setLinks(ids => e.target.checked ? [...ids,a.id] : ids.filter(id => id !== a.id))} className="h-4 w-4 shrink-0" /><span>{a.company} · {a.role}</span></label>)}
    </fieldset>
    {error && <p role="alert" className="text-sm text-flag-text">{error}</p>}
    <div className="flex gap-2"><button disabled={busy} className="min-h-tap rounded-card bg-accent px-4 font-medium text-surface">{busy ? "Saving…" : "Save contact"}</button><button type="button" disabled={busy} onClick={cancel} className="min-h-tap px-4 text-secondary">Cancel</button></div>
  </form>;
}
