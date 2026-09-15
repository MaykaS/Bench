"use client";
import { useRef, useState } from "react";
import type { ContactImportPlan, ContactImportRecord } from "@/repositories/NetworkContactRepository";
import type { ImportPreview } from "@/services/ImportTypes";

export function NetworkTransfer({ parse, preview, commit, exportRecords, onImported }: {
  parse: (file: File) => Promise<ImportPreview<ContactImportRecord>>;
  preview: (rows: ContactImportRecord[]) => Promise<ContactImportPlan>;
  commit: (plan: ContactImportPlan, incoming: boolean) => Promise<void>;
  exportRecords: () => Promise<ContactImportRecord[]>;
  onImported: () => void;
}) {
  const input=useRef<HTMLInputElement>(null);
  const [plan,setPlan]=useState<ContactImportPlan|null>(null),[filename,setFilename]=useState("");
  const [busy,setBusy]=useState(false),[error,setError]=useState(""),[message,setMessage]=useState("");
  const [incoming,setIncoming]=useState(false),[resolved,setResolved]=useState(false);
  const button="flex h-11 w-11 shrink-0 items-center justify-center rounded-card border border-hairline bg-surface text-accent disabled:opacity-50";
  async function choose(file?:File){if(!file)return;setBusy(true);setError("");setPlan(null);setMessage("");setResolved(false);setIncoming(false);setFilename(file.name);try{const parsed=await parse(file);if(parsed.errors.length){setError(parsed.errors.map(e=>`${e.record??"File"}: ${e.message}`).join("\n"));return;}setPlan(await preview(parsed.records));}catch{setError("Could not preview this file. Your data has not changed.");}finally{setBusy(false);}}
  async function apply(){if(!plan||busy||plan.errors.length||(!resolved&&!!plan.conflicts.length))return;setBusy(true);setError("");try{await commit(plan,incoming);setPlan(null);setMessage(`Imported ${plan.incoming.length} contacts. Existing unrelated records were retained.`);onImported();}catch(e){setError(e instanceof Error?e.message:"Import failed. Try again.");}finally{setBusy(false);}}
  async function download(){setBusy(true);setError("");try{const records=await exportRecords();const url=URL.createObjectURL(new Blob([JSON.stringify({format:"bench-network",version:1,records},null,2)],{type:"application/json"}));const a=document.createElement("a");a.href=url;a.download="bench-network.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch{setError("Could not export contacts. Try again.");}finally{setBusy(false);}}
  return <div><div className="flex gap-2"><button disabled={busy} onClick={()=>input.current?.click()} title="Import Network JSON" aria-label="Import Network JSON" className={button}><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3m-5 5 5-5 5 5M5 20h14" /></svg></button><button disabled={busy} onClick={()=>void download()} title="Export Network JSON" aria-label="Export Network JSON" className={button}><svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M5 20h14" /></svg></button><input ref={input} className="hidden" type="file" accept=".json" onChange={e=>{void choose(e.target.files?.[0]);e.target.value="";}} /></div>
    {(plan||error||message||busy)&&<div className="absolute left-0 right-0 top-full z-20 mt-2 max-h-[70vh] space-y-3 overflow-y-auto rounded-card border border-hairline bg-surface p-4 shadow-lg">
      {busy&&<p role="status">Working…</p>}{error&&<p role="alert" className="whitespace-pre-wrap break-words text-sm text-flag-text">{error}</p>}{message&&<p role="status" className="text-sm">{message}</p>}
      {plan&&<><h2 className="break-words font-semibold">{filename}</h2><p className="text-sm">{plan.created} new · {plan.updated} matched · {plan.links.length} application links</p><p className="text-xs text-secondary">Merge contacts; retain unrelated contacts and application details.</p>{plan.errors.map((e,i)=><p key={i} className="text-sm text-flag-text">{e}</p>)}{plan.links.map((l,i)=><p key={i} className="text-sm text-accent">{l}</p>)}{plan.warnings.map((w,i)=><p key={i} className="text-sm text-secondary">{w}</p>)}
        {!!plan.conflicts.length&&<><h3 className="font-medium">Review conflicting fields</h3>{plan.conflicts.map((c,i)=><div key={i} className="rounded-card bg-page p-3 text-sm"><p className="font-medium">{c.contact} · {c.field}</p><p className="whitespace-pre-wrap break-words">Current: {c.existing}</p><p className="whitespace-pre-wrap break-words">Incoming: {c.incoming}</p></div>)}<label className="block text-sm">For conflicting fields<select disabled={busy} value={incoming?"incoming":"existing"} onChange={e=>{setIncoming(e.target.value==="incoming");setResolved(false);}} className="mt-1 min-h-tap w-full rounded-card border border-hairline bg-surface px-3"><option value="existing">Keep current values</option><option value="incoming">Use workbook / incoming values</option></select></label><label className="flex min-h-tap items-center gap-2 text-sm"><input disabled={busy} type="checkbox" checked={resolved} onChange={e=>setResolved(e.target.checked)} />I reviewed these conflicts</label></>}
        <button disabled={busy||!!plan.errors.length||(!resolved&&!!plan.conflicts.length)} onClick={()=>void apply()} className="min-h-tap rounded-card bg-accent px-4 text-surface disabled:opacity-50">Import contacts</button>
      </>}
      <button disabled={busy} onClick={()=>{setPlan(null);setError("");setMessage("");}} className="ml-2 min-h-tap px-3 text-secondary">{plan?"Cancel":"Close"}</button>
    </div>}
  </div>;
}
