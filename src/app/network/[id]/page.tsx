"use client";
import { useEffect, useState } from "react";
import { DeleteRecord } from "@/components/DeleteRecord";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { IconLink, CopyButton } from "@/components/ActionIcon";
import { getNetworkContactRepository, getApplicationRepository } from "@/repositories/factory";
import { useSession } from "@/lib/session/SessionContext";
import { useToday } from "@/lib/useToday";
import type { NetworkContact } from "@/domain/NetworkContact";
import type { Application } from "@/domain/Application";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { NextStepPanel } from "@/components/applications/NextStepPanel";

export default function ContactPage() {
  const router=useRouter(); const {id} = useParams<{id:string}>(), {userId} = useSession(), today = useToday();
  const [contact,setContact] = useState<NetworkContact | null>(null), [apps,setApps] = useState<Application[]>([]);
  const [loaded,setLoaded] = useState(false), [error,setError] = useState(false), [attempt,setAttempt] = useState(0);
  useEffect(()=>{let active=true;Promise.all([getNetworkContactRepository().get(id,userId),getApplicationRepository().list(userId)]).then(([c,a])=>{if(active){setContact(c);setApps(a.filter(app=>app.contactIds.includes(id)));setLoaded(true);}}).catch(()=>{if(active)setError(true);});return()=>{active=false;};},[id,userId,attempt]);
  if(error)return <div role="alert"><p>Could not load this contact.</p><button className="min-h-tap text-accent" onClick={()=>{setError(false);setAttempt(n=>n+1);}}>Try again</button></div>;
  if(!loaded)return <p>Loading contact…</p>;
  if(!contact)return <div><p>Contact not found.</p><Link href="/network" className="flex min-h-tap items-center text-accent">Back to Network</Link></div>;
  const fields = [["Location",contact.location],["Source",contact.source],["How I know them",contact.howKnown],["Relationship strength",contact.relationshipStrength ? `${contact.relationshipStrength}/5` : null],["Can refer",contact.canRefer],["Referral status",contact.referralStatus],["Priority",contact.priority],["Last contact",contact.lastContactOn]].filter(([,value])=>value!==null&&value!==undefined&&value!=="");
  return <div className="min-w-0 space-y-5 pb-24">
    <IconLink icon="back" label="Back to Network" href="/network"/>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h1 className="break-words text-2xl font-semibold">{contact.name}</h1><p className="mt-1 text-secondary">{[contact.role,contact.company].filter(Boolean).join(" · ")}</p></div><div className="flex shrink-0 items-center"><IconLink icon="edit" label={`Edit ${contact.name}`} href={`/network/${id}/edit`}/><DeleteRecord label={contact.name} description="Delete this contact and their conversation history? Application links will be removed; applications stay." onDelete={async()=>{await getNetworkContactRepository().delete(id,userId);router.push("/network");}}/></div></div>
    <div className="flex flex-wrap gap-1">{contact.tags.map(tag=><span key={tag} className="rounded-full bg-page px-2 py-1 text-xs">{tag}</span>)}</div>
    {(contact.phone||contact.email||contact.profileUrl)&&<div className="flex flex-wrap items-center gap-x-4 gap-y-1">{contact.phone&&<div className="flex min-w-0 items-center"><IconLink icon="phone" label={`Call ${contact.name}`} href={`tel:${contact.phone.replace(/[^+0-9]/g,'')}`}/><a className="flex min-h-tap min-w-0 items-center break-all text-sm text-accent" href={`tel:${contact.phone.replace(/[^+0-9]/g,'')}`}>{contact.phone}</a><CopyButton value={contact.phone} label="phone number"/></div>}{contact.email&&<div className="flex min-w-0 items-center"><IconLink icon="email" label={`Email ${contact.name}`} href={`mailto:${contact.email}`}/><a className="flex min-h-tap min-w-0 items-center break-all text-sm text-accent" href={`mailto:${contact.email}`}>{contact.email}</a><CopyButton value={contact.email} label="email address"/></div>}{contact.profileUrl&&<IconLink icon="linkedin" label={`Open ${contact.name}'s LinkedIn profile`} href={contact.profileUrl} newTab/>}</div>}
    {!!fields.length&&<dl className="grid gap-4 rounded-card border border-hairline bg-surface p-card sm:grid-cols-2 lg:grid-cols-3">{fields.map(([key,value])=><div key={key} className="min-w-0"><dt className="text-xs text-secondary">{key}</dt><dd className="mt-1 whitespace-pre-wrap break-words text-sm">{value||"Not recorded"}</dd></div>)}</dl>}
    <NextStepPanel saveHistory={async steps=>{const latest=await getApplicationRepository().list(userId);setContact(await getNetworkContactRepository().save(userId,id,{...contact,completedFollowUps:steps},latest.filter(a=>a.contactIds.includes(id)).map(a=>a.id)));}} clear={async()=>{const latest=await getApplicationRepository().list(userId);setContact(await getNetworkContactRepository().save(userId,id,{...contact,nextFollowUpOn:null,nextFollowUpNote:null},latest.filter(a=>a.contactIds.includes(id)).map(a=>a.id)));}} title="Next follow-up" historyTitle="Completed follow-ups" today={today} app={{nextActionOn:contact.nextFollowUpOn,nextActionNote:contact.nextFollowUpNote,completedSteps:contact.completedFollowUps,nextStepState:d=>contact.followUpState(d)}} complete={async input=>{setContact(await getNetworkContactRepository().completeFollowUp(id,userId,input));}} schedule={async(date,description)=>{const latestApps=await getApplicationRepository().list(userId);setContact(await getNetworkContactRepository().save(userId,id,{...contact,nextFollowUpOn:date,nextFollowUpNote:description},latestApps.filter(a=>a.contactIds.includes(id)).map(a=>a.id)));}} />
    {[["Conversation notes",contact.notes],["Linked action items",contact.actionItems],["Source information / corrections",contact.sourceInfo]].map(([label,value])=>value&&<section key={label} className="rounded-card border border-hairline bg-surface p-card"><h2 className="font-semibold">{label}</h2><p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{value}</p></section>)}
    <section className="space-y-3"><h2 className="font-semibold">Linked applications · {apps.length}</h2>{!apps.length&&<p className="text-sm text-secondary">No applications linked. Choose them in Edit contact.</p>}{apps.map(app=><Link key={app.id} href={`/applications/${app.id}`} className="flex min-h-tap flex-wrap items-center justify-between gap-3 rounded-card border border-hairline bg-surface p-card"><span className="min-w-0 break-words">{app.company} · {app.role}</span><ApplicationStatusBadge status={app.status} /></Link>)}</section>

    {!!contact.linkedApplicationHints.length&&<details><summary className="min-h-tap cursor-pointer text-sm text-secondary">Original application references</summary>{contact.linkedApplicationHints.map(h=><p key={h} className="break-words text-sm text-secondary">{h}</p>)}</details>}
  </div>;
}
