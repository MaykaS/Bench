"use client";
import { useState, type ReactNode } from "react";
import { DeleteRecord } from "./DeleteRecord";

export function BulkSelection({items,noun,description,onDelete,children}:{items:{id:string;label:string}[];noun:string;description:string;onDelete:(ids:string[])=>Promise<void>;children:(checkbox:(id:string)=>ReactNode)=>ReactNode}) {
  const [selected,setSelected]=useState<string[]>([]);
  const visible=selected.filter(id=>items.some(item=>item.id===id));
  // Discard hidden selections when filtering; sorting keeps the same selection.
  if(visible.length!==selected.length)setSelected(visible);
  const toggle=(id:string)=>setSelected(ids=>ids.includes(id)?ids.filter(value=>value!==id):[...ids,id]);
  return <>{items.length>0&&<div data-bench-draft={visible.length?"":undefined} className="flex flex-wrap items-center gap-2 rounded-card border border-hairline bg-surface px-3 py-1">
    <label className="flex min-h-tap cursor-pointer items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-accent" checked={visible.length===items.length} ref={node=>{if(node)node.indeterminate=visible.length>0&&visible.length<items.length;}} onChange={()=>setSelected(visible.length===items.length?[]:items.map(item=>item.id))}/>Select all shown</label>
    <span role="status" className="text-sm text-secondary">{visible.length} selected</span>
    {visible.length>0&&<><button type="button" className="btn" onClick={()=>setSelected([])}>Clear</button><DeleteRecord label={`${visible.length} ${noun}`} triggerText="Delete selected" description={description} details={<ul className="mt-3 max-h-48 overflow-auto list-disc pl-5 text-sm">{items.filter(item=>visible.includes(item.id)).map(item=><li className="break-words" key={item.id}>{item.label}</li>)}</ul>} onDelete={async()=>{await onDelete(visible);setSelected([]);}}/></>}
  </div>}{children(id=><label className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center"><span className="sr-only">Select {items.find(item=>item.id===id)?.label}</span><input type="checkbox" className="h-4 w-4 accent-accent" checked={visible.includes(id)} onChange={()=>toggle(id)}/></label>)}</>;
}
