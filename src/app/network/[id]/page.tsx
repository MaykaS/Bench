"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getNetworkContactRepository, getApplicationRepository } from "@/repositories/factory";
import { useSession } from "@/lib/session/SessionContext";
import { useToday } from "@/lib/useToday";
import type { NetworkContact } from "@/domain/NetworkContact";
import type { Application } from "@/domain/Application";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { NextStepPanel } from "@/components/applications/NextStepPanel";

export default function ContactPage() {
  const {id} = useParams<{id:string}>(), {userId} = useSession(), today = useToday();
  const [contact,setContact] = useState<NetworkContact | null>(null), [apps,setApps] = useState<Application[]>([]);
  const [loaded,setLoaded] = useState(false), [error,setError] = useState(false), [attempt,setAttempt] = useState(0);
  useEffect(()=>{let active=true;Promise.all([getNetworkContactRepository().get(id,userId),getApplicationRepository().list(userId)]).then(([c,a])=>{if(active){setContact(c);setApps(a.filter(app=>app.contactIds.includes(id)));setLoaded(true);}}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[id,userId,attempt]);
  if(error)return <div role="alert"><p>Could not load this contact.</p><button className="min-h-tap text-accent" onClick={()=>{setError(false);setAttempt(n=>n+1);}}>Try again</button></div>;
  if(!loaded)return <p>Loading contact…</p>;
  if(!contact)return <div><p>Contact not found.</p><Link href="/network" className="flex min-h-tap items-center text-accent">Back to Network</Link></div>;
  const fields = [["Company",contact.company],["Role",contact.role],["Location",contact.location],["Source",contact.source],["How I know them",contact.howKnown],["Relationship strength",contact.relationshipStrength ? `${contact.relationshipStrength}/5` : null],["Can refer",contact.canRefer],["Referral status",contact.referralStatus],["Priority",contact.priority],["Last contact",contact.lastContactOn]];
  return <div className="min-w-0 space-y-5 pb-24">
    <Link href="/network" className="flex min-h-tap items-center text-sm text-accent">← Network</Link>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h1 className="break-words text-2xl font-semibold">{contact.name}</h1><p className="mt-1 text-secondary">{[contact.role,contact.company].filter(Boolean).join(" · ")}</p></div><Link className="flex min-h-tap items-center rounded-card border border-hairline bg-surface px-4 text-accent" href={`/network/${id}/edit`}>Edit</Link></div>
    <div className="flex flex-wrap gap-2">{contact.tags.map(tag=><span key={tag} className="rounded-full bg-hairline/60 px-3 py-1 text-xs">{tag}</span>)}{contact.email&&<a className="flex min-h-tap items-center break-all rounded-card border border-hairline bg-surface px-3 text-sm text-accent" href={`mailto:${contact.email}`}>{contact.email}</a>}{contact.profileUrl&&<a className="flex min-h-tap items-center rounded-card border border-hairline bg-surface px-3 text-sm text-accent" href={contact.profileUrl} target="_blank" rel="noreferrer">LinkedIn / profile ↗</a>}</div>
    <dl className="grid gap-4 rounded-card border border-hairline bg-surface p-card sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key,value])=><div key={key} className="min-w-0"><dt className="text-xs text-secondary">{key}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{value||"Not recorded"}</dd></div>)}</dl>
    <NextStepPanel title="Next follow-up" historyTitle="Completed follow-ups" today={today} app={{nextActionOn:contact.nextFollowUpOn,nextActionNote:contact.nextFollowUpNote,completedSteps:contact.completedFollowUps,nextStepState:d=>contact.followUpState(d)}} complete={async input=>{setContact(await getNetworkContactRepository().completeFollowUp(id,userId,input));}} schedule={async(date,description)=>{const latestApps=await getApplicationRepository().list(userId);setContact(await getNetworkContactRepository().save(userId,id,{...contact,nextFollowUpOn:date,nextFollowUpNote:description},latestApps.filter(a=>a.contactIds.includes(id)).map(a=>a.id)));}} />
    {[["Conversation notes",contact.notes],["Linked action items",contact.actionItems],["Source information / corrections",contact.sourceInfo]].map(([label,value])=>value&&<section key={label} className="rounded-card border border-hairline bg-surface p-card"><h2 className="font-semibold">{label}</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{value}</p></section>)}
    <section className="space-y-3"><h2 className="font-semibold">Linked applications · {apps.length}</h2>{!apps.length&&<p className="text-sm text-secondary">No applications linked. Choose them in Edit contact.</p>}{apps.map(app=><Link key={app.id} href={`/applications/${app.id}`} className="flex min-h-tap flex-wrap items-center justify-between gap-3 rounded-card border border-hairline bg-surface p-card"><span className="min-w-0 break-words">{app.company} · {app.role}</span><ApplicationStatusBadge status={app.status} /></Link>)}</section>
    {!!contact.linkedApplicationHints.length&&<details><summary className="min-h-tap cursor-pointer text-sm text-secondary">Original application references</summary>{contact.linkedApplicationHints.map(h=><p key={h} className="break-words text-sm text-secondary">{h}</p>)}</details>}
  </div>;
}
