"use client";
import { useState } from 'react';
export function DeleteRecord({label,description,onDelete}:{label:string;description:string;onDelete:()=>Promise<void>}) {
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  if(!open)return <button type="button" className="btn btn-danger" onClick={()=>setOpen(true)}>Delete {label}</button>;
  return <div className="rounded-lg border border-red-200 bg-red-50 p-3"><p className="text-sm text-red-800">{description}</p>{error&&<p role="alert" className="mt-2 text-sm text-red-800">{error}</p>}<div className="mt-2 flex gap-2"><button type="button" disabled={busy} className="btn btn-danger" onClick={async()=>{setBusy(true);setError('');try{await onDelete();setOpen(false);}catch{setError('Could not delete. Your data is unchanged. Try again.');}finally{setBusy(false);}}}>{busy?'Deleting…':'Confirm delete'}</button><button type="button" disabled={busy} className="btn" onClick={()=>setOpen(false)}>Cancel</button></div></div>;
}
