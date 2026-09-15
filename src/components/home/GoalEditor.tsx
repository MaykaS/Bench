"use client";
import { useState } from 'react';
import type { GoalData, GoalKind } from '@/domain/Goal';
import type { PeiStoryData } from '@/domain/PeiStory';
export function GoalEditor({initial,stories,onSave,onCancel,onDelete}:{initial:GoalData;stories:PeiStoryData[];onSave:(goal:GoalData)=>Promise<void>;onCancel:()=>void;onDelete?:()=>Promise<void>}) {
  const [draft,setDraft]=useState(initial),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(remove=false) { setBusy(true);setError('');try{if(remove)await onDelete?.();else await onSave(draft);}catch(e){setError(e instanceof Error?e.message:'Could not save. Your draft is still here.');}finally{setBusy(false);} }
  return <form className="panel space-y-4" onSubmit={e=>{e.preventDefault();void submit();}} aria-label="Edit goal">
    <h2 className="font-semibold">{onDelete?'Edit goal':'New goal'}</h2>
    <fieldset disabled={busy} className="grid min-w-0 gap-4 sm:grid-cols-2">
      <label className="field-label">Title<input autoFocus required className="field" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>
      <label className="field-label">Track<select className="field" value={draft.kind} onChange={e=>{const kind=e.target.value as GoalKind;setDraft({...draft,kind,target:kind==='pei'?5:15,storyIds:kind==='pei'?stories.map(s=>s.id):[]});}}><option value="consulting">Consulting cases solved</option><option value="tech">Tech cases solved</option><option value="pei">PEI story levels</option><option value="custom">Custom count</option></select></label>
      <label className="field-label">{draft.kind==='pei'?'Target level (1–5)':'Target count'}<input className="field" type="number" required min="1" max={draft.kind==='pei'?5:undefined} step="1" value={draft.target} onChange={e=>setDraft({...draft,target:Number(e.target.value)})}/></label>
      <label className="field-label">Deadline (optional)<input className="field" type="date" value={draft.deadline??''} onChange={e=>setDraft({...draft,deadline:e.target.value||null})}/></label>
      {draft.kind==='custom'&&<label className="field-label">Current count<input className="field" type="number" required min="0" step="1" value={draft.current} onChange={e=>setDraft({...draft,current:Number(e.target.value)})}/></label>}
      {draft.kind==='pei'&&<fieldset className="sm:col-span-2"><legend className="mb-2 text-sm text-secondary">Stories to include</legend><div className="grid gap-1 sm:grid-cols-2">{stories.map(s=><label key={s.id} className="flex min-h-tap items-center gap-2 text-sm"><input type="checkbox" checked={draft.storyIds.includes(s.id)} onChange={e=>setDraft({...draft,storyIds:e.target.checked?[...draft.storyIds,s.id]:draft.storyIds.filter(id=>id!==s.id)})}/><span>{s.title} <span className="text-secondary">({s.slot})</span></span></label>)}</div></fieldset>}
    </fieldset>
    {error&&<p role="alert" className="text-sm text-flag-text">{error}</p>}
    <div className="flex flex-wrap gap-2"><button disabled={busy} className="btn btn-primary">{busy?'Saving…':'Save goal'}</button><button disabled={busy} type="button" className="btn" onClick={onCancel}>Cancel</button>{onDelete&&<button disabled={busy} type="button" className="btn btn-danger sm:ml-auto" onClick={()=>{if(confirm('Delete this goal? Your cases and practice history will stay.'))void submit(true);}}>Delete goal</button>}</div>
  </form>;
}
