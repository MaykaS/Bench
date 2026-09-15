"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { isCloud } from "@/repositories/cloud/CloudData";
import { readCloud } from "@/repositories/cloud/CloudTransport";
import { DevicePanel } from "./DevicePanel";

export function CloudGate({children}:{children:ReactNode}) {
  const pathname=usePathname();
  const [status,setStatus]=useState<"loading"|"ready"|"unpaired"|"error">(isCloud()?"loading":"ready");
  const [generation,setGeneration]=useState(0),[updates,setUpdates]=useState(false),[attempt,setAttempt]=useState(0);
  const [hasLoaded,setHasLoaded]=useState(false);
  const revision=useRef<number|null>(null);
  useEffect(()=>{
    if(!isCloud()||pathname==="/devices")return;
    let alive=true,running=false;
    async function check(){
      if(running||document.visibilityState==="hidden")return;running=true;
      try {
        const snapshot=await readCloud();if(!alive)return;
        setStatus("ready");
        setHasLoaded(true);
        if(revision.current!==null&&revision.current!==snapshot.revision){
          if(document.querySelector("form") || ["INPUT","TEXTAREA","SELECT"].includes(document.activeElement?.tagName??"")){setUpdates(true);}
          else {setGeneration(n=>n+1);setUpdates(false);}
        }
        revision.current=snapshot.revision;
      }catch{if(alive)setStatus(previous=>previous==="unpaired"?previous:"error");}finally{running=false;}
    }
    const unpaired=()=>setStatus("unpaired");window.addEventListener("bench:unpaired",unpaired);
    void check();const timer=window.setInterval(()=>void check(),20000);
    window.addEventListener("focus",check);document.addEventListener("visibilitychange",check);
    return()=>{alive=false;window.clearInterval(timer);window.removeEventListener("focus",check);document.removeEventListener("visibilitychange",check);window.removeEventListener("bench:unpaired",unpaired);};
  },[pathname,attempt]);
  if(!isCloud())return children;
  if(pathname==="/devices")return children;
  if(status==="unpaired")return <DevicePanel connected={()=>{setStatus("loading");setAttempt(n=>n+1);}}/>;
  if(status==="loading")return <p className="p-6">Connecting to your Bench…</p>;
  if(status==="error"&&!hasLoaded)return <div className="space-y-3 p-6"><p>Cloud storage is unavailable. Your local backups are still untouched.</p><button className="min-h-tap text-accent" onClick={()=>setAttempt(n=>n+1)}>Try again</button><Link className="ml-4 text-accent" href="/devices">Devices</Link></div>;
  return <><div className="flex flex-wrap items-center justify-end gap-3 border-b border-hairline px-4 py-1 text-xs text-secondary"><span>{status==="error"?"Connection interrupted. Saves require a connection.":"Connected to your private Bench"}</span><Link href="/devices" className="flex min-h-tap items-center text-accent">Devices</Link>{updates&&<button className="min-h-tap text-accent" onClick={()=>{if(document.querySelector("form")){if(!window.confirm("Reload the latest cloud data? Unsaved edits on this page will be discarded."))return;}setGeneration(n=>n+1);setUpdates(false);}}>Load new changes</button>}</div><div key={generation}>{children}</div></>;
}
