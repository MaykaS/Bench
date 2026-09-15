"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ContactForm } from "./ContactForm";
import type { NetworkContact } from "@/domain/NetworkContact";
import type { Application } from "@/domain/Application";
import { getNetworkContactRepository, getApplicationRepository } from "@/repositories/factory";
import { useSession } from "@/lib/session/SessionContext";

export function ContactEditor({ id }: { id?: string }) {
  const {userId} = useSession(), router = useRouter();
  const [data,setData] = useState<{contact: NetworkContact | null; apps: Application[]} | null>(null);
  const [error,setError] = useState(false), [attempt,setAttempt] = useState(0);
  useEffect(() => { let active=true; Promise.all([id ? getNetworkContactRepository().get(id,userId) : Promise.resolve(null),getApplicationRepository().list(userId)]).then(([contact,apps]) => {if(active)setData({contact,apps});}).catch(() => {if(active)setError(true);}); return () => {active=false;}; },[id,userId,attempt]);
  if (error) return <div role="alert"><p>Could not load contacts and applications.</p><button className="min-h-tap text-accent" onClick={() => {setError(false);setAttempt(n=>n+1);}}>Try again</button></div>;
  if (!data) return <p>Loading…</p>;
  if (id && !data.contact) return <div><p>Contact not found.</p><Link className="flex min-h-tap items-center text-accent" href="/network">Back to Network</Link></div>;
  return <div className="min-w-0 space-y-5 pb-24"><h1 className="text-2xl font-semibold">{id ? "Edit contact" : "New contact"}</h1><ContactForm key={id ?? "new"} initial={data.contact ?? undefined} applications={data.apps} initialLinks={data.apps.filter(a=>id && a.contactIds.includes(id)).map(a=>a.id)} cancel={()=>router.push(id ? `/network/${id}` : "/network")} save={async(input,links)=>{const contact=await getNetworkContactRepository().save(userId,id??null,input,links);router.push(`/network/${contact.id}`);}} /></div>;
}
