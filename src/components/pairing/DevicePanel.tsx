"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cloudRequest, CloudRequestError } from "@/repositories/cloud/CloudTransport";
import { useSession } from "@/lib/session/SessionContext";
import { CloudMigration } from "./CloudMigration";

type DeviceState = {deviceId:string;devices:{id:string;name:string;createdAt:string;expiresAt:string}[]};
export function DevicePanel({ connected }: {connected?:()=>void}) {
  const router=useRouter();
  const cloud=useSession().storagePhase === "supabase";
  const [state,setState]=useState<DeviceState|null>(null),[code,setCode]=useState(""),[name,setName]=useState(""),[link,setLink]=useState(""),[error,setError]=useState(""),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true);
  useEffect(()=>{
    const value=new URLSearchParams(window.location.hash.slice(1)).get("pair")??"";
    if(value) {window.history.replaceState(null,"",window.location.pathname);queueMicrotask(()=>setCode(value));}
    if(cloud) cloudRequest<DeviceState>("/api/pairing").then(setState).catch(e=>{if(!(e instanceof CloudRequestError)||e.status!==401)setError(e instanceof Error?e.message:"Could not check this device. Reload to retry.");}).finally(()=>setLoading(false));
    else queueMicrotask(()=>setLoading(false));
  },[cloud]);
  async function action(body:object) {
    setBusy(true);setError("");
    try {return await cloudRequest<{url?:string}>("/api/pairing",{method:"POST",body:JSON.stringify(body)});}
    catch(e) {setError(e instanceof Error?e.message:"Could not connect. Try again.");return null;}
    finally {setBusy(false);}
  }
  const button="min-h-tap rounded-card bg-accent px-4 py-2 font-medium text-surface disabled:opacity-50";
  return <section className="mx-auto w-full max-w-3xl space-y-5 p-4 pb-24 text-ink">
    <h1 className="text-2xl font-semibold">Your Bench devices</h1>
    {!cloud?<p>Cloud storage is not enabled yet. Your data still stays in this browser.</p>:loading?<p>Checking this device…</p>:!state?<div className="space-y-4 rounded-card border border-hairline bg-surface p-5"><h2 className="text-lg font-semibold">Connect this device once</h2><p className="text-sm text-secondary">Open a pairing link from a device already connected to your Bench. No email or password needed.</p>{code?<form className="space-y-3" onSubmit={async e=>{e.preventDefault();if(await action({action:"redeem",code,name})){setCode("");if(connected)connected();else {router.push("/home");router.refresh();};}}}><label className="block text-sm">Device name<input required maxLength={80} placeholder="My phone" value={name} onChange={e=>setName(e.target.value)} className="mt-1 min-h-tap w-full rounded-card border border-hairline bg-page px-3" /></label><button disabled={busy} className={button}>{busy?"Connecting…":"Connect this device"}</button></form>:<p className="text-sm text-secondary">For your first device, use the private setup link generated during Supabase setup.</p>}</div>:<>
      <p className="text-sm text-secondary">These browsers can access your shared Bench data. Browser access lasts up to a year; clearing browser data means pairing again.</p>
      <div className="space-y-3 rounded-card border border-hairline bg-surface p-5"><h2 className="font-semibold">Connect another device</h2><button disabled={busy} className={button} onClick={async()=>{const result=await action({action:"issue"});if(result?.url)setLink(result.url);}}>Create pairing link</button>{link&&<div className="space-y-2"><p className="text-sm text-secondary">Open this link on your other device within 10 minutes. It works once and grants access to your data.</p><input aria-label="Private pairing link" readOnly value={link} className="min-h-tap w-full rounded-card border border-hairline px-3 text-sm" onFocus={e=>e.target.select()}/><button className="min-h-tap text-accent" onClick={async()=>{try{await navigator.clipboard.writeText(link);}catch{setError("Select the link above and copy it manually.");}}}>Copy link</button></div>}</div>
      <ul className="space-y-3">{state.devices.map(d=><li key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-hairline bg-surface p-4"><div><p className="font-medium break-words">{d.name}{d.id===state.deviceId?" · This device":""}</p><p className="text-xs text-secondary">Connected {new Date(d.createdAt).toLocaleDateString()}</p></div><button disabled={busy} className="min-h-tap rounded-card border border-hairline px-3 text-sm text-flag-text" onClick={async()=>{if(await action({action:"revoke",id:d.id})){if(d.id===state.deviceId){setState(null);router.refresh();return;}setState({...state,devices:state.devices.filter(item=>item.id!==d.id)});}}}>Disconnect</button></li>)}</ul>
      <CloudMigration />
    </>}{error&&<p role="alert" className="whitespace-pre-wrap text-sm text-flag-text">{error}</p>}
  </section>;
}
