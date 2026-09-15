"use client";
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconButton } from './ActionIcon';
export function DeleteRecord({label,description,onDelete,disabled=false}:{label:string;description:string;onDelete:()=>Promise<void>;disabled?:boolean}) {
  const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const dialog=useRef<HTMLDialogElement>(null),cancel=useRef<HTMLButtonElement>(null),trigger=useRef<HTMLElement|null>(null),titleId=useId(),descriptionId=useId();
  useEffect(()=>{if(open){dialog.current?.showModal();cancel.current?.focus();}},[open]);
  function close(){dialog.current?.close();setOpen(false);trigger.current?.focus();}
  return <><IconButton icon="delete" danger label={`Delete ${label}`} disabled={disabled} onClick={e=>{trigger.current=e.currentTarget;setError('');setOpen(true);}}/>{open&&createPortal(<dialog ref={dialog} aria-labelledby={titleId} aria-describedby={descriptionId} className="delete-dialog" onCancel={e=>{e.preventDefault();if(!busy)close();}} onClose={()=>{setOpen(false);trigger.current?.focus();}}><h2 id={titleId} className="break-words text-lg font-semibold">Delete {label}?</h2><p id={descriptionId} className="mt-3 text-sm leading-relaxed text-secondary">{description}</p>{error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<div className="mt-5 flex justify-end gap-2"><button ref={cancel} type="button" disabled={busy} className="btn" onClick={close}>Cancel</button><button type="button" disabled={busy} className="btn btn-danger" onClick={async()=>{setBusy(true);setError('');try{await onDelete();close();}catch{setError('Could not delete. Your data is unchanged. Try again.');}finally{setBusy(false);}}}>{busy?'Deleting…':'Confirm delete'}</button></div></dialog>,document.body)}</>;
}
